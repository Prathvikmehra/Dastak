export interface ColorTokens {
  background: string;
  surface: string;
  ink: string;
  muted: string;
  primary: string;
  action: string;
  success: string;
  danger: string;
  border: string;
  card: string;
  surfaceAlt: string;
}

export const lightColors: ColorTokens = {
  background: '#F7F9FC',
  surface: '#FFFFFF',
  ink: '#14233B',
  muted: '#5B6B82',
  primary: '#1E4D8F',
  action: '#E8890C', // Used only for the one main button per screen
  success: '#1F8A5B',
  danger: '#C0392B',
  border: '#E2E8F0',
  card: '#FFFFFF',
  surfaceAlt: '#EEF2F6',
};

export const darkColors: ColorTokens = {
  background: '#0B1320',
  surface: '#152238',
  ink: '#F1F5F9',
  muted: '#94A3B8',
  primary: '#4C7EC4',
  action: '#E8890C', // Keep consistent action highlight
  success: '#2ECC71',
  danger: '#E74C3C',
  border: '#233554',
  card: '#152238',
  surfaceAlt: '#1A2B47',
};
