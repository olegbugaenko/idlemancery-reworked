const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 900,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'), // За потреби
        },
    });

    mainWindow.setMenuBarVisibility(false);

    // Завантажуємо React-додаток
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
});
