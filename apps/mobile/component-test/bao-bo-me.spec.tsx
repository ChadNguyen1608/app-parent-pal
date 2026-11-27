// CA-21 Báo bố mẹ ngay (D-67), nút ở Hôm nay (CA-04), và PA-15 phía bố mẹ (danh sách báo, đã xem).
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import BaoBoMe from '../src/app/(child)/bao-bo-me';
import HomNay from '../src/app/(child)/(tabs)/hom-nay';
import ThongBao from '../src/app/(parent)/thong-bao';
import { createMockApi, MOCK_ALERT_MAX_PER_HOUR } from '../src/data/mock';
import { pairedChild } from './helpers';

const mockUseApp = jest.fn();
const mockBack = jest.fn();
const mockPush = jest.fn();
jest.mock('@/state/app', () => ({ useApp: () => mockUseApp() }));
jest.mock('expo-router', () => ({
  useRouter: () => ({ back: mockBack, push: mockPush, replace: jest.fn() }),
  useFocusEffect: (cb: () => void) => require('react').useEffect(cb, []),
}));

beforeEach(() => {
  mockBack.mockClear();
  mockPush.mockClear();
});

/** Máy con đã ghép với con thật; bố mẹ bật MD-CONBAO nếu `conbao`. Trả api (phiên đang là máy con). */
async function kidSetup(conbao: boolean) {
  const { api, childId, bindingEpoch } = await pairedChild();
  // phiên bố mẹ để ghi đồng ý, rồi quay lại máy con
  await api.auth.sendEmailOtp('test.gia@example.com');
  await api.auth.verifyEmailOtp('test.gia@example.com', '123456');
  await api.consentRecord({ childId, purposeCode: 'MD-LICH', event: 'DONG_Y' });
  if (conbao) await api.consentRecord({ childId, purposeCode: 'MD-CONBAO', event: 'DONG_Y' });
  await api.auth.signInAnonymously();
  const refreshBinding = jest.fn(async () => true);
  mockUseApp.mockReturnValue({ api, childId, bindingEpoch, refreshBinding });
  return { api, childId, bindingEpoch };
}

describe('CA-04: nút "Báo bố mẹ ngay"', () => {
  it('chỉ hiện khi MD-CONBAO hiệu lực', async () => {
    await kidSetup(false);
    await render(<HomNay />);
    await waitFor(() => expect(screen.getByText('Hôm nay')).toBeTruthy());
    expect(screen.queryByText('Báo bố mẹ ngay')).toBeNull();
  });

  it('MD-CONBAO hiệu lực: nút hiện và mở CA-21', async () => {
    await kidSetup(true);
    await render(<HomNay />);
    await fireEvent.press(await screen.findByText('Báo bố mẹ ngay'));
    expect(mockPush).toHaveBeenCalledWith('/(child)/bao-bo-me');
  });

  it('không đọc được mục đích hiệu lực thì không hiện nút', async () => {
    const api = createMockApi({ latencyMs: 0 });
    jest.spyOn(api, 'getMyConsent').mockRejectedValue(new Error('mạng'));
    mockUseApp.mockReturnValue({ api, childId: 'c' });
    await render(<HomNay />);
    await waitFor(() => expect(screen.getByText('Hôm nay')).toBeTruthy());
    expect(screen.queryByText('Báo bố mẹ ngay')).toBeNull();
  });
});

describe('CA-21 Báo bố mẹ ngay', () => {
  it('ba câu hỏi có sẵn, không có ô gõ chữ; chọn một câu thì sang màn xác nhận, CHƯA gửi', async () => {
    const { api } = await kidSetup(true);
    const send = jest.spyOn(api, 'childAlertSend');
    await render(<BaoBoMe />);
    for (const q of ['Con thấy không khỏe?', 'Nhờ bố mẹ đón sớm?', 'Con cần bố mẹ gọi?']) expect(screen.getByText(q)).toBeTruthy();
    expect(screen.queryByRole('textbox' as never)).toBeNull();
    expect(screen.queryByPlaceholderText(/./)).toBeNull();
    await fireEvent.press(screen.getByText('Nhờ bố mẹ đón sớm?'));
    expect(screen.getByRole('button', { name: 'Đồng ý' })).toBeTruthy();
    expect(send).not.toHaveBeenCalled();
  });

  it('"Không" quay về danh sách và không gửi', async () => {
    const { api } = await kidSetup(true);
    const send = jest.spyOn(api, 'childAlertSend');
    await render(<BaoBoMe />);
    await fireEvent.press(screen.getByText('Con thấy không khỏe?'));
    await fireEvent.press(screen.getByText('Không'));
    expect(screen.getByText('Con cần bố mẹ gọi?')).toBeTruthy();
    expect(send).not.toHaveBeenCalled();
  });

  it('"Đồng ý" mới gửi child_alert_send đúng mã câu và epoch; hiện "Đã gửi"', async () => {
    const { api, bindingEpoch } = await kidSetup(true);
    const send = jest.spyOn(api, 'childAlertSend');
    await render(<BaoBoMe />);
    await fireEvent.press(screen.getByText('Nhờ bố mẹ đón sớm?'));
    await fireEvent.press(screen.getByRole('button', { name: 'Đồng ý' }));
    await waitFor(() => expect(screen.getByText('Đã gửi. Bố mẹ sẽ trả lời con.')).toBeTruthy());
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith('DON_SOM', expect.any(String), bindingEpoch);
    expect(screen.getByText('Lịch hôm nay không tự đổi. Bố mẹ sẽ quyết định.')).toBeTruthy();
    await fireEvent.press(screen.getByText('Xong'));
    expect(mockBack).toHaveBeenCalled();
  });

  it('lỗi mạng rồi bấm lại: dùng cùng khóa gửi lặp (không gửi hai báo)', async () => {
    const { api } = await kidSetup(true);
    const send = jest.spyOn(api, 'childAlertSend');
    send.mockRejectedValueOnce(Object.assign(new Error('Network request failed'), {}));
    await render(<BaoBoMe />);
    await fireEvent.press(screen.getByText('Con thấy không khỏe?'));
    await fireEvent.press(screen.getByRole('button', { name: 'Đồng ý' }));
    await waitFor(() => expect(screen.getByText(/Chưa kết nối được mạng/)).toBeTruthy());
    await fireEvent.press(screen.getByRole('button', { name: 'Đồng ý' }));
    await waitFor(() => expect(screen.getByText('Đã gửi. Bố mẹ sẽ trả lời con.')).toBeTruthy());
    expect(send.mock.calls[0][1]).toBe(send.mock.calls[1][1]);
  });

  it('RATE_LIMITED: hiện lời của máy chủ, không báo "đã gửi", ở lại màn xác nhận', async () => {
    const { api } = await kidSetup(true);
    for (let i = 0; i < MOCK_ALERT_MAX_PER_HOUR; i++) await api.childAlertSend('GOI_BO_ME', `pre-${i}`);
    await render(<BaoBoMe />);
    await fireEvent.press(screen.getByText('Con thấy không khỏe?'));
    await fireEvent.press(screen.getByRole('button', { name: 'Đồng ý' }));
    await waitFor(() => expect(screen.getByText('Đã báo nhiều lần, hãy chờ một lúc.')).toBeTruthy());
    expect(screen.queryByText('Đã gửi. Bố mẹ sẽ trả lời con.')).toBeNull();
    expect(screen.getByRole('button', { name: 'Đồng ý' })).toBeTruthy();
  });

  it('bố mẹ vừa tắt MD-CONBAO: FORBIDDEN, lời tiếng Việt, không báo đã gửi', async () => {
    await kidSetup(false);
    const { api } = (mockUseApp() as { api: ReturnType<typeof createMockApi> });
    await render(<BaoBoMe />);
    await fireEvent.press(screen.getByText('Con cần bố mẹ gọi?'));
    await fireEvent.press(screen.getByRole('button', { name: 'Đồng ý' }));
    await waitFor(() => expect(screen.getByText('Bố mẹ chưa bật tính năng này.')).toBeTruthy());
    expect(api).toBeTruthy();
  });

  it('CONFLICT_REV (liên kết đổi): đọc lại liên kết', async () => {
    const { api } = await kidSetup(true);
    jest.spyOn(api, 'childAlertSend').mockRejectedValueOnce(Object.assign(new Error('x'), { message: 'CONFLICT_REV', hint: 'Máy này không còn là máy đã ghép.' }));
    const refreshBinding = (mockUseApp() as { refreshBinding: jest.Mock }).refreshBinding;
    await render(<BaoBoMe />);
    await fireEvent.press(screen.getByText('Con thấy không khỏe?'));
    await fireEvent.press(screen.getByRole('button', { name: 'Đồng ý' }));
    await waitFor(() => expect(screen.getByText('Máy này không còn là máy đã ghép.')).toBeTruthy());
    await waitFor(() => expect(refreshBinding).toHaveBeenCalled());
  });
});

describe('PA-15 Thông báo của con (bố mẹ)', () => {
  async function parentSide() {
    const { api, childId } = await kidSetup(true);
    await api.childAlertSend('KHONG_KHOE', 'a1');
    await api.childAlertSend('GOI_BO_ME', 'a2');
    await api.auth.sendEmailOtp('test.gia@example.com');
    await api.auth.verifyEmailOtp('test.gia@example.com', '123456');
    mockUseApp.mockReturnValue({ api, home: await api.getHome() });
    return { api, childId };
  }

  it('liệt kê báo của con, mới nhất trước, tên con và câu; chưa xem có nút đánh dấu', async () => {
    await parentSide();
    await render(<ThongBao />);
    await waitFor(() => expect(screen.getByText('Bin: Con cần bố mẹ gọi')).toBeTruthy());
    expect(screen.getByText('Bin: Con thấy không khỏe')).toBeTruthy();
    expect(screen.getAllByText('Đánh dấu đã xem')).toHaveLength(2);
    expect(screen.getByText(/không có chữ tự gõ/)).toBeTruthy();
  });

  it('"Đánh dấu đã xem" gọi child_alert_seen rồi hiện "Đã xem"', async () => {
    const { api } = await parentSide();
    const seen = jest.spyOn(api, 'childAlertSeen');
    await render(<ThongBao />);
    await waitFor(() => screen.getAllByText('Đánh dấu đã xem'));
    await fireEvent.press(screen.getAllByText('Đánh dấu đã xem')[0]);
    await waitFor(() => expect(screen.getAllByText('Đánh dấu đã xem')).toHaveLength(1));
    expect(seen).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/· Đã xem/)).toBeTruthy();
  });

  it('chưa có báo: câu trống, không hứa gì', async () => {
    const { api } = await pairedChild();
    await api.auth.sendEmailOtp('test.gia@example.com');
    await api.auth.verifyEmailOtp('test.gia@example.com', '123456');
    mockUseApp.mockReturnValue({ api, home: await api.getHome() });
    await render(<ThongBao />);
    await waitFor(() => expect(screen.getByText(/Chưa có báo nào trong 7 ngày qua/)).toBeTruthy());
  });
});

describe('PA-03 tab Gia đình: lối vào Sức khỏe và Thông báo của con', () => {
  it('có nút Sức khỏe của từng con; nút Thông báo chỉ khi đã bật MD-CONBAO và kèm số chưa xem', async () => {
    const GiaDinh = require('../src/app/(parent)/(tabs)/gia-dinh').default;
    const { api, childId } = await kidSetup(true);
    await api.childAlertSend('KHONG_KHOE', 'g1');
    await api.auth.sendEmailOtp('test.gia@example.com');
    await api.auth.verifyEmailOtp('test.gia@example.com', '123456');
    mockUseApp.mockReturnValue({ api, home: await api.getHome(), refreshHome: jest.fn(async () => undefined) });
    await render(<GiaDinh />);
    await fireEvent.press(screen.getByText('Sức khỏe của Bin'));
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/(parent)/suc-khoe', params: { childId } });
    await fireEvent.press(await screen.findByText('Thông báo của con (1 chưa xem)'));
    expect(mockPush).toHaveBeenCalledWith('/(parent)/thong-bao');
  });

  it('chưa bật MD-CONBAO: không có nút Thông báo của con', async () => {
    const GiaDinh = require('../src/app/(parent)/(tabs)/gia-dinh').default;
    const { api } = await kidSetup(false);
    await api.auth.sendEmailOtp('test.gia@example.com');
    await api.auth.verifyEmailOtp('test.gia@example.com', '123456');
    mockUseApp.mockReturnValue({ api, home: await api.getHome(), refreshHome: jest.fn(async () => undefined) });
    await render(<GiaDinh />);
    await waitFor(() => screen.getByText('Sức khỏe của Bin'));
    expect(screen.queryByText(/Thông báo của con/)).toBeNull();
  });
});
