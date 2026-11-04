import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';

export const C = {
  bg: '#f6f5f2', card: '#fff', ink: '#1d1d1b', muted: '#6b6a66', line: '#e4e2dc',
  accent: '#2f6fde', accentSoft: '#e8f0fd', red: '#c62828', redSoft: '#fdecea', ok: '#2e7d32',
  xanh: '#2e9d4f', cam: '#ef8a17', do: '#d93025', xam: '#b9b6ae',
};

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[s.card, style]}>{children}</View>;
}
export const H2 = ({ children }: { children: ReactNode }) => <Text style={s.h2}>{children}</Text>;
export const Muted = ({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) => <Text style={[s.muted, style]}>{children}</Text>;

export function Btn({ label, onPress, primary, small, disabled, testID }: { label: string; onPress: () => void; primary?: boolean; small?: boolean; disabled?: boolean; testID?: string }) {
  return (
    <Pressable testID={testID} accessibilityRole="button" disabled={disabled} onPress={onPress}
      style={({ pressed }) => [s.btn, small && s.btnSmall, primary && s.btnPri, (pressed || disabled) && { opacity: 0.6 }]}>
      <Text style={[s.btnText, small && { fontSize: 13 }, primary && { color: '#fff' }]}>{label}</Text>
    </Pressable>
  );
}

export function Chip({ label, on, onPress }: { label: string; on?: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[s.chip, on && s.chipOn]}>
      <Text style={[s.chipText, on && { color: '#fff' }]}>{label}</Text>
    </Pressable>
  );
}

export const Dot = ({ color }: { color: 'xanh' | 'cam' | 'do' | 'xam' }) => <View style={[s.dot, { backgroundColor: C[color] }]} />;

export const Row = ({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) => <View style={[s.row, style]}>{children}</View>;

export const s = StyleSheet.create({
  card: { backgroundColor: C.card, borderWidth: 1, borderColor: C.line, borderRadius: 14, padding: 14, marginBottom: 12 },
  h2: { fontSize: 16, fontWeight: '700', marginBottom: 6, color: C.ink },
  muted: { color: C.muted, fontSize: 13 },
  btn: { borderWidth: 1, borderColor: C.line, backgroundColor: C.card, borderRadius: 10, paddingVertical: 9, paddingHorizontal: 12 },
  btnSmall: { paddingVertical: 5, paddingHorizontal: 9, borderRadius: 8 },
  btnPri: { backgroundColor: C.accent, borderColor: C.accent },
  btnText: { color: C.ink, fontSize: 14, fontWeight: '600' },
  chip: { borderWidth: 1, borderColor: C.line, backgroundColor: C.card, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 12 },
  chipOn: { backgroundColor: C.accent, borderColor: C.accent },
  chipText: { fontSize: 13, color: C.ink },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  input: { borderWidth: 1, borderColor: C.line, backgroundColor: C.bg, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 6, fontSize: 15, color: C.ink },
});
