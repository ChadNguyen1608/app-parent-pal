-- D-60 (Owner Decision Log 16/11/2026): chủ sản phẩm duyệt các thông số ghép máy và Parent PIN theo đề xuất.
-- Chỉ đổi status sang DA_CHOT, KHÔNG đổi giá trị. touch_active_min_interval_minutes vẫn CHUA_CHOT (không thuộc D-60).
-- Người soạn: AI, chưa kiểm chứng độc lập.
update private.params p
   set status = 'DA_CHOT',
       note   = p.note || ' | D-60: chủ sản phẩm chốt 16/11/2026'
 where p.key in ('pair_code_ttl_minutes', 'pair_code_max_attempts', 'pair_code_create_per_hour',
                 'pair_confirm_max_fails', 'pair_confirm_window_minutes', 'pair_confirm_lock_minutes',
                 'pair_accept_window_minutes', 'pin_length', 'pin_max_failures', 'pin_lock_minutes',
                 'pin_lock_max_minutes', 'pin_bcrypt_cost')
   and p.status = 'CHUA_CHOT';
