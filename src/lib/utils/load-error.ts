/**
 * §3.1 / §6.3 error-state plumbing for frontend `+page.ts` loaders.
 *
 * List loaders used to swallow failed API responses (`res.ok ? data : []`), so a 500
 * rendered as "Nothing here yet". `fetchSafe` keeps that safe fallback shape but records
 * a structured {@link LoadFailure} instead, which pages hand to
 * `#lib/components/site/error-retry.svelte` — a real error state that separates network
 * failures from server failures and offers a working retry.
 */

export type LoadFailureKind = 'network' | 'server';

export interface LoadFailure {
	/** `network` = the request never reached our origin; `server` = it replied with an error status. */
	kind: LoadFailureKind;
	/** HTTP status for `server` failures, `0` when nothing answered. */
	status: number;
	/** Ready-to-render copy — never leaks raw upstream text. */
	message: string;
}

/** The `fetch` shape universal `load` functions hand out (relative URLs only here). */
export type LoaderFetch = (input: string, init?: RequestInit) => Promise<Response>;

const NETWORK_MESSAGE = 'Network error — check your connection and try again.';
const SERVER_MESSAGE = 'Our servers could not build this list just now.';

function httpFailure(status: number): LoadFailure {
	return {
		kind: 'server',
		status,
		message: status >= 500 ? SERVER_MESSAGE : `The catalogue service replied with status ${status}.`
	};
}

function thrownFailure(error: unknown): LoadFailure {
	const raw = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
	const isNetwork =
		error instanceof TypeError || /failed to fetch|network|err_|timed? ?out/i.test(raw);
	return isNetwork
		? { kind: 'network', status: 0, message: NETWORK_MESSAGE }
		: { kind: 'server', status: 500, message: SERVER_MESSAGE };
}

/**
 * `fetch` that never rejects: a thrown network error or a non-ok status is pushed into
 * `failures` and a non-ok stand-in response comes back, so callers keep using
 * `res.ok ? … : fallback` without turning an outage into an empty state.
 */
export async function fetchSafe(
	fetcher: LoaderFetch,
	url: string,
	failures: LoadFailure[]
): Promise<Response> {
	try {
		const res = await fetcher(url);
		if (!res.ok) failures.push(httpFailure(res.status));
		return res;
	} catch (error) {
		failures.push(thrownFailure(error));
		return new Response(null, { status: 504, statusText: 'Gateway Timeout' });
	}
}

/** Normalises a client-side (`+page.svelte`) fetch failure for the same error block. */
export function describeFetchFailure(res: Response): LoadFailure {
	return httpFailure(res.status);
}

/** Client-side counterpart of {@link describeFetchFailure} for the thrown case. */
export function describeThrownFailure(error: unknown): LoadFailure {
	return thrownFailure(error);
}

/** The failure a page should surface, or `null` when every request succeeded. */
export function firstFailure(failures: LoadFailure[]): LoadFailure | null {
	return failures[0] ?? null;
}
