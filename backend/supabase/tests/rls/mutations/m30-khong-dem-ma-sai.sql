-- expect: FN-PAIR-06
-- Lỗi: Nhập mã sai không bị đếm (không giới hạn đoán mã).
create or replace function private.pair_throttle_hit(p_user uuid, p_household uuid) returns void
language plpgsql security definer set search_path = '' as $f$
begin
  null;
end $f$;
