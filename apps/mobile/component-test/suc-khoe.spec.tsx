// PA-06 (sức khỏe của con, D-66; D-73: không còn bước hỏi đồng ý, mặc định đã bật), danh sách có nguồn, thêm/sửa/tắt/xóa (mock api, không mạng).
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import SucKhoe from '../src/app/(parent)/suc-khoe';
import { parentWithChild } from './helpers';

const mockUseApp = jest.fn();
const mockParams = jest.fn((): Record<string, string> => ({}));
jest.mock('@/state/app', () => ({ useApp: () => mockUseApp() }));
const mockPush = jest.fn();
jest.mock('expo-router', () => ({ useLocalSearchParams: () => mockParams(), useRouter: () => ({ push: mockPush }) }));

async function setup(opts: { core?: boolean; health?: boolean; role?: 'PRIMARY' | 'SUPPORTER' } = {}) {
  const { api, home } = await parentWithChild();
  const childId = home!.children[0].id;
  if (opts.core !== false) await api.consentRecord({ childId, purposeCode: 'MD-LICH', event: 'DONG_Y' });
  if (opts.health) await api.consentRecord({ childId, purposeCode: 'MD-SUCKHOE', event: 'DONG_Y' });
  const refreshHome = jest.fn(async () => undefined);
  mockUseApp.mockReturnValue({ api, home: { ...(await api.getHome())!, role: opts.role ?? 'PRIMARY' }, refreshHome });
  mockParams.mockReturnValue({ childId });
  return { api, childId };
}

describe('PA-06 Sức khỏe của con', () => {
  it('D-73: không hỏi đồng ý ở đây; mặc định đã bật thì thấy ngay danh sách rỗng và nút thêm ghi chú', async () => {
    await setup({ health: true });
    await render(<SucKhoe />);
    await waitFor(() => expect(screen.getByText('Chưa có ghi chú nào.')).toBeTruthy());
    expect(screen.getByText('Thêm ghi chú')).toBeTruthy();
    expect(screen.queryByText('Đồng ý lưu thông tin sức khỏe')).toBeNull();
  });

  it('đã tắt ở Cài đặt dữ liệu: không có nút đồng ý, chỉ đường tới Cài đặt dữ liệu', async () => {
    mockPush.mockClear();
    await setup();
    await render(<SucKhoe />);
    await waitFor(() => expect(screen.getByText('Mở cài đặt dữ liệu')).toBeTruthy());
    expect(screen.queryByText('Đồng ý lưu thông tin sức khỏe')).toBeNull();
    expect(screen.queryByText('Thêm ghi chú')).toBeNull();
    await fireEvent.press(screen.getByText('Mở cài đặt dữ liệu'));
    expect(mockPush).toHaveBeenCalledWith('/(parent)/cai-dat-du-lieu');
  });

  it('thêm ghi chú: hiện loại, nội dung, nguồn "ai khai, vai trò, ngày" và ghi chú nguồn', async () => {
    const { api, childId } = await setup({ health: true });
    await render(<SucKhoe />);
    await waitFor(() => screen.getByText('Thêm ghi chú'));
    await fireEvent.press(screen.getByText('Thêm ghi chú'));
    await fireEvent.press(screen.getByText('Thuốc'));
    await fireEvent.changeText(screen.getByLabelText('Nội dung'), 'Vitamin D mỗi sáng');
    await fireEvent.changeText(screen.getByLabelText('Nguồn (không bắt buộc)'), 'theo giấy khám');
    await fireEvent.press(screen.getByText('Lưu'));
    await waitFor(() => expect(screen.getByText('Vitamin D mỗi sáng')).toBeTruthy());
    expect(screen.getByText('Thuốc')).toBeTruthy();
    expect(screen.getByText(/chị Lan \(người quản lý chính\) khai, \d{2}\/\d{2}\/\d{4}/)).toBeTruthy();
    expect(screen.getByText('Nguồn: theo giấy khám')).toBeTruthy();
    const [n] = await api.listHealthNotes(childId);
    expect(n).toMatchObject({ kind: 'THUOC', content: 'Vitamin D mỗi sáng', sourceNote: 'theo giấy khám' });
  });

  it('nội dung trống: báo ngay trong màn, không gọi máy chủ', async () => {
    const { api } = await setup({ health: true });
    const add = jest.spyOn(api, 'healthNoteAdd');
    await render(<SucKhoe />);
    await waitFor(() => screen.getByText('Thêm ghi chú'));
    await fireEvent.press(screen.getByText('Thêm ghi chú'));
    await fireEvent.press(screen.getByText('Lưu'));
    expect(screen.getByText(/Bạn nhập nội dung ghi chú nhé/)).toBeTruthy();
    expect(add).not.toHaveBeenCalled();
  });

  it('sửa, tắt/bật lại và xóa (xác nhận trước khi xóa)', async () => {
    const { api, childId } = await setup({ health: true });
    await api.healthNoteAdd({ childId, kind: 'DI_UNG', content: 'Dị ứng tôm' });
    await render(<SucKhoe />);
    await waitFor(() => screen.getByText('Dị ứng tôm'));
    await fireEvent.press(screen.getByText('Sửa'));
    await fireEvent.changeText(screen.getByLabelText('Nội dung'), 'Dị ứng tôm và cua');
    await fireEvent.press(screen.getByText('Lưu'));
    await waitFor(() => expect(screen.getByText('Dị ứng tôm và cua')).toBeTruthy());
    await fireEvent.press(screen.getByText('Tắt'));
    await waitFor(() => expect(screen.getByText('Dị ứng · đang tắt')).toBeTruthy());
    expect((await api.listHealthNotes(childId))[0].active).toBe(false);
    await fireEvent.press(screen.getByText('Bật lại'));
    await waitFor(() => expect(screen.getByText('Dị ứng')).toBeTruthy());
    await fireEvent.press(screen.getByText('Xóa'));
    expect(screen.getByText(/Xóa ghi chú này\? Không khôi phục được/)).toBeTruthy();
    expect(await api.listHealthNotes(childId)).toHaveLength(1); // chưa xóa khi mới hỏi
    await fireEvent.press(screen.getAllByText('Xóa').at(-1)!);
    await waitFor(() => expect(screen.getByText('Chưa có ghi chú nào.')).toBeTruthy());
    expect(await api.listHealthNotes(childId)).toHaveLength(0);
  });

  it('đã rút MD-SUCKHOE: ghi chú cũ không hiện, màn chỉ chỉ đường tới Cài đặt dữ liệu', async () => {
    const { api, childId } = await setup({ health: true });
    await api.healthNoteAdd({ childId, kind: 'KHAC', content: 'Ghi chú cũ' });
    await api.consentRecord({ childId, purposeCode: 'MD-SUCKHOE', event: 'RUT' });
    await render(<SucKhoe />);
    await waitFor(() => screen.getByText('Mở cài đặt dữ liệu'));
    expect(screen.queryByText('Ghi chú cũ')).toBeNull();
    expect(screen.queryByText('Thêm ghi chú')).toBeNull();
  });
});
