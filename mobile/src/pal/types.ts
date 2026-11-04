export const DAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'] as const;
export type Day = (typeof DAYS)[number];

export const DAY_NAME: Record<Day, string> = {
  T2: 'Thứ Hai',
  T3: 'Thứ Ba',
  T4: 'Thứ Tư',
  T5: 'Thứ Năm',
  T6: 'Thứ Sáu',
  T7: 'Thứ Bảy',
  CN: 'Chủ Nhật',
};

export type Tai = 'cao' | 'vua' | 'thap' | 'phuc_hoi';
export type GroupKey = 'truong' | 'hoc_them' | 'hoc_nha' | 'choi_nghi' | 'sinh_hoat' | 'ngu';

/** Một khối trong lịch ngày. Tên trường giữ nguyên với bản thử web và với tool của Pal. */
export type Block = {
  bat_dau: string;
  ket_thuc: string;
  khoi: string;
  viec?: string[];
  xac_nhan?: string;
  trang_thai?: 'huy' | 'binh_thuong';
  ghi_chu?: string;
  tai?: Tai | '';
  nhom?: GroupKey;
  man_hinh?: boolean;
};

export type Activity = {
  id: string;
  ten: string;
  loai: 'hoc_them' | 'the_thao' | 'nang_khieu' | 'khac';
  thu: Day[];
  bat_dau: string;
  ket_thuc: string;
  di_lai: number;
  dia_diem?: string;
  ghi_chu?: string;
  nguon?: 'pal' | 'bo_me';
};

export type BudgetCol = { hoc_nha: number; sinh_hoat: number; ngu: number; man_hinh: number };
export type Budget = { wd: BudgetCol; we: BudgetCol; ok: Record<string, boolean> };

export type Period = {
  ten: string;
  ly_do: string;
  nguon: string;
  tu_ngay: string;
  den_ngay: string;
  quy_tac_tam: string[];
  noi_long: string[];
  trang_thai: 'cho_xac_nhan' | 'dang_ap_dung' | 'het_han' | 'da_ket_thuc';
  lich_goc?: { ngay: Record<string, Block[]>; tong_quan: unknown } | null;
};

export type Plan = {
  tong_quan: {
    muc_tieu?: string[];
    nguyen_tac?: string[];
    gio_ngu?: string;
    ghi_chu?: string;
  } | null;
  ngay: Partial<Record<Day, Block[]>>;
  ngoai_le: Partial<Record<Day, { ly_do?: string; khoi: Block[] }>>;
  giai_doan?: Period;
};

/** Phần trạng thái mà bộ kiểm tra và quỹ giờ cần đọc. */
export type PalState = {
  profile: Record<string, string | string[] | undefined>;
  plan: Plan;
  budget: Budget | null;
  activities: Activity[];
};
