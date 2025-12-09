import {gameEntity, gameEffects} from "game-framework"

export const registerPressJournals = () => {
    // Science Magazine: mental discount
    gameEntity.registerGameEntity('press_journal_science', {
        tags: ["press_journal", "press", "science"],
        name: 'Science Magazine',
        description: 'Popular science periodical increasing mental XP discounts.',
        class: 'journal',
        level: 0,
        minDemoVersion: 20,
        unlockCondition: () => gameEntity.getLevel('printing_machine') > 0,
        attributes: {
            baseXPCost: 100,
        },
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    'mental_actions_discount': {
                        A: 0.01,
                        B: 1,
                        C: 1.0007,
                        type: 3
                    },
                }
            })
        }
    })
    // News Journal: social XP discount
    gameEntity.registerGameEntity('press_journal_news', {
        tags: ["press_journal", "press", "news"],
        name: 'News Journal',
        description: 'Enables fact-based journalism to further social efficiency.',
        class: 'journal',
        level: 0,
        minDemoVersion: 20,
        unlockCondition: () => gameEntity.getLevel('printing_machine') > 0,
        attributes: {
            baseXPCost: 100,
        },
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    'social_actions_discount': {
                        A: 0.01,
                        B: 1,
                        C: 1.0007,
                        type: 3
                    },
                }
            })
        }
    })
    // Medical Journal: physical XP discount
    gameEntity.registerGameEntity('press_journal_medical', {
        tags: ["press_journal", "press", "medical"],
        name: 'Medical Journal',
        description: 'Advances in health and fitness techniques reduce physical training effort.',
        class: 'journal',
        level: 0,
        minDemoVersion: 20,
        unlockCondition: () => gameEntity.getLevel('printing_machine') > 0,
        attributes: {
            baseXPCost: 100,
        },
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    'physical_actions_discount': {
                        A: 0.01,
                        B: 1,
                        C: 1.0007,
                        type: 3
                    },
                }
            })
        }
    })
    
    // Gardener's Notes: routine XP discount
    gameEntity.registerGameEntity('press_journal_gardening', {
        tags: ["press_journal", "press", "gardening"],
        name: 'Gardener\'s Notes',
        description: 'Practical tips and seasonal advice that make routine tasks more efficient.',
        class: 'journal',
        level: 0,
        minDemoVersion: 20,
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_charisma',
            level: 400000,
        }],
        attributes: {
            baseXPCost: 100,
        },
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    'routine_actions_discount': {
                        A: 0.01,
                        B: 1,
                        C: 1.0007,
                        type: 3
                    },
                }
            })
        }
    })
    
    // Arcane Tribune: magical XP discount
    gameEntity.registerGameEntity('press_journal_arcane', {
        tags: ["press_journal", "press", "arcane"],
        name: 'Arcane Tribune',
        description: 'Scholarly articles on magical theory and spellcraft optimization techniques.',
        class: 'journal',
        level: 0,
        minDemoVersion: 20,
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_charisma',
            level: 400000,
        }],
        attributes: {
            baseXPCost: 100,
        },
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    'magical_actions_discount': {
                        A: 0.01,
                        B: 1,
                        C: 1.0007,
                        type: 3
                    },
                }
            })
        }
    })
}
