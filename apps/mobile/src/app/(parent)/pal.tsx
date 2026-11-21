import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { errorMessage } from '@/data/errors';
import type { PalMessage, PalQuota } from '@/data/types';
import { uuidv4 } from '@/data/uuid';
import { useApp } from '@/state/app';
import { useAction } from '@/ui/useAction';
import { Btn, COLORS, Field, H1, Notice, P, Screen } from '@/ui/kit';

/** Độ dài tối đa một câu hỏi; khớp private.params pal_max_question_chars (CHUA_CHOT) ở backend. */
export const PAL_MAX_CHARS = 2000;

// Câu chữ tạm, chờ chủ sản phẩm duyệt (xem báo cáo giao việc D-69).
export const PAL_TEXT = {
  title: 'Trò chuyện với Pal',
  intro:
    'Pal là người bạn đồng hành, giúp bạn nghĩ và làm việc nuôi con. Pal không phải tư vấn tâm lý và không thay thế việc khám bệnh. ' +
    'Nếu đang khẩn cấp, bạn gọi 115 (cấp cứu), 111 (bảo vệ trẻ em) hoặc 113 (công an).',
  privacy: 'Cuộc trò chuyện này chỉ mình bạn xem được. Trong giai đoạn thử nghiệm, app lưu toàn bộ nội dung để cải tiến Pal.',
  empty: 'Bạn muốn kể gì với Pal hôm nay?',
  inputLabel: 'Nhắn cho Pal',
  send: 'Gửi',
  sending: 'Pal đang nghĩ...',
  remaining: (n: number) => `Hôm nay bạn còn ${n} lượt hỏi Pal.`,
  noMore: 'Hôm nay bạn đã dùng hết lượt hỏi Pal. Mai bạn quay lại nhé.',
  off: 'Tính năng trò chuyện với Pal chưa mở.',
  locked: 'Pal đang tạm dừng. Mình sẽ báo khi Pal trò chuyện lại được nhé.',
  frozen: 'Gia đình đang tạm dừng app, nên Pal chưa trả lời được.',
  noConsent: 'Bạn cần đồng ý cho Pal giúp lập lịch của ít nhất một con trước khi trò chuyện.',
  busy: 'Pal đang bận. Bạn thử lại sau một lúc nhé.',
  rate: 'Bạn nhắn hơi nhanh. Chờ một lúc rồi gửi tiếp nhé.',
  noHousehold: 'Bạn cần tạo gia đình trước khi trò chuyện với Pal.',
  safetyTag: 'Thông tin hỗ trợ',
} as const;

/** Lời hiện thay ô nhập khi chưa gửi được; null nghĩa là gửi được. */
export function palBlockedText(q: PalQuota | null): string | null {
  if (!q) return null;
  switch (q.state) {
    case 'OK': return null;
    case 'OFF': return PAL_TEXT.off;
    case 'LOCKED': return PAL_TEXT.locked;
    case 'FROZEN': return PAL_TEXT.frozen;
    case 'NO_CONSENT': return PAL_TEXT.noConsent;
    case 'NO_HOUSEHOLD': return PAL_TEXT.noHousehold;
    case 'QUOTA': return PAL_TEXT.noMore;
    case 'TOKENS': return PAL_TEXT.noMore;
    case 'BUSY': return PAL_TEXT.busy;
    case 'RATE': return PAL_TEXT.rate;
  }
}

// PA-22: Trò chuyện với Pal (D-69). Lớp an toàn và việc gọi AI nằm ở Edge Function pal-chat; app chỉ gửi chữ và hiện trả lời.
export default function Pal() {
  const { api } = useApp();
  const [quota, setQuota] = useState<PalQuota | null>(null);
  const [messages, setMessages] = useState<PalMessage[]>([]);
  const [conv, setConv] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [loadError, setLoadError] = useState<string | null>(null);
  const send = useAction();
  // Giữ khóa idempotent cho đến khi gửi xong, để bấm lại sau lỗi mạng không tính thêm một lượt.
  const pending = useRef<{ text: string; key: string } | null>(null);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      (async () => {
        try {
          const q = await api.palQuota();
          if (!alive) return;
          setQuota(q);
          setLoadError(null);
          if (q.state === 'OFF' || q.state === 'NO_HOUSEHOLD') return;
          const h = await api.palHistory();
          if (!alive) return;
          setConv(h.conversationId);
          setMessages(h.messages);
        } catch (e) {
          if (alive) setLoadError(errorMessage(e));
        }
      })();
      return () => {
        alive = false;
      };
    }, [api]),
  );

  const blocked = palBlockedText(quota);
  const canSend = quota !== null && blocked === null && text.trim() !== '' && text.length <= PAL_MAX_CHARS;

  const onSend = () => {
    const t = text.trim();
    if (!t) return;
    if (!pending.current || pending.current.text !== t) pending.current = { text: t, key: uuidv4() };
    const p = pending.current;
    void send.run(async () => {
      const r = await api.palSend({ message: p.text, conversationId: conv, idempotencyKey: p.key });
      pending.current = null;
      setConv(r.conversationId);
      const at = new Date().toISOString();
      setMessages((m) => [
        ...m,
        { id: `u-${p.key}`, role: 'user', content: p.text, flags: [], createdAt: at },
        { id: `a-${p.key}`, role: 'assistant', content: r.reply, flags: r.flags, createdAt: at },
      ]);
      setText('');
      setQuota((q) => (q ? { ...q, remaining: r.remaining, state: r.state } : q));
    });
  };

  return (
    <Screen>
      <H1>{PAL_TEXT.title}</H1>
      <Notice kind="info">{PAL_TEXT.intro}</Notice>
      <P muted>{PAL_TEXT.privacy}</P>
      {loadError ? <Notice>{loadError}</Notice> : null}
      {quota?.remaining !== null && quota?.remaining !== undefined && quota.state === 'OK' ? <P>{PAL_TEXT.remaining(quota.remaining)}</P> : null}
      {messages.length === 0 && !loadError ? <P muted>{PAL_TEXT.empty}</P> : null}
      {messages.map((m) => (
        <View key={m.id} style={[s.bubble, m.role === 'user' ? s.mine : s.pal]} accessibilityLabel={m.role === 'user' ? `Bạn: ${m.content}` : `Pal: ${m.content}`}>
          <Text style={s.who}>{m.role === 'user' ? 'Bạn' : 'Pal'}</Text>
          <Text style={s.body}>{m.content}</Text>
          {m.role === 'assistant' && m.flags.some((f) => f.startsWith('EMERGENCY')) ? <Text style={s.tag}>{PAL_TEXT.safetyTag}</Text> : null}
        </View>
      ))}
      {send.busy ? <P muted>{PAL_TEXT.sending}</P> : null}
      {send.error ? <Notice>{send.error}</Notice> : null}
      {blocked ? (
        <Notice kind="info">{blocked}</Notice>
      ) : (
        <>
          <Field label={PAL_TEXT.inputLabel} value={text} onChangeText={setText} multiline maxLength={PAL_MAX_CHARS} editable={!send.busy} style={s.input} />
          <Btn label={PAL_TEXT.send} onPress={onSend} busy={send.busy} disabled={!canSend} />
        </>
      )}
    </Screen>
  );
}

const s = StyleSheet.create({
  bubble: { borderRadius: 12, padding: 12, gap: 4, maxWidth: '92%' },
  mine: { alignSelf: 'flex-end', backgroundColor: COLORS.bgSoft },
  pal: { alignSelf: 'flex-start', borderWidth: 1, borderColor: COLORS.line },
  who: { fontSize: 13, fontWeight: '700', color: COLORS.muted },
  body: { fontSize: 17, lineHeight: 24, color: COLORS.text },
  tag: { fontSize: 13, color: COLORS.danger, fontWeight: '700' },
  input: { minHeight: 96, textAlignVertical: 'top', paddingVertical: 10 },
});
