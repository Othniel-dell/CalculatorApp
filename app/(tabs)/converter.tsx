import { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/Header';
import { useTheme } from '../../context/ThemeContext';
import {
  ConversionCategory,
  conversionUnits,
  convertUnit,
} from '../../utils/conversions';

const categories: ConversionCategory[] = ['Length', 'Weight', 'Temperature', 'Volume'];

type UnitPickerProps = {
  visible: boolean;
  units: string[];
  selected: string;
  title: string;
  onClose: () => void;
  onSelect: (unit: string) => void;
};

function UnitPicker({ visible, units, selected, title, onClose, onSelect }: UnitPickerProps) {
  const { colors } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{title}</Text>
            <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close unit list">
              <Ionicons name="close" size={24} color={colors.text} />
            </Pressable>
          </View>
          {units.map((unit) => (
            <Pressable
              key={unit}
              onPress={() => {
                onSelect(unit);
                onClose();
              }}
              style={styles.unitOption}
            >
              <Text style={[styles.unitOptionText, { color: colors.text }]}>{unit}</Text>
              {unit === selected ? <Ionicons name="checkmark" size={20} color={colors.accent} /> : null}
            </Pressable>
          ))}
        </View>
      </View>
    </Modal>
  );
}

export default function ConverterScreen() {
  const { colors, isDark } = useTheme();
  const [category, setCategory] = useState<ConversionCategory>('Length');
  const [amount, setAmount] = useState('1');
  const [from, setFrom] = useState('Meters');
  const [to, setTo] = useState('Kilometers');
  const [picker, setPicker] = useState<'from' | 'to' | null>(null);

  const units = conversionUnits[category];
  const result = useMemo(() => {
    const value = Number(amount);
    if (!amount || !Number.isFinite(value)) return '—';
    try {
      return convertUnit(value, category, from, to).toLocaleString(undefined, {
        maximumFractionDigits: 8,
      });
    } catch (error) {
      return error instanceof Error ? error.message : 'Unable to convert these units';
    }
  }, [amount, category, from, to]);

  const selectCategory = (nextCategory: ConversionCategory) => {
    const nextUnits = conversionUnits[nextCategory];
    setCategory(nextCategory);
    setFrom(nextUnits[0]);
    setTo(nextUnits[1]);
  };

  const swapUnits = () => {
    setFrom(to);
    setTo(from);
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        <Header title="Converter" subtitle="UNITS MADE SIMPLE" />
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryList}
          >
            {categories.map((item) => {
              const active = item === category;
              return (
                <Pressable
                  key={item}
                  onPress={() => selectCategory(item)}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: active ? colors.accent : colors.surface,
                      borderColor: active ? colors.accent : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      {
                        color: active
                          ? (isDark ? colors.background : colors.white)
                          : colors.muted,
                      },
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <Text style={[styles.sectionLabel, { color: colors.muted }]}>CONVERT</Text>
          <View
            style={[
              styles.inputCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.unitLabel, { color: colors.muted }]}>{from}</Text>
            <TextInput
              value={amount}
              onChangeText={(text) => setAmount(text.replace(/[^0-9.-]/g, ''))}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor={colors.muted}
              style={[styles.amountInput, { color: colors.text }]}
              accessibilityLabel={`Amount in ${from}`}
            />
            <Pressable
              style={[styles.unitSelector, { backgroundColor: colors.surfaceRaised }]}
              onPress={() => setPicker('from')}
            >
              <Text style={[styles.unitSelectorText, { color: colors.text }]}>{from}</Text>
              <Ionicons name="chevron-down" size={18} color={colors.muted} />
            </Pressable>
          </View>

          <Pressable
            style={[styles.swapButton, { backgroundColor: colors.accent }]}
            onPress={swapUnits}
            accessibilityRole="button"
            accessibilityLabel="Swap units"
          >
            <Ionicons
              name="swap-vertical"
              size={20}
              color={isDark ? colors.background : colors.white}
            />
          </Pressable>

          <View
            style={[
              styles.inputCard,
              {
                backgroundColor: colors.accentDark,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.unitLabel, { color: colors.muted }]}>{to}</Text>
            <Text adjustsFontSizeToFit numberOfLines={1} style={[styles.resultValue, { color: colors.accent }]}>
              {result}
            </Text>
            <Pressable
              style={[styles.unitSelector, { backgroundColor: colors.surfaceRaised }]}
              onPress={() => setPicker('to')}
            >
              <Text style={[styles.unitSelectorText, { color: colors.text }]}>{to}</Text>
              <Ionicons name="chevron-down" size={18} color={colors.muted} />
            </Pressable>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="information-circle-outline" size={18} color={colors.accent} />
            <Text style={[styles.infoText, { color: colors.muted }]}>
              Conversions are calculated instantly as you type.
            </Text>
          </View>
        </ScrollView>
      </View>
      <UnitPicker
        visible={picker !== null}
        title={picker === 'from' ? 'Convert from' : 'Convert to'}
        units={units}
        selected={picker === 'from' ? from : to}
        onClose={() => setPicker(null)}
        onSelect={(unit) => (picker === 'from' ? setFrom(unit) : setTo(unit))}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 18 },
  content: { paddingTop: 14, paddingBottom: 24 },
  categoryList: { paddingBottom: 18, gap: 8 },
  categoryChip: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  categoryText: { fontSize: 13, fontWeight: '600' },
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2 },
  inputCard: {
    marginTop: 8,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  unitLabel: { fontSize: 13, fontWeight: '600' },
  amountInput: {
    marginTop: 10,
    marginBottom: 12,
    fontSize: 32,
    fontWeight: '700',
  },
  resultValue: {
    marginTop: 10,
    marginBottom: 12,
    fontSize: 32,
    fontWeight: '700',
  },
  unitSelector: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 13,
    borderRadius: 14,
  },
  unitSelectorText: { fontSize: 14, fontWeight: '600' },
  swapButton: {
    zIndex: 1,
    alignSelf: 'center',
    width: 38,
    height: 38,
    marginTop: -4,
    marginBottom: 4,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCard: { flexDirection: 'row', alignItems: 'center', marginTop: 18, gap: 8 },
  infoText: { flex: 1, fontSize: 12, lineHeight: 18 },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: '#00000099' },
  modalCard: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 28,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
  },
  modalTitle: { fontSize: 20, fontWeight: '700' },
  unitOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
  },
  unitOptionText: { fontSize: 15 },
});
