// PA-02, PA-32, PA-33, PA-34, PA-35/36, PA-39, CA-17, CA-18: màn đồng ý (D-64), rút, xóa, đóng băng (mock api, không mạng).
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import CaiDat from '../src/app/(parent)/du-lieu';
import DongY from '../src/app/(parent)/dong-y';
import QuyenRieng from '../src/app/(parent)/quyen-rieng-tu';
import TamKhoa from '../src/app/(parent)/tam-khoa';
import Xoa from '../src/app/(parent)/xoa';
import XuatDuLieu from '../src/app/(parent)/xuat-du-lieu';
import TamDung from '../src/app/(child)/tam-dung';
import { MatKetNoi } from '../src/ui/MatKetNoi';
import { parentWithChild } from './helpers';

const mockUseApp = jest.fn();
const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockParams = jest.fn((): Record<string, string> => ({}));
jest.mock('@/state/app', () => ({ useApp: () => mockUseApp() }));
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace, back: jest.fn(), push: mockPush }),
  useLocalSearchParams: () => mockParams(),
  useFocusEffect: (cb: () => void) => require('react').useEffect(cb, []),
}));


beforeEach(() => {
  mockPush.mockClear();
  mockReplace.mockClear();
  mockParams.mockReturnValue({});
});

async function setup(opts: { consent?: string[]; frozen?: boolean } = {}) {
  const { api, home } = await parentWithChild();
  const childId = home!.children[0].id;
  for (const code of opts.consent ?? []) await api.consentRecord({ childId, purposeCode: code, event: 'DONG_Y' });
  let h = await api.getHome();
  const refreshHome = jest.fn(async () => {
    h = await api.getHome();
    mockUseApp.mockReturnValue({ api, home: h, refreshHome, signOut });
  });
  const signOut = jest.fn(async () => undefined);
  mockUseApp.mockReturnValue({ api, home: h, refreshHome, signOut });
  return { api, childId, refreshHome, signOut };
}

describe('PA-02 Đồng ý (D-64): một đồng ý cốt lõi và hai lựa chọn riêng', () => {
  it('không còn danh sách từng tính năng; hai mục riêng không chọn sẵn', async () => {
    await setup();
    await render(<DongY />);
    await waitFor(() => expect(screen.getByLabelText('Lưu thông tin sức khỏe của con')).toBeTruthy());
    expect(screen.getByLabelText('Lưu thông tin sức khỏe của con').props.accessibilityState.checked).toBe(false);
    expect(screen.getByLabelText('Cho con báo bố mẹ ngay').props.accessibilityState.checked).toBe(false);
    expect(screen.getByText(/Lịch của con, đồng bộ sang máy con và nhắc giờ, con bấm "Xong", hỏi thăm sau giờ học, mong muốn của con, báo cáo tuần/)).toBeTruthy();
    for (const old of ['Đánh dấu "Xong" trên máy con', 'Hỏi thăm sau giờ học', 'Nhắc giờ trên máy con', 'Báo cáo tuần', 'Mong muốn của con', 'Lịch sử thay đổi lịch']) {
      expect(screen.queryByLabelText(old)).toBeNull();
    }
    expect(screen.getAllByRole('checkbox')).toHaveLength(2);
  });

  it('"Đồng ý và tiếp tục" mà không chọn gì: chỉ ghi MD-LICH', async () => {
    const { api, childId, refreshHome } = await setup();
    const spy = jest.spyOn(api, 'consentRecord');
    await render(<DongY />);
    await waitFor(() => screen.getByLabelText('Cho con báo bố mẹ ngay'));
    await fireEvent.press(screen.getByText('Đồng ý và tiếp tục'));
    await waitFor(() => expect(refreshHome).toHaveBeenCalled());
    expect(spy.mock.calls.map((c) => c[0].purposeCode)).toEqual(['MD-LICH']);
    const c = (await api.getHome())!.children[0];
    expect([c.coreConsent, c.healthConsent, c.alertConsent]).toEqual([true, false, false]);
    expect((await api.getConsentOverview(childId)).states['MD-SUCKHOE']).toBeUndefined();
  });

  it('chọn cả hai mục riêng: ghi MD-LICH trước rồi MD-SUCKHOE, MD-CONBAO', async () => {
    const { api, refreshHome } = await setup();
    const spy = jest.spyOn(api, 'consentRecord');
    await render(<DongY />);
    await waitFor(() => screen.getByLabelText('Cho con báo bố mẹ ngay'));
    await fireEvent.press(screen.getByLabelText('Cho con báo bố mẹ ngay'));
    await fireEvent.press(screen.getByLabelText('Lưu thông tin sức khỏe của con'));
    expect(screen.getByLabelText('Lưu thông tin sức khỏe của con').props.accessibilityState.checked).toBe(true);
    await fireEvent.press(screen.getByText('Đồng ý và tiếp tục'));
    await waitFor(() => expect(refreshHome).toHaveBeenCalled());
    expect(spy.mock.calls.map((c) => c[0].purposeCode)).toEqual(['MD-LICH', 'MD-SUCKHOE', 'MD-CONBAO']);
    const c = (await api.getHome())!.children[0];
    expect([c.coreConsent, c.healthConsent, c.alertConsent]).toEqual([true, true, true]);
  });

  it('Không đồng ý: không ghi gì, có đường quay lại và đăng xuất', async () => {
    const { api, signOut } = await setup();
    const spy = jest.spyOn(api, 'consentRecord');
    await render(<DongY />);
    await waitFor(() => screen.getByLabelText('Cho con báo bố mẹ ngay'));
    await fireEvent.press(screen.getByText('Không đồng ý'));
    expect(screen.getByText('Mình dừng ở đây')).toBeTruthy();
    expect(spy).not.toHaveBeenCalled();
    await fireEvent.press(screen.getByText('Đăng xuất'));
    expect(signOut).toHaveBeenCalled();
  });
});

describe('PA-32 Quyền riêng tư và đồng ý (D-64)', () => {
  const all = ['MD-LICH', 'MD-SUCKHOE', 'MD-CONBAO'];

  it('mục lõi khóa; hai mục riêng có công tắc, tắt phải xác nhận rồi mới rút', async () => {
    const { api, childId } = await setup({ consent: all });
    await render(<QuyenRieng />);
    await waitFor(() => expect(screen.getByLabelText('Thông tin sức khỏe của con').props.value).toBe(true));
    expect(screen.getByLabelText('Phần cốt lõi').props.disabled).toBe(true);
    await fireEvent(screen.getByLabelText('Con báo bố mẹ ngay'), 'valueChange', false);
    expect(screen.getByText(/dữ liệu cũ của mục này được ẩn ngay, sẽ không hiện lại khi bạn bật lại/)).toBeTruthy();
    await fireEvent.press(screen.getByText('Giữ nguyên'));
    expect((await api.getConsentOverview(childId)).states['MD-CONBAO'].state).toBe('DANG_BAT');
    await fireEvent(screen.getByLabelText('Con báo bố mẹ ngay'), 'valueChange', false);
    await fireEvent.press(screen.getByText('Tắt'));
    await waitFor(() => expect(screen.getByLabelText('Con báo bố mẹ ngay').props.value).toBe(false));
    const ov = await api.getConsentOverview(childId);
    expect([ov.states['MD-CONBAO'].state, ov.states['MD-SUCKHOE'].state, ov.states['MD-LICH'].state]).toEqual(['DA_RUT', 'DANG_BAT', 'DANG_BAT']);
  });

  it('bật lại mục đã tắt là đồng ý lại ngay (không cần xác nhận)', async () => {
    const { api, childId } = await setup({ consent: ['MD-LICH'] });
    await render(<QuyenRieng />);
    await waitFor(() => expect(screen.getByLabelText('Thông tin sức khỏe của con').props.value).toBe(false));
    await fireEvent(screen.getByLabelText('Thông tin sức khỏe của con'), 'valueChange', true);
    await waitFor(() => expect(screen.getByLabelText('Thông tin sức khỏe của con').props.value).toBe(true));
    expect((await api.getConsentOverview(childId)).states['MD-SUCKHOE'].state).toBe('DANG_BAT');
  });

  it('"Rút toàn bộ" có hai lối: cho đúng con và cho cả gia đình', async () => {
    const { childId } = await setup({ consent: ['MD-LICH'] });
    await render(<QuyenRieng />);
    await waitFor(() => screen.getByLabelText('Con báo bố mẹ ngay'));
    await fireEvent.press(screen.getByText('Rút toàn bộ đồng ý cho Bin'));
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/(parent)/xoa', params: { scope: 'RUT', childId } });
    await fireEvent.press(screen.getByText('Rút toàn bộ đồng ý cho cả gia đình'));
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/(parent)/xoa', params: { scope: 'GIA_DINH' } });
  });

  it('người lớn khác: công tắc khóa, không có nút rút toàn bộ', async () => {
    const { api } = await setup({ consent: ['MD-LICH'] });
    mockUseApp.mockReturnValue({ api, home: { ...(await api.getHome())!, role: 'SUPPORTER' }, refreshHome: jest.fn() });
    await render(<QuyenRieng />);
    await waitFor(() => screen.getByLabelText('Con báo bố mẹ ngay'));
    expect(screen.getByLabelText('Con báo bố mẹ ngay').props.disabled).toBe(true);
    expect(screen.queryByText(/Rút toàn bộ/)).toBeNull();
    expect(screen.queryByText(/Rút toàn bộ đồng ý/)).toBeNull();
  });
});

describe('PA-35, PA-36 Xóa và rút toàn bộ: hai bước theo máy chủ', () => {
  it('chưa gõ XÓA thì không gọi máy chủ; gõ XÓA: bước 1 lấy hệ quả, bước 2 gửi mã, rồi hồ sơ bị ẩn', async () => {
    const { api, childId, refreshHome } = await setup({ consent: ['MD-LICH', 'MD-SUCKHOE'] });
    mockParams.mockReturnValue({ scope: 'RUT', childId });
    const s1 = jest.spyOn(api, 'withdrawAllStart');
    const s2 = jest.spyOn(api, 'withdrawAllConfirm');
    await render(<Xoa />);
    await fireEvent.press(screen.getByText('Xác nhận lần 1'));
    expect(screen.getByText(/Bạn gõ XÓA/)).toBeTruthy();
    expect(s1).not.toHaveBeenCalled();
    await fireEvent.changeText(screen.getByLabelText('Gõ XÓA để xác nhận'), 'xóa');
    await fireEvent.press(screen.getByText('Xác nhận lần 1'));
    await waitFor(() => expect(screen.getByText('Xác nhận lần hai')).toBeTruthy());
    expect(s1).toHaveBeenCalledWith(childId);
    expect(s2).not.toHaveBeenCalled();
    expect(screen.getByText(/Rút đồng ý: Phần cốt lõi, Thông tin sức khỏe của con/)).toBeTruthy();
    expect(screen.getByText(/chưa bị xóa hẳn ngay/)).toBeTruthy();
    await fireEvent.press(screen.getByText('Xác nhận lần 2'));
    await waitFor(() => expect(screen.getByText('Đã nhận yêu cầu')).toBeTruthy());
    expect(s2).toHaveBeenCalledWith(childId, expect.any(String));
    expect((await api.getHome())!.children).toHaveLength(0);
    expect(screen.queryByText(/đã xóa hết/i)).toBeNull();
    await fireEvent.press(screen.getByText('Xong'));
    expect(refreshHome).toHaveBeenCalled();
  });

  it('mã hết hạn: máy chủ buộc xác nhận lại từ đầu, lỗi hiện bằng tiếng Việt', async () => {
    const { api, childId } = await setup({ consent: ['MD-LICH'] });
    mockParams.mockReturnValue({ scope: 'RUT', childId });
    jest.spyOn(api, 'withdrawAllConfirm').mockRejectedValueOnce(Object.assign(new Error('x'), { message: 'VALIDATION', hint: 'Cần xác nhận lại từ bước đầu.', details: 'D-42' }));
    await render(<Xoa />);
    await fireEvent.changeText(screen.getByLabelText('Gõ XÓA để xác nhận'), 'XÓA');
    await fireEvent.press(screen.getByText('Xác nhận lần 1'));
    await waitFor(() => screen.getByText('Xác nhận lần hai'));
    await fireEvent.press(screen.getByText('Xác nhận lần 2'));
    await waitFor(() => expect(screen.getByText('Cần xác nhận lại từ bước đầu.')).toBeTruthy());
    expect(screen.getByText('Xác nhận lần 1')).toBeTruthy();
  });

  it('vào từ "Rút toàn bộ cho cả gia đình": chọn sẵn xóa gia đình, hai bước rồi deletion_request GIA_DINH', async () => {
    const { api } = await setup({ consent: ['MD-LICH'] });
    mockParams.mockReturnValue({ scope: 'GIA_DINH' });
    const del = jest.spyOn(api, 'deletionRequest');
    await render(<Xoa />);
    await fireEvent.changeText(screen.getByLabelText('Gõ XÓA để xác nhận'), 'XÓA');
    await fireEvent.press(screen.getByText('Xác nhận lần 1'));
    await fireEvent.press(await screen.findByText('Xác nhận lần 2'));
    await waitFor(() => expect(screen.getByText('Đã nhận yêu cầu')).toBeTruthy());
    expect(del).toHaveBeenCalledWith('GIA_DINH');
    expect((await api.getHome())!.householdState).toBe('CHO_XOA');
  });

  it('hộ nhiều con: rút cho một con chỉ ẩn con đó, con kia còn nguyên', async () => {
    const { api, childId } = await setup({ consent: ['MD-LICH'] });
    const { householdId } = (await api.getHome())!;
    const second = await api.childCreate({ householdId, callName: 'Na', grade: 1, hasDevice: false });
    await api.consentRecord({ childId: second.childId, purposeCode: 'MD-LICH', event: 'DONG_Y' });
    mockParams.mockReturnValue({ scope: 'RUT', childId });
    await render(<Xoa />);
    await fireEvent.changeText(screen.getByLabelText('Gõ XÓA để xác nhận'), 'XÓA');
    await fireEvent.press(screen.getByText('Xác nhận lần 1'));
    await fireEvent.press(await screen.findByText('Xác nhận lần 2'));
    await waitFor(() => expect(screen.getByText('Đã nhận yêu cầu')).toBeTruthy());
    const home = (await api.getHome())!;
    expect(home.children.map((c) => c.callName)).toEqual(['Na']);
    expect(home.householdState).toBe('HOAT_DONG');
    expect(home.openDeletions[0]).toMatchObject({ scope: 'HO_SO_CON', childId });
  });

  it('xóa gia đình dùng deletion_request ở lần hai (không gọi rút toàn bộ)', async () => {
    const { api } = await setup({ consent: ['MD-LICH'] });
    const del = jest.spyOn(api, 'deletionRequest');
    const wd = jest.spyOn(api, 'withdrawAllStart');
    await render(<Xoa />);
    await fireEvent.press(screen.getByText('Xóa gia đình và tài khoản'));
    await fireEvent.changeText(screen.getByLabelText('Gõ XÓA để xác nhận'), 'XÓA');
    await fireEvent.press(screen.getByText('Xác nhận lần 1'));
    await fireEvent.press(await screen.findByText('Xác nhận lần 2'));
    await waitFor(() => expect(screen.getByText('Đã nhận yêu cầu')).toBeTruthy());
    expect(del).toHaveBeenCalledWith('GIA_DINH');
    expect(wd).not.toHaveBeenCalled();
  });
});

describe('PA-33, PA-34', () => {
  it('PA-33: giữ câu "không hứa đã xóa hết" và dẫn tới sổ đồng ý, xuất, xóa', async () => {
    await setup({ consent: ['MD-LICH'] });
    await render(<CaiDat />);
    expect(screen.getByText(/app không hứa "đã xóa hết" khi chưa xóa hẳn/)).toBeTruthy();
    await fireEvent.press(screen.getByText('Xem sổ đồng ý'));
    expect(mockPush).toHaveBeenCalledWith('/(parent)/quyen-rieng-tu');
  });

  it('PA-34: máy chủ trả BLOCKED_H4, hiện lời tiếng Việt', async () => {
    await setup({ consent: ['MD-LICH'] });
    await render(<XuatDuLieu />);
    await fireEvent.press(screen.getByText('Gửi yêu cầu xuất'));
    await waitFor(() => expect(screen.getByText('Xuất dữ liệu chưa mở ở bản thử.')).toBeTruthy());
  });
});

describe('PA-39 Tài khoản tạm khóa', () => {
  it('QL bấm Mở lại: gọi household_reopen(true) rồi nạp lại hộ', async () => {
    const { api, refreshHome } = await setup({ consent: ['MD-LICH'] });
    (api as unknown as { setHouseholdState(s: string): void }).setHouseholdState('DONG_BANG');
    const spy = jest.spyOn(api, 'householdReopen');
    await render(<TamKhoa />);
    expect(screen.getByText('Tài khoản gia đình đang tạm khóa')).toBeTruthy();
    expect(screen.getByText(/Máy của Bin chỉ còn xem lịch đã có, không nhận lịch mới. Dữ liệu vẫn được giữ nguyên./)).toBeTruthy();
    await fireEvent.press(screen.getByText('Mở lại tài khoản'));
    await waitFor(() => expect(refreshHome).toHaveBeenCalled());
    expect(spy).toHaveBeenCalledWith(true);
    expect((await api.getHome())!.householdState).toBe('HOAT_DONG');
  });

  it('người lớn khác: không có nút mở lại', async () => {
    const { api } = await setup();
    mockUseApp.mockReturnValue({ api, home: { ...(await api.getHome())!, role: 'SUPPORTER' }, refreshHome: jest.fn() });
    await render(<TamKhoa />);
    expect(screen.queryByText('Mở lại tài khoản')).toBeNull();
  });
});

describe('CA-17, CA-18', () => {
  it('CA-17: câu và nút đúng wireframe', async () => {
    const onNewCode = jest.fn();
    await render(<MatKetNoi onNewCode={onNewCode} />);
    expect(screen.getByText('Máy này không còn kết nối với gia đình.')).toBeTruthy();
    await fireEvent.press(screen.getByText('Lấy mã mới'));
    expect(onNewCode).toHaveBeenCalled();
  });

  it('CA-18: câu đúng wireframe; "Xem lịch đã có" bỏ màn tạm dừng và sang Hôm nay', async () => {
    const dismissPause = jest.fn();
    mockUseApp.mockReturnValue({ dismissPause });
    await render(<TamDung />);
    expect(screen.getByText('Gia đình đang tạm dừng app.')).toBeTruthy();
    expect(screen.getByText('Con vẫn xem được lịch đã có. Con nhờ bố mẹ mở app nhé.')).toBeTruthy();
    await fireEvent.press(screen.getByText('Xem lịch đã có'));
    expect(dismissPause).toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith('/(child)/(tabs)/hom-nay');
  });
});
