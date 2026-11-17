import fs from 'fs';
import path from 'path';
import { en } from './en';
import { hi } from './hi';
import { gu } from './gu';

const ALLOWED_IDENTICAL_STRINGS = new Set([
  'Dastak',
  'UDGAM',
  '1930',
  '1915',
  '155255',
  '8800001915',
  '.',
  '₹',
  'DD',
  'MM',
  'YYYY',
  '1',
  '30',
  'UDGAM Portal',
  'Bima Bharosa',
  'MF Central / AMFI',
  'IEPF Authority',
  'EPFO Member Portal',
  'Department of Posts',
  'National Consumer Helpline',
  'Cybercrime helpline',
  'Cybercrime portal',
  'RBI complaint portal',
  'IRDAI Bima Bharosa',
  'Insurance Ombudsman',
  'e-Jagriti consumer commission',
  'Money radar',
  'Medicine saver',
  'Jan Aushadhi',
  'Aadhaar',
  'PAN',
  'UPI',
  'ATM',
  'SMS',
]);

function walkAndCompare(
  path: string,
  baseVal: unknown,
  targetVal: unknown,
  targetLang: 'hi' | 'gu',
  violations: string[]
) {
  if (baseVal === undefined || baseVal === null) {
    if (targetVal !== baseVal) {
      violations.push(`[${path}] base is ${baseVal} but ${targetLang} is ${targetVal}`);
    }
    return;
  }

  if (targetVal === undefined || targetVal === null) {
    violations.push(`[${path}] missing in ${targetLang}`);
    return;
  }

  if (typeof baseVal === 'string') {
    if (typeof targetVal !== 'string') {
      violations.push(`[${path}] expected string in ${targetLang}, got ${typeof targetVal}`);
      return;
    }
    if (targetVal.trim().length === 0) {
      violations.push(`[${path}] empty string in ${targetLang}`);
      return;
    }
    if (baseVal === targetVal && !ALLOWED_IDENTICAL_STRINGS.has(baseVal)) {
      violations.push(
        `[${path}] identical between en and ${targetLang}: "${baseVal}" (not on allow-list)`
      );
    }
    return;
  }

  if (typeof baseVal === 'function') {
    if (typeof targetVal !== 'function') {
      violations.push(`[${path}] expected function in ${targetLang}, got ${typeof targetVal}`);
      return;
    }

    // Call functions with test parameters and compare outputs
    try {
      const dummyStringArg = 'TEST_ARG';
      const dummyNumArg2 = 99;

      const baseResult = (baseVal as Function)(dummyStringArg, dummyNumArg2);
      const targetResult = (targetVal as Function)(dummyStringArg, dummyNumArg2);

      if (typeof targetResult !== 'string' || targetResult.trim().length === 0) {
        violations.push(`[${path}] function in ${targetLang} returned empty result`);
      } else if (
        typeof baseResult === 'string' &&
        baseResult === targetResult &&
        !ALLOWED_IDENTICAL_STRINGS.has(baseResult)
      ) {
        violations.push(
          `[${path}] function outputs identical between en and ${targetLang}: "${baseResult}"`
        );
      }
    } catch {
      // Function might expect numbers only
      try {
        const baseResult = (baseVal as Function)(5, 10);
        const targetResult = (targetVal as Function)(5, 10);

        if (typeof targetResult !== 'string' || targetResult.trim().length === 0) {
          violations.push(`[${path}] numeric function in ${targetLang} returned empty result`);
        } else if (
          typeof baseResult === 'string' &&
          baseResult === targetResult &&
          !ALLOWED_IDENTICAL_STRINGS.has(baseResult)
        ) {
          violations.push(
            `[${path}] numeric function outputs identical between en and ${targetLang}: "${baseResult}"`
          );
        }
      } catch (err) {
        violations.push(`[${path}] failed invoking function in ${targetLang}: ${String(err)}`);
      }
    }
    return;
  }

  if (Array.isArray(baseVal)) {
    if (!Array.isArray(targetVal)) {
      violations.push(`[${path}] expected array in ${targetLang}, got ${typeof targetVal}`);
      return;
    }
    if (baseVal.length !== targetVal.length) {
      violations.push(
        `[${path}] array length mismatch: en has ${baseVal.length}, ${targetLang} has ${targetVal.length}`
      );
    }
    for (let i = 0; i < baseVal.length; i++) {
      walkAndCompare(`${path}[${i}]`, baseVal[i], targetVal[i], targetLang, violations);
    }
    return;
  }

  if (typeof baseVal === 'object') {
    if (typeof targetVal !== 'object') {
      violations.push(`[${path}] expected object in ${targetLang}, got ${typeof targetVal}`);
      return;
    }

    const baseKeys = Object.keys(baseVal as Record<string, unknown>);
    const targetKeys = Object.keys(targetVal as Record<string, unknown>);

    for (const key of baseKeys) {
      if (!targetKeys.includes(key)) {
        violations.push(`[${path}.${key}] missing key in ${targetLang}`);
      } else {
        walkAndCompare(
          `${path}.${key}`,
          (baseVal as Record<string, unknown>)[key],
          (targetVal as Record<string, unknown>)[key],
          targetLang,
          violations
        );
      }
    }
  }
}

describe('Language support tests (en, hi, gu)', () => {
  it('asserts every key exists, is non-empty, and distinct in Hindi', () => {
    const violations: string[] = [];
    walkAndCompare('copy', en, hi, 'hi', violations);
    expect(violations).toEqual([]);
  });

  it('asserts every key exists, is non-empty, and distinct in Gujarati', () => {
    const violations: string[] = [];
    walkAndCompare('copy', en, gu, 'gu', violations);
    expect(violations).toEqual([]);
  });

  it('verifies machine translation disclaimer header is present in hi.ts and gu.ts', () => {
    const hiContent = fs.readFileSync(path.join(__dirname, 'hi.ts'), 'utf8');
    const guContent = fs.readFileSync(path.join(__dirname, 'gu.ts'), 'utf8');

    expect(hiContent).toContain('MACHINE-DRAFTED TRANSLATION');
    expect(guContent).toContain('MACHINE-DRAFTED TRANSLATION');
  });
});
