import { gameEntity, gameCore, gameEffects } from "game-framework"

export const registerSkillsStage1 = () => {

    gameEntity.registerGameEntity('skill_scholar', {
        tags: ["skill", "upgrade", "purchaseable"],
        name: 'Scholar',
        description: 'Increase your learning ability',
        level: 0,
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

    gameEntity.registerGameEntity('skill_energizer', {
        tags: ["skill", "upgrade", "purchaseable"],
        name: 'Energizer',
        description: 'Increase your stamina',
        level: 0,
        unlockCondition: () => {
            return true;
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'attribute_stamina': {
                        A: 0.05,
                        B: 1,
                        type: 0,
                    }
                }
            },
            capMult: {
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

    gameEntity.registerGameEntity('skill_treasurer', {
        tags: ["skill", "upgrade", "purchaseable"],
        name: 'Treasurer',
        description: 'Increase your coins cap',
        level: 0,
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

    gameEntity.registerGameEntity('skill_oak_heart', {
        tags: ["skill", "upgrade", "purchaseable"],
        name: 'Oak Heart',
        description: 'Increase your HP regen',
        level: 0,
        unlockCondition: () => {
            // console.log('ACTLVL: ', )
            return gameEntity.getLevel('action_pushup') > 1
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
            capMult: {
                resources: {
                    'health': {
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
        description: 'Increase your HP regen',
        level: 0,
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
}