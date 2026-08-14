import { execFile } from 'child_process';
import { promisify } from 'util';
import { getActiveNetworkInterface } from './getMyLocalIpV4';

const execFileAsync = promisify(execFile);

// Best-effort SSID lookup is platform specific and can fail for many benign
// reasons (no Wi-Fi adapter, wired connection, missing CLI tool, OS privacy
// restrictions). Keep the timeout short and swallow every error.
const EXEC_OPTIONS = { timeout: 4000 } as const;

async function runCommand(
	command: string,
	args: string[],
): Promise<string | undefined> {
	try {
		const { stdout } = await execFileAsync(command, args, EXEC_OPTIONS);
		return stdout;
	} catch {
		return undefined;
	}
}

async function getLinuxWifiSsid(): Promise<string | undefined> {
	// nmcli is the most common option on desktop Linux (NetworkManager).
	const nmcliOut = await runCommand('nmcli', [
		'-t',
		'-f',
		'active,ssid',
		'dev',
		'wifi',
	]);
	if (nmcliOut !== undefined) {
		for (const line of nmcliOut.split('\n')) {
			// Terse output looks like `yes:MySSID`; literal colons inside the SSID
			// are escaped by nmcli as `\:`, so only split on the first separator.
			const separatorIndex = line.indexOf(':');
			if (separatorIndex === -1) continue;
			const active = line.slice(0, separatorIndex);
			if (active === 'yes') {
				const ssid = line.slice(separatorIndex + 1).replace(/\\:/g, ':').trim();
				if (ssid) return ssid;
			}
		}
		return undefined;
	}

	// Fallback for systems without NetworkManager.
	const iwgetidOut = await runCommand('iwgetid', ['-r']);
	const ssid = iwgetidOut?.trim();
	return ssid || undefined;
}

async function getMacWifiSsid(): Promise<string | undefined> {
	const iface = getActiveNetworkInterface()?.interfaceName ?? 'en0';
	const out = await runCommand('networksetup', [
		'-getairportnetwork',
		iface,
	]);
	if (!out) return undefined;
	const match = out.match(/Current Wi-Fi Network:\s*(.+)/);
	const ssid = match?.[1]?.trim();
	return ssid || undefined;
}

async function getWindowsWifiSsid(): Promise<string | undefined> {
	const out = await runCommand('netsh', ['wlan', 'show', 'interfaces']);
	if (!out) return undefined;
	// The `BSSID` line does not match because after the leading whitespace it
	// starts with `B`, not `S`.
	const match = out.match(/^\s*SSID\s*:\s*(.+)$/m);
	const ssid = match?.[1]?.trim();
	return ssid || undefined;
}

/**
 * Resolve the SSID of the currently connected Wi-Fi network. Best-effort:
 * returns undefined on wired connections, unsupported platforms, or any error.
 */
export default async function getWifiSsid(): Promise<string | undefined> {
	try {
		switch (process.platform) {
			case 'linux':
				return await getLinuxWifiSsid();
			case 'darwin':
				return await getMacWifiSsid();
			case 'win32':
				return await getWindowsWifiSsid();
			default:
				return undefined;
		}
	} catch {
		return undefined;
	}
}
