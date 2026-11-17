// SINH TỰ ĐỘNG bởi scripts/sync-shared.mjs từ packages/scheduler/src/phase.ts. KHÔNG SỬA TAY: sửa ở packages/ rồi chạy lại script.
// Kiểm tra giai đoạn tạm thời: J2, J4, J5 (spec-quy-tac-lap-lich.md) + P6-BP-OD-01/02 (Decision Log APPROVED).
// Quy ước ngày (versioned, theo yêu cầu OD-01): ngày dạng YYYY-MM-DD theo giờ địa phương Asia/Ho_Chi_Minh,
// tu_ngay và den_ngay đều TÍNH CẢ HAI ĐẦU. "Ngày trống hoàn chỉnh" = số ngày nằm hẳn giữa hai giai đoạn.
// người soạn: AI, chưa kiểm chứng độc lập.
import { DATE_CONVENTION, dayNumber as day, isoFromDayNumber as iso } from "../../domain/src/index.ts";
const MAX_PHASE_DAYS = 60; // D-09, P6-BP-OD-01
const ALLOWED = ["tong_gio_hoc", "truoc_gio_hoc", "van_dong", "man_hinh", "an_uong"]; // J4
const PROTECTED = ["ngu", "phuc_hoi", "cao_lien", "bo_bua", "phat"];                    // C1, C2, C3, C7: protected_hard

function validatePhase(ph: any, history: any[] = []): any {
  const out: any = { status: "OK", findings: [] as any[], reviews: [] as string[], date_convention: DATE_CONVENTION };
  const F = (rule: string, k: string, t: string, block = true) => { out.findings.push({ rule, k, t, block }); if (block) out.status = "TU_CHOI"; };
  const bad = (ph.noi_long || []).filter(k => !ALLOWED.includes(k));
  bad.forEach(k => F(PROTECTED.includes(k) ? "J4/OD-02" : "J4", "noi_khong_hop_le", "Không được nới \"" + k + "\"" + (PROTECTED.includes(k) ? " (protected_hard, không có đường tắt kể cả khẩn cấp)" : "")));
  if (!ph.den_ngay) { F("J2", "thieu_ngay_ket_thuc", "Chưa có ngày kết thúc: hỏi bố mẹ 1 câu."); return out; }
  const s = day(ph.tu_ngay), e = day(ph.den_ngay), len = e - s + 1;
  if (len <= 0) F("J2", "ngay_sai", "Ngày kết thúc trước ngày bắt đầu.");
  // D-09 (15/11/2026): một giai đoạn tạm thời dài tối đa 60 ngày (tính cả hai đầu). Không có luồng xin dài hơn.
  if (len > MAX_PHASE_DAYS) F("D-09", "vuot_60_ngay_giai_doan", "Giai đoạn dài " + len + " ngày > " + MAX_PHASE_DAYS + " ngày. Ngày kết thúc muộn nhất: " + iso(s + MAX_PHASE_DAYS - 1) + ".");
  if (len > 42) for (let r = s + 14; r < e; r += 14) out.reviews.push(iso(r)); // J2: >6 tuần → xem lại mỗi 2 tuần
  for (const k of (ph.noi_long || []).filter(k => ALLOWED.includes(k))) {
    // OD-01a: cửa sổ nới liên tục cùng constraint (kể cả đổi purpose) ≤ 60 ngày
    const same = history.filter(h => (h.noi_long || []).includes(k) && h.scope === ph.scope).map(h => ({ s: day(h.tu_ngay), e: day(h.den_ngay), purpose: h.purpose })).sort((a, b) => a.s - b.s);
    let ws = s, we = e, changed = true;
    while (changed) { changed = false; for (const h of same) if (h.e >= ws - 1 && h.s <= we + 1 && (h.s < ws || h.e > we)) { ws = Math.min(ws, h.s); we = Math.max(we, h.e); changed = true; } }
    if (we - ws + 1 > 60) F("P6-OD-01", "vuot_60_ngay", "Nới \"" + k + "\" liên tục " + (we - ws + 1) + " ngày (" + iso(ws) + " → " + iso(we) + ") > 60 ngày, kể cả khi đổi mục đích.");
    // OD-01b (P5-R2): ≥7 ngày trống hoàn chỉnh giữa ngoại lệ TƯƠNG TỰ (cùng scope + constraint + purpose)
    for (const h of same.filter(h => h.purpose === ph.purpose)) {
      const gap = h.e < s ? s - h.e - 1 : h.s > e ? h.s - e - 1 : -1;
      if (gap >= 0 && gap < 7) F("P6-OD-01/P5-R2", "khoang_trong_7", "Chỉ có " + gap + " ngày trống giữa \"" + h.purpose + "\" trước đó (kết thúc " + iso(h.e) + ") và giai đoạn mới; cần ≥7. Sớm nhất được bắt đầu: " + iso(h.e + 8) + ".");
      if (gap < 0) F("P6-OD-01", "chong_lan", "Chồng lấn với giai đoạn tương tự đã có.");
    }
  }
  // Đề xuất từ con theo chế độ (B01-MS-OD-02/04, B01-CR §2, UF-Q05 fail-closed):
  // UNSET/PARENT_LED: con không tạo giai đoạn; chỉ thành "mong muốn" gửi bố mẹ, không có trạng thái duyệt.
  // CHILD_EXECUTED, CHILD_DIRECTED: chờ bố mẹ xác nhận (J5). CHILD_DIRECTED chưa rõ có trong phạm vi ủy quyền → fail-closed.
  if (ph.nguon === "con_de_xuat" && ["UNSET", "PARENT_LED"].includes(ph.mode || "UNSET")) { // thiếu mode = UNSET (B01-MS-OD-04), fail-closed
    out.status = out.status === "OK" ? "CHUYEN_THANH_MONG_MUON" : out.status;
    out.findings.push({ rule: "B01-CR§2/D-10", k: "mong_muon", t: "Chế độ " + (ph.mode || "UNSET") + ": con không tạo đề xuất chính thức; ghi thành mong muốn gửi bố mẹ.", block: false });
    return out;
  }
  if (ph.nguon === "con_de_xuat") { out.status = out.status === "OK" ? "CHO_BO_ME_XAC_NHAN" : out.status; out.findings.push({ rule: "J5", k: "cho_xac_nhan", t: "Đề xuất từ con: chờ bố mẹ xác nhận, chưa áp vào lịch.", block: false }); }
  return out;
}

// ---------- v2: vòng đời giai đoạn tạm thời (D-09, J2, J5, J6) ----------
// store = { profiles: {id: {...}}, active: profileId, phases: [] }. Hàm thuần: trả về store mới, không sửa store cũ.
// Trạng thái: CHO_BO_ME_XAC_NHAN → DANG_AP_DUNG → HET_HAN | KET_THUC_SOM; TU_CHOI; HUY.
function clone(x: any): any { return JSON.parse(JSON.stringify(x)); }
function submitPhase(store: any, ph: any, history: any[], today: string): any {
  const st = clone(store), v = validatePhase(ph, history);
  const rec: any = Object.assign({ id: ph.id || "ph" + (st.phases.length + 1) }, clone(ph), { validation: v });
  if (v.status === "TU_CHOI") rec.trang_thai = "TU_CHOI";
  else if (v.status === "CHUYEN_THANH_MONG_MUON") rec.trang_thai = "MONG_MUON";
  else if (v.status === "CHO_BO_ME_XAC_NHAN") rec.trang_thai = "CHO_BO_ME_XAC_NHAN"; // chưa lưu hồ sơ cũ, chưa áp (J5)
  else return activatePhase(Object.assign(st, { phases: [...st.phases, rec] }), rec.id, history, today);
  st.phases.push(rec); return st;
}
function activatePhase(store: any, id: string, history: any[], today: string): any {
  const st = clone(store), rec = st.phases.find(p => p.id === id);
  if (!rec) throw new Error("no phase " + id);
  const v = validatePhase(Object.assign({}, rec, { nguon: "bo_me" }), history); // bố mẹ xác nhận: kiểm lại tại thời điểm áp
  if (v.status !== "OK") { rec.trang_thai = "TU_CHOI"; rec.validation = v; return st; }
  if (st.lock) { rec.trang_thai = "CHO_MO_KHOA"; return st; } // B01-PS-OD-04: không áp khi lịch đang khóa
  rec.ho_so_truoc = st.active;                    // J2: lưu hồ sơ lịch trước giai đoạn
  const pid = "giai_doan:" + rec.id;
  st.profiles[pid] = Object.assign(clone(st.profiles[st.active]), { id: pid, phase_id: rec.id, noi_long: rec.noi_long || [] });
  st.active = pid; rec.trang_thai = "DANG_AP_DUNG"; rec.ap_dung_ngay = today; rec.reviews = v.reviews;
  return st;
}
// Gọi mỗi ngày (và khi mở app). Hết hạn: TỰ về hồ sơ trước giai đoạn (D-09), rồi báo bố mẹ (J6 rút gọn, xem BL).
function tickPhases(store: any, today: string): { store: any; events: any[] } {
  const st = clone(store), events: any[] = [];
  for (const rec of st.phases.filter(p => p.trang_thai === "DANG_AP_DUNG")) {
    if (day(today) > day(rec.den_ngay)) {
      if (st.active === "giai_doan:" + rec.id) st.active = rec.ho_so_truoc;
      rec.trang_thai = "HET_HAN"; rec.het_han_ngay = today;
      events.push({ kind: "het_han_tu_ve_ho_so_truoc", phase: rec.id, ve: rec.ho_so_truoc, rule: "D-09/J2" });
    } else if (rec.reviews && rec.reviews.includes(today)) events.push({ kind: "moc_xem_lai", phase: rec.id, rule: "J2" });
  }
  for (const rec of st.phases.filter(p => p.trang_thai === "CHO_BO_ME_XAC_NHAN" && day(today) > day(p.den_ngay))) { rec.trang_thai = "HUY"; events.push({ kind: "de_xuat_qua_han", phase: rec.id }); }
  return { store: st, events };
}
function endPhaseEarly(store: any, id: string, today: string): any {
  const st = clone(store), rec = st.phases.find(p => p.id === id);
  if (!rec || rec.trang_thai !== "DANG_AP_DUNG") return st;
  if (st.active === "giai_doan:" + rec.id) st.active = rec.ho_so_truoc;
  rec.trang_thai = "KET_THUC_SOM"; rec.den_ngay_thuc = today; return st;
}
export { validatePhase, submitPhase, activatePhase, tickPhases, endPhaseEarly, ALLOWED, DATE_CONVENTION, MAX_PHASE_DAYS };
