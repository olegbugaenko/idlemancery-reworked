const fs = require('fs');
const path = require('path');
const { getGreenworks } = require('./steam-init');

const SAVE_FILE_NAME = 'idle-awakening-save.sav';

const log = str => {
    // fs.appendFileSync('log.txt', `${str}\n`);
}

function saveToCloud(jsonData) {
    return new Promise((resolve) => {
        const greenworks = getGreenworks();
        if (!greenworks) return resolve(false);

        try {
            greenworks.saveTextToFile(SAVE_FILE_NAME, JSON.stringify(jsonData), () => {
                log('[SteamCloud] Game saved');
                resolve(true);
            }, (e) => {
                console.error('[SteamCloud] Save failed:', e);
                log('[SteamCloud] Save failed: '+e.toString());
                log(`Trying to save to ${SAVE_FILE_NAME} content ${JSON.stringify(jsonData)}`);
                resolve(false)
            })
        } catch (e) {
            console.error('[SteamCloud] Save failed:', e);
            log('[SteamCloud] Save failed: '+e.toString());
            resolve(false)
        }
    })

}

function loadFromCloud() {
    return new Promise((resolve) => {
        const greenworks = getGreenworks();
        if (!greenworks) return resolve(null);

        try {
            greenworks.readTextFromFile(SAVE_FILE_NAME, function(message) {
                log('[SteamCloud] loaded successfully'); resolve(message)}, function(err) {
                log('[SteamCloud] Failed on reading text from file'); resolve(null)});
        } catch (e) {
            console.error('[SteamCloud] Load failed:', e);
            log('[SteamCloud] Load failed: '+e.toString());
            return resolve(null)
        }
    })

}

module.exports = {
    saveToCloud,
    loadFromCloud,
};
