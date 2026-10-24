import { Feather } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Linking, Platform, Pressable, ScrollView, TextInput, TextInputInstance, View } from 'react-native';
import { AppState, MemoryItem, Message } from '../domain/types';
import { useDictation } from './useDictation';
import { Button, Row, T } from './primitives';
import { font, space, usePalette } from './theme';

/** Dấu hiệu của Pal: một vầng trăng khuyết như đèn ngủ. */
export function PalMark({ size = 32 }: { size?: number }) {
  const c = usePalette();
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no"
      style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: c.mark, overflow: 'hidden' }}
    >
      <View
        style={{
          position: 'absolute',
          width: size * 0.82,
          height: size * 0.82,
          borderRadius: size,
          backgroundColor: c.bg,
          top: -size * 0.12,
          left: size * 0.34,
        }}
      />
    </View>
  );
}

const KIND_LABEL: Record<MemoryItem['kind'], string> = {
  fact: 'Hồ sơ',
  event: 'Dòng thời gian',
  followup: 'Sẽ hỏi lại',
  parent: 'Riêng của bạn',
};

/** Vệt bút dạ quang dưới tin của Pal: cho phụ huynh thấy ngay Pal vừa nhớ gì, chạm để sửa. */
export function MemoryMark({ item, onOpen }: { item: MemoryItem; onOpen: (m: MemoryItem) => void }) {
  const c = usePalette();
  const label = item.resolvedAt ? 'Đã ổn' : item.scope === 'private' ? 'Chỉ bạn thấy' : KIND_LABEL[item.kind];
  return (
    <Pressable
      testID="memory-mark"
      onPress={() => onOpen(item)}
      accessibilityRole="button"
      accessibilityLabel={`Đã ghi vào sổ tay: ${item.text}. Chạm để sửa`}
      style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'flex-start', gap: space(2), opacity: pressed ? 0.7 : 1 })}
    >
      <Feather name={item.kind === 'followup' && !item.resolvedAt ? 'clock' : 'bookmark'} size={14} color={c.inkSoft} style={{ marginTop: 3 }} />
      <T variant="small" style={{ flexShrink: 1 }}>
        <T variant="small" soft>
          {label}:{' '}
        </T>
        <T variant="small" weight="medium" style={{ backgroundColor: c.markTint, paddingHorizontal: 2 }}>
          {item.text}
        </T>
      </T>
    </Pressable>
  );
}

function SafetyCard({ text }: { text: string }) {
  const c = usePalette();
  const calls = [
    { n: '111', label: 'Gọi 111', hint: 'Bảo vệ trẻ em' },
    { n: '115', label: 'Gọi 115', hint: 'Cấp cứu' },
    { n: '113', label: 'Gọi 113', hint: 'Công an' },
  ].filter((x) => text.includes(x.n));
  return (
    <View testID="safety-card" style={{ backgroundColor: c.urgentTint, borderRadius: 18, borderTopLeftRadius: 6, padding: space(4), gap: space(3), borderLeftWidth: 3, borderLeftColor: c.urgent }}>
      <T>{text}</T>
      <Row style={{ flexWrap: 'wrap' }}>
        {calls.map((x) => (
          <Button key={x.n} kind="quiet" label={x.label} accessibilityLabel={`${x.label}, ${x.hint}`} icon={<Feather name="phone" size={14} color={c.urgent} />} onPress={() => Linking.openURL(`tel:${x.n}`)} />
        ))}
      </Row>
      <T variant="small" soft>
        Bản thử. Ở bản thật, bước này sẽ chuyển tới chuyên gia của Parent-Pal.
      </T>
    </View>
  );
}

export function Bubble({ msg, state, onOpenMemory }: { msg: Message; state: AppState; onOpenMemory: (m: MemoryItem) => void }) {
  const c = usePalette();
  const mine = msg.sender === 'parent';
  if (msg.safety === 'urgent') return <SafetyCard text={msg.text} />;
  const saved = (msg.savedMemoryIds ?? []).map((id) => state.memories.find((m) => m.id === id)).filter((m): m is MemoryItem => !!m);
  return (
    <View style={{ alignItems: mine ? 'flex-end' : 'flex-start', gap: space(2) }}>
      <View
        testID={mine ? 'bubble-parent' : 'bubble-pal'}
        style={{
          maxWidth: '86%',
          backgroundColor: mine ? c.parentBubble : c.surface,
          paddingHorizontal: space(4),
          paddingVertical: space(2.5),
          borderRadius: 20,
          borderTopRightRadius: mine ? 6 : 20,
          borderTopLeftRadius: mine ? 20 : 6,
          borderLeftWidth: msg.safety === 'concern' ? 3 : 0,
          borderLeftColor: c.mark,
        }}
      >
        <T selectable>{msg.text}</T>
      </View>
      {saved.length > 0 && (
        <View style={{ gap: space(1.5), paddingLeft: space(1), maxWidth: '86%' }}>
          {saved.map((m) => (
            <MemoryMark key={m.id} item={m} onOpen={onOpenMemory} />
          ))}
        </View>
      )}
    </View>
  );
}

export function Typing() {
  const c = usePalette();
  const [n, setN] = useState(1);
  useEffect(() => {
    const t = setInterval(() => setN((x) => (x % 3) + 1), 380);
    return () => clearInterval(t);
  }, []);
  return (
    <View testID="typing" accessibilityLabel="Pal đang viết" style={{ alignSelf: 'flex-start', backgroundColor: c.surface, borderRadius: 20, borderTopLeftRadius: 6, paddingHorizontal: space(4), paddingVertical: space(3), flexDirection: 'row', gap: 5 }}>
      {[1, 2, 3].map((i) => (
        <View key={i} style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: c.inkSoft, opacity: i === n ? 1 : 0.35 }} />
      ))}
    </View>
  );
}

export function QuickReplies({ items, onPick }: { items: string[]; onPick: (s: string) => void }) {
  const c = usePalette();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space(2), paddingHorizontal: space(4) }} testID="quick-replies">
      {items.map((q) => (
        <Pressable
          key={q}
          onPress={() => onPick(q)}
          accessibilityRole="button"
          style={({ pressed }) => ({ borderWidth: 1, borderColor: c.ink, borderRadius: 999, paddingHorizontal: space(3.5), paddingVertical: space(2), opacity: pressed ? 0.6 : 1 })}
        >
          <T weight="medium" style={{ fontSize: 14, lineHeight: 20 }}>
            {q}
          </T>
        </Pressable>
      ))}
    </ScrollView>
  );
}

export function Composer({ onSend, disabled, placeholder }: { onSend: (t: string) => void; disabled?: boolean; placeholder: string }) {
  const c = usePalette();
  const [text, setText] = useState('');
  const input = useRef<TextInputInstance>(null);
  const dict = useDictation((heard) => setText((t) => (t ? `${t} ${heard}` : heard)));
  const submit = () => {
    if (!text.trim() || disabled) return;
    onSend(text);
    setText('');
    input.current?.focus();
  };
  return (
    <Row style={{ alignItems: 'flex-end', gap: space(2), paddingHorizontal: space(4), paddingTop: space(2), paddingBottom: space(3) }}>
      {dict.supported && (
        <Button
          testID="mic"
          kind={dict.listening ? 'primary' : 'quiet'}
          accessibilityLabel={dict.listening ? 'Dừng ghi âm' : 'Kể bằng giọng nói'}
          icon={<Feather name={dict.listening ? 'square' : 'mic'} size={18} color={dict.listening ? c.bg : c.ink} />}
          onPress={dict.listening ? dict.stop : dict.start}
          style={{ width: 44, height: 44 }}
        />
      )}
      <View style={{ flex: 1, backgroundColor: c.surface, borderRadius: 22, borderWidth: 1, borderColor: c.line, paddingHorizontal: space(4), minHeight: 44, justifyContent: 'center' }}>
        <TextInput
          ref={input}
          testID="composer"
          value={text}
          onChangeText={setText}
          placeholder={dict.listening ? 'Mình đang nghe…' : placeholder}
          placeholderTextColor={c.inkSoft}
          multiline
          numberOfLines={1}
          accessibilityLabel="Kể cho Pal"
          onKeyPress={(e: any) => {
            if (Platform.OS === 'web' && e.nativeEvent.key === 'Enter' && !e.nativeEvent.shiftKey) {
              e.preventDefault?.();
              submit();
            }
          }}
          style={[{ fontFamily: font.regular, fontSize: 15, lineHeight: 22, color: c.ink, paddingVertical: space(2.5), maxHeight: 120 }, Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : null]}
        />
      </View>
      <Button
        testID="send"
        kind="primary"
        accessibilityLabel="Gửi"
        disabled={!text.trim() || disabled}
        icon={<Feather name="arrow-up" size={20} color={c.bg} />}
        onPress={submit}
        style={{ width: 44, height: 44 }}
      />
    </Row>
  );
}
