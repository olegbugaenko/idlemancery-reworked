// src/general/utils/steam-init.js
let greenworks = null;
const fs = require('fs');

function initSteamIfAvailable() {
    if (process.env.IS_STEAM_DEMO === '1' || true) {
        try {
            greenworks = require('../../../native/greenworks');
            if (greenworks.init()) {
                fs.appendFileSync('log.txt', `Steam API initialized\n`);
                console.log('Steam API initialized');
                return true;
            } else {
                fs.appendFileSync('log.txt', `Steam API failed to initialize\n`);
                console.warn('Steam API failed to initialize');
            }
        } catch (e) {
            fs.appendFileSync('log.txt', `Steam API not available: ${e.toString()}\n`);
            fs.appendFileSync('log.txt', `${e.stack}\n`);
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
