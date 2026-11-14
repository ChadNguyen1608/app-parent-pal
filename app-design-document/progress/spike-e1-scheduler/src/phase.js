// Kiểm tra giai đoạn tạm thời: J2, J4, J5 (spec-quy-tac-lap-lich.md) + P6-BP-OD-01/02 (Decision Log APPROVED).
// Quy ước ngày (versioned, theo yêu cầu OD-01): ngày dạng YYYY-MM-DD theo giờ địa phương Asia/Ho_Chi_Minh,
// tu_ngay và den_ngay đều TÍNH CẢ HAI ĐẦU. "Ngày trống hoàn chỉnh" = số ngày nằm hẳn giữa hai giai đoạn.
// người soạn: AI, chưa kiểm chứng độc lập.
const DATE_CONVENTION = "v1: YYYY-MM-DD, Asia/Ho_Chi_Minh, inclusive both ends";
const ALLOWED = ["tong_gio_hoc", "truoc_gio_hoc", "van_dong", "man_hinh", "an_uong"]; // J4
const PROTECTED = ["ngu", "phuc_hoi", "cao_lien", "bo_bua", "phat"];                    // C1, C2, C3, C7: protected_hard
const day = s => Math.round(Date.parse(s + "T00:00:00Z") / 864e5);
const iso = n => new Date(n * 864e5).toISOString().slice(0, 10);

function validatePhase(ph, history = []) {
  const out = { status: "OK", findings: [], reviews: [], date_convention: DATE_CONVENTION };
  const F = (rule, k, t, block = true) => { out.findings.push({ rule, k, t, block }); if (block) out.status = "TU_CHOI"; };
  const bad = (ph.noi_long || []).filter(k => !ALLOWED.includes(k));
  bad.forEach(k => F(PROTECTED.includes(k) ? "J4/OD-02" : "J4", "noi_khong_hop_le", "Không được nới \"" + k + "\"" + (PROTECTED.includes(k) ? " (protected_hard, không có đường tắt kể cả khẩn cấp)" : "")));
  if (!ph.den_ngay) { F("J2", "thieu_ngay_ket_thuc", "Chưa có ngày kết thúc: hỏi bố mẹ 1 câu."); return out; }
  const s = day(ph.tu_ngay), e = day(ph.den_ngay), len = e - s + 1;
  if (len <= 0) F("J2", "ngay_sai", "Ngày kết thúc trước ngày bắt đầu.");
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
  if (ph.nguon === "con_de_xuat") { out.status = out.status === "OK" ? "CHO_BO_ME_XAC_NHAN" : out.status; out.findings.push({ rule: "J5", k: "cho_xac_nhan", t: "Đề xuất từ con: chờ bố mẹ xác nhận, chưa áp vào lịch.", block: false }); }
  return out;
}
module.exports = { validatePhase, ALLOWED, DATE_CONVENTION };
