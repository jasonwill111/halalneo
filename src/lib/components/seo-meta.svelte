---
name: Helper component for SEO on every page
description: Common SEO meta tags and Open Graph / Twitter Card meta tags
usage: Import and use <Seo title="Page Title" description="Page description" ogTitle="OG Title" ogDescription="OG Description" canonical="/url" keywords="keyword1, keyword2, keyword3" />
---
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

  let { title, description, ogTitle, ogDescription, ogImage, canonical, keywords, twitterCard = 'summary_large_image' }: Props = $props();
  // Defaults
  const siteTitle = 'HalalNeo';
  const defaultOgImage = '/og-image.webp' as string;

  const resolvedTitle = $derived(title || siteTitle);
  const resolvedCanonical = $derived(canonical || getCanonicalUrl());
  const resolvedOgTitle = $derived(ogTitle || resolvedTitle);
  const resolvedOgImage = $derived(ogImage || defaultOgImage);
</script>

<svelte:head>
  <title>{resolvedTitle}</title>
  <meta name="description" content={description} />
  <meta name="keywords" content={keywords} />

  <!-- Open Graph / Facebook -->
  <meta property="og:title" content={resolvedOgTitle} />
  <meta property="og:description" content={ogDescription || description} />
  <meta property="og:image" content={resolvedOgImage} />
  <meta property="og:url" content={resolvedCanonical} />
  <meta property="og:site_name" content={siteTitle} />
  <meta property="og:type" content="website" />

  <!-- Twitter -->
  <meta name="twitter:card" content={twitterCard} />
  <meta name="twitter:title" content={resolvedOgTitle} />
  <meta name="twitter:description" content={ogDescription || description} />
  <meta name="twitter:image" content={resolvedOgImage} />

  <!-- Canonical -->
  {#if resolvedCanonical}
    <link rel="canonical" href={resolvedCanonical} />
  {/if}
</svelte:head>
