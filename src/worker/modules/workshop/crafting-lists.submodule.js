import {GameModule} from "../../shared/game-module";
import {gameEntity, gameResources, gameCore, resourceCalculators} from "game-framework";
import {checkMatchingRules} from "../../shared/utils/rule-utils";
import {mapObject} from "../../shared/utils/objects";

export class CraftingListsSubmodule extends GameModule {

    constructor() {
        super();

        this.craftingLists = {};

        this.runningList = {
            crafting: null,
            alchemy: null
        };

        this.listsAutotrigger = {
            crafting: [],
            alchemy: []
        };

        this.autotriggerCD = {
            crafting: 0,
            alchemy: 0
        };

        this.automationEnabled = {
            crafting: false,
            alchemy: false
        };

        this.combineLists = true;

        this.autotriggerIntervalSetting = {
            crafting: 10,
            alchemy: 10
        };

        this.eventHandler.registerHandler('save-crafting-list', (payload) => {
            this.saveCraftingList(payload);
        })

        this.eventHandler.registerHandler('delete-crafting-list', ({id}) => {
            this.deleteCraftingList(id);
        })

        this.eventHandler.registerHandler('load-crafting-list', ({ id }) => {
            this.sendListData(id);
        })

        this.eventHandler.registerHandler('query-crafting-lists', (pl) => {
            const lists = this.getLists(pl);
            let label = 'crafting-lists';
            if(pl.category) {
                label = `${label}-${pl.category}`;
            }
            if(pl.prefix) {
                label = `${label}-${pl.prefix}`;
            }
            this.eventHandler.sendData(label, lists);
        })

        this.eventHandler.registerHandler('query-all-crafting-lists', payload => {
            this.sendAllCraftingLists(payload);
        })

        this.eventHandler.registerHandler('run-crafting-list', ({ id }) => {
            console.log('Running List: ', id);
            this.runList(id);
        })

        this.eventHandler.registerHandler('stop-crafting-list', ({ category }) => {
            this.stopList(category);
        })

        this.eventHandler.registerHandler('set-crafting-automation-enabled', ({ category, flag }) => {
            this.automationEnabled[category] = !!flag;
        })

        this.eventHandler.registerHandler('set-crafting-autotrigger-interval', ({ category, interval }) => {
            this.autotriggerIntervalSetting[category] = interval;
        })


        this.eventHandler.registerHandler('query-crafting-list-effects', ({ id, listData }) => {
            const data = this.getListEffects(null, listData);

            const prevEffects = [];
            const resourcesEffects = this.packEffects(data.effects.filter(one => one.type === 'resources').map(effect => {
                const prev = resourceCalculators.assertResource(effect.id, false, ['runningCrafting']);

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

            console.log('SendingData: ', JSON.stringify(data.effects.filter(one => one.type === 'effects')), JSON.stringify(resourcesEffects), data.assumedDistribution, id);


            this.eventHandler.sendData('crafting-list-effects', {
                potentialEffects: data.effects,
                resourcesEffects,
                prevEffects: this.packEffects(prevEffects),
                effectEffects: data.effects.filter(one => one.type === 'effects'),
                assumedDistribution: data.assumedDistribution,
            });
        })
    }

    runList(id, cat) {
        if(!id) {
            if(!cat) {
                cat = this.craftingLists[id].category;
            }
            this.stopList(cat);
            return;
        }
        const category = cat ?? this.craftingLists[id].category;
        gameCore.getModule('crafting').stopAllCrafting(category);
        if(!this.runningList) {
            this.runningList = {};
        }
        this.runningList[category] = {
            id,
            name: this.craftingLists[id].name,
            actionIndex: 0,
            actionTimer: 0,
        };

        const distributions = this.getRealListLevelsDistribution(id);

        distributions.forEach(item => {
            gameCore.getModule('crafting').setCraftingLevel({ id: item.id, level: item.level, isForce: true })
        })
        gameCore.getModule('crafting').sendCraftingData({ filterId: this.craftingLists[id].category });
    }

    stopList(category) {
        this.runningList[category] = null;
        gameCore.getModule('crafting').stopAllCrafting(category);
    }

    saveCraftingList(payload) {
        let isNew = !payload.id;

        const list = {...payload};

        delete list['isReopenEdit'];

        const isReopenEdit = payload.isReopenEdit

        if(!list.id) {
            list.id = `${Math.random()*1000000}`
        }

        this.craftingLists[list.id] = list;

        if(isReopenEdit) {
            this.sendListData(list.id, true);
        }

        console.log('SavingList: ', list, this.craftingLists);

        this.regenerateListsPriorityMap();

        const category = list.category;

        if(this.runningList?.[category]?.id && (this.runningList[category]?.id === payload.id)) {
            this.stopList(category);
            this.runList(payload.id, category);
        }
    }

    deleteCraftingList(id) {

        const category = this.craftingLists[id]?.category;

        if(this.runningList?.[category]?.id === id) {
            this.stopList(category);
        }

        delete this.craftingLists[id];

        this.regenerateListsPriorityMap();
    }

    regenerateListsPriorityMap() {
        const listsBeingAutotrigger = Object.values(this.craftingLists).filter(one => !!one.autotrigger?.isEnabled);


        this.listsAutotrigger = {
            crafting: listsBeingAutotrigger.filter(one => one.category === 'crafting').map(one => ({
                id: one.id,
                priority: one.autotrigger.priority ?? 0,
            })).sort((a, b) => a.priority - b.priority),
            alchemy: listsBeingAutotrigger.filter(one => one.category === 'alchemy').map(one => ({
                id: one.id,
                priority: one.autotrigger.priority ?? 0,
            })).sort((a, b) => a.priority - b.priority)
        };
    }

    getLists(pl) {
        let ls = Object.values(this.craftingLists).filter(one => one.category === pl.category).map(one => ({
            ...one,
            isUnlocked: true
        }));

        if(pl?.filterAutomated) {
            ls = ls.filter(one => one.autotrigger?.rules?.length || one.autotrigger?.isEnabled);
        }
        return {
            lists: ls,
            runningList: this.runningList[pl.category]?.id ? this.craftingLists[this.runningList[pl.category].id] : null,
            automationEnabled: this.automationEnabled[pl.category],
            autotriggerIntervalSetting: this.autotriggerIntervalSetting[pl.category],
        };
    }

    save() {
        return {
            list: mapObject(this.craftingLists, one => ({
                id: one.id,
                name: one.name,
                recipes: one.recipes,
                autotrigger: one.autotrigger,
                category: one.category,
            })),
            runningList: this.runningList,
            automationEnabled: this.automationEnabled,
            autotriggerIntervalSetting: this.autotriggerIntervalSetting,
        }
    }

    load(obj) {
        this.craftingLists = obj?.list ?? []
        this.runningList = obj?.runningList ?? {};
        this.automationEnabled = obj?.automationEnabled;
        this.autotriggerIntervalSetting = obj?.autotriggerIntervalSetting || 10;
        this.regenerateListsPriorityMap();
    }

    getAutotriggerList(cat) {
        for(const list of this.listsAutotrigger[cat]) {
            if(checkMatchingRules(this.craftingLists[list.id]?.autotrigger?.rules, this.craftingLists[list.id]?.autotrigger?.pattern)) {
                return list.id;
            }
        }
        return null;
    }

    tick(game, delta) {
        // Here we checking autotrigger
        ['crafting', 'alchemy'].forEach(cat => {
            if(!this.autotriggerCD) {
                this.autotriggerCD = {
                    alchemy: 0,
                    crafting: 0
                };
            }
            if(this.automationEnabled[cat] && this.listsAutotrigger[cat].length && this.autotriggerCD[cat] <= 0) {
                this.autotriggerCD[cat] = this.autotriggerIntervalSetting[cat] || 10;
                const autotrigger = this.getAutotriggerList(cat);

                if(autotrigger && this.runningList[cat]?.id !== autotrigger) {
                    console.log('Run list autotrigger: ', autotrigger, this.runningList[cat]?.id, this.listsAutotrigger);
                    this.runList(autotrigger, cat);
                }
            }
            this.autotriggerCD[cat] -= delta;
        })


    }

    packEffects(effects, filter = (item) => true) {
        const result = effects.filter(filter).reduce((acc, item) => {
            acc[item.id] = item;

            return acc;
        }, {})

        return result;
    }


    sendListData(id, bForceOpen = false) {
        const data = this.craftingLists[id];

        data.recipes = (data.recipes || []).map(a => ({
            ...a,
            isAvailable: gameEntity.isEntityUnlocked(a.id) && !gameEntity.isCapped(a.id)
        }))

        const { effects, assumedDistribution } = this.getListEffects(id);

        data.potentialEffects = effects;

        const resourcesEffects = data.potentialEffects.filter(one => one.type === 'resources');
        data.effectEffects = data.potentialEffects.filter(one => one.type === 'effects');

        const prevEffects = [];
        data.resourcesEffects = this.packEffects(resourcesEffects.map(effect => {
            const prev = resourceCalculators.assertResource(effect.id, false, ['runningCrafting']);

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

        data.bForceOpen = bForceOpen;

        data.assumedDistribution = assumedDistribution;

        // console.log('SendingData: ', JSON.stringify(data.prevEffects), JSON.stringify(data.resourcesEffects));

        this.eventHandler.sendData('crafting-list-data', data);
    }

    getRealListLevelsDistribution(id, listData) {
        const list = id ? this.craftingLists[id] : {...listData};

        let maxSlots = 0;
        let possibleEntities = []

        if(list.category === 'crafting') {
            maxSlots = gameResources.getResource('crafting_slots').income;
            possibleEntities = gameEntity.listEntitiesByTags(['crafting', 'material']);
        }

        if(list.category === 'alchemy') {
            maxSlots = gameResources.getResource('alchemy_slots').income;
            possibleEntities = gameEntity.listEntitiesByTags(['crafting', 'alchemy']);
        }

        if(!maxSlots || !possibleEntities) return [];

        const distribution = list?.recipes;

        if(!distribution) return [];

        const possibleIds = new Set(possibleEntities.map(({ id }) => id));

        // Filter valid distribution entries and normalize percentages
        const validDistribution = distribution
            .filter(({ id }) => possibleIds.has(id))
            .map((entry) => ({
                ...entry,
                percentage: entry.percentage / distribution.reduce((sum, { percentage }) => sum + percentage, 0),
            }));

        let remainingSlots = maxSlots;
        let result = [];

        // First pass: Allocate minimum slots
        for (const entry of validDistribution) {
            const { id, min } = entry;
            const allocated = Math.min(min, remainingSlots);
            result.push({ id, level: allocated });
            remainingSlots -= allocated;
        }

        // Second pass: Allocate slots based on percentage and constraints
        // Другий прохід: обчислюємо idealTotal і збираємо інформацію для третього
        const leftovers = [];

        for (const entry of result) {
            const original = validDistribution.find(({ id }) => id === entry.id);
            const { max, percentage } = original;

            const exactIdeal = maxSlots * percentage;
            const floorIdeal = Math.floor(exactIdeal);
            const currentLevel = entry.level;
            const desiredAdditional = floorIdeal - currentLevel;

            if (remainingSlots <= 0) continue;

            const allowedAdditional = Math.min(
                desiredAdditional,
                max ? max - currentLevel : Infinity,
                remainingSlots
            );

            entry.level += allowedAdditional;
            remainingSlots -= allowedAdditional;

            const fraction = exactIdeal - floorIdeal;
            leftovers.push({
                entry,
                fraction,
                max,
            });
        }


        if (remainingSlots > 0) {
            // Сортуємо від найбільшого дробового залишку до найменшого
            leftovers.sort((a, b) => b.fraction - a.fraction);

            for (const { entry, max, fraction } of leftovers) {
                if (remainingSlots <= 0) break;

                const currentLevel = entry.level;
                const canAdd = max ? max - currentLevel : Infinity;

                if (canAdd <= 0) continue;

                entry.level += 1;
                remainingSlots -= 1;
            }
        }

        result = result.filter(one => one.level > 0);

        console.log('distributed: ', maxSlots, result, leftovers);


        return result;
    }


    getListEffects(id, listData) {
        let list = this.craftingLists[id];
        if(!list) {
            if(!listData) {
                throw new Error(`List with id ${id} not found`);
            }
            list = listData;
        }
        const assumedDistribution = this.getRealListLevelsDistribution(id, listData);

        const totalEffects = [];

        // attempt to get effects for every item according to distributions
        assumedDistribution.forEach(distribution => {

            const effects = gameEntity.getEffects(distribution.id, 0, distribution.level, true);

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
        })

        return {
            effects: totalEffects.map(eff => eff.scope === 'income' && eff.value < 0 ? {...eff, scope: 'consumption', value: -eff.value} : eff),
            assumedDistribution: assumedDistribution,
        };
    }


    getAllCraftingLists() {
        const items = Object.values(this.craftingLists);

        return items.map(craft => ({
            ...craft,
            isUnlocked: true,
        }))
    }

    sendAllCraftingLists(payload) {
        const data = this.getAllCraftingLists();
        let label = 'all-crafting-lists';
        if(payload?.prefix) {
            label = `${label}-${payload?.prefix}`
        }
        this.eventHandler.sendData(label, data);
    }
}