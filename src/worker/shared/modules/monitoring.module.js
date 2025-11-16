import {GameModule} from "../game-module";
import {gameCore, gameEffects, gameEntity, resourceApi} from "game-framework";

export class MonitoringModule extends GameModule {

    constructor() {
        super();

        const clearMonitoredEffects = () => {
            gameCore.getModule('attributes').setMonitored([]);
            gameCore.getModule('resource-pool').setMonitored([]);
        };

        const pushMonitoredEffects = (data, skipIds = [], skipTags) => {
            const effects = data.filter(one => one.type === 'effects');
            const resources = data.filter(one => one.type === 'resources');

            gameCore.getModule('attributes').setMonitored(effects);
            gameCore.getModule('resource-pool').setMonitored(resources, skipTags, skipIds);
        };

        this.eventHandler.registerHandler('set-monitored', ({ scope, type, id}) => {
            if(scope === 'actions') {
                gameCore.getModule('actions').setMonitored({ type, id });
            }

            if(scope === 'spells') {
                gameCore.getModule('magic').setMonitored({ type, id });
            }


            if(scope === 'effects') {
                // check if type is action. If it is - get action effects and resources
                // and set them monitored
                if(type === 'action') {
                    // if id null - clear monitors, else - replace em
                    if(id) {
                        // let levelToAccount = gameCore.getModule('actions').actions[id]?.level;
                        let skippedIds = [id, `active_${id}`];
                        if(gameEntity.getEntity(id).satelliteEntityId) {
                            skippedIds.push(gameEntity.getEntity(id).satelliteEntityId);
                            console.log('satelliteLevel: ', gameEntity.getLevel(gameEntity.getEntity(id).satelliteEntityId));
                        }
                        const lvl = gameCore.getModule('actions').actions[id]?.level;
                        const data = gameEntity.getEffects(id, 0, lvl || 1, true);
                        const nlvData = gameEntity.getEffects(id, 1, lvl || 1, true);
                        const effects = data.filter(one => one.type === 'effects');
                        const resources = data.filter(one => one.type === 'resources').map(r => {
                            if(['rawCap', 'capMult'].includes(r.scope)) {
                                // use potential
                                const pt = nlvData.find(nr => nr.type === 'resources' && nr.id === r.id);
                                console.log('MappingToPot', pt);
                                return pt ? {...pt} : r;
                            }
                            return r;
                        })

                        const combinedEffects = [...effects, ...resources];
                        pushMonitoredEffects(combinedEffects, skippedIds, ['runningActions']);
                    } else {
                        clearMonitoredEffects();
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

                        // console.log('Effs: ', effDurable, effects);

                        const data = [...effects.map(one => ({...one, isOneTime: true})), ...effDurable];
                        pushMonitoredEffects(data, [id, `active_${id}`]);
                    } else {
                        clearMonitoredEffects();
                    }
                }

                if(type === 'course') {
                    if(id) {
                        const entity = gameEntity.getEntity(id);
                        if(entity) {
                            const learningEffects = entity.learningEntity
                                ? resourceApi.unpackEffects(entity.learningEntity.resourceModifier || {}, entity.level)
                                : [];
                            const data = [
                                ...gameEntity.getEffects(id, 1, null, true),
                                ...learningEffects,
                            ];
                            pushMonitoredEffects(data, [id, `learning_${id}`]);
                        } else {
                            clearMonitoredEffects();
                        }
                    } else {
                        clearMonitoredEffects();
                    }
                    return;
                }

                if(type === 'recipe') {
                    if(id) {
                        const craftingModule = gameCore.getModule('crafting');
                        if(craftingModule?.getRecipeEffectsWithMultipliers) {
                            const assignedEffort = craftingModule.craftingSlots?.[id]?.effort;
                            const calculatedEffort = assignedEffort && assignedEffort > 0 ? assignedEffort : 1;
                            const isRunning = gameEntity.entityExists(`activeCrafting_${id}`);
                            const data = craftingModule.getRecipeEffectsWithMultipliers(id, calculatedEffort, isRunning, false);
                            pushMonitoredEffects(data, [id, `activeCrafting_${id}`]);
                        } else {
                            clearMonitoredEffects();
                        }
                    } else {
                        clearMonitoredEffects();
                    }
                    return;
                }

                const genericMonitorTypes = ['furniture', 'accessory', 'amplifier', 'shop_upgrade', 'structure', 'artifact'];
                if(genericMonitorTypes.includes(type)) {
                    // if id null - clear monitors, else - replace em
                    if(id) {
                        const data = gameEntity.getEffects(id, 1, null, true);
                        pushMonitoredEffects(data, [id]);
                    } else {
                        clearMonitoredEffects();
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