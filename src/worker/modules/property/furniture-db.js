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
                B: 40*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            },
            'living_space': {
                A: 0,
                B: 2,
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('furniture_table', {
        tags: ["furniture", "upgrade", "purchaseable"],
        name: 'Table',
        description: 'Place some table where you can sit and put down notes or read books.',
        level: 0,
        maxLevel: 2,
        unlockCondition: () => {
            return true;
        },
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    'learning_rate': {
                        A: 0.25,
                        B: 1,
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
        maxLevel: 3,
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

    gameEntity.registerGameEntity('furniture_lump', {
        tags: ["furniture", "upgrade", "purchaseable"],
        name: 'Oil Lamp',
        description: 'Brighten your living space for more convenient reading, writing and learning',
        level: 0,
        maxLevel: 5,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_library_entrance') > 0 && gameEntity.getLevel('furniture_table') > 0;
        },
        resourceModifier: {
            multiplier: {
                resources: {
                    'knowledge': {
                        A: 0.1,
                        B: 1,
                        type: 0,
                    }
                },
                effects: {
                    'learning_rate': {
                        A: 0.1,
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
                B: 250*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            },
            'living_space': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('furniture_cot', {
        tags: ["furniture", "upgrade", "purchaseable"],
        name: 'Cot',
        description: 'Old and smelly, but much better than your sleep bag',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_tent') > 3;
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'rest_efficiency': {
                        A: 0.4,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'living_space': {
                        A: 2,
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
                B: 2,
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('furniture_workout_bench', {
        tags: ["furniture", "upgrade", "purchaseable"],
        name: 'Workout Bench',
        description: 'Provide some elementary inventory to improve physical training efficiency, like Training Endurance',
        level: 0,
        maxLevel: 4,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_tent') > 3 && gameEntity.getLevel('action_pushup') > 4;
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'physical_training_learn_speed': {
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
                B: 150*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            },
            'living_space': {
                A: 0,
                B: 2,
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('furniture_magic_orb', {
        tags: ["furniture", "upgrade", "purchaseable"],
        name: 'Magic Orb',
        description: 'Place magic orb to improve mana regeneration',
        level: 0,
        maxLevel: 4,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_spellbook') > 0;
        },
        resourceModifier: {
            multiplier: {
                resources: {
                    'mana': {
                        A: 0.1,
                        B: 1,
                        type: 0,
                    }
                },
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
                B: 1250*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            },
            'living_space': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })


    gameEntity.registerGameEntity('furniture_candle_holder', {
        tags: ["furniture", "upgrade", "purchaseable"],
        name: 'Candle Holder',
        description: 'Place magic candle holder to further improve mana power',
        level: 0,
        maxLevel: 3,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_spellbook') > 0;
        },
        resourceModifier: {
            multiplier: {
                resources: {
                    'mana': {
                        A: 0.2,
                        B: 1,
                        type: 0,
                    }
                },
            },
            consumption: {
                resources: {
                    'living_space': {
                        A: 2,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'coins': {
                A: 2,
                B: 2500*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            },
            'living_space': {
                A: 0,
                B: 2,
                type: 0
            }
        }),
    })


    gameEntity.registerGameEntity('furniture_mana_orb', {
        tags: ["furniture", "upgrade", "purchaseable"],
        name: 'Mana Orb',
        description: 'Made of mana and glass',
        level: 0,
        maxLevel: 5,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_spellbook') > 0;
        },
        resourceModifier: {
            rawCap: {
                resources: {
                    'mana': {
                        A: 2,
                        B: 0,
                        type: 0,
                    }
                },
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
                B: 5000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            },
            'living_space': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })


    gameEntity.registerGameEntity('furniture_restoration_magic_circle', {
        tags: ["furniture", "upgrade", "purchaseable"],
        name: 'Restoration Magic Circle',
        description: 'Improves your restoration magic efficiency',
        level: 0,
        maxLevel: 5,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_less_restoration') > 0;
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'restoration_spells_efficiency': {
                        A: 0.25,
                        B: 1,
                        type: 0,
                    }
                },
            },
            consumption: {
                resources: {
                    'living_space': {
                        A: 3,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'coins': {
                A: 1.5,
                B: 10000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            },
            'living_space': {
                A: 0,
                B: 3,
                type: 0
            }
        }),
    })


    gameEntity.registerGameEntity('furniture_illusion_magic_circle', {
        tags: ["furniture", "upgrade", "purchaseable"],
        name: 'Illusion Magic Circle',
        description: 'Improves your restoration magic efficiency',
        level: 0,
        maxLevel: 5,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_less_illusion') > 0;
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'illusion_spells_efficiency': {
                        A: 0.25,
                        B: 1,
                        type: 0,
                    }
                },
            },
            consumption: {
                resources: {
                    'living_space': {
                        A: 3,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'coins': {
                A: 1.5,
                B: 10000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            },
            'living_space': {
                A: 0,
                B: 3,
                type: 0
            }
        }),
    })


    gameEntity.registerGameEntity('furniture_crafting_table', {
        tags: ["furniture", "upgrade", "purchaseable"],
        name: 'Crafting Table',
        description: 'Provides additional space for crafting, revealing new crafting slot',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_crafting_courses') > 0;
        },
        resourceModifier: {
            income: {
                resources: {
                    'crafting_slots': {
                        A: 1,
                        B: 0,
                        type: 0,
                    }
                },
            },
            consumption: {
                resources: {
                    'living_space': {
                        A: 2,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'coins': {
                A: 1.5,
                B: 80000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            },
            'living_space': {
                A: 0,
                B: 2,
                type: 0
            }
        }),
    })


    gameEntity.registerGameEntity('furniture_masters_table', {
        tags: ["furniture", "upgrade", "purchaseable"],
        name: 'Master’s Table',
        description: 'Specialized "master’s table" with enhanced tools that boosts crafting efficiency',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_crafting_courses') > 0;
        },
        resourceModifier: {
            multiplier: {
                resources: {
                    'crafting_ability': {
                        A: 0.1,
                        B: 1,
                        type: 0,
                    }
                },
            },
            consumption: {
                resources: {
                    'living_space': {
                        A: 2,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'coins': {
                A: 1.5,
                B: 80000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            },
            'living_space': {
                A: 0,
                B: 2,
                type: 0
            }
        }),
    })


    gameEntity.registerGameEntity('furniture_masters_table', {
        tags: ["furniture", "upgrade", "purchaseable"],
        name: 'Master’s Table',
        description: 'Specialized "master’s table" with enhanced tools that boosts crafting efficiency',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_crafting_courses') > 0;
        },
        resourceModifier: {
            multiplier: {
                resources: {
                    'crafting_ability': {
                        A: 0.1,
                        B: 1,
                        type: 0,
                    }
                },
            },
            consumption: {
                resources: {
                    'living_space': {
                        A: 2,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'coins': {
                A: 1.5,
                B: 80000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            },
            'living_space': {
                A: 0,
                B: 2,
                type: 0
            }
        }),
    })

}