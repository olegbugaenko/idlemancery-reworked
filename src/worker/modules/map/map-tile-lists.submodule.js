import {GameModule} from "../../shared/game-module";
import {gameEntity, gameResources, gameCore, resourceCalculators} from "game-framework";
import {checkMatchingRules} from "../../shared/utils/rule-utils";
import {mapObject} from "../../shared/utils/objects";

export class MapTileListsSubmodule extends GameModule {

    constructor() {
        super();

        this.mapLists = {};

        this.runningList = null;

        this.listsAutotrigger = [];

        this.autotriggerCD = 0;

        this.automationEnabled = false;

        this.combineLists = true;

        this.autotriggerIntervalSetting = 10;

        this.eventHandler.registerHandler('save-map-tile-list', (payload) => {
            this.saveMapTilesList(payload);
        })

        this.eventHandler.registerHandler('delete-map-tile-list', ({id}) => {
            this.deleteMapTilesList(id);
        })

        this.eventHandler.registerHandler('load-map-tile-list', ({ id }) => {
            this.sendListData(id);
        })

        this.eventHandler.registerHandler('query-map-tile-lists', (pl) => {
            const lists = this.getLists(pl);
            this.eventHandler.sendData('map-tile-lists', lists);
        })

        this.eventHandler.registerHandler('run-map-tile-list', ({ id }) => {
            this.runList(id);
        })

        this.eventHandler.registerHandler('stop-map-tile-list', ({ id }) => {
            this.stopList(id);
        })

        this.eventHandler.registerHandler('set-map-automation-enabled', ({ flag }) => {
            this.automationEnabled = !!flag;
        })

        this.eventHandler.registerHandler('set-map-autotrigger-interval', ({ interval }) => {
            this.autotriggerIntervalSetting = interval;
        })


        this.eventHandler.registerHandler('query-map-tile-list-effects', ({ id, listData }) => {
            const potentialDrops = this.getListEffects(null, listData);
            const costs = this.getListCosts(null, listData);

            this.eventHandler.sendData('map-tile-list-effects', {
                id,
                potentialDrops,
                costs
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
            name: this.mapLists[id].name,
            actionIndex: 0,
            actionTimer: 0,
        };

        this.runCombinedList(id);
    }

    stopList() {
        this.runningList = null;
        gameCore.getModule('map').stopRunningTiles();
    }

    saveMapTilesList(payload) {
        let isNew = !payload.id;

        const list = {...payload};

        delete list['isReopenEdit'];

        const isReopenEdit = payload.isReopenEdit

        if(!list.id) {
            list.id = `${Math.random()*1000000}`
        }

        if(list.autotriggerCD && !list.autotrigger.priority) {
            list.autotrigger.priority = 0;
        }

        this.mapLists[list.id] = list;

        this.mapLists[list.id].tiles = (this.mapLists[list.id].tiles || []).filter(one => one.time > 0);

        console.log('Saved List: ', list, payload);

        if(isReopenEdit) {
            this.sendListData(list.id, true);
        }

        this.regenerateListsPriorityMap();

        if(this.runningList?.id && (this.runningList?.id === payload.id)) {
            const listToRun = this.mapLists[this.runningList.id];
            this.runList(this.runningList.id);
        }
    }

    deleteMapTilesList(id) {
        delete this.mapLists[id];

        this.regenerateListsPriorityMap();
    }

    regenerateListsPriorityMap() {
        const listsBeingAutotrigger = Object.values(this.mapLists).filter(one => !!one.autotrigger?.rules?.length);

        this.listsAutotrigger = listsBeingAutotrigger.map(one => ({
            id: one.id,
            priority: one.autotrigger.priority ?? 0,
        })).sort((a, b) => a.priority - b.priority);
    }

    getLists(pl) {
        let ls = Object.values(this.mapLists);

        if(pl?.filterAutomated) {
            ls = ls.filter(one => one.autotrigger?.rules?.length);
        }
        return {
            lists: ls,
            runningList: this.runningList?.id ? this.mapLists[this.runningList.id] : null,
            automationEnabled: this.automationEnabled,
            autotriggerIntervalSetting: this.autotriggerIntervalSetting,
        };
    }

    save() {
        return {
            list: mapObject(this.mapLists, one => ({
                id: one.id,
                name: one.name,
                tiles: one.tiles,
                autotrigger: one.autotrigger,
            })),
            runningList: this.runningList,
            automationEnabled: this.automationEnabled,
            autotriggerIntervalSetting: this.autotriggerIntervalSetting,
        }
    }

    load(obj) {
        this.mapLists = obj?.list ?? [];
        this.runningList = obj?.runningList ?? null;
        this.automationEnabled = obj?.automationEnabled;
        this.autotriggerIntervalSetting = obj?.autotriggerIntervalSetting || 10;
        if(this.mapLists) {
            for(const key in this.mapLists) {
                this.mapLists[key].tiles = (this.mapLists[key].tiles || []).filter(one => one.time > 0);
            }
        }
        this.regenerateListsPriorityMap();
        console.log('RNN: ', this.runningList);
        if(obj?.runningList && Object.keys(obj?.runningList).length) {
            this.stopList();
            this.runList(obj?.runningList.id);
        }
    }

    getAutotriggerList() {
        for(const list of this.listsAutotrigger) {
            if(checkMatchingRules(this.mapLists[list.id]?.autotrigger?.rules, this.mapLists[list.id]?.autotrigger?.pattern)) {
                return list.id;
            }
        }
        return null;
    }

    tick(game, delta) {
        // Here we checking autotrigger
        // console.log('Autotrigger map', this.automationEnabled, this.listsAutotrigger, this.autotriggerCD);
        if(this.automationEnabled && this.listsAutotrigger.length && this.autotriggerCD <= 0) {
            this.autotriggerCD = this.autotriggerIntervalSetting || 10;
            const autotrigger = this.getAutotriggerList();

            if(autotrigger && this.runningList?.id !== autotrigger) {
                console.log('Run list autotrigger: ', autotrigger, this.runningList?.id, this.listsAutotrigger);
                this.runList(autotrigger);
            }
        }

        this.autotriggerCD -= delta;

    }

    packEffects(effects, filter = (item) => true) {
        const result = effects.filter(filter).reduce((acc, item) => {
            acc[item.id] = item;

            return acc;
        }, {})

        return result;
    }

    runCombinedList(id) {
        const data = this.mapLists[id];

        const totalTime = data.tiles
            .reduce((acc, item) => acc += item.time, 0);

        const tileFractions = data.tiles.map(tile => ({
            ...tile,
            effortFraction: tile.time / totalTime
        }));

        // now registering entities for every action
        gameCore.getModule('map').stopRunningTiles();
        tileFractions.forEach(tileToRun => {
            gameCore.getModule('map').setTileRunning(
                tileToRun.i,
                tileToRun.j,
                true,
                tileToRun.effortFraction
            )
        })
    }

    sendListData(id, bForceOpen = false) {
        const data = this.mapLists[id];


        data.drops = this.getListEffects(id);
        data.costs = this.getListCosts(id);

        data.bForceOpen = bForceOpen;

        // console.log('SendingData: ', JSON.stringify(data.prevEffects), JSON.stringify(data.resourcesEffects));

        this.eventHandler.sendData('map-tile-list-data', data);
    }

    getListEffects(id, listData) {
        let list = this.mapLists[id];
        if (!list) {
            if (!listData) {
                throw new Error(`List with id ${id} not found`);
            }
            list = listData;
        }

        const totalTime = list.tiles.reduce((acc, item) => acc += item.time, 0);

        const totalEffects = {};

        list.tiles.forEach(tile => {
            const weight = tile.time / totalTime;

            const effects = gameCore
                .getModule('map')
                .mapTilesProcessed[tile.i][tile.j]
                .drops
                .filter((d, index) => gameResources.isResourceUnlocked(d.id) && gameCore
                    .getModule('map')
                    .mapTilesProcessed[tile.i][tile.j].r?.includes(index))
                .map(d => ({
                    ...d,
                    probability: d.probability * weight,
                    weightedAmountMin: d.probability * weight * d.amountMin,
                    weightedAmountMax: d.probability * weight * d.amountMax,
                }));

            effects.forEach(drop => {
                if (!totalEffects[drop.id]) {
                    totalEffects[drop.id] = {
                        id: drop.id,
                        probability: 0,
                        amountMin: 0,
                        amountMax: 0,
                        resource: gameResources.getResource(drop.id)
                    };
                }

                // Сумуємо внески для кожного предмета
                totalEffects[drop.id].probability += drop.probability;
                totalEffects[drop.id].amountMin += drop.weightedAmountMin;
                totalEffects[drop.id].amountMax += drop.weightedAmountMax;
            });
        });

        // Нормалізуємо `amountMin` та `amountMax` за ймовірністю
        Object.values(totalEffects).forEach(effect => {
            if (effect.probability > 0) {
                effect.amountMin /= effect.probability;
                effect.amountMax /= effect.probability;
            }
        });

        return Object.values(totalEffects);
    }

    getListCosts(id, listData) {
        let list = this.mapLists[id];
        if (!list) {
            if (!listData) {
                throw new Error(`List with id ${id} not found`);
            }
            list = listData;
        }

        const totalTime = list.tiles.reduce((acc, item) => acc += item.time, 0);

        const totalCosts = {};

        list.tiles.forEach(tile => {
            const weight = tile.time / totalTime;

            const costs = mapObject(gameCore
                .getModule('map')
                .mapTilesProcessed[tile.i][tile.j]
                .cost, (c, id) => ({
                    id,
                    value: c.value*weight
                }));

            console.log('ProcessingCosts: ', costs, gameCore
                .getModule('map')
                .mapTilesProcessed[tile.i][tile.j]
                .cost);

            Object.values(costs).forEach(cost => {
                if (!totalCosts[cost.id]) {
                    totalCosts[cost.id] = {
                        id: cost.id,
                        name: gameResources.getResource(cost.id).name,
                        cost: 0
                    };
                }

                // Сумуємо внески для кожного предмета
                totalCosts[cost.id].cost += (cost.value || 0);
            });
        });

        return Object.values(totalCosts);
    }

}