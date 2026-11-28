// D-68, D-72: gói dịch vụ trong app phụ huynh (và máy con tạm dừng): tab Gia đình hiện gói và khóa nút ghép máy; màn ghép máy giải thích khi chưa PREMIUM;
// máy chủ báo PLAN_REQUIRED thì hiện màn "Cần gói" thay vì lỗi đỏ.
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import GhepMay from '../src/app/(parent)/ghep-may';
import GiaDinh from '../src/app/(parent)/(tabs)/gia-dinh';
import CanGoi from '../src/app/(parent)/can-goi';
import TamDung from '../src/app/(child)/tam-dung';
import { MOCK_PAIR_CODE, createMockApi } from '../src/data/mock';
import type { PlanTier } from '../src/data/types';
import { parentWithChild } from './helpers';

const mockUseApp = jest.fn();
const mockPush = jest.fn();
const mockBack = jest.fn();
let mockParams: Record<string, string> = {};
jest.mock('@/state/app', () => ({ useApp: () => mockUseApp() }));
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: jest.fn(), back: mockBack, push: mockPush, canGoBack: () => true }),
  useLocalSearchParams: () => mockParams,
  useFocusEffect: (cb: () => void) => require('react').useEffect(cb, []),
}));

async function setup(plan: PlanTier, withPlanInContext: boolean) {
  const { api, home } = await parentWithChild({ plan });
  const myPlan = withPlanInContext ? await api.myPlan() : null;
  mockUseApp.mockReturnValue({ api, home, refreshHome: async () => undefined, plan: myPlan, refreshPlan: async () => undefined });
  return { api, home };
}

beforeEach(() => {
  mockPush.mockClear();
  mockBack.mockClear();
  mockParams = {};
});

describe('Tab Gia đình theo gói (D-68, D-74)', () => {
  it('TRIAL còn khóa: hiện gói, số lượt và "Khóa ghép máy: đã dùng 0/1"; nút ghép máy mở bình thường (dùng thử ghép được 1 máy)', async () => {
    const { home } = await setup('TRIAL', true);
    await render(<GiaDinh />);
    expect(screen.getByText('Gói: Dùng thử')).toBeTruthy();
    expect(screen.getByText('Mỗi con tạo được 1 kế hoạch và chỉnh sửa 3 lần.')).toBeTruthy();
    expect(screen.getByText('Chưa tạo kế hoạch (tạo được 1 kế hoạch).')).toBeTruthy();   // mức dùng của TỪNG CON (D-72)
    expect(screen.getByText('Khóa ghép máy: đã dùng 0/1')).toBeTruthy();
    await fireEvent.press(screen.getByText('Ghép máy của con'));
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/(parent)/ghep-may', params: { childId: home!.children[0].id } });
  });

  it('hết khóa (đã ghép 1 máy với gói dùng thử): hiện "đã dùng 1/1"; con đã ghép khác bị khóa, bấm vào đi tới lời giải thích hết khóa', async () => {
    const { api, home } = await setup('TRIAL', false);
    await api.pairConfirm(home!.children[0].id, MOCK_PAIR_CODE, '482915');
    await api.childCreate({ householdId: home!.householdId, callName: 'Na', grade: 5, hasDevice: true });
    const home2 = await api.getHome();
    mockUseApp.mockReturnValue({ api, home: home2, refreshHome: async () => undefined, plan: await api.myPlan(), refreshPlan: async () => undefined });
    await render(<GiaDinh />);
    expect(screen.getByText('Khóa ghép máy: đã dùng 1/1')).toBeTruthy();
    await fireEvent.press(screen.getByText('Ghép máy của con (hết khóa)'));
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/(parent)/can-goi', params: { rule: 'D-74.keys' } });
  });

  it('FREE: nói rõ chưa tạo được kế hoạch, 0 khóa và ghép máy cần gói', async () => {
    await setup('FREE', true);
    await render(<GiaDinh />);
    expect(screen.getByText('Gói: Miễn phí')).toBeTruthy();
    expect(screen.getByText('Nhập thông tin con và hỏi Pal được; chưa xem trước và tạo lịch được.')).toBeTruthy();
    expect(screen.getByText('Khóa ghép máy: đã dùng 0/0')).toBeTruthy();
    expect(screen.getByText('Ghép máy của con (cần gói)')).toBeTruthy();
    await fireEvent.press(screen.getByText('Dùng thử 7 ngày'));      // lối vào dùng thử (D-72)
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/(parent)/can-goi', params: { rule: 'D-68.free' } });
  });

  it('không có nút Dùng thử khi gói không phải FREE hoặc hộ đã dùng thử', async () => {
    await setup('TRIAL', true);
    const view = await render(<GiaDinh />);
    expect(screen.queryByText(/^Dùng thử \d+ ngày$/)).toBeNull();
    view.unmount();
    await setup('PREMIUM', true);
    await render(<GiaDinh />);
    expect(screen.queryByText(/^Dùng thử \d+ ngày$/)).toBeNull();
  });

  it('PREMIUM: nút ghép máy bình thường, đi tới màn ghép máy', async () => {
    const { home } = await setup('PREMIUM', true);
    await render(<GiaDinh />);
    expect(screen.getByText('Gói: Premium')).toBeTruthy();
    expect(screen.getByText('Khóa ghép máy: đã dùng 0/1')).toBeTruthy();
    await fireEvent.press(screen.getByText('Ghép máy của con'));
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/(parent)/ghep-may', params: { childId: home!.children[0].id } });
  });

  it('chưa nạp được gói (null): không đoán, không khóa nút, không hiện thẻ gói', async () => {
    await setup('TRIAL', false);
    await render(<GiaDinh />);
    expect(screen.queryByText(/^Gói:/)).toBeNull();
    expect(screen.getByText('Ghép máy của con')).toBeTruthy();
  });
});

describe('Màn ghép máy và màn "Cần gói" (D-68, D-74)', () => {
  it('app đã biết gói FREE: màn ghép máy hiện lời giải thích, không có ô nhập mã', async () => {
    await setup('FREE', true);
    await render(<GhepMay />);
    expect(screen.getByText('Ghép máy cần gói dùng thử hoặc Premium')).toBeTruthy();
    expect(screen.queryByLabelText(/Mã trên máy con/)).toBeNull();
    await fireEvent.press(screen.getByText('Quay lại'));
    expect(mockBack).toHaveBeenCalled();
  });

  it('app đã biết gói TRIAL còn khóa: màn ghép máy mở ô nhập mã (dùng thử ghép được 1 máy)', async () => {
    await setup('TRIAL', true);
    await render(<GhepMay />);
    expect(screen.getByLabelText(/Mã trên máy con/)).toBeTruthy();
    expect(screen.queryByText('Ghép máy cần gói dùng thử hoặc Premium')).toBeNull();
  });

  it('app đã biết hết khóa: màn ghép máy giải thích hết khóa và cách xử lý, không có ô nhập mã', async () => {
    const { api, home } = await setup('TRIAL', false);
    await api.pairConfirm(home!.children[0].id, MOCK_PAIR_CODE, '482915');
    await api.childCreate({ householdId: home!.householdId, callName: 'Na', grade: 5, hasDevice: true });
    mockUseApp.mockReturnValue({ api, home: await api.getHome(), refreshHome: async () => undefined, plan: await api.myPlan(), refreshPlan: async () => undefined });
    mockParams = { childId: (await api.getHome())!.children[1].id };
    await render(<GhepMay />);
    expect(screen.getByText('Đã dùng hết khóa ghép máy')).toBeTruthy();
    expect(screen.getByText(/hủy liên kết một máy đang ghép/)).toBeTruthy();
    expect(screen.queryByLabelText(/Mã trên máy con/)).toBeNull();
  });

  it('app chưa biết gói: nhập mã, máy chủ báo hết khóa (DEVICE_KEY_LIMIT) thì chuyển sang màn giải thích (không hiện lỗi đỏ, không đòi PIN)', async () => {
    const { api, home } = await setup('TRIAL', false);
    await api.pairConfirm(home!.children[0].id, MOCK_PAIR_CODE, '482915');
    await api.childCreate({ householdId: home!.householdId, callName: 'Na', grade: 5, hasDevice: true });
    const h2 = await api.getHome();
    mockUseApp.mockReturnValue({ api, home: h2, refreshHome: async () => undefined, plan: null, refreshPlan: async () => undefined });
    mockParams = { childId: h2!.children[1].id };
    await render(<GhepMay />);
    await fireEvent.changeText(screen.getByLabelText(/Mã trên máy con/), '123456');
    await fireEvent.press(screen.getByText('Ghép máy'));
    await waitFor(() => expect(screen.getByText('Đã dùng hết khóa ghép máy')).toBeTruthy());
    expect(screen.queryByText(/Đặt PIN/)).toBeNull();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('app chưa biết gói FREE: nhập mã, máy chủ báo PLAN_REQUIRED thì chuyển sang màn "Cần gói" (không hiện lỗi đỏ, không đòi PIN)', async () => {
    await setup('FREE', false);
    await render(<GhepMay />);
    await fireEvent.changeText(screen.getByLabelText(/Mã trên máy con/), '123456');
    await fireEvent.press(screen.getByText('Ghép máy'));
    await waitFor(() => expect(screen.getByText('Ghép máy cần gói dùng thử hoặc Premium')).toBeTruthy());
    expect(screen.queryByText(/Đặt PIN/)).toBeNull();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it.each([
    ['D-68.trial_edit', 'Đã dùng hết lượt chỉnh sửa'],
    ['D-74.keys', 'Đã dùng hết khóa ghép máy'],
    ['D-68.premium', 'Ghép máy cần gói dùng thử hoặc Premium'],
    ['D-68.free', 'Cần gói dùng thử hoặc Premium'],
    ['ma-la', 'Cần gói dùng thử hoặc Premium'],
    [undefined, 'Cần gói dùng thử hoặc Premium'],
  ])('màn can-goi với quy tắc %s: tiêu đề "%s", có lời về thanh toán', async (rule, title) => {
    mockParams = rule ? { rule } : {};
    mockUseApp.mockReturnValue({ api: {}, plan: null, refreshPlan: async () => undefined });
    await render(<CanGoi />);
    expect(screen.getByText(title)).toBeTruthy();
    expect(screen.getByText(/chưa có thanh toán/)).toBeTruthy();
  });
});

describe('Dùng thử trên màn "Cần gói" (D-72)', () => {
  it('FREE chưa dùng thử: có nút "Dùng thử 7 ngày"; bấm thì gọi trialStart, nạp lại gói rồi quay lại; không hiện lỗi', async () => {
    const { api } = await setup('FREE', true);
    const spy = jest.spyOn(api, 'trialStart');
    const refreshPlan = jest.fn(async () => undefined);
    mockUseApp.mockReturnValue({ api, plan: await api.myPlan(), refreshPlan });
    await render(<CanGoi />);
    expect(screen.getByText(/nhập thông tin con và hỏi Pal, nhưng chưa xem trước và tạo lịch/)).toBeTruthy();
    await fireEvent.press(screen.getByText('Dùng thử 7 ngày'));
    await waitFor(() => expect(mockBack).toHaveBeenCalled());
    expect(spy).toHaveBeenCalledTimes(1);
    expect(refreshPlan).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('alert')).toBeNull();
    expect((await api.myPlan()).tier).toBe('TRIAL');
  });

  it('máy hoặc email đã dùng thử (TRIAL_USED): hiện lời tiếng Việt của máy chủ, không quay lại, không đổi gói', async () => {
    const api = createMockApi({ latencyMs: 0, termsAccepted: true, plan: 'FREE', trialClaimed: true });
    await api.auth.sendEmailOtp('test.gia@example.com');
    await api.auth.verifyEmailOtp('test.gia@example.com', '123456');
    await api.familyCreate('chị Lan');
    mockUseApp.mockReturnValue({ api, plan: await api.myPlan(), refreshPlan: async () => undefined });
    await render(<CanGoi />);
    await fireEvent.press(screen.getByText('Dùng thử 7 ngày'));
    await waitFor(() => expect(screen.getByText('Máy này hoặc email này đã dùng thử rồi.')).toBeTruthy());
    expect(mockBack).not.toHaveBeenCalled();
    expect((await api.myPlan()).tier).toBe('FREE');
  });

  it('FREE chưa dùng thử bị chặn ghép máy: lời giải thích có mời dùng thử và nói ghép được 1 máy (D-74)', async () => {
    const free = createMockApi({ latencyMs: 0, termsAccepted: true, plan: 'FREE' });
    await free.auth.sendEmailOtp('a@b.vn');
    await free.auth.verifyEmailOtp('a@b.vn', '123456');
    mockParams = { rule: 'D-68.premium' };
    mockUseApp.mockReturnValue({ api: free, plan: await free.myPlan(), refreshPlan: async () => undefined });
    await render(<CanGoi />);
    expect(screen.getByText(/dùng thử 7 ngày, ghép được 1 máy/)).toBeTruthy();
    expect(screen.getByText('Dùng thử 7 ngày')).toBeTruthy();
  });

  it('không mời dùng thử khi: lý do là hết khóa hay hết lượt sửa, gói không phải FREE, hộ đã dùng thử, hoặc chưa biết gói', async () => {
    const free = createMockApi({ latencyMs: 0, termsAccepted: true, plan: 'FREE' });
    await free.auth.sendEmailOtp('a@b.vn');
    await free.auth.verifyEmailOtp('a@b.vn', '123456');
    const freePlan = await free.myPlan();
    const cases: Array<[Record<string, string>, unknown]> = [
      [{ rule: 'D-74.keys' }, freePlan],
      [{ rule: 'D-68.trial_edit' }, freePlan],
      [{}, { ...freePlan, tier: 'TRIAL', trialAvailable: false }],
      [{}, { ...freePlan, trialAvailable: false }],
      [{}, null],
    ];
    for (const [params, plan] of cases) {
      mockParams = params;
      mockUseApp.mockReturnValue({ api: free, plan, refreshPlan: async () => undefined });
      const view = await render(<CanGoi />);
      expect(screen.queryByText(/^Dùng thử \d+ ngày$/)).toBeNull();
      view.unmount();
    }
  });
});

describe('Máy con tạm dừng khi gói không còn hoạt động (D-72, D-74, CA-18)', () => {
  it('màn tạm dừng nói chờ bố mẹ cập nhật, không có lịch hay nút làm việc khác', async () => {
    mockUseApp.mockReturnValue({ childPlanActive: false, dismissPause: jest.fn() });
    await render(<TamDung />);
    expect(await screen.findByText('Tạm dừng')).toBeTruthy();
    expect(screen.getByText(/Tạm dừng, chờ bố mẹ cập nhật/)).toBeTruthy();
    expect(screen.queryByRole('button')).toBeNull();
  });
});
