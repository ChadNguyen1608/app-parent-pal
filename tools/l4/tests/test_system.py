import json
import os


import tempfile
import unittest
from pathlib import Path

from l4_system.agents import OUTPUT
from l4_system.mock import EXAMPLES, MockAgents
from l4_system.run import Budget, cross_module, repair_actions, run_module
from l4_system.schema import Config, Coordination, Evidence, Review
from l4_system.sources import HOME, Sources
from l4_system.validate import cycles

CONFIG = Config.model_validate_json((HOME / "config.example.json").read_text(encoding="utf-8"))
MODULE = "F01-G04-M01"
CANONICAL = os.environ.get("L4_CANONICAL_ROOT")
PILOT = os.environ.get("L4_PILOT_ROOT")


class Guards(unittest.IsolatedAsyncioTestCase):
    def test_maximum_repairs_is_three(self):
        with self.assertRaises(ValueError):
            Config.model_validate(CONFIG.model_dump() | {"max_repairs": 4})

    def test_schema_requires_expected_output(self):
        qa = {"requirements": [], "tests": [{"id": "T-001", "kind": "functional",
              "requirements": [], "setup": "Giả lập", "action": "Chạy", "sources": []}]}
        with self.assertRaises(ValueError):
            OUTPUT["qa"].model_validate(qa)

    def test_dependency_cycle_across_modules(self):
        self.assertEqual(cycles([("A", "B"), ("B", "C"), ("C", "A")]), [["A", "B", "C", "A"]])
        self.assertEqual(cycles([("A", "B"), ("C", "B")]), [])

    async def test_budget_prevents_model_call(self):
        class NeverCalled(MockAgents):
            mode = "openai"

            async def run(self, *args):
                raise AssertionError("Không được gọi API.")

        with tempfile.TemporaryDirectory() as tmp:
            budget = Budget(CONFIG.model_copy(update={"budget_usd": 0.01}), NeverCalled())
            from l4_system.run import StopRun
            with self.assertRaises(StopRun):
                await budget.call(Path(tmp), MODULE, "qa", {})
            self.assertEqual(budget.rows, [])

    async def test_provider_error_reserves_budget_and_logs_no_secret(self):
        class Failing(MockAgents):
            mode = "openai"

            async def run(self, *args):
                raise RuntimeError("TEST_SECRET")

        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp)
            budget = Budget(CONFIG, Failing())
            from l4_system.run import StopRun
            with self.assertRaises(StopRun):
                await budget.call(path, MODULE, "qa", {})
            data = (path / "01-qa.usage.json").read_text(encoding="utf-8")
            self.assertNotIn("TEST_SECRET", data)
            self.assertGreater(budget.total, 0)


@unittest.skipUnless(CANONICAL and PILOT, "Cần đường dẫn hai snapshot thiết kế.")
class Pilot(unittest.IsolatedAsyncioTestCase):
    async def execute(self, path, module, backend=None, config=CONFIG):
        return await run_module(Path(CANONICAL), Path(PILOT), path, module,
                                Budget(config, backend or MockAgents()))

    async def test_three_modules_repair_and_compare(self):
        with tempfile.TemporaryDirectory() as tmp:
            results = []
            for module, expected in zip(EXAMPLES, [31, 35, 41], strict=True):
                path = Path(tmp) / module
                state = await self.execute(path, module)
                self.assertEqual(state["status"], "owner_review", state["message"])
                self.assertEqual(state["repairs"], 1)
                self.assertEqual(state["product_tests_executed"], 0)
                self.assertEqual(len(state["comparison"]["matches"]), expected)
                self.assertEqual(state["checks"][1]["issues"][0]["code"], "COHORT")
                self.assertFalse(state["checks"][-1]["issues"])
                self.assertFalse(state["checks"][-3]["issues"])
                inputs = json.loads((path / "01-qa.input.json").read_text(encoding="utf-8"))["context"]
                architect = json.loads((path / "02-architect.input.json").read_text(encoding="utf-8"))
                self.assertEqual(set(inputs), {"module", "primary", "method"})
                self.assertEqual(inputs, architect["context"])
                self.assertNotRegex(str(inputs), r"\|\s*\x60(?:MP-[ABC]\d{2}|TC-L4-[ABC]\d{2})\x60\s*\|.*\|.*\|.*\|.*\|")
                self.assertTrue(all(row["requests"] == 0 for row in state["usage"]))
                results.append(state)
            self.assertEqual(len(cross_module(results)["hard_edges"]), 3)

    async def test_repair_limit_revalidates_last_attempt(self):
        class NeverFixed(MockAgents):
            async def run(self, role, prompt, payload, config):
                value, usage = await super().run(role, prompt, payload, config)
                if role == "architect":
                    value["candidates"][0]["cohort_applicability"] = []
                    previous = json.loads(payload).get("previous_design", {}).get("candidates", [])
                    prior_issues = previous[0]["review_issues"] if previous else []
                    value["candidates"][0]["review_issues"] = [*prior_issues, "Lỗi mô phỏng."]
                return value, usage

        with tempfile.TemporaryDirectory() as tmp:
            state = await self.execute(Path(tmp) / MODULE, MODULE, NeverFixed())
            self.assertEqual(state["repairs"], 3)
            self.assertEqual(len(state["rounds"]), 4)
            self.assertTrue(state["rounds"][-1]["repair_actions"])

    async def test_call_limit_returns_partial_evidence(self):
        with tempfile.TemporaryDirectory() as tmp:
            config = CONFIG.model_copy(update={"max_calls": 1})
            state = await self.execute(Path(tmp) / MODULE, MODULE, config=config)
            self.assertEqual(state["status"], "stopped")
            self.assertIn("qa", state)
            self.assertNotIn("design", state)

    async def test_coverage_regression_requires_every_baseline_row(self):
        class IncompleteComparison(MockAgents):
            async def run(self, role, prompt, payload, config):
                value, usage = await super().run(role, prompt, payload, config)
                if role == "comparison":
                    value["matches"][-1]["baseline_id"] = "ID-LA"
                return value, usage

        with tempfile.TemporaryDirectory() as tmp:
            state = await self.execute(Path(tmp) / MODULE, MODULE, IncompleteComparison())
            self.assertEqual(state["status"], "stopped")
            self.assertEqual(state["checks"][-1]["issues"][0]["code"], "REGRESSION_MATRIX")

    def test_pilot_cannot_be_used_as_primary_and_old_id_is_excluded(self):
        src = Sources(Path(CANONICAL), Path(PILOT), MODULE)
        self.assertNotIn("F06-G03-M03", src.inventory)
        baseline = src.baseline["MP-A01"]
        ref = Evidence(source=baseline["source"], start=baseline["line"], end=baseline["line"])
        self.assertFalse(src.evidence_valid(ref))
        self.assertTrue(src.evidence_valid(ref, authoritative=False))

    def test_disagreement_and_research_are_not_repairable(self):
        src = Sources(Path(CANONICAL), Path(PILOT), MODULE)
        path = src.manifest["canonical"][0]
        finding = {"id": "I-001", "statement": "Cần xác minh.", "counterexample": "Giả lập.",
                   "expected_output": "Chưa rõ.", "proposed_action": "Chuyển chuyên gia.",
                   "sources": [{"source": path, "start": 1, "end": 1}]}
        for reviewer, coordinator in [("research", "repair"), ("repair", "disagreement")]:
            review = Review.model_validate({"coverage": [], "findings": [finding | {"disposition": reviewer}]})
            decision = Coordination.model_validate({"decisions": [
                {"finding_id": "I-001", "disposition": coordinator, "reason": "Có bất đồng."}]})
            self.assertEqual(repair_actions(src, review, decision), [])

