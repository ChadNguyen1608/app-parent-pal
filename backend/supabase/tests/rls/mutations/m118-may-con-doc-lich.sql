-- expect: SCH-RLS-01
-- Lỗi: chính sách đọc các bảng lịch bỏ điều kiện "là người lớn của hộ" (chỉ còn app_internal.can): máy con đã ghép đọc trực tiếp bảng lịch.
do $m$
declare t text;
begin
  foreach t in array array['schedule_profiles', 'activity_cards', 'schedule_versions', 'schedule_state', 'schedule_answers'] loop
    execute format('drop policy %I on app.%I', t || '_select', t);
    execute format($p$create policy %I on app.%I for select to authenticated
      using ((select app_internal.can((select auth.uid()), 'child.view', child_id, 'MD-LICH')))$p$, t || '_select', t);
  end loop;
end $m$;
