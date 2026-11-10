import re
from collections import Counter

from .schema import Check, Comparison, Design, Finding, QA, Review
from .sources import Sources

TEST = re.compile(r"T-\d{3,}")
REQUIREMENT = re.compile(r"R-\d{3,}")
FINDING = re.compile(r"I-\d{3,}")


class Validator:
    def __init__(self, sources: Sources):
        self.sources = sources
        self.checks: list[Check] = []

    def require(self, condition, code, detail):
        if not condition:
            self.checks.append(Check(code=code, detail=detail))

    def trace(self, refs, label, authoritative=True):
        self.require(bool(refs) and all(self.sources.evidence_valid(r, authoritative) for r in refs),
                     "TRACE", f"{label} cần nguồn hợp lệ trong ngữ cảnh đã cấp.")

    def ids(self, values, pattern, label):
        values = list(values)
        self.require(bool(values), "EMPTY", f"Thiếu {label}.")
        for value, count in Counter(values).items():
            self.require(count == 1 and re.fullmatch(pattern, value),
                         "ID", f"{label}: mã trùng hoặc sai định dạng ({value}).")
        return set(values)

    def qa(self, qa: QA):
        req_ids = self.ids((r.id for r in qa.requirements), REQUIREMENT, "yêu cầu QA")
        self.ids((t.id for t in qa.tests), TEST, "test thiết kế")
        covered = set()
        for req in qa.requirements:
            self.trace(req.sources, req.id)
            self.require(any(t.kind == req.kind and req.id in t.requirements for t in qa.tests),
                         "QA_GAP", f"{req.id} thiếu test cùng loại {req.kind}.")
        for test in qa.tests:
            self.trace(test.sources, test.id)
            covered.update(test.requirements)
            self.require(bool(test.requirements) and set(test.requirements) <= req_ids,
                         "QA_TRACE", f"{test.id} tham chiếu yêu cầu không tồn tại hoặc rỗng.")
        self.require(covered == req_ids, "QA_GAP", "Danh mục yêu cầu QA và test không khớp.")
        kinds = {test.kind for test in qa.tests}
        self.require({"functional", "negative", "authorization", "dependency"} <= kinds,
                     "QA_KINDS", "Thiếu test thành công, thất bại, quyền hoặc liên module.")

    def design(self, design: Design):
        module = self.sources.module
        self.ids((x.id for x in design.candidates), rf"CAND-{module}-[a-z0-9]+(?:-[a-z0-9]+)*",
                 "L4 ứng viên")
        outcomes = Counter(" ".join(c.primary_outcome.casefold().split()) for c in design.candidates)
        for c in design.candidates:
            self.require(outcomes[" ".join(c.primary_outcome.casefold().split())] == 1,
                         "OUTCOME", f"{c.id} có kết quả chính trùng.")
            self.trace(c.source_trace, c.id)
            self.require((c.parent_module, c.domain, c.group) == (module, module[:3], module[:7]),
                         "PARENT", f"{c.id} sai cây ID.")
            self.require(Counter(row.cohort for row in c.cohort_applicability) ==
                         Counter(f"A{i}" for i in range(6)), "COHORT", f"{c.id} thiếu/trùng A0–A5.")
            self.require({"read", "cache", "inference", "external_call", "write"} ==
                         set(c.authorization.check_before) and bool(c.authorization.rules),
                         "AUTH", f"{c.id} thiếu kiểm quyền mặc định hoặc thời điểm kiểm quyền.")
            self.require(all((c.target_users, c.outputs, c.main_flow, c.failure_recovery,
                              c.acceptance_criteria)), "CONTRACT", f"{c.id} thiếu hợp đồng chức năng.")
            self.require(set(c.research_refs) <= self.sources.research, "MR",
                         f"{c.id} dùng mã MR chưa đăng ký; đưa vấn đề vào mục nghiên cứu.")
            edges = set()
            for dep in c.dependencies:
                edge = (dep.target_module, dep.type, dep.required_for)
                self.require(dep.source_module == module and dep.target_module != module
                             and dep.target_module in self.sources.inventory and edge not in edges
                             and bool(dep.cohort_scope), "DEP", f"{c.id} có cạnh sai/trùng ({edge}).")
                self.trace(dep.evidence_refs, f"{c.id} → {dep.target_module}")
                if dep.verification == "CONFIRMED":
                    supported = any(
                        ref.source in self.sources.primary and "Blueprint_03_" in ref.source
                        and dep.target_module in "\n".join(
                            self.sources.primary[ref.source]["lines"][ref.start - 1:ref.end])
                        for ref in dep.evidence_refs if self.sources.evidence_valid(ref))
                    self.require(supported, "DEP_EVIDENCE", f"{c.id}: cạnh CONFIRMED thiếu Blueprint.")
                edges.add(edge)

    def findings(self, findings: list[Finding], authoritative=True):
        if findings:
            self.ids((f.id for f in findings), FINDING, "phát hiện")
        for finding in findings:
            self.trace(finding.sources, finding.id, authoritative)

    def review(self, qa: QA, design: Design, review: Review):
        self.findings(review.findings)
        test_ids = {t.id for t in qa.tests}
        candidate_ids = {c.id for c in design.candidates}
        self.require(Counter(c.test_id for c in review.coverage) == Counter(test_ids),
                     "COVERAGE", "Phản biện phải đối chiếu đúng một lần cho mọi test QA.")
        for item in review.coverage:
            self.trace(item.sources, item.test_id)
            self.require(set(item.candidate_ids) <= candidate_ids and
                         (item.status != "covered" or bool(item.candidate_ids)),
                         "COVERAGE_LINK", f"{item.test_id} liên kết L4 không hợp lệ.")
        if any(c.status in {"gap", "uncertain"} for c in review.coverage):
            self.require(bool(review.findings), "COVERAGE_GAP",
                         "Có test thiếu bao phủ hoặc chưa rõ nhưng thiếu phát hiện giải thích.")

    def compare(self, qa: QA, comparison: Comparison):
        self.findings(comparison.findings, authoritative=False)
        test_ids = {t.id for t in qa.tests}
        self.require(Counter(m.baseline_id for m in comparison.matches) ==
                     Counter(self.sources.baseline.keys()), "REGRESSION_MATRIX",
                     "Ma trận hồi quy phải ghi đúng một kết quả cho mỗi test nguồn.")
        for item in comparison.matches:
            self.require(set(item.test_ids) <= test_ids and
                         (item.status == "gap" or bool(item.test_ids)),
                         "REGRESSION_LINK", f"{item.baseline_id} thiếu test QA hợp lệ.")


def cycles(edges):
    graph = {}
    for source, target in edges:
        graph.setdefault(source, set()).add(target)
    active, done, loops = [], set(), []

    def visit(node):
        if node in active:
            loops.append(active[active.index(node):] + [node])
        elif node not in done:
            active.append(node)
            for neighbor in sorted(graph.get(node, ())):
                visit(neighbor)
            active.pop()
            done.add(node)

    for node in sorted(graph):
        visit(node)
    return loops

