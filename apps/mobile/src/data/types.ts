// Kiểu dữ liệu và giao diện của lớp gọi máy chủ (T1.7). Tên hàm khớp RPC schema `app`.
// Khớp hợp đồng RPC thật ở backend/supabase/migrations (T1.2, T1.5, T1.6): xem README mục "Hợp đồng RPC".
// Hàm có {"ok": false} (pair_confirm, pair_accept, unlink_device) ném ApiError, nên chỗ gọi chỉ cần try/catch.

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
  /** MD-LICH (mục lõi) đang bật: chưa có thì chưa được dùng hồ sơ này (PA-02 chặn). */
  coreConsent: boolean;
};

export type HouseholdState = 'HOAT_DONG' | 'DONG_BANG' | 'CHO_XOA' | 'DA_XOA';
/** PRIMARY = người quản lý chính (QL); SUPPORTER, OBSERVER = người lớn khác. */
export type MemberRole = 'PRIMARY' | 'SUPPORTER' | 'OBSERVER';

export type DeletionScope = 'HO_SO_CON' | 'GIA_DINH' | 'NGUOI_LON_ROI';
/** Yêu cầu xóa đang mở (chưa bị hủy). Không có hạn xóa hẳn: PR-CON-01 chưa chốt. */
export type OpenDeletion = { id: string; scope: DeletionScope; childId: string | null; acceptedAt: string | null; state: string };

/** Hộ của người lớn đang đăng nhập; null nếu chưa tạo hộ. */
export type Home = {
  householdId: string;
  memberCallName: string;
  role: MemberRole;
  householdState: HouseholdState;
  children: Child[];
  openDeletions: OpenDeletion[];
} | null;

// ---- Đồng ý theo mục đích (T2.1), rút toàn bộ (T2.2), đóng băng và xóa (T2.3)
export type Purpose = { code: string; nameVi: string; dependsOn: string[]; kind: 'LOI' | 'TUY_CHON'; collectEnabled: boolean };
/** CHUA_HOI = chưa có dòng trong purpose_state. */
export type PurposeStatus = 'CHUA_HOI' | 'DANG_BAT' | 'DA_RUT';
export type ConsentOverview = { purposes: Purpose[]; states: Record<string, { state: PurposeStatus; activeSince: string | null }> };

export type ConsentEvent = 'DONG_Y' | 'RUT';
export type ConsentRecordInput = {
  childId: string;
  purposeCode: string;
  event: ConsentEvent;
  /** true: đồng ý của chính người lớn đang gọi (không theo con). */
  forSelf?: boolean;
  /** Gửi lặp cùng khóa trả kết quả cũ. */
  idempotencyKey?: string;
};
export type ConsentRecordResult = {
  /** false: đã đúng trạng thái đó từ trước, không ghi sổ. */
  changed: boolean;
  replay: boolean;
  /** Các mục phụ thuộc bị rút theo (chỉ khi rút mục cha). */
  alsoWithdrawn: string[];
};

/** Hệ quả của rút toàn bộ do máy chủ tính (bước 1). */
export type WithdrawConsequences = {
  purposesWithdrawn: string[];
  childHidden: boolean;
  deviceUnlinked: boolean;
  deletionRequest: boolean;
  hardDeletedNow: boolean;
  canReconsent: boolean;
};
export type WithdrawStep1 = { confirmToken: string; expiresAt: string | null; consequences: WithdrawConsequences };
export type WithdrawStep2 = { replay: boolean; deletionRequestId: string | null; acceptedAt: string | null; state: string; hardDeleted: boolean };
export type DeletionResult = { replay: boolean; scope: DeletionScope; deletionRequestId: string | null; acceptedAt: string | null; state: string; hardDeleted: boolean };

/** Máy con: ACTIVE hoặc FROZEN (gia đình tạm dừng, CA-18). */
export type FamilyState = 'ACTIVE' | 'FROZEN';

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

/** CHO_XAC_NHAN_MAY_CON: máy con sẽ hỏi "Kết nối với ...?". CHO_XAC_MINH: máy từng ghép ở hộ khác, chưa có quyền gì (AC-FAM-16). */
export type PairConfirmState = 'CHO_XAC_NHAN_MAY_CON' | 'CHO_XAC_MINH';
export type PairConfirmResult = { state: PairConfirmState; epoch: number; pinSet: boolean };

/** Yêu cầu ghép đang chờ máy con bấm Đồng ý / Không. */
export type PairPending = { pending: false } | { pending: true; adultCallName: string; expiresAt: string | null };

/** Liên kết hiệu lực của máy con. epoch phải gửi lại khi hủy (FR01-T09). */
export type Binding = { childId: string; epoch: number };

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
  familyCreate(callName: string): Promise<{ householdId: string; replay: boolean }>;
  /** Gọi khi người lớn mở app. Client tự giới hạn tối đa 1 lần/giờ như máy chủ. Trả touched=false nếu không gọi hoặc máy chủ bỏ qua. */
  touchActive(): Promise<{ touched: boolean }>;
  childCreate(input: ChildInput): Promise<{ childId: string }>;
  /** pin: bắt buộc ở lần ghép đầu của QL (đặt PIN cùng lúc), không gửi các lần sau. */
  pairConfirm(childId: string, code: string, pin?: string): Promise<PairConfirmResult>;
  pinSet(pin: string): Promise<void>;
  /** PA-02, PA-32: danh mục mục đích và trạng thái của một con. */
  getConsentOverview(childId: string): Promise<ConsentOverview>;
  /** PA-02, PA-32: ghi đồng ý hoặc rút một mục (consent_record). */
  consentRecord(input: ConsentRecordInput): Promise<ConsentRecordResult>;
  /** PA-35 lần 1: rút toàn bộ bước 1, máy chủ trả hệ quả và mã xác nhận dùng một lần (consent_withdraw_all). */
  withdrawAllStart(childId: string): Promise<WithdrawStep1>;
  /** PA-36 lần 2: rút toàn bộ bước 2, gửi mã của bước 1. */
  withdrawAllConfirm(childId: string, confirmToken: string): Promise<WithdrawStep2>;
  /** PA-39: QL mở lại hộ đóng băng. confirm phải true (xác nhận rõ ràng). */
  householdReopen(confirm: boolean): Promise<{ changed: boolean }>;
  /** PA-35, PA-36: yêu cầu xóa. Luôn gửi confirm=true (người dùng đã xác nhận lần hai). */
  deletionRequest(scope: DeletionScope, childId?: string | null): Promise<DeletionResult>;
  /** PA-34: yêu cầu xuất dữ liệu. Ở bản thử máy chủ luôn trả BLOCKED_H4 (ApiError). */
  exportRequest(scope: 'GIA_DINH' | 'HO_SO_CON', childId?: string | null): Promise<void>;
  // Máy con
  pairCodeCreate(): Promise<PairCode>;
  pairPending(): Promise<PairPending>;
  /** Bấm Đồng ý. epoch là binding_epoch phải lưu để hủy sau này. */
  pairAccept(): Promise<Binding>;
  /** Bấm Không. */
  pairDecline(): Promise<void>;
  /** Liên kết hiệu lực của máy này (đọc device_bindings), để nhớ qua lần mở app sau. */
  getMyBinding(): Promise<Binding | null>;
  /** CA-16: mã các mục đích đang HIỆU LỰC (bật, được thu, mục cha cũng hiệu lực) mà máy con được xem. */
  getMyConsent(childId: string): Promise<string[]>;
  /** CA-18: gia đình có đang tạm dừng không. Chưa đọc được thì coi là ACTIVE (không chặn nhầm). */
  getFamilyState(): Promise<FamilyState>;
  /** bindingEpoch: máy con bắt buộc gửi; QL có thể bỏ. */
  unlinkDevice(childId: string, pin: string, bindingEpoch?: number): Promise<void>;
}
