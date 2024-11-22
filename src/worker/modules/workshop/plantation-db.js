import {gameEffects, gameEntity, gameResources} from "game-framework";

export const registerPlant = (id, inventoryResource, incomeBase, costBase, options) => {
    gameEntity.registerGameEntity(id, {
        tags: ["plantation"],
        name: options.name,
        isAbstract: false,
        description: options.description,
        level: 0,
        icon_id: inventoryResource,
        resourceModifier: {
            get_income: () => ({
                resources: {
                    [inventoryResource]: {
                        A: incomeBase*gameEffects.getEffectValue('plantations_efficiency'),
                        B: 0,
                        type: 0,
                    }
                }
            }),
            consumption: {
                resources: {
                    plantation_slots: {
                        A: 1,
                        B: 0,
                        type: 2
                    }
                }
            },
            effectDeps: ['plantations_efficiency']
        },
        unlockCondition: () => {
            return gameResources.isResourceUnlocked(inventoryResource)
        },
        attributes: {
            baseXPCost: 10,
        },
        get_cost: () => {

            const seeds = {
                [inventoryResource]: {
                    A: 1.5,
                    B: costBase,
                    type: 1,
                }
            }

            const places = gameEntity.getLevel(id) <= 0 ? {
                'plantation_slots': {
                    A: 0,
                    B: 1,
                    type: 0
                },
            } : {}

            return  {
                ...seeds,
                ...places
            }
        }
    })

}

export function registerPlantations () {

    registerPlant('berry_plantation', 'inventory_berry', 0.1, 1000, {
        name: 'Grow Berries',
        description: 'Just plant some berries... OK?'
    })

    registerPlant('fly_mushroom_plantation', 'inventory_fly_mushroom', 0.05, 1000, {
        name: 'Grow Fly Mushroom',
        description: 'They say you are druggie, but never mind — you are a mage.'
    })

    registerPlant('aloe_vera_plantation', 'inventory_aloe_vera', 0.02, 500, {
        name: 'Grow Aloe Vera',
        description: 'Grow some aloe vera'
    })

    registerPlant('ginseng_plantation', 'inventory_ginseng', 0.02, 500, {
        name: 'Grow Ginseng',
        description: 'Grow some ginseng'
    })

    registerPlant('nightshade_plantation', 'inventory_nightshade', 0.01, 500, {
        name: 'Grow Nightshade',
        description: 'Grow some nightshade'
    })
}