<script lang="ts">
  import { getCanonicalUrl } from '#lib/utils.js';

  interface Props {
  	title?: string;
  	description?: string;
  	ogTitle?: string;
  	ogDescription?: string;
  	ogImage?: string;
  	canonical?: string;
  	keywords?: string;
  	twitterCard?: string;
  }

  let { title = 'HalalNeo', description = 'Halal certification and compliance platform', ogTitle, ogDescription, ogImage, canonical, keywords, twitterCard = 'summary_large_image' }: Props = $props();

  // Defaults
  const siteTitle = 'HalalNeo';
  const defaultOgImage = '/api/media/og-default.png' as string;

  // Use $derived for computed values
  const effectiveDescription = $derived(description);
  const effectiveTitle = $derived(title || `${siteTitle} — Halal Trade Intelligence`);
  const effectiveCanonical = $derived(canonical || getCanonicalUrl());
  const effectiveOgTitle = $derived(ogTitle || effectiveTitle);
  const effectiveOgImage = $derived(ogImage || defaultOgImage);
  const effectiveOgDescription = $derived(ogDescription || effectiveDescription);
</script>

<svelte:head>
  <title>{effectiveTitle}</title>
  <link rel="canonical" href={effectiveCanonical} />
  <meta name="description" content={effectiveDescription} />
  {#if keywords}
    <meta name="keywords" content={keywords} />
  {/if}
  <meta name="author" content="HalalNeo" />

  <!-- Open Graph / Facebook -->
  <meta property="og:title" content={effectiveOgTitle} />
  <meta property="og:description" content={effectiveOgDescription} />
  <meta property="og:image" content={effectiveOgImage} />
  <meta property="og:image:secure_url" content={effectiveOgImage} />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content={effectiveOgTitle} />
  <meta property="og:url" content={effectiveCanonical} />
  <meta property="og:site_name" content={siteTitle} />
  <meta property="og:type" content="website" />
  <meta property="og:locale" content="en" />

  <!-- Twitter -->
  <meta name="twitter:card" content={twitterCard} />
  <meta name="twitter:site" content="@halalneo" />
  <meta name="twitter:title" content={effectiveOgTitle} />
  <meta name="twitter:description" content={effectiveOgDescription} />
  <meta name="twitter:image" content={effectiveOgImage} />
</svelte:head>
