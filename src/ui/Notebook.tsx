import { Feather } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, TextInput, View } from 'react-native';
import { relativeDay } from '../ai/text';
import { AppState, MemoryItem } from '../domain/types';
import { Button, Row, T } from './primitives';
import { font, space, usePalette } from './theme';

const DAY = 86_400_000;

function dueText(dueAt: number | undefined, now: number) {
  if (!dueAt) return '';
  const d = Math.ceil((dueAt - now) / DAY);
  if (d <= 0) return 'Pal sẽ hỏi lại lần tới bạn mở app';
  if (d === 1) return 'Pal sẽ hỏi lại vào ngày mai';
  return `Pal sẽ hỏi lại sau ${d} ngày nữa`;
}

type TabId = string; // id của bé, hoặc 'private'

export function Notebook({
  state,
  now,
  onOpen,
  onResolve,
  highlight,
}: {
  state: AppState;
  now: number;
  onOpen: (m: MemoryItem) => void;
  onResolve: (id: string) => void;
  highlight?: Set<string>;
}) {
  const c = usePalette();
  const [picked, setPicked] = useState<TabId | null>(null);
  // Mặc định mở sổ của bé đầu tiên; giữ lựa chọn của phụ huynh nếu tab đó còn tồn tại.
  const valid = picked === 'private' || state.children.some((k) => k.id === picked);
  const tab: TabId = valid && picked ? picked : state.children[0]?.id ?? 'private';
  const setTab = setPicked;

  const tabs = [...state.children.map((k) => ({ id: k.id, label: k.age ? `${k.name}, ${k.age} tuổi` : k.name })), { id: 'private', label: 'Riêng của bạn' }];
  const mine = state.memories.filter((m) => (tab === 'private' ? m.scope === 'private' : m.childId === tab && m.scope === 'family'));
  const open = mine.filter((m) => m.kind === 'followup' && !m.resolvedAt).sort((a, b) => (a.dueAt ?? 0) - (b.dueAt ?? 0));
  const facts = mine.filter((m) => m.kind === 'fact');
  const timeline = mine
    .filter((m) => m.kind === 'event' || m.kind === 'parent' || (m.kind === 'followup' && m.resolvedAt))
    .sort((a, b) => (b.resolvedAt ?? b.createdAt) - (a.resolvedAt ?? a.createdAt));
  const kid = state.children.find((k) => k.id === tab);

  return (
    <ScrollView testID="notebook" contentContainerStyle={{ padding: space(5), gap: space(6), paddingBottom: space(12) }}>
      <View style={{ gap: space(1) }}>
        <T variant="title" weight="semibold" accessibilityRole="header">
          Sổ tay về con
        </T>
        <T soft>Pal tự ghi lại từ những gì bạn kể. Bạn sửa hoặc xóa được mọi dòng.</T>
      </View>

      <Row style={{ flexWrap: 'wrap' }} >
        {tabs.map((t) => {
          const on = t.id === tab;
          return (
            <Pressable
              key={t.id}
              testID={`tab-${t.id === 'private' ? 'private' : t.label.split(',')[0]}`}
              onPress={() => setTab(t.id)}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              style={{ paddingHorizontal: space(3.5), paddingVertical: space(2), borderRadius: 999, backgroundColor: on ? c.ink : 'transparent', borderWidth: 1, borderColor: on ? c.ink : c.line }}
            >
              <T weight="medium" color={on ? c.bg : c.ink} style={{ fontSize: 14, lineHeight: 20 }}>
                {t.label}
              </T>
            </Pressable>
          );
        })}
      </Row>

      {tab === 'private' && (
        <Row style={{ alignItems: 'flex-start' }}>
          <Feather name="lock" size={14} color={c.inkSoft} style={{ marginTop: 3 }} />
          <T variant="small" soft style={{ flex: 1 }}>
            Những dòng ở đây chỉ bạn thấy. Người lớn khác trong nhà không xem được, kể cả khi dùng chung tài khoản gia đình.
          </T>
        </Row>
      )}

      {!mine.length && (
        <T soft testID="notebook-empty">
          {tab === 'private'
            ? 'Chưa có gì. Khi bạn kể về cảm xúc của chính mình, Pal sẽ ghi vào đây.'
            : `Chưa có gì về ${kid?.name ?? 'bé'}. Kể cho Pal một chuyện của bé hôm nay nhé.`}
        </T>
      )}

      {open.length > 0 && (
        <Section title="Đang theo dõi" testID="section-followup">
          {open.map((m) => (
            <View key={m.id} style={{ backgroundColor: c.sageTint, borderRadius: 14, padding: space(3.5), gap: space(2) }}>
              <Item m={m} onOpen={onOpen} hot={highlight?.has(m.id)} />
              <Row style={{ justifyContent: 'space-between' }}>
                <T variant="small" color={c.sage} weight="medium" style={{ flex: 1 }}>
                  {dueText(m.dueAt, now)}
                </T>
                <Button kind="quiet" label="Đã ổn" onPress={() => onResolve(m.id)} testID="resolve" icon={<Feather name="check" size={14} color={c.ink} />} />
              </Row>
            </View>
          ))}
        </Section>
      )}

      {facts.length > 0 && (
        <Section title="Hồ sơ" testID="section-facts">
          {facts.map((m) => (
            <Item key={m.id} m={m} onOpen={onOpen} hot={highlight?.has(m.id)} />
          ))}
        </Section>
      )}

      {timeline.length > 0 && (
        <Section title="Dòng thời gian" testID="section-timeline">
          {timeline.map((m) => (
            <View key={m.id} style={{ flexDirection: 'row', gap: space(3) }}>
              <T variant="small" soft style={{ width: 84 }}>
                {relativeDay(m.resolvedAt ?? m.createdAt, now)}
              </T>
              <View style={{ flex: 1 }}>
                <Item m={m} onOpen={onOpen} prefix={m.resolvedAt ? 'Đã ổn: ' : undefined} hot={highlight?.has(m.id)} />
              </View>
            </View>
          ))}
        </Section>
      )}
    </ScrollView>
  );
}

function Section({ title, children, testID }: { title: string; children: React.ReactNode; testID?: string }) {
  const c = usePalette();
  return (
    <View testID={testID} style={{ gap: space(3) }}>
      <T variant="lead" weight="semibold" accessibilityRole="header" style={{ borderBottomWidth: 1, borderBottomColor: c.line, paddingBottom: space(1.5) }}>
        {title}
      </T>
      {children}
    </View>
  );
}

function Item({ m, onOpen, prefix, hot }: { m: MemoryItem; onOpen: (m: MemoryItem) => void; prefix?: string; hot?: boolean }) {
  const c = usePalette();
  return (
    <Pressable
      testID="memory-item"
      onPress={() => onOpen(m)}
      accessibilityRole="button"
      accessibilityLabel={`${m.text}. Chạm để sửa`}
      style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'flex-start', gap: space(2), opacity: pressed ? 0.7 : 1 })}
    >
      <T style={{ flex: 1 }}>
        {prefix ? <T soft>{prefix}</T> : null}
        <T style={hot ? { backgroundColor: c.markTint } : undefined}>{m.text}</T>
      </T>
      <Feather name="edit-2" size={14} color={c.inkSoft} style={{ marginTop: 4 }} />
    </Pressable>
  );
}

/** Sửa một dòng trong sổ tay: đổi chữ, đổi ai được thấy, xóa hẳn. */
export function MemoryEditor({
  item,
  onClose,
  onSave,
  onToggleScope,
  onDelete,
}: {
  item: MemoryItem | null;
  onClose: () => void;
  onSave: (id: string, text: string) => void;
  onToggleScope: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const c = usePalette();
  const [text, setText] = useState('');
  const [confirm, setConfirm] = useState(false);
  useEffect(() => {
    setText(item?.text ?? '');
    setConfirm(false);
  }, [item]);
  if (!item) return null;
  const isPrivate = item.scope === 'private';
  return (
    <Modal transparent animationType="fade" visible onRequestClose={onClose}>
      <Pressable onPress={onClose} accessibilityLabel="Đóng" style={{ flex: 1, backgroundColor: 'rgba(15,25,32,0.45)', justifyContent: 'flex-end', alignItems: 'center' }}>
        <Pressable
          testID="memory-editor"
          onPress={() => {}}
          style={{ width: '100%', maxWidth: 520, backgroundColor: c.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: space(5), gap: space(4) }}
        >
          <T variant="lead" weight="semibold" accessibilityRole="header">
            Sửa dòng này
          </T>
          <TextInput
            testID="memory-editor-input"
            value={text}
            onChangeText={setText}
            multiline
            accessibilityLabel="Nội dung ghi nhớ"
            style={{ fontFamily: font.regular, fontSize: 15, lineHeight: 22, color: c.ink, backgroundColor: c.surface, borderRadius: 14, borderWidth: 1, borderColor: c.line, padding: space(3.5), minHeight: 72 }}
          />
          <Pressable
            testID="scope-toggle"
            onPress={() => onToggleScope(item.id)}
            accessibilityRole="switch"
            accessibilityState={{ checked: isPrivate }}
            style={{ flexDirection: 'row', alignItems: 'center', gap: space(3) }}
          >
            <View style={{ width: 40, height: 24, borderRadius: 12, backgroundColor: isPrivate ? c.ink : c.line, padding: 3, alignItems: isPrivate ? 'flex-end' : 'flex-start' }}>
              <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: c.bg }} />
            </View>
            <View style={{ flex: 1 }}>
              <T weight="medium">Chỉ mình tôi thấy</T>
              <T variant="small" soft>
                {isPrivate ? 'Người lớn khác trong nhà không xem được dòng này.' : 'Cả nhà cùng xem được dòng này.'}
              </T>
            </View>
          </Pressable>
          <Row style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <Button
              testID="delete-memory"
              kind="danger"
              label={confirm ? 'Bấm lần nữa để xóa' : 'Xóa khỏi sổ tay'}
              icon={<Feather name="trash-2" size={14} color={c.urgent} />}
              onPress={() => {
                if (!confirm) return setConfirm(true);
                onDelete(item.id);
                onClose();
              }}
            />
            <Row>
              <Button kind="ghost" label="Hủy" onPress={onClose} />
              <Button
                testID="save-memory"
                kind="primary"
                label="Lưu"
                onPress={() => {
                  onSave(item.id, text);
                  onClose();
                }}
              />
            </Row>
          </Row>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
