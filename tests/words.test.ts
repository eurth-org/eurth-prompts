import { describe, expect, it } from 'vitest';
import { PROMPTS } from '../src/prompts/bank';
import { altText, copyText, facts, label, shared } from '../src/prompts/describe';
import { FORUM_NEW_TOPIC, LONGEST_LINK, forumBody, forumLink, forumTitle } from '../src/prompts/forum';
import { LOST_PROVINCE, MAX_LENGTH, find, type Prompt } from '../src/prompts/model';
import { LONGEST_DESCRIPTION, SITE_PATHS, promptDescription, promptTitle, shorten, sitemapPaths } from '../src/prompts/pages';

const SITE = 'https://prompt.eurth.org';
const capital = find(PROMPTS, 348)!;
const leapDay: Prompt = { n: 366, theme: 'daily-life', text: 'Something in your nation happens only once every four years. What is it?' };
/** The longest a prompt may be, made of the characters that grow most in a link. */
const longest: Prompt = { n: 200, theme: 'daily-life', text: `${"Your cafés' & ".repeat(20).slice(0, MAX_LENGTH - 1)}?` };

describe('a prompt in words', () => {
  it('labels it as the mock-up does: date, theme, number', () => {
    expect(label(capital)).toBe('14 December · History · prompt 348');
    expect(label(capital, { short: true })).toBe('14 Dec · History · prompt 348');
    expect(label(leapDay)).toBe('29 February · Daily life · prompt 366');
    expect(label(LOST_PROVINCE)).toBe('Geography · prompt 404');
  });

  it('says the same as a sentence', () => {
    expect(facts(capital)).toBe('Prompt 348, for 14 December, on history.');
    expect(facts(leapDay)).toBe('Prompt 366, for 29 February, on daily life.');
    expect(facts(LOST_PROVINCE)).toBe('Prompt 404, on geography.');
  });

  it('copies the prompt, then where it came from', () => {
    expect(copyText(capital, SITE)).toBe(
      "Your nation's capital moved two centuries ago. Why, and who still resents it?\n\nPrompt 348, for 14 December, on history. https://prompt.eurth.org/p/348/",
    );
  });

  it('describes the card for those who cannot see it', () => {
    expect(altText(capital, 'prompt.eurth.org')).toBe(
      'A worldbuilding prompt from prompt.eurth.org: "Your nation\'s capital moved two centuries ago. Why, and who still resents it?" Prompt 348, for 14 December, on history.',
    );
  });

  it('gives the Share dialog a link, a title, a line and a forum body', () => {
    const share = shared(capital, SITE);
    expect(share.url).toBe('https://prompt.eurth.org/p/348/');
    expect(share.title).toBe(capital.text);
    expect(share.text.startsWith(capital.text)).toBe(true);
    expect(share.forumBody).toBe(forumBody(capital, SITE));
  });
});

describe('answer on the Eurth forum', () => {
  it('opens a new topic with the prompt as its title', () => {
    expect(forumTitle(capital)).toBe(capital.text);
    const link = new URL(forumLink(capital, { siteUrl: SITE }));
    expect(`${link.origin}${link.pathname}`).toBe(FORUM_NEW_TOPIC);
    expect(link.searchParams.get('title')).toBe(capital.text);
    expect(link.searchParams.get('body')).toBe(forumBody(capital, SITE));
    expect(link.searchParams.has('category')).toBe(false);
  });

  it('quotes the prompt, says where it is from, and leaves a line to answer on', () => {
    expect(forumBody(capital, SITE)).toBe(
      "> Your nation's capital moved two centuries ago. Why, and who still resents it?\n\n*Prompt 348, for 14 December, on history, from [Prompts](https://prompt.eurth.org/p/348/), Eurth's worldbuilding prompt a day.*\n\n",
    );
    expect(forumBody(LOST_PROVINCE, SITE)).toContain('*Prompt 404, on geography, from [Prompts](https://prompt.eurth.org/p/404/)');
  });

  it('names the category when given one', () => {
    const link = new URL(forumLink(capital, { siteUrl: SITE, category: 'factbooks-and-national-information/archive' }));
    expect(link.searchParams.get('category')).toBe('factbooks-and-national-information/archive');
    expect(forumLink(capital, { siteUrl: SITE, category: '' })).toBe(forumLink(capital, { siteUrl: SITE }));
  });

  it('writes spaces as %20, never as +, so the forum reads them back as spaces', () => {
    const link = forumLink(capital, { siteUrl: SITE, category: 'the pub' });
    expect(link).not.toMatch(/\+/);
    expect(link).toContain('title=Your%20nation');
    expect(link).toContain('category=the%20pub');
  });

  it('stays a link every browser and forum will open, for every prompt and for the longest a prompt may be', () => {
    expect(longest.text).toHaveLength(MAX_LENGTH);
    for (const prompt of [...PROMPTS, LOST_PROVINCE, longest]) {
      const link = forumLink(prompt, { siteUrl: SITE, category: 'factbooks-and-national-information' });
      expect(link.length, `prompt ${prompt.n}`).toBeLessThanOrEqual(LONGEST_LINK);
      expect(new URL(link).searchParams.get('title')).toBe(prompt.text);
    }
  });
});

describe('page words', () => {
  it('shortens at the end of a word', () => {
    expect(shorten('A short line', 56)).toBe('A short line');
    expect(shorten('One company employs so many people that your government asks it first', 56)).toBe('One company employs so many people that your government…');
    expect(shorten('Supercalifragilisticexpialidocious', 10)).toBe('Supercalif…');
    expect(shorten('Wait, what, why, who', 11)).toBe('Wait, what…');
  });

  it('titles a prompt page with its number and its first sentence', () => {
    expect(promptTitle(capital)).toBe("Prompt 348: Your nation's capital moved two centuries ago");
    expect(promptTitle(LOST_PROVINCE)).toBe("Prompt 404: Your nation's census office lost a whole province");
    expect(promptTitle(find(PROMPTS, 3)!)).toBe('Prompt 3: Does your nation have conscription');
  });

  it('describes a prompt page with the prompt and its day', () => {
    expect(promptDescription(capital)).toBe("Your nation's capital moved two centuries ago. Why, and who still resents it? The worldbuilding prompt for 14 December, on history.");
    expect(promptDescription(LOST_PROVINCE)).toBe("Your nation's census office lost a whole province. Where did it go? A worldbuilding prompt on geography, and not one of the 366.");
  });

  it('keeps every description between 50 and 200 characters, cutting a long prompt at a word', () => {
    const description = promptDescription(longest);
    expect(description.length).toBeLessThanOrEqual(LONGEST_DESCRIPTION);
    expect(description).toContain('… The worldbuilding prompt for 19 July, on daily life.');
    const shortest: Prompt = { n: 121, theme: 'culture', text: 'Who cooks in your nation? Why?' };
    expect(promptDescription(shortest).length).toBeGreaterThanOrEqual(50);
  });

  it('gives every page in the bank a different title and description, of a sensible length', () => {
    const all = [...PROMPTS, LOST_PROVINCE];
    const titles = all.map(promptTitle);
    const descriptions = all.map(promptDescription);
    expect(new Set(titles).size).toBe(all.length);
    expect(new Set(descriptions).size).toBe(all.length);
    // With " · Prompts" added by the site, a title stays near what search results show.
    for (const title of titles) expect(title.length, title).toBeLessThanOrEqual(70);
    for (const description of descriptions) {
      expect(description.length, description).toBeGreaterThanOrEqual(50);
      expect(description.length, description).toBeLessThanOrEqual(LONGEST_DESCRIPTION);
    }
  });

  it('lists every prompt page in the sitemap, after the site\'s own pages, and leaves the easter egg out', () => {
    const paths = sitemapPaths([...PROMPTS, LOST_PROVINCE]);
    expect(paths.slice(0, SITE_PATHS.length)).toEqual(['/', '/archive/', '/guide/']);
    expect(paths).toHaveLength(SITE_PATHS.length + PROMPTS.length);
    for (const prompt of PROMPTS) expect(paths).toContain(`/p/${prompt.n}/`);
    expect(paths).not.toContain('/p/404/');
    expect(new Set(paths).size).toBe(paths.length);
  });

  it('lists all 366 once the bank is whole', () => {
    const year: Prompt[] = Array.from({ length: 366 }, (_, i) => ({ n: 366 - i, theme: 'history', text: 'x' }));
    const paths = sitemapPaths(year);
    expect(paths).toHaveLength(369);
    expect(paths[3]).toBe('/p/1/');
    expect(paths.at(-1)).toBe('/p/366/');
  });
});
