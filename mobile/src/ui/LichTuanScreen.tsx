import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { checkDay, relaxedCount } from '@/pal/balance';
import { effectiveDay, usePal } from '@/pal/store';
import { blockKey, todayKey } from '@/pal/today';
import { todayStr } from '@/pal/time';
import { DAYS, DAY_NAME, type Block, type Day } from '@/pal/types';
import { Btn, C, Card, Chip, H2, Muted, Row } from './kit';

const PROFILE_FIELDS: [string, string][] = [
  ['Tuổi, lớp', 'tuoi_lop'], ['Giờ học', 'gio_hoc'], ['Nơi ở', 'noi_o'], ['Ăn uống', 'an_uong'], ['Học thêm', 'hoc_them'],
  ['Sức khỏe', 'suc_khoe'], ['Thể lực, năng lượng', 'the_luc'], ['Giấc ngủ', 'giac_ngu'], ['Tính cách', 'tinh_cach'],
  ['Học tập', 'hoc_tap'], ['Sở thích', 'so_thich'], ['Con không thích', 'khong_thich'], ['Mong muốn của bố mẹ', 'muc_tieu_bo_me'],
];
const TAI: Record<string, string> = { cao: 'Tải cao', vua: 'Tải vừa', thap: 'Nhẹ', phuc_hoi: 'Phục hồi' };
const vnDate = (s: string) => (s ? s.slice(8, 10) + '/' + s.slice(5, 7) : '?');

export function LichTuanScreen() {
  const { state } = usePal();
  const [day, setDay] = useState<Day>(todayKey());
  const [template, setTemplate] = useState(false);

  const has = DAYS.some((d) => (state.plan.ngay[d] || []).length);
  const tq = state.plan.tong_quan;
  const rows = PROFILE_FIELDS.filter(([, k]) => state.profile[k]);
  const G = state.plan.giai_doan;
  const ov = state.plan.ngoai_le[day];
  const blocks: Block[] = effectiveDay(state, day, template);
  const log = state.log[todayStr()];
  const warns = checkDay(state, day);
  const nRelaxed = relaxedCount(state, day);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 12 }}>
        <Text style={{ fontSize: 22, fontWeight: '700', marginBottom: 8 }}>Lịch tuần</Text>
        {!has && !tq ? (
          <Card><Muted>Chưa có kế hoạch. Vào tab Lên kế hoạch, nạp lịch mẫu hoặc trò chuyện với Pal.</Muted></Card>
        ) : (
          <>
            {rows.length > 0 && (
              <Card>
                <H2>Hồ sơ của con</H2>
                {rows.map(([l, k]) => (
                  <View key={k} style={{ flexDirection: 'row', gap: 10, marginTop: 2 }}>
                    <Text style={{ width: 110, color: C.muted, fontSize: 14 }}>{l}</Text>
                    <Text style={{ flex: 1, fontSize: 14 }}>{Array.isArray(state.profile[k]) ? (state.profile[k] as string[]).join(', ') : String(state.profile[k])}</Text>
                  </View>
                ))}
              </Card>
            )}
            {G && G.trang_thai !== 'da_ket_thuc' && (
              <Card style={{ borderColor: '#b9a4f0' }}>
                <H2>⏳ {G.ten}</H2>
                <Muted>
                  {vnDate(G.tu_ngay)} → {vnDate(G.den_ngay)} · {G.trang_thai === 'cho_xac_nhan' ? 'Chờ bố mẹ xác nhận' : G.trang_thai === 'het_han' ? 'Đã hết hạn' : 'Đang áp dụng'}
                  {G.ly_do ? ' · ' + G.ly_do : ''}
                </Muted>
                {G.quy_tac_tam.map((x, i) => <Text key={i} style={{ marginTop: 2 }}>• {x}</Text>)}
                <Muted style={{ marginTop: 6 }}>Luôn giữ: đủ giờ ngủ, nghỉ sau giờ học ít nhất 15 phút, nghỉ ngắn giữa các khối học, không bỏ bữa.</Muted>
              </Card>
            )}
            {tq && (
              <Card>
                <H2>Kế hoạch tổng quan</H2>
                {!!tq.muc_tieu?.length && <><Text style={{ fontWeight: '700' }}>Mục tiêu</Text>{tq.muc_tieu.map((x, i) => <Text key={i}>• {x}</Text>)}</>}
                {!!tq.nguyen_tac?.length && <><Text style={{ fontWeight: '700', marginTop: 6 }}>Nguyên tắc</Text>{tq.nguyen_tac.map((x, i) => <Text key={i}>• {x}</Text>)}</>}
                {!!tq.gio_ngu && <Text style={{ marginTop: 6 }}><Text style={{ fontWeight: '700' }}>Giờ ngủ: </Text>{tq.gio_ngu}</Text>}
                {!!tq.ghi_chu && <Muted style={{ marginTop: 6 }}>{tq.ghi_chu}</Muted>}
              </Card>
            )}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingBottom: 8 }}>
              {DAYS.map((d) => <Chip key={d} label={d} on={d === day} onPress={() => { setDay(d); setTemplate(false); }} />)}
            </ScrollView>
            {ov && (
              <View style={{ backgroundColor: C.accentSoft, borderRadius: 10, padding: 8, marginBottom: 10 }}>
                <Text style={{ fontSize: 13 }}>{template ? 'Đang xem lịch mẫu. ' : 'Chỉ áp dụng tuần này: '}{ov.ly_do || 'thay đổi tạm thời'}</Text>
                <View style={{ marginTop: 6, alignSelf: 'flex-start' }}><Btn small label={template ? 'Xem tuần này' : 'Xem lịch mẫu'} onPress={() => setTemplate(!template)} /></View>
              </View>
            )}
            <Muted style={{ marginBottom: 8 }}>{DAY_NAME[day]}</Muted>
            {warns.length > 0 && !template && (
              <View style={{ backgroundColor: '#fff6e0', borderWidth: 1, borderColor: '#f0c36d', borderRadius: 12, padding: 10, marginBottom: 10 }}>
                <Text style={{ fontWeight: '700', color: '#6b4a00' }}>⚠️ Lưu ý cân bằng</Text>
                {warns.map((w, i) => <Text key={i} style={{ color: '#6b4a00', fontSize: 13, marginTop: 3 }}>• {w}</Text>)}
              </View>
            )}
            {nRelaxed > 0 && !template && <Muted style={{ marginBottom: 8 }}>{nRelaxed} kiểm tra đang được nới trong giai đoạn tạm thời.</Muted>}
            {blocks.length === 0 && <Muted style={{ textAlign: 'center', padding: 20 }}>Chưa có khối nào cho ngày này.</Muted>}
            {blocks.map((b, i) => {
              const cancel = b.trang_thai === 'huy';
              const L = day === todayKey() && !template ? log?.k[blockKey(b)] : undefined;
              return (
                <View key={i} style={{ backgroundColor: C.card, borderWidth: 1, borderColor: C.line, borderRadius: 12, padding: 10, marginBottom: 8 }}>
                  <Text style={{ fontSize: 13, color: C.muted }}>{b.bat_dau}{b.ket_thuc && b.ket_thuc !== b.bat_dau ? '–' + b.ket_thuc : ''}</Text>
                  <Text style={{ fontWeight: '700', marginVertical: 2, textDecorationLine: cancel ? 'line-through' : 'none' }}>
                    {b.khoi}{b.tai && TAI[b.tai] ? '  · ' + TAI[b.tai] : ''}{cancel ? '  · Hủy' : ''}
                  </Text>
                  {b.viec?.map((v, j) => <Text key={j} style={{ fontSize: 14 }}>• {v}</Text>)}
                  {!!b.xac_nhan && <Text style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>Xác nhận: {b.xac_nhan}</Text>}
                  {!!b.ghi_chu && <Muted style={{ marginTop: 4 }}>{b.ghi_chu}</Muted>}
                  {L?.xong && <Text style={{ fontSize: 12, color: C.ok, marginTop: 4 }}>✓ Con đã xong lúc {L.xong}{L.tom_tat ? ' · ' + L.tom_tat : ''}</Text>}
                </View>
              );
            })}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
