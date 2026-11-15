// 32 test TC-* của spike v2 (test-rules-v2.js) chuyển nguyên sang node:test (T0.3).
// Hồ sơ đều là dữ liệu giả lập. người soạn: AI, chưa kiểm chứng độc lập.
import { test } from "node:test";
import assert from "node:assert/strict";
import { scheduleWeek, PARAMS, PARAM_STATUS } from "../src/scheduler.ts";
import * as V from "../src/validators.ts";
import * as PH from "../src/phase.ts";
import * as FT from "../src/fatigue.ts";
import { PROFILES } from "../src/profiles.ts";
const base = PROFILES.find(p => p.id === "P1");
const withBudget = (b: any) => Object.assign({}, base, { id: "PX", budget: b });
const B0 = { wd: { hoc_nha: 10, sinh_hoat: 105, ngu: 570, man_hinh: 30 }, we: { hoc_nha: 10, sinh_hoat: 120, ngu: 600, man_hinh: 60 } };
const mk = (o: any) => JSON.parse(JSON.stringify(Object.assign({}, B0, o)));
const ctxOf = (prof: any, res: any) => V.makeCtx({ plan: res.plan, age: prof.age, grade: prof.grade, budget: res.budget, activities: prof.activities });

// ---------- D-02 ----------
test("TC-D02-1 Ô Ngủ đỏ không có nút Giữ mức này; confirmKeep từ chối", () => {
  const prof = withBudget(mk({ wd: { ...B0.wd, ngu: 480 } })); const res = scheduleWeek(prof); const bd = V.budgetBoard(ctxOf(prof, res));
  assert.equal(bd.wd.ngu.color, "do"); assert.equal(bd.wd.ngu.giu_muc, false); assert.equal(bd.wd.ngu.duoi_san, true);
  const r = V.confirmKeep(bd, "wd", "ngu"); assert.equal(r.ok, false); assert.equal(r.rule, "D-02/C1");
});
test("TC-D02-2 Ô khác đỏ (màn hình 150′) vẫn có nút và xác nhận được (D6)", () => {
  const prof = withBudget(mk({ wd: { ...B0.wd, man_hinh: 150 } })); const res = scheduleWeek(prof); const bd = V.budgetBoard(ctxOf(prof, res));
  assert.equal(bd.wd.man_hinh.color, "do"); assert.equal(bd.wd.man_hinh.giu_muc, true); assert.equal(V.confirmKeep(bd, "wd", "man_hinh").ok, true);
});
test("TC-D02-3 Ô Ngủ cam (thiếu ≤30′) cũng không giữ được; bộ xếp dùng sàn C1", () => {
  const prof = withBudget(mk({ wd: { ...B0.wd, ngu: 520 } })); const res = scheduleWeek(prof); const bd = V.budgetBoard(ctxOf(prof, res));
  assert.equal(bd.wd.ngu.color, "cam"); assert.equal(bd.wd.ngu.giu_muc, false);
  assert.ok(res.notes.some(n => n.rule === "C1/D-02"));
});
test("TC-D02-4 Quỹ ngủ dưới sàn: mọi đêm trong lịch vẫn ≥ sàn theo tuổi", () => {
  const prof = withBudget(mk({ wd: { ...B0.wd, ngu: 480 }, we: { ...B0.we, ngu: 480 } })); const res = scheduleWeek(prof); const ctx = ctxOf(prof, res);
  for (const d of V.DAYS) { const a = V.actualDay(ctx, d); assert.ok(a.ngu >= V.sleepNeed(prof.age), d + " ngủ " + a.ngu); }
});
test("TC-D02-5 keepAllowed: chỉ ô đỏ, không bao giờ ô Ngủ", () => {
  assert.equal(V.keepAllowed("ngu", "do"), false); assert.equal(V.keepAllowed("sinh_hoat", "do"), true); assert.equal(V.keepAllowed("sinh_hoat", "cam"), false);
});

// ---------- D-08 ----------
test("TC-D08-1 Mọi thông số có nhãn mac_dinh_chua_kiem_chung, mã PR-xx duy nhất, quyết định D-08", () => {
  const ks = Object.keys(PARAMS); assert.ok(ks.length >= 20);
  ks.forEach(k => { assert.equal(PARAMS[k].status, "mac_dinh_chua_kiem_chung", k); assert.equal(PARAMS[k].quyet_dinh, "D-08"); assert.match(PARAMS[k].id, /^PR-\d\d$/); });
  assert.equal(new Set(ks.map(k => PARAMS[k].id)).size, ks.length); assert.equal(PARAM_STATUS, "mac_dinh_chua_kiem_chung");
});

// ---------- D-09 ----------
const P = (tu: string, den: string, o: any = {}) => Object.assign({ purpose: "on_thi", scope: "child:X", nguon: "bo_me", tu_ngay: tu, den_ngay: den, noi_long: ["tong_gio_hoc"] }, o);
test("TC-D09-1 60 ngày (cả hai đầu) được nhận", () => { assert.equal(PH.validatePhase(P("2027-01-01", "2027-03-01")).status, "OK"); });
test("TC-D09-2 61 ngày bị từ chối, nêu ngày kết thúc muộn nhất", () => {
  const r = PH.validatePhase(P("2027-01-01", "2027-03-02")); assert.equal(r.status, "TU_CHOI");
  const f = r.findings.find(x => x.rule === "D-09"); assert.ok(f && /2027-03-01/.test(f.t));
});
test("TC-D09-3 61 ngày không nới gì vẫn bị từ chối (trần áp cho giai đoạn, không chỉ cho constraint)", () => {
  assert.equal(PH.validatePhase(P("2027-01-01", "2027-03-02", { noi_long: [] })).status, "TU_CHOI");
});
test("TC-D09-4 J2: 43 ngày có mốc xem lại mỗi 14 ngày; 42 ngày không có", () => {
  assert.deepEqual(PH.validatePhase(P("2027-01-01", "2027-02-12")).reviews, ["2027-01-15", "2027-01-29"]);
  assert.equal(PH.validatePhase(P("2027-01-01", "2027-02-11")).reviews.length, 0);
});
const store0: any = { profiles: { base: { id: "base", version: 3 } }, active: "base", phases: [], lock: false };
test("TC-D09-5 Áp dụng: lưu hồ sơ trước, chuyển sang hồ sơ giai đoạn", () => {
  const s = PH.submitPhase(store0, P("2027-01-01", "2027-01-30", { id: "g1" }), [], "2027-01-01");
  assert.equal(s.active, "giai_doan:g1"); assert.equal(s.phases[0].trang_thai, "DANG_AP_DUNG"); assert.equal(s.phases[0].ho_so_truoc, "base");
  assert.equal(store0.active, "base", "hàm thuần, không sửa store cũ");
});
test("TC-D09-6 Ngày cuối vẫn áp; ngày sau ngày cuối TỰ về hồ sơ trước và phát sự kiện", () => {
  let s = PH.submitPhase(store0, P("2027-01-01", "2027-01-30", { id: "g1" }), [], "2027-01-01");
  let r = PH.tickPhases(s, "2027-01-30"); assert.equal(r.store.active, "giai_doan:g1"); assert.equal(r.events.length, 0);
  r = PH.tickPhases(s, "2027-01-31"); assert.equal(r.store.active, "base"); assert.equal(r.store.phases[0].trang_thai, "HET_HAN");
  assert.equal(r.events[0].kind, "het_han_tu_ve_ho_so_truoc");
});
test("TC-D09-7 Mở app trễ nhiều ngày sau hạn: vẫn về hồ sơ trước (không kẹt ở giai đoạn)", () => {
  const s = PH.submitPhase(store0, P("2027-01-01", "2027-01-30", { id: "g1" }), [], "2027-01-01");
  assert.equal(PH.tickPhases(s, "2027-03-15").store.active, "base");
});
test("TC-D09-8 Kết thúc sớm: về hồ sơ trước", () => {
  const s = PH.submitPhase(store0, P("2027-01-01", "2027-01-30", { id: "g1" }), [], "2027-01-01");
  const e = PH.endPhaseEarly(s, "g1", "2027-01-10"); assert.equal(e.active, "base"); assert.equal(e.phases[0].trang_thai, "KET_THUC_SOM");
});
test("TC-D09-9 Con đề xuất ở CHILD_EXECUTED: chờ xác nhận, chưa áp, chưa lưu hồ sơ trước; bố mẹ xác nhận thì áp", () => {
  let s = PH.submitPhase(store0, P("2027-01-01", "2027-01-30", { id: "g2", nguon: "con_de_xuat", mode: "CHILD_EXECUTED" }), [], "2026-12-28");
  assert.equal(s.active, "base"); assert.equal(s.phases[0].trang_thai, "CHO_BO_ME_XAC_NHAN"); assert.equal(s.phases[0].ho_so_truoc, undefined);
  s = PH.activatePhase(s, "g2", [], "2027-01-01"); assert.equal(s.active, "giai_doan:g2");
});
test("TC-D09-10 Con đề xuất ở PARENT_LED hoặc thiếu mode (UNSET): thành mong muốn, không có trạng thái duyệt", () => {
  for (const mode of ["PARENT_LED", "UNSET", undefined]) {
    const s = PH.submitPhase(store0, P("2027-01-01", "2027-01-30", { nguon: "con_de_xuat", mode }), [], "2026-12-28");
    assert.equal(s.phases[0].trang_thai, "MONG_MUON", String(mode)); assert.equal(s.active, "base");
  }
});
test("TC-D09-11 Đề xuất của con quá ngày kết thúc mà chưa xác nhận: hủy", () => {
  const s = PH.submitPhase(store0, P("2027-01-01", "2027-01-30", { id: "g3", nguon: "con_de_xuat", mode: "CHILD_DIRECTED" }), [], "2026-12-28");
  assert.equal(PH.tickPhases(s, "2027-01-31").store.phases[0].trang_thai, "HUY");
});
test("TC-D09-12 Lịch đang khóa: không áp (chờ mở khóa)", () => {
  const s = PH.submitPhase(Object.assign({}, store0, { lock: true }), P("2027-01-01", "2027-01-30", { id: "g4" }), [], "2027-01-01");
  assert.equal(s.active, "base"); assert.equal(s.phases[0].trang_thai, "CHO_MO_KHOA");
});
test("TC-D09-13 Nới sàn protected (ngủ) bị từ chối dù trong 60 ngày (J4, OD-02)", () => {
  assert.equal(PH.validatePhase(P("2027-01-01", "2027-01-10", { noi_long: ["ngu"] })).status, "TU_CHOI");
});
test("TC-D09-14 Mốc xem lại phát sự kiện đúng ngày", () => {
  const s = PH.submitPhase(store0, P("2027-01-01", "2027-02-20", { id: "g5" }), [], "2027-01-01");
  assert.equal(PH.tickPhases(s, "2027-01-15").events[0].kind, "moc_xem_lai");
});

// ---------- D-10 / OD-A7 / D-03 ----------
test("TC-D10-1 Rất mệt: schedule_changed=false ở mọi chế độ; bản ghi thuộc F04-G05-M01", () => {
  for (const mode of ["UNSET", "PARENT_LED", "CHILD_EXECUTED", "CHILD_DIRECTED"]) {
    const r = FT.onCheckin({ choice: "rat_met", mode, date: "2027-01-05", day: "T3" });
    assert.equal(r.schedule_changed, false); assert.equal(r.record.module, "F04-G05-M01"); assert.equal(r.record.schedule_changed, false);
  }
});
test("TC-D10-2 Đường đổi lịch theo chế độ", () => {
  const p = (m: any) => FT.onCheckin({ choice: "rat_met", mode: m, date: "2027-01-05", day: "T3" }).child_actions[0].action;
  assert.equal(p("UNSET"), "MONG_MUON"); assert.equal(p("PARENT_LED"), "MONG_MUON"); assert.equal(p(undefined), "MONG_MUON");
  assert.equal(p("CHILD_EXECUTED"), "CR"); assert.equal(p("CHILD_DIRECTED"), "SUA_TRONG_PHAM_VI_HOAC_CR"); assert.equal(p("LA"), "TU_CHOI");
  assert.equal(FT.onCheckin({ choice: "rat_met", mode: "CHILD_DIRECTED", locked: true, date: "2027-01-05", day: "T3" }).child_actions[0].action, "CR_KHI_KHOA");
});
test("TC-D10-3 PARENT_LED không tạo CR (cr=false)", () => {
  assert.equal(FT.onCheckin({ choice: "rat_met", mode: "PARENT_LED", date: "2027-01-05", day: "T3" }).child_actions[0].cr, false);
});
test("TC-D10-4 Lời cho con không hứa đổi lịch; có báo con rằng bố mẹ thấy xu hướng (D-03)", () => {
  const r = FT.onCheckin({ choice: "rat_met", mode: "PARENT_LED", date: "2027-01-05", day: "T3" });
  assert.doesNotMatch(r.child_message, /chỉ làm phần cô giao|nghỉ thêm|bỏ phần học/i); assert.match(r.child_message, /chưa đổi/); assert.ok(r.child_notice);
});
test("TC-D10-5 Không khối nào trong lịch của 8 hồ sơ còn hứa tự bỏ học khi Rất mệt", () => {
  for (const prof of PROFILES) { const res = scheduleWeek(prof); for (const d of V.DAYS) res.plan.ngay[d].forEach(b => assert.doesNotMatch(b.ghi_chu || "", /bỏ phần học theo định hướng/, prof.id + d)); }
});
test("TC-D10-6 Lịch tuần giống hệt trước và sau khi con báo Rất mệt", () => {
  const before = JSON.stringify(scheduleWeek(base).plan); FT.onCheckin({ choice: "rat_met", mode: "CHILD_DIRECTED", date: "2027-01-05", day: "T3" });
  assert.equal(JSON.stringify(scheduleWeek(base).plan), before);
});
test("TC-D03-1 Xu hướng 14 ngày: ngoài cửa sổ bị loại; ngưỡng chưa chốt → không gửi; không có chữ của con", () => {
  const recs = [{ choice: "rat_met", date: "2027-01-01", day: "T6" }, { choice: "rat_met", date: "2027-01-12", day: "T3" }, { choice: "rat_met", date: "2027-01-14", day: "T5" }, { choice: "on", date: "2027-01-13", day: "T4" }];
  const tr = FT.trend(recs, "2027-01-15", { T3: ["hoc_them_toi"], T5: ["hoc_them_toi"] });
  assert.equal(tr.count, 2); assert.equal(tr.by_schedule_feature.hoc_them_toi, 2); assert.equal(tr.notify_parent, false); assert.equal(tr.status, "NGUONG_CHUA_CHOT");
  assert.ok(!JSON.stringify(tr).includes("text"));
});
test("TC-D10-7 Lựa chọn không hợp lệ bị từ chối", () => { assert.equal(FT.onCheckin({ choice: "buon" }).ok, false); });

// ---------- B-1 / B-2 (mặc định fail-safe) ----------
test("TC-B1-1 Hai phiên học cách 4′ bị bắt (sàn 5′); cách 5′ thì không", () => {
  const prof = PROFILES.find(p => p.id === "P3"); const res = scheduleWeek(prof);
  const mkp = (gap: number) => { const p = JSON.parse(JSON.stringify(res.plan)); p.ngay.T2 = p.ngay.T2.filter(b => !(b.bat_dau >= "19:00" && b.bat_dau < "19:50"));
    p.ngay.T2.push({ bat_dau: "19:00", ket_thuc: "19:20", khoi: "Ôn bài phần 1", viec: [], tai: "vua", nhom: "hoc_nha" }, { bat_dau: "19:" + (20 + gap), ket_thuc: "19:45", khoi: "Ôn bài phần 2", viec: [], tai: "vua", nhom: "hoc_nha" }); return p; };
  const k = (gap: number) => V.extraChecks(V.makeCtx({ plan: mkp(gap), age: prof.age, grade: prof.grade, budget: res.budget, activities: [] }), "T2", { tradeoffs: [] }).map(w => w.k);
  assert.ok(k(4).includes("x_nghi_giua")); assert.ok(!k(5).includes("x_nghi_giua"));
});
test("TC-B1-2 8 hồ sơ: không phiên học nào cách nhau dưới 5′", () => {
  for (const prof of PROFILES) { const res = scheduleWeek(prof); const ctx = ctxOf(prof, res); for (const d of V.DAYS) assert.ok(!V.extraChecks(ctx, d, { tradeoffs: res.tradeoffs }).some(w => w.k === "x_nghi_giua"), prof.id + d); }
});
test("TC-B2-1 Ngày học thêm tối: không tự bỏ học ở nhà; có đúng 1 câu hỏi/ngày, mặc định giu_quy", () => {
  const prof = PROFILES.find(p => p.id === "P4"); const res = scheduleWeek(prof);
  const qs = res.questions.filter(q => q.kind === "g7_bot_hoc_nha"); assert.deepEqual(qs.map(q => q.day), ["T3", "T5"]);
  qs.forEach(q => { assert.equal(q.default, "giu_quy"); assert.ok(q.study_now > 0); });
  assert.ok(res.days.T3.params.study >= prof.budget.wd.hoc_nha - 30, "trong dung sai, không bỏ hẳn");
});
test("TC-DET-1 Tất định: 8 hồ sơ chạy hai lần ra cùng kết quả", () => { for (const prof of PROFILES) assert.equal(JSON.stringify(scheduleWeek(prof).plan), JSON.stringify(scheduleWeek(prof).plan)); });

