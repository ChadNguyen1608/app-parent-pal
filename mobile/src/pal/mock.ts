// Pal giả lập: trả câu viết sẵn theo từ khóa trong tin nhắn. Chỉ để test phần app xung quanh Pal
// (áp tool vào lịch, hiện cảnh báo, đồng bộ các tab), không phản ánh chất lượng trả lời thật.
import type { AppState } from './appstate.ts';
import type { PalReply } from './reply.ts';
import { DAYS, type Block } from './types.ts';

const b = (bat_dau: string, ket_thuc: string, khoi: string, tai: Block['tai'], extra: Partial<Block> = {}): Partial<Block> => ({
  bat_dau, ket_thuc, khoi, tai, xac_nhan: 'Con bấm Xong', viec: [], ...extra,
});

const WEEKDAY: Partial<Block>[] = [
  b('06:30', '07:15', 'Dậy, vệ sinh, ăn sáng', 'thap', { viec: ['Đánh răng', 'Ăn sáng'] }),
  b('07:30', '16:15', 'Học ở trường', 'cao', { xac_nhan: 'Tự động' }),
  b('16:15', '16:45', 'Về nhà, nghỉ phục hồi, ăn nhẹ', 'phuc_hoi'),
  b('16:45', '17:15', 'Bài cô giao', 'vua', { viec: ['Toán'], xac_nhan: 'Ảnh' }),
  b('17:15', '18:00', 'Vận động, chơi tự do', 'thap', { xac_nhan: 'Không cần' }),
  b('18:00', '18:45', 'Ăn tối', 'thap'),
  b('18:45', '19:30', 'Chơi, xem tivi', 'thap', { man_hinh: true, xac_nhan: 'Không cần' }),
  b('19:30', '20:00', 'Tắm, vệ sinh, soạn cặp', 'thap', { viec: ['Soạn cặp cho ngày mai'] }),
  b('20:00', '20:30', 'Đọc truyện', 'thap'),
  b('20:30', '21:00', 'Tắt đèn đi ngủ', 'thap'),
];
const WEEKEND: Partial<Block>[] = [
  b('07:00', '07:45', 'Dậy, vệ sinh, ăn sáng', 'thap'),
  b('08:30', '10:00', 'Chơi tự do', 'thap', { xac_nhan: 'Không cần' }),
  b('12:00', '12:45', 'Ăn trưa', 'thap'),
  b('15:00', '15:30', 'Ăn nhẹ', 'thap'),
  b('18:00', '18:45', 'Ăn tối', 'thap'),
  b('20:30', '21:00', 'Tắt đèn đi ngủ', 'thap'),
];

export function mockReply(message: string, state: AppState): PalReply {
  const m = message.toLowerCase();
  const hasPlan = DAYS.some((d) => (state.plan.ngay[d] || []).length);

  if (/lớp 3|8 tuổi/.test(m)) {
    return {
      tra_loi: 'Mình đã ghi hồ sơ và lập lịch cả tuần cho con. Bạn xem ở tab Lịch tuần nhé.',
      ho_so: { tuoi_lop: '8 tuổi, lớp 3', gio_hoc: '7:30 đến 16:15', hoc_them: 'Tiếng Anh thứ Tư, thứ Sáu 17:30 đến 19:00' },
      tong_quan: { muc_tieu: ['Con vận động buổi sáng', 'Đọc sách và viết nhật ký trước khi ngủ'], nguyen_tac: ['Nghỉ phục hồi sau giờ học', 'Ngủ đủ 9 giờ'], gio_ngu: '21:00 đến 06:30' },
      hoat_dong: [{ hanh_dong: 'them', ten: 'Tiếng Anh', loai: 'hoc_them', thu: ['T4', 'T6'], bat_dau: '17:30', ket_thuc: '19:00', di_lai: 30 }],
      ngay: DAYS.map((d) => ({ ngay: d, pham_vi: 'mau_tuan', khoi: d === 'T7' || d === 'CN' ? WEEKEND : WEEKDAY })),
      canh_bao: [],
    };
  }
  if (/lớp 8|13 tuổi/.test(m)) {
    return {
      tra_loi: 'Mình đã lập lịch cho con, có vài chỗ cần bạn xem lại.',
      ho_so: { tuoi_lop: '13 tuổi, lớp 8' },
      ngay: DAYS.filter((d) => d !== 'T7' && d !== 'CN').map((d) => ({
        ngay: d, pham_vi: 'mau_tuan',
        khoi: [
          b('06:00', '06:45', 'Ôn bài Toán', 'cao', { viec: ['Làm đề'] }),
          b('07:00', '11:30', 'Học ở trường', 'cao', { xac_nhan: 'Tự động' }),
          b('14:00', '15:30', 'Làm bài tập tiếng Anh', 'cao', { viec: ['Từ vựng'] }),
          b('23:30', '23:59', 'Tắt đèn đi ngủ', 'thap'),
        ],
      })),
      canh_bao: ['Con ngủ muộn, nên lùi giờ tắt đèn.'],
    };
  }
  if (/ốm|hủy toàn bộ/.test(m)) {
    const day = /thứ năm/.test(m) ? 'T5' : 'T4';
    const base = (state.plan.ngay[day] || []).map((x) => ({ ...x, trang_thai: 'huy' as const }));
    return { tra_loi: 'Mình đã hủy lịch hôm đó, chỉ áp dụng tuần này. Chúc con mau khỏe.', ngay: [{ ngay: day, pham_vi: 'chi_tuan_nay', ly_do: 'Con bị ốm', khoi: base }] };
  }
  if (/chuyển từ thứ tư sang thứ năm|chuyển.*thứ năm/.test(m)) {
    const cur = state.activities.find((a) => /tiếng anh/i.test(a.ten));
    if (!cur) return { tra_loi: 'Mình chưa thấy lớp tiếng Anh trong danh sách hoạt động. Bạn kể thêm giúp mình nhé.' };
    return { tra_loi: 'Mình đã chuyển lớp tiếng Anh sang thứ Năm. Lịch tuần cần cập nhật theo.', hoat_dong: [{ hanh_dong: 'sua', id: cur.id, thu: ['T5', 'T6'] }] };
  }
  if (/thi ngày|ôn thi/.test(m)) {
    return {
      tra_loi: 'Mình đã tạo giai đoạn ôn thi, bạn xác nhận ở tab Lịch tuần nhé.',
      giai_doan: { hanh_dong: 'tao', ten: 'Ôn thi', ly_do: 'Con thi cuối kỳ', nguon: 'bo_me', tu_ngay: '2026-11-04', den_ngay: '2026-11-28', quy_tac_tam: ['Bỏ bơi', 'Giảm nửa thời gian chơi'], noi_long: ['tong_gio_hoc'], can_xac_nhan: false },
      ngay: [],
    };
  }
  if (/thêm.*20 phút|từ vựng/.test(m) && hasPlan) {
    return { tra_loi: 'Mình đã thêm 20 phút từ vựng vào buổi tối các ngày đi học.', ngay: DAYS.slice(0, 5).map((d) => ({ ngay: d, pham_vi: 'mau_tuan', khoi: [...WEEKDAY, b('19:00', '19:20', 'Từ vựng tiếng Anh', 'vua', { viec: ['20 phút từ vựng'] })] })) };
  }
  return { tra_loi: hasPlan ? 'Mình đã ghi nhận. Bạn muốn đổi gì ở lịch của con?' : 'Chào bạn, mình là Pal. Bạn kể cho mình con mấy tuổi, học lớp mấy, mấy giờ vào học và tan học nhé.' };
}
