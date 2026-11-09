export type ConversionCategory = 'Length' | 'Weight' | 'Temperature' | 'Volume';

export const conversionUnits: Record<ConversionCategory, string[]> = {
  Length: ['Meters', 'Kilometers', 'Miles', 'Feet', 'Inches'],
  Weight: ['Kilograms', 'Grams', 'Pounds', 'Ounces'],
  Temperature: ['Celsius', 'Fahrenheit', 'Kelvin'],
  Volume: ['Liters', 'Milliliters', 'Gallons', 'Cups'],
};

const baseFactors: Partial<Record<ConversionCategory, Record<string, number>>> = {
  Length: { Meters: 1, Kilometers: 1000, Miles: 1609.344, Feet: 0.3048, Inches: 0.0254 },
  Weight: { Kilograms: 1, Grams: 0.001, Pounds: 0.45359237, Ounces: 0.028349523125 },
  Volume: { Liters: 1, Milliliters: 0.001, Gallons: 3.785411784, Cups: 0.2365882365 },
};

function toBaseTemperature(value: number, unit: string): number {
  if (unit === 'Fahrenheit') return (value - 32) * (5 / 9);
  if (unit === 'Kelvin') return value - 273.15;
  return value;
}

function fromBaseTemperature(value: number, unit: string): number {
  if (unit === 'Fahrenheit') return (value * 9) / 5 + 32;
  if (unit === 'Kelvin') return value + 273.15;
  return value;
}

export function convertUnit(
  value: number,
  category: ConversionCategory,
  from: string,
  to: string,
): number {
  if (category === 'Temperature') {
    return fromBaseTemperature(toBaseTemperature(value, from), to);
  }

  const factors = baseFactors[category];
  if (!factors || factors[from] === undefined || factors[to] === undefined) {
    throw new Error('Choose valid units for this conversion');
  }
  return (value * factors[from]) / factors[to];
}
