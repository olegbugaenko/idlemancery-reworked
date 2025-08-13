import {gameEntity, gameCore, gameEffects, gameResources} from "game-framework"

const getPrimaryBonus = (attributeId) => {
    return 0.99 + 0.01*Math.pow(gameEffects.getEffectValue(attributeId),0.5);
}

export const getRankId = (id) => `${id}_rank_multiplier`

export const ACTION_CATS = {
    COINS: 'coins',
    PHYSICAL: 'physical',
    SOCIAL: 'social',
    MENTAL: 'mental',
    MAGICAL: 'magical',
    ROUTINE: 'routine',
    OTHER: 'other'
}

const getChanceBased = (effect, softCap, hardCap) => {
    if(effect < softCap) {
        return effect;
    }
    let rs = softCap + (effect - softCap)*Math.pow(softCap/effect, 0.5);
    if(rs < hardCap) {
        return rs;
    }
    return hardCap;
}

const getResourceModifierDataSearchable = (rs) => {

    const searchables = {
        'effects': [],
        'resources': []
    };

    if(!rs) return searchables;


    ['income', 'consumption', 'multiplier'].forEach(scope => {
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

const registerGameAction = (id, options) => {

    const primaryAttribute = options.attributes.primaryAttribute;
    
    if(!options.resourceModifier) {
        return gameEntity.registerGameEntity(id, options);
    }

    options.resourceModifier.prefix = 'Action: ';

    if(options.attributes.isRankAvailable) {
        gameEffects.registerEffect(getRankId(id), {
            name: `${options.name} Rank Multiplier`,
            minValue: 1,
            defaultValue: 1,
        })

        if(!options.resourceModifier.effectDeps) {
            options.resourceModifier.effectDeps = []
        }

        options.resourceModifier.effectDeps.push(getRankId(id))
    }


    if(primaryAttribute) {
        if(!options.resourceModifier.effectDeps) {
            options.resourceModifier.effectDeps = []
        }

        if(!options.resourceModifier.effectDeps.includes(primaryAttribute)) {
            options.resourceModifier.effectDeps.push(primaryAttribute);
            options.resourceModifier.effectDeps.push(`aspect_${primaryAttribute}`);
        }

        options.getPrimaryEffect = () => getPrimaryBonus(primaryAttribute);
        options.getIntensityAspect = () => gameEffects.getEffectValue(`aspect_${primaryAttribute}`)

        if(options.attributes.isTraining) {
            options.resourceModifier.customAmplifierApplyTypes = ['resources'];
            options.resourceModifier.customAmplifierApplyScopes = ['income', 'consumption'];
        } else {
            options.resourceModifier.customAmplifierApplyTypes = ['effects', 'resources']
        }

        options.resourceModifier.getCustomAmplifier = () => {
            return options.getIntensityAspect();
        }
    }

    options.searchableMeta = getResourceModifierDataSearchable(options.resourceModifier);
    options.isPersistent = true;


    if(!options.allowedScopes) {
        options.allowedScopes = ['income', 'consumption', 'multiplier'];
    }
    
    return gameEntity.registerGameEntity(id, options);
    
}

export const registerActionsStage1 = () => {


    registerGameAction('action_walk', {
        tags: ["action", "training", "physical"],
        name: 'Walking',
        isAbstract: false,
        category: ACTION_CATS.PHYSICAL,
        allowedImpacts: ['effects'],
        description: 'Perform some walking exercises to improve your stamina',
        level: 1,
        discountEffects: ['physical_actions_discount'],
        resourceModifier: {
            get_income: () => ({
                effects: {
                    'attribute_stamina': {
                        A: 1*gameEffects.getEffectValue(getRankId('action_walk')),
                        B: 0,
                        type: 0,
                    }
                }
            }),
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
            baseXPCost: 5,
            isTraining: true,
            isRankAvailable: true,
            // primaryAttribute: 'attribute_vitality'
        }
    })

    registerGameAction('action_visit_city', {
        tags: ["action", "activity", "physical"],
        name: 'Visit City',
        category: ACTION_CATS.PHYSICAL,
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
        tags: ["action", "job", "social", "social"],
        name: 'Beggar',
        category: ACTION_CATS.COINS,
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Wander the city streets, hoping for someone\'s help',
        level: 1,
        discountEffects: ['social_actions_discount'],
        jobType: 'social',
        resourceModifier: {
            get_income: () => ({
                resources: {
                    'coins': {
                        A: 0.03*gameEffects.getEffectValue('begging_efficiency')*gameEffects.getEffectValue('coins_earned_bonus')*gameEffects.getEffectValue('job_efficiency_social'),
                        B: 0.27*gameEffects.getEffectValue('begging_efficiency')*gameEffects.getEffectValue('coins_earned_bonus')*gameEffects.getEffectValue('job_efficiency_social'),
                        type: 0,
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    'energy': {
                        A: 0,
                        B: 0.15,
                        type: 0,
                    }
                }
            }),
            effectDeps: ['begging_efficiency', 'coins_earned_bonus', 'job_efficiency_social']
        },
        getLearnRate: () => {
            return 1;
        },
        learningEffects: ['job_learning_rate'],
        unlockedBy: [{
            type: 'entity',
            id: 'action_visit_city',
            level: 2,
        }],
        attributes: {
            baseXPCost: 10,
            primaryAttribute: 'attribute_charisma'
        }
    })

    registerGameAction('action_street_musician', {
        tags: ["action", "job", "politician", "social"],
        name: 'Street Musician',
        isAbstract: false,
        category: ACTION_CATS.COINS,
        allowedImpacts: ['effects'],
        description: 'Perform melodies for passersby and earn some coins through the power of music',
        level: 1,
        jobType: 'social',
        getLearnRate: () => {
            return 1;
        },
        discountEffects: ['social_actions_discount'],
        learningEffects: ['job_learning_rate'],
        resourceModifier: {
            get_income: () => ({
                resources: {
                    'coins': {
                        A: 0.2*gameEffects.getEffectValue('coins_earned_bonus')*gameEffects.getEffectValue('job_efficiency_social'),
                        B: 1.8*gameEffects.getEffectValue('coins_earned_bonus')*gameEffects.getEffectValue('job_efficiency_social'),
                        type: 0,
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    'energy': {
                        A: 0,
                        B: 0.75,
                        type: 0,
                    }
                }
            }),
            effectDeps: ['begging_efficiency', 'coins_earned_bonus', 'job_efficiency_social']
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


    registerGameAction('action_street_artist', {
        tags: ["action", "job", "politician", "social"],
        name: 'Street Artist',
        isAbstract: false,
        category: ACTION_CATS.COINS,
        allowedImpacts: ['effects'],
        description: 'Why just play if you can actually sing? Turn heads, catch coins, and maybe even start a movement.',
        level: 1,
        jobType: 'social',
        getLearnRate: () => {
            return 1;
        },
        discountEffects: ['social_actions_discount'],
        learningEffects: ['job_learning_rate'],
        resourceModifier: {
            get_income: () => ({
                resources: {
                    'coins': {
                        A: 0.5*gameEffects.getEffectValue('coins_earned_bonus')*gameEffects.getEffectValue('job_efficiency_social'),
                        B: 4.5*gameEffects.getEffectValue('coins_earned_bonus')*gameEffects.getEffectValue('job_efficiency_social'),
                        type: 0,
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    'energy': {
                        A: 0,
                        B: 3,
                        type: 0,
                    }
                }
            }),
            effectDeps: ['begging_efficiency', 'coins_earned_bonus', 'job_efficiency_social']
        },
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_charisma',
            level: 50,
        }],
        attributes: {
            baseXPCost: 20,
            primaryAttribute: 'attribute_charisma'
        }
    })

    registerGameAction('action_street_speaker', {
        tags: ["action", "job", "politician", "social"],
        name: 'Town Crier',
        isAbstract: false,
        category: ACTION_CATS.COINS,
        allowedImpacts: ['effects'],
        description: 'Proclaim official announcements, public notices, and the latest news on behalf of the city. Loud voice preferred, political opinions optional',
        level: 1,
        jobType: 'social',
        getLearnRate: () => {
            return 1;
        },
        discountEffects: ['social_actions_discount'],
        learningEffects: ['job_learning_rate'],
        resourceModifier: {
            get_income: () => ({
                resources: {
                    'coins': {
                        A: 0.7*gameEffects.getEffectValue('coins_earned_bonus')*gameEffects.getEffectValue('job_efficiency_social'),
                        B: 6.3*gameEffects.getEffectValue('coins_earned_bonus')*gameEffects.getEffectValue('job_efficiency_social'),
                        type: 0,
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    'energy': {
                        A: 0,
                        B: 7.5,
                        type: 0,
                    }
                }
            }),
            effectDeps: ['begging_efficiency', 'coins_earned_bonus', 'job_efficiency_social']
        },
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_charisma',
            level: 50,
        }],
        attributes: {
            baseXPCost: 20,
            primaryAttribute: 'attribute_charisma'
        }
    })

    registerGameAction('action_salesperson', {
        tags: ["action", "job", "social"],
        name: 'Salesperson',
        isAbstract: false,
        category: ACTION_CATS.COINS,
        minDemoVersion: 20,
        allowedImpacts: ['effects'],
        description: 'Work as a salesperson, using your charm to sell products and earn commissions',
        level: 1,
        discountEffects: ['social_actions_discount'],
        jobType: 'social',
        getLearnRate: () => {
            return 1;
        },
        learningEffects: ['job_learning_rate'],
        resourceModifier: {
            get_income: () => ({
                resources: {
                    'coins': {
                        A: 1.2*gameEffects.getEffectValue('coins_earned_bonus')*gameEffects.getEffectValue('job_efficiency_social'),
                        B: 10.8*gameEffects.getEffectValue('coins_earned_bonus')*gameEffects.getEffectValue('job_efficiency_social'),
                        type: 0,
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    'energy': {
                        A: 0,
                        B: 12,
                        type: 0,
                    }
                }
            }),
            effectDeps: ['coins_earned_bonus', 'job_efficiency_social']
        },
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_charisma',
            level: 250,
        }],
        attributes: {
            baseXPCost: 20,
            primaryAttribute: 'attribute_charisma'
        }
    })

    registerGameAction('action_customer_service', {
        tags: ["action", "job", "social"],
        name: 'Customer Service',
        isAbstract: false,
        category: ACTION_CATS.COINS,
        minDemoVersion: 20,
        allowedImpacts: ['effects'],
        description: 'Handle customer inquiries and complaints professionally',
        level: 1,
        discountEffects: ['social_actions_discount'],
        jobType: 'social',
        getLearnRate: () => {
            return 1;
        },
        learningEffects: ['job_learning_rate'],
        resourceModifier: {
            get_income: () => ({
                resources: {
                    'coins': {
                        A: 1.6*gameEffects.getEffectValue('coins_earned_bonus')*gameEffects.getEffectValue('job_efficiency_social'),
                        B: 14.4*gameEffects.getEffectValue('coins_earned_bonus')*gameEffects.getEffectValue('job_efficiency_social'),
                        type: 0,
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    'energy': {
                        A: 0,
                        B: 30,
                        type: 0,
                    }
                }
            }),
            effectDeps: ['coins_earned_bonus', 'job_efficiency_social']
        },
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_charisma',
            level: 1000,
        }],
        attributes: {
            baseXPCost: 20,
            primaryAttribute: 'attribute_charisma'
        }
    })

    registerGameAction('action_public_relations', {
        tags: ["action", "job", "social"],
        name: 'Public Relations',
        isAbstract: false,
        category: ACTION_CATS.COINS,
        minDemoVersion: 20,
        allowedImpacts: ['effects'],
        description: 'Manage public image and media relations for organizations',
        level: 1,
        discountEffects: ['social_actions_discount'],
        jobType: 'social',
        getLearnRate: () => {
            return 1;
        },
        learningEffects: ['job_learning_rate'],
        resourceModifier: {
            get_income: () => ({
                resources: {
                    'coins': {
                        A: 1.8*gameEffects.getEffectValue('coins_earned_bonus')*gameEffects.getEffectValue('job_efficiency_social'),
                        B: 20.2*gameEffects.getEffectValue('coins_earned_bonus')*gameEffects.getEffectValue('job_efficiency_social'),
                        type: 0,
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    'energy': {
                        A: 0,
                        B: 35,
                        type: 0,
                    }
                }
            }),
            effectDeps: ['coins_earned_bonus', 'job_efficiency_social']
        },
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_charisma',
            level: 5000,
        }],
        attributes: {
            baseXPCost: 20,
            primaryAttribute: 'attribute_charisma'
        }
    })

    registerGameAction('action_negotiation_specialist', {
        tags: ["action", "job", "social"],
        name: 'Negotiation Specialist',
        isAbstract: false,
        category: ACTION_CATS.COINS,
        minDemoVersion: 20,
        allowedImpacts: ['effects'],
        description: 'Lead high-stakes negotiations and broker major deals',
        level: 1,
        discountEffects: ['social_actions_discount'],
        jobType: 'social',
        getLearnRate: () => {
            return 1;
        },
        learningEffects: ['job_learning_rate'],
        resourceModifier: {
            get_income: () => ({
                resources: {
                    'coins': {
                        A: 3.0*gameEffects.getEffectValue('coins_earned_bonus')*gameEffects.getEffectValue('job_efficiency_social'),
                        B: 27.0*gameEffects.getEffectValue('coins_earned_bonus')*gameEffects.getEffectValue('job_efficiency_social'),
                        type: 0,
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    'energy': {
                        A: 0,
                        B: 60,
                        type: 0,
                    }
                }
            }),
            effectDeps: ['coins_earned_bonus', 'job_efficiency_social']
        },
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_charisma',
            level: 25000,
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
        category: ACTION_CATS.COINS,
        allowedImpacts: ['effects'],
        description: 'Clean Stables to earn some gold',
        level: 1,
        discountEffects: ['physical_actions_discount'],
        jobType: 'physical',
        getLearnRate: () => {
            return 1;
        },
        learningEffects: ['job_learning_rate'],
        resourceModifier: {
            get_income: () => ({
                resources: {
                    'coins': {
                        A: 0.3*gameEffects.getEffectValue('clean_stable_efficiency')*gameEffects.getEffectValue('coins_earned_bonus')*gameEffects.getEffectValue('job_efficiency_physical'),
                        B: 2.7*gameEffects.getEffectValue('clean_stable_efficiency')*gameEffects.getEffectValue('coins_earned_bonus')*gameEffects.getEffectValue('job_efficiency_physical'),
                        type: 0,
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    'energy': {
                        A: 0.0,
                        B: 1.5,
                        type: 0,
                    },
                    'health': {
                        A: 0.0,
                        B: 0.4,
                        type: 0,
                    }
                }
            }),
            effectDeps: ['coins_earned_bonus', 'clean_stable_efficiency', 'job_efficiency_physical']
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
        category: ACTION_CATS.COINS,
        minDemoVersion: 20,
        allowedImpacts: ['effects'],
        description: 'Protect streets from hooligans and robbers. Its risky and hard job, but its well paid',
        level: 1,
        discountEffects: ['physical_actions_discount'],
        jobType: 'physical',
        getLearnRate: () => {
            return 1;
        },
        learningEffects: ['job_learning_rate'],
        resourceModifier: {
            get_income: () => ({
                resources: {
                    'coins': {
                        A: 0.8*gameEffects.getEffectValue('coins_earned_bonus')*gameEffects.getEffectValue('job_efficiency_physical'),
                        B: 7.2*gameEffects.getEffectValue('coins_earned_bonus')*gameEffects.getEffectValue('job_efficiency_physical'),
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
                        B: 2.5,
                        type: 0,
                    }
                }
            }),
            effectDeps: ['coins_earned_bonus', 'job_efficiency_physical']
        },
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_strength',
            level: 150,
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
        category: ACTION_CATS.COINS,
        allowedImpacts: ['effects'],
        description: 'Work as builder. Its hard job, but well paid',
        level: 1,
        minDemoVersion: 20,
        discountEffects: ['physical_actions_discount'],
        jobType: 'physical',
        getLearnRate: () => {
            return 1;
        },
        learningEffects: ['job_learning_rate'],
        resourceModifier: {
            get_income: () => ({
                resources: {
                    'coins': {
                        A: 1.5*gameEffects.getEffectValue('coins_earned_bonus')*gameEffects.getEffectValue('job_efficiency_physical'),
                        B: 13.5*gameEffects.getEffectValue('coins_earned_bonus')*gameEffects.getEffectValue('job_efficiency_physical'),
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
            effectDeps: ['coins_earned_bonus', 'job_efficiency_physical']
        },
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_strength',
            level: 400,
        }],
        attributes: {
            baseXPCost: 20,
            primaryAttribute: 'attribute_strength'
        }
    })


    registerGameAction('action_senior_builder', {
        tags: ["action", "job", "physical"],
        name: 'Senior Builder',
        isAbstract: false,
        minDemoVersion: 20,
        category: ACTION_CATS.COINS,
        allowedImpacts: ['effects'],
        description: 'Work as senior builder. Its harder, but better paid',
        level: 1,
        discountEffects: ['physical_actions_discount'],
        jobType: 'physical',
        getLearnRate: () => {
            return 1;
        },
        learningEffects: ['job_learning_rate'],
        resourceModifier: {
            get_income: () => ({
                resources: {
                    'coins': {
                        A: 3*gameEffects.getEffectValue('coins_earned_bonus')*gameEffects.getEffectValue('job_efficiency_physical'),
                        B: 27*gameEffects.getEffectValue('coins_earned_bonus')*gameEffects.getEffectValue('job_efficiency_physical'),
                        type: 0,
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    'energy': {
                        A: 0.0,
                        B: 32,
                        type: 0,
                    },
                    'health': {
                        A: 0.0,
                        B: 16,
                        type: 0,
                    }
                }
            }),
            effectDeps: ['coins_earned_bonus', 'job_efficiency_physical']
        },
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_strength',
            level: 1750,
        }],
        attributes: {
            baseXPCost: 20,
            primaryAttribute: 'attribute_strength'
        }
    })


    registerGameAction('action_foreman', {
        tags: ["action", "job", "physical"],
        name: 'Foreman',
        isAbstract: false,
        minDemoVersion: 20,
        category: ACTION_CATS.COINS,
        allowedImpacts: ['effects'],
        description: 'Get harder but better paid job as foreman',
        level: 1,
        discountEffects: ['physical_actions_discount'],
        getLearnRate: () => {
            return 1;
        },
        jobType: 'physical',
        learningEffects: ['job_learning_rate'],
        resourceModifier: {
            get_income: () => ({
                resources: {
                    'coins': {
                        A: 6*gameEffects.getEffectValue('coins_earned_bonus')*gameEffects.getEffectValue('job_efficiency_physical'),
                        B: 54*gameEffects.getEffectValue('coins_earned_bonus')*gameEffects.getEffectValue('job_efficiency_physical'),
                        type: 0,
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    'energy': {
                        A: 0.0,
                        B: 60,
                        type: 0,
                    },
                    'health': {
                        A: 0.0,
                        B: 25,
                        type: 0,
                    }
                }
            }),
            effectDeps: ['coins_earned_bonus', 'job_efficiency_physical']
        },
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_strength',
            level: 200000,
        }],
        attributes: {
            baseXPCost: 100,
            primaryAttribute: 'attribute_strength'
        }
    })

    registerGameAction('action_basic_illusions', {
        tags: ["action", "job", "magical"],
        name: 'Perform Basic Tricks',
        isAbstract: false,
        category: ACTION_CATS.COINS,
        allowedImpacts: ['effects'],
        description: 'Perform very primitive magical tricks to entertain people and collect some coins from them',
        level: 1,
        discountEffects: ['magical_actions_discount'],
        jobType: 'magical',
        getLearnRate: () => {
            return 1;
        },
        learningEffects: ['job_learning_rate'],
        resourceModifier: {
            get_income: () => ({
                resources: {
                    'coins': {
                        A: 0.6*gameEffects.getEffectValue('coins_earned_bonus')*gameEffects.getEffectValue('job_efficiency_magical'),
                        B: 5.4*gameEffects.getEffectValue('coins_earned_bonus'),
                        type: 0,
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    'energy': {
                        A: 0.0,
                        B: 2.5,
                        type: 0,
                    },
                    'mana': {
                        A: 0.0,
                        B: 0.6,
                        type: 0,
                    }
                }
            }),
            effectDeps: ['coins_earned_bonus', 'job_efficiency_magical']
        },
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_magic_ability',
            level: 50,
        }],
        attributes: {
            baseXPCost: 20,
            primaryAttribute: 'attribute_magic_capability'
        }
    })

    registerGameAction('action_simple_illusions', {
        tags: ["action", "job", "magical"],
        name: 'Create Simple Illusions',
        isAbstract: false,
        category: ACTION_CATS.COINS,
        allowedImpacts: ['effects'],
        description: 'Create simple magical illusions to amaze audiences and earn more coins than basic tricks',
        level: 1,
        discountEffects: ['physical_actions_discount'],
        jobType: 'magical',
        getLearnRate: () => {
            return 1;
        },
        learningEffects: ['job_learning_rate'],
        resourceModifier: {
            get_income: () => ({
                resources: {
                    'coins': {
                        A: 1.8*gameEffects.getEffectValue('coins_earned_bonus')*gameEffects.getEffectValue('job_efficiency_magical'),
                        B: 16.2*gameEffects.getEffectValue('coins_earned_bonus'),
                        type: 0,
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    'energy': {
                        A: 0.0,
                        B: 12.5,
                        type: 0,
                    },
                    'mana': {
                        A: 0.0,
                        B: 3.0,
                        type: 0,
                    }
                }
            }),
            effectDeps: ['coins_earned_bonus', 'job_efficiency_magical']
        },
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_magic_ability',
            level: 150,
        }],
        attributes: {
            baseXPCost: 20,
            primaryAttribute: 'attribute_magic_capability'
        }
    })

    registerGameAction('action_magical_research', {
        tags: ["action", "job", "magical"],
        name: 'Magical Research',
        isAbstract: false,
        category: ACTION_CATS.COINS,
        minDemoVersion: 20,
        allowedImpacts: ['effects'],
        description: 'Conduct research on magical phenomena and sell your findings',
        level: 1,
        discountEffects: ['physical_actions_discount'],
        jobType: 'magical',
        getLearnRate: () => {
            return 1;
        },
        learningEffects: ['job_learning_rate'],
        resourceModifier: {
            get_income: () => ({
                resources: {
                    'coins': {
                        A: 2.7*gameEffects.getEffectValue('coins_earned_bonus')*gameEffects.getEffectValue('job_efficiency_magical'),
                        B: 24.3*gameEffects.getEffectValue('coins_earned_bonus')*gameEffects.getEffectValue('job_efficiency_magical'),
                        type: 0,
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    'energy': {
                        A: 0.0,
                        B: 25,
                        type: 0,
                    },
                    'mana': {
                        A: 0.0,
                        B: 8,
                        type: 0,
                    }
                }
            }),
            effectDeps: ['coins_earned_bonus', 'job_efficiency_magical']
        },
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_magic_ability',
            level: 500,
        }],
        attributes: {
            baseXPCost: 20,
            primaryAttribute: 'attribute_magic_capability'
        }
    })

    registerGameAction('action_spell_consultant', {
        tags: ["action", "job", "magical"],
        name: 'Spell Consultant',
        isAbstract: false,
        category: ACTION_CATS.COINS,
        minDemoVersion: 20,
        allowedImpacts: ['effects'],
        description: 'Provide expert advice on spell casting and magical theory',
        level: 1,
        discountEffects: ['physical_actions_discount'],
        jobType: 'magical',
        getLearnRate: () => {
            return 1;
        },
        learningEffects: ['job_learning_rate'],
        resourceModifier: {
            get_income: () => ({
                resources: {
                    'coins': {
                        A: 4.0*gameEffects.getEffectValue('coins_earned_bonus')*gameEffects.getEffectValue('job_efficiency_magical'),
                        B: 36.0*gameEffects.getEffectValue('coins_earned_bonus')*gameEffects.getEffectValue('job_efficiency_magical'),
                        type: 0,
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    'energy': {
                        A: 0.0,
                        B: 40,
                        type: 0,
                    },
                    'mana': {
                        A: 0.0,
                        B: 15,
                        type: 0,
                    }
                }
            }),
            effectDeps: ['coins_earned_bonus', 'job_efficiency_magical']
        },
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_magic_ability',
            level: 4000,
        }],
        attributes: {
            baseXPCost: 20,
            primaryAttribute: 'attribute_magic_capability'
        }
    })

    registerGameAction('action_magical_engineer', {
        tags: ["action", "job", "magical"],
        name: 'Magical Engineer',
        isAbstract: false,
        category: ACTION_CATS.COINS,
        minDemoVersion: 20,
        allowedImpacts: ['effects'],
        description: 'Design and implement magical systems and enchantments',
        level: 1,
        discountEffects: ['physical_actions_discount'],
        jobType: 'magical',
        getLearnRate: () => {
            return 1;
        },
        learningEffects: ['job_learning_rate'],
        resourceModifier: {
            get_income: () => ({
                resources: {
                    'coins': {
                        A: 6.0*gameEffects.getEffectValue('coins_earned_bonus')*gameEffects.getEffectValue('job_efficiency_magical'),
                        B: 54.0*gameEffects.getEffectValue('coins_earned_bonus')*gameEffects.getEffectValue('job_efficiency_magical'),
                        type: 0,
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    'energy': {
                        A: 0.0,
                        B: 60,
                        type: 0,
                    },
                    'mana': {
                        A: 0.0,
                        B: 25,
                        type: 0,
                    }
                }
            }),
            effectDeps: ['coins_earned_bonus', 'job_efficiency_magical']
        },
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_magic_ability',
            level: 15000,
        }],
        attributes: {
            baseXPCost: 20,
            primaryAttribute: 'attribute_magic_capability'
        }
    })

    registerGameAction('action_magical_architect', {
        tags: ["action", "job", "magical"],
        name: 'Magical Architect',
        isAbstract: false,
        category: ACTION_CATS.COINS,
        minDemoVersion: 20,
        allowedImpacts: ['effects'],
        description: 'Design and construct magical buildings and structures',
        level: 1,
        discountEffects: ['physical_actions_discount'],
        jobType: 'magical',
        getLearnRate: () => {
            return 1;
        },
        learningEffects: ['job_learning_rate'],
        resourceModifier: {
            get_income: () => ({
                resources: {
                    'coins': {
                        A: 8.0*gameEffects.getEffectValue('coins_earned_bonus')*gameEffects.getEffectValue('job_efficiency_magical'),
                        B: 72.0*gameEffects.getEffectValue('coins_earned_bonus')*gameEffects.getEffectValue('job_efficiency_magical'),
                        type: 0,
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    'energy': {
                        A: 0.0,
                        B: 80,
                        type: 0,
                    },
                    'mana': {
                        A: 0.0,
                        B: 40,
                        type: 0,
                    }
                }
            }),
            effectDeps: ['coins_earned_bonus', 'job_efficiency_magical']
        },
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_magic_ability',
            level: 125000,
        }],
        attributes: {
            baseXPCost: 20,
            primaryAttribute: 'attribute_magic_capability'
        }
    })

    registerGameAction('action_woodcutter', {
        tags: ["action", "activity", "physical", "manual-labor"],
        name: 'Woodcutting',
        category: ACTION_CATS.OTHER,
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Spend some time working hard to get some wood',
        level: 1,
        discountEffects: ['physical_actions_discount'],
        resourceModifier: {
            get_income: () => ({
                resources: {
                    'inventory_wood': {
                        A: 0.002*gameEffects.getEffectValue('manual_labor_efficiency'),
                        B: 0.028*gameEffects.getEffectValue('manual_labor_efficiency'),
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
                        B: 2,
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
        category: ACTION_CATS.OTHER,
        isAbstract: false,
        minDemoVersion: 20,
        allowedImpacts: ['effects'],
        description: 'Work hard in quarry trying to find some rocks containing precious minerals',
        level: 1,
        discountEffects: ['physical_actions_discount'],
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


    registerGameAction('action_mining', {
        tags: ["action", "activity", "physical", "manual-labor"],
        name: 'Mining',
        isAbstract: false,
        minDemoVersion: 20,
        category: ACTION_CATS.OTHER,
        allowedImpacts: ['effects'],
        description: 'Go to mine and get some iron ore',
        level: 1,
        discountEffects: ['physical_actions_discount'],
        resourceModifier: {
            get_income: () => ({
                resources: {
                    'inventory_iron_ore': {
                        A: 0.0004*gameEffects.getEffectValue('manual_labor_efficiency')*gameEffects.getEffectValue('mining_efficiency'),
                        B: 0.002*gameEffects.getEffectValue('manual_labor_efficiency')*gameEffects.getEffectValue('mining_efficiency'),
                        type: 0,
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    'energy': {
                        A: 0.0,
                        B: 30,
                        type: 0,
                    },
                    'health': {
                        A: 0.0,
                        B: 25,
                        type: 0,
                    }
                }
            }),
            effectDeps: ['manual_labor_efficiency', 'mining_efficiency']
        },
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_strength',
            level: 1000,
        }],
        attributes: {
            baseXPCost: 25000,
            primaryAttribute: 'attribute_strength'
        }
    })

    
    registerGameAction('action_clay_mining', {
        tags: ["action", "activity", "physical", "manual-labor"],
        name: 'Clay Mining',
        category: ACTION_CATS.PHYSICAL,
        isAbstract: false,
        allowedImpacts: ['effects'],
        discountEffects: ['physical_actions_discount'],
        description: 'Extract clay from the earth for construction and pottery. Clay provides better wall treatment and thermal insulation.',
        level: 1,
        getLearnRate: () => {
            return 1
        },
        resourceModifier: {
            get_income: () => ({
                resources: {
                    'inventory_clay': {
                        A: 0.00005*gameEffects.getEffectValue('manual_labor_efficiency'),
                        B: 0.00045*gameEffects.getEffectValue('manual_labor_efficiency'),
                        type: 0,
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    'energy': {
                        A: 0.0,
                        B: 80,
                        type: 0,
                    },
                    'health': {
                        A: 0.0,
                        B: 40,
                        type: 0,
                    }
                }
            }),
            effectDeps: ['mining_efficiency', 'job_efficiency_physical']
        },
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_strength',
            level: 2000
        }],
        unlockCondition: () => {
            return true
        },
        attributes: {
            baseXPCost: 25000,
            primaryAttribute: 'attribute_strength'
        }
    })

    // Coal Mining — unlocked at 30000 Strength (replacing previous Masterwork bench idea)
    registerGameAction('action_coal_mining', {
        tags: ["action", "activity", "physical", "manual-labor"],
        name: 'Coal Mining',
        category: ACTION_CATS.PHYSICAL,
        isAbstract: false,
        allowedImpacts: ['effects'],
        discountEffects: ['physical_actions_discount'],
        description: 'Mine coal. Output is intentionally modest but enables automation era.',
        level: 1,
        getLearnRate: () => 1,
        resourceModifier: {
            get_income: () => ({
                resources: {
                    'inventory_coal': {
                        A: 0.00001*gameEffects.getEffectValue('manual_labor_efficiency')*gameEffects.getEffectValue('mining_efficiency'),
                        B: 0.00008*gameEffects.getEffectValue('manual_labor_efficiency')*gameEffects.getEffectValue('mining_efficiency'),
                        type: 0,
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    'energy': { A: 0.0, B: 120, type: 0 },
                    'health': { A: 0.0, B: 60, type: 0 },
                }
            }),
            effectDeps: ['manual_labor_efficiency', 'mining_efficiency']
        },
        unlockedBy: [{ type: 'effect', id: 'attribute_strength', level: 30000 }],
        attributes: {
            baseXPCost: 75000,
            primaryAttribute: 'attribute_strength'
        }
    })



    registerGameAction('action_rest', {
        tags: ["action", "rest", "physical"],
        name: 'Rest in Tavern',
        isAbstract: false,
        category: ACTION_CATS.PHYSICAL,
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
                        A: 0.25,
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
        category: ACTION_CATS.PHYSICAL,
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
                        A: 0.25*gameEffects.getEffectValue('rest_efficiency'),
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
        tags: ["action", "training", "social"],
        name: 'Gossip',
        category: ACTION_CATS.SOCIAL,
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Spend some time communicating with people about news and other things. Improves your charisma',
        level: 1,
        getLearnRate: () => {
            return 1;
        },
        learningEffects: ['social_training_learning_rate'],
        discountEffects: ['social_actions_discount'],
        resourceModifier: {
            get_income: () => ({
                effects: {
                    'attribute_charisma': {
                        A: 1*gameEffects.getEffectValue(getRankId('action_gossip')),
                        B: 0,
                        type: 0,
                    }
                }
            }),
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
            baseXPCost: 25,
            isTraining: true,
            isRankAvailable: true,
        }
    })


    registerGameAction('action_knowledge_exchange', {
        tags: ["action", "training", "social"],
        name: 'Knowledge Exchange',
        category: ACTION_CATS.SOCIAL,
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Engage in a mutual exchange of ideas with others, sharing insights and gaining valuable knowledge. Slightly increases your learning speed.',
        level: 1,
        getLearnRate: () => {
            return 1.
        },
        learningEffects: ['social_training_learning_rate'],
        discountEffects: ['social_actions_discount'],
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    'learning_rate': {
                        A: 0.01*gameEffects.getEffectValue(getRankId('action_knowledge_exchange')),
                        B: 0.99*gameEffects.getEffectValue(getRankId('action_knowledge_exchange')),
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
                    'knowledge': {
                        A: 0.0,
                        B: 5,
                        type: 0,
                    },
                }
            }),
            effectDeps: []
        },
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_charisma',
            level: 75,
        }],
        unlockCondition: () => {
            return true
        },
        attributes: {
            baseXPCost: 200,
            isTraining: true,
            isRankAvailable: true,
        }
    })

    registerGameAction('action_trade_efficiency', {
        tags: ["action", "training", "social"],
        name: 'Train Trade Efficiency',
        category: ACTION_CATS.SOCIAL,
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Learn more about trading and local economy. Increase amount of goods that can be sold',
        level: 1,
        minDemoVersion: 20,
        getLearnRate: () => {
            return 2.
        },
        learningEffects: ['social_training_learning_rate'],
        discountEffects: ['social_actions_discount'],
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    'shop_max_stock': {
                        A: 0.05*gameEffects.getEffectValue(getRankId('action_trade_efficiency')),
                        B: 1*gameEffects.getEffectValue(getRankId('action_trade_efficiency')),
                        type: 0,
                    },
                    'shop_stock_renew_rate': {
                        A: 0.02,
                        B: 1,
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
                    },
                }
            }),
            effectDeps: []
        },
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_charisma',
            level: 125,
        }],
        unlockCondition: () => {
            return true
        },
        attributes: {
            baseXPCost: 5000,
            isTraining: true,
            isRankAvailable: true,
        }
    })

    registerGameAction('action_train_bargaining', {
        tags: ["action", "training", "social"],
        name: 'Train Bargaining',
        category: ACTION_CATS.SOCIAL,
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Spent time walking through local market and talking to local merchants. This will improve your Bargaining attribute.',
        level: 1,
        minDemoVersion: 20,
        getLearnRate: () => {
            return 2.
        },
        learningEffects: ['social_training_learning_rate'],
        discountEffects: ['social_actions_discount'],
        resourceModifier: {
            get_income: () => ({
                effects: {
                    'attribute_bargaining': {
                        A: 0.5*gameEffects.getEffectValue(getRankId('action_train_bargaining')),
                        B: 0,
                        type: 0,
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    'energy': {
                        A: 0.0,
                        B: 50,
                        type: 0,
                    },
                }
            }),
            effectDeps: []
        },
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_charisma',
            level: 200,
        }],
        unlockCondition: () => {
            return true
        },
        attributes: {
            baseXPCost: 5000,
            isTraining: true,
            isRankAvailable: true,
        }
    })



    registerGameAction('action_public_engagement', {
        tags: ["action", "mental", "social", "activity"],
        name: 'Public Engagement',
        category: ACTION_CATS.SOCIAL,
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Engage with the public through speeches, events, and social interactions to inspire others and strengthen your influence. This action enhances the effectiveness of all social actions, making your efforts more impactful.',
        level: 1,
        minDemoVersion: 20,
        getLearnRate: () => {
            return 4.
        },
        learningEffects: ['mental_activities_learn_rate'],
        discountEffects: ['social_actions_discount'],
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    'social_training_learning_rate': {
                        A: 0.02*gameEffects.getEffectValue(getRankId('action_public_engagement')),
                        B: 0.98*gameEffects.getEffectValue(getRankId('action_public_engagement')),
                        type: 0,
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    'energy': {
                        A: 0.0,
                        B: 100,
                        type: 0,
                    },
                }
            }),
            effectDeps: []
        },
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_charisma',
            level: 300,
        }],
        unlockCondition: () => {
            return true
        },
        attributes: {
            baseXPCost: 1000,
            isTraining: true,
            isRankAvailable: true,
        }
    })


    registerGameAction('action_negotiation_mastery', {
        tags: ["action", "social", "training"],
        name: 'Negotiation Mastery',
        category: ACTION_CATS.SOCIAL,
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Improve your negotiation mastery, decreasing land cost.',
        level: 1,
        maxLevel: 100,
        minDemoVersion: 20,
        getLearnRate: () => {
            return 1.
        },
        learningEffects: ['social_training_learning_rate'],
        discountEffects: ['social_actions_discount'],
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    'land_purchase_discount': {
                        A: 0.02*gameEffects.getEffectValue(getRankId('action_negotiation_mastery')),
                        B: 0.98*gameEffects.getEffectValue(getRankId('action_negotiation_mastery')),
                        type: 0,
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    'energy': {
                        A: 0.0,
                        B: 300,
                        type: 0,
                    },
                    'knowledge': {
                        A: 0.0,
                        B: 30,
                        type: 0,
                    },
                }
            }),
            effectDeps: []
        },
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_charisma',
            level: 500,
        }],
        unlockCondition: () => {
            return true
        },
        attributes: {
            baseXPCost: 10000,
            isTraining: true,
            isRankAvailable: true,
        }
    })


    registerGameAction('action_academic_discussions', {
        tags: ["action", "mental", "activity"],
        name: 'Academic Discussions',
        category: ACTION_CATS.MENTAL,
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Participate in thought-provoking academic discussions and debates to broaden your knowledge and understanding.',
        level: 1,
        minDemoVersion: 20,
        getLearnRate: () => {
            return 1.
        },
        discountEffects: ['mental_actions_discount'],
        learningEffects: ['mental_activities_learn_rate'],
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    'learning_rate': {
                        A: 0.01*gameEffects.getEffectValue(getRankId('action_academic_discussions')),
                        B: 0.99*gameEffects.getEffectValue(getRankId('action_academic_discussions')),
                        type: 0,
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    'energy': {
                        A: 0.0,
                        B: 125,
                        type: 0,
                    },
                    'knowledge': {
                        A: 0.0,
                        B: 10,
                        type: 0,
                    },
                }
            }),
            effectDeps: []
        },
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_charisma',
            level: 750,
        }],
        unlockCondition: () => {
            return true
        },
        attributes: {
            baseXPCost: 5000,
            isTraining: true,
            primaryAttribute: 'attribute_charisma',
            isRankAvailable: true,
        }
    })


    registerGameAction('action_pushup', {
        tags: ["action", "training", "physical"],
        category: ACTION_CATS.PHYSICAL,
        name: 'Push Up',
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Perform some simple physical exercises to become stronger and unlock better physical jobs options',
        level: 1,
        discountEffects: ['physical_actions_discount'],
        resourceModifier: {
            get_income: () => ({
                effects: {
                    'attribute_strength': {
                        A: 1*gameEffects.getEffectValue(getRankId('action_pushup')),
                        B: 0,
                        type: 0,
                    },
                    'attribute_vitality': {
                        A: 1*gameEffects.getEffectValue(getRankId('action_pushup')),
                        B: 0,
                        type: 0,
                    }
                }
            }),
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
            type: 'effect',
            id: 'attribute_stamina',
            level: 100,
        }],
        getLearnRate: () => {
            return 1.
        },
        learningEffects: ['physical_training_learn_speed'],
        unlockCondition: () => {
            return gameEntity.getLevel('action_walk') > 19
        },
        attributes: {
            baseXPCost: 25,
            isTraining: true,
            isRankAvailable: true,
        }
    })


    registerGameAction('action_resilient_training', {
        tags: ["action", "training", "physical"],
        category: ACTION_CATS.PHYSICAL,
        name: 'Resilient Training',
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Toughens your body, making physical tasks easier.',
        level: 1,
        maxLevel: 20,
        discountEffects: ['physical_actions_discount'],
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    'physical_actions_discount': {
                        A: 0.02,
                        B: 0.98,
                        type: 0,
                    },
                }
            }),
            consumption: {
                resources: {
                    'energy': {
                        A: 0,
                        B: 8,
                        type: 0
                    }
                }
            },
            effectDeps: [],
        },
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_strength',
            level: 50,
        }],
        getLearnRate: () => {
            return 1.
        },
        learningEffects: ['physical_training_learn_speed'],
        unlockCondition: () => {
            return gameEntity.getLevel('action_walk') > 19
        },
        attributes: {
            baseXPCost: 100,
            isTraining: true,
            isRankAvailable: true,
        }
    })


    registerGameAction('action_heavy_lifting', {
        tags: ["action", "training", "physical"],
        category: ACTION_CATS.PHYSICAL,
        name: 'Heavy Lifting',
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Train your body through intense strength-building exercises. Requires significant amounts of energy and health but grants notable increases to your Strength attribute.',
        level: 1,
        discountEffects: ['physical_actions_discount'],
        resourceModifier: {
            get_income: () => ({
                effects: {
                    'attribute_strength': {
                        A: 2*gameEffects.getEffectValue(getRankId('action_heavy_lifting')),
                        B: -2,
                        type: 0,
                    },
                }
            }),
            consumption: {
                resources: {
                    'energy': {
                        A: 0,
                        B: 8000,
                        type: 0
                    },
                    'health': {
                        A: 0,
                        B: 4000,
                        type: 0
                    }
                }
            },
            effectDeps: [],
            reourcesToReassert: ['health']
        },
        minDemoVersion: 20,
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_strength',
            level: 4000,
        }],
        getLearnRate: () => {
            return 1.
        },
        learningEffects: ['physical_training_learn_speed'],
        unlockCondition: () => {
            return gameEntity.getLevel('action_walk') > 19
        },
        attributes: {
            baseXPCost: 5250000,
            isTraining: true,
            isRankAvailable: true,
        }
    })

    registerGameAction('action_read_motivation_book', {
        tags: ["action", "training", "mental"],
        category: ACTION_CATS.MENTAL,
        name: 'Read Book of Motivation',
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Read book of motivation, containing some useful advices regarding self-development. Increase general actions XP gain',
        level: 1,
        maxLevel: 5,
        discountEffects: ['mental_actions_discount'],
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
            baseXPCost: 20,
            isTraining: true,
        }
    })


    registerGameAction('action_read_math_book', {
        tags: ["action", "training", "mental"],
        category: ACTION_CATS.MENTAL,
        name: 'Train Math',
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Train you brain to calculate coins better. Increase coins income',
        level: 1,
        maxLevel: 5,
        discountEffects: ['mental_actions_discount'],
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

    registerGameAction('action_gather_carefully', {
        tags: ["action", "activity", "routine", "gathering"],
        category: ACTION_CATS.ROUTINE,
        name: 'Careful Gathering',
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Spend some time looking for items, but without many risks',
        level: 1,
        discountEffects: ["routine_actions_discount"],
        getLearnRate: () => {
            return 1.
        },
        learningEffects: ['routine_learning_speed'],
        resourceModifier: {
            get_income: () => ({
                resources: {
                    'gathering_effort': {
                        A: 0.002*gameEffects.getEffectValue('gathering_efficiency'),
                        B: 0.048*gameEffects.getEffectValue('gathering_efficiency'),
                        type: 0,
                    },
                    'gathering_perception': {
                        A: 0,
                        B: 0.1,
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
            return gameEntity.getLevel('shop_item_map') > 0
        },
        attributes: {
            baseXPCost: 50,
            primaryAttribute: 'attribute_patience'
        }
    })


    /*registerGameAction('action_scouting_training', {
        tags: ["action", "training", "physical"],
        category: ACTION_CATS.PHYSICAL,
        name: 'Rough Terrain Training',
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Pushes your body and mind through demanding exploration drills, enhancing gathering efficiency in challenging environments and improving energy regeneration.',
        level: 1,
        maxLevel: 25,
        discountEffects: ['physical_actions_discount'],
        unlockedBy: [{
            type: 'entity',
            id: 'action_gather_carefully',
            level: 25,
        }],
        learningEffects: ['physical_training_learn_speed'],
        resourceModifier: {
            multiplier: {
                effects: {
                    'gathering_efficiency': {
                        A: 0.02,
                        B: 1.0,
                        type: 0,
                    },
                    'attribute_stamina': {
                        A: 0.005,
                        B: 1.0,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'health': {
                        A: 0,
                        B: 1,
                        type: 0
                    },
                    'knowledge': {
                        A: 0,
                        B: 5,
                        type: 0
                    }
                }
            },
            effectDeps: []
        },
        unlockCondition: () => {
            // console.log('Beggar level: ', gameEntity.getLevel('action_beggar'));
            return true
        },
        attributes: {
            baseXPCost: 50,
            isTraining: true,
        }
    })*/


/*
    registerGameAction('action_repetitive_discipline', {
        tags: ["action", "training", "physical"],
        category: ACTION_CATS.PHYSICAL,
        name: 'Repetitive Discipline',
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Trains your endurance through repetitive effort, reducing experience required for routine tasks.',
        level: 1,
        maxLevel: 10,
        discountEffects: ['physical_actions_discount'],
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_patience',
            level: 10,
        }],
        learningEffects: ['physical_training_learn_speed'],
        resourceModifier: {
            multiplier: {
                effects: {
                    'routine_actions_discount': {
                        A: 0.04,
                        B: 1.0,
                        type: 0,
                    },
                }
            },
            consumption: {
                resources: {
                    'health': {
                        A: 0,
                        B: 2,
                        type: 0
                    },
                    'energy': {
                        A: 0,
                        B: 5,
                        type: 0
                    }
                }
            },
            effectDeps: []
        },
        unlockCondition: () => {
            // console.log('Beggar level: ', gameEntity.getLevel('action_beggar'));
            return true
        },
        attributes: {
            baseXPCost: 50,
            isTraining: true,
        }
    })*/



    registerGameAction('action_gather_normal', {
        tags: ["action", "activity", "routine", "gathering"],
        name: 'Gathering',
        category: ACTION_CATS.ROUTINE,
        minDemoVersion: 20,
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Spend more energy and efforts on looking for items for better rewards. You\'ll be able to cover smaller areas, but have better chance to find something',
        level: 1,
        getLearnRate: () => {
            return 1.
        },
        discountEffects: ["routine_actions_discount"],
        learningEffects: ['routine_learning_speed'],
        resourceModifier: {
            get_income: () => ({
                resources: {
                    'gathering_effort': {
                        A: 0.001*gameEffects.getEffectValue('gathering_efficiency'),
                        B: 0.039*gameEffects.getEffectValue('gathering_efficiency'),
                        type: 0,
                    },
                    'gathering_perception': {
                        A: 0,
                        B: 0.3,
                        type: 0,
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    'energy': {
                        A: 0,
                        B: 5,
                        type: 0,
                    },
                    'health': {
                        A: 0,
                        B: 2.5,
                        type: 0,
                    }
                }
            }),
            effectDeps: ['gathering_efficiency']
        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0 && gameEntity.getLevel('shop_item_herbs_handbook_2') > 0
        },
        attributes: {
            baseXPCost: 50,
            primaryAttribute: 'attribute_patience'
        }
    })


    registerGameAction('action_hunt_carefully', {
        tags: ["action", "activity", "routine", "gathering"],
        name: 'Carefull Hunt',
        minDemoVersion: 20,
        category: ACTION_CATS.ROUTINE,
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Spend some time hunting to get more loot. This requires map exploration, so its best to combine with "gathering" activities',
        level: 1,
        getLearnRate: () => {
            return 1.
        },
        discountEffects: ["routine_actions_discount"],
        learningEffects: ['routine_learning_speed'],
        resourceModifier: {
            get_income: () => ({
                resources: {
                    'gathering_effort': {
                        A: 0.001*gameEffects.getEffectValue('gathering_efficiency'),
                        B: 0.039*gameEffects.getEffectValue('gathering_efficiency'),
                        type: 0,
                    },
                    'hunting_effort': {
                        A: 0.0001,
                        B: 0.00039,
                        type: 0,
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    'energy': {
                        A: 0,
                        B: 250,
                        type: 0,
                    },
                    'health': {
                        A: 0,
                        B: 150,
                        type: 0,
                    },
                    'inventory_hunting_net': {
                        A: 0,
                        B: 0.01,
                        type: 0,
                    }
                }
            }),
            effectDeps: ['gathering_efficiency']
        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0 && gameEntity.getLevel('shop_item_hunting') > 0
        },
        attributes: {
            baseXPCost: 500000000,
            primaryAttribute: 'attribute_patience'
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
            return gameEntity.getLevel('shop_item_backpack') > 0 && false
        },
        attributes: {
            baseXPCost: 50,
            primaryAttribute: 'attribute_patience'
        }
    })

    registerGameAction('action_read_books', {
        tags: ["action", "activity", "mental", "book"],
        name: 'Read Books',
        category: ACTION_CATS.MENTAL,
        isAbstract: false,
        discountEffects: ['mental_actions_discount'],
        allowedImpacts: ['effects'],
        description: 'Read books to find new information and increase your knowledge',
        level: 1,
        getLearnRate: () => {
            return 1
        },
        learningEffects: ['books_learning_rate', 'mental_activities_learn_rate'],
        resourceModifier: {
            get_income: () => ({
                resources: {
                    'knowledge': {
                        A: 0.007*gameEffects.getEffectValue('read_books_efficiency'),
                        B: 0.027*gameEffects.getEffectValue('read_books_efficiency'),
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
        tags: ["action", "magical", "activity", "book"],
        category: ACTION_CATS.MAGICAL,
        name: 'Read Apprentice Handbook',
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Read magic book, providing you precious information about increasing your magic potential. Unfortunately, the text inside is encrypted with runes that you have to de-crypt using spells.',
        level: 1,
        getLearnRate: () => {
            return 1
        },
        learningEffects: ['books_learning_rate'],
        discountEffects: ['magical_actions_discount'],
        resourceModifier: {
            get_income: () => ({
                effects: {
                    'attribute_spell_reading': {
                        A: 1*gameEffects.getEffectValue(getRankId('action_read_mages_handbook')),
                        B: -1,
                        type: 0,
                    }
                }
            }),
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
            return gameEntity.getLevel('shop_item_mages_handbook') > 0
        },
        attributes: {
            baseXPCost: 50,
            isTraining: true,
            isRankAvailable: true,
        }
    })


    registerGameAction('action_yoga_practices', {
        tags: ["action", "training", "mental"],
        category: ACTION_CATS.MENTAL,
        name: 'Yoga Practice',
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Practice yoga to train your patience and stamina. Unlocks new activities requiring more patience.',
        level: 1,
        discountEffects: ['mental_actions_discount'],
        resourceModifier: {
            get_income: () => ({
                effects: {
                    'attribute_patience': {
                        A: 1*gameEffects.getEffectValue(getRankId('action_yoga_practices')),
                        B: -1,
                        type: 0,
                    },
                    'attribute_stamina': {
                        A: 0.5*gameEffects.getEffectValue(getRankId('action_yoga_practices')),
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
        learningEffects: ['yoga_learn_speed', 'mental_training_learning_rate'],
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_yoga_manual') > 0
        },
        attributes: {
            baseXPCost: 50,
            displayPerLevel: 1,
            isTraining: true,
            isRankAvailable: true,
        }
    })

    registerGameAction('action_home_errands', {
        tags: ["action", "activity", "routine"],
        category: ACTION_CATS.ROUTINE,
        name: 'Home Errands',
        isAbstract: false,
        allowedImpacts: ['effects'],
        discountEffects: ["routine_actions_discount"],
        description: 'Clean your house, organize things to free more space for coins storage',
        level: 1,
        getLearnRate: () => {
            return 1.
        },
        satelliteEntityId: 'action_bonus_home_errands',
        satelliteEntityLevelMod: (l) => Math.max(0, (l || 1) - 1), // modifier for entity
        learningEffects: ['routine_learning_speed'],
        resourceModifier: {
            get_capMult: () => ({
                resources: {
                    'coins': {
                        A: 0.05*gameEffects.getEffectValue(getRankId('action_home_errands')),
                        B: 0.95*gameEffects.getEffectValue(getRankId('action_home_errands')),
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
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_tent') > 3
        },
        attributes: {
            baseXPCost: 40,
            isTraining: true,
            primaryAttribute: 'attribute_patience',
            isRankAvailable: true,
        }
    })


    /*registerGameAction('action_dig_vaults', {
        tags: ["action", "activity", "routine"],
        name: 'Dig Vaults',
        category: ACTION_CATS.ROUTINE,
        isAbstract: false,
        allowedImpacts: ['effects'],
        discountEffects: ["routine_actions_discount"],
        description: 'Dig underground vaults to store your coins. Its energy consuming action, but can pay off',
        level: 1,
        minDemoVersion: 20,
        getLearnRate: () => {
            return 2.
        },
        learningEffects: ['routine_learning_speed'],
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    'coins_cap_bonus': {
                        A: 0.025*gameEffects.getEffectValue(getRankId('action_dig_vaults')),
                        B: 0.975,
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
            level: 425,
        }],
        attributes: {
            baseXPCost: 1500,
            isTraining: true,
            primaryAttribute: 'attribute_patience',
            isRankAvailable: true,
        }
    })*/


    registerGameAction('action_learn_anatomy', {
        tags: ["action", "mental", "book"],
        name: 'Learn Anatomy',
        category: ACTION_CATS.MENTAL,
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Learn anatomy to better understand your body and improve your energy and health regeneration',
        level: 1,
        discountEffects: ['mental_actions_discount'],
        getLearnRate: () => {
            return 1.
        },
        learningEffects: ['books_learning_rate'],
        resourceModifier: {
            get_income: () => ({
                effects: {
                    'attribute_recovery': {
                        A: 0.2*gameEffects.getEffectValue(getRankId('action_learn_anatomy')),
                        B: -0.2,
                        type: 0,
                    },
                    'attribute_stamina': {
                        A: 3*gameEffects.getEffectValue(getRankId('action_learn_anatomy')),
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
            isRankAvailable: true,
        }
    })


    registerGameAction('action_learn_geography', {
        tags: ["action", "mental", "book"],
        name: 'Learn Geography',
        category: ACTION_CATS.MENTAL,
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Learn geography to find better places of finding natural resources',
        level: 1,
        discountEffects: ['mental_actions_discount'],
        getLearnRate: () => {
            return 1.
        },
        minDemoVersion: 20,
        learningEffects: ['books_learning_rate'],
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    'manual_labor_efficiency': {
                        A: 0.005*gameEffects.getEffectValue(getRankId('action_learn_geography')),
                        B: 0.995,
                        type: 0,
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    'energy': {
                        A: 0.0,
                        B: 800,
                        type: 0,
                    },
                    'knowledge': {
                        A: 0.0,
                        B: 20,
                        type: 0,
                    }
                }
            }),
            effectDeps: ['read_books_efficiency']
        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_geography_book') > 0
        },
        attributes: {
            baseXPCost: 50000,
            displayPerLevel: 1,
            isTraining: true,
            isRankAvailable: true,
        }
    })

    registerGameAction('action_learn_self_organization', {
        tags: ["action", "mental", "book"],
        name: 'Learn Self-Organization',
        category: ACTION_CATS.MENTAL,
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Learn self-organization techniques to increase your coin storage capacity',
        level: 1,
        maxLevel: 100,
        discountEffects: ['mental_actions_discount'],
        getLearnRate: () => {
            return 1.
        },
        satelliteEntityId: 'action_bonus_self_organization',
        satelliteEntityLevelMod: (l) => Math.max(0, (l || 1) - 1), // modifier for entity
        learningEffects: ['books_learning_rate'],
        resourceModifier: {
            get_capMult: () => ({
                resources: {
                    'coins': {
                        A: 0.02,
                        B: 1,
                        type: 0,
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    'energy': {
                        A: 0.0,
                        B: 100,
                        type: 0,
                    },
                    'knowledge': {
                        A: 0.0,
                        B: 25,
                        type: 0,
                    }
                }
            }),
            effectDeps: ['read_books_efficiency']
        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_self_organization_book') > 0
        },
        attributes: {
            baseXPCost: 25000,
            displayPerLevel: 1,
            isTraining: true,
        }
    })

    registerGameAction('action_learn_botany', {
        tags: ["action", "mental", "book"],
        name: 'Learn Botany',
        category: ACTION_CATS.MENTAL,
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Learn secrets of growing plants',
        level: 1,
        minDemoVersion: 20,
        discountEffects: ['mental_actions_discount'],
        getLearnRate: () => {
            return 1.
        },
        learningEffects: ['books_learning_rate'],
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    'plantations_efficiency': {
                        A: 0.005*gameEffects.getEffectValue(getRankId('action_learn_geography')),
                        B: 0.995,
                        type: 0,
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    'energy': {
                        A: 0.0,
                        B: 400,
                        type: 0,
                    },
                    'knowledge': {
                        A: 0.0,
                        B: 320,
                        type: 0,
                    }
                }
            }),
            effectDeps: ['read_books_efficiency']
        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_botany_book') > 0
        },
        attributes: {
            baseXPCost: 25000000,
            displayPerLevel: 1,
            isTraining: true,
            isRankAvailable: true,
        }
    })


    registerGameAction('action_learn_languages', {
        tags: ["action", "training", "mental"],
        name: 'Learn Languages',
        category: ACTION_CATS.MENTAL,
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Learn ancient languages to increase book reading related XP',
        level: 1,
        getLearnRate: () => 1,
        discountEffects: ['mental_actions_discount'],
        learningEffects: ['mental_training_learning_rate', 'learn_languages_efficiency'],
        resourceModifier: {
            get_income: () => ({
                effects: {
                    'books_learning_rate': {
                        A: 0.1*gameEffects.getEffectValue(getRankId('action_learn_languages')),
                        B: -0.1,
                        type: 0,
                    },
                    'attribute_memory': {
                        A: 0.5*gameEffects.getEffectValue(getRankId('action_learn_languages')),
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
            isRankAvailable: true,
        }
    })

    registerGameAction('action_linguistic_practices', {
        tags: ["action", "training", "mental"],
        name: 'Linguistic Drills',
        category: ACTION_CATS.MENTAL,
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'You pay a grumpy scholar to drill you on obscure grammar rules until you understand how not to misunderstand ancient languages.',
        level: 1,
        maxLevel: 10,
        getLearnRate: () => 1,
        discountEffects: ['mental_actions_discount'],
        learningEffects: ['mental_training_learning_rate'],
        resourceModifier: {
            get_income: () => ({
                effects: {
                    'learn_languages_efficiency': {
                        A: 0.1*gameEffects.getEffectValue(getRankId('action_learn_languages')),
                        B: -0.1,
                        type: 0,
                    },
                }
            }),
            get_consumption: () => ({
                resources: {
                    'energy': {
                        A: 0.0,
                        B: 2,
                        type: 0,
                    },
                    'coins': {
                        A: 0.0,
                        B: 50,
                        type: 0,
                    }
                }
            }),
            effectDeps: ['read_books_efficiency']
        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_linguistic_practices') > 0
        },
        attributes: {
            baseXPCost: 50,
            displayPerLevel: 1,
            isTraining: true,
            isRankAvailable: true,
        }
    })

    registerGameAction('action_endurance_training', {
        tags: ["action", "training", "physical"],
        category: ACTION_CATS.PHYSICAL,
        name: 'Train Endurance',
        discountEffects: ['physical_actions_discount'],
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Do some exercises in local gym to improve your body',
        level: 1,
        getLearnRate: () => {
            return 1.
        },
        learningEffects: ['physical_training_learn_speed'],
        resourceModifier: {
            get_income: () => ({
                effects: {
                    'attribute_recovery': {
                        A: 1*gameEffects.getEffectValue(getRankId('action_endurance_training')),
                        B: -1,
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
            baseXPCost: 25,
            displayPerLevel: 1,
            isTraining: true,
            isRankAvailable: true,
        }
    })

    registerGameAction('action_stamina_training', {
        tags: ["action", "training", "physical"],
        category: ACTION_CATS.PHYSICAL,
        name: 'Train Stamina',
        discountEffects: ['physical_actions_discount'],
        isAbstract: false,
        allowedImpacts: ['effects'],
        minDemoVersion: 20,
        description: 'Your improved endurance has unlocked a harder but much more efficient way to train your stamina',
        level: 1,
        getLearnRate: () => {
            return 1
        },
        learningEffects: ['physical_training_learn_speed'],
        resourceModifier: {
            get_income: () => ({
                effects: {
                    'attribute_stamina': {
                        A: 8*gameEffects.getEffectValue(getRankId('action_stamina_training')),
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
            level: 250,
        }],
        attributes: {
            baseXPCost: 500,
            displayPerLevel: 1,
            isTraining: true,
            isRankAvailable: true,
        }
    })

    registerGameAction('action_cardio_training', {
        tags: ["action", "training", "physical"],
        category: ACTION_CATS.PHYSICAL,
        name: 'Cardio Training',
        discountEffects: ['physical_actions_discount'],
        isAbstract: false,
        minDemoVersion: 20,
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
                        A: 3*gameEffects.getEffectValue(getRankId('action_cardio_training')),
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
            level: 350,
        }],
        attributes: {
            baseXPCost: 500,
            displayPerLevel: 1,
            isTraining: true,
            isRankAvailable: true,
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
                    },
                    'rare_herbs_loot': {
                        A: 0,
                        B: 0.0004*getChanceBased(gameEffects.getEffectValue('gathering_efficiency'), 1.5, 10),
                        type: 0
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
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0 && false
        },
        attributes: {
            baseXPCost: 50,
            primaryAttribute: 'attribute_patience',
            possibleRareHerbs: {
                'inventory_rare_titanleaf': 1,
                'inventory_rare_heartroot': 1
            }
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
                    },
                    'rare_herbs_loot': {
                        A: 0,
                        B: 0.0004*getChanceBased(gameEffects.getEffectValue('gathering_efficiency'), 1.5, 10),
                        type: 0
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
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0
                && gameEntity.getLevel('shop_item_herbs_handbook_1') > 0 && false
        },
        attributes: {
            baseXPCost: 50,
            primaryAttribute: 'attribute_patience',
            possibleRareHerbs: {
                'inventory_rare_titanleaf': 1,
                'inventory_rare_heartroot': 1,
                'inventory_rare_energloom': 0.5,
                'inventory_rare_lifebloom': 0.5,
            }
        }
    })


    registerGameAction('action_magic_backyard', {
        tags: ["action", "gathering", "routine"],
        name: 'Searching in Mages Backyard',
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'There is abandoned mages hut at the edge of settlement. It is told to be very dangerous, but having a lot of unique plants',
        level: 1,
        getLearnRate: () => {
            return 1
        },
        learningEffects: ['routine_learning_speed'],
        resourceModifier: {
            get_income: () => ({
                resources: {
                    'inventory_fly_mushroom': {
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
                    },
                    'rare_herbs_loot': {
                        A: 0,
                        B: 0.0004*getChanceBased(gameEffects.getEffectValue('gathering_efficiency'), 1.5, 10),
                        type: 0
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    'energy': {
                        A: 0.0,
                        B: 20,
                        type: 0,
                    },
                    'health': {
                        A: 0.0,
                        B: 10,
                        type: 0,
                    }
                }
            }),
            effectDeps: ['gathering_efficiency']
        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0
                && gameEntity.getLevel('shop_item_herbs_handbook_2') > 0 && false
        },
        attributes: {
            baseXPCost: 500,
            primaryAttribute: 'attribute_patience',
            possibleRareHerbs: {
                'inventory_rare_titanleaf': 1,
                'inventory_rare_heartroot': 1,
                'inventory_rare_azureblossom': 0.5,
                'inventory_rare_mindspire': 0.5,
                'inventory_rare_mindroot': 0.5,
            }
        }
    })


    registerGameAction('action_silent_fields', {
        tags: ["action", "gathering", "routine"],
        name: 'Searching in Silent Fields',
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'TBD',
        level: 1,
        getLearnRate: () => {
            return 1
        },
        learningEffects: ['routine_learning_speed'],
        resourceModifier: {
            get_income: () => ({
                resources: {
                    'inventory_harmony_blossom': {
                        A: 0.00001*gameEffects.getEffectValue('gathering_efficiency'),
                        B: 0.00009*gameEffects.getEffectValue('gathering_efficiency'),
                        type: 0,
                    },
                    'inventory_ember_leaf': {
                        A: 0.00001*gameEffects.getEffectValue('gathering_efficiency'),
                        B: 0.00009*gameEffects.getEffectValue('gathering_efficiency'),
                        type: 0,
                    },
                    'inventory_mystic_bloom': {
                        A: 0.00001*gameEffects.getEffectValue('gathering_efficiency'),
                        B: 0.00009*gameEffects.getEffectValue('gathering_efficiency'),
                        type: 0,
                    },
                    'rare_herbs_loot': {
                        A: 0,
                        B: 0.0004*getChanceBased(gameEffects.getEffectValue('gathering_efficiency'), 1.5, 10),
                        type: 0
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    'energy': {
                        A: 0.0,
                        B: 20,
                        type: 0,
                    },
                    'health': {
                        A: 0.0,
                        B: 10,
                        type: 0,
                    }
                }
            }),
            effectDeps: ['gathering_efficiency']
        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0
                && gameEntity.getLevel('shop_item_herbs_handbook_3') > 0 && false
        },
        attributes: {
            baseXPCost: 500,
            primaryAttribute: 'attribute_patience',
            possibleRareHerbs: {
                'inventory_rare_ironvine': 1,
                'inventory_rare_mindspire': 1,
                'inventory_rare_verdant_coil': 1,
            }
        }
    })


    registerGameAction('action_dark_forest', {
        tags: ["action", "gathering", "routine"],
        name: 'Searching Dark Forest',
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Your guild-mates told you about dark forest with some unique plants...',
        level: 1,
        getLearnRate: () => {
            return 1
        },
        learningEffects: ['routine_learning_speed'],
        resourceModifier: {
            get_income: () => ({
                resources: {
                    'inventory_fly_mushroom': {
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
                    },
                    'rare_herbs_loot': {
                        A: 0,
                        B: 0.0004*getChanceBased(gameEffects.getEffectValue('gathering_efficiency'), 1.5, 10),
                        type: 0
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    'energy': {
                        A: 0.0,
                        B: 40,
                        type: 0,
                    },
                    'health': {
                        A: 0.0,
                        B: 15,
                        type: 0,
                    }
                }
            }),
            effectDeps: ['gathering_efficiency']
        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0
                && gameEntity.getLevel('shop_item_herbs_handbook_2') > 0
            && gameEntity.getLevel('guild_herbalists') > 0 && false
        },
        attributes: {
            baseXPCost: 5000,
            primaryAttribute: 'attribute_patience',
            possibleRareHerbs: {
                'inventory_rare_stillfern': 1,
                'inventory_rare_ironvine': 0.5,
                'inventory_rare_mindspire': 0.5,
                'inventory_rare_mindroot': 1,
            }
        }
    })


    registerGameAction('action_meditate', {
        tags: ["action", "training", "magical", "spiritual"],
        name: 'Meditate',
        category: ACTION_CATS.MAGICAL,
        isAbstract: false,
        allowedImpacts: ['effects'],
        discountEffects: ['magical_actions_discount'],
        description: 'Use meditative practices to improve your mental abilities',
        level: 1,
        resourceModifier: {
            get_income: () => ({
                effects: {
                    'attribute_magic_ability': {
                        A: 1*gameEffects.getEffectValue(getRankId('action_meditate')),
                        B: -1,
                        type: 0,
                    },
                    'attribute_patience': {
                        A: 0.25*gameEffects.getEffectValue(getRankId('action_meditate')),
                        B: -0.25,
                        type: 0,
                    }
                }
            }),
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
            isRankAvailable: true,
        }
    })

    registerGameAction('action_mental_realignment', {
        tags: ["action", "activity", "mental"],
        category: ACTION_CATS.MENTAL,
        name: 'Mental Realignment',
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Refocuses your mental and spiritual pathways, reducing experience required for related trainings.',
        level: 1,
        maxLevel: 25,
        discountEffects: ['mental_actions_discount'],
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_magic_ability',
            level: 25,
        }],
        resourceModifier: {
            multiplier: {
                effects: {
                    'mental_actions_discount': {
                        A: 0.04,
                        B: 0.96,
                        type: 0,
                    },
                    'magical_actions_discount': {
                        A: 0.04,
                        B: 0.96,
                        type: 0,
                    }
                }
            },
            consumption: {
                resources: {
                    'mana': {
                        A: 0,
                        B: 0.4,
                        type: 0
                    },
                    'knowledge': {
                        A: 0,
                        B: 2.5,
                        type: 0
                    }
                }
            },
            effectDeps: []
        },
        unlockCondition: () => {
            // console.log('Beggar level: ', gameEntity.getLevel('action_beggar'));
            return true
        },
        attributes: {
            baseXPCost: 50,
            isTraining: true,
        }
    })


    registerGameAction('action_illusory_urn', {
        tags: ["action", "illusion", "magical", "storage", "channeling"],
        name: 'Illusory Urn',
        category: ACTION_CATS.MAGICAL,
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Channel your magical energy to manifest an illusory urn, a phantom container that expands your ability to store coins beyond physical limits.',
        level: 1,
        maxLevel: 5,
        satelliteEntityId: 'furniture_illusory_urn',
        satelliteEntityLevelMod: (l) => Math.max(0, (l || 1) - 1), // modifier for entity
        resourceModifier: {
            get_rawCap: () => ({
                resources: {
                    'coins': {
                        A: 80*gameEffects.getEffectValue('urn_storage_bonus'),
                        B: -80*gameEffects.getEffectValue('urn_storage_bonus'),
                        type: 0,
                    },
                }
            }),
            consumption: {
                resources: {
                    'energy': {
                        A: 0,
                        B: 5.00,
                        type: 0
                    },
                    'mana': {
                        A: 0,
                        B: 1.00,
                        type: 0
                    }
                }
            },
            effectDeps: ['urn_storage_bonus']
        },
        getLearnRate: () => {
            return 1
        },
        learningEffects: ['spiritual_learning_rate'],
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_less_illusion') > 0
        },
        attributes: {
            baseXPCost: 500,
            isTraining: true,
        }
    })


    registerGameAction('action_magic_training', {
        tags: ["action", "training", "magical", "spiritual"],
        category: ACTION_CATS.MAGICAL,
        name: 'Magic Training',
        isAbstract: false,
        allowedImpacts: ['effects'],
        discountEffects: ['magical_actions_discount'],
        description: 'Improve your magic capability using practices of ancient monks',
        level: 1,
        resourceModifier: {
            get_income: () => ({
                effects: {
                    'attribute_magic_capability': {
                        A: 1*gameEffects.getEffectValue(getRankId('action_magic_training')),
                        B: 0,
                        type: 0,
                    },
                }
            }),
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
            isRankAvailable: true,
        }
    })


    registerGameAction('action_spiritual_alignment', {
        tags: ["action", "training", "mental"],
        name: 'Spiritual Alignment',
        category: ACTION_CATS.MAGICAL,
        isAbstract: false,
        minDemoVersion: 20,
        allowedImpacts: ['effects'],
        description: 'Spend some time trying to hear the magic inside you. Improve your feeling of yourself',
        level: 1,
        discountEffects: ['mental_actions_discount'],
        getLearnRate: () => {
            return 1.
        },
        learningEffects: ['mental_training_learning_rate'],
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    'spiritual_learning_rate': {
                        A: 0.02*gameEffects.getEffectValue(getRankId('action_spiritual_alignment')),
                        B: 0.98,
                        type: 0,
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    'energy': {
                        A: 0.0,
                        B: 15,
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
            isTraining: true,
            isRankAvailable: true,
        }
    })


    registerGameAction('action_craft', {
        tags: ["action", "activity", "physical", "crafting"],
        category: ACTION_CATS.OTHER,
        name: 'Basic Craft',
        isAbstract: false,
        allowedImpacts: ['none'],
        description: 'Dedicate your time and efforts to crafting',
        level: 1,
        getLearnRate: () => {
            return 2
        },
        resourceModifier: {
            get_income: () => ({
                effects: {
                    'crafting_effort': {
                        A: 0.001,
                        B: 0.029,
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
                        B: 1.2,
                        type: 0,
                    }
                }
            }),
            effectDeps: []
        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_crafting_courses') > 0 && false
        },
        attributes: {
            baseXPCost: 100,
            primaryAttribute: 'attribute_strength',
            isEffectChanneling: true,
        }
    })


    


    registerGameAction('action_alchemy', {
        tags: ["action", "activity", "crafting", "alchemy"],
        name: 'Alchemy',
        category: ACTION_CATS.OTHER,
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
            return gameEntity.getLevel('shop_item_alchemy_courses') > 0 && false
        },
        attributes: {
            baseXPCost: 100,
            primaryAttribute: 'attribute_patience'
        }
    })


    registerGameAction('action_meditative_insight', {
        tags: ["action", "training", "magical", "spiritual"],
        name: 'Meditative Insight',
        category: ACTION_CATS.MAGICAL,
        isAbstract: false,
        minDemoVersion: 20,
        allowedImpacts: ['effects'],
        discountEffects: ['magical_actions_discount'],
        description: 'Engage in a deep meditative practice with the Metaphysics Book, sharpening memory and enhancing mana regeneration by channeling profound knowledge and magical focus.',
        level: 1,
        resourceModifier: {
            get_income: () => ({
                effects: {
                    'attribute_magic_ability': {
                        A: 2*gameEffects.getEffectValue(getRankId('action_meditative_insight')),
                        B: -2,
                        type: 0,
                    },
                    'attribute_memory': {
                        A: 4*gameEffects.getEffectValue(getRankId('action_meditative_insight')),
                        B: -4,
                        type: 0,
                    },
                }
            }),
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
            isRankAvailable: true,
        }
    })


    registerGameAction('action_nail_standing', {
        tags: ["action", "training", "mental"],
        name: 'Nail Standing',
        category: ACTION_CATS.MENTAL,
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'This practice demands immense concentration and endurance as you stand on a board embedded with nails. Through this rigorous discipline, you strengthen both mind and body, enhancing your efficiency in routine tasks.',
        level: 1,
        minDemoVersion: 20,
        discountEffects: ['mental_actions_discount'],
        getLearnRate: () => {
            return 5.
        },
        learningEffects: ['mental_training_learning_rate'],
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    'routine_learning_speed': {
                        A: 0.02*gameEffects.getEffectValue(getRankId('action_nail_standing')),
                        B: 0.98,
                        type: 0,
                    }
                }
            }),
            get_income: () => ({
                effects: {
                    'attribute_recovery': {
                        A: 2*gameEffects.getEffectValue(getRankId('action_nail_standing')),
                        B: -2,
                        type: 0,
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    'energy': {
                        A: 0.0,
                        B: 200,
                        type: 0,
                    },
                    'health': {
                        A: 0,
                        B: 25,
                        type: 0,
                    }
                }
            }),
            effectDeps: []
        },
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_patience',
            level: 350,
        }],
        unlockCondition: () => {
            return true
        },
        attributes: {
            baseXPCost: 10000,
            isTraining: true,
            isRankAvailable: true,
        }
    })

    registerGameAction('action_routine_mastery', {
        tags: ["action", "training", "mental"],
        name: 'Routine Mastery',
        category: ACTION_CATS.MENTAL,
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Through conscious effort and repetition, you refine your daily habits, making routine tasks feel lighter and more efficient.',
        level: 1,
        discountEffects: ['mental_actions_discount'],
        getLearnRate: () => {
            return 5.
        },
        minDemoVersion: 20,
        learningEffects: ['mental_training_learning_rate'],
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    'routine_actions_discount': {
                        A: 0.02*gameEffects.getEffectValue(getRankId('action_routine_mastery')),
                        B: 0.98,
                        type: 0,
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    'energy': {
                        A: 0.0,
                        B: 50000,
                        type: 0,
                    },
                    'mental_energy': {
                        A: 0,
                        B: 500,
                        type: 0,
                    }
                }
            }),
            effectDeps: []
        },
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_patience',
            level: 25000,
        }],
        unlockCondition: () => {
            return true
        },
        attributes: {
            baseXPCost: 1000000000000,
            isTraining: true,
            isRankAvailable: true,
        }
    })



    registerGameAction('action_deep_focus', {
        tags: ["action", "training", "mental"],
        name: 'Deep Focus',
        category: ACTION_CATS.MENTAL,
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'An intense mental exercise that hones your concentration, greatly enhancing the speed of mental training and unlocking new depths of cognitive ability.',
        level: 1,
        discountEffects: ['mental_actions_discount'],
        getLearnRate: () => {
            return 5.
        },
        learningEffects: ['mental_training_learning_rate'],
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    'mental_training_learning_rate': {
                        A: 0.02*gameEffects.getEffectValue(getRankId('action_deep_focus')),
                        B: 0.98,
                        type: 0,
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    'energy': {
                        A: 0.0,
                        B: 4000,
                        type: 0,
                    },
                    'mental_energy': {
                        A: 0,
                        B: 25,
                        type: 0,
                    }
                }
            }),
            effectDeps: []
        },
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_patience',
            level: 4000,
        }],
        minDemoVersion: 20,
        unlockCondition: () => {
            return true
        },
        attributes: {
            baseXPCost: 100000000,
            isTraining: true,
            isRankAvailable: true,
        }
    })


    registerGameAction('action_social_debates', {
        tags: ["action", "activity", "social"],
        name: 'Social Debates',
        category: ACTION_CATS.SOCIAL,
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Engage in lively debates to sharpen your wits and increase your Charisma.',
        level: 1,
        minDemoVersion: 20,
        discountEffects: ['social_actions_discount'],
        getLearnRate: () => {
            return 5.
        },
        // learningEffects: ['social_training_learning_rate'],
        resourceModifier: {
            get_income: () => ({
                effects: {
                    'attribute_charisma': {
                        A: 5*gameEffects.getEffectValue(getRankId('action_social_debates')),
                        B: -5,
                        type: 0,
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    'energy': {
                        A: 0.0,
                        B: 8000,
                        type: 0,
                    },
                    'mental_energy': {
                        A: 0,
                        B: 250,
                        type: 0,
                    }
                }
            }),
            effectDeps: []
        },
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_patience',
            level: 15000,
        }],
        unlockCondition: () => {
            return true
        },
        attributes: {
            baseXPCost: 100000,
            isTraining: true,
            isRankAvailable: true,
        }
    })


    registerGameAction('action_charity', {
        tags: ["action", "activity", "social"],
        category: ACTION_CATS.SOCIAL,
        name: 'Charitable Deeds',
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Dedicate yourself to helping others selflessly, sacrificing energy and health, but gaining patience and a boost to your charisma in return.',
        level: 1,
        minDemoVersion: 20,
        getLearnRate: () => {
            return 5.
        },
        learningEffects: [],
        discountEffects: ['social_actions_discount'],
        resourceModifier: {
            get_income: () => ({
                effects: {
                    'attribute_charisma': {
                        A: 2*gameEffects.getEffectValue(getRankId('action_charity')),
                        B: -2,
                        type: 0,
                    },
                    'attribute_patience': {
                        A: 0.5*gameEffects.getEffectValue(getRankId('action_charity')),
                        B: -0.5,
                        type: 0,
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    'energy': {
                        A: 0.0,
                        B: 200,
                        type: 0,
                    },
                    'health': {
                        A: 0,
                        B: 25,
                        type: 0,
                    }
                }
            }),
            effectDeps: []
        },
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_patience',
            level: 800,
        }],
        unlockCondition: () => {
            return true
        },
        attributes: {
            baseXPCost: 5000,
            isTraining: true,
            isRankAvailable: true,
        }
    })



    registerGameAction('action_magic_analyzes', {
        tags: ["action", "training", "magical", "spiritual"],
        category: ACTION_CATS.MAGICAL,
        name: 'Magic Analysis',
        isAbstract: false,
        allowedImpacts: ['effects'],
        discountEffects: ['magical_actions_discount'],
        description: 'Finally you achieved that point where your brain allows you to understand the nature of magic. Analyze magic, mana and how its used by spells. Its hard and exhausting task, but totally worth it',
        level: 1,
        minDemoVersion: 20,
        resourceModifier: {
            get_income: () => ({
                effects: {
                    'attribute_magic_capability': {
                        A: 3*gameEffects.getEffectValue(getRankId('action_magic_analyzes')),
                        B: 0,
                        type: 0,
                    },
                }
            }),
            consumption: {
                resources: {
                    'energy': {
                        A: 0,
                        B: 225.00,
                        type: 0
                    },
                    'knowledge': {
                        A: 0,
                        B: 50.00,
                        type: 0
                    },
                    'mana': {
                        A: 0,
                        B: 25.00,
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
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_magic_ability',
            level: 500,
        }],
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_metaphysics_handbook') > 0
        },
        attributes: {
            baseXPCost: 1000,
            isTraining: true,
            isRankAvailable: true,
        }
    })


    registerGameAction('action_magical_immersion', {
        tags: ["action", "magical", "training"],
        name: 'Magical Immersion',
        category: ACTION_CATS.MAGICAL,
        isAbstract: false,
        allowedImpacts: ['effects'],
        discountEffects: ['magical_actions_discount'],
        description: 'You delve into the world of magical energies, training your mind to interact with forces beyond ordinary understanding. This is not just a practice – it\'s a transformation of consciousness.',
        level: 1,
        getLearnRate: () => {
            return 5
        },
        minDemoVersion: 20,
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    'mental_activities_learn_rate': {
                        A: 0.01*gameEffects.getEffectValue(getRankId('action_magical_immersion')),
                        B: 0.99,
                        type: 0,
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    'energy': {
                        A: 0.0,
                        B: 500,
                        type: 0,
                    },
                    'mana': {
                        A: 0.0,
                        B: 250,
                        type: 0,
                    }
                }
            }),
            effectDeps: []
        },
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_magic_ability',
            level: 2000
        }],
        unlockCondition: () => {
            return true
        },
        attributes: {
            baseXPCost: 10000,
            isTraining: true,
            isRankAvailable: true,
        }
    })


    registerGameAction('action_mind_cleansing', {
        tags: ["action", "mental", "training"],
        name: 'Mind Cleansing',
        category: ACTION_CATS.MENTAL,
        isAbstract: false,
        allowedImpacts: ['effects'],
        discountEffects: ['mental_actions_discount'],
        description: 'Clear your thoughts with calming practices like deep breathing and quiet contemplation. Enhances Clarity, improving the regeneration of your mental energy.',
        level: 1,
        minDemoVersion: 20,
        getLearnRate: () => {
            return 5
        },
        learningEffects: ['mental_training_learning_rate'],
        resourceModifier: {
            get_income: () => ({
                effects: {
                    'attribute_clarity': {
                        A: 1*gameEffects.getEffectValue(getRankId('action_mind_cleansing')),
                        B: 1,
                        type: 0,
                    },
                }
            }),
            get_consumption: () => ({
                resources: {
                    'energy': {
                        A: 0.0,
                        B: 1500,
                        type: 0,
                    },
                    'knowledge': {
                        A: 0.0,
                        B: 150,
                        type: 0,
                    }
                }
            }),
            effectDeps: []
        },
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_patience',
            level: 2250
        }],
        unlockCondition: () => {
            return true
        },
        attributes: {
            baseXPCost: 7500000,
            isTraining: true,
            isRankAvailable: true,
        }
    })


    registerGameAction('action_mental_endurance', {
        tags: ["action", "mental", "training"],
        name: 'Mental Endurance Training',
        category: ACTION_CATS.MENTAL,
        isAbstract: false,
        allowedImpacts: ['effects'],
        discountEffects: ['mental_actions_discount'],
        description: 'Push your limits with challenging mental exercises that build resilience and patience. Gradually increases your Willpower, allowing for greater mental energy capacity.',
        level: 1,
        minDemoVersion: 20,
        getLearnRate: () => {
            return 5
        },
        learningEffects: ['mental_training_learning_rate'],
        resourceModifier: {
            get_income: () => ({
                effects: {
                    'attribute_willpower': {
                        A: 2*gameEffects.getEffectValue(getRankId('action_mental_endurance')),
                        B: 1,
                        type: 0,
                    },
                    'attribute_patience': {
                        A: 0.5*gameEffects.getEffectValue(getRankId('action_mental_endurance')),
                        B: -0.5,
                        type: 0,
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    'energy': {
                        A: 0.0,
                        B: 500,
                        type: 0,
                    },
                    'knowledge': {
                        A: 0.0,
                        B: 50,
                        type: 0,
                    }
                }
            }),
            effectDeps: []
        },
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_patience',
            level: 2250
        }],
        unlockCondition: () => {
            return true
        },
        attributes: {
            baseXPCost: 500000,
            isTraining: true,
            isRankAvailable: true,
        }
    })

    registerGameAction('action_elemental_channeling', {
        tags: ["action", "magical", "channeling"],
        name: 'Elemental Channeling',
        category: ACTION_CATS.MAGICAL,
        isAbstract: false,
        allowedImpacts: ['none'],
        discountEffects: ['magical_actions_discount'],
        description: 'Focus your mind and attune yourself to the elemental forces, enhancing the flow of elemental energy and increasing its generation rate.',
        level: 1,
        getLearnRate: () => {
            return 5
        },
        minDemoVersion: 20,
        learningEffects: [],
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    'elemental_spells_efficiency': {
                        A: 0.005*gameEffects.getEffectValue(getRankId('action_elemental_channeling')),
                        B: 1.495,
                        type: 0,
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    'energy': {
                        A: 0.0,
                        B: 5000,
                        type: 0,
                    },
                    'knowledge': {
                        A: 0.0,
                        B: 500,
                        type: 0,
                    }
                }
            }),
            effectDeps: []
        },
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_magic_ability',
            level: 10000
        }],
        unlockCondition: () => {
            return true
        },
        attributes: {
            baseXPCost: 2500000,
            isEffectChanneling: true,
            isRankAvailable: true,
        }
    })

    registerGameAction('action_crafting_training', {
        tags: ["action", "training", "physical"],
        name: 'Crafting Training',
        category: ACTION_CATS.PHYSICAL,
        isAbstract: false,
        allowedImpacts: ['effects'],
        discountEffects: ['physical_actions_discount'],
        description: 'Intense physical training that improves your crafting efficiency through better control and strength',
        level: 1,
        getLearnRate: () => {
            return 1
        },
        learningEffects: ['physical_training_learn_speed'],
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    'crafting_effort': {
                        A: 0.01*gameEffects.getEffectValue(getRankId('action_crafting_training')),
                        B: 0.99,
                        type: 0,
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    'energy': {
                        A: 0.0,
                        B: 150,
                        type: 0,
                    },
                    'health': {
                        A: 0.0,
                        B: 125,
                        type: 0,
                    }
                }
            }),
            effectDeps: []
        },
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_strength',
            level: 600
        }],
        unlockCondition: () => {
            return true
        },
        attributes: {
            baseXPCost: 25000,
            isTraining: true,
            isRankAvailable: true,
        }
    })

    registerGameAction('action_alchemy_training', {
        tags: ["action", "training", "mental"],
        name: 'Alchemy Training',
        category: ACTION_CATS.MENTAL,
        isAbstract: false,
        allowedImpacts: ['effects'],
        discountEffects: ['mental_actions_discount'],
        description: 'Mental exercises that enhance your alchemy efficiency through improved focus and understanding',
        level: 1,
        getLearnRate: () => {
            return 1
        },
        learningEffects: ['mental_training_learning_rate'],
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    'alchemy_effort': {
                        A: 0.01*gameEffects.getEffectValue(getRankId('action_alchemy_training')),
                        B: 0.99,
                        type: 0,
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    'energy': {
                        A: 0.0,
                        B: 500,
                        type: 0,
                    },
                    'knowledge': {
                        A: 0.0,
                        B: 40,
                        type: 0,
                    }
                }
            }),
            effectDeps: []
        },
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_patience',
            level: 600
        }],
        unlockCondition: () => {
            return true
        },
        attributes: {
            baseXPCost: 25000,
            isTraining: true,
            isRankAvailable: true,
        }
    })

    // ------------------------//
    // *** Bonuses Related *** //

    gameEntity.registerGameEntity('action_bonus_home_errands', {
        name: 'Home Errands Bonus',
        isAbstract: false,
        resourceModifier: {
            get_capMult: () => ({
                resources: {
                    'coins': {
                        A: 0.05*gameEffects.getEffectValue(getRankId('action_home_errands')),
                        B: 1*gameEffects.getEffectValue(getRankId('action_home_errands')),
                        type: 0,
                    }
                }
            }),
            effectDeps: [getRankId('action_home_errands')],
        },
    })

    
    gameEntity.registerGameEntity('action_bonus_self_organization', {
        name: 'Self Organization Bonus',
        isAbstract: false,
        resourceModifier: {
            get_capMult: () => ({
                resources: {
                    'coins': {
                        A: 0.02,
                        B: 1,
                        type: 0,
                    }
                }
            }),
        },
    })

    registerGameAction('action_expedition', {
        tags: ["action", "activity", "routine", "expedition"],
        category: ACTION_CATS.ROUTINE,
        name: 'Expedition',
        isAbstract: false,
        allowedImpacts: ['effects'],
        description: 'Embark on expeditions to discover ancient artifacts, mystical scrolls, and hidden treasures. This action generates expedition effort needed for launching expeditions.',
        level: 1,
        discountEffects: ["routine_actions_discount"],
        getLearnRate: () => {
            return 1.
        },
        learningEffects: ['routine_learning_speed'],
        resourceModifier: {
            get_income: () => ({
                resources: {
                    'expedition_effort': {
                        A: 0.0004*gameEffects.getEffectValue('expedition_efficiency'),
                        B: 0.0036*gameEffects.getEffectValue('expedition_efficiency'),
                        type: 0,
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    'energy': {
                        A: 0.0,
                        B: 200,
                        type: 0,
                    },
                    'health': {
                        A: 0.0,
                        B: 100,
                        type: 0,
                    }
                }
            }),
            effectDeps: ['expedition_efficiency']
        },
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_magic_ability',
            level: 20000
        }],
        unlockCondition: () => {
            return true
        },
        attributes: {
            baseXPCost: 500000000000,
            primaryAttribute: 'attribute_patience'
        }
    })

    console.log('-RM-=: ', )
}