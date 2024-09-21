import { gameEntity, gameCore } from "game-framework"

export const registerUpgradesStage1 = () => {


    gameEntity.registerGameEntity('upgrade_tools', {
        tags: ["upgrade", "basic"],
        name: 'Tools',
        description: 'Provide some basic tools to your workers to make them more efficient',
        level: 0,
        maxLevel: 1,
        resourceModifier: {
            multiplier: {
                effects: {
                    'workersEfficiency': {
                        A: 0.1,
                        B: 1,
                        type: 0,
                    }
                }
            }
        },
        unlockCondition: () => {
            return gameEntity.getLevel('perk_dragon_cult') >= 1
        },
        cost: {
            'science': {
                A: 2,
                B: 2,
                type: 1
            }
        }
    })

    gameEntity.registerGameEntity('upgrade_bows', {
        tags: ["upgrade", "basic"],
        name: 'Bows',
        description: 'With bows your hunters might take advantage over primitive creatures',
        level: 0,
        maxLevel: 1,
        resourceModifier: {
            multiplier: {
                effects: {
                    'huntingEfficiency': {
                        A: 0.1,
                        B: 1,
                        type: 0,
                    }
                }
            }
        },
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_tools') >= 1
        },
        cost: {
            'science': {
                A: 3,
                B: 3,
                type: 1
            }
        }
    })

    gameEntity.registerGameEntity('upgrade_basic_construction', {
        tags: ["upgrade", "basic"],
        name: 'Basic Construction',
        description: 'With some primitive tools your people can now build something more advanced',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_tools') >= 1
        },
        cost: {
            'science': {
                A: 3,
                B: 3,
                type: 1
            }
        },
        onLevelSet: () => {
            gameCore.getModule('territory').sendTerritoryData();
        }
    })

    gameEntity.registerGameEntity('upgrade_science', {
        tags: ["upgrade", "basic"],
        name: 'Investigation',
        description: 'Share some knowledge to your people to teach them how to learn',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_basic_construction') >= 1
        },
        cost: {
            'science': {
                A: 5,
                B: 5,
                type: 1
            }
        }
    })


    gameEntity.registerGameEntity('upgrade_war', {
        tags: ["upgrade", "basic"],
        name: 'Combat',
        description: 'Start training soldiers from your lazy tribe',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_science') >= 1 && gameEntity.getLevel('upgrade_bows') >= 1
        },
        cost: {
            'science': {
                A: 10,
                B: 10,
                type: 1
            },
            'wood': {
                A: 10,
                B: 11,
                type: 1
            }
        },
        onLevelSet: () => {
            gameCore.getModule('territory').sendTerritoryData();
        }
    })


    gameEntity.registerGameEntity('upgrade_wooden_tools', {
        tags: ["upgrade", "basic"],
        name: 'Wooden Tools',
        description: 'Use better tools to improve overall worker efficiency',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_science') >= 1
        },
        cost: {
            'science': {
                A: 10,
                B: 10,
                type: 1
            },
            'wood': {
                A: 10,
                B: 11,
                type: 1
            }
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'workersEfficiency': {
                        A: 0.05,
                        B: 1,
                        type: 0,
                    }
                }
            }
        },
    })

    gameEntity.registerGameEntity('upgrade_wooden_maces', {
        tags: ["upgrade", "basic"],
        name: 'Wooden Maces',
        description: 'While armed with wooden maces your warriors can significantly increase their damage',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_wooden_tools') >= 1 && gameEntity.getLevel('upgrade_war') >= 1
        },
        cost: {
            'science': {
                A: 10,
                B: 10,
                type: 1
            },
            'wood': {
                A: 10,
                B: 11,
                type: 1
            }
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'combatAttackBonus': {
                        A: 0.2,
                        B: 1,
                        type: 0,
                    }
                }
            }
        },
    })

    gameEntity.registerGameEntity('upgrade_stone_cutting', {
        tags: ["upgrade", "basic"],
        name: 'Stone Cutting',
        description: 'Unlock new material',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_wooden_tools') >= 1
        },
        cost: {
            'science': {
                A: 35,
                B: 50,
                type: 1
            },
            'wood': {
                A: 10,
                B: 30,
                type: 1
            }
        },
    })

    gameEntity.registerGameEntity('upgrade_stone_axes', {
        tags: ["upgrade", "basic"],
        name: 'Stone Axes',
        description: 'Significantly improves woodcutters efficiency',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_stone_cutting') >= 1
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'woodcutterEfficiency': {
                        A: 1.75,
                        B: 0,
                        type: 0,
                    }
                }
            }
        },
        cost: {
            'science': {
                A: 50,
                B: 50,
                type: 1
            },
            'stone': {
                A: 10,
                B: 10,
                type: 1
            }
        },
    })

    gameEntity.registerGameEntity('upgrade_stone_maces', {
        tags: ["upgrade", "basic"],
        name: 'Stone Maces',
        description: 'Provide your warriors with stone maces for even better damage',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_stone_axes') >= 1
        },
        cost: {
            'science': {
                A: 10,
                B: 20,
                type: 1
            },
            'stone': {
                A: 10,
                B: 12,
                type: 1
            }
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'combatAttackBonus': {
                        A: 0.2,
                        B: 1,
                        type: 0,
                    }
                }
            }
        },
    })

    gameEntity.registerGameEntity('upgrade_stone_knives', {
        tags: ["upgrade", "basic"],
        name: 'Stone Knives',
        description: 'Hunters become more efficient, and can also bring some hides from the hunt',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_stone_axes') >= 1
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'huntingEfficiency': {
                        A: 1.1,
                        B: 0,
                        type: 0,
                    }
                }
            },
            income: {
                effects: {
                    'huntingHide': {
                        A: 0.015,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        cost: {
            'science': {
                A: 75,
                B: 75,
                type: 1
            },
            'stone': {
                A: 10,
                B: 15,
                type: 1
            }
        },
    })

    gameEntity.registerGameEntity('upgrade_hide_coverings', {
        tags: ["upgrade", "basic"],
        name: 'Hide Coverings',
        description: 'Prevents rain and cold from corrupting your goods, further increasing storages',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_stone_knives') >= 1
        },
        resourceModifier: {
            capMult: {
                resources: {
                    'wood': {
                        A: 1.5,
                        B: 1,
                        type: 1,
                    },
                    'stone': {
                        A: 1.5,
                        B: 1,
                        type: 1,
                    },
                    'copper': {
                        A: 1.5,
                        B: 1,
                        type: 1,
                    },
                    'iron': {
                        A: 1.5,
                        B: 1,
                        type: 1,
                    },
                    'hide': {
                        A: 1.5,
                        B: 1,
                        type: 1,
                    }
                }
            }
        },
        cost: {
            'science': {
                A: 75,
                B: 75,
                type: 1
            },
            'hide': {
                A: 10,
                B: 20,
                type: 1
            }
        },
    })

    gameEntity.registerGameEntity('upgrade_stone_piles', {
        tags: ["upgrade", "basic"],
        name: 'Stone Piles',
        description: 'Improve basic raw material storage',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_stone_cutting') >= 1
        },
        resourceModifier: {
            capMult: {
                resources: {
                    'wood': {
                        A: 1.5,
                        B: 1,
                        type: 1,
                    },
                    'stone': {
                        A: 1.5,
                        B: 1,
                        type: 1,
                    },
                    'copper': {
                        A: 1.5,
                        B: 1,
                        type: 1,
                    },
                    'iron': {
                        A: 1.5,
                        B: 1,
                        type: 1,
                    }
                }
            }
        },
        cost: {
            'science': {
                A: 50,
                B: 50,
                type: 1
            },
            'stone': {
                A: 10,
                B: 10,
                type: 1
            }
        },
    })

    gameEntity.registerGameEntity('upgrade_wooden_piles', {
        tags: ["upgrade", "basic"],
        name: 'Wooden Piles',
        description: 'Improves small storage efficiency',
        level: 0,
        maxLevel: 3,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_science') >= 1
        },
        cost: {
            'science': {
                A: 2,
                B: 10,
                type: 1
            },
            'wood': {
                A: 2,
                B: 11,
                type: 1
            }
        },
        resourceModifier: {
            income: {
                effects: {
                    'storageBonus': {
                        A: 1,
                        B: 0,
                        type: 0,
                    }
                }
            }
        },
    })

    gameEntity.registerGameEntity('upgrade_cave_painting', {
        tags: ["upgrade", "basic"],
        name: 'Cave Painting',
        description: 'Invent first ways to express feelings and transfer knowledge',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_science') >= 1
        },
        cost: {
            'science': {
                A: 30,
                B: 30,
                type: 1
            }
        },
        resourceModifier: {
            multiplier: {
                resources: {
                    'science': {
                        A: 0.25,
                        B: 1,
                        type: 0,
                    }
                }
            },
            capMult: {
                resources: {
                    'science': {
                        A: 0.25,
                        B: 1,
                        type: 0,
                    }
                }
            }
        },
    })

    gameEntity.registerGameEntity('upgrade_knowledge_sharing', {
        tags: ["upgrade", "basic"],
        name: 'Knowledge Sharing',
        description: 'Use painting to share knowledge about the world with each others. Unlock new territories',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_cave_painting') >= 1
        },
        cost: {
            'science': {
                A: 50,
                B: 65,
                type: 1
            }
        },
        resourceModifier: {
            income: {
                effects: {
                    'maxTerritory': {
                        A: 3,
                        B: 0,
                        type: 0,
                    }
                }
            },
        },
    })

    gameEntity.registerGameEntity('upgrade_animal_husbandry', {
        tags: ["upgrade", "basic"],
        name: 'Animal Husbandry',
        description: 'Unlocks pastures - alternative meat source',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_cave_painting') >= 1
        },
        cost: {
            'science': {
                A: 50,
                B: 80,
                type: 1
            }
        },
    })

    gameEntity.registerGameEntity('upgrade_agriculture', {
        tags: ["upgrade", "basic"],
        name: 'Agriculture',
        description: 'You will be able to build fields to feed your animals, making pastures more efficient',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_animal_husbandry') >= 1
        },
        cost: {
            'science': {
                A: 50,
                B: 100,
                type: 1
            }
        },
    })

    gameEntity.registerGameEntity('upgrade_stone_hoes', {
        tags: ["upgrade", "basic"],
        name: 'Stone Hoes',
        description: 'Using stone tools at your farms can significantly boost their efficiency',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_agriculture') >= 1 && gameEntity.getLevel('upgrade_stone_cutting') >= 1
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    farmsEfficiency: {
                        A: 1.5,
                        B: 1,
                        type: 1
                    }
                }
            }
        },
        cost: {
            'science': {
                A: 50,
                B: 120,
                type: 1
            },
            'stone': {
                A: 50,
                B: 30,
                type: 1
            }
        },
    })

    gameEntity.registerGameEntity('upgrade_tanning', {
        tags: ["upgrade", "basic"],
        name: 'Tanning',
        description: 'Your skins can now be stored along with other goods in your storage facilities',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_stone_knives') >= 1
        },
        resourceModifier: {
            income: {
                effects: {
                    'hidesStorageBonus': {
                        A: 2,
                        B: 0,
                        type: 0,
                    },
                }
            }
        },
        cost: {
            'science': {
                A: 75,
                B: 100,
                type: 1
            },
            'hide': {
                A: 10,
                B: 30,
                type: 1
            }
        },
    })

    gameEntity.registerGameEntity('upgrade_leather_armor', {
        tags: ["upgrade", "basic"],
        name: 'Leather Armor',
        description: 'Your warriors will be much more confident when using some armor',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_clothes_making') >= 1
        },
        cost: {
            'science': {
                A: 10,
                B: 140,
                type: 1
            },
            'hide': {
                A: 10,
                B: 45,
                type: 1
            }
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'combatDefenseBonus': {
                        A: 0.5,
                        B: 1,
                        type: 0,
                    },
                    'rangeDefenseBonus': {
                        A: 0.5,
                        B: 1,
                        type: 0,
                    }
                }
            }
        },
    })

    gameEntity.registerGameEntity('upgrade_huts', {
        tags: ["upgrade", "basic"],
        name: 'Huts',
        description: 'Unlocks better living facilities made of skins and stone',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_tanning') >= 1
        },
        cost: {
            'science': {
                A: 125,
                B: 120,
                type: 1
            },
            'hide': {
                A: 50,
                B: 40,
                type: 1
            }
        },
    })

    gameEntity.registerGameEntity('upgrade_ropemaking', {
        tags: ["upgrade", "basic"],
        name: 'Rope-making',
        description: 'Learn how to make reliable ropes using skins to make handling bigger loads possible. Unlocks quarries, boosting stone gathering',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_tanning') >= 1
        },
        cost: {
            'science': {
                A: 125,
                B: 120,
                type: 1
            },
            'hide': {
                A: 50,
                B: 40,
                type: 1
            }
        },
    })

    gameEntity.registerGameEntity('upgrade_bolas', {
        tags: ["upgrade", "basic"],
        name: 'Bolas',
        description: 'Your hunters found better way of hunting animals while keep their skin undamaged',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_ropemaking') >= 1
        },
        resourceModifier: {
            multiplier: {
                resources: {
                    hide: {
                        A: 1.75,
                        B: 1,
                        type: 1
                    }
                }
            }
        },
        cost: {
            'science': {
                A: 175,
                B: 175,
                type: 1
            },
            'hide': {
                A: 50,
                B: 50,
                type: 1
            }
        },
    })

    gameEntity.registerGameEntity('upgrade_parchment_making', {
        tags: ["upgrade", "basic"],
        name: 'Parchment-making',
        description: 'Unlocks new resource. In advance, boosts your ability to store information in libraries',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_tanning') >= 1
        },
        resourceModifier: {
            capMult: {
                resources: {
                    'science': {
                        A: 0.1,
                        B: 1,
                        type: 0,
                    }
                }
            }
        },
        cost: {
            'science': {
                A: 125,
                B: 110,
                type: 1
            },
            'hide': {
                A: 50,
                B: 60,
                type: 1
            }
        },
    })


    gameEntity.registerGameEntity('upgrade_clothes_making', {
        tags: ["upgrade", "basic"],
        name: 'Clothes-making',
        description: 'Unlocks making clothes for your people to make them happier',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_tanning') >= 1
        },
        cost: {
            'science': {
                A: 180,
                B: 110,
                type: 1
            },
            'hide': {
                A: 50,
                B: 80,
                type: 1
            }
        },
    })

    gameEntity.registerGameEntity('upgrade_writing', {
        tags: ["upgrade", "basic"],
        name: 'Writing',
        description: 'Writing unlocks new buildings - amphitheatres. Can be used for cultural expansion',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_parchment_making') >= 1
        },
        resourceModifier: {
            capMult: {
                resources: {
                    'science': {
                        A: 0.1,
                        B: 1,
                        type: 0,
                    }
                }
            }
        },
        cost: {
            'science': {
                A: 125,
                B: 125,
                type: 1
            },
            'parchment': {
                A: 50,
                B: 10,
                type: 1
            }
        },
    })

    gameEntity.registerGameEntity('upgrade_sledges', {
        tags: ["upgrade", "basic"],
        name: 'Sledges',
        description: 'Allows carrying goods at longer distance, making new territories available',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_ropemaking') >= 1
        },
        resourceModifier: {
            income: {
                effects: {
                    'maxTerritory': {
                        A: 2,
                        B: 0,
                        type: 0,
                    }
                }
            },
        },
        cost: {
            'science': {
                A: 125,
                B: 150,
                type: 1
            },
            'hide': {
                A: 100,
                B: 75,
                type: 1
            }
        },
    })


    gameEntity.registerGameEntity('upgrade_wooden_cranes', {
        tags: ["upgrade", "basic"],
        name: 'Wooden Cranes',
        description: 'Using wooden cranes can significantly cheapen all building prices',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_sledges') >= 1
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
                A: 125,
                B: 175,
                type: 1
            },
            'wood': {
                A: 1,
                B: 275,
                type: 1
            }
        },
    })

    gameEntity.registerGameEntity('upgrade_wheel', {
        tags: ["upgrade", "basic"],
        name: 'Wheel',
        description: 'Further improves logistics, allowing further expansion',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_sledges') >= 1
        },
        resourceModifier: {
            income: {
                effects: {
                    'maxTerritory': {
                        A: 1,
                        B: 0,
                        type: 0,
                    }
                }
            },
        },
        cost: {
            'science': {
                A: 200,
                B: 225,
                type: 1
            },
            'stone': {
                A: 100,
                B: 75,
                type: 1
            }
        },
    })

    gameEntity.registerGameEntity('upgrade_basic_machinery', {
        tags: ["upgrade", "basic"],
        name: 'Basic Machinery',
        description: 'Better understanding of physics basics led your people to unlock first automation tools. Improves basic construction resources gain',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_wheel') >= 1
        },
        resourceModifier: {
            multiplier: {
                resources: {
                    'wood': {
                        A: 1.25,
                        B: 1.0,
                        type: 1,
                    },
                    'stone': {
                        A: 1.25,
                        B: 1.0,
                        type: 1,
                    }
                }
            },
        },
        cost: {
            'science': {
                A: 250,
                B: 250,
                type: 1
            },
            'stone': {
                A: 100,
                B: 75,
                type: 1
            }
        },
    })

    gameEntity.registerGameEntity('upgrade_pottery', {
        tags: ["upgrade", "basic"],
        name: 'Pottery',
        description: 'Your potters will be able to turn a piece of clay into a work of art. Supplying your people with pottery can boost their efficiency',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_agriculture') >= 1
        },
        cost: {
            'science': {
                A: 50,
                B: 200,
                type: 1
            }
        },
    })

    gameEntity.registerGameEntity('upgrade_ceramic_containers', {
        tags: ["upgrade", "basic"],
        name: 'Ceramic Containers',
        description: 'Using ceramic containers can further boost all storage facilities significantly',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_pottery') >= 1
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
                A: 50,
                B: 210,
                type: 1
            }
        },
    })

    gameEntity.registerGameEntity('upgrade_ceramic_furniture', {
        tags: ["upgrade", "basic"],
        name: 'Ceramic Furniture',
        description: 'Enhance your furniture in huts to make them cheaper',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('upgrade_pottery') >= 1
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    hutPrice: {
                        A: 1,
                        B: 0.5,
                        type: 1
                    }
                }
            }
        },
        cost: {
            'science': {
                A: 50,
                B: 210,
                type: 1
            }
        },
    })
}