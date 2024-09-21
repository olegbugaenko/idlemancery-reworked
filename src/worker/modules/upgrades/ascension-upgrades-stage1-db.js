import { gameEntity, gameEffects } from "game-framework"

export const registerAscensionUpgradesStage1 = () => {



    gameEntity.registerGameEntity('upgrade_ascension_more_space', {
        tags: ["ascension", "basic"],
        name: 'Expansion',
        description: 'Reveal additional territory',
        level: 0,
        maxLevel: 5,
        resourceModifier: {
            income: {
                effects: {
                    'maxTerritory': {
                        A: 1,
                        B: 0,
                        type: 0,
                    }
                }
            }
        },
        unlockCondition: () => {
            return true
        },
        cost: {
            'dragon-egg': {
                A: 4,
                B: 10,
                type: 1
            }
        }
    })

    gameEntity.registerGameEntity('upgrade_ascension_dragon_power', {
        tags: ["ascension", "basic"],
        name: 'Dragon Power',
        description: 'Your dragon will become more powerful by reducing levelup requirements',
        level: 0,
        maxLevel: 5,
        resourceModifier: {
            multiplier: {
                effects: {
                    'dragon_levelup_requirement': {
                        A: 0.95,
                        B: 1,
                        type: 1,
                    }
                }
            }
        },
        unlockCondition: () => {
            return true
        },
        cost: {
            'dragon-egg': {
                A: 4,
                B: 10,
                type: 1
            }
        }
    })

    gameEntity.registerGameEntity('upgrade_ascension_head_start', {
        tags: ["ascension", "basic"],
        name: 'Head Start',
        description: 'Improves basic resources income',
        level: 0,
        maxLevel: 5,
        resourceModifier: {
            multiplier: {
                resources: {
                    'meat': {
                        A: 1.25,
                        B: 1,
                        type: 1,
                    },
                    'wood': {
                        A: 1.25,
                        B: 1,
                        type: 1,
                    },
                    'stone': {
                        A: 1.25,
                        B: 1,
                        type: 1,
                    },
                    'hide': {
                        A: 1.25,
                        B: 1,
                        type: 1,
                    },
                    'science': {
                        A: 1.25,
                        B: 1,
                        type: 1,
                    }
                }
            }
        },
        unlockCondition: () => {
            return true
        },
        cost: {
            'dragon-egg': {
                A: 2,
                B: 10,
                type: 1
            }
        }
    })

    gameEntity.registerGameEntity('upgrade_ascension_artisans', {
        tags: ["ascension", "basic"],
        name: 'Dragon Artisans',
        description: 'Improves crafting efficiency',
        level: 0,
        maxLevel: 5,
        unlockCondition: () => gameEntity.getLevel('upgrade_ascension_head_start') > 0,
        resourceModifier: {
            multiplier: {
                effects: {
                    craftEfficiency: {
                        A: 1.2,
                        B: 1,
                        type: 1
                    }
                }
            }
        },
        cost: {
            'dragon-egg': {
                A: 2,
                B: 40,
                type: 1
            }
        }
    })
}