/**
 * What a prompt is. Everything else in src/prompts/ works on these shapes and takes the
 * prompts it needs as an argument, so nothing here knows about files, pages or the browser.
 */

/** The eight themes, in the order the site shows them. */
export const THEMES = [
  { id: 'politics', name: 'Politics' },
  { id: 'history', name: 'History' },
  { id: 'culture', name: 'Culture' },
  { id: 'economy', name: 'Economy' },
  { id: 'military', name: 'Military' },
  { id: 'geography', name: 'Geography' },
  { id: 'daily-life', name: 'Daily life' },
  { id: 'characters', name: 'Characters' },
] as const;

export type ThemeId = (typeof THEMES)[number]['id'];

/** One prompt: its number (1 to 366, see calendar.ts), its theme and its words. */
export interface Prompt {
  n: number;
  theme: ThemeId;
  text: string;
}

/** A prompt as the bank keeps it: with the review batch it was shown to Stijn in. */
export interface BankEntry extends Prompt {
  batch: number;
}

/** One prompt for every day of a leap year. */
export const BANK_SIZE = 366;

/** A prompt is short enough to be a forum topic's title and to fit the card. */
export const MAX_LENGTH = 200;

/** Shorter than this and it isn't asking anything yet. */
export const MIN_LENGTH = 30;

/**
 * The easter egg. Not one of the 366: it has no date, stays out of the random draw and the
 * sitemap, and lives at /p/404 and on the "page not found" page.
 */
export const LOST_PROVINCE: Prompt = {
  n: 404,
  theme: 'geography',
  text: "Your nation's census office lost a whole province. Where did it go?",
};

export function isThemeId(value: unknown): value is ThemeId {
  return THEMES.some((theme) => theme.id === value);
}

/** "Daily life" for 'daily-life'. */
export function themeName(id: ThemeId): string {
  return THEMES.find((theme) => theme.id === id)!.name;
}

/**
 * Reads the bank from its file. The file is ours, so this isn't cleaning strangers' input:
 * it stops the build with a clear message when an entry is misshapen.
 */
export function readBank(json: unknown): BankEntry[] {
  if (!Array.isArray(json)) throw new TypeError('The prompt bank should be a list.');
  return json.map((entry: unknown, index) => {
    const where = `Entry ${index + 1} of the prompt bank`;
    if (typeof entry !== 'object' || entry === null) throw new TypeError(`${where} isn't an object.`);
    const { n, theme, text, batch } = entry as Record<string, unknown>;
    if (typeof n !== 'number' || !Number.isInteger(n)) throw new TypeError(`${where} has no whole number "n".`);
    if (!isThemeId(theme)) throw new TypeError(`${where} (prompt ${n}) has an unknown theme: ${String(theme)}.`);
    if (typeof text !== 'string') throw new TypeError(`${where} (prompt ${n}) has no text.`);
    if (typeof batch !== 'number' || !Number.isInteger(batch) || batch < 0) throw new TypeError(`${where} (prompt ${n}) has no review batch.`);
    return { n, theme, text, batch };
  });
}

/** The prompts by number, lowest first. */
export function byNumber<T extends Prompt>(prompts: readonly T[]): T[] {
  return [...prompts].sort((a, b) => a.n - b.n);
}

/** The prompt with this number, if the bank has it. */
export function find<T extends Prompt>(prompts: readonly T[], n: number): T | undefined {
  return prompts.find((prompt) => prompt.n === n);
}
