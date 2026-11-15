export type TextSize = 'title' | 'subtitle' | 'body' | 'caption';

export interface TypographyToken {
  fontSize: number;
  lineHeight: number;
  fontWeight: '700' | '600' | '400' | '500';
}

export const typography: Record<TextSize, TypographyToken> = {
  title: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
  },
  body: {
    fontSize: 16, // Body text is 16sp or larger as required
    lineHeight: 22,
    fontWeight: '400',
  },
  caption: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
  },
};
