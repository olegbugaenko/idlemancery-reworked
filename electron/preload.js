const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    toggleFullscreen: () => ipcRenderer.send('toggle-fullscreen'),
    isFullscreen: () => ipcRenderer.invoke('is-fullscreen'),
    quitApp: () => ipcRenderer.send('quit-app')
});