import React, { useState, useCallback, useEffect, ReactNode } from 'react';
import {
	Button,
	Dialog,
	H1,
	H3,
	H4,
	H5,
	Icon,
	Spinner,
} from '@blueprintjs/core';
import IntermediateStep from '@renderer/components/StepsOfStepper/IntermediateStep';
import { Device } from '../../../common/Device';
import LanguageSelector from '@renderer/components/LanguageSelector';
import { getShuffledArrayOfHello } from '@renderer/configs/i18next.config.client';
import { IpcEvents } from '../../../common/IpcEvents.enum';
import DeviceConnectedInfoButton from '@renderer/components/StepperPanel/DeviceConnectedInfoButton';
import AllowConnectionForDeviceAlert from '@renderer/components/AllowConnectionForDeviceAlert';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { showMessageFromNewToaster } from '@renderer/utils/showMessageFromNewToaster';
import {
	AppWindowIcon,
	CheckIcon,
	ScreenIcon,
	WifiIcon,
} from '@renderer/components/icons';
import styles from './DeskreenStepper.module.css';

function getSteps(t: TFunction): string[] {
	return [t('connect'), t('select'), t('confirm')];
}

interface Props {
	activeStep: number;
	setActiveStep: React.Dispatch<React.SetStateAction<number>>;
	isAllowDeviceAlertOpen: boolean;
	setIsAllowDeviceAlertOpen: (isOpen: boolean) => void;
	isUserAllowedConnection: boolean;
	setIsUserAllowedConnection: (isAllowed: boolean) => void;
	pendingConnectionDevice: Device | null;
	setPendingConnectionDevice: (device: Device | null) => void;
	handleReset: () => void;
}

const DeskreenStepper = ({
	activeStep,
	setActiveStep,
	isAllowDeviceAlertOpen,
	setIsAllowDeviceAlertOpen,
	isUserAllowedConnection,
	setIsUserAllowedConnection,
	pendingConnectionDevice,
	setPendingConnectionDevice,
	handleReset,
}: Props): ReactNode => {
	const { t } = useTranslation();

	const [isEntireScreenSelected, setIsEntireScreenSelected] = useState(false);
	const [isApplicationWindowSelected, setIsApplicationWindowSelected] =
		useState(false);
	const [isNoWiFiError, setisNoWiFiError] = useState(false);
	const [isSelectLanguageDialogOpen, setIsSelectLanguageDialogOpen] =
		useState(false);
	const [helloWord, setHelloWord] = useState('Hello');

	useEffect(() => {
		let helloInterval: NodeJS.Timeout;
		async function stepperOpenedCallback(): Promise<void> {
			const isFirstTimeStart = await window.electron.ipcRenderer.invoke(
				IpcEvents.GetIsFirstTimeAppStart,
			);
			setIsSelectLanguageDialogOpen(isFirstTimeStart);
			if (!isFirstTimeStart) return;
			const helloWords = getShuffledArrayOfHello();
			let pos = 0;
			helloInterval = setInterval(() => {
				if (pos + 1 === helloWords.length) {
					pos = 0;
				} else {
					pos += 1;
				}
				setHelloWord(helloWords[pos]);
			}, 4000);
		}
		stepperOpenedCallback();

		return () => {
			clearInterval(helloInterval);
		};
	}, []);

	useEffect(() => {
		let cancelled = false;

		const applyWifiStatus = (isConnected: boolean): void => {
			if (cancelled) return;
			setisNoWiFiError(!isConnected);
		};

		void window.electron.ipcRenderer
			.invoke('check-wifi-connection')
			.then((isConnected) => applyWifiStatus(Boolean(isConnected)));

		const handleWifiChanged = (_: unknown, isConnected: unknown): void => {
			applyWifiStatus(Boolean(isConnected));
		};
		window.electron.ipcRenderer.on(
			IpcEvents.WifiStatusChanged,
			handleWifiChanged,
		);

		return () => {
			cancelled = true;
			window.electron.ipcRenderer.removeListener(
				IpcEvents.WifiStatusChanged,
				handleWifiChanged,
			);
		};
	}, []);

	const steps = getSteps(t);

	const handleNext = useCallback((): void => {
		if (activeStep === steps.length - 1) {
			setIsEntireScreenSelected(false);
			setIsApplicationWindowSelected(false);
		}
		setActiveStep((prevActiveStep: number): number => prevActiveStep + 1);
	}, [activeStep, setActiveStep, steps]);

	const handleNextEntireScreen = useCallback((): void => {
		setActiveStep((prevActiveStep: number): number => prevActiveStep + 1);
		setIsEntireScreenSelected(true);
	}, [setActiveStep]);

	const handleNextApplicationWindow = useCallback((): void => {
		setActiveStep((prevActiveStep: number): number => prevActiveStep + 1);
		setIsApplicationWindowSelected(true);
	}, [setActiveStep]);

	const handleBack = useCallback((): void => {
		setActiveStep((prevActiveStep: number) => prevActiveStep - 1);
	}, [setActiveStep]);

	const handleCancelAlert = async (): Promise<void> => {
		setIsAllowDeviceAlertOpen(false);
		setActiveStep(0);
		setPendingConnectionDevice(null);
		setIsUserAllowedConnection(false);

		await window.electron.ipcRenderer.invoke(
			IpcEvents.ResetWaitingForConnectionSharingSession,
		);
		await window.electron.ipcRenderer.invoke(
			IpcEvents.CreateWaitingForConnectionSharingSession,
		);
	};

	const handleConfirmAlert = useCallback(async () => {
		setIsAllowDeviceAlertOpen(false);
		setIsUserAllowedConnection(true);
		handleNext();
		await window.electron.ipcRenderer.invoke(IpcEvents.SetDeviceConnectedStatus);
	}, [handleNext, setIsAllowDeviceAlertOpen, setIsUserAllowedConnection]);

	useEffect(() => {
		window.electron.ipcRenderer.invoke(
			IpcEvents.CreateWaitingForConnectionSharingSession,
		);

		const handlePendingConnectionDevice = (
			_: unknown,
			device: Device,
		): void => {
			setPendingConnectionDevice(device);
			setIsAllowDeviceAlertOpen(true);
		};

		window.electron.ipcRenderer.on(
			IpcEvents.SetPendingConnectionDevice,
			handlePendingConnectionDevice,
		);

		return () => {
			window.electron.ipcRenderer.removeListener(
				IpcEvents.SetPendingConnectionDevice,
				handlePendingConnectionDevice,
			);
		};
	}, [setIsAllowDeviceAlertOpen, setPendingConnectionDevice]);

	const handleUserClickedDeviceDisconnectButton =
		useCallback(async (): Promise<void> => {
			handleReset();

			await showMessageFromNewToaster(
				t(
					'device-is-successfully-disconnected-by-you-you-can-connect-a-new-device',
				),
			);
		}, [handleReset, t]);

	const getStepIcon = (idx: number): React.FC<{ size?: number }> => {
		if (idx === 0) return WifiIcon;
		if (idx === 2) return CheckIcon;
		// Select step: reflect the chosen source type once picked.
		if (isApplicationWindowSelected && !isEntireScreenSelected) {
			return AppWindowIcon;
		}
		return ScreenIcon;
	};

	const renderStepNode = (label: string, idx: number): ReactNode => {
		const StepIcon = getStepIcon(idx);
		const isActive = idx === activeStep;
		const isDone = idx < activeStep;
		const ringClass = `${styles.ring} ${
			isActive ? styles.ringActive : isDone ? styles.ringDone : ''
		}`;
		const showConnectedButton =
			pendingConnectionDevice && idx === 0 && isUserAllowedConnection;

		return (
			<React.Fragment key={label}>
				{idx > 0 && (
					<div
						className={`${styles.connector} ${
							idx <= activeStep ? styles.connectorDone : ''
						}`}
					/>
				)}
				<div className={styles.step}>
					<div className={ringClass}>
						<StepIcon size={24} />
					</div>
					{showConnectedButton ? (
						<DeviceConnectedInfoButton
							device={pendingConnectionDevice as Device}
							onDisconnect={handleUserClickedDeviceDisconnectButton}
						/>
					) : (
						<span
							className={`${styles.label} ${isActive ? styles.labelActive : ''}`}
						>
							{label}
						</span>
					)}
				</div>
			</React.Fragment>
		);
	};

	return (
		<>
			<div className={styles.stepperWrap}>
				<div className={styles.stepper}>
					{steps.map((label, idx) => renderStepNode(label, idx))}
				</div>
				<div className={styles.stepContent}>
					<div id="intermediate-step-container" style={{ width: '100%' }}>
						<IntermediateStep
							activeStep={activeStep}
							steps={steps}
							handleBack={handleBack}
							handleNextEntireScreen={handleNextEntireScreen}
							handleNextApplicationWindow={handleNextApplicationWindow}
							resetPendingConnectionDevice={() =>
								setPendingConnectionDevice(null)
							}
							resetUserAllowedConnection={() => setIsUserAllowedConnection(false)}
							connectedDevice={pendingConnectionDevice}
							handleReset={handleReset}
						/>
					</div>
				</div>
				<AllowConnectionForDeviceAlert
					device={pendingConnectionDevice}
					isOpen={isAllowDeviceAlertOpen}
					onCancel={handleCancelAlert}
					onConfirm={handleConfirmAlert}
				/>
			</div>

			<Dialog isOpen={isNoWiFiError} autoFocus usePortal>
				<div className={styles.dialogInner}>
					<Icon icon="offline" size={50} color="#8A9BA8" />
					<H3>{t('no-wifi-and-lan-connection')}</H3>
					<H5>{t('deskreen-ce-works-only-with-wifi-and-lan-networks')}</H5>
					<Spinner size={50} />
					<H4>{t('waiting-for-connection')}</H4>
				</div>
			</Dialog>

			<Dialog isOpen={isSelectLanguageDialogOpen} autoFocus usePortal>
				<div className={styles.dialogInner}>
					<H1>{helloWord}</H1>
					<Icon icon="translate" size={50} color="#8A9BA8" />
					<H5>{t('language')}</H5>
					<LanguageSelector />
					<Button
						minimal
						rightIcon="chevron-right"
						onClick={() => {
							setIsSelectLanguageDialogOpen(false);
							window.electron.ipcRenderer.invoke(IpcEvents.SetAppStartedOnce);
						}}
						style={{ borderRadius: '50px' }}
					>
						{t('continue')}
					</Button>
				</div>
			</Dialog>
		</>
	);
};

export default DeskreenStepper;
