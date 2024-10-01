import { gameEntity, gameCore, gameEffects } from "game-framework"

export const initSpellsDB1 = () => {

    gameEntity.registerGameEntity('spell_magic_insight', {
        name: 'Magic Insight',
        description: 'Use your magic capabilities to understand world better',
        hasCap: false,
        tags: ['spell', 'magic', 'mental', 'mental_magic'],
        defaultCap: 0,
        isAbstract: true,
        level: 1,
        onUse: (amount) => {

        },
        getUsageCooldown: () => {
            return 10;
        },
        usageGain: {
            get_income: () => ({
                resources: {
                    knowledge: {
                        A: 5,
                        B: 0,
                        type: 0,
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    mana: {
                        A: 5,
                        B: 0,
                        type: 0,
                    }
                }
            })
        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_spellbook') > 0
        },
    })

    gameEntity.registerGameEntity('spell_focus', {
        name: 'Focus',
        description: 'Improve your learning capabilities using magic',
        hasCap: false,
        tags: ['spell', 'magic', 'mental', 'mental_magic'],
        defaultCap: 0,
        isAbstract: true,
        level: 1,
        onUse: (amount) => {

        },
        getUsageCooldown: () => {
            return 10;
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    learning_rate: {
                        A: 0.5,
                        B: 1,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    mana: {
                        A: 0,
                        B: 1,
                        type: 0,
                    }
                }
            }
        },
        usageGain: {
            get_consumption: () => ({
                resources: {
                    mana: {
                        A: 3,
                        B: 0,
                        type: 0,
                    }
                }
            })
        },
        attributes: {
            duration: 10,
        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_spellbook') > 0
        },
    })

}