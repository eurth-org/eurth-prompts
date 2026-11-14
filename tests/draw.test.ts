import { describe, expect, it } from 'vitest';
import { byMonth, byTheme, daysBefore, earlierThisMonth, moreFromTheme, neighbours } from '../src/prompts/archive';
import { PROMPTS } from '../src/prompts/bank';
import { yearOrder } from '../src/prompts/calendar';
import { draw } from '../src/prompts/draw';
import { numberFromPath, promptPath, promptUrl, themeFromSearch, withTheme } from '../src/prompts/link';
import { LOST_PROVINCE, THEMES, type Prompt, type ThemeId } from '../src/prompts/model';

const prompt = (n: number, theme: ThemeId = 'history'): Prompt => ({ n, theme, text: `Prompt ${n}` });
/** A whole year: 366 prompts, the themes in rotation. */
const year: Prompt[] = Array.from({ length: 366 }, (_, i) => prompt(i + 1, THEMES[i % THEMES.length]!.id));
const numbers = (prompts: readonly Prompt[]) => prompts.map((p) => p.n);

describe('another prompt', () => {
  it('draws with the dice it is given', () => {
    const three = [prompt(1), prompt(2), prompt(3)];
    expect(draw(three, { random: () => 0 })?.n).toBe(1);
    expect(draw(three, { random: () => 0.5 })?.n).toBe(2);
    expect(draw(three, { random: () => 0.999 })?.n).toBe(3);
  });

  it('never brings the prompt already on screen', () => {
    const three = [prompt(1), prompt(2), prompt(3)];
    for (const roll of [0, 0.25, 0.5, 0.75, 0.999]) expect(draw(three, { not: 2, random: () => roll })?.n).not.toBe(2);
    expect(draw(three, { not: 1, random: () => 0 })?.n).toBe(2);
  });

  it('keeps to a theme when asked', () => {
    for (const theme of THEMES) {
      for (const roll of [0, 0.3, 0.6, 0.999]) expect(draw(year, { theme: theme.id, random: () => roll })?.theme).toBe(theme.id);
    }
  });

  it('can reach every prompt, and every prompt of a theme', () => {
    const seen = new Set<number>();
    for (let i = 0; i < 366; i += 1) seen.add(draw(year, { random: () => (i + 0.5) / 366 })!.n);
    expect(seen.size).toBe(366);
    const military = year.filter((p) => p.theme === 'military');
    const drawn = new Set(military.map((_, i) => draw(year, { theme: 'military', random: () => (i + 0.5) / military.length })!.n));
    expect(drawn.size).toBe(military.length);
  });

  it('never draws the easter egg', () => {
    const withEgg = [prompt(1), LOST_PROVINCE, prompt(2)];
    for (const roll of [0, 0.4, 0.7, 0.999]) expect(draw(withEgg, { random: () => roll })?.n).not.toBe(404);
    expect(draw([LOST_PROVINCE])).toBeUndefined();
  });

  it('copes with a bank of one, a theme of none, and bad dice', () => {
    expect(draw([prompt(7)], { not: 7 })?.n).toBe(7);
    expect(draw([])).toBeUndefined();
    expect(draw([prompt(1, 'history')], { theme: 'culture' })).toBeUndefined();
    const three = [prompt(1), prompt(2), prompt(3)];
    expect(draw(three, { random: () => 1 })?.n).toBe(3);
    expect(draw(three, { random: () => -1 })?.n).toBe(1);
    expect(draw(three, { random: () => Number.NaN })?.n).toBe(1);
  });

  it('draws from the real bank with the real dice', () => {
    for (let i = 0; i < 50; i += 1) {
      const drawn = draw(PROMPTS, { not: 348 });
      expect(drawn).toBeDefined();
      expect(drawn?.n).not.toBe(348);
    }
  });
});

describe('the archive', () => {
  it('groups by theme, in the site\'s order, each in the order of the year', () => {
    const groups = byTheme(year);
    expect(groups.map((group) => group.id)).toEqual(THEMES.map((theme) => theme.id));
    expect(groups.reduce((sum, group) => sum + group.prompts.length, 0)).toBe(366);
    expect(groups[0]?.name).toBe('Politics');
    // Politics is prompts 1, 9, 17, ... The leap day's prompt, 366, is Geography here, and sits
    // where 29 February does: after 54 (23 February) and before 62 (3 March).
    expect(numbers(groups[0]!.prompts).slice(0, 3)).toEqual([1, 9, 17]);
    const geography = numbers(groups.find((group) => group.id === 'geography')!.prompts);
    expect(geography.slice(geography.indexOf(54), geography.indexOf(54) + 3)).toEqual([54, 366, 62]);
  });

  it('keeps a theme with no prompts yet, empty, and leaves the easter egg out', () => {
    const groups = byTheme([prompt(5, 'culture'), LOST_PROVINCE]);
    expect(groups).toHaveLength(8);
    expect(groups.find((group) => group.id === 'culture')?.prompts).toHaveLength(1);
    expect(groups.find((group) => group.id === 'geography')?.prompts).toEqual([]);
  });

  it('groups by month, February with its leap day last', () => {
    const months = byMonth(year);
    expect(months.map((month) => month.prompts.length)).toEqual([31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]);
    expect(months[1]?.name).toBe('February');
    expect(numbers(months[1]!.prompts).slice(-2)).toEqual([59, 366]);
    expect(numbers(months[11]!.prompts).at(-1)).toBe(365);
  });

  it('finds the days either side of a prompt, round the year and round the leap day', () => {
    expect(numbers(Object.values(neighbours(year, 100)))).toEqual([99, 101]);
    expect(neighbours(year, 1)).toMatchObject({ previous: { n: 365 }, next: { n: 2 } });
    expect(neighbours(year, 365)).toMatchObject({ previous: { n: 364 }, next: { n: 1 } });
    expect(neighbours(year, 59)).toMatchObject({ previous: { n: 58 }, next: { n: 366 } });
    expect(neighbours(year, 366)).toMatchObject({ previous: { n: 59 }, next: { n: 60 } });
    expect(neighbours(year, 60)).toMatchObject({ previous: { n: 366 }, next: { n: 61 } });
  });

  it('walks the whole year by "next" and comes back to where it began', () => {
    const walked: number[] = [];
    let n = 1;
    do {
      walked.push(n);
      n = neighbours(year, n).next!.n;
    } while (n !== 1);
    expect(walked).toEqual(yearOrder());
  });

  it('gives the easter egg, a missing prompt and a lone prompt no neighbours', () => {
    expect(neighbours([...year, LOST_PROVINCE], 404)).toEqual({});
    expect(neighbours([prompt(1), prompt(3)], 2)).toEqual({});
    expect(neighbours([prompt(1)], 1)).toEqual({});
  });

  it('skips days not yet written when looking for neighbours', () => {
    expect(neighbours([prompt(1), prompt(20), prompt(356)], 20)).toMatchObject({ previous: { n: 1 }, next: { n: 356 } });
  });

  it('lists the days before a date, newest first', () => {
    expect(numbers(daysBefore(year, { month: 12, day: 14 }))).toEqual([347, 346, 345, 344]);
    expect(numbers(daysBefore(year, { month: 1, day: 2 }, 3))).toEqual([1, 365, 364]);
  });

  it('counts the leap day before 1 March only in a leap year', () => {
    expect(numbers(daysBefore(year, { year: 2028, month: 3, day: 1 }, 2))).toEqual([366, 59]);
    expect(numbers(daysBefore(year, { year: 2027, month: 3, day: 1 }, 2))).toEqual([59, 58]);
    expect(numbers(daysBefore(year, { year: 2028, month: 2, day: 29 }, 2))).toEqual([59, 58]);
    // 29 February in a year that has none: nothing to show.
    expect(daysBefore(year, { year: 2027, month: 2, day: 29 })).toEqual([]);
  });

  it('stops at a gap in a partly written bank', () => {
    expect(numbers(daysBefore([prompt(345), prompt(347), prompt(348)], { month: 12, day: 15 }))).toEqual([348, 347]);
  });

  it('lists "Earlier this month" back to the 1st and no further', () => {
    expect(numbers(earlierThisMonth(year, { month: 12, day: 14 }))).toEqual([347, 346, 345, 344]);
    expect(numbers(earlierThisMonth(year, { month: 12, day: 3 }))).toEqual([336, 335]);
    expect(earlierThisMonth(year, { month: 12, day: 1 })).toEqual([]);
    expect(numbers(earlierThisMonth(year, { year: 2028, month: 2, day: 29 }, 2))).toEqual([59, 58]);
  });

  it('matches the mock-up: on 14 December, the four days before it', () => {
    const texts = earlierThisMonth(PROMPTS, { year: 2026, month: 12, day: 14 }).map((p) => p.text);
    expect(texts).toEqual([
      'A trade route your nation depends on closes overnight. What do people buy instead?',
      'Name a holiday only your nation celebrates, and the food that goes with it.',
      "Your navy's oldest ship is retired. Who wants to keep it afloat?",
      'A border town speaks a different language from the capital. How did that happen?',
    ]);
  });

  it('offers more from the same theme: the next ones in the year, coming round at the end', () => {
    expect(numbers(moreFromTheme(year, prompt(1, 'politics')))).toEqual([9, 17, 25]);
    // The last Politics prompt of the year is 361; after it the theme starts again.
    expect(numbers(moreFromTheme(year, prompt(361, 'politics')))).toEqual([1, 9, 17]);
    expect(numbers(moreFromTheme(year, prompt(361, 'politics'), 1))).toEqual([1]);
    expect(moreFromTheme([prompt(1, 'politics')], prompt(1, 'politics'))).toEqual([]);
    // The easter egg is Geography: it gets the theme's first prompts.
    expect(numbers(moreFromTheme(year, LOST_PROVINCE))).toEqual([6, 14, 22]);
  });
});

describe('addresses', () => {
  it('gives each prompt a page of its own', () => {
    expect(promptPath(348)).toBe('/p/348/');
    expect(promptUrl(348, 'https://prompt.eurth.org')).toBe('https://prompt.eurth.org/p/348/');
    expect(promptUrl(348, 'https://prompt.eurth.org/')).toBe('https://prompt.eurth.org/p/348/');
  });

  it('reads a prompt\'s number from a path, with or without its closing slash', () => {
    expect(numberFromPath('/p/348/')).toBe(348);
    expect(numberFromPath('/p/348')).toBe(348);
    expect(numberFromPath('/p/1/')).toBe(1);
    expect(numberFromPath('/p/366/')).toBe(366);
    expect(numberFromPath('/p/404/')).toBe(404);
  });

  it('reads nothing from any other path', () => {
    for (const path of ['/', '/archive/', '/p/', '/p/0/', '/p/367/', '/p/999/', '/p/0348/', '/p/34x/', '/p/348/extra/', '/x/p/348/', '/p/-1/', '/p/1e2/']) {
      expect(numberFromPath(path), path).toBeUndefined();
    }
  });

  it('carries the theme in the query string and nowhere else', () => {
    expect(themeFromSearch('?theme=economy')).toBe('economy');
    expect(themeFromSearch('theme=daily-life&x=1')).toBe('daily-life');
    expect(themeFromSearch('?theme=magic')).toBeUndefined();
    expect(themeFromSearch('?theme=')).toBeUndefined();
    expect(themeFromSearch('')).toBeUndefined();
    expect(withTheme('/p/212/', 'economy')).toBe('/p/212/?theme=economy');
    expect(withTheme('/p/212/', undefined)).toBe('/p/212/');
    for (const theme of THEMES) expect(themeFromSearch(withTheme('/', theme.id).slice(1))).toBe(theme.id);
  });
});
