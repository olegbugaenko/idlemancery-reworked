// src/general/utils/steam-init.js
let greenworks = null;
const fs = require('fs');

const log = str => {
    // fs.appendFileSync('log.txt', `${str}\n`);
}

function initSteamIfAvailable() {
    if (process.env.IS_STEAM_DEMO === '1' || true) {
        try {
            greenworks = require('../../../native/greenworks');
            if (greenworks.init()) {
                log(`Steam API initialized\n`);
                console.log('Steam API initialized');
                log('Cloud enabled: ' + greenworks.isCloudEnabled());
                log('Cloud enabled for user: ' + greenworks.isCloudEnabledForUser());

                greenworks.on('steam-servers-connected', function() { log('connected'); });
                greenworks.on('steam-servers-disconnected', function() { log('disconnected'); });
                greenworks.on('steam-server-connect-failure', function() { log('connected failure'); });
                greenworks.on('steam-shutdown', function() { log('shutdown'); });
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
