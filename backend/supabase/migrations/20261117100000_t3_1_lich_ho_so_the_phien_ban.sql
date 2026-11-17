-- T3.1 (Dev Plan 15.1 Đợt 3; Tech Spec §2.3, §2.7; Architecture §6; BL 11.1). Người soạn: AI, chưa kiểm chứng độc lập.
-- Bảng lập lịch: schedule_profiles (hồ sơ lịch), activity_cards (thẻ hoạt động), schedule_versions (phiên bản lịch BẤT BIẾN),
-- schedule_state (con trỏ hiệu lực + khóa), schedule_answers (câu trả lời "hỏi một lần").
-- Ghi: KHÔNG ai ghi trực tiếp (chỉ cấp select); hàm ghi ở migration …110000 (T3.2). Đọc: chính sách dưới đây.
--
-- Quyết định (tài liệu thiếu hoặc mơ hồ), đều ghi để chủ sản phẩm duyệt:
--  1. Đọc (mô hình đồng ý D-64: lịch thuộc mục lõi MD-LICH, không có mục đích riêng cho đồng bộ/nhắc/Xong/hỏi thăm/báo cáo): người LỚN
--     (QL, hoặc NL có grant `view` mục đích MD-LICH) khi MD-LICH đang hiệu lực VÀ dữ liệu không cũ hơn mốc visible_from của MD-LICH
--     (rút đồng ý rồi đồng ý lại không làm dữ liệu cũ hiện lại, AC-CON-07). Máy con KHÔNG đọc bảng nào ở đây (§2.7: lịch tới máy con
--     qua `device-sync`, task T3.6). Hộ đóng băng: NL không đọc, QL vẫn đọc (app.access_state). Cùng khuôn với child_health_notes (T2.6):
--     app_internal.is_adult_of_child + app_internal.can + purpose_visible.
--  2. schedule_versions.idempotency_key duy nhất THEO CON (không toàn cục như Tech Spec) để một hộ không dò được khóa của hộ khác.
--  3. activity_cards: cột `start`/`end` của Tech Spec đặt tên `start_time`/`end_time` (end là từ khóa SQL). `note` có CHECK `is null`
--     cho tới khi keyword-check (F07-G01-M01) tồn tại: chữ tự do chưa qua bộ kiểm khẩn thì không lưu (BR-CON-094, fail-closed).
--  4. schedule_versions thêm cột `rev` (rev của schedule_state lúc commit) để trả lại kết quả cũ khi gửi lại cùng khóa (AC-24).
--  5. schedule_state.phase_id không có khóa ngoại (bảng `phases` thuộc T4.1).

-- ============================================================ hàm append-only: thêm schedule_versions vào ngoại lệ của purge_household
create or replace function app.tg_append_only() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'DELETE' and tg_table_schema = 'app' and tg_table_name in ('audit_log', 'mode_history', 'consent_events', 'schedule_versions')
     and exists (select 1 from private.purge_context c where c.txid = txid_current()) then
    return old;
  end if;
  raise exception 'append-only table: % not allowed', tg_op using errcode = '55000';
end $$;

-- ============================================================ schedule_profiles
create table app.schedule_profiles (
  id             uuid primary key default gen_random_uuid(),
  child_id       uuid not null references app.children (id),
  kind           text not null check (kind in ('CHUAN', 'GIAI_DOAN', 'PRESET')),
  version        int  not null check (version >= 1),
  input          jsonb not null default '{}'::jsonb check (jsonb_typeof(input) = 'object' and length(input::text) <= 20000),
  budget         jsonb check (budget is null or (jsonb_typeof(budget) = 'object' and length(budget::text) <= 2000)),
  keep_confirmed jsonb not null default '{}'::jsonb
                   check (jsonb_typeof(keep_confirmed) = 'object' and length(keep_confirmed::text) <= 2000
                          and not (keep_confirmed -> 'wd' ? 'ngu') and not (keep_confirmed -> 'we' ? 'ngu')),   -- D-02: ô Ngủ không có "Giữ mức này"
  state          text not null default 'DRAFT' check (state in ('DRAFT', 'ACTIVE', 'SUPERSEDED', 'ARCHIVED')),
  supersedes_id  uuid references app.schedule_profiles (id),
  created_by     uuid references app.members (id),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  hidden_at      timestamptz,
  hidden_reason  text check (hidden_reason is null or hidden_reason ~ '^[A-Z][A-Z0-9_]{0,29}$'),
  unique (child_id, kind, version),
  check ((hidden_at is null) = (hidden_reason is null))
);
-- Mỗi con tối đa một lịch chuẩn ACTIVE và một bản nháp chuẩn (Tech Spec §2.3).
create unique index schedule_profiles_chuan_active_uidx on app.schedule_profiles (child_id) where kind = 'CHUAN' and state = 'ACTIVE';
create unique index schedule_profiles_chuan_draft_uidx  on app.schedule_profiles (child_id) where kind = 'CHUAN' and state = 'DRAFT' and hidden_at is null;

-- Sau khi rời DRAFT, nội dung không đổi nữa (phiên bản lịch trỏ tới nó); chỉ đổi trạng thái theo đường hợp lệ.
create function app.tg_schedule_profile_guard() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if old.state <> 'DRAFT' and (new.child_id, new.kind, new.version, new.input, new.budget, new.keep_confirmed, new.supersedes_id)
       is distinct from (old.child_id, old.kind, old.version, old.input, old.budget, old.keep_confirmed, old.supersedes_id) then
    raise exception 'schedule_profiles: hồ sơ đã ACTIVE trở đi không sửa nội dung (tạo phiên bản mới)' using errcode = '55000';
  end if;
  if new.state is distinct from old.state and not (
       (old.state = 'DRAFT' and new.state in ('ACTIVE', 'ARCHIVED')) or
       (old.state = 'ACTIVE' and new.state in ('SUPERSEDED', 'ARCHIVED')) or
       (old.state = 'SUPERSEDED' and new.state = 'ARCHIVED')) then
    raise exception 'schedule_profiles: chuyển trạng thái % -> % không hợp lệ', old.state, new.state using errcode = '55000';
  end if;
  return new;
end $$;
create trigger schedule_profiles_guard before update on app.schedule_profiles
  for each row execute function app.tg_schedule_profile_guard();

-- ============================================================ activity_cards
create table app.activity_cards (
  id                uuid primary key default gen_random_uuid(),
  child_id          uuid not null references app.children (id),
  name              text not null check (char_length(btrim(name)) between 1 and 60),
  type              text not null check (type in ('hoc_them', 'the_thao', 'nang_khieu', 'khac')),
  days              text[] not null check (cardinality(days) between 1 and 7 and days <@ array['T2','T3','T4','T5','T6','T7','CN']::text[]),
  start_time        time not null,
  end_time          time not null,
  travel_before_min int not null default 0 check (travel_before_min between 0 and 180),
  travel_after_min  int not null default 0 check (travel_after_min between 0 and 180),
  note              text check (note is null),     -- chờ keyword-check (BR-CON-094); gỡ ràng buộc khi bộ kiểm có
  state             text not null default 'ACTIVE' check (state in ('ACTIVE', 'ARCHIVED')),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  hidden_at         timestamptz,
  hidden_reason     text check (hidden_reason is null or hidden_reason ~ '^[A-Z][A-Z0-9_]{0,29}$'),
  check (end_time > start_time),
  check ((hidden_at is null) = (hidden_reason is null))     -- không có cột địa điểm ở nấc 1 (Q-ARC-10)
);
create index activity_cards_child_idx on app.activity_cards (child_id);

-- ============================================================ schedule_versions (BẤT BIẾN)
create table app.schedule_versions (
  id              uuid primary key default gen_random_uuid(),
  child_id        uuid not null references app.children (id),
  profile_id      uuid not null references app.schedule_profiles (id),
  profile_version int  not null,
  phase_id        uuid,
  rev             int  not null check (rev >= 1),
  engine_version  text not null check (engine_version ~ '^[A-Za-z0-9._-]{1,40}$'),
  params_version  text not null check (params_version ~ '^[A-Za-z0-9._-]{1,40}$'),
  input_hash      text not null check (input_hash ~ '^[0-9a-f]{64}$'),
  output          jsonb not null check (jsonb_typeof(output) = 'object'),
  tradeoffs       jsonb not null default '[]'::jsonb check (jsonb_typeof(tradeoffs) = 'array'),
  questions       jsonb not null default '[]'::jsonb check (jsonb_typeof(questions) = 'array'),
  balance_label   text not null default 'UNKNOWN' check (balance_label ~ '^[A-Z_]{1,20}$'),
  label_status    text not null default 'chua_kiem_chung' check (label_status = 'chua_kiem_chung'),   -- D-08, D-25, BR-084
  committed_by_kind text not null check (committed_by_kind in ('member', 'system')),
  committed_by    uuid references app.members (id),
  commit_reason   text check (commit_reason is null or commit_reason ~ '^[a-z0-9_ ()/.-]{1,60}$'),
  idempotency_key uuid not null,
  committed_at    timestamptz not null default clock_timestamp(),
  unique (child_id, idempotency_key),
  check ((committed_by_kind = 'member') = (committed_by is not null))
);
create index schedule_versions_child_idx on app.schedule_versions (child_id, committed_at desc);
create trigger schedule_versions_append_only before update or delete on app.schedule_versions
  for each row execute function app.tg_append_only();
create trigger schedule_versions_no_truncate before truncate on app.schedule_versions
  for each statement execute function app.tg_append_only();

-- ============================================================ schedule_state
create table app.schedule_state (
  child_id             uuid primary key references app.children (id),
  rev                  int  not null default 0 check (rev >= 0),
  effective_version_id uuid references app.schedule_versions (id),
  base_version_id      uuid references app.schedule_versions (id),
  phase_id             uuid,
  lock_state           text not null default 'UNLOCKED' check (lock_state in ('UNLOCKED', 'LOCKED')),
  locked_by            uuid references app.members (id),
  locked_at            timestamptz,
  lock_reason          text check (lock_reason is null or lock_reason ~ '^[A-Z][A-Z0-9_]{0,29}$'),
  updated_at           timestamptz not null default now(),
  check ((lock_state = 'LOCKED') = (locked_at is not null))
);

-- ============================================================ schedule_answers
create table app.schedule_answers (
  id           uuid primary key default gen_random_uuid(),
  child_id     uuid not null references app.children (id),
  question_key text not null check (question_key ~ '^[a-z0-9_]{1,40}(\.[A-Z0-9]{1,4})?$'),
  local_date   date not null,
  answer       text not null check (answer ~ '^[a-z_]{1,30}$'),
  answered_by  uuid not null references app.members (id),
  at           timestamptz not null default now(),
  unique (child_id, question_key, local_date)
);

-- ============================================================ RLS
alter table app.schedule_profiles enable row level security;
alter table app.activity_cards    enable row level security;
alter table app.schedule_versions enable row level security;
alter table app.schedule_state    enable row level security;
alter table app.schedule_answers  enable row level security;

create policy schedule_profiles_select on app.schedule_profiles for select to authenticated
  using (hidden_at is null and (select app_internal.is_adult_of_child(child_id))
         and (select app_internal.can((select auth.uid()), 'child.view', child_id, 'MD-LICH'))
         and app_internal.purpose_visible(child_id, 'MD-LICH', created_at));
create policy activity_cards_select on app.activity_cards for select to authenticated
  using (hidden_at is null and (select app_internal.is_adult_of_child(child_id))
         and (select app_internal.can((select auth.uid()), 'child.view', child_id, 'MD-LICH'))
         and app_internal.purpose_visible(child_id, 'MD-LICH', created_at));
create policy schedule_versions_select on app.schedule_versions for select to authenticated
  using ((select app_internal.is_adult_of_child(child_id))
         and (select app_internal.can((select auth.uid()), 'child.view', child_id, 'MD-LICH'))
         and app_internal.purpose_visible(child_id, 'MD-LICH', committed_at));
create policy schedule_state_select on app.schedule_state for select to authenticated
  using ((select app_internal.is_adult_of_child(child_id))
         and (select app_internal.can((select auth.uid()), 'child.view', child_id, 'MD-LICH'))
         and app_internal.purpose_visible(child_id, 'MD-LICH', updated_at));
create policy schedule_answers_select on app.schedule_answers for select to authenticated
  using ((select app_internal.is_adult_of_child(child_id))
         and (select app_internal.can((select auth.uid()), 'child.view', child_id, 'MD-LICH'))
         and app_internal.purpose_visible(child_id, 'MD-LICH', at));

-- ============================================================ đặc quyền: chỉ đọc cho authenticated; ghi qua hàm (T3.2) hoặc service_role
revoke all on app.schedule_profiles, app.activity_cards, app.schedule_versions, app.schedule_state, app.schedule_answers
  from public, anon, authenticated;
grant select on app.schedule_profiles, app.activity_cards, app.schedule_versions, app.schedule_state, app.schedule_answers to authenticated;
grant all on app.schedule_profiles, app.activity_cards, app.schedule_versions, app.schedule_state, app.schedule_answers to service_role;
revoke all on function app.tg_schedule_profile_guard() from public, anon, authenticated;
