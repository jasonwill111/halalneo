<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Card, CardContent } from '#lib/components/ui/card/index.js';
	import { Avatar, AvatarFallback } from '#lib/components/ui/avatar/index.js';
	import Breadcrumb from '#lib/components/site/breadcrumb.svelte';
	import ShareButtons from '#lib/components/site/share-buttons.svelte';
	import ShoppingCart from '@lucide/svelte/icons/shopping-cart';
	import Store from '@lucide/svelte/icons/store';
	import BookOpen from '@lucide/svelte/icons/book-open';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import { sanitizeHtml } from '#lib/sanitize.js';
	import { onMount } from 'svelte';

	let { data } = $props();

	const blogImages = [
		'/api/media/blog-featured-1.webp',
		'/api/media/blog-featured-2.webp',
		'/api/media/blog-1.webp',
		'/api/media/blog-2.webp',
		'/api/media/blog-3.webp'
	];

	const seo = $derived(data.seo ?? {});
	const item = $derived(data.item);
	const readTime = $derived((data.item as any)?.readTime as string | undefined);

	const baseUrl = 'https://halalneo.com';
	const ogImage = $derived(seo.ogImage ?? `${baseUrl}/api/media/og-default.png`);

	const toIsoDate = (v: unknown): string | undefined => {
		if (v == null || v === '') return undefined;
		if (typeof v === 'number') return new Date(v > 1e12 ? v : v * 1000).toISOString();
		const d = new Date(String(v));
		return isNaN(d.getTime()) ? undefined : d.toISOString();
	};

	const plainText = (html: unknown): string =>
		String(html ?? '')
			.replace(/<[^>]*>/g, ' ')
			.replace(/\s+/g, ' ')
			.trim();

	// Blog bodies are stored as HTML (never Markdown). Render through shadcn components.
	const renderedContent = $derived.by(() => {
		const raw = String(item?.content ?? '');
		if (!raw) return '';
		return sanitizeHtml(raw);
	});

	const slugifyHeading = (text: string): string =>
		text
			.toLowerCase()
			.trim()
			.replace(/<[^>]*>/g, '')
			.replace(/[^a-z0-9\u4e00-\u9fa5\s-]/g, '')
			.replace(/\s+/g, '-')
			.replace(/-+/g, '-')
			.replace(/^-+|-+$/g, '');

	// Ensure every h2 has an id for the TOC.
	const renderedBody = $derived.by(() => {
		let html = renderedContent;
		html = html.replace(/<h2>([^<]+)<\/h2>/g, (_, t: string) => {
			const id = slugifyHeading(t);
			return id ? `<h2 id="${id}">${t}</h2>` : `<h2>${t}</h2>`;
		});
		return html;
	});

	const tocItems = $derived.by(() => {
		const matches = renderedBody.match(/<h2[^>]*id="([^"]*)"[^>]*>([^<]+)<\/h2>/g) ?? [];
		return matches
			.map((m: string) => {
				const idMatch = m.match(/id="([^"]*)"/);
				const textMatch = m.match(/>([^<]+)</);
				return { id: idMatch?.[1] ?? '', text: textMatch?.[1]?.trim() ?? '' };
			})
			.filter((t: { id: string; text: string }) => t.id && t.text);
	});

	let activeId = $state('');
	let articleEl: HTMLElement | undefined = $state();

	onMount(() => {
		if (!articleEl) return;
		const headings = articleEl.querySelectorAll('h2[id]');
		if (headings.length === 0) return;
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) activeId = entry.target.id;
				}
			},
			{ rootMargin: '-20% 0px -70% 0px' }
		);
		headings.forEach((h) => observer.observe(h));
		return () => observer.disconnect();
	});

	const blogSchema = $derived(
		item
			? {
					'@context': 'https://schema.org',
					'@type': 'BlogPosting',
					headline: item.title,
					image: ogImage,
					author: { '@type': 'Person', name: item.author?.name ?? 'HalalNeo' },
					datePublished: toIsoDate(item.date),
					dateModified: toIsoDate(item.date),
					mainEntityOfPage: {
						'@type': 'WebPage',
						'@id': `${baseUrl}/blog/${data.slug}`,
						url: `${baseUrl}/blog/${data.slug}`
					},
					wordCount: plainText(item.content).split(' ').filter(Boolean).length || undefined,
					articleSection: item.tags?.length ? item.tags.join(', ') : undefined,
					publisher: {
						'@type': 'Organization',
						name: 'HalalNeo',
						logo: { '@type': 'ImageObject', url: `${baseUrl}/api/media/og-default.png`, width: 600, height: 600 }
					},
					description: plainText(item.content).slice(0, 200)
				}
			: null
	);
</script>

<svelte:head>
	<!-- Title + description render once via root layout from loader `seo`
	     (which prefers metaTitle/metaDescription). -->
	<link rel="preload" as="image" href={data.item?.image ?? blogImages[0]} fetchpriority="high" />
	{#if blogSchema}
		{@html `<script type="application/ld+json">${JSON.stringify(blogSchema)}</script>`}
	{/if}
</svelte:head>

<div class="mx-auto max-w-6xl py-8">
  {#if data.item}
    <Breadcrumb
      items={[{ label: 'Blog', href: '/blog' }, { label: data.item.title ?? 'Blog Post' }]}
    />
    <div class="grid gap-6 lg:grid-cols-[1fr_240px_320px]">
      <main class="space-y-4 sm:space-y-6">
        <header class="space-y-4">
          <div class="flex flex-wrap gap-2">
            {#each data.item.tags as tag (tag)}
              <Badge variant="secondary">{tag}</Badge>
            {/each}
          </div>
          <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">{data.item.title}</h1>
          <div class="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>{data.item.author.initials}</AvatarFallback>
            </Avatar>
            <div>
              <p class="text-sm font-medium">{data.item.author.name}</p>
              <div class="flex items-center gap-2 text-xs text-muted-foreground">
                <time datetime={data.item.date || undefined}
                  >{data.item.date
                    ? new Date(data.item.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })
                    : ''}</time
                  >
                {#if readTime}
                  <span>·</span>
                  <span>{readTime}</span>
                {/if}
              </div>
            </div>
          </div>
        </header>

        {#if data.item.image}
          <img
            src={data.item.image}
            alt={data.item.title}
            class="aspect-[16/10] w-full rounded-xl object-cover"
            loading="eager"
            fetchpriority="high"
            decoding="async"
            width="1200"
            height="600"
            onerror={(e) => {
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
        {:else}
          <div class="relative overflow-hidden rounded-xl border border-border">
            <div class="aspect-[16/10] w-full">
              <img
                src={blogImages[0]}
                alt={data.item.title}
                class="h-full w-full object-cover"
                loading="eager"
                fetchpriority="high"
                decoding="async"
                width="1200"
                height="600"
              />
            </div>
          </div>
        {/if}

        <div class="content-body overflow-hidden">
          <div bind:this={articleEl}>
            {@html renderedBody}
          </div>
        </div>

                {#if tocItems.length}
          <aside class="hidden xl:block">
            <nav aria-label="Table of contents">
              <div class="sticky top-24">
                <div class="mb-3 text-xs font-semibold text-muted-foreground uppercase">
                  Contents
                </div>
                <ul class="space-y-1.5">
                  {#each tocItems as tocItem (tocItem.id)}
                    <li>
                      <a
                        href={"#" + tocItem.id}
                        class="block text-xs text-muted-foreground hover:text-foreground transition-colors"
                        class:selected={activeId === tocItem.id}
                      >
                        {tocItem.text}
                      </a>
                    </li>
                  {/each}
                </ul>
              </div>
            </nav>
          </aside>
        {/if}
        <div class="flex flex-wrap gap-2 border-t border-border pt-6">
          {#each data.item.tags as tag}
            <Badge variant="secondary">{tag}</Badge>
          {/each}
        </div>

        <Card>
          <CardContent class="space-y-3 p-4">
            <p class="text-sm text-muted-foreground">Found this helpful? Share it with your network.</p>
            <ShareButtons title={data.item.title ?? ''} text={data.item.excerpt ?? ''} />
          </CardContent>
        </Card>

        {#if data.related?.length}
          <section class="space-y-4 border-t border-border pt-8">
            <h2 class="text-xl font-semibold tracking-tight">Related articles</h2>
            <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {#each data.related as related (related.slug)}
                <a
                  href={localizeHref(`/blog/${related.slug}`)}
                  class="group block rounded-xl bg-card p-3 sm:p-4 ring-1 ring-foreground/10 transition-all hover:shadow-md"
                >
                  <div class="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <span class="font-medium text-foreground/80">{related.author.name}</span>
                    {#if related.date}
                      <span>·</span>
                      <time datetime={related.date}
                        >{new Date(related.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}</time
                        >
                    {/if}
                  </div>
                  <h3
                    class="mb-2 text-sm leading-snug font-semibold transition-colors group-hover:text-primary"
                  >
                    {related.title}
                  </h3>
                  <p class="line-clamp-2 text-xs text-muted-foreground">{related.excerpt}</p>
                  {#if related.tags?.length}
                    <div class="mt-3 flex flex-wrap gap-1.5">
                      {#each related.tags as tag (tag)}
                        <span
                          class="inline-flex items-center rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-secondary-foreground"
                          >{tag}</span
                        >
                      {/each}
                    </div>
                  {/if}
                </a>
              {/each}
            </div>
          </section>
        {/if}

        <div class="mt-8 border-t border-border pt-6">
          <h2 class="mb-4 text-xl font-semibold tracking-tight">Explore Related Resources</h2>
          <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {#each [
              { href: '/products', title: 'Browse Halal Products', desc: 'Explore our catalog of certified halal products.', cta: 'Browse Products', icon: ShoppingCart },
              { href: '/suppliers', title: 'Find Certified Suppliers', desc: 'Connect with verified halal-certified suppliers.', cta: 'Find Suppliers', icon: Store },
              { href: '/knowledge-base', title: 'Read Knowledge Base', desc: 'Guides, certifications, and halal compliance insights.', cta: 'Read Articles', icon: BookOpen }
            ] as item (item.href)}
              <a
                href={localizeHref(item.href)}
                class="group block rounded-xl bg-card p-3 sm:p-4 ring-1 ring-foreground/10 transition-all hover:shadow-md"
              >
                <div class="mb-2">
                  <item.icon class="size-5 text-primary/60 transition-colors group-hover:text-primary" />
                </div>
                <h3 class="text-sm font-semibold transition-colors group-hover:text-primary">
                  {item.title}
                </h3>
                <p class="mt-1 text-xs text-muted-foreground">{item.desc}</p>
                <span
                  class="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary transition-transform group-hover:translate-x-0.5"
                >
                  {item.cta}
                  <ArrowRight class="size-3" />
                </span>
              </a>
            {/each}
          </div>
        </div>
      </main>

      <aside class="hidden lg:block shrink-0">
        <div class="space-y-4 sticky top-24 z-10">
          <Card class="bg-card">
            <CardContent class="space-y-3 p-5">
              <div class="space-y-3">
                <h4 class="text-sm font-semibold">About the Author</h4>
                <div class="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{data.item.author.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p class="text-sm font-medium">{data.item.author.name}</p>
                    <p class="text-[10px] text-muted-foreground">Content Strategist</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {#if data.related?.length}
            <Card class="bg-card">
              <CardContent class="space-y-3 p-5">
                <h4 class="text-sm font-semibold">Related Posts</h4>
                <div class="space-y-3">
                  {#each data.related.slice(0, 5) as related (related.slug)}
                    <a href={localizeHref(`/blog/${related.slug}`)}>
                      <h5 class="text-xs font-medium group-hover:text-primary line-clamp-2">{related.title}</h5>
                      <p class="mt-0.5 text-[10px] text-muted-foreground">{related.excerpt}</p>
                    </a>
                  {/each}
                </div>
              </CardContent>
            </Card>
          {/if}

          <Card class="bg-card">
            <CardContent class="space-y-3 p-5">
              <h4 class="text-sm font-semibold">Share this article</h4>
              <ShareButtons title={data.item.title ?? ''} text={data.item.excerpt ?? ''} />
            </CardContent>
          </Card>
        </div>
      </aside>
    </div>
  {:else}
    <div class="flex min-h-[50vh] items-center justify-center">
      <div class="space-y-4 text-center">
        <p class="text-lg text-muted-foreground">Blog post coming soon.</p>
        <Button href={localizeHref('/blog')} variant="outline">Browse Articles</Button>
      </div>
    </div>
  {/if}
</div>
