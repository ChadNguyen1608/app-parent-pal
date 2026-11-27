import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import type { DeletionResult, WithdrawConsequences, WithdrawStep2 } from '@/data/types';
import { useApp } from '@/state/app';
import { Btn, Choice, Field, H1, Note, Notice, P, Screen } from '@/ui/kit';
import { shortName } from '@/ui/purpose-labels';
import { useAction } from '@/ui/useAction';

type Target = { kind: 'RUT'; childId: string } | { kind: 'GIA_DINH' } | { kind: 'NGUOI_LON_ROI' };
type Stage =
  | { name: 'chon' }
  | { name: 'hoi'; token: string | null; consequences: WithdrawConsequences | null }
  | { name: 'xong'; acceptedAt: string | null; replay: boolean };

const norm = (t: string) => t.trim().normalize('NFC').toLocaleUpperCase('vi-VN');

// PA-35 Xóa tài khoản và dữ liệu + PA-36 Xác nhận lần hai (cùng một route, hai giai đoạn).
// Phần PA-35 lấy nguyên từ wireframe (gõ XÓA, "Xác nhận lần 1"). PA-36 chưa vẽ: câu chữ "tạm".
// Vào từ PA-32 với scope=RUT (một con) hoặc scope=GIA_DINH (cả gia đình). "Rút đồng ý toàn bộ" của một con dùng consent_withdraw_all hai bước (bước 1 lấy hệ quả và mã, bước 2 gửi mã).
// Xóa gia đình, rời gia đình dùng deletion_request với confirm=true ở lần hai. Không bao giờ nói "đã xóa hết".
export default function Xoa() {
  const { scope, childId } = useLocalSearchParams<{ scope?: string; childId?: string }>();
  const { api, home, refreshHome, signOut } = useApp();
  const kids = home?.children ?? [];
  const isPrimary = home?.role === 'PRIMARY';
  const options: { key: string; label: string; target: Target }[] = isPrimary
    ? [
        ...kids.map((c) => ({ key: `r-${c.id}`, label: `Rút đồng ý và xóa dữ liệu của ${c.callName}`, target: { kind: 'RUT', childId: c.id } as Target })),
        { key: 'gd', label: 'Xóa gia đình và tài khoản', target: { kind: 'GIA_DINH' } },
      ]
    : [{ key: 'roi', label: 'Rời gia đình', target: { kind: 'NGUOI_LON_ROI' } }];
  const initial = scope === 'RUT' && childId ? `r-${childId}` : scope === 'GIA_DINH' && isPrimary ? 'gd' : options.length === 1 ? options[0].key : null;
  const [picked, setPicked] = useState<string | null>(initial);
  const [typed, setTyped] = useState('');
  const [typedError, setTypedError] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>({ name: 'chon' });
  const act = useAction();
  const target = options.find((o) => o.key === picked)?.target ?? null;
  const childName = target?.kind === 'RUT' ? kids.find((c) => c.id === target.childId)?.callName : kids.length === 1 ? kids[0].callName : 'con';

  async function first() {
    if (!target) return setTypedError('Bạn chọn một việc nhé. (tạm)');
    if (norm(typed) !== 'XÓA') return setTypedError('Bạn gõ XÓA để xác nhận. (tạm)');
    setTypedError(null);
    if (target.kind !== 'RUT') return setStage({ name: 'hoi', token: null, consequences: null });
    const t = target;
    await act.run(async () => {
      const r = await api.withdrawAllStart(t.childId);
      setStage({ name: 'hoi', token: r.confirmToken, consequences: r.consequences });
    });
  }

  async function second() {
    if (!target || stage.name !== 'hoi') return;
    const t = target;
    const token = stage.token;
    const ok = await act.run(async () => {
      let r: WithdrawStep2 | DeletionResult;
      if (t.kind === 'RUT') r = await api.withdrawAllConfirm(t.childId, token ?? '');
      else r = await api.deletionRequest(t.kind);
      setStage({ name: 'xong', acceptedAt: r.acceptedAt, replay: r.replay });
    });
    // Mã hết hạn hoặc sai: máy chủ buộc hỏi lại từ đầu. Lời lỗi vẫn hiện trong màn.
    if (!ok) setStage({ name: 'chon' });
  }

  async function finish() {
    if (target?.kind === 'RUT') await refreshHome().catch(() => undefined);
    else await signOut();
  }

  if (stage.name === 'xong') {
    const day = stage.acceptedAt ? new Date(stage.acceptedAt).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) : '';
    return (
      <Screen>
        <H1>Đã nhận yêu cầu</H1>
        <P>
          Mình đã nhận yêu cầu{day ? ` ngày ${day}` : ''}. Dữ liệu đã được ẩn ngay. Mình chưa xóa hẳn: thời hạn xóa hẳn chưa chốt. (tạm)
        </P>
        {stage.replay ? <Note>Yêu cầu này đã được gửi trước đó, mình giữ ngày nhận lần đầu. (tạm)</Note> : null}
        <Btn label={target?.kind === 'RUT' ? 'Xong' : 'Đăng xuất'} onPress={finish} />
      </Screen>
    );
  }

  if (stage.name === 'hoi') {
    const c = stage.consequences;
    return (
      <Screen>
        <H1>Xác nhận lần hai</H1>
        <P>Bạn sắp gửi yêu cầu này. Mình nhắc lại những gì sẽ xảy ra: (tạm)</P>
        {c ? (
          <View style={{ gap: 6 }}>
            {c.purposesWithdrawn.length > 0 ? <P>• Rút đồng ý: {c.purposesWithdrawn.map(shortName).join(', ')}</P> : null}
            {c.childHidden ? <P>• Ẩn hồ sơ của {childName}</P> : null}
            {c.deviceUnlinked ? <P>• Ngắt kết nối máy của {childName}</P> : null}
            {c.deletionRequest ? <P>• Tạo yêu cầu xóa dữ liệu</P> : null}
            {!c.hardDeletedNow ? <P>• Dữ liệu chưa bị xóa hẳn ngay; thời hạn xóa hẳn chưa chốt</P> : null}
            {!c.canReconsent ? <P>• Hồ sơ này không đồng ý lại được</P> : null}
          </View>
        ) : (
          <View style={{ gap: 6 }}>
            <P>• Ngừng thu mọi dữ liệu</P>
            <P>• Ẩn ngay dữ liệu, rồi xóa hẳn theo thời hạn (chờ luật sư)</P>
            {target?.kind === 'GIA_DINH' ? <P>• Ngắt kết nối máy của con</P> : null}
          </View>
        )}
        {act.error ? <Notice>{act.error}</Notice> : null}
        <Btn label="Xác nhận lần 2" kind="danger" onPress={second} busy={act.busy} />
        <Btn label="Quay lại" kind="secondary" onPress={() => setStage({ name: 'chon' })} disabled={act.busy} />
      </Screen>
    );
  }

  return (
    <Screen>
      <H1>Xóa tài khoản</H1>
      {options.length > 1 || kids.length > 1 ? (
        <View style={{ gap: 8 }}>
          {options.map((o) => (
            <Choice key={o.key} label={o.label} selected={picked === o.key} onPress={() => setPicked(o.key)} />
          ))}
        </View>
      ) : null}
      <View style={{ gap: 6 }}>
        <P>Xóa tài khoản sẽ:</P>
        <P>• Ngừng thu mọi dữ liệu</P>
        <P>• Ngắt kết nối máy của {childName}</P>
        <P>• Ẩn ngay dữ liệu, rồi xóa hẳn theo thời hạn (chờ luật sư)</P>
      </View>
      <Field label="Gõ XÓA để xác nhận" placeholder="XÓA" value={typed} onChangeText={(t) => { setTyped(t); setTypedError(null); }} autoCapitalize="characters" error={typedError} />
      {act.error ? <Notice>{act.error}</Notice> : null}
      <Btn label="Xác nhận lần 1" kind="danger" onPress={first} busy={act.busy} />
      <Note>Sẽ hỏi xác nhận lần 2 trước khi tạo yêu cầu xóa.</Note>
    </Screen>
  );
}
