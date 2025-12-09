import {gameEntity, gameCore, gameEffects, gameResources} from "game-framework"

export const registerPermanentBonuses = () => {

    gameEntity.registerGameEntity('rare_titans_potion_effect', {
        tags: ["bonus", "permanent", "herbal"],
        name: 'Titans Potion',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_herbs_handbook_2') > 0;
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'physical_actions_discount': {
                        A: 100,
                        B: 1,
                        C: 0.05,
                        type: 5,
                    }
                }
            }
        }
    })


    gameEntity.registerGameEntity('rare_perseverance_potion_effect', {
        tags: ["bonus", "permanent", "herbal"],
        name: 'Perseverance Potion',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_herbs_handbook_2') > 0;
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'routine_actions_discount': {
                        A: 100,
                        B: 1,
                        C: 0.05,
                        type: 5,
                    }
                }
            }
        }
    })



    gameEntity.registerGameEntity('rare_mental_potion_effect', {
        tags: ["bonus", "permanent", "herbal"],
        name: 'Mental Potion',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_herbs_handbook_2') > 0;
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'mental_actions_discount': {
                        A: 100,
                        B: 1,
                        C: 0.05,
                        type: 5,
                    }
                }
            }
        }
    })



    gameEntity.registerGameEntity('rare_spirit_potion_effect', {
        tags: ["bonus", "permanent", "herbal"],
        name: 'Spirit Potion',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_herbs_handbook_2') > 0;
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'magical_actions_discount': {
                        A: 100,
                        B: 1,
                        C: 0.05,
                        type: 5,
                    }
                }
            }
        }
    })

    gameEntity.registerGameEntity('rare_charisma_potion_effect', {
        tags: ["bonus", "permanent", "herbal"],
        name: 'Charisma Potion',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_herbs_handbook_2') > 0;
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'social_actions_discount': {
                        A: 100,
                        B: 1,
                        C: 0.05,
                        type: 5,
                    }
                }
            }
        }
    })



    gameEntity.registerGameEntity('rare_ironvine_effect', {
        tags: ["bonus", "permanent", "herbal"],
        name: 'Ironvine',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_herbs_handbook_1') > 0;
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'physical_training_learn_speed': {
                        A: 0.005,
                        B: 50,
                        C: 1,
                        diminish: 0.33,
                        type: 4,
                    }
                }
            }
        }
    })


    gameEntity.registerGameEntity('rare_mindspire_effect', {
        tags: ["bonus", "permanent", "herbal"],
        name: 'Mindspire',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_herbs_handbook_1') > 0;
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'mental_training_learning_rate': {
                        A: 0.005,
                        B: 50,
                        C: 1,
                        diminish: 0.33,
                        type: 4,
                    }
                }
            }
        }
    })

    gameEntity.registerGameEntity('rare_whisperleaf_effect', {
        tags: ["bonus", "permanent", "herbal"],
        name: 'Whisperleaf',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_herbs_handbook_1') > 0;
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'social_training_learning_rate': {
                        A: 0.005,
                        B: 50,
                        C: 1,
                        diminish: 0.33,
                        type: 4,
                    }
                }
            }
        }
    })

    gameEntity.registerGameEntity('rare_sageroot_effect', {
        tags: ["bonus", "permanent", "herbal"],
        name: 'Sageroot',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_herbs_handbook_1') > 0;
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                resources: {
                    'knowledge': {
                        A: 0.003,
                        B: 50,
                        C: 1,
                        type: 4,
                    }
                }
            }
        }
    })


    gameEntity.registerGameEntity('rare_verdant_coil_effect', {
        tags: ["bonus", "permanent", "herbal"],
        name: 'Verdant Coil',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_herbs_handbook_3') > 0;
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'routine_learning_speed': {
                        A: 0.005,
                        B: 50,
                        C: 1,
                        diminish: 0.33,
                        type: 4,
                    }
                }
            }
        }
    })

    gameEntity.registerGameEntity('rare_stormbird_heart_effect', {
        tags: ["bonus", "permanent", "nutrition"],
        name: 'Stormbird Heart',
        level: 0,
        unlockCondition: () => {
            return gameResources.isResourceUnlocked('inventory_hunting_net');
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'elemental_spells_efficiency': {
                        A: 0.005,
                        B: 50,
                        C: 1,
                        diminish: 0.33,
                        type: 4,
                    }
                }
            }
        }
    })


    gameEntity.registerGameEntity('rare_greyhorn_brain_effect', {
        tags: ["bonus", "permanent", "nutrition"],
        name: 'Greyhorn Brain',
        level: 0,
        unlockCondition: () => {
            return gameResources.isResourceUnlocked('inventory_hunting_net');
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'learning_rate': {
                        A: 0.002,
                        B: 50,
                        C: 1,
                        diminish: 0.33,
                        type: 4,
                    }
                }
            }
        }
    })

    /*gameEntity.registerGameEntity('random_events_strength_effect', {
        tags: ["bonus", "permanent", "herbal"],
        name: 'Random Events Bonus',
        level: 0,
        unlockCondition: () => {

        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            income: {
                effects: {
                    'attribute_strength': {
                        A: 1,
                        B: 0,
                        type: 0,
                    }
                }
            }
        }
    })


    gameEntity.registerGameEntity('random_events_stamina_effect', {
        tags: ["bonus", "permanent", "herbal"],
        name: 'Random Events Bonus',
        level: 0,
        unlockCondition: () => {

        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            income: {
                effects: {
                    'attribute_stamina': {
                        A: 1,
                        B: 0,
                        type: 0,
                    }
                }
            }
        }
    })

    gameEntity.registerGameEntity('random_events_recovery_effect', {
        tags: ["bonus", "permanent", "herbal"],
        name: 'Random Events Bonus',
        level: 0,
        unlockCondition: () => {

        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            income: {
                effects: {
                    'attribute_recovery': {
                        A: 1,
                        B: 0,
                        type: 0,
                    }
                }
            }
        }
    })


    gameEntity.registerGameEntity('random_events_charisma_effect', {
        tags: ["bonus", "permanent", "herbal"],
        name: 'Random Events Bonus',
        level: 0,
        unlockCondition: () => {

        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            income: {
                effects: {
                    'attribute_charisma': {
                        A: 1,
                        B: 0,
                        type: 0,
                    }
                }
            }
        }
    })

    gameEntity.registerGameEntity('random_events_memory_effect', {
        tags: ["bonus", "permanent", "herbal"],
        name: 'Random Events Bonus',
        level: 0,
        unlockCondition: () => {

        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            income: {
                effects: {
                    'attribute_memory': {
                        A: 1,
                        B: 0,
                        type: 0,
                    }
                }
            }
        }
    })

    gameEntity.registerGameEntity('random_events_magic_ability_effect', {
        tags: ["bonus", "permanent", "herbal"],
        name: 'Random Events Bonus',
        level: 0,
        unlockCondition: () => {

        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            income: {
                effects: {
                    'attribute_magic_ability': {
                        A: 1,
                        B: 0,
                        type: 0,
                    }
                }
            }
        }
    })*/

    gameEntity.registerGameEntity('rare_craftmasters_elixir_effect', {
        tags: ["bonus", "permanent", "herbal"],
        name: 'Craftmaster\'s Elixir',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_advanced_alchemy') > 0;
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'crafting_effort': {
                        A: 100,
                        B: 1,
                        C: 0.05,
                        type: 5,
                        diminishStep: 1000,
                    }
                }
            }
        }
    })

    gameEntity.registerGameEntity('rare_herbalists_elixir_effect', {
        tags: ["bonus", "permanent", "herbal"],
        name: 'Herbalist\'s Elixir',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_advanced_alchemy') > 0;
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'gathering_herbs_amount': {
                        A: 100,
                        B: 1,
                        C: 0.02,
                        type: 5,
                        diminishStep: 1000,
                    }
                }
            }
        }
    })

    gameEntity.registerGameEntity('rare_alchemists_elixir_effect', {
        tags: ["bonus", "permanent", "herbal"],
        name: 'Alchemist\'s Elixir',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_advanced_alchemy') > 0;
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'alchemy_effort': {
                        A: 100,
                        B: 1,
                        C: 0.05,
                        type: 5,
                        diminishStep: 1000,
                    }
                }
            }
        }
    })

    gameEntity.registerGameEntity('rare_elementalists_elixir_effect', {
        tags: ["bonus", "permanent", "herbal"],
        name: 'Elementalist\'s Elixir',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_advanced_alchemy') > 0;
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'elemental_spells_efficiency': {
                        A: 100,
                        B: 1,
                        C: 0.05,
                        type: 5,
                        diminishStep: 1000,
                    }
                }
            }
        }
    })

    gameEntity.registerGameEntity('rare_diplomats_elixir_effect', {
        tags: ["bonus", "permanent", "herbal"],
        name: 'Diplomat\'s Elixir',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_advanced_alchemy') > 0;
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'socio_campaign_efficiency': {
                        A: 100,
                        B: 1,
                        C: 0.02,
                        type: 5,
                        diminishStep: 1000,
                        diminish: 0.85,
                    }
                }
            }
        }
    })

    // Compound Elixirs (Expertise Alchemy)
    gameEntity.registerGameEntity('compound_laborers_effect', {
        tags: ["bonus", "permanent", "compound", "alchemy"],
        name: 'Laborer\'s Compound',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_expertise_alchemy') > 0;
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'manual_labor_efficiency': {
                        A: 50,
                        B: 1,
                        C: 0.01,
                        type: 5,
                        diminishStep: 500,
                        diminish: 0.8,
                    }
                }
            }
        }
    })

    gameEntity.registerGameEntity('compound_zookeepers_effect', {
        tags: ["bonus", "permanent", "compound", "alchemy"],
        name: 'Zookeeper\'s Compound',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_expertise_alchemy') > 0;
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                resources: {
                    'magic_zoo_space': {
                        A: 50,
                        B: 1,
                        C: 0.005,
                        type: 5,
                        diminishStep: 500,
                        diminish: 0.8,
                    }
                }
            }
        }
    })

    gameEntity.registerGameEntity('compound_conjurers_effect', {
        tags: ["bonus", "permanent", "compound", "alchemy"],
        name: 'Conjurer\'s Compound',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_expertise_alchemy') > 0;
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'conjuration_spells_efficiency': {
                        A: 50,
                        B: 1,
                        C: 0.01,
                        type: 5,
                        diminishStep: 500,
                        diminish: 0.8,
                    }
                }
            }
        }
    })

    gameEntity.registerGameEntity('compound_publishers_effect', {
        tags: ["bonus", "permanent", "compound", "alchemy"],
        name: 'Publisher\'s Compound',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_expertise_alchemy') > 0;
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'press_learning_speed': {
                        A: 50,
                        B: 1,
                        C: 0.01,
                        type: 5,
                        diminishStep: 500,
                        diminish: 0.8,
                    }
                }
            }
        }
    })

    gameEntity.registerGameEntity('compound_artisans_effect', {
        tags: ["bonus", "permanent", "compound", "alchemy"],
        name: 'Artisan\'s Compound',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_expertise_alchemy') > 0;
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'accessories_discount': {
                        A: 50,
                        B: 1,
                        C: 0.01,
                        type: 5,
                        diminishStep: 500,
                        diminish: 0.8,
                    }
                }
            }
        }
    })

}