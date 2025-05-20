const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require("fs");
fs.appendFileSync('log.txt', `Starting\n`);
const { initSteamIfAvailable } = require('../src/general/utils/steam-init');
const { saveToCloud, loadFromCloud } = require('../src/general/utils/steam-cloud-save');
initSteamIfAvailable();
fs.appendFileSync('log.txt', `Electron Required\n`);

const path = require('path');

let mainWindow;


ipcMain.handle('cloud-save', (event, saveData) => {
    return saveToCloud(saveData);
});

ipcMain.handle('cloud-load', () => {
    return loadFromCloud();
});

ipcMain.handle('is-fullscreen', (event) => {
    const win = BrowserWindow.getFocusedWindow();
    return win ? win.isFullScreen() : false;
});

ipcMain.on('quit-app', () => {
    app.quit();
});

ipcMain.on('toggle-fullscreen', (event) => {
    const win = BrowserWindow.getFocusedWindow();
    if (win) {
        const isFull = win.isFullScreen();
        win.setFullScreen(!isFull);
    }
});

app.commandLine.appendSwitch('--in-process-gpu', '--disable-direct-composition');

app.on('ready', () => {

    mainWindow = new BrowserWindow({
        width: 1920,
        height: 1080,
        // frame: false,
        fullscreen: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'), // За потреби
            contextIsolation: true,
            sandbox: false,
            backgroundThrottling: false
        },
    });

    mainWindow.setMenuBarVisibility(false);

    // Завантажуємо React-додаток
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));

    let invalidateTimer = setInterval(() => {
        if (mainWindow.isFocused()) {
            mainWindow.webContents.invalidate();
        }
    }, 500);

    mainWindow.on('closed', () => {
        if (invalidateTimer) {
            clearInterval(invalidateTimer);
            invalidateTimer = null;
        }
    });
});