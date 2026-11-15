# Prompts

> A friendly note: Prompts is part of Eurth's advent calendar, and its door opens on 22 December 2026. The code is public, the site isn't yet. Please don't spoil the surprise before the door opens.

Prompts gives worldbuilders one question a day about their own nation: 366 of them, one for every day of a leap year, across politics, history, culture, economy, military, geography, daily life and characters. It is one of the free worldbuilding tools by [Eurth](https://eurth.org), a worldbuilding and roleplay community since 2004, and will live at prompt.eurth.org.

The site is built and checked but not live: it goes up when its door opens. All 366 prompts are written and reviewed; 192 of them come from the Eurth forum's own [Worldbuilding Prompts](https://eurth.org/t/worldbuilding-prompts/17685). Where work stands and what is next is in [roadmap.md](roadmap.md).

## How it works

- A static site built with Astro on [@eurth/style](https://style.eurth.org), the shared shell of Eurth's tools. There is no account and no server-side code, and nothing is stored: no streaks, no history.
- Every prompt has a day. Prompts 1 to 365 are the days of an ordinary year (1 is 1 January, 365 is 31 December); 366 is 29 February. So a date has the same prompt every year, and it is the same for everyone on that day.
- The Today page is built with the prompt for the day in Brussels, and a nightly run rebuilds it just after midnight, so it is right without JavaScript. With JavaScript it follows the visitor's own date.
- "Answer on the Eurth forum" is a plain link that opens a new topic in Factbooks and National Information, titled with the writer's nation and the prompt. The forum allows a title only once, so the tool asks for the nation's name first.
- Every prompt has a page of its own (`/p/348/`), plain HTML, listed in the archive and the sitemap. "Another prompt" draws at random, turns the card like a page and moves the address to that prompt's page; the theme in use rides in the query string (`?theme=economy`).
- The logic in `src/prompts/` is plain TypeScript with no browser or framework in it. The page, the downloads, the sharing images and the tests all use the same functions.
- Cloudflare serves the built files from `dist/` as Workers static assets on the `prompt.eurth.org` custom domain (`wrangler.jsonc`). The security headers, the service worker, the manifest, `robots.txt` and `llms.txt` are written by `@eurth/style` after the build.
- The service worker keeps the site's own pages and scripts for offline use, but not the 366 prompt pages or their sharing images: the whole bank travels in the script, so any prompt can be shown offline.

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
| "Answer on the Eurth forum" | `src/prompts/forum.ts`; its category in `src/site/settings.ts` |
| Copy prompt, the Share dialog's words, alternative text | `src/prompts/describe.ts` |
| Page titles and descriptions, the sitemap's list | `src/prompts/pages.ts` |
| The prompt card as SVG, in six sizes | `src/prompts/card.ts`; its colours, from the shared tokens, in `src/site/look.ts` |
| The bank itself | `src/prompts/bank.ts`, `src/content/prompts.json` |
| The launch gate, and which review batches are approved | `src/prompts/launch.ts`, `src/content/review.json` |
| The guide | `src/content/guide.md` |
| Good prompts: the seven marks and the iceberg | `src/content/craft.ts`, `src/pages/good-prompts.astro` |
| A review batch as a page to read | `tools/review-sheet.mjs`, into `docs/` |
| The tool: card, buttons, themes, sharing, the page turn | `src/tool/PromptTool.svelte` |
| Pages: Today, a page per prompt, archive, guide, good prompts, not found | `src/pages/` |
| Site name, address, pages in the header | `eurth.config.mjs` |
| Icons and sharing images (one per prompt) | `tools/make-images.mjs`, into `public/` and `public/og/` |
| Tests | `tests/` |

## Adding or changing prompts

1. Edit `src/content/prompts.json`: a number, a theme, the review batch, the text, and `"from": "forum"` if it comes from the forum's list.
2. Run `npm test`. The tests hold every prompt to the rules: one or two sentences, 200 characters at most, plain punctuation, British spelling, no real country, nothing magical or beyond today's technology, no theme two days running, and no two prompts that open alike or ask the same thing.
3. Write the batch up for review: `node tools/review-sheet.mjs <batch>` makes `docs/review-batch-<batch>.md`.
4. Once Stijn has approved it, add the batch's number to `approved` in `src/content/review.json`, run `npm run images` (it needs Google Chrome) and commit what it writes. Each approved prompt's sharing image carries its words, and a test fails if a prompt has changed since its picture was made.

## Local development

Astro 7 needs Node 22.23 or newer (CI runs on Node 26).

```bash
npm install
```

```bash
npm run dev
```

```bash
npm run check
```

```bash
npm run build
```

```bash
npm test
```

```bash
npm run axe
```

```bash
npm run preview
```

```bash
npm run images
```

```bash
npm run launch-check
```

`npm test` after a build also checks the built pages (the suite's shared checks and this site's own). `npm run preview` serves the built site as Cloudflare does, headers included, on http://localhost:8787. `npm run launch-check` says what still stands between the bank and launch.

## Deployment

The site runs as the `eurth-prompts` Worker (static assets only) on the Cloudflare account that holds the eurth.org zone. The custom domain in `wrangler.jsonc` owns the `prompt.eurth.org` DNS record. The three workflows in `.github/workflows/` call the shared ones in eurth-org/eurth-style:

- **CI** checks, builds and tests every push and pull request, and runs axe and Lighthouse on `main`. Before the door opens it deploys nothing; after, every green push to `main` is deployed.
- **Launch** runs at 22:30 UTC on 21 December 2026, builds the site as it will be at the door's time (`LAUNCH_AT`), tests it, waits for 00:00 in Brussels and deploys. If it hasn't started by 22:45 UTC, start it by hand. It refuses to launch while the bank is unfinished: from the door's time on, the launch gate is part of `npm test`.
- **Nightly** runs at 23:10 UTC: it updates @eurth/style within version 1, rebuilds (which also puts the new day's prompt on the Today page) and deploys if anything changed.

Deploying needs the organisation secret `CLOUDFLARE_API_TOKEN`; without it the step is skipped with a warning.

## Releasing

1. In the same commits as the work, update [roadmap.md](roadmap.md): move finished items out of Next, and add or extend the release's dated section.
2. Run `npm run check`, `npm run build`, `npm test` and `npm run axe`.
3. Bump the version in `package.json`, merge to `main`, and tag it.

## Credits

- Made by Orioni for [Eurth](https://eurth.org), a worldbuilding and roleplay community since 2004.
- Many prompts come from the forum's [Worldbuilding Prompts](https://eurth.org/t/worldbuilding-prompts/17685) list and the [daily prompts of December 2020](https://eurth.org/t/december-2020-event-daily-worldbuilding-prompts/3695), run by Fulgistan and the staff. The iceberg on the Good prompts page follows Orioni's [Cultural Iceberg Model](https://eurth.org/t/cultural-iceberg-model/17682) topic, after Edward T. Hall.
- Icons by [Font Awesome](https://fontawesome.com) Free (CC BY 4.0); sun and moon by [line-md](https://github.com/cyberalien/line-md) (MIT).
- The guide's sources are listed at its foot.

## Licence

Apache 2.0, see [LICENSE](LICENSE).
