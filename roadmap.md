# Roadmap

Prompts gives worldbuilders one question a day about their own nation, at prompt.eurth.org. It is door 13 of Eurth's 2026 advent calendar and opens on 22 December 2026 at 00:00 Europe/Brussels.

Three parts: what comes next, what each release added (newest first), and what's not planned.

## Where to pick up

A new session starts here. Read `CLAUDE.md` (the brief) first; the handbook in eurth-org/eurth-style wins on everything shared (`node_modules/@eurth/style/HANDBOOK.md`). **The handbook changes: read its roadmap for what is new since the version in `package-lock.json`** (`node_modules/@eurth/style/roadmap.md`); the nightly run moves this repository to each new 1.x by itself. Astro needs Node 22.23 or newer. On Stijn's machine that is a Homebrew one: `export PATH=/opt/homebrew/opt/node@24/bin:$PATH` (on 22 November 2026 Homebrew's Node 26 would not start, for want of a library, until it is reinstalled).

**Done and pushed** (24 November 2026, on @eurth/style 1.11.0: `npm run check`, `npm run build`, `npm test`: 254 tests green, the handbook's shared suites among them, with 1.11.0's checks that a tool has taken on the shared parts; `npm run smoke`: all good in real Chrome, offline included; `npm run launch-check`: passes. `npm run axe` last ran here on 22 November: no findings on 372 pages in both themes; CI runs it on every push):

- The repo, the brief as `CLAUDE.md`, the licence, the README and the plan (approved by Stijn on 14 November 2026).
- **The logic** in `src/prompts/`, plain TypeScript. The README's table says which file holds what.
- **The bank: 366 of 366, all reviewed and approved by Stijn** (15 November 2026), in `src/content/prompts.json`. 192 come from the Eurth forum's own Worldbuilding Prompts list (`"from": "forum"`), cut to fit the card; 5 are the mock-up's; 169 were written for the site. The review sheets are `docs/review-batch-1.md` to `-5.md`; they show each prompt on the day it has now.
- **The site on @eurth/style 1.11.0** (the handbook's duties up to 1.10.0 were taken on on 22 November 2026; it began on 1.0.0's starter): Today, a page per prompt (and `/p/404/`), Archive, Guide, Good prompts and the not-found page, 372 pages in all, every prompt page in the sitemap.
- **The tool**, each part a card under a heading with an icon: the prompt with Answer on the Eurth forum; Another prompt (the suite's Random button, which never asks here: there is nothing to lose) and Copy prompt; Pick a theme; Earlier this month, or the days either side and more on the theme; the card as a picture in six sizes with "Download as" SVG, PNG and WebP; **Save & share** (the suite's share row, with Copy Markdown) and **Export** (Markdown, wikitext for IIWiki, plain text).
- **The tool's own mark** (`src/assets/mark.svg`): a tear-off calendar leaf with a turned corner, carrying the Eurth yurt as the suite draws it, in the middle of the leaf. It stands in front of the name in the header, is the favicon and the home-screen icon, and is on every sharing image and every card.
- **The written pages, from the suite's shared parts and with pictures**: the guide (page head, contents column, the worked example on its card, a prompt as written and bent, a tip, "Try it"); Good prompts (seven marks, each with a weak and a strong example on its card under "Weak." and "Strong.", the cultural iceberg with Orioni's forum topic, where the prompts come from); the archive (a tile per theme, picture first, then every prompt by theme). The pictures are prompt cards drawn at build time by the same code as the tool.
- **A sharing image for every prompt** (`public/og/`), remade on 24 November with the mark as it now stands and recompressed without loss (ImageOptim; every picture compared with its original, pixel for pixel).
- **Answer on the Eurth forum** opens a new topic in Factbooks and National Information (category 25), titled "<Nation>: <prompt>". The forum allows a title only once, so the tool asks for the nation's name first; it is kept in memory for the page only.
- **The launch gate** is part of `npm test` from the door's time on (and so in the launch workflow, which builds for that time): all 366 prompts written, sound, in order, in approved batches, each with its sharing image. Rehearsed again on 22 November with `EURTH_BUILD_TIME=2026-12-22T00:00:00+01:00`: the build and all 249 tests pass, the Today page shows prompt 356, and no page links to GitHub.
- **The page turn, judged** (22 November): stepped through frame by frame in a browser with motion on, the card swings away about its left edge and the next swings in, as a page does. Nobody has yet watched it at full speed with their own eyes: Stijn, say if it feels wrong.
- **Settled with Stijn on 15 November:** the guide's invented names (Tesmar, Port Halden, Orrin) stand; "world" is spelt the ordinary way; the site has no glossary and no profile buttons, and its start page's title drops the pattern's "maker". Good prompts stands where templates or examples would.
- **Settled with Stijn on 24 November:** the mark is a calendar leaf, and stays. The yurt stands in the middle of the leaf, not to the left of it (it had been moved aside to make room for the turned corner; the corner is now smaller instead). A test keeps it there.

**Waiting on Stijn:** nothing blocks. One thing to look at when there is a moment: the three written pages as they now look.

**Not checked yet:**

- **CI on the newest commit.** The run takes some twenty-six minutes (it passed on 22 November's commit, Lighthouse included); look at it before trusting the next nightly run.
- **Safari and Firefox.** Everything was looked at in Chrome. The WebP button names its file for what the browser really made (Safari hands back a PNG), by the suite's helper; nobody has pressed it in Safari.

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
- **The days were shuffled once, on 15 November 2026**, at Stijn's word, after all 366 were reviewed. The mock-up's five (10 to 14 December), batch 1 (22 December to 20 January) and the leap day's prompt stayed where they were; the other 330 were dealt out at random under the rules: no theme on two days running, every theme at least three times a month, and no theme away for more than two weeks (the longest wait is 13 days). **A prompt's number is its address: after launch it must never move.** Change a prompt's words if need be, never its number.
- **The leap day's prompt** (366) asks about something that happens once every four years.
- **The mark is a calendar leaf.** The handbook (since 1.8.0) asks every tool for a mark of its own with the yurt in it. This one is drawn in code from four plain shapes in the suite's colours; the yurt is the suite's own drawing, placed and sized as a whole, in the middle of the leaf. A test fails if its paths ever differ from the package's, or if it leaves the middle.
- **Export is Markdown, wikitext and plain text.** Markdown is what the forum takes; wikitext is a section for the nation's page on IIWiki; plain text is for anywhere else. Each carries the prompt as a quotation and its link, under the nation's name once the writer has typed it. The name is written so it can't turn into markup.
- **No drawn iceberg.** The cultural iceberg stays two lists, above and below the water, with a link to Orioni's forum topic and its diagram. A picture of an iceberg would be a drawing made in code, which Stijn has turned down elsewhere; the page's pictures are prompt cards.
- **The guide's pictures have marked places.** `src/content/guide.md` stays the one source of the guide's words; a line such as `<!-- figure: worked -->` marks where the page puts a picture (`src/site/guide.ts`). A test keeps the marks and the pictures in step.
- **The images were recompressed without loss** on 19 November (Stijn, with ImageOptim) and again on 22 and 24 November after the mark changed them all. `npm run images` writes larger files; run ImageOptim over `public/` afterwards if the size matters.

## Next

In order:

1. **The accessibility check takes long** with 372 pages: `eurth-axe` reads every one in both themes (about 20 minutes in CI). The prompt pages differ only in their words, so ask Foundations for a way to check a sample of a set of like pages (a change to @eurth/style, not to this repository's workflows).
2. **Stijn's eye** on the written pages and the page turn at full speed; change what he says.
3. **Launch:** 21 December 2026, 22:30 UTC, by the launch workflow. If it hasn't started by 22:45 UTC, start it by hand. It needs the organisation's `CLOUDFLARE_API_TOKEN`. Afterwards: delete `.github/workflows/launch.yml`, submit the sitemap in Search Console, add Prompts to status.eurth.org, tag 1.0.0 and write the release's section below.

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
