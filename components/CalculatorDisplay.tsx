import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

type CalculatorDisplayProps = {
  expression: string;
  value: string;
  detail?: string;
  modeBadge?: string;
};

export default function CalculatorDisplay({
  expression,
  value,
  detail,
  modeBadge,
}: CalculatorDisplayProps) {
  const { colors } = useTheme();
  const { width, height } = useWindowDimensions();

  // Dynamic typography that scales with the screen dimensions
  const valueFontSize = Math.min(56, Math.max(36, Math.round(Math.min(width, 500) * 0.125)));
  const expressionFontSize = Math.min(18, Math.max(13, Math.round(Math.min(width, 500) * 0.042)));
  const minCardHeight = Math.min(130, Math.max(90, Math.round(height * 0.15)));

  return (
    <View
      style={[
        styles.card,
        {
          minHeight: minCardHeight,
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.topRow}>
        {modeBadge ? (
          <View style={[styles.badge, { backgroundColor: colors.surfaceRaised }]}>
            <Text style={[styles.badgeText, { color: colors.accent }]}>{modeBadge}</Text>
          </View>
        ) : (
          <View />
        )}
        <Text
          numberOfLines={2}
          style={[styles.expression, { color: colors.muted, fontSize: expressionFontSize }]}
          ellipsizeMode="head"
        >
          {expression || ' '}
        </Text>
      </View>

      <View style={styles.valueContainer}>
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.3}
          style={[styles.value, { color: colors.text, fontSize: valueFontSize }]}
        >
          {value}
        </Text>
      </View>

      <View style={styles.bottomRow}>
        {detail ? <Text style={[styles.detail, { color: colors.muted }]}>{detail}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    marginVertical: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 24,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  expression: {
    flex: 1,
    textAlign: 'right',
    marginLeft: 8,
  },
  valueContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingVertical: 2,
  },
  value: {
    fontWeight: '600',
    letterSpacing: -0.5,
    textAlign: 'right',
  },
  bottomRow: {
    minHeight: 14,
    alignItems: 'flex-end',
  },
  detail: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
});
