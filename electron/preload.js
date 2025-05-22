const { contextBridge, ipcRenderer, shell } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    toggleFullscreen: () => ipcRenderer.send('toggle-fullscreen'),
    isFullscreen: () => ipcRenderer.invoke('is-fullscreen'),
    quitApp: () => ipcRenderer.send('quit-app'),
    saveToCloud: (data) => ipcRenderer.invoke('cloud-save', data),
    loadFromCloud: () => ipcRenderer.invoke('cloud-load'),
    openExternal: (url) => shell.openExternal(url)
});