// Lớp lưu trữ. Bản thử lưu trên máy (AsyncStorage: localStorage trên web).
// Khi có Supabase, chỉ cần viết thêm một Repo khác cùng giao diện này.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, emptyState } from '../domain/types';

export interface Repo {
  load(): Promise<AppState>;
  save(state: AppState): Promise<void>;
  reset(): Promise<void>;
}

const KEY = 'parent-pal/state/v1';

export class LocalRepo implements Repo {
  async load(): Promise<AppState> {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (!raw) return emptyState();
      return { ...emptyState(), ...JSON.parse(raw) };
    } catch {
      // Bộ nhớ trình duyệt có thể bị chặn (chế độ ẩn danh, xem trước): chạy với trạng thái trống.
      return emptyState();
    }
  }

  async save(state: AppState): Promise<void> {
    try {
      await AsyncStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      // Không lưu được thì app vẫn chạy trong phiên hiện tại.
    }
  }

  async reset(): Promise<void> {
    try {
      await AsyncStorage.removeItem(KEY);
    } catch {}
  }
}

/** Dùng cho test: giữ trạng thái trong bộ nhớ. */
export class MemoryRepo implements Repo {
  private state: AppState | null = null;
  async load() {
    return this.state ? structuredClone(this.state) : emptyState();
  }
  async save(s: AppState) {
    this.state = structuredClone(s);
  }
  async reset() {
    this.state = null;
  }
}
