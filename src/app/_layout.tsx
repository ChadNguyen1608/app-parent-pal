import { BeVietnamPro_400Regular, BeVietnamPro_500Medium, BeVietnamPro_600SemiBold, useFonts } from '@expo-google-fonts/be-vietnam-pro';
import { Feather } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { usePalette } from '../ui/theme';

// Trên web: viền bàn phím rõ ràng (chỉ khi dùng phím Tab), và tắt chuyển động khi người dùng yêu cầu.
if (Platform.OS === 'web' && typeof document !== 'undefined' && !document.getElementById('pp-web-css')) {
  const el = document.createElement('style');
  el.id = 'pp-web-css';
  el.textContent =
    '[role=button]:focus,[role=tab]:focus,[role=switch]:focus{outline:none}' +
    '[role=button]:focus-visible,[role=tab]:focus-visible,[role=switch]:focus-visible,textarea:focus-visible{outline:2px solid #2F6F95;outline-offset:2px}' +
    '@media (prefers-color-scheme: dark){[role=button]:focus-visible,[role=tab]:focus-visible,[role=switch]:focus-visible{outline-color:#8CC4E6}}' +
    '@media (prefers-reduced-motion: reduce){*{animation:none!important;transition:none!important}}';
  document.head.appendChild(el);
}

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
