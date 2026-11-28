// Dựng mock api đã ghép sẵn để test màn hình. Dữ liệu giả, không mạng.
import { createMockApi, MOCK_PAIR_CODE } from '../src/data/mock';
import type { Api, Home, PlanTier } from '../src/data/types';

/**
 * Mặc định PREMIUM: ghép máy cần khóa ghép (D-68, D-74), nên các test ghép máy dùng PREMIUM; test gói truyền plan khác.
 * Mặc định defaultConsent=false: con chưa có đồng ý nào, test tự ghi (như trước D-73). Truyền true để giống máy chủ sau D-73 (đã có ba đồng ý).
 */
export async function parentWithChild(opts: { plan?: PlanTier; defaultConsent?: boolean } = {}): Promise<{ api: Api; home: Home }> {
  const api = createMockApi({ latencyMs: 0, plan: opts.plan ?? 'PREMIUM', defaultConsent: opts.defaultConsent ?? false });
  await api.auth.sendEmailOtp('test.gia@example.com');
  await api.auth.verifyEmailOtp('test.gia@example.com', '123456');
  const { householdId } = await api.familyCreate('chị Lan');
  await api.childCreate({ householdId, callName: 'Bin', grade: 3, ageYears: null, hasDevice: true, idempotencyKey: 'k1' });
  return { api, home: await api.getHome() };
}

export { MOCK_PAIR_CODE };

/** Máy con đã ghép (PIN của bố mẹ là `pin`). Trả api, childId và epoch như useApp cung cấp. */
export async function pairedChild(pin = '482915') {
  const { api, home } = await parentWithChild();
  const kid = home!.children[0];
  await api.auth.signInAnonymously();
  await api.pairCodeCreate();
  await api.pairConfirm(kid.id, MOCK_PAIR_CODE, pin);
  await api.pairPending();
  const b = await api.pairPending();
  if (!b.pending) throw new Error('mock chưa báo pending');
  const binding = await api.pairAccept();
  return { api, childId: binding.childId, bindingEpoch: binding.epoch };
}
