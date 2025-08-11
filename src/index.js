import React from 'react';
import ReactDOM from 'react-dom/client';
import AppProvided from "./App";

// *** HACK *** //
/*
(() => {
    const originalAdd = EventTarget.prototype.addEventListener;
    const originalRemove = EventTarget.prototype.removeEventListener;
    const listeners = [];

    EventTarget.prototype.addEventListener = function (type, listener, options) {
        listeners.push({ target: this, type, listener });
        return originalAdd.call(this, type, listener, options);
    };

    EventTarget.prototype.removeEventListener = function (type, listener, options) {
        const index = listeners.findIndex(
            (l) => l.listener === listener && l.type === type && l.target === this
        );
        if (index !== -1) listeners.splice(index, 1);
        return originalRemove.call(this, type, listener, options);
    };

    window.__getAllEventListeners = () => listeners;
})();
*/
// *** HACK-END *** //

window.IS_DEMO = IS_DEMO;
window.IS_STEAM_BUILD = IS_STEAM_BUILD;

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);

root.render(
        <AppProvided />
);

