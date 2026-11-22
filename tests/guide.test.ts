import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PROMPTS } from '../src/prompts/bank';
import { americanSpellings } from '../src/prompts/check';
import { numberFromPath } from '../src/prompts/link';
import { find } from '../src/prompts/model';
import { SITE_PATHS } from '../src/prompts/pages';
import { BENT, FIGURES, WORKED, figuresIn, splitAtFigures } from '../src/site/guide';

const file = readFileSync(new URL('../src/content/guide.md', import.meta.url), 'utf8');
const [, front = '', body = ''] = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(file) ?? [];
const field = (name: string) => new RegExp(`^${name}: (.+)$`, 'm').exec(front)?.[1] ?? '';
const links = [...body.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)].map((match) => ({ text: match[1]!, href: match[2]! }));

describe('the guide', () => {
  it('has a title, a lead, a description and the day it was last brought up to date', () => {
    expect(field('title')).toBe('How to use a worldbuilding prompt');
    expect(field('lead').length).toBeGreaterThan(60);
    expect(field('description').length).toBeGreaterThan(80);
    expect(field('description').length).toBeLessThanOrEqual(200);
    expect(field('updated')).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(Number.isNaN(Date.parse(field('updated')))).toBe(false);
  });

  it('covers using a prompt alone and with a group, and ends with its sources', () => {
    const headings = [...body.matchAll(/^## (.+)$/gm)].map((match) => match[1]);
    expect(headings).toEqual([
      'What a prompt is for',
      'Alone: ten minutes',
      'With a group',
      'What makes an answer good',
      "When a prompt doesn't fit",
      'From an answer to canon',
      'Sources and further reading',
    ]);
  });

  it('names at least five sources, each linked over https', () => {
    const sources = body.slice(body.indexOf('## Sources and further reading'));
    const items = sources.split('\n').filter((line) => line.startsWith('- '));
    expect(items.length).toBeGreaterThanOrEqual(5);
    for (const item of items) expect(item, item).toMatch(/\]\(https:\/\//);
  });

  it('links only to pages that exist: its own site\'s, and other sites over https', () => {
    expect(links.length).toBeGreaterThan(5);
    for (const { href } of links) {
      if (href.startsWith('/')) {
        const known = (SITE_PATHS as readonly string[]).includes(href) || find(PROMPTS, numberFromPath(href) ?? 0) !== undefined;
        expect(known, href).toBe(true);
      } else {
        // Links to other sites say where the visitor came from, as the handbook asks.
        expect(href, href).toMatch(/^https:\/\//);
        expect(new URL(href).searchParams.get('ref'), href).toBe('prompt.eurth.org');
      }
    }
  });

  it('quotes the prompts it links to word for word', () => {
    const quoted = [...body.matchAll(/\[prompt (\d+)\]\(\/p\/\1\/\): "([^"]+)"/g)];
    expect(quoted.length).toBeGreaterThanOrEqual(1);
    for (const [, n, text] of quoted) expect(find(PROMPTS, Number(n))?.text, `prompt ${n}`).toBe(text);
  });

  it('is written in British English, in plain sentences', () => {
    expect(americanSpellings(body)).toEqual([]);
    // No long dashes or curly quotes: the same plain punctuation as the prompts.
    expect(body).not.toMatch(/[—–“”‘’]/);
  });

  it('mentions no other Eurth tool: a site never names a tool before its door opens', () => {
    expect(body).not.toMatch(/\b(Flagwright|Governmint|Dynasty|Seats|Stats|Cities|Anthem|Passport)\b/);
    // Its own address appears only as the "ref" on links to other sites.
    expect(body.replaceAll('ref=prompt.eurth.org', '')).not.toMatch(/[a-z]+\.eurth\.org/);
  });
  it('marks a place for each picture its page can draw, once', () => {
    expect(figuresIn(body).sort()).toEqual([...FIGURES].sort());
    // Each mark stands on a line of its own, so Markdown passes it through untouched.
    for (const name of FIGURES) expect(body).toContain(`\n\n<!-- figure: ${name} -->\n`);
  });

  it('cuts its HTML at the marks, and refuses a picture nobody can draw', () => {
    expect(splitAtFigures('<p>a</p><!-- figure: worked --><p>b</p><!--figure:bend-->')).toEqual([{ html: '<p>a</p>' }, { figure: 'worked' }, { html: '<p>b</p>' }, { figure: 'bend' }]);
    expect(splitAtFigures('<p>no pictures</p>')).toEqual([{ html: '<p>no pictures</p>' }]);
    expect(() => splitAtFigures('<!-- figure: iceberg -->')).toThrow(/can't draw/);
  });

  it('pictures prompts that are in the bank: the worked example, and one to bend', () => {
    expect(find(PROMPTS, WORKED)).toBeDefined();
    expect(body).toContain(`[prompt ${WORKED}](/p/${WORKED}/)`);
    const asWritten = find(PROMPTS, BENT.n)!;
    expect(asWritten.text).toContain('navy');
    expect(BENT.text).not.toBe(asWritten.text);
    expect(americanSpellings(BENT.text)).toEqual([]);
    expect(BENT.label).toContain(`Prompt ${BENT.n}`);
  });
});
