// D-76: màn thỏa thuận lúc đăng ký (nội dung PA-32 + khung cuộn Điều khoản + nút Đồng ý) và cổng điều hướng parentStage (mock api, không mạng).
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';

import ThoaThuan from '../src/app/(parent)/thoa-thuan';
import { ApiError } from '../src/data/errors';
import { MOCK_OTP, MOCK_TERMS_VERSION, createMockApi, type MockApi } from '../src/data/mock';
import { AppProvider, useApp } from '../src/state/app';
import { TUYEN_BO_QUYEN_RIENG_TU } from '../src/content/dieu-khoan';

const mockUseApp = jest.fn();
let mockApi: MockApi | null = null;
jest.mock('@/state/app', () => ({ useApp: () => mockUseApp() }));
jest.mock('../src/data', () => ({ getApi: () => mockApi }));
jest.mock('../src/variant', () => ({ APP_VARIANT: 'parent' }));
jest.mock('expo-linking', () => ({ getInitialURL: async () => null, addEventListener: () => ({ remove: () => undefined }) }));

describe('Màn thỏa thuận (D-76)', () => {
  it('hiện tuyên bố quyền lưu dữ liệu như PA-32, khung cuộn Điều khoản và nút Đồng ý', async () => {
    mockUseApp.mockReturnValue({ terms: { currentVersion: MOCK_TERMS_VERSION, accepted: false }, acceptTerms: jest.fn(), signOut: jest.fn() });
    await render(<ThoaThuan />);
    expect(screen.getByText(TUYEN_BO_QUYEN_RIENG_TU)).toBeTruthy();
    expect(screen.getByTestId('khung-dieu-khoan')).toBeTruthy();
    expect(screen.getByText('Đồng ý')).toBeTruthy();
  });

  it('bấm Đồng ý gọi acceptTerms một lần', async () => {
    const acceptTerms = jest.fn(async () => undefined);
    mockUseApp.mockReturnValue({ terms: { currentVersion: MOCK_TERMS_VERSION, accepted: false }, acceptTerms, signOut: jest.fn() });
    await render(<ThoaThuan />);
    await fireEvent.press(screen.getByText('Đồng ý'));
    await waitFor(() => expect(acceptTerms).toHaveBeenCalledTimes(1));
  });

  it('lỗi mạng khi Đồng ý: báo lỗi, bấm lại được', async () => {
    const acceptTerms = jest.fn().mockRejectedValueOnce(new ApiError('NETWORK', 'Chưa kết nối được mạng. Bạn kiểm tra mạng rồi thử lại.')).mockResolvedValueOnce(undefined);
    mockUseApp.mockReturnValue({ terms: { currentVersion: MOCK_TERMS_VERSION, accepted: false }, acceptTerms, signOut: jest.fn() });
    await render(<ThoaThuan />);
    await fireEvent.press(screen.getByText('Đồng ý'));
    await waitFor(() => expect(screen.getByText(/Chưa kết nối được mạng/)).toBeTruthy());
    await fireEvent.press(screen.getByText('Đồng ý'));
    await waitFor(() => expect(acceptTerms).toHaveBeenCalledTimes(2));
  });

  it('điều khoản đổi phiên bản giữa chừng (VALIDATION): báo "vừa được cập nhật", không hiện lỗi chung', async () => {
    const acceptTerms = jest.fn().mockRejectedValueOnce(new ApiError('VALIDATION', 'Điều khoản đã đổi, hãy mở lại và đọc bản mới.', 'D-76.version'));
    mockUseApp.mockReturnValue({ terms: { currentVersion: '2026-12-01', accepted: false }, acceptTerms, signOut: jest.fn() });
    await render(<ThoaThuan />);
    await fireEvent.press(screen.getByText('Đồng ý'));
    await waitFor(() => expect(screen.getByText(/vừa được cập nhật/)).toBeTruthy());
  });

  it('không đồng ý thì không đi tiếp: chỉ có lối đăng xuất, không gọi acceptTerms', async () => {
    const acceptTerms = jest.fn();
    const signOut = jest.fn(async () => undefined);
    mockUseApp.mockReturnValue({ terms: { currentVersion: MOCK_TERMS_VERSION, accepted: false }, acceptTerms, signOut });
    await render(<ThoaThuan />);
    await fireEvent.press(screen.getByText('Không đồng ý, đăng xuất'));
    await waitFor(() => expect(signOut).toHaveBeenCalledTimes(1));
    expect(acceptTerms).not.toHaveBeenCalled();
  });
});

describe('Cổng điều hướng parentStage (D-76)', () => {
  const { useApp: realUseApp } = jest.requireActual('../src/state/app') as { useApp: typeof useApp };
  function Probe({ out }: { out: { ctx?: ReturnType<typeof useApp> } }) {
    const ctx = realUseApp();
    out.ctx = ctx;
    return <Text>{ctx.parentStage}</Text>;
  }
  const { AppProvider: RealProvider } = jest.requireActual('../src/state/app') as { AppProvider: typeof AppProvider };

  async function login(api: MockApi) {
    await api.auth.sendEmailOtp('test.gia@example.com');
    await api.auth.verifyEmailOtp('test.gia@example.com', MOCK_OTP);
  }
  async function mount(api: MockApi) {
    mockApi = api;
    const out: { ctx?: ReturnType<typeof useApp> } = {};
    await render(
      <RealProvider>
        <Probe out={out} />
      </RealProvider>,
    );
    return out;
  }

  it('đăng nhập lần đầu chưa đồng ý: needTerms; Đồng ý xong: needHome; không gọi familyCreate trước đó', async () => {
    const api = createMockApi({ latencyMs: 0 });
    await login(api);
    const create = jest.spyOn(api, 'familyCreate');
    const out = await mount(api);
    await waitFor(() => expect(screen.getByText('needTerms')).toBeTruthy());
    expect(create).not.toHaveBeenCalled();
    await act(async () => {
      await out.ctx!.acceptTerms();
    });
    await waitFor(() => expect(screen.getByText('needHome')).toBeTruthy());
  });

  it('người đã đồng ý bản hiện hành: bỏ qua màn thỏa thuận (needHome ngay)', async () => {
    const api = createMockApi({ latencyMs: 0, termsAccepted: true });
    await login(api);
    await mount(api);
    await waitFor(() => expect(screen.getByText('needHome')).toBeTruthy());
    expect(screen.queryByText('needTerms')).toBeNull();
  });

  it('người đã có hộ và con, Điều khoản đổi phiên bản: hỏi lại (needTerms), đồng ý bản mới thì về ready', async () => {
    const api = createMockApi({ latencyMs: 0, termsAccepted: true });
    await login(api);
    const { householdId } = await api.familyCreate('chị Lan');
    await api.childCreate({ householdId, callName: 'Bin', grade: 3, ageYears: null, hasDevice: false, idempotencyKey: 'k1' });
    api.setTermsVersion('2026-12-01');
    const out = await mount(api);
    await waitFor(() => expect(screen.getByText('needTerms')).toBeTruthy());
    await act(async () => {
      await out.ctx!.acceptTerms();
    });
    await waitFor(() => expect(screen.getByText('ready')).toBeTruthy());
  });

  it('không nạp được trạng thái điều khoản (mạng): không chặn ở máy khách (máy chủ vẫn chặn tạo hộ)', async () => {
    const api = createMockApi({ latencyMs: 0 });
    await login(api);
    jest.spyOn(api, 'termsStatus').mockRejectedValue(new ApiError('NETWORK', 'mạng'));
    await mount(api);
    await waitFor(() => expect(screen.getByText('needHome')).toBeTruthy());
  });
});
