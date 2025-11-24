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
                        B: 0.25,
                        type: 0,
                    },
                    energy: {
                        A: 0,
                        B: 0.25,
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
                        B: 0,
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
}

