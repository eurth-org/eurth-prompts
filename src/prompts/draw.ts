/**
 * "Another prompt": a random draw from the bank, from any theme or from one. Nothing is
 * remembered between draws; the only thing the draw avoids is the prompt already on screen.
 */
import { hasDate } from './calendar';
import type { Prompt, ThemeId } from './model';

export interface DrawOptions {
  /** Draw only from this theme. */
  theme?: ThemeId | undefined;
  /** The number of the prompt on screen, so the draw brings a different one. */
  not?: number | undefined;
  /** A source of numbers from 0 up to (not including) 1. The tests pass their own. */
  random?: () => number;
}

/**
 * Draws a prompt. Returns undefined only when there is nothing to draw from (an empty bank,
 * or a theme with no prompts yet). The easter egg is never drawn: it has to be found.
 */
export function draw<T extends Prompt>(prompts: readonly T[], { theme, not, random = Math.random }: DrawOptions = {}): T | undefined {
  let pool = prompts.filter((prompt) => hasDate(prompt.n) && (theme === undefined || prompt.theme === theme));
  // If the prompt on screen is the only one there is, it may come again.
  if (pool.length > 1) pool = pool.filter((prompt) => prompt.n !== not);
  if (pool.length === 0) return undefined;
  const roll = random();
  const index = Number.isFinite(roll) ? Math.min(pool.length - 1, Math.max(0, Math.floor(roll * pool.length))) : 0;
  return pool[index];
}
