/**
 * Where the guide's pictures go. The guide's words are Markdown (src/content/guide.md); a line
 * there such as "<!-- figure: worked -->" marks the place of a picture, and the page puts a
 * prompt card at each mark. A test checks the marks in the file are exactly the ones named here.
 */

/** The pictures the guide's page knows how to draw. */
export const FIGURES = ['worked', 'bend'] as const;
export type FigureName = (typeof FIGURES)[number];

/** The prompt the guide answers as its worked example. */
export const WORKED = 348;

/** "Bend it": a prompt as written, and the same prompt with its noun swapped for a nation it doesn't fit. */
export const BENT = {
  n: 345,
  text: "Your river police's oldest boat is retired. Who wants to keep it afloat?",
  label: 'Prompt 345, bent for a nation with no coast',
} as const;

const MARK = /<!--\s*figure:\s*([a-z-]+)\s*-->/g;

/** The names of the pictures a text asks for, in order. */
export function figuresIn(text: string): string[] {
  return [...text.matchAll(MARK)].map((match) => match[1]!);
}

export type GuidePart = { html: string } | { figure: FigureName };

/** The guide's HTML cut at its marks: runs of HTML, with the name of a picture between them. */
export function splitAtFigures(html: string, known: readonly FigureName[] = FIGURES): GuidePart[] {
  const parts: GuidePart[] = [];
  let from = 0;
  for (const match of html.matchAll(MARK)) {
    const name = match[1]!;
    if (!(known as readonly string[]).includes(name)) throw new Error(`The guide asks for a picture this page can't draw: "${name}".`);
    parts.push({ html: html.slice(from, match.index) }, { figure: name as FigureName });
    from = match.index + match[0].length;
  }
  parts.push({ html: html.slice(from) });
  return parts.filter((part) => !('html' in part) || part.html.trim() !== '');
}
