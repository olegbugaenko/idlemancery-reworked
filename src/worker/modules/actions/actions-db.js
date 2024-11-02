import {gameEntity, gameCore, gameEffects, gameResources, resourceModifiers} from "game-framework"

const getPrimaryBonus = (attributeId) => {
    return 0.98 + 0.02*gameEffects.getEffectValue(attributeId);
}

const registerGameAction = (id, options) => {
    
    const primaryAttribute = options.attributes.primaryAttribute;
    
    if(!primaryAttribute || !options.resourceModifier) {
        return gameEntity.registerGameEntity(id, options);
    }
    
    if(!options.resourceModifier.effectDeps) {
        options.resourceModifier.effectDeps = []
    }

    if(!options.resourceModifier.effectDeps.includes(primaryAttribute)) {
        options.resourceModifier.effectDeps.push(primaryAttribute);
    }
    
    options.getPrimaryEffect = () => getPrimaryBonus(primaryAttribute);

    if(options.attributes.isTraining) {
        options.resourceModifier.customAmplifierApplyTypes = ['resources']
    } else {
        options.resourceModifier.customAmplifierApplyTypes = ['effects', 'resources']
    }

    options.resourceModifier.getCustomAmplifier = () => options.getPrimaryEffect();
    
    return gameEntity.registerGameEntity(id, options);
    
}

export const registerActionsStage1 = () => {

    registerGameAction('action_walk', {
        tags: ["action", "training", "physical"],
        name: 'Walking',
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Perform some walking exercises to improve your stamina',
        level: 1,
        resourceModifier: {
            income: {
                effects: {
                    'attribute_stamina': {
                        A: 1,
                        B: 0,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'energy': {
                        A: 0,
                        B: 0.05,
                        type: 0
                    }
                }
            },
            effectDeps: ['walking_learning_rate']
        },
        getLearnRate: () => {
            return 1.;
        },
        learningEffects: ['walking_learning_rate', 'physical_training_learn_speed'],
        unlockCondition: () => {
            return true
        },
        attributes: {
            baseXPCost: 10,
            isTraining: true,
        }
    })

    registerGameAction('action_visit_city', {
        tags: ["action", "training", "physical"],
        name: 'Visit City',
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Visit city to find new jobs and opportunities',
        level: 1,
        maxLevel: 2,
        unlockedBy: [{
            type: 'entity',
            id: 'action_walk',
            level: 2,
        }],
        attributes: {
            baseXPCost: 10,
        }
    })

    registerGameAction('action_beggar', {
        tags: ["action", "job", "physical"],
        name: 'Beggar',
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Strange over city streets hoping for someones help',
        level: 1,
        resourceModifier: {
            get_income: () => ({
                resources: {
                    'coins': {
                        A: 0.01*gameEffects.getEffectValue('begging_efficiency')*gameEffects.getEffectValue('coins_earned_bonus'),
                        B: 0.09*gameEffects.getEffectValue('begging_efficiency')*gameEffects.getEffectValue('coins_earned_bonus'),
                        type: 0,
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    'energy': {
                        A: 0,
                        B: 0.2,
                        type: 0,
                    }
                }
            }),
            effectDeps: ['begging_efficiency', 'coins_earned_bonus']
        },
        unlockedBy: [{
            type: 'entity',
            id: 'action_visit_city',
            level: 2,
        }],
        attributes: {
            baseXPCost: 20,
            primaryAttribute: 'attribute_charisma'
        }
    })

    registerGameAction('action_street_musician', {
        tags: ["action", "job", "politician"],
        name: 'Street Musician',
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Strange over city streets hoping for someones help',
        level: 1,
        resourceModifier: {
            get_income: () => ({
                resources: {
                    'coins': {
                        A: 0.04*gameEffects.getEffectValue('coins_earned_bonus'),
                        B: 0.36*gameEffects.getEffectValue('coins_earned_bonus'),
                        type: 0,
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    'energy': {
                        A: 0,
                        B: 1.0,
                        type: 0,
                    }
                }
            }),
            effectDeps: ['begging_efficiency', 'coins_earned_bonus']
        },
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_charisma',
            level: 10,
        }],
        attributes: {
            baseXPCost: 20,
            primaryAttribute: 'attribute_charisma'
        }
    })

    registerGameAction('action_clean_stable', {
        tags: ["action", "job", "physical"],
        name: 'Clean Stable',
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Clean Stables to earn some gold',
        level: 1,
        resourceModifier: {
            get_income: () => ({
                resources: {
                    'coins': {
                        A: 0.06*gameEffects.getEffectValue('clean_stable_efficiency')*gameEffects.getEffectValue('coins_earned_bonus'),
                        B: 0.54*gameEffects.getEffectValue('clean_stable_efficiency')*gameEffects.getEffectValue('coins_earned_bonus'),
                        type: 0,
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    'energy': {
                        A: 0.0,
                        B: 1,
                        type: 0,
                    },
                    'health': {
                        A: 0.0,
                        B: 0.4,
                        type: 0,
                    }
                }
            }),
            effectDeps: ['coins_earned_bonus', 'clean_stable_efficiency']
        },
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_strength',
            level: 5,
        }],
        attributes: {
            baseXPCost: 20,
            primaryAttribute: 'attribute_strength'
        }
    })


    registerGameAction('action_patrol', {
        tags: ["action", "job", "physical"],
        name: 'Patrol',
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Protect streets from hooligans and robbers. Its risky and hard job, but its well paid',
        level: 1,
        resourceModifier: {
            get_income: () => ({
                resources: {
                    'coins': {
                        A: 0.2*gameEffects.getEffectValue('coins_earned_bonus'),
                        B: 1.8*gameEffects.getEffectValue('coins_earned_bonus'),
                        type: 0,
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    'energy': {
                        A: 0.0,
                        B: 4,
                        type: 0,
                    },
                    'health': {
                        A: 0.0,
                        B: 2,
                        type: 0,
                    }
                }
            }),
            effectDeps: ['coins_earned_bonus']
        },
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_strength',
            level: 50,
        }],
        attributes: {
            baseXPCost: 20,
            primaryAttribute: 'attribute_strength'
        }
    })



    registerGameAction('action_builder', {
        tags: ["action", "job", "physical"],
        name: 'Builder',
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Work as builder. Its hard job, but well paid',
        level: 1,
        resourceModifier: {
            get_income: () => ({
                resources: {
                    'coins': {
                        A: 1*gameEffects.getEffectValue('coins_earned_bonus'),
                        B: 9*gameEffects.getEffectValue('coins_earned_bonus'),
                        type: 0,
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    'energy': {
                        A: 0.0,
                        B: 12,
                        type: 0,
                    },
                    'health': {
                        A: 0.0,
                        B: 6,
                        type: 0,
                    }
                }
            }),
            effectDeps: ['coins_earned_bonus']
        },
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_strength',
            level: 350,
        }],
        attributes: {
            baseXPCost: 20,
            primaryAttribute: 'attribute_strength'
        }
    })

    registerGameAction('action_woodcutter', {
        tags: ["action", "activity", "physical", "manual-labor"],
        name: 'Woodcutting',
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Spend some time working hard to get some wood',
        level: 1,
        resourceModifier: {
            get_income: () => ({
                resources: {
                    'inventory_wood': {
                        A: 0.002*gameEffects.getEffectValue('manual_labor_efficiency'),
                        B: 0.008*gameEffects.getEffectValue('manual_labor_efficiency'),
                        type: 0,
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    'energy': {
                        A: 0.0,
                        B: 8,
                        type: 0,
                    },
                    'health': {
                        A: 0.0,
                        B: 3,
                        type: 0,
                    }
                }
            }),
            effectDeps: ['manual_labor_efficiency']
        },
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_strength',
            level: 100,
        }],
        attributes: {
            baseXPCost: 500,
            primaryAttribute: 'attribute_strength'
        }
    })


    registerGameAction('action_quarrying', {
        tags: ["action", "activity", "physical", "manual-labor"],
        name: 'Quarrying',
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Work hard in quarry trying to find some rocks containing precious minerals',
        level: 1,
        resourceModifier: {
            get_income: () => ({
                resources: {
                    'inventory_stone': {
                        A: 0.001*gameEffects.getEffectValue('manual_labor_efficiency'),
                        B: 0.004*gameEffects.getEffectValue('manual_labor_efficiency'),
                        type: 0,
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    'energy': {
                        A: 0.0,
                        B: 12,
                        type: 0,
                    },
                    'health': {
                        A: 0.0,
                        B: 5,
                        type: 0,
                    }
                }
            }),
            effectDeps: ['manual_labor_efficiency']
        },
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_strength',
            level: 300,
        }],
        attributes: {
            baseXPCost: 500,
            primaryAttribute: 'attribute_strength'
        }
    })


    registerGameAction('action_rest', {
        tags: ["action", "rest", "physical"],
        name: 'Rest in Tavern',
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Pay some gold to rest in tavern',
        level: 1,
        getLearnRate: () => {
            return 0;
        },
        resourceModifier: {
            get_income: () => ({
                resources: {
                    'energy': {
                        A: 1.0,
                        B: 0,
                        type: 0,
                    },
                    'health': {
                        A: 0.1,
                        B: 0,
                        type: 0,
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    'coins': {
                        A: 0.0,
                        B: 0.2,
                        type: 0,
                    }
                }
            }),
            effectDeps: []
        },
        unlockedBy: [{
            type: 'entity',
            id: 'action_visit_city',
            level: 2,
        }],
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_tent') < 1
        },
        attributes: {
            baseXPCost: 1.e+10,
        }
    })

    registerGameAction('action_rest_home', {
        tags: ["action", "rest", "physical"],
        name: 'Rest at home',
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Stay at your sweet home to heal and recover',
        level: 1,
        getLearnRate: () => {
            return 0;
        },
        resourceModifier: {
            get_income: () => ({
                resources: {
                    'energy': {
                        A: 1.0*gameEffects.getEffectValue('rest_efficiency'),
                        B: 0,
                        type: 0,
                    },
                    'health': {
                        A: 0.1*gameEffects.getEffectValue('rest_efficiency'),
                        B: 0,
                        type: 0,
                    }
                }
            }),
            effectDeps: ['rest_efficiency']
        },
        unlockedBy: [{
            type: 'entity',
            id: 'action_visit_city',
            level: 2,
        },{
            type: 'entity',
            id: 'shop_item_tent',
            level: 1,
        }],
        attributes: {
            baseXPCost: 1.e+10,
        }
    })


    registerGameAction('action_gossip', {
        tags: ["action", "training", "mental"],
        name: 'Gossip',
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Spend some time communicating with people about news and other things. Improves your charisma',
        level: 1,
        resourceModifier: {
            income: {
                effects: {
                    'attribute_charisma': {
                        A: 1,
                        B: 0,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'energy': {
                        A: 0,
                        B: 0.1,
                        type: 0
                    }
                }
            },
            effectDeps: []
        },
        unlockedBy: [{
            type: 'entity',
            id: 'action_beggar',
            level: 5,
        }],
        attributes: {
            baseXPCost: 50,
            isTraining: true,
        }
    })

    registerGameAction('action_pushup', {
        tags: ["action", "training", "physical"],
        name: 'Push Up',
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Perform some simple physical exercises to become stronger and unlock better physical jobs options',
        level: 1,
        resourceModifier: {
            income: {
                effects: {
                    'attribute_strength': {
                        A: 1,
                        B: 0,
                        type: 0,
                    },
                    'attribute_vitality': {
                        A: 1,
                        B: 0,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'energy': {
                        A: 0,
                        B: 0.25,
                        type: 0
                    }
                }
            },
            effectDeps: [],
            reourcesToReassert: ['health']
        },
        unlockedBy: [{
            type: 'entity',
            id: 'action_walk',
            level: 20,
        }],
        getLearnRate: () => {
            return 1.
        },
        learningEffects: ['physical_training_learn_speed'],
        unlockCondition: () => {
            return gameEntity.getLevel('action_walk') > 19
        },
        attributes: {
            baseXPCost: 50,
            isTraining: true,
        }
    })

    registerGameAction('action_read_motivation_book', {
        tags: ["action", "training", "mental"],
        name: 'Read book of Motivation',
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Read book of motivation, containing some useful advices regarding self-development',
        level: 1,
        maxLevel: 5,
        resourceModifier: {
            multiplier: {
                effects: {
                    'learning_rate': {
                        A: 0.25,
                        B: 0.75,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'energy': {
                        A: 0,
                        B: 0.4,
                        type: 0
                    }
                }
            },
            effectDeps: []
        },
        unlockCondition: () => {
            // console.log('Beggar level: ', gameEntity.getLevel('action_beggar'));
            return gameEntity.getLevel('shop_item_book_of_motivation') > 0
        },
        attributes: {
            baseXPCost: 50,
            isTraining: true,
        }
    })


    registerGameAction('action_read_math_book', {
        tags: ["action", "training", "mental"],
        name: 'Train Math',
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Train you brain to calculate coins better. Increase coins income',
        level: 1,
        maxLevel: 5,
        resourceModifier: {
            multiplier: {
                effects: {
                    'coins_earned_bonus': {
                        A: 0.125,
                        B: 0.875,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'energy': {
                        A: 0,
                        B: 0.8,
                        type: 0
                    }
                }
            },
            effectDeps: []
        },
        unlockCondition: () => {
            // console.log('Beggar level: ', gameEntity.getLevel('action_beggar'));
            return gameEntity.getLevel('shop_item_book_of_math') > 0
        },
        attributes: {
            baseXPCost: 50,
            isTraining: true,
        }
    })

    registerGameAction('action_gather_berries', {
        tags: ["action", "gathering", "routine"],
        name: 'Gather Berries',
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Spend some time walking in nearby forest and collecting berries',
        level: 1,
        getLearnRate: () => {
            return 1.
        },
        learningEffects: ['routine_learning_speed'],
        resourceModifier: {
            get_income: () => ({
                resources: {
                    'inventory_berry': {
                        A: 0.001*gameEffects.getEffectValue('gathering_efficiency'),
                        B: 0.009*gameEffects.getEffectValue('gathering_efficiency'),
                        type: 0,
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    'energy': {
                        A: 0,
                        B: 1,
                        type: 0,
                    }
                }
            }),
            effectDeps: ['gathering_efficiency']
        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0
        },
        attributes: {
            baseXPCost: 50,
            primaryAttribute: 'attribute_patience'
        }
    })

    registerGameAction('action_read_books', {
        tags: ["action", "activity", "mental", "book"],
        name: 'Read Books',
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Read books to find new information and increase your knowledge',
        level: 1,
        getLearnRate: () => {
            return 1
        },
        learningEffects: ['books_learning_rate'],
        resourceModifier: {
            get_income: () => ({
                resources: {
                    'knowledge': {
                        A: 0.001*gameEffects.getEffectValue('read_books_efficiency'),
                        B: 0.009*gameEffects.getEffectValue('read_books_efficiency'),
                        type: 0,
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    'energy': {
                        A: 0.0,
                        B: 1,
                        type: 0,
                    },
                    'coins': {
                        A: 0.0,
                        B: 1.5,
                        type: 0,
                    }
                }
            }),
            effectDeps: ['read_books_efficiency']
        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_library_entrance') > 0
        },
        attributes: {
            baseXPCost: 50,
        }
    })


    registerGameAction('action_read_mages_handbook', {
        tags: ["action", "activity", "spiritual", "book"],
        name: 'Read Appretience Handbook',
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Read magic book, providing you precious information about increasing your magic potential. Unfortunately, text inside encrypted with runes that you have to de-crypt using spells.',
        level: 1,
        getLearnRate: () => {
            return 1
        },
        learningEffects: ['books_learning_rate'],
        resourceModifier: {
            income: {
                effects: {
                    'attribute_spell_reading': {
                        A: 1,
                        B: -1,
                        type: 0,
                    }
                }
            },
            get_consumption: () => ({
                resources: {
                    'energy': {
                        A: 0,
                        B: 30.0,
                        type: 0,
                    },
                    'mana': {
                        A: 0.0,
                        B: 10,
                        type: 0,
                    }
                }
            }),
            effectDeps: ['read_books_efficiency']
        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_library_entrance') > 0
        },
        attributes: {
            baseXPCost: 50,
            isTraining: true,
        }
    })


    registerGameAction('action_yoga_practices', {
        tags: ["action", "training", "mental"],
        name: 'Yoga Practice',
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Practice yoga to train your patience and stamina. Unlocks new activities requiring more patience.',
        level: 1,
        resourceModifier: {
            get_income: () => ({
                effects: {
                    'attribute_patience': {
                        A: 1,
                        B: -1,
                        type: 0,
                    },
                    'attribute_stamina': {
                        A: 0.5,
                        B: -0.5,
                        type: 0,
                    }

                }
            }),
            get_consumption: () => ({
                resources: {
                    'energy': {
                        A: 0.0,
                        B: 2,
                        type: 0,
                    },
                    'knowledge': {
                        A: 0.0,
                        B: 0.05,
                        type: 0,
                    }
                }
            }),
            effectDeps: ['read_books_efficiency']
        },
        getLearnRate: () => 1.,
        learningEffects: ['yoga_learn_speed'],
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_yoga_manual') > 0
        },
        attributes: {
            baseXPCost: 50,
            displayPerLevel: 1,
            isTraining: true,
        }
    })

    registerGameAction('action_home_errands', {
        tags: ["action", "activity", "routine"],
        name: 'Home Errands',
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Clean your house, organize things to free more space for coins storage',
        level: 1,
        getLearnRate: () => {
            return 1.
        },
        learningEffects: ['routine_learning_speed'],
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    'coins_cap_bonus': {
                        A: 0.05,
                        B: 1,
                        type: 0,
                    },

                }
            }),
            get_consumption: () => ({
                resources: {
                    'energy': {
                        A: 0.0,
                        B: 3,
                        type: 0,
                    }
                }
            }),
        },
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_patience',
            level: 5,
        }],
        attributes: {
            baseXPCost: 50,
            isTraining: true,
            primaryAttribute: 'attribute_patience'
        }
    })


    registerGameAction('action_dig_vaults', {
        tags: ["action", "activity", "routine"],
        name: 'Dig Vaults',
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Dig underground vaults to store your coins. Its energy consuming action, but can pay off',
        level: 1,
        getLearnRate: () => {
            return 2.
        },
        learningEffects: ['routine_learning_speed'],
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    'coins_cap_bonus': {
                        A: 0.025,
                        B: 1,
                        type: 0,
                    },

                }
            }),
            get_consumption: () => ({
                resources: {
                    'energy': {
                        A: 0.0,
                        B: 20,
                        type: 0,
                    }
                }
            }),
        },
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_patience',
            level: 225,
        }],
        attributes: {
            baseXPCost: 500,
            isTraining: true,
            primaryAttribute: 'attribute_patience'
        }
    })


    registerGameAction('action_learn_anatomy', {
        tags: ["action", "training", "mental", "book"],
        name: 'Learn Anatomy',
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Lear anatomy to better understand your body and improve your health regeneration',
        level: 1,
        getLearnRate: () => {
            return 1.
        },
        learningEffects: ['books_learning_rate'],
        resourceModifier: {
            get_income: () => ({
                effects: {
                    'attribute_recovery': {
                        A: 0.2,
                        B: -0.2,
                        type: 0,
                    },
                    'attribute_stamina': {
                        A: 3,
                        B: -3,
                        type: 0,
                    }

                }
            }),
            get_consumption: () => ({
                resources: {
                    'energy': {
                        A: 0.0,
                        B: 1,
                        type: 0,
                    },
                    'knowledge': {
                        A: 0.0,
                        B: 0.25,
                        type: 0,
                    }
                }
            }),
            effectDeps: ['read_books_efficiency']
        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_anatomy_book') > 0
        },
        attributes: {
            baseXPCost: 50,
            displayPerLevel: 1,
            isTraining: true,
        }
    })

    registerGameAction('action_learn_languages', {
        tags: ["action", "training", "mental"],
        name: 'Learn Languages',
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Lear ancient languages to increase book reading related XP',
        level: 1,
        resourceModifier: {
            get_income: () => ({
                effects: {
                    'books_learning_rate': {
                        A: 0.1,
                        B: -0.1,
                        type: 0,
                    },
                    'attribute_memory': {
                        A: 0.5,
                        B: -0.5,
                        type: 0,
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    'energy': {
                        A: 0.0,
                        B: 2,
                        type: 0,
                    },
                    'knowledge': {
                        A: 0.0,
                        B: 0.25,
                        type: 0,
                    }
                }
            }),
            effectDeps: ['read_books_efficiency']
        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_vocabulary') > 0
        },
        attributes: {
            baseXPCost: 50,
            displayPerLevel: 1,
            isTraining: true,
        }
    })

    registerGameAction('action_endurance_training', {
        tags: ["action", "training", "physical"],
        name: 'Train Endurance',
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Take some exercises in local gym to improve your body',
        level: 1,
        getLearnRate: () => {
            return 1.
        },
        learningEffects: ['physical_training_learn_speed'],
        resourceModifier: {
            get_income: () => ({
                effects: {
                    'attribute_recovery': {
                        A: 0.5,
                        B: -0.5,
                        type: 0,
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    'energy': {
                        A: 0.0,
                        B: 2,
                        type: 0,
                    },
                }
            }),
            effectDeps: ['read_books_efficiency']
        },
        unlockedBy: [{
            type: 'entity',
            id: 'action_pushup',
            level: 5,
        }],
        attributes: {
            baseXPCost: 50,
            displayPerLevel: 1,
            isTraining: true,
        }
    })

    registerGameAction('action_stamina_training', {
        tags: ["action", "training", "physical"],
        name: 'Train Stamina',
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Better endurance unlocked harder but much more efficient way to train your stamina',
        level: 1,
        getLearnRate: () => {
            return 1
        },
        learningEffects: ['physical_training_learn_speed'],
        resourceModifier: {
            get_income: () => ({
                effects: {
                    'attribute_stamina': {
                        A: 8,
                        B: -8,
                        type: 0,
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    'energy': {
                        A: 0.0,
                        B: 10,
                        type: 0,
                    },
                    'health': {
                        A: 0.0,
                        B: 10,
                        type: 0,
                    },
                }
            }),
            effectDeps: ['physical_training_learn_speed']
        },
        unlockedBy: [{
            type: 'entity',
            id: 'action_endurance_training',
            level: 200,
        }],
        attributes: {
            baseXPCost: 500,
            displayPerLevel: 1,
            isTraining: true,
        }
    })

    registerGameAction('action_cardio_training', {
        tags: ["action", "training", "physical"],
        name: 'Cardio Training',
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Finally, you feel the power in your hands. But still, you feel like you need to train more',
        level: 1,
        getLearnRate: () => {
            return 1.
        },
        learningEffects: ['physical_training_learn_speed'],
        resourceModifier: {
            get_income: () => ({
                effects: {
                    'attribute_recovery': {
                        A: 3,
                        B: -3,
                        type: 0,
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    'energy': {
                        A: 0.0,
                        B: 20,
                        type: 0,
                    }
                }
            }),
            effectDeps: ['physical_training_learn_speed']
        },
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_strength',
            level: 200,
        }],
        attributes: {
            baseXPCost: 500,
            displayPerLevel: 1,
            isTraining: true,
        }
    })

    registerGameAction('action_deeper_forest', {
        tags: ["action", "gathering", "routine"],
        name: 'Walking in Forest',
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'More dangerous activity, but searching for plants in less accessible places can pay off',
        level: 1,
        getLearnRate: () => {
            return 1.
        },
        learningEffects: ['routine_learning_speed'],
        resourceModifier: {
            get_income: () => ({
                resources: {
                    'inventory_berry': {
                        A: 0.004*gameEffects.getEffectValue('gathering_efficiency'),
                        B: 0.036*gameEffects.getEffectValue('gathering_efficiency'),
                        type: 0,
                    },
                    'inventory_fly_mushroom': {
                        A: 0.001*gameEffects.getEffectValue('gathering_efficiency'),
                        B: 0.009*gameEffects.getEffectValue('gathering_efficiency'),
                        type: 0,
                    },
                    'inventory_aloe_vera': {
                        A: 0.0002*gameEffects.getEffectValue('gathering_efficiency'),
                        B: 0.0018*gameEffects.getEffectValue('gathering_efficiency'),
                        type: 0,
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    'energy': {
                        A: 0.0,
                        B: 2,
                        type: 0,
                    },
                    'health': {
                        A: 0.0,
                        B: 0.5,
                        type: 0,
                    }
                }
            }),
            effectDeps: ['gathering_efficiency']
        },
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_strength',
            level: 20,
        }],
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0
        },
        attributes: {
            baseXPCost: 50,
            primaryAttribute: 'attribute_patience'
        }
    })

    registerGameAction('action_magic_garden', {
        tags: ["action", "gathering", "routine"],
        name: 'Searching in Magic Garden',
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Magic garden is told to be planted by some wizard. The wizard was murdered, but his garden keeps growing, providing variety of precious herbs',
        level: 1,
        getLearnRate: () => {
            return 1
        },
        learningEffects: ['routine_learning_speed'],
        resourceModifier: {
            get_income: () => ({
                resources: {
                    'inventory_aloe_vera': {
                        A: 0.001*gameEffects.getEffectValue('gathering_efficiency'),
                        B: 0.009*gameEffects.getEffectValue('gathering_efficiency'),
                        type: 0,
                    },
                    'inventory_ginseng': {
                        A: 0.001*gameEffects.getEffectValue('gathering_efficiency'),
                        B: 0.009*gameEffects.getEffectValue('gathering_efficiency'),
                        type: 0,
                    },
                    'inventory_nightshade': {
                        A: 0.0002*gameEffects.getEffectValue('gathering_efficiency'),
                        B: 0.0018*gameEffects.getEffectValue('gathering_efficiency'),
                        type: 0,
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    'energy': {
                        A: 0.0,
                        B: 4,
                        type: 0,
                    },
                    'health': {
                        A: 0.0,
                        B: 2,
                        type: 0,
                    }
                }
            }),
            effectDeps: ['gathering_efficiency']
        },
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_strength',
            level: 25,
        }],
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0
                && gameEntity.getLevel('shop_item_herbs_handbook_1') > 0
        },
        attributes: {
            baseXPCost: 50,
            primaryAttribute: 'attribute_patience'
        }
    })

    registerGameAction('action_meditate', {
        tags: ["action", "training", "magical", "spiritual"],
        name: 'Meditate',
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Use meditative practices to improve your mental abilities',
        level: 1,
        resourceModifier: {
            income: {
                effects: {
                    'attribute_magic_ability': {
                        A: 1,
                        B: 0,
                        type: 0,
                    },
                    'attribute_patience': {
                        A: 0.25,
                        B: 0,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'energy': {
                        A: 0,
                        B: 5.00,
                        type: 0
                    },
                    'knowledge': {
                        A: 0,
                        B: 1.00,
                        type: 0
                    }
                }
            },
            effectDeps: []
        },
        getLearnRate: () => {
            return 1
        },
        learningEffects: ['spiritual_learning_rate'],
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_meditation') > 0
        },
        attributes: {
            baseXPCost: 100,
            isTraining: true,
        }
    })


    registerGameAction('action_magic_training', {
        tags: ["action", "training", "magical", "spiritual"],
        name: 'Magic Training',
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Improve your magic capability using practices of ancient monks',
        level: 1,
        resourceModifier: {
            income: {
                effects: {
                    'attribute_magic_capability': {
                        A: 1,
                        B: 0,
                        type: 0,
                    },
                }
            },
            consumption: {
                resources: {
                    'energy': {
                        A: 0,
                        B: 5.00,
                        type: 0
                    },
                    'knowledge': {
                        A: 0,
                        B: 1.00,
                        type: 0
                    }
                }
            },
            effectDeps: []
        },
        getLearnRate: () => {
            return 1
        },
        learningEffects: ['spiritual_learning_rate'],
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_magic_training') > 0
        },
        attributes: {
            baseXPCost: 200,
            isTraining: true,
        }
    })


    registerGameAction('action_spiritual_alignment', {
        tags: ["action", "activity", "mental"],
        name: 'Spiritual Alignment',
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Spend some time trying to hear the magic inside you. Improve your feeling of yourself',
        level: 1,
        getLearnRate: () => {
            return 1.
        },
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    'spiritual_learning_rate': {
                        A: 0.05,
                        B: 0.95,
                        type: 0,
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    'energy': {
                        A: 0.0,
                        B: 5,
                        type: 0,
                    },
                    'knowledge': {
                        A: 0,
                        B: 2.5,
                        type: 0,
                    }
                }
            }),
            effectDeps: []
        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_spiritualism') > 0
        },
        attributes: {
            baseXPCost: 200,
            isTraining: true
        }
    })


    registerGameAction('action_craft', {
        tags: ["action", "activity", "physical", "crafting"],
        name: 'Craft',
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Dedicate your time and efforts to crafting',
        level: 1,
        getLearnRate: () => {
            return 2
        },
        resourceModifier: {
            get_income: () => ({
                resources: {
                    'crafting_ability': {
                        A: 0.001,
                        B: 0.009,
                        type: 0,
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    'energy': {
                        A: 0.0,
                        B: 5,
                        type: 0,
                    },
                    'health': {
                        A: 0.0,
                        B: 1.5,
                        type: 0,
                    }
                }
            }),
            effectDeps: []
        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_crafting_courses') > 0
        },
        attributes: {
            baseXPCost: 100,
            primaryAttribute: 'attribute_strength'
        }
    })


    registerGameAction('action_alchemy', {
        tags: ["action", "activity", "routine", "crafting"],
        name: 'Alchemy',
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Spent some time brewing potions',
        level: 1,
        getLearnRate: () => {
            return 2
        },
        resourceModifier: {
            get_income: () => ({
                resources: {
                    'alchemy_ability': {
                        A: 0.001,
                        B: 0.009,
                        type: 0,
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    'energy': {
                        A: 0.0,
                        B: 5,
                        type: 0,
                    },
                    'health': {
                        A: 0.0,
                        B: 1.5,
                        type: 0,
                    }
                }
            }),
            effectDeps: []
        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_alchemy_courses') > 0
        },
        attributes: {
            baseXPCost: 100,
            primaryAttribute: 'attribute_patience'
        }
    })


    registerGameAction('action_meditative_insight', {
        tags: ["action", "training", "magical", "spiritual"],
        name: 'Meditative Insight',
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Engage in a deep meditative practice with the Metaphysics Book, sharpening memory and enhancing mana regeneration by channeling profound knowledge and magical focus.',
        level: 1,
        resourceModifier: {
            income: {
                effects: {
                    'attribute_magic_ability': {
                        A: 2,
                        B: 0,
                        type: 0,
                    },
                    'attribute_memory': {
                        A: 4,
                        B: 0,
                        type: 0,
                    },
                }
            },
            consumption: {
                resources: {
                    'energy': {
                        A: 0,
                        B: 25.00,
                        type: 0
                    },
                    'knowledge': {
                        A: 0,
                        B: 10.00,
                        type: 0
                    },
                    'mana': {
                        A: 0,
                        B: 5.00,
                        type: 0
                    }
                }
            },
            effectDeps: []
        },
        getLearnRate: () => {
            return 2
        },
        learningEffects: ['spiritual_learning_rate'],
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_metaphysics_handbook') > 0
        },
        attributes: {
            baseXPCost: 1000,
            isTraining: true,
        }
    })


}