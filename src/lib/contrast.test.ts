import { contrastRatio } from './contrast';
import { lightColors, darkColors } from '../theme/colors';

describe('WCAG 2.1 Contrast Ratios (at least 4.5:1)', () => {
  const pairs: {
    name: string;
    textKey: keyof typeof lightColors;
    bgKey: keyof typeof lightColors;
  }[] = [
    { name: 'ink on background', textKey: 'ink', bgKey: 'background' },
    { name: 'ink on surface', textKey: 'ink', bgKey: 'surface' },
    { name: 'muted on background', textKey: 'muted', bgKey: 'background' },
    { name: 'muted on surface', textKey: 'muted', bgKey: 'surface' },
    { name: 'onAction on action', textKey: 'onAction', bgKey: 'action' },
    { name: 'primary on surface', textKey: 'primary', bgKey: 'surface' },
    { name: 'success on surface', textKey: 'success', bgKey: 'surface' },
    { name: 'danger on surface', textKey: 'danger', bgKey: 'surface' },
  ];

  describe('Light Theme', () => {
    pairs.forEach(({ name, textKey, bgKey }) => {
      it(`asserts ${name} has >= 4.5:1 contrast`, () => {
        const textColor = lightColors[textKey];
        const bgColor = lightColors[bgKey];
        const ratio = contrastRatio(textColor, bgColor);
        expect(ratio).toBeGreaterThanOrEqual(4.5);
      });
    });
  });

  describe('Dark Theme', () => {
    pairs.forEach(({ name, textKey, bgKey }) => {
      it(`asserts ${name} has >= 4.5:1 contrast`, () => {
        const textColor = darkColors[textKey];
        const bgColor = darkColors[bgKey];
        const ratio = contrastRatio(textColor, bgColor);
        expect(ratio).toBeGreaterThanOrEqual(4.5);
      });
    });
  });
});
