# Roadmap

Prompts gives worldbuilders one question a day about their own nation, at prompt.eurth.org. It is door 13 of Eurth's 2026 advent calendar and opens on 22 December 2026 at 00:00 Europe/Brussels.

Three parts: what comes next, what each release added (newest first), and what's not planned.

## Where to pick up

A new session starts here. Read `CLAUDE.md` (the brief) first; the handbook in eurth-org/eurth-style wins on everything shared (`node_modules/@eurth/style/HANDBOOK.md`). Astro needs Node 22.23 or newer; on Stijn's machine that is the Homebrew one (`export PATH=/opt/homebrew/bin:$PATH`).

**Done and pushed** (`npm run check`, `npm run build`, `npm test`: 219 tests green, the handbook's shared suites among them; `npm run axe`: no findings on 141 pages in both themes):

- The repo, the brief as `CLAUDE.md`, the licence, the README and the plan (approved by Stijn on 14 November 2026).
- **The logic** in `src/prompts/`, plain TypeScript. The README's table says which file holds what.
- **The bank so far: 135 of 366** in `src/content/prompts.json`.
  - Batch 0: the mock-up's five, on 10 to 14 December. Stijn's own.
  - Batch 1: 30 prompts, on 22 December to 20 January. **Approved by Stijn on 15 November 2026.**
  - Batch 2: 100 prompts on 21 January to 30 April, all from the Eurth forum's own Worldbuilding Prompts list (`"from": "forum"`), cut to fit the card. **Waiting for review:** [docs/review-batch-2.md](docs/review-batch-2.md).
- **The guide** (`src/content/guide.md`) and **Good prompts** (`src/content/craft.ts`, `src/pages/good-prompts.astro`): seven marks of a good prompt with a weak and a strong example each, the cultural iceberg model with Orioni's forum topic, and where the prompts come from.
- **The site**, from @eurth/style 1.0.0's starter template: Today, a page per prompt (and `/p/404/`), Archive, Guide, Good prompts and the not-found page; the prompt tool with Answer on the Eurth forum, Another prompt and its page turn, Copy prompt, the theme buttons, Earlier this month, previous and next, the share row and dialog, and the card as SVG, PNG or WebP in six sizes; a sharing image for each approved prompt; the three workflows, with the launch set for 22 December.
- **Answer on the Eurth forum** opens a new topic in Factbooks and National Information (category 25), titled "<Nation>: <prompt>". The forum allows a title only once, so the tool asks for the nation's name first; it is kept in memory for the page only.
- **The launch gate** closes by itself: from the door's time on (and so in the launch workflow, which builds for that time), `npm test` fails unless all 366 prompts are written, sound, in order, in approved batches, and each has its sharing image. `npm run launch-check` asks at any time.
- **Checked in real Chrome** (15 November): the service worker installs and keeps 21 files; offline, Today, the archive and Good prompts open, a prompt's own address shows that prompt, and Another prompt still draws; nothing is stored.

**Waiting on Stijn:**

- **Review batch 2** ([docs/review-batch-2.md](docs/review-batch-2.md)): 100 prompts from the forum's list. When it is reviewed: apply the changes to `src/content/prompts.json`, add `2` to `approved` in `src/content/review.json`, run `npm run images`, then write batch 3 with `node tools/review-sheet.mjs 3`.
- **The guide's example** uses the invented names Tesmar, Port Halden and Orrin. Say if any of them is already somebody's on Eurth.
- **Where the handbook and this site still differ** (the handbook says to tell you):
  - No glossary. Good prompts stands where templates or examples would; the archive is the gallery.
  - No "Load profile" and "Save profile" buttons: Prompts makes nothing a nation would carry to another tool, and the profile has no section for it. `@eurth/profile` isn't installed.
  - The start page's title is "Prompts: a free worldbuilding prompt a day for worldbuilders"; the pattern's "maker" doesn't fit.

**Not checked yet:**

- **Lighthouse on the newest pages.** CI's Lighthouse and axe steps passed on `main` on 14 November, and nothing was deployed (the door is shut). The Good prompts page and the nation field came after that run: look at the next one.
- **The page turn**, by eye, in a browser with motion on.

## Decisions (say if any is wrong)

- **Numbering.** Prompts 1 to 365 are the days of an ordinary year (1 is 1 January, 59 is 28 February, 60 is 1 March, 365 is 31 December). Prompt 366 belongs to 29 February. So a date has the same prompt every year, 14 December is prompt 348 as on the mock-up, and the leap day's prompt comes round once every four years (it is always in the archive and in the random draw).
- **One theme per prompt.** The mock-up labels one prompt "Politics and history"; in the bank each prompt has a single theme, so the archive and the theme filter stay simple and the themes stay balanced: six themes with 46 prompts and two with 45.
- **The forum's prompts, cut to fit.** The forum's list has seven sections (geography, history, politics, economy, demographics, culture, connecting the dots) and prompts that ask several questions at once. Here they are spread over the brief's eight themes and cut to one or two sentences. Real-world and fantasy references are left out (Christmas and Halloween, a Kaiju attack, more than one moon). The forum's spelling "wurld" is written "world", since the site is for any worldbuilder.
- **Forum topic titles carry the nation.** "Orioni: Your nation's capital moved two centuries ago. Why, and who still resents it?" Without JavaScript nobody can type a name, so the link's title starts with "[Your nation]" for the writer to replace.
- **Today without JavaScript.** The Today page is built with the prompt for the day in Brussels; the shared nightly run (23:10 UTC) rebuilds and deploys it just after midnight. So for an hour or so after midnight in summer, and ten minutes in winter, a visitor without JavaScript may see yesterday's prompt, with yesterday's date printed on it. With JavaScript, the page follows the visitor's own date at once.
- **"Another prompt" changes the address** to that prompt's own page (`/p/212/`), so Copy link always gives a link that works without JavaScript. The chosen theme rides in the query string (`?theme=economy`) for the visit. Nothing is stored.
- **Prompt 404** is the page at `/p/404/`, and the "page not found" page shows the same card. It isn't one of the 366 and stays out of the sitemap, the archive and the random draw.
- **Pictures are always Night**, like the suite's sharing images, whichever theme the visitor is using.
- **Sharing images only for approved prompts.** A prompt waiting for review uses the site's own sharing image until its words are settled.
- **While the bank is unfinished**, a day with no prompt shows the next day's that has one. That can only be seen before launch: the launch gate needs all 366.
- **The themes run in turn** through batch 2 (politics, history, culture, economy, military, geography, daily life, characters). It keeps the rules about order true by construction; the days can be shuffled before launch, while no address is public yet.

## Next

In order:

1. **The prompt bank.** Batch 2 waits for review. Then batch 3 and 4 (100 each) and batch 5 (the last 31, with the leap day's prompt and a few that suit their dates: New Year, 31 December). The forum's list still has some 90 prompts not yet used (its sections on religion, health, education, language, foreign relations and "connecting the dots" above all); use those first, then write new ones in the voice of batch 1. The order of the year must hold once all are in: no theme two days running, every theme at least three times a month, 45 or 46 prompts a theme.
2. **Sharing images at full size.** Each is about 65 kB as Chrome saves it, so 367 of them come to about 24 MB in the repository. If that is too much, save them with fewer colours (the card has five) before committing the full set.
3. **The page turn by eye**, with motion on; fix what turns up.
4. **Lighthouse** on `main` in CI: it passes the suite's thresholds; look at the report for anything short of 100.
5. **Launch:** 21 December 2026, 22:30 UTC, by the launch workflow. If it hasn't started by 22:45 UTC, start it by hand. Afterwards: delete `.github/workflows/launch.yml`, submit the sitemap in Search Console, add Prompts to status.eurth.org, and write the release's section below.

### Done when

The handbook's checklist passes, Stijn has reviewed all 366 prompts, and every prompt page is in the sitemap.

## Releases

None yet.

## Not planned

- **Streaks, history, favourites or accounts.** Nothing is stored, on the device or anywhere else. The archive is the history.
- **Prompts about real countries, or with magic, aliens or fantasy races.** The bank is for realistic geofiction; a test keeps it that way.
- **Prompts written by a machine at visit time.** The bank is a fixed file that Stijn has read from first to last.
- **Answers kept on the site.** Answers belong on the Eurth forum, the wiki, or wherever the writer keeps their world.
