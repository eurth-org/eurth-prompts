/**
 * A prompt in words: the line above it on the card, the text that "Copy prompt" copies, what
 * the Share dialog passes on, and the alternative text of its picture.
 */
import { dateFor, formatDate, hasDate } from './calendar';
import { cleanNation, forumBody, forumTitle } from './forum';
import { promptUrl } from './link';
import { themeName, type Prompt } from './model';

/** The line above a prompt: "14 December · History · prompt 348". The easter egg has no date. */
export function label(prompt: Prompt, { short = false }: { short?: boolean } = {}): string {
  const parts = [themeName(prompt.theme), `prompt ${prompt.n}`];
  if (hasDate(prompt.n)) parts.unshift(formatDate(dateFor(prompt.n), { short }));
  return parts.join(' · ');
}

/** The same facts as a sentence: "Prompt 348, for 14 December, on history." */
export function facts(prompt: Prompt): string {
  const theme = themeName(prompt.theme).toLowerCase();
  return hasDate(prompt.n) ? `Prompt ${prompt.n}, for ${formatDate(dateFor(prompt.n))}, on ${theme}.` : `Prompt ${prompt.n}, on ${theme}.`;
}

/** What "Copy prompt" puts on the clipboard: the prompt, then where it came from. */
export function copyText(prompt: Prompt, siteUrl: string): string {
  return `${prompt.text}\n\n${facts(prompt)} ${promptUrl(prompt.n, siteUrl)}`;
}

/** The alternative text of the prompt's card as a picture. */
export function altText(prompt: Prompt, siteHost: string): string {
  return `A worldbuilding prompt from ${siteHost}: "${prompt.text}" ${facts(prompt)}`;
}

/**
 * What the Share dialog needs (the shape @eurth/style's shareTargets takes): the link, a
 * title, a line of text, and the forum topic's body. With the writer's nation, the title
 * carries it, as a forum topic's title must be its own.
 */
export function shared(prompt: Prompt, siteUrl: string, nation = ''): { url: string; title: string; text: string; forumBody: string } {
  return {
    url: promptUrl(prompt.n, siteUrl),
    title: cleanNation(nation) ? forumTitle(prompt, nation) : prompt.text,
    text: `${prompt.text} A worldbuilding prompt from Eurth: answer it for your own nation.`,
    forumBody: forumBody(prompt, siteUrl),
  };
}
