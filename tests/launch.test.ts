/**
 * The launch gate: all 366 prompts written, sound, in order, and approved by Stijn.
 *
 * It closes by itself: from the moment the door opens (the time in LAUNCH_AT), this test must
 * pass. The launch workflow builds and tests for the door's time (EURTH_BUILD_TIME) on the
 * evening before, so an unfinished bank stops the launch instead of going live. Before then
 * everyday runs stay green; "npm run launch-check" asks the question at any time.
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { BANK } from '../src/prompts/bank';
import { APPROVED_BATCHES, launchProblems } from '../src/prompts/launch';

const door = new Date(readFileSync(new URL('../LAUNCH_AT', import.meta.url), 'utf8').trim());
const now = process.env.EURTH_BUILD_TIME ? new Date(process.env.EURTH_BUILD_TIME) : new Date();
const closed = process.env.LAUNCH_CHECK === '1' || now.getTime() >= door.getTime();

describe('the launch gate', () => {
  it('reads the door\'s time', () => {
    expect(Number.isNaN(door.getTime())).toBe(false);
  });

  it.runIf(closed)('finds nothing between the bank and launch', () => {
    expect(launchProblems(BANK, APPROVED_BATCHES)).toEqual([]);
  });

  it.skipIf(closed)('is open until the door: run "npm run launch-check" to see what is left', () => {
    expect(Array.isArray(launchProblems(BANK, APPROVED_BATCHES))).toBe(true);
  });
});
