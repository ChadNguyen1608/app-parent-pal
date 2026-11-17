import { useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';

import { PURPOSE_LICH } from '@/data/consent';
import type { ConsentOverview } from '@/data/types';
import { uuidv4 } from '@/data/uuid';
import { errorMessage } from '@/data/errors';
import { useApp } from '@/state/app';
import { Btn, CheckRow, H1, Note, Notice, P, Screen } from '@/ui/kit';
import { CORE_LABEL, OPTIONAL_LABELS } from '@/ui/purpose-labels';
import { useAction } from '@/ui/useAction';

// PA-02 Đồng ý (D-64): MỘT đồng ý cốt lõi (MD-LICH) và hai lựa chọn riêng không chọn sẵn (MD-SUCKHOE, MD-CONBAO).
// Không còn danh sách từng tính năng. Wireframe PA-02 chưa vẽ theo mô hình mới: câu chữ ở purpose-labels.ts và dưới đây là "tạm".
// Ghi tuần tự: mục lõi trước, rồi mục riêng đã chọn; mỗi mục một khóa gửi lặp nên bấm lại sau lỗi là an toàn.
export default function DongY() {
  const { childId: paramId } = useLocalSearchParams<{ childId?: string }>();
  const { api, home, refreshHome, signOut } = useApp();
  const child = home?.children.find((c) => c.id === paramId) ?? home?.children.find((c) => !c.coreConsent) ?? home?.children[0];
  const [overview, setOverview] = useState<ConsentOverview | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [declined, setDeclined] = useState(false);
  const keys = useRef<Record<string, string>>({});
  const act = useAction();

  useEffect(() => {
    if (!child) return;
    let alive = true;
    api
      .getConsentOverview(child.id)
      .then((o) => alive && setOverview(o))
      .catch((e) => alive && setLoadError(errorMessage(e)));
    return () => {
      alive = false;
    };
  }, [api, child?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!child) return null;

  function toggle(code: string) {
    setPicked((cur) => {
      const next = new Set(cur);
      if (!next.delete(code)) next.add(code);
      return next;
    });
  }

  async function submit() {
    if (!child || !overview) return;
    const codes = [PURPOSE_LICH, ...OPTIONAL_LABELS.map((l) => l.code).filter((c) => picked.has(c))];
    await act.run(async () => {
      for (const code of codes) {
        keys.current[code] ??= uuidv4();
        await api.consentRecord({ childId: child.id, purposeCode: code, event: 'DONG_Y', idempotencyKey: keys.current[code] });
      }
      await refreshHome(); // cổng ở _layout tự chuyển vào khung chính
    });
  }

  if (declined) {
    return (
      <Screen>
        <H1>Mình dừng ở đây</H1>
        <P>Mình chưa dùng thông tin nào của con. Khi nào sẵn sàng, bạn quay lại và đồng ý nhé. (tạm)</P>
        <Btn label="Quay lại" onPress={() => setDeclined(false)} />
        <Btn label="Đăng xuất" kind="secondary" onPress={() => void signOut()} />
      </Screen>
    );
  }

  return (
    <Screen>
      <H1>Đồng ý sử dụng</H1>
      <P muted>Hồ sơ của {child.callName}</P>
      <View style={{ gap: 6 }}>
        <P>Để dùng app, bạn đồng ý với phần cốt lõi:</P>
        <Note>{CORE_LABEL.desc}</Note>
      </View>
      <View>
        <P muted>Hai việc tùy chọn, không chọn sẵn. Bạn bật hoặc tắt sau được:</P>
        {OPTIONAL_LABELS.map((l) => {
          const info = overview?.purposes.find((p) => p.code === l.code);
          const off = info ? !info.collectEnabled : false;
          return <CheckRow key={l.code} label={l.title} desc={off ? 'Chưa mở ở bản thử' : l.desc} checked={picked.has(l.code)} disabled={!overview || off} onPress={() => toggle(l.code)} />;
        })}
      </View>
      <Note>Không thu: vị trí GPS, ảnh, ghi âm, tên trường, địa chỉ. (tạm)</Note>
      {loadError ? <Notice>{loadError}</Notice> : null}
      {act.error ? <Notice>{act.error}</Notice> : null}
      <Btn label="Đồng ý và tiếp tục" onPress={submit} busy={act.busy} disabled={!overview} />
      <Btn label="Không đồng ý" kind="secondary" onPress={() => setDeclined(true)} disabled={act.busy} />
    </Screen>
  );
}
