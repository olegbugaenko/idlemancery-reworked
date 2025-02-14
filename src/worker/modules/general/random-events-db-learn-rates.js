import {gameCore, gameEntity, gameResources} from "game-framework";

export const randomEventScalingFactor = (id) => {
    const level = gameEntity.getLevel(id);
    let result = Math.pow(1 + level, 1.5)
    if(level > 100) {
        result *= Math.pow(1.03, level);
    }
    return result;
}

export const registerRandomEventsLearnDb = () => {

    const randomEventsDB = [];

    randomEventsDB.push({
        id: 'early_event_social_learning',
        name: 'Inspirational Conversation',
        description: 'During a casual chat with a wise elder, you find yourself deeply engaged in discussion. Their words spark new ideas and perspectives. You feel your social skills improving!',
        unlockCondition: () => true,
        probability: 1,
        options: {
            option1: {
                id: 'option1',
                name: 'Actively engage in the discussion',
                unlockCondition: () => true,
                effects: [{
                    id: 'social_training_boost',
                    probability: 1,
                    description: 'You learn valuable lessons on persuasion and conversation! (+Social training speed for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_social_training_rate_buff', 1)
                    }
                }]
            },
            option2: {
                id: 'option2',
                name: 'Listen carefully and reflect',
                unlockCondition: () => true,
                effects: [{
                    id: 'general_learning_boost',
                    probability: 1,
                    description: 'The insights broaden your mind, helping you learn more efficiently! (+General learning speed for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_learn_rate_buff', 1)
                    }
                }]
            },
            option3: {
                id: 'option3',
                name: 'Steer the conversation towards deeper topics',
                unlockCondition: () => true,
                effects: [{
                    id: 'mental_training_boost',
                    probability: 1,
                    description: 'A deep philosophical debate strengthens your mental discipline. (+Mental training speed for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_mental_training_rate_buff', 1)
                    }
                }]
            }
        }
    });

    randomEventsDB.push({
        id: 'early_event_physical_training',
        name: 'Rigorous Training',
        description: 'You come across a group of seasoned warriors engaged in intense physical training. They invite you to join their exercises. It looks exhausting but rewarding. Do you accept?',
        unlockCondition: () => true,
        probability: 1,
        options: {
            option1: {
                id: 'option1',
                name: 'Train alongside them',
                unlockCondition: () => true,
                effects: [{
                    id: 'physical_training_boost',
                    probability: 1,
                    description: 'You push your body to the limits and feel stronger! (+Physical training speed for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_physical_training_rate_buff', 1)
                    }
                }]
            },
            option2: {
                id: 'option2',
                name: 'Observe and learn their techniques',
                unlockCondition: () => true,
                effects: [{
                    id: 'general_learning_boost_physical',
                    probability: 1,
                    description: 'Analyzing their movements gives you new insights into training! (+General learning speed for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_learn_rate_buff', 1)
                    }
                }]
            },
            option3: {
                id: 'option3',
                name: 'Offer to spar with one of them',
                unlockCondition: () => true,
                effects: [{
                    id: 'mental_training_boost_physical',
                    probability: 1,
                    description: 'The duel sharpens your reflexes and mind. (+Mental training speed for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_mental_training_rate_buff', 1)
                    }
                }]
            }
        }
    });

    randomEventsDB.push({
        id: 'early_event_study_night',
        name: 'A Night of Study',
        description: 'Unable to sleep, you decide to spend the night reading. The candlelight flickers as you immerse yourself in study. What area of knowledge will you focus on?',
        unlockCondition: () => true,
        probability: 1,
        options: {
            option1: {
                id: 'option1',
                name: 'Read about philosophy and logic',
                unlockCondition: () => true,
                effects: [{
                    id: 'mental_training_boost_study',
                    probability: 1,
                    description: 'Your mind sharpens as you ponder deep concepts. (+Mental training speed for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_mental_training_rate_buff', 1)
                    }
                }]
            },
            option2: {
                id: 'option2',
                name: 'Study leadership and negotiation',
                unlockCondition: () => true,
                effects: [{
                    id: 'social_training_boost_study',
                    probability: 1,
                    description: 'The wisdom of great leaders inspires you! (+Social training speed for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_social_training_rate_buff', 1)
                    }
                }]
            },
            option3: {
                id: 'option3',
                name: 'Read a variety of subjects',
                unlockCondition: () => true,
                effects: [{
                    id: 'general_learning_boost_study',
                    probability: 1,
                    description: 'Your broad reading habits improve your overall ability to learn! (+General learning speed for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_learn_rate_buff', 1)
                    }
                }]
            }
        }
    });

    randomEventsDB.push({
        id: 'event_exhausting_debate',
        name: 'Exhausting Debate',
        description: 'You find yourself in an intense debate with a group of scholars. The discussion is fascinating but also mentally exhausting. Will you keep pushing through?',
        unlockCondition: () => true,
        probability: 1,
        options: {
            option1: {
                id: 'option1',
                name: 'Hold your ground and argue fiercely',
                unlockCondition: () => true,
                effects: [{
                    id: 'mental_training_boost_strong',
                    probability: 0.8,
                    description: 'You refine your reasoning skills through fierce argumentation! (+Mental training speed for 5 minutes, strong effect)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_mental_training_rate_buff', 1.5)
                    }
                }, {
                    id: 'mental_fatigue',
                    probability: 0.2,
                    description: 'The discussion drains you. (-Energy regeneration for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_energy_debuff', 0.7)
                    }
                }]
            },
            option2: {
                id: 'option2',
                name: 'Listen more than you speak',
                unlockCondition: () => true,
                effects: [{
                    id: 'general_learning_boost_mild',
                    probability: 1,
                    description: 'Absorbing insights from others makes you a better learner. (+General learning speed for 5 minutes, moderate effect)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_learn_rate_buff', 0.5)
                    }
                }]
            },
            option3: {
                id: 'option3',
                name: 'Walk away before it gets too intense',
                unlockCondition: () => true,
                effects: [{
                    id: 'nothing_happens',
                    probability: 1,
                    description: 'You leave the debate before it takes a toll on you. Nothing changes.',
                    unlockCondition: () => true,
                    onTrigger: () => {}
                }]
            }
        }
    });

    randomEventsDB.push({
        id: 'event_exhausting_training',
        name: 'Exhausting Training',
        description: 'A veteran instructor invites you to an advanced training session. The exercises are intense, pushing you to your limits. Will you go all in?',
        unlockCondition: () => true,
        probability: 1,
        options: {
            option1: {
                id: 'option1',
                name: 'Give it your all!',
                unlockCondition: () => true,
                effects: [{
                    id: 'physical_training_boost_strong',
                    probability: 0.8,
                    description: 'Your muscles burn, but you become stronger! (+Physical training speed for 5 minutes, strong effect)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_physical_training_rate_buff', 1.5)
                    }
                }, {
                    id: 'energy_debuff_fatigue',
                    probability: 0.2,
                    description: 'The brutal exercises leave you exhausted. (-Energy regeneration for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_energy_debuff', 1)
                    }
                }]
            },
            option2: {
                id: 'option2',
                name: 'Train at a moderate pace',
                unlockCondition: () => true,
                effects: [{
                    id: 'physical_training_boost_mild',
                    probability: 1,
                    description: 'You make steady progress without overexerting yourself. (+Physical training speed for 5 minutes, moderate effect)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_physical_training_rate_buff', 1)
                    }
                }]
            },
            option3: {
                id: 'option3',
                name: 'Take notes instead of participating',
                unlockCondition: () => true,
                effects: [{
                    id: 'mental_training_boost_mild',
                    probability: 0.8,
                    description: 'You learn valuable techniques by observing the others. (+Mental training speed for 5 minutes, moderate effect)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_mental_training_rate_buff', 1)
                    }
                }, {
                    id: 'energy_drain_from_boredom',
                    probability: 0.2,
                    description: 'Watching instead of doing makes you feel restless. (-Energy regeneration for 5 minutes, weaker effect)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_energy_debuff', 0.5)
                    }
                }]
            }
        }
    });

    return randomEventsDB;
};
