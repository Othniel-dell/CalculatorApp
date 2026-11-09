import { Pressable, StyleSheet, Text } from 'react-native';
import { useTheme } from '../context/ThemeContext';

type CalculatorButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'number' | 'operator' | 'action' | 'accent';
  compact?: boolean;
};

export default function CalculatorButton({
  label,
  onPress,
  variant = 'number',
  compact = false,
}: CalculatorButtonProps) {
  const { colors, isDark } = useTheme();

  // Dynamic colors per variant
  const getBackgroundColor = () => {
    switch (variant) {
      case 'accent':
        return colors.accent;
      case 'operator':
        return isDark ? colors.operator : colors.surfaceRaised;
      case 'action':
        return colors.surfaceRaised;
      case 'number':
      default:
        return colors.surface;
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'accent':
        return isDark ? colors.background : colors.white;
      case 'operator':
        return colors.accent;
      case 'action':
        return isDark ? colors.muted : colors.text;
      case 'number':
      default:
        return colors.text;
    }
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        compact ? styles.compactButton : styles.basicButton,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: isDark ? colors.border : '#E5E7EB',
          borderWidth: variant === 'number' ? 1 : 0,
        },
        pressed && styles.pressed,
      ]}
    >
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        style={[
          styles.label,
          compact ? styles.compactLabel : styles.basicLabel,
          { color: getTextColor() },
          variant === 'accent' && styles.accentLabelWeight,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  basicButton: {
    height: 52,
    margin: 3.5,
    borderRadius: 16,
  },
  compactButton: {
    height: 38,
    margin: 2,
    borderRadius: 11,
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.96 }],
  },
  label: {
    fontWeight: '500',
  },
  basicLabel: {
    fontSize: 22,
  },
  compactLabel: {
    fontSize: 14,
  },
  accentLabelWeight: {
    fontWeight: '700',
  },
});
