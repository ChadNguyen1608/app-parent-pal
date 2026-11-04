import { AppState } from 'react-native';
import * as Notifications from 'expo-notifications';

import { getSched } from './db';
import { logEvent } from './log';

type Data = { kind?: string; scheduledAt?: number };

/**
 * Giờ tới thật = postTime mà hệ thống ghi cho thông báo đang nằm trong khay
 * (getPresentedNotificationsAsync). Không dùng `date` của listener: với thông báo hẹn giờ
 * nó là giờ lúc hẹn, nên độ lệch ra âm đúng bằng thời gian chờ.
 */
async function postTimeOf(identifier: string): Promise<number | null> {
  const presented = await Notifications.getPresentedNotificationsAsync();
  const found = presented.find((p) => p.request.identifier === identifier);
  return found ? found.date : null;
}

/** Loại và giờ hẹn: ưu tiên dữ liệu kèm thông báo, không có thì tra bảng đã lưu lúc hẹn. */
function metaOf(n: Notifications.Notification): { kind: string; scheduledAt: number | null } | null {
  const data = n.request.content.data as Data;
  if (data?.kind) return { kind: data.kind, scheduledAt: data.scheduledAt ?? null };
  const s = getSched(n.request.identifier);
  return s ? { kind: s.kind, scheduledAt: s.scheduledAt } : null;
}

async function logDelivered(n: Notifications.Notification, fallbackNow: boolean) {
  const meta = metaOf(n);
  if (!meta) return;
  const data = { kind: meta.kind, scheduledAt: meta.scheduledAt ?? undefined };
  const id = n.request.identifier;
  const postTime = (await postTimeOf(id)) ?? (fallbackNow ? Date.now() : null);
  const label = data.kind === 'day' ? 'Thông báo đẩy đã tới' : 'Nhắc giờ đã tới';
  if (postTime === null) {
    await logEvent({ kind: data.kind, label: `${label} (không đo được giờ tới)`, ref: `sent:${id}` });
    return;
  }
  await logEvent({
    kind: data.kind,
    label,
    scheduledAt: data.scheduledAt ?? null,
    actualAt: postTime,
    ref: `sent:${id}`,
  });
}

/** Gọi khi mở app: ghi các thông báo đã tới lúc app đóng. Trả hàm hủy đăng ký. */
export function startNotificationLogging(onChange: () => void): () => void {
  const sync = async () => {
    for (const n of await Notifications.getPresentedNotificationsAsync()) {
      await logDelivered(n, false);
    }
    onChange();
  };
  void sync();
  // Quay lại app (không mở mới): đọc lại khay để ghi thông báo đã tới trong lúc app ở nền.
  const appState = AppState.addEventListener('change', (s) => {
    if (s === 'active') void sync();
  });

  // Đang mở app: giờ nhận gần đúng giờ tới.
  const received = Notifications.addNotificationReceivedListener((n) => {
    void logDelivered(n, true).then(onChange);
  });
  const response = Notifications.addNotificationResponseReceivedListener((r) => {
    const data = { kind: metaOf(r.notification)?.kind };
    void (async () => {
      await logDelivered(r.notification, false);
      if (r.actionIdentifier === 'done') {
        await logEvent({
          kind: data.kind ?? 'nhac',
          label: 'Bấm "Xong" trên thông báo',
          ref: `done:${r.notification.request.identifier}`,
        });
      }
      onChange();
    })();
  });
  return () => {
    appState.remove();
    received.remove();
    response.remove();
  };
}
