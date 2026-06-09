import { useCallback, useEffect, useState } from 'react';
import { Grid } from 'react-flexbox-grid';
import screenfull from 'screenfull';
import './index.css';
import ErrorDialog from '../../components/ErrorDialog';
import {
	ErrorMessage,
	type ErrorMessageType,
} from '../../components/ErrorDialog/ErrorMessageEnum';
import {
	DUMMY_MY_DEVICE_DETAILS,
	ROOT_CODELESS_ROOM_ID,
} from '../../constants/appConstants';
import ConnectionPropmpts from '../../containers/ConnectionPrompts';
import PlayerView from '../../containers/PlayerView';
import PeerConnection from '../../features/PeerConnection';
import { ScreenSharingSource } from '../../features/PeerConnection/ScreenSharingSourceEnum';
import {
	VideoQuality,
	type VideoQualityType,
} from '../../features/VideoAutoQualityOptimizer/VideoQualityEnum';
import ConnectionIcon from './ConnectionIconEnum';
import handleCreatePeerConnection from './handleCreatePeerConnection';
import handleDisplayingLoadingSharingIconLoop from './handleDisplayingLoadingSharingIconLoop';
import handleNoConnectionTimeout from './handleNoConnectionTimeout';
import handleRemoveDanglingReactRevealContainer from './handleRemoveDanglingReactRevealContainer';
import handleSetVideoQuality from './handleSetVideoQuality';
import { LoadingSharingIconEnum } from './LoadingSharingIconEnum';

function MainView() {
	const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);

	const [promptStep, setPromptStep] = useState(1);
	const [dialogErrorMessage, setDialogErrorMessage] =
		useState<ErrorMessageType>(ErrorMessage.UNKNOWN_ERROR);
	const [connectionIconType, setConnectionIconType] =
		useState<ConnectionIconType>(ConnectionIcon.FEED);
	const [myDeviceDetails, setMyDeviceDetails] = useState<DeviceDetails>(
		DUMMY_MY_DEVICE_DETAILS,
	);

	const [playing, setPlaying] = useState(true);
	const [url, setUrl] = useState<MediaStream | null>(null);
	const [screenSharingSourceType, setScreenSharingSourceType] =
		useState<ScreenSharingSourceType>(ScreenSharingSource.SCREEN);
	const [isWithControls, setIsWithControls] = useState(!screenfull.isEnabled);
	const [isShownTextPrompt, setIsShownTextPrompt] = useState(false);
	const [isShownLoadingSharingIcon, setIsShownLoadingSharingIcon] =
		useState(false);
	const [loadingSharingIconType, setLoadingSharingIconType] =
		useState<LoadingSharingIconType>(LoadingSharingIconEnum.DESKTOP);
	const [videoQuality, setVideoQuality] = useState<VideoQualityType>(
		VideoQuality.Q_100_PERCENT,
	);
	const [peer, setPeer] = useState<undefined | PeerConnection>();
	const [connectionRoomId, setConnectionRoomId] = useState<string>('');

	useEffect(() => {
		const { pathname } = window.location;
		const normalizedPath = pathname.startsWith('/')
			? pathname.slice(1)
			: pathname;
		const extractedRoomId = normalizedPath.split('/').filter(Boolean)[0] || '';

		if (extractedRoomId !== '') {
			setConnectionRoomId(extractedRoomId);
			return;
		}

		// Root URL with no code: send the sentinel so the server routes us to the
		// single active waiting-for-connection room.
		setConnectionRoomId(ROOT_CODELESS_ROOM_ID);
	}, []);

	useEffect(handleSetVideoQuality(videoQuality, peer), [videoQuality, peer]);

	useEffect(handleNoConnectionTimeout(myDeviceDetails, setIsErrorDialogOpen), [
		myDeviceDetails,
	]);

	useEffect(
		handleCreatePeerConnection({
			peer,
			connectionRoomId,
			setMyDeviceDetails,
			setConnectionIconType,
			setIsShownTextPrompt,
			setPromptStep,
			setScreenSharingSourceType,
			setDialogErrorMessage,
			setIsErrorDialogOpen,
			setUrl,
			setPeer,
		}),
		[connectionRoomId],
	);

	const handlePlayPause = useCallback(() => {
		setPlaying(!playing);
	}, [playing]);

	useEffect(handleRemoveDanglingReactRevealContainer(url), [url]);

	useEffect(
		handleDisplayingLoadingSharingIconLoop({
			promptStep,
			url,
			setIsShownLoadingSharingIcon,
			loadingSharingIconType,
			isShownLoadingSharingIcon,
			setLoadingSharingIconType,
		}),
		[promptStep, url],
	);

	return (
		<Grid>
			<ConnectionPropmpts
				myDeviceDetails={myDeviceDetails}
				isShownTextPrompt={isShownTextPrompt}
				promptStep={promptStep}
				connectionIconType={connectionIconType}
				spinnerIconType={loadingSharingIconType}
				isShownSpinnerIcon={isShownLoadingSharingIcon}
			/>
			<PlayerView
				streamUrl={url}
				screenSharingSourceType={screenSharingSourceType}
				setIsWithControls={setIsWithControls}
				isWithControls={isWithControls}
				handlePlayPause={handlePlayPause}
				isPlaying={playing}
				setPlaying={setPlaying}
				setVideoQuality={setVideoQuality}
				videoQuality={videoQuality}
			/>
			<ErrorDialog
				errorMessage={dialogErrorMessage}
				isOpen={isErrorDialogOpen}
				setIsOpen={setIsErrorDialogOpen}
			/>
		</Grid>
	);
}

export default MainView;
