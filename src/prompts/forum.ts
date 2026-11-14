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

/** The topic's title: the prompt itself. */
export function forumTitle(prompt: Prompt): string {
  return prompt.text;
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
 * The link behind "Answer on the Eurth forum". `category` is the forum category's slug, a
 * subcategory as "parent/child"; without it the topic opens with no category chosen.
 */
export function forumLink(prompt: Prompt, { siteUrl, category }: { siteUrl: string; category?: string | undefined }): string {
  const e = encodeURIComponent;
  const link = `${FORUM_NEW_TOPIC}?title=${e(forumTitle(prompt))}&body=${e(forumBody(prompt, siteUrl))}`;
  return category ? `${link}&category=${e(category)}` : link;
}
