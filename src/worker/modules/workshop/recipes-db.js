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
            isTraining: true,
        },
        get_cost: () => ({
            'crafting_slots': {
                A: 1,
                B: 0,
                type: 0
            }
        }),
    })
}