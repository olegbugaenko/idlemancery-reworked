import { gameEntity, gameCore, gameEffects, gameResources } from "game-framework"

export const registerActionsStage1 = () => {

    gameEntity.registerGameEntity('action_walk', {
        tags: ["action", "training", "physical"],
        name: 'Walking',
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Perform some walking exercises to improve your stamina',
        level: 1,
        resourceModifier: {
            income: {
                effects: {
                    'attribute_stamina': {
                        A: 1,
                        B: 0,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'energy': {
                        A: 0,
                        B: 0.05,
                        type: 0
                    }
                }
            },
            effectDeps: ['attribute_strength', 'walking_learning_rate']
        },
        getLearnRate: () => {
            return gameEffects.getEffectValue('walking_learning_rate')
        },
        unlockCondition: () => {
            return true
        },
        attributes: {
            baseXPCost: 10,
        }
    })

    gameEntity.registerGameEntity('action_visit_city', {
        tags: ["action", "training", "physical"],
        name: 'Visit City',
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Visit city to find new jobs and opportunities',
        level: 1,
        maxLevel: 2,
        unlockCondition: () => {
            return gameEntity.getLevel('action_walk') > 1
        },
        attributes: {
            baseXPCost: 10,
        }
    })

    gameEntity.registerGameEntity('action_beggar', {
        tags: ["action", "job", "physical"],
        name: 'Beggar',
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Strange over city streets hoping for someones help',
        level: 1,
        resourceModifier: {
            get_income: () => ({
                resources: {
                    'coins': {
                        A: 0.005*(0.9 + 0.1*gameEffects.getEffectValue('attribute_charisma'))*gameEffects.getEffectValue('begging_efficiency'),
                        B: 0.045*(0.9 + 0.1*gameEffects.getEffectValue('attribute_charisma'))*gameEffects.getEffectValue('begging_efficiency'),
                        type: 0,
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    'energy': {
                        A: 0,
                        B: 0.2*(0.9 + 0.1*gameEffects.getEffectValue('attribute_charisma')),
                        type: 0,
                    }
                }
            }),
            effectDeps: ['attribute_charisma', 'begging_efficiency']
        },
        unlockCondition: () => {
            return gameEntity.getLevel('action_visit_city') > 1
        },
        attributes: {
            baseXPCost: 20,
        }
    })

    gameEntity.registerGameEntity('action_clean_stable', {
        tags: ["action", "job", "physical"],
        name: 'Clean Stable',
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Clean Stables to earn some gold',
        level: 1,
        resourceModifier: {
            get_income: () => ({
                resources: {
                    'coins': {
                        A: 0.03*(0.9 + 0.1*gameEffects.getEffectValue('attribute_strength'))*gameEffects.getEffectValue('clean_stable_efficiency'),
                        B: 0.22*(0.9 + 0.1*gameEffects.getEffectValue('attribute_strength'))*gameEffects.getEffectValue('clean_stable_efficiency'),
                        type: 0,
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    'energy': {
                        A: 0.0,
                        B: (0.9 + 0.1*gameEffects.getEffectValue('attribute_strength')),
                        type: 0,
                    },
                    'health': {
                        A: 0.0,
                        B: 1.5*(0.09 + 0.01*gameEffects.getEffectValue('attribute_strength')),
                        type: 0,
                    }
                }
            }),
            effectDeps: ['attribute_strength']
        },
        unlockCondition: () => {
            return gameEntity.getLevel('action_pushup') > 4
        },
        attributes: {
            baseXPCost: 20,
        }
    })


    gameEntity.registerGameEntity('action_rest', {
        tags: ["action", "rest", "physical"],
        name: 'Rest in Tavern',
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Pay some gold to rest in tavern',
        level: 1,
        getLearnRate: () => {
            return 0;
        },
        resourceModifier: {
            get_income: () => ({
                resources: {
                    'energy': {
                        A: 1.0,
                        B: 0,
                        type: 0,
                    },
                    'health': {
                        A: 0.1,
                        B: 0,
                        type: 0,
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    'coins': {
                        A: 0.0,
                        B: 0.2,
                        type: 0,
                    }
                }
            }),
            effectDeps: ['attribute_strength']
        },
        unlockCondition: () => {
            return gameEntity.getLevel('action_visit_city') > 1 && gameEntity.getLevel('shop_item_tent') < 1
        },
        attributes: {
            baseXPCost: 1.e+10,
        }
    })

    gameEntity.registerGameEntity('action_rest_home', {
        tags: ["action", "rest", "physical"],
        name: 'Rest at home',
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Stay at your sweet home to heal and recover',
        level: 1,
        getLearnRate: () => {
            return 0;
        },
        resourceModifier: {
            get_income: () => ({
                resources: {
                    'energy': {
                        A: 1.0*gameEffects.getEffectValue('rest_efficiency'),
                        B: 0,
                        type: 0,
                    },
                    'health': {
                        A: 0.1*gameEffects.getEffectValue('rest_efficiency'),
                        B: 0,
                        type: 0,
                    }
                }
            }),
            effectDeps: ['rest_efficiency']
        },
        unlockCondition: () => {
            return gameEntity.getLevel('action_visit_city') > 1 && gameEntity.getLevel('shop_item_tent') >= 1
        },
        attributes: {
            baseXPCost: 1.e+10,
        }
    })


    gameEntity.registerGameEntity('action_gossip', {
        tags: ["action", "training", "mental"],
        name: 'Gossip',
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Spend some time communicating with people about news and other things. Improves your charisma',
        level: 1,
        resourceModifier: {
            income: {
                effects: {
                    'attribute_charisma': {
                        A: 1,
                        B: 0,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'energy': {
                        A: 0,
                        B: 0.1,
                        type: 0
                    }
                }
            },
            effectDeps: []
        },
        unlockCondition: () => {
            // console.log('Beggar level: ', gameEntity.getLevel('action_beggar'));
            return gameEntity.getLevel('action_beggar') > 4
        },
        attributes: {
            baseXPCost: 50,
            isTraining: true,
        }
    })

    gameEntity.registerGameEntity('action_pushup', {
        tags: ["action", "training", "physical"],
        name: 'Push Up',
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Perform some simple physical exercises to become stronger',
        level: 1,
        resourceModifier: {
            income: {
                effects: {
                    'attribute_strength': {
                        A: 1,
                        B: 0,
                        type: 0,
                    },
                    'attribute_vitality': {
                        A: 1,
                        B: 0,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'energy': {
                        A: 0,
                        B: 0.25,
                        type: 0
                    }
                }
            },
            effectDeps: [],
            reourcesToReassert: ['health']
        },
        unlockCondition: () => {
            return gameEntity.getLevel('action_walk') > 19
        },
        attributes: {
            baseXPCost: 50,
            isTraining: true,
        }
    })

    gameEntity.registerGameEntity('action_read_motivation_book', {
        tags: ["action", "training", "mental"],
        name: 'Read book of Motivation',
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Read book of motivation, containing some useful advices regarding self-development',
        level: 1,
        maxLevel: 10,
        resourceModifier: {
            multiplier: {
                effects: {
                    'learning_rate': {
                        A: 0.1,
                        B: 0.9,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'energy': {
                        A: 0,
                        B: 0.4,
                        type: 0
                    }
                }
            },
            effectDeps: []
        },
        unlockCondition: () => {
            // console.log('Beggar level: ', gameEntity.getLevel('action_beggar'));
            return gameEntity.getLevel('shop_item_book_of_motivation') > 0
        },
        attributes: {
            baseXPCost: 50,
            isTraining: true,
        }
    })

    gameEntity.registerGameEntity('action_gather_berries', {
        tags: ["action", "gathering", "routine"],
        name: 'Gather Berries',
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Spend some time walking in nearby forest and collecting berries',
        level: 1,
        resourceModifier: {
            get_income: () => ({
                resources: {
                    'inventory_berry': {
                        A: 0.001*(0.9 + 0.1*gameEffects.getEffectValue('attribute_patience'))*gameEffects.getEffectValue('gathering_efficiency'),
                        B: 0.009*(0.9 + 0.1*gameEffects.getEffectValue('attribute_patience'))*gameEffects.getEffectValue('gathering_efficiency'),
                        type: 0,
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    'energy': {
                        A: 0,
                        B: (0.9 + 0.1*gameEffects.getEffectValue('attribute_patience')),
                        type: 0,
                    }
                }
            }),
            effectDeps: ['attribute_patience', 'gathering_efficiency']
        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0
        },
        attributes: {
            baseXPCost: 50,
        }
    })

    gameEntity.registerGameEntity('action_read_books', {
        tags: ["action", "activity", "mental"],
        name: 'Read Books',
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Read books to find new information and increase your knowledge',
        level: 1,
        getLearnRate: () => {
            return gameEffects.getEffectValue('books_learning_rate')
        },
        resourceModifier: {
            get_income: () => ({
                resources: {
                    'knowledge': {
                        A: 0.001*gameEffects.getEffectValue('read_books_efficiency'),
                        B: 0.009*gameEffects.getEffectValue('read_books_efficiency'),
                        type: 0,
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    'energy': {
                        A: 0.0,
                        B: 1,
                        type: 0,
                    },
                    'coins': {
                        A: 0.0,
                        B: 1.5,
                        type: 0,
                    }
                }
            }),
            effectDeps: ['read_books_efficiency']
        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_library_entrance') > 0
        },
        attributes: {
            baseXPCost: 50,
        }
    })


    gameEntity.registerGameEntity('action_yoga_practices', {
        tags: ["action", "training", "mental"],
        name: 'Yoga Practice',
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Practice yoga to train your patience and stamina',
        level: 1,
        resourceModifier: {
            get_income: () => ({
                effects: {
                    'attribute_patience': {
                        A: 1,
                        B: -1,
                        type: 0,
                    },
                    'attribute_stamina': {
                        A: 0.5,
                        B: -0.5,
                        type: 0,
                    }

                }
            }),
            get_consumption: () => ({
                resources: {
                    'energy': {
                        A: 0.0,
                        B: 2,
                        type: 0,
                    },
                    'knowledge': {
                        A: 0.0,
                        B: 0.05,
                        type: 0,
                    }
                }
            }),
            effectDeps: ['read_books_efficiency']
        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_yoga_manual') > 0
        },
        attributes: {
            baseXPCost: 50,
            displayPerLevel: 1,
        }
    })

    gameEntity.registerGameEntity('action_home_errands', {
        tags: ["action", "activity", "routine"],
        name: 'Home Errands',
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Clean your house, organize things to free more space for coins storage',
        level: 1,
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    'coins_cap_bonus': {
                        A: 0.05,
                        B: 1,
                        type: 0,
                    },

                }
            }),
            get_consumption: () => ({
                resources: {
                    'energy': {
                        A: 0.0,
                        B: 3,
                        type: 0,
                    }
                }
            }),
        },
        unlockCondition: () => {
            return gameEffects.getEffectValue('attribute_patience') >= 5
        },
        attributes: {
            baseXPCost: 50,
        }
    })


    gameEntity.registerGameEntity('action_learn_anatomy', {
        tags: ["action", "training", "mental"],
        name: 'Learn Anatomy',
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Lear anatomy to better understand your body and improve your health regeneration',
        level: 1,
        getLearnRate: () => {
            return gameEffects.getEffectValue('books_learning_rate')
        },
        resourceModifier: {
            get_income: () => ({
                effects: {
                    'attribute_recovery': {
                        A: 0.2,
                        B: -0.2,
                        type: 0,
                    },
                    'attribute_stamina': {
                        A: 3,
                        B: -3,
                        type: 0,
                    }

                }
            }),
            get_consumption: () => ({
                resources: {
                    'energy': {
                        A: 0.0,
                        B: 1,
                        type: 0,
                    },
                    'knowledge': {
                        A: 0.0,
                        B: 0.25,
                        type: 0,
                    }
                }
            }),
            effectDeps: ['read_books_efficiency']
        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_anatomy_book') > 0
        },
        attributes: {
            baseXPCost: 50,
            displayPerLevel: 1,
        }
    })

    gameEntity.registerGameEntity('action_learn_languages', {
        tags: ["action", "training", "mental"],
        name: 'Learn Languages',
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Lear ancient languages to increase book reading related XP',
        level: 1,
        resourceModifier: {
            get_income: () => ({
                effects: {
                    'books_learning_rate': {
                        A: 0.1,
                        B: -0.1,
                        type: 0,
                    },
                    'attribute_memory': {
                        A: 0.5,
                        B: -0.5,
                        type: 0,
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    'energy': {
                        A: 0.0,
                        B: 2,
                        type: 0,
                    },
                    'knowledge': {
                        A: 0.0,
                        B: 0.25,
                        type: 0,
                    }
                }
            }),
            effectDeps: ['read_books_efficiency']
        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_vocabulary') > 0
        },
        attributes: {
            baseXPCost: 50,
            displayPerLevel: 1,
        }
    })

    gameEntity.registerGameEntity('action_endurance_training', {
        tags: ["action", "training", "physical"],
        name: 'Train Endurance',
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Take some exercises in local gym to improve your body',
        level: 1,
        resourceModifier: {
            get_income: () => ({
                effects: {
                    'attribute_recovery': {
                        A: 0.5,
                        B: -0.5,
                        type: 0,
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    'energy': {
                        A: 0.0,
                        B: 2,
                        type: 0,
                    },
                    'coins': {
                        A: 0.0,
                        B: 3,
                        type: 0,
                    }
                }
            }),
            effectDeps: ['read_books_efficiency']
        },
        unlockCondition: () => {
            return gameResources.getResource('health').cap >= 20
        },
        attributes: {
            baseXPCost: 50,
            displayPerLevel: 1,
        }
    })


    gameEntity.registerGameEntity('action_deeper_forest', {
        tags: ["action", "gathering", "routine"],
        name: 'Walking in Forest',
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'More dangerous activity, but searching for plants in less accessible places can pay off',
        level: 1,
        resourceModifier: {
            get_income: () => ({
                resources: {
                    'inventory_berry': {
                        A: 0.004*(0.9 + 0.1*gameEffects.getEffectValue('attribute_patience'))*gameEffects.getEffectValue('gathering_efficiency'),
                        B: 0.036*(0.9 + 0.1*gameEffects.getEffectValue('attribute_patience'))*gameEffects.getEffectValue('gathering_efficiency'),
                        type: 0,
                    },
                    'inventory_fly_mushroom': {
                        A: 0.001*(0.9 + 0.1*gameEffects.getEffectValue('attribute_patience'))*gameEffects.getEffectValue('gathering_efficiency'),
                        B: 0.009*(0.9 + 0.1*gameEffects.getEffectValue('attribute_patience'))*gameEffects.getEffectValue('gathering_efficiency'),
                        type: 0,
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    'energy': {
                        A: 0.0,
                        B: 2*(0.9 + 0.1*gameEffects.getEffectValue('attribute_patience')),
                        type: 0,
                    },
                    'health': {
                        A: 0.0,
                        B: 0.5*(0.9 + 0.1*gameEffects.getEffectValue('attribute_patience')),
                        type: 0,
                    }
                }
            }),
            effectDeps: ['attribute_patience', 'gathering_efficiency']
        },
        unlockCondition: () => {
            return gameResources.getResource('health').cap >= 20
        },
        attributes: {
            baseXPCost: 50,
        }
    })

}