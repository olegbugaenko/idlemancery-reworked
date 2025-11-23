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
    const originalUnlockCondition = options.unlockCondition;
    options.unlockCondition = () => {
        if(!gameEntity.isEntityUnlocked('action_expedition')) return false;
        if(originalUnlockCondition) return originalUnlockCondition();
        return true;
    }
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
            get_capMult: () => ({
                resources: {
                    coins: {
                        A: 0.05,
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

    // New artifacts crafted from Wild Hunt materials
    // Scholar's Kit — increases knowledge generation
    registerArtifact('artifact_scholars_kit', {
        tags: ["artifact", "upgrade", "purchaseable", "paper"],
        name: 'Scholar\'s Kit',
        allowedImpacts: ['resources'],
        description: 'A curated scholarly set that enhances your study discipline, increasing knowledge generation.',
        level: 0,
        resourceModifier: {
            get_multiplier: () => ({
                resources: {
                    'knowledge': {
                        A: 0.04,
                        B: 1,
                        C: 1.01,
                        type: 0,
                    }
                }
            })
        },
        get_cost: () => ({
            'inventory_boar_hide': { A: 1.2, B: 8, type: 1 },
            'inventory_pince_nez': { A: 1.2, B: 6, type: 1 },
            'inventory_paper': { A: 1.2, B: 20000, type: 1 },
        })
    })

    // Hunter's Flask — increases expedition XP rate
    registerArtifact('artifact_hunters_flask', {
        tags: ["artifact", "upgrade", "purchaseable", "expedition"],
        name: 'Hunter\'s Flask',
        allowedImpacts: ['effects'],
        description: 'A battle-tested flask decorated with trophies, invigorating your senses and hastening expedition experience.',
        level: 0,
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    'expedition_xp_rate': {
                        A: 0.1,
                        B: 1,
                        C: 1.03,
                        type: 3,
                    }
                }
            })
        },
        get_cost: () => ({
            'inventory_wolve_tooth': { A: 1.2, B: 12, type: 1 },
            'inventory_bear_claw': { A: 1.2, B: 8, type: 1 },
            'inventory_hunter_flask': { A: 1.2, B: 10, type: 1 },
        })
    })

    // Spear of the Stalwart — increases energy cap
    registerArtifact('artifact_spear_of_the_stalwart', {
        tags: ["artifact", "upgrade", "purchaseable", "physical"],
        name: 'Spear of the Stalwart',
        allowedImpacts: ['resources'],
        description: 'A rugged spear symbolizing endurance. Its aura fortifies your vigor, increasing maximum energy.',
        level: 0,
        resourceModifier: {
            get_capMult: () => ({
                resources: {
                    'energy': {
                        A: 0.10,
                        B: 1,
                        C: 1.02,
                        type: 3,
                    }
                }
            })
        },
        get_cost: () => ({
            'inventory_bear_claw': { A: 1.2, B: 6, type: 1 },
            'inventory_ochre': { A: 1.2, B: 20, type: 1 },
            'inventory_refined_wood': { A: 1.2, B: 300000, type: 1 },
        })
    })

    // Flask of Recovery — increases health cap
    registerArtifact('artifact_flask_of_recovery', {
        tags: ["artifact", "upgrade", "purchaseable"],
        name: 'Flask of Recovery',
        allowedImpacts: ['resources'],
        description: 'A restorative brew that reinforces the body, increasing maximum health.',
        level: 0,
        resourceModifier: {
            get_capMult: () => ({
                resources: {
                    'health': {
                        A: 0.10,
                        B: 1,
                        C: 1.02,
                        type: 3,
                    }
                }
            })
        },
        get_cost: () => ({
            'inventory_wolve_tooth': { A: 1.2, B: 10, type: 1 },
            'inventory_hunter_flask': { A: 1.2, B: 8, type: 1 },
            'inventory_water': { A: 1.2, B: 200, type: 1 },
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

    registerArtifact('artifact_enchanted_paper_optimizer', {
        tags: ["artifact", "upgrade", "purchaseable", "mineral", "device"],
        name: 'Enchanted Paper Optimizer',
        allowedImpacts: ['effects'],
        description: 'A sophisticated artifact crafted from magical lens, sapphire, and charged amethyst that optimizes the mana consumption when crafting enchanted paper, significantly reducing the magical energy required',
        level: 0,
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    'enchanted_paper_mana_discount': {
                        A: 0.2,
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
            'inventory_sapphire': {
                A: 1.2,
                B: 500,
                type: 1
            },
            'inventory_charged_amethyst': {
                A: 1.2,
                B: 30,
                type: 1
            }
        })
    })

    // Magical Bookmark + Dynosaur Bone + Refined Wood -> Tome accessories efficiency
    registerArtifact('artifact_scholars_bookmark', {
        tags: ["artifact", "upgrade", "purchaseable"],
        name: 'Scholar\'s Bookmark',
        allowedImpacts: ['effects'],
        description: 'An enchanted marker carved onto ancient bone and wood. It subtly amplifies the power of accessories classified as tomes.',
        level: 0,
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    'tome_accessories_efficiency': {
                        A: 0.05,
                        B: 1,
                        C: 1.02,
                        type: 3,
                    }
                }
            })
        },
        get_cost: () => ({
            'inventory_magical_bookmark': { A: 1.2, B: 10, type: 1 },
            'inventory_dynosaur_bone': { A: 1.2, B: 8, type: 1 },
            'inventory_refined_wood': { A: 1.2, B: 150000, type: 1 },
        })
    })

    // Vibrating Pot + Scribe Quill + Red Ink -> Alchemy effort boost
    registerArtifact('artifact_alchemists_resonator', {
        tags: ["artifact", "upgrade", "purchaseable"],
        name: 'Alchemist\'s Resonator',
        allowedImpacts: ['effects'],
        description: 'A resonant set crafted from an enchanted vessel, a master quill and ritual ink. It heightens alchemical intensity.',
        level: 0,
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    'alchemy_effort': {
                        A: 0.08,
                        B: 1,
                        C: 1.02,
                        type: 3,
                    }
                }
            })
        },
        get_cost: () => ({
            'inventory_vibrating_pot': { A: 1.2, B: 10, type: 1 },
            'inventory_scribe_quill': { A: 1.2, B: 10, type: 1 },
            'inventory_red_ink': { A: 1.2, B: 2000, type: 1 },
        })
    })

    // Magic Lens + Magical Bookmark + Sapphire -> Knowledge cap boost
    registerArtifact('artifact_lens_of_retention', {
        tags: ["artifact", "upgrade", "purchaseable", "mineral", "device"],
        name: 'Lens of Retention',
        allowedImpacts: ['resources'],
        description: 'A precise assembly that focuses insight through a sapphire core and mnemonic bookmark, increasing knowledge capacity.',
        level: 0,
        resourceModifier: {
            get_capMult: () => ({
                resources: {
                    'knowledge': {
                        A: 0.10,
                        B: 1,
                        C: 1.02,
                        type: 3,
                    }
                }
            })
        },
        get_cost: () => ({
            'inventory_magic_lens': { A: 1.2, B: 12, type: 1 },
            'inventory_magical_bookmark': { A: 1.2, B: 10, type: 1 },
            'inventory_sapphire': { A: 1.2, B: 6000, type: 1 },
        })
    })

    // Scribe Quill + Magical Bookmark + Paper -> Mental training learning speed
    registerArtifact('artifact_scholars_set', {
        tags: ["artifact", "upgrade", "purchaseable", "paper"],
        name: 'Scholar\'s Set',
        allowedImpacts: ['effects'],
        description: 'A classic study kit that inspires dedication and clarity, improving mental training learning rate.',
        level: 0,
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    'mental_training_learning_rate': {
                        A: 0.12,
                        B: 1,
                        C: 1.02,
                        type: 3,
                    }
                }
            })
        },
        get_cost: () => ({
            'inventory_scribe_quill': { A: 1.2, B: 10, type: 1 },
            'inventory_magical_bookmark': { A: 1.2, B: 10, type: 1 },
            'inventory_paper': { A: 1.2, B: 5000, type: 1 },
        })
    })

    // Titan's Dumbbell — Dynosaur Bone + Ochre + Magic Feather -> boosts physical training learning rate
    registerArtifact('artifact_titans_dumbbell', {
        tags: ["artifact", "upgrade", "purchaseable", "physical", "training"],
        name: 'Titan\'s Dumbbell',
        allowedImpacts: ['effects'],
        description: 'You almost faint from the sheer grandeur and power of this artifact—once wielded by the Titans themselves to forge their mighty muscles.',
        level: 0,
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    'physical_training_learn_speed': {
                        A: 0.16,
                        B: 1,
                        C: 1.02,
                        type: 3,
                    }
                }
            })
        },
        get_cost: () => ({
            'inventory_dynosaur_bone': { A: 1.2, B: 12, type: 1 },
            'inventory_ochre': { A: 1.2, B: 15, type: 1 },
            'inventory_scribe_quill': { A: 1.2, B: 10, type: 1 },
        }),
        unlockCondition: () => {
            return gameEntity.isEntityUnlocked('expedition_ancient_library');
        }
    })

    registerArtifact('artifact_reading_spectacles', {
        tags: ["artifact", "upgrade", "purchaseable", "mineral", "device"],
        name: 'Reading Spectacles',
        allowedImpacts: ['effects'],
        description: 'Magical spectacles crafted from pince-nez, charged amethyst, and refined wood that enhance your ability to read and comprehend books, significantly increasing reading efficiency',
        level: 0,
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    'books_learning_rate': {
                        A: 0.15,
                        B: 1,
                        C: 1.02,
                        type: 3,
                    }
                }
            })
        },
        get_cost: () => ({
            'inventory_pince_nez': {
                A: 1.2,
                B: 15,
                type: 1
            },
            'inventory_charged_amethyst': {
                A: 1.2,
                B: 25,
                type: 1
            },
            'inventory_refined_wood': {
                A: 1.2,
                B: 200000,
                type: 1
            }
        }),
        unlockCondition: () => {
            return gameEntity.isEntityUnlocked('expedition_ancient_library');
        }
    })

}