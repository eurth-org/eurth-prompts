/**
 * The launch gate: all 366 prompts written, sound, in order, and approved by Stijn.
 *
 * It runs only when asked (`npm run launch-check`, which the launch workflow does before it
 * deploys), so everyday test runs stay green while the bank is being written and reviewed.
 */
import { describe, expect, it } from 'vitest';
import { APPROVED_BATCHES, BANK, launchProblems } from '../src/prompts/bank';

describe('the launch gate', () => {
  it.runIf(process.env.LAUNCH_CHECK === '1')('finds nothing between the bank and launch', () => {
    expect(launchProblems(BANK, APPROVED_BATCHES)).toEqual([]);
  });

  it.skipIf(process.env.LAUNCH_CHECK === '1')('is waiting: run "npm run launch-check" to see what is left', () => {
    expect(Array.isArray(launchProblems(BANK, APPROVED_BATCHES))).toBe(true);
  });
});
