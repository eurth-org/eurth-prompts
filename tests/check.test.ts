import { describe, expect, it } from 'vitest';
import { checkBank, checkPrompt, errors, sentences, summarise, words } from '../src/prompts/check';
import { BANK_SIZE, LOST_PROVINCE, MAX_LENGTH, THEMES, byNumber, find, isThemeId, readBank, themeName, type Prompt, type ThemeId } from '../src/prompts/model';

const good: Prompt = { n: 348, theme: 'history', text: "Your nation's capital moved two centuries ago. Why, and who still resents it?" };
const withText = (text: string, n = 1): Prompt => ({ n, theme: 'politics', text });
const rules = (prompt: Prompt) => checkPrompt(prompt).map((finding) => finding.rule);

describe('the model', () => {
  it('has eight themes, each with an id and a name', () => {
    expect(THEMES).toHaveLength(8);
    expect(new Set(THEMES.map((theme) => theme.id)).size).toBe(8);
    expect(themeName('daily-life')).toBe('Daily life');
    expect(isThemeId('military')).toBe(true);
    expect(isThemeId('magic')).toBe(false);
  });

  it('keeps the easter egg outside the 366', () => {
    expect(LOST_PROVINCE.n).toBe(404);
    expect(LOST_PROVINCE.n).toBeGreaterThan(BANK_SIZE);
    expect(LOST_PROVINCE.text).toBe("Your nation's census office lost a whole province. Where did it go?");
    // It follows every rule about wording; only its number is out of range, on purpose.
    expect(rules(LOST_PROVINCE)).toEqual(['number']);
  });

  it('reads a well-formed bank and refuses a misshapen one', () => {
    expect(readBank([{ ...good, batch: 0 }])).toEqual([{ ...good, batch: 0 }]);
    expect(() => readBank({})).toThrow(/should be a list/);
    expect(() => readBank([null])).toThrow(/isn't an object/);
    expect(() => readBank([{ ...good, n: '348', batch: 0 }])).toThrow(/whole number/);
    expect(() => readBank([{ ...good, theme: 'sport', batch: 0 }])).toThrow(/unknown theme/);
    expect(() => readBank([{ ...good, text: 5, batch: 0 }])).toThrow(/no text/);
    expect(() => readBank([good])).toThrow(/review batch/);
  });

  it('sorts and finds by number', () => {
    const prompts = [withText('b', 9), withText('a', 2)];
    expect(byNumber(prompts).map((p) => p.n)).toEqual([2, 9]);
    expect(prompts.map((p) => p.n)).toEqual([9, 2]);
    expect(find(prompts, 9)?.text).toBe('b');
    expect(find(prompts, 3)).toBeUndefined();
  });
});

describe('splitting text', () => {
  it('counts sentences by their closing marks', () => {
    expect(sentences('One. Two? Three!')).toEqual(['One.', 'Two?', 'Three!']);
    expect(sentences('A pass, a strait or a bridge: pick one. What happens?')).toHaveLength(2);
    expect(sentences('No ending')).toEqual(['No ending']);
    expect(sentences('')).toEqual([]);
  });

  it('lists words in lower case, keeping apostrophes inside them', () => {
    expect(words("Your nation's oldest ship, retired.")).toEqual(['your', "nation's", 'oldest', 'ship', 'retired']);
  });
});

describe('checking one prompt', () => {
  it('finds nothing wrong with a good one', () => {
    expect(checkPrompt(good)).toEqual([]);
  });

  it('wants a number from 1 to 366 and one of the eight themes', () => {
    expect(rules({ ...good, n: 0 })).toContain('number');
    expect(rules({ ...good, n: 367 })).toContain('number');
    expect(rules({ ...good, n: 1.5 })).toContain('number');
    expect(rules({ ...good, theme: 'sport' as ThemeId })).toContain('theme');
  });

  it('wants one or two sentences', () => {
    expect(rules(withText('Your nation has a flag. Who drew it? Who hates it? Who burns it?'))).toContain('sentences');
    expect(rules(withText('Your nation has a flag that somebody drew. Who hates it?'))).toEqual([]);
    expect(rules(withText('Name the oldest bridge in your nation and who paid for it.'))).toEqual([]);
  });

  it(`wants no more than ${MAX_LENGTH} characters, and enough to ask something`, () => {
    const long = `Your nation ${'really '.repeat(30)}has a flag. Why?`;
    expect(long.length).toBeGreaterThan(MAX_LENGTH);
    expect(rules(withText(long))).toContain('length');
    expect(rules(withText('Your flag. Why?'))).toContain('length');
    const exact = `Your nation ${'x'.repeat(MAX_LENGTH - 13)}?`;
    expect(exact).toHaveLength(MAX_LENGTH);
    expect(rules(withText(exact))).not.toContain('length');
  });

  it('wants tidy spacing, a capital to start and a full stop or question mark to end', () => {
    expect(rules(withText(' Your nation has a flag. Who drew it?'))).toContain('spaces');
    expect(rules(withText('Your nation has a flag.  Who drew it?'))).toContain('spaces');
    expect(rules(withText('Your nation has a flag.\nWho drew it?'))).toContain('spaces');
    expect(rules(withText('your nation has a flag. Who drew it?'))).toContain('capital');
    expect(rules(withText('Your nation has a flag. Somebody drew it'))).toContain('ending');
    expect(rules(withText('Your nation has a flag. Somebody drew it!'))).toContain('ending');
  });

  it('wants plain characters: no curly quotes, long dashes or emoji', () => {
    expect(rules(withText('Your nation’s flag has a story. Who tells it?'))).toContain('characters');
    expect(rules(withText('Your nation has a flag — who drew it, and why?'))).toContain('characters');
    expect(rules(withText('Your nation has a flag 🏳️. Who drew it, and why?'))).toContain('characters');
    expect(rules(withText('Your nation has a "flag". Who drew it, and why?'))).toContain('characters');
    expect(rules(withText("Your nation's cafés close at noon (yes, noon). Why is that?"))).toEqual([]);
  });

  it('never lets a real country, people or continent in', () => {
    expect(rules(withText('Your nation borders France. How is that going?'))).toContain('real-place');
    expect(rules(withText('Your nation has a Roman road. Who still uses it?'))).toContain('real-place');
    expect(rules(withText('Your nation trades with the United States. In what?'))).toContain('real-place');
    expect(rules(withText('Your nation is the oldest in Europe. Says who?'))).toContain('real-place');
    // The same letters as a common word, or inside another word, are fine.
    expect(rules(withText('Your nation eats turkey off its best china at midwinter. Why?'))).toEqual([]);
    expect(rules(withText('Your nation has a Romanesque cathedral nobody finished. Why?'))).toEqual([]);
  });

  it('never lets magic, aliens, fantasy races or tomorrow\'s machines in', () => {
    for (const text of [
      'Your nation has a court wizard. What does he advise?',
      'Your nation was visited by aliens. What did they want?',
      'Your nation has an elven minority. Where do they live?',
      'Your nation built a Time Machine. Who went first?',
      'Your navy launches its first starship. Who commands it?',
    ]) {
      expect(rules(withText(text)), text).toContain('unreal');
    }
    // "Magician" is a job; "alienate" is a verb.
    expect(rules(withText('Your nation has a famous stage magician who alienated the court. How?'))).toEqual([]);
  });

  it('keeps to British spelling', () => {
    expect(rules(withText('Your nation changed the color of its flag. Why?'))).toContain('spelling');
    expect(rules(withText('Your nation never recognized its neighbour. Why not?'))).toContain('spelling');
    expect(rules(withText('Your nation is organizing a census. Who refuses to answer?'))).toContain('spelling');
    expect(rules(withText('Your nation gives a prize for the best-sized marrow. Who seized it last year?'))).toEqual([]);
    expect(rules(withText('Your nation changed the colour of its flag and reorganised its defence. Why?'))).toEqual([]);
  });

  it('leaves a note, not an error, when a prompt never says "your"', () => {
    const found = checkPrompt(withText('A border town speaks a different language from the capital. How did that happen?'));
    expect(found).toHaveLength(1);
    expect(found[0]).toMatchObject({ level: 'note', rule: 'your' });
    expect(errors(found)).toEqual([]);
  });
});

describe('checking the bank', () => {
  const a = withText('Your parliament has a rule nobody will repeal. Who does it protect?', 1);
  const b: Prompt = { n: 2, theme: 'economy', text: 'Your coins carry a face people argue about. Who wants it replaced?' };

  it('finds nothing wrong with different prompts', () => {
    expect(checkBank([a, b])).toEqual([]);
  });

  it('finds a number used twice', () => {
    const found = checkBank([a, { ...b, n: 1 }]);
    expect(found.map((f) => f.rule)).toEqual(['doubled']);
    expect(found[0]?.n).toBe(1);
  });

  it('finds two prompts that open with the same five words', () => {
    const c = withText('Your parliament has a rule about hats. Who still wears one?', 3);
    const found = checkBank([a, b, c]);
    expect(found.map((f) => f.rule)).toContain('opening');
    expect(found.find((f) => f.rule === 'opening')).toMatchObject({ n: 3 });
    // Four shared words are allowed.
    const d = withText('Your parliament has a bar that never closes. Who drinks there?', 4);
    expect(checkBank([a, b, d]).map((f) => f.rule)).not.toContain('opening');
  });

  it('finds two prompts that ask the same thing in other words', () => {
    const c = withText('Nobody will repeal one rule your parliament has. Who does this rule protect?', 3);
    expect(checkBank([a, b, c]).map((f) => f.rule)).toContain('alike');
  });

  it('only asks for all 366 and an even spread when told the bank is complete', () => {
    expect(checkBank([a, b]).map((f) => f.rule)).not.toContain('missing');
    const found = checkBank([a, b], { complete: true });
    expect(found.find((f) => f.rule === 'missing')?.message).toMatch(/^364 of the 366 prompts are missing: 3 to 366\.$/);
    expect(found.filter((f) => f.rule === 'balance')).toHaveLength(8);
  });

  it('accepts a complete bank with 45 or 46 prompts a theme', () => {
    const full: Prompt[] = Array.from({ length: BANK_SIZE }, (_, i) => ({
      n: i + 1,
      theme: THEMES[i % THEMES.length]!.id,
      // Different words in every prompt, so none opens like another or asks the same thing.
      text: `Your nation founded town${i} beside river${i} under ruler${i} during era${i}. Which guild${i} objected, and what did trade${i} cost?`,
    }));
    expect(errors(checkBank(full, { complete: true }))).toEqual([]);
    const lopsided = full.map((prompt) => (prompt.theme === 'politics' && prompt.n > 100 ? { ...prompt, theme: 'history' as ThemeId } : prompt));
    expect(checkBank(lopsided, { complete: true }).filter((f) => f.rule === 'balance')).toHaveLength(2);
  });
});

describe('summarising numbers', () => {
  it('folds runs', () => {
    expect(summarise([356, 1, 2, 3, 344, 345, 20])).toBe('1 to 3, 20, 344, 345, 356');
    expect(summarise([])).toBe('');
    expect(summarise([7])).toBe('7');
  });
});
