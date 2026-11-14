// Chạy 8 hồ sơ: xếp lịch, chạy bộ kiểm tra port từ prototype + kiểm tra bổ sung, đo thời gian, ghi kết quả.
const fs = require("fs"), path = require("path");
const { scheduleWeek, PARAMS } = require("./scheduler");
const V = require("./validators");
const { validatePhase } = require("./phase");
const { RULES } = require("./rules");
const PROFILES = require("./profiles");

const OUT = path.join(__dirname, "..", "out"); fs.mkdirSync(OUT, { recursive: true });
const N = 200;
const summary = [];
let text = "";

for (const prof of PROFILES) {
  // giai đoạn tạm thời
  let phaseRes = null, relaxed = [], extraPhase = [];
  if (prof.phase) {
    phaseRes = validatePhase(prof.phase, prof.phaseHistory || []);
    if (phaseRes.status === "OK") relaxed = prof.phase.noi_long;
    extraPhase = (prof.phaseExtraTests || []).map(x => ({ label: x.label, res: validatePhase(x.ph, prof.phaseHistory || []) }));
  }
  const res = scheduleWeek(Object.assign({}, prof, { phase: phaseRes && phaseRes.status === "OK" ? prof.phase : null }));
  // tất định: chạy lại phải ra y hệt
  const again = scheduleWeek(Object.assign({}, prof, { phase: phaseRes && phaseRes.status === "OK" ? prof.phase : null }));
  const deterministic = JSON.stringify(res.plan) === JSON.stringify(again.plan);
  // thời gian
  const t0 = process.hrtime.bigint(); for (let i = 0; i < N; i++) scheduleWeek(prof); const avgMs = Number(process.hrtime.bigint() - t0) / 1e6 / N;

  const ctx = V.makeCtx({ plan: res.plan, age: prof.age, grade: prof.grade, budget: res.budget, activities: prof.activities, relaxed });
  const perDay = {}; let nCheck = 0, nCheckRelaxed = 0, nExtra = 0; const byKey = {};
  for (const d of V.DAYS) {
    const all = V.checkDayK(ctx, d), kept = V.checkDay(ctx, d), ex = V.extraChecks(ctx, d, { tradeoffs: res.tradeoffs });
    nCheck += kept.length; nCheckRelaxed += all.length - kept.length; nExtra += ex.length;
    kept.forEach(w => byKey[w.k] = (byKey[w.k] || 0) + 1); ex.forEach(w => byKey[w.k] = (byKey[w.k] || 0) + 1);
    perDay[d] = { status: res.days[d].status, attempts: res.days[d].attempts, checkDayK: kept, relaxed: all.length - kept.length, extra: ex, actual: V.actualDay(ctx, d) };
  }
  const board = V.budgetBoard(ctx);
  const floorsOk = !Object.values(perDay).some(x => x.checkDayK.some(w => ["ngu", "phuc_hoi", "cao_lien"].includes(w.k)) || x.extra.some(w => ["x_ngu_san", "x_phuc_hoi15", "x_nghi_giua", "x_bo_bua", "x_bo_hoat_dong", "x_chong"].includes(w.k)));
  const statuses = V.DAYS.map(d => perDay[d].status);
  const worst = ["XUNG_DOT", "CAN_BO_ME_CHON", "DIEU_CHINH_TRONG_DUNG_SAI", "OK"].find(s => statuses.includes(s));
  // P6-OD-03: chỉ dùng mặc định [MĐ] chưa thẩm định → UNKNOWN; có bar gia đình đã duyệt và không lệch → WITHIN_FAMILY_BAR
  const budgetDev = Object.values(perDay).some(x => x.extra.some(w => w.rule === "D4"));
  const balance = !floorsOk ? "FLOOR_VIOLATION" : prof.familyBarApproved ? (budgetDev ? "OUTSIDE_FAMILY_BAR" : "WITHIN_FAMILY_BAR") : "UNKNOWN (app default [MĐ] chưa thẩm định)";
  const r = { id: prof.id, label: prof.label, weekStatus: worst, statuses, floorsOk, balance, deterministic, avgMs: +avgMs.toFixed(3), checkDayK: nCheck, checkDayKRelaxed: nCheckRelaxed, extra: nExtra, byKey, tradeoffs: res.tradeoffs, notes: res.notes, phase: phaseRes, phaseExtra: extraPhase, board, blocks: V.DAYS.reduce((n, d) => n + res.plan.ngay[d].length, 0) };
  summary.push(r);
  fs.writeFileSync(path.join(OUT, prof.id + ".json"), JSON.stringify({ profile: prof, result: r, perDay, plan: res.plan }, null, 1));

  // bản in dễ đọc
  text += "\n==== " + prof.id + " " + prof.label + " | " + worst + " | " + avgMs.toFixed(2) + " ms/tuần ====\n";
  for (const d of V.DAYS) {
    text += "-- " + d + " [" + perDay[d].status + "] " + JSON.stringify(perDay[d].actual) + "\n";
    res.plan.ngay[d].forEach(b => text += "   " + b.bat_dau + "-" + b.ket_thuc + " " + b.khoi + " (" + b.tai + "/" + b.nhom + (b.man_hinh ? "/màn hình" : "") + ")\n");
    perDay[d].checkDayK.forEach(w => text += "   !checkDayK[" + w.k + "] " + w.t + "\n");
    perDay[d].extra.forEach(w => text += "   !extra[" + w.k + "/" + w.rule + "] " + w.t + "\n");
  }
  res.tradeoffs.forEach(t => text += " * ĐÁNH ĐỔI " + t.day + " [" + t.rule + "] " + t.t + " → " + t.options.join(" | ") + "\n");
  res.notes.forEach(n => text += " - ghi chú [" + n.rule + "] " + n.t + "\n");
  if (phaseRes) { text += " # giai đoạn: " + phaseRes.status + " " + JSON.stringify(phaseRes.findings) + " reviews=" + phaseRes.reviews.join(",") + "\n"; extraPhase.forEach(x => text += " # thử: " + x.label + " → " + x.res.status + " " + x.res.findings.map(f => f.rule + ":" + f.k).join(",") + "\n"); }
}
fs.writeFileSync(path.join(OUT, "weeks.txt"), text);
fs.writeFileSync(path.join(OUT, "summary.json"), JSON.stringify(summary.map(({ board, ...x }) => x), null, 1));
fs.writeFileSync(path.join(OUT, "rules.json"), JSON.stringify(RULES, null, 1));
fs.writeFileSync(path.join(OUT, "params.json"), JSON.stringify(PARAMS, null, 1));
console.log("id  status                     floors det  ms     blk chk relax extra tradeoffs  keys");
summary.forEach(s => console.log([s.id, s.weekStatus.padEnd(26), String(s.floorsOk).padEnd(6), String(s.deterministic).padEnd(4), String(s.avgMs).padEnd(6), String(s.blocks).padEnd(3), String(s.checkDayK).padEnd(3), String(s.checkDayKRelaxed).padEnd(5), String(s.extra).padEnd(5), String(s.tradeoffs.length).padEnd(10), JSON.stringify(s.byKey)].join(" ")));
const cnt = k => RULES.filter(r => r.det === k).length;
console.log("rules: total", RULES.length, "yes", cnt("yes"), "partly", cnt("partly"), "no", cnt("no"));
