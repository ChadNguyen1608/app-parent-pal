// Cấu hình đọc từ biến môi trường EXPO_PUBLIC_* (Expo nhúng lúc build). Không có giá trị thật trong repo.
// Xem .env.example. Hàm thuần để test được bằng node.

export type BackendKind = 'mock' | 'supabase' | 'missing';

export type EnvLike = Record<string, string | undefined>;

export function resolveBackend(env: EnvLike): BackendKind {
  if (env.EXPO_PUBLIC_API_MOCK === '1') return 'mock';
  if (env.EXPO_PUBLIC_SUPABASE_URL && env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY) return 'supabase';
  return 'missing';
}

// Phải viết đầy đủ process.env.EXPO_PUBLIC_X để Expo thay giá trị lúc build.
export const BACKEND: BackendKind = resolveBackend({
  EXPO_PUBLIC_API_MOCK: process.env.EXPO_PUBLIC_API_MOCK,
  EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
  EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
});
export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
export const SUPABASE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '';
