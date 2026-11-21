-- expect: PAL-RLS-03
-- Lỗi: chính sách đọc hội thoại Pal bỏ purpose_visible: rút đồng ý lõi mà hội thoại gắn con vẫn hiện.
drop policy pal_conversations_select on app.pal_conversations;
create policy pal_conversations_select on app.pal_conversations for select to authenticated using ((select app_internal.is_self_member(member_id)));
drop policy pal_messages_select on app.pal_messages;
create policy pal_messages_select on app.pal_messages for select to authenticated using ((select app_internal.is_self_member(member_id)));
