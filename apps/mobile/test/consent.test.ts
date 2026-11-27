// Đồng ý, rút toàn bộ, mở lại, xóa, xuất: bản giả lập phản chiếu quy tắc máy chủ; lớp api.ts gọi đúng tham số.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createSupabaseApi } from '../src/data/api.ts';
import { effectiveCodes } from '../src/data/consent.ts';
import { ApiError, toApiError } from '../src/data/errors.ts';
import { MOCK_ALERT_MAX_PER_HOUR, MOCK_PURPOSES, createMockApi, type MockApi } from '../src/data/mock.ts';

const fast = { latencyMs: 0 };

async function rejects(p: Promise<unknown>, code: string) {
  await assert.rejects(p, (e: unknown) => {
    assert.ok(e instanceof ApiError);
    assert.equal(e.code, code);
    return true;
  });
}

async function setup(opts: Parameters<typeof createMockApi>[0] = {}): Promise<{ api: MockApi; childId: string }> {
  const api = createMockApi({ ...fast, defaultConsent: false, ...opts });
  await api.auth.sendEmailOtp('a@b.vn');
  await api.auth.verifyEmailOtp('a@b.vn', '123456');
  const { householdId } = await api.familyCreate('chị Lan');
  const { childId } = await api.childCreate({ householdId, callName: 'Bin', grade: 3, hasDevice: true });
  return { api, childId };
}
const on = (api: MockApi, childId: string, code: string) => api.consentRecord({ childId, purposeCode: code, event: 'DONG_Y' });

test('hàm thuần (D-64): chỉ một mục lõi, hai mục riêng; mục riêng chỉ hiệu lực khi mục lõi bật', () => {
  assert.deepEqual(MOCK_PURPOSES.map((p) => p.code), ['MD-LICH', 'MD-SUCKHOE', 'MD-CONBAO']);
  assert.deepEqual(MOCK_PURPOSES.filter((p) => p.kind === 'LOI').map((p) => p.code), ['MD-LICH']);
  const st = (...c: string[]) => Object.fromEntries(c.map((x) => [x, { state: 'DANG_BAT' as const, activeSince: 'x' }]));
  assert.deepEqual(effectiveCodes({ purposes: MOCK_PURPOSES, states: st('MD-LICH') }), ['MD-LICH']);
  assert.deepEqual(effectiveCodes({ purposes: MOCK_PURPOSES, states: st('MD-LICH', 'MD-SUCKHOE', 'MD-CONBAO') }), ['MD-LICH', 'MD-SUCKHOE', 'MD-CONBAO']);
  assert.deepEqual(effectiveCodes({ purposes: MOCK_PURPOSES, states: st('MD-SUCKHOE', 'MD-CONBAO') }), []); // chưa có đồng ý lõi
  assert.deepEqual(effectiveCodes({ purposes: MOCK_PURPOSES.map((p) => (p.code === 'MD-CONBAO' ? { ...p, collectEnabled: false } : p)), states: st('MD-LICH', 'MD-CONBAO') }), ['MD-LICH']);
});

test('đồng ý: ghi, lặp không đổi, hai mục riêng bật tắt độc lập, mục lõi phải rút toàn bộ', async () => {
  const { api, childId } = await setup();
  const c0 = (await api.getHome())!.children[0];
  assert.deepEqual([c0.coreConsent, c0.healthConsent, c0.alertConsent], [false, false, false]);
  assert.equal((await on(api, childId, 'MD-LICH')).changed, true);
  assert.equal((await on(api, childId, 'MD-LICH')).changed, false);
  const r = await on(api, childId, 'MD-SUCKHOE');
  assert.deepEqual([r.changed, r.effective], [true, true]);
  const c1 = (await api.getHome())!.children[0];
  assert.deepEqual([c1.coreConsent, c1.healthConsent, c1.alertConsent], [true, true, false]);
  const out = await api.consentRecord({ childId, purposeCode: 'MD-SUCKHOE', event: 'RUT' });
  assert.deepEqual([out.changed, out.effective], [true, false]);
  assert.equal((await api.getConsentOverview(childId)).states['MD-LICH'].state, 'DANG_BAT'); // rút một mục riêng không đụng mục lõi
  assert.equal((await api.getConsentOverview(childId)).purposes.length, 3);
  await rejects(api.consentRecord({ childId, purposeCode: 'MD-LICH', event: 'RUT' }), 'VALIDATION');
  await rejects(on(api, childId, 'MD-DONGBO'), 'VALIDATION'); // mục đã bỏ khỏi danh mục
});

test('đồng ý: khóa gửi lặp, khóa dùng sai, người lớn khác theo con bị từ chối', async () => {
  const { api, childId } = await setup();
  const k = { childId, purposeCode: 'MD-LICH', event: 'DONG_Y' as const, idempotencyKey: 'k1' };
  assert.equal((await api.consentRecord(k)).replay, false);
  assert.equal((await api.consentRecord(k)).replay, true);
  await rejects(api.consentRecord({ ...k, purposeCode: 'MD-SUCKHOE' }), 'VALIDATION');
  const { api: other, childId: c2 } = await setup({ role: 'SUPPORTER' });
  await rejects(other.consentRecord({ childId: c2, purposeCode: 'MD-LICH', event: 'DONG_Y' }), 'FORBIDDEN');
  assert.equal((await other.consentRecord({ childId: c2, purposeCode: 'MD-LICH', event: 'DONG_Y', forSelf: true })).changed, true);
});

test('ghi chú sức khỏe (D-66): cần đồng ý riêng, có nguồn, tắt/sửa/xóa, rút thì ẩn và đồng ý lại không hiện lại', async () => {
  const { api, childId } = await setup();
  await on(api, childId, 'MD-LICH');
  await rejects(api.healthNoteAdd({ childId, kind: 'DI_UNG', content: 'Tôm' }), 'FORBIDDEN'); // chưa có MD-SUCKHOE
  assert.deepEqual(await api.listHealthNotes(childId), []);
  await on(api, childId, 'MD-SUCKHOE');
  const n = await api.healthNoteAdd({ childId, kind: 'DI_UNG', content: '  Dị ứng tôm  ', sourceNote: 'theo giấy khám' });
  assert.equal(n.content, 'Dị ứng tôm');
  assert.equal(n.declaredByName, 'chị Lan');
  assert.equal(n.declaredByRole, 'PRIMARY');
  assert.match(n.declaredAt, /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(n.sourceNote, 'theo giấy khám');
  assert.equal(n.active, true);
  await rejects(api.healthNoteAdd({ childId, kind: 'KHAC', content: '   ' }), 'VALIDATION');
  await rejects(api.healthNoteAdd({ childId, kind: 'KHAC', content: 'x'.repeat(501) }), 'VALIDATION');
  const off = await api.healthNoteUpdate(n.id, { active: false });
  assert.equal(off.active, false);
  assert.equal((await api.healthNoteUpdate(n.id, { content: 'Dị ứng tôm và cua', kind: 'KHAC' })).content, 'Dị ứng tôm và cua');
  await rejects(api.healthNoteUpdate(n.id, {}), 'VALIDATION');
  const second = await api.healthNoteAdd({ childId, kind: 'THUOC', content: 'Vitamin D' });
  await api.healthNoteDelete(second.id);
  assert.equal((await api.listHealthNotes(childId)).length, 1);
  await rejects(api.healthNoteDelete(second.id), 'NOT_FOUND');
  // rút: ẩn ngay; đồng ý lại không làm ghi chú cũ hiện lại
  await api.consentRecord({ childId, purposeCode: 'MD-SUCKHOE', event: 'RUT' });
  assert.deepEqual(await api.listHealthNotes(childId), []);
  await on(api, childId, 'MD-SUCKHOE');
  assert.deepEqual(await api.listHealthNotes(childId), []);
});

test('ghi chú sức khỏe: chỉ QL; đóng băng thì không thêm/sửa nội dung nhưng vẫn tắt và xóa được', async () => {
  const { api: sup, childId: c2 } = await setup({ role: 'SUPPORTER' });
  await rejects(sup.healthNoteAdd({ childId: c2, kind: 'KHAC', content: 'x' }), 'FORBIDDEN');
  const { api, childId } = await setup();
  await on(api, childId, 'MD-LICH');
  await on(api, childId, 'MD-SUCKHOE');
  const n = await api.healthNoteAdd({ childId, kind: 'THUOC', content: 'Thuốc ho' });
  api.setHouseholdState('DONG_BANG');
  await rejects(api.healthNoteAdd({ childId, kind: 'KHAC', content: 'y' }), 'FROZEN');
  await rejects(api.healthNoteUpdate(n.id, { content: 'z' }), 'FROZEN');
  assert.equal((await api.healthNoteUpdate(n.id, { active: false })).active, false); // thu hẹp: luôn được
  await api.healthNoteDelete(n.id);
});

test('báo bố mẹ (D-67): cần MD-CONBAO, giới hạn tần suất, gửi lặp, bố mẹ xem và đánh dấu đã xem', async () => {
  let t = Date.parse('2026-11-17T03:00:00Z');
  const { api, childId } = await setup({ now: () => t });
  await on(api, childId, 'MD-LICH');
  await api.pairCodeCreate(); // phiên bố mẹ giả vờ đã lấy mã; dưới đây đổi sang máy con cùng một mock
  await api.pairConfirm(childId, '123456', '482915');
  await api.pairPending();
  await api.pairPending();
  await api.auth.signInAnonymously();
  const b = await api.pairAccept();
  assert.equal(b.childId, childId); // liên kết trỏ đúng con đã ghép
  await rejects(api.childAlertSend('KHONG_KHOE', 'k0', b.epoch), 'FORBIDDEN'); // bố mẹ chưa bật MD-CONBAO
  // quay lại phiên bố mẹ để bật
  await api.auth.sendEmailOtp('a@b.vn');
  await api.auth.verifyEmailOtp('a@b.vn', '123456');
  await on(api, childId, 'MD-CONBAO');
  assert.deepEqual(await api.listChildAlerts(), []);
  await api.auth.signInAnonymously();
  await rejects(api.childAlertSend('KHONG_KHOE', 'k1', b.epoch + 1), 'CONFLICT_REV');
  await rejects(api.childAlertSend('ĐAU_BỤNG' as never, 'k1', b.epoch), 'VALIDATION'); // không có chữ tự do
  const a = await api.childAlertSend('DON_SOM', 'k2', b.epoch);
  assert.equal(a.replay, false);
  assert.equal((await api.childAlertSend('DON_SOM', 'k2', b.epoch)).replay, true);
  for (let i = 3; i <= MOCK_ALERT_MAX_PER_HOUR + 1; i++) await api.childAlertSend('GOI_BO_ME', `k${i}`, b.epoch);
  await assert.rejects(api.childAlertSend('KHONG_KHOE', 'kx', b.epoch), (e: unknown) => {
    assert.ok(e instanceof ApiError);
    assert.equal(e.code, 'RATE_LIMITED');
    assert.match(e.userMessage, /Đã báo nhiều lần/);
    return true;
  });
  t += 61 * 60_000; // qua một giờ thì gửi lại được
  await api.childAlertSend('KHONG_KHOE', 'ky', b.epoch);
  // bố mẹ xem
  await api.auth.sendEmailOtp('a@b.vn');
  await api.auth.verifyEmailOtp('a@b.vn', '123456');
  const list = await api.listChildAlerts();
  assert.equal(list.length, MOCK_ALERT_MAX_PER_HOUR + 1);
  assert.equal(list[0].kind, 'KHONG_KHOE'); // mới nhất trước
  assert.equal(list[0].seenAt, null);
  await api.childAlertSeen(list[0].id);
  assert.notEqual((await api.listChildAlerts())[0].seenAt, null);
  t += 8 * 86_400_000; // quá 7 ngày thì không còn
  assert.deepEqual(await api.listChildAlerts(), []);
  // rút MD-CONBAO: ẩn
  t -= 8 * 86_400_000;
  assert.ok((await api.listChildAlerts()).length > 0);
  await api.consentRecord({ childId, purposeCode: 'MD-CONBAO', event: 'RUT' });
  assert.deepEqual(await api.listChildAlerts(), []);
});

test('máy con: con đồng ý (CA-16) và trạng thái gia đình (CA-18)', async () => {
  const api = createMockApi(fast);
  await api.auth.signInAnonymously();
  await api.pairCodeCreate();
  await api.pairPending();
  await api.pairPending();
  await assert.rejects(api.childConsentRecord('k'), (e: unknown) => e instanceof ApiError && e.code === 'NOT_FOUND'); // chưa ghép
  await api.pairAccept();
  assert.equal((await api.childConsentRecord('k')).changed, true);
  assert.equal((await api.childConsentRecord('k')).changed, false); // gửi lặp: không ghi thêm
  assert.equal(await api.getFamilyState(), 'ACTIVE');
  api.setHouseholdState('DONG_BANG');
  assert.equal(await api.getFamilyState(), 'FROZEN');
  await rejects(api.childConsentRecord('k2'), 'FROZEN');
});

test('rút toàn bộ: hai bước, mã sai hoặc hết hạn bị từ chối, xong thì ẩn hồ sơ và có yêu cầu xóa', async () => {
  let t = 1_000_000;
  const { api, childId } = await setup({ now: () => t });
  await on(api, childId, 'MD-LICH');
  await on(api, childId, 'MD-SUCKHOE');
  const s1 = await api.withdrawAllStart(childId);
  assert.deepEqual(s1.consequences.purposesWithdrawn, ['MD-LICH', 'MD-SUCKHOE']);
  assert.equal(s1.consequences.childHidden, true);
  assert.equal(s1.consequences.hardDeletedNow, false);
  assert.equal((await api.getHome())!.children.length, 1); // bước 1 chưa đổi gì
  await rejects(api.withdrawAllConfirm(childId, 'sai'), 'VALIDATION');
  t += 11 * 60_000;
  await rejects(api.withdrawAllConfirm(childId, s1.confirmToken), 'VALIDATION'); // quá 10 phút
  const s1b = await api.withdrawAllStart(childId);
  const s2 = await api.withdrawAllConfirm(childId, s1b.confirmToken);
  assert.equal(s2.replay, false);
  assert.equal(s2.hardDeleted, false);
  const home = (await api.getHome())!;
  assert.equal(home.children.length, 0);
  assert.equal(home.openDeletions[0].scope, 'HO_SO_CON');
  assert.equal((await api.withdrawAllConfirm(childId, s1b.confirmToken)).replay, true);
});

test('đóng băng: đồng ý mới bị FROZEN, rút và xóa luôn được (D-64), chỉ QL mở lại, cần xác nhận rõ ràng', async () => {
  const { api, childId } = await setup();
  await on(api, childId, 'MD-LICH');
  api.setHouseholdState('DONG_BANG');
  assert.equal((await api.getHome())!.householdState, 'DONG_BANG');
  assert.equal(await api.getFamilyState(), 'FROZEN');
  await rejects(on(api, childId, 'MD-SUCKHOE'), 'FROZEN');
  assert.equal((await api.consentRecord({ childId, purposeCode: 'MD-LICH', event: 'RUT', forSelf: true })).changed, true); // người lớn tự rút phần mình
  assert.equal((await api.withdrawAllStart(childId)).consequences.childHidden, true); // rút toàn bộ vẫn được
  assert.equal((await api.deletionRequest('HO_SO_CON', childId)).replay, false);
  await rejects(api.householdReopen(false), 'VALIDATION');
  assert.deepEqual(await api.householdReopen(true), { changed: true });
  assert.deepEqual(await api.householdReopen(true), { changed: false });
  assert.equal(await api.getFamilyState(), 'ACTIVE');
  const { api: sup } = await setup({ role: 'SUPPORTER' });
  sup.setHouseholdState('DONG_BANG');
  await rejects(sup.householdReopen(true), 'FORBIDDEN');
});

test('yêu cầu xóa: hồ sơ con, gia đình, người lớn rời; gửi lặp giữ lần đầu', async () => {
  const { api, childId } = await setup();
  const a = await api.deletionRequest('HO_SO_CON', childId);
  assert.equal(a.replay, false);
  assert.equal((await api.deletionRequest('HO_SO_CON', childId)).acceptedAt, a.acceptedAt);
  await rejects(api.deletionRequest('NGUOI_LON_ROI'), 'VALIDATION'); // QL chưa rời được
  await rejects(api.deletionRequest('HO_SO_CON', null), 'VALIDATION');
  const g = await api.deletionRequest('GIA_DINH');
  assert.equal(g.hardDeleted, false);
  assert.equal((await api.getHome())!.householdState, 'CHO_XOA');
  const { api: sup } = await setup({ role: 'SUPPORTER' });
  await rejects(sup.deletionRequest('GIA_DINH'), 'FORBIDDEN');
  await sup.deletionRequest('NGUOI_LON_ROI');
  assert.equal(await sup.getHome(), null);
});

test('xuất dữ liệu: luôn BLOCKED_H4 với lời tiếng Việt', async () => {
  const { api, childId } = await setup();
  await assert.rejects(api.exportRequest('GIA_DINH'), (e: unknown) => {
    assert.ok(e instanceof ApiError);
    assert.equal(e.code, 'BLOCKED_H4');
    assert.match(e.userMessage, /chưa mở/);
    return true;
  });
  await rejects(api.exportRequest('HO_SO_CON', childId), 'BLOCKED_H4');
});

test('máy con giả lập: danh sách mục đích hiệu lực mặc định và ghi đè', async () => {
  const api = createMockApi(fast);
  await api.auth.signInAnonymously();
  assert.deepEqual(await api.getMyConsent('x'), ['MD-LICH', 'MD-CONBAO']);
  const api2 = createMockApi({ ...fast, childConsent: ['MD-LICH'] });
  await api2.auth.signInAnonymously();
  assert.deepEqual(await api2.getMyConsent('x'), ['MD-LICH']);
});

test('api.ts: mã lỗi BLOCKED_H4 và FEATURE_OFF của máy chủ thành lời Việt; hint tiếng Anh bị bỏ', () => {
  const b = toApiError({ message: 'BLOCKED_H4', details: 'BR-CON-056', hint: 'Xuất dữ liệu chưa mở ở bản thử.' });
  assert.equal(b.code, 'BLOCKED_H4');
  assert.equal(b.userMessage, 'Xuất dữ liệu chưa mở ở bản thử.');
  assert.match(toApiError({ message: 'BLOCKED_H4', hint: 'blocked' }).userMessage, /chưa mở ở bản thử/);
  assert.match(toApiError({ message: 'FEATURE_OFF', hint: '' }).userMessage, /chưa mở/);
});

test('api.ts: tham số RPC mới và đọc kết quả', async () => {
  const calls: { fn: string; args: unknown }[] = [];
  const results: Record<string, unknown> = {
    consent_record: { ok: true, changed: true, replay: false, effective: false },
    consent_withdraw_all: { ok: true, step: 1, confirm_token: 'tok', expires_at: 'x', consequences: { purposes_withdrawn: ['MD-LICH'], child_hidden: true, device_unlinked: true, deletion_request: true, hard_deleted_now: false, can_reconsent: false } },
    household_reopen: { ok: true, changed: true },
    deletion_request: { ok: true, replay: false, deletion_request_id: 'd', accepted_at: 'a', state: 'CHO_QUYET_HAN', hard_deleted: false },
    export_request: { ok: false, error: { code: 'BLOCKED_H4', message_vi: 'Xuất dữ liệu chưa mở ở bản thử.' } },
  };
  const client = {
    schema: () => ({
      async rpc(fn: string, args?: unknown) {
        calls.push({ fn, args });
        return { data: results[fn] ?? null, error: null };
      },
    }),
  };
  const api = createSupabaseApi(client as never);
  assert.deepEqual(await api.consentRecord({ childId: 'c', purposeCode: 'MD-SUCKHOE', event: 'RUT', idempotencyKey: 'k' }), { changed: true, replay: false, effective: false });
  assert.deepEqual(calls[0].args, { p_child: 'c', p_purpose_code: 'MD-SUCKHOE', p_event: 'RUT', p_idempotency_key: 'k', p_for_self: false });
  const s1 = await api.withdrawAllStart('c');
  assert.equal(s1.confirmToken, 'tok');
  assert.equal(s1.consequences.deviceUnlinked, true);
  assert.deepEqual(calls[1].args, { p_child: 'c' });
  results.consent_withdraw_all = { ok: true, step: 2, replay: false, deletion_request_id: 'd', accepted_at: 'a', state: 'CHO_QUYET_HAN', hard_deleted: false };
  assert.equal((await api.withdrawAllConfirm('c', 'tok')).deletionRequestId, 'd');
  assert.deepEqual(calls[2].args, { p_child: 'c', p_confirm_token: 'tok' });
  assert.deepEqual(await api.householdReopen(true), { changed: true });
  assert.deepEqual(calls[3].args, { p_confirm: true });
  assert.equal((await api.deletionRequest('GIA_DINH')).scope, 'GIA_DINH');
  assert.deepEqual(calls[4].args, { p_scope: 'GIA_DINH', p_child: null, p_confirm: true });
  await rejects(api.exportRequest('GIA_DINH'), 'BLOCKED_H4'); // cả khi máy chủ trả ok=false trong payload
});

test('api.ts: ghi chú sức khỏe, báo của con, con đồng ý, my_family_state: tham số và ánh xạ kết quả', async () => {
  const calls: { fn: string; args: unknown }[] = [];
  const note = { id: 'n1', child_id: 'c', kind: 'THUOC', content: 'Vitamin D', declared_by_member_id: 'm1', declared_by_role: 'PRIMARY', declared_at: '2026-11-17', source_note: 'theo giấy khám', active: true };
  const rpcResults: Record<string, unknown> = {
    health_note_add: { ok: true, note },
    health_note_update: { ok: true, note: { ...note, active: false } },
    health_note_delete: { ok: true, deleted: true },
    child_alert_send: { ok: true, replay: false, id: 'a1', kind: 'DON_SOM', created_at: '2026-11-17T03:00:00Z' },
    child_alert_seen: { ok: true, changed: true, seen_at: 'x' },
    child_consent_record: { ok: true, changed: true, replay: false, consented_at: '2026-11-17T03:00:00Z', policy_version_id: 'p' },
    my_family_state: { ok: true, state: 'DONG_BANG', frozen: true },
  };
  const tables: Record<string, unknown[]> = {
    members: [{ id: 'm1', call_name: 'chị Lan' }],
    child_health_notes: [note, { ...note, id: 'n2', kind: 'LẠ', declared_by_member_id: 'm9', declared_by_role: 'LẠ', active: false }],
    child_alerts: [
      { id: 'a1', child_id: 'c', kind: 'DON_SOM', created_at: '2026-11-17T03:00:00Z', seen_at: null },
      { id: 'a2', child_id: 'c', kind: 'CHỮ_TỰ_DO', created_at: '2026-11-17T03:01:00Z', seen_at: null }, // mã lạ: bỏ
    ],
  };
  const client = {
    schema: () => ({
      async rpc(fn: string, args?: unknown) {
        calls.push({ fn, args });
        return { data: rpcResults[fn] ?? null, error: null };
      },
      from: (table: string) => ({ select: () => { const q: Record<string, unknown> = {}; q.eq = () => q; q.order = () => q; q.then = (ok: (v: unknown) => unknown) => ok({ data: tables[table] ?? [], error: null }); return q; } }),
    }),
  };
  const api = createSupabaseApi(client as never);
  const added = await api.healthNoteAdd({ childId: 'c', kind: 'THUOC', content: ' Vitamin D ', sourceNote: ' theo giấy khám ', declaredAt: '2026-11-17' });
  assert.deepEqual(calls[0].args, { p_child: 'c', p_kind: 'THUOC', p_content: 'Vitamin D', p_declared_at: '2026-11-17', p_source_note: 'theo giấy khám' });
  assert.deepEqual([added.declaredByName, added.declaredByRole, added.declaredAt, added.sourceNote], ['chị Lan', 'PRIMARY', '2026-11-17', 'theo giấy khám']);
  assert.equal((await api.healthNoteUpdate('n1', { active: false })).active, false);
  assert.deepEqual(calls[1].args, { p_note: 'n1', p_patch: { active: false } });
  await api.healthNoteUpdate('n1', { content: ' x ', sourceNote: '  ', kind: 'KHAC', declaredAt: '2026-11-16' });
  assert.deepEqual(calls[2].args, { p_note: 'n1', p_patch: { kind: 'KHAC', content: 'x', source_note: null, declared_at: '2026-11-16' } });
  await api.healthNoteDelete('n1');
  assert.deepEqual(calls[3].args, { p_note: 'n1' });
  const list = await api.listHealthNotes('c');
  assert.equal(list.length, 2);
  assert.deepEqual([list[1].kind, list[1].declaredByName, list[1].declaredByRole, list[1].active], ['KHAC', null, 'OBSERVER', false]); // giá trị lạ về mức thấp nhất
  const alerts = await api.listChildAlerts();
  assert.deepEqual(alerts.map((a) => a.id), ['a1']);
  await api.childAlertSeen('a1');
  assert.deepEqual(calls[4].args, { p_alert: 'a1' });
  assert.equal((await api.childAlertSend('DON_SOM', 'k', 3)).id, 'a1');
  assert.deepEqual(calls[5].args, { p_kind: 'DON_SOM', p_idempotency_key: 'k', p_binding_epoch: 3 });
  await api.childAlertSend('GOI_BO_ME');
  assert.deepEqual(calls[6].args, { p_kind: 'GOI_BO_ME' });
  assert.equal((await api.childConsentRecord('k')).changed, true);
  assert.deepEqual(calls[7].args, { p_idempotency_key: 'k' });
  assert.equal(await api.getFamilyState(), 'FROZEN');
  assert.equal(calls[8].fn, 'my_family_state');
});

test('api.ts: RATE_LIMITED của child_alert_send thành lời Việt của máy chủ', async () => {
  const client = {
    schema: () => ({
      async rpc() {
        return { data: null, error: { message: 'RATE_LIMITED', details: 'D-67', hint: 'Đã báo nhiều lần, hãy chờ một lúc.', code: 'PT429' } };
      },
    }),
  };
  const api = createSupabaseApi(client as never);
  await assert.rejects(api.childAlertSend('KHONG_KHOE'), (e: unknown) => {
    assert.ok(e instanceof ApiError);
    assert.equal(e.code, 'RATE_LIMITED');
    assert.equal(e.userMessage, 'Đã báo nhiều lần, hãy chờ một lúc.');
    return true;
  });
});

test('D-73: tạo con là có sẵn ba đồng ý (máy chủ ghi mặc định); tắt sau vẫn rút được; gọi lặp cùng khóa không đổi', async () => {
  const api = createMockApi(fast);
  await api.auth.sendEmailOtp('a@b.vn');
  await api.auth.verifyEmailOtp('a@b.vn', '123456');
  const { householdId } = await api.familyCreate('chị Lan');
  const { childId } = await api.childCreate({ householdId, callName: 'Bin', grade: 3, hasDevice: true, idempotencyKey: 'k' });
  assert.deepEqual(effectiveCodes(await api.getConsentOverview(childId)), ['MD-LICH', 'MD-SUCKHOE', 'MD-CONBAO']);
  const c = (await api.getHome())!.children[0];
  assert.deepEqual([c.coreConsent, c.healthConsent, c.alertConsent], [true, true, true]);
  await api.consentRecord({ childId, purposeCode: 'MD-CONBAO', event: 'RUT' });
  await api.childCreate({ householdId, callName: 'Bin', grade: 3, hasDevice: true, idempotencyKey: 'k' });
  assert.equal((await api.getConsentOverview(childId)).states['MD-CONBAO'].state, 'DA_RUT', 'replay không bật lại');
});

test('D-73: cài đặt ai_chat_enabled mặc định tắt; chỉ QL đổi; tắt luôn được kể cả khi đóng băng', async () => {
  const { api, childId } = await setup();
  assert.deepEqual(await api.childSettingGet(childId), { aiChatEnabled: false });
  assert.deepEqual(await api.childSettingSet(childId, 'ai_chat_enabled', true), { aiChatEnabled: true });
  assert.deepEqual(await api.childSettingGet(childId), { aiChatEnabled: true });
  assert.deepEqual(await api.childSettingSet(childId, 'ai_chat_enabled', false), { aiChatEnabled: false });
  await rejects(api.childSettingGet('khong-co'), 'NOT_FOUND');
});
