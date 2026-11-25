import fs from 'fs';
import path from 'path';

interface Violation {
  file: string;
  line: number;
  match: string;
}

const HEX_COLOR_REGEX = /#([0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g;

export function findHexViolationsInContent(
  filePath: string,
  content: string,
  allowList: Record<string, string[]> = {}
): Violation[] {
  const violations: Violation[] = [];
  const lines = content.split('\n');
  const normalizedPath = filePath.replace(/\\/g, '/');

  // Check if file has allowlisted colors
  const allowedColorsForFile: string[] = [];
  for (const [pattern, allowed] of Object.entries(allowList)) {
    if (normalizedPath.includes(pattern)) {
      allowedColorsForFile.push(...allowed.map((c) => c.toUpperCase()));
    }
  }

  lines.forEach((lineText, idx) => {
    // Strip single-line comments that might discuss hex values in documentation
    const cleaned = lineText.replace(/\/\/.*$/, '');
    const matches = cleaned.match(HEX_COLOR_REGEX);
    if (matches) {
      for (const m of matches) {
        if (!allowedColorsForFile.includes(m.toUpperCase())) {
          violations.push({
            file: normalizedPath,
            line: idx + 1,
            match: m,
          });
        }
      }
    }
  });

  return violations;
}

describe('Token-only colours audit', () => {
  const rootDir = path.resolve(__dirname, '../../');
  const appDir = path.join(rootDir, 'app');
  const srcDir = path.join(rootDir, 'src');

  const ALLOW_LIST: Record<string, string[]> = {
    // Notification channel LED light colour in notificationsPort.ts is required by Android OS
    'src/lib/notificationsPort.ts': ['#1E4D8F'],
  };

  function getFilesRecursively(dir: string): string[] {
    const results: string[] = [];
    if (!fs.existsSync(dir)) return results;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        results.push(...getFilesRecursively(fullPath));
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

  it('proves the audit fails on a deliberate hex color violation', () => {
    const sampleViolationContent = `
      export const BadComponent = () => {
        return <View style={{ backgroundColor: '#E2E8F0', color: '#123456' }} />;
      };
    `;
    const violations = findHexViolationsInContent('src/components/Bad.tsx', sampleViolationContent);
    expect(violations.length).toBe(2);
    expect(violations[0].match).toBe('#E2E8F0');
    expect(violations[1].match).toBe('#123456');
  });

  it('asserts that no hardcoded #RRGGBB values exist in app/ and src/ outside src/theme', () => {
    const appFiles = getFilesRecursively(appDir);
    const srcFiles = getFilesRecursively(srcDir).filter(
      (f) => !f.replace(/\\/g, '/').includes('src/theme/')
    );

    const allFiles = [...appFiles, ...srcFiles];
    const allViolations: Violation[] = [];

    for (const file of allFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const relativePath = path.relative(rootDir, file).replace(/\\/g, '/');
      const violations = findHexViolationsInContent(relativePath, content, ALLOW_LIST);
      allViolations.push(...violations);
    }

    if (allViolations.length > 0) {
      const failureMsg = allViolations
        .map((v) => `  ${v.file}:${v.line} -> "${v.match}"`)
        .join('\n');
      throw new Error(
        `Found ${allViolations.length} hardcoded colour literal(s) outside src/theme:\n${failureMsg}\n` +
          'All colours must use design tokens from useTheme() or src/theme/colors.'
      );
    }

    expect(allViolations).toEqual([]);
  });
});
