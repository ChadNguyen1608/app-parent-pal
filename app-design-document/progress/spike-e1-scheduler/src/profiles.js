// 8 hồ sơ tổng hợp (không có dữ liệu thật). Giờ ăn ở nhà, giờ dậy mong muốn là INPUT của gia đình, không phải quy tắc.
// người soạn: AI, chưa kiểm chứng độc lập.
const wd = (o, days = ["T2", "T3", "T4", "T5", "T6"]) => Object.fromEntries(["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map(d => [d, days.includes(d) ? Object.assign({}, o) : null]));

module.exports = [
  { id: "P1", label: "Lớp 1, bán trú, quỹ mặc định", grade: 1, age: 6, twoSessions: true,
    school: wd({ start: "07:30", end: "16:30", lunch: "10:45", pmStart: "13:30", snack: "14:30", snackDur: 15 }), commute: 15,
    activities: [], budget: null, sleep: { wake: "06:15" }, meals: { dinner: "18:30", lunch: "11:15" } },

  { id: "P2", label: "Lớp 3, bán trú, 3 lớp ngoài giờ", grade: 3, age: 8, twoSessions: true,
    school: wd({ start: "07:30", end: "16:30", lunch: "11:00", pmStart: "13:30", snack: "14:45", snackDur: 15 }), commute: 15,
    activities: [
      { id: "a1", ten: "Tiếng Anh", loai: "hoc_them", thu: ["T2", "T4"], bat_dau: "17:30", ket_thuc: "19:00", di_lai: 30 },
      { id: "a2", ten: "Bơi (CLB có HLV)", loai: "the_thao", thu: ["T3"], bat_dau: "17:30", ket_thuc: "18:30", di_lai: 20 },
      { id: "a3", ten: "Piano", loai: "nang_khieu", thu: ["T7"], bat_dau: "08:30", ket_thuc: "09:30", di_lai: 20 }],
    budget: null, sleep: { wake: "06:15" }, meals: { dinner: "18:30", lunch: "11:15" } },

  { id: "P3", label: "Lớp 5, bán trú cả ngày, quỹ bố mẹ đặt (đã duyệt)", grade: 5, age: 10, twoSessions: true, familyBarApproved: true,
    school: wd({ start: "07:15", end: "17:00", lunch: "11:00", pmStart: "13:30", snack: "15:00", snackDur: 15 }), commute: 20,
    activities: [],
    budget: { wd: { hoc_nha: 60, sinh_hoat: 120, ngu: 570, man_hinh: 30 }, we: { hoc_nha: 60, sinh_hoat: 120, ngu: 600, man_hinh: 60 } },
    sleep: { wake: "06:00" }, meals: { dinner: "18:45", lunch: "11:15" } },

  { id: "P4", label: "Lớp 6, học 1 buổi sáng, ăn trưa ở nhà, 2 hoạt động", grade: 6, age: 11,
    school: wd({ start: "07:00", end: "11:30" }), commute: 15,
    activities: [
      { id: "b1", ten: "Toán (trung tâm)", loai: "hoc_them", thu: ["T3", "T5"], bat_dau: "18:00", ket_thuc: "19:30", di_lai: 30 },
      { id: "b2", ten: "Bóng đá (CLB có HLV)", loai: "the_thao", thu: ["T6"], bat_dau: "17:00", ket_thuc: "18:30", di_lai: 20 }],
    budget: { wd: { hoc_nha: 60, sinh_hoat: 135, ngu: 570, man_hinh: 60 }, we: { hoc_nha: 60, sinh_hoat: 135, ngu: 600, man_hinh: 120 } },
    sleep: { wake: "06:00" }, meals: { dinner: "18:30", lunch: "11:30" } },

  { id: "P5", label: "Lớp 8, mùa thi, học cả sáng T7, giai đoạn tạm thời", grade: 8, age: 13,
    school: wd({ start: "07:00", end: "11:30" }, ["T2", "T3", "T4", "T5", "T6", "T7"]), commute: 15,
    activities: [{ id: "c1", ten: "Văn (gia sư)", loai: "hoc_them", thu: ["T2", "T4"], bat_dau: "19:30", ket_thuc: "21:00", di_lai: 0 }],
    budget: { wd: { hoc_nha: 150, sinh_hoat: 135, ngu: 510, man_hinh: 30 }, we: { hoc_nha: 180, sinh_hoat: 135, ngu: 540, man_hinh: 60 } },
    sleep: { wake: "06:00" }, meals: { dinner: "18:30", lunch: "12:00" },
    phase: { ten: "Ôn thi học kỳ I", purpose: "on_thi", scope: "child:P5", nguon: "bo_me", tu_ngay: "2026-11-30", den_ngay: "2027-01-10", noi_long: ["tong_gio_hoc", "man_hinh"] },
    phaseHistory: [{ ten: "Ôn thi giữa kỳ", purpose: "on_thi", scope: "child:P5", tu_ngay: "2026-10-20", den_ngay: "2026-11-25", noi_long: ["tong_gio_hoc"] }],
    phaseExtraTests: [
      { label: "Đổi mục đích để nối dài (thi đấu) sát sau ôn thi", ph: { purpose: "thi_dau", scope: "child:P5", nguon: "bo_me", tu_ngay: "2026-11-26", den_ngay: "2027-01-10", noi_long: ["tong_gio_hoc"] } },
      { label: "Con đề xuất khi PARENT_LED (v2)", ph: { mode: "PARENT_LED", purpose: "on_thi", scope: "child:P5", nguon: "con_de_xuat", tu_ngay: "2026-12-04", den_ngay: "2026-12-20", noi_long: ["man_hinh"] } },
      { label: "Giai đoạn 61 ngày (v2, D-09)", ph: { purpose: "thi_dau", scope: "child:P5", nguon: "bo_me", tu_ngay: "2027-02-01", den_ngay: "2027-04-02", noi_long: [] } },
      { label: "Xin nới giờ ngủ", ph: { purpose: "on_thi", scope: "child:P5", nguon: "bo_me", tu_ngay: "2026-12-05", den_ngay: "2026-12-20", noi_long: ["ngu"] } },
      { label: "Con đề xuất (CHILD_EXECUTED), bắt đầu sau 8 ngày trống", ph: { mode: "CHILD_EXECUTED", purpose: "on_thi", scope: "child:P5", nguon: "con_de_xuat", tu_ngay: "2026-12-04", den_ngay: "2026-12-20", noi_long: ["man_hinh"] } }] },

  { id: "P6", label: "Lớp 4, quá tải (không khả thi)", grade: 4, age: 9, twoSessions: true,
    school: wd({ start: "07:30", end: "17:00", lunch: "11:00", pmStart: "13:30", snack: "15:00", snackDur: 15 }), commute: 15,
    activities: [
      { id: "d1", ten: "Tiếng Anh", loai: "hoc_them", thu: ["T2", "T3", "T4", "T5", "T6"], bat_dau: "17:45", ket_thuc: "19:45", di_lai: 30 },
      { id: "d2", ten: "Karate", loai: "the_thao", thu: ["T2", "T4"], bat_dau: "20:00", ket_thuc: "21:00", di_lai: 20 },
      { id: "d3", ten: "Toán tư duy", loai: "hoc_them", thu: ["T7", "CN"], bat_dau: "08:00", ket_thuc: "11:00", di_lai: 30 },
      { id: "d4", ten: "Vẽ", loai: "nang_khieu", thu: ["T7"], bat_dau: "10:30", ket_thuc: "12:00", di_lai: 20 }],
    budget: { wd: { hoc_nha: 90, sinh_hoat: 105, ngu: 570, man_hinh: 30 }, we: { hoc_nha: 120, sinh_hoat: 120, ngu: 600, man_hinh: 60 } },
    sleep: { wake: "06:15" }, meals: { dinner: "18:30", lunch: "11:15" } },

  { id: "P7", label: "Lớp 4, cuối tuần dày hoạt động", grade: 4, age: 9, twoSessions: true,
    school: wd({ start: "07:30", end: "16:30", lunch: "11:00", pmStart: "13:30", snack: "14:30", snackDur: 15 }), commute: 15,
    activities: [
      { id: "e1", ten: "Piano", loai: "nang_khieu", thu: ["T7"], bat_dau: "08:00", ket_thuc: "09:30", di_lai: 20 },
      { id: "e2", ten: "Vẽ", loai: "nang_khieu", thu: ["T7"], bat_dau: "10:00", ket_thuc: "11:00", di_lai: 20 },
      { id: "e3", ten: "Bơi (CLB có HLV)", loai: "the_thao", thu: ["T7"], bat_dau: "15:00", ket_thuc: "16:30", di_lai: 20 },
      { id: "e4", ten: "Tiếng Anh", loai: "hoc_them", thu: ["CN"], bat_dau: "08:00", ket_thuc: "10:00", di_lai: 20 },
      { id: "e5", ten: "Toán tư duy", loai: "hoc_them", thu: ["CN"], bat_dau: "14:00", ket_thuc: "16:00", di_lai: 20 },
      { id: "e6", ten: "Cờ vua", loai: "nang_khieu", thu: ["CN"], bat_dau: "16:30", ket_thuc: "17:30", di_lai: 0 }],
    budget: null, sleep: { wake: "06:15" }, meals: { dinner: "18:30", lunch: "11:30" } },

  { id: "P8", label: "Lớp 7, đi lại 60′ mỗi chiều, bán trú", grade: 7, age: 12,
    school: wd({ start: "07:00", end: "16:30", lunch: "11:00", pmStart: "13:30" }), commute: 60,
    activities: [],
    budget: null, sleep: { wake: "06:00" }, meals: { dinner: "18:45", lunch: "11:30" } },
];
