import React from 'react';
import { useTranslation } from 'react-i18next';
import { SettingsContext } from '@renderer/contexts/SettingsContext';
import type { ThemePreference } from '../../../../common/ThemePreference';
import styles from './ThemeSelector.module.css';

const OPTIONS: { value: ThemePreference; labelKey: string }[] = [
	{ value: 'system', labelKey: 'theme-system' },
	{ value: 'light', labelKey: 'theme-light' },
	{ value: 'dark', labelKey: 'theme-dark' },
];

const ThemeSelector: React.FC = () => {
	const { t } = useTranslation();
	const { themeMode, setThemeMode } = React.useContext(SettingsContext);

	return (
		<div className={styles.group} role="radiogroup" aria-label={t('color-theme')}>
			{OPTIONS.map((opt) => (
				<button
					key={opt.value}
					type="button"
					role="radio"
					aria-checked={themeMode === opt.value}
					className={`${styles.option} ${
						themeMode === opt.value ? styles.optionActive : ''
					}`}
					onClick={() => setThemeMode(opt.value)}
				>
					{t(opt.labelKey)}
				</button>
			))}
		</div>
	);
};

export default ThemeSelector;
