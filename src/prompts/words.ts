/**
 * Words that don't belong in a prompt. The bank is for realistic geofiction about the writer's
 * own nation, in British English: so no real countries or peoples, nothing magical or from
 * beyond today's technology, and no American spellings. check.ts reads these lists.
 */

/**
 * Real countries, peoples and continents. Matched as whole words with their capital letter,
 * so "turkey" the bird and "china" the crockery pass, and "Turkey" and "China" don't.
 */
export const REAL_PLACES: readonly string[] = [
  // Countries
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan',
  'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia',
  'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cambodia', 'Cameroon', 'Canada', 'Cape Verde',
  'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czechia',
  'Czech Republic', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador', 'Eritrea',
  'Estonia', 'Eswatini', 'Ethiopia', 'Fiji', 'Finland', 'France', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece',
  'Grenada', 'Guatemala', 'Guinea', 'Guyana', 'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq',
  'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Korea', 'Kosovo', 'Kuwait',
  'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg',
  'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia',
  'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal',
  'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Macedonia', 'Norway', 'Oman', 'Pakistan', 'Palau',
  'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania',
  'Russia', 'Rwanda', 'Samoa', 'San Marino', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore',
  'Slovakia', 'Slovenia', 'Somalia', 'South Africa', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland',
  'Syria', 'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Togo', 'Tonga', 'Trinidad', 'Tunisia', 'Turkey', 'Türkiye',
  'Turkmenistan', 'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay',
  'Uzbekistan', 'Vanuatu', 'Vatican', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe',
  // Other names for them, and states that were
  'America', 'USA', 'Britain', 'England', 'Scotland', 'Wales', 'Holland', 'Soviet', 'USSR', 'Prussia', 'Ottoman',
  'Byzantine', 'Byzantium', 'Rome', 'Persia', 'Yugoslavia', 'Czechoslovakia',
  // Peoples
  'American', 'Americans', 'British', 'English', 'Scottish', 'Welsh', 'Irish', 'French', 'German', 'Germans', 'Dutch',
  'Belgian', 'Belgians', 'Spanish', 'Portuguese', 'Italian', 'Italians', 'Greek', 'Greeks', 'Swiss', 'Austrian', 'Swedish',
  'Norwegian', 'Danish', 'Finnish', 'Polish', 'Russian', 'Russians', 'Ukrainian', 'Turkish', 'Chinese', 'Japanese',
  'Korean', 'Indian', 'Brazilian', 'Mexican', 'Canadian', 'Australian', 'Egyptian', 'Roman', 'Romans', 'Arab', 'Persian',
  // Continents, and the planet: Eurth has its own
  'Europe', 'European', 'Asia', 'Asian', 'Africa', 'African', 'Antarctica', 'Earth',
];

/** Magic, monsters and machines that don't exist. Whole words, any capitals. */
export const UNREAL: readonly string[] = [
  'magic', 'magical', 'mage', 'mages', 'wizard', 'wizards', 'sorcerer', 'sorcerers', 'sorceress', 'sorcery', 'spellcaster',
  'dragon', 'dragons', 'elf', 'elves', 'elven', 'elvish', 'dwarves', 'dwarven', 'orc', 'orcs', 'goblin', 'goblins',
  'alien', 'aliens', 'extraterrestrial', 'extraterrestrials', 'ufo', 'ufos', 'vampire', 'vampires', 'werewolf', 'werewolves',
  'zombie', 'zombies', 'undead', 'necromancer', 'telepathy', 'telepathic', 'teleport', 'teleporter', 'teleportation',
  'starship', 'starships', 'hyperdrive', 'warp', 'antimatter', 'terraform', 'terraformed', 'terraforming', 'cyborg',
  'cyborgs', 'android', 'androids', 'mecha', 'time machine', 'time travel', 'faster than light', 'force field', 'death ray',
];

/** American spellings of words British English spells otherwise. Whole words, any capitals. */
export const AMERICAN: readonly string[] = [
  'color', 'colors', 'colored', 'colorful', 'honor', 'honors', 'honored', 'honorable', 'favor', 'favors', 'favored',
  'favorite', 'favorites', 'neighbor', 'neighbors', 'neighboring', 'neighborhood', 'neighborhoods', 'harbor', 'harbors',
  'rumor', 'rumors', 'humor', 'flavor', 'flavors', 'labor', 'laborer', 'laborers', 'center', 'centers', 'centered',
  'theater', 'theaters', 'liter', 'liters', 'fiber', 'defense', 'defenses', 'offense', 'offenses', 'gray', 'traveled',
  'traveling', 'traveler', 'travelers', 'canceled', 'jewelry', 'aluminum', 'plow', 'plows', 'skeptic', 'skeptical',
  'maneuver', 'maneuvers', 'mustache', 'pajamas', 'mom', 'railroad', 'railroads', 'sidewalk', 'sidewalks', 'gasoline',
  'catalog', 'dialog',
];

/** Words that end like "organize" but are spelt with a z in British English too. */
export const Z_IS_FINE: readonly string[] = [
  'size', 'sizes', 'sized', 'sizing', 'prize', 'prizes', 'prized', 'seize', 'seizes', 'seized', 'seizing', 'capsize',
  'capsizes', 'capsized', 'capsizing', 'downsize', 'downsized', 'downsizing', 'outsize', 'outsized', 'oversized', 'maize',
  'baize', 'assize', 'assizes',
];

/** Small words that say nothing about what a prompt asks; left out when two prompts are compared. */
export const SMALL_WORDS: readonly string[] = [
  'a', 'an', 'the', 'and', 'or', 'but', 'of', 'in', 'on', 'at', 'to', 'for', 'from', 'by', 'with', 'without', 'as', 'it',
  'its', 'is', 'are', 'was', 'were', 'be', 'been', 'has', 'have', 'had', 'do', 'does', 'did', 'that', 'this', 'there',
  'they', 'them', 'their', 'he', 'she', 'his', 'her', 'who', 'whom', 'whose', 'what', 'which', 'when', 'where', 'why',
  'how', 'your', 'you', 'nation', "nation's", 'one', 'still', 'so', 'if', 'than', 'then', 'not', 'no', 'would', 'will',
  'can', 'could', 'should', 'every', 'any', 'all', 'some', 'now', 'just', 'out', 'up', 'into', 'about',
];
