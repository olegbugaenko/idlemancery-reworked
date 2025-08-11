import {gameEntity, gameCore, gameEffects, gameResources} from "game-framework"

export const registerEventsStage1 = () => {

    // Функція для реєстрації події
    const registerGameSocialEvent = (id, options) => {
        // Реєструємо основну подію
        gameEntity.registerGameEntity(id, {
            ...options,
            isAbstract: true,
            tags: [...(options.tags || []), "event-hall", "social"],
            level: 0,
            maxLevel: 1,
            unlockCondition: options.unlockCondition || (() => true),
            attributes: {
                ...options.attributes,
                isEvent: true,
                eventDuration: 30 * 60 * 1000, // 30 хвилин в мілісекундах
                eventCooldown: 30 * 60 * 1000, // 30 хвилин кулдаун
            }
        })

        // Реєструємо ентіті для постійного бонусу
        const permanentBonusId = `${id}_permanent_bonus`
        gameEntity.registerGameEntity(permanentBonusId, {
            tags: ["social-event", "permanent_bonus"],
            name: `${options.name} Permanent Bonus`,
            description: `Permanent bonus from ${options.name}`,
            level: 0,
            unlockCondition: options.unlockCondition || (() => true),
            resourceModifier: options.permanentResourceModifier,
        })
    }

    // Реєструємо події
    registerGameSocialEvent('event_charity_concert', {
        name: 'Charity Concert',
        description: 'Organize a charity concert to boost social training',
        permanentEffect: 'event_charisma_permanent_bonus',
        temporaryEffect: 'social_training_learning_rate',
        category: 'social',
        tags: ["training"],
        // Resource modifier, applied to running event
        resourceModifier: {
            multiplier: {
                effects: {
                    social_training_learning_rate: {
                        A: 0.5,
                        B: 1,
                        type: 0
                    }
                }
            }
        },
        permanentResourceModifier: {
            get_multiplier: () => ({
                effects: {
                    social_training_learning_rate: {
                        A: 0.02 * gameEffects.getEffectValue('training_social_effects_efficiency'),
                        B: 1,
                        type: 0
                    }
                }
            }),
            effectDeps: ['training_social_effects_efficiency']
        },
        get_cost: () => ({
            'coins': {
                A: 0,
                B: 500000000,
                type: 0
            }
        })
    })

    registerGameSocialEvent('event_martial_arts_tournament', {
        name: 'Martial Arts Tournament',
        description: 'Organize a martial arts tournament to boost physical training',
        permanentEffect: 'event_strength_permanent_bonus',
        temporaryEffect: 'physical_training_learn_speed',
        category: 'physical',
        tags: ["training"],
        resourceModifier: {
            multiplier: {
                effects: {
                    physical_training_learn_speed: {
                        A: 0.5,
                        B: 1,
                        type: 0
                    }
                }
            }
        },
        permanentResourceModifier: {
            get_multiplier: () => ({
                effects: {
                    physical_training_learn_speed: {
                        A: 0.02 * gameEffects.getEffectValue('training_social_effects_efficiency'),
                        B: 1,
                        type: 0
                    }
                }
            }),
            effectDeps: ['training_social_effects_efficiency']
        },
        get_cost: () => ({
            'coins': {
                A: 0,
                B: 500000000,
                type: 0
            }
        })
    })

    registerGameSocialEvent('event_clay_sculpting_contest', {
        name: 'Clay Sculpting Contest',
        description: 'Organize a clay sculpting contest to boost routine activities',
        permanentEffect: 'event_patience_permanent_bonus',
        temporaryEffect: 'routine_learning_speed',
        category: 'routine',
        tags: ["training"],
        resourceModifier: {
            multiplier: {
                effects: {
                    routine_learning_speed: {
                        A: 0.5,
                        B: 1,
                        type: 0
                    }
                }
            }
        },
        permanentResourceModifier: {
            get_multiplier: () => ({
                effects: {
                    routine_learning_speed: {
                        A: 0.02 * gameEffects.getEffectValue('training_social_effects_efficiency'),
                        B: 1,
                        type: 0
                    }
                }
            }),
            effectDeps: ['training_social_effects_efficiency']
        },
        get_cost: () => ({
            'coins': {
                A: 0,
                B: 500000000,
                type: 0
            }
        })
    })

    registerGameSocialEvent('event_magical_symposium', {
        name: 'Magical Symposium',
        description: 'Organize a magical symposium to boost magical training',
        permanentEffect: 'event_magic_permanent_bonus',
        temporaryEffect: 'spiritual_learning_rate',
        category: 'magical',
        tags: ["training"],
        resourceModifier: {
            multiplier: {
                effects: {
                    spiritual_learning_rate: {
                        A: 0.5,
                        B: 1,
                        type: 0
                    }
                }
            }
        },
        permanentResourceModifier: {
            get_multiplier: () => ({
                effects: {
                    spiritual_learning_rate: {
                        A: 0.02 * gameEffects.getEffectValue('training_social_effects_efficiency'),
                        B: 1,
                        type: 0
                    }
                }
            }),
            effectDeps: ['training_social_effects_efficiency']
        },
        get_cost: () => ({
            'coins': {
                A: 0,
                B: 500000000,
                type: 0
            }
        })
    })

    registerGameSocialEvent('event_scientific_conference', {
        name: 'Scientific Conference',
        description: 'Organize a scientific conference to boost learning rate',
        permanentEffect: 'event_learning_permanent_bonus',
        temporaryEffect: 'mental_training_learning_rate',
        category: 'educational',
        tags: ["training"],
        resourceModifier: {
            multiplier: {
                effects: {
                    mental_training_learning_rate: {
                        A: 0.5,
                        B: 1,
                        type: 0
                    }
                }
            }
        },
        permanentResourceModifier: {
            get_multiplier: () => ({
                effects: {
                    mental_training_learning_rate: {
                        A: 0.02 * gameEffects.getEffectValue('training_social_effects_efficiency'),
                        B: 1,
                        type: 0
                    }
                }
            }),
            effectDeps: ['training_social_effects_efficiency']
        },
        get_cost: () => ({
            'coins': {
                A: 0,
                B: 500000000,
                type: 0
            }
        })
    })

    registerGameSocialEvent('event_art_therapy_sessions', {
        name: 'Art Therapy Sessions',
        description: 'Organize art therapy sessions using red ink to calm participants and boost mental activities learning',
        permanentEffect: 'event_mental_activities_permanent_bonus',
        temporaryEffect: 'mental_activities_learn_rate',
        category: 'educational',
        tags: ["training"],
        unlockCondition: () => {
            return gameResources.isResourceUnlocked('inventory_red_ink')
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    mental_activities_learn_rate: {
                        A: 0.5,
                        B: 1,
                        type: 0
                    }
                }
            }
        },
        permanentResourceModifier: {
            get_multiplier: () => ({
                effects: {
                    mental_activities_learn_rate: {
                        A: 0.02 * gameEffects.getEffectValue('training_social_effects_efficiency'),
                        B: 1,
                        type: 0
                    }
                }
            }),
            effectDeps: ['training_social_effects_efficiency']
        },
        get_cost: () => ({
            'coins': {
                A: 0,
                B: 400000000,
                type: 0
            },
            'inventory_red_ink': {
                A: 100,
                B: 200,
                type: 0
            }
        })
    })

    registerGameSocialEvent('event_self_motivation_art', {
        name: 'Self-Motivation Through Art',
        description: 'Organize group sessions teaching people to visualize their goals using red ink art and use these visualizations as self-motivation tools',
        permanentEffect: 'event_training_efficiency_permanent_bonus',
        temporaryEffect: 'training_social_effects_efficiency',
        category: 'educational',
        tags: ["training"],
        unlockCondition: () => {
            return gameResources.isResourceUnlocked('inventory_red_ink')
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    training_social_effects_efficiency: {
                        A: 0.1,
                        B: 1,
                        type: 0
                    }
                }
            }
        },
        permanentResourceModifier: {
            get_multiplier: () => ({
                effects: {
                    training_social_effects_efficiency: {
                        A: 0.1,
                        B: 1,
                        type: 0
                    }
                }
            }),
            effectDeps: ['training_social_effects_efficiency']
        },
        get_cost: () => ({
            'coins': {
                A: 0,
                B: 500000000,
                type: 0
            },
            'inventory_red_ink': {
                A: 0,
                B: 1000,
                type: 0
            }
        })
    })
} 