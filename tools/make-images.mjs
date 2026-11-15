// Makes the pictures that aren't drawn by hand, with the Chrome on this machine: the favicon,
// the home-screen icons, the site's sharing image, and one sharing image per prompt
// (public/og/p-<number>.png: the prompt on its card, so a shared link shows the question).
// Run it after prompts are approved or changed, and commit what it writes:  npm run images
//
// Only prompts in approved review batches get a picture: their words may still change before
// then. A picture whose prompt hasn't changed is left as it is. tools/og-made.json records
// which words each picture was made from; a test compares it with the bank, so a prompt can't
// change and keep its old picture unnoticed.
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { makeImages, sharingImage } from '@eurth/style/images';
import { createServer } from 'vite';
import { site } from '../eurth.config.mjs';
import { fingerprint } from './fingerprint.mjs';

// The pictures come from the same code as the site (Vite reads TypeScript).
const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
try {
  const { BANK } = await vite.ssrLoadModule('/src/prompts/bank.ts');
  const { LOST_PROVINCE, find } = await vite.ssrLoadModule('/src/prompts/model.ts');
  const { card } = await vite.ssrLoadModule('/src/prompts/card.ts');
  const { cardLook, cardMark } = await vite.ssrLoadModule('/src/site/look.ts');

  const draw = (/** @type {any} */ prompt, /** @type {string} */ size) => card(prompt, { size, look: cardLook(), siteName: site.name, siteHost: site.host, mark: cardMark() });
  const page = (/** @type {string} */ svg) => `<!doctype html><meta charset="utf-8"><style>body{margin:0}svg{display:block}</style><body>${svg}</body>`;
  const review = JSON.parse(readFileSync('src/content/review.json', 'utf8'));
  const wanted = [...BANK.filter((/** @type {any} */ entry) => review.approved.includes(entry.batch)), LOST_PROVINCE];
  const record = 'tools/og-made.json';
  const before = existsSync(record) ? JSON.parse(readFileSync(record, 'utf8')) : {};
  const file = (/** @type {number} */ n) => `og/p-${n}.png`;

  // Pictures of prompts that have gone, or gone back to waiting for review, go too.
  mkdirSync('public/og', { recursive: true });
  const keep = new Set(wanted.map((prompt) => `p-${prompt.n}.png`));
  for (const name of readdirSync('public/og')) if (!keep.has(name)) rmSync(`public/og/${name}`);

  const stale = wanted.filter((prompt) => before[prompt.n] !== fingerprint(prompt) || !existsSync(`public/${file(prompt.n)}`));
  const made = await makeImages({
    sharing: [
      // The site's own: the suite's layout, with the mock-up's prompt on its card beside it.
      { file: 'og.png', html: sharingImage({ site, art: draw(find(BANK, 348) ?? wanted[0], 'square') }) },
      ...stale.map((prompt) => ({ file: file(prompt.n), html: page(draw(prompt, 'preview')) })),
    ],
  });
  writeFileSync(record, `${JSON.stringify(Object.fromEntries(wanted.map((prompt) => [prompt.n, fingerprint(prompt)])), null, 2)}\n`);
  console.log(`Made ${made.length} pictures in public/: ${stale.length} prompts' sharing images new or changed, ${wanted.length - stale.length} left as they were.`);
} finally {
  await vite.close();
}
