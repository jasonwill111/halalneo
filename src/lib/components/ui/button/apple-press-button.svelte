<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.js';
	import { cn } from '#lib/utils.js';
	import { applePress, notifyPress } from '#lib/actions/apple-motion.svelte';
	import { browser } from '$app/environment';
	import { prefersReducedMotion, canUseMotion } from '#lib/utils/motion';

	// Props
	let href = $props<{ href?: string }>();
	let variant = $props<{ variant?: 'default' | 'outline' | 'ghost' | 'link' }>({});
	let size = $props<{ size?: 'default' | 'sm' | 'lg' | 'icon' }>({});
	let disabled = $props<{ disabled?: boolean }>({});
	let loading = $props<{ loading?: boolean }>({});
	let children = $props<{ children?: any[] | string }>({});

	// 计算动画属性
	const useAppleMotion = $derived(() => {
		if (!browser) return false;
		if (prefersReducedMotion()) return false;
		if (!canUseMotion()) return false;
		return true;
	});

	// 处理点击的原子级反馈函数
	function handlePressStart(e: Event) {
		// 仅在需要时才触发 Apple 物理动画
		if (useAppleMotion && !disabled) {
			notifyPress(e.currentTarget);
		}
	}
</script>

{#if href}
	{@const isApple = useAppleMotion}
	<a 
		{href}
		{variant}
		{size}
		{disabled}
		{loading}
		onpointerdown={handlePressStart}
		ontouchstart={handlePressStart}
		{isApple}
		variant={variant}
		size={size}
		disabled={disabled}
		class={cn(
			"relative overflow-hidden",
			variant === "default" && "bg-primary text-primary-foreground hover:bg-primary/90",
			variant === "outline" && "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
			variant === "ghost" && "hover:bg-accent hover:text-accent-foreground",
			variant === "link" && "text-primary underline-offset-4 hover:underline",
			size === "sm" && "h-8 px-3 text-xs",
			size === "lg" && "h-10 px-8",
			size === "icon" && "h-10 w-10",
			disabled && "opacity-50 cursor-not-allowed",
			$props.class
		)}
	>
		<span class="flex items-center gap-2">
			{children}
		</span>
	</a>
{:else}
	{#key ($props.children?.constructor === Array ? $props.children.length : 1)}
	<Button 
		{variant}
		{size}
		{disabled}
		{loading}
		onpointerdown={handlePressStart}
		ontouchstart={handlePressStart}
		{$props.class}
		{$props.disabled}
		disabled={disabled}
		{$props.loading}
		loading={loading}
	>
		<span class="flex items-center gap-2">
			{children}
		</span>
	</Button>
	{/key}
{/if}
