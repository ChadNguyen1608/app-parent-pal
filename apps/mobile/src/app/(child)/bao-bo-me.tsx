import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';

import { toApiError } from '@/data/errors';
import type { AlertKind } from '@/data/types';
import { uuidv4 } from '@/data/uuid';
import { useApp } from '@/state/app';
import { ALERT_KINDS, CHILD_QUESTION } from '@/ui/alert-text';
import { Btn, H1, Notice, P, Screen } from '@/ui/kit';
import { useAction } from '@/ui/useAction';

// CA-21 Báo bố mẹ ngay (D-58, D-67). Con chọn MỘT câu hỏi có sẵn, rồi bấm "Đồng ý" ở màn xác nhận thì mới gửi. KHÔNG có ô gõ chữ.
// Nút vào màn này chỉ hiện khi MD-CONBAO hiệu lực; máy chủ kiểm lần cuối (FORBIDDEN nếu bố mẹ vừa tắt: lời lỗi hiện trong màn).
// Câu chữ chính theo wireframe C21; ba câu hỏi theo D-67; màn xác nhận và dòng lỗi là "tạm", chờ chủ sản phẩm duyệt.
export default function BaoBoMe() {
  const router = useRouter();
  const { api, bindingEpoch, refreshBinding } = useApp();
  const [kind, setKind] = useState<AlertKind | null>(null);
  const [sent, setSent] = useState(false);
  const keys = useRef<Partial<Record<AlertKind, string>>>({});
  const act = useAction();

  async function send() {
    if (!kind) return;
    const k = kind;
    keys.current[k] ??= uuidv4(); // bấm lại sau lỗi mạng không gửi hai lần
    let conflict = false;
    const ok = await act.run(async () => {
      try {
        await api.childAlertSend(k, keys.current[k], bindingEpoch ?? undefined);
      } catch (e) {
        conflict = toApiError(e).code === 'CONFLICT_REV'; // liên kết đã đổi: đọc lại epoch từ máy chủ
        throw e;
      }
    });
    if (ok) setSent(true);
    else if (conflict) void refreshBinding();
  }

  if (sent) {
    return (
      <Screen big>
        <H1>Báo bố mẹ ngay</H1>
        <Notice kind="info">Đã gửi. Bố mẹ sẽ trả lời con.</Notice>
        <P big>Lịch hôm nay không tự đổi. Bố mẹ sẽ quyết định.</P>
        <Btn big label="Xong" onPress={() => router.back()} />
      </Screen>
    );
  }

  if (kind) {
    return (
      <Screen big>
        <H1>{CHILD_QUESTION[kind]}</H1>
        <P big>Con bấm Đồng ý thì bố mẹ nhận được thông báo ngay. (tạm)</P>
        {act.error ? <Notice>{act.error}</Notice> : null}
        <Btn big label="Đồng ý" onPress={send} busy={act.busy} />
        <Btn big kind="secondary" label="Không" onPress={() => { setKind(null); act.setError(null); }} disabled={act.busy} />
      </Screen>
    );
  }

  return (
    <Screen big>
      <H1>Báo bố mẹ ngay</H1>
      <P big>Bố mẹ sẽ nhận được thông báo ngay.</P>
      {ALERT_KINDS.map((k) => (
        <Btn key={k} big kind="secondary" label={CHILD_QUESTION[k]} onPress={() => setKind(k)} />
      ))}
      <P muted>Nếu con thấy không an toàn, bấm nút "Con cần giúp đỡ" ở trên.</P>
    </Screen>
  );
}
