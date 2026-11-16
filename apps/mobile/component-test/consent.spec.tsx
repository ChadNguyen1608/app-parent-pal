// PA-02, PA-32, PA-33, PA-34, PA-35/36, PA-39, CA-17, CA-18: màn đồng ý, rút, xóa, đóng băng (mock api, không mạng).
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

describe('PA-02 Đồng ý theo từng tính năng', () => {
  it('mục tùy chọn không chọn sẵn, mục lõi bắt buộc, mục thứ 8 hiện "Đang chờ duyệt" và không bật được', async () => {
    await setup();
    await render(<DongY />);
    await waitFor(() => expect(screen.getByLabelText('Đánh dấu "Xong" trên máy con')).toBeTruthy());
    expect(screen.getByLabelText('Lịch và thời khóa biểu của con').props.accessibilityState.checked).toBe(true);
    expect(screen.getByLabelText('Hỏi thăm sau giờ học').props.accessibilityState.checked).toBe(false);
    const conbao = screen.getByLabelText('Con báo không khỏe (tùy chọn)');
    expect(conbao.props.accessibilityState.disabled).toBe(true);
    expect(screen.getByText('Đang chờ duyệt')).toBeTruthy();
    expect(screen.getByText('Không thu: vị trí GPS, ảnh, ghi âm, sức khỏe, tên trường, địa chỉ.')).toBeTruthy();
  });

  it('mục con bị khóa tới khi chọn mục cha; bỏ mục cha thì bỏ mục con', async () => {
    await setup();
    await render(<DongY />);
    await waitFor(() => screen.getByLabelText('Báo cáo tuần'));
    expect(screen.getByLabelText('Đánh dấu "Xong" trên máy con').props.accessibilityState.disabled).toBe(true);
    await fireEvent.press(screen.getByLabelText('Nhắc giờ trên máy con'));
    await fireEvent.press(screen.getByLabelText('Đánh dấu "Xong" trên máy con'));
    expect(screen.getByLabelText('Đánh dấu "Xong" trên máy con').props.accessibilityState.checked).toBe(true);
    await fireEvent.press(screen.getByLabelText('Nhắc giờ trên máy con'));
    expect(screen.getByLabelText('Đánh dấu "Xong" trên máy con').props.accessibilityState.checked).toBe(false);
  });

  it('Đồng ý và tiếp tục: ghi mục lõi và các mục đã chọn theo thứ tự cha trước con', async () => {
    const { api, childId, refreshHome } = await setup();
    const spy = jest.spyOn(api, 'consentRecord');
    await render(<DongY />);
    await waitFor(() => screen.getByLabelText('Báo cáo tuần'));
    await fireEvent.press(screen.getByLabelText('Nhắc giờ trên máy con'));
    await fireEvent.press(screen.getByLabelText('Đánh dấu "Xong" trên máy con'));
    await fireEvent.press(screen.getByText('Đồng ý và tiếp tục'));
    await waitFor(() => expect(refreshHome).toHaveBeenCalled());
    expect(spy.mock.calls.map((c) => c[0].purposeCode)).toEqual(['MD-LICH', 'MD-DONGBO', 'MD-XONG']);
    expect((await api.getHome())!.children[0].coreConsent).toBe(true);
    expect((await api.getConsentOverview(childId)).states['MD-MET']).toBeUndefined();
  });

  it('Không đồng ý: không ghi gì, có đường quay lại và đăng xuất', async () => {
    const { api, signOut } = await setup();
    const spy = jest.spyOn(api, 'consentRecord');
    await render(<DongY />);
    await waitFor(() => screen.getByLabelText('Báo cáo tuần'));
    await fireEvent.press(screen.getByText('Không đồng ý'));
    expect(screen.getByText('Mình dừng ở đây')).toBeTruthy();
    expect(spy).not.toHaveBeenCalled();
    await fireEvent.press(screen.getByText('Đăng xuất'));
    expect(signOut).toHaveBeenCalled();
  });
});

describe('PA-32 Quyền riêng tư và đồng ý', () => {
  const all = ['MD-LICH', 'MD-DONGBO', 'MD-XONG', 'MD-MET', 'MD-MONGMUON', 'MD-BAOCAO'];

  it('tắt mục đang bật là rút đồng ý ngay; mục thứ 8 hiện "Đang chờ duyệt" và khóa', async () => {
    const { api, childId } = await setup({ consent: all });
    await render(<QuyenRieng />);
    await waitFor(() => expect(screen.getByLabelText('Báo cáo tuần').props.value).toBe(true));
    expect(screen.getByLabelText('Con báo không khỏe (tùy chọn)').props.disabled).toBe(true);
    expect(screen.getByLabelText('Lịch và thời khóa biểu').props.disabled).toBe(true);
    await fireEvent(screen.getByLabelText('Hỏi thăm sau giờ học'), 'valueChange', false);
    await waitFor(() => expect(screen.getByLabelText('Hỏi thăm sau giờ học').props.value).toBe(false));
    expect((await api.getConsentOverview(childId)).states['MD-MET'].state).toBe('DA_RUT');
  });

  it('tắt mục cha: hỏi trước, liệt kê mục con bị tắt theo; "Giữ nguyên" không rút gì', async () => {
    const { api, childId } = await setup({ consent: all });
    await render(<QuyenRieng />);
    await waitFor(() => expect(screen.getByLabelText('Nhắc giờ trên máy con').props.value).toBe(true));
    await fireEvent(screen.getByLabelText('Nhắc giờ trên máy con'), 'valueChange', false);
    expect(screen.getByText(/cũng tắt: Đánh dấu "Xong", Hỏi thăm sau giờ học, Mong muốn của con, Báo cáo tuần/)).toBeTruthy();
    await fireEvent.press(screen.getByText('Giữ nguyên'));
    expect((await api.getConsentOverview(childId)).states['MD-DONGBO'].state).toBe('DANG_BAT');
    await fireEvent(screen.getByLabelText('Nhắc giờ trên máy con'), 'valueChange', false);
    await fireEvent.press(screen.getByText('Tắt'));
    await waitFor(() => expect(screen.getByLabelText('Nhắc giờ trên máy con').props.value).toBe(false));
    expect((await api.getConsentOverview(childId)).states['MD-XONG'].state).toBe('DA_RUT');
    expect(screen.getByLabelText('Báo cáo tuần').props.value).toBe(false);
  });

  it('"Rút toàn bộ đồng ý" mở PA-35 cho đúng con', async () => {
    const { childId } = await setup({ consent: ['MD-LICH'] });
    await render(<QuyenRieng />);
    await waitFor(() => screen.getByLabelText('Báo cáo tuần'));
    await fireEvent.press(screen.getByText('Rút toàn bộ đồng ý'));
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/(parent)/xoa', params: { scope: 'RUT', childId } });
  });
});

describe('PA-35, PA-36 Xóa và rút toàn bộ: hai bước theo máy chủ', () => {
  it('chưa gõ XÓA thì không gọi máy chủ; gõ XÓA: bước 1 lấy hệ quả, bước 2 gửi mã, rồi hồ sơ bị ẩn', async () => {
    const { api, childId, refreshHome } = await setup({ consent: ['MD-LICH', 'MD-DONGBO'] });
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
    expect(screen.getByText(/Rút đồng ý: Nhắc giờ trên máy con, Lịch và thời khóa biểu/)).toBeTruthy();
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
