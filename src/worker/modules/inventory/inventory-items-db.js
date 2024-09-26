import { gameResources, gameEntity, gameCore, gameEffects } from "game-framework"

export const registerInventoryItems = () => {

    const charismaMod = (attr) => attr > 0 ? 1. / (1. + 0.02*Math.log2(attr)) : 1.;


    gameResources.registerResource('inventory_berry', {
        name: 'Berry',
        hasCap: false,
        tags: ['inventory', 'consumable'],
        defaultCap: 0,
        onUse: (amount) => {

        },
        getUsageCooldown: () => {
            return 5;
        },
        usageGain: {
            get_income: () => ({
                resources: {
                    health: {
                        A: 1,
                        B: 0,
                        type: 0,
                    }
                }
            })
        },
        get_cost: () => ({
            coins: 5*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
        }),
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0
        },
    })

    gameResources.registerResource('inventory_bread', {
        name: 'Bread',
        hasCap: false,
        tags: ['inventory', 'consumable'],
        defaultCap: 0,
        onUse: (amount) => {

        },
        getUsageCooldown: () => {
            return 10;
        },
        usageGain: {
            get_income: () => ({
                resources: {
                    energy: {
                        A: 5,
                        B: 0,
                        type: 0,
                    }
                }
            })
        },
        get_cost: () => ({
            coins: 5*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
        }),
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0
        },
    })

}