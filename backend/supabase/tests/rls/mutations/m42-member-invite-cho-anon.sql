-- expect: RLS-GEN-04
-- Lỗi: member_invite mở EXECUTE cho anon.
grant execute on function app.member_invite(text, uuid[], text[]) to anon;
