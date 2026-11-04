import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import mau from '@/pal/fixtures/lich-mau.json';
import { blank, usePal, type AppState } from '@/pal/store';
import { ActivitiesCard } from './ActivitiesCard';
import { BudgetCard } from './BudgetCard';
import { Btn, C, Card, H2, Muted, Row } from './kit';

type Mau = Pick<AppState, 'profile' | 'plan' | 'budget' | 'activities'>;
const MAU = mau as unknown as Record<string, Mau>;
const SAMPLES: { label: string; key: string }[] = [
  { label: 'Ví dụ lớp 3 (cân bằng)', key: 'mau-1-lop-3-can-bang' },
  { label: 'Ví dụ lớp 8 (nhiều lỗi)', key: 'mau-2-lop-8-nhieu-loi' },
  { label: 'Ví dụ lớp 5 (có hoạt động)', key: 'mau-3-lop-5-hoat-dong-giai-doan' },
];

export function KeHoachScreen() {
  const { state, update, replace } = usePal();
  const pending = state.proposals.filter((p) => !p.xong);

  const loadSample = (key: string) => {
    const m = JSON.parse(JSON.stringify(MAU[key])) as Mau;
    const next = blank();
    next.profile = m.profile;
    next.plan = m.plan;
    next.budget = m.budget;
    next.activities = m.activities;
    replace(next);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 12 }}>
        <Text style={{ fontSize: 22, fontWeight: '700', marginBottom: 8 }}>Lên kế hoạch</Text>
        <ActivitiesCard />
        <BudgetCard />
        {pending.length > 0 && (
          <Card>
            <H2>💬 Con đề xuất và báo</H2>
            {pending.map((p, i) => (
              <View key={i} style={{ borderTopWidth: i ? 1 : 0, borderTopColor: C.line, paddingVertical: 8 }}>
                <Text>{p.text}</Text>
                <Muted>{p.ngay}</Muted>
                <Row style={{ marginTop: 6 }}>
                  <Btn small label="Để sau" onPress={() => update((d) => { const x = d.proposals.find((q) => q.text === p.text && q.ngay === p.ngay); if (x) x.xong = true; })} />
                </Row>
              </View>
            ))}
          </Card>
        )}
        <Card>
          <H2>💬 Trò chuyện với Pal</H2>
          <Muted>Pal chưa được nối vào app ở bước này (cần máy chủ Supabase và khóa Claude, sẽ làm khi chủ sản phẩm cho phép). Trong lúc đó bạn nạp lịch mẫu để thử các tab Lịch tuần, Của con và quỹ giờ.</Muted>
          <Row style={{ marginTop: 10 }}>
            {SAMPLES.map((x) => <Btn key={x.key} small label={x.label} onPress={() => loadSample(x.key)} />)}
          </Row>
          <Row style={{ marginTop: 8 }}>
            <Btn small label="Xóa hết dữ liệu" onPress={() => replace(blank())} />
          </Row>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
