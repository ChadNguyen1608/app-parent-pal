// Kiểu dữ liệu và giao diện của lớp gọi máy chủ (T1.7). Tên hàm khớp RPC schema `app`.
// Chữ ký các RPC ghép máy/PIN đang làm ở nhánh khác (T1.5, T1.6): xem README mục "Giả định về RPC".

import type { AuthLink } from './auth-link.ts';

export type SessionInfo = { userId: string; email: string | null; isAnonymous: boolean };

export type PairState = 'NONE' | 'PENDING' | 'PAIRED';

export type Child = {
  id: string;
  callName: string;
  grade: number | null;
  ageYears: number | null;
  hasDevice: boolean;
  pairState: PairState;
};

/** Hộ của người lớn đang đăng nhập; null nếu chưa tạo hộ. */
export type Home = { householdId: string; memberCallName: string; children: Child[] } | null;

export type ChildInput = {
  householdId: string;
  callName: string;
  grade?: number | null;
  ageYears?: number | null;
  hasDevice: boolean;
  /** Gửi lặp cùng khóa trả kết quả cũ (idempotent). */
  idempotencyKey?: string;
};

export type PairCode = { code: string; expiresAt: string | null };

/** WAITING: bố mẹ chưa nhập mã. PAIRED: đã ghép, kèm child_id của máy này. */
export type AcceptResult = { status: 'WAITING' } | { status: 'PAIRED'; childId: string };

export interface Api {
  readonly kind: 'mock' | 'supabase';
  auth: {
    getSession(): Promise<SessionInfo | null>;
    onChange(cb: (s: SessionInfo | null) => void): () => void;
    /** D-49: gửi mã 6 số về email, không mật khẩu. */
    /** redirectTo: URL deep link của app để thư có link (magic link) mở lại đúng app. */
    sendEmailOtp(email: string, redirectTo?: string): Promise<void>;
    /** Hoàn tất đăng nhập từ link trong thư (D-59). */
    completeFromLink(link: AuthLink): Promise<SessionInfo>;
    verifyEmailOtp(email: string, token: string): Promise<SessionInfo>;
    signInAnonymously(): Promise<SessionInfo>;
    signOut(): Promise<void>;
  };
  // Người lớn
  getHome(): Promise<Home>;
  familyCreate(callName: string): Promise<{ householdId: string }>;
  touchActive(): Promise<void>;
  childCreate(input: ChildInput): Promise<{ childId: string }>;
  pairConfirm(childId: string, code: string): Promise<void>;
  pinSet(pin: string): Promise<void>;
  // Máy con
  pairCodeCreate(): Promise<PairCode>;
  pairAccept(): Promise<AcceptResult>;
  /** child_id của máy này nếu đã ghép (đọc binding hiệu lực), để nhớ qua lần mở app sau. */
  getMyBinding(): Promise<{ childId: string } | null>;
  unlinkDevice(childId: string, pin: string): Promise<void>;
}
