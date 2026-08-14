// Screenshot the real built renderer (out/renderer/index.html) with a mock
// preload. Run: env -u ELECTRON_RUN_AS_NODE node_modules/.bin/electron design/_shotApp.js <out.png>
const { app, BrowserWindow } = require('electron');
const path = require('node:path');
const fs = require('node:fs');

const outArg = process.argv[2] || 'app-dark.png';
const outPath = path.resolve(__dirname, outArg);
const htmlPath = path.resolve(__dirname, '../out/renderer/index.html');
const preloadPath = path.resolve(__dirname, '_mockPreload.js');

app.disableHardwareAcceleration();

app.whenReady().then(async () => {
	const win = new BrowserWindow({
		width: 940,
		height: 640,
		show: false,
		useContentSize: true,
		webPreferences: {
			offscreen: true,
			preload: preloadPath,
			contextIsolation: false,
			nodeIntegration: false,
			sandbox: false,
		},
	});
	win.webContents.setBackgroundThrottling(false);
	await win.loadFile(htmlPath);
	await new Promise((r) => setTimeout(r, 1500));
	if (process.env.CLICK) {
		await win.webContents.executeJavaScript(
			`document.querySelector(${JSON.stringify(process.env.CLICK)})?.click()`,
		);
		await new Promise((r) => setTimeout(r, 700));
	}
	const image = await win.webContents.capturePage();
	fs.writeFileSync(outPath, image.toPNG());
	console.log('wrote', outPath);
	app.quit();
});
