# Roadmap

Prompts gives worldbuilders one question a day about their own nation, at prompt.eurth.org. It is door 13 of Eurth's 2026 advent calendar and opens on 22 December 2026 at 00:00 Europe/Brussels.

Three parts: what comes next, what each release added (newest first), and what's not planned.

## Where to pick up

A new session starts here. Read `CLAUDE.md` (the brief) first; the handbook in eurth-org/eurth-style wins on everything shared.

**Done, all pushed, 129 tests green (`npm test`, `npm run check`):**

- The repo, the brief as `CLAUDE.md`, the licence, the README and this plan (approved by Stijn on 14 November 2026).
- **The logic** in `src/prompts/`, plain TypeScript: the model (`model.ts`), the bank's rules and word lists (`check.ts`, `words.ts`), the calendar (`calendar.ts`), the order of the year (`order.ts`), Another prompt (`draw.ts`), the archive (`archive.ts`), addresses (`link.ts`), the forum link (`forum.ts`), Copy prompt and the Share dialog's words (`describe.ts`), page titles, descriptions and the sitemap list (`pages.ts`), and the card as SVG in the six sizes (`card.ts`). `bank.ts` is the only module that reads the files in `src/content/`.
- **The bank so far:** 35 of 366 prompts in `src/content/prompts.json`: the mock-up's five on 10 to 14 December (batch 0, Stijn's own) and review batch 1 (30 prompts, on 22 December to 20 January, so launch day and the weeks after it have a prompt).
- **The guide:** `src/content/guide.md`, with a worked example and seven sources. A test holds its links, its quoted prompt and its spelling.
- **The launch gate:** `npm run launch-check` fails until all 366 prompts are written, sound, in order and in approved batches (`src/content/review.json`). The launch workflow must run it before deploying.

**Waiting on Stijn:**

- **Review batch 1** ([docs/review-batch-1.md](docs/review-batch-1.md)). No more prompts are written until it is reviewed. When it is: apply the changes to `src/content/prompts.json`, add `1` to `approved` in `src/content/review.json`, then write batch 2 (100 prompts) in the same voice as `docs/review-batch-2.md`.
- **The forum category** for "Answer on the Eurth forum" (`forumLink` takes its slug). "Factbooks and National Information" looks closest.
- **Topic titles on the forum.** Discourse refuses a second topic with a title that already exists unless the "allow duplicate topic titles" setting is on. Two members answering the same prompt would both use the prompt as the title. Either switch that setting on (for the whole forum or for the category), or the title gets the writer's nation in front, which they would have to type.
- **The guide's example** uses the invented names Tesmar, Port Halden and Orrin. Say if any of them is already somebody's on Eurth.

**@eurth/style 1.0.0 was released on 14 November 2026**, so the site is no longer blocked. Next: Phase 2, from its first step.

## Decisions in this plan (say if any is wrong)

- **Numbering.** Prompts 1 to 365 are the days of an ordinary year (1 is 1 January, 59 is 28 February, 60 is 1 March, 365 is 31 December). Prompt 366 belongs to 29 February. So a date has the same prompt every year, 14 December is prompt 348 as on the mock-up, and the leap day's prompt comes round once every four years (it is always in the archive and in the random draw).
- **One theme per prompt.** The mock-up labels one prompt "Politics and history"; in the bank each prompt has a single theme, so the archive and the theme filter stay simple and the themes stay balanced: six themes with 46 prompts and two with 45.
- **No glossary page.** The brief lists Today, Archive, a page per prompt and Guide. The handbook's usual set also has a glossary; a prompt tool has no terms of its own to define. The archive stands in for templates and examples.
- **Today without JavaScript.** The site is static, so the Today page is rebuilt every night at midnight in Brussels and shows that day's prompt with its date printed beside it. With JavaScript, the page switches to the visitor's own date. Nothing is hidden by the visitor's clock; every prompt is in the archive from day one.
- **"Another prompt" changes the address** to that prompt's own page (`/p/212`), so Copy link always gives a link that works without JavaScript. The chosen theme rides in the query string (`?theme=economy`) for the visit. Nothing is stored.
- **Prompt 404** is the page at `/p/404`, and the site's "page not found" page shows the same card. It isn't one of the 366 and stays out of the sitemap and the random draw.

## Next

### The prompt bank (the rest of Phase 1)

Phase 1's logic and guide are done (see "Where to pick up"). What is left of it is the writing:

- Batch 1: 30 prompts. Drafted, waiting for review.
- Batches 2 to 4: 100 prompts each, written in the reviewed voice, shown as `docs/review-batch-N.md`.
- Batch 5: the last 36, with the leap day's prompt (366) and a few that suit their dates (New Year, 31 December).
- Once all are in: `npm run launch-check` must pass. It also checks the order of the year: no theme two days running, every theme at least three times a month, 45 or 46 prompts a theme.

### Phase 2: the site (@eurth/style 1.0.0 is out)

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
