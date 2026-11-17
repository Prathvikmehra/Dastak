import fs from 'fs';
import path from 'path';
import ts from 'typescript';
import {
  isValidParts,
  parseLocalDate,
  formatLocalDate,
  toDisplay,
  today,
  addDays,
  daysInMonth,
} from './dates';

describe('dates utilities', () => {
  describe('isValidParts', () => {
    it('validates leap day correctly', () => {
      expect(isValidParts(29, 2, 2024)).toBe(true);
      expect(daysInMonth(2024, 2)).toBe(29);
    });

    it('rejects 31 February', () => {
      expect(isValidParts(31, 2, 2024)).toBe(false);
      expect(isValidParts(31, 2, 2025)).toBe(false);
    });

    it('rejects 29 February in a non-leap year', () => {
      expect(isValidParts(29, 2, 2025)).toBe(false);
      expect(isValidParts(29, 2, 2023)).toBe(false);
      expect(daysInMonth(2025, 2)).toBe(28);
    });

    it('rejects month 13', () => {
      expect(isValidParts(15, 13, 2026)).toBe(false);
      expect(isValidParts(1, 0, 2026)).toBe(false);
    });

    it('validates standard months', () => {
      expect(isValidParts(31, 1, 2026)).toBe(true);
      expect(isValidParts(30, 4, 2026)).toBe(true);
      expect(isValidParts(31, 4, 2026)).toBe(false);
    });
  });

  describe('parseLocalDate and legacy text migration', () => {
    it('parses ISO format YYYY-MM-DD', () => {
      expect(parseLocalDate('2026-10-28')).toBe('2026-10-28');
      expect(parseLocalDate('2026-02-29')).toBeNull(); // non-leap year
      expect(parseLocalDate('2024-02-29')).toBe('2024-02-29'); // leap year
    });

    it('parses DD/MM/YYYY and DD-MM-YYYY', () => {
      expect(parseLocalDate('28/10/2026')).toBe('2026-10-28');
      expect(parseLocalDate('28-10-2026')).toBe('2026-10-28');
      expect(parseLocalDate('05/01/2026')).toBe('2026-01-05');
    });

    it('parses free-text date strings like "28 Oct 2026"', () => {
      expect(parseLocalDate('28 Oct 2026')).toBe('2026-10-28');
      expect(parseLocalDate('1 November 2026')).toBe('2026-11-01');
      expect(parseLocalDate('Oct 28, 2026')).toBe('2026-10-28');
    });

    it('returns null for unparseable legacy free text', () => {
      expect(parseLocalDate('last Tuesday')).toBeNull();
      expect(parseLocalDate('two weeks ago')).toBeNull();
      expect(parseLocalDate('recently')).toBeNull();
      expect(parseLocalDate('')).toBeNull();
      expect(parseLocalDate(null)).toBeNull();
    });
  });

  describe('toDisplay and formatLocalDate', () => {
    it('formats date to readable string without leading zeroes on day', () => {
      expect(toDisplay('2026-10-28')).toBe('28 Oct 2026');
      expect(toDisplay('2026-01-05')).toBe('5 Jan 2026');
      expect(formatLocalDate('2026-10-28')).toBe('2026-10-28');
    });
  });

  describe('today helper', () => {
    it('produces formatted local date from Date object', () => {
      const fixed = new Date(2026, 9, 28); // Month is 0-indexed: 9 = Oct
      expect(today(fixed)).toBe('2026-10-28');
    });
  });

  describe('addDays DST-free local arithmetic', () => {
    it('handles year boundary forwards and backwards', () => {
      expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
      expect(addDays('2026-01-01', -1)).toBe('2025-12-31');
    });

    it('handles month ends and leap years correctly', () => {
      // Leap year 2024
      expect(addDays('2024-02-28', 1)).toBe('2024-02-29');
      expect(addDays('2024-02-29', 1)).toBe('2024-03-01');

      // Non-leap year 2025
      expect(addDays('2025-02-28', 1)).toBe('2025-03-01');

      // Month transitions
      expect(addDays('2026-10-31', 1)).toBe('2026-11-01');
      expect(addDays('2026-10-31', 5)).toBe('2026-11-05');
      expect(addDays('2026-11-01', -1)).toBe('2026-10-31');
    });
  });

  describe('no new Date(string) rule across non-test sources', () => {
    function walk(dir: string): string[] {
      let results: string[] = [];
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (!['node_modules', '.expo', '.git'].includes(entry.name)) {
            results = results.concat(walk(fullPath));
          }
        } else if (
          (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) &&
          !entry.name.endsWith('.test.ts') &&
          !entry.name.endsWith('.test.tsx')
        ) {
          results.push(fullPath);
        }
      }
      return results;
    }

    it('verifies no non-test source file calls new Date(string)', () => {
      const rootDir = path.resolve(__dirname, '../../');
      const files = [...walk(path.join(rootDir, 'app')), ...walk(path.join(rootDir, 'src'))];

      const violations: string[] = [];

      for (const file of files) {
        const content = fs.readFileSync(file, 'utf8');
        const sf = ts.createSourceFile(file, content, ts.ScriptTarget.Latest, true);

        function checkNode(node: ts.Node) {
          if (ts.isNewExpression(node) && node.expression.getText(sf) === 'Date') {
            const args = node.arguments;
            if (args && args.length === 1) {
              const arg = args[0];
              // Flag string literals or expressions known to be strings
              if (
                ts.isStringLiteral(arg) ||
                ts.isNoSubstitutionTemplateLiteral(arg) ||
                ts.isTemplateExpression(arg) ||
                // Flag calls or identifiers passed as date strings
                arg.getText(sf).includes('createdAt') ||
                arg.getText(sf).includes('resolvedAt') ||
                arg.getText(sf).includes('lastRefillDate') ||
                arg.getText(sf).includes('incidentDate')
              ) {
                violations.push(`${path.relative(rootDir, file)}: new Date(${arg.getText(sf)})`);
              }
            }
          }
          ts.forEachChild(node, checkNode);
        }

        checkNode(sf);
      }

      expect(violations).toEqual([]);
    });
  });
});
