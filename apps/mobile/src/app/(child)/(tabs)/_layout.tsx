import { Link, Tabs } from 'expo-router';
import { Text } from 'react-native';

// 3 tab theo IA 6.1 (CA). Nút "Con cần giúp đỡ" nằm ở thanh trên của mọi màn chính (IA-Q03, đề xuất).
function HelpButton() {
  return (
    <Link href="/(child)/con-can-giup-do" style={{ marginRight: 16 }}>
      <Text style={{ color: '#C0392B', fontWeight: '700' }}>Con cần giúp đỡ</Text>
    </Link>
  );
}

export default function ChildTabsLayout() {
  return (
    <Tabs screenOptions={{ headerRight: () => <HelpButton /> }}>
      <Tabs.Screen name="hom-nay" options={{ title: 'Hôm nay' }} />
      <Tabs.Screen name="tuan-cua-con" options={{ title: 'Tuần của con' }} />
      <Tabs.Screen name="cua-con" options={{ title: 'Của con' }} />
    </Tabs>
  );
}
