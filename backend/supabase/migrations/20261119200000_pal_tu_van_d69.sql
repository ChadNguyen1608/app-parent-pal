-- D-69 (19/11/2026): tư vấn với Pal (PA-22), BẬT/TẮT được bằng cờ, mở sau khi có đồng ý cốt lõi (MD-LICH) và hồ sơ gia đình/con,
-- giới hạn lượt hỏi theo gói. D-71: giai đoạn test lưu TOÀN BỘ hội thoại. Người soạn: AI, chưa kiểm chứng độc lập.
--
-- Gồm:
--  1. Tham số (private.params, CHUA_CHOT): pal_enabled (cờ, mặc định 1 để test), pal_questions_per_day_free/trial/premium (5/20/100).
--  2. Bảng app.pal_conversations, app.pal_messages. Phạm vi RIÊNG: chỉ người lớn đã viết thấy (RLS is_self_member); máy con không đọc;
--     người lớn khác cùng hộ không đọc. Hội thoại gắn con (nếu có) ẩn khi rút đồng ý lõi của con (purpose_visible, như bảng lịch).
--     Không ai ghi trực tiếp: chỉ app.pal_record_turn, và hàm này đòi chữ ký HMAC-SHA256 của Edge Function `pal-chat`
--     (khóa `pal_record_key`: Vault ở CSDL, PAL_RECORD_KEY ở Edge Function), cùng cách với schedule_commit_apply.
--  3. app.pal_quota() cho app (trạng thái + lượt còn lại), app.pal_prepare() cho Edge Function (trạng thái + tên trong hộ để ẩn danh,
--     tuổi/lớp của con, lịch sử hội thoại), app.pal_record_turn() ghi một lượt hỏi-đáp.
--  4. private.household_tier(): CHỖ NỐI với bảng gói app.household_plans (agent khác làm). TODO: bảng chưa có trên main, nên coi MỌI hộ là TRIAL.
--  5. purge_household / purge_child xóa thêm các bảng Pal và bảng theo dõi token (chép nguyên từ T3.2, thêm lệnh xóa).
--  6. THEO DÕI TOKEN (yêu cầu chủ sản phẩm 19/11/2026): private.ai_usage (mỗi lần gọi AI: token vào/ra từ `usage` của API, model, hộ, người,
--     chi phí ước tính theo giá trong private.params), private.ops_alerts (cảnh báo, KHÔNG chứa nội dung hội thoại), private.pal_locks (hộ bị khóa).
--     Giới hạn cứng (kiểm TRƯỚC khi gọi, cộng dồn SAU): max_tokens mỗi câu trả lời, độ dài câu hỏi, số câu mỗi phút mỗi người, trần token/ngày mỗi hộ,
--     ngân sách token/ngày toàn hệ thống. Cảnh báo mềm ở 80% trần ngày. Đột biến: token 1 giờ gần nhất của hộ > N lần trung bình giờ của chính hộ
--     trong 7 ngày (có ngưỡng sàn) -> ghi cảnh báo + TỰ KHÓA Pal của hộ đó tới khi chủ sản phẩm mở (app.pal_unlock); token toàn hệ thống trong 1 giờ
--     vượt ngưỡng -> ghi cảnh báo + TẮT TOÀN BỘ (pal_enabled = 0). Hàm cho chủ sản phẩm chỉ service_role: ai_usage_report, ai_usage_series,
--     ai_alerts_list, pal_unlock, pal_set_enabled. Gửi cảnh báo ra ngoài (email Resend) CHƯA làm: điểm gắn ở private.ops_alert_add (TODO).
-- Quy tắc nghiệp vụ: lượt hỏi chỉ tính khi đã gọi AI (counted). Lượt do lớp an toàn chặn (khẩn cấp) KHÔNG tính và KHÔNG bị chặn bởi hạn mức
-- (BR-NTF-039: hạn mức không chặn nội dung an toàn). Ngày tính theo giờ Việt Nam (Asia/Ho_Chi_Minh), theo hộ.

insert into private.params (key, value_int, status, note) values
  ('pal_enabled', 1, 'CHUA_CHOT', 'D-69: cờ bật/tắt tư vấn với Pal (1 = bật). Mặc định 1 để test; chủ sản phẩm quyết giá trị khi phát hành'),
  ('pal_questions_per_day_free', 5, 'CHUA_CHOT', 'D-69: số lượt hỏi Pal mỗi ngày (giờ VN) mỗi hộ, gói FREE. Con số đề xuất nội bộ, chờ chủ sản phẩm duyệt'),
  ('pal_questions_per_day_trial', 20, 'CHUA_CHOT', 'D-69: như trên, gói TRIAL. Đề xuất nội bộ, chờ duyệt'),
  ('pal_questions_per_day_premium', 100, 'CHUA_CHOT', 'D-69: như trên, gói PREMIUM. Đề xuất nội bộ, chờ duyệt'),
  ('pal_max_output_tokens', 1024, 'CHUA_CHOT', 'Theo dõi token: max_tokens mỗi câu trả lời của Pal (đề xuất nội bộ)'),
  ('pal_max_question_chars', 2000, 'CHUA_CHOT', 'Theo dõi token: độ dài tối đa một câu hỏi, tính bằng ký tự (đề xuất nội bộ)'),
  ('pal_max_per_minute', 6, 'CHUA_CHOT', 'Theo dõi token: số câu hỏi tối đa mỗi phút mỗi người (đề xuất nội bộ)'),
  ('pal_household_tokens_per_day', 60000, 'CHUA_CHOT', 'Theo dõi token: trần token (vào + ra) mỗi ngày giờ VN mỗi hộ (đề xuất nội bộ)'),
  ('pal_system_tokens_per_day', 2000000, 'CHUA_CHOT', 'Theo dõi token: ngân sách token mỗi ngày giờ VN cho toàn hệ thống; hết thì Pal báo bận (đề xuất nội bộ)'),
  ('pal_soft_warn_pct', 80, 'CHUA_CHOT', 'Theo dõi token: % trần ngày để ghi cảnh báo mềm vào ops_alerts (hộ và hệ thống)'),
  ('pal_spike_factor', 5, 'CHUA_CHOT', 'Theo dõi token: hộ bị khóa khi token 1 giờ gần nhất > hệ số này x trung bình giờ của chính hộ trong 7 ngày (đề xuất nội bộ)'),
  ('pal_spike_floor_tokens_per_hour', 20000, 'CHUA_CHOT', 'Theo dõi token: ngưỡng sàn mỗi giờ của một hộ; dưới sàn thì không coi là đột biến (hộ mới không bị khóa oan)'),
  ('pal_system_tokens_per_hour', 500000, 'CHUA_CHOT', 'Theo dõi token: token toàn hệ thống trong 1 giờ vượt ngưỡng này thì TẮT TOÀN BỘ Pal (đề xuất nội bộ)'),
  ('ai_price_in_usd_x100_per_mtok', 0, 'CHUA_CHOT', 'Giá token VÀO, đơn vị USD x 100 cho mỗi triệu token (ví dụ 300 = 3 USD). CHỦ SẢN PHẨM ĐIỀN theo bảng giá của nhà cung cấp mô hình; 0 = chưa điền, chi phí ước tính hiện 0'),
  ('ai_price_out_usd_x100_per_mtok', 0, 'CHUA_CHOT', 'Giá token RA, cùng đơn vị. CHỦ SẢN PHẨM ĐIỀN; 0 = chưa điền');

-- ============================================================ nối với gói (TODO)
-- TODO(D-69, gói FREE/TRIAL/PREMIUM): agent khác làm bảng app.household_plans. Khi bảng có trên main, thay thân hàm này bằng đọc tier
-- của hộ (và giữ nguyên chữ ký). Hiện chưa có bảng nên MỌI hộ là TRIAL.
create function private.household_tier(p_household uuid) returns text
language sql stable security definer set search_path = '' as $$
  select 'TRIAL'::text
$$;
revoke all on function private.household_tier(uuid) from public, anon, authenticated;

create function private.pal_limit(p_tier text) returns int
language sql stable security definer set search_path = '' as $$
  select case p_tier
    when 'FREE'    then private.param_int('pal_questions_per_day_free')
    when 'PREMIUM' then private.param_int('pal_questions_per_day_premium')
    else private.param_int('pal_questions_per_day_trial')
  end
$$;
revoke all on function private.pal_limit(text) from public, anon, authenticated;

-- ============================================================ bảng
create table app.pal_conversations (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default clock_timestamp(),
  household_id    uuid not null references app.households (id),
  member_id       uuid not null references app.members (id),      -- người lớn đã viết; chỉ người này đọc
  child_id        uuid references app.children (id),              -- con đang bàn (null = hỏi chung)
  scope           text not null default 'RIENG' check (scope = 'RIENG'),   -- "cả nhà" chưa dựng: thêm bằng migration riêng khi có thiết kế
  last_message_at timestamptz not null default clock_timestamp()
);
create index pal_conversations_member_idx on app.pal_conversations (member_id, last_message_at desc);
create index pal_conversations_household_idx on app.pal_conversations (household_id);

create table app.pal_messages (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default clock_timestamp(),
  conversation_id uuid not null references app.pal_conversations (id),
  household_id    uuid not null references app.households (id),
  member_id       uuid not null references app.members (id),
  child_id        uuid references app.children (id),
  seq             int not null check (seq >= 1),
  role            text not null check (role in ('user', 'assistant')),
  content         text not null check (char_length(content) between 1 and 12000),
  safety_flags    text[] not null default '{}'
                  check (safety_flags <@ array['EMERGENCY_SELF_HARM', 'EMERGENCY_CHILD_ABUSE', 'EMERGENCY_DANGER_LIFE',
                                               'MEDICAL_DIAGNOSIS', 'MEDICAL_DRUG', 'CORPORAL_PUNISHMENT', 'PARENT_DISTRESS', 'OUTPUT_DOSE']::text[]),
  counted         boolean not null default false,                  -- đã gọi AI: tính vào hạn mức ngày (chỉ dòng role = 'user')
  input_tokens    int check (input_tokens >= 0),
  output_tokens   int check (output_tokens >= 0),
  idempotency_key uuid unique,                                     -- chỉ dòng 'user'
  unique (conversation_id, seq),
  check (role = 'user' or (not counted and idempotency_key is null))
);
create index pal_messages_quota_idx on app.pal_messages (household_id, created_at) where role = 'user' and counted;
create index pal_messages_child_idx on app.pal_messages (child_id);

-- ============================================================ theo dõi token (chỉ hệ thống ghi/đọc)
create table private.ai_usage (
  id            uuid primary key default gen_random_uuid(),
  at            timestamptz not null default clock_timestamp(),
  household_id  uuid not null,
  member_id     uuid not null,
  model         text not null,
  input_tokens  int not null check (input_tokens >= 0),
  output_tokens int not null check (output_tokens >= 0),
  est_cost_usd  numeric(14, 6) not null default 0
);
create index ai_usage_household_idx on private.ai_usage (household_id, at);
create index ai_usage_at_idx on private.ai_usage (at);
create table private.ops_alerts (
  id           uuid primary key default gen_random_uuid(),
  at           timestamptz not null default clock_timestamp(),
  kind         text not null,                                       -- SOFT_HOUSEHOLD_DAY, CAP_HOUSEHOLD_DAY, SOFT_SYSTEM_DAY, CAP_SYSTEM_DAY, SPIKE_HOUSEHOLD, SPIKE_SYSTEM, UNLOCKED, ENABLED_CHANGED
  scope        text not null check (scope in ('HOUSEHOLD', 'SYSTEM')),
  household_id uuid,
  metrics      jsonb not null default '{}'::jsonb,                  -- chỉ số liệu, KHÔNG nội dung hội thoại
  action       text not null default 'NONE'                         -- NONE | LOCK_HOUSEHOLD | DISABLE_ALL | UNLOCK | SET_ENABLED
);
create index ops_alerts_at_idx on private.ops_alerts (at desc);
create table private.pal_locks (
  household_id uuid primary key,
  locked_at    timestamptz not null default clock_timestamp(),
  reason       text not null
);
alter table private.ai_usage enable row level security;
alter table private.ops_alerts enable row level security;
alter table private.pal_locks enable row level security;
revoke all on private.ai_usage, private.ops_alerts, private.pal_locks from public, anon, authenticated;
grant all on private.ai_usage, private.ops_alerts, private.pal_locks to service_role;

create function private.vn_day_start() returns timestamptz
language sql stable set search_path = '' as $$
  select date_trunc('day', now() at time zone 'Asia/Ho_Chi_Minh') at time zone 'Asia/Ho_Chi_Minh'
$$;
revoke all on function private.vn_day_start() from public, anon, authenticated;

-- Ghi cảnh báo. TODO(thông báo ngoài): gửi email chủ sản phẩm qua Resend ở đây (hoặc job đọc private.ops_alerts chưa gửi). Chưa làm.
create function private.ops_alert_add(p_kind text, p_scope text, p_household uuid, p_metrics jsonb, p_action text, p_once_per_day boolean) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if p_once_per_day and exists (select 1 from private.ops_alerts a
       where a.kind = p_kind and a.scope = p_scope and a.household_id is not distinct from p_household and a.at >= private.vn_day_start()) then
    return;
  end if;
  insert into private.ops_alerts (kind, scope, household_id, metrics, action) values (p_kind, p_scope, p_household, p_metrics, p_action);
end $$;
revoke all on function private.ops_alert_add(text, text, uuid, jsonb, text, boolean) from public, anon, authenticated;

-- Cộng dồn SAU khi gọi AI: cảnh báo mềm/cứng theo ngày, đột biến của hộ (khóa hộ), đột biến toàn hệ thống (tắt toàn bộ).
create function private.pal_check_usage(p_household uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_day0   timestamptz := private.vn_day_start();
  v_h1     bigint;
  v_avg    numeric;
  v_sys1   bigint;
  v_hday   bigint;
  v_sday   bigint;
  v_cap    int := private.param_int('pal_household_tokens_per_day');
  v_budget int := private.param_int('pal_system_tokens_per_day');
  v_soft   int := private.param_int('pal_soft_warn_pct');
  v_factor int := private.param_int('pal_spike_factor');
  v_floor  int := private.param_int('pal_spike_floor_tokens_per_hour');
begin
  select coalesce(sum(u.input_tokens + u.output_tokens), 0) into v_h1 from private.ai_usage u
   where u.household_id = p_household and u.at >= now() - interval '1 hour';
  select coalesce(sum(u.input_tokens + u.output_tokens), 0) / 168.0 into v_avg from private.ai_usage u
   where u.household_id = p_household and u.at >= now() - interval '7 days' and u.at < now() - interval '1 hour';
  select coalesce(sum(u.input_tokens + u.output_tokens), 0) into v_sys1 from private.ai_usage u where u.at >= now() - interval '1 hour';
  select coalesce(sum(u.input_tokens + u.output_tokens), 0) into v_hday from private.ai_usage u where u.household_id = p_household and u.at >= v_day0;
  select coalesce(sum(u.input_tokens + u.output_tokens), 0) into v_sday from private.ai_usage u where u.at >= v_day0;

  if v_hday * 100 >= v_cap::bigint * v_soft then
    perform private.ops_alert_add('SOFT_HOUSEHOLD_DAY', 'HOUSEHOLD', p_household, jsonb_build_object('tokens_today', v_hday, 'cap', v_cap), 'NONE', true);
  end if;
  if v_hday >= v_cap then
    perform private.ops_alert_add('CAP_HOUSEHOLD_DAY', 'HOUSEHOLD', p_household, jsonb_build_object('tokens_today', v_hday, 'cap', v_cap), 'NONE', true);
  end if;
  if v_sday * 100 >= v_budget::bigint * v_soft then
    perform private.ops_alert_add('SOFT_SYSTEM_DAY', 'SYSTEM', null, jsonb_build_object('tokens_today', v_sday, 'budget', v_budget), 'NONE', true);
  end if;
  if v_sday >= v_budget then
    perform private.ops_alert_add('CAP_SYSTEM_DAY', 'SYSTEM', null, jsonb_build_object('tokens_today', v_sday, 'budget', v_budget), 'NONE', true);
  end if;

  if v_h1 > greatest(v_floor, v_factor * v_avg) and not exists (select 1 from private.pal_locks l where l.household_id = p_household) then
    insert into private.pal_locks (household_id, reason) values (p_household, 'SPIKE');
    perform private.ops_alert_add('SPIKE_HOUSEHOLD', 'HOUSEHOLD', p_household,
      jsonb_build_object('tokens_1h', v_h1, 'avg_per_hour_7d', round(v_avg, 2), 'factor', v_factor, 'floor', v_floor), 'LOCK_HOUSEHOLD', false);
  end if;
  if v_sys1 > private.param_int('pal_system_tokens_per_hour') and private.param_int('pal_enabled') = 1 then
    update private.params set value_int = 0 where key = 'pal_enabled';
    perform private.ops_alert_add('SPIKE_SYSTEM', 'SYSTEM', null,
      jsonb_build_object('tokens_1h', v_sys1, 'limit', private.param_int('pal_system_tokens_per_hour')), 'DISABLE_ALL', false);
  end if;
end $$;
revoke all on function private.pal_check_usage(uuid) from public, anon, authenticated;

-- ============================================================ RLS
alter table app.pal_conversations enable row level security;
alter table app.pal_messages enable row level security;
create policy pal_conversations_select on app.pal_conversations for select to authenticated
  using ((select app_internal.is_self_member(member_id))
     and (child_id is null or app_internal.purpose_visible(child_id, 'MD-LICH', created_at)));
create policy pal_messages_select on app.pal_messages for select to authenticated
  using ((select app_internal.is_self_member(member_id))
     and (child_id is null or app_internal.purpose_visible(child_id, 'MD-LICH', created_at)));
revoke all on app.pal_conversations, app.pal_messages from public, anon, authenticated;
grant select on app.pal_conversations, app.pal_messages to authenticated;
grant all on app.pal_conversations, app.pal_messages to service_role;

-- ============================================================ trạng thái (nội bộ)
-- state: OFF (cờ tắt) | NO_HOUSEHOLD | LOCKED (tự khóa vì đột biến) | FROZEN | NO_CONSENT (chưa có con nào đã đồng ý lõi mà người này xem được)
--      | BUSY (hết ngân sách token ngày toàn hệ thống) | TOKENS (hết trần token ngày của hộ) | QUOTA (hết lượt hỏi hôm nay) | RATE (quá số câu mỗi phút) | OK
create function private.pal_state(p_uid uuid) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  v_m     app.members;
  v_h     app.households;
  v_tier  text;
  v_limit int;
  v_used  int;
  v_state text;
  v_kids  uuid[];
  v_day0  timestamptz := private.vn_day_start();
  v_htok  bigint;
  v_stok  bigint;
  v_rate  int;
begin
  select m.* into v_m from app.members m where m.user_id = p_uid and m.status = 'DA_THAM_GIA';
  if v_m.id is null then return jsonb_build_object('state', 'NO_HOUSEHOLD'); end if;
  select h.* into v_h from app.households h where h.id = v_m.household_id and h.hidden_at is null;
  if v_h.id is null then return jsonb_build_object('state', 'NO_HOUSEHOLD'); end if;

  v_tier := private.household_tier(v_h.id);
  v_limit := private.pal_limit(v_tier);
  select count(*)::int into v_used from app.pal_messages x
   where x.household_id = v_h.id and x.role = 'user' and x.counted and x.created_at >= v_day0;
  select count(*)::int into v_rate from app.pal_messages x
   where x.member_id = v_m.id and x.role = 'user' and x.created_at >= clock_timestamp() - interval '1 minute';
  select coalesce(sum(u.input_tokens + u.output_tokens), 0) into v_htok from private.ai_usage u where u.household_id = v_h.id and u.at >= v_day0;
  select coalesce(sum(u.input_tokens + u.output_tokens), 0) into v_stok from private.ai_usage u where u.at >= v_day0;
  select coalesce(array_agg(c.id order by c.created_at, c.id), '{}') into v_kids from app.children c
   where c.household_id = v_h.id and c.hidden_at is null and c.state = 'HOAT_DONG'
     and app.access_state(p_uid, 'child.view', c.id, 'MD-LICH') = 'ALLOW';

  v_state := case
    when private.param_int('pal_enabled') <> 1 then 'OFF'
    when exists (select 1 from private.pal_locks l where l.household_id = v_h.id) then 'LOCKED'
    when v_h.state <> 'HOAT_DONG' or v_h.frozen_at is not null then 'FROZEN'
    when cardinality(v_kids) = 0 then 'NO_CONSENT'
    when v_stok >= private.param_int('pal_system_tokens_per_day') then 'BUSY'
    when v_htok >= private.param_int('pal_household_tokens_per_day') then 'TOKENS'
    when v_used >= v_limit then 'QUOTA'
    when v_rate >= private.param_int('pal_max_per_minute') then 'RATE'
    else 'OK' end;
  return jsonb_build_object('state', v_state, 'tier', v_tier, 'limit', v_limit, 'used', v_used,
    'remaining', greatest(v_limit - v_used, 0), 'household_id', v_h.id, 'member_id', v_m.id, 'child_ids', to_jsonb(v_kids),
    'tokens_today', v_htok, 'tokens_cap', private.param_int('pal_household_tokens_per_day'),
    'system_tokens_today', v_stok, 'system_budget', private.param_int('pal_system_tokens_per_day'),
    'max_output_tokens', private.param_int('pal_max_output_tokens'), 'max_question_chars', private.param_int('pal_max_question_chars'));
end $$;
revoke all on function private.pal_state(uuid) from public, anon, authenticated;

-- ============================================================ app.pal_quota (cho app: có hiện màn Pal không, còn mấy lượt)
create function app.pal_quota() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  v_uid uuid := (select auth.uid());
  v_s   jsonb;
begin
  if v_uid is null then perform app.fail('UNAUTHENTICATED'); end if;
  if app.is_anonymous_caller() then
    perform app.fail('FORBIDDEN', 'PAL-AUTH', 'Máy của con không dùng Pal tư vấn.');
  end if;
  v_s := private.pal_state(v_uid);
  return jsonb_build_object('state', v_s ->> 'state', 'tier', v_s -> 'tier', 'limit', v_s -> 'limit',
    'used', v_s -> 'used', 'remaining', v_s -> 'remaining');
end $$;

-- ============================================================ app.pal_prepare (cho Edge Function pal-chat, JWT người dùng)
-- Trả trạng thái và mọi thứ Edge Function cần TRƯỚC khi gọi AI. Tên người lớn/con chỉ để ẩn danh; không rời Edge Function.
-- Không trả dữ liệu sức khỏe của con (D-66: việc dùng quyết sau).
create function app.pal_prepare(p_conversation uuid default null, p_child uuid default null, p_key uuid default null) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  v_uid  uuid := (select auth.uid());
  v_s    jsonb;
  v_conv app.pal_conversations;
  v_kids jsonb;
  v_ads  jsonb;
  v_hist jsonb := '[]'::jsonb;
  v_rep  jsonb := null;
begin
  if v_uid is null then perform app.fail('UNAUTHENTICATED'); end if;
  if app.is_anonymous_caller() then
    perform app.fail('FORBIDDEN', 'PAL-AUTH', 'Máy của con không dùng Pal tư vấn.');
  end if;
  v_s := private.pal_state(v_uid);
  if v_s ->> 'state' = 'NO_HOUSEHOLD' then return v_s; end if;
  if p_key is not null then   -- gửi lặp cùng khóa: trả câu trả lời đã lưu, Edge Function không gọi AI lần nữa
    select jsonb_build_object('conversation_id', u.conversation_id, 'reply', a.content, 'flags', to_jsonb(a.safety_flags)) into v_rep
      from app.pal_messages u join app.pal_messages a on a.conversation_id = u.conversation_id and a.seq = u.seq + 1
     where u.idempotency_key = p_key and u.member_id = (v_s ->> 'member_id')::uuid;
  end if;

  if p_conversation is not null then
    select c.* into v_conv from app.pal_conversations c
     where c.id = p_conversation and c.member_id = (v_s ->> 'member_id')::uuid;
    if v_conv.id is null then perform app.fail('NOT_FOUND', 'PAL-CONV', 'Không tìm thấy cuộc trò chuyện.'); end if;
    select coalesce(jsonb_agg(jsonb_build_object('role', x.role, 'content', x.content) order by x.seq), '[]'::jsonb) into v_hist
      from (select * from app.pal_messages m where m.conversation_id = v_conv.id order by m.seq desc limit 12) x;
  end if;
  if p_child is not null and not (v_s -> 'child_ids') @> to_jsonb(p_child::text) then
    perform app.fail('NOT_FOUND', 'PAL-CHILD', 'Không tìm thấy hồ sơ con.');
  end if;

  select coalesce(jsonb_agg(jsonb_build_object('id', c.id, 'call_name', c.call_name, 'age_years', c.age_years, 'grade', c.grade)
                            order by c.created_at, c.id), '[]'::jsonb) into v_kids
    from app.children c where c.id in (select (jsonb_array_elements_text(v_s -> 'child_ids'))::uuid);
  select coalesce(jsonb_agg(jsonb_build_object('id', m.id, 'call_name', m.call_name, 'self', m.user_id = v_uid) order by m.joined_at, m.id), '[]'::jsonb) into v_ads
    from app.members m where m.household_id = (v_s ->> 'household_id')::uuid and m.status = 'DA_THAM_GIA';

  return jsonb_build_object('state', v_s ->> 'state', 'tier', v_s -> 'tier', 'limit', v_s -> 'limit', 'used', v_s -> 'used',
    'remaining', v_s -> 'remaining', 'tokens_today', v_s -> 'tokens_today', 'tokens_cap', v_s -> 'tokens_cap',
    'system_tokens_today', v_s -> 'system_tokens_today', 'system_budget', v_s -> 'system_budget',
    'max_output_tokens', v_s -> 'max_output_tokens', 'max_question_chars', v_s -> 'max_question_chars', 'replay', v_rep, 'children', v_kids, 'adults', v_ads, 'history', v_hist,
    'conversation_child_id', v_conv.child_id);
end $$;

-- ============================================================ chữ ký của Edge Function
-- Chuỗi được ký. PHẢI trùng palRecordMessage() trong functions/_shared/pal-core.ts (vector kiểm chéo ở cả hai phía).
create function private.pal_record_message(
  p_conversation text, p_child text, p_key uuid, p_user text, p_assistant text, p_flags text, p_counted boolean, p_in int, p_out int, p_model text) returns text
language sql immutable set search_path = '' as $$
  select concat_ws(E'\n', 'pal1', p_conversation, p_child, p_key::text, p_user, p_assistant, p_flags,
                   case when p_counted then 't' else 'f' end, coalesce(p_in::text, '-'), coalesce(p_out::text, '-'), coalesce(p_model, '-'))
$$;
create function private.pal_record_sign(p_message text) returns text
language sql stable security definer set search_path = '' as $$
  select encode(extensions.hmac(convert_to(p_message, 'UTF8'), convert_to(private.secret('pal_record_key'), 'UTF8'), 'sha256'), 'hex')
$$;
revoke all on function private.pal_record_message(text, text, uuid, text, text, text, boolean, int, int, text), private.pal_record_sign(text)
  from public, anon, authenticated;

-- ============================================================ app.pal_record_turn
-- Ghi MỘT lượt: tin của phụ huynh + câu trả lời của Pal (+ dòng theo dõi token khi đã gọi AI). Gửi lặp cùng p_key trả bản cũ (replay).
-- p_counted = true (đã gọi AI): cần state OK (còn lượt, còn token, không bị khóa), và p_in_tokens/p_out_tokens/p_model.
-- p_counted = false (lớp an toàn chặn, không gọi AI): state OK, QUOTA, TOKENS, BUSY, RATE hoặc LOCKED (thông tin an toàn không bị hạn mức chặn, BR-NTF-039).
create function app.pal_record_turn(
  p_conversation uuid, p_child uuid, p_key uuid, p_user text, p_assistant text, p_flags text[],
  p_counted boolean, p_in_tokens int, p_out_tokens int, p_model text, p_sig text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_uid   uuid := (select auth.uid());
  v_s     jsonb;
  v_st    text;
  v_hh    uuid;
  v_mem   uuid;
  v_conv  app.pal_conversations;
  v_old   app.pal_messages;
  v_seq   int;
  v_flags text[] := coalesce(p_flags, '{}');
  v_msg   text;
  v_cost  numeric;
begin
  if v_uid is null then perform app.fail('UNAUTHENTICATED'); end if;
  if app.is_anonymous_caller() then
    perform app.fail('FORBIDDEN', 'PAL-AUTH', 'Máy của con không dùng Pal tư vấn.');
  end if;
  if p_key is null or p_user is null or p_assistant is null or p_counted is null
     or char_length(btrim(p_user)) = 0 or char_length(p_user) > 8000 or char_length(btrim(p_assistant)) = 0 or char_length(p_assistant) > 12000
     or (p_counted and (p_in_tokens is null or p_out_tokens is null or p_model is null or char_length(p_model) not between 1 and 80)) then
    perform app.fail('VALIDATION', 'PAL-IN', 'Nội dung trò chuyện không hợp lệ.');
  end if;

  v_msg := private.pal_record_message(coalesce(p_conversation::text, '-'), coalesce(p_child::text, '-'), p_key, p_user, p_assistant,
                                      array_to_string(v_flags, ','), p_counted, p_in_tokens, p_out_tokens, p_model);
  if p_sig is null or p_sig <> private.pal_record_sign(v_msg) then
    perform app.fail('FORBIDDEN', 'PAL-SIG', 'Chữ ký không hợp lệ.');
  end if;

  v_s := private.pal_state(v_uid);
  v_st := v_s ->> 'state';
  v_hh := (v_s ->> 'household_id')::uuid;
  v_mem := (v_s ->> 'member_id')::uuid;
  if v_st = 'NO_HOUSEHOLD' then perform app.fail('FORBIDDEN', 'PAL-HH', 'Bạn chưa thuộc gia đình nào.'); end if;
  perform pg_advisory_xact_lock(hashtextextended('pal:' || v_hh::text, 0));   -- tuần tự hóa các lượt của một hộ (hạn mức không bị vượt khi gửi đồng thời)
  v_s := private.pal_state(v_uid);
  v_st := v_s ->> 'state';

  -- gửi lặp: trả bản cũ trước mọi kiểm tra hạn mức
  select m.* into v_old from app.pal_messages m where m.idempotency_key = p_key;
  if v_old.id is not null then
    if v_old.member_id <> v_mem then perform app.fail('FORBIDDEN', 'PAL-KEY', 'Khóa đã dùng.'); end if;
    return jsonb_build_object('ok', true, 'replay', true, 'conversation_id', v_old.conversation_id,
      'remaining', v_s -> 'remaining', 'state', v_st);
  end if;

  if v_st = 'OFF' then perform app.fail('FEATURE_OFF', 'PAL-FLAG', 'Tính năng trò chuyện với Pal đang tắt.'); end if;
  if v_st = 'FROZEN' then perform app.fail('FROZEN', 'BR-FAM-054', 'Gia đình đang tạm dừng, chưa thay đổi được.'); end if;
  if v_st = 'NO_CONSENT' then perform app.fail('FORBIDDEN', 'PAL-CONSENT', 'Cần đồng ý lập lịch cho ít nhất một con trước khi trò chuyện với Pal.'); end if;
  if p_counted then
    if v_st = 'LOCKED' then perform app.fail('FORBIDDEN', 'PAL_LOCKED', 'Pal đang tạm dừng.'); end if;
    if v_st in ('QUOTA', 'TOKENS', 'BUSY', 'RATE') then
      perform app.fail('RATE_LIMITED', 'PAL-' || v_st, case v_st when 'QUOTA' then 'Hôm nay đã hết lượt hỏi Pal.'
        when 'RATE' then 'Bạn hỏi hơi nhanh, đợi một chút rồi hỏi tiếp nhé.' else 'Pal đang bận, thử lại sau.' end);
    end if;
  end if;
  if v_st not in ('OK', 'QUOTA', 'TOKENS', 'BUSY', 'RATE', 'LOCKED') then perform app.fail('FORBIDDEN', 'PAL-STATE', 'Chưa dùng được.'); end if;
  if p_child is not null and not (v_s -> 'child_ids') @> to_jsonb(p_child::text) then
    perform app.fail('NOT_FOUND', 'PAL-CHILD', 'Không tìm thấy hồ sơ con.');
  end if;

  if p_conversation is null then
    insert into app.pal_conversations (household_id, member_id, child_id) values (v_hh, v_mem, p_child) returning * into v_conv;
  else
    select c.* into v_conv from app.pal_conversations c where c.id = p_conversation and c.member_id = v_mem for update;
    if v_conv.id is null then perform app.fail('NOT_FOUND', 'PAL-CONV', 'Không tìm thấy cuộc trò chuyện.'); end if;
    if p_child is distinct from v_conv.child_id then perform app.fail('VALIDATION', 'PAL-CHILD', 'Cuộc trò chuyện đã gắn với con khác.'); end if;
  end if;

  select coalesce(max(m.seq), 0) + 1 into v_seq from app.pal_messages m where m.conversation_id = v_conv.id;
  insert into app.pal_messages (conversation_id, household_id, member_id, child_id, seq, role, content, safety_flags, counted, input_tokens, output_tokens, idempotency_key)
  values (v_conv.id, v_hh, v_mem, v_conv.child_id, v_seq, 'user', p_user, v_flags, p_counted, p_in_tokens, p_out_tokens, p_key);
  insert into app.pal_messages (conversation_id, household_id, member_id, child_id, seq, role, content, safety_flags, counted)
  values (v_conv.id, v_hh, v_mem, v_conv.child_id, v_seq + 1, 'assistant', p_assistant, v_flags, false);
  update app.pal_conversations set last_message_at = clock_timestamp() where id = v_conv.id;

  if p_counted then
    v_cost := (p_in_tokens::numeric * private.param_int('ai_price_in_usd_x100_per_mtok')
             + p_out_tokens::numeric * private.param_int('ai_price_out_usd_x100_per_mtok')) / 100 / 1000000;
    insert into private.ai_usage (household_id, member_id, model, input_tokens, output_tokens, est_cost_usd)
    values (v_hh, v_mem, p_model, p_in_tokens, p_out_tokens, v_cost);
    perform private.pal_check_usage(v_hh);
  end if;

  v_s := private.pal_state(v_uid);
  return jsonb_build_object('ok', true, 'replay', false, 'conversation_id', v_conv.id,
    'remaining', v_s -> 'remaining', 'state', v_s ->> 'state');
end $$;

revoke all on function app.pal_quota(), app.pal_prepare(uuid, uuid, uuid), app.pal_record_turn(uuid, uuid, uuid, text, text, text[], boolean, int, int, text, text)
  from public, anon;
grant execute on function app.pal_quota(), app.pal_prepare(uuid, uuid, uuid), app.pal_record_turn(uuid, uuid, uuid, text, text, text[], boolean, int, int, text, text)
  to authenticated, service_role;

-- ============================================================ hàm cho chủ sản phẩm (chỉ hệ thống: service_role)
-- Tổng hợp token theo xô thời gian (hour|day, giờ VN) cho toàn hệ thống, một hộ, hoặc một người.
create function private.ai_usage_agg(p_from timestamptz, p_to timestamptz, p_bucket text, p_household uuid default null, p_member uuid default null) returns jsonb
language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_agg(jsonb_build_object('bucket', b, 'calls', n, 'input_tokens', i, 'output_tokens', o, 'est_cost_usd', c) order by b), '[]'::jsonb)
  from (select to_char(date_trunc(p_bucket, u.at at time zone 'Asia/Ho_Chi_Minh'), case p_bucket when 'hour' then 'YYYY-MM-DD HH24:00' else 'YYYY-MM-DD' end) as b,
               count(*) as n, sum(u.input_tokens) as i, sum(u.output_tokens) as o, sum(u.est_cost_usd) as c
          from private.ai_usage u
         where u.at >= p_from and u.at < p_to
           and (p_household is null or u.household_id = p_household) and (p_member is null or u.member_id = p_member)
         group by 1) t
$$;
revoke all on function private.ai_usage_agg(timestamptz, timestamptz, text, uuid, uuid) from public, anon, authenticated;

create function app.ai_usage_series(p_from timestamptz, p_to timestamptz, p_bucket text default 'day', p_household uuid default null, p_member uuid default null) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
begin
  perform private.require_system();
  if p_bucket is null or p_bucket not in ('hour', 'day') or p_from is null or p_to is null then perform app.fail('VALIDATION', 'AI-USAGE', 'Tham số không hợp lệ.'); end if;
  return private.ai_usage_agg(p_from, p_to, p_bucket, p_household, p_member);
end $$;

create function app.ai_usage_report(p_from date, p_to date) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  v_f timestamptz;
  v_t timestamptz;
begin
  perform private.require_system();
  if p_from is null or p_to is null or p_to < p_from then perform app.fail('VALIDATION', 'AI-USAGE', 'Khoảng ngày không hợp lệ.'); end if;
  v_f := p_from::timestamp at time zone 'Asia/Ho_Chi_Minh';
  v_t := (p_to + 1)::timestamp at time zone 'Asia/Ho_Chi_Minh';
  return jsonb_build_object(
    'by_day', private.ai_usage_agg(v_f, v_t, 'day'),
    'by_household', (select coalesce(jsonb_agg(jsonb_build_object('household_id', household_id, 'calls', n, 'input_tokens', i, 'output_tokens', o, 'est_cost_usd', c) order by i + o desc), '[]'::jsonb)
                       from (select u.household_id, count(*) n, sum(u.input_tokens) i, sum(u.output_tokens) o, sum(u.est_cost_usd) c
                               from private.ai_usage u where u.at >= v_f and u.at < v_t group by 1) h),
    'by_model', (select coalesce(jsonb_agg(jsonb_build_object('model', model, 'calls', n, 'input_tokens', i, 'output_tokens', o, 'est_cost_usd', c) order by model), '[]'::jsonb)
                   from (select u.model, count(*) n, sum(u.input_tokens) i, sum(u.output_tokens) o, sum(u.est_cost_usd) c
                           from private.ai_usage u where u.at >= v_f and u.at < v_t group by 1) m),
    'total', (select jsonb_build_object('calls', count(*), 'input_tokens', coalesce(sum(u.input_tokens), 0), 'output_tokens', coalesce(sum(u.output_tokens), 0),
                                        'est_cost_usd', coalesce(sum(u.est_cost_usd), 0))
                from private.ai_usage u where u.at >= v_f and u.at < v_t));
end $$;

create function app.ai_alerts_list(p_limit int default 100) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
begin
  perform private.require_system();
  return (select coalesce(jsonb_agg(jsonb_build_object('id', a.id, 'at', a.at, 'kind', a.kind, 'scope', a.scope, 'household_id', a.household_id,
                                                       'metrics', a.metrics, 'action', a.action) order by a.at desc), '[]'::jsonb)
            from (select * from private.ops_alerts order by at desc limit least(greatest(coalesce(p_limit, 100), 1), 500)) a);
end $$;

create function app.pal_unlock(p_household uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_n int;
begin
  perform private.require_system();
  delete from private.pal_locks where household_id = p_household;
  get diagnostics v_n = row_count;
  if v_n > 0 then
    perform private.ops_alert_add('UNLOCKED', 'HOUSEHOLD', p_household, '{}'::jsonb, 'UNLOCK', false);
  end if;
  return jsonb_build_object('ok', true, 'unlocked', v_n > 0);
end $$;

create function app.pal_set_enabled(p_enabled boolean) returns jsonb
language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_system();
  if p_enabled is null then perform app.fail('VALIDATION', 'PAL-FLAG', 'Cần true hoặc false.'); end if;
  update private.params set value_int = case when p_enabled then 1 else 0 end where key = 'pal_enabled';
  perform private.ops_alert_add('ENABLED_CHANGED', 'SYSTEM', null, jsonb_build_object('enabled', p_enabled), 'SET_ENABLED', false);
  return jsonb_build_object('ok', true, 'enabled', p_enabled);
end $$;

revoke all on function app.ai_usage_series(timestamptz, timestamptz, text, uuid, uuid), app.ai_usage_report(date, date), app.ai_alerts_list(int),
  app.pal_unlock(uuid), app.pal_set_enabled(boolean) from public, anon, authenticated;
grant execute on function app.ai_usage_series(timestamptz, timestamptz, text, uuid, uuid), app.ai_usage_report(date, date), app.ai_alerts_list(int),
  app.pal_unlock(uuid), app.pal_set_enabled(boolean) to service_role;

-- ============================================================ purge_household, purge_child: thêm bảng Pal và bảng theo dõi token
-- (chép nguyên từ migration T3.2; purge_household thêm xóa pal_messages, pal_conversations, ai_usage, ops_alerts, pal_locks của hộ; purge_child thêm pal_messages, pal_conversations của con.
-- Bản ghi token/cảnh báo/khóa của hộ không gắn con nên chỉ xóa khi xóa cả hộ.)
create or replace function app.purge_household(p_household uuid, p_reason text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_h      app.households;
  v_slot   app.trial_slots;
  v_hash   text;
  v_counts jsonb := '{}'::jsonb;
  v_n      int;
  v_users  uuid[];
  v_keep   uuid[];
  v_del    uuid[];
  v_drop   boolean := private.param_int('purge_delete_auth_users') = 1;
begin
  perform private.require_system();
  if p_household is null or p_reason is null or p_reason not in ('HET_THU', 'RUT_SOM', 'GIA_LAP_DIEN_TAP', 'OWNER') then
    perform app.fail('VALIDATION', 'D-44', 'Hộ hoặc lý do xóa không hợp lệ.');
  end if;
  v_hash := encode(extensions.digest(convert_to(p_household::text, 'UTF8'), 'sha256'), 'hex');

  select * into v_h from app.households h where h.id = p_household for update;
  if not found then
    if exists (select 1 from app.deletion_evidence e where e.household_ref_hash = v_hash) then
      return jsonb_build_object('ok', true, 'replay', true);
    end if;
    perform app.fail('NOT_FOUND');
  end if;

  if v_h.data_class not in ('GIA_LAP', 'THU_NOI_BO_D01') then
    perform app.fail('BLOCKED_H4', 'BR-CON-056', 'Dữ liệu thật chưa được xóa hẳn khi cổng pháp lý H4 còn mở.');
  end if;
  if v_h.data_class = 'THU_NOI_BO_D01' then
    select * into v_slot from app.trial_slots s where s.id = v_h.trial_slot_id for update;
    if not found or v_slot.state not in ('HET_THU', 'RUT_SOM') then
      perform app.fail('VALIDATION', 'D-44', 'Vị trí thử còn đang mở: hãy kết thúc trước khi xóa.');
    end if;
  elsif p_reason not in ('GIA_LAP_DIEN_TAP', 'OWNER') then
    perform app.fail('VALIDATION', 'D-44', 'Lý do xóa không khớp loại dữ liệu.');
  end if;

  -- người dùng đăng nhập thuộc hộ: người lớn, và máy con ẩn danh (giữ lại nếu còn gắn với hộ khác)
  select coalesce(array_agg(distinct u), '{}') into v_users from (
    select m.user_id as u from app.members m where m.household_id = p_household
    union
    select b.device_user_id from app.device_bindings b join app.children c on c.id = b.child_id where c.household_id = p_household
  ) s;
  select coalesce(array_agg(u), '{}') into v_keep from unnest(v_users) u
   where exists (select 1 from app.members m where m.user_id = u and m.household_id <> p_household)
      or exists (select 1 from app.device_bindings b join app.children c on c.id = b.child_id
                  where b.device_user_id = u and c.household_id <> p_household);
  select coalesce(array_agg(u), '{}') into v_del from unnest(v_users) u where not (u = any (v_keep));

  insert into private.purge_context (txid, household_id) values (txid_current(), p_household) on conflict (txid) do nothing;

  delete from private.pair_throttle t where (t.scope = 'HOUSEHOLD' and t.key = p_household) or (t.scope = 'USER' and t.key = any (v_del));
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('private.pair_throttle', v_n);
  delete from private.withdraw_confirmations t where t.child_id in (select c.id from app.children c where c.household_id = p_household);
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('private.withdraw_confirmations', v_n);
  delete from private.checkin_responses t where t.child_id in (select c.id from app.children c where c.household_id = p_household);
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('private.checkin_responses', v_n);
  delete from private.child_settings t where t.child_id in (select c.id from app.children c where c.household_id = p_household);
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('private.child_settings', v_n);
  delete from app.child_health_notes t where t.child_id in (select c.id from app.children c where c.household_id = p_household);
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('app.child_health_notes', v_n);
  delete from app.child_alerts t where t.child_id in (select c.id from app.children c where c.household_id = p_household);
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('app.child_alerts', v_n);
  delete from app.pal_messages t where t.household_id = p_household;
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('app.pal_messages', v_n);
  delete from app.pal_conversations t where t.household_id = p_household;
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('app.pal_conversations', v_n);
  delete from private.ai_usage t where t.household_id = p_household;
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('private.ai_usage', v_n);
  delete from private.ops_alerts t where t.household_id = p_household;
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('private.ops_alerts', v_n);
  delete from private.pal_locks t where t.household_id = p_household;
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('private.pal_locks', v_n);
  delete from app.notifications t where t.child_id in (select c.id from app.children c where c.household_id = p_household);
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('app.notifications', v_n);
  delete from app.schedule_answers t where t.child_id in (select c.id from app.children c where c.household_id = p_household);
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('app.schedule_answers', v_n);
  delete from app.schedule_state t where t.child_id in (select c.id from app.children c where c.household_id = p_household);
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('app.schedule_state', v_n);
  delete from app.schedule_versions t where t.child_id in (select c.id from app.children c where c.household_id = p_household);
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('app.schedule_versions', v_n);
  delete from app.activity_cards t where t.child_id in (select c.id from app.children c where c.household_id = p_household);
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('app.activity_cards', v_n);
  delete from app.schedule_profiles t where t.child_id in (select c.id from app.children c where c.household_id = p_household);
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('app.schedule_profiles', v_n);
  delete from private.parent_pins t where t.member_id in (select m.id from app.members m where m.household_id = p_household);
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('private.parent_pins', v_n);
  delete from private.pairing_codes t where t.device_user_id = any (v_del);
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('private.pairing_codes', v_n);
  delete from private.lifecycle_notices t where t.household_id = p_household;
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('private.lifecycle_notices', v_n);
  delete from app.purpose_state t where t.child_id in (select c.id from app.children c where c.household_id = p_household);
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('app.purpose_state', v_n);
  delete from app.consent_events t where t.household_id = p_household;
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('app.consent_events', v_n);
  delete from app.deletion_requests t where t.household_id = p_household;
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('app.deletion_requests', v_n);
  delete from app.audit_log t where t.household_id = p_household;
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('app.audit_log', v_n);
  delete from app.mode_history t where t.child_id in (select c.id from app.children c where c.household_id = p_household);
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('app.mode_history', v_n);
  delete from app.grants t where t.child_id in (select c.id from app.children c where c.household_id = p_household);
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('app.grants', v_n);
  delete from app.invitations t where t.household_id = p_household;
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('app.invitations', v_n);
  delete from app.device_bindings t where t.child_id in (select c.id from app.children c where c.household_id = p_household);
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('app.device_bindings', v_n);
  delete from app.children t where t.household_id = p_household;
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('app.children', v_n);
  delete from app.members t where t.household_id = p_household;
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('app.members', v_n);
  delete from app.households t where t.id = p_household;
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('app.households', v_n);

  if v_drop then
    delete from auth.users t where t.id = any (v_del);
    get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('auth.users', v_n);
  end if;

  insert into app.deletion_evidence (household_ref_hash, reason, data_class, trial_slot_id, row_counts)
  values (v_hash, p_reason, v_h.data_class, v_h.trial_slot_id, v_counts);
  if v_slot.id is not null then
    update app.trial_slots set state = 'XOA_XONG', purged_at = clock_timestamp() where id = v_slot.id;
  end if;
  delete from private.purge_context where txid = txid_current();

  return jsonb_build_object('ok', true, 'replay', false, 'row_counts', v_counts,
    'auth_users_deleted', case when v_drop then coalesce(cardinality(v_del), 0) else 0 end,
    'auth_user_ids', to_jsonb(case when v_drop then '{}'::uuid[] else v_del end));
end $$;

create or replace function app.purge_child(p_child uuid, p_reason text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_c      app.children;
  v_h      app.households;
  v_slot   app.trial_slots;
  v_hash   text;
  v_counts jsonb := '{}'::jsonb;
  v_n      int;
  v_users  uuid[];
  v_del    uuid[];
  v_drop   boolean := private.param_int('purge_delete_auth_users') = 1;
  v_sub    text := 'child:' || p_child::text;
  v_res    jsonb;
begin
  perform private.require_system();
  if p_child is null or p_reason is null or p_reason not in ('RUT_SOM', 'GIA_LAP_DIEN_TAP', 'OWNER') then
    perform app.fail('VALIDATION', 'D-64', 'Con hoặc lý do xóa không hợp lệ.');
  end if;
  v_hash := encode(extensions.digest(convert_to(p_child::text, 'UTF8'), 'sha256'), 'hex');

  select * into v_c from app.children c where c.id = p_child for update;
  if not found then
    if exists (select 1 from app.deletion_evidence e where e.household_ref_hash = v_hash) then
      return jsonb_build_object('ok', true, 'replay', true, 'scope', 'CON');
    end if;
    perform app.fail('NOT_FOUND');
  end if;
  select * into v_h from app.households h where h.id = v_c.household_id for update;

  if v_h.data_class not in ('GIA_LAP', 'THU_NOI_BO_D01') then
    perform app.fail('BLOCKED_H4', 'BR-CON-056', 'Dữ liệu thật chưa được xóa hẳn khi cổng pháp lý H4 còn mở.');
  end if;
  if v_h.data_class = 'THU_NOI_BO_D01' then
    select * into v_slot from app.trial_slots s where s.id = v_h.trial_slot_id for update;
    if not found or v_slot.state not in ('DANG_THU', 'HET_THU', 'RUT_SOM') then
      perform app.fail('VALIDATION', 'D-44', 'Vị trí thử không còn trong vòng thử.');
    end if;
    if p_reason not in ('RUT_SOM', 'OWNER') then
      perform app.fail('VALIDATION', 'D-44', 'Lý do xóa không khớp loại dữ liệu.');
    end if;
    if v_c.state <> 'CHO_XOA' then
      perform app.fail('VALIDATION', 'D-64', 'Con này chưa rút đồng ý hoặc chưa yêu cầu xóa.');
    end if;
  elsif p_reason not in ('GIA_LAP_DIEN_TAP', 'OWNER') then
    perform app.fail('VALIDATION', 'D-44', 'Lý do xóa không khớp loại dữ liệu.');
  end if;

  -- con cuối cùng: xóa cả hộ
  if not exists (select 1 from app.children c where c.household_id = v_h.id and c.id <> p_child and c.hidden_at is null) then
    v_res := app.purge_household(v_h.id, p_reason);
    -- dấu vết theo con (để gửi lặp purge_child cho con này trả replay, không NOT_FOUND); số dòng nằm ở bằng chứng của hộ
    insert into app.deletion_evidence (scope, household_ref_hash, reason, data_class, trial_slot_id, row_counts)
    values ('CON', v_hash, p_reason, v_h.data_class, v_h.trial_slot_id, '{}'::jsonb)
    on conflict (household_ref_hash) do nothing;
    return v_res || jsonb_build_object('scope', 'HO');
  end if;

  -- máy con ẩn danh của con này (giữ lại nếu còn gắn với con khác hoặc là thành viên)
  select coalesce(array_agg(distinct b.device_user_id), '{}') into v_users from app.device_bindings b where b.child_id = p_child;
  select coalesce(array_agg(u), '{}') into v_del from unnest(v_users) u
   where not exists (select 1 from app.members m where m.user_id = u)
     and not exists (select 1 from app.device_bindings b where b.device_user_id = u and b.child_id <> p_child);

  insert into private.purge_context (txid, household_id) values (txid_current(), v_h.id) on conflict (txid) do nothing;

  delete from private.pair_throttle t where t.scope = 'USER' and t.key = any (v_del);
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('private.pair_throttle', v_n);
  delete from private.withdraw_confirmations t where t.child_id = p_child;
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('private.withdraw_confirmations', v_n);
  delete from private.checkin_responses t where t.child_id = p_child;
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('private.checkin_responses', v_n);
  delete from private.child_settings t where t.child_id = p_child;
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('private.child_settings', v_n);
  delete from app.child_health_notes t where t.child_id = p_child;
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('app.child_health_notes', v_n);
  delete from app.child_alerts t where t.child_id = p_child;
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('app.child_alerts', v_n);
  delete from app.pal_messages t where t.child_id = p_child;
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('app.pal_messages', v_n);
  delete from app.pal_conversations t where t.child_id = p_child;
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('app.pal_conversations', v_n);
  delete from app.notifications t where t.child_id = p_child;
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('app.notifications', v_n);
  delete from app.schedule_answers t where t.child_id = p_child;
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('app.schedule_answers', v_n);
  delete from app.schedule_state t where t.child_id = p_child;
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('app.schedule_state', v_n);
  delete from app.schedule_versions t where t.child_id = p_child;
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('app.schedule_versions', v_n);
  delete from app.activity_cards t where t.child_id = p_child;
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('app.activity_cards', v_n);
  delete from app.schedule_profiles t where t.child_id = p_child;
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('app.schedule_profiles', v_n);
  delete from private.pairing_codes t where t.device_user_id = any (v_del);
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('private.pairing_codes', v_n);
  delete from app.purpose_state t where t.child_id = p_child;
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('app.purpose_state', v_n);
  delete from app.consent_events t where t.child_id = p_child;
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('app.consent_events', v_n);
  delete from app.deletion_requests t where t.child_id = p_child;
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('app.deletion_requests', v_n);
  delete from app.audit_log t where t.household_id = v_h.id and t.subject_ref = v_sub;
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('app.audit_log', v_n);
  delete from app.mode_history t where t.child_id = p_child;
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('app.mode_history', v_n);
  delete from app.grants t where t.child_id = p_child;
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('app.grants', v_n);
  delete from app.device_bindings t where t.child_id = p_child;
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('app.device_bindings', v_n);
  delete from app.children t where t.id = p_child;
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('app.children', v_n);

  if v_drop then
    delete from auth.users t where t.id = any (v_del);
    get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('auth.users', v_n);
  end if;

  insert into app.deletion_evidence (scope, household_ref_hash, reason, data_class, trial_slot_id, row_counts)
  values ('CON', v_hash, p_reason, v_h.data_class, v_h.trial_slot_id, v_counts);
  delete from private.purge_context where txid = txid_current();

  return jsonb_build_object('ok', true, 'replay', false, 'scope', 'CON', 'row_counts', v_counts,
    'auth_users_deleted', case when v_drop then coalesce(cardinality(v_del), 0) else 0 end,
    'auth_user_ids', to_jsonb(case when v_drop then '{}'::uuid[] else v_del end));
end $$;

-- ACL của purge_household, purge_child giữ nguyên (create or replace không đổi ACL).
