// PA-22: Trò chuyện với Pal (D-69). Chạy với mock api; không mạng, không khóa Claude.
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import Pal, { PAL_TEXT } from '../src/app/(parent)/pal';
import { createMockApi, MOCK_PAL_REPLIES, MOCK_PAL_SAFETY_REPLY } from '../src/data/mock';
import type { Api } from '../src/data/types';

const mockUseApp = jest.fn();
jest.mock('@/state/app', () => ({ useApp: () => mockUseApp() }));
jest.mock('expo-router', () => {
  const React = require('react');
  return { useFocusEffect: (cb: () => void | (() => void)) => React.useEffect(cb, [cb]) };
});

async function setup(opts: Parameters<typeof createMockApi>[0] = {}, mutate?: (api: Api) => void) {
  const api = createMockApi({ latencyMs: 0, ...opts });
  await api.auth.sendEmailOtp('test.gia@example.com');
  await api.auth.verifyEmailOtp('test.gia@example.com', '123456');
  await api.familyCreate('chị Lan');
  mutate?.(api);
  mockUseApp.mockReturnValue({ api });
  await render(<Pal />);
  return api;
}

describe('PA-22 Trò chuyện với Pal', () => {
  it('hiện lời giới thiệu (người bạn đồng hành, không phải tư vấn tâm lý) và số lượt còn lại', async () => {
    await setup();
    expect(screen.getByText(/không phải tư vấn tâm lý và không thay thế việc khám bệnh/)).toBeTruthy();
    expect(screen.getByText(/115/)).toBeTruthy();
    await waitFor(() => expect(screen.getByText(PAL_TEXT.remaining(20))).toBeTruthy());
  });

  it('gửi một câu: hiện câu của mình và câu trả lời của Pal, số lượt giảm, ô nhập được xóa', async () => {
    await setup();
    await waitFor(() => screen.getByText(PAL_TEXT.remaining(20)));
    await fireEvent.changeText(screen.getByLabelText(PAL_TEXT.inputLabel), 'Con em hay quấy buổi tối');
    await fireEvent.press(screen.getByText(PAL_TEXT.send));
    await waitFor(() => expect(screen.getByText(MOCK_PAL_REPLIES[0])).toBeTruthy());
    expect(screen.getByText('Con em hay quấy buổi tối')).toBeTruthy();
    expect(screen.getByText(PAL_TEXT.remaining(19))).toBeTruthy();
    expect(screen.getByLabelText(PAL_TEXT.inputLabel).props.value).toBe('');
  });

  it('nút Gửi tắt khi ô trống', async () => {
    await setup();
    await waitFor(() => screen.getByText(PAL_TEXT.remaining(20)));
    expect(screen.getByRole('button', { name: PAL_TEXT.send }).props.accessibilityState.disabled).toBe(true);
  });

  it('câu nguy cấp: hiện thông tin hỗ trợ 115/111/113, không trừ lượt', async () => {
    await setup();
    await waitFor(() => screen.getByText(PAL_TEXT.remaining(20)));
    await fireEvent.changeText(screen.getByLabelText(PAL_TEXT.inputLabel), 'Em muốn chết');
    await fireEvent.press(screen.getByText(PAL_TEXT.send));
    await waitFor(() => expect(screen.getByText(PAL_TEXT.safetyTag)).toBeTruthy());
    expect(screen.getByText(MOCK_PAL_SAFETY_REPLY)).toBeTruthy();
    expect(screen.getByText(PAL_TEXT.remaining(20))).toBeTruthy();
  });

  it('hết lượt: hiện lời hẹn mai, không có ô nhập', async () => {
    await setup({ palUsed: 20 });
    await waitFor(() => expect(screen.getByText(PAL_TEXT.noMore)).toBeTruthy());
    expect(screen.queryByLabelText(PAL_TEXT.inputLabel)).toBeNull();
  });

  it('Pal đang tạm dừng (PAL_LOCKED): hiện lời tạm dừng, không có ô nhập', async () => {
    await setup({ palState: 'LOCKED' });
    await waitFor(() => expect(screen.getByText(PAL_TEXT.locked)).toBeTruthy());
    expect(screen.queryByLabelText(PAL_TEXT.inputLabel)).toBeNull();
  });

  it('bị khóa giữa chừng: lần gửi nhận PAL_LOCKED thì báo lỗi ngay trong màn', async () => {
    const api = await setup();
    await waitFor(() => screen.getByText(PAL_TEXT.remaining(20)));
    jest.spyOn(api, 'palSend').mockRejectedValueOnce(Object.assign(new Error('PAL_LOCKED'), { name: 'ApiError', code: 'PAL_LOCKED', userMessage: PAL_TEXT.locked }));
    await fireEvent.changeText(screen.getByLabelText(PAL_TEXT.inputLabel), 'xin chào');
    await fireEvent.press(screen.getByText(PAL_TEXT.send));
    await waitFor(() => expect(screen.getAllByText(/Pal đang tạm dừng|Có lỗi/).length).toBeGreaterThan(0));
  });

  it('gửi lại sau lỗi dùng cùng khóa idempotent (không tính hai lượt)', async () => {
    const api = await setup();
    await waitFor(() => screen.getByText(PAL_TEXT.remaining(20)));
    const spy = jest.spyOn(api, 'palSend').mockRejectedValueOnce(new Error('Network request failed'));
    await fireEvent.changeText(screen.getByLabelText(PAL_TEXT.inputLabel), 'xin chào');
    await fireEvent.press(screen.getByText(PAL_TEXT.send));
    await waitFor(() => expect(spy).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.getByRole('button', { name: PAL_TEXT.send }).props.accessibilityState.busy).toBe(false));
    await fireEvent.press(screen.getByText(PAL_TEXT.send));
    await waitFor(() => expect(spy).toHaveBeenCalledTimes(2));
    expect(spy.mock.calls[1][0].idempotencyKey).toBe(spy.mock.calls[0][0].idempotencyKey);
  });
});
