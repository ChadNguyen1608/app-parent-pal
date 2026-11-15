// Mã lỗi, mã trạng thái dùng chung (không đổi nghĩa so với spike v2).

/** 7 mã của checkDayK (bộ kiểm port từ prototype), thứ tự như spec. */
export const CHECK_KEYS = ['ngu', 'phuc_hoi', 'cao_lien', 'an_xa', 'truoc_gio_hoc', 'tong_gio_hoc', 'tap_muon'] as const;
export type CheckKey = (typeof CHECK_KEYS)[number];

/** Mã kiểm tra bổ sung của spike (extraChecks). */
export const EXTRA_KEYS = [
  'x_chong', 'x_phien', 'x_nghi_giua', 'x_phuc_hoi15', 'x_man_hinh_ngu', 'x_man_hinh_nghi', 'x_cuoi_thap',
  'x_bua_cao', 'x_bo_bua', 'x_bo_hoat_dong', 'x_quy_hoc_nha', 'x_quy_sinh_hoat', 'x_quy_ngu', 'x_ngu_san', 'x_quy_man_hinh',
] as const;
export type ExtraKey = (typeof EXTRA_KEYS)[number];

/** Trạng thái một ngày trong lịch tuần. */
export const DAY_STATUS = ['OK', 'DIEU_CHINH_TRONG_DUNG_SAI', 'CAN_BO_ME_CHON', 'XUNG_DOT'] as const;
export type DayStatus = (typeof DAY_STATUS)[number];

/** Kết quả kiểm giai đoạn tạm thời (validatePhase). */
export const PHASE_VALIDATION = ['OK', 'TU_CHOI', 'CHUYEN_THANH_MONG_MUON', 'CHO_BO_ME_XAC_NHAN'] as const;
export type PhaseValidation = (typeof PHASE_VALIDATION)[number];

/** Trạng thái vòng đời giai đoạn. */
export const PHASE_STATE = [
  'TU_CHOI', 'MONG_MUON', 'CHO_BO_ME_XAC_NHAN', 'CHO_MO_KHOA', 'DANG_AP_DUNG', 'HET_HAN', 'KET_THUC_SOM', 'HUY',
] as const;
export type PhaseState = (typeof PHASE_STATE)[number];

/** Mã lỗi trong findings của validatePhase (trường k). */
export const PHASE_ERROR = {
  NOI_KHONG_HOP_LE: 'noi_khong_hop_le',
  THIEU_NGAY_KET_THUC: 'thieu_ngay_ket_thuc',
  NGAY_SAI: 'ngay_sai',
  VUOT_60_NGAY_GIAI_DOAN: 'vuot_60_ngay_giai_doan',
  VUOT_60_NGAY: 'vuot_60_ngay',
  KHOANG_TRONG_7: 'khoang_trong_7',
  CHONG_LAN: 'chong_lan',
  MONG_MUON: 'mong_muon',
  CHO_XAC_NHAN: 'cho_xac_nhan',
} as const;

/** Đường đổi lịch của con theo chế độ (fatigue.changePath). */
export const CHANGE_PATH = ['MONG_MUON', 'CR', 'CR_KHI_KHOA', 'SUA_TRONG_PHAM_VI_HOAC_CR', 'TU_CHOI'] as const;

export const PARAM_STATUS = 'mac_dinh_chua_kiem_chung';
