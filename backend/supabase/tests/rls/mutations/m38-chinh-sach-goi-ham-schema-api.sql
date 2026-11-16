-- expect: RLS-GEN-05
-- Lỗi: chính sách children_select quay lại gọi hàm trong schema mở API (app.*) thay vì app_internal.*:
-- hàm phụ trợ phải có EXECUTE cho authenticated nên lộ ra RPC.
create function app.can_pub(p_actor uuid, p_action text, p_child uuid, p_purpose text default null)
returns boolean language sql stable security definer set search_path = '' as $$
  select app_internal.can(p_actor, p_action, p_child, p_purpose)
$$;
grant execute on function app.can_pub(uuid, text, uuid, text) to authenticated;
drop policy children_select on app.children;
create policy children_select on app.children for select to authenticated
  using (hidden_at is null and (select app.can_pub((select auth.uid()), 'child.view', id, null)));
