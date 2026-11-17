// profile-save (Tech Spec §3.1 #15; F02-G01-M01, F04-G02-M03). QL lưu NHÁP hồ sơ lịch + thẻ hoạt động + quỹ + "Giữ mức này".
// Vào: { child_id, base_version?, input?, budget?, keep_confirmed?, cards? } (chỉ khóa có mặt mới đổi; budget:null = quỹ mặc định).
// Ra: { ok, profile_id, version, state, content_hash, changed, card_ids }.
import { ApiError, type Deps } from '../_shared/api.ts';
import { validateInput, validateBudget, validateKeep, validateCards } from '../_shared/schedule-core.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function run(body: any, deps: Deps) {
  if (typeof body.child_id !== 'string' || !UUID.test(body.child_id)) throw new ApiError('VALIDATION', 'BR-001', 'Thiếu child_id.');
  if (body.base_version !== undefined && body.base_version !== null && !Number.isInteger(body.base_version)) throw new ApiError('VALIDATION', 'BR-001', 'base_version phải là số nguyên.');
  const patch: Record<string, unknown> = {};
  if ('input' in body) { validateInput(body.input, false); patch.input = body.input; }
  if ('budget' in body) { validateBudget(body.budget); patch.budget = body.budget; }
  if ('keep_confirmed' in body) { validateKeep(body.keep_confirmed); patch.keep_confirmed = body.keep_confirmed ?? {}; }
  if ('cards' in body) { validateCards(body.cards); patch.cards = body.cards; }
  if (!Object.keys(patch).length) throw new ApiError('VALIDATION', 'BR-001', 'Không có gì để lưu.');
  return await deps.db.rpc('profile_save', { p_child: body.child_id, p_patch: patch, p_base_version: body.base_version ?? null });
}
