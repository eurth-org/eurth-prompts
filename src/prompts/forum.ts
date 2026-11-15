/**
 * "Answer on the Eurth forum": a plain link that opens a new topic on eurth.org with the
 * prompt as its title and the start of its body. Nothing is posted until the visitor posts it.
 */
import { dateFor, formatDate, hasDate } from './calendar';
import { promptUrl } from './link';
import { themeName, type Prompt } from './model';

/** The forum's page for starting a topic; it takes title, body and category from the query string. */
export const FORUM_NEW_TOPIC = 'https://eurth.org/new-topic';

/** A link this long still opens everywhere; the tests hold every prompt's forum link under it. */
export const LONGEST_LINK = 2000;

/** The longest a nation's name may be in a title: with the longest prompt, the title still fits the forum's 255 characters. */
export const LONGEST_NATION = 50;

/** What stands where the nation's name goes until the writer has given one. */
export const NATION_PLACEHOLDER = '[Your nation]';

/** A nation's name as typed, made fit for a title: one line, single spaces, not too long. */
export function cleanNation(typed: string): string {
  return typed
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, LONGEST_NATION)
    .trim();
}

/**
 * The topic's title: the writer's nation, then the prompt. The forum allows a title only
 * once, and many people answer the same prompt; with the nation in front, each topic has a
 * title of its own. Without a name, a placeholder stands there for the writer to replace.
 */
export function forumTitle(prompt: Prompt, nation = ''): string {
  return `${cleanNation(nation) || NATION_PLACEHOLDER}: ${prompt.text}`;
}

/**
 * The topic's body, as Markdown: the prompt as a quotation, a line saying where it came from,
 * and an empty line for the answer to begin on.
 */
export function forumBody(prompt: Prompt, siteUrl: string): string {
  const which = hasDate(prompt.n) ? `Prompt ${prompt.n}, for ${formatDate(dateFor(prompt.n))}` : `Prompt ${prompt.n}`;
  const from = `${which}, on ${themeName(prompt.theme).toLowerCase()}, from [Prompts](${promptUrl(prompt.n, siteUrl)}), Eurth's worldbuilding prompt a day.`;
  return `> ${prompt.text}\n\n*${from}*\n\n`;
}

/**
 * The link behind "Answer on the Eurth forum". `nation` is the writer's nation, for the title.
 * `category` is the forum category's slug, a subcategory as "parent/child"; without it the
 * topic opens with no category chosen.
 */
export function forumLink(prompt: Prompt, { siteUrl, category, nation }: { siteUrl: string; category?: string | undefined; nation?: string | undefined }): string {
  const e = encodeURIComponent;
  const link = `${FORUM_NEW_TOPIC}?title=${e(forumTitle(prompt, nation))}&body=${e(forumBody(prompt, siteUrl))}`;
  return category ? `${link}&category=${e(category)}` : link;
}
