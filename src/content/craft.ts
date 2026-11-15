/**
 * What makes a good prompt, as data: each mark with a weak example and a strong one. The
 * strong examples are prompts from the bank, by number, so the page quotes them as they read
 * today and links to them; a test checks each is there and approved.
 */

export interface Mark {
  id: string;
  /** What a good prompt does. */
  title: string;
  /** Why it matters, in a sentence or two. */
  why: string;
  /** A prompt that misses the mark. Made up for this page; none of these is in the bank. */
  weak: string;
  /** What goes wrong with the weak one. */
  trouble: string;
  /** The number of a prompt in the bank that hits it. */
  strong: number;
  /** What the strong one does instead. */
  gain: string;
}

export const MARKS: readonly Mark[] = [
  {
    id: 'decision',
    title: 'It asks for a decision, not a description',
    why: 'A description can run for pages and commit you to nothing. A decision is short, and once it is made it rules other things in or out.',
    weak: 'Describe the geography of your nation.',
    trouble: 'There is no end to the answer and no reason to stop anywhere.',
    strong: 361,
    gain: 'One river, one fact about it, one thing to decide. The geography arrives with the answer.',
  },
  {
    id: 'premise',
    title: 'It hands you a fact to push against',
    why: 'A blank question is easy to answer with "no" or "nothing special". A prompt that states something as already true has to be dealt with.',
    weak: 'Has your nation ever moved its capital?',
    trouble: 'Most writers answer "no" and are done in a word.',
    strong: 348,
    gain: 'The move has happened. All that is left is the interesting part.',
  },
  {
    id: 'people',
    title: 'It has people in it',
    why: 'Institutions and industries are scenery until somebody gains, pays or objects. Ask who, and the scenery starts to move.',
    weak: "What are your nation's main industries?",
    trouble: 'The answer is a list of sectors that nobody will remember.',
    strong: 359,
    gain: 'The same economy, seen through one company and the people who have to live with it.',
  },
  {
    id: 'small',
    title: 'It can be answered in ten minutes',
    why: 'A prompt you can finish today gets answered. One that needs a weekend goes on the list of things to do someday.',
    weak: 'Write the history of your navy.',
    trouble: 'That is a project, and it will wait for a free month that never comes.',
    strong: 345,
    gain: 'One ship and one quarrel about it. The history of the navy turns up in the telling.',
  },
  {
    id: 'bends',
    title: 'It fits most nations, and bends for the rest',
    why: 'A prompt that only works for kingdoms with a coast leaves half its readers out. The good ones name a role, not a title.',
    weak: 'What does your king think of his parliament?',
    trouble: 'A republic, a queen or a nation without a parliament has nothing to say.',
    strong: 15,
    gain: '"Head of state" covers a king, a president and a party chairman alike.',
  },
  {
    id: 'below',
    title: 'It starts above the water and asks about what is below',
    why: 'Food, dress and festivals are the visible tip of a culture. A good prompt begins there, where it is easy, and pulls on what holds the tip up: class, memory, belief.',
    weak: 'What is your national dish?',
    trouble: 'The answer is a recipe. It tells a visitor what is on the plate and nothing about the table.',
    strong: 9,
    gain: 'Still about the dish, but now about who was poor, who is not any more, and what they did with the food.',
  },
  {
    id: 'yours',
    title: 'It stays in your world',
    why: 'Pointing at a real country borrows its whole history, and stops you making your own. A prompt should ask what happened in your nation, for reasons of its own.',
    weak: 'Which real country is your nation most like?',
    trouble: 'It invites a copy, and settles a hundred questions you never got to decide.',
    strong: 344,
    gain: 'A situation plenty of real borders know, asked about a town that exists only in your world.',
  },
];

/** The cultural iceberg (Edward T. Hall, 1976): what a visitor sees of a culture, and what holds it up. */
export const ICEBERG = {
  above: ['Food and drink', 'Dress', 'Festivals and holidays', 'Music and dance', 'Language', 'Flags and uniforms', 'Buildings', 'Manners at table'],
  below: [
    'What counts as fair',
    'Who may speak first, and to whom',
    'What a promise is worth',
    'How time is kept, and whose is wasted',
    'What is shameful',
    'What families owe each other',
    'How authority is earned',
    'What is never said aloud',
  ],
} as const;

/** The day this page's words were last brought up to date. */
export const UPDATED = '2026-11-15';
