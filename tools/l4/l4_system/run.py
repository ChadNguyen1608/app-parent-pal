import hashlib
import json
from decimal import Decimal
from pathlib import Path

from .agents import OUTPUT
from .sources import HOME, Sources
from .validate import Validator, cycles


def write_json(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def cost(model, input_tokens, output_tokens):
    return (Decimal(str(model.input_usd_per_million)) * input_tokens
            + Decimal(str(model.output_usd_per_million)) * output_tokens) / 1_000_000


class StopRun(Exception):
    pass


class Budget:
    def __init__(self, config, backend):
        self.config, self.backend = config, backend
        self.rows = []
        self.total = Decimal(0)
        self.stop_reason = None

    async def call(self, path: Path, module, role, context):
        if self.stop_reason:
            raise StopRun(self.stop_reason)
        model = self.config.models[role]
        if model.output_tokens > model.context_tokens:
            raise StopRun(f"Cấu hình model {role} có giới hạn token không hợp lệ.")
        reserved = cost(model, model.context_tokens, model.output_tokens)
        if self.backend.mode == "mock":
            reserved = Decimal(0)
        if (len(self.rows) >= self.config.max_calls
                or self.total + reserved > Decimal(str(self.config.budget_usd))):
            self.stop_reason = f"Dừng trước lượt {role} vì chạm giới hạn lượt gọi hoặc ngân sách."
            raise StopRun(self.stop_reason)
        prompt = "\n\n".join((HOME / "prompts" / name).read_text(encoding="utf-8")
                             for name in ("common.md", role + ".md"))
        payload = json.dumps(context, ensure_ascii=False)
        stem = path / f"{len(self.rows) + 1:02d}-{role}"
        record = {"module": module, "role": role, "mode": self.backend.mode, "model": model.name,
                  "backend_version": self.backend.version, "reserved_usd": float(reserved),
                  "prompt_sha256": hashlib.sha256(prompt.encode()).hexdigest()}
        write_json(stem.with_suffix(".input.json"), {"instructions": prompt, "context": context})
        self.rows.append(record)
        # Nếu API đã nhận yêu cầu nhưng chưa trả usage, giữ toàn bộ khoản dự phòng.
        self.total += reserved
        record.update(status="started", accounted_usd=float(reserved))
        write_json(stem.with_suffix(".usage.json"), record)
        try:
            value, usage = await self.backend.run(role, prompt, payload, model)
        except Exception as error:
            record.update(status="error", error_type=type(error).__name__)
            raise StopRun(f"Lượt {role} lỗi ({type(error).__name__}); kiểm tra cấu hình và usage.")
        else:
            record.update(usage)
            if self.backend.mode == "openai" and (
                usage["requests"] != 1 or not usage["input_tokens"]
                or usage["input_tokens"] > model.context_tokens
                or usage["output_tokens"] > model.output_tokens
            ):
                record["status"] = "usage_invalid"
                raise StopRun(f"Usage của {role} nằm ngoài giới hạn cấu hình.")
            charge = (Decimal(0) if self.backend.mode == "mock" else
                      cost(model, usage["input_tokens"], usage["output_tokens"]))
            self.total += charge - reserved
            record.update(status="received", accounted_usd=float(charge))
            try:
                output = OUTPUT[role].model_validate(value)
            except ValueError:
                record["status"] = "schema_invalid"
                raise StopRun(f"Đầu ra của {role} không khớp schema.")
            write_json(stem.with_suffix(".output.json"), output.model_dump())
            record["status"] = "validated_schema"
            return output
        finally:
            write_json(stem.with_suffix(".usage.json"), record)


def repair_actions(sources, review, coordination):
    findings = {f.id: f for f in review.findings}
    decisions = {d.finding_id: d for d in coordination.decisions}
    if (findings.keys() != decisions.keys()
            or len(decisions) != len(coordination.decisions)):
        raise StopRun("Coordinator cần một quyết định cho mỗi phát hiện.")
    actions = []
    for key, finding in findings.items():
        decision = decisions[key]
        # Cần cả hai vai trò đồng thuận và nguồn hành vi có trong đầu vào gốc.
        supported = any(ref.source in sources.primary and sources.evidence_valid(ref)
                        and "Research_Backlog" not in ref.source for ref in finding.sources)
        if finding.disposition == decision.disposition == "repair" and supported:
            actions.append(finding.model_dump())
    return actions


async def run_module(root, pilot_root, path, module, budget):
    path.mkdir()
    state = {"module": module, "status": "stopped", "repairs": 0, "mode": budget.backend.mode,
             "message": "Lượt chạy chưa hoàn tất.", "rounds": [], "checks": [],
             "product_tests_executed": 0}
    try:
        sources = Sources(root, pilot_root, module)
        write_json(path / "sources.json", {"sha256": sources.documents,
                   "pilot_commit": sources.manifest["pilot_commit"]})
        original = {"module": module, "primary": sources.render(sources.primary),
                    "method": sources.render(sources.method)}

        async def call(role, **context):
            return await budget.call(path, module, role, original | context)

        def save_checks(validator, stage):
            checks = [check.model_dump() for check in validator.checks]
            state["checks"].append({"stage": stage, "issues": checks})
            write_json(path / "checks.json", state["checks"])
            return checks

        qa = await call("qa")
        state["qa"] = qa.model_dump()
        validator = Validator(sources)
        validator.qa(qa)
        if save_checks(validator, "QA"):
            raise StopRun("Bộ QA chưa đạt kiểm tra truy vết. Giữ nguyên đầu ra để người duyệt xem.")
        design = await call("architect")
        for revision in range(budget.config.max_repairs + 1):
            state["design"] = design.model_dump()
            validator = Validator(sources)
            validator.design(design)
            design_checks = save_checks(validator, f"Thiết kế {revision}")
            prior = state["rounds"][-1]["review"] if state["rounds"] else None
            review = await call("reviewer", qa=state["qa"], design=state["design"],
                                prior_review=prior)
            round_record = {"revision": revision, "review": review.model_dump()}
            state["rounds"].append(round_record)
            validator = Validator(sources)
            validator.review(qa, design, review)
            if save_checks(validator, f"Phản biện {revision}"):
                raise StopRun("Phản biện chưa đạt kiểm tra bao phủ hoặc truy vết.")
            actions = []
            if review.findings:
                coordination = await call("coordinator", qa=state["qa"], design=state["design"],
                                          review=review.model_dump(), validator=design_checks)
                round_record["decisions"] = coordination.model_dump()["decisions"]
                actions = repair_actions(sources, review, coordination)
            round_record["repair_actions"] = actions
            if revision == budget.config.max_repairs or not (actions or design_checks):
                break
            revised = await call("architect", previous_design=state["design"],
                                 repair={"agreed_findings": actions, "deterministic": design_checks})
            state["repairs"] += 1
            if revised == design:
                round_record["no_change"] = True
                break
            design = revised

        if sources.baseline:
            state["baseline"] = sources.baseline
            comparison = await call("comparison", qa=state["qa"], design=state["design"],
                                    baseline=sources.baseline,
                                    review_evidence=sources.render(sources.comparison))
            state["comparison"] = comparison.model_dump()
            validator = Validator(sources)
            validator.compare(qa, comparison)
            if save_checks(validator, "Hồi quy tài liệu"):
                raise StopRun("Ma trận hồi quy thiếu dòng hoặc dùng ID chưa có.")
        state["status"] = "owner_review"
        state["message"] = "Đã tạo hồ sơ thiết kế để Product Owner rà soát."
        if design_checks or review.findings or any(
                item.status in {"gap", "uncertain"} for item in review.coverage):
            state["message"] += " Còn vấn đề được liệt kê ở vòng cuối."
    except StopRun as error:
        state["message"] = str(error)
    except (OSError, ValueError) as error:
        state["message"] = f"Nguồn hoặc cấu hình không hợp lệ ({type(error).__name__}): {error}"
    state["usage"] = [row for row in budget.rows if row["module"] == module]
    write_json(path / "result.json", state)
    return state


def cross_module(states):
    edges = []
    for state in states:
        for candidate in state.get("design", {}).get("candidates", []):
            edges.extend((dep["source_module"], dep["target_module"])
                         for dep in candidate["dependencies"]
                         if dep["criticality"] == "HARD" and dep["verification"] != "REJECTED")
    return {"hard_edges": sorted(set(edges)), "possible_cycles": cycles(edges)}

