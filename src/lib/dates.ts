export type LocalDate = string; // 'YYYY-MM-DD'

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

const MONTH_NAME_MAP: Record<string, number> = {
  jan: 1,
  january: 1,
  feb: 2,
  february: 2,
  mar: 3,
  march: 3,
  apr: 4,
  april: 4,
  may: 5,
  jun: 6,
  june: 6,
  jul: 7,
  july: 7,
  aug: 8,
  august: 8,
  sep: 9,
  sept: 9,
  september: 9,
  oct: 10,
  october: 10,
  nov: 11,
  november: 11,
  dec: 12,
  december: 12,
};

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function daysInMonth(year: number, month: number): number {
  if (month < 1 || month > 12) return 0;
  if (month === 2) {
    return isLeapYear(year) ? 29 : 28;
  }
  if ([4, 6, 9, 11].includes(month)) {
    return 30;
  }
  return 31;
}

export function isValidParts(day: number, month: number, year: number): boolean {
  if (!Number.isInteger(day) || !Number.isInteger(month) || !Number.isInteger(year)) {
    return false;
  }
  if (year < 1900 || year > 2100) {
    return false;
  }
  if (month < 1 || month > 12) {
    return false;
  }
  const maxDays = daysInMonth(year, month);
  return day >= 1 && day <= maxDays;
}

function padZero(num: number): string {
  return num < 10 ? `0${num}` : `${num}`;
}

export function formatLocalDate(date: LocalDate): string {
  return date;
}

export function isLocalDate(val: unknown): val is LocalDate {
  if (typeof val !== 'string') return false;
  const match = val.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return false;
  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);
  return isValidParts(day, month, year);
}

export function parseLocalDate(str: string | null | undefined): LocalDate | null {
  if (!str || typeof str !== 'string') return null;
  const trimmed = str.trim();
  if (!trimmed) return null;

  // 1. Check YYYY-MM-DD
  const isoMatch = trimmed.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10);
    const day = parseInt(isoMatch[3], 10);
    if (isValidParts(day, month, year)) {
      return `${year}-${padZero(month)}-${padZero(day)}`;
    }
    return null;
  }

  // 2. Check DD-MM-YYYY or DD/MM/YYYY
  const dmyMatch = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10);
    const year = parseInt(dmyMatch[3], 10);
    if (isValidParts(day, month, year)) {
      return `${year}-${padZero(month)}-${padZero(day)}`;
    }
    return null;
  }

  // 3. Check "28 Oct 2026" or "28 October 2026" or "Oct 28, 2026"
  const textMatch = trimmed.match(/^(\d{1,2})\s+([a-zA-Z]+)\s+(\d{4})$/);
  if (textMatch) {
    const day = parseInt(textMatch[1], 10);
    const monthStr = textMatch[2].toLowerCase();
    const year = parseInt(textMatch[3], 10);
    const month = MONTH_NAME_MAP[monthStr];
    if (month && isValidParts(day, month, year)) {
      return `${year}-${padZero(month)}-${padZero(day)}`;
    }
    return null;
  }

  const altTextMatch = trimmed.match(/^([a-zA-Z]+)\s+(\d{1,2}),?\s+(\d{4})$/);
  if (altTextMatch) {
    const monthStr = altTextMatch[1].toLowerCase();
    const day = parseInt(altTextMatch[2], 10);
    const year = parseInt(altTextMatch[3], 10);
    const month = MONTH_NAME_MAP[monthStr];
    if (month && isValidParts(day, month, year)) {
      return `${year}-${padZero(month)}-${padZero(day)}`;
    }
    return null;
  }

  return null;
}

export function toDisplay(date: LocalDate): string {
  if (!date || typeof date !== 'string') return '';
  const parts = date.split('-');
  if (parts.length !== 3) return date;

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);

  if (!isValidParts(day, month, year)) return date;

  const monthName = MONTH_NAMES[month - 1];
  return `${day} ${monthName} ${year}`;
}

export function today(now: Date = new Date()): LocalDate {
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  const d = now.getDate();
  return `${y}-${padZero(m)}-${padZero(d)}`;
}

/**
 * Pure, DST-free local calendar arithmetic adding/subtracting days.
 */
export function addDays(date: LocalDate, days: number): LocalDate {
  const parts = date.split('-');
  let y = parseInt(parts[0], 10);
  let m = parseInt(parts[1], 10);
  let d = parseInt(parts[2], 10);

  if (!isValidParts(d, m, y)) return date;

  let remaining = days;

  if (remaining > 0) {
    while (remaining > 0) {
      const daysInCurrentMonth = daysInMonth(y, m);
      const daysLeftInMonth = daysInCurrentMonth - d;
      if (remaining <= daysLeftInMonth) {
        d += remaining;
        remaining = 0;
      } else {
        remaining -= daysLeftInMonth + 1;
        d = 1;
        m += 1;
        if (m > 12) {
          m = 1;
          y += 1;
        }
      }
    }
  } else if (remaining < 0) {
    let needed = -remaining;
    while (needed > 0) {
      if (d > needed) {
        d -= needed;
        needed = 0;
      } else {
        needed -= d;
        m -= 1;
        if (m < 1) {
          m = 12;
          y -= 1;
        }
        d = daysInMonth(y, m);
      }
    }
  }

  return `${y}-${padZero(m)}-${padZero(d)}`;
}

/**
 * Safe parser for ISO-8601 strings to Date objects without calling new Date(string).
 */
export function parseIsoDate(isoString: string): Date {
  const match = isoString.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?Z?)?$/
  );
  if (!match) {
    return new Date();
  }
  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10) - 1;
  const day = parseInt(match[3], 10);
  const hours = match[4] ? parseInt(match[4], 10) : 0;
  const minutes = match[5] ? parseInt(match[5], 10) : 0;
  const seconds = match[6] ? parseInt(match[6], 10) : 0;
  const ms = match[7] ? parseInt(match[7].padEnd(3, '0').slice(0, 3), 10) : 0;

  return new Date(Date.UTC(year, month, day, hours, minutes, seconds, ms));
}
