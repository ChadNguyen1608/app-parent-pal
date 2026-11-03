import * as Notifications from 'expo-notifications';

import { logEvent } from './log';

type Data = { kind?: string; scheduledAt?: number };

/** Giờ thật = giờ hệ thống giao thông báo (notification.date), không phải giờ app mở. */
async function logDelivered(n: Notifications.Notification, ref: string) {
  const data = n.request.content.data as Data;
  if (!data?.kind) return;
  await logEvent({
    kind: data.kind,
    label: data.kind === 'day' ? 'Thông báo đẩy đã tới' : 'Nhắc giờ đã tới',
    scheduledAt: data.scheduledAt ?? null,
    actualAt: n.date,
    ref: `sent:${ref}`,
  });
}

/** Gọi khi mở app: ghi các thông báo đã tới lúc app đóng. Trả hàm hủy đăng ký. */
export function startNotificationLogging(onChange: () => void): () => void {
  const sync = async () => {
    for (const n of await Notifications.getPresentedNotificationsAsync()) {
      await logDelivered(n, n.request.identifier);
    }
    onChange();
  };
  void sync();

  const received = Notifications.addNotificationReceivedListener((n) => {
    void logDelivered(n, n.request.identifier).then(onChange);
  });
  const response = Notifications.addNotificationResponseReceivedListener((r) => {
    const data = r.notification.request.content.data as Data;
    void (async () => {
      await logDelivered(r.notification, r.notification.request.identifier);
      if (r.actionIdentifier === 'done') {
        await logEvent({
          kind: data.kind ?? 'nhac',
          label: 'Bấm "Xong" trên thông báo',
          scheduledAt: data.scheduledAt ?? null,
          ref: `done:${r.notification.request.identifier}`,
        });
      }
      onChange();
    })();
  });
  return () => {
    received.remove();
    response.remove();
  };
}
