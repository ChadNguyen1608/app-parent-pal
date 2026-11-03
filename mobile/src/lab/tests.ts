import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';

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
  const scheduledAt = Date.now() + REMINDER_DELAY_S * 1000;
  await Notifications.scheduleNotificationAsync({
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
  await logEvent({ kind: 'nhac', label: `Đã hẹn nhắc sau ${REMINDER_DELAY_S} giây`, scheduledAt });
  return `Đã hẹn nhắc sau ${REMINDER_DELAY_S} giây. Khóa máy để thử.`;
}

/** Nút 2: bật hoặc tắt một vùng bán kính 100 m quanh vị trí hiện tại. Không lưu toạ độ. */
export async function testGeofence(): Promise<string> {
  if (await Location.hasStartedGeofencingAsync(GEOFENCE_TASK)) {
    await Location.stopGeofencingAsync(GEOFENCE_TASK);
    await logEvent({ kind: 'gps', label: 'Đã tắt vùng thử' });
    return 'Đã tắt vùng thử.';
  }
  const fg = await Location.requestForegroundPermissionsAsync();
  if (!fg.granted) {
    await logEvent({ kind: 'gps', label: 'Chưa được cấp quyền vị trí' });
    return 'Chưa được cấp quyền vị trí.';
  }
  const bg = await Location.requestBackgroundPermissionsAsync();
  if (!bg.granted) {
    await logEvent({ kind: 'gps', label: 'Chưa chọn "Luôn cho phép" vị trí' });
    return 'Cần chọn "Luôn cho phép" vị trí trong phần cài đặt của app.';
  }
  const pos = await Location.getCurrentPositionAsync({});
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
  await logEvent({
    kind: 'day',
    label: res.ok ? 'Đã gửi yêu cầu đẩy' : `Gửi đẩy lỗi HTTP ${res.status}`,
    scheduledAt,
  });
  return res.ok ? 'Đã gửi. Chờ thông báo về.' : `Gửi đẩy lỗi HTTP ${res.status}.`;
}
