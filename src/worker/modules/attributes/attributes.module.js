import {GameModule} from "../../shared/game-module";
import {gameEffects, gameEntity} from "game-framework";
import {registerAttributes} from "./attributes-db";

export class AttributesModule extends GameModule {

    constructor() {
        super();


        this.eventHandler.registerHandler('query-attributes-data', (payload) => {
            this.sendAttributesData()
        })

        this.eventHandler.registerHandler('query-attributes-unlocks', (payload) => {
            this.sendAttributesUnlocks()
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

    getAttributesUnlocks() {
        const items = gameEffects.listEffectsByTags(['attribute'])
            .filter(one => one.isUnlocked && one.nextUnlock);
        return items;
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

    sendAttributesUnlocks() {
        const data = this.getAttributesUnlocks();
        this.eventHandler.sendData('attributes-unlocks', data);
    }

    sendAttributesData() {
        const data = this.getAttributesData();
        this.eventHandler.sendData('attributes-data', data);
    }

}