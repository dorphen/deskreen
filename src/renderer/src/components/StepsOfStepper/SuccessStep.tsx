import React, { useCallback, useEffect } from 'react';
import { Button, H5, Icon, Text } from '@blueprintjs/core';
import { useTranslation } from 'react-i18next';

interface SuccessStepProps {
	handleReset: () => void;
}

const SuccessStep: React.FC<SuccessStepProps> = (props: SuccessStepProps) => {
	const { t } = useTranslation();

	useEffect(() => {
		document
			.querySelector('#top-panel-connected-devices-list-button')
			?.classList.remove('pulse-not-infinite');

		document
			.querySelector('#top-panel-connected-devices-list-button')
			?.classList.add('pulse-not-infinite');

		setTimeout(() => {
			document
				.querySelector('#top-panel-connected-devices-list-button')
				?.classList.remove('pulse-not-infinite');
		}, 4000);
	}, []);

	const handleTextConnectedListMouseEnter = useCallback(() => {
		document
			.querySelector('#top-panel-connected-devices-list-button')
			?.classList.add('pulsing');
	}, []);

	const handleTextConnectedListMouseLeave = useCallback(() => {
		document
			.querySelector('#top-panel-connected-devices-list-button')
			?.classList.remove('pulsing');
	}, []);

	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				alignItems: 'center',
				textAlign: 'center',
				gap: '6px',
				maxWidth: '440px',
				margin: '0 auto',
			}}
		>
			<Icon icon="endorsed" size={35} color="#0F9960" />
			<H5 style={{ margin: 0 }}>Done!</H5>
			<div style={{ marginBottom: '6px' }}>
				<Text>Now you can see your screen on other device</Text>
			</div>
			<div
				id="connected-devices-list-text-success"
				onMouseEnter={handleTextConnectedListMouseEnter}
				onMouseLeave={handleTextConnectedListMouseLeave}
				style={{
					marginBottom: '20px',
					textDecoration: 'underline dotted',
				}}
			>
				<Text>
					{t(
						'you-can-manage-connected-devices-by-clicking-connected-devices-button-in-top-panel',
					)}
				</Text>
			</div>
			<Button
				intent="primary"
				onClick={props.handleReset}
				icon="repeat"
				style={{ borderRadius: '100px' }}
			>
				{t('connect-new-device')}
			</Button>
		</div>
	);
};

export default SuccessStep;
