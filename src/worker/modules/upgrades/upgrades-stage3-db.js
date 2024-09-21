import { gameEntity, gameCore } from "game-framework"

export const upgradesStage3Db = () => {

    gameEntity.registerGameEntity('upgrade_iron_mining', {
        tags: ["upgrade", "basic"],
        name: 'Iron Mining',
        description: 'Your miners can also provide now iron ore',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_bronze_tools') >= 1
        },
        resourceModifier: {
            income: {
                effects: {
                    minerIronEffect: {
                        A: 0.0035,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        cost: {
            'science': {
                A: 1,
                B: 2800,
                type: 1
            },
            'copper': {
                A: 1,
                B: 2500,
                type: 1
            }
        },
    })

    gameEntity.registerGameEntity('upgrade_iron_axes', {
        tags: ["upgrade", "basic"],
        name: 'Iron Axes',
        description: 'Get sharper axes for your woodcutters',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_iron_mining') >= 1
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    woodcutterEfficiency: {
                        A: 0.25,
                        B: 1,
                        type: 0
                    }
                }
            }
        },
        cost: {
            'science': {
                A: 1,
                B: 3200,
                type: 1
            },
            'iron': {
                A: 1,
                B: 50,
                type: 1
            }
        },
    })

    gameEntity.registerGameEntity('upgrade_iron_pickaxes', {
        tags: ["upgrade", "basic"],
        name: 'Iron Pickaxes',
        description: 'Better quarrying tools',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_iron_mining') >= 1
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    stonecutterEfficiency: {
                        A: 0.25,
                        B: 1,
                        type: 0
                    }
                }
            }
        },
        cost: {
            'science': {
                A: 1,
                B: 3200,
                type: 1
            },
            'iron': {
                A: 1,
                B: 50,
                type: 1
            }
        },
    })

    gameEntity.registerGameEntity('upgrade_iron_hoes', {
        tags: ["upgrade", "basic"],
        name: 'Iron Hoes',
        description: 'Better farming tools',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_iron_mining') >= 1
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    farmsEfficiency: {
                        A: 0.15,
                        B: 1,
                        type: 0
                    }
                }
            }
        },
        cost: {
            'science': {
                A: 1,
                B: 3200,
                type: 1
            },
            'iron': {
                A: 1,
                B: 50,
                type: 1
            }
        },
    })

    gameEntity.registerGameEntity('upgrade_iron_workbench', {
        tags: ["upgrade", "basic"],
        name: 'Iron Workbench',
        description: 'Using iron workbenches making your workshops more efficient',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_iron_pickaxes') >= 1
        },
        resourceModifier: {
            income: {
                effects: {
                    workshopBonus: {
                        A: 0.02,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        cost: {
            'science': {
                A: 1,
                B: 3200,
                type: 1
            },
            'iron': {
                A: 1,
                B: 50,
                type: 1
            }
        },
    })

    gameEntity.registerGameEntity('upgrade_philosophy', {
        tags: ["upgrade", "basic"],
        name: 'Philosophy',
        description: 'First abstract science',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_mythology') >= 1 && gameEntity.getLevel('upgrade_geometry') >= 1
        },
        resourceModifier: {
            capMult: {
                resources: {
                    'science': {
                        A: 0.1,
                        B: 1,
                        type: 0
                    }
                }
            }
        },
        cost: {
            'science': {
                A: 1,
                B: 3000,
                type: 1
            },
            'parchment': {
                A: 1,
                B: 750,
                type: 1
            }
        },
    })

    gameEntity.registerGameEntity('upgrade_ascension', {
        tags: ["upgrade", "basic"],
        name: 'Ascension',
        description: 'Unlocks ascending',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_philosophy') >= 1
        },
        cost: {
            'science': {
                A: 1,
                B: 6000,
                type: 1
            },
            'parchment': {
                A: 1,
                B: 1000,
                type: 1
            }
        },
    })

    gameEntity.registerGameEntity('upgrade_brick_works', {
        tags: ["upgrade", "basic"],
        name: 'Brick Works',
        description: 'Unlocks new building material that can significantly boost further economics development',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_engineering') >= 1
        },
        /*resourceModifier: {
            multiplier: {
                effects: {
                    'allPriceReduction': {
                        A: 0.5,
                        B: 1,
                        type: 1,
                    }
                }
            },
        },*/
        cost: {
            'science': {
                A: 1,
                B: 2925,
                type: 1
            },
            'stone': {
                A: 1,
                B: 2500,
                type: 1
            }
        },
    })

    gameEntity.registerGameEntity('upgrade_iron_swords', {
        tags: ["upgrade", "basic"],
        name: 'Iron Swords',
        description: 'Sharpen your swords and prepare to fight!',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_iron_axes') >= 1
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    combatAttackBonus: {
                        A: 0.25,
                        B: 1,
                        type: 0
                    }
                }
            }
        },
        cost: {
            'science': {
                A: 1,
                B: 3800,
                type: 1
            },
            'iron': {
                A: 1,
                B: 250,
                type: 1
            }
        },
    })

    gameEntity.registerGameEntity('upgrade_iron_arrows', {
        tags: ["upgrade", "basic"],
        name: 'Iron Arrows',
        description: 'Sharper arrows',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_iron_axes') >= 1
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    rangeAttackBonus: {
                        A: 0.25,
                        B: 1,
                        type: 0
                    }
                }
            }
        },
        cost: {
            'science': {
                A: 1,
                B: 3900,
                type: 1
            },
            'iron': {
                A: 1,
                B: 250,
                type: 1
            }
        },
    })

    gameEntity.registerGameEntity('upgrade_iron_smelting', {
        tags: ["upgrade", "basic"],
        name: 'Iron Smelting',
        description: 'Can build now smelters. Can have bad impact on health, but significantly boosts iron output',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_iron_mining') >= 1
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    rangeAttackBonus: {
                        A: 0.25,
                        B: 1,
                        type: 0
                    }
                }
            }
        },
        cost: {
            'science': {
                A: 1,
                B: 3900,
                type: 1
            },
            'brick': {
                A: 1,
                B: 250,
                type: 1
            }
        },
    })


    gameEntity.registerGameEntity('upgrade_iron_carts', {
        tags: ["upgrade", "basic"],
        name: 'Iron Carts',
        description: 'More durable carts for further traveling',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_iron_smelting') >= 1
        },
        resourceModifier: {
            income: {
                effects: {
                    maxTerritory: {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        cost: {
            'science': {
                A: 1,
                B: 4400,
                type: 1
            },
            'iron': {
                A: 1,
                B: 250,
                type: 1
            }
        },
    })

    gameEntity.registerGameEntity('upgrade_iron_containers', {
        tags: ["upgrade", "basic"],
        name: 'Iron Containers',
        description: 'Further increase storage',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_iron_smelting') >= 1
        },
        resourceModifier: {
            capMult: {
                resources: {
                    'wood': {
                        A: 1.35,
                        B: 1,
                        type: 1,
                    },
                    'stone': {
                        A: 1.35,
                        B: 1,
                        type: 1,
                    },
                    'copper': {
                        A: 1.35,
                        B: 1,
                        type: 1,
                    },
                    'iron': {
                        A: 1.35,
                        B: 1,
                        type: 1,
                    },
                    'parchment': {
                        A: 1.35,
                        B: 1,
                        type: 1,
                    },
                    'hide': {
                        A: 1.35,
                        B: 1,
                        type: 1,
                    }
                }
            }
        },
        cost: {
            'science': {
                A: 1,
                B: 4400,
                type: 1
            },
            'iron': {
                A: 1,
                B: 550,
                type: 1
            }
        },
    })


    gameEntity.registerGameEntity('upgrade_iron_armor', {
        tags: ["upgrade", "basic"],
        name: 'Iron Armor',
        description: 'TBD',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_iron_smelting') >= 1
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    combatHPBonus: {
                        A: 0.25,
                        B: 1,
                        type: 0
                    },
                    combatDefenseBonus: {
                        A: 0.25,
                        B: 1,
                        type: 0
                    }
                }
            }
        },
        cost: {
            'science': {
                A: 1,
                B: 5400,
                type: 1
            },
            'iron': {
                A: 1,
                B: 750,
                type: 1
            }
        },
    })

    gameEntity.registerGameEntity('upgrade_architecture', {
        tags: ["upgrade", "basic"],
        name: 'Architecture',
        description: 'Unlocks mega-structures',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_brick_works') >= 1
        },
        resourceModifier: {
            income: {
                effects: {
                    'megastructuresMax': {
                        A: 1,
                        B: 0,
                        type: 0,
                    }
                }
            },
        },
        cost: {
            'science': {
                A: 1,
                B: 5000,
                type: 1
            },
            'brick': {
                A: 1,
                B: 5000,
                type: 1
            }
        },
    })


    gameEntity.registerGameEntity('upgrade_scientific_jobs', {
        tags: ["upgrade", "basic"],
        name: 'Scientific Papers',
        description: 'Scientists will write down their research results as scientific paper. Academy can store parchment now and provide better science bonus',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_philosophy') >= 1
        },
        resourceModifier: {
            income: {
                effects: {
                    'academyParchmentCap': {
                        A: 4,
                        B: 0,
                        type: 0
                    },
                    'academyScienceBonus': {
                        A: 0.01,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        cost: {
            'science': {
                A: 1,
                B: 5000,
                type: 1
            },
            'parchment': {
                A: 1,
                B: 750,
                type: 1
            }
        },
    })

    gameEntity.registerGameEntity('upgrade_brick_kilns', {
        tags: ["upgrade", "basic"],
        name: 'Brick Kilns',
        description: 'Further increase bricks production',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_brick_works') >= 1
        },
        resourceModifier: {
            multiplier: {
                resources: {
                    'brick': {
                        A: 0.3,
                        B: 1,
                        type: 0,
                    }
                }
            },
        },
        cost: {
            'science': {
                A: 1,
                B: 5000,
                type: 1
            },
            'pottery': {
                A: 1,
                B: 15000,
                type: 1
            }
        },
    })

    gameEntity.registerGameEntity('upgrade_brick_walls', {
        tags: ["upgrade", "basic"],
        name: 'Brick Walls',
        description: 'Using brick walls can make your warehouses more durable, increasing storages',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_brick_works') >= 1
        },
        resourceModifier: {
            capMult: {
                resources: {
                    'wood': {
                        A: 1.45,
                        B: 1,
                        type: 1,
                    },
                    'stone': {
                        A: 1.45,
                        B: 1,
                        type: 1,
                    },
                    'copper': {
                        A: 1.45,
                        B: 1,
                        type: 1,
                    },
                    'iron': {
                        A: 1.45,
                        B: 1,
                        type: 1,
                    },
                    'parchment': {
                        A: 1.45,
                        B: 1,
                        type: 1,
                    },
                    'hide': {
                        A: 1.45,
                        B: 1,
                        type: 1,
                    }
                }
            }
        },
        cost: {
            'science': {
                A: 1,
                B: 5500,
                type: 1
            },
            'brick': {
                A: 1,
                B: 5000,
                type: 1
            }
        },
    })

    gameEntity.registerGameEntity('upgrade_wood_storage', {
        tags: ["upgrade", "basic"],
        name: 'Lumbermill Storage',
        description: 'Lumbermills now can provide additional dry and safe place to store wood',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_brick_walls') >= 1
        },
        resourceModifier: {
            income: {
                effects: {
                    lumbermillWoodStorage: {
                        A: 10,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        cost: {
            'science': {
                A: 1,
                B: 6800,
                type: 1
            },
            'brick': {
                A: 1,
                B: 5000,
                type: 1
            }
        },
    })

    gameEntity.registerGameEntity('upgrade_irrigation_channels', {
        tags: ["upgrade", "basic"],
        name: 'Irrigation Channels',
        description: 'Make irrigation channels with bricks to further improve farms yield',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_architecture') >= 1
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    farmsEfficiency: {
                        A: 1.1,
                        B: 1,
                        type: 1
                    }
                }
            }
        },
        cost: {
            'science': {
                A: 1,
                B: 5000,
                type: 1
            },
            'brick': {
                A: 1,
                B: 15000,
                type: 1
            }
        },
    })

    gameEntity.registerGameEntity('upgrade_reinforced_ovens', {
        tags: ["upgrade", "basic"],
        name: 'Reinforced Ovens',
        description: 'Use iron armature in your ovens to improve your bricks and pottery quality',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_iron_workbench') >= 1
        },
        resourceModifier: {
            multiplier: {
                resources: {
                    brick: {
                        A: 0.25,
                        B: 1,
                        type: 0
                    },
                    pottery: {
                        A: 0.25,
                        B: 1,
                        type: 0
                    }
                }
            }
        },
        cost: {
            'science': {
                A: 1,
                B: 5200,
                type: 1
            },
            'iron': {
                A: 1,
                B: 750,
                type: 1
            }
        },
    })

    gameEntity.registerGameEntity('upgrade_iron_stone_cranes', {
        tags: ["upgrade", "basic"],
        name: 'Iron Stone Cranes',
        description: 'Improve your quarries by more reliable lifting mechanisms implementation',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_architecture') >= 1
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    quarryEfficiency: {
                        A: 1.25,
                        B: 1,
                        type: 1
                    }
                }
            }
        },
        cost: {
            'science': {
                A: 1,
                B: 5200,
                type: 1
            },
            'iron': {
                A: 1,
                B: 800,
                type: 1
            }
        },
    })

    gameEntity.registerGameEntity('upgrade_iron_saw', {
        tags: ["upgrade", "basic"],
        name: 'Iron Saw',
        description: 'Sharper saws in your lumbermill can take your woodworking to next level',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_architecture') >= 1
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    lumbermillEfficiency: {
                        A: 1.25,
                        B: 1,
                        type: 1
                    }
                }
            }
        },
        cost: {
            'science': {
                A: 1,
                B: 5300,
                type: 1
            },
            'iron': {
                A: 1,
                B: 1200,
                type: 1
            }
        },
    })

    gameEntity.registerGameEntity('upgrade_wooden_furniture', {
        tags: ["upgrade", "basic"],
        name: 'Wooden Furniture',
        description: 'Provide wooden furniture to your people to further increase quality of life',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_iron_saw') >= 1
        },
        cost: {
            'science': {
                A: 1,
                B: 6200,
                type: 1
            },
            'brick': {
                A: 1,
                B: 35000,
                type: 1
            }
        },
    })


    gameEntity.registerGameEntity('upgrade_wheeled_carts', {
        tags: ["upgrade", "basic"],
        name: 'Iron-Wheeled Carts',
        description: 'Use iron wheels to move faster and further',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_iron_carts') >= 1
        },
        resourceModifier: {
            income: {
                effects: {
                    maxTerritory: {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        cost: {
            'science': {
                A: 1,
                B: 6400,
                type: 1
            },
            'iron': {
                A: 1,
                B: 1250,
                type: 1
            }
        },
    })

    gameEntity.registerGameEntity('upgrade_charcoal_smelting', {
        tags: ["upgrade", "basic"],
        name: 'Charcoal Smelting',
        description: 'You can now burn wood to increase smelters efficiency',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_reinforced_ovens') >= 1
        },
        cost: {
            'science': {
                A: 1,
                B: 6500,
                type: 1
            },
            'brick': {
                A: 1,
                B: 5000,
                type: 1
            }
        },
    })

    gameEntity.registerGameEntity('upgrade_jewelry_making', {
        tags: ["upgrade", "basic"],
        name: 'Jewelry Making',
        description: 'Prove the greatness of your dragon empire by crafting a lot of shining costly trinckets',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_charcoal_smelting') >= 1
        },
        resourceModifier: {
            multiplier: {
                resources: {
                    brick: {
                        A: 0.25,
                        B: 1,
                        type: 0
                    },
                    pottery: {
                        A: 0.25,
                        B: 1,
                        type: 0
                    }
                }
            }
        },
        cost: {
            'science': {
                A: 1,
                B: 9500,
                type: 1
            },
            'copper': {
                A: 1,
                B: 5000,
                type: 1
            }
        },
    })

    gameEntity.registerGameEntity('upgrade_armature', {
        tags: ["upgrade", "basic"],
        name: 'Armature Making',
        description: 'Use iron armatures to cheapen building process',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_reinforced_ovens') >= 1
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    allPriceReduction: {
                        A: 0.5,
                        B: 1,
                        type: 1
                    }
                }
            }
        },
        cost: {
            'science': {
                A: 1,
                B: 6500,
                type: 1
            },
            'iron': {
                A: 1,
                B: 500,
                type: 1
            }
        },
    })

    gameEntity.registerGameEntity('upgrade_multistory_warehouses', {
        tags: ["upgrade", "basic"],
        name: 'Multistory-warehouses',
        description: 'Allows even more compact goods storage',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_armature') >= 1
        },
        resourceModifier: {
            capMult: {
                resources: {
                    'wood': {
                        A: 1.75,
                        B: 1,
                        type: 1,
                    },
                    'stone': {
                        A: 1.75,
                        B: 1,
                        type: 1,
                    },
                    'copper': {
                        A: 1.75,
                        B: 1,
                        type: 1,
                    },
                    'iron': {
                        A: 1.75,
                        B: 1,
                        type: 1,
                    },
                    'parchment': {
                        A: 1.75,
                        B: 1,
                        type: 1,
                    },
                    'hide': {
                        A: 1.75,
                        B: 1,
                        type: 1,
                    }
                }
            }
        },
        cost: {
            'science': {
                A: 1,
                B: 8200,
                type: 1
            },
            'iron': {
                A: 1,
                B: 500,
                type: 1
            }
        },
    })

    gameEntity.registerGameEntity('upgrade_watermill', {
        tags: ["upgrade", "basic"],
        name: 'Watermill',
        description: 'Iron wheels can be used not just in carts. You can use iron durability to build advanced structures like watermill',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_wheeled_carts') >= 1
        },
        cost: {
            'science': {
                A: 1,
                B: 8400,
                type: 1
            },
            'iron': {
                A: 1,
                B: 1750,
                type: 1
            }
        },
    })

}