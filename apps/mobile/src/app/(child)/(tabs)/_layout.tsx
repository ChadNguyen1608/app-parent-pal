import { Tabs } from 'expo-router';

import { HelpButton } from '@/ui/HelpButton';

// 3 tab theo IA 6.1 (CA). Nút "Con cần giúp đỡ" nằm ở thanh trên của mọi màn chính (IA-Q03, đề xuất).
export default function ChildTabsLayout() {
  return (
    <Tabs screenOptions={{ headerRight: () => <HelpButton /> }}>
      <Tabs.Screen name="hom-nay" options={{ title: 'Hôm nay' }} />
      <Tabs.Screen name="tuan-cua-con" options={{ title: 'Tuần của con' }} />
      <Tabs.Screen name="cua-con" options={{ title: 'Của con' }} />
    </Tabs>
  );
}
