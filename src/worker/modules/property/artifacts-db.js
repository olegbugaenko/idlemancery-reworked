import {gameEffects, gameEntity, gameResources} from "game-framework";

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

export const registerArtifact = (id, options) => {

    options.searchableMeta = getResourceModifierDataSearchable(options.resourceModifier);

    let cost = options.cost;
    if(options.get_cost) {
        cost = options.get_cost();
    }
    const ingredients = Object.keys(cost);
    options.attributes = {...(options.attributes || {}), ingredients}
    gameEntity.registerGameEntity(id, options);
}

export const registerArtifactsStage1 = () => {

    registerArtifact('artifact_singing_amphora', {
        tags: ["artifact", "upgrade", "purchaseable"],
        name: 'Singing Amphora',
        allowedImpacts: ['effects','resources'],
        description: 'A magical vessel that resonates with mana, increasing your mana income through harmonic vibrations',
        level: 0,
        resourceModifier: {
            get_multiplier: () => ({
                resources: {
                    mana: {
                        A: 0.05,
                        B: 1,
                        C: 1.01,
                        type: 3,
                    }
                }
            })
        },
        get_cost: () => ({
            'inventory_vibrating_pot': {
                A: 1.2,
                B: 20,
                type: 1
            },
            'inventory_charged_amethyst': {
                A: 1.2,
                B: 20,
                type: 1
            },
            inventory_sapphire: {
                A: 1.2,
                B: 1000,
                type: 1
            }
        })
    })

    registerArtifact('artifact_vessel_of_wealth', {
        tags: ["artifact", "upgrade", "purchaseable"],
        name: 'Vessel of Wealth',
        allowedImpacts: ['effects','resources'],
        description: 'A magical container that expands your capacity to store wealth, increasing maximum coins',
        level: 0,
        resourceModifier: {
            get_rawCap: () => ({
                resources: {
                    coins: {
                        A: 0.1,
                        B: 1,
                        C: 1.05,
                        type: 3,
                    }
                }
            })
        },
        get_cost: () => ({
            'inventory_vibrating_pot': {
                A: 1.2,
                B: 15,
                type: 1
            },
            'inventory_ochre': {
                A: 1.2,
                B: 25,
                type: 1
            },
            'inventory_refined_wood': {
                A: 1.2,
                B: 30,
                type: 1
            }
        })
    })

    registerArtifact('artifact_figurine_of_balance', {
        tags: ["artifact", "upgrade", "purchaseable"],
        name: 'Figurine of Balance',
        allowedImpacts: ['effects','resources'],
        description: 'An ancient figurine that embodies perfect balance, accelerating the learning of routine actions',
        level: 0,
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    'routine_learning_speed': {
                        A: 0.12,
                        B: 1,
                        C: 1.02,
                        type: 3,
                    }
                }
            })
        },
        get_cost: () => ({
            'inventory_dynosaur_bone': {
                A: 1.2,
                B: 10,
                type: 1
            },
            'inventory_ochre': {
                A: 1.2,
                B: 20,
                type: 1
            },
            'inventory_ruby': {
                A: 1.2,
                B: 800,
                type: 1
            }
        })
    })

    registerArtifact('artifact_charged_hammer', {
        tags: ["artifact", "upgrade", "purchaseable"],
        name: 'Charged Hammer',
        allowedImpacts: ['effects','resources'],
        description: 'A masterwork hammer infused with ancient power and magical energy, greatly enhancing crafting intensity',
        level: 0,
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    'crafting_effort': {
                        A: 0.06,
                        B: 1,
                        C: 1.03,
                        type: 3,
                    }
                }
            })
        },
        get_cost: () => ({
            'inventory_dynosaur_bone': {
                A: 1.2,
                B: 12,
                type: 1
            },
            'inventory_charged_amethyst': {
                A: 1.2,
                B: 25,
                type: 1
            },
            'inventory_forged_steel': {
                A: 1.2,
                B: 18,
                type: 1
            }
        })
    })

    registerArtifact('artifact_endless_waterskin', {
        tags: ["artifact", "upgrade", "purchaseable"],
        name: 'Endless Waterskin',
        allowedImpacts: ['effects','resources'],
        description: 'A magical waterskin that never runs dry, allowing gatherers to focus entirely on their work without worrying about water supply',
        level: 0,
        resourceModifier: {
            get_multiplier: () => ({
                resources: {
                    'gathering_effort': {
                        A: 0.15,
                        B: 1,
                        C: 1.04,
                        type: 3,
                    }
                }
            })
        },
        get_cost: () => ({
            'inventory_hunter_flask': {
                A: 1.2,
                B: 20,
                type: 1
            },
            'inventory_charged_amethyst': {
                A: 1.2,
                B: 15,
                type: 1
            },
            'inventory_water': {
                A: 1.2,
                B: 100,
                type: 1
            }
        })
    })

    registerArtifact('artifact_focusing_monocle', {
        tags: ["artifact", "upgrade", "purchaseable"],
        name: 'Focusing Monocle',
        allowedImpacts: ['effects','resources'],
        description: 'A precision-crafted monocle that helps focus magical energy more efficiently, reducing the cost of magical actions',
        level: 0,
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    'magical_actions_discount': {
                        A: 0.08,
                        B: 1,
                        C: 1.02,
                        type: 3,
                    }
                }
            })
        },
        get_cost: () => ({
            'inventory_magic_lens': {
                A: 1.2,
                B: 25,
                type: 1
            },
            'inventory_dynosaur_bone': {
                A: 1.2,
                B: 18,
                type: 1
            },
            'inventory_refined_wood': {
                A: 1.2,
                B: 22,
                type: 1
            }
        })
    })

    registerArtifact('artifact_amplifier_optimizer', {
        tags: ["artifact", "upgrade", "purchaseable"],
        name: 'Amplifier Optimizer',
        allowedImpacts: ['effects','resources'],
        description: 'A sophisticated device that optimizes magical amplifier efficiency, significantly reducing their material costs',
        level: 0,
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    'amplifier_cost_reduction': {
                        A: 0.10,
                        B: 1,
                        C: 1.025,
                        type: 3,
                    }
                }
            })
        },
        get_cost: () => ({
            'inventory_magic_lens': {
                A: 1.2,
                B: 30,
                type: 1
            },
            'inventory_vibrating_pot': {
                A: 1.2,
                B: 20,
                type: 1
            },
            'inventory_sapphire': {
                A: 1.2,
                B: 800,
                type: 1
            }
        })
    })

}