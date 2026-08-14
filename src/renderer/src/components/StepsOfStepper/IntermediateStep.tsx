import React from 'react';
import { Button, Text } from '@blueprintjs/core';
import { useTranslation } from 'react-i18next';
import ScanQRStep from './ScanQRStep';
import ChooseAppOrScreenStep from './ChooseAppOrScreenStep';
import styles from './IntermediateStep.module.css';

interface IntermediateStepProps {
	activeStep: number;
	handleNextEntireScreen: () => void;
	handleNextApplicationWindow: () => void;
}

function getStepContent(
	t: ReturnType<typeof useTranslation>['t'],
	stepIndex: number,
	handleNextEntireScreen: () => void,
	handleNextApplicationWindow: () => void,
): React.ReactNode {
	switch (stepIndex) {
		case 0:
			return <ScanQRStep />;
		case 1:
			return (
				<>
					<div className={styles.instruction}>
						<Text>
							{t('choose-entire-screen-or-app-window-you-want-to-share')}
						</Text>
					</div>
					<ChooseAppOrScreenStep
						handleNextEntireScreen={handleNextEntireScreen}
						handleNextApplicationWindow={handleNextApplicationWindow}
					/>
				</>
			);
		default:
			return 'Unknown stepIndex';
	}
}

export default function IntermediateStep(
	props: IntermediateStepProps,
): React.ReactElement {
	const { t } = useTranslation();

	const { activeStep, handleNextEntireScreen, handleNextApplicationWindow } =
		props;

	return (
		<div className={styles.container}>
			{getStepContent(
				t,
				activeStep,
				handleNextEntireScreen,
				handleNextApplicationWindow,
			)}
			{process.env.NODE_ENV === 'production' &&
			process.env.RUN_MODE !== 'dev' &&
			process.env.RUN_MODE !== 'test' ? (
				<></>
			) : activeStep === 0 ? (
				<Button
					onClick={() => {
						// connectedDevicesService.setPendingConnectionDevice(DEVICES[Math.floor(Math.random() * DEVICES.length)]);
					}}
				>
					Connect Test Device
				</Button>
			) : (
				<></>
			)}
		</div>
	);
}
