# Roadmap

Prompts gives worldbuilders one question a day about their own nation, at prompt.eurth.org. It is door 13 of Eurth's 2026 advent calendar and opens on 22 December 2026 at 00:00 Europe/Brussels.

Three parts: what comes next, what each release added (newest first), and what's not planned.

## Where to pick up

A new session starts here. Read `CLAUDE.md` (the brief) first; the handbook in eurth-org/eurth-style wins on everything shared (`node_modules/@eurth/style/HANDBOOK.md`). Astro needs Node 22.23 or newer; on Stijn's machine that is the Homebrew one (`export PATH=/opt/homebrew/bin:$PATH`).

**Done and pushed** (`npm run check`, `npm run build`, `npm test`: 219 tests green, the handbook's shared suites among them; `npm run axe`: no findings on 372 pages in both themes; `npm run launch-check`: passes):

- The repo, the brief as `CLAUDE.md`, the licence, the README and the plan (approved by Stijn on 14 November 2026).
- **The logic** in `src/prompts/`, plain TypeScript. The README's table says which file holds what.
- **The bank: 366 of 366, all reviewed and approved by Stijn** (15 November 2026), in `src/content/prompts.json`. 192 come from the Eurth forum's own Worldbuilding Prompts list (`"from": "forum"`), cut to fit the card; 5 are the mock-up's; 169 were written for the site. The review sheets are `docs/review-batch-1.md` to `-5.md`.
- **The guide** (`src/content/guide.md`) and **Good prompts** (`src/content/craft.ts`, `src/pages/good-prompts.astro`): seven marks of a good prompt with a weak and a strong example each, the cultural iceberg model with Orioni's forum topic, and where the prompts come from.
- **The site**, from @eurth/style 1.0.0's starter template: Today, a page per prompt (and `/p/404/`), Archive, Guide, Good prompts and the not-found page, 372 pages in all, every prompt page in the sitemap; the prompt tool with Answer on the Eurth forum, Another prompt and its page turn, Copy prompt, the theme buttons, Earlier this month, previous and next, the share row and dialog, and the card as SVG, PNG or WebP in six sizes; a sharing image for every prompt (`public/og/`, 22 MB); the three workflows, with the launch set for 22 December.
- **Answer on the Eurth forum** opens a new topic in Factbooks and National Information (category 25), titled "<Nation>: <prompt>". The forum allows a title only once, so the tool asks for the nation's name first; it is kept in memory for the page only.
- **The launch gate** is part of `npm test` from the door's time on (and so in the launch workflow, which builds for that time): all 366 prompts written, sound, in order, in approved batches, each with its sharing image. Rehearsed on 15 November with `EURTH_BUILD_TIME=2026-12-22T00:00:00+01:00`: the build and all tests pass, and the Today page shows prompt 356.
- **Checked in real Chrome** (15 November): the service worker installs and keeps 21 files; offline, Today, the archive and Good prompts open, a prompt's own address shows that prompt, and Another prompt still draws; nothing is stored.
- **Settled with Stijn on 15 November:** the guide's invented names (Tesmar, Port Halden, Orrin) stand; "world" is spelt the ordinary way; the site has no glossary and no profile buttons, and its start page's title drops the pattern's "maker". Good prompts stands where templates or examples would.

**Waiting on Stijn:**

- **Whether to shuffle the days** (Next, item 2). It has to be decided before launch.

**Not checked yet:**

- **The page turn**, by eye, in a browser with motion on.
- **CI on the full site.** CI's Lighthouse and axe steps passed on `main` at 141 pages. With 372 pages the axe step takes well over ten minutes: see Next.

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
- **The themes run in turn** from 21 January to 9 December (politics, history, culture, economy, military, geography, daily life, characters). It keeps the rules about order true by construction; the days can be shuffled before launch, while no address is public yet.
- **The leap day's prompt** (366) asks about something that happens once every four years.

## Next

In order:

1. **The page turn by eye**, with motion on; fix what turns up.
2. **The order of the days.** The themes run in turn from 21 January to 9 December (politics, history, culture, economy, military, geography, daily life, characters), which keeps the rules about order true by construction but means the same theme every eighth day. The days can be shuffled before launch, while no address is public yet; after launch a prompt's number is its address and must not move. A shuffle changes numbers, so run `npm run images` after it (every picture carries its date and number) and `npm run launch-check`.
3. **The accessibility check takes long** with 372 pages: `eurth-axe` reads every one in both themes. The prompt pages differ only in their words, so ask Foundations for a way to check a sample of a set of like pages (a change to @eurth/style, not to this repository's workflows).
4. **The sharing images weigh 22 MB** in the repository. If that becomes a nuisance, save them with fewer colours (the card has five).
5. **Launch:** 21 December 2026, 22:30 UTC, by the launch workflow. If it hasn't started by 22:45 UTC, start it by hand. It needs the organisation's `CLOUDFLARE_API_TOKEN`. Afterwards: delete `.github/workflows/launch.yml`, submit the sitemap in Search Console, add Prompts to status.eurth.org, tag 1.0.0 and write the release's section below.

### After launch

- New prompts can replace old ones, but a number keeps its day: change the words, never the address.
- A glossary, if the forum asks for one.

### Done when

The handbook's checklist passes, Stijn has reviewed all 366 prompts, and every prompt page is in the sitemap.

## Releases

None yet.

## Not planned

- **Streaks, history, favourites or accounts.** Nothing is stored, on the device or anywhere else. The archive is the history.
- **Prompts about real countries, or with magic, aliens or fantasy races.** The bank is for realistic geofiction; a test keeps it that way.
- **Prompts written by a machine at visit time.** The bank is a fixed file that Stijn has read from first to last.
- **Answers kept on the site.** Answers belong on the Eurth forum, the wiki, or wherever the writer keeps their world.
