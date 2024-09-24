import { gameEntity, gameResources } from "game-framework"
import {GameModule} from "../../shared/game-module";
import {registerShopItemsStage1} from "./shop-db";

export class ShopModule extends GameModule {

    constructor() {
        super();
        this.purchasedItems = {};
        this.isUnlocked = false;
        this.leveledId = null;
        this.eventHandler.registerHandler('purchase-item', (payload) => {
            this.purchaseItem(payload.id);
        })
        this.eventHandler.registerHandler('query-items-data', (payload) => {
            this.sendItemsData()
        })

        this.eventHandler.registerHandler('query-item-details', (payload) => {
            this.sendItemDetails(payload.id)
        })
    }

    initialize() {

        registerShopItemsStage1();

    }

    tick(game, delta) {
        if(!this.isUnlocked && gameResources.getResource('coins').amount >= 10) {
            this.isUnlocked = true;
        }
        this.leveledId = null;
    }

    save() {
        return {
            items: this.purchasedItems,
            isUnlocked: this.isUnlocked,
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
        this.isUnlocked = saveObject?.isUnlocked || false;
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

    getItemsData() {
        const entities = gameEntity.listEntitiesByTags(['shop']);
        return {
            available: entities.filter(one => one.isUnlocked && !one.isCapped).map(entity => ({
                id: entity.id,
                name: entity.name,
                description: entity.description,
                max: entity.maxLevel || entity.getMaxLevel() || 0,
                level: this.purchasedItems[entity.id] || 0,
                affordable: gameEntity.getAffordable(entity.id),
                potentialEffects: gameEntity.getEffects(entity.id, 1),
                isLeveled: this.leveledId === entity.id
            }))
        }
    }

    sendItemsData() {
        const data = this.getItemsData();
        this.eventHandler.sendData('items-data', data);
    }

    getItemDetails(id) {
        if(!id) return null;
        const entity = gameEntity.getEntity(id);
        return {
            id: entity.id,
            name: entity.name,
            description: entity.description,
            max: entity.maxLevel || entity.getMaxLevel() || 0,
            level: this.purchasedItems[entity.id] || 0,
            affordable: gameEntity.getAffordable(entity.id),
            potentialEffects: gameEntity.getEffects(entity.id, 1),
            tags: entity.tags
        }
    }

    sendItemDetails(id) {
        const data = this.getItemDetails(id);
        this.eventHandler.sendData('item-details', data);
    }

}