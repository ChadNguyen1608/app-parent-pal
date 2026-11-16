-- expect: HLT-CONSENT-02,HLT-CONSENT-03
-- Lỗi: chính sách đọc ghi chú sức khỏe không xét đồng ý riêng (rút rồi vẫn đọc, đồng ý lại hiện dữ liệu cũ).
drop policy child_health_notes_select on app.child_health_notes;
create policy child_health_notes_select on app.child_health_notes for select to authenticated
  using ((select app_internal.is_adult_of_child(child_id)));
