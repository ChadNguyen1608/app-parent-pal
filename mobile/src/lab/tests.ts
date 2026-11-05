import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';

import { clearEvents, clearSched, saveSched } from './db';
import { GEOFENCE_RADIUS_M, GEOFENCE_TASK } from './geofence-task';
import { logEvent } from './log';

export const REMINDER_CATEGORY = 'lab-reminder';
export const REMINDER_DELAY_S = 60;

export async function setupNotifications() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
  await Notifications.setNotificationChannelAsync('lab', {
    name: 'Phòng thử',
    importance: Notifications.AndroidImportance.MAX,
  });
  await Notifications.setNotificationCategoryAsync(REMINDER_CATEGORY, [
    { identifier: 'done', buttonTitle: 'Xong', options: { opensAppToForeground: false } },
  ]);
}

async function ensureNotificationPermission(): Promise<boolean> {
  const cur = await Notifications.getPermissionsAsync();
  if (cur.granted) return true;
  return (await Notifications.requestPermissionsAsync()).granted;
}

/** Nút 1: hẹn thông báo sau REMINDER_DELAY_S giây, có nút "Xong". */
export async function testReminder(): Promise<string> {
  if (!(await ensureNotificationPermission())) {
    await logEvent({ kind: 'nhac', label: 'Chưa được cấp quyền thông báo' });
    return 'Chưa được cấp quyền thông báo.';
  }
  // Không có quyền báo thức chính xác, Android hẹn gần đúng và có thể trễ cả chục giây (đo thật: +45 giây).
  let exact = 'không rõ';
  try {
    let ex = await Notifications.getExactAlarmPermissionsAsync();
    if (!ex.granted) ex = await Notifications.requestExactAlarmPermissionsAsync();
    exact = ex.granted ? 'có' : 'không';
  } catch (e) {
    exact = 'lỗi: ' + (e instanceof Error ? e.message : String(e)).slice(0, 60);
  }
  const scheduledAt = Date.now() + REMINDER_DELAY_S * 1000;
  const notifId = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Thử nhắc giờ',
      body: 'Bấm "Xong" để ghi nhận.',
      categoryIdentifier: REMINDER_CATEGORY,
      data: { kind: 'nhac', scheduledAt },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: scheduledAt,
      channelId: 'lab',
    },
  });
  saveSched(notifId, 'nhac', scheduledAt);
  await logEvent({ kind: 'nhac', label: `Đã hẹn nhắc lúc ${new Date(scheduledAt).toTimeString().slice(0, 8)} (sau ${REMINDER_DELAY_S} giây), quyền báo thức chính xác: ${exact}` });
  return exact === 'có'
    ? `Đã hẹn nhắc sau ${REMINDER_DELAY_S} giây. Khóa máy để thử.`
    : `Đã hẹn nhắc sau ${REMINDER_DELAY_S} giây nhưng chưa có quyền báo thức chính xác (${exact}), có thể trễ. Bật "Báo thức & lời nhắc" cho app trong cài đặt rồi thử lại.`;
}

/** Nút 2: bật hoặc tắt một vùng bán kính 100 m quanh vị trí hiện tại. Không lưu toạ độ. */
export async function testGeofence(): Promise<string> {
  const fg = await Location.requestForegroundPermissionsAsync();
  if (!fg.granted) {
    await logEvent({
      kind: 'gps',
      label: `Quyền vị trí bị từ chối (${fg.status}, hỏi lại được: ${fg.canAskAgain})`,
    });
    return 'Chưa được cấp quyền vị trí. Mở cài đặt app, chọn Quyền, Vị trí.';
  }
  // Android 11+: không có hộp thoại "Luôn cho phép"; hệ thống đưa người dùng sang màn cài đặt.
  let step = 'xin quyền nền';
  try {
    let bg = await Location.getBackgroundPermissionsAsync();
    if (!bg.granted) bg = await Location.requestBackgroundPermissionsAsync();
    if (!bg.granted) {
      await logEvent({ kind: 'gps', label: `Chưa có "Luôn cho phép" vị trí (${bg.status})` });
      return 'Cần "Luôn cho phép" vị trí: mở cài đặt app, Quyền, Vị trí, chọn "Luôn cho phép" và bật "Dùng vị trí chính xác", rồi bấm lại nút này.';
    }
    // hasStartedGeofencingAsync báo lỗi nếu chưa có quyền nền, nên chỉ hỏi sau khi đã có quyền.
    step = 'kiểm tra vùng';
    if (await Location.hasStartedGeofencingAsync(GEOFENCE_TASK)) {
      await Location.stopGeofencingAsync(GEOFENCE_TASK);
      await logEvent({ kind: 'gps', label: 'Đã tắt vùng thử' });
      return 'Đã tắt vùng thử.';
    }
    step = 'lấy vị trí';
    const pos =
      (await Location.getLastKnownPositionAsync()) ??
      (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }));
    step = 'đặt vùng';
    await Location.startGeofencingAsync(GEOFENCE_TASK, [
      {
        identifier: 'lab-here',
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        radius: GEOFENCE_RADIUS_M,
        notifyOnEnter: true,
        notifyOnExit: true,
      },
    ]);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await logEvent({ kind: 'gps', label: `Lỗi khi ${step}: ${msg.slice(0, 160)}` });
    return `Lỗi khi ${step}: ${msg.slice(0, 120)}`;
  }
  await logEvent({ kind: 'gps', label: `Đã đặt vùng thử bán kính ${GEOFENCE_RADIUS_M} m` });
  return `Đã đặt vùng bán kính ${GEOFENCE_RADIUS_M} m. Đi ra xa rồi quay lại để thử.`;
}

/** Nút 5: lấy mã đẩy rồi tự gửi một thông báo đẩy cho chính máy này. */
export async function testPush(): Promise<string> {
  if (!Device.isDevice) return 'Cần máy thật.';
  if (!(await ensureNotificationPermission())) {
    await logEvent({ kind: 'day', label: 'Chưa được cấp quyền thông báo' });
    return 'Chưa được cấp quyền thông báo.';
  }
  const projectId: string | undefined = Constants.expoConfig?.extra?.eas?.projectId;
  if (!projectId) {
    await logEvent({ kind: 'day', label: 'Chưa có projectId EAS (cần tạo dự án Expo)' });
    return 'Chưa có projectId EAS. Cần tạo dự án Expo trước.';
  }
  let token: string;
  try {
    token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await logEvent({ kind: 'day', label: `Không lấy được mã đẩy: ${msg.slice(0, 120)}` });
    return 'Không lấy được mã đẩy (thường do chưa cấu hình Firebase).';
  }
  const scheduledAt = Date.now();
  const res = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: token,
      title: 'Thử thông báo đẩy',
      body: 'Từ máy chủ Expo về lại máy này.',
      channelId: 'lab',
      data: { kind: 'day', scheduledAt },
    }),
  });
  if (!res.ok) {
    await logEvent({ kind: 'day', label: `Gửi đẩy lỗi HTTP ${res.status}` });
    return `Gửi đẩy lỗi HTTP ${res.status}.`;
  }
  type Ticket = { status?: string; id?: string; message?: string; details?: { error?: string } };
  const ticket = ((await res.json().catch(() => null)) as { data?: Ticket } | null)?.data;
  if (ticket?.status !== 'ok' || !ticket.id) {
    const why = ticket?.details?.error || ticket?.message || 'không đọc được phản hồi';
    await logEvent({ kind: 'day', label: `Expo từ chối yêu cầu đẩy: ${why.slice(0, 140)}` });
    return `Expo từ chối: ${why.slice(0, 100)}`;
  }
  await logEvent({ kind: 'day', label: 'Expo đã nhận yêu cầu đẩy, đang chờ biên nhận từ FCM' });
  void checkReceipt(ticket.id);
  return 'Đã gửi. Chờ thông báo về (nhật ký sẽ ghi biên nhận sau khoảng 20 giây).';
}

/** Hỏi Expo xem FCM đã giao chưa. Thấy lỗi ở đây thường là chưa nạp khóa FCM V1 vào Expo. */
async function checkReceipt(id: string) {
  type Receipt = { status?: string; message?: string; details?: { error?: string } };
  for (const wait of [20, 40]) {
    await new Promise((r) => setTimeout(r, wait * 1000));
    try {
      const r = await fetch('https://exp.host/--/api/v2/push/getReceipts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [id] }),
      });
      const rec = ((await r.json()) as { data?: Record<string, Receipt> }).data?.[id];
      if (!rec) continue;
      const label =
        rec.status === 'ok'
          ? 'Biên nhận: FCM đã nhận thông báo đẩy'
          : `Biên nhận lỗi: ${rec.details?.error ?? ''} ${rec.message ?? ''}`.slice(0, 160);
      await logEvent({ kind: 'day', label, ref: `receipt:${id}` });
      return;
    } catch {
      /* thử lại lần sau */
    }
  }
  await logEvent({ kind: 'day', label: 'Chưa có biên nhận sau 60 giây', ref: `receipt:${id}` });
}

/** Xóa sạch để test lại từ đầu: nhắc đã hẹn, thông báo trong khay, vùng GPS, nhật ký. Dữ liệu Pal do màn hình gọi xóa riêng. */
export async function resetLabData(): Promise<string> {
  const notes: string[] = [];
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await Notifications.dismissAllNotificationsAsync();
  } catch {
    notes.push('không hủy được thông báo');
  }
  try {
    if (await Location.hasStartedGeofencingAsync(GEOFENCE_TASK)) await Location.stopGeofencingAsync(GEOFENCE_TASK);
  } catch {
    // chưa có quyền nền thì cũng chưa có vùng nào đang chạy
  }
  clearEvents();
  clearSched();
  return notes.length ? 'Đã xóa, trừ: ' + notes.join(', ') : 'Đã xóa dữ liệu thử.';
}
