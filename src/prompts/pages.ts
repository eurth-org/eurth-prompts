/**
 * The words each prompt's page shows to search engines: a title and a description, different
 * on every page, and the list of addresses for the sitemap.
 */
import { dateFor, formatDate, hasDate } from './calendar';
import { sentences } from './check';
import { promptPath } from './link';
import { byNumber, themeName, type Prompt } from './model';

/** The site's own pages, beside the prompts'. */
export const SITE_PATHS = ['/', '/archive/', '/guide/'] as const;

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
  const first = (sentences(prompt.text)[0] ?? prompt.text).replace(/[.?!]+$/, '');
  return `Prompt ${prompt.n}: ${shorten(first, 56)}`;
}

/** A prompt page's description: the whole prompt, the day it belongs to, and what to do with it. */
export function promptDescription(prompt: Prompt): string {
  const theme = themeName(prompt.theme).toLowerCase();
  const when = hasDate(prompt.n) ? `The worldbuilding prompt for ${formatDate(dateFor(prompt.n))}, on ${theme}` : `A worldbuilding prompt on ${theme}`;
  return `${prompt.text} ${when}: answer it for your own nation, alone or on the Eurth forum.`;
}

/**
 * Every address that belongs in the sitemap: the site's pages, then each prompt's page by
 * number. The easter egg stays out; it has to be found.
 */
export function sitemapPaths(prompts: readonly Prompt[]): string[] {
  return [...SITE_PATHS, ...byNumber(prompts.filter((prompt) => hasDate(prompt.n))).map((prompt) => promptPath(prompt.n))];
}
