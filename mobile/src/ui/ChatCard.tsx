import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import { askPal, PalError } from '@/pal/client';
import { applyReply } from '@/pal/reply';
import { usePal, type AppState } from '@/pal/store';
import { DAYS } from '@/pal/types';
import { Btn, C, Card, H2, Muted, Row, s } from './kit';

const EXAMPLES: Record<string, string> = {
  'Dùng ví dụ học sinh lớp 3':
    'Con mình 8 tuổi, học lớp 3, học bán trú 2 buổi/ngày từ 7:30 đến 16:15. Con học tiếng Anh ở trung tâm thứ Tư và thứ Sáu từ 17:30 đến 19:00. Mình muốn con vận động buổi sáng, đọc sách và viết nhật ký trước khi ngủ. Nhà cách trường và trung tâm khoảng 15 phút.',
  'Dùng ví dụ học sinh lớp 8':
    'Con mình 13 tuổi, học lớp 8, học từ 7:00 đến 11:30 sáng, chiều thứ Ba và thứ Năm học thêm ở trường. Tối thứ Hai và thứ Tư học Toán ở trung tâm. Con thích bóng rổ, hay thức khuya chơi điện thoại.',
};
const FOLLOW_UPS = [
  'Con thi ngày 28/11: đến hôm đó bỏ bơi, giảm nửa thời gian chơi',
  'Thứ Năm tuần này con bị ốm, hủy toàn bộ lịch',
  'Lớp tiếng Anh chuyển từ thứ Tư sang thứ Năm',
  'Thêm 20 phút từ vựng tiếng Anh mỗi tối',
];

export function ChatCard() {
  const { state, update } = usePal();
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const hasPlan = DAYS.some((d) => (state.plan.ngay[d] || []).length);
  const chips = hasPlan ? FOLLOW_UPS : Object.keys(EXAMPLES);

  const send = async (raw: string) => {
    const msg = raw.trim();
    if (!msg || busy) return;
    setBusy(true);
    setError('');
    setText('');
    const withUser: AppState = { ...state, messages: [...state.messages, { role: 'user', content: msg }] };
    update((d) => { d.messages.push({ role: 'user', content: msg }); });
    try {
      const reply = await askPal(withUser);
      update((d) => {
        const r = applyReply(d, reply);
        d.messages.push({ role: 'assistant', content: r.text, warn: r.warn || undefined });
        if (d.messages.length > 40) d.messages = d.messages.slice(-40);
      });
    } catch (e) {
      update((d) => { d.messages.pop(); });
      setError(e instanceof PalError ? e.message : 'Có lỗi khi gọi Pal: ' + (e instanceof Error ? e.message : String(e)));
      setText(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <H2>💬 Trò chuyện với Pal</H2>
      <Row>
        <Btn small primary={state.palMode === 'mock'} label="Pal giả lập" onPress={() => update((d) => { d.palMode = 'mock'; })} />
        <Btn small primary={state.palMode === 'cloud'} label="Pal thật (máy chủ)" onPress={() => update((d) => { d.palMode = 'cloud'; })} />
        <Btn small primary={state.palMode === 'bridge'} label="Cầu nối máy dev" onPress={() => update((d) => { d.palMode = 'bridge'; })} />
      </Row>
      <Muted style={{ marginTop: 6 }}>
        {state.palMode === 'mock'
          ? 'Pal giả lập: câu trả lời viết sẵn, chỉ để thử tính năng. Chưa phải Pal thật.'
          : state.palMode === 'cloud'
            ? 'Pal thật qua máy chủ: cần có mạng. Không cần cắm máy tính.'
            : 'Cầu nối máy dev: cần chạy scripts/pal-bridge.mjs trên máy tính. Chỉ để dev thử.'}
      </Muted>
      <View style={{ marginTop: 10, gap: 8 }}>
        {state.messages.length === 0 && (
          <View style={{ backgroundColor: C.bg, borderRadius: 12, padding: 10 }}>
            <Text>Chào bạn, mình là Pal. Bạn kể cho mình: con mấy tuổi, học lớp mấy, mấy giờ vào học và tan học nhé.</Text>
          </View>
        )}
        {state.messages.map((m, i) => (
          <View key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '88%' }}>
            <View style={{ backgroundColor: m.role === 'user' ? C.accent : C.bg, borderRadius: 12, padding: 10 }}>
              <Text style={{ color: m.role === 'user' ? '#fff' : C.ink }}>{m.content}</Text>
            </View>
            {!!m.warn && (
              <View style={{ backgroundColor: '#fff6e0', borderRadius: 10, padding: 8, marginTop: 4 }}>
                <Text style={{ color: '#6b4a00', fontSize: 13 }}>⚠️ Lưu ý cân bằng:{'\n'}{m.warn}</Text>
              </View>
            )}
          </View>
        ))}
        {busy && <Muted>Pal đang nghĩ…</Muted>}
        {!!error && <Text style={{ color: C.red, fontSize: 13 }}>{error}</Text>}
      </View>
      <Row style={{ marginTop: 10 }}>
        {chips.map((t) => <Btn key={t} small label={t} onPress={() => send(EXAMPLES[t] ?? t)} />)}
      </Row>
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 10, alignItems: 'flex-end' }}>
        <TextInput style={[s.input, { flex: 1, minHeight: 44, maxHeight: 120 }]} multiline placeholder="Nói hoặc gõ cho Pal…" value={text} onChangeText={setText} editable={!busy} />
        <Btn primary label="Gửi" onPress={() => send(text)} disabled={busy} />
      </View>
    </Card>
  );
}
