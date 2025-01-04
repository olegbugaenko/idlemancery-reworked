import {GameModule} from "../game-module";
import {gameCore} from "game-framework";

export class MonitoringModule extends GameModule {

    constructor() {
        super();

        this.eventHandler.registerHandler('set-monitored', ({ type, id}) => {
            // console.log('Mon: ', { type, id });
            gameCore.getModule('actions').setMonitored({ type, id });
        })
    }

    initialize() {

    }

    tick() {

    }

    save() {

    }

    load() {

    }
}