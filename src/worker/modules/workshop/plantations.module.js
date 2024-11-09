import { gameEntity, gameResources, resourceCalculators, resourceApi, gameEffects } from "game-framework"
import {GameModule} from "../../shared/game-module";
import {registerPlantations} from "./plantation-db";

export class PlantationsModule extends GameModule {

    constructor() {
        super();
        this.purchasedItems = {};
        this.isUnlocked = false;
        this.leveledId = null;

        this.eventHandler.registerHandler('purchase-plantation', (payload) => {
            this.purchaseItem(payload.id);
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

        gameEffects.registerEffect('plantations_efficiency', {
            name: 'Plantations Efficiency',
            defaultValue: 1,
            minValue: 1
        })


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
            this.setItem(key, 0, true);
        }
        this.purchasedItems = {};
        if(saveObject?.items) {
            for(const id in saveObject.items) {
                this.setItem(id, saveObject.items[id], true);
            }
        }
        this.sendItemsData();
    }

    reset() {
        this.load({});
    }

    setItem(itemId, amount, bForce = false) {
        gameEntity.setEntityLevel(itemId, amount, bForce);
        this.purchasedItems[itemId] = gameEntity.getLevel(itemId);
    }

    purchaseItem(itemId) {
        const newEnt = gameEntity.levelUpEntity(itemId);
        if(newEnt.success) {
            this.purchasedItems[itemId] = gameEntity.getLevel(itemId);
            this.leveledId = itemId;
            this.sendItemsData();
        }
        return newEnt.success;
    }

    removeItem(itemId) {
        this.setItem(itemId, 0, true);
    }

    getItemsData() {
        const entities = gameEntity.listEntitiesByTags(['plantation']);
        const rrs = gameResources.getResource('plantation_slots');

        // console.log('RSS:', rrs);

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
                level: this.purchasedItems[entity.id] || 0,
                affordable: gameEntity.getAffordable(entity.id),
                potentialEffects: gameEntity.getEffects(entity.id, 1),
                isLeveled: this.leveledId === entity.id
            })),
            slots,
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
            level: this.purchasedItems[entity.id] || 0,
            affordable: gameEntity.getAffordable(entity.id),
            potentialEffects: gameEntity.getEffects(entity.id, 1),
            currentEffects: gameEntity.getEffects(entity.id),
            tags: entity.tags,
            purchaseMultiplier: 1,
        }
    }

    sendItemDetails(id) {
        const data = this.getItemDetails(id);
        this.eventHandler.sendData('plantation-details', data);
    }

}