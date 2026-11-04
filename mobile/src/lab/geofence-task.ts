import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';

import { logEvent } from './log';

export const GEOFENCE_TASK = 'lab-geofence';
export const GEOFENCE_RADIUS_M = 100;

// Phải chạy ở cấp module để task còn sống khi app đóng.
// Chỉ ghi sự kiện vào/ra vùng, không ghi toạ độ.
TaskManager.defineTask<{ eventType: Location.GeofencingEventType }>(
  GEOFENCE_TASK,
  async ({ data, error }) => {
    if (error) {
      await logEvent({ kind: 'gps', label: `Lỗi vùng GPS: ${error.message}` });
      return;
    }
    const entering = data.eventType === Location.GeofencingEventType.Enter;
    await logEvent({ kind: 'gps', label: entering ? 'Đã VÀO vùng thử' : 'Đã RA khỏi vùng thử' });
  },
);
