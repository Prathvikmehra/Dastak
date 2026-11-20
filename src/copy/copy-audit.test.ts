import fs from 'fs';
import path from 'path';
import ts from 'typescript';

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
      !entry.name.endsWith('.test.tsx') &&
      !fullPath.includes(path.normalize('src/copy'))
    ) {
      results.push(fullPath);
    }
  }
  return results;
}

export interface CopyViolation {
  file: string;
  type: 'jsx-text' | 'alert-string' | 'jsx-prop' | 'navigation-option';
  detail: string;
}

export function findCopyViolationsInSource(content: string, filePath: string): CopyViolation[] {
  const sf = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);
  const violations: CopyViolation[] = [];

  function visit(node: ts.Node) {
    // 1. Literal text between JSX tags
    if (ts.isJsxText(node)) {
      const text = node.getText(sf).trim();
      if (text.length > 0) {
        violations.push({
          file: filePath,
          type: 'jsx-text',
          detail: text,
        });
      }
    }

    // 2. Alert.alert string literals (1st or 2nd argument)
    if (ts.isCallExpression(node)) {
      const expr = node.expression;
      if (
        ts.isPropertyAccessExpression(expr) &&
        expr.expression.getText(sf) === 'Alert' &&
        expr.name.getText(sf) === 'alert'
      ) {
        const args = node.arguments;
        if (args.length > 0 && ts.isStringLiteral(args[0])) {
          violations.push({
            file: filePath,
            type: 'alert-string',
            detail: `Alert title: ${args[0].text}`,
          });
        }
        if (args.length > 1 && ts.isStringLiteral(args[1])) {
          violations.push({
            file: filePath,
            type: 'alert-string',
            detail: `Alert message: ${args[1].text}`,
          });
        }
      }
    }

    // 3. Literal accessibilityLabel, placeholder, title, headerTitle, headerBackTitle, tabBarLabel props on JSX attributes
    if (ts.isJsxAttribute(node)) {
      const propName = node.name.getText(sf);
      if (
        [
          'accessibilityLabel',
          'placeholder',
          'title',
          'headerTitle',
          'headerBackTitle',
          'tabBarLabel',
        ].includes(propName)
      ) {
        if (node.initializer && ts.isStringLiteral(node.initializer)) {
          violations.push({
            file: filePath,
            type: 'jsx-prop',
            detail: `${propName}="${node.initializer.text}"`,
          });
        }
      }

      // 4. Literal title, headerTitle, headerBackTitle, tabBarLabel in options or screenOptions
      if (['options', 'screenOptions'].includes(propName)) {
        if (
          node.initializer &&
          ts.isJsxExpression(node.initializer) &&
          node.initializer.expression
        ) {
          const scanNavOptions = (expr: ts.Node) => {
            if (ts.isObjectLiteralExpression(expr)) {
              for (const prop of expr.properties) {
                if (ts.isPropertyAssignment(prop)) {
                  const name = prop.name.getText(sf).replace(/['"]/g, '');
                  if (['title', 'headerTitle', 'headerBackTitle', 'tabBarLabel'].includes(name)) {
                    if (
                      ts.isStringLiteral(prop.initializer) ||
                      ts.isNoSubstitutionTemplateLiteral(prop.initializer)
                    ) {
                      violations.push({
                        file: filePath,
                        type: 'navigation-option',
                        detail: `${name}: "${(prop.initializer as ts.StringLiteral).text}"`,
                      });
                    }
                  }
                  if (ts.isObjectLiteralExpression(prop.initializer)) {
                    scanNavOptions(prop.initializer);
                  }
                }
              }
            } else if (ts.isArrowFunction(expr) || ts.isFunctionExpression(expr)) {
              if (expr.body) {
                scanNavOptions(expr.body);
              }
            } else if (ts.isParenthesizedExpression(expr)) {
              scanNavOptions(expr.expression);
            } else if (ts.isBlock(expr)) {
              for (const stmt of expr.statements) {
                if (ts.isReturnStatement(stmt) && stmt.expression) {
                  scanNavOptions(stmt.expression);
                }
              }
            }
          };
          scanNavOptions(node.initializer.expression);
        }
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sf);
  return violations;
}

export function findCopyViolations(rootDir: string): CopyViolation[] {
  const files = [...walk(path.join(rootDir, 'app')), ...walk(path.join(rootDir, 'src'))];
  const violations: CopyViolation[] = [];

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const relative = path.relative(rootDir, file);
    violations.push(...findCopyViolationsInSource(content, relative));
  }

  return violations;
}

describe('Copy audit: no hardcoded strings in app/ and src/ components', () => {
  it('ensures zero literal JSX text, zero literal Alert strings, and zero literal props', () => {
    const rootDir = path.resolve(__dirname, '../../');
    const violations = findCopyViolations(rootDir);
    if (violations.length > 0) {
      console.log(`[CopyAudit] Found ${violations.length} violations`);
    }
    expect(violations).toEqual([]);
  });

  it('proves the audit fails on deliberate violations across all checked categories', () => {
    const deliberateBadCode = `
      export default function BadComponent() {
        return (
          <>
            <Stack.Screen options={{ title: 'Hardcoded Title', headerBackTitle: 'Back' }} />
            <Tabs.Screen options={{ tabBarLabel: 'Bad Tab' }} />
            <Stack screenOptions={{ headerTitle: 'Bad Header' }} />
            <Text>Literal text</Text>
            <Button title="Literal Title Prop" />
          </>
        );
      }
      function badAlert() {
        Alert.alert('Hardcoded Alert Title', 'Hardcoded Alert Body');
      }
    `;
    const violations = findCopyViolationsInSource(deliberateBadCode, 'test-dummy.tsx');
    expect(violations.length).toBeGreaterThanOrEqual(6);
    expect(violations).toContainEqual({
      file: 'test-dummy.tsx',
      type: 'navigation-option',
      detail: 'title: "Hardcoded Title"',
    });
    expect(violations).toContainEqual({
      file: 'test-dummy.tsx',
      type: 'navigation-option',
      detail: 'headerBackTitle: "Back"',
    });
    expect(violations).toContainEqual({
      file: 'test-dummy.tsx',
      type: 'navigation-option',
      detail: 'tabBarLabel: "Bad Tab"',
    });
    expect(violations).toContainEqual({
      file: 'test-dummy.tsx',
      type: 'navigation-option',
      detail: 'headerTitle: "Bad Header"',
    });
    expect(violations).toContainEqual({
      file: 'test-dummy.tsx',
      type: 'jsx-text',
      detail: 'Literal text',
    });
    expect(violations).toContainEqual({
      file: 'test-dummy.tsx',
      type: 'alert-string',
      detail: 'Alert title: Hardcoded Alert Title',
    });
  });

  it('ensures banned words (alternative, replace, switch, substitute, cheaper) never appear in user-facing copy', () => {
    const copyDir = path.resolve(__dirname, '../../src/copy');
    const files = walk(copyDir);
    const bannedRegex =
      /\b(alternative|alternatives|replace|replaces|replacing|switch|switches|switching|substitute|substitutes|cheaper)\b/i;

    const violations: { file: string; match: string }[] = [];
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (line.includes('bannedRegex') || line.includes('banned words')) return;
        const match = line.match(bannedRegex);
        if (match) {
          violations.push({ file: `${path.basename(file)}:${idx + 1}`, match: match[0] });
        }
      });
    }

    expect(violations).toEqual([]);
  });
});
