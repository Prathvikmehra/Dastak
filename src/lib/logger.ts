/**
 * Tiny safe logger that avoids empty catch blocks while preventing noisy test output.
 */
export const logger = {
  warn: (...args: unknown[]): void => {
    if (process.env.NODE_ENV !== 'test') {
      console.warn(...args);
    }
  },
  error: (...args: unknown[]): void => {
    if (process.env.NODE_ENV !== 'test') {
      console.error(...args);
    }
  },
  info: (...args: unknown[]): void => {
    if (process.env.NODE_ENV !== 'test') {
      console.info(...args);
    }
  },
};
