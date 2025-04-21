const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

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

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 1920,
        height: 1080,
        // frame: false,
        fullscreen: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'), // За потреби
            contextIsolation: true,
        },
    });

    mainWindow.setMenuBarVisibility(false);

    // Завантажуємо React-додаток
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
});
