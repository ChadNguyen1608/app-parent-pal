import { useCallback, useRef, useState } from 'react';

import { errorMessage, type ErrorContext } from '../data/errors';

/** Chạy một việc bất đồng bộ, giữ trạng thái đang làm và lời lỗi tiếng Việt. Chặn bấm đúp. */
export function useAction(ctx?: ErrorContext) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const running = useRef(false);
  const run = useCallback(
    async (fn: () => Promise<void>): Promise<boolean> => {
      if (running.current) return false;
      running.current = true;
      setBusy(true);
      setError(null);
      try {
        await fn();
        return true;
      } catch (e) {
        setError(errorMessage(e, ctx));
        return false;
      } finally {
        running.current = false;
        setBusy(false);
      }
    },
    [ctx],
  );
  return { busy, error, setError, run };
}
