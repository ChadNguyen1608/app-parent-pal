import { Tabs } from 'expo-router';
import { Text } from 'react-native';

const icon = (e: string) => () => <Text style={{ fontSize: 18 }}>{e}</Text>;

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: '#2f6fde' }}>
      <Tabs.Screen name="index" options={{ title: 'Lên kế hoạch', tabBarIcon: icon('🧭') }} />
      <Tabs.Screen name="lich-tuan" options={{ title: 'Lịch tuần', tabBarIcon: icon('🗓️') }} />
      <Tabs.Screen name="cua-con" options={{ title: 'Của con', tabBarIcon: icon('🧒') }} />
      <Tabs.Screen name="phong-thu" options={{ title: 'Phòng thử', tabBarIcon: icon('🧪') }} />
    </Tabs>
  );
}
