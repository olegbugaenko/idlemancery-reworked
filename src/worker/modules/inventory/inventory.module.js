import { gameEntity, gameResources, resourceApi, gameEffects } from "game-framework"
import {GameModule} from "../../shared/game-module";
import {registerInventoryItems} from "./inventory-items-db";
import {checkMatchingRules} from "../../shared/utils/rule-utils";
import {SMALL_NUMBER} from "game-framework/src/utils/consts";
import {packEffects} from "../../shared/utils/objects";


export class InventoryModule extends GameModule {

    constructor() {
        super();
        this.inventoryItems = {};
        this.isUnlocked = false;
        this.autoConsumeCD = 2;

        this.selectedFilterId = 'all';

        this.filters = [{
            id: 'all',
            name: 'All',
            tags: [],
            isDefault: true,
        },{
            id: 'consumable',
            name: 'Consumable',
            tags: ['consumable'],
            isDefault: true,
        },{
            id: 'materials',
            name: 'Materials',
            tags: ['material'],
            isDefault: false,
        }]

        this.eventHandler.registerHandler('consume-inventory', (payload) => {
            this.consumeItem(payload.id, payload.amount);
            if(payload.sendDetails) {
                this.sendItemDetails(payload.id);
            }

        })

        this.eventHandler.registerHandler('sell-inventory', (payload) => {
            this.sellItem(payload.id, payload.amount);
        })

        this.eventHandler.registerHandler('query-inventory-data', (payload) => {
            this.sendInventoryData(this.selectedFilterId, payload);
        })

        this.eventHandler.registerHandler('query-inventory-details', (payload) => {
            this.sendItemDetails(payload.id)
        })

        this.eventHandler.registerHandler('query-sell-details', (payload) => {
            this.sendSellDetails(payload.id)
        })

        this.eventHandler.registerHandler('save-inventory-settings', payload => {
            this.saveSettings(payload)
        })

        this.eventHandler.registerHandler('set-selected-inventory-filter', ({filterId}) => {
            this.selectedFilterId = filterId;
        })
    }

    initialize() {

        gameEffects.registerEffect('metabolism_rate', {
            name: 'Consumable Cooldown Reduction',
            defaultValue: 1,
            minValue: 1
        })

        registerInventoryItems();

    }

    tick(game, delta) {
        this.autoConsumeCD -= delta;

        // trigger autoconsume
        for(const itemId in this.inventoryItems) {
            this.inventoryItems[itemId].isConsumed = false;

            if(this.inventoryItems[itemId].duration > 0) {
                this.inventoryItems[itemId].duration -= delta;
                if(gameEntity.entityExists(`active_${itemId}`)) {
                    gameEntity.setAttribute(`active_${itemId}`, 'current_duration', this.inventoryItems[itemId].duration);
                }
            }
            if(this.inventoryItems[itemId].duration <= 0) {
                this.inventoryItems[itemId].duration = 0;
                if(gameEntity.entityExists(`active_${itemId}`)) {
                    gameEntity.unsetEntity(`active_${itemId}`);
                    this.inventoryItems[itemId].cooldown = gameResources.getResource(itemId).getUsageCooldown() ?? 0;
                }
            }

            if(this.inventoryItems[itemId].cooldown > 0) {
                this.inventoryItems[itemId].cooldown -= delta;
            }

            if(this.inventoryItems[itemId].stockCapacity < gameEffects.getEffectValue('shop_max_stock')) {
                this.inventoryItems[itemId].stockCapacity += delta*gameEffects.getEffectValue('shop_stock_renew_rate');
            }


            if(this.autoConsumeCD > 0) {
                continue;
            }
            if(this.inventoryItems[itemId]?.autoconsume?.rules?.length) {
                // check if matching rules
                const isMatching = checkMatchingRules(this.inventoryItems[itemId]?.autoconsume?.rules, this.inventoryItems[itemId]?.autoconsume?.pattern);

                // console.log('RULES MATCHED: ', isMatching);
                if(isMatching) {
                    this.consumeItem(itemId, 1);
                }
            }

            if(this.inventoryItems[itemId]?.autosell?.rules?.length) {
                const isMatching = checkMatchingRules(this.inventoryItems[itemId]?.autosell?.rules, this.inventoryItems[itemId]?.autosell?.pattern);

                if(isMatching) {
                    this.sellItem(itemId, 1);
                }
            }

        }

        if(this.autoConsumeCD <= 0) {
            this.autoConsumeCD = 2;
        }
    }

    save() {
        return {
            inventory: this.inventoryItems,
            selectedFilterId: this.selectedFilterId
        }
    }

    load(saveObject) {

        for(const key in this.inventoryItems) {
            if(this.inventoryItems[key].duration && this.inventoryItems[key].duration > 0) {
                // we should unset existing
                if(gameEntity.entityExists(`active_${key}`)) {
                    gameEntity.unsetEntity(`active_${key}`);
                }
            }
        }

        this.inventoryItems = saveObject?.inventory ?? {};
        this.selectedFilterId = saveObject?.selectedFilterId || 'all';

        for(const key in this.inventoryItems) {
            if(!('stockCapacity' in this.inventoryItems[key])) {
                this.inventoryItems[key].stockCapacity = gameEffects.getEffectValue('shop_max_stock');
            }
            if(this.inventoryItems[key].duration && this.inventoryItems[key].duration > 0) {
                gameEntity.registerGameEntity(`active_${key}`, {
                    originalId: key,
                    name: gameResources.getResource(key).name,
                    isAbstract: false,
                    tags: ['active_consumable', 'active_effect'],
                    scope: 'resources',
                    level: 1,
                    resourceModifier: gameResources.getResource(key).resourceModifier ?? undefined
                });

                gameEntity.setEntityLevel(`active_${key}`, 1);
            }
        }
        this.sendInventoryData(this.selectedFilterId);
    }

    reset() {
        this.load({});
    }

    getConsumeAffordable(resource, realCons) {
        let result = {
            isAffordable: true,
            consume: {}
        }
        if(resource.usageGain) {
            const effects = resourceApi.unpackEffects(resource.usageGain, realCons);
            if(effects.length) {
                const rsToRemove = effects.filter(eff => eff.scope === 'consumption' && eff.type === 'resources');

                console.log('IIII: ', effects, rsToRemove, realCons);

                rsToRemove.forEach(rs => {
                    result.consume[rs.id] = rs.value;
                    if(result.consume[rs.id] > gameResources.getResource(rs.id).amount) {
                        result.isAffordable = false;
                    }
                })
            }

        }
        return result;
    }

    consumeItem(id, amount) {
        const resource = gameResources.getResource(id);
        const realCons = Math.min(amount, resource.amount);
        if(this.inventoryItems[id] && (this.inventoryItems[id].cooldown > 0 || this.inventoryItems[id].duration > 0)) return;
        if(realCons < 1) return;
        if(resource.usageGain || resource.resourceModifier) {
            const aff = this.getConsumeAffordable(resource, realCons);
            if(!aff.isAffordable) {
                return;
            }

            const effects = resourceApi.unpackEffects(resource.usageGain || {}, realCons);
            if(effects.length) {
                const rsToAdd = effects.filter(eff => eff.scope === 'income' && eff.type === 'resources');

                // console.log('consAddR: ', effects, rsToAdd, realCons);

                rsToAdd.forEach(rs => {
                    gameResources.addResource(rs.id, rs.value);
                })
            }

            for(const key in aff.consume) {
                gameResources.addResource(key, -aff.consume[key]);
            }

            if(!this.inventoryItems[id]) {
                this.inventoryItems[id] = {
                    stockCapacity: gameEffects.getEffectValue('shop_max_stock')
                };
            }
            this.inventoryItems[id].isConsumed = true;
            if(resource.attributes?.duration && resource.resourceModifier) {
                // has active effect

                gameEntity.registerGameEntity(`active_${id}`, {
                    originalId: id,
                    name: resource.name,
                    isAbstract: false,
                    level: 1,
                    tags: ['active_consumable', 'active_effect'],
                    scope: 'resources',
                    resourceModifier: resource.resourceModifier ?? undefined
                });

                gameEntity.setEntityLevel(`active_${id}`, 1);

                this.inventoryItems[id].duration = resource.attributes.duration;

            } else {
                this.inventoryItems[id].cooldown = resource.getUsageCooldown() ?? 0;
            }
        }
        if(resource.onUse) {
            resource.onUse(realCons);
        }
        this.inventoryItems[id].numConsumed = (this.inventoryItems[id].numConsumed || 0) + realCons;
        gameResources.addResource(id, -realCons);
        this.sendInventoryData(this.selectedFilterId);
    }

    sellItem(id, amount) {
        const resource = gameResources.getResource(id);
        const realCons = Math.min(amount, resource.amount, this.inventoryItems[id]?.stockCapacity || 10);
        if(this.inventoryItems[id] && this.inventoryItems[id].stockCapacity <= 0) return;
        if(realCons < 1) return;
        if(resource.sellPrice) {


            if(!this.inventoryItems[id]) {
                this.inventoryItems[id] = {
                    stockCapacity: gameEffects.getEffectValue('shop_max_stock')
                };
            }
            this.inventoryItems[id].stockCapacity -= realCons;
            gameResources.addResource(id, -realCons);
            gameResources.addResource('coins', realCons*resource.sellPrice);
        }

        this.sendInventoryData(this.selectedFilterId);
    }

    saveSettings(payload) {
        if(payload.id) {
            this.inventoryItems[payload.id] = {
                ...this.inventoryItems[payload.id],
                autoconsume: payload.autoconsume,
                autosell: payload.autosell,
            }
        }
    }

    getItemsData(filterId, pl) {
        const perCats = this.filters.reduce((acc, filter) => {

            acc[filter.id] = {
                id: filter.id,
                name: filter.name,
                tags: filter.tags,
                items: gameResources.listResourcesByTags(['inventory', ...filter.tags])
                    .filter(one => one.isUnlocked && !one.isCapped && (gameResources.getResource(one.id).amount >= 1
                        || Math.abs(gameResources.getResource(one.id).income) >= SMALL_NUMBER
                        || this.inventoryItems[one.id]?.autoconsume?.rules?.length
                        || this.inventoryItems[one.id]?.autosell?.rules?.length)),
                isSelected: filterId === filter.id
            }

            return acc;
        }, {})

        if(!filterId) {
            filterId = 'all';
        }

        const entities = perCats[filterId].items;

        let presentItems = entities;

        if(pl?.filterAutomatedSell) {
            presentItems = presentItems.filter(p => this.inventoryItems[p.id]?.autosell?.rules?.length)
        }
        if(pl?.filterAutomatedConsume) {
            presentItems = presentItems.filter(p => this.inventoryItems[p.id]?.autoconsume?.rules?.length)
        }
        if(pl?.includeAutomations) {
            presentItems = presentItems.map(item => ({
                ...item,
                autoconsume: this.inventoryItems[item.id]?.autoconsume ?? { rules: [] },
                autosell: this.inventoryItems[item.id]?.autosell ?? { rules: [] },
            }))
        }

        return {
            available: presentItems.map(resource => ({
                ...resource,
                isRare: resource.attributes?.isRare,
                isConsumable: resource.tags.includes('consumable'),
                isConsumed: this.inventoryItems[resource.id]?.isConsumed,
                cooldown: this.inventoryItems[resource.id]?.cooldown ?? 0,
                cooldownProg: resource.getUsageCooldown ? (resource.getUsageCooldown() - (this.inventoryItems[resource.id]?.cooldown ?? 0)) / resource.getUsageCooldown() : 1,
                allowMultiConsume: resource.attributes?.allowMultiConsume,
            })),
            itemCategories: Object.values(perCats).filter(cat => cat.items.length > 0),
            payload: pl,
        }
    }

    sendInventoryData(filter, pl) {
        const data = this.getItemsData(filter, pl);
        let label = 'inventory-data';
        if(pl?.prefix) {
            label = `${label}-${pl.prefix}`;
        }
        this.eventHandler.sendData(label, data);
    }

    getItemDetails(id) {
        if(!id) return null;
        const resource =  gameResources.getResource(id);
        let effects = [];
        if(resource.usageGain) {
            effects = resourceApi.unpackEffects(resource.usageGain, 1)
        }

        // const currentEffects = resource.attributes?.entityEffect ? gameEntity.getEffects(resource.attributes?.entityEffect) : null;
        // let potentialEffects = resource.resourceModifier ? resourceApi.unpackEffects(resource.resourceModifier, 1) : [];

        let permanentEffects;
        let potentialPermanentEffects;

        if(resource.attributes?.entityEffect) {
            permanentEffects = packEffects(gameEntity.getEffects(resource.attributes?.entityEffect));
            potentialPermanentEffects = packEffects(gameEntity.getEffects(resource.attributes?.entityEffect, 1));
        }

        console.log('EEFF: ', resource.attributes?.entityEffect, permanentEffects, potentialPermanentEffects);
        return {
            id: resource.id,
            name: resource.name,
            description: resource.description,
            breakdown: resource.breakdown,
            amount: resource.amount,
            effects,
            tags: resource.tags || [],
            autoconsume: this.inventoryItems[resource.id]?.autoconsume ?? { rules: [] },
            autosell: this.inventoryItems[resource.id]?.autosell ?? { rules: [] },
            isConsumed: this.inventoryItems[resource.id]?.isConsumed,
            isSellable: !!resource.sellPrice,
            sellPrice: resource.sellPrice,
            maxSell: Math.min((this.inventoryItems[resource.id]?.stockCapacity ?? gameEffects.getEffectValue('shop_max_stock')), Math.floor(resource.amount)),
            duration: resource.attributes?.duration || 0,
            potentialEffects: resource.resourceModifier ? resourceApi.unpackEffects(resource.resourceModifier, 1) : [],
            consumptionCooldown: resource.getUsageCooldown ? resource.getUsageCooldown() : 0,
            permanentEffects,
            potentialPermanentEffects,
            numConsumed: this.inventoryItems[resource.id]?.numConsumed || 0
        }
    }

    sendItemDetails(id) {
        const data = this.getItemDetails(id);
        this.eventHandler.sendData('inventory-details', data);
    }

    sendSellDetails(id) {
        if(!id) return null;
        const resource =  gameResources.getResource(id);

        const data = {
            id,
            isSellable: !!resource.sellPrice,
            sellPrice: resource.sellPrice,
            maxSell: Math.min((this.inventoryItems[resource.id]?.stockCapacity ?? gameEffects.getEffectValue('shop_max_stock')), Math.floor(resource.amount)),
        }

        this.eventHandler.sendData('sell-details', data);
    }

}