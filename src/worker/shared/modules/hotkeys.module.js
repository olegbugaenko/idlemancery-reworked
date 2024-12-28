import {GameModule} from "../game-module";

export class HotkeysModule extends GameModule {

    constructor() {
        super();
        this.hotKeys = {};

        this.eventHandler.registerHandler('query-all-hotkeys', () => {
            this.eventHandler.sendData('all-hotkeys', this.hotKeys);
        })

        this.eventHandler.registerHandler('update-hotkey', (payload) => {
            this.hotKeys[payload.id] = payload;
            this.eventHandler.sendData('all-hotkeys', this.hotKeys);
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