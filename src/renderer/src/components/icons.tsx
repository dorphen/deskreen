import React from 'react';

// Lightweight inline-SVG icon set (feather-style) — no icon-font / library.
// All icons inherit `currentColor` and accept an optional size + className.

interface IconProps {
	size?: number;
	className?: string;
}

const base = (size: number): React.SVGProps<SVGSVGElement> => ({
	width: size,
	height: size,
	viewBox: '0 0 24 24',
	fill: 'none',
	stroke: 'currentColor',
	strokeWidth: 2,
	strokeLinecap: 'round',
	strokeLinejoin: 'round',
});

export const DevicesIcon: React.FC<IconProps> = ({ size = 19, className }) => (
	<svg {...base(size)} className={className}>
		<rect x="2" y="4" width="14" height="10" rx="2" />
		<path d="M2 18h14M18 9h4v9a2 2 0 0 1-2 2h-2z" />
	</svg>
);

export const ResetIcon: React.FC<IconProps> = ({ size = 19, className }) => (
	<svg {...base(size)} className={className}>
		<path d="M21 12a9 9 0 1 1-2.64-6.36M21 4v5h-5" />
	</svg>
);

export const TutorialIcon: React.FC<IconProps> = ({ size = 19, className }) => (
	<svg {...base(size)} className={className}>
		<path d="M4 5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
		<path d="M13 3v5h5M8 13h6M8 17h6" />
	</svg>
);

export const SettingsIcon: React.FC<IconProps> = ({ size = 19, className }) => (
	<svg {...base(size)} className={className}>
		<circle cx="12" cy="12" r="3" />
		<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
	</svg>
);

export const MoonIcon: React.FC<IconProps> = ({ size = 19, className }) => (
	<svg {...base(size)} className={className}>
		<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
	</svg>
);

export const SunIcon: React.FC<IconProps> = ({ size = 19, className }) => (
	<svg {...base(size)} className={className}>
		<circle cx="12" cy="12" r="4" />
		<path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
	</svg>
);

export const WifiIcon: React.FC<IconProps> = ({ size = 19, className }) => (
	<svg {...base(size)} className={className}>
		<path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0" />
		<circle cx="12" cy="20" r="1" fill="currentColor" />
	</svg>
);

export const CopyIcon: React.FC<IconProps> = ({ size = 15, className }) => (
	<svg {...base(size)} className={className}>
		<rect x="9" y="9" width="13" height="13" rx="2" />
		<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
	</svg>
);

export const ScreenIcon: React.FC<IconProps> = ({ size = 21, className }) => (
	<svg {...base(size)} className={className}>
		<rect x="2" y="3" width="20" height="14" rx="2" />
		<path d="M8 21h8M12 17v4" />
	</svg>
);

export const AppWindowIcon: React.FC<IconProps> = ({
	size = 21,
	className,
}) => (
	<svg {...base(size)} className={className}>
		<rect x="2" y="4" width="20" height="16" rx="2" />
		<path d="M2 8h20M6 6h.01M9 6h.01" />
	</svg>
);

export const CheckIcon: React.FC<IconProps> = ({ size = 21, className }) => (
	<svg {...base(size)} className={className}>
		<path d="M20 6 9 17l-5-5" />
	</svg>
);

export const ChevronRightIcon: React.FC<IconProps> = ({
	size = 18,
	className,
}) => (
	<svg {...base(size)} className={className}>
		<path d="m9 18 6-6-6-6" />
	</svg>
);

export const UpdateArrowIcon: React.FC<IconProps> = ({
	size = 14,
	className,
}) => (
	<svg {...base(size)} className={className}>
		<path d="M12 5v14M5 12l7 7 7-7" />
	</svg>
);

export const CloseIcon: React.FC<IconProps> = ({ size = 18, className }) => (
	<svg {...base(size)} className={className}>
		<path d="M18 6 6 18M6 6l12 12" />
	</svg>
);
