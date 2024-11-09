import { gameEntity, gameCore, gameEffects } from "game-framework"

export const initSpellsDB1 = () => {

    gameEntity.registerGameEntity('spell_magic_insight', {
        name: 'Magic Insight',
        description: 'Use your magic capabilities to understand world better',
        hasCap: false,
        tags: ['spell', 'magic', 'mental', 'mental_magic'],
        defaultCap: 0,
        isAbstract: true,
        level: 1,
        onUse: (amount) => {

        },
        getUsageCooldown: () => {
            return 10;
        },
        usageGain: {
            get_income: () => ({
                resources: {
                    knowledge: {
                        A: 1.2,
                        B: 5,
                        type: 1,
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    mana: {
                        A: 1.5,
                        B: 3,
                        type: 1,
                    }
                }
            })
        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_spellbook') > 0
        },
        attributes: {
            xpOnCast: 20,
        }
    })

    gameEntity.registerGameEntity('spell_focus', {
        name: 'Focus',
        description: 'Improve your learning capabilities using magic',
        hasCap: false,
        tags: ['spell', 'magic', 'mental', 'mental_magic'],
        defaultCap: 0,
        isAbstract: true,
        level: 1,
        onUse: (amount) => {

        },
        getUsageCooldown: () => {
            return 10;
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    learning_rate: {
                        A: 0.1,
                        B: 1.4,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    mana: {
                        A: 1.5,
                        B: 1,
                        type: 1,
                    }
                }
            }
        },
        usageGain: {
            get_consumption: () => ({
                resources: {
                    mana: {
                        A: 1.5,
                        B: 2,
                        type: 1,
                    }
                }
            })
        },
        attributes: {
            duration: 10,
            xpOnCast: 20,
        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_spellbook') > 0
        },
    })

    gameEntity.registerGameEntity('spell_magic_recovery', {
        name: 'Less Magic Recovery',
        description: 'Heal yourself using magic',
        hasCap: false,
        tags: ['spell', 'magic', 'restoration', 'restoration_magic'],
        defaultCap: 0,
        isAbstract: true,
        level: 1,
        onUse: (amount) => {

        },
        getUsageCooldown: () => {
            return 10;
        },
        usageGain: {
            get_consumption: () => ({
                resources: {
                    mana: {
                        A: 1.5,
                        B: 4,
                        type: 1,
                    }
                }
            }),
            get_income: () => ({
                resources: {
                    health: {
                        A: 1.2,
                        B: 10*gameEffects.getEffectValue('restoration_spells_efficiency'),
                        type: 1,
                    }
                }
            })
        },
        attributes: {
            xpOnCast: 20,
        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_less_restoration') > 0
        },
    })


    gameEntity.registerGameEntity('spell_small_regeneration', {
        name: 'Less Magic Regeneration',
        description: 'Enchant your body for faster recovery',
        hasCap: false,
        tags: ['spell', 'magic', 'restoration', 'restoration_magic'],
        defaultCap: 0,
        isAbstract: true,
        level: 1,
        onUse: (amount) => {

        },
        getUsageCooldown: () => {
            return 10;
        },
        resourceModifier: {
            get_income: () => ({
                resources: {
                    health: {
                        A: 1.2,
                        B: 1.0*gameEffects.getEffectValue('restoration_spells_efficiency'),
                        type: 1,
                    },
                    energy: {
                        A: 1.2,
                        B: 2*gameEffects.getEffectValue('restoration_spells_efficiency'),
                        type: 1,
                    }
                },
            }),
            consumption: {
                resources: {
                    mana: {
                        A: 1.5,
                        B: 2,
                        type: 1,
                    }
                }
            },
            effectDeps: ['restoration_spells_efficiency']
        },
        usageGain: {
            get_consumption: () => ({
                resources: {
                    mana: {
                        A: 1.5,
                        B: 5/1.5,
                        type: 1,
                    }
                }
            })
        },
        attributes: {
            duration: 10,
            xpOnCast: 20,
        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_less_restoration') > 0
        },
    })

    gameEntity.registerGameEntity('spell_perfection_illusion', {
        name: 'Perfection Illusion',
        description: 'Use magic to create illusion that you are perfect worker. Increases coins income from jobs',
        hasCap: false,
        tags: ['spell', 'magic', 'mental', 'illusion_magic'],
        defaultCap: 0,
        isAbstract: true,
        level: 1,
        onUse: (amount) => {

        },
        getUsageCooldown: () => {
            return 30;
        },
        resourceModifier: {
            get_multiplier: () =>({
                effects: {
                    coins_earned_bonus: {
                        A: 0.2*gameEffects.getEffectValue('illusion_spells_efficiency'),
                        B: 1.0 + 0.4*gameEffects.getEffectValue('illusion_spells_efficiency'),
                        type: 0,
                    }
                }
            }),
            consumption: {
                resources: {
                    mana: {
                        A: 1.5,
                        B: 1,
                        type: 1,
                    }
                }
            },
            effectDeps: ['illusion_spells_efficiency']
        },
        usageGain: {
            get_consumption: () => ({
                resources: {
                    mana: {
                        A: 1.5,
                        B: 4,
                        type: 1,
                    }
                }
            })
        },
        attributes: {
            duration: 20,
            xpOnCast: 50,
        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_less_illusion') > 0
        },
    })


    gameEntity.registerGameEntity('spell_dancing_fairy', {
        name: 'Dancing Fairy',
        description: 'Summon illusion of dancing fairy, inspiring you while performing routine actions. Improves learning rate for all routine tasks',
        hasCap: false,
        tags: ['spell', 'magic', 'mental', 'illusion_magic'],
        defaultCap: 0,
        isAbstract: true,
        level: 1,
        onUse: (amount) => {

        },
        getUsageCooldown: () => {
            return 30;
        },
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    routine_learning_speed: {
                        A: 0.2*gameEffects.getEffectValue('illusion_spells_efficiency'),
                        B: 1.0 + 0.8*gameEffects.getEffectValue('illusion_spells_efficiency'),
                        type: 0,
                    }
                }
            }),
            consumption: {
                resources: {
                    mana: {
                        A: 1.5,
                        B: 1.0/1.5,
                        type: 1,
                    }
                }
            },
            effectDeps: ['illusion_spells_efficiency']
        },
        usageGain: {
            get_consumption: () => ({
                resources: {
                    mana: {
                        A: 1.5,
                        B: 5./1.5,
                        type: 1,
                    }
                }
            })
        },
        attributes: {
            duration: 20,
            xpOnCast: 50,
        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_less_illusion') > 0
        },
    })



    gameEntity.registerGameEntity('spell_friendliness_mask', {
        name: 'Mask of Friendliness',
        description: 'Cast a spell on your face to appear more friendly to others',
        hasCap: false,
        tags: ['spell', 'magic', 'mental', 'illusion_magic'],
        defaultCap: 0,
        isAbstract: true,
        level: 1,
        onUse: (amount) => {

        },
        getUsageCooldown: () => {
            return 30;
        },
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    social_training_learning_rate: {
                        A: 0.2*gameEffects.getEffectValue('illusion_spells_efficiency'),
                        B: 1.0 + 0.8*gameEffects.getEffectValue('illusion_spells_efficiency'),
                        type: 0,
                    }
                }
            }),
            consumption: {
                resources: {
                    mana: {
                        A: 1.5,
                        B: 10.0/1.5,
                        type: 1,
                    }
                }
            },
            effectDeps: ['illusion_spells_efficiency']
        },
        usageGain: {
            get_consumption: () => ({
                resources: {
                    mana: {
                        A: 1.5,
                        B: 25./1.5,
                        type: 1,
                    }
                }
            })
        },
        attributes: {
            duration: 20,
            xpOnCast: 50,
        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_minor_illusion') > 0
        },
    })



    gameEntity.registerGameEntity('spell_illusory_hammer', {
        name: 'Illusory Hammer',
        description: 'Create an duplicated hammer. Of course, its just an imagination, but still it chops wood nice.',
        hasCap: false,
        tags: ['spell', 'magic', 'mental', 'illusion_magic'],
        defaultCap: 0,
        isAbstract: true,
        level: 1,
        onUse: (amount) => {

        },
        getUsageCooldown: () => {
            return 30;
        },
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    crafting_efficiency: {
                        A: 0.05*gameEffects.getEffectValue('illusion_spells_efficiency'),
                        B: 1.0 + 0.2*gameEffects.getEffectValue('illusion_spells_efficiency'),
                        type: 0,
                    }
                }
            }),
            consumption: {
                resources: {
                    mana: {
                        A: 1.5,
                        B: 25.0/1.5,
                        type: 1,
                    }
                }
            },
            effectDeps: ['illusion_spells_efficiency']
        },
        usageGain: {
            get_consumption: () => ({
                resources: {
                    mana: {
                        A: 1.5,
                        B: 80./1.5,
                        type: 1,
                    }
                }
            })
        },
        attributes: {
            duration: 20,
            xpOnCast: 50,
        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_minor_illusion') > 0
        },
    })

}