import fs from 'fs';
import path from 'path';

interface PngDimensions {
  width: number;
  height: number;
}

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function readPngDimensions(relativePath: string): PngDimensions {
  const fullPath = path.resolve(process.cwd(), relativePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Required asset file is missing: ${relativePath} (resolved to ${fullPath})`);
  }

  const buffer = fs.readFileSync(fullPath);
  if (buffer.length < 24) {
    throw new Error(`File is too small to contain a valid PNG header: ${relativePath}`);
  }

  const signature = buffer.subarray(0, 8);
  if (!signature.equals(PNG_SIGNATURE)) {
    throw new Error(`File does not have a valid PNG signature: ${relativePath}`);
  }

  // PNG IHDR chunk stores 4-byte big-endian width at offset 16 and height at offset 20
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);

  return { width, height };
}

describe('Brand assets PNG header validation', () => {
  const squareAssets = [
    { file: 'assets/icon.png', label: 'Main app icon' },
    { file: 'assets/android-icon-foreground.png', label: 'Adaptive foreground icon' },
    { file: 'assets/android-icon-background.png', label: 'Adaptive background icon' },
    { file: 'assets/android-icon-monochrome.png', label: 'Adaptive monochrome icon' },
    { file: 'assets/splash-icon.png', label: 'Splash screen icon' },
    { file: 'assets/splash-icon-dark.png', label: 'Splash screen dark icon' },
  ];

  squareAssets.forEach(({ file, label }) => {
    it(`validates ${label} (${file}) exists and is exactly 1024x1024`, () => {
      const dimensions = readPngDimensions(file);
      expect(dimensions.width).toBe(1024);
      expect(dimensions.height).toBe(1024);
    });
  });

  it('validates web favicon (assets/favicon.png) exists and is exactly 48x48', () => {
    const dimensions = readPngDimensions('assets/favicon.png');
    expect(dimensions.width).toBe(48);
    expect(dimensions.height).toBe(48);
  });

  it('fails with a clear error message if a file is missing', () => {
    expect(() => readPngDimensions('assets/non_existent_asset_12345.png')).toThrow(
      /Required asset file is missing/
    );
  });
});
