// src/general/utils/steam-init.js
let greenworks = null;

function initSteamIfAvailable() {
    if (process.env.IS_STEAM_DEMO === '1' || true) {
        try {
            greenworks = require('../../../native/greenworks');
            if (greenworks.init()) {
                console.log('Steam API initialized');
                return true;
            } else {
                console.warn('Steam API failed to initialize');
            }
        } catch (e) {
            console.warn('Steam API not available:', e);
        }
    } else {
        console.log('Steam not enabled — skipping init');
    }
    return false;
}

function getGreenworks() {
    return greenworks;
}

module.exports = {
    initSteamIfAvailable,
    getGreenworks
};
