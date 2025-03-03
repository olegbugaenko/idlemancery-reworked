import {gameEntity, gameResources, resourceApi, gameEffects, gameCore} from "game-framework"
import {GameModule} from "../../shared/game-module";
import {metabolismIntensityMod, metabolismMod, registerInventoryItems, sellPriceMod} from "./inventory-items-db";
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
        },{
            id: 'elemental',
            name: 'Elemental',
            tags: ['elemental'],
            isDefault: false,
        }]

        this.searchData = {};

        this.eventHandler.registerHandler('consume-inventory', (payload) => {
            this.consumeItem(payload.id, payload.amount);
            if(payload.sendDetails) {
                this.sendItemDetails(payload.id);
            }

        })

        this.eventHandler.registerHandler('set-inventory-pinned', (payload) => {
            if(!this.inventoryItems[payload.id]) {
                this.inventoryItems[payload.id] = {
                    stockCapacity: gameEffects.getEffectValue('shop_max_stock')
                };
            }
            this.inventoryItems[payload.id].isPinned = payload.flag;

        })

        this.eventHandler.registerHandler('set-inventory-search', ({searchData}) => {
            this.searchData = searchData;
        })

        this.eventHandler.registerHandler('sell-inventory', (payload) => {
            this.sellItem(payload.id, payload.amount);
        })

        this.eventHandler.registerHandler('query-inventory-data', (payload) => {
            this.sendInventoryData(this.selectedFilterId, {...payload, searchData: this.searchData});
        })

        this.eventHandler.registerHandler('query-inventory-details', (payload) => {
            this.sendItemDetails(payload.id, payload.prefix)
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

        // registerInventoryItems();

    }

    tick(game, delta) {
        this.autoConsumeCD -= delta;

        // trigger autoconsume

        for(const itemId in this.inventoryItems) {
            let checkAutoThisTick = false;
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
                checkAutoThisTick = !this.inventoryItems[itemId].cooldown;
            }


            if(this.inventoryItems[itemId].cooldown > 0) {
                this.inventoryItems[itemId].cooldown -= delta;
            }

            if(this.inventoryItems[itemId].stockCapacity < gameEffects.getEffectValue('shop_max_stock')) {
                this.inventoryItems[itemId].stockCapacity += delta*gameEffects.getEffectValue('shop_stock_renew_rate');
            }

            if(this.autoConsumeCD > 0 && !checkAutoThisTick) {
                continue;
            }
            if(this.inventoryItems[itemId]?.autoconsume?.isEnabled) {
                // check if matching rules
                const isMatching = checkMatchingRules(this.inventoryItems[itemId]?.autoconsume?.rules, this.inventoryItems[itemId]?.autoconsume?.pattern);

                // console.log('RULES MATCHED: ', isMatching);
                if(isMatching) {
                    let amount = 1;
                    const reserved = this.inventoryItems[itemId]?.autosell?.reserved || 0;
                    const reserveLimit = Math.floor(
                        Math.max(0, gameResources.getResource(itemId).amount - reserved)
                    );
                    if(gameResources.getResource(itemId).attributes?.allowMultiConsume) {
                        amount = reserveLimit;
                    }
                    if(amount > 0) {
                        this.consumeItem(itemId, amount);
                    }

                }
            }

            if(this.inventoryItems[itemId]?.autosell?.isEnabled) {
                const coinsRs = gameResources.getResource('coins');
                if(coinsRs.cap - coinsRs.amount <= SMALL_NUMBER) {
                    continue;
                }; // don't waste items since coins are capped
                const isMatching = checkMatchingRules(this.inventoryItems[itemId]?.autosell?.rules, this.inventoryItems[itemId]?.autosell?.pattern);

                if(!('stockCapacity' in this.inventoryItems[itemId])) {
                    this.inventoryItems[itemId].stockCapacity = gameEffects.getEffectValue('shop_max_stock');
                }
                const sellAmount = this.inventoryItems[itemId].stockCapacity;
                // now we should understand that we do not violate resource rule
                const reserved = this.inventoryItems[itemId]?.autosell?.reserved || 0;

                const reserveLimit = Math.floor(
                    Math.max(0, gameResources.getResource(itemId).amount - reserved)
                );

                const realSell = Math.min(sellAmount, reserveLimit);
                // console.log('INVDEBUG Reserved: ', itemId, reserved, reserveLimit, sellAmount, realSell, gameResources.getResource(itemId).amount, this.inventoryItems[itemId]);

                if(isMatching) {
                    this.sellItem(itemId, Math.min(sellAmount, reserveLimit));
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
            selectedFilterId: this.selectedFilterId,
            searchData: this.searchData,
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
        this.searchData = saveObject?.searchData || {
            search: '',
            selectedScopes: ['name','tags']
        };

        for(const key in this.inventoryItems) {
            if(!('stockCapacity' in this.inventoryItems[key])) {
                this.inventoryItems[key].stockCapacity = gameEffects.getEffectValue('shop_max_stock');
            }
            if(this.inventoryItems[key].duration && this.inventoryItems[key].duration > 0) {
                // console.log('INVDEBUG REGISTER ITEM '+key+':', this.inventoryItems[key]);
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
        this.sendInventoryData(this.selectedFilterId, {
            searchData: this.searchData
        });
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

                // console.log('IIII: ', effects, rsToRemove, realCons);

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
        this.sendInventoryData(this.selectedFilterId, {
            searchData: this.searchData,
        });
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
            if(!this.inventoryItems[id].soldAmount) {
                this.inventoryItems[id].soldAmount = 0;
            }
            if(!this.inventoryItems[id].coinsEarned) {
                this.inventoryItems[id].coinsEarned = 0;
            }
            const earnings = realCons*resource.sellPrice*sellPriceMod(gameEffects.getEffectValue('attribute_bargaining'));
            gameResources.addResource(id, -realCons);
            gameResources.addResource('coins', earnings);
            this.inventoryItems[id].soldAmount += realCons;
            this.inventoryItems[id].coinsEarned += earnings;
        }

        this.sendInventoryData(this.selectedFilterId, {
            searchData: this.searchData,
        });
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

    regenerateNotifications() {
        // NOW - check for actions if they have any new notifications

        this.filters.forEach(filter => {
            const items = gameResources.listResourcesByTags(['inventory', ...filter.tags]);
            items.forEach(item => {
                gameCore.getModule('unlock-notifications').registerNewNotification(
                    'inventory',
                    'all',
                    filter.id,
                    `inventory_${item.id}`,
                    item.isUnlocked && (gameResources.getResource(item.id).amount >= SMALL_NUMBER
                        || Math.abs(gameResources.getResource(item.id).income) >= SMALL_NUMBER)
                )
            })
        })
    }


    matchInventorySearch(one, searchData) {
        if(!searchData) return true;
        const { search, selectedScopes } = searchData;
        if(!search) return true;
        if(selectedScopes.includes('name') && one.name.toLowerCase().includes(search)) return true;
        if(selectedScopes.includes('tags') && one.tags && one.tags.some(tag => tag.includes(search))) return true;

        if(selectedScopes.includes('resources') && one.searchableMeta?.['resources']
            && one.searchableMeta?.['resources'].some(tag => tag.includes(search.toLowerCase()))) return true;
        if(selectedScopes.includes('effects') && one.searchableMeta?.['effects']
            && one.searchableMeta?.['effects'].some(tag => tag.includes(search.toLowerCase()))) return true;


        return false;
    }

    getItemsData(filterId, pl) {
        const perCats = this.filters.reduce((acc, filter) => {

            acc[filter.id] = {
                id: filter.id,
                name: filter.name,
                tags: filter.tags,
                items: gameResources.listResourcesByTags(['inventory', ...filter.tags])
                    .filter(one => one.isUnlocked && !one.isCapped && (gameResources.getResource(one.id).amount >= SMALL_NUMBER
                        || Math.abs(gameResources.getResource(one.id).income) >= SMALL_NUMBER
                        || this.inventoryItems[one.id]?.autoconsume?.rules?.length
                        || this.inventoryItems[one.id]?.autoconsume?.isEnabled
                        || this.inventoryItems[one.id]?.autosell?.rules?.length
                        || this.inventoryItems[one.id]?.autosell?.isEnabled
                    ) && this.matchInventorySearch(one, pl.searchData)),
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
            presentItems = presentItems.filter(p => this.inventoryItems[p.id]?.autosell?.rules?.length || this.inventoryItems[p.id]?.autosell?.isEnabled)
        }
        if(pl?.filterAutomatedConsume) {
            presentItems = presentItems.filter(p => this.inventoryItems[p.id]?.autoconsume?.rules?.length || this.inventoryItems[p.id]?.autoconsume?.isEnabled)
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
                cooldownProg: resource.getUsageCooldown ? (resource.getUsageCooldown() + SMALL_NUMBER - (this.inventoryItems[resource.id]?.cooldown ?? 0)) / (resource.getUsageCooldown() + SMALL_NUMBER) : 1,
                allowMultiConsume: resource.attributes?.allowMultiConsume,
                isPinned: this.inventoryItems[resource.id]?.isPinned,
            })),
            itemCategories: Object.values(perCats).filter(cat => cat.items.length > 0),
            payload: pl,
            selectedFilterId: filterId,
            searchData: this.searchData ?? {
                search: '',
                selectedScopes: ['name']
            },
            automationUnlocked: gameEntity.getLevel('shop_item_planner') > 0,
            details: {
                metabolism_rate: {...gameEffects.getEffect('metabolism_rate'), isMultiplier: true},
                cooldown_bonus: {
                    ...gameEffects.getEffect('metabolism_rate'),
                    id: 'cooldown_bonus',
                    name: 'Consumable Effects Multiplier',
                    description: 'Herbs and Potions effects multiplier (metabolism^0.25)',
                    value: metabolismIntensityMod(gameEffects.getEffectValue('metabolism_rate')),
                    isMultiplier: true,
                },
                bargaining: {...gameEffects.getEffect('attribute_bargaining'), isMultiplier: false},
                bargaining_mod: {
                    ...gameEffects.getEffect('attribute_bargaining'),
                    description: 'Sell price multiplier from bargaining (1 + 0.02*log2(bargaining)^2)',
                    name: 'Bargaining Sell Price Mult',
                    value: sellPriceMod(gameEffects.getEffectValue('attribute_bargaining')),
                    isMultiplier: true,
                },
                shop_max_stock: {...gameEffects.getEffect('shop_max_stock'), isMultiplier: false},
                shop_stock_renew_rate: {...gameEffects.getEffect('shop_stock_renew_rate'), isMultiplier: false},
            }
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

        // console.log('EEFF: ', resource.attributes?.entityEffect, permanentEffects, potentialPermanentEffects);
        return {
            id: resource.id,
            name: resource.name,
            description: resource.description,
            breakdown: resource.breakdown,
            amount: Math.floor(resource.amount || 0),
            isConsumable: resource.tags.includes('consumable'),
            effects,
            tags: resource.tags || [],
            autoconsume: this.inventoryItems[resource.id]?.autoconsume ?? { rules: [] },
            autosell: this.inventoryItems[resource.id]?.autosell ?? { rules: [] },
            isConsumed: this.inventoryItems[resource.id]?.isConsumed,
            isSellable: !!resource.sellPrice,
            sellPrice: resource.sellPrice*sellPriceMod(gameEffects.getEffectValue('attribute_bargaining')),
            maxSell: Math.min((this.inventoryItems[resource.id]?.stockCapacity ?? gameEffects.getEffectValue('shop_max_stock')), Math.floor(resource.amount)),
            duration: resource.attributes?.duration || 0,
            potentialEffects: resource.resourceModifier ? resourceApi.unpackEffects(resource.resourceModifier, 1) : [],
            consumptionCooldown: resource.getUsageCooldown ? resource.getUsageCooldown() : 0,
            cooldownProg: resource.getUsageCooldown ? (resource.getUsageCooldown() - (this.inventoryItems[resource.id]?.cooldown ?? 0)) / resource.getUsageCooldown() : 1,
            permanentEffects,
            potentialPermanentEffects,
            numConsumed: this.inventoryItems[resource.id]?.numConsumed || 0,
            soldAmount: this.inventoryItems[resource.id]?.soldAmount || 0,
            coinsEarned: this.inventoryItems[resource.id]?.coinsEarned || 0,
            currentCooldown: this.inventoryItems[id]?.cooldown || 0,
            currentDuration: this.inventoryItems[id]?.duration || 0,
            isPinned: this.inventoryItems[resource.id]?.isPinned,
        }
    }

    sendItemDetails(id, prefix) {
        const data = this.getItemDetails(id);
        let label = 'inventory-details';
        if(prefix) {
            label = `${prefix}-${label}`;
        }
        this.eventHandler.sendData(label, data);
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