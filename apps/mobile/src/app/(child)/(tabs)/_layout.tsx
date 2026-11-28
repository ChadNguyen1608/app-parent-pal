import { Tabs } from 'expo-router';

// 3 tab theo IA 6.1 (CA). D-75: không có nút "Con cần giúp đỡ" ở thanh trên.
export default function ChildTabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="hom-nay" options={{ title: 'Hôm nay' }} />
      <Tabs.Screen name="tuan-cua-con" options={{ title: 'Tuần của con' }} />
      <Tabs.Screen name="cua-con" options={{ title: 'Của con' }} />
    </Tabs>
  );
}
