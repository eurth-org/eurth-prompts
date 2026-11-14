/**
 * The real bank, as far as it is written. These tests hold every prompt in the file to the
 * rules; whether the bank is complete and approved is launch.test.ts's business.
 */
import { describe, expect, it } from 'vitest';
import { BANK, PROMPTS } from '../src/prompts/bank';
import { APPROVED_BATCHES, launchProblems } from '../src/prompts/launch';
import { dateFor, formatDate } from '../src/prompts/calendar';
import { checkBank, errors } from '../src/prompts/check';
import { BANK_SIZE, LOST_PROVINCE, find, type BankEntry, type ThemeId } from '../src/prompts/model';
import { LEAST_PER_MONTH, orderProblems } from '../src/prompts/order';
import { THEMES } from '../src/prompts/model';

describe('the prompt bank', () => {
  it('has prompts, none of them the easter egg', () => {
    expect(BANK.length).toBeGreaterThan(0);
    expect(BANK.length).toBeLessThanOrEqual(BANK_SIZE);
    expect(find(BANK, LOST_PROVINCE.n)).toBeUndefined();
    expect(BANK.some((entry) => entry.text === LOST_PROVINCE.text)).toBe(false);
  });

  it('breaks none of the rules', () => {
    const found = errors(checkBank(BANK)).map((finding) => `Prompt ${finding.n}: ${finding.message}`);
    expect(found).toEqual([]);
  });

  it('never puts the same theme on neighbouring days', () => {
    expect(orderProblems(BANK)).toEqual([]);
  });

  it('is kept in order of number', () => {
    const numbers = BANK.map((entry) => entry.n);
    expect(numbers).toEqual([...numbers].sort((a, b) => a - b));
  });

  it('gives the site only number, theme and text', () => {
    expect(PROMPTS).toHaveLength(BANK.length);
    for (const prompt of PROMPTS) expect(Object.keys(prompt).sort()).toEqual(['n', 'text', 'theme']);
  });

  it('keeps the mock-up\'s five prompts on the mock-up\'s dates', () => {
    const onDate = (n: number) => `${formatDate(dateFor(n))}: ${find(BANK, n)?.text}`;
    expect(onDate(344)).toBe('10 December: A border town speaks a different language from the capital. How did that happen?');
    expect(onDate(345)).toBe("11 December: Your navy's oldest ship is retired. Who wants to keep it afloat?");
    expect(onDate(346)).toBe('12 December: Name a holiday only your nation celebrates, and the food that goes with it.');
    expect(onDate(347)).toBe('13 December: A trade route your nation depends on closes overnight. What do people buy instead?');
    expect(onDate(348)).toBe("14 December: Your nation's capital moved two centuries ago. Why, and who still resents it?");
  });

  it('has a prompt for launch day and the days after it', () => {
    // The door opens on 22 December (prompt 356); the first weeks must not be empty.
    for (const n of [356, 357, 358, 359, 360, 361, 362, 363, 364, 365, 1, 2, 3]) expect(find(BANK, n), `prompt ${n}`).toBeDefined();
  });

  it('knows every batch in the review record', async () => {
    const review = (await import('../src/content/review.json')).default;
    const known = new Set(review.batches.map((batch) => batch.id));
    for (const entry of BANK) expect(known.has(entry.batch), `batch ${entry.batch} of prompt ${entry.n}`).toBe(true);
    for (const id of review.approved) expect(known.has(id)).toBe(true);
    expect(APPROVED_BATCHES).toEqual(review.approved);
  });
});

describe('the order of the year', () => {
  const prompt = (n: number, theme: ThemeId): BankEntry => ({ n, theme, text: 'x', batch: 0 });

  it('objects to the same theme two days running', () => {
    expect(orderProblems([prompt(10, 'history'), prompt(11, 'history')])).toEqual(['Prompts 10 and 11 fall on neighbouring days and are both History.']);
    expect(orderProblems([prompt(10, 'history'), prompt(11, 'culture'), prompt(12, 'history')])).toEqual([]);
  });

  it('looks round the corner of the year', () => {
    expect(orderProblems([prompt(365, 'economy'), prompt(1, 'economy')])).toHaveLength(1);
  });

  it('looks both ways round the leap day', () => {
    // An ordinary year: 28 February is followed by 1 March.
    expect(orderProblems([prompt(59, 'culture'), prompt(60, 'culture')])).toHaveLength(1);
    // A leap year: the leap day sits between them, and must differ from both.
    expect(orderProblems([prompt(59, 'culture'), prompt(366, 'culture'), prompt(60, 'military')])).toHaveLength(1);
    expect(orderProblems([prompt(59, 'culture'), prompt(366, 'military'), prompt(60, 'military')])).toHaveLength(1);
    expect(orderProblems([prompt(59, 'culture'), prompt(366, 'history'), prompt(60, 'military')])).toEqual([]);
  });

  it('ignores the easter egg', () => {
    expect(orderProblems([prompt(404, 'geography'), prompt(1, 'geography')])).toEqual([]);
  });

  it(`asks for every theme at least ${LEAST_PER_MONTH} times a month once the bank is complete`, () => {
    const full = Array.from({ length: BANK_SIZE }, (_, i) => prompt(i + 1, THEMES[i % THEMES.length]!.id));
    // Round the leap day the simple rotation would repeat a theme; give it one that fits.
    const fixed = full.map((p) => (p.n === 366 ? { ...p, theme: 'characters' as ThemeId } : p));
    expect(orderProblems(fixed, { complete: true })).toEqual([]);
    const noJanuaryPolitics = fixed.map((p) => (p.n <= 31 && p.theme === 'politics' ? { ...p, theme: p.n % 16 === 1 ? ('economy' as ThemeId) : ('geography' as ThemeId) } : p));
    expect(orderProblems(noJanuaryPolitics, { complete: true }).some((problem) => problem.startsWith('January has 0 Politics prompts'))).toBe(true);
  });
});

describe('ready for launch', () => {
  const full: BankEntry[] = Array.from({ length: BANK_SIZE }, (_, i) => ({
    n: i + 1,
    theme: i + 1 === 366 ? 'characters' : THEMES[i % THEMES.length]!.id,
    text: `Your nation founded town${i} beside river${i} under ruler${i} during era${i}. Which guild${i} objected, and what did trade${i} cost?`,
    batch: i < 30 ? 1 : 2,
  }));

  it('is ready when all 366 are written, sound, in order and approved', () => {
    expect(launchProblems(full, [1, 2])).toEqual([]);
  });

  it('is not ready while a batch waits for review', () => {
    expect(launchProblems(full, [1])).toEqual(["Review batch 2 isn't approved yet (336 prompts: 31 to 366)."]);
  });

  it('is not ready while prompts are missing or break a rule', () => {
    const problems = launchProblems(full.slice(0, 300), [1, 2]);
    expect(problems[0]).toBe('The bank has 300 of its 366 prompts.');
    expect(problems.some((problem) => problem.includes('66 of the 366 prompts are missing: 301 to 366'))).toBe(true);
    const spoiled = full.map((entry) => (entry.n === 5 ? { ...entry, text: 'Your nation borders France on every side. How is that going so far?' } : entry));
    expect(launchProblems(spoiled, [1, 2])).toEqual(['Prompt 5: It names "France": prompts are never about a real country.']);
  });

  it('says where the real bank stands', () => {
    const problems = launchProblems(BANK, APPROVED_BATCHES);
    if (BANK.length < BANK_SIZE) expect(problems[0]).toBe(`The bank has ${BANK.length} of its ${BANK_SIZE} prompts.`);
  });
});
