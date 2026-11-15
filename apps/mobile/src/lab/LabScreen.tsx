// Màn đo nhắc giờ, rút gọn từ mobile/src/lab/LabScreen.tsx (D-50). Bỏ GPS, ghi âm, chụp ảnh (D-45).
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { clearEvents, listEvents, type LabEvent } from './db';
import { startNotificationLogging } from './notification-log';
import { REMINDER_DELAY_S, resetLabData, setupNotifications, testPush, testReminder } from './tests';

const KIND_NAMES: Record<string, string> = { nhac: 'Nhắc giờ', day: 'Đẩy' };

function fmtTime(ms: number) {
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

function fmtDelta(ms: number | null) {
  if (ms === null) return '';
  const s = ms / 1000;
  return `${s >= 0 ? '+' : '-'}${Math.abs(s).toFixed(1)} giây`;
}

export function LabScreen() {
  const [events, setEvents] = useState<LabEvent[]>([]);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const refresh = useCallback(() => setEvents(listEvents()), []);

  useEffect(() => {
    void setupNotifications();
    const stop = startNotificationLogging(refresh);
    refresh();
    return stop;
  }, [refresh]);

  const run = async (fn: () => Promise<string>) => {
    setBusy(true);
    try {
      setMessage(await fn());
    } catch (e) {
      setMessage(`Lỗi: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setBusy(false);
      refresh();
    }
  };

  const buttons = [
    { title: '1. Nhắc giờ', hint: `Hẹn thông báo sau ${REMINDER_DELAY_S} giây`, onPress: () => run(testReminder) },
    { title: '2. Thông báo đẩy', hint: 'Tự gửi đẩy về máy này (cần Firebase)', onPress: () => run(testPush) },
    { title: 'Xóa dữ liệu để test lại', hint: 'Xóa nhật ký và nhắc đã hẹn', onPress: () => run(resetLabData) },
  ];

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Đo nhắc giờ</Text>
        <Text style={styles.sub}>Chỉ có ở bản nội bộ. Kết quả ghi ở nhật ký bên dưới.</Text>
        {buttons.map((b) => (
          <Pressable key={b.title} disabled={busy} onPress={b.onPress} style={({ pressed }) => [styles.btn, (pressed || busy) && styles.pressed]}>
            <Text style={styles.btnTitle}>{b.title}</Text>
            <Text style={styles.btnHint}>{b.hint}</Text>
          </Pressable>
        ))}
        {message !== '' && <Text style={styles.message}>{message}</Text>}
        <View style={styles.logHeader}>
          <Text style={styles.logTitle}>Nhật ký sự kiện</Text>
          <Pressable onPress={() => { clearEvents(); refresh(); }}>
            <Text style={styles.clear}>Xóa nhật ký</Text>
          </Pressable>
        </View>
        {events.length === 0 && <Text style={styles.empty}>Chưa có sự kiện.</Text>}
        {events.map((e) => (
          <View key={e.id} style={styles.event}>
            <Text style={styles.eventHead}>
              {fmtTime(e.actualAt)} · {KIND_NAMES[e.kind] ?? e.kind}
              {e.batteryPct !== null ? ` · pin ${e.batteryPct}%` : ''}
            </Text>
            <Text style={styles.eventBody}>{e.label}</Text>
            {e.scheduledAt !== null && (
              <Text style={styles.eventMeta}>
                Hẹn {fmtTime(e.scheduledAt)} · thật {fmtTime(e.actualAt)} · lệch {fmtDelta(e.deltaMs)}
              </Text>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16, gap: 10 },
  title: { fontSize: 28, fontWeight: '700' },
  sub: { color: '#555', marginBottom: 6 },
  btn: { backgroundColor: '#208AEF', borderRadius: 12, padding: 14 },
  pressed: { opacity: 0.6 },
  btnTitle: { color: '#fff', fontSize: 17, fontWeight: '600' },
  btnHint: { color: '#dbeeff', marginTop: 2 },
  message: { backgroundColor: '#f3f6fa', padding: 10, borderRadius: 8, color: '#222' },
  logHeader: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  logTitle: { fontSize: 20, fontWeight: '700' },
  clear: { color: '#208AEF', fontWeight: '600' },
  empty: { color: '#777' },
  event: { borderLeftWidth: 3, borderLeftColor: '#208AEF', paddingLeft: 10, paddingVertical: 2 },
  eventHead: { fontSize: 12, color: '#666' },
  eventBody: { fontSize: 15 },
  eventMeta: { fontSize: 12, color: '#444' },
});
