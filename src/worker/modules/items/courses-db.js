import {gameEffects, gameEntity} from "game-framework";

export const registerCourse = (id, options, learningModifier) => {
    //id, options - for course entity
    const origTags = [...(options.tags || [])];
    options.tags = [
        ...origTags,
        'course'
    ]

    const learningTags = [
        ...origTags,
        'course-learning'
    ]

    const learningOptions = {
        name: `Learning ${options.name}`,
        tags: learningTags,
        resourceModifier: learningModifier,
        attributes: {
            learningEntityId: id,
        }
    }

    gameEntity.registerGameEntity(id, {
        ...options,
        learningEntity: learningOptions,
    })
}

export const registerCourseItemsStage1 = () => {

    registerCourse('course_body_capability', {
        name: 'Body Capability',
        tags: ['physical', 'enchancement'],
        attributes: {
            basicDuration: 60,
        },
        level: 0,
        unlockCondition: () => gameEntity.getLevel('shop_item_training_room') > 0,
        resourceModifier: {
            capMult: {
                resources: {
                    /*'energy': {
                        A: 0.1,
                        B: 1,
                        type: 0,
                    },*/
                    'health': {
                        A: 0.1,
                        B: 1,
                        type: 0,
                    }
                }
            },
        }
    }, {
        get_consumption: () => ({
            resources: {
                /*'energy': {
                    A: 1.1,
                    B: 50,
                    type: 1,
                },*/
                'knowledge': {
                    A: 1.1,
                    B: 15/gameEffects.getEffectValue('courses_knowledge_discount'),
                    type: 1,
                }
            }
        }),
        effectDeps: ['courses_knowledge_discount']
    })

    registerCourse('course_mind_improvement', {
        name: 'Improved Mind',
        tags: ['mental', 'enchancement'],
        attributes: {
            basicDuration: 60,
        },
        level: 0,
        unlockCondition: () => gameEntity.getLevel('shop_item_training_room') > 0,
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
        }
    }, {
        get_consumption: () => ({
            resources: {
                /*'coins': {
                    A: 1.1,
                    B: 5000,
                    type: 1,
                },*/
                'knowledge': {
                    A: 1.1,
                    B: 30/gameEffects.getEffectValue('courses_knowledge_discount'),
                    type: 1,
                }
            }
        }),
        effectDeps: ['courses_knowledge_discount']
    })


    registerCourse('course_coins_improvement', {
        name: 'Work Ethic',
        tags: ['social', 'enchancement'],
        attributes: {
            basicDuration: 60,
        },
        level: 0,
        unlockCondition: () => gameEntity.getLevel('shop_item_training_room') > 0,
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
        }
    }, {
        get_consumption: () => ({
            resources: {
                /*'energy': {
                    A: 1.1,
                    B: 50,
                    type: 1,
                },*/
                'knowledge': {
                    A: 1.1,
                    B: 30/gameEffects.getEffectValue('courses_knowledge_discount'),
                    type: 1,
                }
            }
        }),
        effectDeps: ['courses_knowledge_discount'],
    })


    registerCourse('course_navigation', {
        name: 'Improved Navigation',
        tags: ['mental', 'enchancement'],
        attributes: {
            basicDuration: 60,
        },
        level: 0,
        unlockCondition: () => gameEntity.getLevel('shop_item_training_room') > 0,
        resourceModifier: {
            multiplier: {
                resources: {
                    'gathering_perception': {
                        A: 0.05,
                        B: 1,
                        type: 0,
                    }
                }
            },
        }
    }, {
        get_consumption: () => ({
            resources: {
                /*'coins': {
                    A: 1.1,
                    B: 5000,
                    type: 1,
                },*/
                'knowledge': {
                    A: 1.1,
                    B: 50/gameEffects.getEffectValue('courses_knowledge_discount'),
                    type: 1,
                }
            }
        }),
        effectDeps: ['courses_knowledge_discount']
    })


    registerCourse('course_strength_intensity', {
        name: 'Physical Practices',
        tags: ['physical', 'enchancement'],
        attributes: {
            basicDuration: 120,
        },
        level: 0,
        unlockCondition: () => gameEntity.getLevel('shop_item_breaking_limits') > 0,
        resourceModifier: {
            multiplier: {
                effects: {
                    'aspect_attribute_strength_reduction': {
                        A: 0.05,
                        B: 1,
                        type: 0,
                    }
                }
            },
        }
    }, {
        get_consumption: () => ({
            resources: {
                /*'health': {
                    A: 1.1,
                    B: 100,
                    type: 1,
                },*/
                'knowledge': {
                    A: 1.1,
                    B: 30/gameEffects.getEffectValue('courses_knowledge_discount'),
                    type: 1,
                }
            }
        }),
        effectDeps: ['courses_knowledge_discount'],
    })


    registerCourse('course_patience_intensity', {
        name: 'Concentration',
        tags: ['mental', 'enchancement'],
        attributes: {
            basicDuration: 120,
        },
        level: 0,
        unlockCondition: () => gameEntity.getLevel('shop_item_breaking_limits') > 0,
        resourceModifier: {
            multiplier: {
                effects: {
                    'aspect_attribute_patience_reduction': {
                        A: 0.05,
                        B: 1,
                        type: 0,
                    }
                }
            },
        }
    }, {
        get_consumption: () => ({
            resources: {
                /*'energy': {
                    A: 1.1,
                    B: 150,
                    type: 1,
                },*/
                'knowledge': {
                    A: 1.1,
                    B: 40/gameEffects.getEffectValue('courses_knowledge_discount'),
                    type: 1,
                }
            }
        }),
        effectDeps: ['courses_knowledge_discount'],
    })


    registerCourse('course_charisma_intensity', {
        name: 'Influence Training',
        tags: ['social', 'enchancement'],
        attributes: {
            basicDuration: 120,
        },
        level: 0,
        unlockCondition: () => gameEntity.getLevel('shop_item_breaking_limits') > 0,
        resourceModifier: {
            multiplier: {
                effects: {
                    'aspect_attribute_charisma_reduction': {
                        A: 0.05,
                        B: 1,
                        type: 0,
                    }
                }
            },
        }
    }, {
        get_consumption: () => ({
            resources: {
                /*'coins': {
                    A: 1.1,
                    B: 10000,
                    type: 1,
                },*/
                'knowledge': {
                    A: 1.1,
                    B: 40/gameEffects.getEffectValue('courses_knowledge_discount'),
                    type: 1,
                }
            }
        }),
        effectDeps: ['courses_knowledge_discount'],
    })



    registerCourse('course_mental_focus_training', {
        name: 'Mental Focus Training',
        tags: ['mental', 'reductive'],
        attributes: {
            basicDuration: 120,
        },
        level: 0,
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_clarity',
            level: 25
        }],
        unlockCondition: () => true,
        resourceModifier: {
            multiplier: {
                effects: {
                    'courses_knowledge_discount': {
                        A: 0.1,
                        B: 1,
                        C: 1.02,
                        type: 3,
                    }
                }
            },
        }
    }, {
        get_consumption: () => ({
            resources: {
                /*'energy': {
                    A: 1.1,
                    B: 1000,
                    type: 1,
                },*/
                'mental_energy': {
                    A: 1.1,
                    B: 1,
                    type: 1,
                }
            }
        }),
    })



    registerCourse('course_art_of_persuasion', {
        name: 'Art of Persuasion',
        tags: ['social', 'reductive'],
        attributes: {
            basicDuration: 120,
        },
        level: 0,
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_clarity',
            level: 25
        }],
        unlockCondition: () => true,
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    'social_actions_discount': {
                        A: 0.2*gameEffects.getEffectValue('reductive_courses_power'),
                        B: 1,
                        C: 1.01,
                        type: 3,
                    }
                }
            }),
            effectDeps: ['reductive_courses_power']
        }
    }, {
        get_consumption: () => ({
            resources: {
               /* 'energy': {
                    A: 1.1,
                    B: 1000,
                    type: 1,
                },*/
                'mental_energy': {
                    A: 1.1,
                    B: 1,
                    type: 1,
                }
            }
        }),
    })

    registerCourse('course_physical_efficiency', {
        name: 'Physical Efficiency',
        tags: ['physical', 'reductive'],
        attributes: {
            basicDuration: 120,
        },
        level: 0,
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_clarity',
            level: 25
        }],
        unlockCondition: () => true,
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    'physical_actions_discount': {
                        A: 0.2*gameEffects.getEffectValue('reductive_courses_power'),
                        B: 1,
                        C: 1.01,
                        type: 3,
                    }
                }
            }),
            effectDeps: ['reductive_courses_power']
        }
    }, {
        get_consumption: () => ({
            resources: {
                /*'energy': {
                    A: 1.1,
                    B: 1000,
                    type: 1,
                },*/
                'mental_energy': {
                    A: 1.1,
                    B: 1,
                    type: 1,
                }
            }
        }),
    });

    registerCourse('course_cognitive_focus', {
        name: 'Cognitive Focus',
        tags: ['mental', 'reductive'],
        attributes: {
            basicDuration: 130,
        },
        level: 0,
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_clarity',
            level: 25
        }],
        unlockCondition: () => true,
        resourceModifier: {
            get_multiplier: () =>({
                effects: {
                    'mental_actions_discount': {
                        A: 0.2*gameEffects.getEffectValue('reductive_courses_power'),
                        B: 1,
                        C: 1.01,
                        type: 3,
                    }
                }
            }),
            effectDeps: ['reductive_courses_power']
        }
    }, {
        get_consumption: () => ({
            resources: {
                /*'energy': {
                    A: 1.1,
                    B: 1000,
                    type: 1,
                },*/
                'mental_energy': {
                    A: 1.1,
                    B: 1,
                    type: 1,
                }
            }
        }),
    });


}