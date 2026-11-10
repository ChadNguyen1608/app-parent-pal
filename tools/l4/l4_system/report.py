from collections import Counter

LABEL = {"repair": "Sửa có bằng chứng", "owner": "Cần Product Owner quyết định",
         "research": "Cần nghiên cứu hoặc chuyên gia", "disagreement": "Còn bất đồng",
         "covered": "Đã có trong thiết kế", "gap": "Thiếu bao phủ", "external": "Module khác phụ trách",
         "uncertain": "Chưa rõ", "partial": "Tương đương một phần",
         "equivalent": "Tương đương ở mức thiết kế", "conflict": "Mâu thuẫn expected output"}


def evidence(refs):
    return ", ".join(f"{ref['source']} L{ref['start']}–{ref['end']}" for ref in refs)


def findings(lines, entries, decisions=()):
    by_id = {d["finding_id"]: d for d in decisions}
    for item in entries:
        decision = by_id.get(item["id"])
        lines.extend([
            f"- **{item['id']} · {LABEL[item['disposition']]}** — {item['statement']}",
            f"  - Phản ví dụ. {item['counterexample']}",
            f"  - Kết quả mong đợi. {item['expected_output']}",
            f"  - Việc cần làm. {item['proposed_action']}",
            f"  - Nguồn. {evidence(item['sources'])}",
        ])
        if decision:
            lines.append(f"  - Coordinator — {LABEL[decision['disposition']]}. {decision['reason']}")


def render(states, cross, mode, total, status):
    lines = ["# Báo cáo rà soát thiết kế L4 Parent-Pal", ""]
    lines.append("**Chế độ mô phỏng.** Kết quả dựng sẵn để thử hệ thống; 0 lượt gọi model."
                 if mode == "mock" else
                 "**Chế độ OpenAI.** Mỗi vai trò dùng một lượt gọi và ngữ cảnh riêng.")
    lines.extend([
        f"Trạng thái lượt chạy: {status}. Chi phí hạch toán theo cấu hình: {total:.6f} USD.",
        "Test ứng dụng đã thực thi: **0**. Các ca dưới đây là đặc tả test. "
        "Các cổng G-Legal, G-Privacy, G-Safety và G-Feasibility ở trạng thái UNKNOWN.",
        "",
    ])
    for state in states:
        lines.extend([f"## {state['module']}", "", state["message"],
                      f"Vòng sửa: {state['repairs']}.", "", "### L4 ứng viên", ""])
        for c in state.get("design", {}).get("candidates", []):
            lines.extend([f"- **{c['id']}** — {c['primary_outcome']}",
                          f"  - Chủ sở hữu dữ liệu. {c['primary_data_owner']}",
                          f"  - Quy tắc quyền. {' / '.join(c['authorization']['rules'])}",
                          f"  - Nguồn. {evidence(c['source_trace'])}"])
            for dep in c["dependencies"]:
                lines.append(f"  - Phụ thuộc {dep['target_module']} ({dep['verification']}). {dep['reason']}")
        lines.extend(["", "### Test thiết kế và kết quả mong đợi", ""])
        last = state["rounds"][-1]["review"]["coverage"] if state["rounds"] else []
        coverage = {c["test_id"]: c for c in last}
        for test in state.get("qa", {}).get("tests", []):
            lines.extend([f"- **{test['id']}** — {', '.join(test['requirements'])}",
                          f"  - Điều kiện. {test['setup']}",
                          f"  - Hành động. {test['action']}",
                          f"  - Kết quả mong đợi. {test['expected_output']}",
                          f"  - Nguồn. {evidence(test['sources'])}"])
            item = coverage.get(test["id"])
            if item:
                lines.append(f"  - Rà soát: {LABEL[item['status']]}. {item['reason']}")
        lines.extend(["", "### Phản biện, bất đồng và việc cần quyết định", ""])
        if not any(r["review"]["findings"] for r in state["rounds"]):
            lines.append("Chưa có phát hiện được ghi trong các vòng phản biện đã hoàn thành.")
        for row in state["rounds"]:
            if row["review"]["findings"]:
                lines.extend([f"#### Vòng {row['revision']}", ""])
                findings(lines, row["review"]["findings"], row.get("decisions", ()))
        lines.extend(["", "### Kiểm tra bằng mã và hồi quy", ""])
        for check in state["checks"]:
            detail = ". ".join(i["detail"] for i in check["issues"]) or "không phát hiện lỗi cấu trúc"
            lines.append(f"- {check['stage']} — {detail}.")
        baseline = state.get("baseline", {})
        comparison = state.get("comparison", {})
        if not comparison:
            lines.append("- Đối chiếu bộ pilot chưa chạy hoặc module chưa có bộ pilot.")
        for match in comparison.get("matches", []):
            old = baseline.get(match["baseline_id"])
            if old is None:
                continue
            test_ids = ", ".join(match["test_ids"]) or "chưa có ánh xạ"
            lines.append(f"- **{match['baseline_id']}** — {LABEL[match['status']]}. "
                         f"{test_ids}. {match['reason']} ({old['source']} L{old['line']})")
        findings(lines, comparison.get("findings", []))
        lines.extend(["", "### Mức sử dụng theo vai trò", ""])
        counts = Counter()
        amounts = Counter()
        for row in state["usage"]:
            counts[row["role"]] += row.get("input_tokens", 0) + row.get("output_tokens", 0)
            amounts[row["role"]] += row["accounted_usd"]
        for role in counts:
            lines.append(f"- {role} — {counts[role]} token, {amounts[role]:.6f} USD.")
        lines.append("")
    lines.extend(["## Kiểm tra liên module", ""])
    for source, target in cross["hard_edges"]:
        lines.append(f"- {source} → {target}")
    if cross["possible_cycles"]:
        for cycle in cross["possible_cycles"]:
            lines.append(f"- Cần xác minh chu trình phụ thuộc: {' → '.join(cycle)}.")
    else:
        lines.append("- Không phát hiện chu trình trong các cạnh đã đưa vào lượt chạy.")
    return "\n".join(lines) + "\n"

