// Chọn bản thật hoặc giả lập theo cấu hình. Chỉ file này import module native (AsyncStorage).
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import * as Application from 'expo-application';
import { AppState, Platform } from 'react-native';

import { BACKEND, SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL, type BackendKind } from '../config';
import { createSupabaseApi } from './api';
import { FAKE_DEVICE_ID } from './device-hash';
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
    // Bản web thử (E2E): ?plan=FREE|TRIAL|PREMIUM chọn gói giả lập (không có thì mặc định TRIAL); ?trial=used giả lập máy/email đã dùng thử. Chỉ bản mock đọc tham số này.
    const q = typeof globalThis.location?.search === 'string' ? new URLSearchParams(globalThis.location.search).get('plan') : null;
    const used = typeof globalThis.location?.search === 'string' && new URLSearchParams(globalThis.location.search).get('trial') === 'used';
    // demoAlert: báo mẫu để thử màn của bố mẹ (hai app giả lập không thấy nhau)
    instance = createMockApi({ demoAlert: true, ...(isPlanTier(q) ? { plan: q } : {}), ...(used ? { trialClaimed: true } : {}) });
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
    // Android ID theo app (D-72): chỉ Android có; web hoặc nền khác dùng giá trị giả (không dùng được cho chống lặp thật).
    const getDeviceId = async () => {
      if (Platform.OS !== 'android') return FAKE_DEVICE_ID;
      const id = Application.getAndroidId();
      if (!id) throw new Error('Không đọc được mã máy'); // không dùng mã chung: mọi máy sẽ trùng và chặn nhau
      return id;
    };
    instance = createSupabaseApi(client, () => Date.now(), getDeviceId);
  }
  return instance;
}
