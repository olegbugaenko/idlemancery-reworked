import { gameEntity, gameCore, gameEffects } from "game-framework"

export const registerFurnitureStage1 = () => {

    const charismaMod = (attr) => attr > 0 ? 1. / (1. + 0.02*Math.log2(attr)) : 1.;

    gameEntity.registerGameEntity('furniture_sleeping_bag', {
        tags: ["furniture", "upgrade", "purchaseable"],
        name: 'Sleeping Bag',
        description: 'Elementary place where you can sleep. Improves rest efficiency',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return true;
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'rest_efficiency': {
                        A: 0.25,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'living_space': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'coins': {
                A: 2,
                B: 50*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            },
            'living_space': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('furniture_cart', {
        tags: ["furniture", "upgrade", "purchaseable"],
        name: 'Cart',
        description: 'Easy and convenient cart for better transportation of gathered things. Improves gathering efficiency',
        level: 0,
        maxLevel: 2,
        unlockCondition: () => {
            return true;
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'gathering_efficiency': {
                        A: 0.5,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'living_space': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'coins': {
                A: 2,
                B: 30*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            },
            'living_space': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('furniture_urn', {
        tags: ["furniture", "upgrade", "purchaseable"],
        name: 'Urn',
        description: 'Small urn to store more gold',
        level: 0,
        unlockCondition: () => {
            return true;
        },
        resourceModifier: {
            get_rawCap: () => ({
                resources: {
                    'coins': {
                        A: 75*gameEffects.getEffectValue('urn_storage_bonus'),
                        B: 0,
                        type: 0,
                    }
                }
            }),
            consumption: {
                resources: {
                    'living_space': {
                        A: 2,
                        B: 0,
                        type: 0
                    }
                }
            },
            effectDeps: ['urn_storage_bonus']
        },
        get_cost: () => ({
            'coins': {
                A: 2,
                B: 50*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            },
            'living_space': {
                A: 0,
                B: 2,
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('furniture_book_case', {
        tags: ["furniture", "upgrade", "purchaseable"],
        name: 'Small Book Case',
        description: 'Place some small wooden furniture to place books and notes.',
        level: 0,
        maxLevel: 5,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_library_entrance');
        },
        resourceModifier: {
            multiplier: {
                resources: {
                    'knowledge': {
                        A: 0.25,
                        B: 1,
                        type: 0,
                    }
                }
            },
            capMult: {
                resources: {
                    'knowledge': {
                        A: 0.25,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'living_space': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'coins': {
                A: 2,
                B: 100*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            },
            'living_space': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })
}