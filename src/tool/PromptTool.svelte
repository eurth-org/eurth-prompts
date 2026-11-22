<script lang="ts">
  /*
   * The prompt on its card, and everything a visitor can do with it: answer it on the forum,
   * draw another, copy it, pick a theme, take it as a picture, share it, export it as text.
   * Each of those is a card of its own, under a heading with an icon, as the handbook asks;
   * the result leaves in two of them, "Save & share" and "Export".
   *
   * The same component is the Today page and every prompt's own page. It arrives as real HTML
   * with the prompt the page was built for; with JavaScript, the Today page then follows the
   * visitor's own date. "Another prompt" turns the card like a page and moves the address to
   * that prompt's own page, so the link in the address bar always works without JavaScript.
   *
   * Nothing is stored: no streaks, no history. The theme in use rides in the query string.
   */
  import { faMarkdown, faWikipediaW } from '@fortawesome/free-brands-svg-icons';
  import { faCheck, faComments, faFileExport, faFileLines, faLayerGroup, faShareNodes } from '@fortawesome/free-solid-svg-icons';
  import { calm, copyText as copyToClipboard, download, pictureFilename, svgToPicture, toast } from '@eurth/style';
  import ExportPanel, { type ExportFormat } from '@eurth/style/components/ExportPanel.svelte';
  import Icon from '@eurth/style/components/Icon.svelte';
  import Line from '@eurth/style/components/Line.svelte';
  import RandomButton from '@eurth/style/components/RandomButton.svelte';
  import ShareButtons from '@eurth/style/components/ShareButtons.svelte';
  import { lineArrowLeft, lineArrowRight, lineCalendar, lineClipboard, lineConfirm, lineDownloadOutline, lineImage } from '@eurth/style/line';
  import { onMount } from 'svelte';
  import { earlierThisMonth, moreFromTheme, neighbours, onOrAfter } from '../prompts/archive';
  import { PROMPTS } from '../prompts/bank';
  import { dateFor, deviceTimeZone, formatDate, hasDate, todayIn, type YearMonthDay } from '../prompts/calendar';
  import { CARD_SIZES, card, type CardLook, type CardMark, type CardSizeId } from '../prompts/card';
  import { altText, copyText, label, shared } from '../prompts/describe';
  import { draw } from '../prompts/draw';
  import { asMarkdown, asPlainText, asWikitext } from '../prompts/export';
  import { LONGEST_NATION, cleanNation, forumLink } from '../prompts/forum';
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

  // The page's own prompt and day are where the tool starts; from then on it keeps its own.
  // svelte-ignore state_referenced_locally
  let prompt = $state<Prompt>(lookUp(start) ?? LOST_PROVINCE);
  // svelte-ignore state_referenced_locally
  let isToday = $state(today !== null);
  // svelte-ignore state_referenced_locally
  let date = $state<YearMonthDay | null>(today);
  let theme = $state<ThemeId | undefined>();
  let turning = $state<'' | 'out' | 'in'>('');
  let size = $state<CardSizeId>('preview');
  let copied = $state(false);

  // The writer's nation, for the forum topic's title. Kept in memory for this page only.
  let nation = $state('');
  let nationField: HTMLInputElement | undefined = $state();

  const sharing = $derived(shared(prompt, siteUrl, nation));
  const earlier = $derived(isToday && date ? earlierThisMonth(PROMPTS, date) : []);
  const beside = $derived(neighbours(PROMPTS, prompt.n));
  const more = $derived(isToday ? [] : moreFromTheme(PROMPTS, prompt));

  const picture = (sizeId: CardSizeId) => card(prompt, { size: sizeId, look, siteName, siteHost, mark });
  const chosenSize = $derived(CARD_SIZES.find((known) => known.id === size)!);
  const preview = $derived(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(picture(size))}`);

  // The prompt as text, for the Export card: Markdown first (the forum takes it).
  const formats: ExportFormat[] = [
    {
      id: 'markdown',
      label: 'Markdown',
      icon: faMarkdown,
      extension: 'md',
      type: 'text/markdown',
      help: 'For a post on the Eurth forum, or your own notes: the prompt as a quotation, with your answer to go under it.',
      make: () => asMarkdown(prompt, siteUrl, nation),
    },
    {
      id: 'wikitext',
      label: 'Wikitext',
      icon: faWikipediaW,
      extension: 'wiki.txt',
      type: 'text/plain',
      help: "For your nation's page on IIWiki: a section headed by the prompt, ready for your answer.",
      make: () => asWikitext(prompt, siteUrl, nation),
    },
    {
      id: 'text',
      label: 'Plain text',
      icon: faFileLines,
      extension: 'txt',
      type: 'text/plain',
      help: 'For anywhere else: the prompt, which one it is, and its link.',
      make: () => asPlainText(prompt, siteUrl, nation),
    },
  ];
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

  /** A forum topic's title must be its own, and the nation's name is what makes it so: ask for it first. */
  function nameFirst(event: MouseEvent) {
    if (cleanNation(nation)) return;
    event.preventDefault();
    nationField?.focus();
    toast("Name your nation first: it goes in the topic's title, so your answer has a title of its own.");
  }

  async function copyPrompt() {
    const ok = await copyToClipboard(copyText(prompt, siteUrl));
    toast(ok ? 'Prompt copied. The answer is yours to write.' : "That didn't copy. Your browser may not allow it here.");
    if (!ok) return;
    copied = true;
    setTimeout(() => (copied = false), 2000);
  }

  async function save(kind: 'svg' | 'png' | 'webp') {
    const { width, height } = chosenSize;
    const svg = picture(size);
    const name = `prompt-${prompt.n}-${size}`;
    if (kind === 'svg') {
      download(svg, `${name}.svg`, 'image/svg+xml');
      return;
    }
    // A browser that can't make WebP hands back a PNG: name the file for what it is, and say so.
    const asked = kind === 'webp' ? 'image/webp' : 'image/png';
    const made = await svgToPicture(svg, { width, height, type: asked });
    const file = pictureFilename(name, made, asked);
    download(made, file.filename);
    if (file.note) toast(file.note);
  }

  onMount(() => {
    theme = themeFromSearch(location.search);
    const asked = numberFromPath(location.pathname);
    const askedFor = asked === undefined ? undefined : lookUp(asked);
    if (askedFor && askedFor.n !== prompt.n) {
      // Offline, the copy of the Today page stands in for a prompt's own page: show what was asked for.
      prompt = askedFor;
      isToday = false;
      document.title = `${promptTitle(askedFor)} · ${siteName}`;
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
      <div class="eu-row answer">
        <label class="eu-field">
          <span class="eu-label">Your nation</span>
          <input class="eu-input" bind:this={nationField} bind:value={nation} maxlength={LONGEST_NATION} autocomplete="off" aria-describedby="nation-help" />
        </label>
        <a class="eu-btn eu-btn--primary" href={forumLink(prompt, { siteUrl, category: forumCategory, nation })} onclick={nameFirst}>
          <Icon icon={faComments} /> Answer on the Eurth forum
        </a>
      </div>
      <p class="eu-help" id="nation-help">Its name goes in front of the prompt in your topic's title, so every answer on the forum has a title of its own.</p>
    </article>
  </div>

  <!-- The tool's own toolbar: Random first, the quickest way in. There is nothing to lose here, so it never asks. -->
  <div class="eu-row">
    <RandomButton onrandom={another} guard={false} label="Another prompt" tip={theme ? `A prompt on ${themeName(theme).toLowerCase()}, drawn at random` : 'A prompt drawn at random'} />
    <button type="button" class="eu-btn" onclick={copyPrompt}>
      <Line icon={copied ? lineConfirm : lineClipboard} />
      {copied ? 'Copied' : 'Copy prompt'}
    </button>
  </div>

  <section class="eu-card" aria-labelledby="themes-title">
    <h2 class="eu-card-title" id="themes-title"><Icon icon={faLayerGroup} /> Pick a theme</h2>
    <p class="eu-help">"Another prompt" draws at random, from the theme you pick or from all eight.</p>
    <div class="eu-row" role="radiogroup" aria-labelledby="themes-title">
      <label class="eu-pill">
        <input type="radio" name="theme" value="" checked={theme === undefined} onchange={() => pickTheme(undefined)} />
        <span class="eu-check"><Icon icon={faCheck} /></span>
        Any
      </label>
      {#each THEMES as option (option.id)}
        <label class="eu-pill">
          <input type="radio" name="theme" value={option.id} checked={theme === option.id} onchange={() => pickTheme(option.id)} />
          <span class="eu-check"><Icon icon={faCheck} /></span>
          {option.name}
        </label>
      {/each}
    </div>
  </section>

  {#if isToday}
    {#if earlier.length}
      <section class="eu-card" aria-labelledby="earlier-title">
        <h2 class="eu-card-title" id="earlier-title"><Line icon={lineCalendar} /> Earlier this month <span class="eu-count">{earlier.length}</span></h2>
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
    <p><a class="eu-btn eu-btn--quiet" href="/archive/">All prompts <Line icon={lineArrowRight} /></a></p>
  {:else}
    <nav class="eu-row" aria-label="The days either side">
      {#if beside.previous}
        <a class="eu-btn" href={promptPath(beside.previous.n)}><Line icon={lineArrowLeft} /> {formatDate(dateFor(beside.previous.n))}</a>
      {/if}
      {#if beside.next}
        <a class="eu-btn" href={promptPath(beside.next.n)}>{formatDate(dateFor(beside.next.n))} <Line icon={lineArrowRight} /></a>
      {/if}
      <a class="eu-btn eu-btn--quiet" href="/">Today's prompt</a>
    </nav>
    {#if more.length}
      <section class="eu-card" aria-labelledby="more-title">
        <h2 class="eu-card-title" id="more-title"><Icon icon={faLayerGroup} /> More on {themeName(prompt.theme).toLowerCase()}</h2>
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

  <!-- The prompt as a picture, with its own downloads beside it. -->
  <section class="eu-card" aria-labelledby="picture-title">
    <h2 class="eu-card-title" id="picture-title"><Line icon={lineImage} /> The card as a picture</h2>
    <img class="picture" src={preview} alt={altText(prompt, siteHost)} width={chosenSize.width} height={chosenSize.height} loading="lazy" />
    <label class="eu-field">
      <span class="eu-label">Size</span>
      <select class="eu-select" bind:value={size}>
        {#each CARD_SIZES as option (option.id)}
          <option value={option.id}>{option.name}, {option.width} x {option.height}</option>
        {/each}
      </select>
    </label>
    <div class="eu-row">
      <span class="eu-help">Download as</span>
      <button type="button" class="eu-btn" data-click="bounce" onclick={() => save('svg')}><Line icon={lineDownloadOutline} /> SVG</button>
      <button type="button" class="eu-btn" data-click="bounce" onclick={() => save('png')}><Line icon={lineDownloadOutline} /> PNG</button>
      <button type="button" class="eu-btn" data-click="bounce" onclick={() => save('webp')}><Line icon={lineDownloadOutline} /> WebP</button>
    </div>
  </section>

  <!-- Two cards, as the handbook asks: "Save & share" passes the prompt on; "Export" hands it over as text. -->
  <section class="eu-card" aria-labelledby="share-title">
    <h2 class="eu-card-title" id="share-title"><Icon icon={faShareNodes} /> Save &amp; share</h2>
    <ShareButtons
      url={promptUrl(prompt.n, siteUrl)}
      title={sharing.title}
      text={sharing.text}
      forumBody={sharing.forumBody}
      description={() => copyText(prompt, siteUrl)}
      markdown={() => asMarkdown(prompt, siteUrl, nation)}
      picture={() => svgToPicture(picture('preview'), { width: 1200, height: 630 })}
      heading="Share this prompt"
      said={{ link: 'Link copied: it opens this very prompt.', description: 'Prompt copied, with where it came from.' }}
    />
    <p class="eu-help">
      Every prompt has an address of its own, so its link is all there is to save. Nothing is kept in this browser: no streaks, no history, no account. Miss a day and nobody knows but you.
    </p>
  </section>

  <section class="eu-card" aria-labelledby="export-title">
    <h2 class="eu-card-title" id="export-title"><Icon icon={faFileExport} /> Export</h2>
    <ExportPanel name={`prompt-${prompt.n}`} {formats} rows={7} />
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

  .answer {
    align-items: end;
  }

  /* The picture keeps its own shape at every size; a tall one (story, pin) stays in view. */
  .picture {
    display: block;
    width: auto;
    max-width: min(100%, var(--size-measure));
    height: auto;
    max-height: 70vh;
    border-radius: var(--radius-md);
  }
</style>
