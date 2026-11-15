// Bộ thành phần nhỏ dùng chung. Quy ước: nút và ô nhập cao tối thiểu 48 (IA đặt ngưỡng 44);
// cảnh báo hiện ngay trong màn (Notice), không dùng popup.
import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const COLORS = { primary: '#208AEF', danger: '#C0392B', text: '#1B1B1B', muted: '#555', line: '#C9CED6', bgSoft: '#F3F7FC' };
export const MIN_TOUCH = 48;

export function Screen({ children, big }: { children: ReactNode; big?: boolean }) {
  return (
    <SafeAreaView style={s.root} edges={['bottom', 'left', 'right']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={[s.scroll, big && { gap: 20 }]} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function H1({ children }: { children: ReactNode }) {
  return <Text style={s.h1} accessibilityRole="header">{children}</Text>;
}
export function P({ children, muted, big }: { children: ReactNode; muted?: boolean; big?: boolean }) {
  return <Text style={[s.p, muted && { color: COLORS.muted }, big && { fontSize: 20, lineHeight: 28 }]}>{children}</Text>;
}

export function Btn({
  label,
  onPress,
  kind = 'primary',
  busy,
  disabled,
  big,
}: {
  label: string;
  onPress: () => void;
  kind?: 'primary' | 'secondary' | 'danger';
  busy?: boolean;
  disabled?: boolean;
  big?: boolean;
}) {
  const off = disabled || busy;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!off, busy: !!busy }}
      disabled={off}
      onPress={onPress}
      style={[
        s.btn,
        big && { minHeight: 60 },
        kind === 'primary' && { backgroundColor: COLORS.primary },
        kind === 'danger' && { backgroundColor: COLORS.danger },
        kind === 'secondary' && { backgroundColor: '#fff', borderWidth: 1.5, borderColor: COLORS.primary },
        off && { opacity: 0.55 },
      ]}
    >
      {busy ? (
        <ActivityIndicator color={kind === 'secondary' ? COLORS.primary : '#fff'} />
      ) : (
        <Text style={[s.btnText, kind === 'secondary' && { color: COLORS.primary }, big && { fontSize: 20 }]}>{label}</Text>
      )}
    </Pressable>
  );
}

export function Field({ label, hint, error, ...rest }: TextInputProps & { label: string; hint?: string; error?: string | null }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={s.label}>{label}</Text>
      {hint ? <Text style={s.hint}>{hint}</Text> : null}
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor="#8A919C"
        style={[s.input, error ? { borderColor: COLORS.danger } : null]}
        {...rest}
      />
      {error ? <Text style={s.errorText}>{error}</Text> : null}
    </View>
  );
}

/** Dòng báo ngay trong màn. Lỗi dùng role alert để đọc màn hình đọc ra ngay. */
export function Notice({ kind = 'error', children }: { kind?: 'error' | 'info'; children: ReactNode }) {
  return (
    <View
      accessibilityRole={kind === 'error' ? 'alert' : undefined}
      style={[s.notice, kind === 'error' ? { backgroundColor: '#FDECEA', borderColor: COLORS.danger } : { backgroundColor: COLORS.bgSoft, borderColor: COLORS.primary }]}
    >
      <Text style={{ color: COLORS.text, fontSize: 16, lineHeight: 22 }}>{children}</Text>
    </View>
  );
}

/** Chọn một trong vài mục (nút bấm dạng hàng). */
export function Choice({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[s.choice, selected && { borderColor: COLORS.primary, backgroundColor: COLORS.bgSoft }]}
    >
      <Text style={{ fontSize: 17, color: COLORS.text, fontWeight: selected ? '700' : '400' }}>{label}</Text>
    </Pressable>
  );
}

export function Center({ children }: { children: ReactNode }) {
  return <View style={s.center}>{children}</View>;
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  scroll: { padding: 20, gap: 14, flexGrow: 1 },
  h1: { fontSize: 26, fontWeight: '700', color: COLORS.text },
  p: { fontSize: 17, lineHeight: 24, color: COLORS.text },
  btn: { minHeight: MIN_TOUCH, borderRadius: 12, paddingHorizontal: 18, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  label: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  hint: { fontSize: 14, color: COLORS.muted },
  input: { minHeight: MIN_TOUCH, borderWidth: 1.5, borderColor: COLORS.line, borderRadius: 10, paddingHorizontal: 12, fontSize: 18, color: COLORS.text },
  errorText: { color: COLORS.danger, fontSize: 14 },
  notice: { borderWidth: 1, borderRadius: 10, padding: 12 },
  choice: { minHeight: MIN_TOUCH, borderWidth: 1.5, borderColor: COLORS.line, borderRadius: 10, paddingHorizontal: 14, justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
});
