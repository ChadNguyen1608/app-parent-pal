// Giao diện chung cho "bộ não" của Pal.
// Bản thử: MockEngine (luật tiếng Việt). Bản thật: gọi API mô hình lớn qua server,
// trả về đúng cấu trúc TurnOutput này nên phần còn lại của app không phải đổi.
import { AppState, Child, MemoryItem, SafetyLevel } from '../domain/types';
import { SafetyResult } from './safety';

export interface PalMessage {
  text: string;
  quickReplies?: string[];
  safety?: SafetyLevel;
  /** Chỉ số (trong memoryAdds) hoặc id các mẩu trí nhớ muốn hiện ngay dưới tin nhắn này. */
  showMemories?: (number | string)[];
}

export type NewMemory = Omit<MemoryItem, 'id' | 'createdAt'> & { childName?: string };

export interface TurnOutput {
  messages: PalMessage[];
  childrenAdds?: Omit<Child, 'id' | 'createdAt'>[];
  /** Trí nhớ mới. childName dùng khi đứa trẻ vừa được thêm cùng lượt (chưa có id). */
  memoryAdds?: NewMemory[];
  /** Khép lại các việc đang theo dõi. */
  memoryResolves?: string[];
  /** Sửa trí nhớ đã có: dời ngày hỏi lại, đánh dấu đã hỏi. */
  memoryPatches?: { id: string; patch: Partial<MemoryItem> }[];
  profilePatch?: Partial<AppState['profile']>;
}

export interface CompanionEngine {
  /** Một lượt trò chuyện: phụ huynh vừa nhắn `text`. */
  turn(state: AppState, text: string, now: number, safety: SafetyResult): Promise<TurnOutput>;
  /** Pal chủ động hỏi thăm khi phụ huynh mở app. Trả null nếu không có gì cần hỏi. */
  checkIn(state: AppState, now: number): Promise<TurnOutput | null>;
  /** Lời chào đầu tiên khi chưa quen. */
  greet(state: AppState, now: number): Promise<TurnOutput>;
}
