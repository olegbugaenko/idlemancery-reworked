import {GameModule} from "../../shared/game-module";
import {gameEntity, gameResources, gameCore, resourceCalculators} from "game-framework";

export class ActionListsSubmodule extends GameModule {

    constructor() {
        super();

        this.actionsLists = {};

        this.runningList = null;

        this.eventHandler.registerHandler('save-action-list', (payload) => {
            this.saveActionList(payload);
        })

        this.eventHandler.registerHandler('load-action-list', ({ id }) => {
            this.sendListData(id);
        })

        this.eventHandler.registerHandler('run-list', ({ id }) => {
            this.runList(id);
        })

        this.eventHandler.registerHandler('stop-list', ({ id }) => {
            this.stopList(id);
        })

        this.eventHandler.registerHandler('query-action-list-effects', ({ id, listData }) => {
            const data = this.getListEffects(id, listData);

            const prevEffects = [];
            const resourcesEffects = this.packEffects(data.filter(one => one.type === 'resources').map(effect => {
                const prev = resourceCalculators.assertResource(effect.id, false, ['running']);

                if(effect.scope !== 'income' && effect.scope !== 'consumption') return effect;

                const pScope = effect.scope === 'consumption' ? 'income' : effect.scope;

                const nPrv = {
                    ...effect,
                    scope: pScope,
                    value: prev.balance
                };

                if(nPrv.value < 0) {
                    nPrv.value = Math.abs(nPrv.value);
                    nPrv.scope = 'consumption';
                }

                console.log('Prv: ', prev, effect, nPrv);


                prevEffects.push(nPrv);

                const newVal = (effect.scope === 'income' ? effect.value : -effect.value) + prev.balance;

                const nScope = newVal > 0 ? 'income' : 'consumption';

                return {
                    ...effect,
                    value: Math.abs(newVal),
                    scope: nScope
                }
            }));

            console.log('SendingData: ', JSON.stringify(data.prevEffects), JSON.stringify(data.resourcesEffects));


            this.eventHandler.sendData('action-list-effects', {
                potentialEffects: data,
                resourcesEffects,
                prevEffects: this.packEffects(prevEffects),
                effectEffects: data.filter(one => one.type === 'effects')
            });
        })
    }

    runList(id) {
        if(!id) {
            this.stopList();
            return;
        }
        this.runningList = {
            id,
            name: this.actionsLists[id].name,
            actionIndex: 0,
            actionTimer: 0,
        };
    }

    stopList() {
        this.runningList = null;
    }

    saveActionList(payload) {
        let isNew = !payload.id;

        const list = {...payload};

        if(!list.id) {
            list.id = `${Math.random()*1000000}`
        }

        this.actionsLists[list.id] = list;
    }

    getLists() {
        return Object.values(this.actionsLists);
    }

    save() {
        return {
            list: this.actionsLists,
            runningList: this.runningList,
        }
    }

    load(obj) {
        this.actionsLists = obj?.list ?? []
        this.runningList = obj?.runningList ?? null;
    }

    tick(game, delta) {
        if (this.runningList) {
            const listToRun = this.actionsLists[this.runningList.id];
            if (!listToRun) {
                throw new Error('Invalid list to run');
            }

            let action = listToRun.actions[this.runningList.actionIndex];
            let isAvailable = action?.id && gameEntity.isEntityUnlocked(action.id) && !gameEntity.isCapped(action.id);

            // Check if action timer exceeded or action is not available
            if (!action || this.runningList.actionTimer > action.time || !isAvailable) {
                this.runningList.actionTimer = 0;

                // Initialize loop control variables
                let loops = 0;
                const maxLoops = listToRun.actions.length;

                // Loop to find the next available action
                do {
                    this.runningList.actionIndex++;
                    if (this.runningList.actionIndex >= listToRun.actions.length) {
                        this.runningList.actionIndex = 0; // Reset to start if end is reached
                    }

                    action = listToRun.actions[this.runningList.actionIndex];
                    isAvailable = gameEntity.isEntityUnlocked(action.id) && !gameEntity.isCapped(action.id);
                    loops++;
                } while (!isAvailable && loops < maxLoops);

                if (!isAvailable) {
                    // No available actions found in the list
                    console.log('No available actions in the list.');
                    // Handle this case as needed, e.g., stop the running list
                    this.stopList();
                    game.getModule('actions').setRunningAction(null);
                    return; // Exit the function early
                } else {
                    console.log('Toggled to:', this.runningList, action.id, delta);
                }
            }

            // Set the active action if it's not already active
            if (game.getModule('actions').activeAction !== action.id) {
                game.getModule('actions').setRunningAction(action.id);
            }

            // Increment the action timer
            this.runningList.actionTimer += delta;
        }

    }

    packEffects(effects, filter = (item) => true) {
        const result = effects.filter(filter).reduce((acc, item) => {
            acc[item.id] = item;

            return acc;
        }, {})

        return result;
    }

    sendListData(id) {
        const data = this.actionsLists[id];

        data.actions = data.actions.map(a => ({
            ...a,
            isAvailable: gameEntity.isEntityUnlocked(a.id) && !gameEntity.isCapped(a.id)
        }))


        data.potentialEffects = this.getListEffects(id);

        const resourcesEffects = data.potentialEffects.filter(one => one.type === 'resources');
        data.effectEffects = data.potentialEffects.filter(one => one.type === 'effects');

        const prevEffects = [];
        data.resourcesEffects = this.packEffects(resourcesEffects.map(effect => {
            const prev = resourceCalculators.assertResource(effect.id, false, ['running']);

            if(effect.scope !== 'income' && effect.scope !== 'consumption') return effect;

            const pScope = effect.scope === 'consumption' ? 'income' : effect.scope;

            const nPrv = {
                ...effect,
                scope: pScope,
                value: prev.balance
            };

            if(nPrv.value < 0) {
                nPrv.value = Math.abs(nPrv.value);
                nPrv.scope = 'consumption';
            }

            console.log('Prv2: ', prev, effect, nPrv);


            prevEffects.push(nPrv);

            const newVal = (effect.scope === 'income' ? effect.value : -effect.value) + prev.balance;

            const nScope = newVal > 0 ? 'income' : 'consumption';

            return {
                ...effect,
                value: Math.abs(newVal),
                scope: nScope
            }
        }));

        data.prevEffects = this.packEffects(prevEffects);

        console.log('SendingData: ', JSON.stringify(data.prevEffects), JSON.stringify(data.resourcesEffects));

        this.eventHandler.sendData('action-list-data', data);
    }

    getListEffects(id, listData) {
        let list = this.actionsLists[id];
        if(!list) {
            if(!listData) {
                throw new Error(`List with id ${id} not found`);
            }
            list = listData;
        }
        const totalTime = list.actions
            .filter(action => gameEntity.isEntityUnlocked(action.id) && !gameEntity.isCapped(action.id))
            .reduce((acc, item) => acc += item.time, 0);

        const totalEffects = [];

        list.actions.forEach(action => {
            let isAvailable = gameEntity.isEntityUnlocked(action.id) && !gameEntity.isCapped(action.id);
            if(!isAvailable) {
                return;
            }
            const effects = gameEntity.getEffects(action.id, gameEntity.getAttribute(action.id, 'isTraining') ? 1 : 0, gameEntity.getAttribute(action.id, 'isTraining') ? 1 : gameEntity.getLevel(action.id), true, action.time / totalTime);

            let learnRateFactor = gameCore.getModule('actions').getLearningRate(action.id) / gameCore.getModule('actions').getActionXPMax(action.id);

            effects.forEach(effToAdd => {
                const foundId = totalEffects.findIndex(a => a.id === effToAdd.id
                    && (a.scope === effToAdd.scope
                        || (['income', 'consumption'].includes(a.scope) && ['income', 'consumption'].includes(effToAdd.scope))
                    )
                );
                if(effToAdd.scope === 'income' && effToAdd.type === 'resources') {
                    effToAdd.value *= gameResources.getResource(effToAdd.id).multiplier;
                }

                if(effToAdd.scope === 'multiplier' && effToAdd.type === 'effects') {
                    // we actually adding multiplier
                    effToAdd.value *= learnRateFactor;
                }

                if(effToAdd.scope === 'income' && effToAdd.type === 'effects') {
                    effToAdd.value *= learnRateFactor;
                }

                if(foundId < 0) {
                    totalEffects.push(effToAdd);
                } else {
                    if(totalEffects[foundId].scope === 'consumption') {
                        totalEffects[foundId].scope = 'income';
                        totalEffects[foundId].value = -totalEffects[foundId].value;
                    }
                    if(effToAdd.scope === 'consumption') {
                        totalEffects[foundId].value -= effToAdd.value;
                    } else {
                        totalEffects[foundId].value += effToAdd.value;
                    }
                }
            })
        });

        return totalEffects.map(eff => eff.scope === 'income' && eff.value < 0 ? {...eff, scope: 'consumption', value: -eff.value} : eff);
    }
}