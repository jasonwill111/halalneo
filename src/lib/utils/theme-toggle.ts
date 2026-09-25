import { toggleMode, userPrefersMode } from 'mode-watcher';

const THEME_COLOR_LIGHT = '#f8f4eb';
const THEME_COLOR_DARK = '#021012';

function syncThemeColor(): void {
	const theme = userPrefersMode.current;
	for (const meta of document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')) {
		if (theme === 'system') {
			const media = meta.getAttribute('media');
			if (media) meta.setAttribute('media', media);
			else meta.removeAttribute('media');
		} else {
			meta.removeAttribute('media');
			meta.setAttribute('content', theme === 'dark' ? THEME_COLOR_DARK : THEME_COLOR_LIGHT);
		}
	}
}

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
	syncThemeColor();
	void root.offsetHeight;
	requestAnimationFrame(() => root.classList.remove('theme-transitioning'));
}
