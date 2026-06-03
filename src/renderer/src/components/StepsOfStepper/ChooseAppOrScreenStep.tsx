import React from 'react';
import ShareEntireScreenOrAppWindowControlGroup from '../ShareAppOrScreenControlGroup';

interface ChooseAppOrScreeenStepProps {
	handleNextEntireScreen: () => void;
	handleNextApplicationWindow: () => void;
}

const ChooseAppOrScreenStep: React.FC<ChooseAppOrScreeenStepProps> = ({
	handleNextEntireScreen,
	handleNextApplicationWindow,
}: ChooseAppOrScreeenStepProps) => {
	return (
		<div
			style={{
				display: 'flex',
				justifyContent: 'center',
				width: '100%',
			}}
		>
			<ShareEntireScreenOrAppWindowControlGroup
				handleNextEntireScreen={handleNextEntireScreen}
				handleNextApplicationWindow={handleNextApplicationWindow}
			/>
		</div>
	);
};

export default ChooseAppOrScreenStep;
