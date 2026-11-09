import { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CalculatorButton from './CalculatorButton';
import CalculatorDisplay from './CalculatorDisplay';
import Header from './Header';
import { useTheme } from '../context/ThemeContext';
import { AngleMode, evaluateExpression, formatResult } from '../utils/calculator';
import { addHistoryEntry } from '../utils/history';

type CalculatorScreenProps = {
  scientific?: boolean;
};

const basicRows = [
  ['AC', 'DEL', '%', '÷'],
  ['7', '8', '9', '×'],
  ['4', '5', '6', '−'],
  ['1', '2', '3', '+'],
  ['±', '0', '.', '='],
];

const scientificRows = [
  ['sin', 'cos', 'tan', '√', 'x²'],
  ['ln', 'log', '(', ')', '^'],
  ['π', 'e', '!', 'DEG', 'DEL'],
  ...basicRows,
];

export default function CalculatorScreen({ scientific = false }: CalculatorScreenProps) {
  const { colors } = useTheme();
  const [input, setInput] = useState('');
  const [lastEquation, setLastEquation] = useState('');
  const [angleMode, setAngleMode] = useState<AngleMode>('DEG');

  const preview = useMemo(() => {
    if (!input) return '0';
    try {
      return formatResult(evaluateExpression(input, angleMode));
    } catch {
      return input;
    }
  }, [input, angleMode]);

  const append = (key: string) => {
    if (key === 'DEG') {
      setAngleMode((mode) => mode === 'DEG' ? 'RAD' : 'DEG');
      return;
    }
    setLastEquation('');
    setInput((current) => {
      if (key === 'AC') return '';
      if (key === 'DEL') {
        const functionMatch = current.match(/(sin|cos|tan|sqrt|ln|log)\($/);
        return functionMatch ? current.slice(0, -functionMatch[0].length) : current.slice(0, -1);
      }
      if (key === '±') {
        const number = current.match(/-?\d*\.?\d+$/);
        if (number) {
          const start = number.index ?? 0;
          const value = number[0].startsWith('-') ? number[0].slice(1) : `-${number[0]}`;
          return current.slice(0, start) + value;
        }
        return current ? `${current}-` : '-';
      }
      if (key === '=') return current;

      const operator = ['+', '−', '×', '÷', '^'].includes(key);
      if (operator) {
        if (!current && key !== '−') return current;
        if (/[+−×÷^]$/.test(current)) return current.slice(0, -1) + key;
      }

      if (key === '.') {
        const currentNumber = current.split(/[+−×÷^()]/).pop() ?? '';
        if (currentNumber.includes('.')) return current;
        if (!currentNumber) return `${current}0.`;
      }

      const functionKeys: Record<string, string> = {
        sin: 'sin(', cos: 'cos(', tan: 'tan(', '√': 'sqrt(', ln: 'ln(', log: 'log(',
      };
      if (functionKeys[key]) {
        const prefix = /[\dπe)]$/.test(current) ? '×' : '';
        return `${current}${prefix}${functionKeys[key]}`;
      }
      if (key === 'x²') return `${current}^2`;
      if (key === '(' && /[\dπe)]$/.test(current)) return `${current}×(`;
      if (key === 'π' || key === 'e') {
        const prefix = /[\dπe)]$/.test(current) ? '×' : '';
        return `${current}${prefix}${key}`;
      }
      if (/^\d$/.test(key) && /[πe)]$/.test(current)) return `${current}×${key}`;
      return current + key;
    });
  };

  const calculate = async () => {
    try {
      const result = formatResult(evaluateExpression(input, angleMode));
      const equation = input;
      setInput(result);
      setLastEquation(`${equation} =`);
      try {
        await addHistoryEntry(equation, result);
      } catch (error) {
        console.error('Unable to save calculator history:', error);
        Alert.alert('History unavailable', 'The result was calculated, but it could not be saved to history.');
      }
    } catch (error) {
      Alert.alert('Unable to calculate', error instanceof Error ? error.message : 'Check your expression and try again.');
    }
  };

  const rows = scientific ? scientificRows : basicRows;
  const visibleRows = rows.map((row) => row.map((label) => {
    const variant = label === '='
      ? 'accent'
      : ['+', '−', '×', '÷', '^'].includes(label)
        ? 'operator'
        : ['AC', 'DEL', '%', '±', 'DEG', 'sin', 'cos', 'tan', '√', 'x²', 'ln', 'log', '(', ')', 'π', 'e', '!'].includes(label)
          ? 'action'
          : 'number';
    return { label, variant } as const;
  }));

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.container, scientific && styles.scientificContainer]}>
        <Header
          title={scientific ? 'Scientific' : 'Basic'}
          subtitle="ALL IN ONE"
        />
        <CalculatorDisplay
          expression={lastEquation || input}
          value={preview}
          modeBadge={scientific ? angleMode : undefined}
          detail={scientific ? `${angleMode}  ·  SCIENTIFIC CALCULATOR` : 'BASIC CALCULATOR'}
        />
        <ScrollView
          bounces={false}
          contentContainerStyle={styles.keypad}
          showsVerticalScrollIndicator={false}
        >
          {visibleRows.map((row, rowIndex) => (
            <View key={`row-${rowIndex}`} style={styles.row}>
              {row.map(({ label, variant }) => (
                <CalculatorButton
                  key={label}
                  label={label}
                  variant={variant}
                  compact={scientific}
                  onPress={() => label === '=' ? void calculate() : append(label)}
                />
              ))}
            </View>
          ))}
        </ScrollView>
        <Text style={[styles.footer, { color: colors.muted }]}>Designed for everyday math</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  scientificContainer: {
    paddingHorizontal: 12,
  },
  keypad: {
    paddingTop: 2,
    paddingBottom: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footer: {
    paddingVertical: 4,
    fontSize: 11,
    textAlign: 'center',
  },
});
