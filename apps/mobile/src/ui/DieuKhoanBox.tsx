import { ScrollView, Text, View } from 'react-native';

import { DIEU_KHOAN, DIEU_KHOAN_NHAN_DE } from '@/content/dieu-khoan';
import { COLORS } from '@/ui/kit';

// Khung cuộn "Điều khoản sử dụng" (bản nháp), dùng chung cho PA-32 (xem lại) và màn thỏa thuận lúc đăng ký (D-76).
export function DieuKhoanBox() {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontSize: 17, fontWeight: '700', color: COLORS.text }} accessibilityRole="header">
        Điều khoản sử dụng
      </Text>
      <ScrollView
        testID="khung-dieu-khoan"
        accessibilityLabel={DIEU_KHOAN_NHAN_DE}
        nestedScrollEnabled
        style={{ height: 320, borderWidth: 1, borderColor: COLORS.line, borderRadius: 12, backgroundColor: COLORS.bgSoft }}
        contentContainerStyle={{ padding: 14, gap: 12 }}
      >
        <Text style={{ fontSize: 13, fontWeight: '700', color: COLORS.danger }}>BẢN NHÁP, người soạn: AI, chờ luật sư duyệt</Text>
        {DIEU_KHOAN.map((d) => (
          <View key={d.so} style={{ gap: 4 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: COLORS.text }}>
              {d.so}. {d.tieuDe}
            </Text>
            <Text style={{ fontSize: 15, lineHeight: 22, color: COLORS.text }}>{d.noiDung}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
