import {GameModule} from "../game-module";

export class HotkeysModule extends GameModule {

    constructor() {
        super();
        this.hotKeys = {};

        this.eventHandler.registerHandler('query-all-hotkeys', (payload) => {
            let label = `all-hotkeys`
            if(payload?.suffix) {
                label = `${label}-${payload?.suffix}`
            }
            this.eventHandler.sendData(label, this.hotKeys);
        })

        this.eventHandler.registerHandler('update-hotkey', (payload) => {
            this.hotKeys[payload.id] = payload;
            this.eventHandler.sendData('all-hotkeys', this.hotKeys);
            this.eventHandler.sendData('all-hotkeys-all', this.hotKeys);
        })

        this.eventHandler.registerHandler('trigger-hotkey', (payload) => {
            const hotkey = this.hotKeys[payload.combination];
            if (hotkey) {
                this.eventHandler.sendData('hotkey-triggered', hotkey);
            }
        })
    }

    initialize() {

    }

    save() {
        return {
            hotKeys: this.hotKeys,
        }
    }

    load(obj) {
        if(obj?.hotKeys) {
            this.hotKeys = obj.hotKeys;
        }
    }


    tick() {

    }

}