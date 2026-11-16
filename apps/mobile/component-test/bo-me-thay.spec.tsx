// CA-16: "Con hiểu rồi" phải chuyển sang tab Hôm nay (lỗi đã sửa ở PR #38: nút lưu cờ nhưng màn đứng yên).
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import BoMeThay from '../src/app/(child)/bo-me-thay';
import { createMockApi } from '../src/data/mock';

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

  async function withConsent(codes: string[]) {
    const api = createMockApi({ latencyMs: 0, childConsent: codes });
    await api.auth.signInAnonymously();
    mockUseApp.mockReturnValue({ api, childId: 'c1', childStage: 'intro', acknowledgeIntro: jest.fn() });
    await render(<BoMeThay />);
  }

  it('nêu rõ bố mẹ không thấy khi con bấm "Con cần giúp đỡ" (wireframe: Bố mẹ không thấy: Khi con bấm ...)', async () => {
    await withConsent(['MD-LICH']);
    await waitFor(() => expect(screen.getByLabelText('Bố mẹ không thấy: Khi con bấm "Con cần giúp đỡ"')).toBeTruthy());
    expect(screen.getByText('Đã kết nối với gia đình.')).toBeTruthy();
  });

  it('dòng khớp quyền thật: đủ mục thì có đủ 6 dòng như wireframe', async () => {
    await withConsent(['MD-LICH', 'MD-DONGBO', 'MD-XONG', 'MD-MET', 'MD-MONGMUON', 'MD-BAOCAO']);
    await waitFor(() => expect(screen.getByLabelText('Bố mẹ thấy: Mong muốn con gửi')).toBeTruthy());
    for (const l of [
      'Bố mẹ thấy: Lịch của con',
      'Bố mẹ thấy: Việc con bấm "Xong" và giờ bấm',
      'Bố mẹ thấy: Con hay mệt vào loại ngày nào, trong báo cáo cuối tuần',
      'Bố mẹ không thấy: Con chọn gì mỗi ngày khi được hỏi thăm',
    ]) expect(screen.getByLabelText(l)).toBeTruthy();
  });

  it('bố mẹ tắt các mục tùy chọn thì dòng tương ứng biến mất, không hứa điều không còn', async () => {
    await withConsent(['MD-LICH']);
    await waitFor(() => screen.getByLabelText('Bố mẹ thấy: Lịch của con'));
    expect(screen.queryByLabelText(/Xong/)).toBeNull();
    expect(screen.queryByLabelText(/Mong muốn/)).toBeNull();
    expect(screen.queryByLabelText(/hay mệt/)).toBeNull();
  });
});
