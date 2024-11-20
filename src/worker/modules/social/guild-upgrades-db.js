import {gameEntity, gameCore, gameEffects, gameResources} from "game-framework"

export const registerGuildUpgrades = () => {

    // merchants

    gameEntity.registerGameEntity('guild_upgrades_merchant_codex', {
        tags: ["guild-upgrade", "purchaseable"],
        name: 'Merchants Codex',
        description: 'Learn merchants codex to be more efficient in selling your goods',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('guild_merchants') > 0;
        },
        attributes: {
            isCollectable: false,
            tier: 1,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'shop_max_stock': {
                        A: 0.25,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'guild-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'guild-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })


    gameEntity.registerGameEntity('guild_upgrades_golden_streams', {
        tags: ["guild-upgrade", "purchaseable"],
        name: 'Golden Streams',
        description: 'Enhance your income from all sources, ensuring a steady flow of wealth',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('guild_merchants') > 0;
        },
        attributes: {
            isCollectable: false,
            tier: 1,
        },
        resourceModifier: {
            multiplier: {
                resources: {
                    'coins': {
                        A: 0.1,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'guild-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'guild-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })


    gameEntity.registerGameEntity('guild_upgrades_efficient_work', {
        tags: ["guild-upgrade", "purchaseable"],
        name: 'Efficient Work Ethic',
        description: 'Improve the learning speed for work-related actions, maximizing your productivity',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('guild_merchants') > 0;
        },
        attributes: {
            isCollectable: false,
            tier: 1,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'job_learning_rate': {
                        A: 0.2,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'guild-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'guild-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })


    gameEntity.registerGameEntity('guild_upgrades_hagglers_charm', {
        tags: ["guild-upgrade", "purchaseable"],
        name: 'Hagglers Charm',
        description: 'Lower prices in the shop, saving money on every purchase',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('guild_merchants') > 4;
        },
        attributes: {
            isCollectable: false,
            tier: 2,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'prices_discount': {
                        A: 0.05,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'guild-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'guild-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })


    gameEntity.registerGameEntity('guild_upgrades_vault_expansion', {
        tags: ["guild-upgrade", "purchaseable"],
        name: 'Vault Expansion',
        description: 'Raise the coin cap to store even more wealth safely',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('guild_merchants') > 4;
        },
        attributes: {
            isCollectable: false,
            tier: 2,
        },
        resourceModifier: {
            capMult: {
                resources: {
                    'coins': {
                        A: 0.05,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'guild-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'guild-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })


    gameEntity.registerGameEntity('guild_upgrades_treasury_overflow', {
        tags: ["guild-upgrade", "purchaseable"],
        name: 'Treasury Overflow',
        description: 'Boost both your coin cap and income, stacking with previous upgrades',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('guild_merchants') > 9;
        },
        attributes: {
            isCollectable: false,
            tier: 3,
        },
        resourceModifier: {
            capMult: {
                resources: {
                    'coins': {
                        A: 0.05,
                        B: 1,
                        type: 0,
                    }
                }
            },
            multiplier: {
                resources: {
                    'coins': {
                        A: 0.05,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'guild-points': {
                        A: 2,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'guild-points': {
                A: 0,
                B: 2,
                type: 0
            }
        }),
    })

    // scholar

    gameEntity.registerGameEntity('guild_upgrades_knowledge_seeker', {
        tags: ["guild-upgrade", "purchaseable"],
        name: 'Knowledge Seeker',
        description: 'Increase the amount of knowledge you gain from intellectual pursuits.',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('guild_scholars') > 0;
        },
        attributes: {
            isCollectable: false,
            tier: 1,
        },
        resourceModifier: {
            multiplier: {
                resources: {
                    'knowledge': {
                        A: 0.1,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'guild-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'guild-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })


    gameEntity.registerGameEntity('guild_upgrades_routine_mastery', {
        tags: ["guild-upgrade", "purchaseable"],
        name: 'Routine Mastery',
        description: 'Accelerate learning speed for routine tasks, making them less time-consuming',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('guild_scholars') > 0;
        },
        attributes: {
            isCollectable: false,
            tier: 1,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'routine_learning_speed': {
                        A: 0.2,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'guild-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'guild-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })



    gameEntity.registerGameEntity('guild_upgrades_mental_acumen', {
        tags: ["guild-upgrade", "purchaseable"],
        name: 'Mental Acumen',
        description: 'Enhance the learning speed of mental actions, sharpening your intellect',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('guild_scholars') > 0;
        },
        attributes: {
            isCollectable: false,
            tier: 1,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'mental_training_learning_rate': {
                        A: 0.2,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'guild-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'guild-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })



    gameEntity.registerGameEntity('guild_upgrades_physical_insight', {
        tags: ["guild-upgrade", "purchaseable"],
        name: 'Physical Insight',
        description: 'Boost the learning speed of physical actions, improving your body\'s capabilities',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('guild_scholars') > 4;
        },
        attributes: {
            isCollectable: false,
            tier: 2,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'physical_training_learn_speed': {
                        A: 0.2,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'guild-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'guild-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })



    gameEntity.registerGameEntity('guild_upgrades_scholars_reservior', {
        tags: ["guild-upgrade", "purchaseable"],
        name: 'Scholar’s Reservoir',
        description: 'Increase the amount of knowledge you gain from intellectual pursuits',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('guild_scholars') > 4;
        },
        attributes: {
            isCollectable: false,
            tier: 2,
        },
        resourceModifier: {
            multiplier: {
                resources: {
                    'knowledge': {
                        A: 0.05,
                        B: 1,
                        type: 0,
                    }
                }
            },
            capMult: {
                resources: {
                    'knowledge': {
                        A: 0.1,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'guild-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'guild-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })


    gameEntity.registerGameEntity('guild_upgrades_omniscient_growth', {
        tags: ["guild-upgrade", "purchaseable"],
        name: 'Omniscient Growth',
        description: 'Dramatically enhance the learning speed of all actions, unlocking your full potential',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('guild_scholars') > 9;
        },
        attributes: {
            isCollectable: false,
            tier: 3,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'learning_rate': {
                        A: 0.2,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'guild-points': {
                        A: 2,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'guild-points': {
                A: 0,
                B: 2,
                type: 0
            }
        }),
    })

    // mages

    gameEntity.registerGameEntity('guild_upgrades_mana_well', {
        tags: ["guild-upgrade", "purchaseable"],
        name: 'Mana Well',
        description: 'Expand your maximum mana reserves, enabling more powerful spells.',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('guild_mages') > 0;
        },
        attributes: {
            isCollectable: false,
            tier: 1,
        },
        resourceModifier: {
            capMult: {
                resources: {
                    'mana': {
                        A: 0.1,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'guild-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'guild-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('guild_upgrades_spiritual_enlightenment', {
        tags: ["guild-upgrade", "purchaseable"],
        name: 'Spiritual Enlightenment',
        description: 'Increase the learning speed of spiritual actions, strengthening your magical prowess',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('guild_mages') > 0;
        },
        attributes: {
            isCollectable: false,
            tier: 1,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'spiritual_learning_rate': {
                        A: 0.2,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'guild-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'guild-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })


    gameEntity.registerGameEntity('guild_upgrades_arcane_expertise', {
        tags: ["guild-upgrade", "purchaseable"],
        name: 'Arcane Expertise',
        description: 'Boost the experience gained from casting spells, mastering the art of magic',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('guild_mages') > 0;
        },
        attributes: {
            isCollectable: false,
            tier: 1,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'spell_xp_rate': {
                        A: 0.25,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'guild-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'guild-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('guild_upgrades_restorative_surge', {
        tags: ["guild-upgrade", "purchaseable"],
        name: 'Restorative Surge',
        description: 'Improve the effectiveness of healing magic, ensuring faster recovery',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('guild_mages') > 4;
        },
        attributes: {
            isCollectable: false,
            tier: 2,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'restoration_spells_efficiency': {
                        A: 0.1,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'guild-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'guild-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('guild_upgrades_illusionists_edge', {
        tags: ["guild-upgrade", "purchaseable"],
        name: 'Illusionist\'s Edge',
        description: 'Enhance the potency of illusion spells, bending reality to your will',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('guild_mages') > 4;
        },
        attributes: {
            isCollectable: false,
            tier: 2,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'restoration_spells_efficiency': {
                        A: 0.1,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'guild-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'guild-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })


    gameEntity.registerGameEntity('guild_upgrades_mana_overflow', {
        tags: ["guild-upgrade", "purchaseable"],
        name: 'Mana Overflow',
        description: 'Increase both mana generation and its maximum capacity, channeling immense magical energy',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('guild_mages') > 4;
        },
        attributes: {
            isCollectable: false,
            tier: 3,
        },
        resourceModifier: {
            multiplier: {
                resources: {
                    'mana': {
                        A: 0.05,
                        B: 1,
                        type: 0,
                    }
                }
            },
            capMult: {
                resources: {
                    'mana': {
                        A: 0.1,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'guild-points': {
                        A: 2,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'guild-points': {
                A: 0,
                B: 2,
                type: 0
            }
        }),
    })

    // nature

    gameEntity.registerGameEntity('guild_upgrades_alchemical_mastery', {
        tags: ["guild-upgrade", "purchaseable"],
        name: 'Alchemical Mastery',
        description: 'Increase the efficiency of the \'Alchemy\' action, creating more potent results',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('guild_herbalists') > 0;
        },
        attributes: {
            isCollectable: false,
            tier: 1,
        },
        resourceModifier: {
            multiplier: {
                resources: {
                    'alchemy_ability': {
                        A: 0.1,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'guild-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'guild-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('guild_upgrades_green_fingers', {
        tags: ["guild-upgrade", "purchaseable"],
        name: 'Green Fingers',
        description: 'Boost the output of plantations, ensuring richer harvests of valuable plants',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('guild_herbalists') > 0 && gameResources.getResource('plantation_slots').income > 0;
        },
        attributes: {
            isCollectable: false,
            tier: 1,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'plantations_efficiency': {
                        A: 0.1,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'guild-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'guild-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })


    gameEntity.registerGameEntity('guild_upgrades_effortless_routine', {
        tags: ["guild-upgrade", "purchaseable"],
        name: 'Effortless Routine',
        description: 'Improve the learning speed of routine tasks, making them second nature',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('guild_herbalists') > 0;
        },
        attributes: {
            isCollectable: false,
            tier: 1,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'routine_learning_speed': {
                        A: 0.2,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'guild-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'guild-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })



    gameEntity.registerGameEntity('guild_upgrades_herbalists_insight', {
        tags: ["guild-upgrade", "purchaseable"],
        name: 'Herbalist\'s Insigh',
        description: 'Enhance the effectiveness of herb gathering, finding rarer and higher-quality plants',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('guild_herbalists') > 4;
        },
        attributes: {
            isCollectable: false,
            tier: 2,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'gathering_efficiency': {
                        A: 0.2,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'guild-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'guild-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })


    gameEntity.registerGameEntity('guild_upgrades_extra_alembic', {
        tags: ["guild-upgrade", "purchaseable"],
        name: 'Extra Alembic',
        description: 'Gain an additional alchemy slot to create more potions simultaneously',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('guild_herbalists') > 4;
        },
        attributes: {
            isCollectable: false,
            tier: 2,
        },
        resourceModifier: {
            income: {
                resources: {
                    'alchemy_slots': {
                        A: 1,
                        B: 0,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'guild-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'guild-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('guild_upgrades_potion_proficiency', {
        tags: ["guild-upgrade", "purchaseable"],
        name: 'Potion Proficiency',
        description: 'Brew additional potions for the same resource cost, maximizing your efficiency',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('guild_herbalists') > 9;
        },
        attributes: {
            isCollectable: false,
            tier: 3,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'alchemy_efficiency': {
                        A: 0.2,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'guild-points': {
                        A: 2,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'guild-points': {
                A: 0,
                B: 2,
                type: 0
            }
        }),
    })


    // artisans

    gameEntity.registerGameEntity('guild_upgrades_crafting_expertise', {
        tags: ["guild-upgrade", "purchaseable"],
        name: 'Crafting Expertise',
        description: 'Enhance the efficiency of crafting actions, allowing you to create items with greater precision and speed.',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('guild_artisans') > 0;
        },
        attributes: {
            isCollectable: false,
            tier: 1,
        },
        resourceModifier: {
            multiplier: {
                resources: {
                    'crafting_ability': {
                        A: 0.1,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'guild-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'guild-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })


    gameEntity.registerGameEntity('guild_upgrades_endless_energy', {
        tags: ["guild-upgrade", "purchaseable"],
        name: 'Endless Energy',
        description: 'Boost your energy regeneration rate, ensuring you stay active for longer periods.',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('guild_artisans') > 0;
        },
        attributes: {
            isCollectable: false,
            tier: 1,
        },
        resourceModifier: {
            multiplier: {
                resources: {
                    'energy': {
                        A: 0.05,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'guild-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'guild-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })


    gameEntity.registerGameEntity('guild_upgrades_vital_recovery', {
        tags: ["guild-upgrade", "purchaseable"],
        name: 'Vital Recovery',
        description: 'Increase your health regeneration, keeping you in peak condition during challenging tasks.',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('guild_artisans') > 0;
        },
        attributes: {
            isCollectable: false,
            tier: 1,
        },
        resourceModifier: {
            multiplier: {
                resources: {
                    'health': {
                        A: 0.05,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'guild-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'guild-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('guild_upgrades_labour_efficiency', {
        tags: ["guild-upgrade", "purchaseable"],
        name: 'Labour Efficiency',
        description: 'Improve the effectiveness of manual labor tasks, such as gathering wood and mining stone, making each effort more productive.',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('guild_artisans') > 4;
        },
        attributes: {
            isCollectable: false,
            tier: 2,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'manual_labor_efficiency': {
                        A: 0.2,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'guild-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'guild-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })


    gameEntity.registerGameEntity('guild_upgrades_physical_insight_2', {
        tags: ["guild-upgrade", "purchaseable"],
        name: 'Physical Insight',
        description: 'Accelerate learning from physical exercises, honing your body\'s capabilities with each session.',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('guild_artisans') > 4;
        },
        attributes: {
            isCollectable: false,
            tier: 2,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'physical_training_learn_speed': {
                        A: 0.2,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'guild-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'guild-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })


    gameEntity.registerGameEntity('guild_upgrades_master_crafter', {
        tags: ["guild-upgrade", "purchaseable"],
        name: 'Master Crafter',
        description: 'Significantly boost the efficiency of crafting, turning you into a true artisan of creation.',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('guild_artisans') > 9;
        },
        attributes: {
            isCollectable: false,
            tier: 3,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'crafting_efficiency': {
                        A: 0.2,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'guild-points': {
                        A: 2,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'guild-points': {
                A: 0,
                B: 2,
                type: 0
            }
        }),
    })
}