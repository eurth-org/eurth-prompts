/**
 * Which prompt belongs to which day.
 *
 * Prompts 1 to 365 are the days of an ordinary year: 1 is 1 January, 59 is 28 February, 60 is
 * 1 March, 365 is 31 December. Prompt 366 belongs to 29 February. So a date has the same
 * prompt every year, and the leap day's prompt comes round once in four.
 */
import { BANK_SIZE, type Prompt } from './model';

/** A day of the year, without a year. Months run 1 to 12. */
export interface MonthDay {
  month: number;
  day: number;
}

/** A calendar date. */
export interface YearMonthDay extends MonthDay {
  year: number;
}

/** The prompt that belongs to 29 February. */
export const LEAP_DAY_PROMPT = BANK_SIZE;

/** Where "today" is decided when nothing says otherwise: Eurth's own clock. */
export const DEFAULT_TIME_ZONE = 'Europe/Brussels';

/** Days in each month of an ordinary year. */
const DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const;

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'] as const;

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/** How many days this month has; February counts its leap day. */
export function daysInMonth(month: number): number {
  return month === 2 ? 29 : (DAYS[month - 1] ?? 0);
}

/** Whether this is a day that exists (29 February does). */
export function isMonthDay({ month, day }: MonthDay): boolean {
  return Number.isInteger(month) && Number.isInteger(day) && month >= 1 && month <= 12 && day >= 1 && day <= daysInMonth(month);
}

/** The number of the prompt for this day. */
export function numberFor(date: MonthDay): number {
  if (!isMonthDay(date)) throw new RangeError(`No such day: ${date.day}/${date.month}.`);
  if (date.month === 2 && date.day === 29) return LEAP_DAY_PROMPT;
  let n = date.day;
  for (let month = 1; month < date.month; month += 1) n += DAYS[month - 1]!;
  return n;
}

/** The day this prompt belongs to. */
export function dateFor(n: number): MonthDay {
  if (!Number.isInteger(n) || n < 1 || n > BANK_SIZE) throw new RangeError(`No prompt has the number ${n}.`);
  if (n === LEAP_DAY_PROMPT) return { month: 2, day: 29 };
  let day = n;
  for (let month = 1; month <= 12; month += 1) {
    const length = DAYS[month - 1]!;
    if (day <= length) return { month, day };
    day -= length;
  }
  throw new RangeError(`No prompt has the number ${n}.`);
}

/** Whether a prompt with this number has a day (the easter egg, 404, doesn't). */
export function hasDate(n: number): boolean {
  return Number.isInteger(n) && n >= 1 && n <= BANK_SIZE;
}

/** "December" for 12. */
export function monthName(month: number): string {
  const name = MONTHS[month - 1];
  if (!name) throw new RangeError(`No such month: ${month}.`);
  return name;
}

/** "14 December", or "14 Dec" when short. */
export function formatDate({ month, day }: MonthDay, { short = false }: { short?: boolean } = {}): string {
  const name = monthName(month);
  return `${day} ${short ? name.slice(0, 3) : name}`;
}

/**
 * Every prompt number in the order of the year's days. With the leap day, 366 comes between
 * 59 (28 February) and 60 (1 March); without it, it is left out.
 */
export function yearOrder({ leap = true }: { leap?: boolean } = {}): number[] {
  const order: number[] = [];
  for (let n = 1; n < LEAP_DAY_PROMPT; n += 1) {
    order.push(n);
    if (leap && n === 59) order.push(LEAP_DAY_PROMPT);
  }
  return order;
}

/** A prompt's place in the year with its leap day: 0 for 1 January, 365 for 31 December. */
export function placeInYear(n: number): number {
  if (!hasDate(n)) throw new RangeError(`No prompt has the number ${n}.`);
  if (n === LEAP_DAY_PROMPT) return 59;
  return n <= 59 ? n - 1 : n;
}

/** The prompts in the order of the year's days, the leap day's in its place. */
export function inYearOrder<T extends Prompt>(prompts: readonly T[]): T[] {
  return prompts.filter((prompt) => hasDate(prompt.n)).sort((a, b) => placeInYear(a.n) - placeInYear(b.n));
}

/**
 * Today's date in a time zone. An unknown zone falls back to Europe/Brussels, so a strange
 * device setting never leaves the page without a prompt.
 */
export function todayIn(timeZone: string = DEFAULT_TIME_ZONE, now: Date = new Date()): YearMonthDay {
  let parts: Intl.DateTimeFormatPart[];
  try {
    parts = datePartsIn(timeZone, now);
  } catch {
    parts = datePartsIn(DEFAULT_TIME_ZONE, now);
  }
  const part = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((p) => p.type === type)?.value);
  return { year: part('year'), month: part('month'), day: part('day') };
}

function datePartsIn(timeZone: string, now: Date): Intl.DateTimeFormatPart[] {
  return new Intl.DateTimeFormat('en-GB', { timeZone, calendar: 'gregory', numberingSystem: 'latn', year: 'numeric', month: 'numeric', day: 'numeric' }).formatToParts(now);
}

/** The visitor's own time zone, as their device gives it; Europe/Brussels where it gives none. */
export function deviceTimeZone(): string {
  try {
    return new Intl.DateTimeFormat().resolvedOptions().timeZone || DEFAULT_TIME_ZONE;
  } catch {
    return DEFAULT_TIME_ZONE;
  }
}

/** The number of today's prompt in a time zone. The same for everyone whose day it is. */
export function numberToday(timeZone: string = DEFAULT_TIME_ZONE, now: Date = new Date()): number {
  return numberFor(todayIn(timeZone, now));
}
