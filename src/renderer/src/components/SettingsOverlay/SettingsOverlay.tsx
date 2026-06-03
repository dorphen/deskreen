import React, { useCallback, useEffect, useState } from 'react';
import {
	Overlay2,
	Classes,
	H3,
	Tabs,
	Tab,
	Icon,
	Text,
	TabsExpander,
	Callout,
} from '@blueprintjs/core';
import CloseOverlayButton from '../CloseOverlayButton';
import SettingRowLabelAndInput from './SettingRowLabelAndInput';
import LanguageSelector from '../LanguageSelector';
import ThemeSelector from '../ThemeSelector';
import { IpcEvents } from '../../../../common/IpcEvents.enum';
import { useTranslation } from 'react-i18next';
import './settings-overlay.css';
import styles from './SettingsOverlay.module.css';

interface SettingsOverlayProps {
	isSettingsOpen: boolean;
	handleClose: () => void;
}

export default function SettingsOverlay(
	props: SettingsOverlayProps,
): React.ReactElement {
	const [clientViewerPort, setClientViewerPort] = useState('80');

	const { handleClose, isSettingsOpen } = props;
	const [latestVersion, setLatestVersion] = useState('');
	const [currentVersion, setCurrentVersion] = useState('');

	const { t } = useTranslation();

	const handleOpenDownload = useCallback((): void => {
		void window.electron.ipcRenderer.invoke(
			IpcEvents.OpenExternalLink,
			'https://deskreen.com/download',
		);
	}, []);

	const handleUpdateCalloutKeyDown = useCallback(
		(event: React.KeyboardEvent<HTMLDivElement>): void => {
			if (event.key === 'Enter' || event.key === ' ') {
				event.preventDefault();
				handleOpenDownload();
			}
		},
		[handleOpenDownload],
	);

	useEffect(() => {
		window.electron.ipcRenderer
			.invoke(IpcEvents.GetPort)
			.then((port) => {
				return setClientViewerPort(port);
			})
			.catch((error) => {
				console.error('Error getting port:', error);
			});

		return () => {
			window.electron.ipcRenderer.removeListener(
				'settings-overlay-close',
				handleClose,
			);
		};
	}, [handleClose]);

	useEffect(() => {
		const getLatestVersion = async (): Promise<void> => {
			const gotLatestVersion =
				await window.electron.ipcRenderer.invoke('get-latest-version');
			if (gotLatestVersion !== '') {
				setLatestVersion(gotLatestVersion);
			}
		};
		getLatestVersion();
		const getCurrentVersion = async (): Promise<void> => {
			const gotCurrentVersion =
				await window.electron.ipcRenderer.invoke('get-current-version');
			if (gotCurrentVersion !== '') {
				setCurrentVersion(gotCurrentVersion);
			}
		};
		getCurrentVersion();
	}, []);

	const hasUpdate =
		latestVersion !== '' &&
		currentVersion !== '' &&
		latestVersion !== currentVersion;

	const GeneralSettingsPanel: React.FC = () => {
		return (
			<div style={{ width: '100%' }}>
				{hasUpdate ? (
					<div className={styles.updateCalloutWrapper}>
						<Callout
							className={styles.updateCallout}
							icon="automatic-updates"
							intent="success"
							role="button"
							tabIndex={0}
							onClick={handleOpenDownload}
							onKeyDown={handleUpdateCalloutKeyDown}
						>
							<Text style={{ fontWeight: 600 }}>
								{t('deskreen-ce-update-is-available')}
							</Text>
							<Text>{`${t('your-current-version-is')} ${currentVersion}`}</Text>
							<Text>{`${t('click-to-download-new-updated-version')} ${latestVersion}`}</Text>
						</Callout>
					</div>
				) : null}

				<div className={styles.headerRow}>
					<H3 style={{ margin: 0 }}>{t('general-settings')}</H3>
				</div>

				<div className={styles.settingsList}>
					<SettingRowLabelAndInput
						icon="style"
						label={t('color-theme')}
						input={<ThemeSelector />}
					/>
					<SettingRowLabelAndInput
						icon="translate"
						label={t('language')}
						input={<LanguageSelector />}
					/>
				</div>

				<div className={styles.about}>
					<img
						src={`http://127.0.0.1:${clientViewerPort}/logo512.png`}
						alt="logo"
					/>
					<H3 style={{ margin: 0 }}>{t('about-deskreen')}</H3>
					<Text>{`${t('version')}: ${currentVersion} (${currentVersion})`}</Text>
					<Text>
						{`${t('copyright')} © ${new Date().getFullYear()} `}
						<a
							href="https://www.linkedin.com/in/pavlobu/"
							target="_blank"
							rel="noopener noreferrer"
							className={styles.link}
						>
							Pavlo Buidenkov
						</a>
					</Text>
					<Text>
						{`${t('website')}: `}
						<a
							href="https://www.deskreen.com"
							target="_blank"
							rel="noopener noreferrer"
							className={styles.link}
						>
							https://www.deskreen.com
						</a>
					</Text>
				</div>
			</div>
		);
	};

	const getTabNavGeneralSettingsButton = (): React.ReactElement => {
		return (
			<div className={styles.tabNavigationRowButton}>
				<Icon icon="wrench" />
				<Text>{t('general')}</Text>
			</div>
		);
	};

	return (
		<Overlay2
			onClose={handleClose}
			className={`${Classes.OVERLAY_SCROLL_CONTAINER} bp3-overlay-settings`}
			autoFocus
			canEscapeKeyClose
			canOutsideClickClose
			enforceFocus
			hasBackdrop
			isOpen={isSettingsOpen}
			usePortal
			transitionDuration={0}
		>
			<div className={styles.overlayInnerRoot}>
				<div
					id="settings-overlay-inner"
					className={`${styles.overlayInsideFade} ${Classes.CARD}`}
				>
					<CloseOverlayButton
						className={styles.absoluteCloseButton}
						onClick={handleClose}
						isDefaultStyles
					/>
					<Tabs
						animate
						id="TabsExample"
						key="vertical"
						renderActiveTabPanelOnly
						vertical
					>
						<Tab
							id="rx"
							title=""
							panel={<GeneralSettingsPanel />}
							panelClassName={'tab-panel-wide-custom-style'}
						>
							{getTabNavGeneralSettingsButton()}
						</Tab>
						<TabsExpander />
					</Tabs>
				</div>
			</div>
		</Overlay2>
	);
}
