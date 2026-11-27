import { Redirect, Stack } from 'expo-router';

import { useApp } from '@/state/app';
import { Center, P } from '@/ui/kit';
import { APP_VARIANT } from '@/variant';

// Cổng theo trạng thái: chưa đăng nhập chỉ thấy PA-01; chưa có hộ/con chỉ thấy bước bắt đầu (đồng ý ghi mặc định lúc tạo con, D-73); xong mới vào khung chính.
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
      <Stack.Protected guard={parentStage === 'frozen'}>
        <Stack.Screen name="tam-khoa" options={{ title: 'Tài khoản tạm khóa', headerBackVisible: false }} />
      </Stack.Protected>
      <Stack.Protected guard={parentStage === 'closing'}>
        <Stack.Screen name="dang-xoa" options={{ title: 'Yêu cầu xóa', headerBackVisible: false }} />
      </Stack.Protected>
      <Stack.Protected guard={parentStage === 'ready'}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="quyen-rieng-tu" options={{ title: 'Quyền riêng tư' }} />
        <Stack.Screen name="cai-dat-du-lieu" options={{ title: 'Cài đặt dữ liệu' }} />
        <Stack.Screen name="suc-khoe" options={{ title: 'Sức khỏe của con' }} />
        <Stack.Screen name="thong-bao" options={{ title: 'Thông báo của con' }} />
        <Stack.Screen name="du-lieu" options={{ title: 'Dữ liệu của gia đình' }} />
        <Stack.Screen name="xuat-du-lieu" options={{ title: 'Xuất dữ liệu' }} />
        <Stack.Screen name="xoa" options={{ title: 'Xóa tài khoản' }} />
        <Stack.Screen name="ghep-may" options={{ title: 'Ghép máy của con' }} />
        <Stack.Screen name="can-goi" options={{ title: 'Cần gói dịch vụ' }} />
        <Stack.Screen name="dat-pin" options={{ title: 'Mã PIN của bố mẹ' }} />
        <Stack.Screen name="phien" options={{ title: 'Phiên đăng nhập' }} />
      </Stack.Protected>
    </Stack>
  );
}
