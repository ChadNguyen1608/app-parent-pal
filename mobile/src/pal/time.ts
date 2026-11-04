export const pad = (n: number) => (n < 10 ? '0' : '') + n;

/** "07:30" thành số phút từ 0h; null nếu không phải giờ. */
export const toMin = (t: string | undefined): number | null => {
  const m = /^(\d{1,2}):(\d{2})/.exec(t || '');
  return m ? +m[1] * 60 + +m[2] : null;
};

export const fmtMin = (n: number) => Math.floor(n / 60) + ' giờ' + (n % 60 ? ' ' + (n % 60) + ' phút' : '');

export const hhmm = (t: string | undefined) => {
  const m = toMin(t);
  return m === null ? '' : pad(Math.floor(m / 60)) + ':' + pad(m % 60);
};

/** Số phút ngắn gọn: 1h30, 45′. */
export const hm = (minutes: number) => {
  let m = Math.round(minutes);
  const neg = m < 0;
  m = Math.abs(m);
  const h = Math.floor(m / 60);
  const r = m % 60;
  return (neg ? '−' : '') + (h ? h + 'h' + (r ? pad(r) : '') : r + '′');
};

export const hmRange = ([a, b]: [number, number]) => (a === b ? hm(a) : hm(a) + '–' + hm(b));

export const todayStr = (now = new Date()) => now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate());
