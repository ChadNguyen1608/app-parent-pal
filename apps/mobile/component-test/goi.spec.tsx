// D-68: gói dịch vụ trong app phụ huynh: tab Gia đình hiện gói và khóa nút ghép máy; màn ghép máy giải thích khi chưa PREMIUM;
// máy chủ báo PLAN_REQUIRED thì hiện màn "Cần gói" thay vì lỗi đỏ.
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import GhepMay from '../src/app/(parent)/ghep-may';
import GiaDinh from '../src/app/(parent)/(tabs)/gia-dinh';
import CanGoi from '../src/app/(parent)/can-goi';
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
  const { api, home } = await parentWithChild(plan);
  const myPlan = withPlanInContext ? await api.myPlan() : null;
  mockUseApp.mockReturnValue({ api, home, refreshHome: async () => undefined, plan: myPlan, refreshPlan: async () => undefined });
  return { api, home };
}

beforeEach(() => {
  mockPush.mockClear();
  mockBack.mockClear();
  mockParams = {};
});

describe('Tab Gia đình theo gói (D-68)', () => {
  it('TRIAL: hiện gói và số lượt; nút ghép máy bị khóa, bấm vào thì đi tới màn giải thích (không vào màn nhập mã)', async () => {
    await setup('TRIAL', true);
    await render(<GiaDinh />);
    expect(screen.getByText('Gói: Dùng thử')).toBeTruthy();
    expect(screen.getByText(/Đã tạo 0\/1 kế hoạch\. Còn 3 lần chỉnh sửa\./)).toBeTruthy();
    expect(screen.queryByText('Ghép máy của con')).toBeNull();
    await fireEvent.press(screen.getByText('Ghép máy của con (cần Premium)'));
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/(parent)/can-goi', params: { rule: 'D-68.premium' } });
  });

  it('FREE: nói rõ chưa tạo được kế hoạch và ghép máy cần Premium', async () => {
    await setup('FREE', true);
    await render(<GiaDinh />);
    expect(screen.getByText('Gói: Miễn phí')).toBeTruthy();
    expect(screen.getByText('Chưa tạo được kế hoạch.')).toBeTruthy();
    expect(screen.getByText('Ghép máy của con (cần Premium)')).toBeTruthy();
  });

  it('PREMIUM: nút ghép máy bình thường, đi tới màn ghép máy', async () => {
    const { home } = await setup('PREMIUM', true);
    await render(<GiaDinh />);
    expect(screen.getByText('Gói: Premium')).toBeTruthy();
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

describe('Màn ghép máy và màn "Cần gói" (D-68)', () => {
  it('app đã biết gói TRIAL: màn ghép máy hiện lời giải thích, không có ô nhập mã', async () => {
    await setup('TRIAL', true);
    await render(<GhepMay />);
    expect(screen.getByText('Ghép máy cần gói Premium')).toBeTruthy();
    expect(screen.queryByLabelText(/Mã trên máy con/)).toBeNull();
    await fireEvent.press(screen.getByText('Quay lại'));
    expect(mockBack).toHaveBeenCalled();
  });

  it('app chưa biết gói: nhập mã, máy chủ báo PLAN_REQUIRED thì chuyển sang màn "Cần gói" (không hiện lỗi đỏ, không đòi PIN)', async () => {
    await setup('TRIAL', false);
    await render(<GhepMay />);
    await fireEvent.changeText(screen.getByLabelText(/Mã trên máy con/), '123456');
    await fireEvent.press(screen.getByText('Ghép máy'));
    await waitFor(() => expect(screen.getByText('Ghép máy cần gói Premium')).toBeTruthy());
    expect(screen.queryByText(/Đặt PIN/)).toBeNull();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it.each([
    ['D-68.trial_plan', 'Gói dùng thử đã tạo đủ kế hoạch'],
    ['D-68.trial_edit', 'Đã dùng hết lượt chỉnh sửa'],
    ['D-68.free', 'Cần gói dùng thử hoặc Premium'],
    ['ma-la', 'Cần gói dùng thử hoặc Premium'],
    [undefined, 'Cần gói dùng thử hoặc Premium'],
  ])('màn can-goi với quy tắc %s: tiêu đề "%s", có lời về thanh toán', async (rule, title) => {
    mockParams = rule ? { rule } : {};
    await render(<CanGoi />);
    expect(screen.getByText(title)).toBeTruthy();
    expect(screen.getByText(/chưa có thanh toán/)).toBeTruthy();
  });
});
