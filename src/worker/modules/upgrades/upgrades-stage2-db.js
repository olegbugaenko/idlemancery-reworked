import { gameEntity, gameCore } from "game-framework"

export const registerUpgradesStage2 = () => {
    gameEntity.registerGameEntity('upgrade_copper_mining', {
        tags: ["upgrade", "basic"],
        name: 'Copper Mining',
        description: 'Unlocks copper mining and related upgrades',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_basic_machinery') >= 1
        },
        cost: {
            'science': {
                A: 275,
                B: 260,
                type: 1
            },
            'stone': {
                A: 100,
                B: 125,
                type: 1
            }
        },
    })

    gameEntity.registerGameEntity('upgrade_copper_axes', {
        tags: ["upgrade", "basic"],
        name: 'Copper Axes',
        description: 'Copper Axes further improves your wood output',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_copper_mining') >= 1
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    woodcutterEfficiency: {
                        A: 0.5,
                        B: 1,
                        type: 0
                    }
                }
            }
        },
        cost: {
            'science': {
                A: 300,
                B: 300,
                type: 1
            },
            'copper': {
                A: 10,
                B: 10,
                type: 1
            }
        },
    })

    gameEntity.registerGameEntity('upgrade_copper_pickaxes', {
        tags: ["upgrade", "basic"],
        name: 'Copper Pickaxes',
        description: 'Copper Pickaxes improves your stone output',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_copper_mining') >= 1
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    stonecutterEfficiency: {
                        A: 0.5,
                        B: 1,
                        type: 0
                    }
                }
            }
        },
        cost: {
            'science': {
                A: 325,
                B: 275,
                type: 1
            },
            'copper': {
                A: 15,
                B: 15,
                type: 1
            }
        },
    })

    gameEntity.registerGameEntity('upgrade_poetry', {
        tags: ["upgrade", "basic"],
        name: 'Poetry',
        description: 'Libraries will store more science and expand cultural limits',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_writing') >= 1
        },
        resourceModifier: {
            capMult: {
                resources: {
                    'science': {
                        A: 0.25,
                        B: 1,
                        type: 0,
                    }
                }
            },
            income: {
                effects: {
                    'libraryCultureStorage': {
                        A: 2,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        cost: {
            'science': {
                A: 125,
                B: 250,
                type: 1
            },
            'parchment': {
                A: 50,
                B: 50,
                type: 1
            }
        },
    })

    gameEntity.registerGameEntity('upgrade_copper_fence', {
        tags: ["upgrade", "basic"],
        name: 'Copper Fence',
        description: 'Copper fences at your pastures allows breeding bigger animals, that may also provide hides',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_copper_mining') >= 1
        },
        resourceModifier: {
            income: {
                effects: {
                    pastureHideGain: {
                        A: 0.002,
                        B: 0,
                        type: 0
                    },
                    pastureHideFarmEffect: {
                        A: 0.0005,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        cost: {
            'science': {
                A: 350,
                B: 350,
                type: 1
            },
            'copper': {
                A: 45,
                B: 45,
                type: 1
            }
        },
    })

    gameEntity.registerGameEntity('upgrade_copper_hoes', {
        tags: ["upgrade", "basic"],
        name: 'Copper Hoes',
        description: 'Copper hoes can significantly increase farms efficiency',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_copper_mining') >= 1
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    farmsEfficiency: {
                        A: 1.25,
                        B: 1,
                        type: 1
                    }
                }
            }
        },
        cost: {
            'science': {
                A: 325,
                B: 300,
                type: 1
            },
            'copper': {
                A: 15,
                B: 25,
                type: 1
            }
        },
    })

    gameEntity.registerGameEntity('upgrade_wood_processing', {
        tags: ["upgrade", "basic"],
        name: 'Wood Processing',
        description: 'Using copper parts and tools allows better wood processing. Unlocks lumbermill',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_copper_axes') >= 1
        },
        cost: {
            'science': {
                A: 1,
                B: 375,
                type: 1
            },
            'copper': {
                A: 10,
                B: 60,
                type: 1
            }
        },
    })

    gameEntity.registerGameEntity('upgrade_copper_carts', {
        tags: ["upgrade", "basic"],
        name: 'Copper Carts',
        description: 'Using more reliable carts can help traveling with resources further',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_wood_processing') >= 1
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
                B: 525,
                type: 1
            },
            'copper': {
                A: 10,
                B: 60,
                type: 1
            }
        },
    })

    gameEntity.registerGameEntity('upgrade_copper_arrows', {
        tags: ["upgrade", "basic"],
        name: 'Copper Arrows',
        description: 'Use better materials to supply your archers',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_wood_processing') >= 1
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    rangeAttackBonus: {
                        A: 1,
                        B: 1,
                        type: 0
                    }
                }
            }
        },
        cost: {
            'science': {
                A: 1,
                B: 525,
                type: 1
            },
            'copper': {
                A: 10,
                B: 60,
                type: 1
            }
        },
    })

    gameEntity.registerGameEntity('upgrade_copper_containers', {
        tags: ["upgrade", "basic"],
        name: 'Copper Containers',
        description: 'Invent better storage facilities from wood and copper',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_wood_processing') >= 1
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
                B: 525,
                type: 1
            },
            'copper': {
                A: 10,
                B: 60,
                type: 1
            }
        },
    })

    gameEntity.registerGameEntity('upgrade_stone_ovens', {
        tags: ["upgrade", "basic"],
        name: 'Stone Ovens',
        description: 'Copper tools allow better stone processing. Your potters can now use better stone ovens, increasing pottery output',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_copper_pickaxes') >= 1 && gameEntity.getLevel('upgrade_pottery') >= 1
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    potteryEfficiency: {
                        A: 1.5,
                        B: 1,
                        type: 1
                    }
                }
            }
        },
        cost: {
            'science': {
                A: 1,
                B: 425,
                type: 1
            },
            'copper': {
                A: 10,
                B: 80,
                type: 1
            }
        },
    })

    gameEntity.registerGameEntity('upgrade_tools_workshops', {
        tags: ["upgrade", "basic"],
        name: 'Tools Workshops',
        description: 'Unlocks workshops providing universal tools to your artisans',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_stone_ovens') >= 1
        },
        cost: {
            'science': {
                A: 1,
                B: 700,
                type: 1
            },
            'copper': {
                A: 10,
                B: 90,
                type: 1
            }
        },
    })

    gameEntity.registerGameEntity('upgrade_mythology', {
        tags: ["upgrade", "basic"],
        name: 'Mythology',
        description: 'Your people start learning supernatural power of gods and glorify them in their poetry. Amphitheatres will now boost libraries max science by providing some mythological literature',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_poetry') >= 1
        },
        resourceModifier: {
            income: {
                effects: {
                    'libraryAmphitheatreBonus': {
                        A: 0.1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        cost: {
            'science': {
                A: 125,
                B: 350,
                type: 1
            },
            'parchment': {
                A: 50,
                B: 70,
                type: 1
            }
        },
    })

    gameEntity.registerGameEntity('upgrade_cult', {
        tags: ["upgrade", "basic"],
        name: 'Cult of Dragon',
        description: 'Your people start to adore you. They can build now your shrines, boosting your power gain',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_mythology') >= 1
        },
        cost: {
            'science': {
                A: 125,
                B: 850,
                type: 1
            },
        },
    })

    gameEntity.registerGameEntity('upgrade_mathematics', {
        tags: ["upgrade", "basic"],
        name: 'Mathematics',
        description: 'Five always greater than four',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_writing') >= 1
        },
        resourceModifier: {
            capMult: {
                resources: {
                    'science': {
                        A: 0.25,
                        B: 1,
                        type: 0,
                    }
                }
            },
        },
        cost: {
            'science': {
                A: 125,
                B: 600,
                type: 1
            },
            'parchment': {
                A: 50,
                B: 90,
                type: 1
            }
        },
    })

    gameEntity.registerGameEntity('upgrade_geometry', {
        tags: ["upgrade", "basic"],
        name: 'Geometry',
        description: 'Learn how to create perfect shapes. Further increase storage and leads to further architecture and machinery advancements',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_mathematics') >= 1
        },
        resourceModifier: {
            capMult: {
                resources: {
                    'wood': {
                        A: 0.25,
                        B: 1,
                        type: 0,
                    },
                    'stone': {
                        A: 0.25,
                        B: 1,
                        type: 0,
                    },
                    'copper': {
                        A: 0.25,
                        B: 1,
                        type: 0,
                    },
                    'iron': {
                        A: 0.25,
                        B: 1,
                        type: 0,
                    },
                    'hide': {
                        A: 0.25,
                        B: 1,
                        type: 0,
                    }
                }
            },
        },
        cost: {
            'science': {
                A: 125,
                B: 900,
                type: 1
            },
            'parchment': {
                A: 50,
                B: 240,
                type: 1
            }
        },
    })

    gameEntity.registerGameEntity('upgrade_roads', {
        tags: ["upgrade", "basic"],
        name: 'Roads',
        description: 'Improve logistics by building roads along most popular routes.',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_wheel') >= 1
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
            },
        },
        cost: {
            'science': {
                A: 850,
                B: 950,
                type: 1
            },
            'stone': {
                A: 100,
                B: 375,
                type: 1
            }
        },
    })

    gameEntity.registerGameEntity('upgrade_warehouses', {
        tags: ["upgrade", "basic"],
        name: 'Warehouses',
        description: 'Build better and more reliable storage facilities.',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_roads') >= 1
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
            },
        },
        cost: {
            'science': {
                A: 1,
                B: 1250,
                type: 1
            },
            'pottery': {
                A: 100,
                B: 200,
                type: 1
            }
        },
    })

    gameEntity.registerGameEntity('upgrade_horseback_riding', {
        tags: ["upgrade", "basic"],
        name: 'Horseback Riding',
        description: 'Use horses to further speed up your civilization development.',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_roads') >= 1
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
            },
        },
        cost: {
            'science': {
                A: 1550,
                B: 1550,
                type: 1
            },
            'stone': {
                A: 100,
                B: 375,
                type: 1
            }
        },
    })


    gameEntity.registerGameEntity('upgrade_weaving', {
        tags: ["upgrade", "basic"],
        name: 'Weaving',
        description: 'Using advanced materials along with copper spokes allows significantly improve your clothes making',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return (gameEntity.getLevel('upgrade_copper_axes') >= 1) && (gameEntity.getLevel('upgrade_clothes_making') >= 1)
        },
        resourceModifier: {
            multiplier: {
                resources: {
                    clothes: {
                        A: 1.5,
                        B: 1,
                        type: 1
                    }
                }
            }
        },
        cost: {
            'science': {
                A: 1,
                B: 875,
                type: 1
            },
            'copper': {
                A: 10,
                B: 80,
                type: 1
            }
        },
    })

    gameEntity.registerGameEntity('upgrade_potters_wheel', {
        tags: ["upgrade", "basic"],
        name: 'Potters Wheel',
        description: 'Invent new tools for your potters',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_stone_ovens') >= 1 && gameEntity.getLevel('upgrade_pottery') >= 1
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    potteryEfficiency: {
                        A: 1.5,
                        B: 1,
                        type: 1
                    }
                }
            }
        },
        cost: {
            'science': {
                A: 1,
                B: 925,
                type: 1
            },
            'copper': {
                A: 10,
                B: 80,
                type: 1
            }
        },
    })

    gameEntity.registerGameEntity('upgrade_bronze_armor', {
        tags: ["upgrade", "basic"],
        name: 'Bronze Armor',
        description: 'Further improvements of working with copper led to new technologies for armor making',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_stone_ovens') >= 1 && gameEntity.getLevel('upgrade_pottery') >= 1
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    combatDefenseBonus: {
                        A: 1.5,
                        B: 1,
                        type: 1
                    },
                    combatHPBonus: {
                        A: 1.5,
                        B: 1,
                        type: 1
                    }
                }
            }
        },
        cost: {
            'science': {
                A: 1,
                B: 1125,
                type: 1
            },
            'copper': {
                A: 10,
                B: 380,
                type: 1
            }
        },
    })

    gameEntity.registerGameEntity('upgrade_bronze_swords', {
        tags: ["upgrade", "basic"],
        name: 'Bronze Swords',
        description: 'Unlock new unit - swordsman',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_stone_ovens') >= 1 && gameEntity.getLevel('upgrade_pottery') >= 1
        },
        cost: {
            'science': {
                A: 1,
                B: 1225,
                type: 1
            },
            'copper': {
                A: 10,
                B: 550,
                type: 1
            }
        },
    })

    gameEntity.registerGameEntity('upgrade_engineering', {
        tags: ["upgrade", "basic"],
        name: 'Engineering',
        description: 'Bigger, higher, better',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_geometry') >= 1
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'allPriceReduction': {
                        A: 0.5,
                        B: 1,
                        type: 1,
                    }
                }
            },
        },
        cost: {
            'science': {
                A: 1125,
                B: 1125,
                type: 1
            },
            'hide': {
                A: 50,
                B: 500,
                type: 1
            }
        },
    })

    gameEntity.registerGameEntity('upgrade_deep_mining', {
        tags: ["upgrade", "basic"],
        name: 'Deeper Mining',
        description: 'Unlock mines buildings, increasing your miners efficiency',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_engineering') >= 1
        },
        cost: {
            'science': {
                A: 1275,
                B: 1275,
                type: 1
            },
            'stone': {
                A: 50,
                B: 500,
                type: 1
            }
        },
    })

    gameEntity.registerGameEntity('upgrade_composite_bows', {
        tags: ["upgrade", "basic"],
        name: 'Composite Bows',
        description: 'Unleash the power of your archers',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_engineering') >= 1
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'rangeAttackBonus': {
                        A: 1.5,
                        B: 1,
                        type: 1,
                    }
                }
            },
        },
        cost: {
            'science': {
                A: 1375,
                B: 1375,
                type: 1
            },
            'copper': {
                A: 50,
                B: 500,
                type: 1
            }
        },
    })


    gameEntity.registerGameEntity('upgrade_bronze_tools', {
        tags: ["upgrade", "basic"],
        name: 'Bronze Tools',
        description: 'Provide your people with bronze tools, improving their efficiency',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_deep_mining') >= 1
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    workersEfficiency: {
                        A: 1.2,
                        B: 1,
                        type: 1,
                    }
                }
            }
        },
        cost: {
            'science': {
                A: 1,
                B: 1900,
                type: 1
            },
            'stone': {
                A: 50,
                B: 500,
                type: 1
            }
        },
    })

    gameEntity.registerGameEntity('upgrade_currency', {
        tags: ["upgrade", "basic"],
        name: 'Currency',
        description: 'Dragocoins flowing in...',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_mathematics') >= 1
        },
        cost: {
            'science': {
                A: 1,
                B: 1650,
                type: 1
            }
        },
    })

    gameEntity.registerGameEntity('upgrade_trading_contracts', {
        tags: ["upgrade", "basic"],
        name: 'Trading Contracts',
        description: 'Short term trading contracts allow you to optimize goods movement. Warehouses will be boosted by marketplaces',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_currency') >= 1
        },
        resourceModifier: {
            income: {
                effects: {
                    warehouseMarketplaceBoost: {
                        A: 0.5,
                        B: 0,
                        type: 0,
                    }
                }
            }
        },
        cost: {
            'science': {
                A: 1,
                B: 1975,
                type: 1
            }
        },
    })

    gameEntity.registerGameEntity('upgrade_mortar_and_pestle', {
        tags: ["upgrade", "basic"],
        name: 'Mortar and Pestle',
        description: 'Develop a tool used for grinding and mixing substances. Unlocks medicine',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_potters_wheel') >= 1
        },
        cost: {
            'science': {
                A: 1,
                B: 1925,
                type: 1
            },
            'pottery': {
                A: 1,
                B: 400,
                type: 1
            }
        },
    })


    gameEntity.registerGameEntity('upgrade_herbal_medicine', {
        tags: ["upgrade", "basic"],
        name: 'Herbal Medicine',
        description: 'Your doctors will learn wild herbs and their effect on human health',
        level: 0,
        maxLevel: 2,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_mortar_and_pestle') >= 1
        },
        resourceModifier: {
            income: {
                effects: {
                    doctorEfficiency: {
                        A: 0.015,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        cost: {
            'science': {
                A: 1.5,
                B: 2200,
                type: 1
            },
        },
    })


    gameEntity.registerGameEntity('upgrade_aqueducts', {
        tags: ["upgrade", "basic"],
        name: 'Aqueducts',
        description: 'Aqueducts will help you to provide your citizens with fresh and clean water, boosting healthcare services',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_mortar_and_pestle') >= 1 && gameEntity.getLevel('upgrade_engineering') >= 1
        },
        cost: {
            'science': {
                A: 1,
                B: 2800,
                type: 1
            },
            'stone': {
                A: 1,
                B: 1500,
                type: 1
            }
        },
    })

    gameEntity.registerGameEntity('upgrade_storage_racking', {
        tags: ["upgrade", "basic"],
        name: 'Storage Racking',
        description: 'Creating reliable storage racking can further increase storage capacity',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_deep_mining') >= 1
        },
        resourceModifier: {
            capMult: {
                resources: {
                    'wood': {
                        A: 1.65,
                        B: 1,
                        type: 1,
                    },
                    'stone': {
                        A: 1.65,
                        B: 1,
                        type: 1,
                    },
                    'copper': {
                        A: 1.65,
                        B: 1,
                        type: 1,
                    },
                    'iron': {
                        A: 1.65,
                        B: 1,
                        type: 1,
                    },
                    'parchment': {
                        A: 1.65,
                        B: 1,
                        type: 1,
                    },
                    'hide': {
                        A: 1.65,
                        B: 1,
                        type: 1,
                    }
                }
            }
        },
        cost: {
            'science': {
                A: 1,
                B: 2300,
                type: 1
            },
            'copper': {
                A: 50,
                B: 1200,
                type: 1
            }
        },
    })

}