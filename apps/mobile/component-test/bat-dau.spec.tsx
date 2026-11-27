// Bắt đầu (D-73): tạo gia đình rồi thêm con là vào app ngay; đồng ý lõi và hai mục riêng ghi mặc định, không còn màn đồng ý (mock api, không mạng).
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import BatDau from '../src/app/(parent)/bat-dau';
import { createMockApi } from '../src/data/mock';

const mockUseApp = jest.fn();
jest.mock('@/state/app', () => ({ useApp: () => mockUseApp() }));

async function setup() {
  const api = createMockApi({ latencyMs: 0 });
  await api.auth.sendEmailOtp('test.gia@example.com');
  await api.auth.verifyEmailOtp('test.gia@example.com', '123456');
  const refreshHome = jest.fn(async () => undefined);
  mockUseApp.mockReturnValue({ api, home: null, refreshHome });
  return { api, refreshHome };
}

async function fillAndSave() {
  await fireEvent.changeText(screen.getByLabelText('Cách gọi bạn'), 'chị Lan');
  await fireEvent.press(screen.getByText('Tiếp tục'));
  await waitFor(() => screen.getByText('Thêm con'));
  await fireEvent.changeText(screen.getByLabelText('Tên gọi của con'), 'Bin');
  await fireEvent.changeText(screen.getByLabelText('Lớp'), '3');
  await fireEvent.press(screen.getByText('Không'));
  await fireEvent.press(screen.getByText('Lưu'));
}

describe('Bắt đầu: đồng ý mặc định do máy chủ ghi (D-73)', () => {
  it('tạo con xong vào app ngay; không gọi consent_record từ app; ba đồng ý đã có', async () => {
    const { api, refreshHome } = await setup();
    const spy = jest.spyOn(api, 'consentRecord');
    await render(<BatDau />);
    await fillAndSave();
    await waitFor(() => expect(refreshHome).toHaveBeenCalled());
    expect(spy).not.toHaveBeenCalled();
    const c = (await api.getHome())!.children[0];
    expect([c.coreConsent, c.healthConsent, c.alertConsent]).toEqual([true, true, true]);
    expect(screen.queryByText('Đồng ý sử dụng')).toBeNull();
  });

  it('tạo con lỗi: chưa vào app; bấm Lưu lại không tạo con thứ hai', async () => {
    const { api, refreshHome } = await setup();
    jest.spyOn(api, 'childCreate').mockRejectedValueOnce(new Error('mạng'));
    await render(<BatDau />);
    await fillAndSave();
    await waitFor(() => expect(screen.getByText('Lưu')).toBeTruthy());
    expect(refreshHome).not.toHaveBeenCalled();
    await fireEvent.press(screen.getByText('Lưu'));
    await waitFor(() => expect(refreshHome).toHaveBeenCalled());
    expect((await api.getHome())!.children).toHaveLength(1);
  });
});
