// Bộ màu "đèn ngủ": nền sương xanh dịu cho giờ tối khi con đã ngủ,
// một màu hổ phách như bút dạ quang để đánh dấu những gì Pal vừa ghi nhớ.
import { useColorScheme } from 'react-native';

export interface Palette {
  bg: string;
  surface: string;
  ink: string;
  inkSoft: string;
  line: string;
  parentBubble: string;
  /** Bút dạ quang: dấu hiệu "Pal đã ghi nhớ". */
  mark: string;
  markTint: string;
  /** Việc đang theo dõi. */
  sage: string;
  sageTint: string;
  urgent: string;
  urgentTint: string;
  /** Chữ trên nền mark / nút chính. */
  onMark: string;
  focus: string;
}

const light: Palette = {
  bg: '#E9EEF1',
  surface: '#FFFFFF',
  ink: '#1D2B36',
  inkSoft: '#56687A',
  line: '#CAD5DC',
  parentBubble: '#D2E1E8',
  mark: '#F2C14E',
  markTint: '#FCEDC4',
  sage: '#4F7F65',
  sageTint: '#DCEBE2',
  urgent: '#A63D33',
  urgentTint: '#F6DEDA',
  onMark: '#1D2B36',
  focus: '#2F6F95',
};

const dark: Palette = {
  bg: '#15212A',
  surface: '#1E2D38',
  ink: '#E4ECF0',
  inkSoft: '#9AACB8',
  line: '#30434F',
  parentBubble: '#2A4351',
  mark: '#E7B640',
  markTint: '#3D3521',
  sage: '#8DBBA1',
  sageTint: '#22362B',
  urgent: '#E8857A',
  urgentTint: '#3B2522',
  onMark: '#1D2B36',
  focus: '#8CC4E6',
};

export function usePalette(): Palette {
  return useColorScheme() === 'dark' ? dark : light;
}

export const font = {
  regular: 'BeVietnamPro_400Regular',
  medium: 'BeVietnamPro_500Medium',
  semibold: 'BeVietnamPro_600SemiBold',
};

/** Cỡ chữ theo thang 13 / 15 / 17 / 22 / 28, dòng thoáng cho chữ có dấu. */
export const type = {
  small: { fontSize: 13, lineHeight: 19 },
  body: { fontSize: 15, lineHeight: 23 },
  lead: { fontSize: 17, lineHeight: 25 },
  title: { fontSize: 22, lineHeight: 30 },
  display: { fontSize: 28, lineHeight: 36 },
};

export const space = (n: number) => n * 4;
