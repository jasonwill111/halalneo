export const prerender = false;

// The listing is loaded client-side from `/api/knowledge-base?status=all`
// (admin-only, `Cache-Control: private, no-store`) so the table can offer a
// Retry action without a full navigation. An earlier `load()` here fetched
// `/api/kb`, a route that does not exist, so the page was permanently in its
// error state.
