import { Text, Button, Popover, Tooltip } from '@blueprintjs/core';
import DeviceInfoCallout from '../DeviceInfoCallout';
import { Device } from '../../../../common/Device';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';

interface DeviceConnectedInfoButtonProps {
	device: Device;
	onDisconnect: () => void;
}

const getDeviceConnectedPopoverContent = (
	pendingConnectionDevice: Device,
	handleDisconnect: () => void,
	t: TFunction,
) => {
	const disconnectButtonText = t('disconnect');

	return (
		<div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
			<DeviceInfoCallout
				deviceType={pendingConnectionDevice?.deviceType}
				deviceIP={pendingConnectionDevice?.deviceIP}
				deviceOS={pendingConnectionDevice?.deviceOS}
				deviceBrowser={pendingConnectionDevice?.deviceBrowser}
				deviceRoomId={pendingConnectionDevice?.deviceRoomId}
			/>
			<Button
				intent="danger"
				icon="disable"
				onClick={() => {
					handleDisconnect();
				}}
				style={{ width: '100%', borderRadius: '100px' }}
			>
				{disconnectButtonText}
			</Button>
		</div>
	);
};

export default function DeviceConnectedInfoButton(
	props: DeviceConnectedInfoButtonProps,
) {
	const { device, onDisconnect } = props;
	const { t } = useTranslation();

	return (
		<>
			<Popover
				content={getDeviceConnectedPopoverContent(device, onDisconnect, t)}
				position="bottom"
				transitionDuration={0}
			>
				<Tooltip
					content={<Text>Click to see more</Text>}
					position="right"
					hoverOpenDelay={400}
				>
					<Button
						id="connected-device-info-stepper-button"
						intent="success"
						icon="info-sign"
						style={{
							width: '150px',
							borderRadius: '100px',
							position: 'relative',
							margin: '0 auto',
						}}
					>
						<Text>{t('connected')}</Text>
					</Button>
				</Tooltip>
			</Popover>
		</>
	);
}
