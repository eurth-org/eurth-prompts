# Roadmap

Prompts gives worldbuilders one question a day about their own nation, at prompt.eurth.org. It is door 13 of Eurth's 2026 advent calendar and opens on 22 December 2026 at 00:00 Europe/Brussels.

Three parts: what comes next, what each release added (newest first), and what's not planned.

## Where to pick up

**14 November 2026.** The brief is saved, the repository exists, this plan is written, and the first 30 prompts are drafted in [docs/review-batch-1.md](docs/review-batch-1.md). Nothing is built. Both the plan and the 30 prompts are waiting for Stijn; the next step is Phase 1, step 1.

Waiting on others:

- **Stijn: the plan.** A go-ahead, or changes.
- **Stijn: review batch 1.** The 30 prompts set the voice for the rest. No more prompts are written until they are reviewed.
- **Stijn: the forum category** for "Answer on the Eurth forum". The forum's new-topic link takes a category; without one the topic opens uncategorised.
- **@eurth/style 1.0.0** is not released. On GitHub the repository holds only its brief; HANDBOOK.md and the starter template aren't pushed yet. Phase 2 can't start until it is: check `gh release list -R eurth-org/eurth-style`. This plan follows the handbook's rules as the foundations brief gives them; where the released handbook differs, the handbook wins.

## Decisions in this plan (say if any is wrong)

- **Numbering.** Prompts 1 to 365 are the days of an ordinary year (1 is 1 January, 59 is 28 February, 60 is 1 March, 365 is 31 December). Prompt 366 belongs to 29 February. So a date has the same prompt every year, 14 December is prompt 348 as on the mock-up, and the leap day's prompt comes round once every four years (it is always in the archive and in the random draw).
- **One theme per prompt.** The mock-up labels one prompt "Politics and history"; in the bank each prompt has a single theme, so the archive and the theme filter stay simple and the themes stay balanced: six themes with 46 prompts and two with 45.
- **No glossary page.** The brief lists Today, Archive, a page per prompt and Guide. The handbook's usual set also has a glossary; a prompt tool has no terms of its own to define. The archive stands in for templates and examples.
- **Today without JavaScript.** The site is static, so the Today page is rebuilt every night at midnight in Brussels and shows that day's prompt with its date printed beside it. With JavaScript, the page switches to the visitor's own date. Nothing is hidden by the visitor's clock; every prompt is in the archive from day one.
- **"Another prompt" changes the address** to that prompt's own page (`/p/212`), so Copy link always gives a link that works without JavaScript. The chosen theme rides in the query string (`?theme=economy`) for the visit. Nothing is stored.
- **Prompt 404** is the page at `/p/404`, and the site's "page not found" page shows the same card. It isn't one of the 366 and stays out of the sitemap and the random draw.

## Next

### Phase 1: the logic and the words (needs nothing from @eurth/style)

Plain TypeScript in `src/prompts/`, tests in `tests/`, as Flagwright keeps its engine in `src/flag/`. Only TypeScript and Vitest are installed. Commit and push after each step.

1. **Model and the bank's rules** (`model.ts`): the eight themes, a prompt (number, theme, text), and a check of the whole bank that the tests run:
   - 366 prompts, numbered 1 to 366, none missing or doubled; six themes with 46 and two with 45.
   - Each is one or two sentences, 200 characters at most, and speaks to "your nation" (or your capital, your army and so on).
   - No two prompts share their opening words or ask the same thing twice.
   - A word list catches what doesn't belong: real countries and peoples, magic and fantasy words, technology beyond today, American spellings, emoji.
2. **Calendar** (`calendar.ts`): a date to its prompt number and back, and "today" in a time zone (Europe/Brussels by default, the visitor's own in the browser). Tested at midnight on both sides, across the clock changes, in leap and ordinary years, and in zones either side of the date line.
3. **Order of the year** (tests on the data): the day after never has the same theme as the day before; every theme appears at least three times a month; a few prompts sit on dates that suit them (29 February, New Year, the mock-up's 10 to 14 December).
4. **Another prompt** (`draw.ts`): a random draw, any theme or one, never the prompt already showing. The random source is passed in, so the tests are exact.
5. **Archive** (`archive.ts`): the prompts by theme and by month, previous and next, and "Earlier this month".
6. **Forum and sharing** (`forum.ts`, `describe.ts`): the new-topic link (the prompt as title; the prompt, its number and its link as body; the category), the text for Copy prompt, and the title and text the Share dialog needs.
7. **The card** (`card.ts`): the prompt card as an SVG string in the handbook's six sizes (1200 x 630, 1080 x 1080, 1080 x 1350, 1080 x 1920, 1000 x 1500, 1600 x 900), with a title and description inside. Lines are wrapped by a table of letter widths; colours come in as a palette, so the site can pass @eurth/style's tokens later. A test checks that every prompt fits every size.
8. **Page words** (`pages.ts`): a title and a description for each prompt page, each one different, and the list of addresses for the sitemap (Today, Archive, Guide and all 366 prompt pages).
9. **The prompt bank** (`src/content/prompts.json`), in review batches:
   - Batch 1: 30 prompts. Drafted, waiting for review.
   - Batches 2 to 4: 100 prompts each, written in the reviewed voice, shown as `docs/review-batch-N.md`.
   - Batch 5: the last 36.
   - `src/content/review.json` records which batches Stijn has approved. A launch test fails while any batch is unapproved.
10. **The guide** (`src/content/guide.md`): how to use a prompt alone (ten minutes, one decision, then what follows from it; turning an answer into a wiki paragraph or a factbook entry) and with a group (everyone answers the same prompt; neighbours answer for each other's nations; a prompt of the week on the forum; using a prompt to open a roleplay). What makes an answer good in realistic geofiction: costs, losers and consequences. With sources and a last-updated date.

### Phase 2: the site (only once @eurth/style 1.0.0 is released)

11. Start from the starter template in eurth-style; read HANDBOOK.md first, and where it differs from this plan, the handbook wins.
12. Pages: Today (`/`), Archive (`/archive/`, every prompt under its theme, readable without JavaScript), one page per prompt (`/p/1` to `/p/366`, plus `/p/404`), Guide (`/guide/`), and the "page not found" page. Each with its own title, description and canonical link; JSON-LD (WebApplication on Today, BreadcrumbList on prompt pages and the guide, Article on the guide, ItemList on the archive); sitemap.xml with every prompt page, robots.txt, llms.txt.
13. The Today tool, as a Svelte 5 island: the card with its date, theme and number; Answer on the Eurth forum; Another prompt; Copy prompt; the theme chips; Earlier this month; Copy link and Share. The page arrives as real HTML with the Brussels date's prompt, then follows the visitor's date.
14. Each prompt page: the card, the date it belongs to, its theme, previous and next, the same buttons, and three more prompts from the same theme.
15. Sharing: the handbook's Share dialog; the card as a picture in the six sizes, as SVG, PNG and WebP; Copy picture; an Open Graph image for every page. With 366 prompt pages that is 366 sharing images: make them with the handbook's image script and check their total size against what the handbook allows before committing them.
16. Delight: the card turns like a page when a new prompt appears (under half a second, nothing for reduced motion); toasts in the tool's voice; prompt 404; the suite's own touches from @eurth/style.
17. Offline, install, security headers, axe and Lighthouse checks, as the handbook asks. The whole bank travels with the page, so Today and Another prompt work offline.
18. CI, the nightly rebuild at midnight in Brussels (so the Today page's HTML is right without JavaScript), and the launch workflow: `LAUNCH_AT` is `2026-12-22T00:00:00+01:00`, the scheduled run starts at 22:30 UTC on 21 December, and it also runs by hand. No custom domain and no workers.dev deploy before then.
19. README (use, development, deployment), docs/feedback-log.md, and the handbook's checklist.

### Done when

The handbook's checklist passes, Stijn has reviewed all 366 prompts, and every prompt page is in the sitemap.

## Releases

None yet.

## Not planned

- **Streaks, history, favourites or accounts.** Nothing is stored, on the device or anywhere else. The archive is the history.
- **Prompts about real countries, or with magic, aliens or fantasy races.** The bank is for realistic geofiction; a test keeps it that way.
- **Prompts written by a machine at visit time.** The bank is a fixed file that Stijn has read from first to last.
- **Answers kept on the site.** Answers belong on the Eurth forum, the wiki, or wherever the writer keeps their world.
