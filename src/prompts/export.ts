/**
 * A prompt as text to take away: Markdown for the forum and most wikis, wikitext for IIWiki,
 * and plain text for anywhere else. Each ends with the link that brings the prompt back.
 *
 * The writer's nation, where given, heads the text. It is typed by a visitor, so each format
 * writes it in a way that can't turn into markup.
 */
import { copyText, facts } from './describe';
import { cleanNation, forumBody } from './forum';
import { promptUrl } from './link';
import type { Prompt } from './model';

/** Text as Markdown reads it literally. */
export function markdownLiteral(text: string): string {
  return text.replace(/([\\`*_{}[\]()#+\-.!|<>~])/g, '\\$1');
}

/** Text as a wiki reads it literally. */
export function wikiLiteral(text: string): string {
  const safe = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return /[[\]{}|'=*#~_]/.test(text) ? `<nowiki>${safe}</nowiki>` : safe;
}

/** "Orioni: prompt 348", or "Prompt 348" while the nation has no name. */
function heading(prompt: Prompt, nation: string, literal: (text: string) => string): string {
  const name = cleanNation(nation);
  return name ? `${literal(name)}: prompt ${prompt.n}` : `Prompt ${prompt.n}`;
}

/**
 * Markdown: a heading, the prompt as a quotation, and the line saying where it came from, with
 * its link. The answer goes between the last two, or under them.
 */
export function asMarkdown(prompt: Prompt, siteUrl: string, nation = ''): string {
  return `## ${heading(prompt, nation, markdownLiteral)}\n\n${forumBody(prompt, siteUrl).trimEnd()}\n`;
}

/** Wikitext, for a section of the nation's page on IIWiki. */
export function asWikitext(prompt: Prompt, siteUrl: string, nation = ''): string {
  const from = `${facts(prompt).replace(/\.$/, '')}, from [${promptUrl(prompt.n, siteUrl)} Prompts], Eurth's worldbuilding prompt a day.`;
  return `== ${heading(prompt, nation, wikiLiteral)} ==\n<blockquote>${prompt.text}</blockquote>\n''${from}''\n`;
}

/** Plain text: what "Copy prompt" copies, under the nation's name if it has one. */
export function asPlainText(prompt: Prompt, siteUrl: string, nation = ''): string {
  const name = cleanNation(nation);
  return `${name ? `${name}\n\n` : ''}${copyText(prompt, siteUrl)}\n`;
}
