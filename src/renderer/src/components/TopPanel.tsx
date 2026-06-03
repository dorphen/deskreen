import React from 'react';
import { useTranslation } from 'react-i18next';
import SettingsOverlay from './SettingsOverlay/SettingsOverlay';
import ConnectedDevicesListDrawer from './ConnectedDevicesListDrawer';
import { IpcEvents } from '../../../common/IpcEvents.enum';
import { SettingsContext } from '@renderer/contexts/SettingsContext';
import Logo192 from '../assets/logo192.png';
import {
	DevicesIcon,
	MoonIcon,
	ResetIcon,
	SettingsIcon,
	SunIcon,
	TutorialIcon,
	UpdateArrowIcon,
} from './icons';
import styles from './TopPanel.module.css';

interface Props {
	handleReset: () => void;
}

export default function TopPanel({ handleReset }: Props): React.ReactElement {
	const { t } = useTranslation();
	const { resolvedTheme, setThemeMode } = React.useContext(SettingsContext);

	const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
	const [isConnectedDevicesDrawerOpen, setIsConnectedDevicesDrawerOpen] =
		React.useState(false);
	const [latestVersion, setLatestVersion] = React.useState('');
	const [currentVersion, setCurrentVersion] = React.useState('');
	const [connectedDevicesCount, setConnectedDevicesCount] = React.useState(0);

	const handleSettingsOpen = React.useCallback(() => {
		setIsSettingsOpen(true);
	}, []);

	const handleSettingsClose = React.useCallback(() => {
		setIsSettingsOpen(false);
	}, []);

	const handleToggleConnectedDevicesListDrawer = React.useCallback(() => {
		setIsConnectedDevicesDrawerOpen((open) => !open);
	}, []);

	const handleTutorialButtonClick = React.useCallback(() => {
		window.electron.ipcRenderer.invoke(
			IpcEvents.OpenExternalLink,
			'https://deskreen.com/howto',
		);
	}, []);

	const handleOpenDownloadPage = React.useCallback((): void => {
		void window.electron.ipcRenderer.invoke(
			IpcEvents.OpenExternalLink,
			'https://deskreen.com/download',
		);
	}, []);

	const handleToggleTheme = React.useCallback(() => {
		setThemeMode(resolvedTheme === 'dark' ? 'light' : 'dark');
	}, [resolvedTheme, setThemeMode]);

	React.useEffect(() => {
		const fetchVersions = async (): Promise<void> => {
			const [latest, current] = await Promise.all([
				window.electron.ipcRenderer.invoke('get-latest-version'),
				window.electron.ipcRenderer.invoke('get-current-version'),
			]);
			if (typeof latest === 'string') {
				setLatestVersion(latest);
			}
			if (typeof current === 'string') {
				setCurrentVersion(current);
			}
		};

		void fetchVersions();
	}, []);

	React.useEffect(() => {
		const fetchConnectedDevicesCount = async (): Promise<void> => {
			try {
				const devices = await window.electron.ipcRenderer.invoke(
					IpcEvents.GetConnectedDevices,
				);
				if (Array.isArray(devices)) {
					setConnectedDevicesCount(devices.length);
				}
			} catch (e) {
				console.error(e);
			}
		};

		void fetchConnectedDevicesCount();

		const handleDevicesChanged = (_: unknown, count: unknown): void => {
			if (typeof count === 'number') {
				setConnectedDevicesCount(count);
			} else {
				void fetchConnectedDevicesCount();
			}
		};
		window.electron.ipcRenderer.on(
			IpcEvents.DevicesChanged,
			handleDevicesChanged,
		);

		return () => {
			window.electron.ipcRenderer.removeListener(
				IpcEvents.DevicesChanged,
				handleDevicesChanged,
			);
		};
	}, []);

	const hasUpdate =
		latestVersion !== '' &&
		currentVersion !== '' &&
		latestVersion !== currentVersion;

	return (
		<>
			<div className={styles.root}>
				<div id="logo-with-popover-visit-website" className={styles.brand}>
					<img src={Logo192} alt={t('deskreen-logo')} />
					<div>
						<div className={`${styles.name} dk-gradient-text`}>Deskreen</div>
						<div className={styles.tag}>Community Edition</div>
					</div>
				</div>

				<div className={styles.right}>
					{hasUpdate ? (
						<span
							className={styles.updatePill}
							role="button"
							tabIndex={0}
							title={t('new-version-available')}
							onClick={handleOpenDownloadPage}
							onKeyDown={(event) => {
								if (event.key === 'Enter' || event.key === ' ') {
									event.preventDefault();
									handleOpenDownloadPage();
								}
							}}
						>
							<UpdateArrowIcon />
							{t('new-version-available')}
						</span>
					) : null}

					<div className={styles.controls}>
						<div className={styles.iconBtnWrap}>
							<button
								type="button"
								id="top-panel-connected-devices-list-button"
								className="dk-iconbtn"
								title={t('connected-devices')}
								onClick={handleToggleConnectedDevicesListDrawer}
							>
								<DevicesIcon />
							</button>
							{connectedDevicesCount > 0 && (
								<span className={styles.badge}>{connectedDevicesCount}</span>
							)}
						</div>

						<button
							type="button"
							id="top-panel-help-button"
							className={`dk-iconbtn ${styles.dangerBtn}`}
							title={t('fix-reset-tooltip')}
							onClick={() => {
								Promise.resolve(handleReset()).then(() => {
									window.electron.ipcRenderer.invoke(
										IpcEvents.CreateWaitingForConnectionSharingSession,
									);
								});
							}}
						>
							<ResetIcon />
						</button>

						<button
							type="button"
							id="top-panel-tutorial-button"
							className="dk-iconbtn"
							title={t('tutorial')}
							onClick={handleTutorialButtonClick}
						>
							<TutorialIcon />
						</button>

						<span className={styles.divider} />

						<button
							type="button"
							id="top-panel-theme-toggle-button"
							className="dk-iconbtn"
							title={t('toggle-theme')}
							onClick={handleToggleTheme}
						>
							{resolvedTheme === 'dark' ? <MoonIcon /> : <SunIcon />}
						</button>

						<button
							type="button"
							id="top-panel-settings-button"
							className="dk-iconbtn"
							title={t('settings')}
							onClick={handleSettingsOpen}
						>
							<SettingsIcon />
						</button>
					</div>
				</div>
			</div>

			{isSettingsOpen ? (
				<SettingsOverlay
					isSettingsOpen={isSettingsOpen}
					handleClose={handleSettingsClose}
				/>
			) : null}
			{isConnectedDevicesDrawerOpen ? (
				<ConnectedDevicesListDrawer
					isOpen={isConnectedDevicesDrawerOpen}
					handleToggle={handleToggleConnectedDevicesListDrawer}
					handleReset={handleReset}
				/>
			) : null}
		</>
	);
}
