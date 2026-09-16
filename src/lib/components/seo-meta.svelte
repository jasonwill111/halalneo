---
name: Helper component for SEO on every page
description: Common SEO meta tags and Open Graph / Twitter Card meta tags
usage: Import and use <Seo title="Page Title" description="Page description" ogTitle="OG Title" ogDescription="OG Description" canonical="/url" keywords="keyword1, keyword2, keyword3" />
---
<script lang="ts">
  import { getCanonicalUrl } from '#lib/utils.js';

  let {
    title = "HalalNeo",
    description = "Halal certification and compliance platform",
    ogTitle,
    ogDescription,
    ogImage,
    canonical,
    keywords,
    twitterCard = "summary_large_image"
  } = $props();
  
  // Defaults
  const siteTitle = 'HalalNeo';
  const siteDomain = 'https://halalneo.com' as string;
  const defaultOgImage = '/og-image.webp' as string;
  
  title = title || `HalalNeo - ${siteTitle}`;
  canonical = canonical || getCanonicalUrl();
  ogTitle = ogTitle || title;
  ogImage = ogImage || defaultOgImage;
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <meta name="keywords" content={keywords} />

  <!-- Open Graph / Facebook -->
  <meta property="og:title" content={ogTitle} />
  <meta property="og:description" content={ogDescription || description} />
  <meta property="og:image" content={ogImage} />
  <meta property="og:url" content={canonical} />
  <meta property="og:site_name" content={siteTitle} />
  <meta property="og:type" content="website" />

  <!-- Twitter -->
  <meta name="twitter:card" content={twitterCard} />
  <meta name="twitter:title" content={ogTitle} />
  <meta name="twitter:description" content={ogDescription || description} />
  <meta name="twitter:image" content={ogImage} />

  <!-- Canonical -->
  {#if canonical}
    <link rel="canonical" href={canonical} />
  {/if}
</svelte:head>
