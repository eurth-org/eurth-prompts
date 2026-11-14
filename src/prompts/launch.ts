/**
 * The launch gate: what still stands between the bank and the day the door opens. For tests
 * and scripts only; the browser never needs it.
 */
import reviewFile from '../content/review.json';
import { checkBank, errors, summarise } from './check';
import { BANK_SIZE, type BankEntry } from './model';
import { orderProblems } from './order';

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
