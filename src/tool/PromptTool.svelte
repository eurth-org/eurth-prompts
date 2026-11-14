<script lang="ts">
  /*
   * The prompt on its card, and everything a visitor can do with it: answer it on the forum,
   * draw another, copy it, pick a theme, share it, take it as a picture.
   *
   * The same component is the Today page and every prompt's own page. It arrives as real HTML
   * with the prompt the page was built for; with JavaScript, the Today page then follows the
   * visitor's own date. "Another prompt" turns the card like a page and moves the address to
   * that prompt's own page, so the link in the address bar always works without JavaScript.
   *
   * Nothing is stored: no streaks, no history. The theme in use rides in the query string.
   */
  import { faArrowLeft, faArrowRight, faComments, faCopy, faDownload, faShuffle } from '@fortawesome/free-solid-svg-icons';
  import { calm, copyText as copyToClipboard, download, svgToPicture, toast } from '@eurth/style';
  import Icon from '@eurth/style/components/Icon.svelte';
  import ShareButtons from '@eurth/style/components/ShareButtons.svelte';
  import { onMount } from 'svelte';
  import { earlierThisMonth, moreFromTheme, neighbours, onOrAfter } from '../prompts/archive';
  import { PROMPTS } from '../prompts/bank';
  import { dateFor, deviceTimeZone, formatDate, hasDate, todayIn, type YearMonthDay } from '../prompts/calendar';
  import { CARD_SIZES, card, type CardLook, type CardMark, type CardSizeId } from '../prompts/card';
  import { copyText, label, shared } from '../prompts/describe';
  import { draw } from '../prompts/draw';
  import { forumLink } from '../prompts/forum';
  import { numberFromPath, promptPath, promptUrl, themeFromSearch, withTheme } from '../prompts/link';
  import { LOST_PROVINCE, THEMES, find, themeName, type Prompt, type ThemeId } from '../prompts/model';
  import { promptTitle } from '../prompts/pages';

  // Passed in by the page: browser code never imports eurth.config.mjs (see the note there).
  let {
    start,
    today = null,
    siteName,
    siteTitle,
    siteUrl,
    siteHost,
    forumCategory,
    look,
    mark,
  }: {
    /** The number of the prompt the page was built with. */
    start: number;
    /** On the Today page: the date in Brussels the page was built for. Null on a prompt's own page. */
    today?: YearMonthDay | null;
    siteName: string;
    /** The Today page's title, to put back when the visitor returns to it. */
    siteTitle: string;
    siteUrl: string;
    siteHost: string;
    forumCategory?: string | undefined;
    /** The colours of the card as a picture, from @eurth/style's tokens. */
    look: CardLook;
    mark: CardMark;
  } = $props();

  const lookUp = (n: number): Prompt | undefined => (n === LOST_PROVINCE.n ? LOST_PROVINCE : find(PROMPTS, n));

  let prompt = $state<Prompt>(lookUp(start) ?? LOST_PROVINCE);
  let isToday = $state(today !== null);
  let date = $state<YearMonthDay | null>(today);
  let theme = $state<ThemeId | undefined>();
  let turning = $state<'' | 'out' | 'in'>('');
  let size = $state<CardSizeId>('preview');

  const sharing = $derived(shared(prompt, siteUrl));
  const earlier = $derived(isToday && date ? earlierThisMonth(PROMPTS, date) : []);
  const beside = $derived(neighbours(PROMPTS, prompt.n));
  const more = $derived(isToday ? [] : moreFromTheme(PROMPTS, prompt));

  const picture = (sizeId: CardSizeId) => card(prompt, { size: sizeId, look, siteName, siteHost, mark });
  const visitorsToday = () => todayIn(deviceTimeZone());

  /** Puts a prompt on the card: turning the page, unless the visitor wants things still. */
  function show(next: Prompt, { asToday = false, push = true, turn = true }: { asToday?: boolean; push?: boolean; turn?: boolean } = {}) {
    const swap = () => {
      prompt = next;
      isToday = asToday;
      document.title = asToday ? siteTitle : `${promptTitle(next)} · ${siteName}`;
    };
    if (push) history.pushState(null, '', withTheme(asToday ? '/' : promptPath(next.n), theme));
    if (!turn || calm()) {
      swap();
      return;
    }
    // Under half a second in all, and nothing waits on it: the buttons work throughout.
    turning = 'out';
    setTimeout(() => {
      swap();
      turning = 'in';
      setTimeout(() => (turning = ''), 220);
    }, 180);
  }

  function another() {
    const next = draw(PROMPTS, { theme, not: prompt.n });
    if (next) show(next);
    else toast('No prompts on that theme yet. Try another, or any.');
  }

  function pickTheme(id: ThemeId | undefined) {
    theme = id;
    const next = id && prompt.theme !== id ? draw(PROMPTS, { theme: id }) : undefined;
    if (next) show(next);
    else history.replaceState(null, '', withTheme(location.pathname, theme));
    if (id && !next && prompt.theme !== id) toast('No prompts on that theme yet. Try another, or any.');
  }

  async function copyPrompt() {
    const copied = await copyToClipboard(copyText(prompt, siteUrl));
    toast(copied ? 'Prompt copied. The answer is yours to write.' : "That didn't copy. Your browser may not allow it here.");
  }

  async function save(kind: 'svg' | 'png' | 'webp') {
    const { width, height } = CARD_SIZES.find((known) => known.id === size)!;
    const svg = picture(size);
    const name = `prompt-${prompt.n}-${size}.${kind}`;
    if (kind === 'svg') download(svg, name, 'image/svg+xml');
    else download(await svgToPicture(svg, { width, height, type: kind === 'webp' ? 'image/webp' : 'image/png' }), name);
  }

  onMount(() => {
    theme = themeFromSearch(location.search);
    const asked = numberFromPath(location.pathname);
    const askedFor = asked === undefined ? undefined : lookUp(asked);
    if (askedFor && askedFor.n !== prompt.n) {
      // Offline, the copy of the Today page stands in for a prompt's own page: show what was asked for.
      prompt = askedFor;
      isToday = false;
    } else if (isToday) {
      // The page was built for the day in Brussels; the visitor's own day may differ.
      date = visitorsToday();
      prompt = onOrAfter(PROMPTS, date) ?? prompt;
    }

    // Back and forward walk through the prompts drawn on this visit.
    const walked = () => {
      theme = themeFromSearch(location.search);
      const n = numberFromPath(location.pathname);
      const there = n === undefined ? undefined : lookUp(n);
      if (there) show(there, { push: false });
      else if (location.pathname === '/') {
        date = visitorsToday();
        show(onOrAfter(PROMPTS, date) ?? prompt, { asToday: true, push: false });
      }
    };
    addEventListener('popstate', walked);
    return () => removeEventListener('popstate', walked);
  });
</script>

<div class="tool">
  <header class="head">
    <p class="eu-kicker">
      {#if isToday}A worldbuilding prompt a day{:else if hasDate(prompt.n)}The prompt for {formatDate(dateFor(prompt.n))}{:else}The prompt that went missing{/if}
    </p>
    <h1>{isToday ? "Today's prompt" : `Prompt ${prompt.n}`}</h1>
  </header>

  <div class="stage">
    <article class="eu-card page" class:out={turning === 'out'} class:in={turning === 'in'}>
      <div class="said" aria-live="polite">
        <p class="eu-muted">{label(prompt)}</p>
        <p class="words">{prompt.text}</p>
      </div>
      <div class="eu-row">
        <a class="eu-btn eu-btn--primary" href={forumLink(prompt, { siteUrl, category: forumCategory })}><Icon icon={faComments} /> Answer on the Eurth forum</a>
        <button type="button" class="eu-btn" data-click="tumble" onclick={another}><Icon icon={faShuffle} /> Another prompt</button>
        <button type="button" class="eu-btn" data-click="bounce" onclick={copyPrompt}><Icon icon={faCopy} /> Copy prompt</button>
      </div>
    </article>
  </div>

  <section class="part" aria-labelledby="themes-title">
    <h2 id="themes-title">Pick a theme</h2>
    <div class="eu-row">
      <button type="button" class="eu-btn" aria-pressed={theme === undefined} onclick={() => pickTheme(undefined)}>Any</button>
      {#each THEMES as option (option.id)}
        <button type="button" class="eu-btn" aria-pressed={theme === option.id} onclick={() => pickTheme(option.id)}>{option.name}</button>
      {/each}
    </div>
    <p class="eu-help">"Another prompt" draws at random, from the theme you pick or from all eight.</p>
  </section>

  {#if isToday}
    {#if earlier.length}
      <section class="part" aria-labelledby="earlier-title">
        <h2 id="earlier-title">Earlier this month</h2>
        <ul class="list">
          {#each earlier as past (past.n)}
            <li>
              <span class="eu-muted">{formatDate(dateFor(past.n), { short: true })} · {themeName(past.theme)}</span>
              <a href={promptPath(past.n)}>{past.text}</a>
            </li>
          {/each}
        </ul>
      </section>
    {/if}
    <p><a class="eu-btn eu-btn--quiet" href="/archive/">All prompts <Icon icon={faArrowRight} /></a></p>
  {:else}
    <nav class="eu-row" aria-label="The days either side">
      {#if beside.previous}
        <a class="eu-btn" href={promptPath(beside.previous.n)}><Icon icon={faArrowLeft} /> {formatDate(dateFor(beside.previous.n))}</a>
      {/if}
      {#if beside.next}
        <a class="eu-btn" href={promptPath(beside.next.n)}>{formatDate(dateFor(beside.next.n))} <Icon icon={faArrowRight} /></a>
      {/if}
      <a class="eu-btn eu-btn--quiet" href="/">Today's prompt</a>
    </nav>
    {#if more.length}
      <section class="part" aria-labelledby="more-title">
        <h2 id="more-title">More on {themeName(prompt.theme).toLowerCase()}</h2>
        <ul class="list">
          {#each more as other (other.n)}
            <li>
              <span class="eu-muted">{formatDate(dateFor(other.n), { short: true })} · prompt {other.n}</span>
              <a href={promptPath(other.n)}>{other.text}</a>
            </li>
          {/each}
        </ul>
      </section>
    {/if}
  {/if}

  <section class="part" aria-labelledby="share-title">
    <h2 id="share-title">Share this prompt</h2>
    <ShareButtons
      url={promptUrl(prompt.n, siteUrl)}
      title={sharing.title}
      text={sharing.text}
      forumBody={sharing.forumBody}
      description={() => copyText(prompt, siteUrl)}
      picture={() => svgToPicture(picture('preview'), { width: 1200, height: 630 })}
      heading="Share this prompt"
      said={{ link: 'Link copied: it opens this very prompt.', description: 'Prompt copied, with where it came from.' }}
    />
    <div class="eu-row sizes">
      <label class="eu-field">
        <span class="eu-label">Picture of the card</span>
        <select class="eu-select" bind:value={size}>
          {#each CARD_SIZES as option (option.id)}
            <option value={option.id}>{option.name}, {option.width} x {option.height}</option>
          {/each}
        </select>
      </label>
      <button type="button" class="eu-btn" data-click="bounce" onclick={() => save('svg')}><Icon icon={faDownload} /> SVG</button>
      <button type="button" class="eu-btn" data-click="bounce" onclick={() => save('png')}><Icon icon={faDownload} /> PNG</button>
      <button type="button" class="eu-btn" data-click="bounce" onclick={() => save('webp')}><Icon icon={faDownload} /> WebP</button>
    </div>
    <p class="eu-help">Nothing is kept: no streaks, no history, no account. Miss a day and nobody knows but you.</p>
  </section>
</div>

<style>
  .tool {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }

  .head {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  h1 {
    font: var(--type-title);
  }

  h2 {
    font: var(--type-heading);
  }

  .part {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  /* The signature touch: the card turns like a page when a new prompt appears. The stylesheet
     stills it for reduced motion; the script skips it then too. */
  .stage {
    perspective: 1600px;
  }

  .page {
    gap: var(--space-4);
    transform-origin: left center;
  }

  .page.out {
    animation: turn-away 180ms ease-in forwards;
  }

  .page.in {
    animation: turn-in 220ms ease-out;
  }

  @keyframes turn-away {
    to {
      transform: rotateY(-88deg);
      opacity: 0;
    }
  }

  @keyframes turn-in {
    from {
      transform: rotateY(60deg);
      opacity: 0;
    }
  }

  .said {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .words {
    font: var(--type-headline-sm);
    text-wrap: balance;
  }

  .list {
    display: flex;
    flex-direction: column;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .list li {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    padding: var(--space-3) 0;
    border-top: 1px solid var(--line);
    font: var(--type-body-sm);
  }

  /* A whole line to press, not a few words of it. */
  .list a {
    display: block;
    padding: var(--space-2) 0;
    font: var(--type-body);
  }

  .sizes {
    align-items: end;
  }
</style>
