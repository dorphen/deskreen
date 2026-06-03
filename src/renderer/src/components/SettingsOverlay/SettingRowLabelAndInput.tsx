import React from 'react';
import { Icon, IconName, Text } from '@blueprintjs/core';
import styles from './SettingRowLabelAndInput.module.css';

interface SettingRowLabelAndInput {
	icon: string;
	label: string;
	input: React.ReactNode;
}

export default function SettingRowLabelAndInput(props: SettingRowLabelAndInput) {
	const { icon, label, input } = props;

	return (
		<div className={styles.row}>
			<div className={styles.label}>
				<Icon icon={icon as IconName} size={25} className={styles.icon} />
				<Text>{label}</Text>
			</div>
			<div className={styles.input}>{input}</div>
		</div>
	);
}
