/**
 * The bank laid out for reading: by theme, by month, a prompt's neighbours, and the days
 * before today. All of it works on a partly written bank, skipping days that have no prompt yet.
 */
import { dateFor, hasDate, inYearOrder, isLeapYear, monthName, numberFor, placeInYear, yearOrder, type MonthDay } from './calendar';
import { THEMES, type Prompt, type ThemeId } from './model';

export interface ThemeGroup<T extends Prompt> {
  id: ThemeId;
  name: string;
  /** In the order of the year's days. */
  prompts: T[];
}

export interface MonthGroup<T extends Prompt> {
  month: number;
  name: string;
  /** In the order of the month's days; February ends with the leap day's prompt. */
  prompts: T[];
}

/** The eight themes in the site's order, each with its prompts in the order of the year. */
export function byTheme<T extends Prompt>(prompts: readonly T[]): ThemeGroup<T>[] {
  const ordered = inYearOrder(prompts);
  return THEMES.map((theme) => ({ id: theme.id, name: theme.name, prompts: ordered.filter((prompt) => prompt.theme === theme.id) }));
}

/** The twelve months, each with its prompts in the order of its days. */
export function byMonth<T extends Prompt>(prompts: readonly T[]): MonthGroup<T>[] {
  const ordered = inYearOrder(prompts);
  return Array.from({ length: 12 }, (_, index) => {
    const month = index + 1;
    return { month, name: monthName(month), prompts: ordered.filter((prompt) => dateFor(prompt.n).month === month) };
  });
}

/**
 * The prompts of the days before and after this one, for "previous" and "next" on a prompt's
 * page. The year is a circle (31 December is followed by 1 January) and has its leap day.
 * A prompt without a day (the easter egg) has no neighbours.
 */
export function neighbours<T extends Prompt>(prompts: readonly T[], n: number): { previous?: T; next?: T } {
  if (!hasDate(n)) return {};
  const ordered = inYearOrder(prompts);
  const index = ordered.findIndex((prompt) => prompt.n === n);
  if (index === -1 || ordered.length < 2) return {};
  return {
    previous: ordered[(index - 1 + ordered.length) % ordered.length]!,
    next: ordered[(index + 1) % ordered.length]!,
  };
}

/**
 * The prompts of the days just before a date, newest first: yesterday's, the day before's,
 * and so on, back across the start of the month and of the year. Give the year and the leap
 * day is only counted when that year has one.
 */
export function daysBefore<T extends Prompt>(prompts: readonly T[], date: MonthDay & { year?: number }, count = 4): T[] {
  const leap = date.year === undefined ? true : isLeapYear(date.year);
  const order = yearOrder({ leap });
  const today = order.indexOf(numberFor(date));
  if (today === -1) return [];
  const byN = new Map(prompts.map((prompt) => [prompt.n, prompt]));
  const found: T[] = [];
  for (let back = 1; back < order.length && found.length < count; back += 1) {
    const prompt = byN.get(order[(today - back + order.length) % order.length]!);
    if (prompt) found.push(prompt);
    else break; // A gap in a partly written bank: stop rather than skip to some far-off day.
  }
  return found;
}

/** "Earlier this month": the days before a date, newest first, as far back as the 1st. */
export function earlierThisMonth<T extends Prompt>(prompts: readonly T[], date: MonthDay & { year?: number }, count = 4): T[] {
  return daysBefore(prompts, date, Math.min(count, date.day - 1)).filter((prompt) => dateFor(prompt.n).month === date.month);
}

/** More prompts from the same theme: the next ones in the year after this prompt, coming round again at the end. */
export function moreFromTheme<T extends Prompt>(prompts: readonly T[], prompt: Prompt, count = 3): T[] {
  const sameTheme = inYearOrder(prompts).filter((other) => other.theme === prompt.theme);
  const others = sameTheme.filter((other) => other.n !== prompt.n);
  if (!hasDate(prompt.n)) return others.slice(0, count);
  const index = sameTheme.findIndex((other) => other.n === prompt.n);
  const after = index === -1 ? others : [...sameTheme.slice(index + 1), ...sameTheme.slice(0, index)];
  return after.slice(0, count);
}

/**
 * The prompt for a day, or, while the bank is still being written and that day has none, the
 * next day's that has. Undefined only for an empty bank. Once all 366 are in, this is simply
 * the day's own prompt.
 */
export function onOrAfter<T extends Prompt>(prompts: readonly T[], date: MonthDay): T | undefined {
  const ordered = inYearOrder(prompts);
  const place = placeInYear(numberFor(date));
  return ordered.find((prompt) => placeInYear(prompt.n) >= place) ?? ordered[0];
}
