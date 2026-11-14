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

  it('gives "Answer on the Eurth forum" a plain link to a new topic on eurth.org', () => {
    const link = /<a[^>]*href="(https:\/\/eurth\.org\/new-topic\?[^"]+)"/.exec(pageOf(348))?.[1]?.replace(/&amp;/g, '&');
    expect(link).toBeDefined();
    expect(new URL(link!).searchParams.get('title')).toBe("Your nation's capital moved two centuries ago. Why, and who still resents it?");
    expect(new URL(link!).searchParams.get('body')).toContain(`${site.url}/p/348/`);
  });

  it('serves the easter egg at /p/404/ and on the page for anything not found', () => {
    expect(plain(pageOf(404))).toContain(LOST_PROVINCE.text);
    expect(plain(read('dist/404.html'))).toContain(LOST_PROVINCE.text);
    expect(read('dist/404.html')).toContain('name="robots" content="noindex"');
  });

  it('keeps the prompt pages and their pictures out of the first download for offline use', () => {
    const kept: string[] = JSON.parse(/const APP = (\[[^\]]*\]);/.exec(read('dist/sw.js'))![1]!);
    expect(kept).toEqual(expect.arrayContaining(['/', '/archive/', '/guide/']));
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
