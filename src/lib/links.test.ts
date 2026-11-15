import { openPhone, openWeb } from './links';

describe('Linking Helpers (openPhone, openWeb)', () => {
  describe('openPhone', () => {
    it('returns success: true when opener succeeds', async () => {
      const mockOpener = jest.fn().mockResolvedValue(true);
      const onFail = jest.fn();

      const result = await openPhone('1930', onFail, mockOpener);

      expect(result.success).toBe(true);
      expect(result.url).toBe('tel:1930');
      expect(mockOpener).toHaveBeenCalledWith('tel:1930');
      expect(onFail).not.toHaveBeenCalled();
    });

    it('returns success: false and provides fallback message when opener fails', async () => {
      const mockOpener = jest.fn().mockRejectedValue(new Error('Dialer not available'));
      const onFail = jest.fn();

      const result = await openPhone('1930', onFail, mockOpener);

      expect(result.success).toBe(false);
      expect(result.url).toBe('tel:1930');
      expect(result.fallbackMessage).toContain('1930');
      expect(onFail).toHaveBeenCalledWith(result.fallbackMessage);
    });
  });

  describe('openWeb', () => {
    it('returns success: true when opener succeeds', async () => {
      const mockOpener = jest.fn().mockResolvedValue(true);
      const onFail = jest.fn();

      const result = await openWeb('https://cybercrime.gov.in', onFail, mockOpener);

      expect(result.success).toBe(true);
      expect(result.url).toBe('https://cybercrime.gov.in');
      expect(mockOpener).toHaveBeenCalledWith('https://cybercrime.gov.in');
      expect(onFail).not.toHaveBeenCalled();
    });

    it('returns success: false and provides fallback message when opener fails', async () => {
      const mockOpener = jest.fn().mockRejectedValue(new Error('Browser not available'));
      const onFail = jest.fn();

      const result = await openWeb('https://cybercrime.gov.in', onFail, mockOpener);

      expect(result.success).toBe(false);
      expect(result.url).toBe('https://cybercrime.gov.in');
      expect(result.fallbackMessage).toContain('https://cybercrime.gov.in');
      expect(onFail).toHaveBeenCalledWith(result.fallbackMessage);
    });
  });
});
