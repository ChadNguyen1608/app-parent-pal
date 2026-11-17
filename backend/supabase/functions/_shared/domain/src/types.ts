// SINH TỰ ĐỘNG bởi scripts/sync-shared.mjs từ packages/domain/src/types.ts. KHÔNG SỬA TAY: sửa ở packages/ rồi chạy lại script.
// Kiểu dữ liệu dùng chung cho bộ xếp lịch và các lớp khác (Tech Spec 13.1 §5).
// Tên trường giữ tiếng Việt không dấu như spike v2 để đầu ra khớp golden.

export const DAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'] as const;
export type DayCode = (typeof DAYS)[number];

export const isWeekend = (d: string): boolean => d === 'T7' || d === 'CN';

export type Tai = 'cao' | 'vua' | 'thap' | 'phuc_hoi';
export type Nhom = 'truong' | 'hoc_them' | 'hoc_nha' | 'choi_nghi' | 'sinh_hoat' | 'ngu';

/** Kiểu khối có cấu trúc (Business Logic 11.1 §2.2, B-11). Bộ kiểm dùng `kind`, không đoán từ tên khối.
 *  Khác bảng §2.2: `bua_nha` tách thành `an_trua`/`an_toi` (bộ kiểm C7 cần biết có ăn tối); `an_sang` thêm mới (khối sáng). `bua_phu` dùng cả ở trường và ở nhà. */
export const BLOCK_KINDS = [
  'truong', 'di_lai', 'bua_truong', 'bua_phu', 'hoat_dong', 'ghi_viec_hoi_tham', 'phuc_hoi', 'hoc_nha', 'soan_cap',
  'an_sang', 'an_trua', 'an_toi', 'van_dong_sang', 've_sinh_toi', 'doc_nhat_ky', 'man_hinh', 'choi_tu_do', 'nghi_ngan',
  'tat_den', 'ghi_chu_phuong_an',
] as const;
export type BlockKind = (typeof BLOCK_KINDS)[number];

/** Khối trong lịch (dạng đầu ra, giờ "HH:MM"). */
export interface Block {
  bat_dau: string;
  ket_thuc: string;
  khoi: string;
  kind?: BlockKind;
  viec: string[];
  xac_nhan: string;
  tai: Tai;
  nhom: Nhom;
  the_thao: boolean;
  man_hinh: boolean;
  trang_thai: string;
  ghi_chu: string;
  act_id?: string;
  act_start?: string;
  act_end?: string;
}

export interface Phase {
  id?: string;
  ten?: string;
  purpose: string;
  scope: string;
  nguon: string;
  mode?: string;
  tu_ngay: string;
  den_ngay?: string;
  noi_long: string[];
}

export interface Plan {
  tong_quan: { muc_tieu: string[]; nguyen_tac: string[]; gio_ngu: string; ghi_chu: string } | null;
  ngay: Record<string, Block[]>;
  ngoai_le: Record<string, { khoi: Block[] }>;
  giai_doan: (Phase & { trang_thai: string }) | null;
}

export interface Activity {
  id: string;
  ten: string;
  loai: string;
  thu: string[];
  bat_dau: string;
  ket_thuc: string;
  di_lai?: number;
}

export interface BudgetColumn { hoc_nha: number; sinh_hoat: number; ngu: number; man_hinh: number }
export interface Budget { wd: BudgetColumn; we: BudgetColumn }
