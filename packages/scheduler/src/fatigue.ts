// v2: hỏi thăm sau giờ học "Ổn / Hơi mệt / Rất mệt" (QT G3, L2) theo quyết định 15/11/2026.
// - OD-A7: tín hiệu mệt thuộc F04-G05 (ghi nhận thực hiện), không phải sửa lịch.
// - D-10: "Rất mệt" KHÔNG tự đổi lịch. Muốn đổi, con đi qua bước đề xuất theo chế độ.
// - D-03: báo bố mẹ XU HƯỚNG mệt liên quan đến lịch, không báo cảm xúc, không chép lời con; con được biết điều này.
// người soạn: AI, chưa kiểm chứng độc lập.
const CHOICES: string[] = ["on", "hoi_met", "rat_met", "bo_qua"];
const TREND_WINDOW_DAYS = 14;   // QT L2 "xu hướng trong 2 tuần" [SP]
const TREND_MIN_COUNT: number | null = null;   // UNKNOWN: chưa có nguồn cho ngưỡng số ngày (A-lite SG-16). Chủ sản phẩm chốt; null = chưa gửi báo
import { dayNumber as dayN } from "../../domain/src/index.ts";

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
  const out = { ok: true, record, schedule_changed: false, child_message: "Mình đã ghi lại rồi.", child_actions: [] };
  if (choice === "rat_met") {
    const p = changePath(mode, locked);
    out.child_message = "Mình đã ghi lại. Lịch hôm nay chưa đổi. Nếu con muốn đổi, con gửi cho bố mẹ nhé.";
    out.child_actions = [{ action: p.path, label: p.path === "MONG_MUON" ? "Con muốn nói với bố mẹ" : "Đề xuất đổi lịch hôm nay", detail: p.t, cr: p.cr }];
    out.child_notice = "Bố mẹ sẽ thấy con hay mệt vào những ngày nào, không thấy lời con viết."; // D-03: con được biết
  }
  return out;
}

// D-03: xu hướng mệt LIÊN QUAN ĐẾN LỊCH: đếm theo thứ trong tuần và theo đặc điểm lịch của ngày (vd có học thêm tối).
function trend(records: any[], today: string, dayFeatures: Record<string, string[]> = {}): any {
  const lo = dayN(today) - TREND_WINDOW_DAYS + 1;
  const win = records.filter(r => r.choice === "rat_met" && dayN(r.date) >= lo && dayN(r.date) <= dayN(today));
  const byDay: Record<string, number> = {}, byFeature: Record<string, number> = {};
  win.forEach(r => { byDay[r.day] = (byDay[r.day] || 0) + 1; (dayFeatures[r.day] || []).forEach(f => byFeature[f] = (byFeature[f] || 0) + 1); });
  const notify = TREND_MIN_COUNT !== null && win.length >= TREND_MIN_COUNT;
  return { window_days: TREND_WINDOW_DAYS, count: win.length, by_day: byDay, by_schedule_feature: byFeature,
    notify_parent: notify, status: TREND_MIN_COUNT === null ? "NGUONG_CHUA_CHOT" : (notify ? "GUI_XU_HUONG" : "CHUA_DAT_NGUONG"),
    payload_rule: "Chỉ gửi số lần theo thứ/đặc điểm lịch; không gửi chữ con viết, không gắn nhãn cảm xúc (D-03, QT L2)" };
}
export { onCheckin, changePath, trend, TREND_WINDOW_DAYS, TREND_MIN_COUNT, CHOICES };
