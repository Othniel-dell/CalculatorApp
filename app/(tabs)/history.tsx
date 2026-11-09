import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/Header';
import { useTheme } from '../../context/ThemeContext';
import { clearHistory, deleteHistoryEntry, HistoryEntry, readHistory } from '../../utils/history';

export default function HistoryScreen() {
  const { colors } = useTheme();
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setEntries(await readHistory());
    } catch (loadError) {
      console.error('Unable to load calculator history:', loadError);
      setError(loadError instanceof Error ? loadError.message : 'Unable to load history');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadHistory();
    }, [loadHistory]),
  );

  const handleClearAll = async () => {
    try {
      await clearHistory();
      setEntries([]);
    } catch (clearError: unknown) {
      console.error('Unable to clear calculator history:', clearError);
      setError(clearError instanceof Error ? clearError.message : 'Unable to clear history');
    }
  };

  const confirmClear = () => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm('Clear all calculation history? This will remove all saved calculations.')) {
        void handleClearAll();
      }
    } else {
      Alert.alert('Clear history?', 'This will remove all saved calculations.', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            void handleClearAll();
          },
        },
      ]);
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      const updated = await deleteHistoryEntry(id);
      setEntries(updated);
    } catch (deleteError: unknown) {
      console.error('Unable to delete history entry:', deleteError);
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete item');
    }
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        <Header
          title="History"
          subtitle="YOUR RECENT CALCULATIONS"
          right={entries.length > 0 ? (
            <Pressable
              onPress={confirmClear}
              style={[
                styles.clearButton,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Clear all history"
            >
              <Ionicons name="trash-outline" size={18} color={colors.danger} />
            </Pressable>
          ) : null}
        />
        {error ? <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text> : null}
        {loading ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.muted }]}>Loading calculations…</Text>
          </View>
        ) : entries.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.accentDark }]}>
              <Ionicons name="time-outline" size={30} color={colors.accent} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Nothing here yet</Text>
            <Text style={[styles.emptyText, { color: colors.muted }]}>Your calculations will show up here.</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
            {entries.map((entry) => (
              <View
                key={entry.id}
                style={[
                  styles.entry,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <View style={styles.entryTop}>
                  <Text style={[styles.expression, { color: colors.muted }]}>{entry.expression}</Text>
                  <View style={styles.entryMeta}>
                    <Text style={[styles.date, { color: colors.muted }]}>
                      {new Date(entry.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                    <Pressable
                      onPress={() => void handleDeleteItem(entry.id)}
                      style={[styles.deleteItemButton, { backgroundColor: colors.surfaceRaised }]}
                      accessibilityRole="button"
                      accessibilityLabel="Delete calculation"
                      hitSlop={8}
                    >
                      <Ionicons name="close" size={15} color={colors.muted} />
                    </Pressable>
                  </View>
                </View>
                <Text numberOfLines={1} style={[styles.result, { color: colors.text }]}>= {entry.result}</Text>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 18 },
  list: { paddingTop: 16, paddingBottom: 24 },
  clearButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderWidth: 1,
  },
  entry: {
    marginBottom: 10,
    padding: 15,
    borderRadius: 18,
    borderWidth: 1,
  },
  entryTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  expression: { flex: 1, fontSize: 15 },
  entryMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginLeft: 10 },
  date: { fontSize: 11 },
  deleteItemButton: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  result: { marginTop: 8, fontSize: 24, fontWeight: '600' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 80 },
  emptyIcon: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
  },
  emptyTitle: { marginTop: 16, fontSize: 18, fontWeight: '700' },
  emptyText: { marginTop: 6, fontSize: 13, textAlign: 'center' },
  errorText: { marginTop: 14, fontSize: 13 },
});
