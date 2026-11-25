import fs from 'fs';
import path from 'path';

function getFilesRecursively(dir: string): string[] {
  let results: string[] = [];
  if (!fs.existsSync(dir)) {
    return results;
  }
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFilesRecursively(fullPath));
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      results.push(fullPath);
    }
  }
  return results;
}

describe('File Length Policy (<= 270 lines)', () => {
  const rootDir = path.resolve(__dirname, '../../');
  const appDir = path.join(rootDir, 'app');
  const srcDir = path.join(rootDir, 'src');

  const allFiles = [...getFilesRecursively(appDir), ...getFilesRecursively(srcDir)];

  it('finds codebase source files to inspect', () => {
    expect(allFiles.length).toBeGreaterThan(10);
  });

  allFiles.forEach((filePath) => {
    const relativePath = path.relative(rootDir, filePath).replace(/\\/g, '/');

    it(`asserts ${relativePath} does not exceed 270 lines`, () => {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n').length;
      expect(lines).toBeLessThanOrEqual(270);
    });
  });
});
