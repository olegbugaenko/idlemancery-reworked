const fs = require('fs');
const path = require('path');


function loadWindowState(app) {
    try {
        const stateFile = path.join(app.getPath('userData'), 'window-state.json');
        const data = fs.readFileSync(stateFile, 'utf-8');
        return JSON.parse(data);
    } catch {
        return {
            width: 1920,
            height: 1080,
            fullscreen: true
        };
    }
}

function saveWindowState(app, win) {
    if (!win) return;
    const bounds = win.getBounds();
    const state = {
        width: bounds.width,
        height: bounds.height,
        x: bounds.x,
        y: bounds.y,
        fullscreen: win.isFullScreen()
    };
    const stateFile = path.join(app.getPath('userData'), 'window-state.json');
    fs.writeFileSync(stateFile, JSON.stringify(state));
}

module.exports = { loadWindowState, saveWindowState };