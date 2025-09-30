const { app, BrowserWindow, ipcMain, webContents } = require('electron');
const fs = require("fs");
const { initSteamIfAvailable } = require('../src/general/utils/steam-init');
const { saveToCloud, loadFromCloud } = require('../src/general/utils/steam-cloud-save');
initSteamIfAvailable();

const path = require('path');
const {saveWindowState, loadWindowState} = require("../src/general/utils/window-settings");

let mainWindow;
let currentZoomFactor = 1;


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

ipcMain.on('set-zoom-factor', (event, factor) => {
    try {
        const f = Math.max(0.5, Math.min(3, Number(factor) || 1));
        currentZoomFactor = f;
        const wc = mainWindow?.webContents;
        if (wc) {
            wc.setZoomFactor(f);
        }
    } catch (e) {
        // noop
    }
});

app.commandLine.appendSwitch('--in-process-gpu', '--disable-direct-composition');

app.on('ready', () => {

    const windowState = loadWindowState(app)

    mainWindow = new BrowserWindow({
        width: windowState?.width ?? 1920,
        height: windowState?.height ?? 1080,
        // frame: false,
        fullscreen: windowState?.fullscreen ?? true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'), // За потреби
            contextIsolation: true,
            sandbox: false,
            backgroundThrottling: false
        },
    });

    mainWindow.setMenuBarVisibility(false);

    // Apply saved zoom early
    try {
        const f = Math.max(0.5, Math.min(3, Number(windowState?.zoomFactor) || 1));
        currentZoomFactor = f;
        mainWindow.webContents.setZoomFactor(f);
    } catch (e) {}

    // Завантажуємо React-додаток
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));

    let invalidateTimer = setInterval(() => {
        if (mainWindow.isFocused()) {
            mainWindow.webContents.invalidate();
        }
    }, 500);

    mainWindow.on('close', () => {
        saveWindowState(app, mainWindow, currentZoomFactor);
    })

    // Re-apply zoom after load to guard against any resets
    mainWindow.webContents.on('did-finish-load', () => {
        try {
            mainWindow.webContents.setZoomFactor(currentZoomFactor || 1);
        } catch (e) {}
    })

    mainWindow.on('closed', () => {
        if (invalidateTimer) {
            clearInterval(invalidateTimer);
            invalidateTimer = null;
        }
    });
});