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

    randomEventsDB.push({
        id: 'rare_event_mind_trial',
        name: 'Trial of the Mind',
        description: 'A mysterious hooded figure approaches you, speaking in riddles. "Only those who push their minds beyond limits shall grasp true wisdom," they whisper. They offer you a challenge—one that will test your intellect and endurance.',
        unlockCondition: () => true,
        probability: 0.3, // Рідкісна подія
        options: {
            option1: {
                id: 'option1',
                name: 'Take the mental challenge',
                unlockCondition: () => true,
                effects: [{
                    id: 'mental_training_boost_strong',
                    probability: 1,
                    description: 'Your mind sharpens as you unravel complex riddles and puzzles! (+Mental training speed for 5 minutes, level 3)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_mental_training_rate_buff', 3)
                    }
                }]
            },
            option2: {
                id: 'option2',
                name: 'Push your limits even further',
                unlockCondition: () => true,
                effects: [{
                    id: 'mental_training_boost_max',
                    probability: 0.8,
                    description: 'Through sheer will, you reach a new level of understanding! (+Mental training speed for 5 minutes, -health debuff for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_mental_training_rate_buff', 4)
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_health_debuff', 1)
                    }
                }, {
                    id: 'health_debuff',
                    probability: 0.2,
                    description: 'The trial is too intense, straining both your mind and body. (-Health regeneration for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_health_debuff', 2)
                    }
                }]
            },
            option3: {
                id: 'option3',
                name: 'Walk away, unsure of the risks',
                unlockCondition: () => true,
                effects: [{
                    id: 'nothing_happens',
                    probability: 1,
                    description: 'You decide not to take the risk. Nothing changes.',
                    unlockCondition: () => true,
                    onTrigger: () => {}
                }]
            }
        }
    });

    randomEventsDB.push({
        id: 'rare_event_trial_of_will',
        name: 'Trial of Will',
        description: 'You find yourself in an ancient temple, where a mystical presence challenges you to a test of mental endurance. "True strength comes from the mind," a voice echoes in the chamber. The challenge is difficult, but great wisdom awaits those who persevere.',
        unlockCondition: () => true,
        probability: 0.25, // Дуже рідкісна подія
        options: {
            option1: {
                id: 'option1',
                name: 'Endure the mental strain',
                unlockCondition: () => true,
                effects: [{
                    id: 'mental_training_boost_high',
                    probability: 1,
                    description: 'You push through the challenge, emerging stronger! (+Mental training speed for 5 minutes, level 4)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_mental_training_rate_buff', 4)
                    }
                }]
            },
            option2: {
                id: 'option2',
                name: 'Embrace the full trial',
                unlockCondition: () => true,
                effects: [{
                    id: 'mental_training_boost_max',
                    probability: 0.75,
                    description: 'You reach a new peak of mental clarity! (+Mental training speed for 5 minutes, level 5, but -health regeneration for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_mental_training_rate_buff', 5)
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_health_debuff', 1)
                    }
                }, {
                    id: 'overwhelming_exhaustion',
                    probability: 0.25,
                    description: 'The trial drains you beyond measure. (-Health regeneration for 5 minutes, stronger effect)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_health_debuff', 2)
                    }
                }]
            },
            option3: {
                id: 'option3',
                name: 'Leave before it’s too late',
                unlockCondition: () => true,
                effects: [{
                    id: 'nothing_happens',
                    probability: 1,
                    description: 'You step away from the trial, unsure of what could have been. Nothing changes.',
                    unlockCondition: () => true,
                    onTrigger: () => {}
                }]
            }
        }
    });

    randomEventsDB.push({
        id: 'rare_event_ancient_tome',
        name: 'The Ancient Tome',
        description: 'You stumble upon an ancient tome hidden in a forgotten library. Its pages glow faintly, filled with knowledge beyond your comprehension. However, deciphering it may be both rewarding and exhausting.',
        unlockCondition: () => true,
        probability: 0.2, // Дуже рідкісна подія
        options: {
            option1: {
                id: 'option1',
                name: 'Study the tome carefully',
                unlockCondition: () => true,
                effects: [{
                    id: 'general_learning_boost_high',
                    probability: 1,
                    description: 'You absorb its wisdom, refining your ability to learn. (+General learning speed for 5 minutes, level 4)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_learn_rate_buff', 4)
                    }
                }]
            },
            option2: {
                id: 'option2',
                name: 'Push your mind to its limits',
                unlockCondition: () => true,
                effects: [{
                    id: 'general_learning_boost_max',
                    probability: 0.6,
                    description: 'You fully unlock the tome’s secrets, greatly enhancing your learning speed! (+General learning speed for 5 minutes, level 5)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_learn_rate_buff', 5)
                    }
                }, {
                    id: 'mental_training_boost',
                    probability: 0.2,
                    description: 'The complex texts sharpen your intellect. (+Mental training speed for 5 minutes, level 3)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_mental_training_rate_buff', 3)
                    }
                }, {
                    id: 'energy_drain',
                    probability: 0.2,
                    description: 'The strain exhausts you, making you feel mentally drained. (-Energy regeneration for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_energy_debuff', 1)
                    }
                }]
            },
            option3: {
                id: 'option3',
                name: 'Skim through the easier sections',
                unlockCondition: () => true,
                effects: [{
                    id: 'general_learning_boost_mild',
                    probability: 1,
                    description: 'You gain some insights, though not as much as you could have. (+General learning speed for 5 minutes, level 3)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_learn_rate_buff', 3)
                    }
                }]
            }
        }
    });

    randomEventsDB.push({
        id: 'rare_event_rhetoric_tournament',
        name: 'Rhetoric Tournament',
        description: 'You hear of a grand tournament where the greatest minds and speakers gather to compete in debate and wit. Participation could sharpen both your mental prowess and social skills—but it may also be draining.',
        unlockCondition: () => true,
        probability: 0.2, // Дуже рідкісна подія
        options: {
            option1: {
                id: 'option1',
                name: 'Compete with full force',
                unlockCondition: () => true,
                effects: [{
                    id: 'social_training_boost_max',
                    probability: 0.6,
                    description: 'Your arguments dazzle the audience! (+Social training speed for 5 minutes, level 5)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_social_training_rate_buff', 5)
                    }
                }, {
                    id: 'mental_training_boost',
                    probability: 0.2,
                    description: 'The complexity of the debate sharpens your thinking. (+Mental training speed for 5 minutes, level 3)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_mental_training_rate_buff', 3)
                    }
                }, {
                    id: 'energy_drain',
                    probability: 0.2,
                    description: 'The intense mental effort leaves you exhausted. (-Energy regeneration for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_energy_debuff', 1)
                    }
                }]
            },
            option2: {
                id: 'option2',
                name: 'Participate with a balanced approach',
                unlockCondition: () => true,
                effects: [{
                    id: 'social_training_boost_high',
                    probability: 1,
                    description: 'You hold your ground and refine your rhetoric. (+Social training speed for 5 minutes, level 4)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_social_training_rate_buff', 4)
                    }
                }]
            },
            option3: {
                id: 'option3',
                name: 'Observe and take notes',
                unlockCondition: () => true,
                effects: [{
                    id: 'mental_training_boost_mild',
                    probability: 1,
                    description: 'You absorb knowledge from the great debaters. (+Mental training speed for 5 minutes, level 3)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_mental_training_rate_buff', 3)
                    }
                }]
            }
        }
    });


    return randomEventsDB;
};
