// Chọn bản thật hoặc giả lập theo cấu hình. Chỉ file này import module native (AsyncStorage).
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState } from 'react-native';

import { BACKEND, SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL, type BackendKind } from '../config';
import { createSupabaseApi } from './api';
import { createMockApi, isPlanTier } from './mock';
import type { Api } from './types';

let instance: Api | null = null;

export function backendKind(): BackendKind {
  return BACKEND;
}

/** Trả null khi thiếu cấu hình (màn gốc hiện hướng dẫn thay vì sập). */
export function getApi(): Api | null {
  if (instance) return instance;
  if (BACKEND === 'mock') {
    // Bản web thử (E2E): ?plan=FREE|TRIAL|PREMIUM chọn gói giả lập; không có thì mặc định TRIAL. Chỉ bản mock đọc tham số này.
    const q = typeof globalThis.location?.search === 'string' ? new URLSearchParams(globalThis.location.search).get('plan') : null;
    instance = createMockApi(isPlanTier(q) ? { plan: q } : {});
  } else if (BACKEND === 'supabase') {
    const client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        // Phiên (kể cả phiên ẩn danh của máy con) lưu bằng AsyncStorage theo khuyến nghị Supabase cho Expo.
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        // PKCE: link trong thư trả về ?code=..., không để token trên URL. Đổi bằng exchangeCodeForSession.
        flowType: 'pkce',
      },
    });
    // Chỉ tự làm mới token khi app ở nền trước.
    AppState.addEventListener('change', (s) => {
      if (s === 'active') void client.auth.startAutoRefresh();
      else void client.auth.stopAutoRefresh();
    });
    void client.auth.startAutoRefresh();
    instance = createSupabaseApi(client);
  }
  return instance;
}
