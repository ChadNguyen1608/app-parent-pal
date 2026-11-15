-- expect: RLS-D38-02
-- Đường vòng: view trong app đọc từng dòng hỏi thăm.
create view app.v_checkin as select child_id, local_date, choice from private.checkin_responses;
grant select on app.v_checkin to authenticated;
