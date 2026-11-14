# Prompts

> A friendly note: Prompts is part of Eurth's advent calendar, and its door opens on 22 December 2026. The code is public, the site isn't yet. Please don't spoil the surprise before the door opens.

Prompts gives worldbuilders one question a day about their own nation: 366 of them, one for every day of a leap year, across politics, history, culture, economy, military, geography, daily life and characters. It is one of the free worldbuilding tools by [Eurth](https://eurth.org), a worldbuilding and roleplay community since 2004, and will live at prompt.eurth.org.

The logic, the guide and the first prompts are written; the site comes next. The plan, and exactly where work stands, is in [roadmap.md](roadmap.md). The first 30 prompts, waiting for review, are in [docs/review-batch-1.md](docs/review-batch-1.md).

## Where things live

| What | Where |
| --- | --- |
| The eight themes, what a prompt is, the easter egg | `src/prompts/model.ts` |
| The bank's rules, and the words that don't belong in a prompt | `src/prompts/check.ts`, `src/prompts/words.ts` |
| Which prompt belongs to which day; "today" in a time zone | `src/prompts/calendar.ts` |
| The spread of themes over the year | `src/prompts/order.ts` |
| Another prompt: the random draw | `src/prompts/draw.ts` |
| By theme, by month, neighbours, "Earlier this month" | `src/prompts/archive.ts` |
| Addresses (`/p/348/`, `?theme=economy`) | `src/prompts/link.ts` |
| "Answer on the Eurth forum" | `src/prompts/forum.ts` |
| Copy prompt, the Share dialog's words, alternative text | `src/prompts/describe.ts` |
| Page titles and descriptions, the sitemap's list | `src/prompts/pages.ts` |
| The prompt card as SVG, in six sizes | `src/prompts/card.ts` |
| The bank itself, and the launch gate | `src/prompts/bank.ts`, `src/content/prompts.json`, `src/content/review.json` |
| The guide | `src/content/guide.md` |
| Tests | `tests/` |

## Adding prompts

Add them to `src/content/prompts.json` with a number (see below), a theme, the review batch and the text, then run `npm test`. The tests hold every prompt to the rules: one or two sentences, 200 characters at most, plain punctuation, British spelling, no real country, nothing magical or beyond today's technology, no theme two days running, and no two prompts that open alike or ask the same thing.

Prompts 1 to 365 are the days of an ordinary year (1 is 1 January, 365 is 31 December); 366 is 29 February. So a date has the same prompt every year.

## Development

Node 22 or newer.

```bash
npm install
```

```bash
npm run check
```

```bash
npm test
```

```bash
npm run launch-check
```

`npm run launch-check` is the launch gate: it fails until all 366 prompts are written, sound and approved.

## Licence

Apache 2.0, see [LICENSE](LICENSE).
