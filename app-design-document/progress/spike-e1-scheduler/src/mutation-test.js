// Kiểm tra bộ validator không "đạt rỗng": làm hỏng có chủ đích một lịch hợp lệ, mỗi lỗi phải bị bắt.
const { scheduleWeek } = require("./scheduler");
const V = require("./validators");
const prof = require("./profiles").find(p => p.id === "P3");
const base = scheduleWeek(prof);
const clone = () => JSON.parse(JSON.stringify(base.plan));
const tm = t => +t.slice(0, 2) * 60 + +t.slice(3);
const put = (p, ...bs) => { for (const b of bs) { p.ngay.T2 = p.ngay.T2.filter(x => x.bat_dau === x.ket_thuc || tm(x.ket_thuc) <= tm(b.bat_dau) || tm(x.bat_dau) >= tm(b.ket_thuc)); p.ngay.T2.push(Object.assign({ viec: [] }, b)); } };
const run = (plan, d) => { const ctx = V.makeCtx({ plan, age: prof.age, grade: prof.grade, budget: base.budget, activities: prof.activities }); return [...V.checkDayK(ctx, d).map(w => w.k), ...V.extraChecks(ctx, d, { tradeoffs: [] }).map(w => w.k)]; };
const M = [
  ["bỏ khối phục hồi → phuc_hoi", "phuc_hoi", p => { p.ngay.T2 = p.ngay.T2.filter(b => !/phục hồi/.test(b.khoi) && !/^Chơi tự do/.test(b.khoi) && !/Nghỉ ngắn/.test(b.khoi)); }],
  ["học trước giờ đi học → truoc_gio_hoc", "truoc_gio_hoc", p => { put(p, { bat_dau: "06:20", ket_thuc: "06:40", khoi: "Ôn bài sáng", viec: [], tai: "vua", nhom: "hoc_nha" }); }],
  ["hai khối cao liền → cao_lien", "cao_lien", p => { put(p, { bat_dau: "19:00", ket_thuc: "19:30", khoi: "Ôn bài khó", tai: "cao", nhom: "hoc_nha" }, { bat_dau: "19:30", ket_thuc: "19:50", khoi: "Làm đề toán", tai: "cao", nhom: "hoc_nha" }); }],
  ["tắt đèn muộn → ngu", "ngu", p => { p.ngay.T2.find(b => /Tắt đèn/.test(b.khoi)).bat_dau = "23:00"; }],
  ["bỏ bữa phụ ở trường → an_xa", "an_xa", p => { p.ngay.T2 = p.ngay.T2.filter(b => !/Bữa phụ|Ăn nhẹ/.test(b.khoi)); }],
  ["học vượt quỹ → tong_gio_hoc", "tong_gio_hoc", p => { put(p, { bat_dau: "19:00", ket_thuc: "20:00", khoi: "Ôn bài thêm", tai: "vua", nhom: "hoc_nha" }); }],
  ["tập mạnh sát giờ ngủ → tap_muon", "tap_muon", p => { put(p, { bat_dau: "19:10", ket_thuc: "19:50", khoi: "Tập bóng", tai: "cao", nhom: "hoc_them" }); }],
  ["tập mạnh KẾT THÚC SAU giờ tắt đèn → tap_muon (giới hạn của checkDayK)", "tap_muon", p => { p.ngay.T2.find(b => /Tắt đèn/.test(b.khoi)).bat_dau = "19:30"; put(p, { bat_dau: "19:10", ket_thuc: "19:50", khoi: "Tập bóng", tai: "cao", nhom: "hoc_them" }); }],
  ["màn hình sát giờ ngủ → x_man_hinh_ngu", "x_man_hinh_ngu", p => { put(p, { bat_dau: "19:30", ket_thuc: "19:50", khoi: "Xem tivi", tai: "thap", man_hinh: true }); }],
  ["phiên học quá dài → x_phien", "x_phien", p => { put(p, { bat_dau: "19:00", ket_thuc: "20:00", khoi: "Ôn bài dài", tai: "vua", nhom: "hoc_nha" }); }],
  ["bỏ ăn tối → x_bo_bua", "x_bo_bua", p => { p.ngay.T2 = p.ngay.T2.filter(b => !/Ăn tối/.test(b.khoi)); }],
];
let ok = 0;
for (const [name, key, f] of M) { const p = clone(); f(p); const ks = run(p, "T2"); const hit = ks.includes(key); ok += hit; console.log((hit ? "BẮT ĐƯỢC " : "BỎ LỌT   ") + name + "  " + JSON.stringify([...new Set(ks)])); }
console.log("baseline T2:", JSON.stringify(run(base.plan, "T2")), "| bắt được", ok + "/" + M.length);
