// Spike E1: bộ xếp lịch tuần TẤT ĐỊNH (không LLM) cho Parent-Pal.
// Cách làm: neo các mốc cố định (ngủ, trường, hoạt động, bữa, đuôi buổi tối) → xếp tham lam các việc linh hoạt
// theo thứ tự quy tắc (G3, G4, F4, H1, C6) → nếu không vừa thì đi theo "thang sửa" cố định
// (giảm màn hình → giảm học trong ±30′ → phục hồi 30→20′ → lùi giờ ngủ ≤30′ → phục hồi 15′) →
// ngoài dung sai thì KHÔNG tự xếp phương án phạm quy tắc mà trả về đánh đổi cho bố mẹ chọn.
// Mọi con số lấy từ spec-quy-tac-lap-lich.md, ghi mã quy tắc và mức căn cứ ở PARAMS.
// người soạn: AI, chưa kiểm chứng độc lập.

import * as V from "./validators.ts";
import { DAYS, toMin, hhmm, PARAM_STATUS } from "../../domain/src/index.ts";

const PARAMS: Record<string, any> = {
  MORNING:        { v: 30, src: "D (ngưỡng sinh_hoat: 'sáng 30′') [MĐ]" },
  DINNER:         { v: 30, src: "D (ngưỡng sinh_hoat: 'ăn tối 30′') [MĐ]" },
  LUNCH_HOME:     { v: 30, src: "áp mốc ăn tối 30′ của D [MĐ]" },
  HYGIENE:        { v: 30, src: "D (ngưỡng sinh_hoat: 'tắm và vệ sinh tối 30′') [MĐ]" },
  READ:           { v: 15, src: "G4 đọc sách 15′ [MĐ]" },
  CHECKIN:        { v: 10, src: "G3 khối 10′ [MĐ]" },
  PACK:           { v: 10, src: "G6 (≥10′ cho soạn cặp) [MĐ]" },
  REC_DEFAULT:    { v: 30, src: "C2/G3 20–30′ (cận trên) [NC NT-01, thời lượng MĐ]" },
  REC_MID:        { v: 20, src: "C2/G3 20–30′ (cận dưới)" },
  REC_FLOOR:      { v: 15, src: "C2 tối thiểu 15′, không nới (J4)" },
  BREAK:          { v: 5,  src: "C3 3–5′ ∩ F4 5–10′ [NL NT-09, MĐ]" },
  MEAL_TO_CAO:    { v: 15, src: "H1 15–20′ (cận dưới) [MĐ]" },
  SPORT_TO_BED:   { v: 60, src: "C5 [NC NT-05]" },
  SCREEN_TO_BED:  { v: 60, src: "C6 [NC NT-06]" },
  BED_SHIFT_MAX:  { v: 30, src: "G7 lùi tối đa 15–30′; D4 ngủ không thấp hơn quỹ quá 30′ [MĐ]" },
  SOFT:           { v: 30, src: "D4 ±30′ [MĐ]" },
  MOTION_MIN:     { v: 15, src: "G2 15–25′ [MĐ]" },
  MOTION_MAX:     { v: 25, src: "G2 15–25′ [MĐ]" },
  LUNCH_ASSUME:   { v: 675, src: "H2 giả định ăn trưa 11:15" },
  MIN_CHUNK:      { v: 20, src: "F4 cận dưới của lớp 1–3 (20′), dùng làm phiên ngắn nhất [MĐ]" },
  SNACK:          { v: 10, src: "Thời lượng khối bữa phụ; spec không ghi số, chọn ngang khối G3 (blocker B-7) [MĐ]" },
};
// v2 (D-08, sổ quyết định 15/11/2026): mọi thông số là "mặc định chưa kiểm chứng", chờ thẩm định chuyên môn ở bước 14b.
// Nhãn này áp cả cho số có [NC]: căn cứ của quy tắc có thể là [NC], nhưng con số cụ thể dùng trong bộ xếp vẫn chưa được thẩm định.
const BL_ID: Record<string, string> = { MORNING: "PR-01", DINNER: "PR-02", LUNCH_HOME: "PR-03", HYGIENE: "PR-04", READ: "PR-05", CHECKIN: "PR-06", PACK: "PR-07",
  REC_DEFAULT: "PR-08", REC_MID: "PR-09", REC_FLOOR: "PR-10", BREAK: "PR-11", MEAL_TO_CAO: "PR-12", SPORT_TO_BED: "PR-13", SCREEN_TO_BED: "PR-14",
  BED_SHIFT_MAX: "PR-15", SOFT: "PR-16", MOTION_MIN: "PR-17", MOTION_MAX: "PR-18", LUNCH_ASSUME: "PR-19", MIN_CHUNK: "PR-20", SNACK: "PR-21" };
for (const k of Object.keys(PARAMS)) Object.assign(PARAMS[k], { id: BL_ID[k], status: PARAM_STATUS, quyet_dinh: "D-08", cho_tham_dinh: "buoc_14b" });
// B-1 (mặc định fail-safe có nhãn, chờ chủ sản phẩm): nghỉ giữa hai khối học tối thiểu 5′ ở CẢ bộ xếp lẫn bộ kiểm tra
// (chặt hơn sàn 3′ của C3; bằng cận dưới của F4). Không sửa spec gốc.
PARAMS.BREAK.src = "B-1 fail-safe: sàn kiểm = 5′ (C3 ghi 3–5′, F4 ghi 5–10′; lấy 5′ thỏa cả hai và chặt hơn sàn 3′) [NL NT-09, MĐ]";
PARAMS.BREAK.b1_default = "fail_safe_5_phut_cho_chu_san_pham_chon";
const p = (k: string): number => PARAMS[k].v;
const isWE = (d: string) => d === "T7" || d === "CN";
const col = (d: string) => isWE(d) ? "we" : "wd";

function defaultBudget(grade: number, age: number): any { // port defaultBudget() index.html 695–699
  const g = grade || 3, a = age || 9, young = a <= 10, need = V.sleepNeed(a);
  return { wd: { hoc_nha: g * 10, sinh_hoat: 105, ngu: need + 30, man_hinh: young ? 30 : 60 },
           we: { hoc_nha: g * 10, sinh_hoat: 120, ngu: need + 60, man_hinh: young ? 60 : 120 } };
}

// ---------- tính giờ dậy, giờ ngủ cho cả tuần (G1, G5, G8, C1) ----------
function weekAnchors(prof: any, budget: any) {
  const need = V.sleepNeed(prof.age), notes = [];
  const prefWake = toMin(prof.sleep.wake);
  const tgt: Record<string, number> = {}; DAYS.forEach(d => { let t = budget[col(d)].ngu; if (t < need) { notes.push({ rule: "C1/D-02", t: d + ": quỹ ngủ " + t + "′ thấp hơn sàn " + need + "′; dùng sàn (không bao giờ nới, không có \"Giữ mức này\" cho ô Ngủ)." }); t = need; } tgt[d] = t; });
  const wake: Record<string, number> = {};
  const earliestFixed = (d: string): number | null => {
    const xs: number[] = [];
    const s = prof.school[d]; if (s) xs.push(toMin(s.start) - (prof.commute || 0));
    (prof.activities || []).filter(a => a.thu.includes(d)).forEach(a => xs.push(toMin(a.bat_dau) - Math.round((a.di_lai || 0) / 2)));
    return xs.length ? Math.min(...xs) : null;
  };
  // ngày đi học: giờ dậy theo giờ phải đi (G1), tối thiểu chừa khối sáng 30′
  DAYS.forEach(d => { if (prof.school[d]) wake[d] = Math.min(prefWake, earliestFixed(d) - p("MORNING")); });
  const schoolWakes = DAYS.filter(d => prof.school[d]).map(d => wake[d]);
  const B0 = (schoolWakes.length ? Math.min(...schoolWakes) : prefWake) - tgt.T2 + 1440; // giờ tắt đèn ngày thường điển hình
  // cuối tuần không đi học: giữ giờ tắt đèn B0, dậy theo quỹ ngủ (G8: giữ nhịp gần ngày thường)
  DAYS.forEach((d, i) => {
    if (wake[d] !== undefined) return;
    const prev = DAYS[(i + 6) % 7];
    let extra = 0;
    if (!isWE(prev)) { extra = Math.max(0, Math.min(p("SOFT"), budget.we.ngu - budget.wd.ngu)); tgt[prev] += extra; } // đêm T6: +≤30′ trong dung sai D4
    let w = (B0 + tgt[prev]) % 1440;
    const ef = earliestFixed(d); if (ef !== null && w > ef - p("MORNING")) { w = ef - p("MORNING"); notes.push({ rule: "G1", t: d + ": dậy sớm hơn để kịp hoạt động lúc " + hhmm(ef) + "." }); }
    wake[d] = w;
  });
  const bed: Record<string, number> = {}; DAYS.forEach((d, i) => { const nd = DAYS[(i + 1) % 7]; bed[d] = wake[nd] + 1440 - tgt[d]; });
  return { wake, bed, tgt, need, notes };
}

// ---------- dựng một ngày với một bộ tham số ----------
function blk(s: number, e: number, khoi: string, o: any = {}): any {
  return Object.assign({ s, e, khoi, viec: [], xac_nhan: "Con bấm Xong", tai: "thap", nhom: "sinh_hoat", the_thao: false, man_hinh: false, trang_thai: "binh_thuong", ghi_chu: "" }, o);
}
const MAIN_MEAL = /(ăn sáng|ăn trưa|ăn tối)/i;
const SNACK = PARAMS.SNACK.v; // B-7: thời lượng khối, không phải giới hạn
// cùng logic nhận diện bữa với checkDayK (index.html 615–617)
function mealEvents(B: any[], school: any) {
  const ML = /(ăn sáng|ăn trưa|ăn tối|bữa|ăn nhẹ|ăn phụ|^ăn )/i, ev = [];
  B.forEach(b => { if (ML.test(b.khoi) || (b.viec || []).some(v => /(ăn nhẹ|bữa phụ|ăn phụ|ăn sáng|ăn tối)/i.test(v))) ev.push({ t: b.s, n: b.khoi }); });
  if (school && toMin(school.start) <= 660 && toMin(school.end) >= 720 && !ev.some(x => x.t >= 600 && x.t <= 780)) ev.push({ t: 675, n: "bữa trưa ở trường (giả định 11h15)" });
  return ev.sort((a, b) => a.t - b.t);
}

function buildDay(prof: any, d: string, A: any, prm: any) {
  const cut = prm.cut || 0; // phút bớt cho mỗi khối bữa ở nhà và vệ sinh để khớp quỹ sinh_hoat (D4)
  const DUR = { MORNING: p("MORNING") - cut, DINNER: p("DINNER") - cut, LUNCH_HOME: p("LUNCH_HOME") - cut, HYGIENE: p("HYGIENE") - cut };
  const grade = prof.grade, school = prof.school[d], commute = prof.commute || 0;
  const di = DAYS.indexOf(d), nextD = DAYS[(di + 1) % 7];
  const wake = A.wake[d], bed = A.bed[d] + prm.shift, tailStart = bed - DUR.HYGIENE - p("READ");
  const B = [], fails = [], notes = [], tradeoffs = [];
  const free = (s, e) => s >= wake && e <= bed && s < e && B.every(b => b.e <= s || b.s >= e);
  const add = b => { B.push(b); B.sort((x, y) => x.s - y.s); return b; };

  // 1. buổi sáng (G2) + trường (D2) + đi lại
  let morningEnd;
  if (school) {
    const st = toMin(school.start), en = toMin(school.end), leave = st - commute;
    const avail = leave - wake;
    let t = wake;
    if (avail >= DUR.MORNING + p("MOTION_MIN")) {
      const mv = Math.min(p("MOTION_MAX"), avail - DUR.MORNING);
      add(blk(t, t + mv, "Dậy, vận động buổi sáng", { viec: ["Khởi động", "Phần chính nhẹ (trong nhà nếu mưa)", "Giãn cơ"], tai: "vua", nhom: "choi_nghi", ghi_chu: grade <= 6 ? "Dưới 12 tuổi đạp xe ngoài đường cần người lớn đi cùng, đội mũ bảo hiểm (G2)." : "" }));
      t += mv;
    } else notes.push({ rule: "G2", t: d + ": buổi sáng không đủ " + p("MOTION_MIN") + "′ cho vận động." });
    // ăn sáng sát giờ đi để rút ngắn khoảng cách tới bữa trưa (H2)
    add(blk(leave - DUR.MORNING, leave, "Vệ sinh, ăn sáng, thay đồ", { viec: ["Đánh răng, rửa mặt", "Ăn sáng (không màn hình)", "Thay đồng phục"] }));
    morningEnd = leave;
    if (commute) add(blk(leave, st, "Đi học", { tai: "thap", nhom: "truong", xac_nhan: "Tự động" }));
    // tách khối trường theo bữa ở trường (H2: bữa ở trường được tính)
    const cuts = [];
    if (school.lunch) cuts.push({ s: toMin(school.lunch), e: toMin(school.pmStart || hhmm(toMin(school.lunch) + p("LUNCH_HOME"))), k: school.pmStart ? "Ăn trưa, ngủ trưa ở trường" : "Ăn trưa ở trường" });
    if (school.snack) cuts.push({ s: toMin(school.snack), e: toMin(school.snack) + (school.snackDur || 15), k: "Bữa phụ ở trường" });
    cuts.sort((a, b) => a.s - b.s);
    let cur = st, seg = 0;
    for (const c of cuts) { if (c.s > cur) add(blk(cur, c.s, seg++ ? "Học ở trường (chiều)" : "Học ở trường", { tai: "cao", nhom: "truong", xac_nhan: "Không cần" })); add(blk(c.s, c.e, c.k, { tai: "thap", nhom: "truong", xac_nhan: "Không cần" })); cur = c.e; }
    if (en > cur) add(blk(cur, en, seg ? "Học ở trường (chiều)" : "Học ở trường", { tai: "cao", nhom: "truong", xac_nhan: "Không cần" }));
    if (commute) add(blk(en, en + commute, "Về nhà", { tai: "thap", nhom: "truong", xac_nhan: "Tự động" }));
  } else {
    let t = wake;
    const firstFixed = Math.min(...(prof.activities || []).filter(a => a.thu.includes(d)).map(a => toMin(a.bat_dau) - Math.round((a.di_lai || 0) / 2)), 9999);
    const room = firstFixed - wake;
    if (room >= DUR.MORNING + p("MOTION_MIN")) { const mv = Math.min(p("MOTION_MAX"), room - DUR.MORNING); add(blk(t, t + mv, "Dậy, vận động buổi sáng", { viec: ["Khởi động", "Phần chính nhẹ", "Giãn cơ"], tai: "vua", nhom: "choi_nghi" })); t += mv; }
    add(blk(t, t + DUR.MORNING, "Vệ sinh, ăn sáng", { viec: ["Đánh răng, rửa mặt", "Ăn sáng (không màn hình)"] }));
    morningEnd = t + DUR.MORNING;
  }

  // 2. hoạt động cố định (E1, D2): không bao giờ bỏ âm thầm
  for (const a of (prof.activities || []).filter(a => a.thu.includes(d))) {
    const h = Math.round((a.di_lai || 0) / 2), s = toMin(a.bat_dau) - h, e = toMin(a.ket_thuc) + h;
    let name = a.ten + " (gồm đi lại)";
    if (a.loai === "the_thao") name = "Tập thể thao: " + name; else if (V.STUDY.test(name) || a.loai === "hoc_them") name = "Học thêm: " + name; else name = "Năng khiếu: " + name;
    const o = { tai: "cao", nhom: "hoc_them", the_thao: a.loai === "the_thao", xac_nhan: "Tự động", act_id: a.id, act_start: a.bat_dau, act_end: a.ket_thuc, viec: ["Mang túi đồ đã soạn từ tối hôm trước"] };
    if (e > tailStart || toMin(a.ket_thuc) > bed) { fails.push({ k: "act_bed", act: a }); continue; }
    if (a.loai === "the_thao" && toMin(a.ket_thuc) > bed - p("SPORT_TO_BED")) { fails.push({ k: "sport_bed", act: a }); continue; }
    if (!free(s, e)) { tradeoffs.push({ day: d, act_id: a.id, kind: "trung_gio", rule: "E1/OD-02", t: "\"" + a.ten + "\" " + a.bat_dau + "–" + a.ket_thuc + " (cả đi lại " + hhmm(s) + "–" + hhmm(e) + ") trùng giờ trường hoặc hoạt động khác.", options: ["Bố mẹ đổi giờ hoặc ngày của \"" + a.ten + "\"", "Bỏ một trong hai hoạt động trùng (bố mẹ chọn)"] }); continue; }
    add(blk(s, e, name, o));
  }

  // 3. về nhà: ghi việc + hỏi thăm (G3), rồi phục hồi (C2) trước mọi việc học
  let flexLo = morningEnd, recEnd = null;
  const placeMeal = (pref, name, dur) => {
    for (let s = pref; s + dur <= tailStart; s += 5) if (free(s, s + dur)) return add(blk(s, s + dur, name, { viec: ["Không màn hình khi ăn", "Nghỉ 5–10′ sau ăn (H1)"], xac_nhan: "Không cần" }));
    fails.push({ k: "meal", name }); return null;
  };
  // học 1 buổi sáng, không ăn trưa ở trường: ăn trưa ngay khi về (bữa không thay phục hồi, H1)
  const lunchAtSchool = school && school.lunch;
  const schoolCoversLunch = school && toMin(school.start) <= 660 && toMin(school.end) >= 720;
  if (!lunchAtSchool) {
    if (!schoolCoversLunch) { const pref = Math.max(toMin(prof.meals.lunch || "11:15"), school ? toMin(school.end) + commute : 0); placeMeal(pref, "Ăn trưa", DUR.LUNCH_HOME); }
    else notes.push({ rule: "H2", t: d + ": chưa biết giờ ăn trưa ở trường, giả định 11:15." });
  }
  if (school) {
    const arrive = toMin(school.end) + commute;
    const evening = (prof.activities || []).some(a => a.thu.includes(d) && toMin(a.ket_thuc) > toMin(prof.meals.dinner));
    const justAte = B.some(b => MAIN_MEAL.test(b.khoi) && b.e <= arrive + 60 && b.s >= arrive - 60);
    const recViec = [...(justAte ? [] : [evening ? "Bữa phụ chắc (có học thêm tối, G7)" : "Ăn nhẹ (trái cây, sữa, khoai…)"]), "Chơi tự do do con chọn, không màn hình"];
    // D-10 (15/11/2026, thắng G3): "Rất mệt" KHÔNG tự đổi lịch. Muốn đổi, con đi qua bước đề xuất theo chế độ (xem fatigue.js).
    const recNote = "Con chọn 'Rất mệt' thì lịch không tự đổi (D-10). Con có thể gửi mong muốn hoặc đề xuất cho bố mẹ, tùy chế độ.";
    let t = arrive, placed = false;
    // thử ngay khi về, nếu không thì sau hoạt động gần nhất
    const starts = [arrive, ...B.filter(b => b.s >= arrive && (b.nhom === "hoc_them" || MAIN_MEAL.test(b.khoi))).map(b => b.e)].sort((a, b) => a - b);
    for (const s0 of starts) {
      for (const rec of [prm.rec, p("REC_FLOOR")].filter((x, i, arr) => arr.indexOf(x) === i)) {
        if (free(s0, s0 + p("CHECKIN") + rec)) {
          add(blk(s0, s0 + p("CHECKIN"), "Ghi lại việc được giao, hỏi thăm", { viec: ["Chụp sổ liên lạc hoặc kể cho Pal", "Con chọn: Ổn / Hơi mệt / Rất mệt"], xac_nhan: "Ảnh" }));
          add(blk(s0 + p("CHECKIN"), s0 + p("CHECKIN") + rec, "Ăn nhẹ và chơi tự do (phục hồi)", { viec: recViec, tai: "phuc_hoi", nhom: "choi_nghi", xac_nhan: "Không cần", ghi_chu: recNote }));
          if (rec < prm.rec) notes.push({ rule: "C2", t: d + ": phục hồi rút còn " + rec + "′ vì hoạt động ngay sau giờ về." });
          recEnd = s0 + p("CHECKIN") + rec; placed = true; break;
        }
      }
      if (placed) break;
    }
    if (!placed) fails.push({ k: "recovery" });
    flexLo = recEnd || arrive;
  }

  // 4. bữa ở nhà (C7 không bỏ bữa; H2)
  placeMeal(Math.max(toMin(prof.meals.dinner), flexLo), "Ăn tối cùng gia đình", DUR.DINNER);

  // 5. đuôi buổi tối (G4, F3): vệ sinh → đọc 15′ + nhật ký → tắt đèn
  if (free(tailStart, bed)) {
    add(blk(tailStart, tailStart + DUR.HYGIENE, "Vệ sinh buổi tối", { viec: ["Tắm, đánh răng", "Thiết bị để ngoài phòng ngủ (C6)"] }));
    add(blk(bed - p("READ"), bed, "Đọc sách và viết nhật ký trên giường", { viec: ["Đọc sách giấy 15′", "Nhật ký 2–3 câu"], ghi_chu: "" }));
  } else fails.push({ k: "tail" });
  add(blk(bed, bed, "Tắt đèn, ngủ", { nhom: "ngu", tai: "phuc_hoi", xac_nhan: "Không cần" }));

  // 7b. khoảng cách bữa (H2) + bữa phụ cách bữa chính kế tiếp 1–2 giờ (H3)
  const lim = (prof.age || 9) <= 6 ? 240 : 300;
  for (let guard = 0; guard < 4; guard++) {
    const ev = mealEvents(B, school);
    let fixed = false;
    for (let i = 1; i < ev.length; i++) {
      const a = ev[i - 1].t, b = ev[i].t; if (b - a <= lim) continue;
      const lo = Math.max(b - lim, a + 60), hi = Math.min(a + lim, b - 60); // H2 bắt buộc; không sát bữa trước/sau
      const pref = b - 90; // giữa khoảng 1–2 giờ trước bữa chính kế tiếp (H3)
      const cands = []; for (let s = lo; s <= hi; s += 5) if (free(s, s + SNACK)) cands.push(s);
      cands.sort((x, y) => Math.abs(x - pref) - Math.abs(y - pref));
      if (cands.length) { add(blk(cands[0], cands[0] + SNACK, "Bữa phụ nhỏ", { viec: ["Trái cây, sữa, sữa chua, khoai hoặc ngô (chú ý dị ứng)"], xac_nhan: "Không cần" })); fixed = true; break; }
      if (!tradeoffs.some(t => t.kind === "bua_xa" && t.a === a)) tradeoffs.push({ day: d, kind: "bua_xa", a, rule: "H2", t: "Từ " + ev[i - 1].n + " (" + hhmm(a) + ") đến " + ev[i].n + " (" + hhmm(b) + ") cách " + (b - a) + "′ (mốc " + lim + "′) mà con không ở nhà để ăn phụ.", options: ["Cho con mang bữa phụ nhỏ ăn giờ ra chơi hoặc trên đường về", "Hỏi trường có bữa phụ không, cho Pal biết giờ", "Giữ như hiện tại (bố mẹ xác nhận một lần)"] });
    }
    if (!fixed) break;
  }

  // 6. phiên học ở nhà (D5, F4, C3, H1, G9)
  const sMax = V.sessionMax(grade);
  let remaining = prm.study, idx = 0, lastStudyEnd = null;
  const adjBefore = s => B.filter(b => b.e <= s && b.e > b.s).sort((a, b) => b.e - a.e)[0];
  const adjAfter = e => B.filter(b => b.s >= e && b.e > b.s).sort((a, b) => a.s - b.s)[0];
  while (remaining > 0) {
    let placed = false;
    for (let s = flexLo; s < tailStart; s += 5) {
      const tai = grade >= 6 && idx === 0 ? "cao" : "vua";
      // độ trống cần trước khối
      const prev = adjBefore(s); let need = 0;
      if (prev) { if (prev.tai === "cao" || prev.study) need = p("BREAK"); if (MAIN_MEAL.test(prev.khoi) && tai === "cao") need = Math.max(need, p("MEAL_TO_CAO")); }
      if (prev && s - prev.e < need) continue;
      // độ dài vừa với chỗ trống
      let e = s; while (e < s + Math.min(sMax, remaining) && free(s, e + 5) && e + 5 <= tailStart) e += 5;
      const nxt = adjAfter(e); if (nxt && (nxt.tai === "cao" || nxt.study) && nxt.s - e < p("BREAK")) e = nxt.s - p("BREAK");
      const size = e - s;
      if (size >= Math.min(p("MIN_CHUNK"), remaining) && size > 0) {
        const name = idx === 0 ? (isWE(d) ? "Học bài mới hoặc phần khó (buổi sáng cuối tuần)" : "Ôn bài, làm việc cô giao") : "Học tiếp theo định hướng bố mẹ";
        add(blk(s, e, name, { viec: ["Việc ngắn, dễ (khoảng 5′)", "Việc cần tập trung nhất", "Việc nhẹ để kết thúc"], tai, nhom: "hoc_nha", study: true, xac_nhan: grade <= 5 ? "Ảnh" : "Con bấm Xong", ghi_chu: grade <= 5 && prof.twoSessions ? "Tiểu học 2 buổi/ngày: ôn nhẹ (G10)." : "" }));
        remaining -= size; idx++; lastStudyEnd = e; placed = true; break;
      }
    }
    if (!placed) { fails.push({ k: "study", left: remaining }); break; }
  }

  // 7. soạn cặp ngay sau ôn bài (G4) nếu mai đi học
  const needPack = !!prof.school[nextD];
  if (needPack) {
    const from = lastStudyEnd !== null ? lastStudyEnd : flexLo;
    let ok = false;
    for (let s = from; s + p("PACK") <= tailStart; s += 5) if (free(s, s + p("PACK"))) {
      add(blk(s, s + p("PACK"), d === "CN" ? "Soạn cặp và đồ cho thứ Hai" : "Soạn cặp theo thời khóa biểu ngày mai", { viec: ["Xem sổ việc", "Ngày mai trời thế nào? Nắng / Mưa / Lạnh / Bình thường (I4)", "Túi đồ lớp ngoài giờ nếu có"], tai: "vua" }));
      ok = true; break;
    }
    if (!ok) fails.push({ k: "pack" });
  }

  // 8. màn hình giải trí (C6, F5): sau học, kết thúc ≥60′ trước tắt đèn
  if (prm.screen > 0) {
    const from = Math.max(...B.filter(b => b.study || /soạn/i.test(b.khoi)).map(b => b.e), flexLo);
    const lim = bed - p("SCREEN_TO_BED");
    let best = null;
    for (let s = from; s < lim; s += 5) {
      if (!free(s, s + 5)) continue;
      let e = s; while (e < s + prm.screen && e + 5 <= lim && free(s, e + 5)) e += 5;
      const prev = adjBefore(s); if (prev && MAIN_MEAL.test(prev.khoi) && prev.e === s) { /* không dính sát bữa */ }
      if (!best || e - s > best.e - best.s) best = { s, e };
      if (best.e - best.s >= prm.screen) break;
    }
    if (best && best.e - best.s >= 5) add(blk(best.s, best.e, "Màn hình giải trí (tivi, máy tính bảng)", { tai: "thap", nhom: "choi_nghi", man_hinh: true, xac_nhan: "Không cần", ghi_chu: "Kết thúc trước tắt đèn ≥60′ (C6)." }));
    const got = best ? best.e - best.s : 0;
    if (got < prm.screen) notes.push({ rule: "C6", t: d + ": màn hình còn " + got + "′ (tối đa bố mẹ chọn " + prm.screen + "′) vì phải tắt trước giờ ngủ 60′." });
  }

  // 9. lấp khoảng trống = chơi và nghỉ (D3, F6, G9)
  const gaps = [];
  const real = B.filter(b => b.e > b.s).sort((a, b) => a.s - b.s);
  let cur = wake;
  for (const b of real) { if (b.s > cur) gaps.push([cur, b.s]); cur = Math.max(cur, b.e); }
  let longest = null;
  gaps.forEach(g => { if (!longest || g[1] - g[0] > longest[1] - longest[0]) longest = g; });
  gaps.forEach(g => {
    const len = g[1] - g[0];
    const name = len <= 10 ? "Nghỉ ngắn: đứng dậy, uống nước" : (isWE(d) && g === longest ? "Vận động vui dài, chơi ngoài trời (con chọn)" : "Chơi tự do (con chọn)");
    add(blk(g[0], g[1], name, { tai: "phuc_hoi", nhom: "choi_nghi", xac_nhan: "Không cần" }));
  });

  return { blocks: B, fails, notes, tradeoffs, bed };
}

// ---------- thang sửa (repair ladder) ----------
function ladder(T: number, M: number, sleepOk: (sh: number) => boolean) {
  const L = [];
  const studies = [T, Math.max(0, T - 15), Math.max(0, T - p("SOFT"))].filter((x, i, a) => a.indexOf(x) === i);
  const shifts = [0, 15, 30].filter(sleepOk);
  // trong dung sai (D4): đổi được mà không cần hỏi
  for (const rec of [p("REC_DEFAULT"), p("REC_MID")]) for (const study of studies) L.push({ rec, study, shift: 0, screen: M, tier: "trong_dung_sai" });
  for (const shift of shifts.slice(1)) for (const study of studies) L.push({ rec: p("REC_MID"), study, shift, screen: M, tier: "trong_dung_sai" });
  for (const shift of shifts) for (const study of studies) L.push({ rec: p("REC_FLOOR"), study, shift, screen: M, tier: "trong_dung_sai" });
  // ngoài dung sai: cần bố mẹ chọn
  for (let study = Math.max(0, T - p("SOFT") - 15); study >= 0; study -= 15) for (const shift of shifts) L.push({ rec: p("REC_MID"), study, shift, screen: M, tier: "can_bo_me_chon" });
  return L;
}

function scheduleWeek(prof: any): any {
  const budget = prof.budget || defaultBudget(prof.grade, prof.age);
  const A = weekAnchors(prof, budget);
  const plan = { tong_quan: null, ngay: {}, ngoai_le: {}, giai_doan: prof.phase ? Object.assign({ trang_thai: "dang_ap_dung" }, prof.phase) : null };
  const days = {}, tradeoffs = [], notes = [...A.notes], questions = [];
  for (let i = 0; i < 7; i++) {
    const d = DAYS[i], nd = DAYS[(i + 1) % 7], c = col(d), T = budget[c].hoc_nha, M = budget[c].man_hinh;
    const floor = Math.max(A.need, A.tgt[d] - p("SOFT"));
    const sleepOk = sh => (A.wake[nd] + 1440 - (A.bed[d] + sh)) >= floor;
    let chosen = null, first = null, attempts = 0;
    let excluded = new Set();
    for (const prm of ladder(T, M, sleepOk)) {
      attempts++;
      const prof2 = Object.assign({}, prof, { activities: (prof.activities || []).filter(a => !excluded.has(a.id + d)) });
      const r = buildDay(prof2, d, A, prm);
      if (!first) first = r;
      if (!r.fails.length) { chosen = { r, prm }; break; }
    }
    // khớp quỹ sinh_hoat (D4): bớt đều các khối bữa ở nhà + vệ sinh, bước 5′
    if (chosen) {
      for (let k = 0; k < 4; k++) {
        const sh = chosen.r.blocks.filter(b => b.nhom === "sinh_hoat").reduce((n, b) => n + b.e - b.s, 0);
        const over = sh - (budget[c].sinh_hoat + p("SOFT")); if (over <= 0) break;
        const n = chosen.r.blocks.filter(b => /(ăn sáng|ăn trưa|ăn tối|vệ sinh buổi tối)/i.test(b.khoi)).length || 1;
        const prm2 = Object.assign({}, chosen.prm, { cut: (chosen.prm.cut || 0) + Math.ceil(over / n / 5) * 5 });
        const prof2 = Object.assign({}, prof, { activities: (prof.activities || []).filter(a => !excluded.has(a.id + d)) });
        const r2 = buildDay(prof2, d, A, prm2); if (r2.fails.length) break;
        chosen = { r: r2, prm: prm2 };
      }
      if (chosen.prm.cut) notes.push({ rule: "D4", t: d + ": mỗi khối bữa ở nhà và vệ sinh tối bớt " + chosen.prm.cut + "′ để khớp quỹ sinh_hoat " + budget[c].sinh_hoat + "′ (±30′)." });
    }
    if (!chosen) {
      // còn lỗi kể cả khi học ở nhà = 0: là xung đột cố định → loại hoạt động gây xung đột ra, BÁO đánh đổi, xếp phần còn lại
      const bad = (first.fails || []).filter(f => f.act);
      bad.forEach(f => {
        excluded.add(f.act.id + d);
        tradeoffs.push({ day: d, act_id: f.act.id, kind: f.k, rule: f.k === "sport_bed" ? "C5" : "C1/D4",
          t: "\"" + f.act.ten + "\" kết thúc " + f.act.ket_thuc + ", sát hoặc sau giờ tắt đèn " + hhmm(A.bed[d]) + " (lùi tối đa 30′ vẫn không đủ" + (f.k === "sport_bed" ? " 60′ sau tập mạnh" : " giờ ngủ") + ").",
          options: ["Dời \"" + f.act.ten + "\" sớm hơn hoặc sang ngày khác", "Bỏ buổi này (bố mẹ chọn)", "Không có phương án cắt giờ ngủ dưới " + Math.round(A.need / 60) + " giờ (C1, không nới)"] });
      });
      for (const prm of ladder(T, M, sleepOk)) {
        attempts++;
        const prof2 = Object.assign({}, prof, { activities: (prof.activities || []).filter(a => !excluded.has(a.id + d)) });
        const r = buildDay(prof2, d, A, prm);
        if (!r.fails.length) { chosen = { r, prm }; break; }
      }
    }
    let status;
    if (!chosen) {
      // Spec C: không xếp phương án phạm sàn. Tìm phương án cân bằng bằng cách bỏ thử TỪNG hoạt động của ngày;
      // lịch hiển thị là phương án đầu tiên, ghi rõ "chờ bố mẹ chọn"; hoạt động bị bỏ được BÁO trong tradeoffs.
      status = "XUNG_DOT";
      const acts = (prof.activities || []).filter(a => a.thu.includes(d) && !excluded.has(a.id + d));
      const alts = [];
      for (const a of acts) {
        const ex2 = new Set([...excluded, a.id + d]);
        const prof2 = Object.assign({}, prof, { activities: (prof.activities || []).filter(x => !ex2.has(x.id + d)) });
        for (const prm of ladder(T, M, sleepOk)) { attempts++; const r = buildDay(prof2, d, A, prm); if (!r.fails.length) { alts.push({ a, r, prm }); break; } }
      }
      tradeoffs.push({ day: d, kind: "khong_xep_duoc", rule: "C/A1", t: "Với mọi hoạt động đã đăng ký, ngày này không giữ được đủ: phục hồi ≥15′ sau giờ học, ăn tối, vệ sinh và giờ ngủ ≥ " + Math.round(A.need / 60) + " giờ.",
        options: alts.length ? alts.map(x => "Bỏ hoặc dời \"" + x.a.ten + "\" ngày " + d + " (học ở nhà còn " + x.prm.study + "′)") : ["Bố mẹ xem lại toàn bộ hoạt động ngày " + d], act_id: alts.length ? alts[0].a.id : undefined });
      if (alts.length) {
        const x = alts[0]; x.r.tradeoffs.forEach(t => tradeoffs.push(t));
        plan.ngay[d] = toOut(x.r.blocks).map(b => Object.assign(b, { ghi_chu: (b.ghi_chu ? b.ghi_chu + " " : "") })); 
        plan.ngay[d].unshift({ bat_dau: hhmm(A.wake[d]), ket_thuc: hhmm(A.wake[d]), khoi: "Phương án đề xuất, chờ bố mẹ chọn", viec: [], xac_nhan: "Bố mẹ xác nhận", tai: "thap", nhom: "sinh_hoat", the_thao: false, man_hinh: false, trang_thai: "binh_thuong", ghi_chu: "Chưa xếp \"" + x.a.ten + "\": xem đánh đổi." });
        plan.ngay[d].sort((a, b) => a.bat_dau.localeCompare(b.bat_dau));
        days[d] = { status, attempts, params: x.prm, proposal: true };
      } else { plan.ngay[d] = []; days[d] = { status, attempts, fails: first.fails }; }
      continue;
    }
    const { r, prm } = chosen;
    r.tradeoffs.forEach(t => tradeoffs.push(t));
    r.notes.forEach(n => notes.push(n));
    const hasConflict = tradeoffs.some(t => t.day === d);
    status = hasConflict ? "CAN_BO_ME_CHON" : prm.tier === "can_bo_me_chon" ? "CAN_BO_ME_CHON" : (prm.study === T && prm.rec === p("REC_DEFAULT") && prm.shift === 0 ? "OK" : "DIEU_CHINH_TRONG_DUNG_SAI");
    if (prm.tier === "can_bo_me_chon") tradeoffs.push({ day: d, kind: "giam_hoc_nha", rule: "D4/A1", t: "Học ở nhà chỉ xếp được " + prm.study + "′ (quỹ " + T + "′, dung sai ±30′) mà vẫn giữ ngủ, phục hồi, bữa ăn.", options: ["Đồng ý giảm học ở nhà ngày này còn " + prm.study + "′", "Bớt hoặc dời một hoạt động ngoài giờ", "Chuyển phần học sang cuối tuần (bố mẹ chọn)"] });
    if (prm.study < T && prm.tier !== "can_bo_me_chon") notes.push({ rule: "D4", t: d + ": học ở nhà " + prm.study + "′ (quỹ " + T + "′, trong ±30′)." });
    if (prm.shift) notes.push({ rule: "G7/D4", t: d + ": giờ tắt đèn lùi " + prm.shift + "′." });
    if (prm.rec < p("REC_DEFAULT")) notes.push({ rule: "C2", t: d + ": phục hồi " + prm.rec + "′." });
    if ((prof.activities || []).some(a => a.thu.includes(d) && toMin(a.ket_thuc) > toMin(prof.meals.dinner))) {
      // B-2 (mặc định fail-safe có nhãn): theo spec G7 (nguồn chuẩn), KHÔNG tự bỏ ôn bài như prompt bản thử; giữ quỹ, chỉ giảm khi
      // không vừa (thang sửa), và tạo MỘT câu hỏi cho bố mẹ (A2: hỏi một lần), hai phương án tính sẵn. Không sửa spec gốc.
      notes.push({ rule: "G7", t: d + ": có học thêm tối, cần hỏi bố mẹ có muốn bớt học ở nhà không." });
      if (prm.study > 0) questions.push({ day: d, kind: "g7_bot_hoc_nha", rule: "G7/B-2", default: "giu_quy", study_now: prm.study,
        options: ["Giữ " + prm.study + "′ học ở nhà ngày " + d, "Bớt phần học theo định hướng bố mẹ ngày " + d + " (giữ bài cô giao)"] });
    }
    plan.ngay[d] = toOut(r.blocks);
    days[d] = { status, attempts, params: prm };
  }
  plan.tong_quan = { muc_tieu: [], nguyen_tac: ["Ngủ đủ trước, học sau", "Về nhà nghỉ trước khi học", "Học chia phiên ngắn có nghỉ"], gio_ngu: DAYS.map(d => d + " " + hhmm(A.bed[d] + (days[d].params ? days[d].params.shift : 0))).join(", "), ghi_chu: "Lịch do bộ xếp tất định E1 tạo (spike)." };
  return { plan, budget, anchors: A, days, tradeoffs, notes, questions };
}

function toOut(B: any[]) {
  return B.map(b => {
    const o = { bat_dau: hhmm(b.s), ket_thuc: hhmm(b.e), khoi: b.khoi, viec: b.viec, xac_nhan: b.xac_nhan, tai: b.tai, nhom: b.nhom, the_thao: b.the_thao, man_hinh: b.man_hinh, trang_thai: b.trang_thai, ghi_chu: b.ghi_chu };
    if (b.act_id) { o.act_id = b.act_id; o.act_start = b.act_start; o.act_end = b.act_end; }
    return o;
  });
}

export { scheduleWeek, defaultBudget, PARAMS, PARAM_STATUS, hhmm };
