
export function isElectron() {
    // Перевіряємо специфічний глобальний обʼєкт
    return navigator.userAgent.toLowerCase().indexOf('electron') > -1;
}

const checkFullscreen = async () => {
    const isFull = await window.electron.isFullscreen();
    console.log('Fullscreen is:', isFull);
};

export const quitApp = () => {
    if(!isElectron()) {
        return;
    }
    if(confirm('Are you sure you want to leave?')) {
        window.electron.quitApp();
    }
}

const toggleFullScreen = async () => {
    if(!isElectron()) {
        return;
    }
    window.electron.toggleFullscreen();
}