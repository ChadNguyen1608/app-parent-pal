// schedule-preview (Tech Spec §3.2). QL xem lịch nháp: chạy bộ xếp trên dữ liệu MÁY CHỦ, không ghi gì.
// Gói dịch vụ kiểm qua RPC app.schedule_plan_check (D-72).
// Vào: { profile_id, week_start?, answers? }. Ra: xem PreviewResult (schedule-core.ts) + blockers (lý do chưa commit được).
import { ApiError, type Deps } from '../_shared/api.ts';
import { runPreview, validateAnswers, type ServerInputs } from '../_shared/schedule-core.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function run(body: any, deps: Deps) {
  if (typeof body.profile_id !== 'string' || !UUID.test(body.profile_id)) throw new ApiError('VALIDATION', 'BR-001', 'Thiếu profile_id.');
  if (body.week_start !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(body.week_start)) throw new ApiError('VALIDATION', 'BR-001', 'week_start dạng YYYY-MM-DD.');
  // D-72: gói miễn phí không xem trước được (PLAN_REQUIRED 402); TRIAL hết lượt sửa cũng không. Kiểm TRƯỚC khi chạy bộ xếp.
  await deps.db.rpc('schedule_plan_check', { p_profile: body.profile_id });
  const inputs: ServerInputs = await deps.db.rpc('schedule_inputs', { p_profile: body.profile_id, p_idempotency_key: null });
  const r = await runPreview(inputs);
  validateAnswers(body.answers, r.questions);
  return { ...r, profile_id: inputs.profile.id, profile_version: inputs.profile.version, rev: inputs.rev, lock_state: inputs.lock_state, commitable: r.blockers.length === 0 };
}
