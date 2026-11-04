import { useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fixedDay, getBudget, rangeOf, restRange } from '@/pal/balance';
import { GROUPS } from '@/pal/budget';
import { effectiveDay, usePal, type DayLog } from '@/pal/store';
import { blockKey, dateAdd, kindOf, nowHHMM, nowMin, todayKey, WX } from '@/pal/today';
import { hm, hmRange, todayStr, toMin } from '@/pal/time';
import { DAY_NAME, type Block } from '@/pal/types';
import { Btn, C, Card, H2, Muted, Row, s } from './kit';

const MOODS = ['Ổn', 'Hơi mệt', 'Rất mệt'];

function WeatherBox({ dateKey, title }: { dateKey: string; title: string }) {
  const { state, update } = usePal();
  const cur = state.wx[dateKey];
  return (
    <View style={{ marginTop: 8 }}>
      <Text style={{ fontSize: 15 }}>{title}</Text>
      <Row style={{ marginTop: 6 }}>
        {Object.keys(WX).map((k) => <Btn key={k} small primary={cur === k} label={WX[k].n} onPress={() => update((d) => { d.wx[dateKey] = k; })} />)}
      </Row>
      {!!cur && WX[cur].d.length > 0 && <Text style={{ marginTop: 6, backgroundColor: C.bg, padding: 8, borderRadius: 10 }}>Nhớ cho vào cặp: {WX[cur].d.join(', ')}.</Text>}
    </View>
  );
}

export function CuaConScreen() {
  const { state, update } = usePal();
  const [note, setNote] = useState('');
  const [proposal, setProposal] = useState<string | null>(null);
  const d = todayKey();
  const blocks: Block[] = effectiveDay(state, d).filter((b) => b.trang_thai !== 'huy');
  const L: DayLog = state.log[todayStr()] ?? { k: {}, met: '' };
  const checkable = blocks.filter((b) => kindOf(b.xac_nhan) !== 'khong');
  const done = checkable.filter((b) => L.k[blockKey(b)]?.xong).length;
  const nm = nowMin();
  const B = getBudget(state);

  const log = (fn: (l: DayLog) => void) =>
    update((st) => {
      const k = todayStr();
      st.log[k] = st.log[k] ?? { k: {}, met: '' };
      fn(st.log[k]);
    });

  const hungry = () => {
    const now = nowHHMM();
    const meals = blocks.filter((b) => /(ăn|bữa)/i.test(b.khoi + ' ' + (b.viec || []).join(' ')));
    const prev = meals.filter((b) => (toMin(b.bat_dau) ?? 0) <= nm).pop();
    const next = meals.find((b) => (toMin(b.bat_dau) ?? 0) > nm);
    update((st) => {
      const k = todayStr();
      st.log[k] = st.log[k] ?? { k: {}, met: '' };
      st.log[k].doi = [...(st.log[k].doi || []), now];
      if (st.log[k].doi!.length === 1) {
        st.proposals.push({
          text: 'Con báo đói lúc ' + now + (prev ? ' (lần ăn gần nhất trong lịch: ' + prev.khoi + ' ' + prev.bat_dau + ')' : '') + (next ? ', bữa tiếp theo: ' + next.khoi + ' ' + next.bat_dau : ''),
          ngay: k, tu: 'con', loai: 'doi',
        });
      }
    });
    setNote(next && (toMin(next.bat_dau) ?? 0) - nm <= 45 ? 'Sắp đến ' + next.khoi.toLowerCase() + ' rồi, con uống nước và chờ chút nhé.' : 'Pal đã báo bố mẹ. Con uống nước trước nhé.');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 12 }}>
        <Card>
          <Text style={{ fontSize: 18, fontWeight: '700' }}>Chào con! Hôm nay {DAY_NAME[d]}</Text>
          {checkable.length ? (
            <>
              <View style={{ height: 10, backgroundColor: C.line, borderRadius: 6, overflow: 'hidden', marginTop: 8 }}>
                <View style={{ height: '100%', width: `${Math.round((done / checkable.length) * 100)}%`, backgroundColor: C.xanh }} />
              </View>
              <Muted style={{ marginTop: 4 }}>Đã xong {done}/{checkable.length} việc</Muted>
            </>
          ) : (
            <Muted style={{ marginTop: 6 }}>Hôm nay chưa có lịch. Nhờ bố mẹ lập lịch với Pal nhé.</Muted>
          )}
          <View style={{ marginTop: 8, alignSelf: 'flex-start' }}><Btn label="🍎 Con thấy đói" onPress={hungry} /></View>
          {!!note && <Text style={{ marginTop: 8, backgroundColor: C.bg, padding: 8, borderRadius: 10 }}>{note}</Text>}
        </Card>

        {blocks.map((b, i) => {
          const sMin = toMin(b.bat_dau);
          const eMin = toMin(b.ket_thuc) ?? sMin;
          const K = blockKey(b);
          const lg = L.k[K] || {};
          const kind = kindOf(b.xac_nhan);
          const isNow = sMin !== null && nm >= sMin && nm < Math.max(eMin ?? sMin, sMin + 1);
          const markDone = () => log((l) => { l.k[K] = { ...(l.k[K] || {}), xong: nowHHMM() }; });
          const text = b.khoi + ' ' + (b.viec || []).join(' ');
          return (
            <View key={i} style={{ backgroundColor: C.card, borderWidth: isNow ? 2 : 1, borderColor: isNow ? C.accent : C.line, borderRadius: 14, padding: 12, marginBottom: 10, opacity: lg.xong ? 0.6 : 1 }}>
              <Text style={{ fontSize: 13, color: C.muted }}>{b.bat_dau}{b.ket_thuc && b.ket_thuc !== b.bat_dau ? '–' + b.ket_thuc : ''}{isNow ? '   ● Bây giờ' : ''}</Text>
              <Text style={{ fontSize: 17, fontWeight: '700', marginVertical: 2 }}>{b.khoi}{lg.xong ? ' ✓' : ''}</Text>
              {b.viec?.map((v, j) => <Text key={j} style={{ fontSize: 15 }}>• {v}</Text>)}
              {/soạn cặp|chuẩn bị cặp/i.test(text) && (
                <WeatherBox dateKey={dateAdd(sMin !== null && sMin >= 720 ? 1 : 0)} title={sMin !== null && sMin >= 720 ? 'Ngày mai trời thế nào? (xem dự báo cùng bố mẹ)' : 'Hôm nay trời thế nào?'} />
              )}
              {/hỏi thăm|ghi lại việc|việc được giao/i.test(b.khoi) && (
                <View style={{ marginTop: 8 }}>
                  <Text style={{ fontSize: 15 }}>Hôm nay con thấy thế nào?</Text>
                  <Row style={{ marginTop: 6 }}>{MOODS.map((m) => <Btn key={m} small primary={L.met === m} label={m} onPress={() => log((l) => { l.met = m; })} />)}</Row>
                  {L.met === 'Rất mệt' && <Text style={{ marginTop: 6, backgroundColor: C.bg, padding: 8, borderRadius: 10 }}>Hôm nay con nghỉ thêm một chút nhé. Tối nay mình chỉ làm phần cô giao thôi.</Text>}
                </View>
              )}
              <Row style={{ marginTop: 8 }}>
                {lg.xong ? <Btn label="Hoàn tác" onPress={() => log((l) => { delete l.k[K]; })} />
                  : kind === 'bam' ? <Btn primary label="✓ Xong" onPress={markDone} />
                  : kind === 'anh' ? <><Btn primary label="📷 Chụp gửi Pal" onPress={() => setNote('Chụp gửi Pal cần kết nối Pal, làm ở bước sau. Con bấm Xong nhé.')} /><Btn label="✓ Xong" onPress={markDone} /></>
                  : kind === 'noi' ? <Btn primary label="🎤 Kể cho Pal" onPress={() => { setNote('Kể cho Pal cần kết nối Pal, làm ở bước sau.'); markDone(); }} />
                  : kind === 'tu' ? <><Text style={{ color: C.muted }}>Tự ghi nhận</Text><Btn label="✓ Xong" onPress={markDone} /></>
                  : kind === 'bm' ? <Text style={{ color: C.muted }}>Chờ bố mẹ xác nhận</Text>
                  : null}
              </Row>
              {!!lg.loi_cho_con && <Text style={{ marginTop: 8, backgroundColor: C.bg, padding: 8, borderRadius: 10 }}>{lg.loi_cho_con}</Text>}
            </View>
          );
        })}

        <Card>
          <H2>Thời gian của con mỗi ngày đi học</H2>
          {GROUPS.map((g) => {
            const val = g.mode === 'input' ? hm((B.wd as unknown as Record<string, number>)[g.k])
              : g.mode === 'rest' ? hmRange(restRange(state, 'wd'))
              : (() => { const r = rangeOf('wd', (x) => fixedDay(state, x), g.k); return r ? hmRange(r) : '—'; })();
            return (
              <View key={g.k} style={{ flexDirection: 'row', gap: 10, marginTop: 2 }}>
                <Text style={{ flex: 1, color: C.muted, fontSize: 14 }}>{g.n.replace('↳ trong đó: ', '').replace(' (tối đa)', '')}</Text>
                <Text style={{ fontSize: 14 }}>{val}</Text>
              </View>
            );
          })}
          <View style={{ marginTop: 10, alignSelf: 'flex-start' }}><Btn label="💬 Con muốn đề xuất" onPress={() => setProposal(proposal === null ? '' : null)} /></View>
          {proposal !== null && (
            <View style={{ marginTop: 8, gap: 8 }}>
              <TextInput style={[s.input, { minHeight: 60 }]} multiline placeholder="Ví dụ: con muốn thêm giờ chơi thứ Ba" value={proposal} onChangeText={setProposal} />
              <View style={{ alignSelf: 'flex-start' }}>
                <Btn primary label="Gửi bố mẹ" onPress={() => {
                  const t = proposal.trim();
                  if (!t) return;
                  update((st) => { st.proposals.push({ text: t, ngay: todayStr(), tu: 'con' }); });
                  setProposal(null);
                  setNote('Đã gửi đề xuất cho bố mẹ ở màn Lên kế hoạch.');
                }} />
              </View>
            </View>
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
