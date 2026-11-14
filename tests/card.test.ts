import { describe, expect, it } from 'vitest';
import { PROMPTS } from '../src/prompts/bank';
import { CARD_SIZES, balance, card, cardLayout, escapeXml, estimateWidth, wrap, type CardLook, type CardOptions } from '../src/prompts/card';
import { label } from '../src/prompts/describe';
import { LOST_PROVINCE, MAX_LENGTH, find, type Prompt } from '../src/prompts/model';

/** Stand-in colours: the real ones are @eurth/style's tokens, passed in by the site. */
const look: CardLook = { ground: '#111111', card: '#222222', ink: '#eeeeee', muted: '#aaaaaa', fontFamily: 'system-ui, Arial, sans-serif' };
const options = (size: CardOptions['size'], more: Partial<CardOptions> = {}): CardOptions => ({ size, look, siteName: 'Prompts', siteHost: 'prompt.eurth.org', ...more });
const capital = find(PROMPTS, 348)!;
/** As long as a prompt may be, in ordinary words, on the day with the longest label (14 September, Daily life). */
const widest: Prompt = {
  n: 257,
  theme: 'daily-life',
  text: "Your government's most ambitious programme, championed by two prime ministers and mocked by every newspaper, was abandoned halfway. What was it meant to do, who paid for it, and what stands there now?",
};
const yurt = { viewBox: '0 0 32 32', body: '<circle cx="16" cy="16" r="16"/>' };

describe('the handbook\'s sizes', () => {
  it('are the six the handbook lists', () => {
    expect(CARD_SIZES.map((size) => `${size.id} ${size.width}x${size.height}`)).toEqual([
      'preview 1200x630',
      'square 1080x1080',
      'portrait 1080x1350',
      'story 1080x1920',
      'pin 1000x1500',
      'wide 1600x900',
    ]);
  });
});

describe('measuring and wrapping', () => {
  it('estimates wider text as wider, and scales with the font size', () => {
    expect(estimateWidth('WWWW', 40)).toBeGreaterThan(estimateWidth('iiii', 40));
    expect(estimateWidth('nation', 80)).toBeCloseTo(estimateWidth('nation', 40) * 2);
    expect(estimateWidth('', 40)).toBe(0);
    expect(estimateWidth('café', 40)).toBeCloseTo(estimateWidth('cafe', 40));
  });

  it('breaks lines between words and loses none', () => {
    const lines = wrap(capital.text, 600, 40);
    expect(lines.length).toBeGreaterThan(1);
    expect(lines.join(' ')).toBe(capital.text);
    for (const line of lines) expect(estimateWidth(line, 40)).toBeLessThanOrEqual(600);
  });

  it('gives a word wider than the line a line to itself', () => {
    expect(wrap('a Llanfairpwllgwyngyll b', 100, 40)).toEqual(['a', 'Llanfairpwllgwyngyll', 'b']);
    expect(wrap('', 100, 40)).toEqual([]);
  });

  it('evens lines out without changing their number or losing a word', () => {
    const tenPerLetter = (text: string) => text.length * 10;
    const text = 'aaaa bbbb cccc dddd e';
    // Plainly wrapped, the last line is a stub.
    expect(wrap(text, 140, 40, tenPerLetter)).toEqual(['aaaa bbbb cccc', 'dddd e']);
    expect(balance(text, 2, 140, 40, tenPerLetter)).toEqual(['aaaa bbbb', 'cccc dddd e']);
    expect(balance(text, 1, 400, 40, tenPerLetter)).toEqual([text]);
    // Asked for more lines than can be, or fewer than fit: the plain wrapping comes back.
    expect(balance('aaaa bbbb', 5, 140, 40, tenPerLetter)).toEqual(['aaaa bbbb']);
    expect(balance(text, 2, 60, 40, tenPerLetter)).toEqual(wrap(text, 60, 40, tenPerLetter));
  });

  it('uses the browser\'s own measure when given one', () => {
    const tenPerLetter = (text: string) => text.length * 10;
    expect(wrap('aaa bbb ccc', 70, 40, tenPerLetter)).toEqual(['aaa bbb', 'ccc']);
  });
});

describe('laying out the card', () => {
  it('fits every prompt in the bank, the easter egg and the widest a prompt can be, at every size', () => {
    for (const size of CARD_SIZES) {
      for (const prompt of [...PROMPTS, LOST_PROVINCE, widest]) {
        for (const mark of [undefined, yurt]) {
          const layout = cardLayout(prompt, options(size, { mark }));
          const where = `prompt ${prompt.n} at ${size.id}`;
          expect(layout.fits, where).toBe(true);
          expect(layout.lines.join(' '), where).toBe(prompt.text);
          // Inside the card, side to side.
          for (const line of layout.lines) expect(estimateWidth(line, layout.fontSize), where).toBeLessThanOrEqual(layout.textWidth);
          expect(estimateWidth(label(prompt), layout.smallSize), where).toBeLessThanOrEqual(layout.textWidth);
          // And top to bottom: the label, then the prompt, then the foot, none touching.
          const lastLine = layout.firstLineY + (layout.lines.length - 1) * layout.lineHeight;
          expect(layout.firstLineY - layout.fontSize, where).toBeGreaterThanOrEqual(layout.labelY);
          expect(lastLine, where).toBeLessThan(layout.footerY - layout.smallSize);
          expect(layout.footerY, where).toBeLessThanOrEqual(layout.height - layout.margin - layout.padding);
        }
      }
    }
  });

  it('keeps the words large enough to read on a phone', () => {
    for (const size of CARD_SIZES) {
      const short = Math.min(size.width, size.height);
      const layout = cardLayout(widest, options(size));
      expect(layout.fontSize / short, size.id).toBeGreaterThanOrEqual(0.045);
      expect(layout.smallSize / short, size.id).toBeGreaterThanOrEqual(0.026);
    }
  });

  it('sets a short prompt larger than a long one', () => {
    const shortOne = cardLayout(LOST_PROVINCE, options('square'));
    const longOne = cardLayout(widest, options('square'));
    expect(shortOne.fontSize).toBeGreaterThan(longOne.fontSize);
  });

  it('is tested with a prompt of the greatest length', () => {
    expect(widest.text).toHaveLength(MAX_LENGTH);
  });

  it('evens out the lines: the last is never a stub beside the longest', () => {
    for (const size of CARD_SIZES) {
      for (const prompt of [...PROMPTS, widest]) {
        const { lines, fontSize } = cardLayout(prompt, options(size));
        if (lines.length < 2) continue;
        const widths = lines.map((line) => estimateWidth(line, fontSize));
        expect(widths.at(-1)! / Math.max(...widths), `prompt ${prompt.n} at ${size.id}: ${lines.join(' / ')}`).toBeGreaterThan(0.4);
      }
    }
  });

  it('says so when a text cannot fit', () => {
    const endless: Prompt = { n: 1, theme: 'history', text: 'W'.repeat(2000) };
    expect(cardLayout(endless, options('preview')).fits).toBe(false);
  });

  it('refuses a size it has never heard of', () => {
    expect(() => cardLayout(capital, options('poster' as never))).toThrow(RangeError);
    expect(cardLayout(capital, options({ id: 'custom', name: 'Custom', width: 800, height: 800 })).width).toBe(800);
  });
});

describe('drawing the card', () => {
  const svg = card(capital, options('preview'));

  it('is one SVG picture of the size asked for', () => {
    expect(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"')).toBe(true);
    expect(svg.endsWith('</svg>')).toBe(true);
    expect(svg.match(/<svg /g)).toHaveLength(1);
  });

  it('explains itself: a title and a description, tied to the picture', () => {
    expect(svg).toContain('role="img" aria-labelledby="prompt-348-preview-title prompt-348-preview-desc"');
    expect(svg).toContain('<title id="prompt-348-preview-title">Prompts: 14 December · History · prompt 348</title>');
    expect(svg).toContain('<desc id="prompt-348-preview-desc">Your nation\'s capital moved two centuries ago. Why, and who still resents it?</desc>');
  });

  it('shows the label, the prompt, the site\'s name and its address', () => {
    expect(svg).toContain('>14 December · History · prompt 348</text>');
    const shown = [...svg.matchAll(/<tspan x="\d+" y="\d+">([^<]*)<\/tspan>/g)].map((match) => match[1]).join(' ');
    expect(shown).toBe(capital.text);
    expect(svg).toContain('>Prompts</tspan> by Eurth</text>');
    expect(svg).toContain('text-anchor="end"');
    expect(svg).toContain('>prompt.eurth.org</text>');
  });

  it('uses the look it is given and no colour of its own', () => {
    const colours = new Set(svg.match(/#[0-9a-f]{3,8}\b/gi));
    expect([...colours].sort()).toEqual(['#111111', '#222222', '#aaaaaa', '#eeeeee']);
    expect(svg).toContain('font-family="system-ui, Arial, sans-serif"');
    expect(svg).not.toMatch(/gradient|filter|<image|<script|href/i);
  });

  it('gives each size and prompt its own ids, so several can share a page', () => {
    const ids = CARD_SIZES.flatMap((size) => [...card(capital, options(size)).matchAll(/ id="([^"]+)"/g)].map((match) => match[1]));
    expect(new Set(ids).size).toBe(ids.length);
    expect(card(LOST_PROVINCE, options('preview'))).toContain('id="prompt-404-preview-title"');
  });

  it('places the yurt before the site\'s name when given it', () => {
    const withMark = card(capital, options('preview', { mark: yurt }));
    expect(withMark).toContain('viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="16"/></svg>');
    const nameX = (text: string) => Number(/<text x="(\d+)"[^>]*><tspan font-weight="700"/.exec(text)?.[1]);
    expect(nameX(withMark)).toBeGreaterThan(nameX(svg));
  });

  it('escapes anything that could break the picture', () => {
    expect(escapeXml('a < b & "c" > d')).toBe('a &lt; b &amp; &quot;c&quot; &gt; d');
    const odd: Prompt = { n: 9, theme: 'culture', text: 'Tea & biscuits <at noon>. Why "noon"?' };
    const drawn = card(odd, options('square', { siteName: 'A&B', look: { ...look, fontFamily: '"Fira Sans", sans-serif' } }));
    expect(drawn).toContain('Tea &amp; biscuits &lt;at noon&gt;.');
    expect(drawn).toContain('font-family="&quot;Fira Sans&quot;, sans-serif"');
    expect(drawn).toContain('>A&amp;B</tspan>');
    expect(drawn).not.toMatch(/<at noon>/);
  });

  it('draws every prompt at every size as well-formed markup', () => {
    for (const size of CARD_SIZES) {
      for (const prompt of [...PROMPTS, LOST_PROVINCE]) {
        const drawn = card(prompt, options(size, { mark: yurt }));
        const opened = drawn.match(/<(?!\/)[a-z]+[^>]*(?<!\/)>/g)?.length ?? 0;
        const closed = drawn.match(/<\/[a-z]+>/g)?.length ?? 0;
        expect(opened, `prompt ${prompt.n} at ${size.id}`).toBe(closed);
      }
    }
  });
});
