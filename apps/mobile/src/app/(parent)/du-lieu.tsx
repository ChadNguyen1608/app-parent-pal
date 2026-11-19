import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import { useApp } from '@/state/app';
import { deletionLine } from '@/ui/deletion-status';
import { Btn, H1, Note, P, Screen } from '@/ui/kit';

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ minHeight: 48, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, borderBottomWidth: 1, borderBottomColor: '#E4E6EA' }}>
      <Text style={{ fontSize: 15, flexShrink: 1 }}>{label}</Text>
      <Text style={{ fontSize: 15, color: '#555' }}>{value}</Text>
    </View>
  );
}

// PA-33 Dữ liệu của gia đình. Hàng và ghi chú lấy nguyên từ wireframe. Màn xem, sửa từng loại dữ liệu chưa có
// (thuộc task sau), nên các hàng đó ghi "chưa có ở bản này" (tạm). Cài đặt dữ liệu (công tắc, xóa) dẫn tới màn riêng (D-73).
export default function DuLieu() {
  const router = useRouter();
  const { home } = useApp();
  const kids = home?.children ?? [];
  return (
    <Screen>
      <H1>Dữ liệu của gia đình</H1>
      {kids.map((c) => (
        <View key={c.id}>
          <Row label={`Hồ sơ của ${c.callName}`} value="Chưa có ở bản này" />
          <Row label="Thời khóa biểu và hoạt động" value="Chưa có ở bản này" />
          <Row label={'Nhật ký "Xong"'} value="Chưa có ở bản này" />
          <Row label="Mong muốn con đã gửi" value="Chưa có ở bản này" />
        </View>
      ))}
      <Row label="Cài đặt dữ liệu" value="Mở ›" />
      <Btn label="Mở cài đặt dữ liệu" kind="secondary" onPress={() => router.push('/(parent)/cai-dat-du-lieu')} />
      <Note>Lựa chọn hỏi thăm từng ngày là của con: bố mẹ không xem và không xuất được.</Note>
      <Note>"Xóa" lúc này là ẩn ngay. Thời hạn xóa hẳn chờ ý kiến luật sư; app không hứa "đã xóa hết" khi chưa xóa hẳn.</Note>
      {(home?.openDeletions ?? []).map((d) => (
        <P key={d.id} muted>
          {deletionLine(d, kids.find((c) => c.id === d.childId)?.callName)}
        </P>
      ))}
      <Btn label="Yêu cầu xuất dữ liệu" kind="secondary" onPress={() => router.push('/(parent)/xuat-du-lieu')} />
      <Btn label="Xóa tài khoản và dữ liệu" kind="secondary" onPress={() => router.push('/(parent)/xoa')} />
    </Screen>
  );
}
