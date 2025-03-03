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



    gameEntity.registerGameEntity('skill_metabolism', {
        tags: ["skill", "upgrade", "purchaseable"],
        name: 'Metabolism',
        description: 'Increase potions and herbs consumption effects (Affect both negative and positive ones)',
        level: 0,
        unlockCondition: () => {
            // console.log('ACTLVL: ', )
            return gameEntity.getLevel('shop_item_backpack') >= 1
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'metabolism_rate': {
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


    gameEntity.registerGameEntity('skill_merchant', {
        tags: ["skill", "upgrade", "purchaseable"],
        name: 'Merchant',
        description: 'Increase amount of items you can sell',
        level: 0,
        unlockCondition: () => {
            // console.log('ACTLVL: ', )
            return gameEntity.getLevel('shop_item_backpack') >= 1
        },
        attributes: {
            isCollectable: false,
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


    gameEntity.registerGameEntity('skill_highbrow', {
        tags: ["skill", "upgrade", "purchaseable"],
        name: 'Highbrow',
        description: 'Increase your knowledge capacity and regeneration',
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

    gameEntity.registerGameEntity('skill_sorcer', {
        tags: ["skill", "upgrade", "purchaseable"],
        name: 'Sorcer',
        description: 'Increase your mana regen and capacity',
        level: 0,
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