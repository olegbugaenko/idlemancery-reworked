import {gameEntity, gameResources, resourceCalculators, resourceApi, gameEffects, gameCore} from "game-framework"
import {GameModule} from "../../shared/game-module";
import {charismaMod, registerShopItemsStage1} from "./shop-db";
import {sellPriceMod} from "../inventory/inventory-items-db";
import {SMALL_NUMBER} from "game-framework/src/utils/consts";

export class ShopModule extends GameModule {

    constructor() {
        super();
        this.purchasedItems = {};
        this.isUnlocked = false;
        this.leveledId = null;
        this.purchaseMultiplier = 1;
        this.autoPurchase = {};
        this.autoPurchaseCd = 0;
        this.showMaxed = false;
        this.eventHandler.registerHandler('set-shop-autopurchase', ({ id, flag }) => {
            const entities = gameEntity.listEntitiesByTags(['shop']).filter(one => one.isUnlocked && !one.isCapped);
            entities.forEach(e => {
                if(!id || id === e.id) {
                    this.autoPurchase[e.id] = flag;
                }
            })
            this.sendItemsData();
        })
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

        this.eventHandler.registerHandler('query-general-shop-stats', (payload) => {
            this.sendGeneralShopStats(payload)
        })

        this.eventHandler.registerHandler('set-shop-show-maxed', ({ flag }) => {
            this.showMaxed = flag;
            this.sendItemsData();
        })
    }

    initialize() {


        registerShopItemsStage1();

    }

    tick(game, delta) {
        if(!this.isUnlocked && gameResources.getResource('coins').amount >= 2) {
            this.isUnlocked = true;
        }
        this.leveledId = null;
        if(gameEntity.getLevel('shop_item_purchase_manager') > 0) {
            if(!this.autoPurchaseCd) {
                this.autoPurchaseCd = 10;
            }
            this.autoPurchaseCd -= delta;
            if(this.autoPurchaseCd <= 0) {
                this.autoPurchaseCd = 10;
                for(const key in this.autoPurchase) {
                    if(this.autoPurchase[key]) {
                        if(!gameEntity.isEntityUnlocked(key)) {
                            this.autoPurchase[key] = false;
                            continue;
                        }
                        if(gameEntity.isCapped(key)) {
                            this.autoPurchase[key] = false;
                            continue;
                        }
                        const newEnt = this.purchaseItem(key);
                        console.log('Purchase Auto: ', key, newEnt)
                        if(newEnt.success) {
                            return;
                        }
                    }
                }
            }
        }
    }

    save() {
        return {
            items: this.purchasedItems,
            isUnlocked: this.isUnlocked,
            purchaseMultiplier: this.purchaseMultiplier,
            autoPurchase: this.autoPurchase,
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
        this.autoPurchase = saveObject?.autoPurchase || {};
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
        console.log('Purchase: ', itemId, newEnt)
        if(newEnt.success) {
            this.purchasedItems[itemId] = gameEntity.getLevel(itemId);
            this.leveledId = itemId;
            gameCore.getModule('unlock-notifications').generateNotifications();
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

    regenerateNotifications() {
        // NOW - check for actions if they have any new notifications
        const entities = gameEntity.listEntitiesByTags(['shop']);

        entities.forEach(entity => {
            gameCore.getModule('unlock-notifications').registerNewNotification(
                'shop',
                'upgrades',
                'all',
                `shop_${entity.id}`,
                entity.isUnlocked && !entity.isCapped
            )
        })

        const items = gameResources.listResourcesByTags(['inventory']);
        const presentItems = items.filter(item => item.isUnlocked && item.get_cost);

        presentItems.forEach(entity => {
            gameCore.getModule('unlock-notifications').registerNewNotification(
                'shop',
                'inventory',
                'all',
                `shop_${entity.id}`,
                entity.isUnlocked
            )
        })

    }

    sendGeneralShopStats(payload) {
        const stats = [];
        if(Math.abs(gameEffects.getEffectValue('prices_discount') - 1) > SMALL_NUMBER) {
            stats.push(gameEffects.getEffect('prices_discount'));
        }
        if(Math.abs(charismaMod(gameEffects.getEffectValue('attribute_charisma')) - 1) > SMALL_NUMBER) {
            stats.push({
                name: 'Charisma Price Discount',
                value: charismaMod(gameEffects.getEffectValue('attribute_charisma'))
            })
        }

        this.eventHandler.sendData('general-shop-stats', { stats })
    }

    getItemsData() {
        const entities = gameEntity.listEntitiesByTags(['shop']);
        return {
            available: entities.filter(one => one.isUnlocked && (!one.isCapped || this.showMaxed)).map(entity => ({
                id: entity.id,
                name: entity.name,
                description: entity.description,
                max: gameEntity.getEntityMaxLevel(entity.id),
                level: this.purchasedItems[entity.id] || 0,
                affordable: gameEntity.getAffordable(entity.id),
                potentialEffects: gameEntity.getEffects(entity.id, 1),
                isLeveled: this.leveledId === entity.id,
                isAutoPurchase: this.autoPurchase[entity.id] ?? false,
                isCapped: entity.isCapped,
            })),
            purchaseMultiplier: this.purchaseMultiplier,
            isAutomationUnlocked: gameEntity.getLevel('shop_item_purchase_manager') > 0,
            showMaxed: this.showMaxed,
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
                    purchaseMultiplier: Math.max(1, Math.min(this.purchaseMultiplier, affordable.max)),
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
        const potPurchase = Math.max(1, Math.min(this.purchaseMultiplier, affordable.max));

        return {
            id: entity.id,
            name: entity.name,
            description: entity.description,
            max: entity.max,
            level: this.purchasedItems[entity.id] || 0,
            affordable: resourceCalculators.isAffordable(entity.get_cost(potPurchase)),
            potentialEffects: resourceApi.unpackEffects(entity.usageGain || {}, 1),
            tags: entity.tags,
            purchaseMultiplier: potPurchase,
        }
    }

    sendPurchaseableItemDetails(id) {
        const data = this.getPurchaseableItemDetails(id);
        this.eventHandler.sendData('item-details', data);
    }

}