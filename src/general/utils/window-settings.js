const fs = require('fs');
const path = require('path');


function loadWindowState(app) {
    try {
        const stateFile = path.join(app.getPath('userData'), 'window-state.json');
        const data = fs.readFileSync(stateFile, 'utf-8');
        const parsed = JSON.parse(data);
        if (typeof parsed.zoomFactor === 'undefined') {
            parsed.zoomFactor = 1;
        }
        return parsed;
    } catch {
        return {
            width: 1920,
            height: 1080,
            fullscreen: true,
            zoomFactor: 1
        };
    }
}

function saveWindowState(app, win, zoomFactor) {
    if (!win) return;
    const bounds = win.getBounds();
    const state = {
        width: bounds.width,
        height: bounds.height,
        x: bounds.x,
        y: bounds.y,
        fullscreen: win.isFullScreen(),
        zoomFactor: Number(zoomFactor) || 1
    };
    const stateFile = path.join(app.getPath('userData'), 'window-state.json');
    fs.writeFileSync(stateFile, JSON.stringify(state));
}

module.exports = { loadWindowState, saveWindowState };