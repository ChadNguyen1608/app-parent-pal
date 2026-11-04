import { RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync, useAudioRecorder } from 'expo-audio';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { clearEvents, listEvents, type LabEvent } from './db';
import { logEvent } from './log';
import { startNotificationLogging } from './notification-log';
import { compressPhoto } from './photo';
import { setupNotifications, testGeofence, testPush, testReminder } from './tests';

const RECORD_SECONDS = 5;
const KIND_NAMES: Record<string, string> = {
  nhac: 'Nhắc giờ',
  gps: 'Vùng GPS',
  ghiam: 'Ghi âm',
  anh: 'Chụp ảnh',
  day: 'Đẩy',
};

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
  const [cameraOn, setCameraOn] = useState(false);
  const [camPermission, requestCamPermission] = useCameraPermissions();
  const camRef = useRef<CameraView>(null);
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

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
      const msg = e instanceof Error ? e.message : String(e);
      setMessage(`Lỗi: ${msg}`);
    } finally {
      setBusy(false);
      refresh();
    }
  };

  const testRecord = async () => {
    const perm = await requestRecordingPermissionsAsync();
    if (!perm.granted) {
      await logEvent({ kind: 'ghiam', label: 'Chưa được cấp quyền micro' });
      return 'Chưa được cấp quyền micro.';
    }
    await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
    await recorder.prepareToRecordAsync();
    const startedAt = Date.now();
    recorder.record();
    await new Promise((r) => setTimeout(r, RECORD_SECONDS * 1000));
    await recorder.stop();
    const took = Date.now() - startedAt;
    await logEvent({
      kind: 'ghiam',
      label: `Ghi âm xong (${(took / 1000).toFixed(1)} giây)${recorder.uri ? '' : ', không có file'}`,
    });
    return recorder.uri ? 'Ghi âm xong.' : 'Ghi âm xong nhưng không có file.';
  };

  const openCamera = async () => {
    if (!camPermission?.granted) {
      const res = await requestCamPermission();
      if (!res.granted) {
        await logEvent({ kind: 'anh', label: 'Chưa được cấp quyền camera' });
        refresh();
        setMessage('Chưa được cấp quyền camera.');
        return;
      }
    }
    setCameraOn(true);
  };

  const snap = async () => {
    const started = Date.now();
    const pic = await camRef.current?.takePictureAsync({ quality: 0.8 });
    setCameraOn(false);
    if (!pic) {
      await logEvent({ kind: 'anh', label: 'Chụp không được' });
      setMessage('Chụp không được.');
      refresh();
      return;
    }
    try {
      const small = await compressPhoto(pic.uri, pic.width, pic.height);
      const kb = small.bytes === null ? '?' : Math.round(small.bytes / 1024);
      await logEvent({
        kind: 'anh',
        label: `Chụp ${pic.width}x${pic.height}, thu còn ${small.width}x${small.height}, ${kb} KB (${Date.now() - started} ms)`,
      });
      setMessage(`Đã chụp, ảnh thu nhỏ ${kb} KB.`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      await logEvent({ kind: 'anh', label: `Thu nhỏ ảnh lỗi: ${msg.slice(0, 100)}` });
      setMessage('Thu nhỏ ảnh lỗi.');
    }
    refresh();
  };

  const buttons: { title: string; hint: string; onPress: () => void }[] = [
    { title: '1. Nhắc giờ', hint: 'Hẹn thông báo sau 60 giây', onPress: () => run(testReminder) },
    { title: '2. Vùng GPS', hint: 'Bật/tắt vùng 100 m quanh chỗ này', onPress: () => run(testGeofence) },
    { title: '3. Ghi âm', hint: `Ghi ${RECORD_SECONDS} giây`, onPress: () => run(testRecord) },
    { title: '4. Chụp ảnh', hint: 'Mở camera, chụp một tấm', onPress: () => void openCamera() },
    { title: '5. Thông báo đẩy', hint: 'Tự gửi đẩy về máy này', onPress: () => run(testPush) },
  ];

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Phòng thử</Text>
        <Text style={styles.sub}>5 nút thử nhanh. Kết quả ghi ở nhật ký bên dưới.</Text>

        {cameraOn && (
          <View style={styles.cameraBox}>
            <CameraView ref={camRef} style={styles.camera} facing="back" />
            <View style={styles.row}>
              <Pressable style={[styles.btn, styles.flex]} onPress={() => void snap()}>
                <Text style={styles.btnTitle}>Chụp</Text>
              </Pressable>
              <Pressable style={[styles.btn, styles.btnGhost]} onPress={() => setCameraOn(false)}>
                <Text style={styles.btnGhostText}>Hủy</Text>
              </Pressable>
            </View>
          </View>
        )}

        {buttons.map((b) => (
          <Pressable
            key={b.title}
            disabled={busy}
            onPress={b.onPress}
            style={({ pressed }) => [styles.btn, (pressed || busy) && styles.btnPressed]}>
            <Text style={styles.btnTitle}>{b.title}</Text>
            <Text style={styles.btnHint}>{b.hint}</Text>
          </Pressable>
        ))}

        {message !== '' && <Text style={styles.message}>{message}</Text>}

        <View style={styles.logHeader}>
          <Text style={styles.logTitle}>Nhật ký sự kiện</Text>
          <Pressable
            onPress={() => {
              clearEvents();
              refresh();
            }}>
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
  row: { flexDirection: 'row', gap: 8 },
  flex: { flex: 1 },
  btn: { backgroundColor: '#208AEF', borderRadius: 12, padding: 14 },
  btnPressed: { opacity: 0.6 },
  btnTitle: { color: '#fff', fontSize: 17, fontWeight: '600' },
  btnHint: { color: '#dbeeff', marginTop: 2 },
  btnGhost: { backgroundColor: '#eee', justifyContent: 'center' },
  btnGhostText: { color: '#333', fontWeight: '600' },
  cameraBox: { gap: 8 },
  camera: { height: 320, borderRadius: 12, overflow: 'hidden' },
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
