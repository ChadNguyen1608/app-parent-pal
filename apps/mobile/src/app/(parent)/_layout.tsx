import { Redirect, Stack } from 'expo-router';

import { useApp } from '@/state/app';
import { Center, P } from '@/ui/kit';
import { APP_VARIANT } from '@/variant';

// Cổng theo trạng thái: chưa đăng nhập chỉ thấy PA-01; chưa có hộ/con chỉ thấy bước bắt đầu; xong mới vào khung chính.
export default function ParentLayout() {
  const { parentStage } = useApp();
  if (APP_VARIANT !== 'parent') return <Redirect href="/" />;
  if (parentStage === 'loading') {
    return (
      <Center>
        <P muted>Đang mở...</P>
      </Center>
    );
  }
  return (
    <Stack>
      <Stack.Protected guard={parentStage === 'out'}>
        <Stack.Screen name="dang-nhap" options={{ title: 'Đăng nhập', headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={parentStage === 'needHome'}>
        <Stack.Screen name="bat-dau" options={{ title: 'Bắt đầu' }} />
      </Stack.Protected>
      <Stack.Protected guard={parentStage === 'ready'}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="ghep-may" options={{ title: 'Ghép máy của con' }} />
        <Stack.Screen name="can-goi" options={{ title: 'Cần gói dịch vụ' }} />
        <Stack.Screen name="dat-pin" options={{ title: 'Mã PIN của bố mẹ' }} />
        <Stack.Screen name="phien" options={{ title: 'Phiên đăng nhập' }} />
      </Stack.Protected>
    </Stack>
  );
}
