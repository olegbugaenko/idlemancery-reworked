import { gameEntity, gameCore, gameEffects, gameResources } from "game-framework"

export const charismaMod = (attr) => attr > 0 ? 1. / (1. + 0.02*Math.log2(attr*gameEffects.getEffectValue('prices_discount'))) : 1.;

export const registerShopItemsStage1 = () => {


    gameEntity.registerGameEntity('shop_item_hat', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Hat',
        description: 'Purchase a hat to collect more coins from begging and have a bit more place to store them',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return true;
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'begging_efficiency': {
                        A: 0.5,
                        B: 1,
                        type: 0,
                    }
                }
            },
            rawCap: {
                resources: {
                    'coins': {
                        A: 8,
                        B: 0,
                        type: 0,
                    }
                }
            }
        },
        get_cost: () => ({
            'coins': {
                A: 2,
                B: 2*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('shop_item_notebook', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Notebook',
        description: 'Allows you for planning your actions. Unlocks actions list',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_hat') > 0
        },
        attributes: {
            isCollectable: false,
        },
        get_cost: () => ({
            'coins': {
                A: 2,
                B: 5*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 0
            }
        })
    })

    gameEntity.registerGameEntity('shop_item_bag', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Bag',
        description: 'Purchase a bag to store more coins',
        level: 0,
        maxLevel: 4,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_hat') > 0
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            rawCap: {
                resources: {
                    'coins': {
                        A: 10,
                        B: 0,
                        type: 0,
                    }
                }
            }
        },
        get_cost: () => ({
            'coins': {
                A: 10*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                B: 5*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 0
            }
        })
    })

    gameEntity.registerGameEntity('shop_item_slippers', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Repair Slippers',
        description: 'Your slippers are old, but better than nothing. If you repair it, it could make you feel more comfortable and warm',
        level: 0,
        maxLevel: 8,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_hat') > 0
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'walking_learning_rate': {
                        A: 0.25,
                        B: 1,
                        type: 0,
                    }
                }
            }
        },
        get_cost: () => ({
            'coins': {
                A: 1.4,
                B: 5*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            }
        })
    })

    gameEntity.registerGameEntity('shop_item_dairy', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Diary',
        description: 'Use your diary to write up what you have learned everyday. Improves learning rate',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_notebook') > 0
        },
        attributes: {
            isCollectable: false,
        },
        get_cost: () => ({
            'coins': {
                A: 2,
                B: 10*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 0
            }
        }),
        resourceModifier: {
            multiplier: {
                effects: {
                    'learning_rate': {
                        A: 0.2,
                        B: 1,
                        type: 0,
                    }
                }
            }
        },
    })

    gameEntity.registerGameEntity('shop_item_book_of_motivation', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Book of Motivation',
        description: 'Purchase a book that you can read when you have time. Maybe you will find something useful there',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_dairy') > 0
        },
        attributes: {
            isCollectable: false,
        },
        get_cost: () => ({
            'coins': {
                A: 2,
                B: 20*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 0
            }
        }),
    })


    gameEntity.registerGameEntity('shop_item_book_of_math', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Book of Math',
        description: 'Allows you doing some primitive math exercises to train your brain in calculating coins',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_book_of_motivation') > 0
        },
        attributes: {
            isCollectable: false,
        },
        get_cost: () => ({
            'coins': {
                A: 2,
                B: 30*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('shop_item_street_smarts', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Street Smarts',
        description: 'You\'ve learned a few tricks to make every coin count. Increases coins earned from all jobs.',
        level: 0,
        maxLevel: 3,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_bag') > 0
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                resources: {
                    'coins': {
                        A: 0.1,
                        B: 1,
                        type: 0,
                    }
                }
            }
        },
        get_cost: () => ({
            'coins': {
                A: 2,
                B: 10*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('shop_item_panpipe', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Panpipe',
        description: 'Perform some primitive show to improve social jobs efficiency',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_bag') > 1
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'job_efficiency_social': {
                        A: 0.2,
                        B: 1,
                        type: 0,
                    }
                }
            }
        },
        get_cost: () => ({
            'coins': {
                A: 2,
                B: 25*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 0
            }
        }),
    })


    gameEntity.registerGameEntity('shop_item_warm_gloves', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Warm Gloves',
        description: 'With these gloves, even chilly mornings can\'t stop your dedication. Makes routine work feel a little easier.',
        level: 0,
        maxLevel: 5,
        unlockedBy: [{
           type: 'entity',
           id: 'action_home_errands',
           level: 5
        }],
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'routine_actions_discount': {
                        A: 0.2,
                        B: 1,
                        type: 0,
                    }
                }
            }
        },
        get_cost: () => ({
            'coins': {
                A: 2,
                B: 500*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1,
            }
        }),
    })

    gameEntity.registerGameEntity('shop_item_storage_arrangement', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Storage Arrangement',
        description: 'You convinced the shopkeeper to let you store some of your items in their storeroom. That frees up some space at home.',
        level: 0,
        maxLevel: 1,
        unlockedBy: [{ type: 'effect', id: 'attribute_charisma', level: 25 }],
        attributes: {
            isCollectable: false,
        },
        get_cost: () => ({
            coins: {
                A: 1,
                B: 1000 * charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 0
            }
        }),
        resourceModifier: {
            get_income: () => ({
                resources: {
                    'living_space': { A: 2, B: 0, type: 0 }
                }
            }),
            get_rawCap: () => ({
                resources: {
                    'coins': { A: 250, B: 0, type: 0 },
                },
            })
        },
        unlockCondition: () => gameEntity.getLevel('shop_item_tent') > 0
    });

    gameEntity.registerGameEntity('shop_item_training_weights', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Training Weights',
        description: 'Specially balanced weights that improve the efficiency of physical training sessions.',
        level: 0,
        maxLevel: 5,
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_strength',
            level: 25
        }],
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'physical_training_learn_speed': {
                        A: 0.1,
                        B: 1,
                        type: 0,
                    }
                }
            }
        },
        get_cost: () => ({
            'coins': {
                A: 2,
                B: 600*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1,
            }
        }),
    })


    gameEntity.registerGameEntity('shop_item_introductory_textbook', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Introductory Textbook',
        description: 'A well-structured textbook that makes it easier to grasp the basics and learn faster during training.',
        level: 0,
        maxLevel: 5,
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_memory',
            level: 10
        }],
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_notebook') > 0
        },
        attributes: {
            isCollectable: false,
        },
        get_cost: () => ({
            'coins': {
                A: 2,
                B: 1000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1,
            }
        }),
        resourceModifier: {
            multiplier: {
                effects: {
                    'learning_rate': {
                        A: 0.1,
                        B: 1,
                        type: 0,
                    }
                }
            }
        },
    })

    gameEntity.registerGameEntity('shop_item_shovel', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Shovel',
        description: 'Primitive tool to increase your working at stable efficiency',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_bag') > 1 && gameEntity.getLevel('action_clean_stable') > 1
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'job_efficiency_physical': {
                        A: 0.2,
                        B: 1,
                        type: 0,
                    }
                }
            }
        },
        get_cost: () => ({
            'coins': {
                A: 2,
                B: 30*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 0
            }
        }),
    })



    gameEntity.registerGameEntity('shop_item_better_tools', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Tools',
        description: 'Purchase better tools, improve your performance at any job. Increase coins income',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_shovel') > 0
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                resources: {
                    'coins': {
                        A: 0.1,
                        B: 1,
                        type: 0,
                    }
                }
            }
        },
        get_cost: () => ({
            'coins': {
                A: 2,
                B: 125*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 0
            }
        }),
    })



    gameEntity.registerGameEntity('shop_item_backpack', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Backpack',
        description: 'Unlocks inventory and items',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_bag') > 1
        },
        attributes: {
            isCollectable: false,
        },
        get_cost: () => ({
            'coins': {
                A: 2,
                B: 30*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('shop_item_map', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Map',
        description: 'Purchase map to unlock gathering',
        level: 0,
        maxLevel: 1,
        unlockedBy: [{
           type: 'effect',
           id: 'attribute_patience',
           level: 50,
        }],
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0
        },
        attributes: {
            isCollectable: false,
        },
        get_cost: () => ({
            'coins': {
                A: 2,
                B: 5000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('shop_item_optimized_storage', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Optimized Storage',
        description: 'Free some space for more coins storage',
        level: 0,
        maxLevel: 10,
        unlockedBy: [{
            type: 'entity',
            id: 'action_home_errands',
            level: 75,
        }],
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            get_rawCap: () => ({
                resources: {
                    coins: {
                        A: 250,
                        B: 0,
                        type: 0,
                    }
                }
            })
        },
        get_cost: () => ({
            'coins': {
                A: 1.25,
                B: 10000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            }
        }),
    })

    gameEntity.registerGameEntity('shop_item_tent', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Tent',
        description: 'Purchase your very first living property. Not really comfortable, but better than nothing',
        level: 0,
        maxLevel: 5,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_bag') > 2
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            income: {
                resources: {
                    'living_space': {
                        A: 2,
                        B: 3,
                        type: 0,
                    }
                }
            },
            get_capMult: () => ({
                resources: {
                    coins: {
                        A: 0,
                        B: gameEffects.getEffectValue('coins_cap_bonus'),
                        type: 0,
                    }
                }
            }),
            effectDeps: ['coins_cap_bonus']
        },
        get_cost: () => ({
            'coins': {
                A: 2.25,
                B: 40*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            }
        }),
    })

    gameEntity.registerGameEntity('shop_item_better_urns', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Better Urns',
        description: 'Purchase better urns to increase their capacity',
        level: 0,
        maxLevel: 3,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_tent') > 0
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'urn_storage_bonus': {
                        A: 0.5,
                        B: 1,
                        type: 0,
                    }
                }
            }
        },
        get_cost: () => ({
            'coins': {
                A: 2.25,
                B: 120*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            }
        }),
    })

    gameEntity.registerGameEntity('shop_item_planner', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Planner',
        description: 'Purchase planner to allow better tasks management. Unlocks action lists, sell & consume items and others automations',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_tent') > 0
        },
        attributes: {
            isCollectable: false,
        },
        get_cost: () => ({
            'coins': {
                A: 2.25,
                B: 4000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            }
        }),
    })


    gameEntity.registerGameEntity('shop_item_library_entrance', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Entrance To Library',
        description: 'Invest some coins you have earned into your own development',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_tent') > 2
        },
        attributes: {
            isCollectable: false,
        },
        get_cost: () => ({
            'coins': {
                A: 2,
                B: 300*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('shop_item_purchase_manager', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Purchase Manager',
        description: 'An efficient tool that automates the process of buying upgrades in the shop.',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_tent') > 0
        },
        attributes: {
            isCollectable: false,
        },
        get_cost: () => ({
            'coins': {
                A: 2,
                B: 2000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('shop_item_aspects_focus', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Focused Activity',
        description: 'Stop making things in regular way. Unlock way to control effort put on every aspect, allowing to use more resources to boost your actions output',
        level: 0,
        maxLevel: 1,
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_patience',
            level: 25,
        }],
        unlockCondition: () => {
            return true
        },
        attributes: {
            isCollectable: false,
        },
        get_cost: () => ({
            'coins': {
                A: 2,
                B: 5000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 0
            }
        }),
    })


    gameEntity.registerGameEntity('shop_item_financial_education', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Financial Education',
        description: 'Improves your understanding of wealth management, allowing you to handle coins more efficiently.',
        level: 0,
        maxLevel: 5,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_library_entrance') > 0
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                resources: {
                    'coins': {
                        A: 0.2,
                        B: 1,
                        type: 0,
                    }
                }
            }
        },
        get_cost: () => ({
            'knowledge': {
                A: 1.5,
                B: 2*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            },
            'coins': {
                A: 1.5,
                B: 300*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            }
        }),
    })

    gameEntity.registerGameEntity('shop_item_anatomy_book', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Anatomy Book',
        description: 'Purchase book that can improve your understanding of your body',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_library_entrance') > 0
        },
        attributes: {
            isCollectable: false,
        },
        get_cost: () => ({
            'knowledge': {
                A: 2,
                B: 5*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 0
            },
            'coins': {
                A: 2,
                B: 750*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('shop_item_glasses', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Glasses',
        description: 'Purchase glasses to read better and gather knowledge faster',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_library_entrance') > 0
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'read_books_efficiency': {
                        A: 0.5,
                        B: 1,
                        type: 0,
                    }
                }
            }
        },
        get_cost: () => ({
            'coins': {
                A: 2,
                B: 450*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('shop_item_yoga_manual', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Yoga Manual',
        description: 'Purchase yoga manual to train your patience and improve gathering and routine tasks performance',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_library_entrance') > 0 && gameEntity.getLevel('shop_item_handbook') > 0
        },
        attributes: {
            isCollectable: false,
        },
        get_cost: () => ({
            'coins': {
                A: 2.25,
                B: 1400*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            }
        }),
    })

    gameEntity.registerGameEntity('shop_item_vocabulary', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Vocabulary',
        description: 'Most of books are written in old and obscure languages. Purchase vocabulary and start learning languages to make your book reading more efficient',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_library_entrance') > 0
        },
        attributes: {
            isCollectable: false,
        },
        get_cost: () => ({
            'knowledge': {
                A: 2,
                B: 10*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 0
            },
            'coins': {
                A: 2,
                B: 1500*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('shop_item_linguistic_practices', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Private Linguistic Lessons',
        description: 'An old librarian offers to share advanced techniques for translating forgotten and obscure languages — for a modest fee, naturally.',
        level: 0,
        maxLevel: 1,
        unlockedBy: [{
            type: 'entity',
            id: 'action_learn_languages',
            level: 5
        }],
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_vocabulary') > 0
        },
        attributes: {
            isCollectable: false,
        },
        get_cost: () => ({
            'knowledge': {
                A: 2,
                B: 20*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 0
            },
            'coins': {
                A: 2,
                B: 1600*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('shop_item_body_tempering', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Body Tempering Course',
        description: 'You enroll in a four-day course led by a rugged survivalist. Through exposure to cold, fasting, and controlled discomfort, you train your body to stay calm and energized in any condition.',
        level: 0,
        maxLevel: 4,
        unlockedBy: [{
            type: 'entity',
            id: 'action_endurance_training',
            level: 25
        }],
        unlockCondition: () => {
            return gameEntity.isEntityUnlocked('action_pushup')
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                resources: {
                    energy: {
                        A: 0.05,
                        B: 1,
                        type: 0,
                    }
                }
            }
        },
        get_cost: () => ({
            'health': {
                A: 5,
                B: 15*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 0
            },
            'coins': {
                A: 2,
                B: 800*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            }
        }),
    })

    gameEntity.registerGameEntity('shop_item_handbook', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Handbook',
        description: 'Contains useful information regarding ancient civilizations languages.',
        level: 0,
        maxLevel: 4,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_vocabulary') > 0
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                resources: {
                    'knowledge': {
                        A: 0.25,
                        B: 1,
                        type: 0,
                    }
                }
            }
        },
        get_cost: () => ({
            'knowledge': {
                A: 1.5,
                B: 20*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            },
            'coins': {
                A: 1.5,
                B: 1250*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            }
        }),
    })

    gameEntity.registerGameEntity('shop_item_harvest_gloves', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Harvest Gloves',
        description: 'Purchase equipment improving your herbs harvesting efficiency',
        level: 0,
        maxLevel: 1,
        minDemoVersion: 20,
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_patience',
            level: 125,
        }],
        unlockCondition: () => {
            return true
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'gathering_perception': {
                        A: 0.25,
                        B: 1,
                        type: 0
                    },
                    'gathering_herbs_amount': {
                        A: 0.25,
                        B: 1,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'coins': {
                A: 2,
                B: 150000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 0
            }
        }),
    })


    gameEntity.registerGameEntity('shop_item_spellbook', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Spellbook',
        description: 'Contains some basic magic knowledge.',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_vocabulary') > 0
        },
        attributes: {
            isCollectable: false,
        },
        get_cost: () => ({
            'knowledge': {
                A: 1.5,
                B: 40*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            },
            'coins': {
                A: 1.5,
                B: 2500*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            }
        }),
    })


    gameEntity.registerGameEntity('shop_item_magic_accessories_access', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Magic Accessories Access',
        description: 'After a long argument with the shopkeeper about being a real mage, you accidentally cast a spell during your demonstration. The resulting tornado scattered books everywhere, but now the shopkeeper is afraid of you and lets you access the magical accessories section.',
        level: 0,
        maxLevel: 1,
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_magic_ability',
            level: 100,
        }],
        unlockCondition: () => {
            return gameEffects.getEffectValue('attribute_magic_ability') >= 100
        },
        attributes: {
            isCollectable: false,
        },
        get_cost: () => ({
            'coins': {
                A: 2.0,
                B: 250000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            },
            'mana': {
                A: 1.0,
                B: 40,
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('shop_item_magical_gloves', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Magical Gloves',
        description: 'Enchanted gloves that enhance your gathering abilities with magical assistance.',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_magic_accessories_access') > 0
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            get_multiplier: () => ({
                resources: {
                    'gathering_effort': { A: 0.25, B: 1, type: 0 }
                }
            })
        },
        get_cost: () => ({
            'coins': {
                A: 2.0,
                B: 500000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            },
            'mana': {
                A: 1.0,
                B: 50,
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('shop_item_magical_chisel', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Magical Chisel',
        description: 'A precision tool enhanced with magical properties that improves your crafting efficiency.',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_magic_accessories_access') > 0
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'crafting_effort': {
                        A: 0.25,
                        B: 1,
                        type: 0,
                    }
                }
            }
        },
        get_cost: () => ({
            'coins': {
                A: 2.0,
                B: 500000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            },
            'mana': {
                A: 1.0,
                B: 70,
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('shop_item_magical_yoga_mat', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Magical Yoga Mat',
        description: 'A specially enchanted mat that enhances your yoga practice and learning speed.',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_magic_accessories_access') > 0
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'yoga_learn_speed': {
                        A: 0.5,
                        B: 1,
                        type: 0,
                    }
                }
            }
        },
        get_cost: () => ({
            'coins': {
                A: 2.0,
                B: 1000000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            },
            'mana': {
                A: 1.0,
                B: 100,
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('shop_item_magical_flask', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Magical Flask',
        description: 'An enchanted flask that enhances your alchemy work with magical properties.',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_magic_accessories_access') > 0
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'alchemy_effort': {
                        A: 0.25,
                        B: 1,
                        type: 0,
                    }
                }
            }
        },
        get_cost: () => ({
            'coins': {
                A: 2.0,
                B: 500000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            },
            'mana': {
                A: 1.0,
                B: 100,
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('shop_item_magical_garden_tools', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Magical Garden Tools',
        description: 'Enchanted tools specifically designed for magical plant care and cultivation.',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_magic_accessories_access') > 0 && 
                   gameEntity.getLevel('shop_item_herbalists_handbook') > 0
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'plantations_efficiency': {
                        A: 0.25,
                        B: 1,
                        type: 0,
                    }
                }
            }
        },
        get_cost: () => ({
            'coins': {
                A: 2.0,
                B: 2000000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            },
            'mana': {
                A: 1.0,
                B: 200,
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('shop_item_magical_hatchet', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Magical Hatchet',
        description: 'An enchanted hatchet that enhances your crafting capabilities with magical precision.',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_magic_accessories_access') > 0 && 
                   gameEntity.isEntityUnlocked('action_mining')
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'crafting_effort': {
                        A: 0.20,
                        B: 1,
                        type: 0,
                    }
                }
            }
        },
        get_cost: () => ({
            'coins': {
                A: 2.0,
                B: 8000000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            },
            'mana': {
                A: 1.0,
                B: 300,
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('shop_item_enchanted_knife', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Enchanted Knife',
        description: 'A magically enhanced knife that improves your gathering perception and precision.',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_magic_accessories_access') > 0
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'gathering_herbs_amount': {
                        A: 0.2,
                        B: 1,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'coins': {
                A: 2.0,
                B: 10000000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            },
            'mana': {
                A: 1.0,
                B: 250,
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('shop_item_enchanted_scissors', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Enchanted Scissors',
        description: 'Magically enhanced scissors specifically designed for paper crafting and enchanted paper production.',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_magic_accessories_access') > 0 && 
                   gameEntity.getLevel('shop_item_paper_working') > 0
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                resources: {
                    'inventory_paper': {
                        A: 0.2,
                        B: 1,
                        type: 0,
                    },
                    'inventory_enchanted_paper': {
                        A: 0.2,
                        B: 1,
                        type: 0,
                    }
                }
            }
        },
        get_cost: () => ({
            'coins': {
                A: 2.0,
                B: 10000000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            },
            'mana': {
                A: 1.0,
                B: 400,
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('shop_item_magical_compass', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Magical Compass',
        description: 'A mystical compass that resonates with anomalies and relics, increasing the amount of resources found during expeditions by 25%.',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.isEntityUnlocked('action_expedition')
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'expedition_resource_amount': {
                        A: 0.25,
                        B: 1,
                        type: 0,
                    }
                }
            }
        },
        get_cost: () => ({
            'coins': {
                A: 2.0,
                B: 100000000000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            },
            'mana': {
                A: 1.0,
                B: 100000,
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('shop_item_knife', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Knife',
        description: 'Its barely a good weapon, but it can be used to cut things you found more efficiently',
        level: 0,
        maxLevel: 1,
        unlockedBy: [{
            type: 'entity',
            id: 'action_gather_carefully',
            level: 2,
        }],
        unlockCondition: () => {
            return true;
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'gathering_efficiency': {
                        A: 0.25,
                        B: 1,
                        type: 0,
                    }
                }
            }
        },
        get_cost: () => ({
            'coins': {
                A: 2,
                B: 5000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('shop_item_gathering_equipment', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Gathering Equipment',
        description: 'Purchase Basic Gathering equipment to increase probability of finding regular items and herbs',
        level: 0,
        maxLevel: 4,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_knife');
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'gathering_low_chance': {
                        A: 0.125,
                        B: 1,
                        type: 0,
                    }
                }
            }
        },
        get_cost: () => ({
            'coins': {
                A: 2,
                B: 7500*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            }
        }),
    })

    gameEntity.registerGameEntity('shop_item_herbs_handbook_1', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Herbs Handbook I',
        description: 'Learn new herbs and their effects',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_knife') > 0
        },
        attributes: {
            isCollectable: false,
        },
        get_cost: () => ({
            'coins': {
                A: 2,
                B: 4000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('shop_item_herbs_handbook_2', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Herbs Handbook II',
        description: 'Learn more sophisticated and rare herbs',
        level: 0,
        maxLevel: 1,
        minDemoVersion: 20,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_herbs_handbook_1') > 0
                && gameEntity.getLevel('shop_item_alchemy_courses') > 0
        },
        attributes: {
            isCollectable: false,
        },
        get_cost: () => ({
            'coins': {
                A: 2,
                B: 300000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 0
            }
        }),
    })


    gameEntity.registerGameEntity('shop_item_herbs_handbook_3', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Herbs Handbook III',
        description: 'Learn even better recipes based on more rare plants',
        level: 0,
        maxLevel: 1,
        minDemoVersion: 20,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_herbs_handbook_2') > 0
                && gameEntity.getLevel('shop_item_alchemy_courses') > 0
        },
        attributes: {
            isCollectable: false,
        },
        get_cost: () => ({
            'coins': {
                A: 2,
                B: 100000000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 0
            }
        }),
    })


    gameEntity.registerGameEntity('shop_item_storeroom', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Storeroom',
        description: 'Purchase bigger storeroom to store your goods',
        level: 0,
        maxLevel: 3,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_tent') > 4
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            income: {
                resources: {
                    'living_space': {
                        A: 5,
                        B: 0,
                        type: 0,
                    }
                }
            },
            effectDeps: ['coins_cap_bonus']
        },
        get_cost: () => ({
            'coins': {
                A: 2.25,
                B: 1250*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            }
        }),
    })


    gameEntity.registerGameEntity('shop_item_meditation', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Meditation Book',
        description: 'Learn how to meditate to increase your magic abilities.',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_spellbook') > 0
        },
        attributes: {
            isCollectable: false,
        },
        get_cost: () => ({
            'knowledge': {
                A: 1.5,
                B: 60*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            },
            'coins': {
                A: 1.5,
                B: 5000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            }
        }),
    })


    gameEntity.registerGameEntity('shop_item_less_restoration', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Lesser Restoration',
        description: 'Learn some basic restoration spells.',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_meditation') > 0
        },
        attributes: {
            isCollectable: false,
        },
        get_cost: () => ({
            'knowledge': {
                A: 1.5,
                B: 90*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            },
            'coins': {
                A: 1.5,
                B: 8000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            }
        }),
    })

    gameEntity.registerGameEntity('shop_item_less_illusion', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Lesser Illusion',
        description: 'Learn some basic illusion spells.',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_meditation') > 0
        },
        attributes: {
            isCollectable: false,
        },
        get_cost: () => ({
            'knowledge': {
                A: 1.5,
                B: 90*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            },
            'coins': {
                A: 1.5,
                B: 8000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            }
        }),
    })

    gameEntity.registerGameEntity('shop_item_spellcraft', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Spellcraft',
        description: 'Learn how to improve your spells by analyzing your mistakes and earning experience. Spells now can be leveled',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_meditation') > 0
        },
        attributes: {
            isCollectable: false,
        },
        get_cost: () => ({
            'knowledge': {
                A: 1.5,
                B: 120*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            },
            'coins': {
                A: 1.5,
                B: 15000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            }
        }),
    })


    gameEntity.registerGameEntity('shop_item_magic_training', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Magic Training Book',
        description: 'Reveal the secrets of magic flowing through your body by learning new practices of training your magic capability',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_spellcraft') > 0
        },
        attributes: {
            isCollectable: false,
        },
        get_cost: () => ({
            'knowledge': {
                A: 1.5,
                B: 160*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            },
            'coins': {
                A: 1.5,
                B: 60000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            }
        }),
    })


    gameEntity.registerGameEntity('shop_item_spiritualism', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Spiritualism Book',
        description: 'Unlocks way to improve your spiritual activities by consuming magic knowledge. Also, unlocks new furniture',
        level: 0,
        maxLevel: 1,
        minDemoVersion: 20,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_spellcraft') > 0
        },
        attributes: {
            isCollectable: false,
        },
        get_cost: () => ({
            'knowledge': {
                A: 1.5,
                B: 180*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            },
            'coins': {
                A: 1.5,
                B: 110000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            }
        }),
    })


    gameEntity.registerGameEntity('shop_item_mages_handbook', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Apprentice Handbook',
        description: 'Finally, your knowledge is sufficient to read the title of the book. It appears to contain secrets of ancient magic. Although, you\'re not entirely sure you\'ll be able to read its contents… Still, your hand reaches for the shelf to take it.',
        level: 0,
        maxLevel: 1,
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_magic_ability',
            level: 120
        }],
        minDemoVersion: 20,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_spiritualism') > 0
        },
        attributes: {
            isCollectable: false,
        },
        get_cost: () => ({
            'knowledge': {
                A: 1.5,
                B: 500*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            },
            'coins': {
                A: 1.5,
                B: 2000000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            }
        }),
    })


    gameEntity.registerGameEntity('shop_item_herbalists_handbook', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Herbs Growing Handbook',
        description: 'Learn how to gather seeds and plant different kind of flora near your home. Now you\'ll be able to purchase new furniture for it!',
        level: 0,
        maxLevel: 1,
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_patience',
            level: 250
        }],
        minDemoVersion: 20,
        unlockCondition: () => {
            return true
        },
        attributes: {
            isCollectable: false,
        },
        get_cost: () => ({
            'knowledge': {
                A: 1.5,
                B: 500*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            },
            'coins': {
                A: 1.5,
                B: 1000000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            }
        }),
    })


    gameEntity.registerGameEntity('shop_item_soil_manual', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Soil Types Handbook',
        description: 'Learn more about soil types that might be suitable for your plants. Increase plantations efficiency and unlock new furniture',
        level: 0,
        maxLevel: 1,
        minDemoVersion: 20,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_herbalists_handbook') > 0
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    plantations_efficiency: {
                        A: 0.25,
                        B: 1,
                        type: 0,
                    }
                }
            }
        },
        get_cost: () => ({
            'knowledge': {
                A: 1.5,
                B: 800*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            },
            'coins': {
                A: 1.5,
                B: 2000000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            }
        }),
    })


    gameEntity.registerGameEntity('shop_item_better_stashes', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Better Stashes',
        description: 'Purchase better stashes to increase coins capacity even more',
        level: 0,
        maxLevel: 5,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_storeroom') > 1
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'urn_storage_bonus': {
                        A: 0.5,
                        B: 1,
                        type: 0,
                    }
                }
            }
        },
        get_cost: () => ({
            'coins': {
                A: 2.25,
                B: 3000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            }
        }),
    })

    gameEntity.registerGameEntity('shop_item_pottery_secrets_handbook', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Pottery Secrets Handbook',
        description: 'Learn the ancient art of pottery making. Unlocks the ability to craft pots and build pottery cellars.',
        level: 0,
        maxLevel: 1,
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_strength',
            level: 10000,
        }],
        unlockCondition: () => {
            return gameEffects.getEffectValue('attribute_strength') >= 10000
        },
        attributes: {
            isCollectable: false,
        },
        get_cost: () => ({
            'coins': {
                A: 2.0,
                B: 30000000000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            },
            'knowledge': {
                A: 1.5,
                B: 300000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            }
        }),
    })


    gameEntity.registerGameEntity('shop_item_land', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Purchase Land',
        description: 'Purchase some land for even more space',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_storeroom') > 2
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            income: {
                resources: {
                    'living_space': {
                        A: 5,
                        B: 0,
                        type: 0,
                    }
                }
            },
            effectDeps: ['coins_cap_bonus']
        },
        get_cost: () => ({
            'coins': {
                A: 1.3,
                B: 15000*charismaMod(gameEffects.getEffectValue('attribute_charisma'))/gameEffects.getEffectValue('land_purchase_discount'),
                type: 1
            }
        }),
    })


    gameEntity.registerGameEntity('shop_item_crafting_courses', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Crafting Courses',
        description: 'Unlocks crafting and materials processing',
        level: 0,
        maxLevel: 1,
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_strength',
            level: 100,
        }],
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0 && gameEffects.getEffectValue('attribute_strength') >= 100
            //||  gameEntity.getLevel('shop_item_conjuration_magic') > 0
        },
        attributes: {
            isCollectable: false,
        },
        get_cost: () => ({
            'coins': {
                A: 2.25,
                B: 100000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            }
        }),
    })

    gameEntity.registerGameEntity('shop_item_weird_painting', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Weird Painting',
        description: 'You not sure what is painted here, but it makes you feeling more motivated',
        level: 0,
        maxLevel: 1,
        minDemoVersion: 20,
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_memory',
            level: 50,
        }],
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0;
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'learning_rate': {
                        A: 0.1,
                        B: 1,
                        type: 0,
                    }
                }
            }
        },
        get_cost: () => ({
            'coins': {
                A: 2.25,
                B: 200000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            }
        }),
    })

    gameEntity.registerGameEntity('shop_item_stone_hammer', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Stone Hammer',
        description: 'Cheap, but still useful tool to improve your crafting intensity',
        level: 0,
        maxLevel: 1,
        minDemoVersion: 10,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_crafting_courses') > 0
            //||  gameEntity.getLevel('shop_item_conjuration_magic') > 0
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'crafting_effort': {
                        A: 0.25,
                        B: 1,
                        type: 0,
                    }
                }
            }
        },
        get_cost: () => ({
            'coins': {
                A: 2.25,
                B: 150000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            }
        }),
    })

    gameEntity.registerGameEntity('shop_item_stone_clamp', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Stone Clamp',
        description: 'A primitive tool made of stone and rope, allowing both hands to focus on crafting. Greatly boosts crafting intensity, though a bit more exhausting.',
        level: 0,
        maxLevel: 1,
        minDemoVersion: 10,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_crafting_courses') > 0;
        },
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_strength',
            level: 150,
        }],
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'crafting_effort': {
                        A: 0.2,
                        B: 1,
                        type: 0,
                    },
                }
            }
        },
        get_cost: () => ({
            'coins': {
                A: 2.25,
                B: 300000 * charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            }
        }),
    });

    gameEntity.registerGameEntity('shop_item_constructing', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Construction Courses',
        description: 'Learn how to construct some primitive buildings from your resources',
        level: 0,
        maxLevel: 1,
        minDemoVersion: 10,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_crafting_courses') > 0
            //||  gameEntity.getLevel('shop_item_conjuration_magic') > 0
        },
        attributes: {
            isCollectable: false,
        },
        get_cost: () => ({
            'coins': {
                A: 2.25,
                B: 300000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            }
        }),
    })


    gameEntity.registerGameEntity('shop_item_rusty_axe', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Rusty Axe',
        description: 'Old, rusty and heavy axe.',
        level: 0,
        maxLevel: 1,
        minDemoVersion: 10,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_crafting_courses') > 0
            //||  gameEntity.getLevel('shop_item_conjuration_magic') > 0
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'manual_labor_efficiency': {
                        A: 0.25,
                        B: 1,
                        type: 0,
                    }
                },
            },
        },
        get_cost: () => ({
            'coins': {
                A: 2.25,
                B: 150000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            }
        }),
    })

    gameEntity.registerGameEntity('shop_item_advanced_crafting_tools', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Advanced Crafting Tools',
        description: 'High-quality tools that significantly improve your crafting efficiency',
        level: 0,
        maxLevel: 5,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_constructing') > 0
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'crafting_effort': {
                        A: 0.2,
                        B: 1,
                        type: 0,
                    }
                },
            },
        },
        get_cost: () => ({
            'coins': {
                A: 2.0,
                B: 250000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            }
        }),
    })

    gameEntity.registerGameEntity('shop_item_iron_hammer', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Iron Hammer',
        description: 'A sturdy iron hammer that enhances your crafting capabilities',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.isEntityUnlocked('action_mining')
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'crafting_effort': {
                        A: 0.25,
                        B: 1,
                        type: 0,
                    }
                },
            },
        },
        get_cost: () => ({
            'coins': {
                A: 2.25,
                B: 3000000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            }
        }),
    })

    gameEntity.registerGameEntity('shop_item_alchemy_courses', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Alchemy Courses',
        description: 'Learn how to create useful potions from your herbs and other ingredients',
        level: 0,
        maxLevel: 1,
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_patience',
            level: 100,
        }],
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0 && gameEffects.getEffectValue('attribute_patience') >= 100
            //||  gameEntity.getLevel('shop_item_conjuration_magic') > 0
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            income: {
                resources: {
                    'alchemy_slots': {
                        A: 1,
                        B: 0,
                        type: 0,
                    }
                }
            }
        },
        get_cost: () => ({
            'coins': {
                A: 2.25,
                B: 100000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            }
        }),
    })


    gameEntity.registerGameEntity('shop_item_paper_working', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Paper Working',
        description: 'Unlocks new resource',
        level: 0,
        maxLevel: 1,
        minDemoVersion: 20,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0 && gameEntity.getLevel('shop_item_crafting_courses') > 0
            //||  gameEntity.getLevel('shop_item_conjuration_magic') > 0
        },
        attributes: {
            isCollectable: false,
        },
        get_cost: () => ({
            'coins': {
                A: 2.25,
                B: 5500000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            }
        }),
    })


    gameEntity.registerGameEntity('shop_item_metaphysics_handbook', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Metaphysics Book',
        description: 'Learn new ways of boosting your mental stats using improved meditative practices',
        level: 0,
        maxLevel: 1,
        minDemoVersion: 20,
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_magic_ability',
            level: 275
        }],
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_mages_handbook') > 0
        },
        attributes: {
            isCollectable: false,
        },
        get_cost: () => ({
            'knowledge': {
                A: 1.5,
                B: 1300*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            },
            'coins': {
                A: 1.5,
                B: 11000000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            }
        }),
    })


    gameEntity.registerGameEntity('shop_item_paper_enhance', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Paper Enhancement',
        description: 'Learn new ways of doing cool stuff from your papers',
        level: 0,
        maxLevel: 1,
        minDemoVersion: 20,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0 && gameEntity.getLevel('shop_item_paper_working') > 0
            //||  gameEntity.getLevel('shop_item_conjuration_magic') > 0
        },
        attributes: {
            isCollectable: false,
        },
        get_cost: () => ({
            'coins': {
                A: 2.25,
                B: 30000000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            }
        }),
    })

    gameEntity.registerGameEntity('shop_item_paper_cutting', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Paper Cutting',
        description: 'Invent much more complicated but efficient mechanisms of making paper and paper goods',
        level: 0,
        maxLevel: 1,
        minDemoVersion: 20,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0 && gameEntity.getLevel('shop_item_paper_enhance') > 0
            //||  gameEntity.getLevel('shop_item_conjuration_magic') > 0
        },
        attributes: {
            isCollectable: false,
        },
        get_cost: () => ({
            'coins': {
                A: 2.25,
                B: 5.e+10*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            }
        }),
    })


    gameEntity.registerGameEntity('shop_item_minor_illusion', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Minor Illusion',
        description: 'Learn some better illusion spells.',
        level: 0,
        maxLevel: 1,
        minDemoVersion: 20,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_less_illusion') > 0
        },
        attributes: {
            isCollectable: false,
        },
        get_cost: () => ({
            'knowledge': {
                A: 1.5,
                B: 9000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            },
            'coins': {
                A: 1.5,
                B: 40000000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            }
        }),
    })


    gameEntity.registerGameEntity('shop_item_minor_restoration', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Minor Restoration',
        description: 'Learn some better restoration spells.',
        level: 0,
        maxLevel: 1,
        minDemoVersion: 20,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_less_restoration') > 0
        },
        attributes: {
            isCollectable: false,
        },
        get_cost: () => ({
            'knowledge': {
                A: 1.5,
                B: 9000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            },
            'coins': {
                A: 1.5,
                B: 40000000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            }
        }),
    })


    gameEntity.registerGameEntity('shop_item_geography_book', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Geography Basics Book',
        description: 'Learn basic geography course for better understanding where to search for resources',
        level: 0,
        maxLevel: 1,
        minDemoVersion: 20,
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_patience',
            level: 1250
        }],
        unlockCondition: () => {
            return true
        },
        attributes: {
            isCollectable: false,
        },
        get_cost: () => ({
            'coins': {
                A: 2,
                B: 1.e+8*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('shop_item_training_room', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Training Rooms',
        description: 'Now you know about secret shop, containing a lot of knowledge',
        level: 0,
        maxLevel: 1,
        minDemoVersion: 20,
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_patience',
            level: 1500
        }],
        unlockCondition: () => {
            return true
        },
        attributes: {
            isCollectable: false,
        },
        get_cost: () => ({
            'coins': {
                A: 2,
                B: 400000000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 0
            }
        })
    })

    // gameEntity.registerGameEntity('shop_item_breaking_limits', {
    //     tags: ["shop", "upgrade", "purchaseable"],
    //     name: 'Breaking Limits Instructions',
    //     description: 'Learn how to use maximum of your body and soul. Unlock new intensity courses',
    //     level: 0,
    //     maxLevel: 1,
    //     minDemoVersion: 20,
    //     unlockCondition: () => {
    //         return gameEntity.getLevel('shop_item_training_room') > 0
    //     },
    //     attributes: {
    //         isCollectable: false,
    //     },
    //     get_cost: () => ({
    //         'coins': {
    //             A: 2,
    //             B: 1250000000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
    //             type: 0
    //         }
    //     })
    // })

    gameEntity.registerGameEntity('shop_item_ink_crafting', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Ink Crafting',
        description: 'Learn to craft inks from herbs and algae to create useful accessories like enchanted scrolls and notes.',
        level: 0,
        maxLevel: 1,
        minDemoVersion: 20,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0 && gameEntity.getLevel('shop_item_paper_working') > 0
            //||  gameEntity.getLevel('shop_item_conjuration_magic') > 0
        },
        attributes: {
            isCollectable: false,
        },
        get_cost: () => ({
            'coins': {
                A: 2.25,
                B: 2.e+9*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            }
        }),
    })

    gameEntity.registerGameEntity('shop_item_cartography', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Cartography',
        description: 'Learn how to create new and better maps using magical map fragments.',
        level: 0,
        maxLevel: 5,
        minDemoVersion: 20,
        resourceModifier: {
            income: {
                effects: {
                    max_map_level: {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0 && gameEntity.getLevel('shop_item_ink_crafting') > 0
            //||  gameEntity.getLevel('shop_item_conjuration_magic') > 0
        },
        attributes: {
            isCollectable: false,
        },
        get_cost: () => ({
            'coins': {
                A: 2,
                B: 5.e+9*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            }
        }),
    })

    gameEntity.registerGameEntity('shop_item_better_ink_crafting', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Improved Ink Crafting',
        description: 'Learn recipe of new ink and ways to use it.',
        level: 0,
        maxLevel: 1,
        minDemoVersion: 20,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0 && gameEntity.getLevel('shop_item_ink_crafting') > 0
            //||  gameEntity.getLevel('shop_item_conjuration_magic') > 0
        },
        attributes: {
            isCollectable: false,
        },
        get_cost: () => ({
            'coins': {
                A: 2.25,
                B: 2.e+10*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            }
        }),
    })

    gameEntity.registerGameEntity('shop_item_deep_drilling', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Deep Drilling',
        description: 'Use your water pumps to get better quality of water. Every Water pump level will increase maximum Well level',
        level: 0,
        maxLevel: 1,
        minDemoVersion: 20,
        unlockCondition: () => {
            return gameEntity.getLevel('furniture_waterPump') > 0
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            income: {
                effects: {
                    max_wells_per_water_pump: {
                        A: 2,
                        B: 0,
                        type: 0,
                    }
                }
            }
        },
        get_cost: () => ({
            'coins': {
                A: 2,
                B: 1.e+11*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 0
            }
        })
    })

    gameEntity.registerGameEntity('shop_item_botany_book', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Botany Book',
        description: 'Learn secrets of growing herbs by combining science and magic',
        level: 0,
        maxLevel: 1,
        minDemoVersion: 20,
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_patience',
            level: 7500
        }],
        unlockCondition: () => {
            return true
        },
        attributes: {
            isCollectable: false,
        },
        get_cost: () => ({
            'coins': {
                A: 2,
                B: 6.e+9*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 0
            }
        })
    })

    // Unlock courses reducing crafting and alchemy upkeeps
    gameEntity.registerGameEntity('shop_item_advanced_training', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Advanced Training',
        description: 'Learn best practices from best masters. Unlocks new reductive courses',
        level: 0,
        maxLevel: 1,
        minDemoVersion: 20,
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_patience',
            level: 40000
        }],
        unlockCondition: () => {
            return true
        },
        attributes: {
            isCollectable: false,
        },
        get_cost: () => ({
            'coins': {
                A: 2,
                B: 1.e+12*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 0
            }
        })
    })

/*
    gameEntity.registerGameEntity('shop_item_advanced_cartography', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Advanced Cartography',
        description: 'Further advance your understanding of maps and far expeditions.',
        level: 0,
        maxLevel: 10,
        minDemoVersion: 20,
        resourceModifier: {
            income: {
                effects: {
                    max_map_level: {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_patience',
            level: 60000
        }],
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0 && gameEntity.getLevel('shop_item_cartography') > 0
            //||  gameEntity.getLevel('shop_item_conjuration_magic') > 0
        },
        attributes: {
            isCollectable: false,
        },
        get_cost: () => ({
            'coins': {
                A: 2,
                B: 1.e+12*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            }
        }),
    })

    gameEntity.registerGameEntity('shop_item_advanced_negotiations', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Advanced Negotiations',
        description: 'Further advance your negotiations skills, decreasing land prices.',
        level: 0,
        maxLevel: 5,
        minDemoVersion: 20,
        resourceModifier: {
            multiplier: {
                effects: {
                    land_purchase_discount: {
                        A: 0.5,
                        B: 1,
                        type: 0
                    }
                }
            }
        },
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_patience',
            level: 100000
        }],
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0 && gameEntity.getLevel('shop_item_cartography') > 0
            //||  gameEntity.getLevel('shop_item_conjuration_magic') > 0
        },
        attributes: {
            isCollectable: false,
        },
        get_cost: () => ({
            'coins': {
                A: 2,
                B: 2.e+13*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            }
        }),
    })

    gameEntity.registerGameEntity('shop_item_amber_gathering', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Amber Gathering',
        description: 'Unlock amber gathering on maps. Amber can be used for advanced accessories making.',
        level: 0,
        maxLevel: 1,
        minDemoVersion: 20,
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_patience',
            level: 150000
        }],
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0
        },
        attributes: {
            isCollectable: false,
        },
        get_cost: () => ({
            'coins': {
                A: 2,
                B: 5.e+13*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            }
        }),
    })


    gameEntity.registerGameEntity('shop_item_contemplation_circlet', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Circlet of Contemplation',
        description: 'A simple band worn by those who walk the long path of thought. Each moment spent in stillness sharpens the mind, easing future efforts.',
        level: 0,
        maxLevel: 6,
        minDemoVersion: 20,
        resourceModifier: {
            multiplier: {
                effects: {
                    mental_actions_discount: {
                        A: 0.5,
                        B: 1,
                        type: 0
                    }
                }
            }
        },
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_patience',
            level: 125000
        }],
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0
            //||  gameEntity.getLevel('shop_item_conjuration_magic') > 0
        },
        attributes: {
            isCollectable: false,
        },
        get_cost: () => ({
            'coins': {
                A: 1.25,
                B: 5.e+13*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            }
        }),
    })

    gameEntity.registerGameEntity('shop_item_mystic_cap', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Mystical Cap',
        description: 'A subtle enchantment rests within this cap, easing the mental strain of casting. Slightly reduces the effort required for magical actions.',
        level: 0,
        maxLevel: 6,
        minDemoVersion: 20,
        resourceModifier: {
            multiplier: {
                effects: {
                    magical_actions_discount: {
                        A: 0.5,
                        B: 1,
                        type: 0
                    }
                }
            }
        },
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_patience',
            level: 125000
        }],
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0
            //||  gameEntity.getLevel('shop_item_conjuration_magic') > 0
        },
        attributes: {
            isCollectable: false,
        },
        get_cost: () => ({
            'coins': {
                A: 1.25,
                B: 5.e+13*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            }
        }),
    })
*/
    /*gameEntity.registerGameEntity('shop_item_hunting', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Hunting',
        description: 'Allows you hunting for magic creatures, and get unique loot.',
        level: 0,
        minDemoVersion: 20,
        maxLevel: 1,
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_strength',
            level: 100000
        }],
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_backpack') > 0
        },
        attributes: {
            isCollectable: false,
        },
        get_cost: () => ({
            'coins': {
                A: 2,
                B: 1.e+14*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            }
        }),
    })*/

    gameEntity.registerGameEntity('shop_item_stone_refinement_manual', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Stone Refinement Manual',
        description: 'Learn to extract precious gems from stone, unlocking ruby and sapphire production',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_crafting_courses') > 0 && gameEntity.isEntityUnlocked('action_quarrying')
        },
        attributes: {
            isCollectable: false,
        },
        get_cost: () => ({
            'coins': {
                A: 1,
                B: 1500000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            }
        }),
    })

    gameEntity.registerGameEntity('shop_item_self_organization_book', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Self-Organization Manual',
        description: 'Learn the art of self-organization to increase your coin storage capacity',
        level: 0,
        maxLevel: 1,
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_patience',
            level: 400
        }],
        unlockCondition: () => {
            return gameEffects.getEffectValue('attribute_patience') >= 400
        },
        attributes: {
            isCollectable: false,
        },
        get_cost: () => ({
            'coins': {
                A: 1,
                B: 2500000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            },
            'knowledge': {
                A: 1,
                B: 1000,
                type: 0
            }
        }),
    })

    gameEntity.registerGameEntity('shop_item_quality_mortar', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Quality Mortar & Pestle',
        description: 'A finely crafted mortar and pestle set for grinding ingredients to perfect consistency, improving alchemy efficiency',
        level: 0,
        maxLevel: 1,
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_patience',
            level: 200
        }],
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_alchemy_courses') > 0
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'alchemy_effort': {
                        A: 0.25,
                        B: 1,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'coins': {
                A: 1,
                B: 300000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            }
        }),
    })

    gameEntity.registerGameEntity('shop_item_precision_tools', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Precision Measuring Tools',
        description: 'Exact measuring instruments for perfect ingredient proportions in alchemical recipes',
        level: 0,
        maxLevel: 1,
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_patience',
            level: 500
        }],
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_alchemy_courses') > 0 && gameEntity.getLevel('shop_item_quality_mortar') > 0
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'alchemy_effort': {
                        A: 0.25,
                        B: 1,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'coins': {
                A: 1,
                B: 5000000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            }
        }),
    })

    gameEntity.registerGameEntity('shop_item_saw', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Saw',
        description: 'A quality saw for cutting wood more efficiently, increasing production of all wooden resources',
        level: 0,
        maxLevel: 1,
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_strength',
            level: 250
        }],
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_crafting_courses') > 0
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                resources: {
                    'inventory_refined_wood': {
                        A: 0.2,
                        B: 1,
                        type: 0
                    },
                    'inventory_wooden_beam': {
                        A: 0.2,
                        B: 1,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'coins': {
                A: 1,
                B: 1000000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            }
        }),
    })

    gameEntity.registerGameEntity('shop_item_machinery', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Machinery',
        description: 'Advanced mechanical systems that enable the operation of industrial facilities like the Lumbermill. Unlocks the ability to build and operate large-scale production buildings.',
        level: 0,
        maxLevel: 1,
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_strength',
            level: 1250
        }],
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_constructing') > 0 && gameEntity.getLevel('shop_item_saw') > 0
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'industrial_efficiency': {
                        A: 0.5,
                        B: 1,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'coins': {
                A: 1,
                B: 50000000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            }
        }),
    })

    // Press Technology
    gameEntity.registerGameEntity('shop_item_press_technology', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Press Technology',
        description: 'Mastery of mechanical pressing allows higher throughput for compression and shaping. Unlocks the Press vice furniture.',
        level: 0,
        maxLevel: 1,
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_strength',
            level: 20000,
        }],
        unlockCondition: () => true,
        attributes: { isCollectable: false },
        resourceModifier: {},
        get_cost: () => ({
            'coins': { A: 1, B: 200000000000*charismaMod(gameEffects.getEffectValue('attribute_charisma')), type: 1 }
        }),
    })

    // Automated Mechanisms — unlocks machinery era (future devices tab)
    gameEntity.registerGameEntity('shop_item_automated_mechanisms', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Automated Mechanisms',
        description: 'Blueprints and protocols for autonomous machinery. Opens the path to industrial automation.',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.isEntityUnlocked('action_coal_mining');
        },
        attributes: { isCollectable: false },
        resourceModifier: {},
        get_cost: () => ({
            'coins': { A: 1, B: 500000000000*charismaMod(gameEffects.getEffectValue('attribute_charisma')), type: 1 },
        }),
    })

    // Advanced Conjuration — enables conjuration spells for stone and coal
    gameEntity.registerGameEntity('shop_item_advanced_conjuration', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Advanced Conjuration',
        description: 'Unlocks advanced conjuration practices including conjuring stone and coal.',
        level: 0,
        maxLevel: 1,
        unlockedBy: [{ type: 'effect', id: 'attribute_magic_ability', level: 30000 }],
        unlockCondition: () => true,
        attributes: { isCollectable: false },
        resourceModifier: {},
        get_cost: () => ({
            'coins': { A: 1, B: 500000000000*charismaMod(gameEffects.getEffectValue('attribute_charisma')), type: 1 },
            'knowledge': { A: 1, B: 2000000*charismaMod(gameEffects.getEffectValue('attribute_charisma')), type: 0 },
        }),
    })

    gameEntity.registerGameEntity('shop_item_lumbermill_optimization', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Lumbermill Optimization',
        description: 'Advanced techniques and equipment specifically designed to maximize the efficiency of your lumbermill operations.',
        level: 0,
        maxLevel: 5,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_machinery') > 0
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            income: {
                effects: {
                    'lumbermill_efficiency': {
                        A: 0.2,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'coins': {
                A: 1.2,
                B: 75000000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            }
        }),
    })

    gameEntity.registerGameEntity('shop_item_pickaxe', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Pickaxe',
        description: 'A sturdy iron pickaxe that significantly improves mining efficiency and iron ore production.',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.isEntityUnlocked('action_mining')
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'mining_efficiency': {
                        A: 0.25,
                        B: 1,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'coins': {
                A: 1,
                B: 200000000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            }
        }),
    })

    gameEntity.registerGameEntity('shop_item_steel_pickaxe', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Steel Pickaxe',
        description: 'A high-quality steel pickaxe that provides even greater mining efficiency than the iron pickaxe.',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_pickaxe') > 0
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'mining_efficiency': {
                        A: 0.25,
                        B: 1,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'coins': {
                A: 1,
                B: 500000000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            }
        }),
    })

    gameEntity.registerGameEntity('shop_item_market_license', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Market License',
        description: 'An official license that allows you to build trading structures on your land. Unlocks the ability to construct Trade Stalls and Trade Warehouses.',
        level: 0,
        maxLevel: 1,
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_charisma',
            level: 1250
        }],
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_constructing') > 0
        },
        attributes: {
            isCollectable: false,
        },
        get_cost: () => ({
            'coins': {
                A: 1,
                B: 200000000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            }
        }),
    })

    gameEntity.registerGameEntity('shop_item_gossip_exchange', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Gossip Exchange',
        description: 'A network of information exchange that allows your trade stalls to facilitate social learning and knowledge sharing.',
        level: 0,
        maxLevel: 1,
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_charisma',
            level: 1500
        }],
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_market_license') > 0
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            income: {
                effects: {
                    'trade_stall_social_learning_bonus': {
                        A: 0.1,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'coins': {
                A: 1,
                B: 400000000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            }
        }),
    })

    gameEntity.registerGameEntity('shop_item_book_trading', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Book Trading',
        description: 'A specialized trading license that allows your trade stalls to also trade in books and knowledge, providing bonuses to knowledge gain.',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_market_license') > 0 && gameEntity.getLevel('structure_library') > 0
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            income: {
                effects: {
                    'trade_stall_knowledge_bonus': {
                        A: 0.15,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'coins': {
                A: 1,
                B: 500000000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            }
        }),
    })

    gameEntity.registerGameEntity('shop_item_masonry_technology', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Masonry Technology',
        description: 'Advanced construction techniques that allow you to build more sophisticated stone structures. Increases the maximum level of Stone Hut.',
        level: 0,
        maxLevel: 5,
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_strength',
            level: 1500
        }],
        unlockCondition: () => {
            return gameEntity.getLevel('action_clay_mining') > 0
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            income: {
                effects: {
                    'stone_hut_max_level_bonus': {
                        A: 2,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'coins': {
                A: 1.5,
                B: 300000000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            }
        }),
    })

    gameEntity.registerGameEntity('shop_item_alchemy_materials_discount', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Alchemy Materials Discount',
        description: 'Advanced techniques that reduce the amount of materials needed for alchemy processes.',
        level: 0,
        maxLevel: 5,
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_patience',
            level: 1750
        }],
        unlockCondition: () => {
            return true
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            income: {
                effects: {
                    'alchemy_materials_discount': {
                        A: 0.2,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'coins': {
                A: 1.2,
                B: 400000000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            }
        }),
    })

    gameEntity.registerGameEntity('shop_item_iron_tools', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Iron Tools',
        description: 'Secrets of creating compact and reliable metal products. Now Tool Workshop will also increase the efficiency of Master\'s Table furniture.',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameResources.isResourceUnlocked('inventory_forged_steel')
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            income: {
                effects: {
                    'masters_table_workbench_bonus': {
                        A: 0.2,
                        B: 0,
                        type: 0
                    }
                }
            }
        },
        get_cost: () => ({
            'coins': {
                A: 1,
                B: 15000000000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            }
        }),
    })

    gameEntity.registerGameEntity('shop_item_steel_processing_technology', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Steel Processing Technology',
        description: 'Advanced manual that reveals the secrets of steel processing and industrial techniques. Unlocks metalworking furniture.',
        level: 0,
        maxLevel: 1,
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_strength',
            level: 8000
        }],
        unlockCondition: () => {
            return gameEffects.getEffectValue('attribute_strength') >= 8000
        },
        attributes: {
            isCollectable: false,
        },
        get_cost: () => ({
            'coins': {
                A: 1,
                B: 25000000000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            }
        }),
    })

    gameEntity.registerGameEntity('shop_item_barter_contracts', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Barter Contracts',
        description: 'Establish barter contracts that increase the maximum coin capacity of trade warehouses.',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_pottery_secrets_handbook') > 0
        },
        attributes: {
            isCollectable: false,
        },
        resourceModifier: {
            income: {
                effects: {
                    'trade_warehouse_coins_cap_bonus': {
                        A: 0.1,
                        B: 0,
                        type: 0,
                    }
                }
            }
        },
        get_cost: () => ({
            'coins': {
                A: 2.0,
                B: 45000000000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            },
            'knowledge': {
                A: 1.5,
                B: 450000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            }
        }),
    })

    gameEntity.registerGameEntity('shop_item_advanced_engineering', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Advanced Engineering',
        description: 'Master advanced construction techniques. Unlocks masonry cottage and alchemist laboratory.',
        level: 0,
        maxLevel: 1,
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_strength',
            level: 15000,
        }],
        unlockCondition: () => {
            return gameEffects.getEffectValue('attribute_strength') >= 15000
        },
        attributes: {
            isCollectable: false,
        },
        get_cost: () => ({
            'coins': {
                A: 2.0,
                B: 50000000000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            },
        }),
    })

    gameEntity.registerGameEntity('shop_item_mechanics_guide', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Mechanics Guide',
        description: 'A comprehensive manual detailing the principles of mechanical engineering and maintenance. Unlock the ability to study mechanical systems and improve machinery efficiency.',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return gameResources.isResourceUnlocked('inventory_coal')
        },
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_strength',
            level: 35000,
        }],
        attributes: {
            isCollectable: false,
        },
        get_cost: () => ({
            'coins': {
                A: 2.0,
                B: 500000000000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            },
        }),
    })

    gameEntity.registerGameEntity('shop_item_advanced_alchemy', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Advanced Alchemy',
        description: 'Unlock the secrets of creating even more permanent enhancement flasks that provide lasting benefits to your abilities.',
        level: 0,
        maxLevel: 1,
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_patience',
            level: 35000
        }],
        unlockCondition: () => {
            return gameEffects.getEffectValue('attribute_patience') >= 35000
        },
        attributes: {
            isCollectable: false,
        },
        get_cost: () => ({
            'coins': {
                A: 2.0,
                B: 750000000000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 1
            },
        }),
    })

    // Elemental Resonance — unlocks Earth and Air Resonators
    gameEntity.registerGameEntity('shop_item_elemental_resonance', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Elemental Resonance',
        description: 'Unlocks the ability to create elemental resonators that enhance magical amplifiers.',
        level: 0,
        maxLevel: 1,
        unlockedBy: [{ type: 'effect', id: 'attribute_magic_ability', level: 40000 }],
        unlockCondition: () => true,
        attributes: { isCollectable: false },
        resourceModifier: {},
        get_cost: () => ({
            'inventory_air': { A: 1, B: 20000, type: 1 },
            'inventory_earth': { A: 1, B: 20000, type: 1 },
        }),
    })

    gameEntity.registerGameEntity('shop_item_arcane_sanctum', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Arcane Sanctum',
        description: 'Unlocks the construction of magical buildings: Magic Library and Magic Globe. These structures provide powerful bonuses to artifact scroll efficiency and expedition experience.',
        level: 0,
        maxLevel: 1,
        unlockedBy: [{ type: 'effect', id: 'attribute_magic_ability', level: 50000 }],
        unlockCondition: () => true,
        attributes: { isCollectable: false },
        resourceModifier: {},
        get_cost: () => ({
            'coins': {
                A: 1,
                B: 1.e+12*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 0
            }
        }),
    })


}