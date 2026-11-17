import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { errorMessage } from '@/data/errors';
import { useApp } from '@/state/app';
import { seenLines, type SeenLine } from '@/ui/ca16-lines';
import { Btn, H1, Notice, P, Screen } from '@/ui/kit';
import { useAction } from '@/ui/useAction';

// CA-16 Những gì bố mẹ thấy, kiêm bước con đồng ý (D-64). Dòng lấy từ các mục đích đang hiệu lực (khớp quyền thật); câu chữ nguyên từ wireframe.
// Không tải được danh sách thì báo và cho thử lại; "Con hiểu rồi" vẫn bấm được. Lần đầu (intro) bấm nút là ghi đồng ý của con lên máy chủ;
// ghi lỗi thì báo ngay trong màn, nút vẫn bấm lại được (không kẹt màn, không vào app khi chưa ghi được).
export default function BoMeThay() {
  const router = useRouter();
  const { api, childId, childStage, acknowledgeIntro } = useApp();
  const [lines, setLines] = useState<SeenLine[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const act = useAction();

  const load = useCallback(async () => {
    if (!childId) return;
    try {
      setLines(seenLines(new Set(await api.getMyConsent(childId))));
      setError(null);
    } catch (e) {
      setError(`${errorMessage(e)} Con thử lại nhé.`);
    }
  }, [api, childId]);
  useEffect(() => {
    void load();
  }, [load]);

  return (
    <Screen big>
      <H1>Những gì bố mẹ thấy</H1>
      <P big>Đã kết nối với gia đình.</P>
      {(lines ?? []).map((l) => (
        <View key={l.text} style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }} accessible accessibilityLabel={`${l.see ? 'Bố mẹ thấy' : 'Bố mẹ không thấy'}: ${l.text}`}>
          <Text aria-hidden style={{ fontSize: 20, fontWeight: '700', width: 24, color: l.see ? '#208AEF' : '#C0392B' }}>
            {l.see ? '✓' : '✗'}
          </Text>
          <Text style={{ flex: 1, fontSize: 20, lineHeight: 28 }}>
            <Text style={{ fontWeight: '700' }}>{l.see ? 'Bố mẹ thấy' : 'Bố mẹ không thấy'}:</Text> {l.text}
          </Text>
        </View>
      ))}
      {error ? <Notice>{error}</Notice> : null}
      {act.error ? <Notice>{`${act.error} Con bấm "Con hiểu rồi" lại nhé. (tạm)`}</Notice> : null}
      {error ? <Btn big kind="secondary" label="Thử lại" onPress={() => void load()} /> : null}
      <Btn
        big
        label="Con hiểu rồi"
        busy={act.busy}
        onPress={() => {
          if (childStage === 'intro') {
            // Guard của bo-me-thay vẫn mở khi đã 'ready' nên phải tự chuyển sang màn chính.
            void act.run(async () => {
              await acknowledgeIntro();
              router.replace('/(child)/(tabs)/hom-nay');
            });
          } else router.back();
        }}
      />
    </Screen>
  );
}
