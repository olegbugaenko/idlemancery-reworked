import { gameEntity, gameCore, gameEffects } from "game-framework"

export const registerShopItemsStage1 = () => {

    const charismaMod = (attr) => attr > 0 ? 1. / (1. + 0.02*Math.log2(attr)) : 1.;

    gameEntity.registerGameEntity('shop_item_hat', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Hat',
        description: 'Purchase a hat to collect more coins from begging and have a bit more place to store them',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return true;
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'begging_efficiency': {
                        A: 0.25,
                        B: 1,
                        type: 0,
                    }
                }
            },
            rawCap: {
                resources: {
                    'coins': {
                        A: 3,
                        B: 0,
                        type: 0,
                    }
                }
            }
        },
        get_cost: () => ({
            'coins': {
                A: 2,
                B: 2*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('shop_item_notebook', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Notebook',
        description: 'Allows you for planning your actions. Unlocks actions list',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_hat') > 0
        },
        attributes: {
            isCollectable: false,
        },
        get_cost: () => ({
            'coins': {
                A: 2,
                B: 5*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 0
            }
        })
    })

    gameEntity.registerGameEntity('shop_item_bag', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Bag',
        description: 'Purchase a bag to store more coins',
        level: 0,
        maxLevel: 9,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_hat') > 0
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            rawCap: {
                resources: {
                    'coins': {
                        A: 5,
                        B: 0,
                        type: 0,
                    }
                }
            }
        },
        get_cost: () => ({
            'coins': {
                A: 5*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                B: 5*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 0
            }
        })
    })

    gameEntity.registerGameEntity('shop_item_slippers', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Repair Slippers',
        description: 'Your slippers are old, but better than nothing. If you repair it, it could make you feel more comfortable and warm',
        level: 0,
        maxLevel: 5,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_hat') > 0
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'walking_learning_rate': {
                        A: 0.2,
                        B: 1,
                        type: 0,
                    }
                }
            }
        },
        get_cost: () => ({
            'coins': {
                A: 1.5,
                B: 5*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            }
        })
    })

    gameEntity.registerGameEntity('shop_item_dairy', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Dairy',
        description: 'Use your dairy to write up what you have learned everyday. Improves learning rate',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_notebook') > 0
        },
        attributes: {
            isCollectable: false,
        },
        get_cost: () => ({
            'coins': {
                A: 2,
                B: 10*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 0
            }
        }),
        resourceModifier: {
            multiplier: {
                effects: {
                    'learning_rate': {
                        A: 0.2,
                        B: 1,
                        type: 0,
                    }
                }
            }
        },
    })

    gameEntity.registerGameEntity('shop_item_book_of_motivation', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Book of Motivation',
        description: 'Purchase a book that you can read when you have time. Maybe you will find something useful there',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_dairy') > 0
        },
        attributes: {
            isCollectable: false,
        },
        get_cost: () => ({
            'coins': {
                A: 2,
                B: 20*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('shop_item_panpipe', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Panpipe',
        description: 'Perform some primitive show to improve begging efficiency',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_bag') > 1
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'begging_efficiency': {
                        A: 0.2,
                        B: 1,
                        type: 0,
                    }
                }
            }
        },
        get_cost: () => ({
            'coins': {
                A: 2,
                B: 25*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('shop_item_shovel', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Shovel',
        description: 'Primitive tool to increase your working at stable efficiency',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_bag') > 1 && gameEntity.getLevel('action_clean_stable') > 1
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'clean_stable_efficiency': {
                        A: 0.2,
                        B: 1,
                        type: 0,
                    }
                }
            }
        },
        get_cost: () => ({
            'coins': {
                A: 2,
                B: 30*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('shop_item_backpack', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Backpack',
        description: 'Unlocks inventory and items',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_bag') > 3
        },
        attributes: {
            isCollectable: false,
        },
        get_cost: () => ({
            'coins': {
                A: 2,
                B: 30*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('shop_item_tent', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Tent',
        description: 'Purchase your very first living property. Not really comfortable, but better than nothing',
        level: 0,
        maxLevel: 5,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_bag') > 4
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            income: {
                resources: {
                    'living_space': {
                        A: 2,
                        B: 3,
                        type: 0,
                    }
                }
            }
        },
        get_cost: () => ({
            'coins': {
                A: 2.25,
                B: 40*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            }
        }),
    })

    gameEntity.registerGameEntity('shop_item_better_urns', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Better Urns',
        description: 'Purchase better urns to increase their capacity',
        level: 0,
        maxLevel: 3,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_tent') > 0
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'urn_storage_bonus': {
                        A: 0.5,
                        B: 1,
                        type: 0,
                    }
                }
            }
        },
        get_cost: () => ({
            'coins': {
                A: 2.25,
                B: 120*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            }
        }),
    })

    gameEntity.registerGameEntity('shop_item_library_entrance', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Entrance To Library',
        description: 'Invest some coins you have earned into your own development',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_tent') > 0
        },
        attributes: {
            isCollectable: false,
        },
        get_cost: () => ({
            'coins': {
                A: 2,
                B: 200*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 0
            }
        }),
    })
}