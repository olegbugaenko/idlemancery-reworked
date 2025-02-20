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

export const registerAccessory = (id, options) => {

    options.searchableMeta = getResourceModifierDataSearchable(options.resourceModifier);

    gameEntity.registerGameEntity(id, options);
}

export const registerAccessoriesStage1 = () => {

    registerAccessory('accessory_wooden_casket', {
        tags: ["accessory", "upgrade", "purchaseable", "storage"],
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


    registerAccessory('accessory_wooden_talisman', {
        tags: ["accessory", "upgrade", "purchaseable", "resource"],
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


    registerAccessory('accessory_wooden_bookcase', {
        tags: ["accessory", "upgrade", "purchaseable", "storage"],
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


    registerAccessory('accessory_aromatic_carpet', {
        tags: ["accessory", "upgrade", "purchaseable", "resource"],
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


    registerAccessory('accessory_scroll_of_wisdom', {
        tags: ["accessory", "upgrade", "purchaseable", "resource"],
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


    registerAccessory('accessory_scroll_of_restoration', {
        tags: ["accessory", "upgrade", "purchaseable", "effect", "magic"],
        name: 'Charm of Recovery Magic',
        description: 'A delicately folded paper charm shaped like a bird, imbued with recovery magic (NOTE. Not every restoration spell is recovery one)',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_paper_working') > 0;
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'recovery_spells_efficiency': {
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


    registerAccessory('accessory_scroll_of_persuasion', {
        tags: ["accessory", "upgrade", "purchaseable", "effect", "actions-learning"],
        name: 'Scroll of Persuasion',
        description: 'This enchanted parchment enhances your ability to connect with others, significantly boosting the efficiency of social training.',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_paper_working') > 0;
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'social_training_learning_rate': {
                        A: 0.05,
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
            'inventory_knowledge_moss': {
                A: 1.1,
                B: 20,
                type: 1
            },
            'inventory_nightshade': {
                A: 1.1,
                B: 12,
                type: 1
            }
        }),
    })

    registerAccessory('accessory_diplomatic_weave', {
        tags: ["accessory", "upgrade", "purchaseable", "effect"],
        name: 'Diplomatic Weave',
        description: 'Crafted from the finest herbal fibers, this intricate weave symbolizes trust and cooperation, easing negotiations.',
        level: 0,
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_charisma',
            level: 2500,
        }],
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_paper_working') > 0;
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'land_purchase_discount': {
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
                B: 20,
                type: 1
            },
            'inventory_herbal_fibers': {
                A: 1.1,
                B: 10,
                type: 1
            },
            'inventory_core_duckweed': {
                A: 1.1,
                B: 200,
                type: 1
            }
        }),
    })


    registerAccessory('accessory_tome_of_mentalist', {
        tags: ["accessory", "upgrade", "purchaseable", "effect", "actions-learning"],
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
                        A: 0.04,
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


    registerAccessory('accessory_tome_of_occultism', {
        tags: ["accessory", "upgrade", "purchaseable", "effect", "actions-learning"],
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
                        A: 0.04,
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
            'inventory_nightshade': {
                A: 1.1,
                B: 20,
                type: 1
            }
        }),
    })


    registerAccessory('accessory_ruby_pendant', {
        tags: ["accessory", "upgrade", "purchaseable", "effect", "actions-learning"],
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


    registerAccessory('accessory_vitality_talisman', {
        tags: ["accessory", "upgrade", "purchaseable", "storage"],
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


    registerAccessory('accessory_sapphire_ring', {
        tags: ["accessory", "upgrade", "purchaseable", "effect", "magic"],
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


    registerAccessory('accessory_sapphire_pendant', {
        tags: ["accessory", "upgrade", "purchaseable", "storage", "magic"],
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


    registerAccessory('accessory_iron_stash', {
        tags: ["accessory", "upgrade", "purchaseable", "storage"],
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


    registerAccessory('accessory_lumber_mill', {
        tags: ["accessory", "upgrade", "purchaseable", "resource", "crafting"],
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


    registerAccessory('accessory_sages_notes', {
        tags: ["accessory", "upgrade", "purchaseable", "resource"],
        name: 'Sage\'s Notes',
        description: 'Increase your knowledge generation',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_crafting_courses') > 0 && gameEntity.isEntityUnlocked('craft_green_ink');
        },
        resourceModifier: {
            multiplier: {
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
            'inventory_paper': {
                A: 1.1,
                B: 15,
                type: 1
            },
            'inventory_green_ink': {
                A: 1.1,
                B: 5,
                type: 1
            },
            'knowledge': {
                A: 1.1,
                B: 25,
                type: 1
            }
        }),
    })

    registerAccessory('accessory_mages_notes', {
        tags: ["accessory", "upgrade", "purchaseable", "resource", "magic"],
        name: 'Mage\'s Notes',
        description: 'Increase your mana generation',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_crafting_courses') > 0 && gameEntity.isEntityUnlocked('craft_green_ink');
        },
        resourceModifier: {
            multiplier: {
                resources: {
                    'mana': {
                        A: 0.025,
                        B: 1,
                        type: 0,
                    }
                }
            },
        },
        get_cost: () => ({
            'inventory_paper': {
                A: 1.1,
                B: 15,
                type: 1
            },
            'inventory_green_ink': {
                A: 1.1,
                B: 5,
                type: 1
            },
            'mana': {
                A: 1.1,
                B: 25,
                type: 1
            }
        }),
    })

    registerAccessory('accessory_accelerated_study_scroll', {
        tags: ["accessory", "upgrade", "purchaseable", "effect", "courses"],
        name: 'Accelerated Study Scroll',
        description: 'A meticulously crafted scroll, inscribed with red ink, that reduces the time required for studying and mastering courses.',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_crafting_courses') > 0
                && gameEntity.isEntityUnlocked('craft_red_ink');
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'courses_learning_speed': {
                        A: 0.05,
                        B: 1,
                        type: 0,
                    }
                }
            },
        },
        get_cost: () => ({
            'inventory_paper': {
                A: 1.1,
                B: 15,
                type: 1
            },
            'inventory_red_ink': {
                A: 1.1,
                B: 5,
                type: 1
            },
            'inventory_green_ink': {
                A: 1.1,
                B: 10,
                type: 1
            },
        }),
    })


    registerAccessory('accessory_scribes_notes', {
        tags: ["accessory", "upgrade", "purchaseable", "effect", "courses"],
        name: 'Scribe\'s Notes',
        description: 'Detailed notes that enhance course efficiency, reducing XP requirements for mastering actions.',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_crafting_courses') > 0
                && gameEntity.isEntityUnlocked('craft_red_ink')
                && gameResources.isResourceUnlocked('mental_energy');
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'reductive_courses_power': {
                        A: 0.05,
                        B: 1,
                        type: 0,
                    }
                }
            },
        },
        get_cost: () => ({
            'inventory_paper': {
                A: 1.1,
                B: 15,
                type: 1
            },
            'inventory_red_ink': {
                A: 1.1,
                B: 5,
                type: 1
            },
            'knowledge': {
                A: 1.1,
                B: 25,
                type: 1
            }
        }),
    })

/*

    registerAccessory('accessory_scribes_notes', {
        tags: ["accessory", "upgrade", "purchaseable"],
        name: 'Scribe\'s Notes',
        description: 'Detailed notes that enhance course efficiency, reducing XP requirements for mastering actions.',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_crafting_courses') > 0
                && gameEntity.isEntityUnlocked('craft_red_ink')
                && gameResources.isResourceUnlocked('mental_energy');
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'reductive_courses_power': {
                        A: 0.05,
                        B: 1,
                        type: 0,
                    }
                }
            },
        },
        get_cost: () => ({
            'inventory_paper': {
                A: 1.1,
                B: 15,
                type: 1
            },
            'inventory_red_ink': {
                A: 1.1,
                B: 5,
                type: 1
            },
            'knowledge': {
                A: 1.1,
                B: 25,
                type: 1
            }
        }),
    })
*/


    registerAccessory('accessory_red_seal_notes', {
        tags: ["accessory", "upgrade", "purchaseable", "resource"],
        name: 'Red Seal Scroll',
        description: 'A magically sealed scroll that boosts mental energy income, encouraging heightened focus and clarity.',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_crafting_courses') > 0
                && gameEntity.isEntityUnlocked('craft_red_ink')
                && gameResources.isResourceUnlocked('mental_energy');
        },
        resourceModifier: {
            multiplier: {
                resources: {
                    'mental_energy': {
                        A: 0.05,
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
                B: 15,
                type: 1
            },
            'inventory_red_ink': {
                A: 1.1,
                B: 5,
                type: 1
            },
            'knowledge': {
                A: 1.1,
                B: 25,
                type: 1
            }
        }),
    })


    registerAccessory('accessory_obsidian_pendant', {
        tags: ["accessory", "upgrade", "purchaseable", "resource"],
        name: 'Obsidian Pendant',
        description: 'A sleek pendant forged from obsidian shards, it channels the stone\'s raw power to amplify your vitality, increasing your energy income.',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_crafting_courses') > 0
                && gameResources.isResourceUnlocked('inventory_obsidian_shard')
                && gameResources.isResourceUnlocked('inventory_green_ink');
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
            'inventory_obsidian_shard': {
                A: 1.1,
                B: 15,
                type: 1
            },
            'inventory_green_ink': {
                A: 1.1,
                B: 5,
                type: 1
            },
            'energy': {
                A: 1.1,
                B: 25,
                type: 1
            }
        }),
    })


    registerAccessory('accessory_obsidian_amulet', {
        tags: ["accessory", "upgrade", "purchaseable", "effect", "actions-learning"],
        name: 'Obsidian Amulet',
        description: 'An intricately crafted amulet of polished obsidian, its dark surface seems to absorb distraction, sharpening your focus and accelerating the mastery of routine tasks.',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_crafting_courses') > 0
                && gameResources.isResourceUnlocked('inventory_obsidian_shard');
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'routine_learning_speed': {
                        A: 0.1,
                        B: 1,
                        C: 1.01,
                        type: 3,
                    }
                }
            },
        },
        get_cost: () => ({
            'inventory_obsidian_shard': {
                A: 1.1,
                B: 15,
                type: 1
            },
            'inventory_sapphire': {
                A: 1.1,
                B: 50,
                type: 1
            },
            'energy': {
                A: 1.1,
                B: 25,
                type: 1
            }
        }),
    })


    registerAccessory('accessory_steel_amulet', {
        tags: ["accessory", "upgrade", "purchaseable", "resource"],
        name: 'Steel Amulet',
        description: 'A steel amulet increasing your health regeneration',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_crafting_courses') > 0
                && gameResources.isResourceUnlocked('inventory_forged_steel')
                && gameResources.isResourceUnlocked('inventory_red_ink');
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
            'inventory_forged_steel': {
                A: 1.1,
                B: 2,
                type: 1
            },
            'inventory_red_ink': {
                A: 1.1,
                B: 5,
                type: 1
            },
            'energy': {
                A: 1.1,
                B: 40,
                type: 1
            }
        }),
    })

    registerAccessory('accessory_steel_hammer', {
        tags: ["accessory", "upgrade", "purchaseable", "resource"],
        name: 'Steel Hammer',
        description: 'Increase stone refinement efficiency',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_crafting_courses') > 0
                && gameResources.isResourceUnlocked('inventory_forged_steel');
        },
        resourceModifier: {
            multiplier: {
                resources: {
                    'inventory_sapphire': {
                        A: 0.02,
                        B: 1,
                        C: 1.01,
                        type: 3,
                    },
                    'inventory_ruby': {
                        A: 0.02,
                        B: 1,
                        C: 1.01,
                        type: 3,
                    },
                    'inventory_obsidian_shard': {
                        A: 0.02,
                        B: 1,
                        C: 1.01,
                        type: 3,
                    }
                }
            },
        },
        get_cost: () => ({
            'inventory_forged_steel': {
                A: 1.1,
                B: 2,
                type: 1
            },
            'inventory_refined_wood': {
                A: 1.1,
                B: 50,
                type: 1
            }
        }),
    })

    registerAccessory('accessory_masters_pendant', {
        tags: ["accessory", "upgrade", "purchaseable", "resource"],
        name: 'Masters Forge Pendant',
        description: 'Increase amount of available crafting slots',
        level: 0,
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_strength',
            level: 12000,
        }],
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_crafting_courses') > 0
                && gameResources.isResourceUnlocked('inventory_forged_steel');
        },
        resourceModifier: {
            income: {
                resources: {
                    'crafting_slots': {
                        A: 1,
                        B: 0,
                        type: 0,
                    },
                }
            },
        },
        get_cost: () => ({
            'inventory_forged_steel': {
                A: 2,
                B: 50,
                type: 1
            },
            'inventory_obsidian_shard': {
                A: 2,
                B: 50,
                type: 1
            }
        }),
    })
}