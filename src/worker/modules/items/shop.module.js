import { gameEntity, gameResources, resourceCalculators, resourceApi, gameEffects } from "game-framework"
import {GameModule} from "../../shared/game-module";
import {registerShopItemsStage1} from "./shop-db";

export class ShopModule extends GameModule {

    constructor() {
        super();
        this.purchasedItems = {};
        this.isUnlocked = false;
        this.leveledId = null;
        this.purchaseMultiplier = 1;
        this.eventHandler.registerHandler('set-purchase-multiplier', (payload) => {
            this.setPurchaseMultiplier(payload.amount);
        })
        this.eventHandler.registerHandler('purchase-item', (payload) => {
            this.purchaseItem(payload.id);
        })
        this.eventHandler.registerHandler('purchase-resource', (payload) => {
            this.purchaseResource(payload.id, payload.amount);
        })
        this.eventHandler.registerHandler('query-items-data', (payload) => {
            this.sendItemsData()
        })

        this.eventHandler.registerHandler('query-item-details', (payload) => {
            this.sendItemDetails(payload.id)
        })

        this.eventHandler.registerHandler('query-items-resources-data', (payload) => {
            this.sendPurchaseableItemsData();
        })

        this.eventHandler.registerHandler('query-item-resource-details', (payload) => {
            this.sendPurchaseableItemDetails(payload.id);
        })
    }

    initialize() {

        gameEffects.registerEffect('shop_max_stock', {
            name: 'Shop Max Stock',
            defaultValue: 100,
            minValue: 100
        })

        gameEffects.registerEffect('shop_stock_renew_rate', {
            name: 'Stock Renew Rate',
            defaultValue: 1,
            minValue: 1
        })

        registerShopItemsStage1();

    }

    tick(game, delta) {
        if(!this.isUnlocked && gameResources.getResource('coins').amount >= 2) {
            this.isUnlocked = true;
        }
        this.leveledId = null;
    }

    save() {
        return {
            items: this.purchasedItems,
            isUnlocked: this.isUnlocked,
            purchaseMultiplier: this.purchaseMultiplier,
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
        this.purchaseMultiplier = saveObject?.purchaseMultiplier || 1;
        this.sendItemsData();
    }

    reset() {
        this.load({});
    }

    setItem(itemId, amount, bForce = false) {
        gameEntity.setEntityLevel(itemId, amount, bForce);
        this.purchasedItems[itemId] = gameEntity.getLevel(itemId);
    }

    setPurchaseMultiplier(amount) {
        this.purchaseMultiplier = Math.max(1, amount);
        console.log('Set to: ', this.purchaseMultiplier);
        this.sendPurchaseableItemsData();
    }

    purchaseItem(itemId) {
        const newEnt = gameEntity.levelUpEntity(itemId);
        console.log('Purchase: ', newEnt)
        if(newEnt.success) {
            this.purchasedItems[itemId] = gameEntity.getLevel(itemId);
            this.leveledId = itemId;
            this.sendItemsData();
        }
        return newEnt.success;
    }

    purchaseResource(itemId, amount = 1) {
        const res = gameResources.getResource(itemId);

        const cost = res.get_cost();

        const aff = resourceCalculators.isAffordable(cost);

        console.log('Affb: ', aff);
        amount = Math.min(amount, aff.max);

        if(aff.isAffordable) {
            for(const key in cost) {
                gameResources.addResource(key, -cost[key]*amount);
            }
            gameResources.addResource(itemId, amount);

            this.leveledId = itemId;

            this.sendPurchaseableItemsData();
        }
    }

    getItemsData() {
        const entities = gameEntity.listEntitiesByTags(['shop']);
        return {
            available: entities.filter(one => one.isUnlocked && !one.isCapped).map(entity => ({
                id: entity.id,
                name: entity.name,
                description: entity.description,
                max: gameEntity.getEntityMaxLevel(entity.id),
                level: this.purchasedItems[entity.id] || 0,
                affordable: gameEntity.getAffordable(entity.id),
                potentialEffects: gameEntity.getEffects(entity.id, 1),
                isLeveled: this.leveledId === entity.id
            })),
            purchaseMultiplier: this.purchaseMultiplier,
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
        this.eventHandler.sendData('item-details', data);
    }

    getPurchaseableItemsData() {
        const items = gameResources.listResourcesByTags(['inventory']);
        // console.log('items: ', items);
        const presentItems = items.filter(item => item.isUnlocked && item.get_cost);

        return {
            available: presentItems.map(resource => {
                const affordable = resourceCalculators.isAffordable(resource.get_cost());
                return {
                ...resource,
                    affordable,
                    isLeveled: this.leveledId === resource.id,
                    purchaseMultiplier: Math.min(this.purchaseMultiplier, affordable.max)
                }
            }),
            purchaseMultiplier: this.purchaseMultiplier,
        }
    }

    sendPurchaseableItemsData() {
        const data = this.getPurchaseableItemsData();
        this.eventHandler.sendData('items-resources-data', data);
    }

    getPurchaseableItemDetails(id) {
        if(!id) return null;
        const entity = gameResources.getResource(id);
        const affordable = resourceCalculators.isAffordable(entity.get_cost());
        const potPurchase = Math.min(this.purchaseMultiplier, affordable.max);

        return {
            id: entity.id,
            name: entity.name,
            description: entity.description,
            max: entity.max,
            level: this.purchasedItems[entity.id] || 0,
            affordable: resourceCalculators.isAffordable(entity.get_cost(potPurchase)),
            potentialEffects: resourceApi.unpackEffects(entity.usageGain, 1),
            tags: entity.tags,
            purchaseMultiplier: potPurchase,
        }
    }

    sendPurchaseableItemDetails(id) {
        const data = this.getPurchaseableItemDetails(id);
        this.eventHandler.sendData('item-details', data);
    }

}