// Makes the pictures that aren't drawn by hand, with the Chrome on this machine: the favicon,
// the home-screen icons, the site's sharing image, and one sharing image per prompt
// (public/og/p-<number>.png: the prompt on its card, so a shared link shows the question).
// Run it after adding or changing prompts, and commit what it writes:  npm run images
//
// tools/og-made.json records which words each picture was made from; a test compares it with
// the bank, so a prompt can't change and keep its old picture unnoticed.
import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { makeImages, sharingImage } from '@eurth/style/images';
import { createServer } from 'vite';
import { site } from '../eurth.config.mjs';
import { fingerprint } from './fingerprint.mjs';

// The pictures come from the same code as the site (Vite reads TypeScript).
const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
try {
  const { PROMPTS } = await vite.ssrLoadModule('/src/prompts/bank.ts');
  const { LOST_PROVINCE, find } = await vite.ssrLoadModule('/src/prompts/model.ts');
  const { card } = await vite.ssrLoadModule('/src/prompts/card.ts');
  const { cardLook, cardMark } = await vite.ssrLoadModule('/src/site/look.ts');

  const draw = (/** @type {any} */ prompt, /** @type {string} */ size) => card(prompt, { size, look: cardLook(), siteName: site.name, siteHost: site.host, mark: cardMark() });
  const page = (/** @type {string} */ svg) => `<!doctype html><meta charset="utf-8"><style>body{margin:0}svg{display:block}</style><body>${svg}</body>`;
  const all = [...PROMPTS, LOST_PROVINCE];

  // Start the folder afresh, so a prompt that has gone leaves no picture behind.
  rmSync('public/og', { recursive: true, force: true });
  mkdirSync('public/og', { recursive: true });

  const made = await makeImages({
    sharing: [
      // The site's own: the suite's layout, with the mock-up's prompt on its card beside it.
      { file: 'og.png', html: sharingImage({ site, art: draw(find(PROMPTS, 348) ?? all[0], 'square') }) },
      ...all.map((prompt) => ({ file: `og/p-${prompt.n}.png`, html: page(draw(prompt, 'preview')) })),
    ],
  });
  writeFileSync('tools/og-made.json', `${JSON.stringify(Object.fromEntries(all.map((prompt) => [prompt.n, fingerprint(prompt)])), null, 2)}\n`);
  console.log(`Made ${made.length} pictures in public/ (${readdirSync('public/og').length} of them prompts' sharing images).`);
} finally {
  await vite.close();
}
