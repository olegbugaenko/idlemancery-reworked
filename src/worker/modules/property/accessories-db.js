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
                        A: 0.1,
                        B: 1,
                        C: 1.01,
                        type: 3,
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
                        C: 1.01,
                        type: 3,
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
                        A: 0.1,
                        B: 1,
                        C: 1.01,
                        type: 3,
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


    gameEntity.registerGameEntity('accessory_aromatic_carpet', {
        tags: ["accessory", "upgrade", "purchaseable"],
        name: 'Aromatic Carpet',
        description: 'Craft aromatic carpet that inspires you and boosts your energy recovery',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_crafting_courses') > 0;
        },
        resourceModifier: {
            multiplier: {
                resources: {
                    'energy': {
                        A: 0.02,
                        B: 1,
                        C: 1.01,
                        type: 3,
                    }
                }
            },
        },
        get_cost: () => ({
            'inventory_herbal_fibers': {
                A: 1.1,
                B: 2,
                type: 1
            },
            'mana': {
                A: 1.1,
                B: 3,
                type: 1
            }
        }),
    })



    gameEntity.registerGameEntity('accessory_scroll_of_wisdom', {
        tags: ["accessory", "upgrade", "purchaseable"],
        name: 'Scroll of Wisdom',
        description: 'A scroll inscribed with glowing runes that impart knowledge to the reader. It continuously generates insight, aiding the bearer in gradually increasing their understanding and intelligence over time.',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_paper_working') > 0;
        },
        resourceModifier: {
            income: {
                resources: {
                    'knowledge': {
                        A: 0.005,
                        B: 0,
                        C: 1.01,
                        type: 3,
                    }
                }
            },
        },
        get_cost: () => ({
            'inventory_paper': {
                A: 1.1,
                B: 2,
                type: 1
            },
            'mana': {
                A: 1.1,
                B: 2,
                type: 1
            }
        }),
    })


    gameEntity.registerGameEntity('accessory_scroll_of_restoration', {
        tags: ["accessory", "upgrade", "purchaseable"],
        name: 'Charm of Restoration Magic',
        description: 'A delicately folded paper charm shaped like a bird, imbued with restorative magic',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_paper_working') > 0;
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'restoration_spells_efficiency': {
                        A: 0.025,
                        B: 1,
                        C: 1.01,
                        type: 3,
                    }
                }
            },
        },
        get_cost: () => ({
            'inventory_paper': {
                A: 1.1,
                B: 2,
                type: 1
            },
            'knowledge': {
                A: 1.1,
                B: 2,
                type: 1
            },
            'inventory_aloe_vera': {
                A: 1.1,
                B: 20,
                type: 1
            }
        }),
    })


    gameEntity.registerGameEntity('accessory_tome_of_mentalist', {
        tags: ["accessory", "upgrade", "purchaseable"],
        name: 'Mentalist\'s Tome',
        description: 'Magic book containing a lot of mental power',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_paper_enhance') > 0;
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'mental_training_learning_rate': {
                        A: 0.025,
                        B: 1,
                        C: 1.01,
                        type: 3,
                    }
                }
            },
        },
        get_cost: () => ({
            'inventory_enchanted_paper': {
                A: 1.1,
                B: 2,
                type: 1
            },
            'knowledge': {
                A: 1.1,
                B: 2,
                type: 1
            },
            'inventory_herbal_fibers': {
                A: 1.1,
                B: 20,
                type: 1
            }
        }),
    })


    gameEntity.registerGameEntity('accessory_tome_of_occultism', {
        tags: ["accessory", "upgrade", "purchaseable"],
        name: 'Occultist\'s Tome',
        description: 'Small glowing tome. You feel inspiration every time you touch it',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_paper_enhance') > 0;
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'spiritual_learning_rate': {
                        A: 0.025,
                        B: 1,
                        C: 1.01,
                        type: 3,
                    }
                }
            },
        },
        get_cost: () => ({
            'inventory_enchanted_paper': {
                A: 1.1,
                B: 2,
                type: 1
            },
            'knowledge': {
                A: 1.1,
                B: 2,
                type: 1
            },
            'inventory_herbal_fibers': {
                A: 1.1,
                B: 20,
                type: 1
            }
        }),
    })


    gameEntity.registerGameEntity('accessory_ruby_pendant', {
        tags: ["accessory", "upgrade", "purchaseable"],
        name: 'Ruby Pendant',
        description: 'Create ruby pendant that empowers your physical learning rate',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_crafting_courses') > 0 && gameEntity.isEntityUnlocked('action_quarrying');
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'physical_training_learn_speed': {
                        A: 0.04,
                        B: 1,
                        C: 1.01,
                        type: 3,
                    }
                }
            },
        },
        get_cost: () => ({
            'inventory_ruby': {
                A: 1.1,
                B: 1,
                type: 1
            }
        }),
    })


    gameEntity.registerGameEntity('accessory_vitality_talisman', {
        tags: ["accessory", "upgrade", "purchaseable"],
        name: 'Vitality Talisman',
        description: 'Increase your HP and energy caps',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_crafting_courses') > 0 && gameEntity.isEntityUnlocked('action_quarrying');
        },
        resourceModifier: {
            capMult: {
                resources: {
                    'energy': {
                        A: 0.05,
                        B: 1,
                        C: 1.01,
                        type: 3,
                    },
                    'health': {
                        A: 0.05,
                        B: 1,
                        C: 0.01,
                        type: 3,
                    }
                }
            },
        },
        get_cost: () => ({
            'inventory_ruby': {
                A: 1.1,
                B: 1,
                type: 1
            }
        }),
    })


    gameEntity.registerGameEntity('accessory_sapphire_ring', {
        tags: ["accessory", "upgrade", "purchaseable"],
        name: 'Sapphire Ring',
        description: 'Increase your spell XP gain',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_crafting_courses') > 0 && gameEntity.isEntityUnlocked('action_quarrying');
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'spell_xp_rate': {
                        A: 0.1,
                        B: 1,
                        C: 1.01,
                        type: 3,
                    }
                }
            },
        },
        get_cost: () => ({
            'inventory_sapphire': {
                A: 1.1,
                B: 1,
                type: 1
            }
        }),
    })


    gameEntity.registerGameEntity('accessory_sapphire_pendant', {
        tags: ["accessory", "upgrade", "purchaseable"],
        name: 'Sapphire Pendant',
        description: 'Increase your mana cap',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_crafting_courses') > 0 && gameEntity.isEntityUnlocked('action_quarrying');
        },
        resourceModifier: {
            capMult: {
                resources: {
                    'mana': {
                        A: 0.05,
                        B: 1,
                        C: 1.01,
                        type: 3,
                    }
                }
            },
        },
        get_cost: () => ({
            'inventory_sapphire': {
                A: 1.1,
                B: 1,
                type: 1
            }
        }),
    })


    gameEntity.registerGameEntity('accessory_iron_stash', {
        tags: ["accessory", "upgrade", "purchaseable"],
        name: 'Iron Stash',
        description: 'Craft better and more reliable iron containers for storing coins',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_crafting_courses') > 0 && gameEntity.isEntityUnlocked('action_mining');
        },
        resourceModifier: {
            capMult: {
                resources: {
                    'coins': {
                        A: 0.05,
                        B: 1,
                        C: 1.01,
                        type: 3,
                    }
                }
            },
        },
        get_cost: () => ({
            'inventory_iron_plate': {
                A: 1.1,
                B: 1,
                type: 1
            }
        }),
    })



    gameEntity.registerGameEntity('accessory_lumber_mill', {
        tags: ["accessory", "upgrade", "purchaseable"],
        name: 'Lumber Mill',
        description: 'Build a machine that helps you to process wood',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_crafting_courses') > 0 && gameEntity.isEntityUnlocked('action_mining');
        },
        resourceModifier: {
            multiplier: {
                resources: {
                    'inventory_refined_wood': {
                        A: 0.05,
                        B: 1,
                        type: 0,
                    }
                }
            },
        },
        get_cost: () => ({
            'inventory_iron_plate': {
                A: 1.1,
                B: 2,
                type: 1
            },
            'inventory_stone': {
                A: 1.1,
                B: 5,
                type: 1
            },
            'inventory_refined_wood': {
                A: 1.1,
                B: 5,
                type: 1
            }
        }),
    })
}