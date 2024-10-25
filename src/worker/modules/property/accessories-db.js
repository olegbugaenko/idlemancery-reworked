import { gameEntity, gameCore, gameEffects } from "game-framework"

export const registerAccessoriesStage1 = () => {

    gameEntity.registerGameEntity('accessory_wooden_casket', {
        tags: ["accessory", "upgrade", "purchaseable"],
        name: 'Wooden Casket',
        description: 'Create compact and easy to handle wooden caskets to improve your coins storage',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_crafting_courses') > 0;
        },
        resourceModifier: {
            capMult: {
                resources: {
                    'coins': {
                        A: 0.02,
                        B: 1,
                        type: 0,
                    }
                }
            },
        },
        get_cost: () => ({
            'inventory_refined_wood': {
                A: 1.1,
                B: 1,
                type: 1
            }
        }),
    })


    gameEntity.registerGameEntity('accessory_wooden_talisman', {
        tags: ["accessory", "upgrade", "purchaseable"],
        name: 'Wooden Talisman',
        description: 'Create wooden talisman that holds information about your bio-rhythms and improve your health regeneration',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_crafting_courses') > 0;
        },
        resourceModifier: {
            multiplier: {
                resources: {
                    'health': {
                        A: 0.02,
                        B: 1,
                        type: 0,
                    }
                }
            },
        },
        get_cost: () => ({
            'inventory_refined_wood': {
                A: 1.1,
                B: 2,
                type: 1
            },
            'knowledge': {
                A: 1.1,
                B: 20,
                type: 1
            }
        }),
    })


    gameEntity.registerGameEntity('accessory_wooden_bookcase', {
        tags: ["accessory", "upgrade", "purchaseable"],
        name: 'Wooden Bookcase',
        description: 'Minimalistic and very convenient bookcase can significantly increase amount of books you can store, and therefore increase your knowledge cap',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_crafting_courses') > 0;
        },
        resourceModifier: {
            capMult: {
                resources: {
                    'knowledge': {
                        A: 0.02,
                        B: 1,
                        type: 0,
                    }
                }
            },
        },
        get_cost: () => ({
            'inventory_refined_wood': {
                A: 1.1,
                B: 1,
                type: 1
            }
        }),
    })
}