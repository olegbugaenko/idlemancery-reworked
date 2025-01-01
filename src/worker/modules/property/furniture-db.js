import { gameEntity, gameCore, gameEffects } from "game-framework"

export const registerFurnitureStage1 = () => {

    const charismaMod = (attr) => attr > 0 ? 1. / (1. + 0.02*Math.log2(attr*gameEffects.getEffectValue('prices_discount'))) : 1.;

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
                        A: 1,
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
                B: 1,
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

    gameEntity.registerGameEntity('furniture_armchair', {
        tags: ["furniture", "upgrade", "purchaseable"],
        name: 'Armchair',
        description: 'Looking quite oddly, but comfortable',
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
                B: 75*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            },
            'living_space': {
                A: 0,
                B: 2,
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('furniture_basin_bowl', {
        tags: ["furniture", "upgrade", "purchaseable"],
        name: 'Basin Bowl',
        description: 'A small bowl or basin filled with water, typically used for washing hands or face.',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_tent') > 3;
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'rest_efficiency': {
                        A: 0.5,
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

    gameEntity.registerGameEntity('furniture_yoga_carpet', {
        tags: ["furniture", "upgrade", "purchaseable"],
        name: 'Yoga Carpet',
        description: 'Use it for your daily yoga practices, increasing yoga XP rate',
        level: 0,
        maxLevel: 6,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_yoga_manual') > 0;
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'yoga_learn_speed': {
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
                B: 1,
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
                B: 1,
                type: 0
            }
        }),
    })


    gameEntity.registerGameEntity('furniture_gym', {
        tags: ["furniture", "upgrade", "purchaseable"],
        name: 'Personal Gym',
        description: 'Provide better inventory to improve physical training efficiency',
        level: 0,
        maxLevel: 10,
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_strength',
            level: 225,
        }],
        unlockCondition: () => {
            return true;
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'physical_training_learn_speed': {
                        A: 0.2,
                        B: 1,
                        type: 0,
                    }
                }
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
                A: 2,
                B: 100000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            },
            'living_space': {
                A: 0,
                B: 3,
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
        maxLevel: 4,
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
        description: 'Improves your illusion magic efficiency',
        level: 0,
        maxLevel: 4,
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


    gameEntity.registerGameEntity('furniture_spirit_crystal', {
        tags: ["furniture", "upgrade", "purchaseable"],
        name: 'Spirit Crystal',
        description: 'Magic spirit captured into crystal provides significant amplifier to your magical capabilities',
        level: 0,
        maxLevel: 5,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_spiritualism') > 0;
        },
        resourceModifier: {
            capMult: {
                resources: {
                    'mana': {
                        A: 0.2,
                        B: 1,
                        type: 0,
                    }
                },
            },
            multiplier: {
                resources: {
                    'mana': {
                        A: 0.1,
                        B: 1,
                        type: 0,
                    }
                }
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
                A: 2,
                B: 100000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            },
            'living_space': {
                A: 0,
                B: 3,
                type: 0
            }
        }),
    })


    gameEntity.registerGameEntity('furniture_spell_analyzer', {
        tags: ["furniture", "upgrade", "purchaseable"],
        name: 'Spell Analyzer',
        description: 'Device that capturing acoustic and energetic waves from your spells, and provide you waves histogram for further analysis and learning',
        level: 0,
        maxLevel: 5,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_spiritualism') > 0;
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'spell_xp_rate': {
                        A: 0.25,
                        B: 1,
                        type: 0,
                    }
                }
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
                A: 2,
                B: 100000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
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


    gameEntity.registerGameEntity('furniture_cauldron', {
        tags: ["furniture", "upgrade", "purchaseable"],
        name: 'Cauldron',
        description: 'Provides additional space for alchemy, revealing new alchemy slot',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_alchemy_courses') > 0;
        },
        resourceModifier: {
            income: {
                resources: {
                    'alchemy_slots': {
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

    gameEntity.registerGameEntity('furniture_chemistry_lab_equipment', {
        tags: ["furniture", "upgrade", "purchaseable"],
        name: 'Chemistry Lab',
        description: 'Place some additional equipment to improve your ability of studying chemical reactions between ingredients',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_alchemy_courses') > 0;
        },
        resourceModifier: {
            multiplier: {
                resources: {
                    'alchemy_ability': {
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


    gameEntity.registerGameEntity('furniture_drying_rack', {
        tags: ["furniture", "upgrade", "purchaseable"],
        name: 'Herbalist\'s Drying Rack\n',
        description: 'This rustic wooden rack is woven with strands of enchanted twine, used by skilled herbalists to preserve the potency of rare plants. Hanging bunches of herbs and roots sway gently, their fragrance filling the room and infusing the air with traces of ancient magic. With this rack, even common plants yield their highest quality, providing you a greater chance to find potent herbs in the wild.',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_alchemy_courses') > 0;
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'gathering_herbs_amount': {
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
                B: 120000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            },
            'living_space': {
                A: 0,
                B: 2,
                type: 0
            }
        }),
    })



    gameEntity.registerGameEntity('furniture_herbs_plantation', {
        tags: ["furniture", "upgrade", "purchaseable"],
        name: 'Herbs Plantation',
        description: 'Devote some space for platations to grow your very own herbs and plants',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_herbalists_handbook') > 0;
        },
        resourceModifier: {
            income: {
                resources: {
                    'plantation_slots': {
                        A: 1,
                        B: 0,
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
                B: 1000000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            },
            'living_space': {
                A: 0,
                B: 3,
                type: 0
            }
        }),
    })




    gameEntity.registerGameEntity('furniture_well', {
        tags: ["furniture", "upgrade", "purchaseable"],
        name: 'Well',
        description: 'Dig well to make watering process more efficient, increasing plants growth rate',
        level: 0,
        maxLevel: 4,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_herbalists_handbook') > 0;
        },
        resourceModifier: {
            income: {
                effects: {
                    'plantations_efficiency': {
                        A: 0.25,
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
                B: 1000000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            },
            'living_space': {
                A: 0,
                B: 2,
                type: 0
            }
        }),
    })



    gameEntity.registerGameEntity('furniture_tools_workshop', {
        tags: ["furniture", "upgrade", "purchaseable"],
        name: 'Tools Workshop',
        description: 'Provides you with some place and instruments to repair your tools, increasing your manual-labor actions efficiency',
        level: 0,
        maxLevel: 6,
        unlockCondition: () => {
            return gameEntity.isEntityUnlocked('action_woodcutter') > 0;
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'manual_labor_efficiency': {
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
                B: 600000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            },
            'living_space': {
                A: 0,
                B: 3,
                type: 0
            }
        }),
    })


    gameEntity.registerGameEntity('furniture_fertilizing_station', {
        tags: ["furniture", "upgrade", "purchaseable"],
        name: 'Fertilizing Station',
        description: 'Purchase some basic tools for analyzing soil on your plantations and further increase your plantations efficiency',
        level: 0,
        maxLevel: 4,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_soil_manual') > 0;
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'plantations_efficiency': {
                        A: 0.25,
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
                B: 1500000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
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