import { BeVietnamPro_400Regular, BeVietnamPro_500Medium, BeVietnamPro_600SemiBold, useFonts } from '@expo-google-fonts/be-vietnam-pro';
import { Feather } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { usePalette } from '../ui/theme';

export default function RootLayout() {
  const c = usePalette();
  const [loaded] = useFonts({ BeVietnamPro_400Regular, BeVietnamPro_500Medium, BeVietnamPro_600SemiBold, ...Feather.font });
  if (!loaded) return <View style={{ flex: 1, backgroundColor: c.bg }} />;
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.bg }, title: 'Parent-Pal' }} />
    </SafeAreaProvider>
  );
}
