// Writes a review batch as a page for Stijn to read: docs/review-batch-<n>.md, the batch's
// prompts by theme, each with its day and number.   node tools/review-sheet.mjs 2
import { readFileSync, writeFileSync } from 'node:fs';
import { createServer } from 'vite';

const batch = Number(process.argv[2]);
if (!Number.isInteger(batch) || batch < 1) throw new Error('Say which batch: node tools/review-sheet.mjs 2');

const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
try {
  const { BANK } = await vite.ssrLoadModule('/src/prompts/bank.ts');
  const { THEMES } = await vite.ssrLoadModule('/src/prompts/model.ts');
  const { dateFor, formatDate, inYearOrder } = await vite.ssrLoadModule('/src/prompts/calendar.ts');
  const review = JSON.parse(readFileSync('src/content/review.json', 'utf8'));
  const about = review.batches.find((/** @type {any} */ entry) => entry.id === batch);
  const prompts = inYearOrder(BANK.filter((/** @type {any} */ entry) => entry.batch === batch));
  if (!about || !prompts.length) throw new Error(`Batch ${batch} isn't in the bank or in src/content/review.json.`);

  // "15 November 2026" for 2026-11-15: dates in prose are written out.
  const day = (/** @type {string} */ iso) => `${formatDate({ month: Number(iso.slice(5, 7)), day: Number(iso.slice(8, 10)) })} ${iso.slice(0, 4)}`;
  const approved = review.approved.includes(batch);
  const fromForum = prompts.filter((/** @type {any} */ entry) => entry.from === 'forum').length;
  const first = formatDate(dateFor(prompts[0].n));
  const last = formatDate(dateFor(prompts.at(-1).n));
  const lines = [
    `# Review batch ${batch}: ${prompts.length} prompts`,
    '',
    `Status: **${approved ? 'approved by Stijn' : "waiting for Stijn's review"}**${about.shown ? ` (shown ${day(about.shown)})` : ''}. ${about.what}.`,
    '',
    `They sit on ${first} to ${last}, the themes in turn, so no theme falls on two days running. Dates and numbers may still move before launch; the words are what to review.`,
    '',
  ];
  if (fromForum) {
    lines.push(
      `${fromForum === prompts.length ? 'All' : fromForum} of them come from the Eurth forum's own [Worldbuilding Prompts](https://eurth.org/t/worldbuilding-prompts/17685) list, which also holds the [daily prompts of December 2020](https://eurth.org/t/december-2020-event-daily-worldbuilding-prompts/3695). The forum's prompts often ask four questions at once; here each is cut to one or two sentences and 200 characters, in British spelling, with "your nation" throughout. Where a prompt leaned on the real world or on fantasy (Christmas and Halloween, a Kaiju attack, more than one moon), that part is left out. A few gained a second question in the voice of batch 1 ("and who wants them changed?").`,
      '',
    );
  }
  for (const theme of THEMES) {
    const mine = prompts.filter((/** @type {any} */ entry) => entry.theme === theme.id);
    if (!mine.length) continue;
    lines.push(`## ${theme.name}`, '');
    for (const entry of mine) lines.push(`- **${entry.n}**, ${formatDate(dateFor(entry.n))}: ${entry.text}`);
    lines.push('');
  }
  writeFileSync(`docs/review-batch-${batch}.md`, `${lines.join('\n').trimEnd()}\n`);
  console.log(`Wrote docs/review-batch-${batch}.md: ${prompts.length} prompts.`);
} finally {
  await vite.close();
}
