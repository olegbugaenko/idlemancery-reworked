import {gameEntity, gameResources, resourceCalculators, resourceApi, gameEffects, gameCore} from "game-framework"
import {GameModule} from "../../shared/game-module";
import {charismaMod, registerShopItemsStage1} from "./shop-db";
import {sellPriceMod} from "../inventory/inventory-items-db";
import {SMALL_NUMBER} from "game-framework/src/utils/consts";
import {checkMatchingRules} from "../../shared/utils/rule-utils";

export class ShopModule extends GameModule {

    constructor() {
        super();
        this.purchasedItems = {};
        this.isUnlocked = false;
        this.leveledId = null;
        this.purchaseMultiplier = 1;
        this.autoPurchase = {};
        this.autoPurchaseCd = 0;
        this.sellStocks = {};
        this.showMaxed = false;
        this.stockRenewTimer = 0;
        this.shopItemSettings = {};
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
            this.sendPurchaseableItemsData(payload);
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

        this.eventHandler.registerHandler('save-shop-resource-settings', payload => {
            this.saveSettings(payload)
        })
    }

    initialize() {


        registerShopItemsStage1();

    }

    saveSettings(payload) {
        if(payload.id) {
            this.shopItemSettings[payload.id] = {
                ...this.shopItemSettings[payload.id],
                autopurchase: payload.autopurchase,
            }
        }
    }

    tick(game, delta) {
        if(!this.isUnlocked && gameResources.getResource('coins').amount >= 2) {
            this.isUnlocked = true;
        }
        this.stockRenewTimer += delta;
        if(this.stockRenewTimer >= 1) {
            this.stockRenewTimer = 0;

            const items = gameResources.listResourcesByTags(['inventory']);
            const presentItems = items.filter(item => item.isUnlocked && item.get_cost);

            presentItems.forEach(one => {
                const purchaseRenewRate = one.purchaseRenewRate ?? 1;
                if(!(one.id in this.sellStocks)) {
                    this.sellStocks[one.id] = 1000*purchaseRenewRate;
                }
                if(this.sellStocks[one.id] < 1000*purchaseRenewRate) {
                    this.sellStocks[one.id] += 2*purchaseRenewRate;
                }

                if(this.shopItemSettings[one.id]?.autopurchase?.isEnabled) {
                    // check if matching rules
                    const isMatchingPurchase = checkMatchingRules(this.shopItemSettings[one.id]?.autopurchase?.rules, this.shopItemSettings[one.id]?.autopurchase?.pattern);

                    if(isMatchingPurchase) {
                        let amount = 1;
                        const reserved = this.shopItemSettings[one.id]?.autopurchase?.reserved || 0;
                        const purchaseMult = this.shopItemSettings[one.id]?.autopurchase?.purchaseMultiplier || 1.e+8;
                        const reserveLimit = Math.floor(
                            Math.max(0, gameResources.getResource('coins').amount - reserved)
                        );

                        amount = Math.min(this.sellStocks[one.id] ?? 0, reserveLimit, purchaseMult);

                        // console.log(`Consume ${one.id}: `, amount, reserved, this.sellStocks[one.id]);
                        if(amount >= 1) {
                            this.purchaseResource(one.id, amount);
                        }

                    }
                }
            })
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
                        // console.log('Purchase Auto: ', key, newEnt)
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
            sellStocks: this.sellStocks,
            shopItemSettings: this.shopItemSettings,
        }
    }

    load(saveObject) {
        for(const key in this.purchasedItems) {
            this.setItem(key, 0, true);
        }
        this.purchasedItems = {};
        this.shopItemSettings = {};
        if(saveObject?.items) {
            for(const id in saveObject.items) {
                if(gameEntity.entityExists(id)) {
                    this.setItem(id, saveObject.items[id], true);
                }
            }
        }
        if(saveObject?.shopItemSettings) {
            this.shopItemSettings = saveObject?.shopItemSettings;
        }
        this.isUnlocked = saveObject?.isUnlocked || false;
        this.purchaseMultiplier = saveObject?.purchaseMultiplier || 1;
        this.autoPurchase = saveObject?.autoPurchase || {};
        this.sellStocks = saveObject?.sellStocks || {};
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
        // console.log('Set to: ', this.purchaseMultiplier);
        this.sendPurchaseableItemsData();
    }

    purchaseItem(itemId) {
        const newEnt = gameEntity.levelUpEntity(itemId);
        // console.log('Purchase: ', itemId, newEnt)
        if(newEnt.success) {
            this.purchasedItems[itemId] = gameEntity.getLevel(itemId);
            this.leveledId = itemId;
            gameCore.getModule('unlock-notifications').generateNotifications();
            this.sendItemsData();
            this.eventHandler.playSound('purchase');
        }
        return newEnt.success;
    }

    purchaseResource(itemId, amount = 1) {
        const res = gameResources.getResource(itemId);

        const cost = res.get_cost();

        const aff = resourceCalculators.isAffordable(cost);

        // console.log('Affb: ', aff);
        amount = Math.min(amount, aff.max, (this.sellStocks[itemId] ?? 0));

        if(aff.isAffordable) {
            let totalCost = 0;
            for(const key in cost) {
                const resourceCost = cost[key]*amount;
                gameResources.addResource(key, -resourceCost);
                if(key === 'coins') {
                    totalCost += resourceCost;
                }
            }
            gameResources.addResource(itemId, amount);
            this.sellStocks[itemId] -= amount;

            this.leveledId = itemId;

                                // Send trading event to statistics module
                    gameCore.getModule('statistics').recordTrade('bought', itemId, amount, totalCost);

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
                description: 'Upgrades and items purchase discount based on your charisma attribute (1./(1 + 0.02*log2(charisma)^2))',
                value: charismaMod(gameEffects.getEffectValue('attribute_charisma'))
            })
        }
        if(Math.abs(gameEffects.getEffectValue('land_purchase_discount') - 1) > SMALL_NUMBER) {
            stats.push(gameEffects.getEffect('land_purchase_discount'));
        }
        if(Math.abs(gameEffects.getEffectValue('courses_knowledge_discount') - 1) > SMALL_NUMBER) {
            stats.push(gameEffects.getEffect('courses_knowledge_discount'));
        }
        if(Math.abs(gameEffects.getEffectValue('courses_learning_speed') - 1) > SMALL_NUMBER) {
            stats.push(gameEffects.getEffect('courses_learning_speed'));
        }
        if(Math.abs(gameEffects.getEffectValue('reductive_courses_power') - 1) > SMALL_NUMBER) {
            stats.push(gameEffects.getEffect('reductive_courses_power'));
        }

        this.eventHandler.sendData('general-shop-stats', { stats })
    }

    getItemsData() {
        const entities = gameEntity.listEntitiesByTags(['shop']);
        const total = entities.length;
        const totalComplete = entities.filter(e => e.isCapped || (!gameEntity.getEntityMaxLevel(e.id) && e.isUnlocked)).length;
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
            unlocked: {
                total,
                totalComplete,
            },
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
            purchaseMultiplier: 1
        }
    }


    sendItemDetails(id) {
        const data = this.getItemDetails(id);
        this.eventHandler.sendData('item-details', data);
    }

    getPurchaseableItemsData(payload = {}) {
        const items = gameResources.listResourcesByTags(['inventory']);
        // console.log('items: ', items);
        const presentItems = items.filter(item => item.isUnlocked && item.get_cost);

        presentItems.forEach(one => {
            if(!(one.id in this.sellStocks)) {
                this.sellStocks[one.id] = 1000*(one.purchaseRenewRate ?? 1);
            }
        })

        return {
            available: presentItems.filter(r => !payload?.filterAutomatedPurchase || this.shopItemSettings[r.id]?.autopurchase.isEnabled || this.shopItemSettings[r.id]?.autopurchase?.rules?.length).map(resource => {
                const affordable = resourceCalculators.isAffordable(resource.get_cost());

                return {
                    ...resource,
                    stock: this.sellStocks[resource.id],
                    affordable,
                    isLeveled: this.leveledId === resource.id,
                    purchaseMultiplier: Math.max(1, Math.min(this.purchaseMultiplier, affordable.max, (this.sellStocks[resource.id] ?? 0))),
                    autopurchase: payload.includeAutomations ? this.shopItemSettings[resource.id]?.autopurchase : undefined,
                }
            }),
            purchaseMultiplier: this.purchaseMultiplier,
            payload,
        }
    }

    sendPurchaseableItemsData(payload) {
        const data = this.getPurchaseableItemsData(payload);
        let label = 'items-resources-data';
        if(payload?.prefix) {
            label = `${label}-${payload.prefix}`
        }
        this.eventHandler.sendData(label, data);
    }

    getPurchaseableItemDetails(id) {
        if(!id) return null;
        const entity = gameResources.getResource(id);
        const affordable = resourceCalculators.isAffordable(entity.get_cost());
        const potPurchase = Math.max(1, Math.min(this.purchaseMultiplier, affordable.max, this.sellStocks[id] ?? 1000**(entity.purchaseRenewRate ?? 1)));

        return {
            id: entity.id,
            name: entity.name,
            description: entity.description,
            max: entity.max,
            level: this.purchasedItems[entity.id] || 0,
            affordable: resourceCalculators.isAffordable(entity.get_cost(potPurchase)),
            potentialEffects: resourceApi.unpackEffects(entity.usageGain || {}, 1),
            potentialLastingEffects: entity.resourceModifier ? resourceApi.unpackEffects(entity.resourceModifier, 1) : [],
            duration: entity.attributes?.duration || 0,
            tags: entity.tags,
            purchaseMultiplier: Math.max(1, Math.min(this.purchaseMultiplier, affordable.max, (this.sellStocks[entity.id] ?? 0))),
            autopurchase: this.shopItemSettings?.[entity.id]?.autopurchase ?? { rules: [] },
            isAutomationUnlocked: gameEntity.getLevel('shop_item_purchase_manager') > 0,
        }
    }

    sendPurchaseableItemDetails(id) {
        const data = this.getPurchaseableItemDetails(id);
        this.eventHandler.sendData('item-details', data);
    }

}