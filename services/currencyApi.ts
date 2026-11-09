export type CurrencyRates = {
  base: string;
  rates: Record<string, number>;
  updatedAt: string;
};

type ExchangeRateResponse = {
  result?: string;
  base_code?: string;
  rates?: Record<string, number>;
  time_last_update_utc?: string;
};

export const currencies = [
  // Major International Currencies
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'AED' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'MXN', name: 'Mexican Peso', symbol: 'MX$' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },

  // African Currencies
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: 'GH₵' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
  { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£' },
  { code: 'ETB', name: 'Ethiopian Birr', symbol: 'Br' },
  { code: 'MAD', name: 'Moroccan Dirham', symbol: 'MAD' },
  { code: 'XOF', name: 'West African CFA Franc', symbol: 'CFA' },
  { code: 'XAF', name: 'Central African CFA Franc', symbol: 'FCFA' },
  { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh' },
  { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh' },
  { code: 'RWF', name: 'Rwandan Franc', symbol: 'FRw' },
  { code: 'DZD', name: 'Algerian Dinar', symbol: 'DA' },
  { code: 'TND', name: 'Tunisian Dinar', symbol: 'DT' },
  { code: 'BWP', name: 'Botswana Pula', symbol: 'P' },
  { code: 'NAD', name: 'Namibian Dollar', symbol: 'N$' },
  { code: 'MZN', name: 'Mozambican Metical', symbol: 'MT' },
  { code: 'AOA', name: 'Angolan Kwanza', symbol: 'Kz' },
  { code: 'ZMW', name: 'Zambian Kwacha', symbol: 'ZK' },
  { code: 'MUR', name: 'Mauritian Rupee', symbol: '₨' },
];

export async function fetchLatestRates(base: string): Promise<CurrencyRates> {
  const response = await fetch(`https://open.er-api.com/v6/latest/${encodeURIComponent(base)}`);
  if (!response.ok) {
    throw new Error(`Exchange-rate service returned ${response.status}`);
  }

  const payload = (await response.json()) as ExchangeRateResponse;
  if (payload.result !== 'success' || !payload.rates || !payload.base_code) {
    throw new Error('Exchange-rate service returned invalid data');
  }

  return {
    base: payload.base_code,
    rates: payload.rates,
    updatedAt: payload.time_last_update_utc ?? '',
  };
}
