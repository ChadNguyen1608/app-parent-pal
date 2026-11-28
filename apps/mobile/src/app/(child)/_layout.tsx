import { Redirect, Stack } from 'expo-router';

import { useApp } from '@/state/app';
import { Center, P } from '@/ui/kit';
import { APP_VARIANT } from '@/variant';

// Cổng theo giai đoạn ghép và gói (D-72: hộ không PREMIUM thì máy con ở CA-18 Tạm dừng).
// Cổng theo giai đoạn ghép. Chưa ghép: chỉ CA-01, CA-02 (không thấy chương trình của phụ huynh).
// D-75: không có nút "Con cần giúp đỡ"; mọi vấn đề của con đi qua bố mẹ ("Báo bố mẹ ngay").
export default function ChildLayout() {
  const { childStage, childPlanActive, paused } = useApp();
  if (APP_VARIANT !== 'child') return <Redirect href="/" />;
  if (childStage === 'loading') {
    return (
      <Center>
        <P muted>Đang mở...</P>
      </Center>
    );
  }
  return (
    <Stack>
      <Stack.Protected guard={childStage === 'unpaired'}>
        <Stack.Screen name="chao" options={{ title: 'Parent-Pal' }} />
        <Stack.Screen name="ma-ghep" options={{ title: 'Mã ghép' }} />
      </Stack.Protected>
      <Stack.Protected guard={childStage === 'justPaired'}>
        <Stack.Screen name="ghep-xong" options={{ title: 'Đã kết nối' }} />
      </Stack.Protected>
      <Stack.Protected guard={childStage === 'intro' || (childStage === 'ready' && childPlanActive)}>
        <Stack.Screen name="bo-me-thay" options={{ title: 'Những gì bố mẹ thấy' }} />
      </Stack.Protected>
      <Stack.Protected guard={childStage === 'ready' && (paused || !childPlanActive)}>
        <Stack.Screen name="tam-dung" options={{ title: 'Tạm dừng' }} />
      </Stack.Protected>
      <Stack.Protected guard={childStage === 'ready' && !paused && childPlanActive}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="bao-bo-me" options={{ title: 'Báo bố mẹ ngay' }} />
        <Stack.Screen name="cai-dat" options={{ title: 'Cài đặt' }} />
        <Stack.Screen name="nhap-pin" options={{ title: 'Cần bố mẹ nhập PIN' }} />
      </Stack.Protected>
    </Stack>
  );
}
