import { gameEntity, gameResources, resourceApi } from "game-framework"
import {GameModule} from "../../shared/game-module";
import {registerInventoryItems} from "./inventory-items-db";

export class InventoryModule extends GameModule {

    constructor() {
        super();
        this.inventoryItems = {};
        this.isUnlocked = false;
        this.eventHandler.registerHandler('consume-inventory', (payload) => {
            this.consumeItem(payload.id, payload.amount);
        })
        this.eventHandler.registerHandler('query-inventory-data', (payload) => {
            this.sendInventoryData()
        })

        this.eventHandler.registerHandler('query-inventory-details', (payload) => {
            this.sendItemDetails(payload.id)
        })
    }

    initialize() {

        registerInventoryItems();

    }

    tick(game, delta) {

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
        if(resource.usageGain) {
            const effects = resourceApi.unpackEffects(resource.usageGain, realCons);
            if(effects.length) {
                const rsToAdd = effects.filter(eff => eff.scope === 'income' && eff.type === 'resources');

                console.log('consAddR: ', effects, rsToAdd, realCons);

                rsToAdd.forEach(rs => {
                    gameResources.addResource(rs.id, rs.value);
                })
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
                ...resource
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
            tags: resource.tags || []
        }
    }

    sendItemDetails(id) {
        const data = this.getItemDetails(id);
        this.eventHandler.sendData('inventory-details', data);
    }

}