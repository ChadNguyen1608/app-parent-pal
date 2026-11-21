import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';

import { useApp } from '@/state/app';
import { Btn } from '@/ui/kit';
import { Placeholder } from '@/ui/Placeholder';

export default function Screen() {
  const router = useRouter();
  const { api } = useApp();
  // Lối vào Pal (PA-22) chỉ hiện khi cờ pal_enabled bật (D-69). Lỗi hỏi trạng thái thì ẩn, không chặn màn.
  const [palOn, setPalOn] = useState(false);
  useFocusEffect(
    useCallback(() => {
      api.palQuota().then(
        (q) => setPalOn(q.state !== 'OFF' && q.state !== 'NO_HOUSEHOLD'),
        () => setPalOn(false),
      );
    }, [api]),
  );
  return (
    <Placeholder title="Lên kế hoạch" note="Giữ chỗ (PA-05, PA-07, PA-09...). Chưa có nội dung.">
      {palOn ? <Btn label="Trò chuyện với Pal" onPress={() => router.push('/(parent)/pal')} /> : null}
    </Placeholder>
  );
}
