import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';

import { PURPOSE_CONBAO } from '@/data/consent';
import { useApp } from '@/state/app';
import { Btn } from '@/ui/kit';
import { Placeholder } from '@/ui/Placeholder';

// CA-04 (giữ chỗ) + lối vào CA-21 "Báo bố mẹ ngay". Nút CHỈ hiện khi MD-CONBAO đang hiệu lực (bố mẹ đã bật bằng đồng ý riêng, D-67).
// Không đọc được mục đích hiệu lực thì không hiện nút (không hứa điều chưa chắc).
export default function Screen() {
  const router = useRouter();
  const { api, childId } = useApp();
  const [canAlert, setCanAlert] = useState(false);
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      if (childId) {
        api
          .getMyConsent(childId)
          .then((codes) => alive && setCanAlert(codes.includes(PURPOSE_CONBAO)))
          .catch(() => alive && setCanAlert(false));
      }
      return () => {
        alive = false;
      };
    }, [api, childId]),
  );
  return (
    <Placeholder title="Hôm nay" note="Giữ chỗ (CA-04). Chưa có nội dung.">
      {canAlert ? <Btn big kind="secondary" label="Báo bố mẹ ngay" onPress={() => router.push('/(child)/bao-bo-me')} /> : null}
    </Placeholder>
  );
}
