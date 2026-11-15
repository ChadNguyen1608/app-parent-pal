import { Link } from 'expo-router';
import { Text } from 'react-native';

// D-43: mở màn lời tĩnh + 111. Không gửi tin cho ai. Vùng bấm >= 44.
export function HelpButton() {
  return (
    <Link href="/(child)/con-can-giup-do" style={{ marginRight: 8, paddingHorizontal: 8, paddingVertical: 12, minHeight: 44 }}>
      <Text style={{ color: '#C0392B', fontWeight: '700' }}>Con cần giúp đỡ</Text>
    </Link>
  );
}
