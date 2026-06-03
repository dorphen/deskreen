import { useEffect, useState, useCallback } from 'react';
import {
	Button,
	Text,
	Position,
	Drawer,
	Card,
	Alert,
	H4,
	DrawerSize,
} from '@blueprintjs/core';
import CloseOverlayButton from './CloseOverlayButton';
import DeviceInfoCallout from './DeviceInfoCallout';
import SharingSourcePreviewCard from './SharingSourcePreviewCard';
import { Device } from '../../../common/Device';
import { IpcEvents } from '../../../common/IpcEvents.enum';
import isProduction from '../../../common/isProduction';
import { useTranslation } from 'react-i18next';
import styles from './ConnectedDevicesListDrawer.module.css';

type DeviceWithDesktopCapturerSourceId = Device & {
	desktopCapturerSourceId: string;
};

interface ConnectedDevicesListDrawerProps {
	isOpen: boolean;
	handleToggle: () => void;
	handleReset: () => void;
}

export default function ConnectedDevicesListDrawer(
	props: ConnectedDevicesListDrawerProps,
) {
	const { t } = useTranslation();

	const [isAlertDisconectAllOpen, setIsAlertDisconectAllOpen] = useState(false);
	const [connectedDevices, setConnectedDevices] = useState<
		DeviceWithDesktopCapturerSourceId[]
	>([]);
	const [devicesDisplayed, setDevicesDisplayed] = useState(new Map());

	useEffect(() => {
		function getConnectedDevicesCallback() {
			window.electron.ipcRenderer
				.invoke(IpcEvents.GetConnectedDevices)
				.then(async (devices: Device[]) => {
					const devicesWithSourceIds: DeviceWithDesktopCapturerSourceId[] = [];

					for await (const device of devices) {
						const sharingSourceId = await window.electron.ipcRenderer.invoke(
							IpcEvents.GetDesktopCapturerSourceIdBySharingSessionId,
							device.sharingSessionID,
						);
						devicesWithSourceIds.push({
							...device,
							desktopCapturerSourceId: sharingSourceId,
						});
					}
					setConnectedDevices(devicesWithSourceIds);

					const map = new Map();
					devicesWithSourceIds.forEach((el) => {
						map.set(el.id, true);
					});
					setDevicesDisplayed(map);
				})

				.catch((e) => console.error(e));
		}

		getConnectedDevicesCallback();

		// Refresh on push instead of polling on an interval.
		window.electron.ipcRenderer.on(
			IpcEvents.DevicesChanged,
			getConnectedDevicesCallback,
		);

		return () => {
			window.electron.ipcRenderer.removeListener(
				IpcEvents.DevicesChanged,
				getConnectedDevicesCallback,
			);
		};
	}, []);

	const handleDisconnectOneDevice = useCallback(
		async (id: string) => {
			const device = connectedDevices.find((d: Device) => d.id === id);
			if (!device) return;
			await window.electron.ipcRenderer.invoke(
				IpcEvents.DisconnectPeerAndDestroySharingSessionBySessionID,
				device.sharingSessionID,
			);
			await window.electron.ipcRenderer.invoke(
				IpcEvents.DisconnectDeviceById,
				device.id,
			);
			setConnectedDevices(connectedDevices.filter((d: Device) => d.id !== id));
		},
		[connectedDevices, setConnectedDevices],
	);

	const handleDisconnectAll = useCallback(() => {
		connectedDevices.forEach((device: Device) => {
			window.electron.ipcRenderer.invoke(
				IpcEvents.DisconnectPeerAndDestroySharingSessionBySessionID,
				device.sharingSessionID,
			);
		});
		window.electron.ipcRenderer.invoke(IpcEvents.DisconnectAllDevices);
	}, [connectedDevices]);

	const hideOneDeviceInDevicesDisplayed = useCallback(
		(id) => {
			const newDevicesDisplayed = new Map(devicesDisplayed);
			newDevicesDisplayed.set(id, false);
			setDevicesDisplayed(newDevicesDisplayed);
			newDevicesDisplayed.delete(id);
			setDevicesDisplayed(newDevicesDisplayed);
			setConnectedDevices(
				connectedDevices.filter((device) => device.id !== id),
			);
		},
		[
			connectedDevices,
			setConnectedDevices,
			devicesDisplayed,
			setDevicesDisplayed,
		],
	);

	const hideAllDevicesInDevicesDisplayed = useCallback(() => {
		const newDevicesDisplayed = new Map(devicesDisplayed);
		[...newDevicesDisplayed.keys()].forEach((key) => {
			newDevicesDisplayed.set(key, false);
		});
		setDevicesDisplayed(newDevicesDisplayed);
	}, [devicesDisplayed, setDevicesDisplayed]);

	const handleDisconnectAndHideOneDevice = useCallback(
		(id) => {
			hideOneDeviceInDevicesDisplayed(id);
			handleDisconnectOneDevice(id);
		},
		[handleDisconnectOneDevice, hideOneDeviceInDevicesDisplayed],
	);

	const handleDisconnectAndHideAllDevices = useCallback(() => {
		hideAllDevicesInDevicesDisplayed();
		setTimeout(
			() => {
				handleDisconnectAll();
				props.handleToggle();
				props.handleReset();
			},
			isProduction() ? 1000 : 0,
		);
	}, [handleDisconnectAll, hideAllDevicesInDevicesDisplayed, props]);

	const disconnectAllCancelButtonText = t('no-cancel');
	const disconnectAllConfirmButtonText = t('yes-disconnect-all');

	return (
		<>
			<Drawer
				className={styles.drawerRoot}
				position={Position.BOTTOM}
				size={DrawerSize.LARGE}
				isOpen={props.isOpen}
				onClose={props.handleToggle}
				transitionDuration={0}
			>
				<div className={styles.topPanel}>
					<div className={styles.topHeaderGroup}>
						<span className={styles.topHeader}>{t('connected-devices')}</span>
						<Button
							intent="danger"
							disabled={connectedDevices.length === 0}
							onClick={() => {
								setIsAlertDisconectAllOpen(true);
							}}
							icon="disable"
							style={{
								borderRadius: '100px',
							}}
						>
							{t('disconnect-all-devices')}
						</Button>
					</div>
					<CloseOverlayButton onClick={props.handleToggle} isDefaultStyles />
				</div>
				<div className={styles.devicesRoot}>
					{connectedDevices.map((device) => {
						return (
							<div key={device.id}>
								<Card className="connected-device-card">
									<div className={styles.deviceCardInner}>
										<div className={styles.deviceCardCol}>
											<DeviceInfoCallout
												deviceType={device.deviceType}
												deviceOS={device.deviceOS}
												deviceIP={device.deviceIP}
												deviceBrowser={device.deviceBrowser}
												deviceRoomId={device.deviceRoomId}
											/>
										</div>
										<div className={styles.deviceCardCol}>
											<SharingSourcePreviewCard
												sharingSourceID={device.desktopCapturerSourceId}
											/>
										</div>
									</div>
									<div className={styles.cardActions}>
										<Button
											id={`disconnect-device-${device.deviceIP}`}
											intent="danger"
											onClick={(): void => {
												handleDisconnectAndHideOneDevice(device.id);
											}}
											icon="disable"
											style={{
												borderRadius: '100px',
											}}
										>
											{t('disconnect')}
										</Button>
									</div>
								</Card>
							</div>
						);
					})}
				</div>
			</Drawer>
			<Alert
				isOpen={isAlertDisconectAllOpen}
				onClose={() => {
					setIsAlertDisconectAllOpen(false);
				}}
				icon="warning-sign"
				cancelButtonText={disconnectAllCancelButtonText}
				confirmButtonText={disconnectAllConfirmButtonText}
				intent="danger"
				canEscapeKeyCancel
				canOutsideClickCancel
				onCancel={() => {
					setIsAlertDisconectAllOpen(false);
				}}
				onConfirm={handleDisconnectAndHideAllDevices}
				transitionDuration={0}
			>
				<H4>
					{t(
						'are-you-sure-you-want-to-disconnect-all-connected-viewing-devices',
					)}
				</H4>
				<Text>{t('this-step-can-not-be-undone')}</Text>
				<Text>{t('you-will-have-to-connect-all-devices-manually-again')}</Text>
			</Alert>
		</>
	);
}
