/**
 * The prompt card as a picture for the written pages: the guide, Good prompts and the archive
 * show what they explain with cards drawn by the same code as the tool. Build time only.
 */
import { card, type CardSizeId } from '../prompts/card';
import type { Prompt } from '../prompts/model';
import { cardLook, cardMark } from './look';

/** A card as an address an <img> can show. `label` replaces the line above an example that is in nobody's bank. */
export function cardPicture(prompt: Prompt, site: { name: string; host: string }, { size = 'preview', label }: { size?: CardSizeId; label?: string } = {}): string {
  const svg = card(prompt, { size, look: cardLook(), siteName: site.name, siteHost: site.host, mark: cardMark(), label });
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
