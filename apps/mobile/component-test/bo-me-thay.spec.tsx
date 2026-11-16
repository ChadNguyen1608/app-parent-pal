// CA-16: "Con hiểu rồi" phải chuyển sang tab Hôm nay (lỗi đã sửa ở PR #38: nút lưu cờ nhưng màn đứng yên).
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import BoMeThay from '../src/app/(child)/bo-me-thay';

const mockUseApp = jest.fn();
const mockReplace = jest.fn();
const mockBack = jest.fn();
jest.mock('@/state/app', () => ({ useApp: () => mockUseApp() }));
jest.mock('expo-router', () => ({ useRouter: () => ({ replace: mockReplace, back: mockBack, push: jest.fn() }) }));

beforeEach(() => {
  mockReplace.mockClear();
  mockBack.mockClear();
});

describe('CA-16 Những gì bố mẹ thấy', () => {
  it('lần đầu (intro): lưu đã xem rồi chuyển sang Hôm nay', async () => {
    const acknowledgeIntro = jest.fn(async () => undefined);
    mockUseApp.mockReturnValue({ childStage: 'intro', acknowledgeIntro });
    await render(<BoMeThay />);
    await fireEvent.press(screen.getByText('Con hiểu rồi'));
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/(child)/(tabs)/hom-nay'));
    expect(acknowledgeIntro).toHaveBeenCalledTimes(1);
    expect(mockBack).not.toHaveBeenCalled();
  });

  it('mở lại từ Cài đặt (ready): quay lại, không lưu lại cờ', async () => {
    const acknowledgeIntro = jest.fn(async () => undefined);
    mockUseApp.mockReturnValue({ childStage: 'ready', acknowledgeIntro });
    await render(<BoMeThay />);
    await fireEvent.press(screen.getByText('Con hiểu rồi'));
    expect(mockBack).toHaveBeenCalledTimes(1);
    expect(mockReplace).not.toHaveBeenCalled();
    expect(acknowledgeIntro).not.toHaveBeenCalled();
  });

  it('nêu rõ bố mẹ không thấy khi con bấm "Con cần giúp đỡ"', async () => {
    mockUseApp.mockReturnValue({ childStage: 'intro', acknowledgeIntro: jest.fn() });
    await render(<BoMeThay />);
    expect(screen.getByText(/Bố mẹ không thấy khi con bấm "Con cần giúp đỡ"/)).toBeTruthy();
  });
});
