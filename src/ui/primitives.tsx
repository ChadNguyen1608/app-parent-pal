import { ReactNode } from 'react';
import { Pressable, PressableProps, StyleProp, Text, TextProps, TextStyle, View, ViewStyle } from 'react-native';
import { font, Palette, space, type, usePalette } from './theme';

type Variant = keyof typeof type;
type Weight = keyof typeof font;

export function T({
  variant = 'body',
  weight = 'regular',
  soft,
  color,
  style,
  ...rest
}: TextProps & { variant?: Variant; weight?: Weight; soft?: boolean; color?: string }) {
  const c = usePalette();
  return <Text {...rest} style={[type[variant], { fontFamily: font[weight], color: color ?? (soft ? c.inkSoft : c.ink) }, style]} />;
}

/** Nút có viền rõ khi dùng bàn phím, chữ là động từ nói đúng việc nó làm. */
export function Button({
  label,
  onPress,
  kind = 'quiet',
  icon,
  style,
  testID,
  accessibilityLabel,
  disabled,
}: {
  label?: string;
  onPress: () => void;
  kind?: 'primary' | 'quiet' | 'ghost' | 'danger';
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
  disabled?: boolean;
}) {
  const c = usePalette();
  const bg = { primary: c.ink, quiet: c.surface, ghost: 'transparent', danger: 'transparent' }[kind];
  const fg = { primary: c.bg, quiet: c.ink, ghost: c.ink, danger: c.urgent }[kind];
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: space(2),
          minHeight: 40,
          paddingHorizontal: label ? space(4) : space(2.5),
          borderRadius: 999,
          backgroundColor: bg,
          borderWidth: kind === 'quiet' ? 1 : 0,
          borderColor: c.line,
          opacity: disabled ? 0.45 : pressed ? 0.75 : 1,
        },
        style,
      ]}
    >
      {icon}
      {label ? (
        <T weight="medium" color={fg} style={{ fontSize: 14, lineHeight: 20 }}>
          {label}
        </T>
      ) : null}
    </Pressable>
  );
}

export function Row({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center', gap: space(2) }, style]}>{children}</View>;
}

export const hairline = (c: Palette): ViewStyle => ({ borderBottomWidth: 1, borderBottomColor: c.line });

export type { PressableProps, TextStyle };
