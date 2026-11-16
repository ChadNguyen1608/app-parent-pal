// CA-12: sai PIN hiện "còn N lần thử" ngay trong màn; sai đủ 5 lần thì khóa; đúng thì gọi onUnlinked.
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import NhapPin from '../src/app/(child)/nhap-pin';
import { pairedChild } from './helpers';

const mockUseApp = jest.fn();
jest.mock('@/state/app', () => ({ useApp: () => mockUseApp() }));

async function setup() {
  const { api, childId, bindingEpoch } = await pairedChild('482915');
  const onUnlinked = jest.fn(async () => undefined);
  mockUseApp.mockReturnValue({ api, childId, bindingEpoch, onUnlinked, refreshBinding: async () => true });
  await render(<NhapPin />);
  return { onUnlinked };
}

async function tryPin(pin: string) {
  await fireEvent.changeText(screen.getByLabelText(/PIN \(6 số\)/), pin);
  await fireEvent.press(screen.getByText('Hủy kết nối'));
}

describe('CA-12 Nhập PIN để hủy kết nối', () => {
  it('sai PIN: hiện số lần thử còn lại, ô nhập được xóa', async () => {
    const { onUnlinked } = await setup();
    await tryPin('111222');
    await waitFor(() => expect(screen.getByText(/còn 4 lần/)).toBeTruthy());
    expect(onUnlinked).not.toHaveBeenCalled();
    expect(screen.getByLabelText(/PIN \(6 số\)/).props.value).toBe('');
    await tryPin('111222');
    await waitFor(() => expect(screen.getByText(/còn 3 lần/)).toBeTruthy());
  });

  it('sai 5 lần thì báo tạm khóa', async () => {
    await setup();
    for (let i = 0; i < 5; i += 1) {
      await tryPin('111222');
      await waitFor(() => expect(screen.getByLabelText(/PIN \(6 số\)/).props.value).toBe(''));
    }
    await waitFor(() => expect(screen.getByText(/khóa/i)).toBeTruthy());
  });

  it('PIN thiếu số: báo ngay, không gọi máy chủ', async () => {
    const { onUnlinked } = await setup();
    await tryPin('123');
    expect(screen.getByText('PIN gồm 6 số.')).toBeTruthy();
    expect(onUnlinked).not.toHaveBeenCalled();
  });

  it('PIN đúng: gọi onUnlinked', async () => {
    const { onUnlinked } = await setup();
    await tryPin('482915');
    await waitFor(() => expect(onUnlinked).toHaveBeenCalledTimes(1));
  });
});
