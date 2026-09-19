/**
 * Post-authentication redirect targets come from a user-controlled `?next=`
 * query param, so they must never be handed straight to `goto()`. This is the
 * single allow-list gate: only same-document absolute paths survive.
 */

/**
 * Returns `raw` when it is a safe in-site path, otherwise `fallback`.
 *
 * Rejected: absolute URLs (`https://evil.test`), protocol-relative targets
 * (`//evil.test`), backslash variants browsers normalise to `//`, and the empty
 * string. Query/hash are preserved because the value is used as a document path.
 */
export function safeNextPath(raw: string | null | undefined, fallback: string): string {
	if (!raw) return fallback;
	if (raw[0] !== '/') return fallback;
	if (raw[1] === '/' || raw[1] === '\\') return fallback;
	return raw;
}
