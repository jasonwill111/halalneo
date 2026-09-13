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
