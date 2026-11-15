import { formatRupees, parseAmount } from './formatters';

describe('Formatters', () => {
  describe('formatRupees (Indian number system)', () => {
    it('formats single digits and tens correctly', () => {
      expect(formatRupees(0)).toBe('₹0');
      expect(formatRupees(5)).toBe('₹5');
      expect(formatRupees(99)).toBe('₹99');
      expect(formatRupees(500)).toBe('₹500');
    });

    it('formats thousands correctly', () => {
      expect(formatRupees(1000)).toBe('₹1,000');
      expect(formatRupees(1999)).toBe('₹1,999');
      expect(formatRupees(9999)).toBe('₹9,999');
    });

    it('formats lakhs correctly (1,00,000 grouping)', () => {
      expect(formatRupees(10000)).toBe('₹10,000');
      expect(formatRupees(100000)).toBe('₹1,00,000');
      expect(formatRupees(550000)).toBe('₹5,50,000');
    });

    it('formats crores correctly (1,00,00,000 grouping)', () => {
      expect(formatRupees(10000000)).toBe('₹1,00,00,000');
      expect(formatRupees(25000000)).toBe('₹2,50,00,000');
    });

    it('handles negative amounts and decimals', () => {
      expect(formatRupees(-500)).toBe('-₹500');
      expect(formatRupees(1000.49)).toBe('₹1,000');
      expect(formatRupees(1000.6)).toBe('₹1,001');
    });

    it('handles invalid inputs gracefully', () => {
      expect(formatRupees(NaN)).toBe('₹0');
      expect(formatRupees(Infinity)).toBe('₹0');
    });
  });

  describe('parseAmount', () => {
    it('parses clean numeric strings', () => {
      expect(parseAmount('1999')).toBe(1999);
      expect(parseAmount('50')).toBe(50);
      expect(parseAmount('0')).toBe(0);
    });

    it('strips rupee symbols, commas, and whitespace', () => {
      expect(parseAmount('₹1,00,000')).toBe(100000);
      expect(parseAmount('  ₹ 4,500 ')).toBe(4500);
      expect(parseAmount('Rs. 25,000')).toBe(25000);
    });

    it('handles decimal values', () => {
      expect(parseAmount('1299.50')).toBe(1299.5);
    });

    it('returns null for empty or non-numeric inputs', () => {
      expect(parseAmount('')).toBeNull();
      expect(parseAmount('   ')).toBeNull();
      expect(parseAmount('₹')).toBeNull();
      expect(parseAmount('abc')).toBeNull();
    });
  });
});
