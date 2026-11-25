import fs from 'fs';
import path from 'path';
import ts from 'typescript';

export interface CopyViolation {
  file: string;
  type:
    | 'jsx-text'
    | 'alert-string'
    | 'jsx-prop'
    | 'navigation-option'
    | 'template-string'
    | 'string-concat';
  detail: string;
}

export function walk(dir: string): string[] {
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

export function findCopyViolationsInSource(content: string, filePath: string): CopyViolation[] {
  const sf = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);
  const violations: CopyViolation[] = [];
  const englishWordPattern = /[a-zA-Z]+[: ]/;

  function isDevLoggingOrError(node: ts.Node): boolean {
    let curr = node.parent;
    while (curr) {
      if (ts.isCallExpression(curr)) {
        const text = curr.expression.getText(sf);
        if (text.startsWith('console.') || text.startsWith('logger.')) return true;
      }
      if (ts.isNewExpression(curr)) {
        const text = curr.expression.getText(sf);
        if (text.endsWith('Error')) return true;
      }
      curr = curr.parent;
    }
    return false;
  }

  function scanNavOptions(expr: ts.Node) {
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
  }

  function visit(node: ts.Node) {
    if (ts.isJsxText(node)) {
      const text = node.getText(sf).trim();
      if (text.length > 0) {
        violations.push({ file: filePath, type: 'jsx-text', detail: text });
      }
    }

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

      if (['options', 'screenOptions'].includes(propName)) {
        if (
          node.initializer &&
          ts.isJsxExpression(node.initializer) &&
          node.initializer.expression
        ) {
          scanNavOptions(node.initializer.expression);
        }
      }
    }

    if (ts.isTemplateExpression(node) && !isDevLoggingOrError(node)) {
      const literals = [node.head.text, ...node.templateSpans.map((s) => s.literal.text)];
      const hasEnglish = literals.some(
        (lit) => englishWordPattern.test(lit) && !lit.match(/^(tel|https?|mailto):/)
      );
      if (hasEnglish) {
        violations.push({
          file: filePath,
          type: 'template-string',
          detail: node.getText(sf),
        });
      }
    }

    if (
      ts.isBinaryExpression(node) &&
      node.operatorToken.kind === ts.SyntaxKind.PlusToken &&
      !isDevLoggingOrError(node)
    ) {
      const left = node.left;
      const right = node.right;
      let isMatch = false;
      if (
        ts.isStringLiteral(left) &&
        englishWordPattern.test(left.text) &&
        !left.text.match(/^(tel|https?|mailto):/)
      ) {
        isMatch = true;
      }
      if (
        ts.isStringLiteral(right) &&
        englishWordPattern.test(right.text) &&
        !right.text.match(/^(tel|https?|mailto):/)
      ) {
        isMatch = true;
      }
      if (isMatch) {
        violations.push({
          file: filePath,
          type: 'string-concat',
          detail: node.getText(sf),
        });
      }
    }

    ts.forEachChild(node, visit);
  }

  ts.forEachChild(sf, visit);
  return violations;
}
