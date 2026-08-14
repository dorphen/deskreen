// Mock preload for screenshotting the real built renderer without the full
// Electron main process / signaling server. Stubs window.electron + window.api.
const THEME = process.env.MOCK_THEME === 'light' ? 'light' : 'dark';
const mock = {
	'get-app-language': 'en',
	'get-theme-preference': THEME,
	'get-resolved-theme': THEME,
	'get-port': '3131',
	'get-viewer-connection-availability': true,
	'get-waiting-for-connection-sharing-session-room-id': '482913',
	'get-local-lan-ip': '192.168.1.42',
	'get-latest-version': '3.2.16',
	'get-current-version': '3.2.15',
	'get-connected-devices-list': [],
	'get-is-not-first-time-app-start': false,
	'check-wifi-connection': true,
};

const noop = () => {};

window.electron = {
	ipcRenderer: {
		invoke: async (channel) =>
			Object.prototype.hasOwnProperty.call(mock, channel)
				? mock[channel]
				: undefined,
		on: noop,
		removeListener: noop,
		send: noop,
	},
};
window.api = { forge: {}, Buffer: {} };
