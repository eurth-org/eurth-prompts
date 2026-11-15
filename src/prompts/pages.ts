/**
 * The words each prompt's page shows to search engines: a title and a description, different
 * on every page, and the list of addresses for the sitemap.
 */
import { dateFor, formatDate, hasDate } from './calendar';
import { promptPath } from './link';
import { byNumber, themeName, type Prompt } from './model';

/** The site's own pages, beside the prompts'. */
export const SITE_PATHS = ['/', '/archive/', '/guide/', '/good-prompts/'] as const;

/** Text cut to a length at the end of a word, with an ellipsis if anything was cut. */
export function shorten(text: string, most: number): string {
  if (text.length <= most) return text;
  const cut = text.slice(0, most + 1);
  const end = cut.lastIndexOf(' ');
  return `${cut.slice(0, end > 0 ? end : most).replace(/[ ,;:.]+$/, '')}…`;
}

/**
 * A prompt page's title, before the site's name is added: "Prompt 348: Your nation's capital
 * moved two centuries ago". The number keeps every title different.
 */
export function promptTitle(prompt: Prompt): string {
  const first = /^[^.?!]+/.exec(prompt.text)?.[0] ?? prompt.text;
  return `Prompt ${prompt.n}: ${shorten(first, 56)}`;
}

/** Search engines show about this much of a description, and the suite's checks allow no more. */
export const LONGEST_DESCRIPTION = 200;

/**
 * A prompt page's description: the prompt (cut short if it must be, to leave room), then the
 * day and theme it belongs to. Different on every page, because the prompt is.
 */
export function promptDescription(prompt: Prompt): string {
  const theme = themeName(prompt.theme).toLowerCase();
  const what = hasDate(prompt.n) ? `The worldbuilding prompt for ${formatDate(dateFor(prompt.n))}, on ${theme}.` : `A worldbuilding prompt on ${theme}, and not one of the 366.`;
  return `${shorten(prompt.text, LONGEST_DESCRIPTION - what.length - 1)} ${what}`;
}

/**
 * Every address that belongs in the sitemap: the site's pages, then each prompt's page by
 * number. The easter egg stays out; it has to be found.
 */
export function sitemapPaths(prompts: readonly Prompt[]): string[] {
  return [...SITE_PATHS, ...byNumber(prompts.filter((prompt) => hasDate(prompt.n))).map((prompt) => promptPath(prompt.n))];
}
