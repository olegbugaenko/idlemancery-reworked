import {GameModule} from "../game-module";
import {gameCore, gameEffects, gameEntity, resourceApi} from "game-framework";

export class MonitoringModule extends GameModule {

    constructor() {
        super();

        this.eventHandler.registerHandler('set-monitored', ({ scope, type, id}) => {
            console.log('set-monitored: ', scope, type, id);
            if(scope === 'actions') {
                gameCore.getModule('actions').setMonitored({ type, id });
            }

            if(scope === 'effects') {
                // check if type is action. If it is - get action effects and resources
                // and set them monitored
                if(type === 'action') {
                    // if id null - clear monitors, else - replace em
                    if(id) {
                        const data = gameEntity.getEffects(id, 1, gameCore.getModule('actions').actions[id]?.level || 1, true)
                        const effects = data.filter(one => one.type === 'effects');
                        const resources = data.filter(one => one.type === 'resources');

                        gameCore.getModule('attributes').setMonitored(effects);
                        gameCore.getModule('resource-pool').setMonitored(resources);
                    } else {
                        gameCore.getModule('attributes').setMonitored([]);
                        gameCore.getModule('resource-pool').setMonitored([]);
                    }
                }

                if(type === 'spell') {
                    // if id null - clear monitors, else - replace em
                    if(id) {
                        const spell = gameEntity.getEntity(id);
                        const effDurable = gameEntity.getEffects(id, 0, spell.level, true);
                        let effects = [];
                        if(spell.usageGain) {
                            effects = resourceApi.unpackEffects(spell.usageGain, spell.level)
                        }

                        console.log('Effs: ', effDurable, effects);

                        const data = [...effDurable, ...effects];
                        const attrs = data.filter(one => one.type === 'effects');
                        const resources = data.filter(one => one.type === 'resources');

                        gameCore.getModule('attributes').setMonitored(attrs);
                        gameCore.getModule('resource-pool').setMonitored(resources);
                    } else {
                        gameCore.getModule('attributes').setMonitored([]);
                        gameCore.getModule('resource-pool').setMonitored([]);
                    }
                }

                if(['furniture', 'accessory', 'amplifier'].includes(type)) {
                    // if id null - clear monitors, else - replace em
                    if(id) {
                        const data = gameEntity.getEffects(id, 1, 1, true)
                        const effects = data.filter(one => one.type === 'effects');
                        const resources = data.filter(one => one.type === 'resources');

                        gameCore.getModule('attributes').setMonitored(effects);
                        gameCore.getModule('resource-pool').setMonitored(resources);
                    } else {
                        gameCore.getModule('attributes').setMonitored([]);
                        gameCore.getModule('resource-pool').setMonitored([]);
                    }
                }
            }

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