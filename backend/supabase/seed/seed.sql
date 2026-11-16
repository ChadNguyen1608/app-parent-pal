-- Seed giả lập (T0.2). CHỈ tên giả (chị Hoa, anh Minh, bé Na, bé Bin, cô Lan, bé Su); không dữ liệu thật.
-- Chạy bằng vai quản trị (postgres) nên bỏ qua RLS. Id cố định để test tham chiếu (policy-matrix.json).
-- Email giả dưới miền .test (không gửi được).

insert into auth.users (id, aud, role, email, is_anonymous) values
  ('00000000-0000-4000-8000-0000000000a1', 'authenticated', 'authenticated', 'hoa@example.test',  false),  -- QL hộ 1
  ('00000000-0000-4000-8000-0000000000a2', 'authenticated', 'authenticated', 'minh@example.test', false),  -- NL hộ 1
  ('00000000-0000-4000-8000-0000000000a3', 'authenticated', 'authenticated', null,                true),   -- máy bé Na (đã ghép)
  ('00000000-0000-4000-8000-0000000000a4', 'authenticated', 'authenticated', 'lan@example.test',  false),  -- QL hộ 2
  ('00000000-0000-4000-8000-0000000000a5', 'authenticated', 'authenticated', null,                true),   -- máy bé Su (chờ ghép)
  ('00000000-0000-4000-8000-0000000000a6', 'authenticated', 'authenticated', 'mai@example.test',  false),  -- người lớn mới, chưa thuộc hộ nào (T1.2)
  ('00000000-0000-4000-8000-0000000000a7', 'authenticated', 'authenticated', null,                true)    -- máy con mới, chưa ghép, chưa có mã (T1.5)
on conflict (id) do nothing;

insert into app.households (id, label, data_class) values
  ('00000000-0000-4000-8000-000000000101', 'Nhà giả lập 1', 'GIA_LAP'),
  ('00000000-0000-4000-8000-000000000102', 'Nhà giả lập 2', 'GIA_LAP');

insert into app.members (id, household_id, user_id, role, call_name) values
  ('00000000-0000-4000-8000-000000000201', '00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-0000000000a1', 'PRIMARY',   'chị Hoa'),
  ('00000000-0000-4000-8000-000000000202', '00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-0000000000a2', 'SUPPORTER', 'anh Minh'),
  ('00000000-0000-4000-8000-000000000203', '00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-0000000000a4', 'PRIMARY',   'cô Lan');

insert into app.children (id, household_id, call_name, grade, mode, has_device) values
  ('00000000-0000-4000-8000-000000000301', '00000000-0000-4000-8000-000000000101', 'bé Na',  5, 'CHILD_EXECUTED', true),
  ('00000000-0000-4000-8000-000000000302', '00000000-0000-4000-8000-000000000101', 'bé Bin', 2, 'PARENT_LED',     false),
  ('00000000-0000-4000-8000-000000000303', '00000000-0000-4000-8000-000000000102', 'bé Su',  4, 'CHILD_EXECUTED', true);

-- anh Minh (NL) chỉ được xem bé Na, không xem bé Bin.
insert into app.grants (member_id, child_id, resource, action, purpose_code) values
  ('00000000-0000-4000-8000-000000000202', '00000000-0000-4000-8000-000000000301', 'schedule', 'view', 'MD-LICH');

insert into app.device_bindings (id, child_id, device_user_id, state, paired_by_member_id, paired_at) values
  ('00000000-0000-4000-8000-000000000401', '00000000-0000-4000-8000-000000000301', '00000000-0000-4000-8000-0000000000a3', 'HIEU_LUC',             '00000000-0000-4000-8000-000000000201', now()),
  ('00000000-0000-4000-8000-000000000402', '00000000-0000-4000-8000-000000000303', '00000000-0000-4000-8000-0000000000a5', 'CHO_XAC_NHAN_MAY_CON', null, null);

-- Mã ghép giả (băm giả, không phải mã thật).
insert into private.pairing_codes (device_user_id, code_hmac, expires_at) values
  ('00000000-0000-4000-8000-0000000000a5', 'seed-fake-hmac-0001', now() + interval '72 hours');

insert into private.child_settings (child_id, checkin_invite_enabled) values
  ('00000000-0000-4000-8000-000000000301', true);

-- Hỏi thăm của bé Na, tuần ISO 2025-W40 (T2 29/09 .. CN 05/10/2025; đã qua mốc cắt).
-- day_features: loại ngày suy ra lúc nhận (D-37).
insert into private.checkin_responses (child_id, local_date, choice, day_features, occurred_at, idempotency_key) values
  ('00000000-0000-4000-8000-000000000301', '2025-09-29', 'on',      '{hoc_them_toi}',            '2025-09-29 20:30+07', '10000000-0000-4000-8000-000000000001'),
  ('00000000-0000-4000-8000-000000000301', '2025-09-30', 'rat_met', '{hoc_them_toi}',            '2025-09-30 20:45+07', '10000000-0000-4000-8000-000000000002'),
  ('00000000-0000-4000-8000-000000000301', '2025-10-01', 'on',      '{}',                        '2025-10-01 20:10+07', '10000000-0000-4000-8000-000000000003'),
  ('00000000-0000-4000-8000-000000000301', '2025-10-02', 'hoi_met', '{hoc_them_toi,the_thao}',   '2025-10-02 20:20+07', '10000000-0000-4000-8000-000000000004'),
  ('00000000-0000-4000-8000-000000000301', '2025-10-03', 'bo_qua',  '{}',                        '2025-10-03 20:05+07', '10000000-0000-4000-8000-000000000005'),
  ('00000000-0000-4000-8000-000000000301', '2025-10-04', 'on',      '{}',                        '2025-10-04 20:00+07', '10000000-0000-4000-8000-000000000006');

-- T1.1: lịch sử mode của bé Na (chị Hoa đổi UNSET -> CHILD_EXECUTED) và một lời mời giả (tính năng mời đang tắt).
insert into app.mode_history (child_id, old_mode, new_mode, changed_by) values
  ('00000000-0000-4000-8000-000000000301', 'UNSET', 'CHILD_EXECUTED', '00000000-0000-4000-8000-000000000201');

insert into app.invitations (household_id, invited_by, role, code_hmac, expires_at) values
  ('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000201', 'OBSERVER',
   'seed-fake-invite-hmac-0001', now() + interval '72 hours');

-- T2.1: đồng ý đã ghi (tên giả). Bé Na: MD-LICH, MD-DONGBO, MD-XONG (như AC-CON-01); bé Bin và bé Su: chỉ MD-LICH.
-- Không có MD-MET, MD-MONGMUON, MD-BAOCAO, MD-SUCKHOE, MD-CONBAO (mục tùy chọn không chọn sẵn, D-42).
insert into app.consent_events (at, household_id, child_id, purpose_code, event, actor_member_id, policy_version_id)
select '2025-09-15 08:00+07'::timestamptz + (n * interval '1 minute'), c.household_id, c.id, v.code, 'DONG_Y', m.id,
       (select id from app.policy_versions order by effective_at limit 1)
from (values
  ('00000000-0000-4000-8000-000000000301'::uuid, 'MD-LICH',   1),
  ('00000000-0000-4000-8000-000000000301'::uuid, 'MD-DONGBO', 2),
  ('00000000-0000-4000-8000-000000000301'::uuid, 'MD-XONG',   3),
  ('00000000-0000-4000-8000-000000000302'::uuid, 'MD-LICH',   4),
  ('00000000-0000-4000-8000-000000000303'::uuid, 'MD-LICH',   5)
) as v(child, code, n)
join app.children c on c.id = v.child
join app.members m on m.household_id = c.household_id and m.role = 'PRIMARY';
