import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import { actDur } from '@/pal/balance';
import { cleanAct, LOAI, weeklyMinutes } from '@/pal/activities';
import { usePal } from '@/pal/store';
import { hm } from '@/pal/time';
import { DAYS, type Activity, type Day } from '@/pal/types';
import { Btn, C, Card, Chip, H2, Muted, Row, s } from './kit';

type Draft = { id?: string; ten: string; loai: Activity['loai']; thu: Day[]; bat_dau: string; ket_thuc: string; di_lai: string; dia_diem: string };
const empty = (): Draft => ({ ten: '', loai: 'hoc_them', thu: [], bat_dau: '17:30', ket_thuc: '19:00', di_lai: '0', dia_diem: '' });

export function ActivitiesCard() {
  const { state, update } = usePal();
  const [edit, setEdit] = useState<Draft | null>(null);
  const list = state.activities;

  const save = () => {
    if (!edit) return;
    update((d) => {
      const patch = { ten: edit.ten, loai: edit.loai, thu: edit.thu, bat_dau: edit.bat_dau, ket_thuc: edit.ket_thuc, di_lai: +edit.di_lai, dia_diem: edit.dia_diem };
      const i = edit.id ? d.activities.findIndex((a) => a.id === edit.id) : -1;
      if (i >= 0) d.activities[i] = cleanAct(patch, d.activities[i]);
      else d.activities.push({ ...cleanAct(patch), id: 'a' + Date.now().toString(36), nguon: 'bo_me' });
      d.actDirty = true;
    });
    setEdit(null);
  };

  const editDur = edit ? actDur({ bat_dau: edit.bat_dau, ket_thuc: edit.ket_thuc }) : 0;

  return (
    <Card>
      <H2>🧩 Hoạt động của con</H2>
      <View style={{ flexDirection: 'row', gap: 4, marginVertical: 8 }}>
        {DAYS.map((d) => {
          const on = list.some((a) => a.thu.includes(d));
          return (
            <View key={d} style={{ flex: 1, alignItems: 'center', borderRadius: 8, paddingVertical: 4, backgroundColor: on ? C.accentSoft : C.bg }}>
              <Text style={{ fontSize: 11, color: on ? C.accent : C.muted, fontWeight: on ? '700' : '400' }}>{d}</Text>
            </View>
          );
        })}
      </View>
      {state.actDirty && (
        <View style={{ borderWidth: 1, borderStyle: 'dashed', borderColor: C.accent, borderRadius: 10, padding: 8, marginBottom: 8 }}>
          <Muted>Lịch tuần chưa cập nhật theo hoạt động vừa sửa. Nút "Nhờ Pal cập nhật lịch" cần kết nối Pal, làm ở bước sau.</Muted>
        </View>
      )}
      {list.length === 0 && <Muted>Chưa có hoạt động. Thêm lớp học thêm, tập luyện của con.</Muted>}
      {list.map((a) => (
        <View key={a.id} style={[{ borderWidth: 1, borderColor: C.line, borderRadius: 12, padding: 10, marginTop: 8 }, state.actNew.includes(a.id) && { borderColor: C.accent }]}>
          <Text style={{ fontWeight: '700' }}>
            {a.ten} <Text style={{ fontWeight: '400', fontSize: 12, color: C.muted }}>{LOAI[a.loai]}</Text>
            {state.actNew.includes(a.id) ? <Text style={{ color: C.accent, fontSize: 11 }}>  ● Pal vừa ghi</Text> : null}
          </Text>
          <Muted>{a.thu.join(' ')} · {a.bat_dau}–{a.ket_thuc}{a.di_lai ? ` · đi lại ${a.di_lai} phút` : ''}{a.dia_diem ? ` · ${a.dia_diem}` : ''}</Muted>
          <Row style={{ marginTop: 6 }}>
            <Btn small label="Sửa" onPress={() => setEdit({ id: a.id, ten: a.ten, loai: a.loai, thu: a.thu, bat_dau: a.bat_dau, ket_thuc: a.ket_thuc, di_lai: String(a.di_lai), dia_diem: a.dia_diem || '' })} />
            <Btn small label="Xóa" onPress={() => update((d) => { d.activities = d.activities.filter((x) => x.id !== a.id); d.actDirty = true; })} />
          </Row>
        </View>
      ))}
      {list.length > 0 && <Muted style={{ marginTop: 8 }}>Tổng mỗi tuần: {hm(weeklyMinutes(list))} (gồm đi lại)</Muted>}
      {edit ? (
        <View style={{ gap: 8, marginTop: 10 }}>
          <TextInput style={s.input} placeholder="Tên, ví dụ: Tiếng Anh" value={edit.ten} onChangeText={(t) => setEdit({ ...edit, ten: t })} />
          <Row>{(Object.keys(LOAI) as Activity['loai'][]).map((k) => <Chip key={k} label={LOAI[k]} on={edit.loai === k} onPress={() => setEdit({ ...edit, loai: k })} />)}</Row>
          <Row>{DAYS.map((d) => <Chip key={d} label={d} on={edit.thu.includes(d)} onPress={() => setEdit({ ...edit, thu: edit.thu.includes(d) ? edit.thu.filter((x) => x !== d) : [...edit.thu, d] })} />)}</Row>
          <Row>
            <TextInput style={[s.input, { width: 80 }]} value={edit.bat_dau} onChangeText={(t) => setEdit({ ...edit, bat_dau: t })} placeholder="17:30" />
            <Text>đến</Text>
            <TextInput style={[s.input, { width: 80 }]} value={edit.ket_thuc} onChangeText={(t) => setEdit({ ...edit, ket_thuc: t })} placeholder="19:00" />
            <TextInput style={[s.input, { width: 70 }]} keyboardType="numeric" value={edit.di_lai} onChangeText={(t) => setEdit({ ...edit, di_lai: t })} />
            <Muted>phút đi lại</Muted>
          </Row>
          <TextInput style={s.input} placeholder="Địa điểm" value={edit.dia_diem} onChangeText={(t) => setEdit({ ...edit, dia_diem: t })} />
          <Muted>{editDur ? `Mỗi buổi ${hm(editDur)}` : 'Giờ chưa hợp lệ (dạng 17:30)'}</Muted>
          <Row><Btn primary label="Lưu" onPress={save} /><Btn label="Hủy" onPress={() => setEdit(null)} /></Row>
        </View>
      ) : (
        <View style={{ marginTop: 10 }}><Btn label="＋ Thêm hoạt động" onPress={() => setEdit(empty())} /></View>
      )}
    </Card>
  );
}
