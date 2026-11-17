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

  it('lần đầu: ghi đồng ý của con không thành công thì báo lỗi, không vào Hôm nay, bấm lại được (không kẹt màn)', async () => {
    const acknowledgeIntro = jest
      .fn()
      .mockRejectedValueOnce(Object.assign(new Error('x'), { message: 'FROZEN', hint: 'Gia đình đang tạm dừng app, chưa làm được việc này.' }))
      .mockResolvedValueOnce(undefined);
    mockUseApp.mockReturnValue({ childStage: 'intro', acknowledgeIntro });
    await render(<BoMeThay />);
    await fireEvent.press(screen.getByText('Con hiểu rồi'));
    await waitFor(() => expect(screen.getByText(/Gia đình đang tạm dừng app/)).toBeTruthy());
    expect(mockReplace).not.toHaveBeenCalled();
    expect(screen.getByText('Con hiểu rồi')).toBeTruthy();
    await fireEvent.press(screen.getByText('Con hiểu rồi'));
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/(child)/(tabs)/hom-nay'));
    expect(acknowledgeIntro).toHaveBeenCalledTimes(2);
  });

  it('lần đầu với mock api: "Con hiểu rồi" gọi child_consent_record rồi mới vào Hôm nay', async () => {
    const api = createMockApi({ latencyMs: 0 });
    await api.auth.signInAnonymously();
    await api.pairCodeCreate();
    await api.pairPending();
    await api.pairPending();
    await api.pairAccept();
    const record = jest.spyOn(api, 'childConsentRecord');
    const acknowledgeIntro = jest.fn(async () => {
      await api.childConsentRecord('k1');
    });
    mockUseApp.mockReturnValue({ api, childId: 'x', childStage: 'intro', acknowledgeIntro });
    await render(<BoMeThay />);
    await fireEvent.press(screen.getByText('Con hiểu rồi'));
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/(child)/(tabs)/hom-nay'));
    expect(record).toHaveBeenCalledWith('k1');
  });

  it('một đồng ý gộp: luôn đủ các dòng cốt lõi như wireframe; dòng "Báo bố mẹ ngay" chỉ khi MD-CONBAO hiệu lực', async () => {
    await withConsent(['MD-LICH']);
    await waitFor(() => expect(screen.getByLabelText('Bố mẹ thấy: Mong muốn con gửi')).toBeTruthy());
    for (const l of [
      'Bố mẹ thấy: Lịch của con',
      'Bố mẹ thấy: Việc con bấm "Xong" và giờ bấm',
      'Bố mẹ thấy: Con hay mệt vào loại ngày nào, trong báo cáo cuối tuần',
      'Bố mẹ không thấy: Con chọn gì mỗi ngày khi được hỏi thăm',
      'Bố mẹ không thấy: Khi con bấm "Con cần giúp đỡ"',
    ]) expect(screen.getByLabelText(l)).toBeTruthy();
    expect(screen.queryByLabelText(/Báo bố mẹ ngay/)).toBeNull();
  });

  it('MD-CONBAO hiệu lực: thêm dòng "Khi con bấm Báo bố mẹ ngay (bố mẹ nhận ngay)"', async () => {
    await withConsent(['MD-LICH', 'MD-CONBAO']);
    await waitFor(() => expect(screen.getByLabelText('Bố mẹ thấy: Khi con bấm "Báo bố mẹ ngay" (bố mẹ nhận ngay)')).toBeTruthy());
  });
});
