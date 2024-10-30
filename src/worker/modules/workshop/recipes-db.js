import {gameEntity, gameCore, gameEffects, gameResources, resourceModifiers} from "game-framework"

export const getPrimaryBonus = (attributeId) => {
    return 0.98 + 0.02*gameEffects.getEffectValue(attributeId);
}

export const registerCraftingRecipe = (id, options) => {

    const primaryAttribute = options.attributes.primaryAttribute;

    if(!primaryAttribute || !options.resourceModifier) {
        return gameEntity.registerGameEntity(id, options);
    }

    if(!options.resourceModifier.effectDeps) {
        options.resourceModifier.effectDeps = []
    }

    if(!options.resourceModifier.effectDeps.includes(primaryAttribute)) {
        options.resourceModifier.effectDeps.push(primaryAttribute);
    }

    options.getPrimaryEffect = () => getPrimaryBonus(primaryAttribute);

    if(options.attributes.isTraining) {
        options.resourceModifier.customAmplifierApplyTypes = ['resources']
    } else {
        options.resourceModifier.customAmplifierApplyTypes = ['effects', 'resources']
    }

    options.resourceModifier.getCustomAmplifier = () => options.getPrimaryEffect();

    return gameEntity.registerGameEntity(id, options);

}

export const registerCraftingRecipes = () => {

    registerCraftingRecipe('craft_refined_wood', {
        tags: ["recipe", "crafting", "material", "physical"],
        name: 'Craft Refined Wood',
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Refine wood and use it for your needs, or just sell it',
        level: 1,
        resourceModifier: {
            income: {
                resources: {
                    'inventory_refined_wood': {
                        A: 0.2,
                        B: 1.2,
                        type: 1,
                    }
                }
            },
            consumption: {
                resources: {
                    'inventory_wood': {
                        A: 1.5,
                        B: 1,
                        type: 1
                    },
                    'crafting_ability': {
                        A: 1.5,
                        B: 1,
                        type: 1,
                    },
                    'crafting_slots': {
                        A: 1,
                        B: 0,
                        type: 0,
                        ignoreEfficiency: true,
                    },
                }
            },
            effectDeps: ['walking_learning_rate']
        },
        unlockCondition: () => {
            return true
        },
        attributes: {
            baseXPCost: 10,
        },
        get_cost: () => ({
            'crafting_slots': {
                A: 1,
                B: 0,
                type: 0
            }
        }),
    })


    registerCraftingRecipe('craft_herbal_fibers', {
        tags: ["recipe", "crafting", "material", "physical"],
        name: 'Craft Herbal Fibers',
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Dry and weave your herbs in fibers for further usage',
        level: 1,
        resourceModifier: {
            income: {
                resources: {
                    'inventory_herbal_fibers': {
                        A: 0.2,
                        B: 1.2,
                        type: 1,
                    }
                }
            },
            consumption: {
                resources: {
                    'inventory_ginseng': {
                        A: 1.5,
                        B: 1,
                        type: 1
                    },
                    'inventory_aloe_vera': {
                        A: 1.5,
                        B: 1,
                        type: 1
                    },
                    'crafting_ability': {
                        A: 1.5,
                        B: 1,
                        type: 1,
                    },
                    'crafting_slots': {
                        A: 1,
                        B: 0,
                        type: 0,
                        ignoreEfficiency: true,
                    },
                }
            },
            effectDeps: ['walking_learning_rate']
        },
        unlockCondition: () => {
            return true
        },
        attributes: {
            baseXPCost: 10,
        },
        get_cost: () => ({
            'crafting_slots': {
                A: 1,
                B: 0,
                type: 0
            }
        }),
    })

    // alchemy


    registerCraftingRecipe('craft_small_endurance_flask', {
        tags: ["recipe", "crafting", "alchemy", "physical"],
        name: 'Craft Small Endurance Flask',
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Use your herbs to create more efficient substance to boost your energy',
        level: 1,
        resourceModifier: {
            income: {
                resources: {
                    'inventory_small_endurance_flask': {
                        A: 1,
                        B: 1.2,
                        type: 1,
                    }
                }
            },
            consumption: {
                resources: {
                    'inventory_ginseng': {
                        A: 1.5,
                        B: 5,
                        type: 1
                    },
                    'inventory_berry': {
                        A: 1.5,
                        B: 25,
                        type: 1
                    },
                    'alchemy_ability': {
                        A: 1.5,
                        B: 1,
                        type: 1,
                    },
                    'alchemy_slots': {
                        A: 1,
                        B: 0,
                        type: 0,
                        ignoreEfficiency: true,
                    },
                }
            },
            effectDeps: ['walking_learning_rate']
        },
        unlockCondition: () => {
            return true
        },
        attributes: {
            baseXPCost: 10,
        },
        get_cost: () => ({
            'alchemy_slots': {
                A: 1,
                B: 0,
                type: 0
            }
        }),
    })


    registerCraftingRecipe('craft_healing_potion', {
        tags: ["recipe", "crafting", "alchemy", "physical"],
        name: 'Craft Small Healing Potion',
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Use healing herbs concentrate to save yourself from falling deceased',
        level: 1,
        resourceModifier: {
            income: {
                resources: {
                    'inventory_healing_potion': {
                        A: 1,
                        B: 1.2,
                        type: 1,
                    }
                }
            },
            consumption: {
                resources: {
                    'inventory_aloe_vera': {
                        A: 1.5,
                        B: 5,
                        type: 1
                    },
                    'inventory_berry': {
                        A: 1.5,
                        B: 25,
                        type: 1
                    },
                    'alchemy_ability': {
                        A: 1.5,
                        B: 1,
                        type: 1,
                    },
                    'alchemy_slots': {
                        A: 1,
                        B: 0,
                        type: 0,
                        ignoreEfficiency: true,
                    },
                }
            },
            effectDeps: ['walking_learning_rate']
        },
        unlockCondition: () => {
            return true
        },
        attributes: {
            baseXPCost: 10,
        },
        get_cost: () => ({
            'alchemy_slots': {
                A: 1,
                B: 0,
                type: 0
            }
        }),
    })



    registerCraftingRecipe('craft_experience_potion', {
        tags: ["recipe", "crafting", "alchemy", "physical"],
        name: 'Craft Small Experience Potion',
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Use experimental and dangerous herbs at your risk in searching for better understanding of human and mages being',
        level: 1,
        resourceModifier: {
            income: {
                resources: {
                    'inventory_experience_potion': {
                        A: 0.1,
                        B: 1.2,
                        type: 1,
                    }
                }
            },
            consumption: {
                resources: {
                    'inventory_nightshade': {
                        A: 1.5,
                        B: 2.5,
                        type: 1
                    },
                    'inventory_fly_mushroom': {
                        A: 1.5,
                        B: 10,
                        type: 1
                    },
                    'alchemy_ability': {
                        A: 1.5,
                        B: 2./1.5,
                        type: 1,
                    },
                    'alchemy_slots': {
                        A: 1,
                        B: 0,
                        type: 0,
                        ignoreEfficiency: true,
                    },
                }
            },
            effectDeps: ['walking_learning_rate']
        },
        unlockCondition: () => {
            return true
        },
        attributes: {
            baseXPCost: 10,
        },
        get_cost: () => ({
            'alchemy_slots': {
                A: 1,
                B: 0,
                type: 0
            }
        }),
    })

}