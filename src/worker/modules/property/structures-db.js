import {gameEntity, gameCore, gameEffects, gameResources} from "game-framework"


const getResourceModifierDataSearchable = (rs) => {

    const searchables = {
        'effects': [],
        'resources': []
    };

    if(!rs) return searchables;


    ['income', 'consumption', 'multiplier', 'rawCap', 'capMult'].forEach(scope => {
        let rObj = null;
        if(rs[`get_${scope}`]) {
            rObj = rs[`get_${scope}`]();
        } else {
            rObj = rs[scope];
        }
        if(!rObj) return;

        for(const type in rObj) {
            searchables[type].push(...Object.keys(rObj[type]).map(one => type === 'resources' ? gameResources.getResource(one).name.toLowerCase() : gameEffects.getEffect(one)?.name.toLowerCase()))
        }
    })

    return searchables;
}

export const registerStructure = (id, options) => {

    options.searchableMeta = getResourceModifierDataSearchable(options.resourceModifier);

    gameEntity.registerGameEntity(id, options);
}


export const registerStructuresStage1 = () => {

    const charismaMod = (attr) => attr > 0 ? 1. / (1. + 0.02*Math.log2(attr*gameEffects.getEffectValue('prices_discount'))) : 1.;

    registerStructure('structure_hut', {
        tags: ["structure", "upgrade", "purchaseable", "living"],
        name: 'Hut',
        description: 'Build a hut on your land to get better place to live and store your goods',
        level: 0,
        maxLevel: 10,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_constructing') > 0;
        },
        resourceModifier: {
            income: {
                resources: {
                    'living_space': {
                        A: 2,
                        B: 0,
                        type: 0,
                    }
                }
            },
        },
        get_cost: () => ({
            'coins': {
                A: 2,
                B: 20000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            },
            'inventory_wooden_beam': {
                A: 1.2,
                B: 2,
                type: 1
            }
        }),
    })

    registerStructure('structure_tinkers_shed', {
        tags: ["structure", "upgrade", "purchaseable", "crafting"],
        name: 'Tinkers Shed',
        description: 'A crooked, smoky shack cobbled together from planks and determination. Half workshop, half alchemical corner — cramped, but surprisingly efficient.',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_constructing') > 0;
        },
        resourceModifier: {
            get_income: () => ({
                effects: {
                    'crafting_effort': {
                        A: 0.01 * gameEffects.getEffectValue('tinkers_shed_crafting_bonus'),
                        B: 0,
                        type: 0,
                    },
                    'alchemy_effort': {
                        A: 0.01 * gameEffects.getEffectValue('tinkers_shed_alchemy_bonus'),
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
                        type: 0,
                    }
                }
            },
            effectDeps: ['tinkers_shed_crafting_bonus', 'tinkers_shed_alchemy_bonus']
        },
        get_cost: () => ({
            'inventory_wooden_beam': {
                A: 1.2,
                B: 2,
                type: 1
            },
            'inventory_herbal_fibers': {
                A: 1.2,
                B: 0.25,
                type: 1
            },
            'living_space': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })

    registerStructure('structure_herbs_plantation', {
        tags: ["structure", "upgrade", "purchaseable", "planting"],
        name: 'Herbs Plantation',
        description: 'Devote some space for plantations to grow your very own herbs and plants',
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
            'inventory_wooden_beam': {
                A: 1.5,
                B: 5,
                type: 1
            },
            'living_space': {
                A: 0,
                B: 3,
                type: 0
            }
        }),
    })

    registerStructure('structure_well', {
        tags: ["structure", "upgrade", "purchaseable", "planting"],
        name: 'Well',
        description: 'Dig well to make watering process more efficient, increasing plants growth rate',
        level: 0,
        getMaxLevel: () => {
            return 5 + gameEffects.getEffectValue('max_wells');
        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_herbalists_handbook') > 0 && gameResources.isResourceUnlocked('inventory_stone_brick');
        },
        resourceModifier: {
            income: {
                effects: {
                    'plantations_efficiency': {
                        A: 0.2,
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
            'inventory_stone_brick': {
                A: 1.5,
                B: 5,
                type: 1
            },
            'living_space': {
                A: 0,
                B: 2,
                type: 0
            }
        }),
    })

    registerStructure('structure_stone_workshop', {
        tags: ["structure", "upgrade", "purchaseable", "crafting"],
        name: 'Stone Workshop',
        description: 'A sturdy workshop built with stone bricks, providing excellent conditions for crafting',
        level: 0,
        getMaxLevel: () => 5 + gameEffects.getEffectValue('stone_workshop_max_level_bonus'),
        unlockCondition: () => {
            return gameResources.isResourceUnlocked('inventory_stone_brick')
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'crafting_effort': {
                        A: 0.2,
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
            'inventory_stone_brick': {
                A: 1.5,
                B: 10,
                type: 1
            },
            'living_space': {
                A: 0,
                B: 3,
                type: 0
            }
        }),
    })

    registerStructure('structure_dry_storage', {
        tags: ["structure", "upgrade", "purchaseable", "herbalism"],
        name: 'Dry Storage',
        description: 'A specialized stone building designed to maintain optimal conditions for drying herbs. Enhances the efficiency of your Herbalist\'s Drying Rack.',
        level: 0,
        getMaxLevel: () => 5 + gameEffects.getEffectValue('dry_storage_max_level_bonus'),
        unlockCondition: () => {
            return gameResources.isResourceUnlocked('inventory_stone_brick')
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'drying_rack_efficiency': {
                        A: 0.2,
                        B: 1,
                        type: 0
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
            'inventory_stone_brick': {
                A: 1.5,
                B: 8,
                type: 1
            },
            'living_space': {
                A: 0,
                B: 2,
                type: 0
            }
        }),
    })

    registerStructure('structure_underground_cellar', {
        tags: ["structure", "upgrade", "purchaseable", "storage"],
        name: 'Underground Cellar',
        description: 'A deep stone cellar built underground, providing secure storage for your wealth. Being underground, it doesn\'t require living space.',
        level: 0,
        maxLevel: 25,
        unlockCondition: () => {
            return gameResources.isResourceUnlocked('inventory_stone_brick')
        },
        resourceModifier: {
            get_capMult: () => ({
                resources: {
                    coins: {
                        A: 0.2,
                        B: 1,
                        type: 0
                    }
                }
            }),
        },
        get_cost: () => ({
            'inventory_stone_brick': {
                A: 1.5,
                B: 5,
                type: 1
            }
        }),
    })

    registerStructure('structure_lumber_mill', {
        tags: ["structure", "upgrade", "purchaseable", "resource", "crafting", "industrial"],
        name: 'Lumber Mill',
        description: 'A large industrial facility for processing wood into refined materials. Requires advanced machinery to operate.',
        level: 0,
        maxLevel: 10,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_constructing') > 0 && gameEntity.getLevel('shop_item_machinery') > 0 && gameEntity.isEntityUnlocked('action_mining');
        },
        resourceModifier: {
            get_multiplier: () => ({
                resources: {
                    'inventory_refined_wood': {
                        A: 0.1 * gameEffects.getEffectValue('industrial_efficiency') * gameEffects.getEffectValue('lumbermill_efficiency'),
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
            effectDeps: ['industrial_efficiency', 'lumbermill_efficiency']
        },
        get_cost: () => ({
            'inventory_stone_brick': {
                A: 1.5,
                B: 25,
                type: 1
            },
            'inventory_wooden_beam': {
                A: 1.5,
                B: 10,
                type: 1
            },
            'inventory_iron_plate': {
                A: 1.5,
                B: 5,
                type: 1
            },
            'living_space': {
                A: 0,
                B: 2,
                type: 0
            }
        }),
    })

    registerStructure('structure_stone_hut', {
        tags: ["structure", "upgrade", "purchaseable", "living"],
        name: 'Stone Hut',
        description: 'A sturdy stone hut providing more living space than a wooden one',
        level: 0,
        getMaxLevel: () => 5 + gameEffects.getEffectValue('stone_hut_max_level_bonus'),
        unlockCondition: () => {
            return gameResources.isResourceUnlocked('inventory_iron_ore');
        },
        resourceModifier: {
            income: {
                resources: {
                    'living_space': {
                        A: 4, // Більше ніж звичайна хибара (2)
                        B: 0,
                        type: 0,
                    }
                }
            },
        },
        get_cost: () => ({
            'inventory_stone_brick': {
                A: 1.5,
                B: 45,
                type: 1
            },
            'inventory_wooden_beam': {
                A: 1.5,
                B: 20,
                type: 1
            },
            'inventory_iron_plate': {
                A: 1.5,
                B: 10,
                type: 1
            }
        }),
    })

    registerStructure('structure_tool_workbench', {
        tags: ["structure", "upgrade", "purchaseable", "crafting"],
        name: 'Tool Workbench',
        description: 'A specialized workbench for crafting and maintaining tools. Works in synergy with your Tinker\'s Shed.',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('structure_tinkers_shed') > 0 && gameEntity.getLevel('shop_item_machinery') > 0;
        },
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    'tinkers_shed_crafting_bonus': {
                        A: 0.2,
                        B: 1,
                        type: 0,
                    },
                    'masters_table_efficiency': {
                        A: gameEffects.getEffectValue('masters_table_workbench_bonus'),
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
            effectDeps: ['masters_table_workbench_bonus'],
        },
        get_cost: () => ({
            'inventory_stone_brick': {
                A: 1.5,
                B: 25,
                type: 1
            },
            'inventory_iron_plate': {
                A: 1.5,
                B: 5,
                type: 1
            },
            'living_space': {
                A: 0,
                B: 2,
                type: 0
            }
        }),
    })

    registerStructure('structure_trade_stall', {
        tags: ["structure", "upgrade", "purchaseable", "trading"],
        name: 'Trade Stall',
        description: 'A simple wooden stall for selling goods. Increases the rate at which market stock renews.',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_market_license') > 0;
        },
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    'shop_stock_renew_rate': {
                        A: 0.5,
                        B: 1,
                        type: 0,
                    },
                    'social_training_learning_rate': {
                        A: gameEffects.getEffectValue('trade_stall_social_learning_bonus'),
                        B: 1,
                        type: 0,
                    },
                },
                resources: {
                    'knowledge': {
                        A: gameEffects.getEffectValue('trade_stall_knowledge_bonus'),
                        B: 1,
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
            effectDeps: ['shop_stock_renew_rate', 'social_training_rate', 'trade_stall_social_learning_bonus', 'trade_stall_knowledge_bonus']
        },
        get_cost: () => ({
            'inventory_wooden_beam': {
                A: 1.5,
                B: 30,
                type: 1
            },
            'inventory_stone_brick': {
                A: 1.5,
                B: 20,
                type: 1
            },
            'living_space': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })

    registerStructure('structure_trade_warehouse', {
        tags: ["structure", "upgrade", "purchaseable", "trading"],
        name: 'Trade Warehouse',
        description: 'A large storage facility for trading goods. Increases the maximum amount of items that can be sold.',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_market_license') > 0;
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'shop_max_stock': {
                        A: 1.0,
                        B: 1,
                        type: 0,
                    }
                }
            },
            get_capMult: () => ({
                resources: {
                    'coins': {
                        A: gameEffects.getEffectValue('trade_warehouse_coins_cap_bonus'),
                        B: 1,
                        type: 0,
                    }
                }
            }),
            consumption: {
                resources: {
                    'living_space': {
                        A: 3,
                        B: 0,
                        type: 0
                    }
                }
            },
            effectDeps: ['shop_max_stock', 'trade_warehouse_coins_cap_bonus']
        },
        get_cost: () => ({
            'inventory_stone_brick': {
                A: 1.5,
                B: 450,
                type: 1
            },
            'inventory_iron_plate': {
                A: 1.5,
                B: 75,
                type: 1
            },
            'living_space': {
                A: 0,
                B: 3,
                type: 0
            }
        }),
    })

    registerStructure('structure_library', {
        tags: ["structure", "upgrade", "purchaseable", "education"],
        name: 'Library',
        description: 'A grand library filled with knowledge and wisdom. Each level provides a bonus to learning rate.',
        level: 0,
        unlockCondition: () => {
            return gameEntity.isEntityUnlocked('action_clay_mining');
        },
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    'learning_rate': {
                        A: 0.1,
                        B: 1,
                        type: 0,
                    }
                }
            }),
            consumption: {
                resources: {
                    'living_space': {
                        A: 3,
                        B: 0,
                        type: 0
                    }
                }
            },
            effectDeps: ['learning_rate']
        },
        get_cost: () => ({
            'inventory_wooden_beam': {
                A: 1.5,
                B: 50,
                type: 1
            },
            'inventory_stone_brick': {
                A: 1.5,
                B: 140,
                type: 1
            },
            'inventory_clay': {
                A: 1.5,
                B: 90,
                type: 1
            },
            'inventory_iron_plate': {
                A: 1.5,
                B: 25,
                type: 1
            },
            'living_space': {
                A: 0,
                B: 3,
                type: 0
            }
        }),
    })

    registerStructure('structure_smelter', {
        tags: ["structure", "upgrade", "purchaseable", "resource", "crafting", "industrial"],
        name: 'Smelter',
        description: 'A large industrial smelter for processing iron ore into iron plates. Significantly boosts iron plate production.',
        level: 0,
        maxLevel: 4,
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_strength',
            level: 2500,
        }],
        unlockCondition: () => {
            return true;
        },
        resourceModifier: {
            get_multiplier: () => ({
                resources: {
                    'inventory_iron_plate': {
                        A: 0.2 * gameEffects.getEffectValue('industrial_efficiency'),
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
            effectDeps: ['industrial_efficiency']
        },
        get_cost: () => ({
            'coins': {
                A: 2,
                B: 8.e+8*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            },
            'inventory_stone_brick': {
                A: 1.5,
                B: 1000,
                type: 1
            },
            'living_space': {
                A: 0,
                B: 2,
                type: 0
            }
        }),
    })

    registerStructure('structure_event_hall', {
        tags: ["structure", "upgrade", "purchaseable", "events"],
        name: 'Event Hall',
        description: 'A grand hall for organizing social events and gatherings. Unlocks the ability to organize various events that provide temporary and permanent bonuses.',
        level: 0,
        maxLevel: 1,
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_charisma',
            level: 2000,
        }],
        unlockCondition: () => {
            return gameEffects.getEffectValue('attribute_charisma') >= 2000;
        },
        resourceModifier: {
            consumption: {
                resources: {
                    'living_space': { A: 5, B: 0, type: 0 }
                }
            }
        },
        get_cost: () => ({
            'coins': { A: 1.5, B: 1000000000, type: 1 },
            'inventory_stone_brick': { A: 1.5, B: 7500, type: 1 },
            'inventory_iron_plate': { A: 1.5, B: 100, type: 1 },
            'living_space': { A: 0, B: 5, type: 0 }
        }),
    })

    registerStructure('structure_pottery_cellar', {
        tags: ["structure", "upgrade", "purchaseable", "alchemy"],
        name: 'Pottery Cellar',
        description: 'A specialized storage facility using ceramic pots to preserve potions and ingredients more effectively.',
        level: 0,
        maxLevel: 5,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_pottery_secrets_handbook') > 0;
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'alchemy_materials_discount': {
                        A: 0.2,
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
            },
            effectDeps: ['alchemy_materials_discount']
        },
        get_cost: () => ({
            'inventory_stone_brick': {
                A: 1.5,
                B: 50,
                type: 1
            },
            'inventory_pot': {
                A: 1.5,
                B: 10,
                type: 1
            },
            'living_space': {
                A: 0,
                B: 2,
                type: 0
            }
        }),
    })

    registerStructure('structure_masonry_cottage', {
        tags: ["structure", "upgrade", "purchaseable", "living"],
        name: 'Masonry Cottage',
        description: 'A sturdy stone cottage with ceramic elements. Provides significant living space.',
        level: 0,
        maxLevel: 10,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_advanced_engineering') > 0;
        },
        resourceModifier: {
            income: {
                resources: {
                    'living_space': {
                        A: 5,
                        B: 0,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'living_space': {
                        A: 0,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'inventory_stone_brick': {
                A: 1.5,
                B: 2000,
                type: 1
            },
            'inventory_wooden_beam': {
                A: 1.5,
                B: 5000,
                type: 1
            },
            'inventory_pot': {
                A: 1.5,
                B: 125,
                type: 1
            }
        }),
    })

    registerStructure('structure_alchemist_laboratory', {
        tags: ["structure", "upgrade", "purchaseable", "alchemy"],
        name: 'Alchemist Laboratory',
        description: 'A specialized laboratory for advanced alchemical research. Significantly boosts alchemy effort.',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_advanced_engineering') > 0;
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'alchemy_effort': {
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
            },
            effectDeps: ['alchemy_effort']
        },
        get_cost: () => ({
            'inventory_stone_brick': {
                A: 1.5,
                B: 1000,
                type: 1
            },
            'inventory_pot': {
                A: 1.5,
                B: 120,
                type: 1
            },
            'living_space': {
                A: 0,
                B: 3,
                type: 0
            }
        }),
    })

    // Hydraulic Press — increases max levels of Dry Storage and Stone Workshop by +2 per level
    registerStructure('structure_hydraulic_press', {
        tags: ["structure", "upgrade", "purchaseable", "industrial"],
        name: 'Hydraulic Press',
        description: 'A powerful hydraulic press enabling advanced processing and structural reinforcement.',
        level: 0,
        maxLevel: 5,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_press_technology') > 0 &&
                   gameResources.isResourceUnlocked('inventory_water') &&
                   gameResources.isResourceUnlocked('inventory_stone_brick');
        },
        resourceModifier: {
            get_income: () => ({
                effects: {
                    // +2 max level per Hydraulic Press level (additive)
                    'dry_storage_max_level_bonus': { A: 2, B: 0, type: 0 },
                    'stone_workshop_max_level_bonus': { A: 2, B: 0, type: 0 },
                }
            }),
            consumption: {
                resources: {
                    'living_space': { A: 2, B: 0, type: 0 }
                }
            }
        },
        get_cost: () => ({
            'inventory_water': { A: 1.5, B: 25000, type: 1 },
            'inventory_forged_steel': { A: 1.5, B: 10000, type: 1 },
            'inventory_stone_brick': { A: 1.5, B: 37500, type: 1 },
            'living_space': { A: 0, B: 2, type: 0 },
        }),
    })
}