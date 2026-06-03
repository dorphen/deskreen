import { useEffect, useState } from 'react';
import { Text } from '@blueprintjs/core';
import SharingSourcePreviewCard from '../SharingSourcePreviewCard';
import DeviceInfoCallout from '../DeviceInfoCallout';
import { Device } from '../../../../common/Device';
import { IpcEvents } from '../../../../common/IpcEvents.enum';
import { useTranslation } from 'react-i18next';
import styles from './ConfirmStep.module.css';

interface ConfirmStepProps {
	device: Device | null;
}

export default function ConfirmStep(props: ConfirmStepProps) {
	const { device } = props;
	const [
		waitingForConnectionSharingSessionSourceId,
		setWaitingForConnectionSharingSessionSourceId,
	] = useState<string | undefined>();
	const { t } = useTranslation();

	useEffect(() => {
		window.electron.ipcRenderer
			.invoke(IpcEvents.GetWaitingForConnectionSharingSessionSourceId)
			.then((id) => {
				setWaitingForConnectionSharingSessionSourceId(id);
			})
			.catch((e) => console.error(e));
	}, []);

	return (
		<div className={styles.root}>
			<div className={styles.title}>
				<Text>{t('check-if-all-is-ok-and-click-confirm')}</Text>
			</div>
			<div className={styles.cols}>
				<div className={styles.col}>
					<DeviceInfoCallout
						deviceType={device?.deviceType}
						deviceIP={device?.deviceIP}
						deviceOS={device?.deviceOS}
						deviceBrowser={device?.deviceBrowser}
						deviceRoomId={device?.deviceRoomId}
					/>
				</div>
				<div className={styles.col}>
					<Text>{t('this-screen-source-will-be-seen-by-the-client')}</Text>
					<SharingSourcePreviewCard
						sharingSourceID={waitingForConnectionSharingSessionSourceId}
					/>
				</div>
			</div>
		</div>
	);
}
