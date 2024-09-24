import { gameEntity, gameCore, gameEffects } from "game-framework"

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
                        B: 0.045,
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
                        A: 0.02*(0.9 + 0.1*gameEffects.getEffectValue('attribute_strength'))*gameEffects.getEffectValue('clean_stable_efficiency'),
                        B: 0.18,
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
                        B: (0.09 + 0.01*gameEffects.getEffectValue('attribute_strength')),
                        type: 0,
                    }
                }
            }),
            effectDeps: ['attribute_strength']
        },
        unlockCondition: () => {
            return gameEntity.getLevel('action_pushup') > 1
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
            return gameEntity.getLevel('action_visit_city') > 1
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
            return gameEntity.getLevel('action_walk') > 14
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
                        B: 1,
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

}