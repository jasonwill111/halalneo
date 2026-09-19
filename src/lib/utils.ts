import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';
import { page } from '$app/state';

// The custom type scale (§1.1: text-4xs/3xs/2xs/2xs-plus) is unknown to
// tailwind-merge's default config, which classifies any unrecognized
// `text-*` as a text COLOR — so `cn('text-primary-foreground …', 'text-2xs-plus')`
// silently deleted the color class (green-on-green Send Inquiry button).
// Registering the steps as font-size keeps both classes alive.
const twMerge = extendTailwindMerge({
	extend: {
		classGroups: {
			'font-size': ['text-4xs', 'text-3xs', 'text-2xs', 'text-2xs-plus']
		}
	}
});

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function getCanonicalUrl(): string {
	return page.url.pathname + page.url.search;
}

export type WithoutChild<T> = T extends { child?: unknown } ? Omit<T, 'child'> : T;
export type WithoutChildren<T> = T extends { children?: unknown } ? Omit<T, 'children'> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };
