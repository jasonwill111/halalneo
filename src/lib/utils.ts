import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { page } from '$app/state';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function getCanonicalUrl(): string {
	return page.url.pathname + page.url.search;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, 'child'> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, 'children'> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };
