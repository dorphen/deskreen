import React, { useEffect, useMemo, useState } from 'react';
import { Classes, Dialog, H3 } from '@blueprintjs/core';
import { QRCodeSVG } from 'qrcode.react';
import isProduction from '../../../../common/isProduction';
import config from '../../../../common/config';
import { IpcEvents } from '../../../../common/IpcEvents.enum';
import { useTranslation } from 'react-i18next';
import Logo192 from '../../assets/logo192.png';
import { CopyIcon, WifiIcon } from '../icons';
import styles from './ScanQRStep.module.css';

const { hostname } = config;

const ScanQRStep: React.FC = () => {
	const { t } = useTranslation();
	const [clientViewerPort, setClientViewerPort] = useState('80');

	const [isViewerSlotAvailable, setIsViewerSlotAvailable] = useState(true);
	const [roomID, setRoomID] = useState('');
	const [LOCAL_LAN_IP, setLocalLanIP] = useState('');
	const [isQRCodeMagnified, setIsQRCodeMagnified] = useState(false);

	useEffect(() => {
		window.electron.ipcRenderer
			.invoke(IpcEvents.GetPort)
			.then((port) => {
				return setClientViewerPort(port);
			})
			.catch((error) => {
				console.error('Failed to get port:', error);
			});
	}, []);

	useEffect(() => {
		let cancelled = false;

		const handleAvailabilityChange = (
			_: unknown,
			payload: { isAvailable: boolean },
		): void => {
			if (cancelled) return;
			const isAvailable = Boolean(payload?.isAvailable);
			setIsViewerSlotAvailable(isAvailable);
			if (!isAvailable) {
				setRoomID('');
				setIsQRCodeMagnified(false);
			}
		};

		window.electron.ipcRenderer
			.invoke(IpcEvents.GetViewerConnectionAvailability)
			.then((availability) => {
				if (cancelled) return;
				const isAvailable = Boolean(availability);
				setIsViewerSlotAvailable(isAvailable);
				if (!isAvailable) {
					setRoomID('');
					setIsQRCodeMagnified(false);
				}
			})
			.catch((error) => {
				console.error('Failed to get viewer slot availability:', error);
			});

		window.electron.ipcRenderer.on(
			IpcEvents.ViewerConnectionAvailabilityChanged,
			handleAvailabilityChange,
		);

		return () => {
			cancelled = true;
			window.electron.ipcRenderer.removeListener(
				IpcEvents.ViewerConnectionAvailabilityChanged,
				handleAvailabilityChange,
			);
		};
	}, []);

	useEffect(() => {
		let cancelled = false;
		const fetchRoomId = async (): Promise<void> => {
			const roomId = await window.electron.ipcRenderer.invoke(
				IpcEvents.GetWaitingForConnectionSharingSessionRoomId,
			);
			if (cancelled) return;
			if (typeof roomId === 'string' && roomId !== '' && isViewerSlotAvailable) {
				setRoomID(roomId);
			} else {
				setRoomID('');
			}
		};

		const fetchLocalIp = async (): Promise<void> => {
			const gotIP = await window.electron.ipcRenderer.invoke('get-local-lan-ip');
			if (!cancelled && gotIP) {
				setLocalLanIP(gotIP);
			}
		};

		void fetchRoomId();
		void fetchLocalIp();

		const handleRoomIdChanged = (): void => {
			void fetchRoomId();
		};
		const handleWifiChanged = (): void => {
			void fetchLocalIp();
		};
		window.electron.ipcRenderer.on(IpcEvents.RoomIdChanged, handleRoomIdChanged);
		window.electron.ipcRenderer.on(
			IpcEvents.WifiStatusChanged,
			handleWifiChanged,
		);

		return () => {
			cancelled = true;
			window.electron.ipcRenderer.removeListener(
				IpcEvents.RoomIdChanged,
				handleRoomIdChanged,
			);
			window.electron.ipcRenderer.removeListener(
				IpcEvents.WifiStatusChanged,
				handleWifiChanged,
			);
		};
	}, [isViewerSlotAvailable]);

	const portString = useMemo(() => {
		return `:${clientViewerPort}`;
	}, [clientViewerPort]);
	const shareUrl = useMemo(() => {
		if (!isViewerSlotAvailable) return '';
		if (LOCAL_LAN_IP === '') return '';
		// roomID presence still gates the QR: it means a waiting session exists and
		// the slot is free. The code itself is no longer part of the URL — viewers
		// connect at the root and the server routes them to the active room.
		if (roomID === '') return '';
		return `http://${LOCAL_LAN_IP}${portString}`;
	}, [LOCAL_LAN_IP, portString, roomID, isViewerSlotAvailable]);
	const isQrInteractive = shareUrl !== '';

	const baseUrl = LOCAL_LAN_IP
		? `http://${LOCAL_LAN_IP}${portString}`
		: `http://${hostname}${portString}`;

	const handleCopy = (): void => {
		if (!isQrInteractive) return;
		window.electron.ipcRenderer.invoke(
			IpcEvents.WriteTextToClipboard,
			shareUrl,
		);
	};

	return (
		<div className={styles.wrap}>
			<div className={styles.wifiChip}>
				<WifiIcon size={15} />
				{t(
					'make-sure-your-computer-and-screen-viewing-device-are-connected-to-same-wi-fi',
				)}
			</div>

			<div className={`dk-card ${styles.card}`}>
				{isQrInteractive ? (
					<button
						type="button"
						id="magnify-qr-code-button"
						className={styles.qrTile}
						title={t('click-to-make-bigger')}
						onClick={() => setIsQRCodeMagnified(true)}
					>
						<QRCodeSVG
							value={shareUrl}
							level="H"
							bgColor="rgba(0,0,0,0.0)"
							fgColor="#0b0d12"
							imageSettings={{
								src: Logo192,
								width: 38,
								height: 38,
								excavate: true,
							}}
						/>
					</button>
				) : (
					<div
						className={styles.qrTile}
						style={{ cursor: 'not-allowed', display: 'grid' }}
					>
						<img
							src={Logo192}
							alt={t('deskreen-logo')}
							width={64}
							height={64}
							style={{ margin: 'auto' }}
						/>
					</div>
				)}

				<div className={styles.right}>
					{isQrInteractive ? (
						<>
							<div className={styles.heading}>
								{t('scan-the-qr-code-to-connect')}
							</div>
							<div className={styles.sub}>
								{t(
									'enter-the-following-address-in-browser-address-bar-on-any-device',
								)}
							</div>
							<div className={styles.addr}>
								<span className={styles.url}>{baseUrl}</span>
								<button
									type="button"
									className={`dk-gradient-btn ${styles.copy}`}
									title={t('click-to-copy')}
									onClick={handleCopy}
								>
									<CopyIcon size={15} />
									{t('copy')}
								</button>
							</div>
							<div className={styles.waiting}>
								<span className={styles.pulse} />
								{t('waiting-for-connection')}
							</div>
						</>
					) : (
						<div className={styles.slotFull}>
							<div className={styles.heading}>
								{t('one-viewing-client-is-connected-already')}
							</div>
							<div>{t('deskreen-ce-allows-only-one-client-at-same-time')}</div>
						</div>
					)}
				</div>
			</div>

			<Dialog
				className={Classes.DIALOG}
				isOpen={isQrInteractive && isQRCodeMagnified}
				onClose={() => setIsQRCodeMagnified(false)}
				canEscapeKeyClose
				canOutsideClickClose
				transitionDuration={isProduction() ? 700 : 0}
				usePortal={false}
			>
				<div
					id="qr-code-dialog-inner"
					className={Classes.DIALOG_BODY}
					style={{
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						gap: '16px',
						cursor: 'zoom-out',
					}}
					onClick={() => setIsQRCodeMagnified(false)}
				>
					<div className={styles.dialogQRWrapper}>
						<QRCodeSVG
							value={isQrInteractive ? shareUrl : 'INACTIVE'}
							level="H"
							imageSettings={{
								src: Logo192,
								width: 25,
								height: 25,
								excavate: true,
							}}
							width={360}
							height={360}
						/>
					</div>
					<H3 style={{ margin: 0 }}>
						{isQrInteractive ? shareUrl : t('waiting-for-connection')}
					</H3>
				</div>
			</Dialog>
		</div>
	);
};

export default ScanQRStep;
