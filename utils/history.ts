import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_KEY = '@calculator/history';

export type HistoryEntry = {
  id: string;
  expression: string;
  result: string;
  createdAt: number;
};

function isHistoryEntry(value: unknown): value is HistoryEntry {
  if (typeof value !== 'object' || value === null) return false;
  const entry = value as Record<string, unknown>;
  return typeof entry.id === 'string'
    && typeof entry.expression === 'string'
    && typeof entry.result === 'string'
    && typeof entry.createdAt === 'number';
}

export async function readHistory(): Promise<HistoryEntry[]> {
  const saved = await AsyncStorage.getItem(HISTORY_KEY);
  if (!saved) return [];
  const entries: unknown = JSON.parse(saved);
  if (!Array.isArray(entries) || !entries.every(isHistoryEntry)) {
    throw new Error('Saved calculation history is invalid');
  }
  return entries;
}

export async function addHistoryEntry(expression: string, result: string): Promise<void> {
  const current = await readHistory();
  const createdAt = Date.now();
  const entry: HistoryEntry = {
    id: `${createdAt}-${Math.random().toString(36).slice(2, 8)}`,
    expression,
    result,
    createdAt,
  };
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify([entry, ...current].slice(0, 100)));
}

export async function deleteHistoryEntry(id: string): Promise<HistoryEntry[]> {
  const current = await readHistory();
  const updated = current.filter((entry) => entry.id !== id);
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  return updated;
}

export async function clearHistory(): Promise<void> {
  await AsyncStorage.removeItem(HISTORY_KEY);
}
