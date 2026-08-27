import { sequence, type Handle } from '@sveltejs/kit/hooks';
import { building } from '$app/env';
import { createAuth } from '#lib/server/auth.js';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { getTextDirection } from '#lib/paraglide/runtime.js';
import { paraglideMiddleware } from '#lib/paraglide/server.js';

const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		// Kit 3 made `event.request` readonly; redefine it in place rather than
		// passing a clone — kit's tracing layer spreads own enumerable props,
		// so a clone loses `route`/`url` and prerendering crashes.
		Object.defineProperty(event, 'request', {
			value: request,
			writable: true,
			enumerable: true,
			configurable: true
		});

		return resolve(event, {
			transformPageChunk: ({ html }) =>
				html
					.replace('%paraglide.lang%', locale)
					.replace('%paraglide.dir%', getTextDirection(locale))
		});
	});

const handleBetterAuth: Handle = async ({ event, resolve }) => {
	// During prerendering (`building` is true) the platform bindings are
	// unavailable — accessing `event.platform.env.DB` throws — so skip auth
	// entirely; prerendered routes never read D1.
	if (building) return resolve(event);
	// Without a D1 binding (e.g. plain `vite dev`) auth is skipped so the
	// prototype runs on example data; production always provides the binding.
	const db = event.platform?.env?.DB;
	if (!db) return resolve(event);

	event.locals.auth = createAuth(db);

	const { auth } = event.locals;
	const session = await auth.api.getSession({ headers: event.request.headers });

	if (session) {
		event.locals.session = session.session;
		event.locals.user = session.user;
	}

	return svelteKitHandler({ event, resolve, auth, building });
};

export const handle: Handle = sequence(handleParaglide, handleBetterAuth);
