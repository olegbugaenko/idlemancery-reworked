import {gameCore, gameEntity, gameResources} from "game-framework";

export const randomEventScalingFactor = (id) => {
    const level = gameEntity.getLevel(id);
    let result = Math.pow(1 + level, 1.5)
    if(level > 100) {
        result *= Math.pow(1.03, level);
    }
    return result;
}

export const registerRandomEventsDbBK = () => {

    const randomEventsDB = [];

    randomEventsDB.push({
        id: 'early_event1',
        name: 'Lost Coin',
        description: 'As you stroll through the forest, the sunlight catches something shiny beneath a pile of leaves. It appears to be an old, golden coin, its edges worn smooth by time. Do you take a closer look or move on?',
        unlockCondition: () => true,
        probability: 1,
        options: {
            option1: {
                id: 'option1',
                name: 'Pick it up',
                unlockCondition: () => true,
                effects: [{
                    id: 'gain_gold',
                    probability: 0.7,
                    description: 'You gain 10 gold. The coin glows faintly as you pick it up, and a warm feeling spreads through your fingers. It’s as if the coin is thanking you for finding it.',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameResources.addResource('coins', 10);
                    }
                },{
                    id: 'gain_gold2',
                    probability: 0.2,
                    description: 'You gain 25 gold. As you brush off the dirt, you notice intricate carvings on the coin’s surface. It seems ancient and valuable, almost as if it has seen centuries of trade.',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameResources.addResource('coins', 25);
                    }
                },{
                    id: 'gain_gold3',
                    probability: 0.1,
                    description: 'You gain 50 gold. You uncover a coin of remarkable craftsmanship, its edges sharp and gleaming. You can’t help but wonder if it’s worth more than its weight in gold.',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameResources.addResource('coins', 50);
                    }
                }]
            },
            option2: {
                id: 'option2',
                name: 'Ignore it',
                unlockCondition: () => true,
                effects: []
            },
            option3: {
                id: 'option3',
                name: 'Inspect further',
                unlockCondition: () => true,
                effects: [{
                    id: 'lose_gold',
                    probability: 0.5,
                    description: 'A hidden snare tightens around your leg! You lose some gold in your scramble to escape.',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameResources.addResource('coins', -0.5*gameResources.getResource('coins').amount)
                    }
                },{
                    id: 'gain_experience',
                    probability: 0.5,
                    description: 'With careful hands, you uncover a trap and disarm it. Your cleverness earns you some experience points.',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameResources.addResource('mage-xp', 0.02*gameResources.getResource('mage-xp').cap + 10)
                    }
                }]
            }
        }
    });

    randomEventsDB.push({
        id: 'early_event2',
        name: 'Energy Surge',
        description: 'A vibrant energy hums in the clearing before you, as though the earth itself were breathing. The air shimmers with a faint glow, and the pull of its power is undeniable. How will you respond?',
        unlockCondition: () => true,
        probability: 1,
        options: {
            option1: {
                id: 'option1',
                name: 'Embrace it',
                unlockCondition: () => true,
                effects: [{
                    id: 'gain_energy',
                    probability: 0.7,
                    description: 'You draw the energy into yourself, feeling strength course through your veins. (+75% energy refill)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameResources.addResource('energy', 0.75*gameResources.getResource('energy').cap)
                    }
                },{
                    id: 'lose_energy',
                    probability: 0.3,
                    description: 'The surge overwhelms you! Energy leaks from your body, leaving you weaker. (Lost all your energy)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameResources.setResource('energy', 0)
                    }
                }]
            },
            option2: {
                id: 'option2',
                name: 'Resist it',
                unlockCondition: () => true,
                effects: []
            },
            option3: {
                id: 'option3',
                name: 'Channel it',
                unlockCondition: () => true,
                effects: [{
                    id: 'energy_regeneration_bonus',
                    probability: 1,
                    description: 'You focus the energy carefully, unlocking a steady flow of vitality. (+Energy regeneration for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        // register entity with effect
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_energy_buff')
                    }
                }]
            }
        }
    });

    randomEventsDB.push({
        id: 'early_event3',
        name: 'Golden Opportunity',
        description: 'At the edge of the bustling square, a merchant draped in colorful silks waves you over. His voice is silky and persuasive as he offers a deal that seems too good to be true.',
        unlockCondition: () => true,
        probability: 1,
        options: {
            option1: {
                id: 'option1',
                name: 'Take the deal',
                unlockCondition: () => true,
                effects: [{
                    id: 'bonus_gold',
                    probability: 0.8,
                    description: 'The deal pays off handsomely! Your gold income increases for the next 5 minutes.',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        // console.log('Gold income bonus activated.')
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_coins_bonus')
                    }
                },{
                    id: 'lose_gold',
                    probability: 0.2,
                    description: 'The merchant smirks and disappears into the crowd. You lose some of your coins.',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameResources.addResource('coins', -0.5*gameResources.getResource('coins').amount)
                    }
                }]
            },
            option2: {
                id: 'option2',
                name: 'Refuse',
                unlockCondition: () => true,
                effects: []
            }
        }
    });

    randomEventsDB.push({
        id: 'early_event4',
        name: 'Fatigue',
        description: 'The day wears on, and every step feels heavier than the last. The ground looks soft and inviting, while a nearby tree offers shade and calm. What will you do?',
        unlockCondition: () => true,
        probability: 1,
        options: {
            option1: {
                id: 'option1',
                name: 'Rest',
                unlockCondition: () => true,
                effects: [{
                    id: 'energy_regeneration_bonus',
                    probability: 1,
                    description: 'You lie down and let sleep take you. You wake up refreshed, energy restored. (+Energy regeneration bonus)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_energized')
                    }
                }]
            },
            option2: {
                id: 'option2',
                name: 'Meditate',
                unlockCondition: () => true,
                effects: [{
                    id: 'gain_experience',
                    probability: 1,
                    description: 'You focus your mind and reflect on the journey. (Gained some experience)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        // console.log('You gained 20 experience.')
                        gameResources.addResource('mage-xp', 20 + 0.01*gameResources.getResource('mage-xp').cap)
                    }
                },{
                    id: 'lose_energy',
                    probability: 1,
                    description: 'Meditation proves taxing, and you feel your energy drain away.',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        // console.log('You lost energy.')
                        gameResources.setResource('energy', 0.1)
                    }
                }]
            }
        }
    });

    randomEventsDB.push({
        id: 'early_event5',
        name: 'Hidden Talent',
        description: 'As you work, your hands move with unexpected precision, and ideas flow easily. Could this be a hidden talent emerging, or just a fleeting moment of clarity?',
        unlockCondition: () => true,
        probability: 1,
        options: {
            option1: {
                id: 'option1',
                name: 'Nurture it',
                unlockCondition: () => true,
                effects: [{
                    id: 'learning_speed_bonus',
                    probability: 1,
                    description: 'You hone your new skill, gaining a temporary boost to your learning speed. (+Learning speed for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        // console.log('Learning speed bonus activated.')
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_learn_rate')
                    }
                }]
            },
            option2: {
                id: 'option2',
                name: 'Ignore it',
                unlockCondition: () => true,
                effects: []
            }
        }
    });

    randomEventsDB.push({
        id: 'early_event6',
        name: 'Ancient Shrine',
        description: 'You come across an ancient shrine, covered in moss and glowing faintly. A voice whispers in your mind, asking for a sacrifice to unlock hidden potential. What will you do?',
        unlockCondition: () => true,
        probability: 1,
        options: {
            option1: {
                id: 'option1',
                name: 'Offer Gold',
                unlockCondition: () => true,
                usageGain: {
                    get_consumption: () => ({
                        resources: {
                            coins: {
                                A: 0,
                                B: 0.2*gameResources.getResource('coins').cap,
                                type: 0,
                            }
                        }
                    })
                },
                effects: [{
                    id: 'gain_strength',
                    probability: 0.6,
                    description: 'The shrine accepts your offering, and you feel yourself much stronger (Temporary energy regeneration bonus)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        // set permanent attribute modifier
                        // gameResources.addResource('strength', 1);
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_energized')
                        gameResources.addResource('coins', -0.2*gameResources.getResource('coins').cap);
                    }
                }, {
                    id: 'fail_offering',
                    probability: 0.4,
                    description: 'The shrine remains silent, and your gold disappears into the void.',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameResources.addResource('coins', -0.2*gameResources.getResource('coins').cap);
                    }
                }]
            },
            option2: {
                id: 'option2',
                name: 'Ignore the Shrine',
                unlockCondition: () => true,
                effects: []
            }
        }
    });

    randomEventsDB.push({
        id: 'early_event7',
        name: 'Cursed Mirror',
        description: 'A beautifully ornate mirror lies shattered on the ground. A strange aura surrounds it. You sense a powerful presence that could grant you untold power... at a cost.',
        unlockCondition: () => true,
        probability: 1,
        options: {
            option1: {
                id: 'option1',
                name: 'Touch the Mirror',
                unlockCondition: () => true,
                usageGain: {
                    get_consumption: () => ({
                        resources: {
                            energy: {
                                A: 0,
                                B: 0.3 * gameResources.getResource('energy').cap,
                                type: 0,
                            }
                        }
                    })
                },
                effects: [{
                    id: 'temporary_health_regen',
                    probability: 0.7,
                    description: 'The mirror binds to your soul, temporarily enhancing your health regeneration. (+Health regeneration for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_health_regen', 2);
                        gameResources.addResource('energy', -0.3 * gameResources.getResource('energy').cap);
                    }
                }, {
                    id: 'mirror_shatters',
                    probability: 0.3,
                    description: 'The mirror shatters violently, draining your energy completely.',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameResources.setResource('energy', 0);
                    }
                }]
            },
            option2: {
                id: 'option2',
                name: 'Walk Away',
                unlockCondition: () => true,
                effects: []
            }
        }
    });

    randomEventsDB.push({
        id: 'early_event8',
        name: 'The Wandering Monk',
        description: 'A wandering monk approaches, offering to teach you a secret technique in exchange for some of your wealth. Do you accept?',
        unlockCondition: () => true,
        probability: 1,
        options: {
            option1: {
                id: 'option1',
                name: 'Pay the Monk',
                usageGain: {
                    get_consumption: () => ({
                        resources: {
                            coins: {
                                A: 0,
                                B: 100,
                                type: 0,
                            }
                        }
                    })
                },
                unlockCondition: () => true,
                effects: [{
                    id: 'permanent_learning_bonus',
                    probability: 0.5,
                    description: 'The monk shares his wisdom, and you feel your mind expand. Your learning rate temporarily increased',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_learn_rate', 4)
                        gameResources.addResource('coins', -100);
                    }
                }, {
                    id: 'fraudulent_monk',
                    probability: 0.5,
                    description: 'The monk disappears after taking your gold. You gain nothing.',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameResources.addResource('coins', -100);
                    }
                }]
            },
            option2: {
                id: 'option2',
                name: 'Refuse the Offer',
                unlockCondition: () => true,
                effects: []
            }
        }
    });

    randomEventsDB.push({
        id: 'early_event9',
        name: 'Trial of the Flame',
        description: 'A ring of fire encircles you, and a booming voice challenges you to endure its heat to prove your worth.',
        unlockCondition: () => {
            return gameEntity.getLevel('action_pushup') > 1
        },
        probability: 1,
        options: {
            option1: {
                id: 'option1',
                name: 'Endure the Flames',
                unlockCondition: () => true,
                usageGain: {
                    get_consumption: () => ({
                        resources: {
                            health: {
                                A: 0,
                                B: 0.5 * gameResources.getResource('health').cap,
                                type: 0,
                            }
                        }
                    })
                },
                effects: [{
                    id: 'temporary_physical_training_rate',
                    probability: 0.5,
                    description: 'You endure the pain, enhancing your focus for physical training. (+Physical training speed for 10 minutes, -50% HP)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_physical_training_rate', 2);
                        gameResources.addResource('health', -0.5 * gameResources.getResource('health').cap);
                    }
                }, {
                    id: 'temporary_health_debuff',
                    probability: 0.5,
                    description: 'The heat is too much, sapping your vitality. (-Health regeneration for 10 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_health_debuff', 1.5);
                        gameResources.addResource('health', -0.5 * gameResources.getResource('health').cap);
                    }
                }]
            },
            option2: {
                id: 'option2',
                name: 'Retreat from the Challenge',
                unlockCondition: () => true,
                effects: []
            }
        }
    });


    randomEventsDB.push({
        id: 'early_event10',
        name: 'Healing Springs',
        description: 'You discover a bubbling spring with sparkling, crystal-clear water. A sign nearby reads: "Drink and be rejuvenated, but beware the cost."',
        unlockCondition: () => gameEntity.getLevel('action_pushup') > 1,
        probability: 1,
        options: {
            option1: {
                id: 'option1',
                name: 'Drink the Water',
                unlockCondition: () => true,
                effects: [{
                    id: 'temporary_health_regeneration',
                    probability: 0.8,
                    description: 'The water fills you with vitality. (+Health regeneration for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_health_regen');
                    }
                }, {
                    id: 'negative_effect',
                    probability: 0.2,
                    description: 'The water was tainted, and you feel drained. (-50% energy)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameResources.addResource('energy', -0.5 * gameResources.getResource('energy').cap);
                    }
                }]
            },
            option2: {
                id: 'option2',
                name: 'Avoid the Spring',
                unlockCondition: () => true,
                effects: []
            }
        }
    });

    randomEventsDB.push({
        id: 'early_event11',
        name: 'Training Grounds',
        description: 'An old warrior invites you to train with him, promising valuable insights into strength-building techniques.',
        unlockCondition: () => gameEntity.getLevel('action_pushup') > 1,
        probability: 1,
        options: {
            option1: {
                id: 'option1',
                name: 'Accept the Training',
                unlockCondition: () => true,
                effects: [{
                    id: 'temporary_strength_training_bonus',
                    probability: 0.7,
                    description: 'The warrior’s advice sharpens your focus. (+Strength training speed for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_physical_training_rate');
                    }
                }, {
                    id: 'injury',
                    probability: 0.3,
                    description: 'You overexert yourself and suffer a minor injury. (-10% HP, you are injured)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameResources.addResource('health', -0.1 * gameResources.getResource('health').cap);
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_health_debuff');
                    }
                }]
            },
            option2: {
                id: 'option2',
                name: 'Decline the Offer',
                unlockCondition: () => true,
                effects: []
            }
        }
    });

    randomEventsDB.push({
        id: 'early_event12',
        name: 'Blessing of Endurance',
        description: 'A wandering priest offers to bestow a blessing upon you, enhancing your ability to recover from wounds.',
        unlockCondition: () => gameEntity.getLevel('action_pushup') > 1,
        probability: 1,
        options: {
            option1: {
                id: 'option1',
                name: 'Receive the Blessing',
                unlockCondition: () => true,
                usageGain: {
                    get_consumption: () => ({
                        resources: {
                            energy: {
                                A: 0,
                                B: 0.2 * gameResources.getResource('energy').cap,
                                type: 0,
                            }
                        }
                    })
                },
                effects: [{
                    id: 'temporary_health_regen',
                    probability: 0.6,
                    description: 'The priest’s blessing temporarily enhances your health regeneration. (+Health regeneration for 10 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_health_regen', 2);
                        gameResources.addResource('energy', -0.2 * gameResources.getResource('energy').cap);
                    }
                }, {
                    id: 'temporary_energy_regen',
                    probability: 0.3,
                    description: 'You feel revitalized, boosting your energy regeneration temporarily. (+Energy regeneration for 10 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_energized', 1.5);
                        gameResources.addResource('energy', -0.2 * gameResources.getResource('energy').cap);
                    }
                }, {
                    id: 'blessing_fail',
                    probability: 0.1,
                    description: 'The blessing backfires, leaving you slightly weakened. (-10% HP)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameResources.addResource('health', -0.1 * gameResources.getResource('health').cap);
                        gameResources.addResource('energy', -0.2 * gameResources.getResource('energy').cap);
                    }
                }]
            },
            option2: {
                id: 'option2',
                name: 'Politely Refuse',
                unlockCondition: () => true,
                effects: []
            }
        }
    });

    randomEventsDB.push({
        id: 'early_event13',
        name: 'Forgotten Altar',
        description: 'Hidden among the trees, you find an ancient altar, etched with mysterious runes. A faint glow suggests untold power, but a voice in your mind warns of potential danger.',
        unlockCondition: () => gameEntity.getLevel('action_pushup') > 1,
        probability: 1,
        options: {
            option1: {
                id: 'option1',
                name: 'Offer a Prayer',
                usageGain: {
                    get_consumption: () => ({
                        resources: {
                            energy: {
                                A: 0,
                                B: 0.15 * gameResources.getResource('energy').cap,
                                type: 0,
                            }
                        }
                    })
                },
                unlockCondition: () => true,
                effects: [{
                    id: 'temporary_mental_training_rate',
                    probability: 0.5,
                    description: 'Your prayer is answered, enhancing your mental clarity. (+Mental training speed for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_mental_training_rate', 2);
                        gameResources.addResource('energy', -0.15 * gameResources.getResource('energy').cap);
                    }
                }, {
                    id: 'minor_blessing',
                    probability: 0.2,
                    description: 'The altar grants a small boon, increasing your health regeneration temporarily. (+Health regen for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_health_regen');
                        gameResources.addResource('energy', -0.15 * gameResources.getResource('energy').cap);
                    }
                }, {
                    id: 'negative_effect',
                    probability: 0.3,
                    description: 'The altar rejects your prayer, sapping your energy. (-20% energy)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameResources.addResource('energy', -0.2 * gameResources.getResource('energy').cap);
                    }
                }]
            },
            option2: {
                id: 'option2',
                name: 'Offer Gold',
                unlockCondition: () => true,
                usageGain: {
                    get_consumption: () => ({
                        resources: {
                            coins: {
                                A: 0,
                                B: Math.max(50, 0.02*gameResources.getResource('coins').cap),
                                type: 0,
                            }
                        }
                    })
                },
                effects: [{
                    id: 'health_bonus',
                    probability: 0.5,
                    description: 'The altar accepts your offering, bestowing vitality upon you. (+Health regeneration for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_health_regen');
                        gameResources.addResource('coins', -Math.max(50, 0.02*gameResources.getResource('coins').cap));
                    }
                }, {
                    id: 'altar_silence',
                    probability: 0.5,
                    description: 'The altar remains silent, and your gold vanishes.',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameResources.addResource('coins', -Math.max(50, 0.02*gameResources.getResource('coins').cap));
                    }
                }]
            },
            option3: {
                id: 'option3',
                name: 'Leave the Altar',
                unlockCondition: () => true,
                effects: []
            }
        }
    });

    randomEventsDB.push({
        id: 'early_event14',
        name: 'Challenger\'s Duel',
        description: 'A traveling warrior challenges you to a duel, promising great rewards for your courage.',
        unlockCondition: () => gameEntity.getLevel('action_pushup') > 1,
        probability: 1,
        options: {
            option1: {
                id: 'option1',
                name: 'Accept the Duel',
                unlockCondition: () => true,
                usageGain: {
                    get_consumption: () => ({
                        resources: {
                            health: {
                                A: 0,
                                B: 0.2 * gameResources.getResource('health').cap,
                                type: 0,
                            }
                        }
                    })
                },
                effects: [{
                    id: 'temporary_physical_training_rate',
                    probability: 0.4,
                    description: 'You fight valiantly and gain a temporary boost to your physical training speed. (+Physical training speed for 10 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_physical_training_rate', 2);
                        gameResources.addResource('health', -0.2 * gameResources.getResource('health').cap);
                    }
                }, {
                    id: 'minor_injury',
                    probability: 0.3,
                    description: 'You lose the duel but gain valuable experience. (-10% HP, +Temporary strength training bonus, +Injury)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameResources.addResource('health', -0.1 * gameResources.getResource('health').cap);
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_physical_training_rate');
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_health_debuff');
                    }
                }, {
                    id: 'severe_injury',
                    probability: 0.3,
                    description: 'You are defeated and badly injured. (-20% HP, +Injury)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameResources.addResource('health', -0.2 * gameResources.getResource('health').cap);
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_health_debuff', 2);
                    }
                }]
            },
            option2: {
                id: 'option2',
                name: 'Decline the Challenge',
                unlockCondition: () => true,
                effects: []
            }
        }
    });


    randomEventsDB.push({
        id: 'early_event15',
        name: 'Charismatic Merchant',
        description: 'A traveling merchant with a silver tongue offers you a deal. He claims his goods will make you more persuasive, for a price.',
        unlockCondition: () => true,
        probability: 1,
        options: {
            option1: {
                id: 'option1',
                name: 'Buy the Goods',
                unlockCondition: () => true,
                usageGain: {
                    get_consumption: () => ({
                        resources: {
                            coins: {
                                A: 0,
                                B: 0.1 * gameResources.getResource('coins').cap,
                                type: 0,
                            }
                        }
                    })
                },
                effects: [{
                    id: 'temporary_coin_income_boost',
                    probability: 0.5,
                    description: 'The merchant’s goods enhance your trade skills temporarily. (+Coin income for 10 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_coins_bonus', 2);
                        gameResources.addResource('coins', -0.1 * gameResources.getResource('coins').cap);
                    }
                }, {
                    id: 'worthless_purchase',
                    probability: 0.5,
                    description: 'The goods turn out to be useless trinkets. You feel cheated. (-10% of your coins)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameResources.addResource('coins', -0.1 * gameResources.getResource('coins').cap);
                    }
                }]
            },
            option2: {
                id: 'option2',
                name: 'Walk Away',
                unlockCondition: () => true,
                effects: []
            }
        }
    });

    randomEventsDB.push({
        id: 'early_event16',
        name: 'Charmed Audience',
        description: 'You find yourself speaking before a small crowd. They hang on your every word, and you feel their admiration growing.',
        unlockCondition: () => true,
        probability: 1,
        options: {
            id: 'option1',
            name: 'Inspire the Crowd',
            usageGain: {
                get_consumption: () => ({
                    resources: {
                        energy: {
                            A: 0,
                            B: 0.1 * gameResources.getResource('energy').cap,
                            type: 0,
                        }
                    }
                })
            },
            unlockCondition: () => true,
            effects: [{
                id: 'temporary_coins_bonus',
                probability: 0.2,
                description: 'Your words resonate deeply, inspiring the crowd to be generous. (+Coin income for 10 minutes)',
                unlockCondition: () => true,
                onTrigger: () => {
                    gameCore.getModule('temporary-effects').triggerEffect('temporary_coins_bonus', 1.5);
                    gameResources.addResource('energy', -0.1 * gameResources.getResource('energy').cap);
                }
            }, {
                id: 'exhaustion',
                probability: 0.8,
                description: 'Speaking passionately takes its toll on you, leaving you drained. (-100% Energy)',
                unlockCondition: () => true,
                onTrigger: () => {
                    gameResources.setResource('energy', 0);
                }
            }]
        },
        option2: {
            id: 'option2',
            name: 'Remain Silent',
            unlockCondition: () => true,
            effects: []
        }

    });

    randomEventsDB.push({
        id: 'early_event17',
        name: 'Street Performers',
        description: 'You stumble upon a lively square where street performers are enchanting the crowd with their music. Their melodies resonate through the air, drawing you closer.',
        unlockCondition: () => true,
        probability: 1,
        options: {
            option1: {
                id: 'option1',
                name: 'Donate to the Performers',
                unlockCondition: () => true,
                usageGain: {
                    get_consumption: () => ({
                        resources: {
                            coins: {
                                A: 0,
                                B: 125,
                                type: 0,
                            }
                        }
                    })
                },
                effects: [{
                    id: 'gold_bonus',
                    probability: 0.3,
                    description: 'The performers thank you, and their music attracts a wealthier crowd. (Increased gold income for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_coins_bonus');
                        gameResources.addResource('coins', -125);
                    }
                }, {
                    id: 'nothing_happens',
                    probability: 0.7,
                    description: 'The performers thank you warmly, but nothing else happens.',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameResources.addResource('coins', -125);
                    }
                }]
            },
            option2: {
                id: 'option2',
                name: 'Ask to Sing with Them',
                unlockCondition: () => true,
                effects: [{
                    id: 'temporary_coins_bonus',
                    probability: 0.05,
                    description: 'The crowd loves your performance, boosting their generosity. (+Coin income for 10 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_coins_bonus', 1.5);
                    }
                }, {
                    id: 'voice_strain',
                    probability: 0.65,
                    description: 'You strain your voice trying to match their skills. (-20% Energy, energy debuff)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameResources.addResource('energy', -0.2 * gameResources.getResource('energy').cap);
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_energy_debuff', 1);
                    }
                }, {
                    id: 'refusal',
                    probability: 0.3,
                    description: 'The performers politely refuse your request.',
                    unlockCondition: () => true,
                    onTrigger: () => {}
                }]
            },
            option3: {
                id: 'option3',
                name: 'Sing Without Asking',
                unlockCondition: () => true,
                effects: [{
                    id: 'temporary_coins_bonus',
                    probability: 0.3,
                    description: 'The crowd surprisingly throws coins at you in appreciation! (+Coins gain for 10 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_coins_bonus', 1.5);
                    }
                }, {
                    id: 'temporary_energy_debuff',
                    probability: 0.2,
                    description: 'Your rude interruption drains the crowd’s mood and your energy. (-Energy regeneration for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_energy_debuff', 1.2);
                    }
                }, {
                    id: 'injury',
                    probability: 0.5,
                    description: 'A scuffle breaks out over your antics, and you get hurt. (-10% HP)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameResources.addResource('health', -0.1 * gameResources.getResource('health').cap);
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_health_debuff', 2);
                    }
                }]
            },
            option4: {
                id: 'option4',
                name: 'Walk Away',
                unlockCondition: () => true,
                effects: []
            }
        }
    });

    randomEventsDB.push({
        id: 'early_event18',
        name: 'The Fortune Teller',
        description: 'A mysterious fortune teller beckons you over, promising insights into your future for a price.',
        unlockCondition: () => true,
        probability: 1,
        options: {
            option1: {
                id: 'option1',
                name: 'Pay for a Reading',
                unlockCondition: () => true,
                usageGain: {
                    get_consumption: () => ({
                        resources: {
                            coins: {
                                A: 0,
                                B: 0.1 * gameResources.getResource('coins').cap,
                                type: 0,
                            }
                        }
                    })
                },
                effects: [{
                    id: 'temporary_coins_bonus',
                    probability: 0.4,
                    description: 'The fortune teller’s words inspire confidence, increasing your coin income temporarily. (+Coin income for 10 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_coins_bonus', 1.5);
                        gameResources.addResource('coins', -0.1 * gameResources.getResource('coins').cap);
                    }
                }, {
                    id: 'vague_predictions',
                    probability: 0.5,
                    description: 'Her predictions are vague and unhelpful.',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameResources.addResource('coins', -0.1 * gameResources.getResource('coins').cap);
                    }
                }, {
                    id: 'bad_omen',
                    probability: 0.1,
                    description: 'She warns of a dark future, and you feel unnerved. (-10% Energy, temporary energy debuff)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameResources.addResource('energy', -0.1 * gameResources.getResource('energy').cap);
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_energy_debuff', 2);
                    }
                }]
            },

            option2: {
                id: 'option2',
                name: 'Decline the Offer',
                unlockCondition: () => true,
                effects: []
            }
        }
    });

    randomEventsDB.push({
        id: 'early_event19',
        name: 'The Lost Artifact',
        description: 'While exploring an abandoned temple, you find a glowing artifact on a pedestal. Its power is undeniable, but a strange aura surrounds it.',
        unlockCondition: () => true,
        probability: 1,
        options: {
            option1: {
                id: 'option1',
                name: 'Take the Artifact',
                unlockCondition: () => true,
                usageGain: {
                    get_consumption: () => ({
                        resources: {
                            health: {
                                A: 0,
                                B: 0.2 * gameResources.getResource('health').cap,
                                type: 0,
                            }
                        }
                })
            },
                effects: [{
                    id: 'temporary_physical_training_rate',
                    probability: 0.3,
                    description: 'The artifact bonds with you, enhancing your physical abilities temporarily. (+Physical training speed for 10 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_physical_training_rate', 2);
                        gameResources.addResource('health', -0.2 * gameResources.getResource('health').cap);
                    }
                }, {
                    id: 'artifact_curse',
                    probability: 0.3,
                    description: 'A curse emanates from the artifact, draining your health. (-Health regeneration for 10 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_health_debuff', 2);
                        gameResources.addResource('health', -0.2 * gameResources.getResource('health').cap);
                    }
                }, {
                    id: 'artifact_nothing',
                    probability: 0.4,
                    description: 'The artifact vanishes as soon as you touch it. Nothing happens.',
                    unlockCondition: () => true,
                    onTrigger: () => {}
                }]
            },
            option2: {
                id: 'option2',
                name: 'Leave it Alone',
                unlockCondition: () => true,
                effects: []
            },
            option3: {
                id: 'option3',
                name: 'Attempt to Destroy it',
                unlockCondition: () => true,
                effects: [{
                    id: 'artifact_destroyed',
                    probability: 0.5,
                    description: 'You destroy the artifact, and a wave of energy heals you. (+20% HP)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameResources.addResource('health', 0.2 * gameResources.getResource('health').cap);
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_health_regen', 2);
                    }
                }, {
                    id: 'artifact_backlash',
                    probability: 0.5,
                    description: 'The artifact explodes, injuring you. (-15% HP)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameResources.addResource('health', -0.15 * gameResources.getResource('health').cap);
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_energy_debuff', 1);
                    }
                }]
            }
        }
    });

    randomEventsDB.push({
        id: 'early_event20',
        name: 'A Mysterious Stranger',
        description: 'A cloaked figure approaches you in the dark, offering a strange vial. "Drink this," they say. "It will change your life."',
        unlockCondition: () => true,
        probability: 1,
        options: {
            option1: {
                id: 'option1',
                name: 'Drink the Vial',
                unlockCondition: () => true,
                effects: [{
                    id: 'temporary_energy_boost',
                    probability: 0.05,
                    description: 'You feel a surge of vitality as the liquid courses through you. (+Energy regeneration for 10 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_energy_boost', 1.5);
                    }
                }, {
                    id: 'health_loss',
                    probability: 0.4,
                    description: 'You feel sick as the liquid burns your insides. (-20% HP)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameResources.addResource('health', -0.2 * gameResources.getResource('health').cap);
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_energy_debuff', 1);
                    }
                }, {
                    id: 'vial_nothing',
                    probability: 0.55,
                    description: 'The liquid seems to do nothing at all.',
                    unlockCondition: () => true,
                    onTrigger: () => {}
                }]
            },
            option2: {
                id: 'option2',
                name: 'Refuse the Offer',
                unlockCondition: () => true,
                effects: []
            },
            option3: {
                id: 'option3',
                name: 'Take the Vial but Don’t Drink It',
                unlockCondition: () => true,
                effects: [{
                    id: 'vial_analysis',
                    probability: 0.5,
                    description: 'You keep the vial for later analysis. Nothing happens for now.',
                    unlockCondition: () => true,
                    onTrigger: () => {}
                },{
                    id: 'vial_analysis_success',
                    probability: 0.5,
                    description: 'You analyzed vial. You barely understand what its made of, but investigating it gave you inspiration to learn. You got bonus to learning bonus',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_learn_rate')
                    }
                }]
            }
        }
    });

    randomEventsDB.push({
        id: 'early_event21',
        name: 'Ancient Tome',
        description: 'In the library, you discover an ancient tome glowing faintly on a dusty shelf. Its title is indecipherable, but you feel drawn to it.',
        unlockCondition: () => gameEntity.getLevel('shop_item_library_entrance') > 0,
        probability: 1,
        options: {
            option1: {
                id: 'option1',
                name: 'Read the Tome',
                unlockCondition: () => true,
                usageGain: {
                    get_consumption: () => ({
                        resources: {
                            knowledge: {
                                A: 0,
                                B: 0.1 * gameResources.getResource('knowledge').cap,
                                type: 0
                            }
                        }
                    })
                },
                effects: [{
                    id: 'temporary_knowledge_gain',
                    probability: 0.6,
                    description: 'The tome is full of arcane knowledge, enhancing your understanding. (+Knowledge gain for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_knowledge_gain', 2);
                        gameResources.addResource('knowledge', -0.1 * gameResources.getResource('knowledge').cap);
                    }
                }, {
                    id: 'temporary_knowledge_debuff',
                    probability: 0.3,
                    description: 'The text is confusing and gives you a headache. (-Knowledge gain for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_knowledge_debuff', 1.5);
                        gameResources.addResource('knowledge', -0.1 * gameResources.getResource('knowledge').cap);
                    }
                }, {
                    id: 'temporary_knowledge_gain',
                    probability: 0.1,
                    description: 'You decipher a hidden message, gaining a significant temporary boost to knowledge. (+Extra Knowledge gain for 10 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_knowledge_gain', 3);
                        gameResources.addResource('knowledge', -0.1 * gameResources.getResource('knowledge').cap);
                    }
                }]
            },
            option2: {
                id: 'option2',
                name: 'Put It Back',
                unlockCondition: () => true,
                effects: []
            }
        }
    });

    randomEventsDB.push({
        id: 'early_event22',
        name: 'Mysterious Scroll',
        description: 'While browsing the library, a rolled-up scroll falls from a high shelf and lands at your feet. Its seal is broken.',
        unlockCondition: () => gameEntity.getLevel('shop_item_library_entrance') > 0,
        probability: 1,
        options: {
            option1: {
                id: 'option1',
                name: 'Read the Scroll',
                unlockCondition: () => true,
                effects: [{
                    id: 'temporary_knowledge_gain',
                    probability: 0.7,
                    description: 'The scroll contains insights that briefly enhance your studies. (+Knowledge gain for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_knowledge_gain', 1.5);
                    }
                }, {
                    id: 'temporary_knowledge_debuff',
                    probability: 0.2,
                    description: 'The scroll is riddled with errors, confusing your thoughts. (-Knowledge gain for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_knowledge_debuff', 1.2);
                    }
                }, {
                    id: 'temporary_mental_training_rate',
                    probability: 0.1,
                    description: 'The scroll teaches you a mnemonic trick, temporarily enhancing your mental training. (+Mental training speed for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_mental_training_rate', 3);
                    }
                }]
            },
            option2: {
                id: 'option2',
                name: 'Leave It Alone',
                unlockCondition: () => true,
                effects: []
            }
        }
    });

    randomEventsDB.push({
        id: 'early_event23',
        name: 'Library Apparition',
        description: 'As you explore the darker corners of the library, a faint apparition appears, pointing to a hidden alcove.',
        unlockCondition: () => gameEntity.getLevel('shop_item_library_entrance') > 0,
        probability: 1,
        options: {
            option1: {
                id: 'option1',
                name: 'Follow the Apparition',
                unlockCondition: () => true,
                usageGain: {
                    get_consumption: () => ({
                        resources: {
                            knowledge: {
                                A: 0,
                                B: 0.1 * gameResources.getResource('knowledge').cap,
                                type: 0,
                            }
                        }
                    })
                },
                effects: [{
                    id: 'temporary_knowledge_gain',
                    probability: 0.5,
                    description: 'The apparition leads you to a forgotten cache of knowledge. (+Knowledge gain for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_knowledge_gain', 1.5);
                        gameResources.addResource('knowledge', -0.1 * gameResources.getResource('knowledge').cap);
                    }
                }, {
                    id: 'temporary_knowledge_debuff',
                    probability: 0.3,
                    description: 'The apparition misleads you, wasting your time. (-Knowledge gain for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_knowledge_debuff', 1.2);
                        gameResources.addResource('knowledge', -0.1 * gameResources.getResource('knowledge').cap);
                    }
                }, {
                    id: 'temporary_mental_training_rate',
                    probability: 0.2,
                    description: 'The apparition shares a secret technique, enhancing your mental training temporarily. (+Mental training speed for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_mental_training_rate', 2);
                        gameResources.addResource('knowledge', -0.1 * gameResources.getResource('knowledge').cap);
                    }
                }]
            },
            option2: {
                id: 'option2',
                name: 'Ignore It',
                unlockCondition: () => true,
                effects: []
            }
        }
    });


    randomEventsDB.push({
        id: 'early_event24',
        name: 'Speed Reading Bet',
        description: 'A fellow library patron challenges you to a speed reading contest. Will you accept the challenge?',
        unlockCondition: () => gameEntity.getLevel('shop_item_library_entrance') > 0,
        probability: 1,
        options: {
            option1: {
                id: 'option1',
                name: 'Accept and Give Your Best',
                usageGain: {
                    get_consumption: () => ({
                        resources: {
                            energy: {
                                A: 0,
                                B: 0.1 * gameResources.getResource('energy').cap,
                                type: 0,
                            }
                        }
                    })
                },
                unlockCondition: () => true,
                effects: [{
                    id: 'temporary_energy_boost',
                    probability: 0.3,
                    description: 'Winning the bet fills you with inspiration and vigor! (+Energy gain for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_energy_boost', 1.5);
                    }
                }, {
                    id: 'temporary_coins_bonus',
                    probability: 0.3,
                    description: 'The crowd is impressed by your brilliance and donates generously! (+Coins gain for 10 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_coins_bonus', 1.2);
                    }
                }, {
                    id: 'temporary_knowledge_and_training_boost',
                    probability: 0.2,
                    description: 'Your cleverness in winning the bet sharpens your mind. (+Knowledge gain and mental training speed for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_knowledge_gain', 1.4);
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_mental_training_rate', 1.4);
                    }
                }, {
                    id: 'temporary_knowledge_debuff',
                    probability: 0.2,
                    description: 'Overexerting yourself leaves you mentally drained. (-Knowledge gain for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_knowledge_debuff');
                    }
                }]
            },
            option2: {
                id: 'option2',
                name: 'Accept Out of Curiosity',
                unlockCondition: () => true,
                effects: [{
                    id: 'temporary_energy_regeneration_debuff',
                    probability: 0.5,
                    description: 'The stress of the bet hampers your energy recovery. (-Energy regeneration for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_energy_debuff');
                    }
                }, {
                    id: 'temporary_knowledge_gain',
                    probability: 0.5,
                    description: 'You enjoy the challenge and learn a lot! (+Knowledge gain for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_knowledge_gain', 2);
                    }
                }]
            },
            option3: {
                id: 'option3',
                name: 'Refuse the Bet',
                unlockCondition: () => true,
                effects: []
            }
        }
    });

    randomEventsDB.push({
        id: 'early_event25',
        name: 'Cryptic Riddle',
        description: 'A strange librarian approaches you with a cryptic riddle, promising a reward if you solve it.',
        unlockCondition: () => gameEntity.getLevel('shop_item_library_entrance') > 0,
        probability: 1,
        options: {
            option1: {
                id: 'option1',
                name: 'Attempt to Solve It',
                unlockCondition: () => true,
                usageGain: {
                    get_consumption: () => ({
                        resources: {
                            knowledge: {
                                A: 0,
                                B: 0.1 * gameResources.getResource('knowledge').cap,
                                type: 0,
                            }
                        }
                    })
                },
                effects: [{
                    id: 'temporary_knowledge_and_training_boost',
                    probability: 0.4,
                    description: 'The riddle sharpens your intellect and focus, boosting your knowledge gain and mental training speed. (+Knowledge gain, +Mental training speed for 10 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_knowledge_gain', 1.5);
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_mental_training_rate', 1.8);
                        gameResources.addResource('knowledge', -0.1 * gameResources.getResource('knowledge').cap);
                    }
                }, {
                    id: 'additional_mental_training_boost',
                    probability: 0.3,
                    description: 'You discover a profound insight that accelerates your mental growth. (+Mental training speed for 15 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_mental_training_rate', 2);
                        gameResources.addResource('knowledge', -0.1 * gameResources.getResource('knowledge').cap);
                    }
                }, {
                    id: 'gold_find',
                    probability: 0.3,
                    description: 'The librarian rewards you with a small pouch of coins.',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameResources.addResource('coins', 0.02 * gameResources.getResource('coins').cap);
                        gameResources.addResource('knowledge', -0.1 * gameResources.getResource('knowledge').cap);
                    }
                }]
            },
            option2: {
                id: 'option2',
                name: 'Ask for a Hint',
                unlockCondition: () => true,
                effects: [{
                    id: 'temporary_knowledge_gain',
                    probability: 0.5,
                    description: 'The hint broadens your understanding. (+Knowledge gain for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_knowledge_gain');
                    }
                }, {
                    id: 'temporary_knowledge_debuff',
                    probability: 0.5,
                    description: 'The hint confuses you further. (-Knowledge gain for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_knowledge_debuff');
                    }
                }]
            },
            option3: {
                id: 'option3',
                name: 'Politely Decline',
                unlockCondition: () => true,
                effects: []
            }
        }
    });

    randomEventsDB.push({
        id: 'early_event26',
        name: 'Unstable Experiment',
        description: 'You find an old experiment log in the library. It describes a dangerous but potentially rewarding experiment.',
        unlockCondition: () => gameEntity.getLevel('shop_item_library_entrance') > 0,
        probability: 1,
        options: {
            option1: {
                id: 'option1',
                name: 'Recreate the Experiment',
                usageGain: {
                    get_consumption: () => ({
                        resources: {
                            knowledge: {
                                A: 0,
                                B: 0.1 * gameResources.getResource('knowledge').cap,
                                type: 0,
                            }
                        }
                    })
                },
                unlockCondition: () => true,
                effects: [{
                    id: 'temporary_knowledge_and_training_boost',
                    probability: 0.4,
                    description: 'The experiment succeeds brilliantly, boosting your knowledge and mental training speed. (+Knowledge gain, +Mental training speed for 10 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_knowledge_gain', 1.5);
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_mental_training_rate', 1.8);
                        gameResources.addResource('knowledge', -0.1 * gameResources.getResource('knowledge').cap);
                    }
                }, {
                    id: 'temporary_energy_debuff',
                    probability: 0.3,
                    description: 'The experiment drains your energy significantly. (-Energy regeneration for 10 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_energy_debuff', 1.5);
                        gameResources.addResource('knowledge', -0.1 * gameResources.getResource('knowledge').cap);
                    }
                }, {
                    id: 'temporary_health_debuff',
                    probability: 0.3,
                    description: 'An unexpected mishap in the experiment causes minor injuries. (-Health regeneration for 10 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_health_debuff', 1.2);
                        gameResources.addResource('knowledge', -0.1 * gameResources.getResource('knowledge').cap);
                    }
                }]
            },
            option2: {
                id: 'option2',
                name: 'Study the Log Carefully',
                unlockCondition: () => true,
                effects: [{
                    id: 'temporary_knowledge_gain',
                    probability: 0.7,
                    description: 'You learn useful details from the log. (+Knowledge gain for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_knowledge_gain');
                    }
                }, {
                    id: 'temporary_health_debuff',
                    probability: 0.3,
                    description: 'The log contains dangerous warnings that unsettle you. (-10% HP)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameResources.addResource('health', -0.1 * gameResources.getResource('health').cap);
                    }
                }]
            },
            option3: {
                id: 'option3',
                name: 'Leave It Alone',
                unlockCondition: () => true,
                effects: []
            }
        }
    });

    randomEventsDB.push({
        id: 'magic_event1',
        name: 'The Overactive Spellbook',
        description: 'While flipping through your spellbook in a quiet corner of the tavern, a poorly contained spell activates, filling the room with a shimmering, unstable energy. The barkeep glares at you, and the other patrons grow uneasy.',
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_spellbook') > 0;
        },
        probability: 1,
        options: {
            option1: {
                id: 'option1',
                name: 'Try to Dispel the Energy',
                unlockCondition: () => true,
                effects: [{
                    id: 'temporary_mana_regen',
                    probability: 0.6,
                    description: 'Your efforts stabilize the energy, leaving you refreshed. (+Mana regeneration for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_mana_regen', 2);
                    }
                }, {
                    id: 'temporary_mana_debuff',
                    probability: 0.4,
                    description: 'You fail to contain the spell, and it drains your energy. (-Mana regeneration for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_mana_debuff');
                    }
                }]
            },
            option2: {
                id: 'option2',
                name: 'Cast a Counterspell',
                unlockCondition: () => true,
                effects: [{
                    id: 'temporary_mental_training_rate',
                    probability: 0.5,
                    description: 'The counterspell enhances your focus. (+Mental training speed for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_mental_training_rate');
                    }
                }, {
                    id: 'temporary_knowledge_debuff',
                    probability: 0.3,
                    description: 'The counterspell backfires slightly, muddling your thoughts. (-Knowledge gain for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_knowledge_debuff');
                    }
                }, {
                    id: 'temporary_health_debuff',
                    probability: 0.2,
                    description: 'The unstable energy shocks you, causing a minor injury. (-10% HP)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameResources.addResource('health', -0.1 * gameResources.getResource('health').cap);
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_health_debuff', 2);
                    }
                }]
            },
            option3: {
                id: 'option3',
                name: 'Apologize to the Tavern Patrons',
                unlockCondition: () => true,
                usageGain: {
                    get_consumption: () => ({
                        resources: {
                            energy: {
                                A: 0,
                                B: 0.1 * gameResources.getResource('energy').cap,
                                type: 0,
                            }
                        }
                    })
                },
                effects: [{
                    id: 'temporary_energy_regeneration_debuff',
                    probability: 0.4,
                    description: 'The effort of calming everyone drains your energy. (-Energy regeneration for 10 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_energy_debuff', 1.5);
                        gameResources.addResource('energy', -0.1 * gameResources.getResource('energy').cap);
                    }
                }, {
                    id: 'temporary_knowledge_gain',
                    probability: 0.3,
                    description: 'Your thoughtful apology impresses the crowd, and you feel wiser. (+Knowledge gain for 10 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_knowledge_gain', 1.5);
                        gameResources.addResource('energy', -0.1 * gameResources.getResource('energy').cap);
                    }
                }, {
                    id: 'gold_loss',
                    probability: 0.3,
                    description: 'The barkeep demands compensation for the disturbance. (-10% Coins)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameResources.addResource('coins', -0.1 * gameResources.getResource('coins').cap);
                        gameResources.addResource('energy', -0.1 * gameResources.getResource('energy').cap);
                    }
                }]
            },
            option4: {
                id: 'option4',
                name: 'Flee the Scene',
                unlockCondition: () => true,
                effects: [{
                    id: 'temporary_health_debuff',
                    probability: 0.5,
                    description: 'In your rush to escape, you trip and fall. (-10% HP)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameResources.addResource('health', -0.1 * gameResources.getResource('health').cap);
                    }
                }, {
                    id: 'gold_loss',
                    probability: 0.5,
                    description: 'In the chaos, someone picks your pocket. (-30 Coins)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameResources.addResource('coins', -30);
                    }
                }]
            }
        }
    });

    randomEventsDB.push({
        id: 'magic_event2',
        name: 'Spilled Ale and Sparks',
        description: 'A clumsy patron spills their ale on your spellbook, causing sparks to fly and minor chaos in the tavern. The barkeep looks furious, and the patron looks embarrassed.',
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_spellbook') > 0;
        },
        probability: 1,
        options: {
            option1: {
                id: 'option1',
                name: 'Use Magic to Dry the Book',
                unlockCondition: () => true,
                effects: [{
                    id: 'temporary_mana_regen',
                    probability: 0.6,
                    description: 'The spell works perfectly, restoring calm. (+Mana regeneration for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_mana_regen', 2);
                    }
                }, {
                    id: 'temporary_mana_debuff',
                    probability: 0.4,
                    description: 'The spell backfires, draining your energy further. (-Mana regeneration for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_mana_debuff', 1);
                    }
                }]
            },
            option2: {
                id: 'option2',
                name: 'Demand Compensation from the Patron',
                usageGain: {
                    get_consumption: () => ({
                        resources: {
                            health: {
                                A: 0,
                                B: 0.1 * gameResources.getResource('health').cap,
                                type: 0,
                            }
                        }
                    })
                },
                unlockCondition: () => true,
                effects: [{
                    id: 'gold_gain',
                    probability: 0.7,
                    description: 'The patron apologizes and offers you some gold.',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameResources.addResource('coins', 50 + 0.03 * gameResources.getResource('coins').cap);
                        gameResources.addResource('health', -0.1 * gameResources.getResource('health').cap);
                    }
                }, {
                    id: 'temporary_health_debuff',
                    probability: 0.3,
                    description: 'The patron refuses and the confrontation leaves you shaken. (-Health regeneration for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_health_debuff', 1.5);
                        gameResources.addResource('health', -0.1 * gameResources.getResource('health').cap);
                    }
                }]
            },
            option3: {
                id: 'option3',
                name: 'Let It Slide',
                unlockCondition: () => true,
                effects: [{
                    id: 'temporary_mental_training_rate',
                    probability: 1,
                    description: 'Your restraint impresses the crowd, enhancing your focus. (+Mental training speed for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_mental_training_rate', 2);
                    }
                }]
            }
        }
    });

    randomEventsDB.push({
        id: 'magic_event3',
        name: 'A Dispute Over a Spell',
        description: 'Two rival mages are arguing loudly in the market square over the correct incantation for a complex spell. The argument draws a crowd, and you are pulled into the fray.',
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_spellbook') > 0;
        },
        probability: 1,
        options: {
            option1: {
                id: 'option1',
                name: 'Mediate Between Them',
                unlockCondition: () => true,
                usageGain: {
                    get_consumption: () => ({
                        resources: {
                            energy: {
                                A: 0,
                                B: 0.1*gameResources.getResource('energy').cap,
                                type: 0,
                            }
                        }
                    })
                },
                effects: [{
                    id: 'temporary_coins_bonus',
                    probability: 0.4,
                    description: 'Your diplomatic skills impress the crowd, and they reward you. (+Coin income for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_coins_bonus', 1.5);
                        gameResources.addResource('energy', -10 * 0.1*gameResources.getResource('energy').cap);
                    }
                }, {
                    id: 'temporary_energy_regeneration_debuff',
                    probability: 0.6,
                    description: 'The effort drains you significantly. (-Energy regeneration for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_energy_debuff', 2);
                        gameResources.addResource('energy', -0.1*gameResources.getResource('energy').cap);
                    }
                }]
            },
            option2: {
                id: 'option2',
                name: 'Join the Argument',
                unlockCondition: () => true,
                effects: [{
                    id: 'temporary_knowledge_gain',
                    probability: 0.5,
                    description: 'The heated debate sharpens your understanding. (+Knowledge gain for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_knowledge_gain', 2);
                    }
                }, {
                    id: 'temporary_health_debuff',
                    probability: 0.5,
                    description: 'A stray spell hits you in the commotion, causing a minor injury. (-Health regeneration for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_health_debuff', 2);
                    }
                }]
            },
            option3: {
                id: 'option3',
                name: 'Walk Away',
                unlockCondition: () => true,
                effects: []
            }
        }
    });

    randomEventsDB.push({
        id: 'magic_event4',
        name: 'Magical Misfire',
        description: 'During practice in the market square, your spell misfires, creating a harmless but embarrassing illusion of yourself.',
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_spellbook') > 0;
        },
        probability: 1,
        options: {
            option1: {
                id: 'option1',
                name: 'Laugh It Off',
                usageGain: {
                    get_consumption: () => ({
                        resources: {
                            energy: {
                                A: 0,
                                B: 0.05 * gameResources.getResource('energy').cap,
                                type: 0,
                            }
                        }
                    })
                },
                unlockCondition: () => true,
                effects: [{
                    id: 'temporary_energy_regeneration_boost',
                    probability: 0.1,
                    description: 'Your humor lightens the mood, leaving you energized. (+Energy regeneration for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_energized', 1.5);
                    }
                }, {
                    id: 'temporary_coins_bonus',
                    probability: 0.9,
                    description: 'The crowd finds your antics amusing and tosses some coins your way. (+Coins gain for 10 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_coins_bonus', 1.2);
                    }
                }]
            },
            option2: {
                id: 'option2',
                name: 'Quickly Correct the Spell',
                unlockCondition: () => true,
                effects: [{
                    id: 'temporary_mental_training_rate',
                    probability: 0.7,
                    description: 'Your quick thinking improves your focus. (+Mental training speed for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_mental_training_rate', 1);
                    }
                }, {
                    id: 'temporary_mana_debuff',
                    probability: 0.3,
                    description: 'The correction drains your mana. (-Mana regeneration for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_mana_debuff', 2);
                    }
                }]
            },
            option3: {
                id: 'option3',
                name: 'Flee the Scene',
                unlockCondition: () => true,
                effects: [{
                    id: 'temporary_health_debuff',
                    probability: 0.5,
                    description: 'In your haste to escape, you bump into someone, causing a minor injury. (-Health regeneration for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_health_debuff', 1);
                    }
                }]
            }
        }
    });

    randomEventsDB.push({
        id: 'magic_event6',
        name: 'The Wandering Sage',
        description: 'An old sage approaches you, offering to share a fragment of his magical wisdom, but warns that it could be exhausting to comprehend.',
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_spellbook') > 0;
        },
        probability: 1,
        options: {
            option1: {
                id: 'option1',
                name: 'Accept His Wisdom',
                unlockCondition: () => true,
                effects: [{
                    id: 'temporary_knowledge_gain',
                    probability: 0.6,
                    description: 'The sage’s wisdom broadens your understanding. (+Knowledge gain for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_knowledge_gain', 4);
                    }
                }, {
                    id: 'temporary_mana_debuff',
                    probability: 0.4,
                    description: 'The mental effort drains your magical reserves. (-Mana regeneration for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_mana_debuff', 2);
                    }
                }]
            },
            option2: {
                id: 'option2',
                name: 'Politely Decline',
                unlockCondition: () => true,
                effects: [{
                    id: 'temporary_coins_bonus',
                    probability: 0.7,
                    description: 'Your respectful refusal impresses the sage, who shares a tip that boosts your income. (+Coin income for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_coins_bonus', 1.5);
                    }
                }, {
                    id: 'temporary_energy_debuff',
                    probability: 0.3,
                    description: 'The sage’s disappointment leaves you feeling uneasy. (-Energy regeneration for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_energy_debuff', 1.2);
                    }
                }]
            },
            option3: {
                id: 'option3',
                name: 'Ask for Practical Guidance',
                unlockCondition: () => true,
                effects: [{
                    id: 'temporary_mana_regen',
                    probability: 0.7,
                    description: 'The sage demonstrates a technique to replenish your mana. (+Mana regeneration for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_mana_regen', 2);
                    }
                }, {
                    id: 'temporary_mental_training_rate',
                    probability: 0.3,
                    description: 'The sage’s teachings improve your focus. (+Mental training speed for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_mental_training_rate', 2);
                    }
                }]
            }
        }
    });

    randomEventsDB.push({
        id: 'magic_event7',
        name: 'An Enchanted Fountain',
        description: 'You find a glowing fountain in the woods. The water sparkles with magical energy, and a faint humming fills the air.',
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_spellbook') > 0;
        },
        probability: 1,
        options: {
            option1: {
                id: 'option1',
                name: 'Drink the Water',
                unlockCondition: () => true,
                effects: [{
                    id: 'temporary_mana_regen',
                    probability: 0.7,
                    description: 'The water revitalizes your magical reserves. (+Mana regeneration for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_mana_regen', 1.5);
                    }
                }, {
                    id: 'temporary_knowledge_debuff',
                    probability: 0.3,
                    description: 'The magical water overwhelms your thoughts. (-Knowledge gain for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_knowledge_debuff', 2);
                    }
                }]
            },
            option2: {
                id: 'option2',
                name: 'Use the Water for Research',
                unlockCondition: () => true,
                effects: [{
                    id: 'temporary_knowledge_gain',
                    probability: 0.6,
                    description: 'The water enhances your research, deepening your understanding. (+Knowledge gain for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_knowledge_gain', 3);
                    }
                }, {
                    id: 'temporary_mana_debuff',
                    probability: 0.4,
                    description: 'Using the water in experiments depletes your mana. (-Mana regeneration for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_mana_debuff', 1);
                    }
                }]
            },
            option3: {
                id: 'option3',
                name: 'Leave It Alone',
                unlockCondition: () => true,
                effects: []
            }
        }
    });

    randomEventsDB.push({
        id: 'magic_event8',
        name: 'A Mage’s Duel',
        description: 'Two mages are locked in a duel, their spells lighting up the night sky. They invite you to join as a mediator or a participant.',
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_spellbook') > 0;
        },
        probability: 1,
        options: {
            option1: {
                id: 'option1',
                name: 'Join as a Mediator',
                unlockCondition: () => true,
                effects: [{
                    id: 'temporary_knowledge_gain',
                    probability: 0.5,
                    description: 'Your efforts to mediate help you understand complex spell interactions. (+Knowledge gain for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_knowledge_gain', 4);
                    }
                }, {
                    id: 'temporary_energy_regeneration_debuff',
                    probability: 0.5,
                    description: 'Mediating the duel is exhausting. (-Energy regeneration for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_energy_debuff', 1);
                    }
                }]
            },
            option2: {
                id: 'option2',
                name: 'Join the Duel',
                unlockCondition: () => true,
                effects: [{
                    id: 'temporary_mana_regen',
                    probability: 0.6,
                    description: 'The duel invigorates your magical energy. (+Mana regeneration for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_mana_regen', 3);
                    }
                }, {
                    id: 'temporary_health_debuff',
                    probability: 0.4,
                    description: 'A stray spell injures you slightly. (-Health regeneration for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_health_debuff', 2);
                    }
                }]
            },
            option3: {
                id: 'option3',
                name: 'Watch from the Sidelines',
                unlockCondition: () => true,
                effects: []
            }
        }
    });

    randomEventsDB.push({
        id: 'magic_event9',
        name: 'Healing Light Ritual',
        description: 'A group of traveling healers offers to perform a ritual that could enhance your recovery abilities, but they require a donation of magical energy or health.',
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_spellbook') > 0;
        },
        probability: 1,
        options: {
            option1: {
                id: 'option1',
                name: 'Donate Mana',
                usageGain: {
                    get_consumption: () => ({
                        resources: {
                            mana: {
                                A: 0,
                                B: 0.2 * gameResources.getResource('mana').cap,
                                type: 0,
                            }
                        }
                    })
                },
                unlockCondition: () => true,
                effects: [{
                    id: 'temporary_health_regen',
                    probability: 0.7,
                    description: 'The ritual succeeds, briefly enhancing your health regeneration. (+Health regeneration for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_health_regen', 2);
                        gameResources.addResource('mana', -0.2 * gameResources.getResource('mana').cap);
                    }
                }, {
                    id: 'temporary_mana_debuff',
                    probability: 0.3,
                    description: 'The ritual fails, leaving you drained. (-Mana regeneration for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_mana_debuff', 1.5);
                        gameResources.addResource('mana', -0.2 * gameResources.getResource('mana').cap);
                    }
                }]
            },
            option2: {
                id: 'option2',
                name: 'Donate Health',
                usageGain: {
                    get_consumption: () => ({
                        resources: {
                            health: {
                                A: 0,
                                B: 0.4 * gameResources.getResource('health').cap,
                                type: 0,
                            }
                        }
                    })
                },
                unlockCondition: () => true,
                effects: [{
                    id: 'temporary_knowledge_gain',
                    probability: 0.8,
                    description: 'Your sacrifice inspires a burst of clarity. (+Knowledge gain for 15 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_knowledge_gain', 1.4);
                        gameResources.addResource('health', -0.4 * gameResources.getResource('health').cap);
                    }
                }, {
                    id: 'temporary_health_debuff',
                    probability: 0.2,
                    description: 'The ritual strains your body, weakening your recovery temporarily. (-Health regeneration for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_health_debuff', 1.3);
                        gameResources.addResource('health', -0.4 * gameResources.getResource('health').cap);
                    }
                }]
            },
            option3: {
                id: 'option3',
                name: 'Decline Politely',
                unlockCondition: () => true,
                effects: []
            }
        }
    });

    randomEventsDB.push({
        id: 'magic_event10',
        name: 'Forgotten Spell Scroll',
        description: 'You stumble upon an ancient scroll half-buried in the ground. The script shimmers with faint arcane energy.',
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_spellbook') > 0;
        },
        probability: 1,
        options: {
            option1: {
                id: 'option1',
                name: 'Attempt to Read It',
                unlockCondition: () => true,
                effects: [{
                    id: 'temporary_mana_regen',
                    probability: 0.6,
                    description: 'The scroll reveals techniques that restore your mana. (+Mana regeneration for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_mana_regen', 1.5);
                    }
                }, {
                    id: 'temporary_mana_debuff',
                    probability: 0.4,
                    description: 'The scroll’s magic backfires, sapping your strength. (-Mana regeneration for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_mana_debuff', 1.2);
                    }
                }]
            },
            option2: {
                id: 'option2',
                name: 'Use the Scroll for Research',
                unlockCondition: () => true,
                effects: [{
                    id: 'temporary_knowledge_gain',
                    probability: 0.8,
                    description: 'The scroll deepens your understanding. (+Knowledge gain for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_knowledge_gain', 1.6);
                    }
                }, {
                    id: 'temporary_energy_debuff',
                    probability: 0.2,
                    description: 'The effort leaves you exhausted. (-Energy regeneration for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_energy_debuff', 1.4);
                    }
                }]
            },
            option3: {
                id: 'option3',
                name: 'Leave It Be',
                unlockCondition: () => true,
                effects: []
            }
        }
    });

    randomEventsDB.push({
        id: 'magic_event13',
        name: 'The Arcane Merchant',
        description: 'A mysterious merchant sets up a stall in the market, offering rare magical trinkets that could enhance your abilities, for a price.',
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_spellbook') > 0;
        },
        probability: 1,
        options: {
            option1: {
                id: 'option1',
                name: 'Buy a Mana Crystal',
                usageGain: {
                    get_consumption: () => ({
                        resources: {
                            coins: {
                                A: 0,
                                B: 0.1 * gameResources.getResource('coins').cap,
                                type: 0,
                            }
                        }
                    })
                },
                unlockCondition: () => true,
                effects: [{
                    id: 'temporary_mana_regen',
                    probability: 0.8,
                    description: 'The crystal revitalizes your magical energy. (+Mana regeneration for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_mana_regen', 1.5);
                        gameResources.addResource('coins', -0.1 * gameResources.getResource('coins').cap);
                    }
                }, {
                    id: 'temporary_mana_debuff',
                    probability: 0.2,
                    description: 'The crystal is flawed, sapping your mana instead. (-Mana regeneration for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_mana_debuff', 1.2);
                        gameResources.addResource('coins', -0.1 * gameResources.getResource('coins').cap);
                    }
                }]
            },
            option2: {
                id: 'option2',
                name: 'Inspect the Merchant’s Wares',
                unlockCondition: () => true,
                effects: [{
                    id: 'temporary_knowledge_gain',
                    probability: 0.7,
                    description: 'You learn something from the merchant’s collection. (+Knowledge gain for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_knowledge_gain', 1.4);
                    }
                }, {
                    id: 'temporary_health_debuff',
                    probability: 0.3,
                    description: 'You cut yourself on a sharp artifact. (-Health regeneration for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_health_debuff', 1.3);
                    }
                }]
            },
            option3: {
                id: 'option3',
                name: 'Walk Away',
                unlockCondition: () => true,
                effects: []
            }
        }
    });

    randomEventsDB.push({
        id: 'magic_event14',
        name: 'The Wandering Illusionist',
        description: 'An illusionist captivates the crowd with his dazzling tricks and offers to teach you a secret for a price.',
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_spellbook') > 0;
        },
        probability: 1,
        options: {
            option1: {
                id: 'option1',
                name: 'Pay for the Lesson',
                usageGain: {
                    get_consumption: () => ({
                        resources: {
                            coins: {
                                A: 0,
                                B: 0.1 * gameResources.getResource('coins').cap,
                                type: 0,
                            }
                        }
                    })
                },
                unlockCondition: () => true,
                effects: [{
                    id: 'temporary_knowledge_gain',
                    probability: 0.7,
                    description: 'The lesson provides insights that temporarily enhance your learning efficiency. (+Knowledge gain for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_knowledge_gain', 1.5);
                        gameResources.addResource('coins', -0.1 * gameResources.getResource('coins').cap);
                    }
                }, {
                    id: 'temporary_energy_debuff',
                    probability: 0.3,
                    description: 'The effort leaves you fatigued. (-Energy regeneration for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_energy_debuff', 1.4);
                        gameResources.addResource('coins', -0.1 * gameResources.getResource('coins').cap);
                    }
                }]
            },
            option2: {
                id: 'option2',
                name: 'Challenge His Tricks',
                usageGain: {
                    get_consumption: () => ({
                        resources: {
                            energy: {
                                A: 0,
                                B: 0.1 * gameResources.getResource('energy').cap,
                                type: 0,
                            }
                        }
                    })
                },
                unlockCondition: () => true,
                effects: [{
                    id: 'temporary_knowledge_gain',
                    probability: 0.5,
                    description: 'Dissecting his illusions sharpens your mind. (+Knowledge gain for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_knowledge_gain', 1.6);
                        gameResources.addResource('energy', -0.1 * gameResources.getResource('energy').cap);
                    }
                }, {
                    id: 'temporary_mana_debuff',
                    probability: 0.5,
                    description: 'The mental effort drains your magical reserves. (-Mana regeneration for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_mana_debuff', 1.4);
                        gameResources.addResource('energy', -0.1 * gameResources.getResource('energy').cap);
                    }
                }]
            },
            option3: {
                id: 'option3',
                name: 'Watch Silently',
                unlockCondition: () => true,
                effects: [{
                    id: 'temporary_mana_regen',
                    probability: 0.8,
                    description: 'Watching his tricks calms your mind. (+Mana regeneration for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_mana_regen', 1.3);
                    }
                }]
            }
        }
    });

    randomEventsDB.push({
        id: 'magic_event16',
        name: 'Arcane Convergence',
        description: 'A rare alignment of celestial bodies fills the air with arcane energy. A mysterious portal appears before you, pulsating with power.',
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_spellbook') > 0;
        },
        probability: 1,
        options: {
            option1: {
                id: 'option1',
                name: 'Step Into the Portal',
                usageGain: {
                    get_consumption: () => ({
                        resources: {
                            mana: {
                                A: 0,
                                B: 0.1 * gameResources.getResource('mana').cap,
                                type: 0,
                            }
                        }
                    })
                },
                unlockCondition: () => true,
                effects: [{
                    id: 'temporary_mana_regen',
                    probability: 0.5,
                    description: 'The arcane energies rejuvenate your magical reserves. (+Mana regeneration for 10 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_mana_regen', 1.5);
                        gameResources.addResource('mana', -0.1 * gameResources.getResource('mana').cap);
                    }
                }, {
                    id: 'temporary_health_debuff',
                    probability: 0.5,
                    description: 'The portal destabilizes, sapping your vitality. (-Health regeneration for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_health_debuff', 1.5);
                        gameResources.addResource('mana', -0.1 * gameResources.getResource('mana').cap);
                    }
                }]
            },
            option2: {
                id: 'option2',
                name: 'Observe from a Distance',
                unlockCondition: () => true,
                effects: [{
                    id: 'temporary_knowledge_gain',
                    probability: 0.7,
                    description: 'You glean insights from the portal’s behavior. (+Knowledge gain for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_knowledge_gain', 2);
                    }
                }, {
                    id: 'temporary_mana_debuff',
                    probability: 0.3,
                    description: 'The portal’s energy interferes with your focus. (-Mana regeneration for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_mana_debuff', 1.3);
                    }
                }]
            },
            option3: {
                id: 'option3',
                name: 'Close the Portal',
                unlockCondition: () => true,
                usageGain: {
                    get_consumption: () => ({
                        resources: {
                            energy: {
                                A: 0,
                                B: 0.2 * gameResources.getResource('energy').cap,
                                type: 0,
                            }
                        }
                    })
                },
                effects: [{
                    id: 'temporary_mental_training_rate',
                    probability: 0.8,
                    description: 'Closing the portal sharpens your discipline. (+Mental training speed for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_mental_training_rate', 1.5);
                        gameResources.addResource('energy', -0.2 * gameResources.getResource('energy').cap);
                    }
                }, {
                    id: 'temporary_health_debuff',
                    probability: 0.2,
                    description: 'The portal lashes out, leaving you injured. (-Health regeneration for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_health_debuff', 1.3);
                        gameResources.addResource('energy', -0.2 * gameResources.getResource('energy').cap);
                    }
                }]
            }
        }
    });

    randomEventsDB.push({
        id: 'magic_event17',
        name: 'The Forgotten Archive',
        description: 'You discover a hidden library filled with ancient texts. A glowing pedestal at its center beckons you forward.',
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_spellbook') > 0;
        },
        probability: 1,
        options: {
            option1: {
                id: 'option1',
                name: 'Study the Ancient Texts',
                unlockCondition: () => true,
                effects: [{
                    id: 'temporary_knowledge_gain',
                    probability: 0.8,
                    description: 'The texts expand your understanding of magic. (+Knowledge gain for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_knowledge_gain', 2);
                    }
                }, {
                    id: 'temporary_mana_debuff',
                    probability: 0.2,
                    description: 'The effort drains your mana reserves. (-Mana regeneration for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_mana_debuff', 1.4);
                    }
                }]
            },
            option2: {
                id: 'option2',
                name: 'Approach the Pedestal',
                usageGain: {
                    get_consumption: () => ({
                        resources: {
                            mana: {
                                A: 0,
                                B: 0.1*gameResources.getResource('mana').cap,
                                type: 0,
                            }
                        }
                    })
                },
                unlockCondition: () => true,
                effects: [{
                    id: 'temporary_mana_regen',
                    probability: 0.5,
                    description: 'The pedestal’s magic stabilizes your reserves. (+Mana regeneration for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_mana_regen', 1.5);
                        gameResources.addResource('mana', -gameResources.getResource('mana').cap);
                    }
                }, {
                    id: 'temporary_health_debuff',
                    probability: 0.5,
                    description: 'The pedestal’s magic is unstable, causing minor harm. (-Health regeneration for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_health_debuff', 1.2);
                        gameResources.addResource('mana', -gameResources.getResource('mana').cap);
                    }
                }]
            },
            option3: {
                id: 'option3',
                name: 'Catalog the Library’s Contents',
                unlockCondition: () => true,
                effects: [{
                    id: 'temporary_mental_training_rate',
                    probability: 1,
                    description: 'Cataloging the texts improves your focus. (+Mental training speed for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_mental_training_rate', 1.5);
                    }
                }]
            }
        }
    });

    randomEventsDB.push({
        id: 'magic_event18',
        name: 'The Crystal Cavern',
        description: 'You stumble upon a hidden cavern filled with glowing crystals. Their hum resonates with magical energy.',
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_spellbook') > 0;
        },
        probability: 1,
        options: {
            option1: {
                id: 'option1',
                name: 'Harvest the Crystals',
                usageGain: {
                    get_consumption: () => ({
                        resources: {
                            mana: {
                                A: 0,
                                B: 0.2 * gameResources.getResource('mana').cap, // Вартість залежить від максимуму
                                type: 0,
                            }
                        }
                    })
                },
                unlockCondition: () => true,
                effects: [{
                    id: 'temporary_mana_knowledge_boost',
                    probability: 0.6,
                    description: 'The crystals enhance your magical aptitude and sharpen your mind. (+Mana regeneration and +Knowledge gain for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_mana_regen', 1.5);
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_knowledge_gain', 1.5);
                        gameResources.addResource('mana', -0.2 * gameResources.getResource('mana').cap); // Віднімання витрат
                    }
                }, {
                    id: 'temporary_health_debuff',
                    probability: 0.4,
                    description: 'The crystals emit a sharp energy that drains your vitality. (-Health regeneration for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_health_debuff', 1.5);
                    }
                }]
            },
            option2: {
                id: 'option2',
                name: 'Meditate Among the Crystals',
                unlockCondition: () => true,
                effects: [{
                    id: 'temporary_mana_regen',
                    probability: 0.8,
                    description: 'The crystals rejuvenate your magical reserves. (+Mana regeneration for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_mana_regen', 1.5);
                    }
                }, {
                    id: 'temporary_energy_debuff',
                    probability: 0.2,
                    description: 'The hum of the crystals leaves you slightly fatigued. (-Energy regeneration for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_energy_debuff', 1.2);
                    }
                }]
            },
            option3: {
                id: 'option3',
                name: 'Leave the Cavern',
                unlockCondition: () => true,
                effects: []
            }
        }
    });

    randomEventsDB.push({
        id: 'magic_event19',
        name: 'The Arcane Ritual',
        description: 'A group of mages invites you to join a ritual designed to enhance magical abilities, but warns of potential risks.',
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_spellbook') > 0;
        },
        probability: 1,
        options: {
            option1: {
                id: 'option1',
                name: 'Participate in the Ritual',
                usageGain: {
                    get_consumption: () => ({
                        resources: {
                            mana: {
                                A: 0,
                                B: 0.2 * gameResources.getResource('mana').cap, // Вартість залежить від cap
                                type: 0,
                            }
                        }
                    })
                },
                unlockCondition: () => true,
                effects: [{
                    id: 'temporary_mana_boost',
                    probability: 0.7,
                    description: 'The ritual strengthens your magical connection, briefly enhancing your mana regeneration. (+Mana regeneration for 10 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_mana_regen', 2);
                        gameResources.addResource('mana', -0.2 * gameResources.getResource('mana').cap); // Віднімання витрат
                    }
                }, {
                    id: 'temporary_health_debuff',
                    probability: 0.3,
                    description: 'The ritual drains your physical strength. (-Health regeneration for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_health_debuff', 1.5);
                    }
                }]
            },
            option2: {
                id: 'option2',
                name: 'Observe the Ritual',
                unlockCondition: () => true,
                effects: [{
                    id: 'temporary_knowledge_gain',
                    probability: 1,
                    description: 'Watching the ritual provides valuable insights. (+Knowledge gain for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_knowledge_gain', 1.8);
                    }
                }]
            },
            option3: {
                id: 'option3',
                name: 'Politely Decline',
                unlockCondition: () => true,
                effects: [{
                    id: 'health_blessings',
                    probability: 0.5,
                    description: 'The Gods appreciate your carefulness, giving you temporary boost to health',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_health_regen', 1.4);
                    }
                }, {
                    id: 'temporary_energy_debuff',
                    probability: 0.5,
                    description: 'Refusing leaves you slightly uneasy. (-Energy regeneration for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_energy_debuff', 1.2);
                    }
                }]
            }
        }
    });


    return randomEventsDB;
};
