import {gameEntity, gameCore, gameEffects, gameResources} from "game-framework"


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

export const registerStructure = (id, options) => {

    options.searchableMeta = getResourceModifierDataSearchable(options.resourceModifier);

    gameEntity.registerGameEntity(id, options);
}


export const registerStructuresStage1 = () => {

    const charismaMod = (attr) => attr > 0 ? 1. / (1. + 0.02*Math.log2(attr*gameEffects.getEffectValue('prices_discount'))) : 1.;

    registerStructure('structure_hut', {
        tags: ["structure", "upgrade", "purchaseable", "actions"],
        name: 'Hut',
        description: 'Build a hut on your land to get better place to live and store your goods',
        level: 0,
        maxLevel: 10,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_constructing') > 0;
        },
        resourceModifier: {
            income: {
                resources: {
                    'living_space': {
                        A: 2,
                        B: 0,
                        type: 0,
                    }
                }
            },
        },
        get_cost: () => ({
            'coins': {
                A: 2,
                B: 20000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            },
            'inventory_wooden_beam': {
                A: 1.2,
                B: 10,
                type: 1
            }
        }),
    })

    registerStructure('structure_tinkers_shed', {
        tags: ["structure", "upgrade", "purchaseable", "actions"],
        name: 'Tinkers Shed',
        description: 'A crooked, smoky shack cobbled together from planks and determination. Half workshop, half alchemical corner — cramped, but surprisingly efficient.',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_constructing') > 0;
        },
        resourceModifier: {
            income: {
                effects: {
                    'crafting_effort': {
                        A: 0.04,
                        B: 0,
                        type: 0,
                    },
                    'alchemy_effort': {
                        A: 0.04,
                        B: 0,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'living_space': {
                        A: 1,
                        B: 0,
                        type: 0,
                    }
                }
            }
        },
        get_cost: () => ({
            'inventory_wooden_beam': {
                A: 1.2,
                B: 2,
                type: 1
            },
            'inventory_herbal_fibers': {
                A: 1.2,
                B: 0.25,
                type: 1
            },
            'living_space': {
                A: 0,
                B: 1,
                type: 0
            }
        }),
    })
}