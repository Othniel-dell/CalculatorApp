export type ThemeColors = {
  background: string;
  surface: string;
  surfaceRaised: string;
  border: string;
  text: string;
  muted: string;
  accent: string;
  accentDark: string;
  operator: string;
  danger: string;
  white: string;
  displayBg: string;
};

export const darkColors: ThemeColors = {
  background: '#0B0D12',
  surface: '#141821',
  surfaceRaised: '#1C2230',
  border: '#292F3D',
  text: '#F5F7FA',
  muted: '#8D95A5',
  accent: '#A8F06A',
  accentDark: '#1C2A17',
  operator: '#1B2431',
  danger: '#FF7C7C',
  white: '#FFFFFF',
  displayBg: '#121620',
};

export const lightColors: ThemeColors = {
  background: '#F4F5F8',
  surface: '#FFFFFF',
  surfaceRaised: '#E8ECF2',
  border: '#D8DEE9',
  text: '#111827',
  muted: '#6B7280',
  accent: '#15803D',
  accentDark: '#DCFCE7',
  operator: '#E2E8F0',
  danger: '#DC2626',
  white: '#FFFFFF',
  displayBg: '#FFFFFF',
};

// Default backward compatibility
const Colors = darkColors;
export default Colors;
