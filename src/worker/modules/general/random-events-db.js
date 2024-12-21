import {gameCore, gameEntity, gameResources} from "game-framework";

export const registerRandomEventsDb = () => {

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
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_energized')
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
                        console.log('Gold income bonus activated.')
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
                        console.log('You gained 20 experience.')
                        gameResources.addResource('mage-xp', 20 + 0.01*gameResources.getResource('mage-xp').cap)
                    }
                },{
                    id: 'lose_energy',
                    probability: 1,
                    description: 'Meditation proves taxing, and you feel your energy drain away.',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        console.log('You lost energy.')
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
                        console.log('Learning speed bonus activated.')
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
                                B: 50*Math.pow(1 + gameEntity.getLevel('random_events_strength_effect'), 2),
                                type: 0,
                            }
                        }
                    })
                },
                effects: [{
                    id: 'gain_strength',
                    probability: 0.6,
                    description: 'The shrine accepts your offering, and you feel your muscles strengthen. (+1 Strength)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        // set permanent attribute modifier
                        // gameResources.addResource('strength', 1);
                        gameEntity.setEntityLevel('random_events_strength_effect', gameEntity.getLevel('random_events_strength_effect')+1, true)
                        gameResources.addResource('coins', -50*Math.pow(1 + gameEntity.getLevel('random_events_strength_effect'), 2));
                    }
                }, {
                    id: 'fail_offering',
                    probability: 0.4,
                    description: 'The shrine remains silent, and your gold disappears into the void.',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameResources.addResource('coins', -50*Math.pow(1 + gameEntity.getLevel('random_events_strength_effect'), 2));
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
                effects: [{
                    id: 'gain_stamina',
                    probability: 0.7,
                    description: 'The mirror binds to your soul, granting you increased stamina. (+1 Stamina, -50% energy regeneration for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameEntity.setEntityLevel('random_events_stamina_effect', gameEntity.getLevel('random_events_stamina_effect')+1, true)
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_energy_debuff');
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
                                B: 100*Math.pow(1 + gameEntity.getLevel('random_events_strength_effect'), 2),
                                type: 0,
                            }
                        }
                    })
                },
                unlockCondition: () => true,
                effects: [{
                    id: 'permanent_learning_bonus',
                    probability: 0.5,
                    description: 'The monk shares his wisdom, and you feel your mind expand. (+2% permanent learning speed)',
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
                    id: 'gain_strength',
                    probability: 0.2,
                    description: 'You endure the pain and emerge stronger. (+1 Strength, -50% HP)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameEntity.setEntityLevel('random_events_strength_effect', gameEntity.getLevel('random_events_strength_effect')+1, true);
                        gameResources.addResource('health', -0.5 * gameResources.getResource('health').cap);
                    }
                }, {
                    id: 'fail_trial',
                    probability: 0.8,
                    description: 'The heat is too much, and you collapse from exhaustion. (-75% HP)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameResources.addResource('health', -0.75 * gameResources.getResource('health').cap);
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
                effects: [{
                    id: 'permanent_recovery_bonus',
                    probability: 0.3,
                    description: 'The priest’s blessing fills you with resilience. (+1 Recovery)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameEntity.setEntityLevel('random_events_recovery_effect', gameEntity.getLevel('random_events_recovery_effect') + 1, true);
                    }
                }, {
                    id: 'refill',
                    probability: 0.5,
                    description: 'You feel yourself healthier than ever',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_health_regen');
                    }
                },{
                    id: 'blessing_fail',
                    probability: 0.1,
                    description: 'The blessing backfires, leaving you slightly weakened. (-10% HP)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameResources.addResource('health', -0.1 * gameResources.getResource('health').cap);
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
                unlockCondition: () => true,
                effects: [{
                    id: 'permanent_recovery_bonus',
                    probability: 0.1,
                    description: 'Your prayer is answered, and you feel an inner strength awaken. (+1 Recovery)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameEntity.setEntityLevel('random_events_recovery_effect', gameEntity.getLevel('random_events_recovery_effect') + 1, true);
                    }
                }, {
                    id: 'minor_blessing',
                    probability: 0.2,
                    description: 'The altar grants a small boon, increasing your health regeneration temporarily. (+Health regen for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_health_regen');
                    }
                }, {
                    id: 'negative_effect',
                    probability: 0.7,
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
                                B: Math.max(50, 0.1*gameResources.getResource('coins').cap),
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
                        gameResources.addResource('coins', -Math.max(50, 0.1*gameResources.getResource('coins').cap));
                    }
                }, {
                    id: 'altar_silence',
                    probability: 0.5,
                    description: 'The altar remains silent, and your gold vanishes.',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameResources.addResource('coins', -Math.max(50, 0.1*gameResources.getResource('coins').cap));
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
                effects: [{
                    id: 'strength_gain',
                    probability: 0.4,
                    description: 'You fight valiantly and emerge victorious. (+1 Strength)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameEntity.setEntityLevel('random_events_strength_effect', gameEntity.getLevel('random_events_strength_effect') + 1, true);
                    }
                }, {
                    id: 'minor_injury',
                    probability: 0.4,
                    description: 'You lose the duel but gain valuable experience. (-10% HP, +Temporary strength training bonus, +Injury)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameResources.addResource('health', -0.1 * gameResources.getResource('health').cap);
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_physical_training_rate');
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_health_debuff');
                    }
                }, {
                    id: 'severe_injury',
                    probability: 0.2,
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
                                B: 100*Math.pow(1 + gameEntity.getLevel('random_events_charisma_effect'), 2),
                                type: 0,
                            }
                        }
                    })
                },
                effects: [{
                    id: 'permanent_charisma_bonus',
                    probability: 0.5,
                    description: 'The merchant’s goods grant you an air of confidence. (+1 Charisma)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameEntity.setEntityLevel('random_events_charisma_effect', gameEntity.getLevel('random_events_charisma_effect') + 1, true);
                        gameResources.addResource('coins', -100*Math.pow(1 + gameEntity.getLevel('random_events_charisma_effect'), 2));
                    }
                }, {
                    id: 'worthless_purchase',
                    probability: 0.5,
                    description: 'The goods turn out to be useless trinkets. You feel cheated. (-100 coins)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameResources.addResource('coins', -100*Math.pow(1 + gameEntity.getLevel('random_events_charisma_effect'), 2));
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
            option1: {
                id: 'option1',
                name: 'Inspire the Crowd',
                unlockCondition: () => true,
                effects: [{
                    id: 'permanent_charisma_bonus',
                    probability: 0.2,
                    description: 'Your words resonate deeply, leaving a lasting impression. (+1 Charisma)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameEntity.setEntityLevel('random_events_charisma_effect', gameEntity.getLevel('random_events_charisma_effect') + 1, true);
                    }
                }, {
                    id: 'exhaustion',
                    probability: 0.8,
                    description: 'Speaking passionately takes its toll on you. (-100% Energy)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameResources.addResource('energy', -gameResources.getResource('energy').cap);
                    }
                }]
            },
            option2: {
                id: 'option2',
                name: 'Remain Silent',
                unlockCondition: () => true,
                effects: []
            }
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
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_gold_bonus');
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
                    id: 'charisma_bonus',
                    probability: 0.2,
                    description: 'The crowd loves your performance! (+1 Charisma)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameEntity.setEntityLevel('random_events_charisma_effect', gameEntity.getLevel('random_events_charisma_effect') + 1, true);
                    }
                }, {
                    id: 'voice_strain',
                    probability: 0.5,
                    description: 'You strain your voice trying to match their skills. (-20% Energy)',
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
                    id: 'charisma_penalty',
                    probability: 0.2,
                    description: 'The crowd boos you for your rude interruption. (-1 Charisma)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameEntity.setEntityLevel('random_events_charisma_effect', gameEntity.getLevel('random_events_charisma_effect') - 1, true);
                    }
                }, {
                    id: 'charisma_gain',
                    probability: 0.3,
                    description: 'The crowd surprisingly loves your boldness! (+1 Charisma)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameEntity.setEntityLevel('random_events_charisma_effect', gameEntity.getLevel('random_events_charisma_effect') + 1, true);
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
                                B: 50 * Math.pow(1 + gameEntity.getLevel('random_events_charisma_effect'), 2),
                                type: 0,
                            }
                        }
                    })
                },
                effects: [{
                    id: 'charisma_boost',
                    probability: 0.4,
                    description: 'The fortune teller’s words inspire confidence in you. (+1 Charisma)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameEntity.setEntityLevel('random_events_charisma_effect', gameEntity.getLevel('random_events_charisma_effect') + 1, true);
                        gameResources.addResource('coins', -50 * Math.pow(1 + gameEntity.getLevel('random_events_charisma_effect'), 2));
                    }
                }, {
                    id: 'vague_predictions',
                    probability: 0.5,
                    description: 'Her predictions are vague and unhelpful.',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameResources.addResource('coins', -50 * Math.pow(1 + gameEntity.getLevel('random_events_charisma_effect'), 2));
                    }
                }, {
                    id: 'bad_omen',
                    probability: 0.1,
                    description: 'She warns of a dark future, and you feel unnerved. (-10% Energy)',
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
                effects: [{
                    id: 'power_gain',
                    probability: 0.3,
                    description: 'The artifact bonds with you, granting a permanent boost to Strength. (+1 Strength)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameEntity.setEntityLevel('random_events_strength_effect', gameEntity.getLevel('random_events_strength_effect') + 1, true);
                    }
                }, {
                    id: 'artifact_curse',
                    probability: 0.3,
                    description: 'A curse emanates from the artifact, draining your health. (You got major injury)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameResources.addResource('health', -0.2 * gameResources.getResource('health').cap);
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_health_debuff', 3);
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
                    id: 'charisma_boost',
                    probability: 0.3,
                    description: 'You feel a surge of confidence coursing through you. (+1 Charisma)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameEntity.setEntityLevel('random_events_charisma_effect', gameEntity.getLevel('random_events_charisma_effect') + 1, true);
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
                    probability: 0.3,
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
                effects: [{
                    id: 'temporary_knowledge_gain',
                    probability: 0.6,
                    description: 'The tome is full of arcane knowledge, enhancing your understanding. (+Knowledge gain for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_knowledge_gain');
                    }
                }, {
                    id: 'temporary_knowledge_debuff',
                    probability: 0.3,
                    description: 'The text is confusing and gives you a headache. (-Knowledge gain for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_knowledge_debuff');
                    }
                }, {
                    id: 'memory_boost',
                    probability: 0.1,
                    description: 'You decipher a hidden message, permanently enhancing your memory. (+1 Memory)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameEntity.setEntityLevel('random_events_memory_effect', gameEntity.getLevel('random_events_memory_effect') + 1, true);
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
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_knowledge_gain');
                    }
                }, {
                    id: 'temporary_knowledge_debuff',
                    probability: 0.2,
                    description: 'The scroll is riddled with errors, confusing your thoughts. (-Knowledge gain for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_knowledge_debuff');
                    }
                }, {
                    id: 'memory_boost',
                    probability: 0.1,
                    description: 'The scroll teaches you a mnemonic trick, enhancing your memory. (+1 Memory)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameEntity.setEntityLevel('random_events_memory_effect', gameEntity.getLevel('random_events_memory_effect') + 1, true);
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
                effects: [{
                    id: 'temporary_knowledge_gain',
                    probability: 0.5,
                    description: 'The apparition leads you to a forgotten cache of knowledge. (+Knowledge gain for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_knowledge_gain');
                    }
                }, {
                    id: 'temporary_knowledge_debuff',
                    probability: 0.3,
                    description: 'The apparition misleads you, wasting your time. (-Knowledge gain for 5 minutes)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_knowledge_debuff');
                    }
                }, {
                    id: 'memory_boost',
                    probability: 0.2,
                    description: 'The apparition shares a secret, permanently enhancing your memory. (+1 Memory)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameEntity.setEntityLevel('random_events_memory_effect', gameEntity.getLevel('random_events_memory_effect') + 1, true);
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
                unlockCondition: () => true,
                effects: [{
                    id: 'charisma_boost',
                    probability: 0.2,
                    description: 'You win the bet and impress everyone! (+1 Charisma)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameEntity.setEntityLevel('random_events_charisma_effect', gameEntity.getLevel('random_events_charisma_effect') + 1, true);
                    }
                }, {
                    id: 'knowledge_permanent_boost',
                    probability: 0.2,
                    description: 'You push your limits and learn efficiently. (+1 Knowledge permanently)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameEntity.setEntityLevel('random_events_knowledge_effect', gameEntity.getLevel('random_events_knowledge_effect') + 1, true);
                    }
                }, {
                    id: 'temporary_knowledge_debuff',
                    probability: 0.6,
                    description: 'You overexert yourself and feel drained. (-Knowledge gain for 5 minutes)',
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
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_energy_regeneration_debuff');
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
                effects: [{
                    id: 'memory_boost',
                    probability: 0.4,
                    description: 'The riddle challenges your mind, enhancing your memory. (+1 Memory)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameEntity.setEntityLevel('random_events_memory_effect', gameEntity.getLevel('random_events_memory_effect') + 1, true);
                    }
                }, {
                    id: 'temporary_energy_debuff',
                    probability: 0.3,
                    description: 'The riddle exhausts you mentally. (-20% Energy)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameResources.addResource('energy', -0.2 * gameResources.getResource('energy').cap);
                        gameCore.getModule('temporary-effects').triggerEffect('temporary_energy_regeneration_debuff');
                    }
                }, {
                    id: 'gold_find',
                    probability: 0.3,
                    description: 'The librarian rewards you with a small pouch of coins.',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameResources.addResource('coins', 0.1*gameResources.getResource('coins').cap);
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
                unlockCondition: () => true,
                effects: [{
                    id: 'knowledge_permanent_boost',
                    probability: 0.2,
                    description: 'The experiment succeeds, expanding your knowledge. (+1 Knowledge permanently)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameEntity.setEntityLevel('random_events_knowledge_effect', gameEntity.getLevel('random_events_knowledge_effect') + 1, true);
                    }
                }, {
                    id: 'temporary_energy_debuff',
                    probability: 0.3,
                    description: 'The experiment exhausts you physically. (-20% Energy)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameResources.addResource('energy', -0.2 * gameResources.getResource('energy').cap);
                    }
                }, {
                    id: 'temporary_health_debuff',
                    probability: 0.3,
                    description: 'The experiment goes awry, injuring you slightly. (-10% HP)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameResources.addResource('health', -0.1 * gameResources.getResource('health').cap);
                    }
                }, {
                    id: 'memory_boost',
                    probability: 0.2,
                    description: 'The experiment teaches you new mnemonic techniques. (+1 Memory)',
                    unlockCondition: () => true,
                    onTrigger: () => {
                        gameEntity.setEntityLevel('random_events_memory_effect', gameEntity.getLevel('random_events_memory_effect') + 1, true);
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



    return randomEventsDB;
};
