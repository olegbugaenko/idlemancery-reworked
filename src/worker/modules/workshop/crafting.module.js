import {GameModule} from "../../shared/game-module";
import {registerCraftingRecipes} from "./recipes-db";
import {gameCore, gameEffects, gameEntity, gameResources, resourceCalculators} from "game-framework";
import {CraftingListsSubmodule} from "./crafting-lists.submodule";
import {SMALL_NUMBER} from "game-framework/src/utils/consts";

export class CraftingModule extends GameModule {

    constructor(props) {
        super(props);

        this.lists = new CraftingListsSubmodule();

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
            this.setCraftingLevel(payload);
            this.sendCraftingData(payload);
        })
    }

    initialize() {


        registerCraftingRecipes()
    }

    tick(game, delta) {
        this.lists.tick(game, delta);
        /*if(gameEntity.entityExists('activeCrafting_craft_herbal_fibers')) {
            console.log('DT: ',
                gameEntity.getEntity('activeCrafting_craft_herbal_fibers'),
                gameResources.getResource('inventory_ginseng')
            )
        }*/
    }

    save() {
        return {
            slots: this.craftingSlots,
            craftingLists: this.lists.save(),
        }
    }

    load(obj) {
        if(this.craftingSlots) {
            for(const id in this.craftingSlots) {
                this.setCraftingLevel({ id, level: 0, isForce: true });
            }
        }
        this.craftingSlots = obj?.slots || {};
        if(Array.isArray(this.craftingSlots)) {
            this.craftingSlots = {};
        }
        for(const id in this.craftingSlots) {
            this.setCraftingLevel({ id, level: this.craftingSlots[id].level, isForce: true });
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
                console.log('Stop Craft: ', category, id, isIgnore, gameEntity.getEntity(id).tags)
                if(!isIgnore) {
                    this.setCraftingLevel({ id, level: 0, isForce: true });
                }
            }
        }
    }

    setCraftingLevel({ id, level, isForce = false, filterId }) {
        if(!this.craftingSlots[id]) {
            this.craftingSlots[id] = {
                level: 0
            }
        }
        if(level < 0) {
            level = 0;
        }

        if(!isForce) {
            const rrs = filterId === 'crafting' ? gameResources.getResource('crafting_slots') : gameResources.getResource('alchemy_slots')
            const max = this.craftingSlots[id].level + rrs.amount;
            if(level > max) {
                level = Math.floor(max);
            }
        }

        if(level === 0 && gameEntity.entityExists(`activeCrafting_${id}`)) {
            gameEntity.unsetEntity(`activeCrafting_${id}`)
            this.craftingSlots[id].level = 0;
        }
        if(level > 0) {
            if(!gameEntity.entityExists(`activeCrafting_${id}`)) {
                gameEntity.registerGameEntity(`activeCrafting_${id}`, {
                    copyFromId: id,
                    level,
                    allowedImpacts: ['resources'],
                    tags: ['running', 'runningCrafting']
                })
            }
            const rs = gameEntity.setEntityLevel(`activeCrafting_${id}`, level, isForce);
            console.log('Update result: ', rs);
            this.craftingSlots[id].level = gameEntity.getLevel(`activeCrafting_${id}`);
        }
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

        const rrs = filterId === 'crafting' ? gameResources.getResource('crafting_slots') : gameResources.getResource('alchemy_slots')
        const efrs = filterId === 'crafting' ? gameResources.getResource('crafting_ability') : gameResources.getResource('alchemy_ability')

        const available = entities.map(recipe => ({
            ...recipe,
            icon_id: recipe.resourceId,
            level: this.craftingSlots[recipe.id]?.level || 0,
            maxLevel: rrs.amount + (this.craftingSlots[recipe.id]?.level || 0),
            resourceAmount: gameResources.getResource(recipe.resourceId)?.amount,
            resourceBalance: gameResources.getResource(recipe.resourceId)?.balance,
            breakDown: gameResources.getResource(recipe.resourceId)?.breakDown,
            isRunning: gameEntity.entityExists(`activeCrafting_${recipe.id}`),
            isLowerEfficiency: gameEntity.entityExists(`activeCrafting_${recipe.id}`) && gameEntity.getEntity(`activeCrafting_${recipe.id}`).modifier?.efficiency < 1 - SMALL_NUMBER
        }));

        const slots = {
            max: rrs.income,
            total: rrs.amount
        }

        return {
            available,
            slots,
            efforts: efrs,
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

        return {
            ...entity,
            efficiency,
            bottleNeck,
            effects: isRunning
                ? gameEntity.getEffects(`activeCrafting_${id}`, 0, this.craftingSlots[entity.id]?.level || 1, false, 1)
                : gameEntity.getEffects(entity.id, 0, this.craftingSlots[entity.id]?.level || 1, true, 1, 1 ),
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
        // console.log('Send crafting: crafting-details', data);
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