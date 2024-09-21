import {GameModule} from "../../shared/game-module";
import {gameEffects} from "game-framework";
import {registerAttributes} from "./attributes-db";

export class AttributesModule extends GameModule {

    constructor() {
        super();


        this.eventHandler.registerHandler('query-attributes-data', (payload) => {
            this.sendAttributesData()
        })
    }

    initialize() {

        registerAttributes();

    }


    tick(game, delta) {

    }

    save() {

    }

    load(saveObject) {

    }


    getAttributesData() {
        const effects = gameEffects.listEffectsByTags(['attribute']);
        const list = effects.filter(one => one.isUnlocked).map(effect => ({
            ...effect,
        }))

        return {
            list,
        }
    }

    sendAttributesData() {
        const data = this.getAttributesData();
        this.eventHandler.sendData('attributes-data', data);
    }

}