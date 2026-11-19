import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { View } from 'react-native';

import { OPTIONAL_PURPOSES, PURPOSE_CONBAO, PURPOSE_SUCKHOE, effectiveCodes } from '@/data/consent';
import { errorMessage } from '@/data/errors';
import type { ChildSettings, ConsentOverview } from '@/data/types';
import { useApp } from '@/state/app';
import { Btn, Choice, H1, Note, Notice, P, Screen, SwitchRow } from '@/ui/kit';
import { OPTIONAL_LABELS, shortName } from '@/ui/purpose-labels';
import { useAction } from '@/ui/useAction';

// Cài đặt dữ liệu (D-73), vào từ tab Gia đình. Thay phần công tắc và "Rút toàn bộ" của PA-32 cũ.
// Ba công tắc cho từng con: lưu sức khỏe (MD-SUCKHOE), cho con báo bố mẹ ngay (MD-CONBAO), trò chuyện AI trên máy con (ai_chat_enabled).
// Tắt sức khỏe hoặc báo bố mẹ thì dữ liệu cũ của mục đó bị ẩn ngay và không hiện lại (hỏi xác nhận). Công tắc AI chỉ là chuẩn bị: mặc định tắt, chưa có tính năng.
// Cuối màn: xóa dữ liệu một con hoặc cả gia đình, giữ luồng hai bước đã có ở màn Xóa. Câu chữ "tạm", chờ chủ sản phẩm duyệt.
export default function CaiDatDuLieu() {
  const router = useRouter();
  const { api, home } = useApp();
  const kids = home?.children ?? [];
  const [childId, setChildId] = useState<string | null>(kids[0]?.id ?? null);
  const [overview, setOverview] = useState<ConsentOverview | null>(null);
  const [settings, setSettings] = useState<ChildSettings | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [confirmOff, setConfirmOff] = useState<string | null>(null);
  const act = useAction();
  const cid = childId ?? kids[0]?.id ?? null;
  const isPrimary = home?.role === 'PRIMARY';

  const load = useCallback(async () => {
    if (!cid) return;
    try {
      const [ov, st] = await Promise.all([api.getConsentOverview(cid), api.childSettingGet(cid)]);
      setOverview(ov);
      setSettings(st);
      setLoadError(null);
    } catch (e) {
      setLoadError(errorMessage(e));
    }
  }, [api, cid]);
  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  if (!cid || kids.length === 0) return null;
  const childName = kids.find((c) => c.id === cid)?.callName ?? 'con';
  const effective = overview ? new Set(effectiveCodes(overview)) : new Set<string>();
  const isOn = (code: string) => overview?.states[code]?.state === 'DANG_BAT';
  const labelOf = (code: string) => OPTIONAL_LABELS.find((l) => l.code === code)!;

  async function setConsent(code: string, event: 'DONG_Y' | 'RUT') {
    setConfirmOff(null);
    await act.run(async () => {
      await api.consentRecord({ childId: cid!, purposeCode: code, event });
      await load();
    });
  }

  async function setAiChat(v: boolean) {
    await act.run(async () => {
      setSettings(await api.childSettingSet(cid!, 'ai_chat_enabled', v));
    });
  }

  function consentRow(code: string) {
    const l = labelOf(code);
    const info = overview?.purposes.find((p) => p.code === code);
    const off = info ? !info.collectEnabled : false;
    const on = isOn(code);
    const desc = off ? 'Chưa mở ở bản thử' : on ? (effective.has(code) ? l.desc : 'Bật, nhưng chưa dùng được. (tạm)') : `Đang tắt. ${l.desc}`;
    return (
      <SwitchRow
        key={code}
        label={l.title}
        desc={desc}
        value={on && !off}
        disabled={!overview || off || !isPrimary || act.busy}
        onValueChange={(v) => (v ? void setConsent(code, 'DONG_Y') : setConfirmOff(code))}
      />
    );
  }

  return (
    <Screen>
      <H1>Cài đặt dữ liệu</H1>
      {kids.length > 1 ? (
        <View style={{ gap: 8 }}>
          {kids.map((c) => (
            <Choice
              key={c.id}
              label={c.callName}
              selected={cid === c.id}
              onPress={() => {
                setChildId(c.id);
                setOverview(null);
                setSettings(null);
                setConfirmOff(null);
              }}
            />
          ))}
        </View>
      ) : (
        <P muted>Hồ sơ của {kids[0].callName}</P>
      )}
      {loadError ? <Notice>{loadError}</Notice> : null}
      <View>
        {consentRow(PURPOSE_SUCKHOE)}
        {consentRow(PURPOSE_CONBAO)}
        <SwitchRow
          label="Trò chuyện AI trên máy con"
          desc="Chuẩn bị cho bản sau, hiện chưa có tính năng này. Mặc định tắt. (tạm)"
          value={settings?.aiChatEnabled === true}
          disabled={!settings || !isPrimary || act.busy}
          onValueChange={(v) => void setAiChat(v)}
        />
      </View>
      {confirmOff && OPTIONAL_PURPOSES.includes(confirmOff) ? (
        <View style={{ gap: 8 }}>
          <Notice kind="info">
            {`Tắt "${shortName(confirmOff)}": dữ liệu cũ của mục này được ẩn ngay, sẽ không hiện lại khi bạn bật lại, và được xếp hàng xóa. Bạn tắt chứ? (tạm)`}
          </Notice>
          <Btn label="Tắt" kind="danger" onPress={() => void setConsent(confirmOff, 'RUT')} busy={act.busy} />
          <Btn label="Giữ nguyên" kind="secondary" onPress={() => setConfirmOff(null)} />
        </View>
      ) : null}
      {act.error ? <Notice>{act.error}</Notice> : null}
      {!isPrimary ? <Note>Chỉ người quản lý chính đổi được các mục này. (tạm)</Note> : null}
      {isPrimary ? (
        <View style={{ gap: 8 }}>
          <P muted>Xóa dữ liệu (có hai bước xác nhận):</P>
          <Btn label={`Xóa dữ liệu của ${childName}`} kind="secondary" onPress={() => router.push({ pathname: '/(parent)/xoa', params: { scope: 'RUT', childId: cid } })} />
          <Btn label="Xóa dữ liệu của cả gia đình" kind="secondary" onPress={() => router.push({ pathname: '/(parent)/xoa', params: { scope: 'GIA_DINH' } })} />
        </View>
      ) : null}
    </Screen>
  );
}
