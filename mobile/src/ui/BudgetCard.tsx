import { useEffect, useState, type ReactNode } from 'react';
import { Text, TextInput, View } from 'react-native';

import { COLS, defaultBudget, fixedDay, getBudget, judge, rangeOf, restRange, type Color } from '@/pal/balance';
import { GROUPS, setBudget } from '@/pal/budget';
import { usePal } from '@/pal/store';
import { hm, hmRange } from '@/pal/time';
import { Btn, C, Card, Dot, H2, Muted, Row, s } from './kit';

const PRESET_HINTS = ['Thi cử', 'Nghỉ hè', 'Nghỉ lễ'];

function HourInput({ minutes, onCommit }: { minutes: number; onCommit: (h: number) => void }) {
  const shown = String(Math.round(minutes / 15) / 4);
  const [text, setText] = useState(shown);
  useEffect(() => setText(shown), [shown]);
  const commit = () => onCommit(parseFloat(text.replace(',', '.')));
  return (
    <Row style={{ gap: 4 }}>
      <TextInput style={[s.input, { width: 72, textAlign: 'center' }]} keyboardType="decimal-pad" value={text} onChangeText={setText} onEndEditing={commit} />
      <Muted>giờ</Muted>
    </Row>
  );
}

export function BudgetCard() {
  const { state, update } = usePal();
  const [newName, setNewName] = useState<string | null>(null);

  // Lần đầu: quỹ mặc định theo tuổi và preset "Bình thường".
  useEffect(() => {
    if (state.budget && state.presetActive) return;
    update((d) => {
      d.budget = d.budget ?? defaultBudget(d);
      if (!Object.keys(d.presets).length) {
        d.presets = { 'Bình thường': JSON.parse(JSON.stringify(d.budget)) };
        d.presetActive = 'Bình thường';
      }
    });
  }, [state.budget, state.presetActive, update]);

  const B = getBudget(state);
  const names = Object.keys(state.presets);
  const strip = (x: { wd: unknown; we: unknown }) => JSON.stringify({ wd: x.wd, we: x.we });
  const dirty = !state.presets[state.presetActive] || strip(state.presets[state.presetActive]) !== strip(B);

  return (
    <>
      <Card>
        <H2>⏱️ Quỹ thời gian một ngày của con</H2>
        <Muted>Bố mẹ nhập số giờ cho các ô trắng. Ở trường và học thêm lấy theo lịch; chơi tự do là phần còn lại. Pal xếp lịch theo quỹ, xê dịch tối đa ±30 phút.</Muted>
        <Row style={{ marginTop: 10 }}>
          {names.map((n) => (
            <Btn key={n} small primary={n === state.presetActive} label={n}
              onPress={() => update((d) => { d.presetActive = n; d.budget = JSON.parse(JSON.stringify(d.presets[n])); if (!d.budget!.ok) d.budget!.ok = {}; })} />
          ))}
        </Row>
        <Row style={{ marginTop: 8 }}>
          <Btn small primary={dirty} label={dirty ? '💾 Lưu •' : '💾 Lưu'} onPress={() => update((d) => { d.presets[d.presetActive] = JSON.parse(JSON.stringify(getBudget(d))); })} />
          <Btn small label="＋ Lưu thành mới" onPress={() => setNewName('')} />
          {names.length > 1 && (
            <Btn small label="🗑 Xóa preset" onPress={() => update((d) => { delete d.presets[d.presetActive]; d.presetActive = Object.keys(d.presets)[0]; d.budget = JSON.parse(JSON.stringify(d.presets[d.presetActive])); })} />
          )}
        </Row>
        {newName !== null && (
          <Row style={{ marginTop: 8 }}>
            <TextInput style={[s.input, { flex: 1, minWidth: 150 }]} placeholder="Tên, ví dụ: Thi cử" value={newName} onChangeText={setNewName} />
            {PRESET_HINTS.filter((n) => !state.presets[n]).map((n) => <Btn key={n} small label={n} onPress={() => setNewName(n)} />)}
            <Btn small primary label="Lưu" onPress={() => {
              const n = newName.trim();
              if (!n) return;
              update((d) => { d.presets[n] = JSON.parse(JSON.stringify(getBudget(d))); d.presetActive = n; });
              setNewName(null);
            }} />
          </Row>
        )}
      </Card>
      <Card>
        {GROUPS.map((g, gi) => (
          <View key={g.k} style={{ borderTopWidth: gi && !g.sub ? 1 : 0, borderTopColor: C.line, paddingVertical: 10, marginLeft: g.sub ? 14 : 0 }}>
            <Text style={{ fontWeight: g.sub ? '500' : '700', fontSize: g.sub ? 13.5 : 15 }}>{g.n}</Text>
            <Muted style={{ fontSize: 12 }}>{g.ex}</Muted>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 6 }}>
              {COLS.map((c) => {
                let col: Color = 'xam';
                let why = '';
                let body: ReactNode = null;
                if (g.mode === 'fixed') {
                  const r = rangeOf(c.k, (d) => fixedDay(state, d), g.k);
                  [col, why] = g.k === 'hoc_them' ? judge(state, g.k, c.k, r ? r[1] : 0) : ['xam', ''];
                  body = (
                    <>
                      <Row style={{ gap: 0 }}><Dot color={col} /><Text style={{ fontSize: 15 }}>{r ? hmRange(r) : '—'}</Text></Row>
                      <Muted style={{ fontSize: 11.5 }}>{g.k === 'truong' ? 'theo thời khóa biểu' : 'theo danh sách hoạt động'}</Muted>
                    </>
                  );
                } else if (g.mode === 'rest') {
                  const r = restRange(state, c.k);
                  [col, why] = judge(state, 'choi_nghi', c.k, r[0]);
                  body = (
                    <>
                      <Row style={{ gap: 0 }}><Dot color={col} /><Text style={{ fontSize: 15 }}>{hmRange(r)}</Text></Row>
                      <Muted style={{ fontSize: 11.5 }}>tự tính, phần còn lại</Muted>
                    </>
                  );
                } else {
                  const val = (B[c.k] as unknown as Record<string, number>)[g.k];
                  [col, why] = judge(state, g.k, c.k, val);
                  body = (
                    <Row style={{ gap: 0 }}>
                      <Dot color={col} />
                      <HourInput minutes={val} onCommit={(h) => update((d) => { d.budget = setBudget(d, c.k, g.k, h); })} />
                    </Row>
                  );
                }
                const key = c.k + '.' + g.k;
                const okd = !!B.ok[key];
                return (
                  <View key={c.k} style={{ flex: 1 }}>
                    <Muted style={{ fontSize: 11.5, marginBottom: 3 }}>{c.n}</Muted>
                    {body}
                    {!!why && (
                      <Text style={{ fontSize: 12, marginTop: 4, color: okd ? C.muted : col === 'do' ? C.red : '#b35c00' }}>
                        {(col === 'do' ? '⛔ ' : '⚠️ ') + why + (okd ? ' · bố mẹ đã xác nhận' : '')}
                      </Text>
                    )}
                    {!!why && col === 'do' && !okd && g.mode === 'input' && (
                      <View style={{ marginTop: 4, alignSelf: 'flex-start' }}>
                        <Btn small label="Giữ mức này" onPress={() => update((d) => { const b = getBudget(d); b.ok[key] = true; d.budget = b; })} />
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        ))}
        <Muted style={{ marginTop: 6 }}>Học ở nhà do bố mẹ quyết định, không chấm màu. Mỗi cảnh báo ghi mốc và nguồn; mốc ghi "mặc định của Pal" là chưa kiểm chứng.</Muted>
        <Row style={{ marginTop: 10 }}>
          <Btn label="Về mặc định theo tuổi" onPress={() => update((d) => { d.budget = defaultBudget(d); })} />
        </Row>
        <Muted style={{ marginTop: 6 }}>Một ngày có {hm(1440)}.</Muted>
      </Card>
    </>
  );
}
