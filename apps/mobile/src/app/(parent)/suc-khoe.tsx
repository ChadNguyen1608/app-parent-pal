import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { effectiveCodes, PURPOSE_SUCKHOE } from '@/data/consent';
import { errorMessage } from '@/data/errors';
import type { HealthKind, HealthNote, MemberRole } from '@/data/types';
import { useApp } from '@/state/app';
import { Btn, Choice, Field, H1, Note, Notice, P, Screen } from '@/ui/kit';
import { useAction } from '@/ui/useAction';

// PA-06 (phần sức khỏe) Sức khỏe của con, trong hồ sơ con (D-66). Nấc 1 chỉ LƯU và HIỂN THỊ, chưa dùng để lập lịch hay cho Pal.
// D-73: không còn bước hỏi đồng ý ở đây (MD-SUCKHOE ghi mặc định khi tạo con). Nếu phụ huynh đã tắt ở Cài đặt dữ liệu thì màn chỉ chỉ đường tới đó. Mỗi ghi chú hiện nguồn: ai khai, vai trò, ngày, ghi chú nguồn.
// Tắt (ẩn khỏi mọi nơi dùng) và xóa luôn làm được. Máy con không bao giờ thấy màn này. Wireframe chưa vẽ: câu chữ "tạm".
const KIND_LABEL: Record<HealthKind, string> = { DI_UNG: 'Dị ứng', THUOC: 'Thuốc', KHAC: 'Khác' };
const KINDS: HealthKind[] = ['DI_UNG', 'THUOC', 'KHAC'];
const ROLE_LABEL: Record<MemberRole, string> = { PRIMARY: 'người quản lý chính', SUPPORTER: 'người lớn hỗ trợ', OBSERVER: 'người lớn theo dõi' };

function sourceLine(n: HealthNote): string {
  const [y, m, d] = n.declaredAt.split('-');
  const day = y && m && d ? `${d}/${m}/${y}` : n.declaredAt;
  return `${n.declaredByName ?? 'Một người lớn'} (${ROLE_LABEL[n.declaredByRole]}) khai, ${day}`;
}

type Form = { id: string | null; kind: HealthKind; content: string; sourceNote: string };

export default function SucKhoe() {
  const { childId: paramId } = useLocalSearchParams<{ childId?: string }>();
  const router = useRouter();
  const { api, home } = useApp();
  const child = home?.children.find((c) => c.id === paramId) ?? home?.children[0];
  const isPrimary = home?.role === 'PRIMARY';
  const [allowed, setAllowed] = useState<boolean | null>(null); // MD-SUCKHOE đang hiệu lực
  const [notes, setNotes] = useState<HealthNote[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [form, setForm] = useState<Form | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const act = useAction();
  const cid = child?.id ?? null;

  const load = useCallback(async () => {
    if (!cid) return;
    try {
      const ov = await api.getConsentOverview(cid);
      const ok = effectiveCodes(ov).includes(PURPOSE_SUCKHOE);
      setAllowed(ok);
      setNotes(ok ? await api.listHealthNotes(cid) : []);
      setLoadError(null);
    } catch (e) {
      setLoadError(errorMessage(e));
    }
  }, [api, cid]);
  useEffect(() => {
    void load();
  }, [load]);

  if (!child) return null;

  async function save() {
    if (!form) return;
    if (form.content.trim() === '') return setFormError('Bạn nhập nội dung ghi chú nhé. (tạm)');
    if (form.content.trim().length > 500) return setFormError('Nội dung tối đa 500 ký tự. (tạm)');
    setFormError(null);
    const f = form;
    const ok = await act.run(async () => {
      if (f.id) await api.healthNoteUpdate(f.id, { kind: f.kind, content: f.content, sourceNote: f.sourceNote });
      else await api.healthNoteAdd({ childId: child!.id, kind: f.kind, content: f.content, sourceNote: f.sourceNote });
      await load();
    });
    if (ok) {
      setForm(null);
    }
  }

  async function toggle(n: HealthNote) {
    await act.run(async () => {
      await api.healthNoteUpdate(n.id, { active: !n.active });
      await load();
    });
  }

  async function remove(n: HealthNote) {
    setConfirmDelete(null);
    await act.run(async () => {
      await api.healthNoteDelete(n.id);
      await load();
    });
  }

  if (allowed === false || (allowed === null && !loadError)) {
    return (
      <Screen>
        <H1>Sức khỏe của {child.callName}</H1>
        {allowed === null ? (
          <P muted>Đang mở...</P>
        ) : (
          <>
            <P>Bạn đang tắt việc lưu thông tin sức khỏe của {child.callName}, nên danh sách ghi chú đang ẩn. (tạm)</P>
            <Note>Bật lại ở Cài đặt dữ liệu để thêm ghi chú mới. Ghi chú cũ đã ẩn khi tắt thì không hiện lại. (tạm)</Note>
            <Btn label="Mở cài đặt dữ liệu" onPress={() => router.push('/(parent)/cai-dat-du-lieu')} />
          </>
        )}
      </Screen>
    );
  }

  if (form) {
    return (
      <Screen>
        <H1>{form.id ? 'Sửa ghi chú' : 'Thêm ghi chú'}</H1>
        <View style={{ gap: 8 }}>
          <P>Loại</P>
          {KINDS.map((k) => (
            <Choice key={k} label={KIND_LABEL[k]} selected={form.kind === k} onPress={() => setForm({ ...form, kind: k })} />
          ))}
        </View>
        <Field label="Nội dung" value={form.content} onChangeText={(t) => setForm({ ...form, content: t })} multiline maxLength={500} />
        <Field label="Nguồn (không bắt buộc)" hint='Ví dụ "theo giấy khám". Người khai và ngày khai được ghi tự động.' value={form.sourceNote} onChangeText={(t) => setForm({ ...form, sourceNote: t })} maxLength={200} />
        {formError ? <Notice>{formError}</Notice> : null}
        {act.error ? <Notice>{act.error}</Notice> : null}
        <Btn label="Lưu" onPress={save} busy={act.busy} />
        <Btn label="Hủy" kind="secondary" onPress={() => { setForm(null); setFormError(null); }} disabled={act.busy} />
      </Screen>
    );
  }

  return (
    <Screen>
      <H1>Sức khỏe của {child.callName}</H1>
      <Note>Chỉ bố mẹ được phép thấy. Máy của con không thấy. Mình chỉ lưu và hiển thị, chưa dùng để lập lịch. (tạm)</Note>
      {loadError ? <Notice>{loadError}</Notice> : null}
      {act.error ? <Notice>{act.error}</Notice> : null}
      {notes.length === 0 && !loadError ? <P muted>Chưa có ghi chú nào.</P> : null}
      {notes.map((n) => (
        <View key={n.id} style={{ borderWidth: 1, borderColor: '#C9CED6', borderRadius: 12, padding: 14, gap: 6, opacity: n.active ? 1 : 0.7 }}>
          <Text style={{ fontSize: 16, fontWeight: '700' }}>
            {KIND_LABEL[n.kind]}
            {n.active ? '' : ' · đang tắt'}
          </Text>
          <P>{n.content}</P>
          <P muted>{sourceLine(n)}</P>
          {n.sourceNote ? <P muted>Nguồn: {n.sourceNote}</P> : null}
          {isPrimary ? (
            confirmDelete === n.id ? (
              <View style={{ gap: 8 }}>
                <Notice kind="info">Xóa ghi chú này? Không khôi phục được. (tạm)</Notice>
                <Btn label="Xóa" kind="danger" onPress={() => void remove(n)} busy={act.busy} />
                <Btn label="Giữ lại" kind="secondary" onPress={() => setConfirmDelete(null)} />
              </View>
            ) : (
              <View style={{ gap: 8 }}>
                <Btn label={n.active ? 'Tắt' : 'Bật lại'} kind="secondary" onPress={() => void toggle(n)} disabled={act.busy} />
                <Btn label="Sửa" kind="secondary" onPress={() => setForm({ id: n.id, kind: n.kind, content: n.content, sourceNote: n.sourceNote ?? '' })} disabled={act.busy} />
                <Btn label="Xóa" kind="secondary" onPress={() => setConfirmDelete(n.id)} disabled={act.busy} />
              </View>
            )
          ) : null}
        </View>
      ))}
      {isPrimary ? <Btn label="Thêm ghi chú" onPress={() => setForm({ id: null, kind: 'DI_UNG', content: '', sourceNote: '' })} disabled={act.busy} /> : <Note>Chỉ người quản lý chính thêm hoặc sửa được. (tạm)</Note>}
    </Screen>
  );
}
