export interface ColorTokens {
  background: string;
  surface: string;
  ink: string;
  muted: string;
  primary: string;
  action: string;
  onAction: string;
  success: string;
  danger: string;
  dangerSurface: string;
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
  onAction: '#14233B', // Dark ink text/icon on action button (6.01:1 contrast)
  success: '#1C8255', // Minimally adjusted from #1F8A5B for WCAG 2.1 AA (4.80:1 on #FFFFFF)
  danger: '#C0392B',
  dangerSurface: '#FDF2F2',
  border: '#E2E8F0',
  card: '#FFFFFF',
  surfaceAlt: '#EEF2F6',
};

export const darkColors: ColorTokens = {
  background: '#0B1320',
  surface: '#152238',
  ink: '#F1F5F9',
  muted: '#94A3B8',
  primary: '#5D8DD1', // Minimally adjusted from #4C7EC4 for WCAG 2.1 AA (4.70:1 on #152238)
  action: '#E8890C', // Restored to #E8890C
  onAction: '#14233B', // Dark ink on action button (6.01:1 contrast)
  success: '#2ECC71',
  danger: '#EC5A4A', // Minimally adjusted from #E74C3C for WCAG 2.1 AA (4.65:1 on #152238)
  dangerSurface: '#3A1A1A',
  border: '#233554',
  card: '#152238',
  surfaceAlt: '#1A2B47',
};
