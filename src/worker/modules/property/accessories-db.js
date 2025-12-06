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

export const getAccessoryDiscount = () => gameEffects.getEffectValue('accessories_discount');

export const registerAccessoriesStage1 = () => {

    registerAccessory('accessory_wooden_casket', {
        tags: ["accessory", "upgrade", "purchaseable", "storage", "wooden", "container"],
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
                        A: 0.075,
                        B: 1,
                        C: 1.004,
                        type: 3,
                    }
                }
            },
        },
        get_cost: () => ({
            'inventory_refined_wood': {
                A: 1.15,
                B: 1/getAccessoryDiscount(),
                type: 1
            }
        }),
    })

    registerAccessory('accessory_wooden_talisman', {
        tags: ["accessory", "upgrade", "purchaseable", "resource", "wooden", "trinket"],
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
                        A: 0.05,
                        B: 1,
                        C: 1.001,
                        type: 3,
                    }
                }
            },
        },
        get_cost: () => ({
            'inventory_refined_wood': {
                A: 1.15,
                B: 1/getAccessoryDiscount(),
                type: 1
            },
            'knowledge': {
                A: 1.1,
                B: 20/getAccessoryDiscount(),
                type: 1
            }
        }),
    })


    registerAccessory('accessory_wooden_bookcase', {
        tags: ["accessory", "upgrade", "purchaseable", "storage", "wooden", "container"],
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
                        A: 0.075,
                        B: 1,
                        C: 1.004,
                        type: 3,
                    }
                }
            },
        },
        get_cost: () => ({
            'inventory_refined_wood': {
                A: 1.15,
                B: 1/getAccessoryDiscount(),
                type: 1
            }
        }),
    })


    registerAccessory('accessory_aromatic_carpet', {
        tags: ["accessory", "upgrade", "purchaseable", "resource", "fabric", "trinket"],
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
                        A: 0.05,
                        B: 1,
                        C: 1.001,
                        type: 3,
                    }
                }
            },
        },
        get_cost: () => ({
            'inventory_herbal_fibers': {
                A: 1.15,
                B: 1/getAccessoryDiscount(),
                type: 1
            },
            'mana': {
                A: 1.1,
                B: 3/getAccessoryDiscount(),
                type: 1
            }
        }),
    })


    registerAccessory('accessory_scroll_of_wisdom', {
        tags: ["accessory", "upgrade", "purchaseable", "resource", "paper", "scroll"],
        name: 'Scroll of Wisdom',
        description: 'A scroll inscribed with glowing runes that impart knowledge to the reader. It continuously generates insight, aiding the bearer in gradually increasing their understanding and intelligence over time.',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_paper_working') > 0;
        },
        resourceModifier: {
            get_income: () => ({
                resources: {
                    'knowledge': {
                        A: 0.005*gameEffects.getEffectValue('artifact_scroll_efficiency'),
                        B: 0,
                        C: 1.01,
                        type: 3,
                    }
                }
            }),
            effectDeps: ['artifact_scroll_efficiency']
        },
        get_cost: () => ({
            'inventory_paper': {
                A: 1.1,
                B: 2/getAccessoryDiscount(),
                type: 1
            },
            'mana': {
                A: 1.1,
                B: 2/getAccessoryDiscount(),
                type: 1
            }
        }),
    })


    registerAccessory('accessory_scroll_of_restoration', {
        tags: ["accessory", "upgrade", "purchaseable", "effect", "magic", "paper", "scroll"],
        name: 'Charm of Recovery Magic',
        description: 'A delicately folded paper charm shaped like a bird, imbued with recovery magic (NOTE. Not every restoration spell is recovery one)',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_paper_working') > 0;
        },
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    'recovery_spells_efficiency': {
                        A: 0.025*gameEffects.getEffectValue('artifact_scroll_efficiency'),
                        B: 1*gameEffects.getEffectValue('artifact_scroll_efficiency'),
                        C: 1.01,
                        type: 3,
                    }
                }
            }),
            effectDeps: ['artifact_scroll_efficiency']
        },
        get_cost: () => ({
            'inventory_paper': {
                A: 1.1,
                B: 2/getAccessoryDiscount(),
                type: 1
            },
            'knowledge': {
                A: 1.1,
                B: 2/getAccessoryDiscount(),
                type: 1
            },
            'inventory_aloe_vera': {
                A: 1.1,
                B: 20/getAccessoryDiscount(),
                type: 1
            }
        }),
    })


    registerAccessory('accessory_scroll_of_persuasion', {
        tags: ["accessory", "upgrade", "purchaseable", "effect", "actions-learning", "paper", "scroll"],
        name: 'Scroll of Persuasion',
        description: 'This enchanted parchment enhances your ability to connect with others, significantly boosting the efficiency of social training.',
        level: 0,
        minDemoVersion: 20,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_paper_working') > 0;
        },
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    'social_training_learning_rate': {
                        A: 0.05*gameEffects.getEffectValue('artifact_scroll_efficiency'),
                        B: 1*gameEffects.getEffectValue('artifact_scroll_efficiency'),
                        C: 1.01,
                        type: 3,
                    }
                }
            }),
            effectDeps: ['artifact_scroll_efficiency']
        },
        get_cost: () => ({
            'inventory_paper': {
                A: 1.1,
                B: 2/getAccessoryDiscount(),
                type: 1
            },
            'inventory_knowledge_moss': {
                A: 1.1,
                B: 20/getAccessoryDiscount(),
                type: 1
            },
            'inventory_nightshade': {
                A: 1.1,
                B: 12/getAccessoryDiscount(),
                type: 1
            }
        }),
    })

    registerAccessory('accessory_diplomatic_weave', {
        tags: ["accessory", "upgrade", "purchaseable", "effect", "fabric", "trinket"],
        name: 'Diplomatic Weave',
        description: 'Crafted from the finest herbal fibers, this intricate weave symbolizes trust and cooperation, easing negotiations.',
        level: 0,
        minDemoVersion: 20,
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
                B: 20/getAccessoryDiscount(),
                type: 1
            },
            'inventory_herbal_fibers': {
                A: 1.1,
                B: 10/getAccessoryDiscount(),
                type: 1
            },
            'inventory_core_duckweed': {
                A: 1.1,
                B: 200/getAccessoryDiscount(),
                type: 1
            }
        }),
    })


    registerAccessory('accessory_tome_of_mentalist', {
        tags: ["accessory", "upgrade", "purchaseable", "effect", "actions-learning", "paper", "tome"],
        name: 'Mentalist\'s Tome',
        description: 'Magic book containing a lot of mental power',
        level: 0,
        minDemoVersion: 20,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_paper_enhance') > 0;
        },
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    'mental_training_learning_rate': {
                        A: 0.04*gameEffects.getEffectValue('tome_accessories_efficiency'),
                        B: gameEffects.getEffectValue('tome_accessories_efficiency'),
                        C: 1.01,
                        type: 3,
                    }
                }
            }),
            effectDeps: ['tome_accessories_efficiency']
        },
        get_cost: () => ({
            'inventory_enchanted_paper': {
                A: 1.1,
                B: 2/getAccessoryDiscount(),
                type: 1
            },
            'knowledge': {
                A: 1.1,
                B: 2/getAccessoryDiscount(),
                type: 1
            },
            'inventory_herbal_fibers': {
                A: 1.1,
                B: 20/getAccessoryDiscount(),
                type: 1
            }
        }),
    })


    registerAccessory('accessory_tome_of_occultism', {
        tags: ["accessory", "upgrade", "purchaseable", "effect", "actions-learning", "paper", "tome"],
        name: 'Occultist\'s Tome',
        description: 'Small glowing tome. You feel inspiration every time you touch it',
        level: 0,
        minDemoVersion: 20,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_paper_enhance') > 0;
        },
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    'spiritual_learning_rate': {
                        A: 0.04*gameEffects.getEffectValue('tome_accessories_efficiency'),
                        B: gameEffects.getEffectValue('tome_accessories_efficiency'),
                        C: 1.01,
                        type: 3,
                    }
                }
            }),
            effectDeps: ['tome_accessories_efficiency']
        },
        get_cost: () => ({
            'inventory_enchanted_paper': {
                A: 1.1,
                B: 2/getAccessoryDiscount(),
                type: 1
            },
            'knowledge': {
                A: 1.1,
                B: 2/getAccessoryDiscount(),
                type: 1
            },
            'inventory_nightshade': {
                A: 1.1,
                B: 20/getAccessoryDiscount(),
                type: 1
            }
        }),
    })

    // Scientific Papers series (unlocked by PhD expertise upgrades)
    registerAccessory('accessory_scientific_papers_social', {
        tags: ["accessory", "upgrade", "purchaseable", "effect", "paper", "scroll", "scientific"],
        name: 'Scientific Papers: Social Sciences',
        description: 'A curated collection of peer-reviewed works in social sciences. Reduces XP requirements for social actions.',
        level: 0,
        minDemoVersion: 20,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_expertise_social_sciences') > 0;
        },
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    'social_actions_discount': {
                        A: 0.1,
                        B: 1,
                        C: 1.01,
                        type: 3,
                    }
                }
            }),
        },
        get_cost: () => ({
            'inventory_enchanted_paper': {
                A: 1.1,
                B: 2000000/getAccessoryDiscount(),
                type: 1
            },
            mental_energy: {
                A: 1.1,
                B: 20000/getAccessoryDiscount(),
                type: 1
            }
        }),
    })

    registerAccessory('accessory_scientific_papers_anatomy', {
        tags: ["accessory", "upgrade", "purchaseable", "effect", "paper", "scroll", "scientific"],
        name: 'Scientific Papers: Anatomy',
        description: 'Comprehensive anatomical studies compiled into an accessible format. Reduces XP requirements for physical actions.',
        level: 0,
        minDemoVersion: 20,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_expertise_anatomy') > 0;
        },
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    'physical_actions_discount': {
                        A: 0.1,
                        B: 1,
                        C: 1.01,
                        type: 3,
                    }
                }
            }),
        },
        get_cost: () => ({
            'inventory_enchanted_paper': {
                A: 1.1,
                B: 2000000/getAccessoryDiscount(),
                type: 1
            },
            mental_energy: {
                A: 1.1,
                B: 20000/getAccessoryDiscount(),
                type: 1
            }
        }),
    })

    registerAccessory('accessory_scientific_papers_philosophy', {
        tags: ["accessory", "upgrade", "purchaseable", "effect", "paper", "scroll", "scientific"],
        name: 'Scientific Papers: Philosophy',
        description: 'A synthesis of philosophical treatises that sharpen reasoning. Reduces XP requirements for mental actions.',
        level: 0,
        minDemoVersion: 20,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_expertise_philosophy') > 0;
        },
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    'mental_actions_discount': {
                        A: 0.1,
                        B: 1,
                        C: 1.01,
                        type: 3,
                    }
                }
            }),
        },
        get_cost: () => ({
            'inventory_enchanted_paper': {
                A: 1.1,
                B: 2000000/getAccessoryDiscount(),
                type: 1
            },
            mental_energy: {
                A: 1.1,
                B: 20000/getAccessoryDiscount(),
                type: 1
            }
        }),
    })


    registerAccessory('accessory_ruby_pendant', {
        tags: ["accessory", "upgrade", "purchaseable", "effect", "actions-learning", "mineral", "jewelry"],
        name: 'Ruby Pendant',
        description: 'Create ruby pendant that empowers your physical learning rate',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_crafting_courses') > 0 && gameEntity.getLevel('shop_item_stone_refinement_manual') >= 1;
        },
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    'physical_training_learn_speed': {
                        A: 0.04*gameEffects.getEffectValue('accessory_jewelry_efficiency'),
                        B: gameEffects.getEffectValue('accessory_jewelry_efficiency'),
                        C: 1.01,
                        type: 3,
                    }
                }
            }),
            effectDeps: ['accessory_jewelry_efficiency']
        },
        get_cost: () => ({
            'inventory_ruby': {
                A: 1.1,
                B: 1/getAccessoryDiscount(),
                type: 1
            }
        }),
    })


    registerAccessory('accessory_vitality_talisman', {
        tags: ["accessory", "upgrade", "purchaseable", "storage", "jewelry", "mineral", "trinket"],
        name: 'Vitality Talisman',
        description: 'Increase your HP and energy caps',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_crafting_courses') > 0 && gameEntity.getLevel('shop_item_stone_refinement_manual') >= 1;
        },
        resourceModifier: {
            get_capMult: () => ({
                resources: {
                    'energy': {
                        A: 0.05*gameEffects.getEffectValue('accessory_jewelry_efficiency'),
                        B: 1*gameEffects.getEffectValue('accessory_jewelry_efficiency'),
                        C: 1.01,
                        type: 3,
                    },
                    'health': {
                        A: 0.05*gameEffects.getEffectValue('accessory_jewelry_efficiency'),
                        B: 1*gameEffects.getEffectValue('accessory_jewelry_efficiency'),
                        C: 1.01,
                        type: 3,
                    }
                }
            }),
            effectDeps: ['accessory_jewelry_efficiency']
        },
        get_cost: () => ({
            'inventory_ruby': {
                A: 1.1,
                B: 1/getAccessoryDiscount(),
                type: 1
            }
        }),
    })


    registerAccessory('accessory_sapphire_ring', {
        tags: ["accessory", "upgrade", "purchaseable", "effect", "magic", "mineral", "jewelry"],
        name: 'Sapphire Ring',
        description: 'Increase your spell XP gain',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_crafting_courses') > 0 && gameEntity.getLevel('shop_item_stone_refinement_manual') >= 1;
        },
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    'spell_xp_rate': {
                        A: 0.1*gameEffects.getEffectValue('accessory_jewelry_efficiency'),
                        B: gameEffects.getEffectValue('accessory_jewelry_efficiency'),
                        C: 1.01,
                        type: 3,
                    }
                }
            }),
            effectDeps: ['accessory_jewelry_efficiency']
        },
        get_cost: () => ({
            'inventory_sapphire': {
                A: 1.1,
                B: 1/getAccessoryDiscount(),
                type: 1
            }
        }),
    })


    registerAccessory('accessory_sapphire_pendant', {
        tags: ["accessory", "upgrade", "purchaseable", "storage", "magic", "mineral", "jewelry"],
        name: 'Sapphire Pendant',
        description: 'Increase your mana cap',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_crafting_courses') > 0 && gameEntity.getLevel('shop_item_stone_refinement_manual') >= 1;
        },
        resourceModifier: {
            get_capMult: () => ({
                resources: {
                    'mana': {
                        A: 0.05*gameEffects.getEffectValue('accessory_jewelry_efficiency'),
                        B: gameEffects.getEffectValue('accessory_jewelry_efficiency'),
                        C: 1.01,
                        type: 3,
                    }
                }
            }),
            effectDeps: ['accessory_jewelry_efficiency']
        },
        get_cost: () => ({
            'inventory_sapphire': {
                A: 1.1,
                B: 1/getAccessoryDiscount(),
                type: 1
            }
        }),
    })


    registerAccessory('accessory_iron_stash', {
        tags: ["accessory", "upgrade", "purchaseable", "storage", "metal", "container"],
        name: 'Iron Stash',
        description: 'Craft better and more reliable iron containers for storing coins',
        level: 0,
        minDemoVersion: 20,
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
                B: 1/getAccessoryDiscount(),
                type: 1
            }
        }),
    })


    registerAccessory('accessory_sages_notes', {
        tags: ["accessory", "upgrade", "purchaseable", "resource", "paper", "scroll", "notes"],
        name: 'Sage\'s Notes',
        description: 'Increase your knowledge generation',
        level: 0,
        minDemoVersion: 20,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_crafting_courses') > 0 && gameEntity.isEntityUnlocked('craft_green_ink');
        },
        resourceModifier: {
            get_multiplier: () => ({
                resources: {
                    'knowledge': {
                        A: 0.1*gameEffects.getEffectValue('artifact_scroll_efficiency'),
                        B: 1*gameEffects.getEffectValue('artifact_scroll_efficiency'),
                        C: 1.01,
                        type: 3,
                    }
                }
            }),
            effectDeps: ['artifact_scroll_efficiency']
        },
        get_cost: () => ({
            'inventory_paper': {
                A: 1.1,
                B: 15/getAccessoryDiscount(),
                type: 1
            },
            'inventory_green_ink': {
                A: 1.1,
                B: 5/getAccessoryDiscount(),
                type: 1
            },
            'knowledge': {
                A: 1.1,
                B: 25/getAccessoryDiscount(),
                type: 1
            }
        }),
    })

    registerAccessory('accessory_mages_notes', {
        tags: ["accessory", "upgrade", "purchaseable", "resource", "magic", "paper", "scroll", "notes"],
        name: 'Mage\'s Notes',
        description: 'Increase your mana generation',
        level: 0,
        minDemoVersion: 20,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_crafting_courses') > 0 && gameEntity.isEntityUnlocked('craft_green_ink');
        },
        resourceModifier: {
            get_multiplier: () => ({
                resources: {
                    'mana': {
                        A: 0.025*gameEffects.getEffectValue('artifact_scroll_efficiency'),
                        B: 1*gameEffects.getEffectValue('artifact_scroll_efficiency'),
                        type: 0,
                    }
                }
            }),
            effectDeps: ['artifact_scroll_efficiency']
        },
        get_cost: () => ({
            'inventory_paper': {
                A: 1.1,
                B: 15/getAccessoryDiscount(),
                type: 1
            },
            'inventory_green_ink': {
                A: 1.1,
                B: 5/getAccessoryDiscount(),
                type: 1
            },
            'mana': {
                A: 1.1,
                B: 25/getAccessoryDiscount(),
                type: 1
            }
        }),
    })

    registerAccessory('accessory_accelerated_study_scroll', {
        tags: ["accessory", "upgrade", "purchaseable", "effect", "courses", "paper", "scroll"],
        name: 'Accelerated Study Scroll',
        description: 'A meticulously crafted scroll, inscribed with red ink, that reduces the time required for studying and mastering courses.',
        level: 0,
        minDemoVersion: 20,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_crafting_courses') > 0
                && gameEntity.isEntityUnlocked('craft_red_ink');
        },
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    'courses_learning_speed': {
                        A: 0.05*gameEffects.getEffectValue('artifact_scroll_efficiency'),
                        B: 1*gameEffects.getEffectValue('artifact_scroll_efficiency'),
                        type: 0,
                    }
                }
            }),
            effectDeps: ['artifact_scroll_efficiency']
        },
        get_cost: () => ({
            'inventory_paper': {
                A: 1.1,
                B: 150/getAccessoryDiscount(),
                type: 1
            },
            'inventory_red_ink': {
                A: 1.1,
                B: 50/getAccessoryDiscount(),
                type: 1
            },
            'inventory_green_ink': {
                A: 1.1,
                B: 100/getAccessoryDiscount(),
                type: 1
            },
        }),
    })


    registerAccessory('accessory_scribes_notes', {
        tags: ["accessory", "upgrade", "purchaseable", "effect", "courses", "paper", "scroll", "notes"],
        name: 'Scribe\'s Notes',
        description: 'Detailed notes that enhance course efficiency, reducing XP requirements for mastering actions.',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_crafting_courses') > 0
                && gameEntity.isEntityUnlocked('craft_red_ink')
                && gameResources.isResourceUnlocked('mental_energy');
        },
        minDemoVersion: 20,
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    'reductive_courses_power': {
                        A: 0.05*gameEffects.getEffectValue('artifact_scroll_efficiency'),
                        B: 1*gameEffects.getEffectValue('artifact_scroll_efficiency'),
                        type: 0,
                    }
                }
            }),
            effectDeps: ['artifact_scroll_efficiency']
        },
        get_cost: () => ({
            'inventory_paper': {
                A: 1.1,
                B: 150/getAccessoryDiscount(),
                type: 1
            },
            'inventory_red_ink': {
                A: 1.1,
                B: 50/getAccessoryDiscount(),
                type: 1
            },
            'knowledge': {
                A: 1.1,
                B: 250/getAccessoryDiscount(),
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
                B: 15/getAccessoryDiscount(),
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
        tags: ["accessory", "upgrade", "purchaseable", "resource", "paper", "scroll"],
        name: 'Red Seal Scroll',
        description: 'A magically sealed scroll that boosts mental energy income, encouraging heightened focus and clarity.',
        level: 0,
        minDemoVersion: 20,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_crafting_courses') > 0
                && gameEntity.isEntityUnlocked('craft_red_ink')
                && gameResources.isResourceUnlocked('mental_energy');
        },
        resourceModifier: {
            get_multiplier: () => ({
                resources: {
                    'mental_energy': {
                        A: 0.05*gameEffects.getEffectValue('artifact_scroll_efficiency'),
                        B: 1*gameEffects.getEffectValue('artifact_scroll_efficiency'),
                        C: 1.01,
                        type: 3,
                    }
                }
            }),
            effectDeps: ['artifact_scroll_efficiency']
        },
        get_cost: () => ({
            'inventory_paper': {
                A: 1.1,
                B: 150/getAccessoryDiscount(),
                type: 1
            },
            'inventory_red_ink': {
                A: 1.1,
                B: 50/getAccessoryDiscount(),
                type: 1
            },
            'knowledge': {
                A: 1.1,
                B: 250/getAccessoryDiscount(),
                type: 1
            }
        }),
    })


    registerAccessory('accessory_obsidian_pendant', {
        tags: ["accessory", "upgrade", "purchaseable", "resource", "mineral", "jewelry"],
        name: 'Obsidian Pendant',
        description: 'A sleek pendant forged from obsidian shards, it channels the stone\'s raw power to amplify your vitality, increasing your energy income.',
        level: 0,
        minDemoVersion: 20,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_crafting_courses') > 0
                && gameResources.isResourceUnlocked('inventory_obsidian_shard')
                && gameResources.isResourceUnlocked('inventory_green_ink');
        },
        resourceModifier: {
            get_multiplier: () => ({
                resources: {
                    'energy': {
                        A: 0.02*gameEffects.getEffectValue('accessory_jewelry_efficiency'),
                        B: gameEffects.getEffectValue('accessory_jewelry_efficiency'),
                        C: 1.01,
                        type: 3,
                    }
                }
            }),
            effectDeps: ['accessory_jewelry_efficiency']
        },
        get_cost: () => ({
            'inventory_obsidian_shard': {
                A: 1.1,
                B: 15/getAccessoryDiscount(),
                type: 1
            },
            'inventory_green_ink': {
                A: 1.1,
                B: 5/getAccessoryDiscount(),
                type: 1
            },
            'energy': {
                A: 1.1,
                B: 25/getAccessoryDiscount(),
                type: 1
            }
        }),
    })


    registerAccessory('accessory_obsidian_amulet', {
        tags: ["accessory", "upgrade", "purchaseable", "effect", "actions-learning", "jewelry", "mineral", "trinket"],
        name: 'Obsidian Amulet',
        description: 'An intricately crafted amulet of polished obsidian, its dark surface seems to absorb distraction, sharpening your focus and accelerating the mastery of routine tasks.',
        level: 0,
        minDemoVersion: 20,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_crafting_courses') > 0
                && gameResources.isResourceUnlocked('inventory_obsidian_shard');
        },
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    'routine_learning_speed': {
                        A: 0.05*gameEffects.getEffectValue('accessory_jewelry_efficiency'),
                        B: gameEffects.getEffectValue('accessory_jewelry_efficiency'),
                        C: 1.01,
                        type: 3,
                    }
                }
            }),
            effectDeps: ['accessory_jewelry_efficiency']
        },
        get_cost: () => ({
            'inventory_obsidian_shard': {
                A: 1.1,
                B: 15/getAccessoryDiscount(),
                type: 1
            },
            'inventory_sapphire': {
                A: 1.1,
                B: 50/getAccessoryDiscount(),
                type: 1
            },
            'energy': {
                A: 1.1,
                B: 25/getAccessoryDiscount(),
                type: 1
            }
        }),
    })


    registerAccessory('accessory_steel_amulet', {
        tags: ["accessory", "upgrade", "purchaseable", "resource", "metal", "jewelry", "trinket"],
        name: 'Steel Amulet',
        description: 'A steel amulet increasing your health regeneration',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_crafting_courses') > 0
                && gameResources.isResourceUnlocked('inventory_forged_steel')
                && gameResources.isResourceUnlocked('inventory_red_ink');
        },
        minDemoVersion: 20,
        resourceModifier: {
            get_multiplier: () => ({
                resources: {
                    'health': {
                        A: 0.02*gameEffects.getEffectValue('accessory_jewelry_efficiency'),
                        B: gameEffects.getEffectValue('accessory_jewelry_efficiency'),
                        C: 1.01,
                        type: 3,
                    }
                }
            }),
            effectDeps: ['accessory_jewelry_efficiency']
        },
        get_cost: () => ({
            'inventory_forged_steel': {
                A: 1.1,
                B: 2/getAccessoryDiscount(),
                type: 1
            },
            'inventory_red_ink': {
                A: 1.1,
                B: 5/getAccessoryDiscount(),
                type: 1
            },
            'energy': {
                A: 1.1,
                B: 40/getAccessoryDiscount(),
                type: 1
            }
        }),
    })

    registerAccessory('accessory_steel_hammer', {
        tags: ["accessory", "upgrade", "purchaseable", "resource", "metal", "device"],
        name: 'Steel Hammer',
        description: 'Increase stone refinement efficiency',
        level: 0,
        minDemoVersion: 20,
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
                B: 2/getAccessoryDiscount(),
                type: 1
            },
            'inventory_refined_wood': {
                A: 1.1,
                B: 50/getAccessoryDiscount(),
                type: 1
            }
        }),
    })

    
    registerAccessory('accessory_pulsating_bracelet', {
        tags: ["accessory", "upgrade", "purchaseable", "effect", "bracelet", "metal"],
        name: 'Pulsating Bracelet',
        description: 'A copper-bound bracelet that resonates with your heartbeat, accelerating physical training.',
        level: 0,
        minDemoVersion: 20,
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_strength',
            level: 100000,
        }],
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_crafting_courses') > 0;
        },
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    'physical_training_learn_speed': {
                        A: 0.06,
                        B: 1,
                        C: 1.01,
                        type: 3,
                    }
                }
            }),
        },
        get_cost: () => ({
            'inventory_copper_wire': {
                A: 1.1,
                B: 400/getAccessoryDiscount(),
                type: 1
            },
            'health': {
                A: 1.1,
                B: 40000000/getAccessoryDiscount(),
                type: 1
            }
        }),
    })

/*
    registerAccessory('accessory_expedition_planner', {
        tags: ["accessory", "upgrade", "purchaseable", "effect", "maps", "paper", "device"],
        name: 'Expedition Planner',
        description: 'A meticulously crafted toolset used by seasoned explorers to optimize their expeditions, reducing the cost of generating new map layers.',
        level: 0,
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_patience',
            level: 60000
        }],
        minDemoVersion: 20,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_paper_working') > 0;
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'map_generation_discount': {
                        A: 0.05,
                        B: 1,
                        C: 1.005,
                        type: 3,
                    }
                }
            },
        },
        get_cost: () => ({
            'inventory_paper': {
                A: 1.1,
                B: 2000/getAccessoryDiscount(),
                type: 1
            },
            'inventory_forged_steel': {
                A: 1.1,
                B: 120,
                type: 1
            },
        }),
    })
*/
    registerAccessory('accessory_craft_binder', {
        tags: ["accessory", "upgrade", "purchaseable", "crafting", "metal", "device"],
        name: 'Craftbinder',
        description: 'A structured metal core wrapped in organic and forged layers. It channels your inner discipline into parallel creation.',
        level: 0,
        minDemoVersion: 20,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_amber_gathering') > 0;
        },
        resourceModifier: {
            income: {
                resources: {
                    'crafting_slots': {
                        A: 1,
                        B: 0,
                        type: 0,
                    },
                    'alchemy_slots': {
                        A: 1,
                        B: 0,
                        type: 0,
                    }
                }
            },
        },
        get_cost: () => ({
            'inventory_amber': {
                A: 1.5,
                B: 100/getAccessoryDiscount(),
                type: 1
            },
            'inventory_forged_steel': {
                A: 1.5,
                B: 500/getAccessoryDiscount(),
                type: 1
            },
        }),
    })

    registerAccessory('accessory_focus_crystal', {
        tags: ["accessory", "upgrade", "purchaseable", "effect", "maps", "mineral", "device"],
        name: 'Crystal of Focus',
        description: 'A glowing crystal formed from ancient amber and volcanic obsidian. It enhances your mental clarity, letting you learn faster and more deeply.',
        level: 0,
        minDemoVersion: 20,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_amber_gathering') > 0;
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'learning_rate': {
                        A: 0.02,
                        B: 1,
                        type: 0,
                    }
                }
            },
        },
        get_cost: () => ({
            'inventory_amber': {
                A: 1.1,
                B: 100/getAccessoryDiscount(),
                type: 1
            },
            'inventory_obsidian_shard': {
                A: 1.1,
                B: 500/getAccessoryDiscount(),
                type: 1
            },
        }),
    })


    registerAccessory('accessory_magical_atlas', {
        tags: ["accessory", "upgrade", "purchaseable", "resource", "maps", "paper", "device"],
        name: 'Magical Atlas',
        description: 'A magical atlas that glows red to warn of dangers ahead. Your patience allows you to carefully study its maps and plan safe routes, making your resource gathering more efficient.',
        level: 0,
        minDemoVersion: 20,
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_patience',
            level: 12500
        }],
        unlockCondition: () => {
            return gameResources.isResourceUnlocked('inventory_enchanted_paper') 
                && gameResources.isResourceUnlocked('inventory_green_ink');
        },
        resourceModifier: {
            multiplier: {
                resources: {
                    'gathering_effort': {
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
                A: 1.5,
                B: 50/getAccessoryDiscount(),
                type: 1
            },
            'inventory_green_ink': {
                A: 1.5,
                B: 25/getAccessoryDiscount(),
                type: 1
            },
        }),
    })

    // Earth Resonator — enhances earth amplifiers
    registerAccessory('accessory_earth_resonator', {
        tags: ["accessory", "upgrade", "purchaseable", "earth", "elemental", "resonator"],
        name: 'Earth Resonator',
        description: 'A powerful resonator that enhances the effectiveness of earth-based magical amplifiers.',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_elemental_resonance') > 0;
        },
        resourceModifier: {
            get_multiplier: ()=>({
                effects: {
                    'earth_amplifier_efficiency': {
                        A: 0.1,
                        B: 1,
                        type: 0,
                    }
                }
            }),
        },
        get_cost: () => ({
            'inventory_earth': {
                A: 1.2,
                B: 1000/getAccessoryDiscount(),
                type: 1
            }
        }),
    })

    // Air Resonator — enhances air amplifiers
    registerAccessory('accessory_air_resonator', {
        tags: ["accessory", "upgrade", "purchaseable", "air", "elemental", "resonator"],
        name: 'Air Resonator',
        description: 'A powerful resonator that enhances the effectiveness of air-based magical amplifiers.',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_elemental_resonance') > 0;
        },
        resourceModifier: {
            get_multiplier: ()=>({
                effects: {
                    'air_amplifier_efficiency': {
                        A: 0.1,
                        B: 1,
                        type: 0,
                    }
                }
            }),
        },
        get_cost: () => ({
            'inventory_air': {
                A: 1.2,
                B: 1000/getAccessoryDiscount(),
                type: 1
            }
        }),
    })

    registerAccessory('accessory_titans_hammer', {
        tags: ["accessory", "upgrade", "purchaseable", "resource", "device"],
        name: 'Titans Hammer',
        description: 'A copper-bound forge hammer that turns raw might into precise output.',
        level: 0,
        minDemoVersion: 20,
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_strength',
            level: 200000
        }],
        unlockCondition: () => {
            return gameResources.isResourceUnlocked('inventory_iron_plate');
        },
        resourceModifier: {
            multiplier: {
                resources: {
                    'inventory_iron_plate': {
                        A: 0.05,
                        B: 1,
                        C: 1.004,
                        type: 3,
                    },
                    'inventory_forged_steel': {
                        A: 0.05,
                        B: 1,
                        C: 1.004,
                        type: 3,
                    },
                    'inventory_copper_wire': {
                        A: 0.05,
                        B: 1,
                        C: 1.004,
                        type: 3,
                    }
                }
            },
        },
        get_cost: () => ({
            'inventory_copper_ore': {
                A: 1.1,
                B: 2.e+7/getAccessoryDiscount(),
                type: 1
            },
            'inventory_forged_steel': {
                A: 1.1,
                B: 1.e+8/getAccessoryDiscount(),
                type: 1
            },
            'inventory_refined_wood': {
                A: 1.1,
                B: 2.5e+8/getAccessoryDiscount(),
                type: 1
            },
        }),
    })
    
    registerAccessory('accessory_titans_drill', {
        tags: ["accessory", "upgrade", "purchaseable", "resource", "device"],
        name: 'Titans Drill',
        description: 'A titan-grade auger that bites deeper into every vein.',
        level: 0,
        minDemoVersion: 20,
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_strength',
            level: 200000
        }],
        unlockCondition: () => {
            return gameResources.isResourceUnlocked('inventory_iron_plate');
        },
        resourceModifier: {
            multiplier: {
                resources: {
                    'inventory_iron_ore': {
                        A: 0.05,
                        B: 1,
                        C: 1.004,
                        type: 3,
                    },
                    'inventory_copper_ore': {
                        A: 0.05,
                        B: 1,
                        C: 1.004,
                        type: 3,
                    }
                }
            },
        },
        get_cost: () => ({
            'inventory_forged_steel': {
                A: 1.1,
                B: 1.e+8/getAccessoryDiscount(),
                type: 1
            },
            'inventory_refined_wood': {
                A: 1.1,
                B: 2.5e+8/getAccessoryDiscount(),
                type: 1
            },
        }),
    })

    registerAccessory('accessory_obsidian_copper_bracelet', {
        tags: ["accessory", "upgrade", "purchaseable", "storage", "jewelry", "mineral", "metal"],
        name: 'Obsidian-Copper Bracelet',
        description: 'A sturdy bracelet forged from obsidian shards and copper wire. The combination of these materials creates a powerful resonance that expands your energy reserves, significantly increasing maximum energy capacity.',
        level: 0,
        minDemoVersion: 20,
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_strength',
            level: 175000,
        }],
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_crafting_courses') > 0
                && gameResources.isResourceUnlocked('inventory_obsidian_shard')
                && gameResources.isResourceUnlocked('inventory_copper_wire');
        },
        resourceModifier: {
            get_capMult: () => ({
                resources: {
                    'energy': {
                        A: 0.10,
                        B: 1,
                        C: 1.02,
                        type: 3,
                    }
                }
            })
        },
        get_cost: () => ({
            'inventory_obsidian_shard': {
                A: 1.1,
                B: 50000000/getAccessoryDiscount(),
                type: 1
            },
            'inventory_copper_wire': {
                A: 1.1,
                B: 100000/getAccessoryDiscount(),
                type: 1
            },
        }),
    })

    registerAccessory('accessory_mages_robes', {
        tags: ["accessory", "upgrade", "purchaseable", "storage", "magical", "fabric", "clothing"],
        name: "Mage's Robes",
        description: 'Elegant robes woven from magical fabric and infused with focusberry essence. These enchanted garments significantly expand your mana reserves, allowing for more powerful spellcasting.',
        level: 0,
        minDemoVersion: 20,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_magic_weaving') > 0
                && gameResources.isResourceUnlocked('inventory_magical_fabric')
                && gameResources.isResourceUnlocked('inventory_focusberry');
        },
        resourceModifier: {
            get_capMult: () => ({
                resources: {
                    'mana': {
                        A: 0.12,
                        B: 1,
                        C: 1.02,
                        type: 3,
                    }
                }
            })
        },
        get_cost: () => ({
            'inventory_magical_fabric': {
                A: 1.1,
                B: 50000/getAccessoryDiscount(),
                type: 1
            },
            'inventory_focusberry': {
                A: 1.1,
                B: 100000000/getAccessoryDiscount(),
                type: 1
            },
            'energy': {
                A: 1.1,
                B: 50000000/getAccessoryDiscount(),
                type: 1
            },
        }),
    })

    registerAccessory('accessory_wisdom_circlet', {
        tags: ["accessory", "upgrade", "purchaseable", "magical", "fabric", "clothing"],
        name: 'Wisdom Circlet',
        description: 'An ornate circlet crafted from copper wire and magical fabric. This mystical headpiece enhances the power of all tome-based accessories, amplifying their magical properties.',
        level: 0,
        minDemoVersion: 20,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_magic_weaving') > 0
                && gameResources.isResourceUnlocked('inventory_magical_fabric')
                && gameResources.isResourceUnlocked('inventory_copper_wire');
        },
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    'tome_accessories_efficiency': {
                        A: 0.08,
                        B: 1,
                        C: 1.02,
                        type: 3,
                    }
                }
            })
        },
        get_cost: () => ({
            'inventory_magical_fabric': {
                A: 1.1,
                B: 75000/getAccessoryDiscount(),
                type: 1
            },
            'inventory_copper_wire': {
                A: 1.1,
                B: 15000000/getAccessoryDiscount(),
                type: 1
            },
        }),
    })
}