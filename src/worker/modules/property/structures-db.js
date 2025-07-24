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
        tags: ["structure", "upgrade", "purchaseable", "actions"],
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
        tags: ["structure", "upgrade", "purchaseable", "actions"],
        name: 'Tinkers Shed',
        description: 'A crooked, smoky shack cobbled together from planks and determination. Half workshop, half alchemical corner — cramped, but surprisingly efficient.',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_constructing') > 0;
        },
        resourceModifier: {
            income: {
                effects: {
                    'crafting_effort': {
                        A: 0.01,
                        B: 0,
                        type: 0,
                    },
                    'alchemy_effort': {
                        A: 0.01,
                        B: 0,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'living_space': {
                        A: 1,
                        B: 0,
                        type: 0,
                    }
                }
            }
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
        maxLevel: 5,
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
        maxLevel: 5,
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
}