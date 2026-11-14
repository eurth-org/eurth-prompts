/**
 * Addresses. A prompt lives at /p/<number>/, a page of its own that needs no JavaScript; the
 * theme a visitor is drawing from rides in the query string (?theme=economy) and nowhere
 * else. Nothing is stored.
 */
import { hasDate } from './calendar';
import { LOST_PROVINCE, isThemeId, type ThemeId } from './model';

/** The path of a prompt's page: "/p/348/". */
export function promptPath(n: number): string {
  return `/p/${n}/`;
}

/** The full address of a prompt's page. `siteUrl` has no slash at its end: "https://prompt.eurth.org". */
export function promptUrl(n: number, siteUrl: string): string {
  return `${siteUrl.replace(/\/+$/, '')}${promptPath(n)}`;
}

/**
 * The number of the prompt a path points to, with or without its closing slash. Undefined
 * for any other path, and for numbers no prompt has.
 */
export function numberFromPath(pathname: string): number | undefined {
  const match = /^\/p\/([1-9]\d{0,2})\/?$/.exec(pathname);
  if (!match) return undefined;
  const n = Number(match[1]);
  return hasDate(n) || n === LOST_PROVINCE.n ? n : undefined;
}

/** The theme named in a query string ("?theme=economy"), if it is one of the eight. */
export function themeFromSearch(search: string): ThemeId | undefined {
  const theme = new URLSearchParams(search).get('theme');
  return isThemeId(theme) ? theme : undefined;
}

/** A path with the theme in its query string, or as it was for "any theme". */
export function withTheme(path: string, theme: ThemeId | undefined): string {
  return theme ? `${path}?theme=${theme}` : path;
}
