// Mô hình dữ liệu lõi. Giữ độc lập với nơi lưu trữ (bộ nhớ máy hay Supabase sau này).

export type ID = string;

export interface Child {
  id: ID;
  name: string;
  /** Tuổi tại thời điểm ghi nhận; có thể thiếu nếu phụ huynh chưa kể. */
  age?: number;
  createdAt: number;
}

/**
 * Phạm vi của một mẩu trí nhớ:
 * - private: chỉ người kể thấy (tâm sự, cảm xúc của chính phụ huynh)
 * - family: cả nhà dùng chung (thông tin về con)
 */
export type MemoryScope = 'private' | 'family';

/**
 * Loại trí nhớ, tương ứng 4 lớp đã thống nhất:
 * - fact: hồ sơ ổn định (sở thích, dị ứng, tính cách)
 * - event: sự kiện trên dòng thời gian
 * - followup: chuyện chưa khép lại, cần hỏi lại
 * - parent: về chính phụ huynh (cảm xúc, cách muốn được đồng hành)
 */
export type MemoryKind = 'fact' | 'event' | 'followup' | 'parent';

export interface MemoryItem {
  id: ID;
  kind: MemoryKind;
  scope: MemoryScope;
  /** null khi mẩu trí nhớ không gắn với đứa trẻ nào (ví dụ: về phụ huynh). */
  childId: ID | null;
  text: string;
  /** Chủ đề máy hiểu được, dùng để nhắc lại và tránh trùng lặp. */
  topic?: string;
  createdAt: number;
  /** Với followup: thời điểm nên hỏi lại. */
  dueAt?: number;
  /** Với followup: đã khép lại hay chưa. */
  resolvedAt?: number;
  /** Với followup: lần gần nhất Pal đã hỏi lại. */
  askedAt?: number;
}

export type Sender = 'pal' | 'parent';

export interface Message {
  id: ID;
  sender: Sender;
  text: string;
  createdAt: number;
  /** Mẩu trí nhớ được ghi lại nhờ tin nhắn này, để hiện ngay trong cuộc trò chuyện. */
  savedMemoryIds?: ID[];
  /** Gợi ý trả lời nhanh bằng một chạm. */
  quickReplies?: string[];
  /** Tin nhắn an toàn: hiện thẻ liên hệ người thật. */
  safety?: SafetyLevel;
}

export type SafetyLevel = 'none' | 'concern' | 'urgent';

/** Giai đoạn làm quen: app hỏi chuyện thay vì bắt điền form. */
export type OnboardingStep = 'askName' | 'askChildren' | 'done';

export interface Profile {
  /** Cách phụ huynh muốn được gọi, ví dụ "chị Lan". */
  callName?: string;
  /** Cách gọi ngắn khi đã quen, ví dụ "chị". Rỗng nếu phụ huynh chỉ cho tên. */
  callShort?: string;
  onboarding: OnboardingStep;
  /** Đứa trẻ đang được nói tới khi có nhiều con mà phụ huynh chưa nêu tên. */
  pendingClarify?: { text: string } | null;
  /** Việc đang theo dõi mà Pal vừa hỏi lại, chờ phụ huynh trả lời. */
  awaitingFollowup?: string | null;
  /** Chủ đề vừa nói tới, để hiểu câu kể thêm ở lượt sau. */
  lastTopic?: { id: string; childIds: string[]; at: number } | null;
}

export interface AppState {
  profile: Profile;
  children: Child[];
  memories: MemoryItem[];
  messages: Message[];
  /** Độ lệch thời gian giả lập (ms), chỉ dùng để thử tính năng hỏi lại. */
  clockOffset: number;
}

export const emptyState = (): AppState => ({
  profile: { onboarding: 'askName', pendingClarify: null },
  children: [],
  memories: [],
  messages: [],
  clockOffset: 0,
});
