-- expect: ALR-READ-01,ALR-READ-02
-- Lỗi: chính sách đọc child_alerts cho mọi máy con đọc hết (không giới hạn ở thông báo do chính máy đó gửi).
drop policy child_alerts_select on app.child_alerts;
create policy child_alerts_select on app.child_alerts for select to authenticated
  using (app_internal.alert_fresh(created_at)
     and (((select app_internal.is_adult_of_child(child_id))
           and (select app_internal.can((select auth.uid()), 'child.view', child_id, 'MD-CONBAO'))
           and app_internal.purpose_visible(child_id, 'MD-CONBAO', created_at))
          or app.is_anonymous_caller()));
