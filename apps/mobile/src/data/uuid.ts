/** UUID v4 để làm khóa idempotent (không dùng cho bảo mật). */
export function uuidv4(rand: () => number = Math.random): string {
  const h = '0123456789abcdef';
  let out = '';
  for (let i = 0; i < 36; i++) {
    if (i === 8 || i === 13 || i === 18 || i === 23) out += '-';
    else if (i === 14) out += '4';
    else if (i === 19) out += h[8 + Math.floor(rand() * 4)];
    else out += h[Math.floor(rand() * 16)];
  }
  return out;
}
