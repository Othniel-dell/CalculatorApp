import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

type HeaderProps = {
  title: string;
  subtitle: string;
  right?: ReactNode;
  hideThemeToggle?: boolean;
};

export default function Header({ title, subtitle, right, hideThemeToggle = false }: HeaderProps) {
  const { colors, isDark, toggleTheme } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.copy}>
        <Text style={[styles.subtitle, { color: colors.muted }]}>{subtitle}</Text>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      </View>
      <View style={styles.actions}>
        {right}
        {!hideThemeToggle && (
          <Pressable
            onPress={toggleTheme}
            style={[
              styles.themeToggle,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            accessibilityRole="button"
            accessibilityLabel={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <Ionicons
              name={isDark ? 'sunny-outline' : 'moon-outline'}
              size={18}
              color={isDark ? '#FBBF24' : '#4B5563'}
            />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  copy: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  themeToggle: {
    width: 38,
    height: 38,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: {
    marginTop: 2,
    fontSize: 24,
    fontWeight: '700',
  },
});
