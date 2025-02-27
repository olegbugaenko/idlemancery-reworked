import {gameEffects, gameEntity, gameResources} from "game-framework";

export const getWateringEffectId = id => `watering_${id}`;

export const registerPlant = (id, inventoryResource, incomeBase, costBase, options) => {

    gameEffects.registerEffect(getWateringEffectId(id), {
        name: `${options.name} Watering`,
        defaultValue: 1,
        minValue: 1,
    })

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
                        A: incomeBase*gameEffects.getEffectValue('plantations_efficiency')*gameEffects.getEffectValue(getWateringEffectId(id)),
                        B: 0,
                        C: 1.02,
                        type: 3,
                    }
                }
            }),
            consumption: {
                resources: {
                    plantation_slots: {
                        A: 1,
                        B: 0,
                        type: 2
                    },
                }
            },
            effectDeps: ['plantations_efficiency', getWateringEffectId(id)]
        },
        unlockCondition: () => {
            return gameResources.isResourceUnlocked(inventoryResource) && gameResources.getResource('plantation_slots').income > 0
        },
        attributes: {
            baseXPCost: 10,
            inventoryResource,
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

    gameEntity.registerGameEntity(`${id}_watering_bonus`, {
        tags: ["plantation-watering"],
        name: options.name,
        isAbstract: false,
        description: options.description,
        level: 0,
        icon_id: inventoryResource,
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    [getWateringEffectId(id)]: {
                        A: 1.2,
                        B: 1,
                        C: 0,
                        type: 1,
                    }
                }
            }),
            consumption: {
                resources: {
                    inventory_water: {
                        A: 1.5,
                        B: 0.25,
                        C: -0.25,
                        type: 1
                    },
                }
            },
        },
        unlockCondition: () => {
            return gameResources.isResourceUnlocked(inventoryResource) && gameResources.isResourceUnlocked('inventory_water')
        },
        attributes: {

        },
    })

}

export function registerPlantations () {

    registerPlant('berry_plantation', 'inventory_berry', 0.1, 5000, {
        name: 'Grow Berries',
        description: 'Just plant some berries... OK?'
    })

    registerPlant('fly_mushroom_plantation', 'inventory_fly_mushroom', 0.05, 2000, {
        name: 'Grow Fly Mushroom',
        description: 'They say you are druggie, but never mind — you are a mage.'
    })

    registerPlant('golden_algae_plantation', 'inventory_golden_algae', 0.04, 2000, {
        name: 'Grow Golden Algae',
        description: 'Grow Golden Algae.'
    })

    registerPlant('knowledge_moss_plantation', 'inventory_knowledge_moss', 0.04, 2000, {
        name: 'Grow Knowledge Moss',
        description: 'Grow Knowledge Moss.'
    })

    registerPlant('core_duckweed_plantation', 'inventory_core_duckweed', 0.04, 2000, {
        name: 'Grow Duckweed',
        description: 'Grow core duckweed.'
    })

    registerPlant('aloe_vera_plantation', 'inventory_aloe_vera', 0.02, 400, {
        name: 'Grow Aloe Vera',
        description: 'Grow some aloe vera'
    })

    registerPlant('ginseng_plantation', 'inventory_ginseng', 0.02, 400, {
        name: 'Grow Ginseng',
        description: 'Grow some ginseng'
    })

    registerPlant('nightshade_plantation', 'inventory_nightshade', 0.01, 300, {
        name: 'Grow Nightshade',
        description: 'Grow some nightshade'
    })


    registerPlant('harmony_blossom_plantation', 'inventory_harmony_blossom', 0.01, 500, {
        name: 'Grow Harmony Blossom',
        description: 'Grow Harmony Blossom'
    })

    registerPlant('ember_leaf_plantation', 'inventory_ember_leaf', 0.01, 500, {
        name: 'Grow Ember Leaf',
        description: 'Grow Ember Leaf'
    })

    registerPlant('mystic_bloom_plantation', 'inventory_mystic_bloom', 0.01, 500, {
        name: 'Grow Mystic Bloom',
        description: 'Grow Mystic Bloom'
    })
}