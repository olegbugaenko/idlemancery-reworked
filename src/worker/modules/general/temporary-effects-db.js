import {gameEntity} from "game-framework";
import {getCostReduction} from "../magic/spells-db";

export const registerTemporaryEffectsDB = () => {

    gameEntity.registerGameEntity('temporary_energized', {
        name: 'Energized',
        description: 'Your energy income is boosted',
        hasCap: false,
        tags: ['effect', 'temporary'],
        defaultCap: 0,
        isAbstract: true,
        level: 1,
        onUse: (amount) => {

        },
        resourceModifier: {
            multiplier: {
                resources: {
                    energy: {
                        A: 0.1,
                        B: 1.4,
                        type: 0,
                    }
                }
            },
        },
        attributes: {
            duration: 300,
            className: 'buff',
        },
        unlockCondition: () => {

        },
    })


    gameEntity.registerGameEntity('temporary_energy_debuff', {
        name: 'Energy Debuff',
        description: 'You feel weakened. Your energy regeneration is decreased',
        hasCap: false,
        tags: ['effect', 'temporary'],
        defaultCap: 0,
        isAbstract: true,
        level: 1,
        onUse: (amount) => {

        },
        resourceModifier: {
            multiplier: {
                resources: {
                    energy: {
                        A: 0.8,
                        B: 0.8,
                        type: 1,
                    }
                }
            },
        },
        attributes: {
            duration: 300,
            className: 'debuff',
        },
        unlockCondition: () => {

        },
    })

    gameEntity.registerGameEntity('temporary_health_regen', {
        name: 'Health Regeneration',
        description: 'Your health regeneration was increased',
        hasCap: false,
        tags: ['effect', 'temporary'],
        defaultCap: 0,
        isAbstract: true,
        level: 1,
        onUse: (amount) => {

        },
        resourceModifier: {
            multiplier: {
                resources: {
                    health: {
                        A: 0.1,
                        B: 1.4,
                        type: 0,
                    }
                }
            },
        },
        attributes: {
            duration: 300,
            className: 'buff',
        },
        unlockCondition: () => {

        },
    })


    gameEntity.registerGameEntity('temporary_health_debuff', {
        name: 'Injury',
        description: 'You are injured. Your health regeneration is decreased',
        hasCap: false,
        tags: ['effect', 'temporary'],
        defaultCap: 0,
        isAbstract: true,
        level: 1,
        onUse: (amount) => {

        },
        resourceModifier: {
            multiplier: {
                resources: {
                    health: {
                        A: 0.8,
                        B: 0.8,
                        type: 1,
                    }
                }
            },
        },
        attributes: {
            duration: 300,
            className: 'debuff',
        },
        unlockCondition: () => {

        },
    })

    gameEntity.registerGameEntity('temporary_mana_regen', {
        name: 'Mana Regeneration',
        description: 'Your mana regeneration was increased',
        hasCap: false,
        tags: ['effect', 'temporary'],
        defaultCap: 0,
        isAbstract: true,
        level: 1,
        onUse: (amount) => {

        },
        resourceModifier: {
            multiplier: {
                resources: {
                    mana: {
                        A: 0.1,
                        B: 1.4,
                        type: 0,
                    }
                }
            },
        },
        attributes: {
            duration: 300,
            className: 'buff',
        },
        unlockCondition: () => {

        },
    })


    gameEntity.registerGameEntity('temporary_mana_debuff', {
        name: 'Mana Instability',
        description: 'Your mana regeneration is decreased',
        hasCap: false,
        tags: ['effect', 'temporary'],
        defaultCap: 0,
        isAbstract: true,
        level: 1,
        onUse: (amount) => {

        },
        resourceModifier: {
            multiplier: {
                resources: {
                    mana: {
                        A: 0.8,
                        B: 0.8,
                        type: 1,
                    }
                }
            },
        },
        attributes: {
            duration: 300,
            className: 'debuff',
        },
        unlockCondition: () => {

        },
    })

    gameEntity.registerGameEntity('temporary_knowledge_gain', {
        name: 'Knowledge Gain',
        description: 'Your knowledge gain was increased',
        hasCap: false,
        tags: ['effect', 'temporary'],
        defaultCap: 0,
        isAbstract: true,
        level: 1,
        onUse: (amount) => {

        },
        resourceModifier: {
            multiplier: {
                resources: {
                    knowledge: {
                        A: 0.1,
                        B: 1.4,
                        type: 0,
                    }
                }
            },
        },
        attributes: {
            duration: 300,
            className: 'buff',
        },
        unlockCondition: () => {

        },
    })


    gameEntity.registerGameEntity('temporary_knowledge_debuff', {
        name: 'Knowledge Debuff',
        description: 'You feel yourself dummy. Your knowledge gain is decreased',
        hasCap: false,
        tags: ['effect', 'temporary'],
        defaultCap: 0,
        isAbstract: true,
        level: 1,
        onUse: (amount) => {

        },
        resourceModifier: {
            multiplier: {
                resources: {
                    knowledge: {
                        A: 0.8,
                        B: 0.8,
                        type: 1,
                    }
                }
            },
        },
        attributes: {
            duration: 300,
            className: 'debuff',
        },
        unlockCondition: () => {

        },
    })

    gameEntity.registerGameEntity('temporary_coins_bonus', {
        name: 'Coins Earned Bonus',
        description: 'Your coins income is boosted',
        hasCap: false,
        tags: ['effect', 'temporary'],
        defaultCap: 0,
        isAbstract: true,
        level: 1,
        onUse: (amount) => {

        },
        resourceModifier: {
            multiplier: {
                resources: {
                    coins: {
                        A: 0.1,
                        B: 1.4,
                        type: 0,
                    }
                }
            },
        },
        attributes: {
            duration: 300,
            className: 'buff',
        },
        unlockCondition: () => {

        },
    })


    gameEntity.registerGameEntity('temporary_learn_rate', {
        name: 'Learning Rate Bonus',
        description: 'Your learning speed is increased',
        hasCap: false,
        tags: ['effect', 'temporary'],
        defaultCap: 0,
        isAbstract: true,
        level: 1,
        onUse: (amount) => {

        },
        resourceModifier: {
            multiplier: {
                effects: {
                    learning_rate: {
                        A: 0.05,
                        B: 1.2,
                        type: 0,
                    }
                }
            },
        },
        attributes: {
            duration: 300,
            className: 'buff',
        },
        unlockCondition: () => {

        },
    })


    gameEntity.registerGameEntity('temporary_physical_training_rate', {
        name: 'Physical Training Bonus',
        description: 'Your learning speed for physical training is increased',
        hasCap: false,
        tags: ['effect', 'temporary'],
        defaultCap: 0,
        isAbstract: true,
        level: 1,
        onUse: (amount) => {

        },
        resourceModifier: {
            multiplier: {
                effects: {
                    physical_training_learn_speed: {
                        A: 0.1,
                        B: 1.4,
                        type: 0,
                    }
                }
            },
        },
        attributes: {
            duration: 300,
            className: 'buff',
        },
        unlockCondition: () => {

        },
    })

    gameEntity.registerGameEntity('temporary_mental_training_rate', {
        name: 'Mental Training Bonus',
        description: 'Your learning speed for mental training is increased',
        hasCap: false,
        tags: ['effect', 'temporary'],
        defaultCap: 0,
        isAbstract: true,
        level: 1,
        onUse: (amount) => {

        },
        resourceModifier: {
            multiplier: {
                effects: {
                    mental_training_learning_rate: {
                        A: 0.1,
                        B: 1.4,
                        type: 0,
                    }
                }
            },
        },
        attributes: {
            duration: 300,
            className: 'buff',
        },
        unlockCondition: () => {

        },
    })

}