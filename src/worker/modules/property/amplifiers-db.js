import {gameEffects, gameEntity, gameResources} from "game-framework";
import {registerAccessory} from "./accessories-db";

const getResourceModifierDataSearchable = (rs) => {

    const searchables = {
        'effects': [],
        'resources': []
    };

    if(!rs) return searchables;


    ['income', 'consumption', 'multiplier', 'rawCap', 'capMult'].forEach(scope => {
        let rObj = null;
        if(rs[`get_${scope}`]) {
            rObj = rs[`get_${scope}`]();
        } else {
            rObj = rs[scope];
        }
        if(!rObj) return;

        for(const type in rObj) {
            searchables[type].push(...Object.keys(rObj[type]).map(one => type === 'resources' ? gameResources.getResource(one).name.toLowerCase() : gameEffects.getEffect(one)?.name.toLowerCase()))
        }
    })

    return searchables;
}

export const registerAmplifier = (id, options) => {

    options.searchableMeta = getResourceModifierDataSearchable(options.resourceModifier);

    gameEntity.registerGameEntity(id, options);
}

export const registerAmplifiersStage1 = () => {

    registerAmplifier('amplifier_dimensional_amplifier', {
        tags: ["amplifier", "upgrade", "purchaseable", "earth", "space"],
        name: 'Dimensional Amplifier',
        description: 'Harness the power of the Earth element to reshape and expand spatial properties, increasing available living space.',
        level: 0,
        unlockCondition: () => {
            return gameResources.isResourceUnlocked('inventory_earth');
        },
        resourceModifier: {
            get_multiplier: ()=>({
                resources: {
                    'living_space': {
                        A: 0.0025,
                        B: 1,
                        type: 0,
                    }
                }
            }),
        },
        get_cost: () => ({
            'inventory_earth': {
                A: 1.2,
                B: 100,
                type: 1
            }
        }),
    })

    registerAmplifier('amplifier_blacksmiths_amplifier', {
        tags: ["amplifier", "upgrade", "purchaseable", "earth", "crafting"],
        name: 'Blacksmiths Amplifier',
        description: 'Infuse your crafting with Earth’s stability, amplifying crafting efficiency and precision.',
        level: 0,
        unlockCondition: () => {
            return gameResources.isResourceUnlocked('inventory_earth');
        },
        resourceModifier: {
            get_multiplier: ()=>({
                resources: {
                    'crafting_ability': {
                        A: 0.02,
                        B: 1,
                        type: 0,
                    }
                }
            }),
        },
        get_cost: () => ({
            'inventory_earth': {
                A: 1.2,
                B: 100,
                type: 1
            }
        }),
    })


    registerAmplifier('amplifier_physical_easiness', {
        tags: ["amplifier", "upgrade", "purchaseable", "air", "actions"],
        name: 'Physical Flow Amplifier',
        description: 'Channel the Air element to enhance bodily coordination, reducing the XP requirements for physical actions.',
        level: 0,
        unlockCondition: () => {
            return gameResources.isResourceUnlocked('inventory_air');
        },
        resourceModifier: {
            get_multiplier: ()=>({
                effects: {
                    'physical_actions_discount': {
                        A: 0.2,
                        B: 1,
                        C: 1.025,
                        type: 3,
                    }
                }
            }),
        },
        get_cost: () => ({
            'inventory_air': {
                A: 1.2,
                B: 100,
                type: 1
            }
        }),
    })

    registerAmplifier('amplifier_mental_easiness', {
        tags: ["amplifier", "upgrade", "purchaseable", "air", "actions"],
        name: 'Mental Clarity Amplifier',
        description: 'Attune your mind to the flow of Air, decreasing the XP cost for mental actions through enhanced cognitive ease.',
        level: 0,
        unlockCondition: () => {
            return gameResources.isResourceUnlocked('inventory_air');
        },
        resourceModifier: {
            get_multiplier: ()=>({
                effects: {
                    'mental_actions_discount': {
                        A: 0.2,
                        B: 1,
                        C: 1.025,
                        type: 3,
                    }
                }
            }),
        },
        get_cost: () => ({
            'inventory_air': {
                A: 1.2,
                B: 100,
                type: 1
            }
        }),
    })

    registerAmplifier('amplifier_social_easiness', {
        tags: ["amplifier", "upgrade", "purchaseable", "air", "actions"],
        name: 'Social Insight Amplifier',
        description: 'Utilize the Air element to sharpen your understanding of social interactions, reducing the XP requirements for social actions.',
        level: 0,
        unlockCondition: () => {
            return gameResources.isResourceUnlocked('inventory_air');
        },
        resourceModifier: {
            get_multiplier: ()=>({
                effects: {
                    'social_actions_discount': {
                        A: 0.2,
                        B: 1,
                        C: 1.025,
                        type: 3,
                    }
                }
            }),
        },
        get_cost: () => ({
            'inventory_air': {
                A: 1.2,
                B: 100,
                type: 1
            }
        }),
    })


    registerAmplifier('amplifier_magical_easiness', {
        tags: ["amplifier", "upgrade", "purchaseable", "air", "actions"],
        name: 'Magical Insight Amplifier',
        description: 'Utilize the Air element to improve your inner magical reserves, reducing the XP requirements for magical actions.',
        level: 0,
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_patience',
            level: 20000,
        }],
        unlockCondition: () => {
            return gameResources.isResourceUnlocked('inventory_air');
        },
        resourceModifier: {
            get_multiplier: ()=>({
                effects: {
                    'magical_actions_discount': {
                        A: 0.2,
                        B: 1,
                        C: 1.025,
                        type: 3,
                    }
                }
            }),
        },
        get_cost: () => ({
            'inventory_air': {
                A: 1.2,
                B: 100,
                type: 1
            }
        }),
    })


    registerAmplifier('amplifier_arcane_conduit', {
        tags: ["amplifier", "upgrade", "purchaseable", "spark", "actions"],
        name: 'Arcane Conduit Amplifier',
        description: 'Increase mana cap and regeneration.',
        level: 0,
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_magic_ability',
            level: 60000,
        }],
        unlockCondition: () => {
            return gameResources.isResourceUnlocked('inventory_spark');
        },
        resourceModifier: {
            get_multiplier: ()=>({
                resources: {
                    'mana': {
                        A: 0.02,
                        B: 1,
                        C: 1.025,
                        type: 3,
                    }
                }
            }),
            get_capMult: ()=>({
                resources: {
                    'mana': {
                        A: 0.02,
                        B: 1,
                        C: 1.025,
                        type: 3,
                    }
                }
            }),
        },
        get_cost: () => ({
            'inventory_spark': {
                A: 1.2,
                B: 100,
                type: 1
            }
        }),
    })

    registerAmplifier('amplifier_scolars_ignition', {
        tags: ["amplifier", "upgrade", "purchaseable", "spark", "actions"],
        name: 'Scholars Ignition Amplifier',
        description: 'Increase courses learn speed',
        level: 0,
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_magic_ability',
            level: 60000,
        }],
        unlockCondition: () => {
            return gameResources.isResourceUnlocked('inventory_spark');
        },
        resourceModifier: {
            get_multiplier: ()=>({
                effects: {
                    'courses_learning_speed': {
                        A: 0.05,
                        B: 1,
                        C: 1.01,
                        type: 3,
                    }
                }
            }),
        },
        get_cost: () => ({
            'inventory_spark': {
                A: 1.2,
                B: 100,
                type: 1
            }
        }),
    })

    registerAmplifier('amplifier_elemental', {
        tags: ["amplifier", "upgrade", "purchaseable", "spark", "actions"],
        name: 'Elemental Amplifier',
        description: 'Increase courses learn speed',
        level: 0,
        unlockCondition: () => {
            return gameResources.isResourceUnlocked('inventory_light');
        },
        resourceModifier: {
            get_multiplier: ()=>({
                effects: {
                    'elemental_spells_efficiency': {
                        A: 0.05,
                        B: 1,
                        C: 1.01,
                        type: 3,
                    }
                }
            }),
        },
        get_cost: () => ({
            'inventory_light': {
                A: 1.2,
                B: 100,
                type: 1
            }
        }),
    })

    registerAmplifier('amplifier_discovery_beacon', {
        tags: ["amplifier", "upgrade", "purchaseable", "spark", "actions"],
        name: 'Beacon of Discovery Amplifier',
        description: 'Increase gathering perception',
        level: 0,
        unlockCondition: () => {
            return gameResources.isResourceUnlocked('inventory_light');
        },
        resourceModifier: {
            get_multiplier: ()=>({
                effects: {
                    'gathering_perception': {
                        A: 0.1,
                        B: 1,
                        C: 1.01,
                        type: 3,
                    }
                }
            }),
        },
        get_cost: () => ({
            'inventory_light': {
                A: 1.2,
                B: 100,
                type: 1
            }
        }),
    })

    registerAmplifier('amplifier_body_ignition', {
        tags: ["amplifier", "upgrade", "purchaseable", "spark", "actions"],
        name: 'Body Ignition Amplifier',
        description: 'Increase physical training learning rate',
        level: 0,
        unlockCondition: () => {
            return gameResources.isResourceUnlocked('inventory_fire');
        },
        resourceModifier: {
            get_multiplier: ()=>({
                effects: {
                    'physical_training_learn_speed': {
                        A: 0.02,
                        B: 1,
                        C: 1.01,
                        type: 3,
                    }
                }
            }),
        },
        get_cost: () => ({
            'inventory_fire': {
                A: 1.2,
                B: 100,
                type: 1
            }
        }),
    })

    registerAmplifier('amplifier_mind_sharpener', {
        tags: ["amplifier", "upgrade", "purchaseable", "spark", "actions"],
        name: 'Mind Sharpener Amplifier',
        description: 'Increase mental training learning rate',
        level: 0,
        unlockCondition: () => {
            return gameResources.isResourceUnlocked('inventory_fire');
        },
        resourceModifier: {
            get_multiplier: ()=>({
                effects: {
                    'mental_training_learning_rate': {
                        A: 0.02,
                        B: 1,
                        C: 1.01,
                        type: 3,
                    }
                }
            }),
        },
        get_cost: () => ({
            'inventory_fire': {
                A: 1.2,
                B: 100,
                type: 1
            }
        }),
    })

    registerAmplifier('amplifier_charisma_flames', {
        tags: ["amplifier", "upgrade", "purchaseable", "spark", "actions"],
        name: 'Charisma Flames Amplifier',
        description: 'Increase social training learning rate',
        level: 0,
        unlockCondition: () => {
            return gameResources.isResourceUnlocked('inventory_fire');
        },
        resourceModifier: {
            get_multiplier: ()=>({
                effects: {
                    'social_training_learning_rate': {
                        A: 0.02,
                        B: 1,
                        C: 1.01,
                        type: 3,
                    }
                }
            }),
        },
        get_cost: () => ({
            'inventory_fire': {
                A: 1.2,
                B: 100,
                type: 1
            }
        }),
    })

}