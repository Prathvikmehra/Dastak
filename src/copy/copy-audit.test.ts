import fs from 'fs';
import path from 'path';
import { walk, findCopyViolationsInSource, CopyViolation } from './copy-audit-engine';

describe('Copy audit: zero hardcoded user-facing strings', () => {
  const rootDir = path.resolve(__dirname, '../../');
  const appDir = path.join(rootDir, 'app');
  const srcDir = path.join(rootDir, 'src');

  const filesToScan = [...walk(appDir), ...walk(srcDir)];

  it('scans at least 20 source files in app/ and src/', () => {
    expect(filesToScan.length).toBeGreaterThanOrEqual(20);
  });

  it('contains zero violations across all eligible source files', () => {
    const allViolations: CopyViolation[] = [];

    for (const filePath of filesToScan) {
      const content = fs.readFileSync(filePath, 'utf8');
      const violations = findCopyViolationsInSource(content, filePath);
      allViolations.push(...violations);
    }

    if (allViolations.length > 0) {
      const summary = allViolations
        .map(
          (v) => `[${v.type}] ${path.relative(rootDir, v.file)}: ${v.detail.trim().slice(0, 80)}`
        )
        .join('\n');
      expect(summary).toBe('');
    }

    expect(allViolations).toHaveLength(0);
  });

  describe('Negative tests: verify scanner correctly catches violations', () => {
    it('catches JSX literal text', () => {
      const fakeCode = `
        import React from 'react';
        import { View, Text } from 'react-native';
        export const Bad = () => <View><Text>Hardcoded Hello</Text></View>;
      `;
      const violations = findCopyViolationsInSource(fakeCode, 'test-fake.tsx');
      expect(violations).toContainEqual(
        expect.objectContaining({ type: 'jsx-text', detail: 'Hardcoded Hello' })
      );
    });

    it('catches Alert.alert string literals', () => {
      const fakeCode = `
        import { Alert } from 'react-native';
        Alert.alert('Hardcoded Title', 'Hardcoded Message');
      `;
      const violations = findCopyViolationsInSource(fakeCode, 'test-fake.ts');
      expect(violations).toContainEqual(
        expect.objectContaining({
          type: 'alert-string',
          detail: 'Alert title: Hardcoded Title',
        })
      );
      expect(violations).toContainEqual(
        expect.objectContaining({
          type: 'alert-string',
          detail: 'Alert message: Hardcoded Message',
        })
      );
    });

    it('catches JSX placeholder and accessibilityLabel literals', () => {
      const fakeCode = `
        import React from 'react';
        import { TextInput, View } from 'react-native';
        export const Bad = () => (
          <View accessibilityLabel="Tap here">
            <TextInput placeholder="Enter name here" />
          </View>
        );
      `;
      const violations = findCopyViolationsInSource(fakeCode, 'test-fake.tsx');
      expect(violations).toContainEqual(
        expect.objectContaining({
          type: 'jsx-prop',
          detail: 'accessibilityLabel="Tap here"',
        })
      );
      expect(violations).toContainEqual(
        expect.objectContaining({
          type: 'jsx-prop',
          detail: 'placeholder="Enter name here"',
        })
      );
    });

    it('catches navigation option titles', () => {
      const fakeCode = `
        import { Stack } from 'expo-router';
        export default function Layout() {
          return <Stack screenOptions={{ title: 'Hardcoded Title' }} />;
        }
      `;
      const violations = findCopyViolationsInSource(fakeCode, 'test-fake.tsx');
      expect(violations).toContainEqual(
        expect.objectContaining({
          type: 'navigation-option',
          detail: 'title: "Hardcoded Title"',
        })
      );
    });

    it('catches template literals containing English words', () => {
      const fakeCode = `
        const x = 5;
        const msg = \`Action needed: in \${x} days\`;
      `;
      const violations = findCopyViolationsInSource(fakeCode, 'test-fake.ts');
      expect(violations).toContainEqual(expect.objectContaining({ type: 'template-string' }));
    });

    it('catches string concatenation containing English words', () => {
      const fakeCode = `
        const x = 5;
        const msg = 'Action needed: ' + x;
      `;
      const violations = findCopyViolationsInSource(fakeCode, 'test-fake.ts');
      expect(violations).toContainEqual(expect.objectContaining({ type: 'string-concat' }));
    });
  });
});
