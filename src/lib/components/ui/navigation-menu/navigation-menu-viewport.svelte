<script lang="ts">
	import { NavigationMenu as NavigationMenuPrimitive } from 'bits-ui';
	import { cn } from '#lib/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: NavigationMenuPrimitive.ViewportProps = $props();
</script>

<NavigationMenuPrimitive.Viewport
	bind:ref
	data-slot="navigation-menu-viewport"
	class={cn(
		'absolute top-full left-1/2 -translate-x-1/2 z-[100] mt-1.5 h-[calc(var(--bits-navigation-menu-viewport-height)+1rem)] w-full overflow-hidden rounded-xl bg-popover text-popover-foreground shadow ring-1 ring-foreground/10 duration-100 md:w-[calc(var(--bits-navigation-menu-viewport-width)+1rem)]',
		'data-open:animate-in data-open:zoom-in-90 data-closed:animate-out data-closed:zoom-out-90 origin-top-center relative',
		className
	)}
	{...restProps}
/>
