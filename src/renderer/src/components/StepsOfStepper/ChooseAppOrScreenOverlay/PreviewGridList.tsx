import SharingSourcePreviewCard from '../../SharingSourcePreviewCard';
import { IpcEvents } from '../../../../../common/IpcEvents.enum';

interface PreviewGridListProps {
	viewSharingIds: string[];
	isEntireScreen: boolean;
	handleNextEntireScreen: () => void;
	handleNextApplicationWindow: () => void;
}

export default function PreviewGridList(props: PreviewGridListProps) {
	const {
		viewSharingIds,
		isEntireScreen,
		handleNextEntireScreen,
		handleNextApplicationWindow,
	} = props;

	return (
		<div
			style={{
				display: 'grid',
				gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
				gap: '16px',
				padding: '8px',
				width: '100%',
			}}
		>
			{viewSharingIds.map((id) => {
				return (
					<div key={id}>
						<SharingSourcePreviewCard
							sharingSourceID={id}
							isChangeAppearanceOnHover
							onClickCard={async () => {
								window.electron.ipcRenderer.invoke(
									IpcEvents.SetDesktopCapturerSourceId,
									id,
								);
								if (isEntireScreen) {
									handleNextEntireScreen();
								} else {
									handleNextApplicationWindow();
								}
							}}
						/>
					</div>
				);
			})}
		</div>
	);
}
