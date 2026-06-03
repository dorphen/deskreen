import React, { useCallback, useEffect, useState } from 'react';
import { Classes } from '@blueprintjs/core';
import { SettingsContext } from '@renderer/contexts/SettingsContext';
import { IpcEvents } from '../../../common/IpcEvents.enum';
import type {
	ResolvedTheme,
	ThemePreference,
} from '../../../common/ThemePreference';

// Kept for back-compat with toast styling; mirrors the light surface token.
export const LIGHT_UI_BACKGROUND = 'rgba(240, 248, 250, 1)';

function applyResolvedTheme(theme: ResolvedTheme): void {
	document.documentElement.dataset.theme = theme;
	// Blueprint themes via the `bp6-dark` class; put it on <body> so portalled
	// overlays (dialogs/drawers append to body) are themed too.
	document.body.classList.toggle(Classes.DARK, theme === 'dark');
}

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [currentLanguage, setCurrentLanguage] = useState('en');
	const [themeMode, setThemeModeState] = useState<ThemePreference>('system');
	const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(
		(document.documentElement.dataset.theme as ResolvedTheme) || 'dark',
	);

	const setCurrentLanguageHook = (newLang: string): void => {
		setCurrentLanguage(newLang);
	};

	const setThemeMode = useCallback((mode: ThemePreference): void => {
		setThemeModeState(mode);
		void window.electron.ipcRenderer
			.invoke(IpcEvents.SetThemePreference, mode)
			.then((resolved) => {
				if (resolved === 'dark' || resolved === 'light') {
					setResolvedTheme(resolved);
					applyResolvedTheme(resolved);
				}
			});
	}, []);

	// Pause our CSS animations while the window is hidden/occluded.
	useEffect(() => {
		const applyHidden = (): void => {
			document.body.classList.toggle('dk-hidden', document.hidden);
		};
		applyHidden();
		document.addEventListener('visibilitychange', applyHidden);
		return () => {
			document.removeEventListener('visibilitychange', applyHidden);
		};
	}, []);

	useEffect(() => {
		let cancelled = false;

		void Promise.all([
			window.electron.ipcRenderer.invoke(IpcEvents.GetThemePreference),
			window.electron.ipcRenderer.invoke(IpcEvents.GetResolvedTheme),
		]).then(([pref, resolved]) => {
			if (cancelled) return;
			if (pref === 'system' || pref === 'dark' || pref === 'light') {
				setThemeModeState(pref);
			}
			if (resolved === 'dark' || resolved === 'light') {
				setResolvedTheme(resolved);
				applyResolvedTheme(resolved);
			}
		});

		const handleThemeChanged = (_: unknown, resolved: ResolvedTheme): void => {
			if (resolved === 'dark' || resolved === 'light') {
				setResolvedTheme(resolved);
				applyResolvedTheme(resolved);
			}
		};
		window.electron.ipcRenderer.on(IpcEvents.ThemeChanged, handleThemeChanged);

		return () => {
			cancelled = true;
			window.electron.ipcRenderer.removeListener(
				IpcEvents.ThemeChanged,
				handleThemeChanged,
			);
		};
	}, []);

	const value = {
		currentLanguage,
		setCurrentLanguageHook,
		themeMode,
		resolvedTheme,
		setThemeMode,
	};

	return (
		<SettingsContext.Provider value={value}>
			{children}
		</SettingsContext.Provider>
	);
};
