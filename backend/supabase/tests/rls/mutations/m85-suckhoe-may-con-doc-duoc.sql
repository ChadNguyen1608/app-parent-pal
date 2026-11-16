-- expect: HLT-READ-01,HLT-READ-03
-- Lỗi: chính sách đọc ghi chú sức khỏe bỏ điều kiện "người lớn của hộ": máy con đã ghép đọc được.
drop policy child_health_notes_select on app.child_health_notes;
create policy child_health_notes_select on app.child_health_notes for select to authenticated
  using ((select app_internal.can((select auth.uid()), 'child.view', child_id, 'MD-SUCKHOE'))
     and app_internal.purpose_visible(child_id, 'MD-SUCKHOE', created_at));
