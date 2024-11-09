import {GameModule} from "../../shared/game-module";
import {registerCraftingRecipes} from "./recipes-db";
import {gameEntity, gameResources} from "game-framework";

export class CraftingModule extends GameModule {

    constructor(props) {
        super(props);

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

    tick() {
        /*if(gameEntity.entityExists('activeCrafting_craft_herbal_fibers')) {
            console.log('DT: ',
                gameEntity.getEntity('activeCrafting_craft_herbal_fibers'),
                gameResources.getResource('inventory_ginseng')
            )
        }*/
    }

    save() {
        return {
            slots: this.craftingSlots
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

    }

    setCraftingLevel({ id, level, isForce = false }) {
        if(!this.craftingSlots[id]) {
            this.craftingSlots[id] = {
                level: 0
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
            maxLevel: rrs.amount + (this.craftingSlots[recipe.id]?.level || 0)
        }));

        const slots = {
            max: rrs.income,
            total: rrs.amount
        }

        return {
            available,
            slots,
            efforts: efrs
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

}