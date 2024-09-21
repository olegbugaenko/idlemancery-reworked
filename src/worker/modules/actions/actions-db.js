import { gameEntity, gameCore, gameEffects } from "game-framework"

export const registerActionsStage1 = () => {


    gameEntity.registerGameEntity('action_beggar', {
        tags: ["action", "job", "physical"],
        name: 'Beggar',
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Strange over city streets hoping for someones help',
        level: 0,
        resourceModifier: {
            get_income: () => ({
                resources: {
                    'coins': {
                        A: 0.005*(0.9 + 0.1*gameEffects.getEffectValue('attribute_charisma')),
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
            effectDeps: ['attribute_charisma']
        },
        unlockCondition: () => {
            return true
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
        level: 0,
        resourceModifier: {
            get_income: () => ({
                resources: {
                    'coins': {
                        A: 0.01*(0.9 + 0.1*gameEffects.getEffectValue('attribute_strength')),
                        B: 0.09,
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
                    }
                }
            }),
            effectDeps: ['attribute_strength']
        },
        unlockCondition: () => {
            return true
        },
        attributes: {
            baseXPCost: 20,
        }
    })

    gameEntity.registerGameEntity('action_walk', {
        tags: ["action", "training", "physical"],
        name: 'Walking',
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Perform some walking exercises to improve your stamina',
        level: 0,
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
            effectDeps: ['attribute_strength']
        },
        unlockCondition: () => {
            return true
        },
        attributes: {
            baseXPCost: 10,
        }
    })

    gameEntity.registerGameEntity('action_gossip', {
        tags: ["action", "training", "mental"],
        name: 'Gossip',
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Spend some time communicating with people about news and other things. Improves your charisma',
        level: 0,
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
            console.log('Beggar level: ', gameEntity.getLevel('action_beggar'));
            return gameEntity.getLevel('action_beggar') > 4
        },
        attributes: {
            baseXPCost: 50,
        }
    })

    gameEntity.registerGameEntity('action_pushup', {
        tags: ["action", "training", "physical"],
        name: 'Push Up',
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Perform some simple physical exercises to become stronger',
        level: 0,
        resourceModifier: {
            income: {
                effects: {
                    'attribute_strength': {
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
            return gameEntity.getLevel('action_clean_stable') > 4
        },
        attributes: {
            baseXPCost: 50,
        }
    })

}