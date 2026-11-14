import { describe, expect, it } from 'vitest';
import {
  DEFAULT_TIME_ZONE,
  LEAP_DAY_PROMPT,
  dateFor,
  daysInMonth,
  deviceTimeZone,
  formatDate,
  hasDate,
  inYearOrder,
  isLeapYear,
  isMonthDay,
  monthName,
  numberFor,
  numberToday,
  placeInYear,
  todayIn,
  yearOrder,
} from '../src/prompts/calendar';
import type { Prompt } from '../src/prompts/model';

describe('a date to its prompt', () => {
  it('numbers the days of an ordinary year from 1 to 365', () => {
    expect(numberFor({ month: 1, day: 1 })).toBe(1);
    expect(numberFor({ month: 1, day: 31 })).toBe(31);
    expect(numberFor({ month: 2, day: 1 })).toBe(32);
    expect(numberFor({ month: 2, day: 28 })).toBe(59);
    expect(numberFor({ month: 3, day: 1 })).toBe(60);
    expect(numberFor({ month: 12, day: 31 })).toBe(365);
  });

  it('gives 14 December prompt 348, as on the mock-up, and launch day prompt 356', () => {
    expect(numberFor({ month: 12, day: 14 })).toBe(348);
    expect(numberFor({ month: 12, day: 22 })).toBe(356);
  });

  it('gives 29 February the last prompt', () => {
    expect(LEAP_DAY_PROMPT).toBe(366);
    expect(numberFor({ month: 2, day: 29 })).toBe(366);
    expect(dateFor(366)).toEqual({ month: 2, day: 29 });
  });

  it('goes there and back for every day of a leap year', () => {
    const seen = new Set<number>();
    for (let month = 1; month <= 12; month += 1) {
      for (let day = 1; day <= daysInMonth(month); day += 1) {
        const n = numberFor({ month, day });
        expect(dateFor(n)).toEqual({ month, day });
        seen.add(n);
      }
    }
    expect(seen.size).toBe(366);
    expect(Math.min(...seen)).toBe(1);
    expect(Math.max(...seen)).toBe(366);
  });

  it('agrees with the real calendar in an ordinary year', () => {
    // 2027 is not a leap year: the day of the year is the prompt's number.
    for (let dayOfYear = 1; dayOfYear <= 365; dayOfYear += 1) {
      const date = new Date(Date.UTC(2027, 0, dayOfYear));
      expect(numberFor({ month: date.getUTCMonth() + 1, day: date.getUTCDate() })).toBe(dayOfYear);
    }
  });

  it('refuses days and numbers that do not exist', () => {
    expect(() => numberFor({ month: 2, day: 30 })).toThrow(RangeError);
    expect(() => numberFor({ month: 13, day: 1 })).toThrow(RangeError);
    expect(() => numberFor({ month: 4, day: 31 })).toThrow(RangeError);
    expect(() => numberFor({ month: 1, day: 0 })).toThrow(RangeError);
    expect(() => numberFor({ month: 1, day: 1.5 })).toThrow(RangeError);
    expect(() => dateFor(0)).toThrow(RangeError);
    expect(() => dateFor(367)).toThrow(RangeError);
    expect(() => dateFor(404)).toThrow(RangeError);
    expect(isMonthDay({ month: 2, day: 29 })).toBe(true);
    expect(isMonthDay({ month: 2, day: 30 })).toBe(false);
    expect(hasDate(366)).toBe(true);
    expect(hasDate(404)).toBe(false);
  });
});

describe('writing a date', () => {
  it('writes it the British way, long or short', () => {
    expect(formatDate({ month: 12, day: 14 })).toBe('14 December');
    expect(formatDate({ month: 12, day: 14 }, { short: true })).toBe('14 Dec');
    expect(formatDate(dateFor(366))).toBe('29 February');
    expect(monthName(1)).toBe('January');
    expect(() => monthName(0)).toThrow(RangeError);
  });
});

describe('the order of the year', () => {
  it('puts the leap day between 28 February and 1 March', () => {
    const order = yearOrder();
    expect(order).toHaveLength(366);
    expect(order.slice(57, 62)).toEqual([58, 59, 366, 60, 61]);
    expect(order.at(-1)).toBe(365);
    expect(new Set(order).size).toBe(366);
  });

  it('leaves the leap day out of an ordinary year', () => {
    const order = yearOrder({ leap: false });
    expect(order).toHaveLength(365);
    expect(order).not.toContain(366);
    expect(order.slice(58, 60)).toEqual([59, 60]);
  });

  it('gives every prompt a place that matches the order', () => {
    yearOrder().forEach((n, index) => expect(placeInYear(n)).toBe(index));
    expect(() => placeInYear(404)).toThrow(RangeError);
  });

  it('sorts prompts by their day, and drops any without one', () => {
    const prompt = (n: number): Prompt => ({ n, theme: 'history', text: 'x' });
    expect(inYearOrder([prompt(60), prompt(366), prompt(404), prompt(1), prompt(59)]).map((p) => p.n)).toEqual([1, 59, 366, 60]);
  });
});

describe('leap years', () => {
  it('follows the Gregorian rule', () => {
    expect(isLeapYear(2028)).toBe(true);
    expect(isLeapYear(2026)).toBe(false);
    expect(isLeapYear(2000)).toBe(true);
    expect(isLeapYear(2100)).toBe(false);
  });
});

describe('today', () => {
  it('is Europe/Brussels unless told otherwise', () => {
    expect(DEFAULT_TIME_ZONE).toBe('Europe/Brussels');
    // 23:30 UTC on 21 December is 00:30 on the 22nd in Brussels: the door has opened.
    const now = new Date('2026-12-21T23:30:00Z');
    expect(todayIn(undefined, now)).toEqual({ year: 2026, month: 12, day: 22 });
    expect(numberToday(undefined, now)).toBe(356);
  });

  it('changes at midnight in Brussels, in winter and in summer', () => {
    // Winter: Brussels is an hour ahead of UTC.
    expect(todayIn('Europe/Brussels', new Date('2027-01-14T22:59:59Z')).day).toBe(14);
    expect(todayIn('Europe/Brussels', new Date('2027-01-14T23:00:00Z')).day).toBe(15);
    // Summer: two hours ahead.
    expect(todayIn('Europe/Brussels', new Date('2027-07-14T21:59:59Z')).day).toBe(14);
    expect(todayIn('Europe/Brussels', new Date('2027-07-14T22:00:00Z')).day).toBe(15);
  });

  it('keeps the right day through the nights the clocks change', () => {
    // 28 March 2027: clocks go forward at 01:00 UTC. 31 October 2027: back at 01:00 UTC.
    expect(todayIn('Europe/Brussels', new Date('2027-03-27T23:30:00Z'))).toEqual({ year: 2027, month: 3, day: 28 });
    expect(todayIn('Europe/Brussels', new Date('2027-03-28T21:59:00Z'))).toEqual({ year: 2027, month: 3, day: 28 });
    expect(todayIn('Europe/Brussels', new Date('2027-03-28T22:00:00Z'))).toEqual({ year: 2027, month: 3, day: 29 });
    expect(todayIn('Europe/Brussels', new Date('2027-10-30T22:00:00Z'))).toEqual({ year: 2027, month: 10, day: 31 });
    expect(todayIn('Europe/Brussels', new Date('2027-10-31T22:59:00Z'))).toEqual({ year: 2027, month: 10, day: 31 });
    expect(todayIn('Europe/Brussels', new Date('2027-10-31T23:00:00Z'))).toEqual({ year: 2027, month: 11, day: 1 });
  });

  it('follows the visitor either side of the date line', () => {
    const now = new Date('2027-06-15T11:00:00Z');
    expect(todayIn('Pacific/Kiritimati', now)).toEqual({ year: 2027, month: 6, day: 16 });
    expect(todayIn('Pacific/Pago_Pago', now)).toEqual({ year: 2027, month: 6, day: 15 });
    expect(todayIn('Europe/Brussels', now)).toEqual({ year: 2027, month: 6, day: 15 });
    expect(numberToday('Pacific/Kiritimati', now)).toBe(numberToday('Pacific/Pago_Pago', now) + 1);
  });

  it('turns the year over from prompt 365 to prompt 1', () => {
    expect(numberToday('Europe/Brussels', new Date('2026-12-31T22:59:00Z'))).toBe(365);
    expect(numberToday('Europe/Brussels', new Date('2026-12-31T23:00:00Z'))).toBe(1);
  });

  it('gives the leap day its own prompt and every other day the same one as always', () => {
    expect(numberToday('Europe/Brussels', new Date('2028-02-28T12:00:00Z'))).toBe(59);
    expect(numberToday('Europe/Brussels', new Date('2028-02-29T12:00:00Z'))).toBe(366);
    expect(numberToday('Europe/Brussels', new Date('2028-03-01T12:00:00Z'))).toBe(60);
    expect(numberToday('Europe/Brussels', new Date('2027-03-01T12:00:00Z'))).toBe(60);
    expect(numberToday('Europe/Brussels', new Date('2028-12-14T12:00:00Z'))).toBe(348);
  });

  it('falls back to Brussels when the device names a zone that does not exist', () => {
    const now = new Date('2026-12-21T23:30:00Z');
    expect(todayIn('Mars/Olympus_Mons', now)).toEqual(todayIn('Europe/Brussels', now));
    expect(todayIn('', now)).toEqual(todayIn('Europe/Brussels', now));
  });

  it('reads a time zone from the device', () => {
    const zone = deviceTimeZone();
    expect(typeof zone).toBe('string');
    expect(zone.length).toBeGreaterThan(0);
    expect(() => todayIn(zone)).not.toThrow();
  });
});
