// Port thuần (không phụ thuộc DOM, không phụ thuộc S) của bộ kiểm tra trong prototype/index.html
// dòng 577–634 (checkDayK), 708–743 (groupOf, fixedDay, actualDay), 751–774 (restRange, judge).
// Regex và ngưỡng giữ nguyên 1:1. Phần "EXTRA" ở cuối là kiểm tra bổ sung của spike cho các quy tắc
// mà checkDayK không bao phủ.
// người soạn: AI, chưa kiểm chứng độc lập.

const DAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const toMin = t => { const m = /^(\d{1,2}):(\d{2})/.exec(t || ""); return m ? (+m[1]) * 60 + (+m[2]) : null; };
const fmtMin = n => Math.floor(n / 60) + " giờ" + (n % 60 ? " " + (n % 60) + " phút" : "");
const STUDY = /(ôn|học|bài|toán|tiếng việt|tiếng anh|từ vựng|đọc to|luyện|làm đề|văn|chính tả)/i;
const NOT_HOME = /(ở trường|đi học|tại trường|trung tâm|học thêm|tan học|về nhà|đồng phục|soạn cặp|chuẩn bị)/i;
const SPORT = /(tập|thi đấu|bóng|bơi|võ|chạy|đạp xe|thể thao|gym)/i;
const BED = /(tắt đèn|đi ngủ|^ngủ)/i;
const MEAL = /(ăn sáng|ăn trưa|ăn tối|bữa|ăn nhẹ|^ăn )/i;
const SOFT = 30;

const isStudy = b => (b.tai === "cao" || b.tai === "vua") && STUDY.test(b.khoi + " " + (b.viec || []).join(" ")) && !NOT_HOME.test(b.khoi);
const isSchool = b => /(ở trường|tại trường|học ở trường)/i.test(b.khoi) && (b.e - b.s) >= 150;

function sleepNeed(age) { return (age || 9) <= 12 ? 540 : 480; }

function makeCtx({ plan, age, grade, budget, activities, relaxed }) {
  return { plan, age, grade, budget, activities: activities || [], relaxed: new Set(relaxed || []) };
}
function effDayRaw(ctx, d) { return ctx.plan.ngoai_le && ctx.plan.ngoai_le[d] ? ctx.plan.ngoai_le[d].khoi : (ctx.plan.ngay[d] || []); }
function liveBlocks(ctx, d) {
  return effDayRaw(ctx, d).filter(b => b.trang_thai !== "huy" && toMin(b.bat_dau) !== null)
    .map(b => Object.assign({}, b, { s: toMin(b.bat_dau), e: toMin(b.ket_thuc) ?? toMin(b.bat_dau) }))
    .sort((a, b) => a.s - b.s);
}

// ---- checkDayK: port 1:1 (index.html 592–634) ----
function checkDayK(ctx, d) {
  const W = [], B = liveBlocks(ctx, d); if (!B.length) return W;
  const push = (t, k) => W.push({ t, k: k || "khac" });
  const school = B.find(isSchool);
  if (school) { B.filter(b => b.e <= school.s && isStudy(b)).forEach(b => push("Có khối học \"" + b.khoi + "\" ngay trước giờ đi học.", "truoc_gio_hoc")); }
  if (school) {
    const after = B.filter(b => b.s >= school.e);
    const firstStudy = after.find(isStudy);
    if (firstStudy && !after.some(b => b.tai === "phuc_hoi" && b.s < firstStudy.s)) push("Sau giờ học ở trường chưa có khối phục hồi trước \"" + firstStudy.khoi + "\".", "phuc_hoi");
  }
  for (let i = 1; i < B.length; i++) {
    const a = B[i - 1], b = B[i];
    if (a.tai === "cao" && b.tai === "cao" && b.s - a.e < 5 && !isSchool(a) && !isSchool(b)) push("\"" + a.khoi + "\" và \"" + b.khoi + "\" là hai khối tải cao liền nhau.", "cao_lien");
  }
  { const col = (d === "T7" || d === "CN") ? "we" : "wd", lim = ctx.budget[col].hoc_nha;
    const total = B.filter(isStudy).reduce((n, b) => n + Math.max(0, b.e - b.s), 0);
    if (total > lim + SOFT) push("Tổng giờ học ở nhà khoảng " + total + " phút, vượt quỹ " + lim + " phút (±" + SOFT + ").", "tong_gio_hoc");
  }
  { const ev = []; const ML = /(ăn sáng|ăn trưa|ăn tối|bữa|ăn nhẹ|ăn phụ|^ăn )/i;
    B.forEach(b => { if (ML.test(b.khoi) || (b.viec || []).some(v => /(ăn nhẹ|bữa phụ|ăn phụ|ăn sáng|ăn tối)/i.test(v))) ev.push({ t: b.s, n: b.khoi }); });
    if (school && school.s <= 660 && school.e >= 720 && !ev.some(x => x.t >= 600 && x.t <= 780)) ev.push({ t: 675, n: "bữa trưa ở trường (giả định 11h15)" });
    ev.sort((a, b) => a.t - b.t);
    const lim = (ctx.age || 9) <= 6 ? 240 : 300;
    for (let i = 1; i < ev.length; i++) { const gap = ev[i].t - ev[i - 1].t; if (gap > lim) push("Từ " + ev[i - 1].n + " đến " + ev[i].n + " cách khoảng " + fmtMin(gap) + " không có gì ăn.", "an_xa"); }
  }
  const bed = [...B].reverse().find(b => BED.test(b.khoi));
  const nd = DAYS[(DAYS.indexOf(d) + 1) % 7], NB = liveBlocks(ctx, nd);
  const age = ctx.age;
  if (bed && NB.length && age) {
    let sleep = NB[0].s + 1440 - bed.s; if (sleep > 1440) sleep -= 1440;
    const need = age <= 12 ? 540 : 480;
    if (sleep < need) push("Từ tắt đèn " + bed.bat_dau + " đến dậy " + NB[0].bat_dau + " hôm sau chỉ " + fmtMin(sleep) + ", dưới " + (need / 60) + " giờ.", "ngu");
  }
  if (bed) { B.filter(b => b.tai === "cao" && SPORT.test(b.khoi) && bed.s - b.e < 60 && b.e <= bed.s).forEach(b => push("\"" + b.khoi + "\" kết thúc chưa tới 1 giờ trước giờ tắt đèn.", "tap_muon")); }
  return W;
}
function checkDay(ctx, d) { return checkDayK(ctx, d).filter(w => !ctx.relaxed.has(w.k)); }

// ---- groupOf / fixedDay / actualDay (index.html 709–743) ----
function groupOf(b) {
  if (b.nhom && ["truong", "hoc_them", "hoc_nha", "choi_nghi", "sinh_hoat", "ngu"].includes(b.nhom)) return b.nhom;
  const t = b.khoi + " " + (b.viec || []).join(" ");
  if (BED.test(b.khoi)) return "ngu";
  if (isSchool(b) || /(đi học|về nhà|tan học)/i.test(b.khoi)) return "truong";
  if (/(trung tâm|học thêm|gia sư|lớp bơi|lớp vẽ|lớp đàn|câu lạc bộ|clb|võ|taekwondo|karate|múa|đi học tiếng anh)/i.test(t)) return "hoc_them";
  if (b.tai === "phuc_hoi") return "choi_nghi";
  if (isStudy(b)) return "hoc_nha";
  if (/(ăn|bữa|vệ sinh|tắm|đánh răng|thay đồ|soạn cặp|dậy|nhật ký|đọc sách|đọc truyện)/i.test(t)) return "sinh_hoat";
  if (b.tai === "cao" || b.tai === "vua") return "hoc_nha";
  return "choi_nghi";
}
function actDur(a) { const x = toMin(a.bat_dau), y = toMin(a.ket_thuc); return x !== null && y !== null && y > x ? y - x : 0; }
function fixedDay(ctx, d) {
  const R = { truong: 0, hoc_them: 0 }; const useActs = ctx.activities.length > 0;
  liveBlocks(ctx, d).forEach(b => { const g = groupOf(b); if (g === "truong" || (g === "hoc_them" && !useActs)) R[g] += Math.max(0, b.e - b.s); });
  if (useActs) ctx.activities.filter(a => (a.thu || []).includes(d)).forEach(a => { R.hoc_them += actDur(a) + (+a.di_lai || 0); });
  return R;
}
function actualDay(ctx, d) {
  const R = { truong: 0, hoc_them: 0, hoc_nha: 0, choi_nghi: 0, man_hinh: 0, sinh_hoat: 0, ngu: 0 };
  const B = liveBlocks(ctx, d); if (!B.length) return null;
  let last = null;
  B.forEach(b => {
    const g = groupOf(b), dur = Math.max(0, b.e - b.s);
    if (g !== "ngu") { R[g] += dur; if (g === "sinh_hoat" && MEAL.test(b.khoi)) R.choi_nghi += Math.round(dur / 2); }
    if (b.man_hinh || /(tivi|ti vi|điện thoại|game|màn hình|ipad)/i.test(b.khoi)) R.man_hinh += dur;
    if (last !== null && b.s > last && g !== "ngu") R.choi_nghi += b.s - last;
    last = Math.max(last || 0, b.e);
  });
  const bed = [...B].reverse().find(b => BED.test(b.khoi));
  const nb = liveBlocks(ctx, DAYS[(DAYS.indexOf(d) + 1) % 7]);
  if (bed && nb.length) { let sl = nb[0].s + 1440 - bed.s; if (sl > 1440) sl -= 1440; R.ngu = sl; }
  return R;
}
const COLS = [{ k: "wd", days: ["T2", "T3", "T4", "T5", "T6"] }, { k: "we", days: ["T7", "CN"] }];
function restRange(ctx, col) {
  const B = ctx.budget[col], days = COLS.find(c => c.k === col).days;
  const vals = days.map(d => { const f = fixedDay(ctx, d); return 1440 - f.truong - f.hoc_them - B.hoc_nha - B.sinh_hoat - B.ngu + Math.round(B.sinh_hoat * 0.25); });
  return [Math.min(...vals), Math.max(...vals)];
}
// judge: port, trả về [màu, lý do ngắn]
function judge(ctx, gk, col, v) {
  const wd = col === "wd", need = sleepNeed(ctx.age);
  const lo = (x, ok, warn, why) => x >= ok ? ["xanh", ""] : x >= warn ? ["cam", why] : ["do", why];
  switch (gk) {
    case "ngu": return lo(v, need, need - 30, "Ngủ " + v + "′ < tối thiểu " + need + "′ [NC AASM]");
    case "hoc_nha": return ["xam", ""];
    case "man_hinh": return v <= 60 ? ["xanh", ""] : v <= 120 ? ["cam", "Màn hình " + v + "′ > 1h [MĐ]"] : ["do", "Màn hình " + v + "′ > 2h [NC Canada 24h]"];
    case "sinh_hoat": return lo(v, 90, 60, "Ăn uống, vệ sinh " + v + "′ [MĐ]");
    case "choi_nghi": return v < 0 ? ["do", "Tổng các nhóm vượt 24h " + (-v) + "′"] : lo(v, wd ? 60 : 120, wd ? 30 : 60, "Chơi và nghỉ " + v + "′ [MĐ + WHO]");
    case "hoc_them": return v <= (wd ? 120 : 180) ? ["xanh", ""] : [v <= (wd ? 180 : 270) ? "cam" : "do", "Học thêm " + v + "′ [MĐ]"];
    default: return ["xam", ""];
  }
}
function rangeOf(ctx, col, fn, key) {
  const xs = COLS.find(c => c.k === col).days.map(d => fn(ctx, d)).filter(Boolean).map(v => v[key]);
  return xs.length ? [Math.min(...xs), Math.max(...xs)] : null;
}
// Bảng quỹ như renderBudget hiển thị: màu từng ô
function budgetBoard(ctx) {
  const out = {};
  for (const c of COLS) {
    const B = ctx.budget[c.k];
    out[c.k] = {
      ngu: judge(ctx, "ngu", c.k, B.ngu), man_hinh: judge(ctx, "man_hinh", c.k, B.man_hinh),
      sinh_hoat: judge(ctx, "sinh_hoat", c.k, B.sinh_hoat),
      hoc_them: (() => { const r = rangeOf(ctx, c.k, fixedDay, "hoc_them"); return judge(ctx, "hoc_them", c.k, r ? r[1] : 0); })(),
      choi_nghi: judge(ctx, "choi_nghi", c.k, restRange(ctx, c.k)[0]),
      choi_nghi_range: restRange(ctx, c.k),
    };
  }
  return out;
}

// ---- EXTRA: kiểm tra bổ sung cho quy tắc checkDayK chưa bao phủ ----
function sessionMax(grade) { return grade <= 3 ? 30 : grade <= 5 ? 40 : 45; }
function extraChecks(ctx, d, meta) {
  const W = [], B = liveBlocks(ctx, d); if (!B.length) return W;
  const push = (k, rule, t) => W.push({ k, rule, t });
  const real = B.filter(b => !BED.test(b.khoi));
  // overlap
  for (let i = 1; i < real.length; i++) if (real[i].s < real[i - 1].e) push("x_chong", "—", "Chồng giờ: \"" + real[i - 1].khoi + "\" và \"" + real[i].khoi + "\"");
  // F4 phiên học
  B.filter(b => isStudy(b) && groupOf(b) === "hoc_nha").forEach(b => { if (b.e - b.s > sessionMax(ctx.grade)) push("x_phien", "F4", "Phiên \"" + b.khoi + "\" " + (b.e - b.s) + "′ > " + sessionMax(ctx.grade) + "′"); });
  // C3: hai khối học ở nhà cần cách ≥3′
  const st = B.filter(b => isStudy(b) && groupOf(b) === "hoc_nha");
  for (let i = 1; i < st.length; i++) if (st[i].s - st[i - 1].e < 3) push("x_nghi_giua", "C3", "Hai phiên học liền nhau không nghỉ");
  // C2: phục hồi ≥15′ sau giờ học, trước việc học
  const school = B.find(isSchool);
  if (school) {
    const lastSchool = [...B].filter(b => groupOf(b) === "truong").pop();
    const after = B.filter(b => b.s >= lastSchool.e);
    const fs = after.find(b => isStudy(b) && groupOf(b) === "hoc_nha");
    if (fs) { const rec = after.filter(b => b.tai === "phuc_hoi" && b.s < fs.s && /phục hồi/i.test(b.khoi)).reduce((n, b) => n + b.e - b.s, 0); if (rec < 15) push("x_phuc_hoi15", "C2", "Phục hồi sau giờ học " + rec + "′ < 15′"); }
  }
  // C6 / F5 màn hình
  const bed = [...B].reverse().find(b => BED.test(b.khoi));
  B.filter(b => b.man_hinh).forEach(b => {
    if (bed && bed.s - b.e < 60) push("x_man_hinh_ngu", "C6", "Màn hình kết thúc " + (bed.s - b.e) + "′ trước tắt đèn");
    const nxt = B.find(x => x.s >= b.e && x.s - b.e < 5 && x !== b);
    if (nxt && isStudy(nxt)) push("x_man_hinh_nghi", "F5", "Màn hình ngay trước khối học");
  });
  // F3 khối cuối trước ngủ là thấp
  if (bed) { const lastB = real.filter(b => b.e <= bed.s).pop(); if (lastB && lastB.tai !== "thap") push("x_cuoi_thap", "F3", "Khối cuối trước ngủ \"" + lastB.khoi + "\" tải " + lastB.tai); }
  // H1 tải cao cách bữa chính ≥15′
  const meals = B.filter(b => /(ăn trưa|ăn tối|ăn sáng)/i.test(b.khoi));
  B.filter(b => b.tai === "cao" && groupOf(b) === "hoc_nha").forEach(b => { meals.forEach(m => { if (b.s >= m.e && b.s - m.e < 15) push("x_bua_cao", "H1", "\"" + b.khoi + "\" chỉ cách bữa " + (b.s - m.e) + "′"); }); });
  // C7 không bỏ bữa: phải có ăn sáng + (ăn trưa hoặc bữa trường) + ăn tối
  const txt = B.map(b => b.khoi).join(" | ");
  if (!/ăn sáng/i.test(txt)) push("x_bo_bua", "C7", "Thiếu ăn sáng");
  if (!/ăn tối/i.test(txt)) push("x_bo_bua", "C7", "Thiếu ăn tối");
  // Hoạt động cố định không bị bỏ âm thầm
  (ctx.activities || []).filter(a => a.thu.includes(d)).forEach(a => {
    const placed = B.some(b => b.act_id === a.id && b.act_start === a.bat_dau && b.act_end === a.ket_thuc);
    const declared = (meta.tradeoffs || []).some(t => t.day === d && t.act_id === a.id);
    if (!placed && !declared) push("x_bo_hoat_dong", "E/OD-02", "Hoạt động \"" + a.ten + "\" bị bỏ mà không báo");
  });
  // D4 quỹ ±30
  const col = (d === "T7" || d === "CN") ? "we" : "wd", T = ctx.budget[col], A = actualDay(ctx, d);
  if (A) {
    if (Math.abs(A.hoc_nha - T.hoc_nha) > SOFT) push("x_quy_hoc_nha", "D4", "hoc_nha " + A.hoc_nha + "′ so với quỹ " + T.hoc_nha + "′");
    if (Math.abs(A.sinh_hoat - T.sinh_hoat) > SOFT) push("x_quy_sinh_hoat", "D4", "sinh_hoat " + A.sinh_hoat + "′ so với quỹ " + T.sinh_hoat + "′");
    if (A.ngu && (A.ngu < T.ngu - SOFT || A.ngu > T.ngu + SOFT)) push("x_quy_ngu", "D4", "ngu " + A.ngu + "′ so với quỹ " + T.ngu + "′");
    if (A.ngu && A.ngu < sleepNeed(ctx.age)) push("x_ngu_san", "C1", "ngu " + A.ngu + "′ < sàn " + sleepNeed(ctx.age) + "′");
    if (A.man_hinh > T.man_hinh) push("x_quy_man_hinh", "D4", "màn hình " + A.man_hinh + "′ > tối đa " + T.man_hinh + "′");
  }
  return W;
}

module.exports = { DAYS, toMin, isStudy, isSchool, groupOf, liveBlocks, makeCtx, checkDayK, checkDay, actualDay, fixedDay, restRange, judge, budgetBoard, extraChecks, sessionMax, sleepNeed, STUDY, NOT_HOME, SPORT };
