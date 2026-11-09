import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
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
import { currencies, CurrencyRates, fetchLatestRates } from '../../services/currencyApi';

type CurrencyPickerProps = {
  visible: boolean;
  selected: string;
  onClose: () => void;
  onSelect: (code: string) => void;
};

function CurrencyPicker({ visible, selected, onClose, onSelect }: CurrencyPickerProps) {
  const { colors } = useTheme();
  const [search, setSearch] = useState('');

  const filteredCurrencies = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return currencies;
    return currencies.filter(
      (c) => c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q),
    );
  }, [search]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={() => {
        setSearch('');
        onClose();
      }}
    >
      <View style={styles.modalBackdrop}>
        <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Choose currency</Text>
            <Pressable
              onPress={() => {
                setSearch('');
                onClose();
              }}
              accessibilityRole="button"
              accessibilityLabel="Close currency list"
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </Pressable>
          </View>

          <View style={[styles.searchContainer, { backgroundColor: colors.surfaceRaised }]}>
            <Ionicons name="search" size={17} color={colors.muted} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search code or country (e.g. GHS, Nigeria)…"
              placeholderTextColor={colors.muted}
              style={[styles.searchInput, { color: colors.text }]}
              clearButtonMode="while-editing"
            />
            {search ? (
              <Pressable onPress={() => setSearch('')} hitSlop={8}>
                <Ionicons name="close-circle" size={17} color={colors.muted} />
              </Pressable>
            ) : null}
          </View>

          <ScrollView keyboardShouldPersistTaps="handled">
            {filteredCurrencies.length === 0 ? (
              <View style={styles.noResults}>
                <Text style={[styles.noResultsText, { color: colors.muted }]}>
                  No currencies match &quot;{search}&quot;
                </Text>
              </View>
            ) : (
              filteredCurrencies.map((currency) => (
                <Pressable
                  key={currency.code}
                  onPress={() => {
                    onSelect(currency.code);
                    setSearch('');
                    onClose();
                  }}
                  style={styles.currencyOption}
                >
                  <View style={styles.currencyOptionLeft}>
                    <View style={[styles.currencyOptionBadge, { backgroundColor: colors.surfaceRaised }]}>
                      <Text style={[styles.currencyOptionSymbol, { color: colors.accent }]}>
                        {currency.symbol}
                      </Text>
                    </View>
                    <View style={styles.currencyOptionText}>
                      <Text style={[styles.currencyCode, { color: colors.text }]}>{currency.code}</Text>
                      <Text style={[styles.currencyName, { color: colors.muted }]}>{currency.name}</Text>
                    </View>
                  </View>
                  {selected === currency.code ? (
                    <Ionicons name="checkmark" size={21} color={colors.accent} />
                  ) : null}
                </Pressable>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export default function CurrencyScreen() {
  const { colors, isDark } = useTheme();
  const [amount, setAmount] = useState('1');
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('EUR');
  const [rates, setRates] = useState<CurrencyRates | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [picker, setPicker] = useState<'from' | 'to' | null>(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    fetchLatestRates(from)
      .then((latestRates) => {
        if (active) setRates(latestRates);
      })
      .catch((requestError: unknown) => {
        if (active) {
          setError(requestError instanceof Error ? requestError.message : 'Unable to load exchange rates');
          setRates(null);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [from, retry]);

  const converted = useMemo(() => {
    const value = Number(amount);
    const baseRate = rates?.rates[from];
    const targetRate = rates?.rates[to];
    if (!Number.isFinite(value) || baseRate === undefined || !targetRate) return null;
    return (value / baseRate) * targetRate;
  }, [amount, from, rates, to]);

  const fromCurrency = currencies.find((item) => item.code === from);
  const toCurrency = currencies.find((item) => item.code === to);

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        <Header title="Currency" subtitle="LIVE EXCHANGE RATES" />
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={[styles.sectionLabel, { color: colors.muted }]}>AMOUNT</Text>
          <View
            style={[
              styles.amountCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.currencySymbol, { color: colors.accent }]}>
              {fromCurrency?.symbol ?? from}
            </Text>
            <TextInput
              value={amount}
              onChangeText={(text) => setAmount(text.replace(/[^0-9.]/g, ''))}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={colors.muted}
              style={[styles.amountInput, { color: colors.text }]}
              accessibilityLabel="Amount to convert"
            />
          </View>

          <View
            style={[
              styles.currencyCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.sectionLabel, { color: colors.muted }]}>FROM</Text>
            <Pressable style={styles.currencySelect} onPress={() => setPicker('from')}>
              <View style={[styles.currencyBadge, { backgroundColor: colors.surfaceRaised }]}>
                <Text style={[styles.currencyBadgeText, { color: colors.accent }]}>{from}</Text>
              </View>
              <View style={styles.currencyCopy}>
                <Text style={[styles.currencyName, { color: colors.text }]}>{fromCurrency?.name}</Text>
                <Text style={[styles.currencyCode, { color: colors.muted }]}>{from}</Text>
              </View>
              <Ionicons name="chevron-down" size={20} color={colors.muted} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Swap currencies"
              style={[styles.swapButton, { backgroundColor: colors.accent }]}
              onPress={() => {
                setLoading(true);
                setError('');
                setFrom(to);
                setTo(from);
              }}
            >
              <Ionicons
                name="swap-vertical"
                size={19}
                color={isDark ? colors.background : colors.white}
              />
            </Pressable>
            <Text style={[styles.sectionLabel, { color: colors.muted }]}>TO</Text>
            <Pressable style={styles.currencySelect} onPress={() => setPicker('to')}>
              <View style={[styles.currencyBadge, { backgroundColor: colors.surfaceRaised }]}>
                <Text style={[styles.currencyBadgeText, { color: colors.accent }]}>{to}</Text>
              </View>
              <View style={styles.currencyCopy}>
                <Text style={[styles.currencyName, { color: colors.text }]}>{toCurrency?.name}</Text>
                <Text style={[styles.currencyCode, { color: colors.muted }]}>{to}</Text>
              </View>
              <Ionicons name="chevron-down" size={20} color={colors.muted} />
            </Pressable>
          </View>

          <View
            style={[
              styles.resultCard,
              {
                backgroundColor: colors.accentDark,
                borderColor: colors.border,
              },
            ]}
          >
            {loading ? (
              <ActivityIndicator color={colors.accent} />
            ) : error ? (
              <>
                <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
                <Pressable
                  onPress={() => {
                    setLoading(true);
                    setError('');
                    setRetry((value) => value + 1);
                  }}
                  style={styles.retryButton}
                >
                  <Text style={[styles.retryText, { color: colors.accent }]}>Try again</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text style={[styles.sectionLabel, { color: colors.muted }]}>CONVERTED AMOUNT</Text>
                <Text adjustsFontSizeToFit numberOfLines={1} style={[styles.resultValue, { color: colors.accent }]}>
                  {toCurrency?.symbol ?? to} {converted === null ? '—' : converted.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                </Text>
                <Text style={[styles.rateText, { color: colors.text }]}>
                  1 {from} = {rates?.rates[to]?.toLocaleString(undefined, { maximumFractionDigits: 5 }) ?? '—'} {to}
                </Text>
                {rates?.updatedAt ? (
                  <Text style={[styles.updateText, { color: colors.muted }]}>
                    Updated {rates.updatedAt}
                  </Text>
                ) : null}
              </>
            )}
          </View>
          <Text style={[styles.disclaimer, { color: colors.muted }]}>
            Rates are provided for informational use and may not reflect transaction prices.
          </Text>
        </ScrollView>
      </View>
      <CurrencyPicker
        visible={picker !== null}
        selected={picker === 'from' ? from : to}
        onClose={() => setPicker(null)}
        onSelect={(code) => {
          if (picker === 'from') {
            setLoading(true);
            setError('');
            setFrom(code);
          } else {
            setTo(code);
          }
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 18 },
  content: { paddingTop: 14, paddingBottom: 24 },
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2 },
  amountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 16,
    minHeight: 68,
    borderRadius: 18,
    borderWidth: 1,
  },
  currencySymbol: { fontSize: 22, fontWeight: '700' },
  amountInput: { flex: 1, marginLeft: 12, fontSize: 26, fontWeight: '600' },
  currencyCard: {
    marginTop: 16,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  currencySelect: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  currencyBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currencyBadgeText: { fontSize: 12, fontWeight: '700' },
  currencyCopy: { flex: 1, marginLeft: 12 },
  currencyName: { fontSize: 15, fontWeight: '600' },
  currencyCode: { marginTop: 2, fontSize: 12 },
  swapButton: {
    zIndex: 1,
    alignSelf: 'center',
    width: 36,
    height: 36,
    marginTop: -4,
    marginBottom: 4,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultCard: {
    minHeight: 130,
    marginTop: 16,
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
  },
  resultValue: { marginTop: 10, fontSize: 32, fontWeight: '700' },
  rateText: { marginTop: 8, fontSize: 13 },
  updateText: { marginTop: 6, fontSize: 11 },
  errorText: { fontSize: 14, textAlign: 'center' },
  retryButton: { alignSelf: 'center', marginTop: 12, paddingVertical: 8, paddingHorizontal: 16 },
  retryText: { fontWeight: '700' },
  disclaimer: { marginTop: 14, fontSize: 11, lineHeight: 16, textAlign: 'center' },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: '#00000099' },
  modalCard: {
    maxHeight: '75%',
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
  },
  noResults: {
    paddingVertical: 28,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 14,
  },
  currencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
  },
  currencyOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  currencyOptionBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currencyOptionSymbol: {
    fontSize: 12,
    fontWeight: '700',
  },
  currencyOptionText: {
    marginLeft: 12,
    flex: 1,
  },
});
