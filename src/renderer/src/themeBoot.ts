// Runs before the React bundle (referenced first in index.html) to set the
// theme attribute from the OS preference, avoiding a flash of the wrong theme
// before SettingsProvider reconciles with the persisted preference over IPC.
// Kept as a module (not inline) because the CSP forbids inline scripts.
const prefersDark =
	window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? true;
document.documentElement.dataset.theme = prefersDark ? 'dark' : 'light';
