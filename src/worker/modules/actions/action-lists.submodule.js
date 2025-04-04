import {GameModule} from "../../shared/game-module";
import {gameEntity, gameResources, gameCore, resourceCalculators} from "game-framework";
import {checkMatchingRules} from "../../shared/utils/rule-utils";
import {mapObject} from "../../shared/utils/objects";
import {SMALL_NUMBER} from "game-framework/src/utils/consts";

export class ActionListsSubmodule extends GameModule {

    constructor() {
        super();

        this.actionsLists = {};

        this.runningList = null;

        this.listsAutotrigger = [];

        this.autotriggerCD = 0;

        this.automationEnabled = false;

        this.combineLists = true;

        this.autotriggerIntervalSetting = 10;

        this.eventHandler.registerHandler('save-action-list', (payload) => {
            this.saveActionList(payload);
        })

        this.eventHandler.registerHandler('delete-action-list', ({id}) => {
            this.deleteActionList(id);
        })

        this.eventHandler.registerHandler('load-action-list', ({ id }) => {
            this.sendListData(id);
        })

        this.eventHandler.registerHandler('query-actions-lists', (pl) => {
            const lists = this.getLists(pl);
            let label = 'actions-lists';
            if(pl.prefix) {
                label = `${label}-${pl.prefix}`;
            }
            this.eventHandler.sendData(label, lists);
        })

        this.eventHandler.registerHandler('run-list', ({ id }) => {
            this.runList(id);
        })

        this.eventHandler.registerHandler('stop-list', ({ id }) => {
            this.stopList(id);
        })

        this.eventHandler.registerHandler('set-automation-enabled', ({ flag }) => {
            this.automationEnabled = !!flag;
        })

        this.eventHandler.registerHandler('set-autotrigger-interval', ({ interval }) => {
            this.autotriggerIntervalSetting = interval;
        })

        this.eventHandler.registerHandler('set-action-lists-order', (payload) => {
            this.reorderLists(payload);
        })


        this.eventHandler.registerHandler('query-action-list-effects', ({ id, listData }) => {
            const data = this.getListEffects(null, listData);

            const prevEffects = [];
            const resourcesEffects = this.packEffects(data.filter(one => one.type === 'resources').map(effect => {
                const prev = resourceCalculators.assertResource(effect.id, false, ['runningActions']);

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

                prevEffects.push(nPrv);

                const newVal = (effect.scope === 'income' ? effect.value : -effect.value) + prev.balance;

                const nScope = newVal > 0 ? 'income' : 'consumption';

                return {
                    ...effect,
                    value: Math.abs(newVal),
                    scope: nScope
                }
            }));

            // console.log('SendingData: ', JSON.stringify(data.prevEffects), JSON.stringify(data.resourcesEffects), data, id);

            const proportionsBar = this.getProportionsBar(listData)

            this.eventHandler.sendData('action-list-effects', {
                potentialEffects: data,
                resourcesEffects,
                prevEffects: this.packEffects(prevEffects),
                effectEffects: data.filter(one => one.type === 'effects'),
                proportionsBar
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

        if(this.combineLists) {
            // register entity as custom action
            this.runCombinedList(id);
        }
    }

    stopList() {
        this.runningList = null;
        gameCore.getModule('actions').stopRunningActions();
    }

    saveActionList(payload) {
        let isNew = !payload.id;

        const list = {...payload};

        delete list['isReopenEdit'];

        const isReopenEdit = payload.isReopenEdit

        if(!list.id) {
            list.id = `${Math.random()*1000000}`
        }

        this.actionsLists[list.id] = list;

        this.actionsLists[list.id].actions = (this.actionsLists[list.id].actions || []).filter(one => one.time > 0);

        if(isReopenEdit) {
            this.sendListData(list.id, true);
        }

        this.sortLists();

        this.regenerateListsPriorityMap();

        if(this.runningList?.id && (this.runningList?.id === payload.id)) {
            const listToRun = this.actionsLists[this.runningList.id];

            let newTotalTime = 0.;

            listToRun.actions.forEach(a => {
                const isAvailable = gameEntity.isEntityUnlocked(a.id) && !gameEntity.isCapped(a.id);
                if(isAvailable) {
                    newTotalTime += a.time;
                }
            })

            gameCore.getModule('actions').activeActions = gameCore.getModule('actions').activeActions.map(active => {
                return {
                    ...active,
                    effort: (listToRun.actions.find(o => o.id === active.originalId)?.time || 0) / Math.max(newTotalTime, 0.0001)
                }
            })
            console.log('Reassert list onSave: ', newTotalTime, gameCore.getModule('actions').activeActions);
            gameCore.getModule('actions').reassertRunningEfforts(true);
        }
    }

    deleteActionList(id) {

        if(this.runningList?.id === id) {
            this.stopList();
        }

        delete this.actionsLists[id];

        this.sortLists();

        this.regenerateListsPriorityMap();
    }

    regenerateListsPriorityMap() {
        const listsBeingAutotrigger = Object.values(this.actionsLists).filter(one => !!one.autotrigger?.isEnabled);

        const listsBeingAutotriggerAvailable = listsBeingAutotrigger.filter(lst => {
           if(lst.actions && lst.actions.find(one => gameEntity.isEntityUnlocked(one.id)
               && !gameEntity.isCapped(one.id))) return true;

           return false;
        });
        console.log('regenerateListPriority: ', listsBeingAutotrigger, listsBeingAutotriggerAvailable)
        this.listsAutotrigger = listsBeingAutotriggerAvailable.map(one => ({
            id: one.id,
            priority: one.autotrigger.priority ?? 0,
        })).sort((a, b) => a.priority - b.priority);
    }

    reorderLists(newOrder) {
        newOrder.forEach(({ id, sort }) => {
            if (this.actionsLists[id]) {
                this.actionsLists[id].sort = sort;
            }
        });
        console.log('newOrder: ', newOrder);
        this.sortLists(); // Re-sort the cached list
    }

    sortLists() {
        this._cachedSortedLists = Object.values(this.actionsLists).sort((a, b) => a.sort - b.sort);
    }

    getLists(pl) {
        if(!this._cachedSortedLists) {
            this.sortLists();
        }
        let ls = this._cachedSortedLists.map(one => ({
            ...one,
            isUnlocked: true
        }));

        if(pl?.filterAutomated) {
            ls = ls.filter(one => one.autotrigger?.rules?.length || one.autotrigger?.isEnabled);
        }
        return ls;
    }

    save() {
        return {
            list: mapObject(this.actionsLists, one => ({
                id: one.id,
                name: one.name,
                sort: one.sort,
                actions: one.actions,
                autotrigger: one.autotrigger
            })),
            runningList: this.runningList,
            automationEnabled: this.automationEnabled,
            autotriggerIntervalSetting: this.autotriggerIntervalSetting,
        }
    }

    load(obj) {
        this.actionsLists = obj?.list ?? []
        this.runningList = obj?.runningList ?? null;
        this.automationEnabled = obj?.automationEnabled;
        this.autotriggerIntervalSetting = obj?.autotriggerIntervalSetting || 10;
        if(this.actionsLists) {
            for(const key in this.actionsLists) {
                this.actionsLists[key].actions = (this.actionsLists[key].actions || []).filter(one => one.time > 0);
            }
        }
        this.sortLists();
        this.regenerateListsPriorityMap();
    }

    getAutotriggerList() {
        for(const list of this.listsAutotrigger) {
            if(checkMatchingRules(this.actionsLists[list.id]?.autotrigger?.rules, this.actionsLists[list.id]?.autotrigger?.pattern)) {
                return list.id;
            }
        }
        return null;
    }

    tick(game, delta) {
        // Here we checking autotrigger
        if(this.automationEnabled && this.listsAutotrigger.length && this.autotriggerCD <= 0) {
            this.autotriggerCD = this.autotriggerIntervalSetting || 10;
            const autotrigger = this.getAutotriggerList();

            if(autotrigger && this.runningList?.id !== autotrigger) {
                console.log('Run list autotrigger: ', autotrigger, this.runningList?.id, this.listsAutotrigger);
                this.runList(autotrigger);
            }
        }

        this.autotriggerCD -= delta;

        if (this.runningList && !this.combineLists) {
            const listToRun = this.actionsLists[this.runningList.id];
            if (!listToRun) {
                console.error('List: ', this.actionsLists, this.runningList);
                throw new Error('Invalid list to run!!');
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
                    isAvailable = action && gameEntity.isEntityUnlocked(action.id) && !gameEntity.isCapped(action.id);
                    loops++;
                } while (!isAvailable && loops < maxLoops);

                if (!isAvailable) {
                    // No available actions found in the list
                    console.log('No available actions in the list.');
                    // Handle this case as needed, e.g., stop the running list
                    this.stopList();
                    gameCore.getModule('actions').setRunningAction(null);
                    return; // Exit the function early
                } else {
                    console.log('Toggled to:', this.runningList, action.id, delta);
                }
            }

            // Set the active action if it's not already active
            if (gameCore.getModule('actions').activeAction !== action.id) {
                gameCore.getModule('actions').setRunningAction(action.id);
            }

            // Increment the action timer
            this.runningList.actionTimer += delta;
        }

        if (this.runningList && this.combineLists) {
            // include available notpresent
            const listToRun = this.actionsLists[this.runningList.id];
            if (!listToRun) {
                console.error('List: ', this.actionsLists, this.runningList);
                throw new Error('Invalid list to run');
            }

            const totalTime = listToRun.actions.reduce((acc, item) => acc += item.time, 0)
            let needReassert = false;
            let newTotalTime = 0.;
            listToRun.actions.forEach(a => {
                const isAvailable = gameEntity.isEntityUnlocked(a.id) && !gameEntity.isCapped(a.id);
                if(isAvailable) {
                    newTotalTime += a.time;
                }
                if(!isAvailable && gameCore.getModule('actions').isRunningAction(a.id)) {
                    gameCore.getModule('actions').dropRunningAction(a.id);
                    needReassert = true;
                }
                if(!gameCore.getModule('actions').isRunningAction(a.id) && isAvailable) {
                    gameCore.getModule('actions').addRunningAction(a.id, a.time / totalTime);
                    needReassert = true;
                }
            })
            const activeActions = gameCore.getModule('actions').activeActions;
            activeActions.forEach(active => {
                if(!listToRun.actions.find(o => o.id === active.originalId)) {
                    gameCore.getModule('actions').dropRunningAction(active.originalId);
                    needReassert = true;
                }
            })
            if(needReassert) {
                gameCore.getModule('actions').activeActions = gameCore.getModule('actions').activeActions.map(active => {
                    return {
                        ...active,
                        effort: (listToRun.actions.find(o => o.id === active.originalId)?.time || 0) / newTotalTime
                    }
                })
                console.log('Reassert list: ', needReassert, newTotalTime, totalTime, gameCore.getModule('actions').activeActions);
                gameCore.getModule('actions').reassertRunningEfforts();
            }
        }

    }

    packEffects(effects, filter = (item) => true) {
        const result = effects.filter(filter).reduce((acc, item) => {
            acc[item.id] = item;

            return acc;
        }, {})

        return result;
    }

    runCombinedList(id) {
        const data = this.actionsLists[id];

        const actionsAvailable = (data.actions || []).map(a => ({
            ...a,
            isAvailable: gameEntity.isEntityUnlocked(a.id) && !gameEntity.isCapped(a.id)
        }));

        const totalTime = actionsAvailable
            .filter(action => gameEntity.isEntityUnlocked(action.id) && !gameEntity.isCapped(action.id))
            .reduce((acc, item) => acc += item.time, 0);

        const actionsFractions = actionsAvailable.map(action => ({
            ...action,
            effortFraction: action.time / Math.max(totalTime, 0.0001)
        }));

        // now registering entities for every action
        gameCore.getModule('actions').stopRunningActions();
        actionsFractions.forEach(actionToRun => {
            gameCore.getModule('actions').addRunningAction(
                actionToRun.id,
                actionToRun.effortFraction
            )
        })
    }

    sendListData(id, bForceOpen = false) {
        const data = this.actionsLists[id];

        data.actions = (data.actions || []).map(a => ({
            ...a,
            isAvailable: gameEntity.isEntityUnlocked(a.id) && !gameEntity.isCapped(a.id)
        }))


        data.potentialEffects = this.getListEffects(id);

        const resourcesEffects = data.potentialEffects.filter(one => one.type === 'resources');
        data.effectEffects = data.potentialEffects.filter(one => one.type === 'effects');

        const prevEffects = [];
        data.resourcesEffects = this.packEffects(resourcesEffects.map(effect => {
            const prev = resourceCalculators.assertResource(effect.id, false, ['runningActions']);

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

        const proportionsBar = this.getProportionsBar(data)

        data.prevEffects = this.packEffects(prevEffects);

        data.proportionsBar = proportionsBar;

        data.bForceOpen = bForceOpen;

        // console.log('SendingData: ', JSON.stringify(data.prevEffects), JSON.stringify(data.resourcesEffects));

        this.eventHandler.sendData('action-list-data', data);
    }

    getProportionsBar(data) {
        const total = data.actions.reduce((acc, a) => acc += Math.max(0, a.time), 0);
        const actions = data.actions.map(one => ({...one, time: Math.max(0, one.time)}));

        if (total <= SMALL_NUMBER) return [];

        const generateColor = (index, totalActions) => {
            // Use HSL to generate deterministic colors based on the index
            const hue = (index * 360 / totalActions) % 360; // Spread hues evenly
            const saturation = 65; // Fixed saturation for consistency
            const lightness = 70; // Fixed lightness for consistency
            return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        };

        const rawPercentages = actions.map(a => a.time / total);
        const minimumPercentage = 0.01;
        const totalMinimum = minimumPercentage * actions.length;
        const normalizeFactor = (1 - totalMinimum) / rawPercentages.reduce((acc, p) => acc + Math.max(p - minimumPercentage, 0), 0);

        return actions.map((a, index) => {
            const percentage = a.time / total;
            const displayPercentage = percentage < minimumPercentage
                ? minimumPercentage
                : (percentage - minimumPercentage) * normalizeFactor + minimumPercentage;

            return {
                id: a.id,
                name: a.name,
                percentage: percentage,
                displayPercentage: `${displayPercentage*100}%`,
                color: generateColor(index, actions.length)
            };
        });
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
            const isEffectChanneling = gameEntity.getAttribute(action.id, 'isEffectChanneling', false);
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

                if(effToAdd.scope === 'multiplier' && effToAdd.type === 'effects' && !isEffectChanneling) {
                    // we actually adding multiplier
                    effToAdd.value *= learnRateFactor;
                }

                if(effToAdd.scope === 'income' && effToAdd.type === 'effects' && !isEffectChanneling) {
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