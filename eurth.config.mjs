// What this tool is called and where it lives. Read at build time only: astro.config.mjs, the
// frontmatter of .astro pages, tests and tools/. Never import this from a Svelte component or a
// <script>: it pulls in the list of every Eurth tool, and browser code must not carry that
// (HANDBOOK.md, Launch). Hand the component what it needs as props instead.
import { defineSite } from '@eurth/style/build';
import { lineCalendar, lineConfirmCircle, lineList } from '@eurth/style/line';

export const site = defineSite({
  // The subdomain, and the tool's id in @eurth/style's tools.json.
  id: 'prompt',
  name: 'Prompts',
  url: 'https://prompt.eurth.org',
  title: 'Prompts: a free worldbuilding prompt a day for worldbuilders',
  description:
    'A free worldbuilding prompt every day: one question about your own nation, on politics, history, culture, economy, military, geography, daily life or characters. No account needed.',
  tagline: 'A worldbuilding prompt a day',
  pages: [
    // Each page has an icon: on a phone the pages you're not on show only that.
    { href: '/', label: 'Today', icon: lineCalendar },
    { href: '/archive/', label: 'Archive', icon: lineList },
    { href: '/guide/', label: 'Guide' },
    { href: '/good-prompts/', label: 'Good prompts', icon: lineConfirmCircle },
  ],
  repo: 'https://github.com/eurth-org/eurth-prompts',
  ogAlt: 'Prompts, a worldbuilding prompt a day, at prompt.eurth.org: a calendar leaf carrying the Eurth yurt, beside a card that asks a question about your nation.',
  category: 'EducationalApplication',
  llms: `## The prompts

There are 366 prompts, one for each day of a leap year, in eight themes: politics, history, culture, economy, military, geography, daily life and characters. Each is one or two sentences and asks the writer to decide something about their own invented nation: realistic geofiction, with no magic and nothing beyond today's technology. Every prompt has a page of its own at https://prompt.eurth.org/p/<number>/, where 1 is 1 January, 365 is 31 December and 366 is 29 February. All of them are listed by theme in the archive.`,
});
