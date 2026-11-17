// SINH TỰ ĐỘNG bởi scripts/sync-shared.mjs từ packages/scheduler/src/fatigue.ts. KHÔNG SỬA TAY: sửa ở packages/ rồi chạy lại script.
// v2: hỏi thăm sau giờ học "Ổn / Hơi mệt / Rất mệt" (QT G3, L2) theo quyết định 15/11/2026.
// - OD-A7: tín hiệu mệt thuộc F04-G05 (ghi nhận thực hiện), không phải sửa lịch.
// - D-10: "Rất mệt" KHÔNG tự đổi lịch. Muốn đổi, con đi qua bước đề xuất theo chế độ.
// - D-03: báo bố mẹ XU HƯỚNG mệt liên quan đến lịch, không báo cảm xúc, không chép lời con; con được biết điều này.
// người soạn: AI, chưa kiểm chứng độc lập.
const CHOICES: string[] = ["on", "hoi_met", "rat_met", "bo_qua"];
import { dayNumber as dayN, dayCodeOf, toMin } from "../../domain/src/index.ts";
const TREND_WINDOW_DAYS = 14;   // QT L2 "xu hướng trong 2 tuần" [SP]; cửa sổ của báo cáo tuần cần đối chiếu với app.weekly_report (tuần ISO)

// Đường đổi lịch dành cho con, theo chế độ hiệu lực (B01-MS-OD-02/04, B01-CR-OD-01, B01-CR §2).
function changePath(mode: string | undefined, locked?: boolean): any {
  const m = mode || "UNSET";
  if (m === "UNSET" || m === "PARENT_LED") return { path: "MONG_MUON", cr: false, t: "Gửi mong muốn cho bố mẹ (không phải đề xuất chính thức, không có trạng thái duyệt)." };
  if (locked) return { path: m === "CHILD_DIRECTED" ? "CR_KHI_KHOA" : "CR", cr: true, t: "Lịch đang khóa: đề xuất được lưu để bố mẹ xem, không áp cho tới khi mở khóa." };
  if (m === "CHILD_EXECUTED") return { path: "CR", cr: true, t: "Tạo đề xuất, chờ bố mẹ duyệt." };
  if (m === "CHILD_DIRECTED") return { path: "SUA_TRONG_PHAM_VI_HOAC_CR", cr: "neu_ngoai_pham_vi", t: "Con tự chỉnh trong phạm vi được giao (qua đủ cổng kiểm); ngoài phạm vi thì thành đề xuất." };
  return { path: "TU_CHOI", cr: false, t: "Chế độ không hợp lệ: fail-closed." };
}

// Không bao giờ trả về plan đã sửa: hàm này không nhận quyền ghi lịch.
function onCheckin(input: any): any {
  const { choice, mode, date, day, locked } = input;
  if (!CHOICES.includes(choice)) return { ok: false, err: "lua_chon_khong_hop_le" };
  const record = { module: "F04-G05-M01", kind: "hoi_tham_sau_gio_hoc", choice, date, day, schedule_changed: false, rule: "OD-A7/D-10" };
  const out: any = { ok: true, record, schedule_changed: false, child_message: "Mình đã ghi lại rồi.", child_actions: [] };
  if (choice === "rat_met") {
    const p = changePath(mode, locked);
    out.child_message = "Mình đã ghi lại. Lịch hôm nay chưa đổi. Nếu con muốn đổi, con gửi cho bố mẹ nhé.";
    out.child_actions = [{ action: p.path, label: p.path === "MONG_MUON" ? "Con muốn nói với bố mẹ" : "Đề xuất đổi lịch hôm nay", detail: p.t, cr: p.cr }];
    out.child_notice = "Bố mẹ sẽ thấy con hay mệt vào những ngày nào, không thấy lời con viết."; // D-03: con được biết
  }
  return out;
}

// D-03: xu hướng mệt LIÊN QUAN ĐẾN LỊCH: đếm theo thứ trong tuần và theo đặc điểm lịch của ngày (vd có học thêm tối).
// trend() theo thứ và ngưỡng (BR-133 phần "theo thứ", BR-135) đã bỏ theo D-21, D-37: dùng trendByDayType.

// ---------- D-37 (15/11/2026): xu hướng mệt gộp THEO LOẠI NGÀY, không theo thứ ----------
// Thay BR-133 (phần "theo thứ") và BR-135 (ngưỡng): không có ngưỡng, hiện trong báo cáo tuần từ 1 lần (D-21, D-37).
// Loại ngày = đặc điểm của lịch ngày đó (đọc từ `kind` của khối, B-11), ví dụ "ngày có học thêm buổi tối".
// Báo xu hướng mệt chỉ dùng trendByDayType() (D-21, D-37).
const EVENING_FROM_MIN = 17 * 60; // mặc định chưa kiểm chứng (D-08): hoạt động bắt đầu từ 17:00 tính là buổi tối
const DAY_TYPES = ["hoc_them_toi", "co_the_thao", "co_hoc_them", "khong_di_hoc", "khong_hoat_dong"];

/** Loại ngày của một ngày trong lịch: danh sách thẻ, một ngày có thể mang nhiều thẻ. Chỉ đọc `kind`, `the_thao`, giờ bắt đầu. */
function dayTypesOfBlocks(blocks: any[]): string[] {
  const live = (blocks || []).filter(b => b.trang_thai !== "huy");
  const acts = live.filter(b => b.kind === "hoat_dong");
  const t: string[] = [];
  if (acts.some(b => !b.the_thao && toMin(b.bat_dau) !== null && (toMin(b.bat_dau) as number) >= EVENING_FROM_MIN)) t.push("hoc_them_toi");
  if (acts.some(b => b.the_thao)) t.push("co_the_thao");
  if (acts.some(b => !b.the_thao)) t.push("co_hoc_them");
  if (!live.some(b => b.kind === "truong")) t.push("khong_di_hoc");
  if (!acts.length) t.push("khong_hoat_dong");
  return t;
}
/** Loại ngày của một NGÀY CỤ THỂ (YYYY-MM-DD) theo lịch tuần `plan`. Thứ chỉ dùng để tra khối của ngày đó, không dùng để gộp. */
function dayTypesOfDate(plan: any, date: string): string[] {
  const eff = plan.ngoai_le && plan.ngoai_le[date] ? plan.ngoai_le[date].khoi : (plan.ngay[dayCodeOf(date)] || []);
  return dayTypesOfBlocks(eff);
}
/** records: [{ choice, date }]; today: YYYY-MM-DD (tham số, không đọc đồng hồ); typesOf: ngày -> loại ngày. Không đưa thứ hay chữ của con vào kết quả. */
function trendByDayType(records: any[], today: string, typesOf: (date: string) => string[]): any {
  const lo = dayN(today) - TREND_WINDOW_DAYS + 1, hi = dayN(today);
  const win = records.filter(r => r.choice === "rat_met" && dayN(r.date) >= lo && dayN(r.date) <= hi);
  const byType: Record<string, number> = {};
  win.forEach(r => (typesOf(r.date) || []).forEach(f => { byType[f] = (byType[f] || 0) + 1; }));
  return { window_days: TREND_WINDOW_DAYS, count: win.length, by_day_type: byType, min_count_to_show: 1,
    show_in_weekly_report: win.length >= 1, status: win.length >= 1 ? "HIEN_TRONG_BAO_CAO_TUAN" : "KHONG_CO", rule: "D-37/D-21",
    payload_rule: "Chỉ số lần theo loại ngày; không theo thứ, không ngày cụ thể, không chữ của con, không nhãn cảm xúc (D-03, D-37)" };
}
export { trendByDayType, dayTypesOfBlocks, dayTypesOfDate, DAY_TYPES, EVENING_FROM_MIN, onCheckin, changePath, CHOICES };
