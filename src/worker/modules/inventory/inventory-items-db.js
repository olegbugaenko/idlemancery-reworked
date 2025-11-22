import { gameResources, gameEntity, gameCore, gameEffects } from "game-framework"

const updateLevelBy = (id, amount) => {
    gameEntity.setEntityLevel(id, gameEntity.getLevel(id) + amount, true);
}

export const metabolismMod = (attr) => attr > 1 ? 1. / (Math.pow(attr, 0.25)) : 1.;

export const metabolismIntensityMod = (attr) => 1.; //attr > 1 ? Math.pow(attr, 0.25) : 1.;

export const sellPriceMod = (attr) => attr > 1 ? Math.min(5, 1. +  0.02*(Math.log2(attr) ** 2.0)) : 1.;


const getResourceModifierDataSearchable = (rs, initial = null) => {

    const searchables = initial ?? {
        'effects': [],
        'resources': []
    };

    if(!rs) return searchables;


    ['income', 'consumption', 'multiplier'].forEach(scope => {
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

export const registerInventoryItem = (id, options) => {

    const searchableBuUsage = getResourceModifierDataSearchable(options.usageGain);

    options.searchableMeta = getResourceModifierDataSearchable(options.resourceModifier, searchableBuUsage);

    gameResources.registerResource(id, options);
}

export const registerInventoryItems = () => {

    const charismaMod = (attr) => attr > 0 ? 1. / (1. + 0.02*Math.log2(attr*gameEffects.getEffectValue('prices_discount'))) : 1.;

    registerInventoryItem('inventory_brightleaf', {
        name: 'Brightleaf',
        hasCap: false,
        tags: ['inventory', 'consumable', 'gatherable', 'herb'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {

        },
        getUsageCooldown: () => {
            return 0;
        },
        attributes: {
            duration: 20,
        },
        resourceModifier: {
            get_income: () => ({
                effects: {
                    plain_learn_rate: {
                        A: 5*metabolismIntensityMod(gameEffects.getEffectValue('metabolism_rate')),
                        B: 0,
                        type: 0,
                    }
                }
            })
        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0
        },
        get_cost: (amount = 1) => ({
            coins: amount*20*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
        }),
        purchaseRenewRate: 25,
        sellPrice: 5,
        rarity: 0.3,
        allowedTileTypes: ['plain', 'lakes', 'swamp']
    })

    registerInventoryItem('inventory_clay', {
        name: 'Clay',
        hasCap: false,
        tags: ['inventory', 'material', 'construction'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {

        },
        getUsageCooldown: () => {
            return 0;
        },
        attributes: {
            duration: 0,
        },
        unlockCondition: () => {
            return gameEntity.isEntityUnlocked('action_clay_mining')
        },
        sellPrice: 75625,
        get_cost: (amount = 1) => ({
            coins: amount*5250000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
        }),
        purchaseRenewRate: 1,
    })

    registerInventoryItem('inventory_pot', {
        name: 'Pot',
        hasCap: false,
        tags: ['inventory', 'material', 'craftable'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {

        },
        getUsageCooldown: () => {
            return 0;
        },
        attributes: {
            duration: 0,
        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_pottery_secrets_handbook') > 0
        },
        sellPrice: 1200,
    })


    registerInventoryItem('inventory_candle', {
        name: 'Candle',
        hasCap: false,
        tags: ['inventory', 'consumable', 'common'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {

        },
        getUsageCooldown: () => {
            return 0;
        },
        attributes: {
            duration: 30,
        },
        resourceModifier: {
            get_income: () => ({
                effects: {
                    plain_learn_rate: {
                        A: 8,
                        B: 0,
                        type: 0,
                    }
                }
            })
        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0
        },
        get_cost: (amount = 1) => ({
            coins: amount*800*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
        }),
        purchaseRenewRate: 10,
        sellPrice: 25,
        rarity: 0.3,
    })

    registerInventoryItem('inventory_berry', {
        name: 'Berry',
        hasCap: false,
        tags: ['inventory', 'consumable', 'gatherable', 'herb'],
        defaultCap: 0,
        onUse: (amount) => {

        },
        getUsageCooldown: () => {
            return 5;
        },
        usageGain: {
            get_income: () => ({
                resources: {
                    health: {
                        A: 1*metabolismIntensityMod(gameEffects.getEffectValue('metabolism_rate')),
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
        purchaseRenewRate: 100,
        sellPrice: 1,
        rarity: 0,
        allowedTileTypes: ['plain', 'forest', 'lakes', 'hills']
    })

    registerInventoryItem('inventory_bread', {
        name: 'Bread',
        hasCap: false,
        tags: ['inventory', 'consumable', 'food'],
        defaultCap: 0,
        onUse: (amount) => {

        },
        getUsageCooldown: () => {
            return 10;
        },
        usageGain: {
            get_income: () => ({
                resources: {
                    energy: {
                        A: 5*metabolismIntensityMod(gameEffects.getEffectValue('metabolism_rate')),
                        B: 0,
                        type: 0,
                    }
                }
            })
        },
        purchaseRenewRate: 100,
        get_cost: (amount = 1) => ({
            coins: amount*5*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
        }),
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0
        },
        sellPrice: 2
    })


    registerInventoryItem('inventory_fly_mushroom', {
        name: 'Fly Mushroom',
        hasCap: false,
        tags: ['inventory', 'consumable', 'gatherable', 'herb'],
        defaultCap: 0,
        onUse: (amount) => {

        },
        getUsageCooldown: () => {
            return 10;
        },
        usageGain: {
            get_income: () => ({
                resources: {
                    knowledge: {
                        A: 3*metabolismIntensityMod(gameEffects.getEffectValue('metabolism_rate')),
                        B: 0,
                        type: 0,
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    health: {
                        A: 5*metabolismIntensityMod(gameEffects.getEffectValue('metabolism_rate')),
                        B: 0,
                        type: 0,
                    }
                }
            })
        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0
        },
        sellPrice: 40,
        rarity: 0,
        allowedTileTypes: ['swamp', 'forest', 'lakes']
    })

    registerInventoryItem('inventory_golden_algae', {
        name: 'Golden Algae',
        hasCap: false,
        tags: ['inventory', 'consumable', 'gatherable', 'herb'],
        defaultCap: 0,
        onUse: (amount) => {

        },
        getUsageCooldown: () => {
            return 10;
        },
        usageGain: {
            get_income: () => ({
                resources: {
                    'mage-xp': {
                        A: 500*metabolismIntensityMod(gameEffects.getEffectValue('metabolism_rate')),
                        B: 0,
                        type: 0,
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    energy: {
                        A: 1*metabolismIntensityMod(gameEffects.getEffectValue('metabolism_rate')),
                        B: 0,
                        type: 0,
                    }
                }
            })
        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0 && gameEntity.getLevel('shop_item_map') > 0
        },
        sellPrice: 180,
        rarity: 0.2,
    })

    registerInventoryItem('inventory_knowledge_moss', {
        name: 'Knowledge Moss',
        hasCap: false,
        tags: ['inventory', 'consumable', 'gatherable', 'herb'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {

        },
        getUsageCooldown: () => {
            return 0;
        },
        attributes: {
            duration: 30,
        },
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    learning_rate: {
                        A: 0.2*metabolismIntensityMod(gameEffects.getEffectValue('metabolism_rate')),
                        B: 1,
                        type: 0,
                    }
                }
            })
        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0 && gameEntity.getLevel('shop_item_map') > 0
        },
        sellPrice: 350,
        rarity: 0.2,
        allowedTileTypes: ['plain', 'lakes', 'swamp']
    })

    registerInventoryItem('inventory_core_duckweed', {
        name: 'Core Duckweed',
        hasCap: false,
        tags: ['inventory', 'consumable', 'gatherable', 'herb'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {

        },
        getUsageCooldown: () => {
            return 0;
        },
        attributes: {
            duration: 30,
        },
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    physical_training_learn_speed: {
                        A: 0.4*metabolismIntensityMod(gameEffects.getEffectValue('metabolism_rate')),
                        B: 1,
                        type: 0,
                    }
                }
            })
        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0 && gameEntity.getLevel('shop_item_map') > 0
        },
        sellPrice: 350,
        rarity: 0.25,
        allowedTileTypes: ['lakes', 'swamp', 'savanna']
    })


    registerInventoryItem('inventory_thinkroot', {
        name: 'Thinkroot',
        hasCap: false,
        tags: ['inventory', 'consumable', 'gatherable', 'herb'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {

        },
        getUsageCooldown: () => {
            return 0;
        },
        attributes: {
            duration: 30,
        },
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    mental_training_learning_rate: {
                        A: 0.4*metabolismIntensityMod(gameEffects.getEffectValue('metabolism_rate')),
                        B: 1,
                        type: 0,
                    }
                }
            })
        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0 && gameEntity.getLevel('shop_item_map') > 0
        },
        sellPrice: 350,
        rarity: 0.25,
        allowedTileTypes: ['mountain', 'plains', 'savanna']
    })


    registerInventoryItem('inventory_focusberry', {
        name: 'Focusberry',
        hasCap: false,
        tags: ['inventory', 'consumable', 'gatherable', 'herb'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {

        },
        getUsageCooldown: () => {
            return 0;
        },
        attributes: {
            duration: 30,
        },
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    routine_learning_speed: {
                        A: 0.4*metabolismIntensityMod(gameEffects.getEffectValue('metabolism_rate')),
                        B: 1,
                        type: 0,
                    }
                }
            })
        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0 && gameEntity.getLevel('shop_item_map') > 0
        },
        sellPrice: 350,
        rarity: 0.25,
        allowedTileTypes: ['lakes', 'forest', 'swamp']
    })

    registerInventoryItem('inventory_aloe_vera', {
        name: 'Aloe Vera',
        hasCap: false,
        tags: ['inventory', 'consumable', 'gatherable', 'herb'],
        defaultCap: 0,
        onUse: (amount) => {

        },
        getUsageCooldown: () => {
            return 20;
        },
        usageGain: {
            get_income: () => ({
                resources: {
                    health: {
                        A: 20*metabolismIntensityMod(gameEffects.getEffectValue('metabolism_rate')),
                        B: 0,
                        type: 0,
                    }
                }
            }),
        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0 && gameEntity.getLevel('shop_item_herbs_handbook_1') > 0
        },
        sellPrice: 390,
        rarity: 0.5,
        allowedTileTypes: ['plain', 'savanna']
    })


    registerInventoryItem('inventory_ginseng', {
        name: 'Ginseng',
        hasCap: false,
        tags: ['inventory', 'consumable', 'gatherable', 'herb'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {

        },
        getUsageCooldown: () => {
            return 0;
        },
        attributes: {
            duration: 30,
        },
        usageGain: {
            get_consumption: () => ({
                resources: {
                    health: {
                        A: 5*metabolismIntensityMod(gameEffects.getEffectValue('metabolism_rate')),
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
                        A: 0.2*metabolismIntensityMod(gameEffects.getEffectValue('metabolism_rate')),
                        B: 1,
                        type: 0,
                    }
                }
            })
        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0 && gameEntity.getLevel('shop_item_herbs_handbook_1') > 0
        },
        sellPrice: 390,
        rarity: 0.5,
        allowedTileTypes: ['plain', 'mountain', 'hills']
    })


    registerInventoryItem('inventory_nightshade', {
        name: 'Nightshade',
        hasCap: false,
        tags: ['inventory', 'consumable', 'gatherable', 'herb'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {

        },
        getUsageCooldown: () => {
            return 0;
        },
        attributes: {
            duration: 30,
        },
        usageGain: {
            get_consumption: () => ({
                resources: {
                    health: {
                        A: 15*metabolismIntensityMod(gameEffects.getEffectValue('metabolism_rate')),
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
                        A: 0.1*metabolismIntensityMod(gameEffects.getEffectValue('metabolism_rate')),
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
        sellPrice: 200,
        rarity: 1,
        allowedTileTypes: ['mountain', 'savanna']
    })


    registerInventoryItem('inventory_mystic_bloom', {
        name: 'Mystic Bloom',
        hasCap: false,
        tags: ['inventory', 'consumable', 'gatherable', 'herb'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {

        },
        getUsageCooldown: () => {
            return 0;
        },
        attributes: {
            duration: 120,
        },
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    spell_xp_rate: {
                        A: 0.5*metabolismIntensityMod(gameEffects.getEffectValue('metabolism_rate')),
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
        allowedTileTypes: ['swamp', 'mountain', 'hills'],
        lootAmountMult: 0.5,
    })


    registerInventoryItem('inventory_ember_leaf', {
        name: 'Ember Leaf',
        hasCap: false,
        tags: ['inventory', 'consumable', 'gatherable', 'herb'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {

        },
        getUsageCooldown: () => {
            return 0;
        },
        attributes: {
            duration: 120,
        },
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    physical_training_learn_speed: {
                        A: 0.2*metabolismIntensityMod(gameEffects.getEffectValue('metabolism_rate')),
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
        allowedTileTypes: ['plain', 'savanna'],
        lootAmountMult: 0.5,
    })


    registerInventoryItem('inventory_harmony_blossom', {
        name: 'Harmony Blossom',
        hasCap: false,
        tags: ['inventory', 'consumable', 'gatherable', 'herb'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {

        },
        getUsageCooldown: () => {
            return 0;
        },
        attributes: {
            duration: 120,
        },
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    social_training_learning_rate: {
                        A: 0.2*metabolismIntensityMod(gameEffects.getEffectValue('metabolism_rate')),
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
        allowedTileTypes: ['mountain', 'forest'],
        lootAmountMult: 0.5,
    })



    registerInventoryItem('inventory_wood', {
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
        sellPrice: 1200,
        get_cost: (amount = 1) => ({
            coins: amount*5000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
        }),
    })

    registerInventoryItem('inventory_water', {
        name: 'Water',
        hasCap: false,
        tags: ['inventory', 'elemental', 'artifact-material'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {

        },
        attributes: {

        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0 && gameEntity.isEntityUnlocked('spell_conjure_water')
        },
        sellPrice: 16000,
    })


    registerInventoryItem('inventory_air', {
        name: 'Air Element',
        hasCap: false,
        tags: ['inventory', 'elemental'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {

        },
        attributes: {

        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0 && gameEntity.isEntityUnlocked('spell_conjure_air')
        },
        sellPrice: 16000,
    })

    registerInventoryItem('inventory_earth', {
        name: 'Earth Element',
        hasCap: false,
        tags: ['inventory', 'elemental'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {

        },
        attributes: {

        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0 && gameEntity.isEntityUnlocked('spell_conjure_earth')
        },
        sellPrice: 16000,
    })

    registerInventoryItem('inventory_spark', {
        name: 'Spark Element',
        hasCap: false,
        tags: ['inventory', 'elemental'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {

        },
        attributes: {

        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0 && gameEntity.isEntityUnlocked('spell_conjure_spark')
        },
        sellPrice: 25000,
    })

    registerInventoryItem('inventory_light', {
        name: 'Light Element',
        hasCap: false,
        tags: ['inventory', 'elemental'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {

        },
        attributes: {

        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0 && gameEntity.isEntityUnlocked('spell_conjure_light')
        },
        sellPrice: 25000,
    })

    registerInventoryItem('inventory_fire', {
        name: 'Fire Element',
        hasCap: false,
        tags: ['inventory', 'elemental'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {

        },
        attributes: {

        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0 && gameEntity.isEntityUnlocked('spell_conjure_fire')
        },
        sellPrice: 25000,
    })

    registerInventoryItem('inventory_refined_wood', {
        name: 'Refined Wood',
        hasCap: false,
        tags: ['inventory', 'material', 'craftable', 'artifact-material'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {

        },
        attributes: {

        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_crafting_courses') > 0
        },
        sellPrice: 1400,
        get_cost: (amount = 1) => ({
            coins: amount*80000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
        }),
    })

    registerInventoryItem('inventory_wooden_beam', {
        name: 'Wooden Beam',
        hasCap: false,
        tags: ['inventory', 'material', 'craftable'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {

        },
        attributes: {

        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_constructing') > 0
        },
        sellPrice: 5600,
    })


    registerInventoryItem('inventory_paper', {
        name: 'Paper',
        hasCap: false,
        tags: ['inventory', 'material', 'craftable', 'artifact-material', 'paper'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {

        },
        attributes: {

        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_paper_working') > 0
        },
        sellPrice: 14200,
        get_cost: (amount = 1) => ({
            coins: amount*125000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
        }),
    })


    registerInventoryItem('inventory_enchanted_paper', {
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
        purchaseRenewRate: 0.1,
    })


    registerInventoryItem('inventory_herbal_fibers', {
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
            return gameEntity.getLevel('shop_item_crafting_courses') > 0 && gameEntity.getLevel('shop_item_herbs_handbook_1') > 0
        },
        sellPrice: 10000,
        get_cost: (amount = 1) => ({
            coins: amount*100000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
        }),
    })


    registerInventoryItem('inventory_stone', {
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
        sellPrice: 1625,
        get_cost: (amount = 1) => ({
            coins: amount*12500*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
        }),
    })

    registerInventoryItem('inventory_stone_brick', {
        name: 'Stone Brick',
        hasCap: false,
        tags: ['inventory', 'material'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {

        },
        attributes: {

        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0 && gameEntity.isEntityUnlocked('action_quarrying')
        },
        sellPrice: 5000,
        get_cost: (amount = 1) => ({
            coins: amount*150000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
        }),
    })


    registerInventoryItem('inventory_iron_ore', {
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
        sellPrice: 15625,
        get_cost: (amount = 1) => ({
            coins: amount*225000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
        }),
    })


    registerInventoryItem('inventory_ruby', {
        name: 'Ruby',
        hasCap: false,
        tags: ['inventory', 'material', 'craftable', 'artifact-material'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {

        },
        attributes: {

        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_crafting_courses') > 0 && gameEntity.getLevel('shop_item_stone_refinement_manual') >= 1
        },
        sellPrice: 12000,
        get_cost: (amount = 1) => ({
            coins: amount*800000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
        }),
        purchaseRenewRate: 0.25,
    })


    registerInventoryItem('inventory_sapphire', {
        name: 'Sapphire',
        hasCap: false,
        tags: ['inventory', 'material', 'craftable', 'artifact-material'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {

        },
        attributes: {

        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_crafting_courses') > 0 && gameEntity.getLevel('shop_item_stone_refinement_manual') >= 1
        },
        sellPrice: 16000,
        get_cost: (amount = 1) => ({
            coins: amount*1000000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
        }),
        purchaseRenewRate: 0.25,
    })


    registerInventoryItem('inventory_obsidian_shard', {
        name: 'Obsidian Shard',
        hasCap: false,
        tags: ['inventory', 'material', 'craftable'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {

        },
        attributes: {

        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_crafting_courses') > 0 && gameEntity.isEntityUnlocked('action_quarrying')
            && gameEffects.getEffectValue('attribute_strength') >= 5000
        },
        sellPrice: 324000,
        /*get_cost: (amount = 1) => ({
            coins: amount*400000000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
        }),*/
    })


    registerInventoryItem('inventory_iron_plate', {
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
        sellPrice: 360000,
        get_cost: (amount = 1) => ({
            coins: amount*20000000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
        }),
    })


    registerInventoryItem('inventory_coal', {
        name: 'Coal',
        hasCap: false,
        tags: ['inventory', 'material', 'mineral', 'fuel'],
        defaultCap: 0,
        isAbstract: true,
        unlockCondition: () => {
            return gameEntity.isEntityUnlocked('action_coal_mining');
        },
        sellPrice: 100000,
    })

    registerInventoryItem('inventory_forged_steel', {
        name: 'Forged Steel',
        hasCap: false,
        tags: ['inventory', 'material', 'craftable', 'artifact-material'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {

        },
        attributes: {

        },
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_strength',
            level: 7500,
        }],
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_crafting_courses') > 0 && gameEffects.getEffectValue('attribute_strength') >= 7500
        },
        sellPrice: 1560000,
    })


    registerInventoryItem('inventory_green_ink', {
        name: 'Green Ink',
        hasCap: false,
        tags: ['inventory', 'material', 'craftable'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {

        },
        attributes: {

        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_crafting_courses') > 0 && gameEntity.getLevel('shop_item_ink_crafting') > 0
        },
        sellPrice: 160000,
    })


    registerInventoryItem('inventory_red_ink', {
        name: 'Red Ink',
        hasCap: false,
        tags: ['inventory', 'material', 'craftable', 'artifact-material', 'ink'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {

        },
        attributes: {

        },
        unlockCondition: () => {
            return (gameEntity.getLevel('shop_item_crafting_courses') > 0) && (gameEntity.getLevel('shop_item_better_ink_crafting') > 0) && gameEntity.getLevel('shop_item_herbs_handbook_3') > 0
        },
        sellPrice: 160000,
    })


    registerInventoryItem('inventory_map_fragment', {
        name: 'Map Fragment',
        hasCap: false,
        tags: ['inventory', 'material', 'craftable'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {

        },
        attributes: {

        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_crafting_courses') > 0 && gameEntity.getLevel('shop_item_cartography') > 0
        },
        sellPrice: 160000,
    })

    registerInventoryItem('inventory_amber', {
        name: 'Amber',
        hasCap: false,
        tags: ['inventory', 'material', 'gatherable'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {

        },
        attributes: {

        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_crafting_courses') > 0 && gameEntity.getLevel('shop_item_amber_gathering') > 0
        },
        sellPrice: 4000000,
        rarity: 6,
        allowedTileTypes: ['plain', 'swamp'],
        lootAmountMult: 0.05,
    })

    registerInventoryItem('inventory_hunting_net', {
        name: 'Hunting Net',
        hasCap: false,
        tags: ['inventory', 'material', 'craftable'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {

        },
        attributes: {

        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_crafting_courses') > 0 && gameEntity.getLevel('shop_item_hunting') > 0
        },
        sellPrice: 4000000,
        rarity: 6,
        allowedTileTypes: ['plain', 'swamp'],
        lootAmountMult: 0.05,
    })


    registerInventoryItem('inventory_duck_meat', {
        name: 'Duck Meat',
        hasCap: false,
        tags: ['inventory', 'consumable', 'hunting'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {

        },
        attributes: {
            duration: 300,
        },
        resourceModifier: {
            get_multiplier: () => ({
                resources: {
                    energy: {
                        A: 0.25*metabolismIntensityMod(gameEffects.getEffectValue('metabolism_rate')),
                        B: 1,
                        type: 0,
                    }
                }
            })
        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_crafting_courses') > 0 && gameResources.isResourceUnlocked('inventory_hunting_net') > 0
        },
        sellPrice: 8400000,
        rarity: 5,
        allowedTileTypes: ['plain', 'swamp'],
        lootAmountMult: 0.1,
    })


    registerInventoryItem('inventory_caw_meat', {
        name: 'Caw Meat',
        hasCap: false,
        tags: ['inventory', 'consumable', 'hunting'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {

        },
        attributes: {
            duration: 300,
        },
        resourceModifier: {
            get_multiplier: () => ({
                resources: {
                    health: {
                        A: 0.25*metabolismIntensityMod(gameEffects.getEffectValue('metabolism_rate')),
                        B: 1,
                        type: 0,
                    }
                }
            })
        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_crafting_courses') > 0 && gameResources.isResourceUnlocked('inventory_hunting_net') > 0
        },
        sellPrice: 8400000,
        rarity: 5,
        allowedTileTypes: ['plain', 'swamp'],
        lootAmountMult: 0.1,
    })

    registerInventoryItem('inventory_small_endurance_flask', {
        name: 'Small Endurance Flask',
        hasCap: false,
        tags: ['inventory', 'consumable', 'potion'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {

        },
        getUsageCooldown: () => {
            return 0;
        },
        attributes: {
            duration: 600,
        },
        resourceModifier: {
            get_income: () => ({
                resources: {
                    energy: {
                        A: 0,
                        B: 5*metabolismIntensityMod(gameEffects.getEffectValue('metabolism_rate')),
                        type: 0,
                    }
                }
            })
        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0 && gameEntity.getLevel('shop_item_alchemy_courses') > 0 && gameEntity.getLevel('shop_item_herbs_handbook_1') > 0
        },
        sellPrice: 225,
    })


    registerInventoryItem('inventory_healing_potion', {
        name: 'Small Healing Potion',
        hasCap: false,
        tags: ['inventory', 'consumable', 'potion'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {

        },
        getUsageCooldown: () => {
            return 0;
        },
        attributes: {
            duration: 600,
        },
        resourceModifier: {
            get_income: () => ({
                resources: {
                    health: {
                        A: 0,
                        B: 5*metabolismIntensityMod(gameEffects.getEffectValue('metabolism_rate')),
                        type: 0,
                    }
                }
            })
        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0 && gameEntity.getLevel('shop_item_alchemy_courses') > 0 && gameEntity.getLevel('shop_item_herbs_handbook_1') > 0
        },
        sellPrice: 425,
    })


    registerInventoryItem('inventory_experience_potion', {
        name: 'Small Experience Potion',
        hasCap: false,
        tags: ['inventory', 'consumable', 'potion'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {

        },
        getUsageCooldown: () => {
            return 0;
        },
        attributes: {
            duration: 300,
        },
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    learning_rate: {
                        A: 0.5*metabolismIntensityMod(gameEffects.getEffectValue('metabolism_rate')),
                        B: 1,
                        type: 0,
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    health: {
                        A: 10*metabolismIntensityMod(gameEffects.getEffectValue('metabolism_rate')),
                        B: 0,
                        type: 0
                    },
                    mana: {
                        A: 5*metabolismIntensityMod(gameEffects.getEffectValue('metabolism_rate')),
                        B: 0,
                        type: 0
                    }
                }
            })
        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0 && gameEntity.getLevel('shop_item_alchemy_courses') > 0 && gameEntity.getLevel('shop_item_herbs_handbook_1') > 0
            && gameEntity.getLevel('shop_item_spellbook') > 0
        },
        sellPrice: 1500,
    })

    registerInventoryItem('inventory_insight_potion', {
        name: 'Insight Potion',
        hasCap: false,
        tags: ['inventory', 'consumable', 'potion'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {

        },
        getUsageCooldown: () => {
            return 20;
        },
        attributes: {

        },
        usageGain: {
            get_income: () => ({
                resources: {
                    'mage-xp': {
                        A: 125000*metabolismIntensityMod(gameEffects.getEffectValue('metabolism_rate')),
                        B: 0,
                        type: 0,
                    }
                }
            })
        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0 && gameEntity.getLevel('shop_item_alchemy_courses') > 0
        },
        sellPrice: 1500,
    })


    registerInventoryItem('inventory_amnesia_potion', {
        name: 'Amnesia Potion',
        hasCap: false,
        tags: ['inventory', 'consumable', 'special-potion'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {
            gameCore.getModule('mage').resetPerks()
        },
        getUsageCooldown: () => {
            return 3600*20;
        },
        attributes: {
            duration: 4*3600,
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
            return gameEntity.getLevel('shop_item_backpack') > 0 && gameEntity.getLevel('shop_item_alchemy_courses') > 0 && gameEntity.getLevel('shop_item_herbs_handbook_1') > 0
        },
        sellPrice: 15000,
    })

    registerInventoryItem('inventory_crafting_potion', {
        name: 'Crafting Potion',
        hasCap: false,
        tags: ['inventory', 'consumable', 'potion'],
        defaultCap: 0,
        isAbstract: true,
        getUsageCooldown: () => {
            return 0;
        },
        onUse: (amount) => {

        },
        attributes: {
            duration: 300,
        },
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    crafting_efficiency: {
                        A: 0.5*metabolismIntensityMod(gameEffects.getEffectValue('metabolism_rate')),
                        B: 1,
                        type: 0,
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    health: {
                        A: 100*metabolismIntensityMod(gameEffects.getEffectValue('metabolism_rate')),
                        B: 0,
                        type: 0,
                    }
                }
            })
        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0 && gameEntity.getLevel('shop_item_alchemy_courses') > 0 && gameEntity.getLevel('shop_item_herbs_handbook_3') > 0
        },
        sellPrice: 15000,
    })

    // Rare Flasks

    registerInventoryItem('inventory_titans_potion', {
        name: 'Titans Potion',
        hasCap: false,
        tags: ['inventory', 'consumable', 'potion', 'rare'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {
            updateLevelBy('rare_titans_potion_effect', amount)
        },
        getUsageCooldown: () => {
            return 0.1;
        },
        attributes: {
            isRare: true,
            entityEffect: 'rare_titans_potion_effect',
            allowMultiConsume: true,
        },
        resourceModifier: {

        },
        usageGain: {

        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0 && gameEntity.getLevel('shop_item_alchemy_courses') > 0 && gameEntity.getLevel('shop_item_herbs_handbook_2') > 0
        },
        sellPrice: 522500,
    })

    registerInventoryItem('inventory_perseverance_potion', {
        name: 'Perseverance Potion',
        hasCap: false,
        tags: ['inventory', 'consumable', 'potion', 'rare'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {
            updateLevelBy('rare_perseverance_potion_effect', amount)
        },
        getUsageCooldown: () => {
            return 0.1;
        },
        attributes: {
            isRare: true,
            entityEffect: 'rare_perseverance_potion_effect',
            allowMultiConsume: true,
        },
        resourceModifier: {

        },
        usageGain: {

        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0 && gameEntity.getLevel('shop_item_alchemy_courses') > 0 && gameEntity.getLevel('shop_item_herbs_handbook_2') > 0
        },
        sellPrice: 522500,
    })

    registerInventoryItem('inventory_mental_potion', {
        name: 'Mental Potion',
        hasCap: false,
        tags: ['inventory', 'consumable', 'potion', 'rare'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {
            updateLevelBy('rare_mental_potion_effect', amount)
        },
        getUsageCooldown: () => {
            return 0.1;
        },
        attributes: {
            isRare: true,
            entityEffect: 'rare_mental_potion_effect',
            allowMultiConsume: true,
        },
        resourceModifier: {

        },
        usageGain: {

        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0 && gameEntity.getLevel('shop_item_alchemy_courses') > 0 && gameEntity.getLevel('shop_item_herbs_handbook_2') > 0
        },
        sellPrice: 522500,
    })


    registerInventoryItem('inventory_spirit_potion', {
        name: 'Spirit Potion',
        hasCap: false,
        tags: ['inventory', 'consumable', 'potion', 'rare'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {
            updateLevelBy('rare_spirit_potion_effect', amount)
        },
        getUsageCooldown: () => {
            return 0.1;
        },
        attributes: {
            isRare: true,
            entityEffect: 'rare_spirit_potion_effect',
            allowMultiConsume: true,
        },
        resourceModifier: {

        },
        usageGain: {

        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0 && gameEntity.getLevel('shop_item_alchemy_courses') > 0 && gameEntity.getLevel('shop_item_herbs_handbook_2') > 0
        },
        sellPrice: 522500,
    })


    registerInventoryItem('inventory_charisma_potion', {
        name: 'Charisma Potion',
        hasCap: false,
        tags: ['inventory', 'consumable', 'potion', 'rare'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {
            updateLevelBy('rare_charisma_potion_effect', amount)
        },
        getUsageCooldown: () => {
            return 0.1;
        },
        attributes: {
            isRare: true,
            entityEffect: 'rare_charisma_potion_effect',
            allowMultiConsume: true,
        },
        resourceModifier: {

        },
        usageGain: {

        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0 && gameEntity.getLevel('shop_item_alchemy_courses') > 0 && gameEntity.getLevel('shop_item_herbs_handbook_2') > 0
        },
        sellPrice: 522500,
    })

    
    registerInventoryItem('inventory_craftmasters_elixir', {
        name: 'Craftmaster\'s Elixir',
        hasCap: false,
        tags: ['inventory', 'consumable', 'potion', 'rare'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {
            updateLevelBy('rare_craftmasters_elixir_effect', amount)
        },
        getUsageCooldown: () => {
            return 0.1;
        },
        attributes: {
            isRare: true,
            entityEffect: 'rare_craftmasters_elixir_effect',
            allowMultiConsume: true,
        },
        resourceModifier: {

        },
        usageGain: {

        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0 && gameEntity.getLevel('shop_item_advanced_alchemy') > 0
        },
        sellPrice: 35000000,
    })

    registerInventoryItem('inventory_herbalists_elixir', {
        name: 'Herbalist\'s Elixir',
        hasCap: false,
        tags: ['inventory', 'consumable', 'potion', 'rare'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {
            updateLevelBy('rare_herbalists_elixir_effect', amount)
        },
        getUsageCooldown: () => {
            return 0.1;
        },
        attributes: {
            isRare: true,
            entityEffect: 'rare_herbalists_elixir_effect',
            allowMultiConsume: true,
        },
        resourceModifier: {

        },
        usageGain: {

        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0 && gameEntity.getLevel('shop_item_advanced_alchemy') > 0
        },
        sellPrice: 35000000,
    })

    registerInventoryItem('inventory_alchemists_elixir', {
        name: 'Alchemist\'s Elixir',
        hasCap: false,
        tags: ['inventory', 'consumable', 'potion', 'rare'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {
            updateLevelBy('rare_alchemists_elixir_effect', amount)
        },
        getUsageCooldown: () => {
            return 0.1;
        },
        attributes: {
            isRare: true,
            entityEffect: 'rare_alchemists_elixir_effect',
            allowMultiConsume: true,
        },
        resourceModifier: {

        },
        usageGain: {

        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0 && gameEntity.getLevel('shop_item_advanced_alchemy') > 0
        },
        sellPrice: 3500000,
    })

    registerInventoryItem('inventory_elementalists_elixir', {
        name: 'Elementalist\'s Elixir',
        hasCap: false,
        tags: ['inventory', 'consumable', 'potion', 'rare'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {
            updateLevelBy('rare_elementalists_elixir_effect', amount)
        },
        getUsageCooldown: () => {
            return 0.1;
        },
        attributes: {
            isRare: true,
            entityEffect: 'rare_elementalists_elixir_effect',
            allowMultiConsume: true,
        },
        resourceModifier: {

        },
        usageGain: {

        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0 && gameEntity.getLevel('shop_item_advanced_alchemy') > 0
        },
        sellPrice: 35000000,
    })

    registerInventoryItem('inventory_diplomats_elixir', {
        name: 'Diplomat\'s Elixir',
        hasCap: false,
        tags: ['inventory', 'consumable', 'potion', 'rare'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {
            updateLevelBy('rare_diplomats_elixir_effect', amount)
        },
        getUsageCooldown: () => {
            return 0.1;
        },
        attributes: {
            isRare: true,
            entityEffect: 'rare_diplomats_elixir_effect',
            allowMultiConsume: true,
        },
        resourceModifier: {

        },
        usageGain: {

        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0 && gameEntity.getLevel('shop_item_advanced_alchemy') > 0
        },
        sellPrice: 35000000,
    })


    // Rare

    registerInventoryItem('inventory_rare_ironvine', {
        name: 'Ironvine',
        hasCap: false,
        tags: ['inventory', 'consumable', 'rare', 'gatherable', 'herb'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {
            updateLevelBy('rare_ironvine_effect', amount)
        },
        getUsageCooldown: () => {
            return 0.1;
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
            return gameEntity.getLevel('shop_item_backpack') > 0 && gameEntity.getLevel('shop_item_herbs_handbook_1') > 0
        },
        sellPrice: 10000,
        rarity: 4,
    })


    registerInventoryItem('inventory_rare_mindspire', {
        name: 'Mindspire',
        hasCap: false,
        tags: ['inventory', 'consumable', 'rare', 'gatherable', 'herb'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {
            updateLevelBy('rare_mindspire_effect', amount)
        },
        getUsageCooldown: () => {
            return 0.1;
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
            return gameEntity.getLevel('shop_item_backpack') > 0 && gameEntity.getLevel('shop_item_herbs_handbook_1') > 0
        },
        sellPrice: 10000,
        rarity: 4,
    })

    registerInventoryItem('inventory_rare_whisperleaf', {
        name: 'Whisperleaf',
        hasCap: false,
        tags: ['inventory', 'consumable', 'rare', 'gatherable', 'herb'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {
            updateLevelBy('rare_whisperleaf_effect', amount)
        },
        getUsageCooldown: () => {
            return 0.1;
        },
        attributes: {
            baseChanceMult: 1,
            entityEffect: 'rare_whisperleaf_effect',
            isRare: true,
            allowMultiConsume: true,
        },
        usageGain: {

        },
        resourceModifier: {

        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0 && gameEntity.getLevel('shop_item_herbs_handbook_1') > 0
        },
        sellPrice: 10000,
        rarity: 4,
    })

    registerInventoryItem('inventory_rare_sageroot', {
        name: 'Sageroot',
        hasCap: false,
        tags: ['inventory', 'consumable', 'rare', 'gatherable', 'herb'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {
            updateLevelBy('rare_sageroot_effect', amount)
        },
        getUsageCooldown: () => {
            return 0.1;
        },
        attributes: {
            baseChanceMult: 1,
            entityEffect: 'rare_sageroot_effect',
            isRare: true,
            allowMultiConsume: true,
        },
        usageGain: {

        },
        resourceModifier: {

        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0 && gameEntity.getLevel('shop_item_herbs_handbook_1') > 0
        },
        sellPrice: 10000,
        rarity: 4,
    })

    
    registerInventoryItem('inventory_rare_verdant_coil', {
        name: 'Verdant Coil',
        hasCap: false,
        tags: ['inventory', 'consumable', 'rare', 'gatherable', 'herb'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {
            updateLevelBy('rare_verdant_coil_effect', amount)
        },
        getUsageCooldown: () => {
            return 0.1;
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
            return gameEntity.getLevel('shop_item_backpack') > 0 && gameEntity.getLevel('shop_item_herbs_handbook_1') > 0
        },
        sellPrice: 15000,
        rarity: 5,
    })


    registerInventoryItem('inventory_rare_titanleaf', {
        name: 'Titanleaf',
        hasCap: false,
        tags: ['inventory', 'ingredient', 'rare', 'gatherable', 'herb'],
        defaultCap: 0,
        isAbstract: true,
        /*onUse: (amount) => {
            updateLevelBy('rare_titanleaf_effect', amount)
        },*/
        getUsageCooldown: () => {
            return 0.1;
        },
        attributes: {
            baseChanceMult: 1,
            isRare: true,
            allowMultiConsume: false,
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


    registerInventoryItem('inventory_rare_heartroot', {
        name: 'Heartroot',
        hasCap: false,
        tags: ['inventory', 'consumable', 'rare', 'herb'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {
            updateLevelBy('rare_heartroot_effect', amount)
        },
        getUsageCooldown: () => {
            return 0.1;
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
            return gameEntity.getLevel('shop_item_backpack') > 0 && gameEntity.getLevel('shop_item_herbs_handbook_2') > 0 && false
        },
        sellPrice: 15000,
        rarity: 5,
    })


    registerInventoryItem('inventory_rare_energloom', {
        name: 'Energloom',
        hasCap: false,
        tags: ['inventory', 'consumable', 'rare', 'herb'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {
            updateLevelBy('rare_energloom_effect', amount)
        },
        getUsageCooldown: () => {
            return 0.1;
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
            return gameEntity.getLevel('shop_item_backpack') > 0 && gameEntity.getLevel('shop_item_herbs_handbook_2') > 0 && false
        },
        sellPrice: 15000,
        rarity: 5,
    })


    registerInventoryItem('inventory_rare_lifebloom', {
        name: 'Lifebloom',
        hasCap: false,
        tags: ['inventory', 'consumable', 'rare', 'herb'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {
            updateLevelBy('rare_lifebloom_effect', amount)
        },
        getUsageCooldown: () => {
            return 0.1;
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
            return gameEntity.getLevel('shop_item_backpack') > 0 && gameEntity.getLevel('shop_item_herbs_handbook_2') > 0 && false
        },
        sellPrice: 15000,
        rarity: 5,
    })


    registerInventoryItem('inventory_rare_stillfern', {
        name: 'Stillfern',
        hasCap: false,
        tags: ['inventory', 'ingredient', 'rare', 'gatherable', 'herb'],
        defaultCap: 0,
        isAbstract: true,
        /*onUse: (amount) => {
            updateLevelBy('rare_stillfern_effect', amount)
        },*/
        getUsageCooldown: () => {
            return 0.1;
        },
        attributes: {
            baseChanceMult: 1,
            isRare: true,
            allowMultiConsume: false,
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

    registerInventoryItem('inventory_shadowfern', {
        name: 'Shadowfern',
        hasCap: false,
        tags: ['inventory', 'ingredient', 'rare', 'gatherable', 'herb'],
        defaultCap: 0,
        isAbstract: true,
        /*onUse: (amount) => {
            updateLevelBy('rare_stillfern_effect', amount)
        },*/
        getUsageCooldown: () => {
            return 0.1;
        },
        attributes: {
            baseChanceMult: 1,
            isRare: true,
            allowMultiConsume: false,
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

    registerInventoryItem('inventory_rare_mindroot', {
        name: 'Mindroot',
        hasCap: false,
        tags: ['inventory', 'ingredient', 'rare', 'gatherable', 'herb'],
        defaultCap: 0,
        isAbstract: true,
        /*onUse: (amount) => {
            updateLevelBy('rare_mindroot_effect', amount)
        },*/
        getUsageCooldown: () => {
            return 0.1;
        },
        attributes: {
            baseChanceMult: 1,
            isRare: true,
            allowMultiConsume: false,
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
        allowedTileTypes: ['forest', 'mountain', 'hills']
    })

    registerInventoryItem('inventory_rare_azureblossom', {
        name: 'Azureblossom',
        hasCap: false,
        tags: ['inventory', 'ingredient', 'rare', 'gatherable', 'herb'],
        defaultCap: 0,
        isAbstract: true,
        /*onUse: (amount) => {
            updateLevelBy('rare_azureblossom_effect', amount)
        },*/
        getUsageCooldown: () => {
            return 0.1;
        },
        attributes: {
            baseChanceMult: 1,
            isRare: true,
            allowMultiConsume: false,
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



    registerInventoryItem('inventory_rare_stormbird_heart', {
        name: 'Stormbird Heart',
        hasCap: false,
        tags: ['inventory', 'consumable', 'rare', 'hunting'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {
            updateLevelBy('rare_stormbird_heart_effect', amount)
        },
        getUsageCooldown: () => {
            return 0.1;
        },
        attributes: {
            baseChanceMult: 1,
            entityEffect: 'rare_stormbird_heart_effect',
            isRare: true,
            allowMultiConsume: true,
        },
        usageGain: {

        },
        resourceModifier: {

        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_crafting_courses') > 0 && gameResources.isResourceUnlocked('inventory_hunting_net') > 0
        },
        sellPrice: 150000000,
        rarity: 8,
        lootAmountMult: 0.1,
    })


    registerInventoryItem('inventory_rare_greyhorn_brain', {
        name: 'Greyhorn Brain',
        hasCap: false,
        tags: ['inventory', 'consumable', 'rare', 'hunting'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {
            updateLevelBy('rare_greyhorn_brain_effect', amount)
        },
        getUsageCooldown: () => {
            return 0.1;
        },
        attributes: {
            baseChanceMult: 1,
            entityEffect: 'rare_greyhorn_brain_effect',
            isRare: true,
            allowMultiConsume: true,
        },
        usageGain: {

        },
        resourceModifier: {

        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_crafting_courses') > 0 && gameResources.isResourceUnlocked('inventory_hunting_net') > 0
        },
        sellPrice: 150000000,
        rarity: 8,
        lootAmountMult: 0.1,
    })

    // Artifact Materials
    registerInventoryItem('inventory_charged_amethyst', {
        name: 'Charged Amethyst',
        hasCap: false,
        tags: ['inventory', 'material', 'rare', 'artifact-material'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {

        },
        attributes: {
            isRare: true,
        },
        unlockCondition: () => {
            return gameEntity.isEntityUnlocked('action_expedition')
        },
        sellPrice: 1500000,
    })

    registerInventoryItem('inventory_vibrating_pot', {
        name: 'Vibrating Pot',
        hasCap: false,
        tags: ['inventory', 'material', 'rare', 'artifact-material'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {

        },
        attributes: {
            isRare: true,
        },
        unlockCondition: () => {
            return gameEntity.isEntityUnlocked('action_expedition')
        },
        sellPrice: 1500000,
    })

    registerInventoryItem('inventory_dynosaur_bone', {
        name: 'Dynosaur Bone',
        hasCap: false,
        tags: ['inventory', 'material', 'rare', 'artifact-material'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {

        },
        attributes: {
            isRare: true,
        },
        unlockCondition: () => {
            return gameEntity.isEntityUnlocked('action_expedition')
        },
        sellPrice: 1500000,
    })

    registerInventoryItem('inventory_ochre', {
        name: 'Ochre',
        hasCap: false,
        tags: ['inventory', 'material', 'rare', 'artifact-material'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {

        },
        attributes: {
            isRare: true,
        },
        unlockCondition: () => {
            return gameEntity.isEntityUnlocked('action_expedition')
        },
        sellPrice: 1500000,
    })

    registerInventoryItem('inventory_magic_lens', {
        name: 'Magic Lens',
        hasCap: false,
        tags: ['inventory', 'material', 'rare', 'artifact-material'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {

        },
        attributes: {
            isRare: true,
        },
        unlockCondition: () => {
            return gameEntity.isEntityUnlocked('action_expedition')
        },
        sellPrice: 1500000,
    })

    registerInventoryItem('inventory_hunter_flask', {
        name: 'Hunter Flask',
        hasCap: false,
        tags: ['inventory', 'material', 'rare', 'artifact-material'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {

        },
        attributes: {
            isRare: true,
        },
        unlockCondition: () => {
            return gameEntity.isEntityUnlocked('action_expedition')
        },
        sellPrice: 1500000,
    })

    registerInventoryItem('inventory_pince_nez', {
        name: 'Pince-nez',
        hasCap: false,
        tags: ['inventory', 'material', 'rare', 'artifact-material', 'library-material'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {

        },
        attributes: {
            isRare: true,
        },
        unlockCondition: () => {
            return gameEntity.isEntityUnlocked('expedition_ancient_library')
        },
        sellPrice: 2000000,
    })

    registerInventoryItem('inventory_scribe_quill', {
        name: 'Scribe Quill',
        hasCap: false,
        tags: ['inventory', 'material', 'rare', 'artifact-material', 'library-material'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {

        },
        attributes: {
            isRare: true,
        },
        unlockCondition: () => {
            return gameEntity.isEntityUnlocked('expedition_ancient_library')
        },
        sellPrice: 1800000,
    })

    registerInventoryItem('inventory_magical_bookmark', {
        name: 'Magical Bookmark',
        hasCap: false,
        tags: ['inventory', 'material', 'rare', 'artifact-material', 'library-material'],
        defaultCap: 0,
        isAbstract: true,
        onUse: (amount) => {

        },
        attributes: {
            isRare: true,
        },
        unlockCondition: () => {
            return gameEntity.isEntityUnlocked('expedition_ancient_library')
        },
        sellPrice: 1600000,
    })

    registerInventoryItem('inventory_copper_ore', {
        name: 'Copper Ore',
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
            id: 'action_copper_mining',
            level: 1,
        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0 && gameEntity.isEntityUnlocked('action_copper_mining')
        },
        sellPrice: 215625,
    })

    registerInventoryItem('inventory_copper_wire', {
        name: 'Copper Wire',
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
            id: 'action_copper_mining',
            level: 1,
        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0 && gameEntity.isEntityUnlocked('action_copper_mining')
        },
        sellPrice: 3215625,
    })



}