import { useState, useCallback, useEffect } from 'react';
import ChooseAppOrScreenOverlay from './StepsOfStepper/ChooseAppOrScreenOverlay/ChooseAppOrScreenOverlay';
import { useTranslation } from 'react-i18next';
import { IpcEvents } from '../../../common/IpcEvents.enum';
import { AppWindowIcon, ScreenIcon } from './icons';
import styles from './ShareAppOrScreenControlGroup.module.css';

interface ShareAppOrScreenControlGroupProps {
	handleNextEntireScreen: () => void;
	handleNextApplicationWindow: () => void;
}

export default function ShareAppOrScreenControlGroup(
	props: ShareAppOrScreenControlGroupProps,
) {
	const { handleNextEntireScreen, handleNextApplicationWindow } = props;
	const { t } = useTranslation();

	const [isChooseAppOrScreenOverlayOpen, setChooseAppOrScreenOverlayOpen] =
		useState(false);

	const [isEntireScreenToShareChosen, setEntireScreenToShareChosen] =
		useState(false);

	const [isWaylandSession, setIsWaylandSession] = useState(false);

	useEffect(() => {
		let cancelled = false;

		window.electron.ipcRenderer
			.invoke(IpcEvents.GetIsLinuxWaylandSession)
			.then((value: boolean) => {
				if (!cancelled) {
					setIsWaylandSession(Boolean(value));
				}
			})
			.catch((error: unknown) => {
				console.error('failed to detect session environment', error);
			});

		return () => {
			cancelled = true;
		};
	}, []);

	const handleOpenChooseAppOrScreenOverlay = useCallback(() => {
		setChooseAppOrScreenOverlayOpen(true);
	}, []);

	const handleCloseChooseAppOrScreenOverlay = useCallback(() => {
		setChooseAppOrScreenOverlayOpen(false);
	}, []);

	const handleWaylandShare = useCallback(
		async (mode: 'screen' | 'window') => {
			try {
				const sourceId: string | null =
					await window.electron.ipcRenderer.invoke(
						IpcEvents.RequestDesktopCapturerPortalSource,
						{ mode },
					);
				if (!sourceId) {
					return;
				}
				await window.electron.ipcRenderer.invoke(
					IpcEvents.SetDesktopCapturerSourceId,
					sourceId,
				);
				if (mode === 'screen') {
					handleNextEntireScreen();
				} else {
					handleNextApplicationWindow();
				}
			} catch (error) {
				console.error(
					'failed to acquire desktop capture source via portal',
					error,
				);
			}
		},
		[handleNextApplicationWindow, handleNextEntireScreen],
	);

	const handleChooseAppOverlayOpen = useCallback(() => {
		if (isWaylandSession) {
			void handleWaylandShare('window');
			return;
		}
		setEntireScreenToShareChosen(false);
		handleOpenChooseAppOrScreenOverlay();
	}, [
		handleOpenChooseAppOrScreenOverlay,
		handleWaylandShare,
		isWaylandSession,
	]);

	const handleChooseEntireScreenOverlayOpen = useCallback(() => {
		if (isWaylandSession) {
			void handleWaylandShare('screen');
			return;
		}
		setEntireScreenToShareChosen(true);
		handleOpenChooseAppOrScreenOverlay();
	}, [
		handleOpenChooseAppOrScreenOverlay,
		handleWaylandShare,
		isWaylandSession,
	]);

	return (
		<>
			<div id="share-screen-or-app-btn-group" className={styles.group}>
				<button
					type="button"
					className={styles.shareBtn}
					onClick={handleChooseEntireScreenOverlayOpen}
				>
					<ScreenIcon size={56} />
					<span>{t('entire-screen')}</span>
				</button>
				<span className={styles.orBadge}>{t('or')}</span>
				<button
					type="button"
					className={styles.shareBtn}
					onClick={handleChooseAppOverlayOpen}
				>
					<AppWindowIcon size={56} />
					<span>{t('application-window')}</span>
				</button>
			</div>
			<ChooseAppOrScreenOverlay
				isEntireScreenToShareChosen={isEntireScreenToShareChosen}
				isChooseAppOrScreenOverlayOpen={isChooseAppOrScreenOverlayOpen}
				handleClose={handleCloseChooseAppOrScreenOverlay}
				handleNextEntireScreen={handleNextEntireScreen}
				handleNextApplicationWindow={handleNextApplicationWindow}
				isWaylandSession={isWaylandSession}
			/>
		</>
	);
}
