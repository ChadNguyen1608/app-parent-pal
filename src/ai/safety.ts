// Lớp an toàn: chạy TRƯỚC khi AI trả lời.
// Bản thử dùng từ khóa; bản thật sẽ dùng một mô hình phân loại, nhưng giữ nguyên giao diện này.
import { SafetyLevel } from '../domain/types';
import { hasAny, prep } from './text';

export type SafetyCategory = 'self_harm' | 'abuse' | 'domestic_violence' | 'harsh_punishment' | 'postpartum';

export interface SafetyResult {
  level: SafetyLevel;
  category?: SafetyCategory;
  matched?: string;
}

const RULES: { level: SafetyLevel; category: SafetyCategory; phrases: string[] }[] = [
  {
    level: 'urgent',
    category: 'self_harm',
    phrases: [
      'tự tử', 'tu sat', 'tự sát', 'muốn chết', 'không muốn sống', 'chẳng muốn sống', 'tự làm đau', 'rạch tay',
      'kết thúc cuộc đời', 'kết liễu', 'nhảy lầu', 'uống thuốc ngủ', 'không thiết sống',
    ],
  },
  {
    level: 'urgent',
    category: 'abuse',
    phrases: ['xâm hại', 'sờ soạng', 'lạm dụng', 'quấy rối', 'động chạm vùng kín', 'hiếp', 'dâm ô'],
  },
  {
    level: 'urgent',
    category: 'domestic_violence',
    phrases: ['bạo hành', 'chồng đánh', 'vợ đánh', 'bị chồng đánh', 'đánh đập', 'đánh bầm', 'đánh chảy máu'],
  },
  {
    level: 'concern',
    category: 'postpartum',
    phrases: ['trầm cảm sau sinh', 'không thương con', 'không muốn nhìn con', 'ghét con mình'],
  },
  {
    level: 'concern',
    category: 'harsh_punishment',
    phrases: ['đánh cho nó nhớ', 'đánh cho nhớ', 'đánh đòn', 'ăn roi', 'cho ăn đòn', 'lấy roi', 'tát con', 'tôi đánh con', 'em đánh con', 'mình đánh con', 'đã đánh con', 'định đánh', 'muốn đánh nó', 'nhốt con', 'phạt quỳ', 'bỏ đói'],
  },
];

export function assessSafety(text: string): SafetyResult {
  const f = prep(text);
  for (const rule of RULES) {
    const m = hasAny(f, rule.phrases);
    if (m) return { level: rule.level, category: rule.category, matched: m };
  }
  return { level: 'none' };
}
