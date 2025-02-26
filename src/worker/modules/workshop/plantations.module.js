import {gameEntity, gameResources, resourceCalculators, resourceApi, gameEffects, gameCore} from "game-framework"
import {GameModule} from "../../shared/game-module";
import {getWateringEffectId, registerPlantations} from "./plantation-db";

export class PlantationsModule extends GameModule {

    constructor() {
        super();
        this.purchasedItems = {};
        this.isUnlocked = false;
        this.leveledId = null;

        this.eventHandler.registerHandler('purchase-plantation', (payload) => {
            this.purchaseItem(payload.id);
        })

        this.eventHandler.registerHandler('set-plantation-watering', (payload) => {
            this.setWateringLevel(payload.id, payload.level);
        })

        this.eventHandler.registerHandler('remove-plantation', (payload) => {
            this.removeItem(payload.id);
        })

        this.eventHandler.registerHandler('query-plantation-data', (payload) => {
            this.sendItemsData()
        })

        this.eventHandler.registerHandler('query-plantation-details', (payload) => {
            this.sendItemDetails(payload.id)
        })

    }

    initialize() {


        registerPlantations();

    }

    tick(game, delta) {
        this.leveledId = null;
    }

    save() {
        return {
            items: this.purchasedItems,
        }
    }

    load(saveObject) {
        for(const key in this.purchasedItems) {
            if(!(typeof this.purchasedItems[key] === 'object')) {
                this.purchasedItems[key] = {
                    level: this.purchasedItems[key],
                    wateringLevel: 0,
                }
            }
            console.log(`Set Init ${key} to: `, this.purchasedItems);
            this.setItem(key, 0, true);
        }
        this.purchasedItems = {};
        if(saveObject?.items) {
            for(const id in saveObject.items) {
                if(!(typeof saveObject.items[id] === 'object')) {
                    saveObject.items[id] = {
                        level: saveObject.items[id] ?? 0,
                        wateringLevel: 0,
                    }
                }
                console.log(`Set Load ${id} to: `, this.purchasedItems);
                this.setItem(id, saveObject.items[id]?.level ?? saveObject.items[id], true);
                if(saveObject.items[id].wateringLevel) {
                    this.setWateringLevel(id, saveObject.items[id].wateringLevel);
                }
            }
        }
        this.sendItemsData();
    }

    reset() {
        this.load({});
    }

    setItem(itemId, amount, bForce = false) {
        gameEntity.setEntityLevel(itemId, amount, bForce);
        if(!this.purchasedItems[itemId]) {
            this.purchasedItems[itemId] = {
                level: 0,
                wateringLevel: 0,
            }
        }
        this.purchasedItems[itemId].level = gameEntity.getLevel(itemId);
    }

    setWateringLevel(id, level) {
        let rLevel = Math.max(0, Math.min(Math.floor(level), gameEffects.getEffectValue('plantations_max_watering')));
        gameEntity.setEntityLevel(`${id}_watering_bonus`, rLevel, true);
        this.purchasedItems[id].wateringLevel = gameEntity.getLevel(`${id}_watering_bonus`);
    }

    purchaseItem(itemId) {
        const newEnt = gameEntity.levelUpEntity(itemId);
        if(newEnt.success) {
            if(!this.purchasedItems[itemId]) {
                this.purchasedItems[itemId] = {
                    level: 0,
                }
            }
            this.purchasedItems[itemId].level = gameEntity.getLevel(itemId);
            this.leveledId = itemId;
            this.sendItemsData();
        }
        return newEnt.success;
    }

    removeItem(itemId) {
        console.log(`Set Remove ${itemId} to: `, this.purchasedItems);
        this.setItem(itemId, 0, true);
    }

    regenerateNotifications() {


        const entities = gameEntity.listEntitiesByTags(['plantation']);

        entities.forEach(item => {
            gameCore.getModule('unlock-notifications').registerNewNotification(
                'workshop',
                'plantations',
                'all',
                `plantation_${item.id}`,
                item.isUnlocked && !item.isCapped
            )
        })
    }

    getItemsData() {
        const entities = gameEntity.listEntitiesByTags(['plantation']);
        const rrs = gameResources.getResource('plantation_slots');

        const slots = {
            max: rrs.income,
            total: rrs.amount
        }
        return {
            available: entities.filter(one => one.isUnlocked && !one.isCapped).map(entity => ({
                id: entity.id,
                icon_id: entity.icon_id,
                name: entity.name,
                description: entity.description,
                max: gameEntity.getEntityMaxLevel(entity.id),
                level: this.purchasedItems[entity.id]?.level || 0,
                wateringLevel: this.purchasedItems[entity.id]?.wateringLevel || 0,
                affordable: gameEntity.getAffordable(entity.id),
                potentialEffects: gameEntity.getEffects(entity.id, 1),
                isLeveled: this.leveledId === entity.id,
                wateringMult: gameEffects.getEffectValue(getWateringEffectId(entity.id)),
                resourceAmount: gameResources.getResource(gameEntity.getAttribute(entity.id, 'inventoryResource'))?.amount,
                resourceBalance: gameResources.getResource(gameEntity.getAttribute(entity.id, 'inventoryResource'))?.balance,
                breakDown: gameResources.getResource(gameEntity.getAttribute(entity.id, 'inventoryResource'))?.breakDown,
            })),
            slots,
            isWateringUnlocked: gameResources.isResourceUnlocked('inventory_water'),
            maxWatering: gameEffects.getEffect('plantations_max_watering'),
            waterResource: gameResources.getResource('inventory_water')
        }
    }

    sendItemsData() {
        const data = this.getItemsData();
        this.eventHandler.sendData('plantations-data', data);
    }

    getItemDetails(id) {
        if(!id) return null;
        const entity = gameEntity.getEntity(id);
        return {
            id: entity.id,
            name: entity.name,
            description: entity.description,
            max: gameEntity.getEntityMaxLevel(entity.id),
            level: this.purchasedItems[entity.id]?.level || 0,
            wateringLevel: this.purchasedItems[entity.id]?.wateringLevel || 0,
            affordable: gameEntity.getAffordable(entity.id),
            potentialEffects: gameEntity.getEffects(entity.id, 1),
            currentEffects: gameEntity.getEffects(entity.id),
            tags: entity.tags,
            purchaseMultiplier: 1,
            wateringMult: gameEffects.getEffectValue(getWateringEffectId(entity.id)),
            isWateringUnlocked: gameResources.isResourceUnlocked('inventory_water'),
            maxWatering: gameEffects.getEffect('plantations_max_watering'),
            waterResource: gameResources.getResource('inventory_water'),
            wateringEffects: gameEntity.getEffects(`${id}_watering_bonus`),
            nextWateringEffects: gameEntity.getEffects(`${id}_watering_bonus`, 1)
        }
    }

    sendItemDetails(id) {
        const data = this.getItemDetails(id);
        this.eventHandler.sendData('plantation-details', data);
    }

}