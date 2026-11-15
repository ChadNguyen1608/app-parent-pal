import { useRouter } from 'expo-router';

import { Btn, H1, Screen } from '@/ui/kit';
import { LabLink } from '@/ui/LabLink';

// CA tab "Của con": tối thiểu có lối vào CA-16 và CA-11. Quỹ giờ, mong muốn: task sau.
export default function CuaCon() {
  const router = useRouter();
  return (
    <Screen big>
      <H1>Của con</H1>
      <Btn big kind="secondary" label="Những gì bố mẹ thấy" onPress={() => router.push('/(child)/bo-me-thay')} />
      <Btn big kind="secondary" label="Cài đặt" onPress={() => router.push('/(child)/cai-dat')} />
      <LabLink />
    </Screen>
  );
}
