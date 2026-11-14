You're building Prompts (prompt.eurth.org), a worldbuilding prompt a day, one of Eurth's free worldbuilding tools. Eurth (eurth.org) is a worldbuilding and roleplay community since 2004, focused on realistic geofiction and political simulation on a human-only world with modern technology. The attached repo is eurth-org/eurth-prompts.

Working order (Foundations and many other tools are being built at the same time tonight):
1. Save this brief as CLAUDE.md.
2. If the repo named above doesn't exist on GitHub yet, create it as a public, empty repo in eurth-org with the gh CLI and connect this folder; if you can't, ask me.
3. Read what already exists of github.com/eurth-org/eurth-style (HANDBOOK.md); it may still be in progress. Write the plan and show it to me.
4. Build the tool's core logic as plain TypeScript modules with thorough tests, and its content (the prompt bank, in the review batches below, and the guide). None of that needs eurth-style.
5. Only once @eurth/style 1.0.0 is released (check the releases of github.com/eurth-org/eurth-style), start the site from its starter template and carry on to the end of this brief. Until then, don't scaffold the site, pages or styles.
6. Commit and push after every finished step, and keep roadmap.md up to date with exactly where to pick up, so a new session can continue if this one stops.

Background for every step: Read HANDBOOK.md in github.com/eurth-org/eurth-style and start from its starter template; look at github.com/eurth-org/eurth-flag, the reference build. The handbook wins over this brief on everything shared. Then write a plan and show it to me before you build.

Mock-up: the "prompt.eurth.org, a worldbuilding prompt a day" board on https://claude.ai/artifact/32RKDdVTtCfHsL6Qc6LxV6.

Pages: Today, Archive (every prompt, by theme), one page per prompt (/p/348), Guide (how to use prompts, alone or with a group).

The prompts
- A bank of 366 prompts in a data file in the repo, one for each day of a leap year, across eight themes: politics, history, culture, economy, military, geography, daily life and characters. Each prompt is one or two sentences, a question that makes the writer decide something about their own nation, never about a real country.
- They fit realistic geofiction: no magic, no aliens, no fantasy races; technology up to today. Draft them all, then show me 30 for review before writing the rest in the same voice, and again in batches of 100.
- Today's prompt follows the visitor's date (Europe/Brussels by default), and it's the same for everyone on that day. Every prompt also has its own static page, so the archive is fully readable without JavaScript and can rank in search.
- "Another prompt" draws at random, optionally within a theme. Nothing is stored: no streaks, no history.

Sharing
- "Answer on the Eurth forum" opens a new topic on eurth.org with the prompt as title and body (ask me which category it should go to), plus the handbook's share dialog and an image of the prompt card at the handbook's sizes.

Signature touch: the prompt card turns like a page when a new one appears. Easter egg: prompt 404 is "Your nation's census office lost a whole province. Where did it go?"

Done when the handbook's checklist passes, all 366 prompts are reviewed by me, and every prompt page is in the sitemap.
