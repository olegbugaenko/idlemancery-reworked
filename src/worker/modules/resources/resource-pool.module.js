import {GameModule} from "../../shared/game-module";
import { gameResources, gameEntity, gameCore, gameEffects } from "game-framework"
import {registerInventoryItems} from "../inventory/inventory-items-db";
import {registerCommomEffects} from "./common-effects-db";

export class ResourcePoolModule extends GameModule {
    constructor() {
        super();
        this.dragonLevel = 0;
        this.dragonPower = 0;
        this.eventHandler.registerHandler('query-resources-data', () => {
            const data = this.getResourcesData();
            this.eventHandler.sendData('resources-data', data);
        })

        this.eventHandler.registerHandler('query-all-resources', (payload) => {
            const data = Object.values(gameResources.resources);
            let label = 'all-resources';
            if(payload?.prefix) {
                label = `${label}-${payload?.prefix}`
            }
            this.eventHandler.sendData(label, data.map(one => ({ id: one.id, name: one.name, isCapped: one.isCapped, isUnlocked: one.unlockCondition ? one.unlockCondition() : true })));
        })
    }

    initialize() {

        registerCommomEffects();

        gameEffects.registerEffect('coins_cap_bonus', {
            name: 'Coins cap multiplier',
            defaultValue: 1,
            minValue: 1
        })

        gameResources.registerResource('energy', {
            name: 'Energy',
            hasCap: true,
            tags: ['resource', 'energy', 'basic', 'vital'],
            defaultCap: 0,
        })
        gameResources.registerResource('health', {
            name: 'Health',
            hasCap: true,
            tags: ['resource', 'health', 'basic', 'vital'],
            defaultCap: 0,
            unlockCondition: () => {
                // console.log('ACTLVL: ', )
                return gameEntity.getLevel('action_pushup') > 1
            }
        })
        gameResources.registerResource('coins', {
            name: 'Coins',
            hasCap: true,
            tags: ['resource', 'coins', 'basic'],
            defaultCap: 2,
        })
        gameResources.registerResource('knowledge', {
            name: 'Knowledge',
            hasCap: true,
            tags: ['resource', 'basic', 'mental'],
            defaultCap: 10,
            unlockCondition: () => {
                return gameEntity.getLevel('shop_item_library_entrance') > 0
            }
        })

        gameResources.registerResource('mana', {
            name: 'Mana',
            hasCap: true,
            tags: ['resource', 'magical', 'mental'],
            defaultCap: 10,
            unlockCondition: () => {
                return gameEntity.getLevel('shop_item_spellbook') > 0
            }
        })





        gameResources.registerResource('crafting_ability', {
            tags: ['crafting', 'secondary'],
            name: 'Crafting Effort',
            isService: true,
        })

        gameResources.registerResource('crafting_slots', {
            tags: ['crafting', 'secondary'],
            name: 'Crafting Slots',
            isService: true,
        })

        gameResources.registerResource('alchemy_ability', {
            tags: ['alchemy', 'secondary'],
            name: 'Alchemy Effort',
            isService: true,
        })

        gameResources.registerResource('alchemy_slots', {
            tags: ['alchemy', 'secondary'],
            name: 'Alchemy Slots',
            isService: true,
        })

        gameResources.registerResource('plantation_slots', {
            tags: ['alchemy', 'secondary'],
            name: 'Plantation Slots',
            isService: true,
        })

        gameResources.registerResource('gathering_effort', {
            tags: ['exploration', 'secondary'],
            name: 'Gathering Effort',
            isService: true,
        })

        gameResources.registerResource('gathering_perception', {
            tags: ['exploration', 'secondary'],
            name: 'Gathering Perception',
            isService: true,
        })




        gameResources.registerResource('rare_herbs_loot', {
            tags: ['gathering', 'secondary'],
            name: 'Rare Herbs',
            isService: true,
            isPercentage: true,
            unlockCondition: () => {
                return gameEntity.getLevel('shop_item_herbs_handbook_2') > 0
            }
        })

        gameEffects.registerEffect('metabolism_rate', {
            name: 'Consumable Cooldown Reduction',
            defaultValue: 1,
            minValue: 1
        })

        registerInventoryItems();

        gameResources.registerResource('guild_reputation', {
            name: 'Guild Reputation',
            hasCap: true,
            tags: ['guild', 'reputation'],
            defaultCap: 0,
        })

        gameResources.registerResource('guild-points', {
            name: 'Guild Points',
            hasCap: true,
            tags: ['guild', 'points'],
            defaultCap: 0,
            isService: true,
        })

    }

    tick() {

    }

    save() {
        return {

        }
    }

    load(obj) {

    }

    reset() {
        const rs = gameResources.listResourcesByTags(['resource', 'population'], true);
        rs.forEach(r => {
            gameResources.setResource(r.id, 0);
        })
    }

    getResourcesData() {
        const rs = gameResources.listResourcesByTags(['resource', 'population'], true);
        // console.log('RS: ', JSON.stringify(rs.find(o => o.id === 'mana')));
        return rs.filter(one => one.isUnlocked).map(resource => ({
            ...resource,
            isNegative: resource.balance < 0,
            isCapped: resource.amount >= resource.cap,
            eta: gameResources.assertToCapOrEmpty(resource.id),
            // affData: monitoredResources[resource.id] || undefined
        }))
    }
}