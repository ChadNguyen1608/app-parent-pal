import { useRouter } from 'expo-router';

import { Btn, H1, P, Screen } from '@/ui/kit';

// CA-11 Cài đặt (tối thiểu): xem CA-16 và "Hủy kết nối" (cần PIN của bố mẹ). Thông báo, CA-20: task sau.
export default function CaiDat() {
  const router = useRouter();
  return (
    <Screen big>
      <H1>Cài đặt</H1>
      <Btn big kind="secondary" label="Những gì bố mẹ thấy" onPress={() => router.push('/(child)/bo-me-thay')} />
      <P muted>Hủy kết nối là gỡ máy này khỏi gia đình. Cần bố mẹ nhập PIN.</P>
      <Btn big kind="danger" label="Hủy kết nối" onPress={() => router.push('/(child)/nhap-pin')} />
    </Screen>
  );
}
