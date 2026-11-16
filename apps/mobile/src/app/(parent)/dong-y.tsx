import { useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';

import { dependentsOf, parentsFirst, PURPOSE_CONBAO, PURPOSE_LICH } from '@/data/consent';
import type { ConsentOverview } from '@/data/types';
import { uuidv4 } from '@/data/uuid';
import { errorMessage } from '@/data/errors';
import { useApp } from '@/state/app';
import { Btn, CheckRow, H1, Note, Notice, P, Screen } from '@/ui/kit';
import { PURPOSE_LABELS, shortName } from '@/ui/purpose-labels';
import { useAction } from '@/ui/useAction';

// PA-02 Đồng ý theo từng tính năng. Câu chữ lấy nguyên từ wireframe; dòng đánh dấu "tạm" cần chủ sản phẩm duyệt.
// Mục tùy chọn không chọn sẵn (theo câu trong wireframe). Mục lõi (lịch) bắt buộc. MD-CONBAO hiện nhưng chưa bật được.
// Ghi tuần tự theo thứ tự cha trước con; mỗi mục một khóa gửi lặp nên bấm lại sau lỗi là an toàn.
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
  const purposes = overview?.purposes ?? [];
  const infoOf = (code: string) => purposes.find((p) => p.code === code);

  function toggle(code: string) {
    setPicked((cur) => {
      const next = new Set(cur);
      if (next.has(code)) {
        next.delete(code);
        for (const d of dependentsOf(purposes, code)) next.delete(d); // bỏ mục cha thì bỏ mục con
      } else next.add(code);
      return next;
    });
  }

  async function submit() {
    if (!child || !overview) return;
    const codes = parentsFirst(purposes, [PURPOSE_LICH, ...picked]);
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
      <H1>Đồng ý theo từng tính năng</H1>
      <P muted>Hồ sơ của {child.callName}</P>
      <P>
        Chọn những gì app được ghi lại về con. Mục tùy chọn không chọn sẵn. Bạn tắt được từng mục bất cứ lúc nào; tắt mục nào thì dữ liệu cũ của mục đó được ẩn ngay.
      </P>
      {loadError ? <Notice>{loadError}</Notice> : null}
      <View>
        {PURPOSE_LABELS.map((l) => {
          const info = infoOf(l.code);
          const required = l.code === PURPOSE_LICH;
          const pending = l.code === PURPOSE_CONBAO || (info ? !info.collectEnabled : false);
          const missingParent = info?.dependsOn.find((d) => d !== PURPOSE_LICH && !picked.has(d));
          const blocked = !info || pending || (missingParent !== undefined && !required);
          const desc = pending
            ? 'Đang chờ duyệt'
            : missingParent
              ? `${l.desc}. Cần bật "${shortName(missingParent)}" trước. (tạm)`
              : required
                ? `${l.desc} · bắt buộc`
                : l.desc;
          return (
            <CheckRow
              key={l.code}
              label={l.title}
              desc={desc}
              checked={required || picked.has(l.code)}
              disabled={required || blocked}
              onPress={() => toggle(l.code)}
            />
          );
        })}
      </View>
      <Note>Không thu: vị trí GPS, ảnh, ghi âm, sức khỏe, tên trường, địa chỉ.</Note>
      {act.error ? <Notice>{act.error}</Notice> : null}
      <Btn label="Đồng ý và tiếp tục" onPress={submit} busy={act.busy} disabled={!overview} />
      <Btn label="Không đồng ý" kind="secondary" onPress={() => setDeclined(true)} disabled={act.busy} />
    </Screen>
  );
}
