import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function Placeholder({ title, note, children }: { title: string; note: string; children?: ReactNode }) {
  return (
    <SafeAreaView style={styles.root} edges={['bottom', 'left', 'right']}>
      <View style={styles.box}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.note}>{note}</Text>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  box: { padding: 20, gap: 10 },
  title: { fontSize: 24, fontWeight: '700' },
  note: { color: '#555' },
});
