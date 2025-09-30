const { contextBridge, ipcRenderer, shell, webFrame } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    toggleFullscreen: () => ipcRenderer.send('toggle-fullscreen'),
    isFullscreen: () => ipcRenderer.invoke('is-fullscreen'),
    quitApp: () => ipcRenderer.send('quit-app'),
    saveToCloud: (data) => ipcRenderer.invoke('cloud-save', data),
    loadFromCloud: () => ipcRenderer.invoke('cloud-load'),
    openExternal: (url) => shell.openExternal(url)
});

// UI Zoom API (Electron-only)
contextBridge.exposeInMainWorld('zoomAPI', {
    set: (factor) => {
        try {
            const f = Math.max(0.5, Math.min(3, Number(factor) || 1));
            webFrame.setZoomFactor(f);
            ipcRenderer.send('set-zoom-factor', f);
        } catch (e) {
            // noop
        }
    },
    get: () => {
        try {
            return webFrame.getZoomFactor();
        } catch (e) {
            return 1;
        }
    }
});