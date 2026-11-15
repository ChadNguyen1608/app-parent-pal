// Kiểm đầu vào phía máy trước khi gọi RPC (máy chủ vẫn kiểm lại). Trả lời tiếng Việt hoặc null nếu hợp lệ.

export const PIN_LENGTH = 6; // Tech Spec T-03 (đề xuất nội bộ)
export const PAIR_CODE_LENGTH = 6; // giả định, xem README
export const OTP_LENGTH = 6;

export function checkEmail(email: string): string | null {
  const v = email.trim();
  if (v === '') return 'Bạn nhập email giúp mình nhé.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Email này chưa đúng. Bạn kiểm tra lại giúp mình nhé.';
  return null;
}

export function checkOtp(token: string): string | null {
  return /^\d{6}$/.test(token.trim()) ? null : `Mã gồm ${OTP_LENGTH} số. Bạn kiểm tra lại nhé.`;
}

export function checkCallName(name: string, label = 'tên gọi'): string | null {
  const v = name.trim();
  if (v === '') return `Bạn nhập ${label} giúp mình nhé.`;
  if (v.length > 40) return `Tối đa 40 ký tự cho ${label}.`;
  return null;
}

/** Trả lớp hợp lệ (1-9), null nếu để trống; lỗi thì trả chuỗi. */
export function parseGrade(text: string): { grade: number | null; error: string | null } {
  const v = text.trim();
  if (v === '') return { grade: null, error: null };
  if (!/^\d+$/.test(v)) return { grade: null, error: 'Lớp là một số từ 1 đến 9.' };
  const n = Number(v);
  if (n < 1 || n > 9) return { grade: null, error: 'Lớp là một số từ 1 đến 9.' };
  return { grade: n, error: null };
}

export function checkPin(pin: string, confirm?: string): string | null {
  if (!new RegExp(`^\\d{${PIN_LENGTH}}$`).test(pin)) return `PIN gồm ${PIN_LENGTH} số.`;
  if (confirm !== undefined && confirm !== pin) return 'Hai lần nhập PIN chưa giống nhau.';
  return null;
}

export function checkPairCode(code: string): string | null {
  return new RegExp(`^\\d{${PAIR_CODE_LENGTH}}$`).test(code.trim()) ? null : `Mã gồm ${PAIR_CODE_LENGTH} số.`;
}
