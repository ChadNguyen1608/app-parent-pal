import json



from .schema import Candidate, Cohort


EXAMPLES = {
    "F01-G04-M01": (
        "F01-G04-M02", "quyet-dinh-truy-cap", "Trả quyết định quyền có phạm vi",
        ("P1 có quyền sửa một lịch giả lập.", "Yêu cầu đúng phạm vi.", "ALLOW cho đúng lịch."),
        ("Thiếu mục đích truy cập.", "Yêu cầu đọc lịch.", "DENY và ghi lý do tối thiểu."),
        ("P2 không được cấp quyền.", "Yêu cầu sửa kế hoạch.", "DENY trước khi ghi."),
        ("Quyền cũ vừa bị thu hồi.", "Gửi lệnh ghi từ phiên cũ.", "Kiểm lại phiên bản quyền và từ chối."),
        {"MP-A01": 1, "TC-L4-A01": 1, "MP-A04": 2, "MP-A05": 4, "MP-A11": 3, "MP-A18": 4},
    ),
    "F06-G07-M01": (
        "F04-G05-M02", "danh-gia-tam", "Tạo kết quả đánh giá học tập tạm",
        ("Rubric giả lập khớp môn, lớp và phiên bản.", "Yêu cầu đánh giá.", "Khóa phiên bản và lưu nguồn."),
        ("Ảnh chữ viết tay giả lập bị mờ.", "Yêu cầu đánh giá.", "UNABLE_TO_ASSESS; không chấm 0."),
        ("Người yêu cầu thiếu quyền đọc bài.", "Yêu cầu AI chấm.", "Từ chối trước khi đọc hoặc gọi AI."),
        ("F04 đã nhận bài nộp hợp lệ.", "F06 yêu cầu đánh giá.", "Giữ bài nộp ở F04, lưu kết quả ở F06."),
        {"MP-B01": 1, "MP-B05": 2, "MP-B07": 3, "MP-B18": 1},
    ),
    "F04-G02-M03": (
        "F04-G02-M02", "kiem-tra-can-bang", "Đánh giá cân bằng một phương án",
        ("Gia đình chưa chọn Standard Bar, có mặc định hợp lệ.", "Kiểm tra một phương án.",
         "Dùng Standard Bar mặc định đã duyệt và có hiệu lực."),
        ("Phương án vượt protected hard-cap.", "Yêu cầu áp dụng ngoại lệ.", "Từ chối trước khi ghi."),
        ("Trẻ đang được quản lý có quyền đề xuất.", "Gửi thay đổi lịch.",
         "Tạo đề xuất PENDING và chờ người có quyền."),
        ("F04-G02-M02 tìm phương án trong lịch tuần.", "Kiểm tra từng phương án theo hard-cap.",
         "Chuyển phương án hợp lệ cho luồng phê duyệt; thiếu dữ liệu thì báo INSUFFICIENT_DATA."),
        {"MP-C02": 4, "MP-C04": 1, "MP-C08": 3, "MP-C11": 2, "MP-C18": 4, "MP-C22": 2},
    ),
}


class MockAgents:
    mode, version = "mock", "fixture-1"

    async def run(self, role, prompt, payload, config):
        ctx = json.loads(payload)
        module = ctx["module"]
        dependency, slug, outcome, *scenarios, matches = EXAMPLES[module]
        path, inventory = next((p, doc) for p, doc in ctx["primary"].items() if "Blueprint_03_2_" in p)
        line = next(int(row.split(":", 1)[0]) for row in inventory.splitlines()
                    if row.split(": ", 1)[1].startswith("|") and f"\x60{module}\x60" in row)
        source = {"source": path, "start": line, "end": line}
        cid = f"CAND-{module}-{slug}"
        fix = {"id": "I-001", "disposition": "repair", "statement": "Thiếu bản ghi cohort A5.",
               "counterexample": "Người tự quản kích hoạt luồng nhưng thiết kế thiếu biến thể.",
               "expected_output": "Có bản ghi A5 với quyền cần kiểm tra.",
               "proposed_action": "Bổ sung bản ghi A5 giữ trạng thái chưa xác minh.", "sources": [source]}
        if role == "qa":
            kinds = ["functional", "negative", "authorization", "dependency"]
            reqs, tests = [], []
            for i, ((setup, action, expected), kind) in enumerate(zip(scenarios, kinds, strict=True), 1):
                rid = f"R-{i:03d}"
                reqs.append({"id": rid, "behavior": expected, "kind": kind, "sources": [source]})
                tests.append({"id": f"T-{i:03d}", "kind": kind, "requirements": [rid],
                              "setup": setup, "action": action, "expected_output": expected,
                              "sources": [source]})
            output = {"requirements": reqs, "tests": tests}
        elif role == "architect":
            cohorts = [Cohort(cohort=f"A{i}", applicability="UNKNOWN",
                              interaction_pattern="Cần xác minh.",
                              authorized_actor="UNKNOWN", approval_actor="UNKNOWN",
                              data_scope="Chỉ dữ liệu giả lập.", alternative_path="Chuyển rà soát.",
                              evidence_confidence="Chưa kiểm chứng.")
                       for i in range(6 if "repair" in ctx else 5)]
            c = Candidate(
                id=cid, title=outcome, parent_module=module, domain=module[:3], group=module[:7],
                primary_outcome=outcome, target_users=["Người dùng có quyền"], user_value=outcome,
                trigger="Yêu cầu giả lập", preconditions=["Có cấu hình hợp lệ."], inputs=["Yêu cầu"],
                outputs=[outcome], primary_data_owner=module, data_classification="Dữ liệu mô phỏng",
                authorization={"default": "DENY", "check_before": ["read", "cache", "inference",
                               "external_call", "write"], "rules": ["Kiểm quyền theo phạm vi."]},
                autonomy_permissions="Chuyển phê duyệt theo quyền.", age_variants="Xem A0–A5.",
                cohort_applicability=cohorts, main_flow=["Kiểm quyền và xử lý."], alternative_flows=[],
                failure_recovery=["Từ chối khi thiếu bằng chứng."],
                acceptance_criteria=["Có kết quả theo phạm vi."], dependencies=[{
                    "source_module": module, "target_module": dependency, "type": "D",
                    "criticality": "HARD", "verification": "CANDIDATE", "required_for": "RUN",
                    "cohort_scope": ["A0", "A1", "A2", "A3", "A4", "A5"],
                    "reason": "Ranh giới dữ liệu trong kịch bản mô phỏng.",
                    "evidence_refs": [source], "workaround": "Dừng khi dữ liệu chưa hợp lệ."}],
                execution_type="E1", ai_cost_risk="Chưa đánh giá.", research_refs=[],
                source_trace=[source], review_issues=[], definition_status="BASELINE_PROPOSED",
                assessment_status="NOT_EVALUATED", delivery_status="NOT_PLANNED", mvp_decision="NOT_DECIDED")
            output = {"candidates": [c.model_dump()]}
        elif role == "reviewer":
            incomplete = len(ctx["design"]["candidates"][0]["cohort_applicability"]) != 6
            output = {"findings": [fix] if incomplete else [], "coverage": [
                {"test_id": test["id"], "candidate_ids": [cid], "status": "covered",
                 "reason": "Ánh xạ dựng sẵn để kiểm tra luồng; chưa xác minh nội dung.",
                 "sources": [source]} for test in ctx["qa"]["tests"]]}
        elif role == "coordinator":
            output = {"decisions": [{"finding_id": "I-001", "disposition": "repair",
                                     "reason": "Fixture yêu cầu đủ A0–A5."}]}
        else:
            output = {"findings": [], "matches": [
                {"baseline_id": case, "status": "partial" if case in matches else "gap",
                 "test_ids": [f"T-{matches[case]:03d}"] if case in matches else [],
                 "reason": ("Có giao nhau theo ánh xạ dựng sẵn; cần đối chiếu expected output."
                            if case in matches else "Fixture bốn ca chưa bao phủ hành vi này.")}
                for case in ctx["baseline"]]}
        return output, {"input_tokens": 0, "output_tokens": 0, "requests": 0, "response_ids": []}

    async def close(self):
        pass

