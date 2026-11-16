// PA-13: ô PIN chỉ hiện khi máy chủ báo "Cần đặt Parent PIN" (không đoán), rồi gửi lại cùng mã kèm PIN.
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import GhepMay from '../src/app/(parent)/ghep-may';
import { parentWithChild } from './helpers';

const mockUseApp = jest.fn();
jest.mock('@/state/app', () => ({ useApp: () => mockUseApp() }));
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: jest.fn(), back: jest.fn(), push: jest.fn() }),
  useLocalSearchParams: () => ({}),
}));

async function setup() {
  const { api, home } = await parentWithChild();
  const spy = jest.spyOn(api, 'pairConfirm');
  mockUseApp.mockReturnValue({ api, home, refreshHome: async () => undefined });
  await render(<GhepMay />);
  return { api, spy };
}

describe('PA-13 Ghép máy của con', () => {
  it('ban đầu không hiện ô PIN; máy chủ báo cần PIN thì hiện hai ô PIN', async () => {
    const { spy } = await setup();
    expect(screen.queryByText(/Đặt PIN/)).toBeNull();
    await fireEvent.changeText(screen.getByLabelText(/Mã trên máy con/), '123456');
    await fireEvent.press(screen.getByText('Ghép máy'));
    await waitFor(() => expect(screen.getByText(/Đặt PIN \(6 số\)/)).toBeTruthy());
    expect(screen.getByText('Nhập lại PIN')).toBeTruthy();
    // Lần gửi đầu không kèm PIN.
    expect(spy).toHaveBeenCalledWith(expect.any(String), '123456', undefined);
    // Lời "Cần đặt Parent PIN" không bị hiện thành lỗi đỏ (đã có ô hướng dẫn).
    expect(screen.queryByText('Cần đặt Parent PIN khi ghép lần đầu.')).toBeNull();
  });

  it('PIN dễ đoán bị từ chối ngay trong màn; PIN hợp lệ thì ghép được và gửi lại cùng mã', async () => {
    const { spy } = await setup();
    await fireEvent.changeText(screen.getByLabelText(/Mã trên máy con/), '123456');
    await fireEvent.press(screen.getByText('Ghép máy'));
    await waitFor(() => screen.getByText(/Đặt PIN \(6 số\)/));

    await fireEvent.changeText(screen.getByLabelText(/Đặt PIN/), '123456');
    await fireEvent.changeText(screen.getByLabelText('Nhập lại PIN'), '123456');
    await fireEvent.press(screen.getByText('Ghép máy'));
    await waitFor(() => expect(screen.getByText(/dễ đoán|khó đoán|không dùng/i)).toBeTruthy());
    expect(spy).toHaveBeenCalledTimes(1); // chưa gửi lên máy chủ

    await fireEvent.changeText(screen.getByLabelText(/Đặt PIN/), '482915');
    await fireEvent.changeText(screen.getByLabelText('Nhập lại PIN'), '482915');
    await fireEvent.press(screen.getByText('Ghép máy'));
    await waitFor(() => expect(screen.getByText('Đã nhập mã đúng')).toBeTruthy());
    expect(spy).toHaveBeenLastCalledWith(expect.any(String), '123456', '482915');
  });

  it('mã sai báo một câu chung và không hiện ô PIN khi PIN đã có', async () => {
    const { api } = await setup();
    // Đặt PIN trước để máy chủ không đòi PIN nữa.
    await api.pinSet('482915');
    await fireEvent.changeText(screen.getByLabelText(/Mã trên máy con/), '654321');
    await fireEvent.press(screen.getByText('Ghép máy'));
    await waitFor(() => expect(screen.getByText('Mã không đúng hoặc đã hết hạn.')).toBeTruthy());
    expect(screen.queryByText(/Đặt PIN/)).toBeNull();
  });
});
