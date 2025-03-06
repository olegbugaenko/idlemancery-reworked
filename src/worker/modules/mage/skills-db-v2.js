import {gameEntity, gameCore, gameEffects, gameResources} from "game-framework"

export const registerSkillsStage1 = () => {

    gameEntity.registerGameEntity('skill_scholar', {
        tags: ["skill", "upgrade", "purchaseable"],
        name: 'Scholar',
        description: 'Increase your learning ability',
        level: 0,
        maxLevel: 5,
        uiPosition: {
            left: -2,
            top: 0,
        },
        unlockCondition: () => {
            return true;
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'learning_rate': {
                        A: 0.1,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'skill-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'skill-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('skill_mental_scholar', {
        tags: ["skill", "upgrade", "purchaseable"],
        name: 'Mindful Scholar',
        description: 'Increase your mental learning ability',
        level: 0,
        maxLevel: 8,
        uiPosition: {
            left: -4,
            top: -2,
        },
        unlockCondition: () => {
            return true;
        },
        unlockBySkills: [{ id: "skill_scholar", level: 2 }],
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'mental_training_learning_rate': {
                        A: 0.1,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'skill-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'skill-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('skill_routine_scholar', {
        tags: ["skill", "upgrade", "purchaseable"],
        name: 'Diligent Scholar',
        description: 'Increase your physical learning ability',
        level: 0,
        maxLevel: 8,
        uiPosition: {
            left: -4,
            top: 0,
        },
        unlockCondition: () => {
            return gameEntity.isEntityUnlocked('action_home_errands');
        },
        unlockBySkills: [{ id: "skill_scholar", level: 2 }],
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'routine_learning_speed': {
                        A: 0.1,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'skill-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'skill-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('skill_physical_scholar', {
        tags: ["skill", "upgrade", "purchaseable"],
        name: 'Resilient Scholar',
        description: 'Increase your physical learning ability',
        level: 0,
        maxLevel: 8,
        uiPosition: {
            left: -4,
            top: 2,
        },
        unlockCondition: () => {
            return true;
        },
        unlockBySkills: [{ id: "skill_scholar", level: 2 }],
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'physical_training_learn_speed': {
                        A: 0.1,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'skill-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'skill-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('skill_mental_discount', {
        tags: ["skill", "upgrade", "purchaseable"],
        name: 'Cognitive Efficiency',
        description: 'Reduce experience required for leveling mental actions',
        level: 0,
        maxLevel: 10,
        uiPosition: {
            left: -6,
            top: -2,
        },
        unlockCondition: () => {
            return true;
        },
        unlockBySkills: [{ id: "skill_mental_scholar", level: 4 }],
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'mental_actions_discount': {
                        A: 0.2,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'skill-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'skill-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('skill_routine_discount', {
        tags: ["skill", "upgrade", "purchaseable"],
        name: 'Methodical Mastery',
        description: 'Reduce experience required for leveling routine actions',
        level: 0,
        maxLevel: 10,
        uiPosition: {
            left: -6,
            top: 0,
        },
        unlockCondition: () => {
            return gameEntity.isEntityUnlocked('action_home_errands');
        },
        unlockBySkills: [{ id: "skill_routine_scholar", level: 4 }],
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'routine_actions_discount': {
                        A: 0.2,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'skill-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'skill-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('skill_physical_discount', {
        tags: ["skill", "upgrade", "purchaseable"],
        name: 'Adaptive Conditioning',
        description: 'Reduce experience required for leveling physical actions',
        level: 0,
        maxLevel: 8,
        uiPosition: {
            left: -6,
            top: 2,
        },
        unlockCondition: () => {
            return true;
        },
        unlockBySkills: [{ id: "skill_physical_scholar", level: 4 }],
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'physical_actions_discount': {
                        A: 0.2,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'skill-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'skill-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('skill_intense_training', {
        tags: ["skill", "upgrade", "purchaseable"],
        name: 'Intense Training',
        description: 'Increase overall learning speed',
        level: 0,
        maxLevel: 1,
        uiPosition: {
            left: -8,
            top: 0,
        },
        unlockCondition: () => {
            return true;
        },
        unlockBySkills: [{ id: "skill_physical_discount", level: 8 },{ id: "skill_mental_discount", level: 8 },{ id: "skill_routine_discount", level: 8 }],
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'learning_rate': {
                        A: 0.25,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'skill-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'skill-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('skill_courses_speed', {
        tags: ["skill", "upgrade", "purchaseable"],
        name: 'Accelerated Courses Learning',
        description: 'Increase courses learning speed',
        level: 0,
        maxLevel: 10,
        uiPosition: {
            left: -10,
            top: 0,
        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_training_room') > 0;
        },
        unlockBySkills: [{ id: "skill_intense_training", level: 1 }],
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'courses_learning_speed': {
                        A: 0.1,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'skill-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'skill-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('skill_reductive_courses_power', {
        tags: ["skill", "upgrade", "purchaseable"],
        name: 'Efficient Study',
        description: 'Increase reductive courses power',
        level: 0,
        maxLevel: 10,
        uiPosition: {
            left: -12,
            top: 0,
        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_training_room') > 0 && gameEntity.getLevel('shop_item_advanced_training') > 0;
        },
        unlockBySkills: [{ id: "skill_courses_speed", level: 4 }],
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'reductive_courses_power': {
                        A: 0.1,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'skill-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'skill-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('skill_mental_discount_2', {
        tags: ["skill", "upgrade", "purchaseable"],
        name: 'Cognitive Optimization',
        description: 'Increase mental actions XP discount',
        level: 0,
        maxLevel: 10,
        uiPosition: {
            left: -12,
            top: -2,
        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_training_room') > 0 && gameEntity.getLevel('shop_item_advanced_training') > 0;
        },
        unlockBySkills: [{ id: "skill_courses_speed", level: 4 }],
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'mental_actions_discount': {
                        A: 0.1,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'skill-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'skill-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('skill_physical_discount_2', {
        tags: ["skill", "upgrade", "purchaseable"],
        name: 'Endurance Conditioning',
        description: 'Increase physical actions XP discount',
        level: 0,
        maxLevel: 10,
        uiPosition: {
            left: -12,
            top: 2,
        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_training_room') > 0 && gameEntity.getLevel('shop_item_advanced_training') > 0;
        },
        unlockBySkills: [{ id: "skill_courses_speed", level: 4 }],
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'physical_actions_discount': {
                        A: 0.1,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'skill-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'skill-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('skill_mental_learn_rate', {
        tags: ["skill", "upgrade", "purchaseable"],
        name: 'Intellectual Mastery',
        description: 'Increase mental training speed',
        level: 0,
        maxLevel: 10,
        uiPosition: {
            left: -14,
            top: -1,
        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_training_room') > 0 && gameEntity.getLevel('shop_item_advanced_training') > 0;
        },
        unlockBySkills: [{ id: "skill_mental_discount_2", level: 8 },{ id: "skill_reductive_courses_power", level: 8 }],
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'mental_training_learning_rate': {
                        A: 0.1,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'skill-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'skill-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })


    gameEntity.registerGameEntity('skill_physical_learn_rate', {
        tags: ["skill", "upgrade", "purchaseable"],
        name: 'Peak Performance',
        description: 'Increase physical training speed',
        level: 0,
        maxLevel: 10,
        uiPosition: {
            left: -14,
            top: 1,
        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_training_room') > 0 && gameEntity.getLevel('shop_item_advanced_training') > 0;
        },
        unlockBySkills: [{ id: "skill_physical_discount_2", level: 8 },{ id: "skill_reductive_courses_power", level: 8 }],
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'physical_training_learn_speed': {
                        A: 0.1,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'skill-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'skill-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })


    gameEntity.registerGameEntity('skill_energizer', {
        tags: ["skill", "upgrade", "purchaseable"],
        name: 'Energizer',
        description: 'Increase your energy gains',
        level: 0,
        maxLevel: 5,
        uiPosition: {
            left: 0,
            top: 2,
        },
        unlockCondition: () => {
            return true;
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                resources: {
                    'energy': {
                        A: 0.1,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'skill-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'skill-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('skill_energy_regen_1', {
        tags: ["skill", "upgrade", "purchaseable"],
        name: 'Stamina Reserves',
        description: 'Further increase your energy gains',
        level: 0,
        maxLevel: 10,
        uiPosition: {
            left: -2,
            top: 4,
        },
        unlockBySkills: [{ id: "skill_energizer", level: 2 }],
        unlockCondition: () => {
            return true;
        },
        attributes: {
            isCollectable: false,
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
                    'skill-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'skill-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('skill_oak_heart', {
        tags: ["skill", "upgrade", "purchaseable"],
        name: 'Oak Heart',
        description: 'Increase your health regeneration',
        level: 0,
        maxLevel: 10,
        uiPosition: {
            left: 2,
            top: 4,
        },
        unlockBySkills: [{ id: "skill_energizer", level: 2 }],
        unlockCondition: () => {
            return gameEntity.getLevel('action_pushup') > 1;
        },
        attributes: {
            isCollectable: false,
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
                    'skill-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'skill-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('skill_resilience', {
        tags: ["skill", "upgrade", "purchaseable"],
        name: 'Resilience',
        description: 'Increase your health and energy caps',
        level: 0,
        maxLevel: 10,
        uiPosition: {
            left: 0,
            top: 6,
        },
        unlockBySkills: [{ id: "skill_oak_heart", level: 4 },{ id: "skill_energy_regen_1", level: 4 }],
        unlockCondition: () => {
            return gameEntity.getLevel('action_pushup') > 1;
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            capMult: {
                resources: {
                    'health': {
                        A: 0.1,
                        B: 1,
                        type: 0,
                    },
                    'energy': {
                        A: 0.1,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'skill-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'skill-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('skill_physical_talents', {
        tags: ["skill", "upgrade", "purchaseable"],
        name: 'Physical Talents',
        description: 'Increase efficiency of physical activity',
        level: 0,
        maxLevel: 1,
        uiPosition: {
            left: 0,
            top: 8,
        },
        unlockBySkills: [{id: 'skill_resilience', level: 4},{ id: "skill_oak_heart", level: 8 },{ id: "skill_energy_regen_1", level: 8 },{ id: "skill_oak_heart", level: 8 },{ id: "skill_general_training_9", level: 1 },{ id: "skill_general_training_8", level: 1 }],
        unlockCondition: () => {
            return true;
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'physical_training_learn_speed': {
                        A: 0.25,
                        B: 1,
                        type: 0,
                    },
                    'physical_actions_discount': {
                        A: 0.25,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'skill-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'skill-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('skill_crafting_effort', {
        tags: ["skill", "upgrade", "purchaseable"],
        name: 'Artisan\'s Drive',
        description: 'Increase crafting effort generated',
        level: 0,
        maxLevel: 10,
        uiPosition: {
            left: 0,
            top: 10,
        },
        unlockBySkills: [{id: 'skill_physical_talents', level: 1}],
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_crafting_courses') > 0;
        },
        attributes: {
            isCollectable: false,
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
                    'skill-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'skill-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('skill_physical_actions_discount_3', {
        tags: ["skill", "upgrade", "purchaseable"],
        name: 'Tireless Worker',
        description: 'Increase efficiency of physical activity',
        level: 0,
        maxLevel: 10,
        uiPosition: {
            left: 0,
            top: 12,
        },
        unlockBySkills: [{id: 'skill_crafting_effort', level: 5}],
        unlockCondition: () => {
            return true;
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'physical_actions_discount': {
                        A: 0.2,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'skill-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'skill-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('skill_energizer_2', {
        tags: ["skill", "upgrade", "purchaseable"],
        name: 'Vital Surge',
        description: 'Increase energy income',
        level: 0,
        maxLevel: 10,
        uiPosition: {
            left: -2,
            top: 12,
        },
        unlockBySkills: [{id: 'skill_crafting_effort', level: 5}],
        unlockCondition: () => {
            return true;
        },
        attributes: {
            isCollectable: false,
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
                    'skill-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'skill-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('skill_oak_heart_2', {
        tags: ["skill", "upgrade", "purchaseable"],
        name: 'Heart of the Oak II',
        description: 'Increase health income',
        level: 0,
        maxLevel: 10,
        uiPosition: {
            left: 2,
            top: 12,
        },
        unlockBySkills: [{id: 'skill_crafting_effort', level: 5}],
        unlockCondition: () => {
            return true;
        },
        attributes: {
            isCollectable: false,
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
                    'skill-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'skill-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('skill_crafting_efficiency', {
        tags: ["skill", "upgrade", "purchaseable"],
        name: 'Masterful Craft',
        description: 'Increase crafting efficiency',
        level: 0,
        maxLevel: 10,
        uiPosition: {
            left: 0,
            top: 14,
        },
        unlockBySkills: [{id: 'skill_energizer_2', level: 8},{id: 'skill_oak_heart_2', level: 8},{id: 'skill_physical_actions_discount_3', level: 8}],
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_crafting_courses') > 0;
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'crafting_efficiency': {
                        A: 0.05,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'skill-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'skill-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('skill_treasurer', {
        tags: ["skill", "upgrade", "purchaseable"],
        name: 'Treasurer',
        description: 'Increase your coins cap',
        level: 0,
        maxLevel: 5,
        uiPosition: {
            left: 2,
            top: 0,
        },
        unlockCondition: () => {
            return true;
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                resources: {
                    'coins': {
                        A: 0.05,
                        B: 1,
                        type: 0,
                    }
                }
            },
            capMult: {
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
                    'skill-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'skill-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('skill_merchant', {
        tags: ["skill", "upgrade", "purchaseable"],
        name: 'Merchant',
        description: 'Increase amount of items you can sell',
        level: 0,
        unlockCondition: () => {
            // console.log('ACTLVL: ', )
            return gameEntity.getLevel('shop_item_backpack') >= 1
        },
        unlockBySkills: [{ id: "skill_treasurer", level: 2 }],
        attributes: {
            isCollectable: false,
        },
        maxLevel: 8,
        uiPosition: {
            left: 4,
            top: 0,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'shop_max_stock': {
                        A: 0.2,
                        B: 1,
                        type: 0,
                    },
                    'shop_stock_renew_rate': {
                        A: 0.1,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'skill-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'skill-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('skill_coin_cap1', {
        tags: ["skill", "upgrade", "purchaseable"],
        name: 'Vault Expansion',
        description: 'Increase coins capacity',
        level: 0,
        unlockCondition: () => {
            // console.log('ACTLVL: ', )
            return gameEntity.getLevel('shop_item_backpack') >= 1
        },
        unlockBySkills: [{ id: "skill_treasurer", level: 3 }],
        attributes: {
            isCollectable: false,
        },
        maxLevel: 8,
        uiPosition: {
            left: 4,
            top: 2,
        },
        resourceModifier: {
            capMult: {
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
                    'skill-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'skill-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('skill_social_learn', {
        tags: ["skill", "upgrade", "purchaseable"],
        name: 'Charismatic Insight',
        description: 'Increase social actions learning rate',
        level: 0,
        unlockCondition: () => {
            // console.log('ACTLVL: ', )
            return gameEntity.getLevel('shop_item_backpack') >= 1
        },
        unlockBySkills: [{ id: "skill_treasurer", level: 3 }],
        attributes: {
            isCollectable: false,
        },
        maxLevel: 8,
        uiPosition: {
            left: 4,
            top: -2,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'social_training_learning_rate': {
                        A: 0.1,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'skill-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'skill-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })


    gameEntity.registerGameEntity('skill_trade_efficiency', {
        tags: ["skill", "upgrade", "purchaseable"],
        name: 'Trade Efficiency',
        description: 'Further increase amount of items you can sell',
        level: 0,
        unlockCondition: () => {
            // console.log('ACTLVL: ', )
            return gameEntity.getLevel('shop_item_backpack') >= 1
        },
        unlockBySkills: [{ id: "skill_merchant", level: 4 }],
        attributes: {
            isCollectable: false,
        },
        maxLevel: 10,
        uiPosition: {
            left: 6,
            top: 0,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'shop_max_stock': {
                        A: 0.25,
                        B: 1,
                        type: 0,
                    },
                    'shop_stock_renew_rate': {
                        A: 0.2,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'skill-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'skill-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('skill_coin_income', {
        tags: ["skill", "upgrade", "purchaseable"],
        name: 'Prosperity',
        description: 'Increase coins income',
        level: 0,
        unlockCondition: () => {
            // console.log('ACTLVL: ', )
            return gameEntity.getLevel('shop_item_backpack') >= 1
        },
        unlockBySkills: [{ id: "skill_coin_cap1", level: 6 }],
        attributes: {
            isCollectable: false,
        },
        maxLevel: 10,
        uiPosition: {
            left: 6,
            top: 2,
        },
        resourceModifier: {
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
                    'skill-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'skill-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('skill_social_discount', {
        tags: ["skill", "upgrade", "purchaseable"],
        name: 'Silver Tongue',
        description: 'Reduce amount of experiance required for ations with tag "Social"',
        level: 0,
        unlockCondition: () => {
            // console.log('ACTLVL: ', )
            return gameEntity.getLevel('shop_item_backpack') >= 1
        },
        unlockBySkills: [{ id: "skill_social_learn", level: 6 }],
        attributes: {
            isCollectable: false,
        },
        maxLevel: 10,
        uiPosition: {
            left: 6,
            top: -2,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'social_actions_discount': {
                        A: 0.2,
                        B: 1,
                        type: 0,
                    }
                },
            },
            consumption: {
                resources: {
                    'skill-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'skill-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('skill_empathy', {
        tags: ["skill", "upgrade", "purchaseable"],
        name: 'Empathic Influence',
        description: 'Learn people emotions better to learn manipulate their wishes.',
        level: 0,
        unlockCondition: () => {
            // console.log('ACTLVL: ', )
            return gameEntity.getLevel('shop_item_backpack') >= 1
        },
        unlockBySkills: [{ id: "skill_social_discount", level: 8 },{ id: "skill_coin_income", level: 8 },{ id: "skill_trade_efficiency", level: 8 },{id: "skill_general_training_5", level: 1},{id: "skill_general_training_6", level: 1}],
        attributes: {
            isCollectable: false,
        },
        maxLevel: 1,
        uiPosition: {
            left: 8,
            top: 0,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'social_actions_discount': {
                        A: 0.25,
                        B: 1,
                        type: 0,
                    },
                    'learning_rate': {
                        A: 0.2,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'skill-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'skill-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('skill_gather_effort', {
        tags: ["skill", "upgrade", "purchaseable"],
        name: 'Forager\'s Instinct',
        description: 'Increase gathering effort',
        level: 0,
        unlockCondition: () => {
            // console.log('ACTLVL: ', )
            return gameEntity.getLevel('shop_item_map') > 0
        },
        unlockBySkills: [{ id: "skill_empathy", level: 1 }],
        attributes: {
            isCollectable: false,
        },
        maxLevel: 10,
        uiPosition: {
            left: 10,
            top: 0,
        },
        resourceModifier: {
            multiplier: {
                resources: {
                    'gathering_effort': {
                        A: 0.1,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'skill-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'skill-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('skill_plantations_efficiency', {
        tags: ["skill", "upgrade", "purchaseable"],
        name: 'Cultivator\'s Mastery',
        description: 'Increase plantations efficiency',
        level: 0,
        unlockCondition: () => {
            // console.log('ACTLVL: ', )
            return gameResources.getResource('plantation_slots').income > 0
        },
        unlockBySkills: [{ id: "skill_gather_effort", level: 4 }],
        attributes: {
            isCollectable: false,
        },
        maxLevel: 10,
        uiPosition: {
            left: 12,
            top: 0,
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
                    'skill-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'skill-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('skill_routine_learning', {
        tags: ["skill", "upgrade", "purchaseable"],
        name: 'Methodical Learning',
        description: 'Increase routine learning speed',
        level: 0,
        unlockCondition: () => {
            // console.log('ACTLVL: ', )
            return gameEntity.getLevel('shop_item_backpack') >= 1
        },
        unlockBySkills: [{ id: "skill_gather_effort", level: 4 }],
        attributes: {
            isCollectable: false,
        },
        maxLevel: 10,
        uiPosition: {
            left: 12,
            top: 2,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'routine_learning_speed': {
                        A: 0.1,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'skill-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'skill-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('skill_social_learning', {
        tags: ["skill", "upgrade", "purchaseable"],
        name: 'Social Awareness',
        description: 'Increase social learning speed',
        level: 0,
        unlockCondition: () => {
            // console.log('ACTLVL: ', )
            return gameEntity.getLevel('shop_item_backpack') >= 1
        },
        unlockBySkills: [{ id: "skill_gather_effort", level: 4 }],
        attributes: {
            isCollectable: false,
        },
        maxLevel: 10,
        uiPosition: {
            left: 12,
            top: -2,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'social_training_learning_rate': {
                        A: 0.1,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'skill-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'skill-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('skill_improved_perception', {
        tags: ["skill", "upgrade", "purchaseable"],
        name: 'Keen Observation',
        description: 'Increase your gathering perception',
        level: 0,
        unlockCondition: () => {
            // console.log('ACTLVL: ', )
            return gameEntity.getLevel('shop_item_map') > 0
        },
        unlockBySkills: [{ id: "skill_routine_learning", level: 8 },{ id: "skill_plantations_efficiency", level: 8 }],
        attributes: {
            isCollectable: false,
        },
        maxLevel: 10,
        uiPosition: {
            left: 14,
            top: 1,
        },
        resourceModifier: {
            multiplier: {
                resources: {
                    'gathering_perception': {
                        A: 0.2,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'skill-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'skill-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('skill_improved_prosperity', {
        tags: ["skill", "upgrade", "purchaseable"],
        name: 'Wealth Acumen',
        description: 'Increase your coins income and cap',
        level: 0,
        unlockCondition: () => {
            // console.log('ACTLVL: ', )
            return gameEntity.getLevel('shop_item_backpack') >= 1
        },
        unlockBySkills: [{ id: "skill_social_learning", level: 8 },{ id: "skill_plantations_efficiency", level: 8 }],
        attributes: {
            isCollectable: false,
        },
        maxLevel: 10,
        uiPosition: {
            left: 14,
            top: -1,
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
            capMult: {
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
                    'skill-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'skill-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })



    gameEntity.registerGameEntity('skill_highbrow', {
        tags: ["skill", "upgrade", "purchaseable"],
        name: 'Highbrow',
        description: 'Increase your knowledge capacity and regeneration',
        level: 0,
        maxLevel: 5,
        uiPosition: {
            left: 0,
            top: -2,
        },
        unlockCondition: () => {
            // console.log('ACTLVL: ', )
            return gameEntity.getLevel('shop_item_library_entrance') >= 1
        },
        attributes: {
            isCollectable: false,
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
            capMult: {
                resources: {
                    'knowledge': {
                        A: 0.05,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'skill-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'skill-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })


    gameEntity.registerGameEntity('skill_knowledge_generation2', {
        tags: ["skill", "upgrade", "purchaseable"],
        name: 'Profound Wisdom',
        description: 'Further increase knowledge generation and learn speed',
        level: 0,
        maxLevel: 10,
        uiPosition: {
            left: 2,
            top: -4,
        },
        unlockBySkills: [{ id: "skill_highbrow", level: 3 }],
        unlockCondition: () => {
            // console.log('ACTLVL: ', )
            return gameEntity.getLevel('shop_item_library_entrance') >= 1
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                resources: {
                    'knowledge': {
                        A: 0.05,
                        B: 1,
                        type: 0,
                    },
                },
                effects: {
                    'learning_rate': {
                        A: 0.02,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'skill-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'skill-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('skill_sorcer', {
        tags: ["skill", "upgrade", "purchaseable"],
        name: 'Sorcer',
        description: 'Further increase knowledge generation and learn speed',
        level: 0,
        maxLevel: 10,
        uiPosition: {
            left: -2,
            top: -4,
        },
        unlockBySkills: [{ id: "skill_highbrow", level: 3 }],
        unlockCondition: () => {
            // console.log('ACTLVL: ', )
            return gameEntity.getLevel('shop_item_spellbook') >= 1
        },
        attributes: {
            isCollectable: false,
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
                        A: 0.05,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'skill-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'skill-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('skill_arcane_mind', {
        tags: ["skill", "upgrade", "purchaseable"],
        name: 'Arcane Mind',
        description: 'Increase knowledge and mana caps',
        level: 0,
        maxLevel: 10,
        uiPosition: {
            left: 0,
            top: -6,
        },
        unlockBySkills: [{ id: "skill_sorcer", level: 4 },{id: "skill_knowledge_generation2", level: 4}],
        unlockCondition: () => {
            // console.log('ACTLVL: ', )
            return gameEntity.getLevel('shop_item_spellbook') >= 1
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            capMult: {
                resources: {
                    'mana': {
                        A: 0.1,
                        B: 1,
                        type: 0,
                    },
                    'knowledge': {
                        A: 0.1,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'skill-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'skill-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('skill_mysticism', {
        tags: ["skill", "upgrade", "purchaseable"],
        name: 'Mysticism',
        description: 'Improves you feeling of magic, increasing spells XP rate and mana income',
        level: 0,
        maxLevel: 10,
        uiPosition: {
            left: 0,
            top: -8,
        },
        unlockBySkills: [{ id: "skill_arcane_mind", level: 4 },{id: "skill_sorcer", level: 8},{id: "skill_knowledge_generation2", level: 8},{id: "skill_general_training_1", level: 1},{id: "skill_general_training_3", level: 1}],
        unlockCondition: () => {
            // console.log('ACTLVL: ', )
            return gameEntity.getLevel('shop_item_spellbook') >= 1
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'spell_xp_rate': {
                        A: 0.2,
                        B: 1,
                        type: 0,
                    },
                },
                resources: {
                    'mana': {
                        A: 0.025,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'skill-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'skill-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('skill_spell_xp_rate', {
        tags: ["skill", "upgrade", "purchaseable"],
        name: 'Arcane Mastery',
        description: 'Improves spells XP rate',
        level: 0,
        maxLevel: 10,
        uiPosition: {
            left: 0,
            top: -10,
        },
        unlockBySkills: [{ id: "skill_mysticism", level: 1 }],
        unlockCondition: () => {
            // console.log('ACTLVL: ', )
            return gameEntity.getLevel('shop_item_spellbook') >= 1
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'spell_xp_rate': {
                        A: 0.2,
                        B: 1,
                        type: 0,
                    },
                }
            },
            consumption: {
                resources: {
                    'skill-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'skill-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('skill_spiritual_learning_rate', {
        tags: ["skill", "upgrade", "purchaseable"],
        name: 'Esoteric Insight',
        description: 'Improves spiritual learning rate',
        level: 0,
        maxLevel: 10,
        uiPosition: {
            left: 0,
            top: -12,
        },
        unlockBySkills: [{ id: "skill_mysticism", level: 5 }],
        unlockCondition: () => {
            // console.log('ACTLVL: ', )
            return gameEntity.getLevel('shop_item_spellbook') >= 1
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'spiritual_learning_rate': {
                        A: 0.1,
                        B: 1,
                        type: 0,
                    },
                }
            },
            consumption: {
                resources: {
                    'skill-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'skill-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('skill_mana_gain_2', {
        tags: ["skill", "upgrade", "purchaseable"],
        name: 'Flow of Essence',
        description: 'Improves mana income',
        level: 0,
        maxLevel: 10,
        uiPosition: {
            left: 2,
            top: -12,
        },
        unlockBySkills: [{ id: "skill_mysticism", level: 5 }],
        unlockCondition: () => {
            // console.log('ACTLVL: ', )
            return gameEntity.getLevel('shop_item_spellbook') >= 1
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                resources: {
                    'mana': {
                        A: 0.05,
                        B: 1,
                        type: 0,
                    },
                }
            },
            consumption: {
                resources: {
                    'skill-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'skill-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('skill_knowledge_gain_2', {
        tags: ["skill", "upgrade", "purchaseable"],
        name: 'Scholar’s Discipline',
        description: 'Improves knowledge income',
        level: 0,
        maxLevel: 10,
        uiPosition: {
            left: -2,
            top: -12,
        },
        unlockBySkills: [{ id: "skill_mysticism", level: 5 }],
        unlockCondition: () => {
            // console.log('ACTLVL: ', )
            return gameEntity.getLevel('shop_item_library_entrance') >= 1
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                resources: {
                    'knowledge': {
                        A: 0.05,
                        B: 1,
                        type: 0,
                    },
                }
            },
            consumption: {
                resources: {
                    'skill-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'skill-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('skill_learning_mastery', {
        tags: ["skill", "upgrade", "purchaseable"],
        name: 'Learning Mastery',
        description: 'Improves overall learning rate',
        level: 0,
        maxLevel: 10,
        uiPosition: {
            left: 0,
            top: -14,
        },
        unlockBySkills: [{ id: "skill_spiritual_learning_rate", level: 8 },{ id: "skill_knowledge_gain_2", level: 8 },{ id: "skill_mana_gain_2", level: 8 }],
        unlockCondition: () => {
            // console.log('ACTLVL: ', )
            return gameEntity.getLevel('shop_item_spellbook') >= 1
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'learning_rate': {
                        A: 0.05,
                        B: 1,
                        type: 0,
                    },
                }
            },
            consumption: {
                resources: {
                    'skill-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'skill-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })

    // Ark skills

    gameEntity.registerGameEntity('skill_general_training_-0', {
        tags: ["skill", "upgrade", "purchaseable"],
        name: 'General Training',
        description: 'Increase general training learning speed',
        level: 0,
        maxLevel: 1,
        uiPosition: {
            left: -8,
            top: -2,
        },
        icon: {
            color: 'rgba(180, 180, 180, 1)'
        },
        unlockCondition: () => {
            return true;
        },
        unlockBySkills: [{ id: "skill_intense_training", level: 1 },{ id: "mental_general_training_0", level: 1 }],
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'learning_rate': {
                        A: 0.025,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'skill-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        modifierGroupId: 'general_learn_rate',
        get_cost: () => ({
            'skill-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('skill_mental_training_0', {
        tags: ["skill", "upgrade", "purchaseable"],
        name: 'Mental Training',
        description: 'Increase mental training learning speed',
        level: 0,
        maxLevel: 3,
        uiPosition: {
            left: -7,
            top: -4,
        },
        icon: {
          color: 'rgba(60, 120, 180, 1)'
        },
        unlockCondition: () => {
            return true;
        },
        unlockBySkills: [{ id: "skill_general_training_-0", level: 1 },{ id: "skill_general_training_0", level: 1 }],
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'mental_training_learning_rate': {
                        A: 0.05,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'skill-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        modifierGroupId: 'mental_learn_rate',
        get_cost: () => ({
            'skill-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('skill_general_training_0', {
        tags: ["skill", "upgrade", "purchaseable"],
        name: 'General Training',
        description: 'Increase mental training learning speed',
        level: 0,
        maxLevel: 1,
        uiPosition: {
            left: -6,
            top: -6,
        },
        icon: {
            color: 'rgba(180, 180, 180, 1)'
        },
        unlockCondition: () => {
            return true;
        },
        unlockBySkills: [{ id: "skill_mental_training_1", level: 1 },{ id: "skill_mental_training_0", level: 1 }],
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'learning_rate': {
                        A: 0.025,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'skill-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        modifierGroupId: 'general_learn_rate',
        get_cost: () => ({
            'skill-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('skill_mental_training_1', {
        tags: ["skill", "upgrade", "purchaseable"],
        name: 'Mental Training',
        description: 'Increase mental training learning speed',
        level: 0,
        maxLevel: 3,
        uiPosition: {
            left: -4,
            top: -7,
        },
        icon: {
            color: 'rgba(60, 120, 180, 1)'
        },
        unlockCondition: () => {
            return true;
        },
        unlockBySkills: [{ id: "skill_general_training_0", level: 1 },{ id: "skill_general_training_1", level: 1 }],
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'mental_training_learning_rate': {
                        A: 0.05,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'skill-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        modifierGroupId: 'mental_learn_rate',
        get_cost: () => ({
            'skill-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('skill_general_training_1', {
        tags: ["skill", "upgrade", "purchaseable"],
        name: 'General Training',
        description: 'Increase mental training learning speed',
        level: 0,
        maxLevel: 1,
        uiPosition: {
            left: -2,
            top: -8,
        },
        icon: {
            color: 'rgba(180, 180, 180, 1)'
        },
        unlockCondition: () => {
            return true;
        },
        unlockBySkills: [{ id: "skill_mental_training_1", level: 1 },{ id: "skill_mysticism", level: 1 }],
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'learning_rate': {
                        A: 0.025,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'skill-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        modifierGroupId: 'general_learn_rate',
        get_cost: () => ({
            'skill-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('skill_general_training_3', {
        tags: ["skill", "upgrade", "purchaseable"],
        name: 'General Training',
        description: 'Increase general training learning speed',
        level: 0,
        maxLevel: 1,
        uiPosition: {
            left: 2,
            top: -8,
        },
        icon: {
            color: 'rgba(180, 180, 180, 1)'
        },
        unlockCondition: () => {
            return true;
        },
        unlockBySkills: [{ id: "skill_social_training_0", level: 1 },{ id: "skill_mysticism", level: 1 }],
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'learning_rate': {
                        A: 0.025,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'skill-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        modifierGroupId: 'general_learn_rate',
        get_cost: () => ({
            'skill-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('skill_social_training_0', {
        tags: ["skill", "upgrade", "purchaseable"],
        name: 'Social Training',
        description: 'Increase mental training learning speed',
        level: 0,
        maxLevel: 3,
        uiPosition: {
            left: 4,
            top: -7,
        },
        icon: {
            color: 'rgba(30, 130, 130, 1)'
        },
        unlockCondition: () => {
            return true;
        },
        unlockBySkills: [{ id: "skill_general_training_3", level: 1 },{ id: "skill_general_training_4", level: 1 }],
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'social_training_learning_rate': {
                        A: 0.05,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'skill-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        modifierGroupId: 'mental_learn_rate',
        get_cost: () => ({
            'skill-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('skill_general_training_4', {
        tags: ["skill", "upgrade", "purchaseable"],
        name: 'General Training',
        description: 'Increase general training learning speed',
        level: 0,
        maxLevel: 1,
        uiPosition: {
            left: 6,
            top: -6,
        },
        icon: {
            color: 'rgba(180, 180, 180, 1)'
        },
        unlockCondition: () => {
            return true;
        },
        unlockBySkills: [{ id: "skill_social_training_0", level: 1 },{ id: "skill_social_training_1", level: 1 }],
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'learning_rate': {
                        A: 0.025,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'skill-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        modifierGroupId: 'general_learn_rate',
        get_cost: () => ({
            'skill-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('skill_social_training_1', {
        tags: ["skill", "upgrade", "purchaseable"],
        name: 'Social Training',
        description: 'Increase mental training learning speed',
        level: 0,
        maxLevel: 3,
        uiPosition: {
            left: 7,
            top: -4,
        },
        icon: {
            color: 'rgba(30, 130, 130, 1)'
        },
        unlockCondition: () => {
            return true;
        },
        unlockBySkills: [{ id: "skill_general_training_4", level: 1 },{ id: "skill_general_training_5", level: 1 }],
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'social_training_learning_rate': {
                        A: 0.05,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'skill-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            },
        },
        modifierGroupId: 'social_learn_rate',
        get_cost: () => ({
            'skill-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('skill_general_training_5', {
        tags: ["skill", "upgrade", "purchaseable"],
        name: 'General Training',
        description: 'Increase general training learning speed',
        level: 0,
        maxLevel: 1,
        uiPosition: {
            left: 8,
            top: -2,
        },
        icon: {
            color: 'rgba(180, 180, 180, 1)'
        },
        unlockCondition: () => {
            return true;
        },
        unlockBySkills: [{ id: "skill_empathy", level: 1 },{ id: "skill_social_training_1", level: 1 }],
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'learning_rate': {
                        A: 0.025,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'skill-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        modifierGroupId: 'general_learn_rate',
        get_cost: () => ({
            'skill-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('skill_general_training_6', {
        tags: ["skill", "upgrade", "purchaseable"],
        name: 'General Training',
        description: 'Increase general training learning speed',
        level: 0,
        maxLevel: 1,
        uiPosition: {
            left: 8,
            top: 2,
        },
        icon: {
            color: 'rgba(180, 180, 180, 1)'
        },
        unlockCondition: () => {
            return true;
        },
        unlockBySkills: [{ id: "skill_empathy", level: 1 },{ id: "skill_physical_training_1", level: 1 }],
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'learning_rate': {
                        A: 0.025,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'skill-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        modifierGroupId: 'general_learn_rate',
        get_cost: () => ({
            'skill-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('skill_physical_training_1', {
        tags: ["skill", "upgrade", "purchaseable"],
        name: 'Physical Training',
        description: 'Increase mental training learning speed',
        level: 0,
        maxLevel: 3,
        uiPosition: {
            left: 7,
            top: 4,
        },
        icon: {
            color: 'rgba(160, 85, 50, 1)'
        },
        unlockCondition: () => {
            return true;
        },
        unlockBySkills: [{ id: "skill_general_training_6", level: 1 },{ id: "skill_general_training_7", level: 1 }],
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'physical_training_learn_speed': {
                        A: 0.05,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'skill-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        modifierGroupId: 'physical_learn_rate',
        get_cost: () => ({
            'skill-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('skill_general_training_7', {
        tags: ["skill", "upgrade", "purchaseable"],
        name: 'General Training',
        description: 'Increase general training learning speed',
        level: 0,
        maxLevel: 1,
        uiPosition: {
            left: 6,
            top: 6,
        },
        icon: {
            color: 'rgba(180, 180, 180, 1)'
        },
        unlockCondition: () => {
            return true;
        },
        unlockBySkills: [{ id: "skill_physical_training_2", level: 1 },{ id: "skill_physical_training_1", level: 1 }],
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'learning_rate': {
                        A: 0.025,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'skill-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        modifierGroupId: 'general_learn_rate',
        get_cost: () => ({
            'skill-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('skill_physical_training_2', {
        tags: ["skill", "upgrade", "purchaseable"],
        name: 'Physical Training',
        description: 'Increase mental training learning speed',
        level: 0,
        maxLevel: 3,
        uiPosition: {
            left: 4,
            top: 7,
        },
        icon: {
            color: 'rgba(160, 85, 50, 1)'
        },
        unlockCondition: () => {
            return true;
        },
        unlockBySkills: [{ id: "skill_general_training_8", level: 1 },{ id: "skill_general_training_7", level: 1 }],
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'physical_training_learn_speed': {
                        A: 0.05,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'skill-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        modifierGroupId: 'physical_learn_rate',
        get_cost: () => ({
            'skill-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('skill_general_training_8', {
        tags: ["skill", "upgrade", "purchaseable"],
        name: 'General Training',
        description: 'Increase general training learning speed',
        level: 0,
        maxLevel: 1,
        uiPosition: {
            left: 2,
            top: 8,
        },
        icon: {
            color: 'rgba(180, 180, 180, 1)'
        },
        unlockCondition: () => {
            return true;
        },
        unlockBySkills: [{ id: "skill_physical_training_2", level: 1 },{ id: "skill_physical_talents", level: 1 }],
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'learning_rate': {
                        A: 0.025,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'skill-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        modifierGroupId: 'general_learn_rate',
        get_cost: () => ({
            'skill-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('skill_general_training_9', {
        tags: ["skill", "upgrade", "purchaseable"],
        name: 'General Training',
        description: 'Increase general training learning speed',
        level: 0,
        maxLevel: 1,
        uiPosition: {
            left: -2,
            top: 8,
        },
        icon: {
            color: 'rgba(180, 180, 180, 1)'
        },
        unlockCondition: () => {
            return true;
        },
        unlockBySkills: [{ id: "skill_routine_training_1", level: 1 },{ id: "skill_physical_talents", level: 1 }],
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'learning_rate': {
                        A: 0.025,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'skill-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        modifierGroupId: 'general_learn_rate',
        get_cost: () => ({
            'skill-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('skill_routine_training_1', {
        tags: ["skill", "upgrade", "purchaseable"],
        name: 'Routine Training',
        description: 'Increase mental training learning speed',
        level: 0,
        maxLevel: 3,
        uiPosition: {
            left: -4,
            top: 7,
        },
        icon: {
            color: 'rgb(60, 110, 60)'
        },
        unlockCondition: () => {
            return true;
        },
        unlockBySkills: [{ id: "skill_general_training_9", level: 1 },{ id: "skill_general_training_10", level: 1 }],
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'routine_learning_speed': {
                        A: 0.05,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'skill-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        modifierGroupId: 'routine_learn_rate',
        get_cost: () => ({
            'skill-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('skill_general_training_10', {
        tags: ["skill", "upgrade", "purchaseable"],
        name: 'General Training',
        description: 'Increase general training learning speed',
        level: 0,
        maxLevel: 1,
        uiPosition: {
            left: -6,
            top: 6,
        },
        icon: {
            color: 'rgba(180, 180, 180, 1)'
        },
        unlockCondition: () => {
            return true;
        },
        unlockBySkills: [{ id: "skill_routine_training_1", level: 1 },{ id: "skill_routine_training_2", level: 1 }],
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'learning_rate': {
                        A: 0.025,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'skill-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        modifierGroupId: 'general_learn_rate',
        get_cost: () => ({
            'skill-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('skill_routine_training_2', {
        tags: ["skill", "upgrade", "purchaseable"],
        name: 'Routine Training',
        description: 'Increase mental training learning speed',
        level: 0,
        maxLevel: 3,
        uiPosition: {
            left: -7,
            top: 4,
        },
        icon: {
            color: 'rgb(60, 110, 60)'
        },
        unlockCondition: () => {
            return true;
        },
        unlockBySkills: [{ id: "skill_general_training_11", level: 1 },{ id: "skill_general_training_10", level: 1 }],
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'routine_learning_speed': {
                        A: 0.05,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'skill-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        modifierGroupId: 'routine_learn_rate',
        get_cost: () => ({
            'skill-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('skill_general_training_11', {
        tags: ["skill", "upgrade", "purchaseable"],
        name: 'General Training',
        description: 'Increase general training learning speed',
        level: 0,
        maxLevel: 1,
        uiPosition: {
            left: -8,
            top: 2,
        },
        icon: {
            color: 'rgba(180, 180, 180, 1)'
        },
        unlockCondition: () => {
            return true;
        },
        unlockBySkills: [{ id: "skill_intense_training", level: 1 },{ id: "skill_routine_training_2", level: 1 }],
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'learning_rate': {
                        A: 0.025,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'skill-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        modifierGroupId: 'general_learn_rate',
        get_cost: () => ({
            'skill-points': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })

}