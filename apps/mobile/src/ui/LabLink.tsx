import { Link } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import { LAB_ENABLED } from '@/variant';

/** Đường vào màn đo nhắc giờ; không hiện khi biến thể không bật lab. */
export function LabLink() {
  if (!LAB_ENABLED) return null;
  return (
    <Link href="/lab" style={styles.link}>
      <Text>Đo nhắc giờ (bản nội bộ)</Text>
    </Link>
  );
}

const styles = StyleSheet.create({ link: { color: '#208AEF', marginTop: 16, fontWeight: '600' } });
