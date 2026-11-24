/**
 * The built site, beyond what the suite's shared checks cover: every prompt has its page, the
 * sitemap lists them all, the pages read without JavaScript, and the service worker keeps the
 * site light. Reads dist/, so run "npm run build" first (CI does); skipped without a build.
 */
import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { site } from '../eurth.config.mjs';
import { onOrAfter } from '../src/prompts/archive';
import { PROMPTS } from '../src/prompts/bank';
import { todayIn } from '../src/prompts/calendar';
import { altText, label } from '../src/prompts/describe';
import { promptPath } from '../src/prompts/link';
import { LOST_PROVINCE } from '../src/prompts/model';
import { sitemapPaths } from '../src/prompts/pages';
import { fingerprint } from '../tools/fingerprint.mjs';

const root = new URL('../', import.meta.url);
const has = (path: string) => existsSync(new URL(path, root));
const read = (path: string) => readFileSync(new URL(path, root), 'utf8');
const built = has('dist/_headers');
/** A page's text as a visitor without JavaScript reads it: tags gone, entities back to characters. */
const plain = (html: string) =>
  html
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<astro-island[^>]*>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#39;|&#x27;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ');
const pageOf = (n: number) => read(`dist/p/${n}/index.html`);

describe.skipIf(!built)('the built site', () => {
  it('has a page for every prompt, with the prompt in it as plain HTML', () => {
    for (const prompt of [...PROMPTS, LOST_PROVINCE]) {
      expect(has(`dist/p/${prompt.n}/index.html`), `prompt ${prompt.n} has no page`).toBe(true);
      const text = plain(pageOf(prompt.n));
      expect(text, `prompt ${prompt.n}`).toContain(prompt.text);
      expect(text, `prompt ${prompt.n}`).toContain(label(prompt));
      expect(text, `prompt ${prompt.n}`).toContain(`Prompt ${prompt.n}`);
    }
  });

  it('lists every prompt page in the sitemap, and not the easter egg', () => {
    const listed = [...read('dist/sitemap-0.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]!).pathname).sort();
    expect(listed).toEqual(sitemapPaths(PROMPTS).sort());
    expect(listed).not.toContain(promptPath(LOST_PROVINCE.n));
  });

  it('shows the day\'s prompt on the Today page without JavaScript', () => {
    // Built for the day in Brussels (EURTH_BUILD_TIME when the launch workflow builds ahead).
    const now = process.env.EURTH_BUILD_TIME ? new Date(process.env.EURTH_BUILD_TIME) : new Date();
    const text = plain(read('dist/index.html'));
    expect(text).toContain("Today's prompt");
    // A build made just before midnight and tested just after may be a day behind: either is right.
    const candidates = [0, -1].map((days) => onOrAfter(PROMPTS, todayIn('Europe/Brussels', new Date(now.getTime() + days * 86_400_000)))!.text);
    expect(candidates.some((candidate) => text.includes(candidate)), `none of: ${candidates.join(' | ')}`).toBe(true);
  });

  it('links to every prompt from the archive, by theme', () => {
    const archive = read('dist/archive/index.html');
    for (const prompt of PROMPTS) expect(archive, `prompt ${prompt.n}`).toContain(`href="${promptPath(prompt.n)}"`);
    expect(archive).not.toContain(`href="${promptPath(LOST_PROVINCE.n)}"`);
    expect(plain(archive)).toContain(PROMPTS[0]!.text);
  });

  it('gives "Answer on the Eurth forum" a plain link to a new topic in Factbooks and National Information', () => {
    const link = /<a[^>]*href="(https:\/\/eurth\.org\/new-topic\?[^"]+)"/.exec(pageOf(348))?.[1]?.replace(/&amp;/g, '&');
    expect(link).toBeDefined();
    const asked = new URL(link!).searchParams;
    // Without JavaScript nobody has named a nation yet: the placeholder is there to replace.
    expect(asked.get('title')).toBe("[Your nation]: Your nation's capital moved two centuries ago. Why, and who still resents it?");
    expect(asked.get('body')).toContain(`${site.url}/p/348/`);
    expect(asked.get('category')).toBe('factbooks-and-national-information');
  });

  it('serves the easter egg at /p/404/ and on the page for anything not found', () => {
    expect(plain(pageOf(404))).toContain(LOST_PROVINCE.text);
    expect(plain(read('dist/404.html'))).toContain(LOST_PROVINCE.text);
    expect(read('dist/404.html')).toContain('name="robots" content="noindex"');
  });

  it('keeps the prompt pages and their pictures out of the first download for offline use', () => {
    const kept: string[] = JSON.parse(/const APP = (\[[^\]]*\]);/.exec(read('dist/sw.js'))![1]!);
    expect(kept).toEqual(expect.arrayContaining(['/', '/archive/', '/guide/', '/good-prompts/']));
    expect(kept.filter((path) => path.startsWith('/p/') || path.startsWith('/og/'))).toEqual([]);
    // The bank travels in the script instead, so every prompt can be shown offline.
    const script = kept.find((path) => /\/_astro\/PromptTool\.[\w-]+\.js$/.test(path));
    expect(script, 'the tool\'s script is kept').toBeDefined();
    expect(read(`dist${script}`)).toContain(PROMPTS[0]!.text.slice(0, 40));
  });

  it('carries no other prompt\'s words in a prompt page than the few it links to', () => {
    // The bank belongs in the script, once; not in each of 366 pages.
    const html = pageOf(348);
    const text = plain(html);
    const others = PROMPTS.filter((prompt) => prompt.n !== 348 && text.includes(prompt.text));
    expect(others.length).toBeLessThanOrEqual(6);
  });
});

describe('the tool\'s own mark', () => {
  const mark = read('src/assets/mark.svg');

  it('carries the Eurth yurt exactly as the suite draws it: never redrawn', () => {
    const yurt = read('node_modules/@eurth/style/src/assets/eurth-yurt.svg');
    const paths = [...yurt.matchAll(/<path d="([^"]+)"/g)].map((match) => match[1]!);
    expect(paths).toHaveLength(2);
    for (const path of paths) expect(mark).toContain(`d="${path}"`);
    // Placed and sized as a whole, by one scale for both directions: never stretched.
    expect(mark).toMatch(/scale\(0\.\d+\) translate\(-128\.6 -128\.6\)/);
  });

  it('has the yurt in the middle of the leaf, clear of the turned corner', () => {
    const placed = /translate\(([\d.]+) ([\d.]+)\) scale\(([\d.]+)\) translate\((-?[\d.]+) (-?[\d.]+)\) translate\((-?[\d.]+) (-?[\d.]+)\)/.exec(mark)!;
    const [x, y, scale, ax, ay, bx, by] = placed.slice(1).map(Number) as [number, number, number, number, number, number, number];
    const yurt = /<g fill="#fff"[^>]*>([\s\S]*)<\/g>/.exec(mark)![1]!;
    const points = [...yurt.matchAll(/(-?[\d.]+),(-?[\d.]+)/g)].map((match) => [x + scale * (Number(match[1]) + ax + bx), y + scale * (Number(match[2]) + ay + by)] as const);
    const xs = points.map((point) => point[0]);
    const ys = points.map((point) => point[1]);
    // The leaf runs from 6 to 58 across; below its band, from 21 to 60 down.
    expect((Math.min(...xs) + Math.max(...xs)) / 2).toBeCloseTo(32, 1);
    expect((Math.min(...ys) + Math.max(...ys)) / 2).toBeCloseTo(40.5, 0);
    const corner = /<path d="M(\d+) 60V(\d+)a/.exec(mark)!;
    expect(Math.max(...xs)).toBeLessThan(Number(corner[1]) - 1);
  });

  it('is square, flat and in the suite\'s colours', () => {
    expect(mark).toContain('viewBox="0 0 64 64"');
    expect(mark).not.toMatch(/gradient|filter|<text|<image/i);
    const colours = new Set([...mark.matchAll(/fill="(#[0-9a-f]+)"/gi)].map((match) => match[1]!.toLowerCase()));
    expect([...colours].sort()).toEqual(['#1b6fa0', '#2698d4', '#fcf6e1', '#fff']);
  });

  it('is the favicon', () => {
    if (has('public/favicon.svg')) expect(read('public/favicon.svg')).toBe(mark);
  });

  it.skipIf(!built)('stands in front of the name on every kind of page', () => {
    const leaf = /<path d="(M14 8h36[^"]+)"/.exec(mark)![1]!;
    for (const page of ['dist/index.html', 'dist/archive/index.html', 'dist/guide/index.html', 'dist/good-prompts/index.html', 'dist/p/348/index.html', 'dist/p/404/index.html', 'dist/404.html']) {
      expect(read(page), page).toContain(leaf);
    }
  });
});

describe.skipIf(!built)('the pages built from the suite\'s shared parts', () => {
  const count = (html: string, piece: string) => html.split(piece).length - 1;
  const pictures = (html: string) => [...html.matchAll(/<img\b[^>]*>/g)].map((match) => match[0]);

  it('lets a prompt leave in two cards, with the picture\'s downloads beside the picture', () => {
    const text = plain(pageOf(348));
    for (const words of ['Another prompt', 'Copy prompt', 'Pick a theme', 'The card as a picture', 'Download as', 'Save & share', 'Copy link', 'Copy Markdown', 'Export', 'Wikitext', 'Plain text']) {
      expect(text, words).toContain(words);
    }
    // The Markdown is there to read and select before any script runs.
    expect(pageOf(348)).toContain('## Prompt 348');
  });

  it('shows what the written pages explain, each picture with words of its own', () => {
    const guide = read('dist/guide/index.html');
    const good = read('dist/good-prompts/index.html');
    const archive = read('dist/archive/index.html');
    expect(count(guide, 'class="eu-figure"')).toBe(3);
    expect(count(good, 'class="eu-figure"')).toBe(14);
    expect(count(good, 'class="eu-verdict eu-verdict--bad"')).toBe(7);
    expect(count(good, 'class="eu-verdict eu-verdict--good"')).toBe(7);
    expect(count(archive, 'class="eu-tile"')).toBe(8);
    for (const html of [guide, good, archive]) {
      expect(html).toContain('eu-pagehead');
      expect(pictures(html).length).toBeGreaterThanOrEqual(4);
      for (const picture of pictures(html)) expect(picture).toMatch(/alt="[^"]{20,}"/);
    }
    for (const html of [guide, good]) {
      expect(html).toContain('eu-toc');
      expect(html).toContain('eu-next');
      expect(html).not.toContain('figure:');
    }
  });

  it('gives every page in the header an icon, for the phone', () => {
    const bar = /<nav[^>]*>[\s\S]*?<\/nav>/.exec(read('dist/index.html'))![0];
    for (const page of site.pages) expect(page.icon ?? ['/', '/guide/'].includes(page.href), page.label).toBeTruthy();
    expect(bar).toContain('Good prompts');
  });
});

describe('the prompts\' sharing images', () => {
  const made: Record<string, string> = has('tools/og-made.json') ? JSON.parse(read('tools/og-made.json')) : {};

  it('were each made from the prompt as it reads now', () => {
    for (const prompt of [...PROMPTS, LOST_PROVINCE]) {
      if (!has(`public/og/p-${prompt.n}.png`)) continue;
      expect(made[prompt.n], `prompt ${prompt.n} has changed since its picture was made: run "npm run images"`).toBe(fingerprint(prompt));
    }
  });

  it('belong to prompts that still exist', () => {
    for (const n of Object.keys(made)) expect([...PROMPTS, LOST_PROVINCE].some((prompt) => String(prompt.n) === n), `p-${n}.png has no prompt`).toBe(true);
  });

  it.skipIf(!built)('are what a prompt\'s page offers as its link preview, with the prompt as alt text', () => {
    for (const prompt of [...PROMPTS, LOST_PROVINCE]) {
      if (!has(`dist/og/p-${prompt.n}.png`)) continue;
      const html = pageOf(prompt.n);
      expect(html, `prompt ${prompt.n}`).toContain(`<meta property="og:image" content="${site.url}/og/p-${prompt.n}.png"`);
      const alt = /<meta property="og:image:alt" content="([^"]*)"/.exec(html)?.[1] ?? '';
      expect(plain(alt)).toBe(altText(prompt, site.host));
    }
  });
});
