import { Linking, Pressable, StyleSheet, Text } from 'react-native';

import { Placeholder } from '@/ui/Placeholder';

// CA-14, đợt thử (D-43): chỉ lời tĩnh và số 111. Không gửi tin cho ai, không gọi mạng.
// Lời dưới đây là CHỖ GIỮ CHỖ; câu chữ thật lấy từ packages/content (T0.x) sau khi chủ sản phẩm duyệt.
export default function ConCanGiupDo() {
  return (
    <Placeholder title="Con cần giúp đỡ" note="Nếu con đang buồn, sợ hoặc không an toàn, con hãy nói với một người lớn con tin. Con có thể gọi 111, tổng đài bảo vệ trẻ em, miễn phí.">
      <Pressable style={styles.btn} onPress={() => void Linking.openURL('tel:111')}>
        <Text style={styles.btnText}>Gọi 111</Text>
      </Pressable>
    </Placeholder>
  );
}

const styles = StyleSheet.create({
  btn: { backgroundColor: '#C0392B', borderRadius: 12, padding: 14, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
