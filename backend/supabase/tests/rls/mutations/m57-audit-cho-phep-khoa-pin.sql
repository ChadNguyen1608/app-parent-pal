-- expect: AUD-02a
-- Lỗi: danh mục sự kiện cho phép khóa 'pin' trong meta của binding.unlinked.
update private.audit_events set allowed_meta_keys = array_append(allowed_meta_keys, 'pin') where event_code = 'binding.unlinked';
