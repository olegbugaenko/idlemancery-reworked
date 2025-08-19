import {GameModule} from "../../shared/game-module";
import {gameResources, gameEntity, gameCore, gameEffects, resourceCalculators} from "game-framework"
import {registerInventoryItems} from "../inventory/inventory-items-db";
import {registerCommomEffects} from "./common-effects-db";
import {SMALL_NUMBER} from "game-framework/src/utils/consts";

export class ResourcePoolModule extends GameModule {
    constructor() {
        super();
        this.dragonLevel = 0;
        this.dragonPower = 0;
        this.monitoredData = {};
        this.pinnedResources = {};
        this.tickCD = 1;

        this.eventHandler.registerHandler('set-resource-pinned', (payload) => {
            this.pinnedResources[payload.id] = payload.flag;
        })

        this.eventHandler.registerHandler('query-resources-data', (pl) => {
            const data = this.getResourcesData(pl).map(one => ({
                ...one,
                capProgress: one.isService ? Math.min(one.targetEfficiency || 0, 1) : (one.hasCap ? one.amount / Math.max(1.e-8, one.cap) : 0),
                total: one.isService ? one.balance + one.consumption : one.cap,
            }));
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

        gameResources.registerResource('mage-xp', {
            name: 'XP',
            hasCap: true,
            tags: ['mage', 'xp'],
            defaultCap: 0,
        })


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

        gameResources.registerResource('expedition_effort', {
            tags: ['exploration', 'secondary'],
            name: 'Expedition Effort',
            isService: true,
        })

        gameResources.registerResource('inventory_scrolls', {
            tags: ['inventory', 'expedition', 'scrolls'],
            name: 'Scrolls',
            hasCap: true,
            defaultCap: 0,
        })

        gameResources.registerResource('inventory_artifacts', {
            tags: ['inventory', 'expedition', 'artifacts'],
            name: 'Artifacts',
            hasCap: true,
            defaultCap: 0,
        })

        gameResources.registerResource('hunting_effort', {
            tags: ['exploration', 'secondary'],
            name: 'Hunting Effort',
            isService: true,
            unlockCondition: () => {
                return gameEntity.getLevel('shop_item_hunting') > 0
            }
        })

        gameResources.registerResource('gathering_perception', {
            tags: ['exploration', 'secondary'],
            name: 'Gathering Perception',
            isService: true,
            description: 'Determines how much efficient you are at gathering, boosting probability to find any loot'
        })

        gameResources.registerResource('mental_energy', {
            tags: ['resource', 'mental'],
            name: 'Mental Energy',
            hasCap: true,
            defaultCap: 100,
            unlockCondition: () => {
                return gameEntity.isEntityUnlocked('action_mind_cleansing')
            }
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
            name: 'Metabolism Rate',
            defaultValue: 1,
            minValue: 1,
            description: 'Increase effect from herbs, food and potions consumption (Affect both positive and negative effects)'
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

    tick(game, delta) {
        if(this.monitoredCaches && this.monitoredCaches?.data?.length) {
            this.tickCD -= delta;
            if(this.tickCD <= 0) {
                this.tickCD = 1;
                this.setMonitored(this.monitoredCaches.data, this.monitoredCaches.skip, this.monitoredCaches.skipById);
            }
        }
    }

    save() {
        return {
            pinnedResources: this.pinnedResources,
        }
    }

    load(obj) {
        this.pinnedResources = obj?.pinnedResources ?? {};
    }

    setMonitored(data, skip, skipById) {
        this.monitoredData = {};
        this.monitoredCaches = {
            data,
            skip,
            skipById
        }
        if(!data?.length) return;
        data.forEach(effect => {
            // console.log('effect: ', effect);
            let direction = 1;
            if(effect.scope === 'consumption') {
                direction = -1;
            }
            if(effect.scope === 'multiplier' && effect.value < 1) {
                direction = -1;
            }
            const prev = resourceCalculators.assertResource(effect.id, false, skip, {
                skipById
            });

            let newBalance = 0;
            let newStorage = 0;
            const defSt = gameResources.getResource(effect.id)?.defaultCap ?? 0;
            switch (effect.scope) {
                case 'consumption':
                    newBalance = prev.balance - effect.value;
                    break;
                case 'income':
                    newBalance = prev.balance + effect.value*prev.multiplier;
                    break;
                case 'multiplier':
                    newBalance = (prev.income * prev.multiplier * effect.value) - prev.consumption;
                    break;
                case 'rawCap':
                    newStorage = (defSt + prev.rawCap + effect.value)*prev.capMult;
                    break;
                case 'capMult':
                    newStorage = (defSt + prev.rawCap)*(prev.capMult * effect.value);
                    break;
                default:
                    newBalance = prev.balance;
                    break;
            }


            this.monitoredData[effect.id] = {
                direction,
                name: effect.name,
                id: effect.id,
                amount: effect.value,
                newBalance: this.monitoredData[effect.id]?.newBalance ?? newBalance,
                newStorage: this.monitoredData[effect.id]?.newStorage ?? newStorage,
                bShow: (!!skip || !!skipById) && !effect.isOneTime,
            };
        })
    }

    reset() {
        const rs = gameResources.listResourcesByTags(['resource', 'population'], true);
        rs.forEach(r => {
            gameResources.setResource(r.id, 0);
        })
    }

    getResourcesData(pl) {
        const rs = gameResources.listResourcesByTags(['resource', 'population'], true);
        if(pl.includePinned) {
            const inventory = gameResources.listAllResources(['resource']);
            const pinned = inventory.filter(one => this.pinnedResources?.[one.id]);
            rs.push(...pinned);
        }
        return rs.filter(one => gameResources.resourceExists(one.id) && one.isUnlocked).map(resource => ({
            ...resource,
            isNegative: resource.balance < 0,
            isPositive: resource.balance > 0 && resource.amount < resource.cap - SMALL_NUMBER,
            isCapped: resource.amount >= resource.cap - SMALL_NUMBER,
            eta: gameResources.assertToCapOrEmpty(resource.id),
            monitor: this.monitoredData[resource.id] ?? null,
            // affData: monitoredResources[resource.id] || undefined
        }))
    }
}