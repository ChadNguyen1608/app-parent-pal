import { Redirect, Stack } from 'expo-router';

import { useApp } from '@/state/app';
import { Center, P } from '@/ui/kit';
import { HelpButton } from '@/ui/HelpButton';
import { APP_VARIANT } from '@/variant';

// Cổng theo giai đoạn ghép. Chưa ghép: chỉ CA-01, CA-02 (không thấy chương trình của phụ huynh).
// Nút "Con cần giúp đỡ" có ở thanh trên mọi màn (IA-Q03) và luôn mở được, kể cả khi chưa ghép.
export default function ChildLayout() {
  const { childStage } = useApp();
  if (APP_VARIANT !== 'child') return <Redirect href="/" />;
  if (childStage === 'loading') {
    return (
      <Center>
        <P muted>Đang mở...</P>
      </Center>
    );
  }
  return (
    <Stack screenOptions={{ headerRight: () => <HelpButton /> }}>
      <Stack.Protected guard={childStage === 'unpaired'}>
        <Stack.Screen name="chao" options={{ title: 'Parent-Pal' }} />
        <Stack.Screen name="ma-ghep" options={{ title: 'Mã ghép' }} />
      </Stack.Protected>
      <Stack.Protected guard={childStage === 'justPaired'}>
        <Stack.Screen name="ghep-xong" options={{ title: 'Đã kết nối' }} />
      </Stack.Protected>
      <Stack.Protected guard={childStage === 'intro' || childStage === 'ready'}>
        <Stack.Screen name="bo-me-thay" options={{ title: 'Những gì bố mẹ thấy' }} />
      </Stack.Protected>
      <Stack.Protected guard={childStage === 'ready'}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="cai-dat" options={{ title: 'Cài đặt' }} />
        <Stack.Screen name="nhap-pin" options={{ title: 'Cần bố mẹ nhập PIN' }} />
      </Stack.Protected>
      <Stack.Screen name="con-can-giup-do" options={{ title: 'Con cần giúp đỡ', headerRight: () => null }} />
    </Stack>
  );
}
