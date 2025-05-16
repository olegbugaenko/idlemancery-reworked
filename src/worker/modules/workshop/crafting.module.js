import {GameModule} from "../../shared/game-module";
import {registerCraftingRecipes} from "./recipes-db";
import {gameCore, gameEffects, gameEntity, gameResources, resourceCalculators} from "game-framework";
import {CraftingListsSubmodule} from "./crafting-lists.submodule";
import {SMALL_NUMBER} from "game-framework/src/utils/consts";

export class CraftingModule extends GameModule {

    constructor(props) {
        super(props);

        this.lists = new CraftingListsSubmodule();

        this.currentVersion = 2;

        this.craftingSlots = {};

        this.filters = [{
            id: 'crafting',
            name: 'Crafting',
            tags: ['material'],
            isDefault: true,
        },{
            id: 'alchemy',
            name: 'Alchemy',
            tags: ['alchemy'],
            isDefault: false,
        }]

        this.eventHandler.registerHandler('query-crafting-general-data', (payload) => {
            this.sendGeneralData(payload.filterId)
        })

        this.eventHandler.registerHandler('query-crafting-data', (payload) => {
            this.sendCraftingData(payload);
        })

        this.eventHandler.registerHandler('query-crafting-details', (payload) => {
            this.sendCraftingDetails(payload.id)
        })

        this.eventHandler.registerHandler('set-crafting-level', (payload) => {
            this.setCraftingEffort(payload);
            this.sendCraftingData(payload);
        })

        this.eventHandler.registerHandler('query-running-craft-for-list', (payload) => {
            const tagToCat = {
                'crafting': 'material',
                alchemy: 'alchemy'
            }
            const hypotheticValues = [];
            if(this.craftingSlots) {
                const rrs = (payload.category === 'crafting') ? gameResources.getResource('crafting_slots') : gameResources.getResource('alchemy_slots');
                for(const id in this.craftingSlots) {
                    const ent = gameEntity.getEntity(id);
                    const isIgnore = payload.category && !ent.tags.includes(tagToCat[payload.category]);
                    if(!isIgnore && this.craftingSlots[id]?.effort) {
                        hypotheticValues.push({
                            id,
                            name: ent.name,
                            effort: this.craftingSlots[id]?.effort
                        })
                    }
                }
            }

            this.eventHandler.sendData('running-craft-for-list', hypotheticValues);

        })
    }

    initialize() {


        registerCraftingRecipes()
    }

    tick(game, delta) {
        this.lists.tick(game, delta);
    }

    save() {
        return {
            slots: this.craftingSlots,
            craftingLists: this.lists.save(),
            version: this.currentVersion
        }
    }

    load(obj) {
        if(this.craftingSlots) {
            this.craftingSlots = {};
        }

        // dont load deprecated crafting version
        if(!obj?.version || obj?.version < this.currentVersion) {
            return;
        }
        this.craftingSlots = obj?.slots || {};
        if(Array.isArray(this.craftingSlots)) {
            this.craftingSlots = {};
        }

        for(const id in this.craftingSlots) {
            this.setCraftingEffort({ id, effort: this.craftingSlots[id].effort, isForce: true });
        }
        if(obj?.craftingLists) {
            this.lists.load(obj.craftingLists);
        }
    }

    stopAllCrafting(category) {
        const tagToCat = {
            'crafting': 'material',
            alchemy: 'alchemy'
        }
        if(this.craftingSlots) {
            for(const id in this.craftingSlots) {
                const isIgnore = category && !gameEntity.getEntity(id).tags.includes(tagToCat[category]);
                if(!isIgnore) {
                    this.setCraftingEffort({ id, effort: 0, isForce: true, filterId: category });
                }
            }
        }
    }

    setCraftingEffort({ id, effort, isForce = false, filterId }) {
        if(!this.craftingSlots[id]) {
            this.craftingSlots[id] = {
                effort: 0,
                filterId,
            }
        }
        if(effort < 0) {
            effort = 0;
        }

        if(effort > 1) {
            effort = 1;
        }

        this.craftingSlots[id].effort = effort;

        const catToTag = tags => {
            if(tags.includes('material')) return 'crafting';
            if(tags.includes('alchemy')) return 'alchemy';
            throw new Error('Invalid crafting')
        }

        if(!this.craftingSlots[id].filterId) {
            this.craftingSlots[id].filterId = catToTag(gameEntity.getEntity(id).tags);
        }

        if(!isForce) {
            this.recalculateRemaining(id, filterId, 1 - effort)
        }

        if(effort === 0 && gameEntity.entityExists(`activeCrafting_${id}`)) {
            gameEntity.unsetEntity(`activeCrafting_${id}`)
        }
        if(effort > 0) {
            if(!gameEntity.entityExists(`activeCrafting_${id}`)) {
                gameEntity.registerGameEntity(`activeCrafting_${id}`, {
                    copyFromId: id,
                    level: 1,
                    allowedImpacts: ['resources'],
                    tags: ['running', 'runningCrafting']
                })
            }
        }

        this.applyCraftingIntensities();

    }

    recalculateRemaining(skipId, category) {
        const tagToCat = {
            'crafting': 'material',
            alchemy: 'alchemy'
        }

        const skippedEffort = this.craftingSlots[skipId]?.effort ?? 0;
        const remainingToRedistribute = 1 - skippedEffort;
        const currentRecipes = Object.entries(this.craftingSlots).filter(([key, one]) => gameEntity.getEntity(key).tags.includes(tagToCat[category]));
        const currentEffortsTotal = currentRecipes.reduce((acc, [key, recipe]) => acc += ((key !== skipId) ? recipe.effort : 0), 0);
        const mult = currentEffortsTotal ? remainingToRedistribute/currentEffortsTotal : 1;
        if(Math.abs(mult - 1) > SMALL_NUMBER ) {
            if(this.craftingSlots) {
                for(const id in this.craftingSlots) {
                    const isIgnore = category && !gameEntity.getEntity(id).tags.includes(tagToCat[category]);
                    if(!isIgnore && skipId !== id) {
                        this.craftingSlots[id].effort *= mult;
                    }
                }
            }
        }
    }

    applyCraftingIntensities() {

        const resourceModifier = {
            get_income: () => {

                const intensities = {}
                for(const key in this.craftingSlots) {
                    intensities[`effort_${key}`] = {
                        A: 0,
                        B: this.craftingSlots[key].effort,
                        type: 0,
                    }
                }

                return {
                    effects: intensities,
                }
            },
            effectDeps: ['crafting_effort', 'alchemy_effort']
        }
        if(gameEntity.entityExists('crafting_intensities')) {
            gameEntity.unsetEntity('crafting_intensities');
        }
        gameEntity.registerGameEntity('crafting_intensities', {
            name: 'Crafting Intensities',
            level: 1,
            resourceModifier,
        })

        gameEntity.setEntityLevel('crafting_intensities', 1, true);
    }

    regenerateNotifications() {

        this.filters.forEach(filter => {
            const entities = gameEntity.listEntitiesByTags(['recipe', ...filter.tags]);

            entities.forEach(item => {
                gameCore.getModule('unlock-notifications').registerNewNotification(
                    'workshop',
                    filter.id,
                    'all',
                    `crafting_${item.id}`,
                    item.isUnlocked && !item.isCapped
                )
            })
        })
    }

    getCraftingData(payload) {
        if(!payload?.filterId) {
            throw new Error(`FilterId is required`);
        }

        const filterId = payload?.filterId;

        const filter = this.filters.find(o => o.id === filterId);

        if(!filter) {
            throw new Error(`${filterId} not found`);
        }

        const entities = gameEntity.listEntitiesByTags(['recipe', ...filter.tags]).filter(one => one.isUnlocked);

        const efrs = filterId === 'crafting' ? gameEffects.getEffect('crafting_effort') : gameEffects.getEffect('alchemy_effort');

        const eff_key =  filterId === 'crafting' ? 'crafting_effort' : 'alchemy_effort';

        const available = entities.map(recipe => ({
            ...recipe,
            icon_id: recipe.resourceId,
            effort: this.craftingSlots[recipe.id]?.effort || 0,
            resourceAmount: gameResources.getResource(recipe.resourceId)?.amount,
            resourceBalance: gameResources.getResource(recipe.resourceId)?.balance,
            breakDown: gameResources.getResource(recipe.resourceId)?.breakDown,
            isRunning: gameEntity.entityExists(`activeCrafting_${recipe.id}`),
            isLowerEfficiency: gameEntity.entityExists(`activeCrafting_${recipe.id}`) && gameEntity.getEntity(`activeCrafting_${recipe.id}`).modifier?.efficiency < 1 - SMALL_NUMBER
        }));

        return {
            available,
            efforts: {
                ...efrs,
                usingRecipes: available.filter(one => one.effort > 0).map(({ id, name, effort }) => ({ id, name, effort })),
            },
            craftingLists: this.lists.getLists({ category: filterId })
        }
    }

    getCraftingDetails(id) {
        const entity = gameEntity.getEntity(id);

        const isRunning = gameEntity.entityExists(`activeCrafting_${id}`);

        let actualEntity = entity;

        let efficiency = 1;
        let bottleNeck = null;

        if(isRunning) {
            actualEntity = gameEntity.getEntity(`activeCrafting_${id}`);
            efficiency = actualEntity.modifier?.efficiency ?? 1;
            bottleNeck = actualEntity.modifier?.bottleNeck ? gameResources.getResource(actualEntity.modifier?.bottleNeck) : null;
        }

        const calculatedEffort = this.craftingSlots[entity.id]?.effort ? this.craftingSlots[entity.id]?.effort : 1;

        return {
            ...entity,
            efficiency,
            bottleNeck,
            effects: isRunning
                ? gameEntity.getEffects(`activeCrafting_${id}`, 0, this.craftingSlots[entity.id]?.level || 1, false, 1)
                : gameEntity.getEffects(entity.id, 0, 1, true, 1, 1,  calculatedEffort),
            affordable: gameEntity.getAffordable(entity.id),
            level: this.craftingSlots[entity.id]?.level || 0,
            maxLevel: gameResources.getResource('crafting_slots').amount + (this.craftingSlots[entity.id]?.level || 0)
        }
    }

    sendCraftingData(payload) {
        const data = this.getCraftingData(payload);
        this.eventHandler.sendData(`crafting-data-${payload.filterId}`, data)
    }

    sendCraftingDetails(payload) {
        const data = this.getCraftingDetails(payload);
        this.eventHandler.sendData(`crafting-details`, data)
    }


    sendGeneralData(category_id) {
        const rs = category_id === 'crafting' ? 'crafting_ability' : 'alchemy_ability';
        const sl = category_id === 'crafting' ? 'crafting_slots' : 'alchemy_slots';
        let stats = {}
        if(category_id === 'crafting') {
            stats = {
                crafting_efficiency: {...gameEffects.getEffect('crafting_efficiency'), isMultiplier: true},
                crafting_materials_discount: {...gameEffects.getEffect('crafting_materials_discount'), isMultiplier: true},
            }
        }
        if(category_id === 'alchemy') {
            stats = {
                alchemy_efficiency: {...gameEffects.getEffect('alchemy_efficiency'), isMultiplier: true},
                alchemy_materials_discount: {...gameEffects.getEffect('alchemy_materials_discount'), isMultiplier: true},
            }
        }
        const data = {
            isProducingEffort: gameResources.getResource(rs).income > SMALL_NUMBER,
            hasSlots: gameResources.getResource(sl).income > SMALL_NUMBER,
            stats
        }
        this.eventHandler.sendData('crafting-general-data', data);
    }

}