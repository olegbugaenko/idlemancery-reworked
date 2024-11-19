import { gameEntity, gameCore, gameEffects } from "game-framework"

export const registerGuilds = () => {

    gameEntity.registerGameEntity('guild_merchants_permanent', {
        tags: ["guild-bonus", "permanent"],
        name: 'Merchants Reputation',
        description: '',
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
                        A: 0.05,
                        B: 1,
                        type: 0,
                    }
                }
            },
        },
    })

    gameEntity.registerGameEntity('guild_merchants', {
        tags: ["guild", "purchaseable"],
        name: 'Merchants Guild',
        description: 'Enter merchants guild to become better in understanding how to earn and invest your coins.',
        level: 0,
        unlockCondition: () => {
            return true;
        },
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_charisma',
            level: 500
        }],
        attributes: {
            isCollectable: false,
            icon_id: 'merchants_guild',
            permaBonusId: 'guild_merchants_permanent'
        },
        resourceModifier: {
            income: {
                resources: {
                    'guild-points': {
                        A: 1,
                        B: -1,
                        type: 0,
                        min: 0,
                    }
                }
            },
            multiplier: {
                resources: {
                    'coins': {
                        A: 0.04,
                        B: 1,
                        type: 0,
                    }
                }
            },
            capMult: {
                resources: {
                    'coins': {
                        A: 0.04,
                        B: 1,
                        type: 0,
                    }
                }
            },
            rawCap: {
                resources: {
                    'guild_reputation': {
                        A: 1.5,
                        B: 100,
                        C: -100,
                        type: 1,
                    },
                }
            }
        },
        get_cost: () => ({
            'guild_reputation': {
                A: 1.5,
                B: 100,
                C: -100,
                type: 1,
            }
        })
    })


    gameEntity.registerGameEntity('guild_scholars_permanent', {
        tags: ["guild-bonus", "permanent"],
        name: 'Scholars Reputation',
        description: '',
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
            capMult: {
                resources: {
                    'knowledge': {
                        A: 0.05,
                        B: 1,
                        type: 0,
                    }
                }
            },
        },
    })

    gameEntity.registerGameEntity('guild_scholars', {
        tags: ["guild", "purchaseable"],
        name: 'Scholars Guild',
        description: 'Become member of young scientists community.',
        level: 0,
        unlockCondition: () => {
            return true;
        },
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_charisma',
            level: 500
        }],
        attributes: {
            isCollectable: false,
            icon_id: 'scholars_guild',
            permaBonusId: 'guild_scholars_permanent'
        },
        resourceModifier: {
            income: {
                resources: {
                    'guild-points': {
                        A: 1,
                        B: -1,
                        type: 0,
                        min: 0,
                    }
                }
            },
            multiplier: {
                resources: {
                    'knowledge': {
                        A: 0.04,
                        B: 1,
                        type: 0,
                    }
                }
            },
            capMult: {
                resources: {
                    'knowledge': {
                        A: 0.04,
                        B: 1,
                        type: 0,
                    }
                }
            },
            rawCap: {
                resources: {
                    'guild_reputation': {
                        A: 1.5,
                        B: 100,
                        C: -100,
                        type: 1,
                    },
                }
            }
        },
        get_cost: () => ({
            'guild_reputation': {
                A: 1.5,
                B: 100,
                C: -100,
                type: 1,
            }
        })
    })



    gameEntity.registerGameEntity('guild_mages_permanent', {
        tags: ["guild-bonus", "permanent"],
        name: 'Mages Reputation',
        description: '',
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
        },
    })

    gameEntity.registerGameEntity('guild_mages', {
        tags: ["guild", "purchaseable"],
        name: 'Mages Guild',
        description: 'Become member of young scientists community.',
        level: 0,
        unlockCondition: () => {
            return true;
        },
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_charisma',
            level: 500
        }],
        attributes: {
            isCollectable: false,
            icon_id: 'mages_guild',
            permaBonusId: 'guild_mages_permanent'
        },
        resourceModifier: {
            income: {
                resources: {
                    'guild-points': {
                        A: 1,
                        B: -1,
                        type: 0,
                        min: 0,
                    }
                }
            },
            multiplier: {
                resources: {
                    'mana': {
                        A: 0.04,
                        B: 1,
                        type: 0,
                    }
                }
            },
            capMult: {
                resources: {
                    'mana': {
                        A: 0.04,
                        B: 1,
                        type: 0,
                    }
                }
            },
            rawCap: {
                resources: {
                    'guild_reputation': {
                        A: 1.5,
                        B: 100,
                        C: -100,
                        type: 1,
                    },
                }
            }
        },
        get_cost: () => ({
            'guild_reputation': {
                A: 1.5,
                B: 100,
                C: -100,
                type: 1,
            }
        })
    })


    gameEntity.registerGameEntity('guild_herbalists_permanent', {
        tags: ["guild-bonus", "permanent"],
        name: 'Herbalists Reputation',
        description: '',
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
                    'alchemy_ability': {
                        A: 0.05,
                        B: 1,
                        type: 0,
                    }
                },
                effects: {
                    'plantations_efficiency': {
                        A: 0.05,
                        B: 1,
                        type: 0,
                    }
                }
            }
        },
    })

    gameEntity.registerGameEntity('guild_herbalists', {
        tags: ["guild", "purchaseable"],
        name: 'Herbalists Guild',
        description: 'Reveal new alchemy opportunities by entering cauldron masters community.',
        level: 0,
        unlockCondition: () => {
            return true;
        },
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_charisma',
            level: 500
        }],
        attributes: {
            isCollectable: false,
            icon_id: 'herbalists_guild',
            permaBonusId: 'guild_herbalists_permanent'
        },
        resourceModifier: {
            income: {
                resources: {
                    'guild-points': {
                        A: 1,
                        B: -1,
                        type: 0,
                        min: 0,
                    }
                }
            },
            multiplier: {
                resources: {
                    'alchemy_ability': {
                        A: 0.05,
                        B: 1,
                        type: 0,
                    }
                },
                effects: {
                    'gathering_efficiency': {
                        A: 0.05,
                        B: 1,
                        type: 0,
                    }
                }
            },
            rawCap: {
                resources: {
                    'guild_reputation': {
                        A: 1.5,
                        B: 100,
                        C: -100,
                        type: 1,
                    },
                }
            }
        },
        get_cost: () => ({
            'guild_reputation': {
                A: 1.5,
                B: 100,
                C: -100,
                type: 1,
            }
        })
    })


    gameEntity.registerGameEntity('guild_artisans_permanent', {
        tags: ["guild-bonus", "permanent"],
        name: 'Artisans Reputation',
        description: '',
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
                    'crafting_ability': {
                        A: 0.05,
                        B: 1,
                        type: 0,
                    },
                },
                effects: {
                    'manual_labor_efficiency': {
                        A: 0.05,
                        B: 1,
                        type: 0,
                    }
                }
            }
        },
    })

    gameEntity.registerGameEntity('guild_artisans', {
        tags: ["guild", "purchaseable"],
        name: 'Artisans Guild',
        description: 'The Artisans Guild is a sanctuary of creativity and innovation, where members craft exquisite items and enhance their own bodies through artful modifications and enchanted designs. From intricate jewelry to empowered prosthetics, they blend beauty and functionality in everything they create. This guild embodies the pursuit of perfection in both craft and self-expression.',
        level: 0,
        unlockCondition: () => {
            return true;
        },
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_charisma',
            level: 500
        }],
        attributes: {
            isCollectable: false,
            icon_id: 'artisans_guild',
            permaBonusId: 'guild_artisans_permanent'
        },
        resourceModifier: {
            income: {
                resources: {
                    'guild-points': {
                        A: 1,
                        B: -1,
                        type: 0,
                        min: 0,
                    }
                }
            },
            multiplier: {
                resources: {
                    'crafting_ability': {
                        A: 0.05,
                        B: 1,
                        type: 0,
                    }
                },
                effects: {
                    'manual_labor_efficiency': {
                        A: 0.05,
                        B: 1,
                        type: 0,
                    }
                }
            },
            rawCap: {
                resources: {
                    'guild_reputation': {
                        A: 1.5,
                        B: 100,
                        C: -100,
                        type: 1,
                    },
                }
            }
        },
        get_cost: () => ({
            'guild_reputation': {
                A: 1.5,
                B: 100,
                C: -100,
                type: 1,
            }
        })
    })
}