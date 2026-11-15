-- expect: FN-PIN-01
-- Lỗi: private.pin_store lưu PIN thô thay vì băm bcrypt.
create or replace function private.pin_store(p_member uuid, p_pin text) returns void
language plpgsql security definer set search_path = '' as $f$
begin
  insert into private.parent_pins as p (member_id, pin_hash) values (p_member, p_pin)
  on conflict (member_id) do update set pin_hash = excluded.pin_hash, failed_count = 0, lock_level = 0, locked_until = null, updated_at = now();
end $f$;
