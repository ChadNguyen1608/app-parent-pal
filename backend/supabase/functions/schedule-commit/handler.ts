// schedule-commit (Tech Spec §3.2; AC-04..08, 17, 24). Chạy LẠI bộ xếp trên dữ liệu máy chủ (không nhận kết quả từ client),
// từ chối nếu phạm sàn cứng / còn ô đỏ chưa xác nhận / có ngày không xếp được; ký kết quả bằng HMAC rồi gọi
// app.schedule_commit_apply bằng JWT người dùng. SQL kiểm chữ ký, băm nội dung hồ sơ lúc commit, rev, khóa lịch, quyền, đóng băng,
// rồi ghi schedule_versions + schedule_state + audit + notifications trong MỘT giao dịch.
// Vào: { profile_id, expected_rev, answers?, confirmed_red?, idempotency_key }. Ra: { ok, version_id, rev, label_status, replay }.
import { ApiError, type Deps } from '../_shared/api.ts';
import { runPreview, validateAnswers, signCommit, type ServerInputs } from '../_shared/schedule-core.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function run(body: any, deps: Deps) {
  if (typeof body.profile_id !== 'string' || !UUID.test(body.profile_id)) throw new ApiError('VALIDATION', 'BR-001', 'Thiếu profile_id.');
  if (typeof body.idempotency_key !== 'string' || !UUID.test(body.idempotency_key)) throw new ApiError('VALIDATION', 'AC-24', 'Thiếu idempotency_key (uuid).');
  if (!Number.isInteger(body.expected_rev) || body.expected_rev < 0) throw new ApiError('VALIDATION', 'BR-001', 'expected_rev phải là số nguyên ≥ 0.');
  const idem = body.idempotency_key.toLowerCase();   // SQL ký theo uuid::text (chữ thường)
  const confirmed = body.confirmed_red ?? [];
  if (!Array.isArray(confirmed) || confirmed.length > 20 || confirmed.some((c: any) => !c || typeof c.col !== 'string' || typeof c.cell !== 'string'))
    throw new ApiError('VALIDATION', 'D6', 'confirmed_red phải là danh sách {col, cell}.');

  const key = deps.env('SCHEDULE_COMMIT_KEY');
  if (!key || key.length < 16) throw new ApiError('INTERNAL', '', 'Máy chủ chưa cấu hình khóa ký.');

  // Gửi lại cùng khóa: SQL trả kết quả cũ trước khi xét dữ liệu hiện tại (hồ sơ có thể đã đổi sau commit đầu).
  const inputs: ServerInputs & { replay?: any } = await deps.db.rpc('schedule_inputs', { p_profile: body.profile_id, p_idempotency_key: idem });
  if (inputs.replay) return { ok: true, replay: true, code: 'IDEMPOTENT_REPLAY', ...inputs.replay };

  if (inputs.lock_state === 'LOCKED') throw new ApiError('LOCKED', 'B01C-OD-05', 'Lịch đang khóa, cần mở khóa trước.');
  if (inputs.rev !== body.expected_rev) throw new ApiError('CONFLICT_REV', 'AC-24', 'Lịch đã được lưu ở nơi khác, hãy xem lại.', { rev: inputs.rev });

  const r = await runPreview(inputs, confirmed);
  if (r.blockers.length) throw new ApiError('VALIDATION', r.blockers[0].rule, r.blockers[0].t, { blockers: r.blockers });
  const answers = validateAnswers(body.answers, r.questions);

  const output = { ...r.plan, day_status: r.day_status, giu_muc: confirmed };
  const asked = new Map(answers.map((a) => [a.question_key, a.answer]));
  const questions = r.questions.map((q: any) => ({ ...q, answer: asked.get(`${q.kind}.${q.day}`) ?? null }));
  const f = {
    child_id: inputs.profile.child_id, profile_id: inputs.profile.id, expected_rev: body.expected_rev, idempotency_key: idem,
    content_hash: inputs.content_hash, input_hash: r.input_hash, engine_version: r.engine_version, params_version: r.params_version,
    balance_label: r.balance_label, output: JSON.stringify(output), tradeoffs: JSON.stringify(r.tradeoffs), questions: JSON.stringify(questions),
    answers: JSON.stringify(answers),
  };
  const signature = await signCommit(key, f);
  const res = await deps.db.rpc('schedule_commit_apply', {
    p_child: f.child_id, p_profile: f.profile_id, p_expected_rev: f.expected_rev, p_idempotency_key: f.idempotency_key,
    p_content_hash: f.content_hash, p_input_hash: f.input_hash, p_engine_version: f.engine_version, p_params_version: f.params_version,
    p_balance_label: f.balance_label, p_output: f.output, p_tradeoffs: f.tradeoffs, p_questions: f.questions, p_answers: f.answers,
    p_signature: signature,
  });
  return res.replay ? { code: 'IDEMPOTENT_REPLAY', ...res } : res;
}
