import { gameEntity, gameCore, gameEffects } from "game-framework"

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
                        A: 0.0005,
                        B: 100,
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
                        A: 0.0005,
                        B: 100,
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
                        A: 0.0005,
                        B: 100,
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
                        A: 0.0005,
                        B: 100,
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
                        A: 0.0005,
                        B: 100,
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
                        A: 0.0005,
                        B: 100,
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
                        A: 0.0005,
                        B: 100,
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
            return gameEntity.getLevel('shop_item_herbs_handbook_2') > 0;
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'physical_training_learn_speed': {
                        A: 0.0005,
                        B: 100,
                        C: 1,
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
            return gameEntity.getLevel('shop_item_herbs_handbook_2') > 0;
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'mental_training_learning_rate': {
                        A: 0.0005,
                        B: 100,
                        C: 1,
                        type: 4,
                    }
                }
            }
        }
    })
}