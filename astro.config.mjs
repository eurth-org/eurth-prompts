// @ts-check
import svelte from '@astrojs/svelte';
import eurth from '@eurth/style/astro';
import { ref } from '@eurth/style/build';
import { defineConfig } from 'astro/config';
import { site } from './eurth.config.mjs';

/**
 * The guide is written in Markdown, where a link can't call ref(). This gives every link to
 * another site the "?ref=" the handbook asks for, as the pages written in Astro do by hand.
 */
function refOnOutboundLinks() {
  /** @param {any} node */
  const walk = (node) => {
    if (node.type === 'element' && node.tagName === 'a' && typeof node.properties?.href === 'string') {
      node.properties.href = ref(node.properties.href, site.host);
    }
    for (const child of node.children ?? []) walk(child);
  };
  return walk;
}

// eurth(site) sets the site up as the handbook asks (static output, addresses ending in a
// slash, the stylesheet inside each page, scripts as separate files, a sitemap) and after the
// build writes the security headers, the service worker, the web manifest, robots.txt and llms.txt.
//
// The service worker keeps the site's own pages and scripts, but not the 366 prompt pages or
// their sharing images: the whole bank travels inside the script, so every prompt can be shown
// offline without them.
export default defineConfig({
  integrations: [svelte(), eurth(site, { offlineSkip: [/^p\//, /^og\//] })],
  markdown: { rehypePlugins: [refOnOutboundLinks] },
});
