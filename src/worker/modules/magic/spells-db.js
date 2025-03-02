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
            return 0;
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    learning_rate: {
                        A: 0.05,
                        B: 1.25,
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
            return 0;
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'gathering_low_chance': {
                        A: 0.05,
                        B: 1.45,
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
            return gameEntity.getLevel('shop_item_spellbook') > 0 && gameEntity.getLevel('shop_item_map') > 0
        },
    })

    registerSpell('spell_magic_recovery', {
        name: 'Less Magic Recovery',
        description: 'Heal yourself using magic',
        hasCap: false,
        tags: ['spell', 'magic', 'recovery', 'restoration_magic'],
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
                        B: 10*gameEffects.getEffectValue('restoration_spells_efficiency')*gameEffects.getEffectValue('recovery_spells_efficiency'),
                        type: 1,
                    }
                }
            }),
            effectDeps: ['restoration_spells_efficiency','recovery_spells_efficiency']
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
        tags: ['spell', 'magic', 'recovery', 'restoration_magic'],
        defaultCap: 0,
        isAbstract: true,
        level: 1,
        onUse: (amount) => {

        },
        getUsageCooldown: () => {
            return 0;
        },
        resourceModifier: {
            get_income: () => ({
                resources: {
                    health: {
                        A: 1.2,
                        B: 0.5*gameEffects.getEffectValue('restoration_spells_efficiency')*gameEffects.getEffectValue('recovery_spells_efficiency'),
                        type: 1,
                    },
                    energy: {
                        A: 1.2,
                        B: 1*gameEffects.getEffectValue('restoration_spells_efficiency')*gameEffects.getEffectValue('recovery_spells_efficiency'),
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
            effectDeps: ['restoration_spells_efficiency','recovery_spells_efficiency']
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

    registerSpell('spell_body_catalyst', {
        name: 'Body Catalyst',
        description: 'Use magic to accelerate physical training. Temporarily increases the learning speed of physical exercises.',
        hasCap: false,
        tags: ['spell', 'magic', 'enhance', 'restoration_magic'],
        defaultCap: 0,
        isAbstract: true,
        level: 1,
        onUse: (amount) => {

        },
        getUsageCooldown: () => {
            return 0;
        },
        resourceModifier: {
            get_multiplier: () =>({
                effects: {
                    physical_training_learn_speed: {
                        A: 0.05*gameEffects.getEffectValue('restoration_spells_efficiency'),
                        B: 1.0 + 0.1*gameEffects.getEffectValue('restoration_spells_efficiency'),
                        type: 0,
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    mana: {
                        A: 1.5,
                        B: 12*getCostReduction('spell_body_catalyst'),
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
                        B: 15*getCostReduction('spell_perfection_illusion'),
                        type: 1,
                    }
                }
            })
        },
        attributes: {
            duration: 20,
            xpOnCast: 50,
            baseXPCost: 1.e+5,
        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_minor_restoration') > 0
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
            return 0;
        },
        resourceModifier: {
            get_multiplier: () =>({
                effects: {
                    coins_earned_bonus: {
                        A: 0.1*gameEffects.getEffectValue('illusion_spells_efficiency'),
                        B: 1.0 + 0.2*gameEffects.getEffectValue('illusion_spells_efficiency'),
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
            return 0;
        },
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    routine_learning_speed: {
                        A: 0.1*gameEffects.getEffectValue('illusion_spells_efficiency'),
                        B: 1.0 + 0.4*gameEffects.getEffectValue('illusion_spells_efficiency'),
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
            return 0;
        },
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    social_training_learning_rate: {
                        A: 0.1*gameEffects.getEffectValue('illusion_spells_efficiency'),
                        B: 1.0 + 0.4*gameEffects.getEffectValue('illusion_spells_efficiency'),
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
            return 0;
        },
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    crafting_efficiency: {
                        A: 0.02*gameEffects.getEffectValue('illusion_spells_efficiency'),
                        B: 1.0 + 0.1*gameEffects.getEffectValue('illusion_spells_efficiency'),
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


    registerSpell('spell_conjure_water', {
        name: 'Conjure Water',
        description: 'Create a stream of pure water, vital for your herbs',
        hasCap: false,
        tags: ['spell', 'magic', 'mental', 'conjuration_magic','elemental'],
        defaultCap: 0,
        isAbstract: true,
        level: 1,
        onUse: (amount) => {

        },
        getUsageCooldown: () => {
            return 0;
        },
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_magic_ability',
            level: 8000
        }],
        resourceModifier: {
            get_income: () => ({
                resources: {
                    inventory_water: {
                        A: 1.2,
                        B: 0.2*gameEffects.getEffectValue('conjuration_spells_efficiency')*gameEffects.getEffectValue('elemental_spells_efficiency'),
                        type: 1,
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    mana: {
                        A: 1.5,
                        B: 45.0*getCostReduction('spell_conjure_water')/1.5,
                        type: 1,
                    }
                }
            }),
            effectDeps: ['conjuration_spells_efficiency','elemental_spells_efficiency']
        },
        usageGain: {
            get_consumption: () => ({
                resources: {
                    mana: {
                        A: 1.5,
                        B: 120.*getCostReduction('spell_conjure_water')/1.5,
                        type: 1,
                    }
                }
            })
        },
        attributes: {
            duration: 20,
            xpOnCast: 50,
            baseXPCost: 1.e+8,
        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_minor_illusion') > 0
        },
    })


    registerSpell('spell_conjure_wood', {
        name: 'Conjure Wood',
        description: 'Create wood without having to use this heavy axe',
        hasCap: false,
        tags: ['spell', 'magic', 'mental', 'conjuration_magic', 'natural'],
        defaultCap: 0,
        isAbstract: true,
        level: 1,
        onUse: (amount) => {

        },
        getUsageCooldown: () => {
            return 0;
        },
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_magic_ability',
            level: 8000
        }],
        resourceModifier: {
            get_income: () => ({
                resources: {
                    inventory_wood: {
                        A: 1.2,
                        B: 2000*gameEffects.getEffectValue('conjuration_spells_efficiency'),
                        type: 1,
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    mana: {
                        A: 1.5,
                        B: 125.0*getCostReduction('spell_conjure_wood')/1.5,
                        type: 1,
                    }
                }
            }),
            effectDeps: ['conjuration_spells_efficiency']
        },
        usageGain: {
            get_consumption: () => ({
                resources: {
                    mana: {
                        A: 1.5,
                        B: 120.*getCostReduction('spell_conjure_wood')/1.5,
                        type: 1,
                    }
                }
            })
        },
        attributes: {
            duration: 20,
            xpOnCast: 50,
            baseXPCost: 1.e+8,
        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_minor_illusion') > 0
        },
    })


    registerSpell('spell_conjure_earth', {
        name: 'Conjure Earth',
        description: 'Create a bunch of earth',
        hasCap: false,
        tags: ['spell', 'magic', 'mental', 'conjuration_magic','elemental'],
        defaultCap: 0,
        isAbstract: true,
        level: 1,
        onUse: (amount) => {

        },
        getUsageCooldown: () => {
            return 0;
        },
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_magic_ability',
            level: 15000
        }],
        resourceModifier: {
            get_income: () => ({
                resources: {
                    inventory_earth: {
                        A: 1.2,
                        B: 0.025*gameEffects.getEffectValue('conjuration_spells_efficiency')*gameEffects.getEffectValue('elemental_spells_efficiency'),
                        type: 1,
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    mana: {
                        A: 1.5,
                        B: 60.0*getCostReduction('spell_conjure_earth')/1.5,
                        type: 1,
                    }
                }
            }),
            effectDeps: ['conjuration_spells_efficiency','elemental_spells_efficiency']
        },
        usageGain: {
            get_consumption: () => ({
                resources: {
                    mana: {
                        A: 1.5,
                        B: 180.*getCostReduction('spell_conjure_earth')/1.5,
                        type: 1,
                    }
                }
            })
        },
        attributes: {
            duration: 20,
            xpOnCast: 50,
            baseXPCost: 1.e+8,
        },
        unlockCondition: () => {
            return true
        },
    })


    registerSpell('spell_conjure_air', {
        name: 'Conjure Air',
        description: 'Create an air',
        hasCap: false,
        tags: ['spell', 'magic', 'mental', 'conjuration_magic','elemental'],
        defaultCap: 0,
        isAbstract: true,
        level: 1,
        onUse: (amount) => {

        },
        getUsageCooldown: () => {
            return 0;
        },
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_magic_ability',
            level: 15000
        }],
        resourceModifier: {
            get_income: () => ({
                resources: {
                    inventory_air: {
                        A: 1.2,
                        B: 0.025*gameEffects.getEffectValue('conjuration_spells_efficiency')*gameEffects.getEffectValue('elemental_spells_efficiency'),
                        type: 1,
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    mana: {
                        A: 1.5,
                        B: 60.0*getCostReduction('spell_conjure_air')/1.5,
                        type: 1,
                    }
                }
            }),
            effectDeps: ['conjuration_spells_efficiency','elemental_spells_efficiency']
        },
        usageGain: {
            get_consumption: () => ({
                resources: {
                    mana: {
                        A: 1.5,
                        B: 180.*getCostReduction('spell_conjure_air')/1.5,
                        type: 1,
                    }
                }
            })
        },
        attributes: {
            duration: 20,
            xpOnCast: 50,
            baseXPCost: 1.e+8,
        },
        unlockCondition: () => {
            return true
        },
    })


    registerSpell('spell_conjure_spark', {
        name: 'Conjure Spark',
        description: 'Create a spark',
        hasCap: false,
        tags: ['spell', 'magic', 'mental', 'conjuration_magic','elemental'],
        defaultCap: 0,
        isAbstract: true,
        level: 1,
        onUse: (amount) => {

        },
        getUsageCooldown: () => {
            return 0;
        },
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_magic_ability',
            level: 60000
        }],
        resourceModifier: {
            get_income: () => ({
                resources: {
                    inventory_spark: {
                        A: 1.2,
                        B: 0.005*gameEffects.getEffectValue('conjuration_spells_efficiency')*gameEffects.getEffectValue('elemental_spells_efficiency'),
                        type: 1,
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    mana: {
                        A: 1.5,
                        B: 60.0*getCostReduction('spell_conjure_air')/1.5,
                        type: 1,
                    }
                }
            }),
            effectDeps: ['conjuration_spells_efficiency','elemental_spells_efficiency']
        },
        usageGain: {
            get_consumption: () => ({
                resources: {
                    mana: {
                        A: 1.5,
                        B: 180.*getCostReduction('spell_conjure_spark')/1.5,
                        type: 1,
                    }
                }
            })
        },
        attributes: {
            duration: 20,
            xpOnCast: 50,
            baseXPCost: 1.e+8,
        },
        unlockCondition: () => {
            return true
        },
    })


}