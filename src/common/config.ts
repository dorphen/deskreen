/* istanbul ignore file */

let hostname;
let protocol;
let primaryPort;
let backupPort;

if (!hostname && !protocol && !primaryPort && !backupPort) {
	hostname = 'localhost';
	protocol = 'http';
	primaryPort = 3131;
	backupPort = 3132;
}

// Sentinel room id sent by a viewer that opened the root URL with no code.
// The server resolves it to the single active waiting-for-connection room.
// Keep in sync with ROOT_CODELESS_ROOM_ID in
// src/client-viewer/src/constants/appConstants.ts (separate Vite bundle).
export const ROOT_CODELESS_ROOM_ID = 'root';

export default {
	hostname,
	protocol,
	primaryPort,
	backupPort,
};
