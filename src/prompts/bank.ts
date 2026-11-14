/**
 * The prompt bank itself, read from src/content/. This is the one module that touches the
 * files; the rest of src/prompts/ is handed prompts and knows nothing of where they live.
 */
import promptsFile from '../content/prompts.json';
import reviewFile from '../content/review.json';
import { checkBank, errors, summarise } from './check';
import { BANK_SIZE, byNumber, readBank, type BankEntry, type Prompt } from './model';
import { orderProblems } from './order';

/** Every prompt written so far, by number, with its review batch. */
export const BANK: readonly BankEntry[] = byNumber(readBank(promptsFile));

/** The prompts as the site uses them: number, theme and text. */
export const PROMPTS: readonly Prompt[] = BANK.map(({ n, theme, text }) => ({ n, theme, text }));

/** The review batches Stijn has approved. */
export const APPROVED_BATCHES: readonly number[] = reviewFile.approved;

/**
 * What still stands between the bank and launch, in plain sentences. An empty list means the
 * bank is whole, sound and read by Stijn from first to last.
 */
export function launchProblems(bank: readonly BankEntry[], approved: readonly number[]): string[] {
  const problems: string[] = [];
  if (bank.length !== BANK_SIZE) problems.push(`The bank has ${bank.length} of its ${BANK_SIZE} prompts.`);

  const waiting = [...new Set(bank.filter((entry) => !approved.includes(entry.batch)).map((entry) => entry.batch))].sort((a, b) => a - b);
  for (const batch of waiting) {
    const numbers = bank.filter((entry) => entry.batch === batch).map((entry) => entry.n);
    problems.push(`Review batch ${batch} isn't approved yet (${numbers.length} prompts: ${summarise(numbers)}).`);
  }

  for (const finding of errors(checkBank(bank, { complete: true }))) {
    problems.push(finding.n === null ? finding.message : `Prompt ${finding.n}: ${finding.message}`);
  }
  problems.push(...orderProblems(bank, { complete: true }));
  return problems;
}
