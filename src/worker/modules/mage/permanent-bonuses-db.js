import {gameEntity, gameCore, gameEffects, gameResources} from "game-framework"

export const registerPermanentBonuses = () => {

    gameEntity.registerGameEntity('rare_titanleaf_effect', {
        tags: ["bonus", "permanent", "herbal"],
        name: 'Titan Leaf',
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
                    'attribute_strength': {
                        A: 0.004,
                        B: 50,
                        C: 1,
                        type: 4,
                    }
                }
            }
        }
    })


    gameEntity.registerGameEntity('rare_heartroot_effect', {
        tags: ["bonus", "permanent", "herbal"],
        name: 'Heartroot',
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
                    'attribute_vitality': {
                        A: 0.004,
                        B: 50,
                        C: 1,
                        type: 4,
                    }
                }
            }
        }
    })



    gameEntity.registerGameEntity('rare_energloom_effect', {
        tags: ["bonus", "permanent", "herbal"],
        name: 'Energloom',
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
                    'attribute_stamina': {
                        A: 0.004,
                        B: 50,
                        C: 1,
                        type: 4,
                    }
                }
            }
        }
    })



    gameEntity.registerGameEntity('rare_lifebloom_effect', {
        tags: ["bonus", "permanent", "herbal"],
        name: 'Lifebloom',
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
                    'attribute_recovery': {
                        A: 0.004,
                        B: 50,
                        C: 1,
                        type: 4,
                    }
                }
            }
        }
    })



    gameEntity.registerGameEntity('rare_stillfern_effect', {
        tags: ["bonus", "permanent", "herbal"],
        name: 'Stillfern',
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
                    'attribute_patience': {
                        A: 0.004,
                        B: 50,
                        C: 1,
                        type: 4,
                    }
                }
            }
        }
    })



    gameEntity.registerGameEntity('rare_mindroot_effect', {
        tags: ["bonus", "permanent", "herbal"],
        name: 'Mindroot',
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
                    'attribute_memory': {
                        A: 0.004,
                        B: 50,
                        C: 1,
                        type: 4,
                    }
                }
            }
        }
    })



    gameEntity.registerGameEntity('rare_azureblossom_effect', {
        tags: ["bonus", "permanent", "herbal"],
        name: 'Azureblossom',
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
                    'attribute_magic_ability': {
                        A: 0.004,
                        B: 50,
                        C: 1,
                        type: 4,
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

}