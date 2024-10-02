import {GameModule} from "../../shared/game-module";
import {gameEntity} from "game-framework";

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
            // console.log('queried data: ', id, listData, data)
            this.eventHandler.sendData('action-list-effects', data);
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
            let isAvailable = gameEntity.isEntityUnlocked(action.id) && !gameEntity.isCapped(action.id);

            // Check if action timer exceeded or action is not available
            if (this.runningList.actionTimer > action.time || !isAvailable) {
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

    sendListData(id) {
        const data = this.actionsLists[id];

        data.actions = data.actions.map(a => ({
            ...a,
            isAvailable: gameEntity.isEntityUnlocked(a.id) && !gameEntity.isCapped(a.id)
        }))


        data.potentialEffects = this.getListEffects(id);

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
            const effects = gameEntity.getEffects(action.id, 0, gameEntity.getLevel(action.id), true, action.time / totalTime);
            effects.forEach(effToAdd => {
                const foundId = totalEffects.findIndex(a => a.id === effToAdd.id
                    && (a.scope === effToAdd.scope
                        || (['income', 'consumption'].includes(a.scope) && ['income', 'consumption'].includes(effToAdd.scope))
                    )
                );
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