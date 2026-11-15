import { describe, expect, it } from 'vitest';
import { ICEBERG, MARKS, UPDATED } from '../src/content/craft';
import { BANK } from '../src/prompts/bank';
import { americanSpellings, checkPrompt, errors } from '../src/prompts/check';
import { APPROVED_BATCHES } from '../src/prompts/launch';
import { find } from '../src/prompts/model';

describe('what makes a good prompt', () => {
  it('has seven marks, each with its own name and link', () => {
    expect(MARKS).toHaveLength(7);
    expect(new Set(MARKS.map((mark) => mark.id)).size).toBe(MARKS.length);
    expect(new Set(MARKS.map((mark) => mark.title)).size).toBe(MARKS.length);
    for (const mark of MARKS) expect(mark.id).toMatch(/^[a-z]+$/);
  });

  it('shows each mark with a strong prompt from the bank that Stijn has approved', () => {
    for (const mark of MARKS) {
      const strong = find(BANK, mark.strong);
      expect(strong, `${mark.id}: prompt ${mark.strong} is not in the bank`).toBeDefined();
      expect(APPROVED_BATCHES, `${mark.id}: prompt ${mark.strong} is not approved yet`).toContain(strong!.batch);
    }
    expect(new Set(MARKS.map((mark) => mark.strong)).size).toBe(MARKS.length);
  });

  it('shows each mark with a weak prompt that is in nobody\'s list', () => {
    const forum = BANK.filter((entry) => entry.from === 'forum').map((entry) => entry.text);
    for (const mark of MARKS) {
      expect(BANK.some((entry) => entry.text === mark.weak), mark.weak).toBe(false);
      expect(forum, mark.weak).not.toContain(mark.weak);
      // Weak, but still written to the same standard: plain characters, British spelling.
      const breaks = errors(checkPrompt({ n: 1, theme: 'culture', text: mark.weak })).filter((finding) => !['length', 'real-place'].includes(finding.rule));
      expect(breaks, mark.weak).toEqual([]);
    }
  });

  it('explains itself in British English', () => {
    for (const mark of MARKS) expect(americanSpellings([mark.title, mark.why, mark.trouble, mark.gain].join(' ')), mark.id).toEqual([]);
  });

  it('lists what is above the water and what is below', () => {
    expect(ICEBERG.above.length).toBeGreaterThanOrEqual(6);
    expect(ICEBERG.below.length).toBeGreaterThanOrEqual(6);
    expect(new Set([...ICEBERG.above, ...ICEBERG.below]).size).toBe(ICEBERG.above.length + ICEBERG.below.length);
  });

  it('says when it was last brought up to date', () => {
    expect(UPDATED).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(Number.isNaN(Date.parse(UPDATED))).toBe(false);
  });
});
