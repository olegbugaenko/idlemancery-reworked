import { gameEntity } from "game-framework";

export const registerRitual = (id, options) => {

    gameEntity.registerGameEntity(id, {
        ...options,
    });
}

export const initRitualsDB = () => {

    registerRitual('ritual_body_and_mind', {
        name: 'Body and Mind Covenant',
        description: 'Ritual that weakens bodily regeneration but accelerates learning from physical effort and expeditions.',
        tags: ['magic-ritual', 'ritual', 'magic'],
        level: 1,
        isAbstract: true,
        resourceModifier: {
            multiplier: {
                resources: {
                    health: {
                        A: 0,
                        B: 0.1,
                        type: 0,
                    },
                    energy: {
                        A: 0,
                        B: 0.1,
                        type: 0,
                    }
                },
                effects: {
                    physical_training_learn_speed: {
                        A: 0,
                        B: 1.5,
                        type: 0,
                    },
                    expedition_xp_rate: {
                        A: 0,
                        B: 2,
                        type: 0,
                    }
                }
            }
        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_ritualism') > 0;
        }
    });

    registerRitual('ritual_arcane_focus', {
        name: 'Arcane Focus',
        description: 'Cuts off mana generation while greatly improving magical and mental training speed.',
        tags: ['magic-ritual', 'ritual', 'magic'],
        level: 1,
        isAbstract: true,
        resourceModifier: {
            multiplier: {
                resources: {
                    mana: {
                        A: 0,
                        B: 0.01,
                        type: 0,
                    },
                },
                effects: {
                    spiritual_learning_rate: {
                        A: 0,
                        B: 2,
                        type: 0,
                    },
                    mental_training_learning_rate: {
                        A: 0,
                        B: 2,
                        type: 0,
                    }
                }
            }
        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_ritualism') > 0;
        }
    });

    
    registerRitual('ritual_artisans_adjuration', {
        name: 'Artisans Adjuration',
        description: 'Increases crafting efficiency and reduces crafting costs, while decreasing learning speed.',
        tags: ['magic-ritual', 'ritual', 'magic'],
        level: 1,
        isAbstract: true,
        resourceModifier: {
            multiplier: {
                effects: {
                    crafting_efficiency: {
                        A: 0,
                        B: 2,
                        type: 0,
                    },
                    crafting_effort: {
                        A: 0,
                        B: 2,
                        type: 0,
                    },
                    learning_rate: {
                        A: 0,
                        B: 0.25,
                        type: 0,
                    }
                }
            }
        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_ritualism') > 0;
        }
    });
    
    
    registerRitual('ritual_nature_pact', {
        name: 'Nature Pact',
        description: 'Increases your gathering efficiency while reduce some technical aspects ',
        tags: ['magic-ritual', 'ritual', 'magic'],
        level: 1,
        isAbstract: true,
        resourceModifier: {
            multiplier: {
                effects: {
                    gathering_herbs_amount: {
                        A: 0,
                        B: 2,
                        type: 0,
                    },
                    crafting_effort: {
                        A: 0,
                        B: 0.25,
                        type: 0,
                    },
                    alchemy_effort: {
                        A: 0,
                        B: 0.25,
                        type: 0,
                    },
                    learning_rate: {
                        A: 0,
                        B: 0.75,
                        type: 0,
                    }
                }
            }
        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_ritualism') > 0;
        }
    });
}

