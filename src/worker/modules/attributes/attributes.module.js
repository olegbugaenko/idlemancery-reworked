import {GameModule} from "../../shared/game-module";
import {gameCore, gameEffects, gameEntity} from "game-framework";
import {registerAttributes} from "./attributes-db";
import {gameUnlocks} from "game-framework/src/utils/unlocks";
import {calculateTimeToLevelUp} from "../../shared/utils/math";
import {getScope} from "../../shared/utils/scopes";

export class AttributesModule extends GameModule {

    constructor() {
        super();

        this.monitoredData = {};

        this.eventHandler.registerHandler('query-attributes-data', (payload) => {
            this.sendAttributesData()
        })

        this.eventHandler.registerHandler('query-attributes-unlocks', ({showUnlocked}) => {
            this.sendAttributesUnlocks(showUnlocked)
        })

        this.eventHandler.registerHandler('query-all-attributes', (payload) => {
            this.sendAllAttributes(payload)
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

    setMonitored(data) {
        this.monitoredData = {};
        if(!data?.length) return;
        data.forEach(effect => {
            let direction = 1;
            if(effect.scope === 'consumption') {
                direction = -1;
            }
            if(effect.scope === 'multiplier' && effect.value < 1) {
                direction = -1;
            }
            this.monitoredData[effect.id] = {
                direction,
                name: effect.name,
                id: effect.id
            };
        })
    }

    getAttributesUnlocks(showUnlocked) {
        const items = gameEffects.listEffectsByTags(['attribute'], false, [], { listPrevious: showUnlocked })
            .filter(one => one.isUnlocked && (one.nextUnlocks?.length || (showUnlocked && one.prevUnlocks?.length)))
            .map(one => {
                // Here we should somehow get current increment of attribute
                // first of all we should get current income from list
                // Try to get additional info
                if(one.nextUnlocks?.length) {
                    console.log('Actions: ', one)
                    one.unlocks = {
                        level: one.nextUnlocks[0].level,
                        progress: 100*one.value / one.nextUnlocks[0].level,
                        items: one.nextUnlocks.map(unlock => {
                            const ent = gameEntity.getEntity(unlock.unlockId);
                            return {
                                ...unlock,
                                meta: {
                                    name: ent.name,
                                    description: ent.description,
                                    scope: getScope(ent)
                                }
                            }
                        })
                    }
                }

                return {
                    ...one,
                    prevUnlocks: (one.prevUnlocks ?? []).map(unlock => {

                        let data = {};

                        if(gameEntity.entityExists(unlock.unlockId)) {
                            data = gameEntity.getEntity(unlock.unlockId);
                        }

                        return {
                            ...unlock,
                            data
                        }
                    }).sort((a, b) => b.level - a.level),
                }
            });



        return items;
    }


    getAttributesData() {
        const effects = gameEffects.listEffectsByTags(['attribute']);
        const list = effects.filter(one => one.isUnlocked).map(effect => ({
            ...effect,
            nextProgress: effect.nextUnlocks?.length ? effect.value / effect.nextUnlocks[0].level : 0,
            monitor: this.monitoredData[effect.id] ?? null,
        }))
        // console.log('Attrs: ', list);
        return {
            list,
        }
    }

    getAllAttributesData() {
        const effects = gameEffects.listEffectsByTags(['attribute']);
        const list = effects.map(effect => ({
            ...effect,
            monitor: this.monitoredData[effect.id] ?? null,
            isUnlocked: effect.isUnlocked,
        }))

        return list;
    }

    sendAttributesUnlocks(showPrevious) {
        const data = this.getAttributesUnlocks(showPrevious);
        this.eventHandler.sendData('attributes-unlocks', data);
    }

    sendAttributesData() {
        const data = this.getAttributesData();
        this.eventHandler.sendData('attributes-data', data);
    }

    sendAllAttributes(payload) {
        const data = this.getAllAttributesData();
        let label = 'all-attributes';
        if(payload?.prefix) {
            label = `${label}-${payload?.prefix}`
        }
        this.eventHandler.sendData(label, data);
    }
}