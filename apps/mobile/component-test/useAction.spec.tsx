import { act, renderHook } from '@testing-library/react-native';

import { ApiError } from '../src/data/errors';
import { useAction } from '../src/ui/useAction';

describe('useAction', () => {
  it('chạy xong: busy về false, không có lỗi', async () => {
    const { result } = await renderHook(() => useAction());
    let ok: boolean | undefined;
    await act(async () => {
      ok = await result.current.run(async () => undefined);
    });
    expect(ok).toBe(true);
    expect(result.current.busy).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('lỗi ApiError: giữ lời tiếng Việt và lỗi gốc, trả false', async () => {
    const { result } = await renderHook(() => useAction());
    let ok: boolean | undefined;
    await act(async () => {
      ok = await result.current.run(async () => {
        throw new ApiError('CONFLICT_REV', 'Liên kết đã thay đổi.');
      });
    });
    expect(ok).toBe(false);
    expect(result.current.error).toBe('Liên kết đã thay đổi.');
    expect(result.current.failure?.code).toBe('CONFLICT_REV');
    expect(result.current.busy).toBe(false);
  });

  it('chặn bấm đúp: lần gọi thứ hai khi đang chạy không chạy lại', async () => {
    const { result } = await renderHook(() => useAction());
    let release!: () => void;
    const gate = new Promise<void>((r) => (release = r));
    const fn = jest.fn(() => gate);
    let first!: Promise<boolean>;
    let secondResult: boolean | undefined;
    await act(async () => {
      first = result.current.run(fn);
      secondResult = await result.current.run(fn);
    });
    expect(secondResult).toBe(false);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(result.current.busy).toBe(true);
    await act(async () => {
      release();
      await first;
    });
    expect(result.current.busy).toBe(false);
  });

  it('lần chạy sau xóa lỗi của lần trước', async () => {
    const { result } = await renderHook(() => useAction());
    await act(async () => {
      await result.current.run(async () => {
        throw new ApiError('NETWORK', 'Chưa có mạng.');
      });
    });
    expect(result.current.error).toBe('Chưa có mạng.');
    await act(async () => {
      await result.current.run(async () => undefined);
    });
    expect(result.current.error).toBeNull();
    expect(result.current.failure).toBeNull();
  });
});
