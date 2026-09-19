import { toggleMode } from 'mode-watcher';

/**
 * Instant light/dark switch. The swap changes color/background/border/shadow
 * on nearly every element at once, so any live transition fires together and
 * the toggle smears (~400ms of perceived lag). Instead we suppress all
 * transitions for exactly the switch: add the class, flip the mode, force a
 * style flush so the new colors paint while suppressed, restore next frame.
 * The `html.theme-transitioning` rule lives in src/routes/layout.css.
 */
export function switchTheme(): void {
	const root = document.documentElement;
	root.classList.add('theme-transitioning');
	toggleMode();
	void root.offsetHeight;
	requestAnimationFrame(() => root.classList.remove('theme-transitioning'));
}
