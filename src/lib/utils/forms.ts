// Shared client-side form helpers — Project Rules §3.4 (表单体验规范).
//
// Server validation failures arrive as `{ error: string; details?: Record<string, string[]> }`
// (Zod `flatten().fieldErrors`). Pages map `details` onto per-field messages
// rendered via `ui/field` `FieldError`, then call `focusFirstInvalid` so
// keyboard/screen-reader users land on the first problem field.

export type ServerFieldDetails =
	| Record<string, string[] | string | undefined>
	| undefined
	| null;

/** First message for one field from server `details`, or `''`. */
export function serverFieldMessage(details: ServerFieldDetails, field: string): string {
	if (!details || typeof details !== 'object') return '';
	const v = details[field];
	if (Array.isArray(v)) return v[0] ?? '';
	if (typeof v === 'string') return v;
	return '';
}

/** Merge server `details` into a `{ field: message }` error map (first message wins). */
export function mergeServerDetails(
	current: Record<string, string>,
	details: ServerFieldDetails
): Record<string, string> {
	if (!details || typeof details !== 'object') return current;
	const next = { ...current };
	for (const [key, value] of Object.entries(details)) {
		const msg = Array.isArray(value) ? (value[0] ?? '') : typeof value === 'string' ? value : '';
		if (msg) next[key] = msg;
	}
	return next;
}

/**
 * Normalise a Better Auth client error into the project's `{ field: messages }`
 * shape (§3.4) so it can be fed straight to `mergeServerDetails`.
 *
 * better-auth wraps server failures as `{ message, status, body }`. When the
 * body carries our `{ error, details: { field: [msg] } }` contract we hand back
 * those field messages; otherwise the single message is attached to the field
 * the user can actually act on (anything mentioning email → `email`, else
 * `fallback`). Returns `null` when there is nothing mappable.
 */
export function readAuthErrorDetails(
	err: unknown,
	fallback = 'password'
): Record<string, string[] | string> | null {
	if (!err || typeof err !== 'object') return null;
	const body = (err as { body?: unknown }).body;
	if (body && typeof body === 'object') {
		const details = (body as { details?: unknown }).details;
		if (details && typeof details === 'object') {
			return details as Record<string, string[] | string>;
		}
	}
	const { status, message } = err as { status?: number; message?: string };
	if (status && status >= 400 && message) {
		return /email/i.test(message) ? { email: message } : { [fallback]: message };
	}
	return null;
}

const FOCUSABLE = 'input,textarea,select,button,a[href],[tabindex]:not([tabindex="-1"])';

/** Focus the first `aria-invalid="true"` control inside a form after failed validation. */
export function focusFirstInvalid(form: HTMLElement | null | undefined): void {
	if (!form || typeof document === 'undefined') return;
	const invalid = form.querySelector('[aria-invalid="true"]');
	let target: HTMLElement | null = null;
	if (invalid instanceof HTMLElement) {
		if (invalid.matches(FOCUSABLE)) {
			target = invalid;
		} else {
			// Non-focusable marker (e.g. custom trigger wrapper) — find a control nearby.
			const scope = invalid.closest('[data-slot="field"]') ?? invalid.parentElement;
			target = scope?.querySelector<HTMLElement>(FOCUSABLE) ?? null;
		}
	}
	target ??= form.querySelector<HTMLElement>(FOCUSABLE);
	target?.focus({ preventScroll: false });
}
