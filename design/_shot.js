// Headless screenshot helper for design mockups.
// Usage: node_modules/.bin/electron design/_shot.js <html-file> <out-png> [width] [height]
const { app, BrowserWindow } = require('electron');
const path = require('node:path');

const htmlArg = process.argv[2] || 'mockup.html';
const outArg = process.argv[3] || 'mockup.png';
const W = Number(process.argv[4]) || 1000;
const H = Number(process.argv[5]) || 760;

const htmlPath = path.resolve(__dirname, htmlArg);
const outPath = path.resolve(__dirname, outArg);

app.disableHardwareAcceleration();

app.whenReady().then(async () => {
	const win = new BrowserWindow({
		width: W,
		height: H,
		show: false,
		webPreferences: { offscreen: true },
	});
	win.webContents.setBackgroundThrottling(false);
	const theme = process.argv[6];
	await win.loadFile(htmlPath, theme ? { search: `theme=${theme}` } : undefined);
	// give web fonts / images / canvas a moment to settle
	await new Promise((r) => setTimeout(r, 700));
	const image = await win.webContents.capturePage();
	require('node:fs').writeFileSync(outPath, image.toPNG());
	console.log('wrote', outPath);
	app.quit();
});
