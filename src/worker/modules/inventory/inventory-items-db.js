import { gameResources, gameEntity, gameCore, gameEffects } from "game-framework"

const updateLevelBy = (id, amount) => {
    gameEntity.setEntityLevel(id, gameEntity.getLevel(id) + amount, true);
}

export const registerInventoryItems = () => {

    const charismaMod = (attr) => attr > 0 ? 1. / (1. + 0.02*Math.log2(attr*gameEffects.getEffectValue('prices_discount'))) : 1.;

    const metabolismMod = (attr) => attr > 1 ? 1. / (Math.pow(attr, 0.25)) : 1.;


    gameResources.registerResource('inventory_berry', {
        name: 'Berry',
        hasCap: false,
        tags: ['inventory', 'consumable', 'gatherable', 'herb'],
        defaultCap: 0,
        onUse: (amount) => {

        },
        getUsageCooldown: () => {
            return 5*metabolismMod(gameEffects.getEffectValue('metabolism_rate'));
        },
        usageGain: {
            get_income: () => ({
                resources: {
                    health: {
                        A: 1,
                        B: 0,
                        type: 0,
                    }
                }
            })
        },
        get_cost: (amount = 1) => ({
            coins: amount*5*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
        }),
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0
        },
        sellPrice: 0.5,
        rarity: 0,
        allowedTileTypes: ['plain', 'forest', 'lakes', 'hills']
    })

    gameResources.registerResource('inventory_bread', {
        name: 'Bread',
        hasCap: false,
        tags: ['inventory', 'consumable'],
        defaultCap: 0,
        onUse: (amount) => {

        },
        getUsageCooldown: () => {
            return 10*metabolismMod(gameEffects.getEffectValue('metabolism_rate'));
        },
        usageGain: {
            get_income: () => ({
                resources: {
                    energy: {
                        A: 5,
                        B: 0,
                        type: 0,
                    }
                }
            })
        },
        get_cost: (amount = 1) => ({
            coins: amount*5*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
        }),
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0
        },
        sellPrice: 2
    })


    gameResources.registerResource('inventory_fly_mushroom', {
        name: 'Fly Mushroom',
        hasCap: false,
        tags: ['inventory', 'consumable', 'gatherable', 'herb'],
        defaultCap: 0,
        onUse: (amount) => {

        },
        getUsageCooldown: () => {
            return 10*metabolismMod(gameEffects.getEffectValue('metabolism_rate'));
        },
        usageGain: {
            get_income: () => ({
                resources: {
                    knowledge: {
                        A: 3,
                        B: 0,
                        type: 0,
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    health: {
                        A: 5,
                        B: 0,
                        type: 0,
                    }
                }
            })
        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0
        },
        sellPrice: 5,
        rarity: 0,
        allowedTileTypes: ['swamp', 'forest', 'lakes']
    })

    gameResources.registerResource('inventory_golden_algae', {
        name: 'Golden Algae',
        hasCap: false,
        tags: ['inventory', 'consumable', 'gatherable', 'herb'],
        defaultCap: 0,
        onUse: (amount) => {

        },
        getUsageCooldown: () => {
            return 10*metabolismMod(gameEffects.getEffectValue('metabolism_rate'));
        },
        usageGain: {
            get_income: () => ({
                resources: {
                    'mage-xp': {
                        A: 500,
                        B: 0,
                        type: 0,
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    energy: {
                        A: 1,
                        B: 0,
                        type: 0,
                    }
                }
            })
        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0
        },
        sellPrice: 8,
        rarity: 0.6,
    })

    gameResources.registerResource('inventory_knowledge_moss', {
        name: 'Knowledge Moss',
        hasCap: false,
        tags: ['inventory', 'consumable', 'gatherable', 'herb'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {

        },
        getUsageCooldown: () => {
            return 30*metabolismMod(gameEffects.getEffectValue('metabolism_rate'));
        },
        attributes: {
            duration: 20,
        },
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    learning_rate: {
                        A: 0.25,
                        B: 1,
                        type: 0,
                    }
                }
            })
        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0
        },
        sellPrice: 35,
        rarity: 0.6,
        allowedTileTypes: ['plain', 'lakes', 'swamp']
    })

    gameResources.registerResource('inventory_core_duckweed', {
        name: 'Core Duckweed',
        hasCap: false,
        tags: ['inventory', 'consumable', 'gatherable', 'herb'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {

        },
        getUsageCooldown: () => {
            return 30*metabolismMod(gameEffects.getEffectValue('metabolism_rate'));
        },
        attributes: {
            duration: 20,
        },
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    physical_training_learn_speed: {
                        A: 0.5,
                        B: 1,
                        type: 0,
                    }
                }
            })
        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0
        },
        sellPrice: 35,
        rarity: 0.6,
        allowedTileTypes: ['lakes', 'swamp', 'savanna']
    })

    gameResources.registerResource('inventory_aloe_vera', {
        name: 'Aloe Vera',
        hasCap: false,
        tags: ['inventory', 'consumable', 'gatherable', 'herb'],
        defaultCap: 0,
        onUse: (amount) => {

        },
        getUsageCooldown: () => {
            return 20*metabolismMod(gameEffects.getEffectValue('metabolism_rate'));
        },
        usageGain: {
            get_income: () => ({
                resources: {
                    health: {
                        A: 10,
                        B: 0,
                        type: 0,
                    }
                }
            }),
        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0 && gameEntity.getLevel('shop_item_herbs_handbook_1') > 0
        },
        sellPrice: 12,
        rarity: 1,
        allowedTileTypes: ['plain', 'savanna']
    })


    gameResources.registerResource('inventory_ginseng', {
        name: 'Ginseng',
        hasCap: false,
        tags: ['inventory', 'consumable', 'gatherable', 'herb'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {

        },
        getUsageCooldown: () => {
            return 30*metabolismMod(gameEffects.getEffectValue('metabolism_rate'));
        },
        attributes: {
            duration: 20,
        },
        usageGain: {
            get_consumption: () => ({
                resources: {
                    health: {
                        A: 5,
                        B: 0,
                        type: 0,
                    }
                }
            })
        },
        resourceModifier: {
            get_multiplier: () => ({
                resources: {
                    energy: {
                        A: 0.2,
                        B: 1,
                        type: 0,
                    }
                }
            })
        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0 && gameEntity.getLevel('shop_item_herbs_handbook_1') > 0
        },
        sellPrice: 15,
        rarity: 1,
        allowedTileTypes: ['plain', 'mountain', 'hills']
    })


    gameResources.registerResource('inventory_nightshade', {
        name: 'Nightshade',
        hasCap: false,
        tags: ['inventory', 'consumable', 'gatherable', 'herb'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {

        },
        getUsageCooldown: () => {
            return 30*metabolismMod(gameEffects.getEffectValue('metabolism_rate'));
        },
        attributes: {
            duration: 20,
        },
        usageGain: {
            get_consumption: () => ({
                resources: {
                    health: {
                        A: 15,
                        B: 0,
                        type: 0,
                    }
                }
            })
        },
        resourceModifier: {
            get_multiplier: () => ({
                resources: {
                    mana: {
                        A: 0.2,
                        B: 1,
                        type: 0,
                    }
                }
            })
        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0 && gameEntity.getLevel('shop_item_herbs_handbook_1') > 0
            && gameEntity.getLevel('shop_item_spellbook') > 0
        },
        sellPrice: 20,
        rarity: 2,
        allowedTileTypes: ['mountain', 'savanna']
    })


    gameResources.registerResource('inventory_mystic_bloom', {
        name: 'Mystic Bloom',
        hasCap: false,
        tags: ['inventory', 'consumable', 'gatherable', 'herb'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {

        },
        getUsageCooldown: () => {
            return 250*metabolismMod(gameEffects.getEffectValue('metabolism_rate'));
        },
        attributes: {
            duration: 600,
        },
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    spell_xp_rate: {
                        A: 0.5,
                        B: 1,
                        type: 0,
                    }
                }
            })
        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0 && gameEntity.getLevel('shop_item_herbs_handbook_3') > 0
                && gameEntity.getLevel('shop_item_spellbook') > 0
        },
        sellPrice: 20000,
        rarity: 2,
        allowedTileTypes: ['swamp', 'mountain', 'hills']
    })


    gameResources.registerResource('inventory_ember_leaf', {
        name: 'Ember Leaf',
        hasCap: false,
        tags: ['inventory', 'consumable', 'gatherable', 'herb'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {

        },
        getUsageCooldown: () => {
            return 20*metabolismMod(gameEffects.getEffectValue('metabolism_rate'));
        },
        attributes: {
            duration: 300,
        },
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    physical_training_learn_speed: {
                        A: 0.25,
                        B: 1,
                        type: 0,
                    }
                }
            })
        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0 && gameEntity.getLevel('shop_item_herbs_handbook_3') > 0
        },
        sellPrice: 20000,
        rarity: 2,
        allowedTileTypes: ['plain', 'savanna']
    })


    gameResources.registerResource('inventory_harmony_blossom', {
        name: 'Harmony Blossom',
        hasCap: false,
        tags: ['inventory', 'consumable', 'gatherable', 'herb'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {

        },
        getUsageCooldown: () => {
            return 200*metabolismMod(gameEffects.getEffectValue('metabolism_rate'));
        },
        attributes: {
            duration: 300,
        },
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    social_training_learning_rate: {
                        A: 0.5,
                        B: 1,
                        type: 0,
                    }
                }
            })
        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0 && gameEntity.getLevel('shop_item_herbs_handbook_3') > 0
        },
        sellPrice: 20000,
        rarity: 2,
        allowedTileTypes: ['mountain', 'forest']
    })



    gameResources.registerResource('inventory_wood', {
        name: 'Wood',
        hasCap: false,
        tags: ['inventory', 'material'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {

        },
        attributes: {

        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0 && gameEntity.isEntityUnlocked('action_woodcutter')
        },
        sellPrice: 300,
        get_cost: (amount = 1) => ({
            coins: amount*5000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
        }),
    })


    gameResources.registerResource('inventory_refined_wood', {
        name: 'Refined Wood',
        hasCap: false,
        tags: ['inventory', 'material', 'craftable'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {

        },
        attributes: {

        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_crafting_courses') > 0
        },
        sellPrice: 1600,
        get_cost: (amount = 1) => ({
            coins: amount*50000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
        }),
    })


    gameResources.registerResource('inventory_paper', {
        name: 'Paper',
        hasCap: false,
        tags: ['inventory', 'material', 'craftable'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {

        },
        attributes: {

        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_paper_working') > 0
        },
        sellPrice: 3200,
        get_cost: (amount = 1) => ({
            coins: amount*125000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
        }),
    })


    gameResources.registerResource('inventory_enchanted_paper', {
        name: 'Enchanted Paper',
        hasCap: false,
        tags: ['inventory', 'material', 'craftable'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {

        },
        attributes: {

        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_paper_enhance') > 0
        },
        sellPrice: 320000,
        get_cost: (amount = 1) => ({
            coins: amount*6400000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
        }),
    })


    gameResources.registerResource('inventory_herbal_fibers', {
        name: 'Herbal Fibers',
        hasCap: false,
        tags: ['inventory', 'material', 'craftable'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {

        },
        attributes: {

        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_crafting_courses') > 0
        },
        sellPrice: 2000,
        get_cost: (amount = 1) => ({
            coins: amount*75000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
        }),
    })


    gameResources.registerResource('inventory_stone', {
        name: 'Stone',
        hasCap: false,
        tags: ['inventory', 'material'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {

        },
        attributes: {

        },
        unlockedBy: {
            type: 'entity',
            id: 'action_quarrying',
            level: 1,
        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0 && gameEntity.isEntityUnlocked('action_quarrying')
        },
        sellPrice: 625,
        get_cost: (amount = 1) => ({
            coins: amount*12500*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
        }),
    })


    gameResources.registerResource('inventory_iron_ore', {
        name: 'Iron Ore',
        hasCap: false,
        tags: ['inventory', 'material'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {

        },
        attributes: {

        },
        unlockedBy: {
            type: 'entity',
            id: 'action_mining',
            level: 1,
        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0 && gameEntity.isEntityUnlocked('action_mining')
        },
        sellPrice: 5625,
        get_cost: (amount = 1) => ({
            coins: amount*125000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
        }),
    })


    gameResources.registerResource('inventory_ruby', {
        name: 'Ruby',
        hasCap: false,
        tags: ['inventory', 'material', 'craftable'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {

        },
        attributes: {

        },
        unlockedBy: [{
            type: 'entity',
            id: 'action_quarrying',
            level: 2,
        }],
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_crafting_courses') > 0 && gameEntity.isEntityUnlocked('action_quarrying')
        },
        sellPrice: 12000,
        get_cost: (amount = 1) => ({
            coins: amount*800000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
        }),
    })


    gameResources.registerResource('inventory_sapphire', {
        name: 'Sapphire',
        hasCap: false,
        tags: ['inventory', 'material', 'craftable'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {

        },
        attributes: {

        },
        unlockedBy: [{
            type: 'entity',
            id: 'action_quarrying',
            level: 2,
        }],
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_crafting_courses') > 0 && gameEntity.isEntityUnlocked('action_quarrying')
        },
        sellPrice: 16000,
        get_cost: (amount = 1) => ({
            coins: amount*1000000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
        }),
    })


    gameResources.registerResource('inventory_iron_plate', {
        name: 'Iron Plate',
        hasCap: false,
        tags: ['inventory', 'material', 'craftable'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {

        },
        attributes: {

        },
        unlockedBy: [{
            type: 'entity',
            id: 'action_mining',
            level: 2,
        }],
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_crafting_courses') > 0 && gameEntity.isEntityUnlocked('action_mining')
        },
        sellPrice: 160000,
        get_cost: (amount = 1) => ({
            coins: amount*10000000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
        }),
    })


    gameResources.registerResource('inventory_small_endurance_flask', {
        name: 'Small Endurance Flask',
        hasCap: false,
        tags: ['inventory', 'consumable'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {

        },
        getUsageCooldown: () => {
            return 150*metabolismMod(gameEffects.getEffectValue('metabolism_rate'));
        },
        attributes: {
            duration: 150,
        },
        resourceModifier: {
            get_income: () => ({
                resources: {
                    energy: {
                        A: 0,
                        B: 5,
                        type: 0,
                    }
                }
            })
        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0 && gameEntity.getLevel('shop_item_alchemy_courses') > 0
        },
        sellPrice: 225,
    })


    gameResources.registerResource('inventory_healing_potion', {
        name: 'Small Healing Potion',
        hasCap: false,
        tags: ['inventory', 'consumable'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {

        },
        getUsageCooldown: () => {
            return 150*metabolismMod(gameEffects.getEffectValue('metabolism_rate'));
        },
        attributes: {
            duration: 150,
        },
        resourceModifier: {
            get_income: () => ({
                resources: {
                    health: {
                        A: 0,
                        B: 5,
                        type: 0,
                    }
                }
            })
        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0 && gameEntity.getLevel('shop_item_alchemy_courses') > 0
        },
        sellPrice: 425,
    })


    gameResources.registerResource('inventory_experience_potion', {
        name: 'Small Experience Potion',
        hasCap: false,
        tags: ['inventory', 'consumable'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {

        },
        getUsageCooldown: () => {
            return 150*metabolismMod(gameEffects.getEffectValue('metabolism_rate'));
        },
        attributes: {
            duration: 120,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    learning_rate: {
                        A: 1,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    health: {
                        A: 10,
                        B: 0,
                        type: 0
                    },
                    mana: {
                        A: 5,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0 && gameEntity.getLevel('shop_item_alchemy_courses') > 0
        },
        sellPrice: 1500,
    })

    gameResources.registerResource('inventory_insight_potion', {
        name: 'Insight Potion',
        hasCap: false,
        tags: ['inventory', 'consumable'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {

        },
        getUsageCooldown: () => {
            return 20*metabolismMod(gameEffects.getEffectValue('metabolism_rate'));
        },
        attributes: {

        },
        usageGain: {
            income: {
                resources: {
                    'mage-xp': {
                        A: 25000,
                        B: 0,
                        type: 0,
                    }
                }
            }
        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0 && gameEntity.getLevel('shop_item_alchemy_courses') > 0
        },
        sellPrice: 1500,
    })


    gameResources.registerResource('inventory_amnesia_potion', {
        name: 'Amnesia Potion',
        hasCap: false,
        tags: ['inventory', 'consumable'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {
            gameCore.getModule('mage').resetPerks()
        },
        getUsageCooldown: () => {
            return 3600*24;
        },
        attributes: {
            duration: 24*3600,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    learning_rate: {
                        A: -0.25,
                        B: 1,
                        type: 0,
                    }
                }
            },
        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0 && gameEntity.getLevel('shop_item_alchemy_courses') > 0
        },
        sellPrice: 15000,
    })

    // Rare


    gameResources.registerResource('inventory_rare_titanleaf', {
        name: 'Titanleaf',
        hasCap: false,
        tags: ['inventory', 'consumable', 'rare', 'gatherable', 'herb'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {
            updateLevelBy('rare_titanleaf_effect', amount)
        },
        getUsageCooldown: () => {
            return 0.1*metabolismMod(gameEffects.getEffectValue('metabolism_rate'));
        },
        attributes: {
            baseChanceMult: 1,
            entityEffect: 'rare_titanleaf_effect',
            isRare: true,
            allowMultiConsume: true,
        },
        usageGain: {

        },
        resourceModifier: {

        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0 && gameEntity.getLevel('shop_item_herbs_handbook_2') > 0
        },
        sellPrice: 15000,
        rarity: 5,
    })


    gameResources.registerResource('inventory_rare_heartroot', {
        name: 'Heartroot',
        hasCap: false,
        tags: ['inventory', 'consumable', 'rare', 'gatherable', 'herb'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {
            updateLevelBy('rare_heartroot_effect', amount)
        },
        getUsageCooldown: () => {
            return 0.1*metabolismMod(gameEffects.getEffectValue('metabolism_rate'));
        },
        attributes: {
            baseChanceMult: 1,
            entityEffect: 'rare_heartroot_effect',
            isRare: true,
            allowMultiConsume: true,
        },
        usageGain: {

        },
        resourceModifier: {

        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0 && gameEntity.getLevel('shop_item_herbs_handbook_2') > 0
        },
        sellPrice: 15000,
        rarity: 5,
    })


    gameResources.registerResource('inventory_rare_energloom', {
        name: 'Energloom',
        hasCap: false,
        tags: ['inventory', 'consumable', 'rare', 'gatherable', 'herb'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {
            updateLevelBy('rare_energloom_effect', amount)
        },
        getUsageCooldown: () => {
            return 0.1*metabolismMod(gameEffects.getEffectValue('metabolism_rate'));
        },
        attributes: {
            baseChanceMult: 1,
            entityEffect: 'rare_energloom_effect',
            isRare: true,
            allowMultiConsume: true,
        },
        usageGain: {

        },
        resourceModifier: {

        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0 && gameEntity.getLevel('shop_item_herbs_handbook_2') > 0
        },
        sellPrice: 15000,
        rarity: 5,
    })


    gameResources.registerResource('inventory_rare_lifebloom', {
        name: 'Lifebloom',
        hasCap: false,
        tags: ['inventory', 'consumable', 'rare', 'gatherable', 'herb'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {
            updateLevelBy('rare_lifebloom_effect', amount)
        },
        getUsageCooldown: () => {
            return 0.1*metabolismMod(gameEffects.getEffectValue('metabolism_rate'));
        },
        attributes: {
            baseChanceMult: 1,
            entityEffect: 'rare_lifebloom_effect',
            isRare: true,
            allowMultiConsume: true,
        },
        usageGain: {

        },
        resourceModifier: {

        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0 && gameEntity.getLevel('shop_item_herbs_handbook_2') > 0
        },
        sellPrice: 15000,
        rarity: 5,
    })


    gameResources.registerResource('inventory_rare_stillfern', {
        name: 'Stillfern',
        hasCap: false,
        tags: ['inventory', 'consumable', 'rare', 'gatherable', 'herb'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {
            updateLevelBy('rare_stillfern_effect', amount)
        },
        getUsageCooldown: () => {
            return 0.1*metabolismMod(gameEffects.getEffectValue('metabolism_rate'));
        },
        attributes: {
            baseChanceMult: 1,
            entityEffect: 'rare_stillfern_effect',
            isRare: true,
            allowMultiConsume: true,
        },
        usageGain: {

        },
        resourceModifier: {

        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0 && gameEntity.getLevel('shop_item_herbs_handbook_2') > 0
        },
        sellPrice: 15000,
        rarity: 5,
    })

    gameResources.registerResource('inventory_rare_mindroot', {
        name: 'Mindroot',
        hasCap: false,
        tags: ['inventory', 'consumable', 'rare', 'gatherable', 'herb'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {
            updateLevelBy('rare_mindroot_effect', amount)
        },
        getUsageCooldown: () => {
            return 0.1*metabolismMod(gameEffects.getEffectValue('metabolism_rate'));
        },
        attributes: {
            baseChanceMult: 1,
            entityEffect: 'rare_mindroot_effect',
            isRare: true,
            allowMultiConsume: true,
        },
        usageGain: {

        },
        resourceModifier: {

        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0 && gameEntity.getLevel('shop_item_herbs_handbook_2') > 0
        },
        sellPrice: 15000,
        rarity: 5,
    })

    gameResources.registerResource('inventory_rare_azureblossom', {
        name: 'Azureblossom',
        hasCap: false,
        tags: ['inventory', 'consumable', 'rare', 'gatherable', 'herb'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {
            updateLevelBy('rare_azureblossom_effect', amount)
        },
        getUsageCooldown: () => {
            return 0.1*metabolismMod(gameEffects.getEffectValue('metabolism_rate'));
        },
        attributes: {
            baseChanceMult: 1,
            entityEffect: 'rare_azureblossom_effect',
            isRare: true,
            allowMultiConsume: true,
        },
        usageGain: {

        },
        resourceModifier: {

        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0 && gameEntity.getLevel('shop_item_herbs_handbook_2') > 0
        },
        sellPrice: 15000,
        rarity: 5,
    })


    gameResources.registerResource('inventory_rare_ironvine', {
        name: 'Ironvine',
        hasCap: false,
        tags: ['inventory', 'consumable', 'rare', 'gatherable', 'herb'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {
            updateLevelBy('rare_ironvine_effect', amount)
        },
        getUsageCooldown: () => {
            return 0.1*metabolismMod(gameEffects.getEffectValue('metabolism_rate'));
        },
        attributes: {
            baseChanceMult: 1,
            entityEffect: 'rare_ironvine_effect',
            isRare: true,
            allowMultiConsume: true,
        },
        usageGain: {

        },
        resourceModifier: {

        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0 && gameEntity.getLevel('shop_item_herbs_handbook_2') > 0
        },
        sellPrice: 15000,
        rarity: 5,
    })


    gameResources.registerResource('inventory_rare_mindspire', {
        name: 'Mindspire',
        hasCap: false,
        tags: ['inventory', 'consumable', 'rare', 'gatherable', 'herb'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {
            updateLevelBy('rare_mindspire_effect', amount)
        },
        getUsageCooldown: () => {
            return 0.1*metabolismMod(gameEffects.getEffectValue('metabolism_rate'));
        },
        attributes: {
            baseChanceMult: 1,
            entityEffect: 'rare_mindspire_effect',
            isRare: true,
            allowMultiConsume: true,
        },
        usageGain: {

        },
        resourceModifier: {

        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0 && gameEntity.getLevel('shop_item_herbs_handbook_2') > 0
        },
        sellPrice: 15000,
        rarity: 5,
    })


    gameResources.registerResource('inventory_rare_verdant_coil', {
        name: 'Verdant Coil',
        hasCap: false,
        tags: ['inventory', 'consumable', 'rare', 'gatherable', 'herb'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {
            updateLevelBy('rare_verdant_coil_effect', amount)
        },
        getUsageCooldown: () => {
            return 0.1*metabolismMod(gameEffects.getEffectValue('metabolism_rate'));
        },
        attributes: {
            baseChanceMult: 1,
            entityEffect: 'rare_verdant_coil_effect',
            isRare: true,
            allowMultiConsume: true,
        },
        usageGain: {

        },
        resourceModifier: {

        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0 && gameEntity.getLevel('shop_item_herbs_handbook_3') > 0
        },
        sellPrice: 15000,
        rarity: 5,
    })

}