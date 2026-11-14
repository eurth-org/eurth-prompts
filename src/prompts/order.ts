/**
 * How the themes are spread over the year: a visitor who comes back every day should not get
 * the same theme twice running, and should meet every theme within any month.
 */
import { daysInMonth, hasDate, monthName, numberFor, yearOrder } from './calendar';
import { THEMES, themeName, type Prompt } from './model';

/** Each theme turns up at least this often in every month, once the bank is whole. */
export const LEAST_PER_MONTH = 3;

/**
 * What is wrong with the order, in plain sentences; an empty list means nothing is.
 * Neighbouring days are checked in both kinds of year (28 February is followed by 1 March or
 * by the leap day) and round the corner from 31 December to 1 January. A partly written bank
 * is checked wherever two neighbouring days are both there; with `complete`, the spread of
 * themes over the months is checked too.
 */
export function orderProblems(prompts: readonly Prompt[], { complete = false }: { complete?: boolean } = {}): string[] {
  const problems = new Set<string>();
  const byN = new Map(prompts.filter((prompt) => hasDate(prompt.n)).map((prompt) => [prompt.n, prompt]));

  for (const leap of [false, true]) {
    const order = yearOrder({ leap });
    order.forEach((n, index) => {
      const today = byN.get(n);
      const tomorrow = byN.get(order[(index + 1) % order.length]!);
      if (today && tomorrow && today.theme === tomorrow.theme) {
        problems.add(`Prompts ${today.n} and ${tomorrow.n} fall on neighbouring days and are both ${themeName(today.theme)}.`);
      }
    });
  }

  if (complete) {
    for (let month = 1; month <= 12; month += 1) {
      const themes: string[] = [];
      for (let day = 1; day <= daysInMonth(month); day += 1) {
        // The leap day isn't counted: a month has to be balanced in an ordinary year too.
        if (month === 2 && day === 29) continue;
        const prompt = byN.get(numberFor({ month, day }));
        if (prompt) themes.push(prompt.theme);
      }
      for (const theme of THEMES) {
        const times = themes.filter((id) => id === theme.id).length;
        if (times < LEAST_PER_MONTH) problems.add(`${monthName(month)} has ${times} ${theme.name} prompts; every month should have at least ${LEAST_PER_MONTH} of each theme.`);
      }
    }
  }
  return [...problems];
}
