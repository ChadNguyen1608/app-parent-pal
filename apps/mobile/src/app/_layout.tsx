import { Stack } from 'expo-router';

import { BACKEND } from '@/config';
import { AppProvider } from '@/state/app';
import { Center, H1, P } from '@/ui/kit';

export default function RootLayout() {
  if (BACKEND === 'missing') {
    return (
      <Center>
        <H1>Chưa cấu hình</H1>
        <P>
          Thiếu EXPO_PUBLIC_SUPABASE_URL và EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Xem apps/mobile/.env.example. Muốn xem giao diện khi chưa có máy chủ, đặt EXPO_PUBLIC_API_MOCK=1.
        </P>
      </Center>
    );
  }
  return (
    <AppProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </AppProvider>
  );
}
