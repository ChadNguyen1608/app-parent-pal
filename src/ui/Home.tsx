import { Feather } from '@expo/vector-icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, ScrollViewInstance, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MemoryItem } from '../domain/types';
import { useAppState } from '../state/useAppState';
import { Bubble, Composer, PalMark, QuickReplies, Typing } from './Chat';
import { MemoryEditor, Notebook } from './Notebook';
import { Button, Row, T } from './primitives';
import { space, usePalette } from './theme';

const WIDE = 920;

export default function Home() {
  const c = usePalette();
  const app = useAppState();
  const { state } = app;
  const { width } = useWindowDimensions();
  const wide = width >= WIDE;
  const [view, setView] = useState<'chat' | 'notebook'>('chat');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tools, setTools] = useState(false);
  const [seen, setSeen] = useState<Set<string>>(new Set());
  const scroll = useRef<ScrollViewInstance>(null);

  const msgCount = state?.messages.length ?? 0;
  useEffect(() => {
    const t = setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 30);
    return () => clearTimeout(t);
  }, [msgCount, app.pending, app.typing, view]);

  // Những dòng mới ghi từ lần cuối mở sổ tay: hiện vệt dạ quang và số trên nút.
  const fresh = useMemo(() => new Set((state?.memories ?? []).map((m) => m.id).filter((id) => !seen.has(id))), [state?.memories, seen]);
  const openNotebook = () => {
    setView('notebook');
  };
  useEffect(() => {
    if (view === 'notebook' || wide) {
      const t = setTimeout(() => setSeen(new Set(state?.memories.map((m) => m.id))), 2500);
      return () => clearTimeout(t);
    }
  }, [view, wide, state?.memories]);

  if (!state) {
    return <View style={{ flex: 1, backgroundColor: c.bg }} />;
  }

  const lastPal = [...state.messages].reverse().find((m) => m.sender === 'pal');
  const lastIsPal = state.messages.at(-1)?.sender === 'pal';
  const quick = !app.typing && lastIsPal ? lastPal?.quickReplies : undefined;
  const editing = state.memories.find((m) => m.id === editingId) ?? null;
  const openMemory = (m: MemoryItem) => setEditingId(m.id);
  const placeholder = state.profile.onboarding === 'done' ? 'Kể cho Pal nghe…' : 'Trả lời Pal…';

  const header = (
    <Row style={{ paddingHorizontal: space(4), paddingVertical: space(3), justifyContent: 'space-between', maxWidth: 680, width: '100%', alignSelf: 'center' }}>
      <Row style={{ gap: space(3) }}>
        <PalMark />
        <View>
          <T variant="lead" weight="semibold">
            Pal
          </T>
          <T variant="small" soft>
            {app.typing ? 'đang viết…' : 'bạn đồng hành nuôi con'}
          </T>
        </View>
      </Row>
      {!wide && (
        <Button
          testID="toggle-notebook"
          kind="quiet"
          label={view === 'chat' ? 'Sổ tay' : 'Trò chuyện'}
          accessibilityLabel={view === 'chat' ? `Mở sổ tay${fresh.size ? `, ${fresh.size} dòng mới` : ''}` : 'Quay lại trò chuyện'}
          icon={
            <View>
              <Feather name={view === 'chat' ? 'book-open' : 'message-circle'} size={16} color={c.ink} />
              {view === 'chat' && fresh.size > 0 && (
                <View testID="fresh-dot" style={{ position: 'absolute', top: -3, right: -5, width: 9, height: 9, borderRadius: 5, backgroundColor: c.mark, borderWidth: 1.5, borderColor: c.surface }} />
              )}
            </View>
          }
          onPress={() => (view === 'chat' ? openNotebook() : setView('chat'))}
        />
      )}
    </Row>
  );

  const protoStrip = (
    <Pressable
      testID="proto-strip"
      onPress={() => setTools(true)}
      accessibilityRole="button"
      accessibilityLabel="Bản thử. Mở công cụ thử nghiệm"
      style={{ backgroundColor: c.markTint, paddingHorizontal: space(4), paddingVertical: space(1.5) }}
    >
      <T variant="small" style={{ textAlign: 'center' }}>
        Bản thử: AI giả lập, dữ liệu chỉ lưu trên trình duyệt này.{' '}
        <T variant="small" weight="semibold" style={{ textDecorationLine: 'underline' }}>
          Công cụ thử
        </T>
      </T>
    </Pressable>
  );

  const chat = (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView
        ref={scroll}
        testID="chat"
        onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: false })}
        contentContainerStyle={{ padding: space(4), gap: space(4), maxWidth: 680, width: '100%', alignSelf: 'center' }}>
        {state.messages.map((m) => (
          <Bubble key={m.id} msg={m} state={state} onOpenMemory={openMemory} />
        ))}
        {app.pending && (
          <View style={{ alignItems: 'flex-end' }}>
            <View style={{ maxWidth: '86%', backgroundColor: c.parentBubble, paddingHorizontal: space(4), paddingVertical: space(2.5), borderRadius: 20, borderTopRightRadius: 6 }}>
              <T>{app.pending}</T>
            </View>
          </View>
        )}
        {app.typing && <Typing />}
      </ScrollView>
      <View style={{ maxWidth: 680, width: '100%', alignSelf: 'center' }}>
        {quick && quick.length > 0 && <QuickReplies items={quick} onPick={app.send} />}
        <Composer onSend={app.send} disabled={app.typing} placeholder={placeholder} />
      </View>
    </KeyboardAvoidingView>
  );

  const notebook = (
    <Notebook state={state} now={app.now()} onOpen={openMemory} onResolve={app.resolveMemory} highlight={fresh} />
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }} edges={['top', 'bottom', 'left', 'right']}>
      {protoStrip}
      {wide ? (
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <View style={{ flex: 1 }}>
            {header}
            {chat}
          </View>
          <View testID="notebook-panel" style={{ width: 400, backgroundColor: c.surface, borderLeftWidth: 1, borderLeftColor: c.line }}>
            {notebook}
          </View>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          {header}
          {view === 'chat' ? chat : notebook}
        </View>
      )}

      <MemoryEditor item={editing} onClose={() => setEditingId(null)} onSave={app.editMemory} onToggleScope={app.toggleScope} onDelete={app.deleteMemory} />

      {tools && (
        <Modal transparent animationType="fade" visible onRequestClose={() => setTools(false)}>
          <Pressable onPress={() => setTools(false)} style={{ flex: 1, backgroundColor: 'rgba(15,25,32,0.45)', justifyContent: 'center', alignItems: 'center', padding: space(4) }}>
            <Pressable testID="proto-tools" onPress={() => {}} style={{ width: '100%', maxWidth: 440, backgroundColor: c.bg, borderRadius: 24, padding: space(5), gap: space(4) }}>
              <T variant="lead" weight="semibold" accessibilityRole="header">
                Công cụ thử nghiệm
              </T>
              <T soft>
                Pal hỏi lại những chuyện bạn từng lo sau vài ngày. Tua nhanh thời gian để xem Pal chủ động mở lời thế nào.
              </T>
              <Row style={{ flexWrap: 'wrap' }}>
                <Button testID="skip-3" kind="quiet" label="Tua nhanh 3 ngày" onPress={() => { setTools(false); setView('chat'); void app.skipDays(3); }} />
                <Button testID="skip-7" kind="quiet" label="Tua nhanh 7 ngày" onPress={() => { setTools(false); setView('chat'); void app.skipDays(7); }} />
              </Row>
              <View style={{ height: 1, backgroundColor: c.line }} />
              <T soft>Xóa toàn bộ cuộc trò chuyện và sổ tay trên trình duyệt này, rồi làm quen lại từ đầu.</T>
              <Row style={{ justifyContent: 'space-between' }}>
                <Button testID="restart" kind="danger" label="Bắt đầu lại" onPress={() => { setTools(false); setView('chat'); setSeen(new Set()); void app.restart(); }} />
                <Button kind="primary" label="Đóng" onPress={() => setTools(false)} />
              </Row>
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </SafeAreaView>
  );
}
