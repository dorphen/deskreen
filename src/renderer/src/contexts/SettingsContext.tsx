import React from 'react';
import type {
	ResolvedTheme,
	ThemePreference,
} from '../../../common/ThemePreference';

export interface SettingsContextInterface {
	currentLanguage: string;
	setCurrentLanguageHook: (newLang: string) => void;
	themeMode: ThemePreference;
	resolvedTheme: ResolvedTheme;
	setThemeMode: (mode: ThemePreference) => void;
}

export const defaultSettingsContextValue: SettingsContextInterface = {
	setCurrentLanguageHook: () => {
		// noop default
	},
	currentLanguage: 'en',
	themeMode: 'system',
	resolvedTheme: 'dark',
	setThemeMode: () => {
		// noop default
	},
};

export const SettingsContext = React.createContext<SettingsContextInterface>(
	defaultSettingsContextValue,
);
