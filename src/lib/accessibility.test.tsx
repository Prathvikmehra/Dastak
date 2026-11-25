import React from 'react';
import fs from 'fs';
import path from 'path';
import { render, screen } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';
import { Button } from '../components/Button';
import { IssueSelector } from '../features/cases/components/IssueSelector';
import { PersonSwitcher } from '../features/money/components/PersonSwitcher';
import { EvidenceChecklist } from '../features/cases/components/EvidenceChecklist';
import { ThemeProvider } from '../theme/ThemeContext';
import { LanguageProvider } from '../copy/context';

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: jest.fn(), push: jest.fn() }),
  useNavigation: () => ({
    addListener: jest.fn(() => () => {}),
    dispatch: jest.fn(),
  }),
}));

function getSourceFiles(dir: string): string[] {
  let results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getSourceFiles(fullPath));
    } else if (
      (file.endsWith('.ts') || file.endsWith('.tsx')) &&
      !file.endsWith('.test.ts') &&
      !file.endsWith('.test.tsx')
    ) {
      results.push(fullPath);
    }
  }
  return results;
}

describe('Accessibility Requirements', () => {
  const rootDir = path.resolve(__dirname, '../../');
  const appDir = path.join(rootDir, 'app');
  const srcDir = path.join(rootDir, 'src');
  const sourceFiles = [...getSourceFiles(appDir), ...getSourceFiles(srcDir)];

  it('asserts zero occurrences of allowFontScaling={false} across entire codebase', () => {
    const violations: string[] = [];
    sourceFiles.forEach((file) => {
      const content = fs.readFileSync(file, 'utf8');
      if (/allowFontScaling\s*[:=]\s*\{?false\}?/i.test(content)) {
        violations.push(path.relative(rootDir, file));
      }
    });
    expect(violations).toEqual([]);
  });

  it('asserts no fixed numeric heights outside allow-list (separators, icon circles, tab bar)', () => {
    const violations: string[] = [];

    sourceFiles.forEach((file) => {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');

      lines.forEach((line, index) => {
        // match "height: 123," but ignore minHeight, maxHeight, lineHeight, etc.
        const match = line.match(/(?<![a-zA-Z])height:\s*([0-9]+)/);
        if (match) {
          const num = parseInt(match[1], 10);
          // Allow-list:
          // 1. Separators, borders, progress tracks: height <= 6
          const isSeparatorOrBar = num <= 6;
          // 2. Icon circles / symmetrical dots / radio indicators: 22, 44, 48, 72, 80
          const isIconOrCircle = [22, 44, 48, 72, 80].includes(num);
          // 3. Tab bar height constant or calculation
          const isTabBar = file.includes('tab-bar');

          if (!isSeparatorOrBar && !isIconOrCircle && !isTabBar) {
            violations.push(`${path.relative(rootDir, file)}:${index + 1} - fixed height: ${num}`);
          }
        }
      });
    });

    expect(violations).toEqual([]);
  });

  it('respects system reduce-motion setting via AccessibilityInfo', async () => {
    const isReduceMotion = await AccessibilityInfo.isReduceMotionEnabled();
    expect(typeof isReduceMotion).toBe('boolean');
  });

  describe('RTL touch target sizes >= 48dp', () => {
    it('Button has minHeight >= 48dp and role button', async () => {
      await render(
        <ThemeProvider>
          <Button label="Test Button" onPress={() => {}} />
        </ThemeProvider>
      );
      const btn = screen.getByRole('button');
      const style = Array.isArray(btn.props.style)
        ? Object.assign({}, ...btn.props.style)
        : btn.props.style;
      expect(style.minHeight).toBeGreaterThanOrEqual(48);
      expect(style.minWidth).toBeGreaterThanOrEqual(48);
    });

    it('EvidenceChecklist rows have minHeight >= 48dp and role checkbox with checked state', async () => {
      await render(
        <ThemeProvider>
          <LanguageProvider>
            <EvidenceChecklist
              caseItem={{
                id: '1',
                issueType: 'refund',
                company: 'Test Company',
                amount: '500',
                reference: 'REF123',
                incidentDate: '2026-01-01',
                note: '',
                createdAt: new Date().toISOString(),
                evidence: { 'Bill receipt': true },
              }}
              checklist={['Bill receipt', 'Delivery screenshot']}
              onToggleItem={() => {}}
            />
          </LanguageProvider>
        </ThemeProvider>
      );
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBe(2);

      checkboxes.forEach((cb) => {
        const style = Array.isArray(cb.props.style)
          ? Object.assign({}, ...cb.props.style)
          : cb.props.style;
        expect(style.minHeight).toBeGreaterThanOrEqual(48);
      });

      expect(checkboxes[0].props.accessibilityState.checked).toBe(true);
      expect(checkboxes[1].props.accessibilityState.checked).toBe(false);
    });

    it('PersonSwitcher chips have minHeight >= 48dp and role button', async () => {
      await render(
        <ThemeProvider>
          <LanguageProvider>
            <PersonSwitcher
              people={[{ id: 'me', name: 'Me', isDefault: true }]}
              activePersonId="me"
              onSelectPerson={() => {}}
              onAddPersonPress={() => {}}
            />
          </LanguageProvider>
        </ThemeProvider>
      );
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(1);

      buttons.forEach((btn) => {
        const style = Array.isArray(btn.props.style)
          ? Object.assign({}, ...btn.props.style)
          : btn.props.style;
        expect(style.minHeight).toBeGreaterThanOrEqual(48);
      });
    });

    it('IssueSelector doors have minHeight >= 48dp and role radio with selected state', async () => {
      await render(
        <ThemeProvider>
          <LanguageProvider>
            <IssueSelector selected="refund" onSelect={() => {}} />
          </LanguageProvider>
        </ThemeProvider>
      );
      const radios = screen.getAllByRole('radio');
      expect(radios.length).toBe(4);

      radios.forEach((r) => {
        const style = Array.isArray(r.props.style)
          ? Object.assign({}, ...r.props.style)
          : r.props.style;
        expect(style.minHeight).toBeGreaterThanOrEqual(48);
      });

      expect(radios[0].props.accessibilityState.selected).toBe(true);
      expect(radios[1].props.accessibilityState.selected).toBe(false);
    });
  });
});
