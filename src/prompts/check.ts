/**
 * The bank's rules, as a check that returns what it found. The tests run it on the real bank,
 * so a prompt that breaks a rule can't be committed quietly.
 *
 * An "error" breaks a rule. A "note" is something for the reviewer to look at: it may be fine.
 */
import { BANK_SIZE, MAX_LENGTH, MIN_LENGTH, THEMES, isThemeId, type Prompt } from './model';
import { AMERICAN, REAL_PLACES, SMALL_WORDS, UNREAL, Z_IS_FINE } from './words';

export interface Finding {
  /** The prompt's number, or null for a finding about the bank as a whole. */
  n: number | null;
  level: 'error' | 'note';
  /** A short name for the rule, stable enough to test against. */
  rule: string;
  message: string;
}

const escapeForRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** A pattern for any of these words standing alone (not inside a longer word). */
function wholeWords(words: readonly string[], flags: string): RegExp {
  const longestFirst = [...words].sort((a, b) => b.length - a.length).map(escapeForRegExp);
  return new RegExp(`(?<![\\p{L}\\p{N}])(?:${longestFirst.join('|')})(?![\\p{L}\\p{N}])`, `${flags}u`);
}

const realPlaces = wholeWords(REAL_PLACES, 'g');
const unreal = wholeWords(UNREAL, 'gi');
const american = wholeWords(AMERICAN, 'gi');
const izeWord = /\b\p{L}+iz(?:e|es|ed|ing|ation|ations)\b/giu;
const zIsFine = new Set(Z_IS_FINE);
const smallWords = new Set(SMALL_WORDS);

/** Letters, digits and the plainest punctuation: what survives a forum title and a link. */
const plainCharacters = /^[\p{L}\p{N} .,?!:;'()%&/-]+$/u;

/** The sentences of a text, each with its closing mark. Text after the last mark is returned too. */
export function sentences(text: string): string[] {
  return (text.match(/[^.?!]+[.?!]+|[^.?!]+$/g) ?? []).map((sentence) => sentence.trim()).filter(Boolean);
}

/** A prompt's words, lower case, without punctuation. */
export function words(text: string): string[] {
  return text.toLowerCase().match(/[\p{L}\p{N}]+(?:'[\p{L}]+)?/gu) ?? [];
}

/** The words that carry what a prompt asks. */
function tellingWords(text: string): Set<string> {
  return new Set(words(text).filter((word) => !smallWords.has(word)));
}

/** The words in a text that are spelt the American way ("color", "organize"). Used for the prompts and the guide. */
export function americanSpellings(text: string): string[] {
  const withZ = (text.match(izeWord) ?? []).filter((word) => !zIsFine.has(word.toLowerCase()));
  return [...(text.match(american) ?? []), ...withZ];
}

/** How alike two sets of words are: 0 (nothing shared) to 1 (the same words). */
function alike(a: Set<string>, b: Set<string>): number {
  let shared = 0;
  for (const word of a) if (b.has(word)) shared += 1;
  const all = a.size + b.size - shared;
  return all === 0 ? 0 : shared / all;
}

/** Two prompts with more than this share of their telling words in common ask the same thing. */
export const TOO_ALIKE = 0.6;

/** Prompts may not open with the same run of this many words. */
export const OPENING_WORDS = 5;

/** Checks one prompt on its own. */
export function checkPrompt(prompt: Prompt): Finding[] {
  const found: Finding[] = [];
  const { n, text } = prompt;
  const error = (rule: string, message: string) => found.push({ n, level: 'error', rule, message });
  const note = (rule: string, message: string) => found.push({ n, level: 'note', rule, message });

  if (!Number.isInteger(n) || n < 1 || n > BANK_SIZE) error('number', `Its number should be 1 to ${BANK_SIZE}, not ${n}.`);
  if (!isThemeId(prompt.theme)) error('theme', `"${String(prompt.theme)}" isn't one of the eight themes.`);

  if (text !== text.trim() || /\s{2,}|[\n\t]/.test(text)) error('spaces', 'It has stray spaces: at an end, doubled, or a line break.');
  if (text.length > MAX_LENGTH) error('length', `It is ${text.length} characters long; ${MAX_LENGTH} is the most.`);
  if (text.length < MIN_LENGTH) error('length', `It is ${text.length} characters long; that is too short to ask anything.`);
  if (!plainCharacters.test(text)) error('characters', 'It has a character beyond letters, digits and plain punctuation (curly quotes, long dashes and emoji count).');
  if (!/^[\p{Lu}\p{N}]/u.test(text)) error('capital', "It doesn't start with a capital letter.");
  if (!/[.?]$/.test(text)) error('ending', "It doesn't end with a full stop or a question mark.");

  const count = sentences(text).length;
  if (count < 1 || count > 2) error('sentences', `It has ${count} sentences; a prompt is one or two.`);

  for (const match of text.match(realPlaces) ?? []) error('real-place', `It names "${match}": prompts are never about a real country.`);
  for (const match of text.match(unreal) ?? []) error('unreal', `It says "${match}": no magic, aliens, fantasy races or technology beyond today.`);
  for (const word of americanSpellings(text)) error('spelling', `"${word}" is the American spelling.`);

  if (!/\byour\b/i.test(text)) note('your', 'It never says "your": check it still asks about the writer\'s own nation.');
  return found;
}

/**
 * Checks the bank: every prompt on its own, then the prompts against each other.
 * With `complete`, also that all 366 are there and the themes are evenly spread.
 */
export function checkBank(prompts: readonly Prompt[], { complete = false }: { complete?: boolean } = {}): Finding[] {
  const found: Finding[] = prompts.flatMap(checkPrompt);
  const error = (n: number | null, rule: string, message: string) => found.push({ n, level: 'error', rule, message });

  const seen = new Map<number, number>();
  for (const { n } of prompts) seen.set(n, (seen.get(n) ?? 0) + 1);
  for (const [n, times] of seen) if (times > 1) error(n, 'doubled', `Number ${n} is used ${times} times.`);

  const openings = new Map<string, number>();
  const telling = prompts.map((prompt) => tellingWords(prompt.text));
  prompts.forEach((prompt, index) => {
    const opening = words(prompt.text).slice(0, OPENING_WORDS).join(' ');
    const earlier = openings.get(opening);
    if (earlier !== undefined) error(prompt.n, 'opening', `It opens with the same ${OPENING_WORDS} words as prompt ${earlier}: "${opening}".`);
    else openings.set(opening, prompt.n);

    for (let other = 0; other < index; other += 1) {
      const a = telling[index]!;
      const b = telling[other]!;
      if (Math.min(a.size, b.size) >= 3 && alike(a, b) >= TOO_ALIKE) {
        error(prompt.n, 'alike', `It asks much the same as prompt ${prompts[other]!.n}.`);
      }
    }
  });

  if (complete) {
    const missing: number[] = [];
    for (let n = 1; n <= BANK_SIZE; n += 1) if (!seen.has(n)) missing.push(n);
    if (missing.length) error(null, 'missing', `${missing.length} of the ${BANK_SIZE} prompts are missing: ${summarise(missing)}.`);

    // 366 prompts over eight themes: 45 or 46 each.
    const least = Math.floor(BANK_SIZE / THEMES.length);
    for (const theme of THEMES) {
      const size = prompts.filter((prompt) => prompt.theme === theme.id).length;
      if (size < least || size > least + 1) error(null, 'balance', `${theme.name} has ${size} prompts; each theme should have ${least} or ${least + 1}.`);
    }
  }
  return found;
}

/** "1 to 20, 344, 356 to 365": a list of numbers, runs folded. */
export function summarise(numbers: readonly number[]): string {
  const sorted = [...numbers].sort((a, b) => a - b);
  const runs: string[] = [];
  for (let i = 0; i < sorted.length; i += 1) {
    const start = sorted[i]!;
    let end = start;
    while (sorted[i + 1] === end + 1) end = sorted[(i += 1)]!;
    runs.push(start === end ? `${start}` : end === start + 1 ? `${start}, ${end}` : `${start} to ${end}`);
  }
  return runs.join(', ');
}

/** Only the findings that break a rule. */
export function errors(found: readonly Finding[]): Finding[] {
  return found.filter((finding) => finding.level === 'error');
}
