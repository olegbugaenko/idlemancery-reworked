import { gameEntity, gameCore, gameEffects } from "game-framework"

export const getMasteryId = id => `${id}_mastery`;

export const getMaxId = id => `${id}_max`;

export const getCostReduction = id => {
    const effId = getMasteryId(id);
    /*if(!gameEffects.effects[id]) {
        gameEffects.registerEffect(effId, {
            name: `Cost reduction`,
            defaultValue: 1,
        })
    }*/
    const effect = gameEffects.getEffectValue(effId);
    return effect;
}

export const registerSpell = (id, options) => {

    const cost_reduction_effect_id = getMasteryId(id);

    const max_level_id = getMaxId(id);

    // register effect
    if(!gameEffects.effects[id]) {
        gameEffects.registerEffect(cost_reduction_effect_id, {
            name: `${options.name} cost`,
            defaultValue: 1.,
            minValue: 0,
        })
    }

    //register cap
    gameEntity.registerGameEntity(max_level_id, {
        name: `${options.name} cap`,
        tags: ['spell_cap'],
        isUnlocked: options.isUnlocked,
        isAbstract: false,
        allowedImpacts: ['effects'],
        resourceModifier: {
            multiplier: {
                effects: {
                    [cost_reduction_effect_id]: {
                        A: 0.975,
                        B: 1,
                        type: 1
                    }
                }
            }
        }
    })

    //register spell itself
    if(options.resourceModifier) {
        options.resourceModifier.effectDeps = [
            ...(options.resourceModifier.effectDeps || []),
            getMasteryId(id)
        ]
    }

    if(options.attributes?.duration) {
        options.attributes.className = 'spell'
    }

    gameEntity.registerGameEntity(id, {
        ...options,
    })
}

export const initSpellsDB1 = () => {

    registerSpell('spell_magic_insight', {
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
                        B: 3*getCostReduction('spell_magic_insight'),
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

    registerSpell('spell_focus', {
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
            get_consumption: () => ({
                resources: {
                    mana: {
                        A: 1.5,
                        B: 1*getCostReduction('spell_focus'),
                        type: 1,
                    }
                }
            })
        },
        usageGain: {
            get_consumption: () => ({
                resources: {
                    mana: {
                        A: 1.5,
                        B: 2*getCostReduction('spell_focus'),
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


    registerSpell('spell_harvest_vision', {
        name: 'Harvest Vision',
        description: 'Temporarily enhances the caster\'s ability to locate valuable resources on the map. A glowing aura sharpens perception, increasing the likelihood of discovery.',
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
                    'gathering_low_chance': {
                        A: 0.05,
                        B: 1.7,
                        type: 0,
                    }
                }
            },
            get_consumption: () => ({
                resources: {
                    mana: {
                        A: 1.5,
                        B: 1.*getCostReduction('spell_harvest_vision'),
                        type: 1,
                    }
                }
            })
        },
        usageGain: {
            get_consumption: () => ({
                resources: {
                    mana: {
                        A: 1.5,
                        B: 2*getCostReduction('spell_harvest_vision'),
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

    registerSpell('spell_magic_recovery', {
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
                        B: 4*getCostReduction('spell_magic_recovery'),
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


    registerSpell('spell_small_regeneration', {
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
            get_consumption: () => ({
                resources: {
                    mana: {
                        A: 1.5,
                        B: 2*getCostReduction('spell_small_regeneration'),
                        type: 1,
                    }
                }
            }),
            effectDeps: ['restoration_spells_efficiency']
        },
        usageGain: {
            get_consumption: () => ({
                resources: {
                    mana: {
                        A: 1.5,
                        B: 5*getCostReduction('spell_small_regeneration')/1.5,
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

    registerSpell('spell_perfection_illusion', {
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
            get_consumption: () => ({
                resources: {
                    mana: {
                        A: 1.5,
                        B: 1*getCostReduction('spell_perfection_illusion'),
                        type: 1,
                    }
                }
            }),
            effectDeps: ['illusion_spells_efficiency']
        },
        usageGain: {
            get_consumption: () => ({
                resources: {
                    mana: {
                        A: 1.5,
                        B: 4*getCostReduction('spell_perfection_illusion'),
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


    registerSpell('spell_dancing_fairy', {
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
            get_consumption: () => ({
                resources: {
                    mana: {
                        A: 1.5,
                        B: 1.0*getCostReduction('spell_dancing_fairy')/1.5,
                        type: 1,
                    }
                }
            }),
            effectDeps: ['illusion_spells_efficiency']
        },
        usageGain: {
            get_consumption: () => ({
                resources: {
                    mana: {
                        A: 1.5,
                        B: 5.*getCostReduction('spell_dancing_fairy')/1.5,
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



    registerSpell('spell_friendliness_mask', {
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
            get_consumption: () => ({
                resources: {
                    mana: {
                        A: 1.5,
                        B: 10.0*getCostReduction('spell_friendliness_mask')/1.5,
                        type: 1,
                    }
                }
            }),
            effectDeps: ['illusion_spells_efficiency']
        },
        usageGain: {
            get_consumption: () => ({
                resources: {
                    mana: {
                        A: 1.5,
                        B: 25.*getCostReduction('spell_friendliness_mask')/1.5,
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



    registerSpell('spell_illusory_hammer', {
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
            get_consumption: () => ({
                resources: {
                    mana: {
                        A: 1.5,
                        B: 25.0*getCostReduction('spell_illusory_hammer')/1.5,
                        type: 1,
                    }
                }
            }),
            effectDeps: ['illusion_spells_efficiency']
        },
        usageGain: {
            get_consumption: () => ({
                resources: {
                    mana: {
                        A: 1.5,
                        B: 80.*getCostReduction('spell_illusory_hammer')/1.5,
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