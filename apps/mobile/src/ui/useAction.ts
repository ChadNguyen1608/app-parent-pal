import { useCallback, useRef, useState } from 'react';

import { errorMessage, toApiError, type ApiError } from '../data/errors';

/** Chạy một việc bất đồng bộ, giữ trạng thái đang làm và lời lỗi tiếng Việt. Chặn bấm đúp. */
export function useAction() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** Lỗi gốc (để màn xử lý riêng theo mã, ví dụ CONFLICT_REV). */
  const [failure, setFailure] = useState<ApiError | null>(null);
  const running = useRef(false);
  const run = useCallback(
    async (fn: () => Promise<void>): Promise<boolean> => {
      if (running.current) return false;
      running.current = true;
      setBusy(true);
      setError(null);
      setFailure(null);
      try {
        await fn();
        return true;
      } catch (e) {
        setError(errorMessage(e));
        setFailure(toApiError(e));
        return false;
      } finally {
        running.current = false;
        setBusy(false);
      }
    },
    [],
  );
  return { busy, error, failure, setError, run };
}
