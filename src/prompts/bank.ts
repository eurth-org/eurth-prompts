/**
 * The prompt bank itself, read from src/content/prompts.json. This is the module that touches
 * the file; the rest of src/prompts/ is handed prompts and knows nothing of where they live.
 * It is small on purpose: the browser carries it, so it imports none of the checks.
 */
import promptsFile from '../content/prompts.json';
import { byNumber, readBank, type BankEntry, type Prompt } from './model';

/** Every prompt written so far, by number, with its review batch. */
export const BANK: readonly BankEntry[] = byNumber(readBank(promptsFile));

/** The prompts as the site uses them: number, theme and text. */
export const PROMPTS: readonly Prompt[] = BANK.map(({ n, theme, text }) => ({ n, theme, text }));
