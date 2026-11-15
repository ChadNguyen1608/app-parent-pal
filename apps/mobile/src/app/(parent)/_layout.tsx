import { Redirect, Tabs } from 'expo-router';

import { APP_VARIANT } from '@/variant';

// 4 tab theo IA 6.1 mục 3.2 (nhãn đề xuất).
export default function ParentLayout() {
  if (APP_VARIANT !== 'parent') return <Redirect href="/" />;
  return (
    <Tabs>
      <Tabs.Screen name="lich-tuan" options={{ title: 'Lịch tuần' }} />
      <Tabs.Screen name="len-ke-hoach" options={{ title: 'Lên kế hoạch' }} />
      <Tabs.Screen name="tuan-qua" options={{ title: 'Tuần qua' }} />
      <Tabs.Screen name="gia-dinh" options={{ title: 'Gia đình' }} />
    </Tabs>
  );
}
