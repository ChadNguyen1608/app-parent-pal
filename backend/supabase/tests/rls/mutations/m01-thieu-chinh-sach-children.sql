-- expect: RLS-ROLE children / QL, RLS-ROLE children / CON
-- Mô phỏng quên viết chính sách: QL và máy con không còn thấy con của mình.
drop policy children_select on app.children;
