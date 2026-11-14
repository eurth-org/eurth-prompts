/**
 * The prompt card as a picture: one function from a prompt to SVG text, in the six sizes the
 * handbook asks for. The page, the downloads, the sharing images and the tests all use it.
 *
 * Colours and the font come in as a "look", so the site can pass @eurth/style's tokens; this
 * module holds none of its own. Lines are wrapped by a table of letter widths, because there
 * is no browser here to measure them; a browser can pass its own `measure` for an exact fit.
 */
import { label } from './describe';
import type { Prompt } from './model';

export interface CardSize {
  id: string;
  name: string;
  width: number;
  height: number;
}

/** The handbook's picture sizes, as @eurth/style's PICTURE_SIZES lists them. */
export const CARD_SIZES = [
  { id: 'preview', name: 'Link preview', width: 1200, height: 630 },
  { id: 'square', name: 'Square', width: 1080, height: 1080 },
  { id: 'portrait', name: 'Portrait', width: 1080, height: 1350 },
  { id: 'story', name: 'Story', width: 1080, height: 1920 },
  { id: 'pin', name: 'Pin', width: 1000, height: 1500 },
  { id: 'wide', name: 'Wide', width: 1600, height: 900 },
] as const satisfies readonly CardSize[];

export type CardSizeId = (typeof CARD_SIZES)[number]['id'];

/** The colours and the font of a card: one of @eurth/style's two themes, handed in by the site. */
export interface CardLook {
  /** The page behind the card. */
  ground: string;
  /** The card itself. */
  card: string;
  /** The prompt's own words. */
  ink: string;
  /** The line above and the line below. */
  muted: string;
  fontFamily: string;
}

/** A small picture to stand before the site's name: the Eurth yurt, from @eurth/style. */
export interface CardMark {
  viewBox: string;
  /** What goes inside the <svg> element. Trusted markup: it comes from the package, never from a visitor. */
  body: string;
}

export interface CardOptions {
  size: CardSize | CardSizeId;
  look: CardLook;
  /** "Prompts" */
  siteName: string;
  /** "prompt.eurth.org" */
  siteHost: string;
  mark?: CardMark | undefined;
  /** The width of a run of text at a font size, in pixels. Defaults to the table below. */
  measure?: ((text: string, fontSize: number) => number) | undefined;
}

export interface CardLayout {
  width: number;
  height: number;
  /** The gap between the picture's edge and the card. */
  margin: number;
  /** The gap between the card's edge and its words. */
  padding: number;
  radius: number;
  /** The size of the line above (date, theme, number) and of the line below. */
  smallSize: number;
  /** The size of the prompt's words. */
  fontSize: number;
  lineHeight: number;
  lines: string[];
  /** Where the words begin and how wide they may run. */
  textLeft: number;
  textWidth: number;
  /** The baseline of the line above, of the prompt's first line, and of the line below. */
  labelY: number;
  firstLineY: number;
  footerY: number;
  /** False if the prompt could not be made to fit even at the smallest size. */
  fits: boolean;
}

/**
 * Letter widths in thousandths of the font size, after Helvetica Bold. System fonts differ a
 * little from it and from each other, so widths are padded by SAFETY before a line is called full.
 */
const WIDTHS: Record<string, number> = {
  ' ': 278, '.': 278, ',': 278, ':': 333, ';': 333, '!': 333, '?': 611, "'": 238, '-': 333, '(': 333, ')': 333, '%': 889,
  '&': 722, '/': 278, '·': 278, '…': 1000,
  a: 556, b: 611, c: 556, d: 611, e: 556, f: 333, g: 611, h: 611, i: 278, j: 278, k: 556, l: 278, m: 889, n: 611, o: 611,
  p: 611, q: 611, r: 389, s: 556, t: 333, u: 611, v: 556, w: 778, x: 556, y: 556, z: 500,
  A: 722, B: 722, C: 722, D: 722, E: 667, F: 611, G: 778, H: 722, I: 278, J: 556, K: 722, L: 611, M: 833, N: 722, O: 778,
  P: 667, Q: 778, R: 722, S: 667, T: 611, U: 722, V: 667, W: 944, X: 667, Y: 667, Z: 611,
};
const DIGIT = 556;
const OTHER = 722;
const SAFETY = 1.08;
/** A last line narrower than this share of the widest line is a stub: a word or two left over. */
const STUB = 0.4;

/** An estimate of how wide a run of bold text is, erring on the wide side. */
export function estimateWidth(text: string, fontSize: number): number {
  let units = 0;
  // Accented letters are as wide as their plain ones.
  for (const character of text.normalize('NFD').replace(/\p{M}/gu, '')) {
    units += WIDTHS[character] ?? (/\d/.test(character) ? DIGIT : OTHER);
  }
  return (units / 1000) * fontSize * SAFETY;
}

/** Breaks text into lines no wider than `most`. A word wider than a line gets a line to itself. */
export function wrap(text: string, most: number, fontSize: number, measure: (text: string, fontSize: number) => number = estimateWidth): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(' ').filter(Boolean)) {
    const longer = line ? `${line} ${word}` : word;
    if (line && measure(longer, fontSize) > most) {
      lines.push(line);
      line = word;
    } else {
      line = longer;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/**
 * The same text in the same number of lines, but evened out: of all the ways to break it, the
 * one whose lines fall least short of the measure, taken together (short lines count by the
 * square of what they lack). So no last line is left with a single word while others are full.
 * Returns the plain wrapping if the text can't be set in that many lines.
 */
export function balance(text: string, lineCount: number, most: number, fontSize: number, measure: (text: string, fontSize: number) => number = estimateWidth): string[] {
  const all = text.split(' ').filter(Boolean);
  const plain = wrap(text, most, fontSize, measure);
  if (lineCount < 2 || all.length < lineCount) return plain;

  // lack[from][to]: how far the line of words from..to falls short, squared; Infinity if it is too wide.
  const lack = (from: number, to: number) => {
    const width = measure(all.slice(from, to).join(' '), fontSize);
    return width > most ? Infinity : (most - width) ** 2;
  };
  // best[lines][upTo]: the least total lack setting the first `upTo` words in `lines` lines.
  const best: number[][] = Array.from({ length: lineCount + 1 }, () => new Array<number>(all.length + 1).fill(Infinity));
  const brokenAt: number[][] = Array.from({ length: lineCount + 1 }, () => new Array<number>(all.length + 1).fill(-1));
  best[0]![0] = 0;
  for (let line = 1; line <= lineCount; line += 1) {
    for (let upTo = line; upTo <= all.length; upTo += 1) {
      for (let from = upTo - 1; from >= line - 1; from -= 1) {
        const thisLine = lack(from, upTo);
        if (thisLine === Infinity) break; // Longer lines only get wider.
        const total = best[line - 1]![from]! + thisLine;
        if (total < best[line]![upTo]!) {
          best[line]![upTo] = total;
          brokenAt[line]![upTo] = from;
        }
      }
    }
  }
  if (best[lineCount]![all.length] === Infinity) return plain;

  const lines: string[] = [];
  for (let line = lineCount, upTo = all.length; line >= 1; line -= 1) {
    const from = brokenAt[line]![upTo]!;
    lines.unshift(all.slice(from, upTo).join(' '));
    upTo = from;
  }
  return lines;
}

/** The yurt's size beside the site's name, and the room it takes with its gap. */
const footerMarkSize = (smallSize: number) => Math.round(smallSize * 1.6);
const footerMarkSpace = (smallSize: number) => footerMarkSize(smallSize) + Math.round(smallSize * 0.5);

function sizeOf(size: CardSize | CardSizeId): CardSize {
  if (typeof size !== 'string') return size;
  const found = CARD_SIZES.find((known) => known.id === size);
  if (!found) throw new RangeError(`No card size is called "${size}".`);
  return found;
}

/**
 * Where everything on the card goes. The prompt is set as large as fits (never smaller than a
 * size that reads well on a phone), in lines of even length, in the middle of the space
 * between the line above and the line below.
 */
export function cardLayout(prompt: Prompt, options: Pick<CardOptions, 'size' | 'measure' | 'siteName' | 'siteHost' | 'mark'>): CardLayout {
  const { width, height } = sizeOf(options.size);
  const measure = options.measure ?? estimateWidth;
  const short = Math.min(width, height);
  const margin = Math.round(short * 0.07);
  const padding = Math.round(short * 0.08);
  const radius = Math.round(short * 0.03);
  const textLeft = margin + padding;
  const textWidth = width - 2 * textLeft;
  // The small lines shrink on narrow pictures until the longest of them fits: the line above
  // on one line, and the site's name and address side by side with a gap between them.
  let smallSize = Math.round(short * 0.042);
  const smallFits = (size: number) => {
    const name = (options.mark ? footerMarkSpace(size) : 0) + measure(`${options.siteName} by Eurth`, size);
    return measure(label(prompt), size) <= textWidth && name + size + measure(options.siteHost, size) <= textWidth;
  };
  while (smallSize > Math.round(short * 0.026) && !smallFits(smallSize)) smallSize -= 1;
  const labelY = margin + padding + smallSize;
  const footerY = height - margin - padding;
  // The prompt's own space: below the line above, above the line below, a gap at each end.
  const top = labelY + smallSize;
  const bottom = footerY - 2 * smallSize;

  const largest = Math.round(short * 0.1);
  const smallest = Math.round(short * 0.045);
  let fontSize = largest;
  let lineHeight = 0;
  let lines: string[] = [];
  let fits = false;
  for (; fontSize >= smallest; fontSize -= 1) {
    lineHeight = Math.round(fontSize * 1.25);
    lines = wrap(prompt.text, textWidth, fontSize, measure);
    const tooWide = lines.some((line) => measure(line, fontSize) > textWidth);
    if (!tooWide && lines.length * lineHeight <= bottom - top) {
      fits = true;
      break;
    }
  }
  if (!fits) fontSize = smallest;

  if (fits) {
    // Even the lines out. If the last line is still a stub (a long word that can't join it at
    // this size), step the size down a little until it isn't; if nothing helps, keep the largest.
    const stub = (candidate: string[]) => {
      const widths = candidate.map((line) => measure(line, fontSize));
      return candidate.length > 1 && widths.at(-1)! < STUB * Math.max(...widths);
    };
    const largestFit = fontSize;
    lines = balance(prompt.text, lines.length, textWidth, fontSize, measure);
    const settled = { fontSize, lineHeight, lines };
    while (stub(lines) && fontSize > Math.max(smallest, largestFit * 0.8)) {
      fontSize -= 1;
      lineHeight = Math.round(fontSize * 1.25);
      lines = balance(prompt.text, wrap(prompt.text, textWidth, fontSize, measure).length, textWidth, fontSize, measure);
    }
    if (stub(lines)) ({ fontSize, lineHeight, lines } = settled);
  }

  const block = lines.length * lineHeight;
  // The first baseline: the block centred in its space, a line's ascent below its top.
  const firstLineY = Math.round(top + Math.max(0, (bottom - top - block) / 2) + fontSize * 0.95);
  return { width, height, margin, padding, radius, smallSize, fontSize, lineHeight, lines, textLeft, textWidth, labelY, firstLineY, footerY, fits };
}

/** Text made safe to sit inside SVG, as content or as an attribute's value. */
export function escapeXml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * The card as SVG text. It carries its own title and description, so the picture explains
 * itself to a screen reader wherever it ends up.
 */
export function card(prompt: Prompt, options: CardOptions): string {
  const { look, siteName, siteHost, mark } = options;
  const size = sizeOf(options.size);
  const layout = cardLayout(prompt, options);
  const { width, height, margin, radius, smallSize, fontSize, lineHeight, textLeft, labelY, firstLineY, footerY } = layout;
  const id = `prompt-${prompt.n}-${size.id}`;
  const font = escapeXml(look.fontFamily);
  const right = width - textLeft;
  const markSize = footerMarkSize(smallSize);
  const nameLeft = mark ? textLeft + footerMarkSpace(smallSize) : textLeft;

  const lines = layout.lines
    .map((line, index) => `<tspan x="${textLeft}" y="${firstLineY + index * lineHeight}">${escapeXml(line)}</tspan>`)
    .join('');
  const picture = mark
    ? `<svg x="${textLeft}" y="${Math.round(footerY - markSize * 0.78)}" width="${markSize}" height="${markSize}" viewBox="${escapeXml(mark.viewBox)}" aria-hidden="true">${mark.body}</svg>`
    : '';

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="${id}-title ${id}-desc">`,
    `<title id="${id}-title">${escapeXml(`${siteName}: ${label(prompt)}`)}</title>`,
    `<desc id="${id}-desc">${escapeXml(prompt.text)}</desc>`,
    `<rect width="${width}" height="${height}" fill="${escapeXml(look.ground)}"/>`,
    `<rect x="${margin}" y="${margin}" width="${width - 2 * margin}" height="${height - 2 * margin}" rx="${radius}" fill="${escapeXml(look.card)}"/>`,
    `<text x="${textLeft}" y="${labelY}" font-family="${font}" font-size="${smallSize}" fill="${escapeXml(look.muted)}">${escapeXml(label(prompt))}</text>`,
    `<text font-family="${font}" font-size="${fontSize}" font-weight="700" fill="${escapeXml(look.ink)}">${lines}</text>`,
    picture,
    `<text x="${nameLeft}" y="${footerY}" font-family="${font}" font-size="${smallSize}" fill="${escapeXml(look.muted)}"><tspan font-weight="700" fill="${escapeXml(look.ink)}">${escapeXml(siteName)}</tspan> by Eurth</text>`,
    `<text x="${right}" y="${footerY}" text-anchor="end" font-family="${font}" font-size="${smallSize}" fill="${escapeXml(look.muted)}">${escapeXml(siteHost)}</text>`,
    '</svg>',
  ]
    .filter(Boolean)
    .join('');
}
