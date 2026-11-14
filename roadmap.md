# Roadmap

Prompts gives worldbuilders one question a day about their own nation, at prompt.eurth.org. It is door 13 of Eurth's 2026 advent calendar and opens on 22 December 2026 at 00:00 Europe/Brussels.

Three parts: what comes next, what each release added (newest first), and what's not planned.

## Where to pick up

A new session starts here. Read `CLAUDE.md` (the brief) first; the handbook in eurth-org/eurth-style wins on everything shared (`node_modules/@eurth/style/HANDBOOK.md`).

**Done and pushed** (`npm run check`, `npm run build`, `npm test`: 210 tests green, the handbook's shared suites among them):

- The repo, the brief as `CLAUDE.md`, the licence, the README and the plan (approved by Stijn on 14 November 2026).
- **The logic** in `src/prompts/`, plain TypeScript: model, the bank's rules and word lists, calendar, order of the year, Another prompt, archive, addresses, forum link, Copy prompt and the Share dialog's words, page titles and descriptions, the card as SVG in six sizes, the launch gate. The README's table says which file holds what.
- **The bank so far:** 35 of 366 prompts in `src/content/prompts.json`: the mock-up's five on 10 to 14 December (batch 0, Stijn's own) and review batch 1 (30 prompts, on 22 December to 20 January, so launch day and the weeks after it have a prompt).
- **The guide:** `src/content/guide.md`, with a worked example and seven sources.
- **The site**, from @eurth/style 1.0.0's starter template: Today (`/`), a page per prompt (`/p/<n>/`, and `/p/404/`), Archive, Guide and the not-found page; the prompt tool (`src/tool/PromptTool.svelte`) with Answer on the Eurth forum, Another prompt and its page turn, Copy prompt, the theme buttons, Earlier this month, previous and next, the share row and dialog, and the card as SVG, PNG or WebP in six sizes; a sharing image per prompt (`npm run images`); the three workflows, with the launch set for 22 December.
- **The launch gate** closes by itself: from the door's time on (and so in the launch workflow, which builds for that time), `npm test` fails unless all 366 prompts are written, sound, in order, in approved batches, and each has its sharing image. `npm run launch-check` asks at any time.

**Waiting on Stijn:**

- **Review batch 1** ([docs/review-batch-1.md](docs/review-batch-1.md)). No more prompts are written until it is reviewed. When it is: apply the changes to `src/content/prompts.json`, add `1` to `approved` in `src/content/review.json`, run `npm run images`, then write batch 2 (100 prompts) in the same voice as `docs/review-batch-2.md`.
- **The forum category** for "Answer on the Eurth forum": set its slug in `src/site/settings.ts`. "Factbooks and National Information" looks closest. Until then the topic opens with no category chosen.
- **Topic titles on the forum.** Discourse refuses a second topic with a title that already exists unless the "allow duplicate topic titles" setting is on. Two members answering the same prompt would both use the prompt as the title. Either switch that setting on (for the whole forum or for the category), or the title gets the writer's nation in front, which they would have to type.
- **The guide's example** uses the invented names Tesmar, Port Halden and Orrin. Say if any of them is already somebody's on Eurth.
- **Where the handbook and this site differ** (the handbook says to tell you):
  - No glossary and no templates page: the brief lists Today, Archive, a page per prompt and Guide. The archive stands in for examples.
  - No "Load profile" and "Save profile" buttons: Prompts makes nothing a nation would carry to another tool, and the profile has no section for it. `@eurth/profile` isn't installed.
  - The start page's title is "Prompts: a free worldbuilding prompt a day for worldbuilders"; the pattern's "maker" doesn't fit.

**Not checked yet:**

- **Offline in a real browser.** The service worker comes from @eurth/style and is in the build; the app's browser pane wouldn't register one, so offline use (above all: a prompt's address opened offline shows that prompt from the copy of the Today page) still wants a try in Chrome with `npm run preview`.
- **Lighthouse.** It runs in CI on `main`; not run locally.
- **The page turn**, by eye, in a browser with motion on.

## Decisions (say if any is wrong)

- **Numbering.** Prompts 1 to 365 are the days of an ordinary year (1 is 1 January, 59 is 28 February, 60 is 1 March, 365 is 31 December). Prompt 366 belongs to 29 February. So a date has the same prompt every year, 14 December is prompt 348 as on the mock-up, and the leap day's prompt comes round once every four years (it is always in the archive and in the random draw).
- **One theme per prompt.** The mock-up labels one prompt "Politics and history"; in the bank each prompt has a single theme, so the archive and the theme filter stay simple and the themes stay balanced: six themes with 46 prompts and two with 45.
- **Today without JavaScript.** The Today page is built with the prompt for the day in Brussels; the shared nightly run (23:10 UTC) rebuilds and deploys it just after midnight. So for an hour or so after midnight in summer, and ten minutes in winter, a visitor without JavaScript may see yesterday's prompt, with yesterday's date printed on it. With JavaScript, the page follows the visitor's own date at once.
- **"Another prompt" changes the address** to that prompt's own page (`/p/212/`), so Copy link always gives a link that works without JavaScript. The chosen theme rides in the query string (`?theme=economy`) for the visit. Nothing is stored.
- **Prompt 404** is the page at `/p/404/`, and the "page not found" page shows the same card. It isn't one of the 366 and stays out of the sitemap, the archive and the random draw.
- **Pictures are always Night**, like the suite's sharing images, whichever theme the visitor is using.
- **While the bank is unfinished**, a day with no prompt shows the next day's that has one. That can only be seen before launch: the launch gate needs all 366.

## Next

In order:

1. **The prompt bank.** Batch 1 (30) is drafted and waits for review. Then batches 2 to 4 (100 each) and batch 5 (the last 36, with the leap day's prompt and a few that suit their dates: New Year, 31 December), each shown as `docs/review-batch-N.md` and approved in `src/content/review.json`. The order of the year must hold once all are in: no theme two days running, every theme at least three times a month, 45 or 46 prompts a theme.
2. **Sharing images at full size.** Each is about 65 kB as Chrome saves it, so 367 of them come to about 24 MB in the repository. If that is too much, save them with fewer colours (the card has five) before committing the full set.
3. **Try it offline in Chrome** (`npm run preview`), and the page turn by eye; fix what turns up.
4. **Lighthouse** on `main` in CI: 100 in all four, or find out why not.
5. **The forum category and the topic-title question**, once Stijn has answered.
6. **Launch:** 21 December 2026, 22:30 UTC, by the launch workflow. If it hasn't started by 22:45 UTC, start it by hand. Afterwards: delete `.github/workflows/launch.yml`, submit the sitemap in Search Console, add Prompts to status.eurth.org, and write the release's section below.

### Done when

The handbook's checklist passes, Stijn has reviewed all 366 prompts, and every prompt page is in the sitemap.

## Releases

None yet.

## Not planned

- **Streaks, history, favourites or accounts.** Nothing is stored, on the device or anywhere else. The archive is the history.
- **Prompts about real countries, or with magic, aliens or fantasy races.** The bank is for realistic geofiction; a test keeps it that way.
- **Prompts written by a machine at visit time.** The bank is a fixed file that Stijn has read from first to last.
- **Answers kept on the site.** Answers belong on the Eurth forum, the wiki, or wherever the writer keeps their world.
