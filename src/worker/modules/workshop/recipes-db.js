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
        resourceId: 'inventory_refined_wood',
        resourceModifier: {
            get_income: () => ({
                resources: {
                    'inventory_refined_wood': {
                        A: 1.3,
                        B: 0.2*gameEffects.getEffectValue('crafting_efficiency'),
                        type: 1,
                    }
                }
            }),
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
            effectDeps: ['crafting_efficiency']
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


    registerCraftingRecipe('craft_paper', {
        tags: ["recipe", "crafting", "material", "physical"],
        name: 'Craft Paper',
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Refine wood and use it for your needs, or just sell it',
        level: 1,
        resourceId: 'inventory_paper',
        resourceModifier: {
            get_income: () => ({
                resources: {
                    'inventory_paper': {
                        A: 1.3,
                        B: 0.1*gameEffects.getEffectValue('crafting_efficiency'),
                        type: 1,
                    }
                }
            }),
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
            effectDeps: ['crafting_efficiency']
        },
        unlockCondition: () => {
            return gameResources.isResourceUnlocked('inventory_paper')
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


    registerCraftingRecipe('craft_enchanted_paper', {
        tags: ["recipe", "crafting", "material", "physical"],
        name: 'Enchant Paper',
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Craft Enchanted magical paper scrolls',
        level: 1,
        resourceId: 'inventory_enchanted_paper',
        resourceModifier: {
            get_income: () => ({
                resources: {
                    'inventory_enchanted_paper': {
                        A: 1.3,
                        B: 0.1*gameEffects.getEffectValue('crafting_efficiency'),
                        type: 1,
                    }
                }
            }),
            consumption: {
                resources: {
                    'inventory_paper': {
                        A: 1.5,
                        B: 1,
                        type: 1
                    },
                    mana: {
                        A: 1.5,
                        B: 40,
                        type: 1,
                    },
                    'crafting_ability': {
                        A: 1.5,
                        B: 2,
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
            effectDeps: ['crafting_efficiency']
        },
        unlockCondition: () => {
            return gameResources.isResourceUnlocked('inventory_enchanted_paper')
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
        resourceId: 'inventory_herbal_fibers',
        resourceModifier: {
            get_income: () => ({
                resources: {
                    'inventory_herbal_fibers': {
                        A: 1.3,
                        B: 0.2*gameEffects.getEffectValue('crafting_efficiency'),
                        type: 1,
                    }
                }
            }),
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
            effectDeps: ['crafting_efficiency']
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


    registerCraftingRecipe('craft_ruby', {
        tags: ["recipe", "crafting", "material", "physical"],
        name: 'Refine Ruby',
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Refine your stones to obtain trace amounts of rubies',
        level: 1,
        resourceId: 'inventory_ruby',
        resourceModifier: {
            get_income: () => ({
                resources: {
                    'inventory_ruby': {
                        A: 1.3,
                        B: 0.05*gameEffects.getEffectValue('crafting_efficiency'),
                        type: 1,
                    }
                }
            }),
            consumption: {
                resources: {
                    'inventory_stone': {
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
            effectDeps: ['crafting_efficiency']
        },
        unlockCondition: () => {
            return gameResources.isResourceUnlocked('inventory_stone')
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


    registerCraftingRecipe('craft_sapphire', {
        tags: ["recipe", "crafting", "material", "physical"],
        name: 'Refine Sapphire',
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Refine your stones to obtain trace amounts of sapphires',
        level: 1,
        resourceId: 'inventory_sapphire',
        resourceModifier: {
            get_income: () => ({
                resources: {
                    'inventory_sapphire': {
                        A: 1.3,
                        B: 0.05*gameEffects.getEffectValue('crafting_efficiency'),
                        type: 1,
                    }
                }
            }),
            consumption: {
                resources: {
                    'inventory_stone': {
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
            effectDeps: ['crafting_efficiency']
        },
        unlockCondition: () => {
            return gameResources.isResourceUnlocked('inventory_stone')
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
        resourceId: 'inventory_small_endurance_flask',
        resourceModifier: {
            income: {
                resources: {
                    'inventory_small_endurance_flask': {
                        A: 1.3,
                        B: 1*gameEffects.getEffectValue('alchemy_efficiency'),
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
            effectDeps: ['alchemy_efficiency']
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
        resourceId: 'inventory_healing_potion',
        resourceModifier: {
            income: {
                resources: {
                    'inventory_healing_potion': {
                        A: 1.3,
                        B: 1*gameEffects.getEffectValue('alchemy_efficiency'),
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
            effectDeps: ['alchemy_efficiency']
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
        resourceId: 'inventory_experience_potion',
        resourceModifier: {
            income: {
                resources: {
                    'inventory_experience_potion': {
                        A: 1.3,
                        B: 0.1*gameEffects.getEffectValue('alchemy_efficiency'),
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
            effectDeps: ['alchemy_efficiency']
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


    registerCraftingRecipe('craft_amnesia_potion', {
        tags: ["recipe", "crafting", "alchemy", "physical"],
        name: 'Amnesia Potion',
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Forget your previously learned skills, feel yourself refreshed. Of course, it will have consequences',
        level: 1,
        resourceId: 'inventory_amnesia_potion',
        resourceModifier: {
            income: {
                resources: {
                    'inventory_amnesia_potion': {
                        A: 1.3,
                        B: 0.1*gameEffects.getEffectValue('alchemy_efficiency'),
                        type: 1,
                    }
                }
            },
            consumption: {
                resources: {
                    'inventory_nightshade': {
                        A: 1.5,
                        B: 100,
                        type: 1
                    },
                    'inventory_fly_mushroom': {
                        A: 1.5,
                        B: 1000,
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
            effectDeps: ['alchemy_efficiency']
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