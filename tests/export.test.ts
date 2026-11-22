import { markdownText } from '@eurth/style';
import { describe, expect, it } from 'vitest';
import { PROMPTS } from '../src/prompts/bank';
import { asMarkdown, asPlainText, asWikitext, markdownLiteral, wikiLiteral } from '../src/prompts/export';
import { LOST_PROVINCE, find } from '../src/prompts/model';

const site = 'https://prompt.eurth.org';
const capital = find(PROMPTS, 348)!;

describe('a prompt as Markdown', () => {
  it('is a heading, the prompt as a quotation, and where it came from with its link', () => {
    expect(asMarkdown(capital, site)).toBe(
      [
        '## Prompt 348',
        '',
        "> Your nation's capital moved two centuries ago. Why, and who still resents it?",
        '',
        "*Prompt 348, for 14 December, on history, from [Prompts](https://prompt.eurth.org/p/348/), Eurth's worldbuilding prompt a day.*",
        '',
      ].join('\n'),
    );
  });

  it('is headed by the nation once it has a name', () => {
    expect(asMarkdown(capital, site, '  Orioni ').split('\n')[0]).toBe('## Orioni: prompt 348');
  });

  it("writes a typed name so it can't turn into markup", () => {
    const first = asMarkdown(capital, site, '[x](https://example.com) *bold* <b>').split('\n')[0]!;
    expect(first).toBe('## \\[x\\]\\(https://example\\.com\\) \\*bold\\* \\<b\\>: prompt 348');
  });

  it('escapes what the suite escapes', () => {
    const awkward = 'a\\b`c*d_e{f}g[h]i(j)k#l+m-n.o!p|q<r>s~t';
    expect(markdownLiteral(awkward)).toBe(markdownText(awkward));
  });

  it('ends every prompt with the link that brings it back', () => {
    for (const prompt of [...PROMPTS, LOST_PROVINCE]) expect(asMarkdown(prompt, site), `prompt ${prompt.n}`).toContain(`](${site}/p/${prompt.n}/)`);
  });

  it('gives the easter egg no date', () => {
    expect(asMarkdown(LOST_PROVINCE, site)).toContain('*Prompt 404, on geography, from');
  });
});

describe('a prompt as wikitext', () => {
  it('is a section with the prompt as a quotation and an outside link', () => {
    expect(asWikitext(capital, site, 'Orioni')).toBe(
      [
        '== Orioni: prompt 348 ==',
        "<blockquote>Your nation's capital moved two centuries ago. Why, and who still resents it?</blockquote>",
        "''Prompt 348, for 14 December, on history, from [https://prompt.eurth.org/p/348/ Prompts], Eurth's worldbuilding prompt a day.''",
        '',
      ].join('\n'),
    );
  });

  it("writes a typed name so it can't turn into markup", () => {
    expect(wikiLiteral('Orioni')).toBe('Orioni');
    expect(wikiLiteral("[[Main Page]] {{delete}} ''x''")).toBe("<nowiki>[[Main Page]] {{delete}} ''x''</nowiki>");
    expect(wikiLiteral('</nowiki><b>')).toBe('&lt;/nowiki&gt;&lt;b&gt;');
    expect(asWikitext(capital, site, 'A|B').split('\n')[0]).toBe('== <nowiki>A|B</nowiki>: prompt 348 ==');
  });

  it('never breaks its own quotation or italics with a prompt\'s words', () => {
    for (const prompt of [...PROMPTS, LOST_PROVINCE]) {
      expect(prompt.text, `prompt ${prompt.n}`).not.toMatch(/''|[<>[\]{}|]/);
      expect(asWikitext(prompt, site).split('\n'), `prompt ${prompt.n}`).toHaveLength(4);
    }
  });
});

describe('a prompt as plain text', () => {
  it('is the prompt, what it is, and its link', () => {
    expect(asPlainText(capital, site)).toBe("Your nation's capital moved two centuries ago. Why, and who still resents it?\n\nPrompt 348, for 14 December, on history. https://prompt.eurth.org/p/348/\n");
  });

  it('puts the nation first once it has a name', () => {
    expect(asPlainText(capital, site, 'Orioni').startsWith('Orioni\n\nYour nation')).toBe(true);
  });
});
