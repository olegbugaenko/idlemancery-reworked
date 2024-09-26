import { gameEntity, gameResources, resourceApi } from "game-framework"
import {GameModule} from "../../shared/game-module";
import {registerInventoryItems} from "./inventory-items-db";

export class InventoryModule extends GameModule {

    constructor() {
        super();
        this.inventoryItems = {};
        this.isUnlocked = false;
        this.autoConsumeCD = 2;
        this.eventHandler.registerHandler('consume-inventory', (payload) => {
            this.consumeItem(payload.id, payload.amount);
        })
        this.eventHandler.registerHandler('query-inventory-data', (payload) => {
            this.sendInventoryData()
        })

        this.eventHandler.registerHandler('query-inventory-details', (payload) => {
            this.sendItemDetails(payload.id)
        })

        this.eventHandler.registerHandler('save-inventory-settings', payload => {
            this.saveSettings(payload)
        })
    }

    initialize() {

        registerInventoryItems();

    }

    checkMatchingRule(rule) {
        const resource = gameResources.getResource(rule.resource_id);

        if(!resource) return false;

        let compare = resource.amount;

        if(rule.value_type === 'percentage') {
            if(!resource.cap) return false;

            compare = resource.amount / resource.cap;
        }

        switch (rule.condition) {
            case 'less':
                return compare < rule.value;
            case 'less_or_eq':
                return  compare <= rule.value;
            case 'eq':
                return compare == rule.value;
            case 'grt_or_eq':
                return compare >= rule.value;
            case 'grt':
                return compare > rule.value;
        }

        return false;
    }

    checkMatchingRules(rules) {
        for(const rule of rules) {
            console.log('RULE_CHECK: ', rule)
            if(!this.checkMatchingRule(rule)) {
                return false;
            }
            console.log('RULE Matched!');
        }
        return true;
    }

    tick(game, delta) {
        this.autoConsumeCD -= delta;

        // trigger autoconsume
        for(const itemId in this.inventoryItems) {
            this.inventoryItems[itemId].isConsumed = false;
            if(this.inventoryItems[itemId].cooldown > 0) {
                this.inventoryItems[itemId].cooldown -= delta;
            }


            if(this.autoConsumeCD > 0) {
                continue;
            }
            if(!this.inventoryItems[itemId]?.autoconsume?.rules?.length) {
                continue;
            }

            // check if matching rules
            const isMatching = this.checkMatchingRules(this.inventoryItems[itemId]?.autoconsume?.rules);

            // console.log('RULES MATCHED: ', isMatching);
            if(isMatching) {
                this.consumeItem(itemId, 1);
            }

        }

        if(this.autoConsumeCD <= 0) {
            this.autoConsumeCD = 2;
        }
    }

    save() {
        return {
            inventory: this.inventoryItems,
        }
    }

    load(saveObject) {
        this.inventoryItems = saveObject?.inventory ?? {};
        this.sendInventoryData();
    }

    reset() {
        this.load({});
    }

    consumeItem(id, amount) {
        const resource = gameResources.getResource(id);
        const realCons = Math.min(amount, resource.amount);
        if(this.inventoryItems[id] && this.inventoryItems[id].cooldown > 0) return;
        if(resource.usageGain) {
            const effects = resourceApi.unpackEffects(resource.usageGain, realCons);
            if(effects.length) {
                const rsToAdd = effects.filter(eff => eff.scope === 'income' && eff.type === 'resources');

                // console.log('consAddR: ', effects, rsToAdd, realCons);

                rsToAdd.forEach(rs => {
                    gameResources.addResource(rs.id, rs.value);
                })
            }
            if(!this.inventoryItems[id]) {
                this.inventoryItems[id] = {};
            }
            this.inventoryItems[id].isConsumed = true;
            this.inventoryItems[id].cooldown = resource.getUsageCooldown() ?? 0;
        }
        gameResources.addResource(id, -realCons);
        this.sendInventoryData();
    }

    saveSettings(payload) {
        if(payload.id) {
            this.inventoryItems[payload.id] = {
                autoconsume: payload.autoconsume,
            }
        }
    }

    getItemsData() {
        const items = gameResources.listResourcesByTags(['inventory']);
        const presentItems = items.filter(item => gameResources.getResource(item.id).amount > 0);
        if(presentItems.length <= 0) {
            gameResources.addResource('inventory_berry', 2);
        }
        return {
            available: presentItems.map(resource => ({
                ...resource,
                isConsumed: this.inventoryItems[resource.id]?.isConsumed,
                cooldown: this.inventoryItems[resource.id]?.cooldown ?? 0,
                cooldownProg: resource.getUsageCooldown ? (resource.getUsageCooldown() - (this.inventoryItems[resource.id]?.cooldown ?? 0)) / resource.getUsageCooldown() : 1
            }))
        }
    }

    sendInventoryData() {
        const data = this.getItemsData();
        this.eventHandler.sendData('inventory-data', data);
    }

    getItemDetails(id) {
        if(!id) return null;
        const resource =  gameResources.getResource(id);
        let effects = [];
        if(resource.usageGain) {
            effects = resourceApi.unpackEffects(resource.usageGain, 1)
        }
        return {
            id: resource.id,
            name: resource.name,
            description: resource.description,
            breakdown: resource.breakdown,
            amount: resource.amount,
            effects,
            tags: resource.tags || [],
            autoconsume: this.inventoryItems[resource.id]?.autoconsume ?? { rules: [] },
            isConsumed: this.inventoryItems[resource.id]?.isConsumed
        }
    }

    sendItemDetails(id) {
        const data = this.getItemDetails(id);
        this.eventHandler.sendData('inventory-details', data);
    }

}