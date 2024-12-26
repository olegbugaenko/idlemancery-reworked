import { gameEntity, gameCore, gameEffects } from "game-framework"

export const registerShopItemsStage1 = () => {

    const charismaMod = (attr) => attr > 0 ? 1. / (1. + 0.02*Math.log2(attr*gameEffects.getEffectValue('prices_discount'))) : 1.;

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
                        A: 0.25,
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
        maxLevel: 6,
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


    gameEntity.registerGameEntity('shop_item_panpipe', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Panpipe',
        description: 'Perform some primitive show to improve begging efficiency',
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
                    'begging_efficiency': {
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
                    'clean_stable_efficiency': {
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


    gameEntity.registerGameEntity('shop_item_library_entrance', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Entrance To Library',
        description: 'Invest some coins you have earned into your own development',
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
                B: 200*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 0
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
                B: 250*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
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
                B: 350*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
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
            return gameEntity.getLevel('shop_item_library_entrance') > 0
        },
        attributes: {
            isCollectable: false,
        },
        get_cost: () => ({
            'coins': {
                A: 2.25,
                B: 400*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
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
                B: 1000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 0
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
                B: 750*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
                type: 0
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
                B: 3000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
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
                B: 400000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
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
        description: 'Finally, your knowledge is sufficient to read the title of the book. It appears to contain secrets of ancient magic. Although, you’re not entirely sure you’ll be able to read its contents… Still, your hand reaches for the shelf to take it.',
        level: 0,
        maxLevel: 1,
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_magic_ability',
            level: 120
        }],
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
        name: 'Herbalists Handbook',
        description: 'Learn how to gather seeds and plant different kind of flora near your home. Now you\'ll be able to purchase new furniture for it!',
        level: 0,
        maxLevel: 1,
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_patience',
            level: 250
        }],
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
                B: 2000000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
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
                B: 8000000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
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
                B: 15000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
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
        resourceModifier: {
            income: {
                resources: {
                    'crafting_slots': {
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
                B: 120000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
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
                B: 120000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
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
                B: 6000000*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
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


    gameEntity.registerGameEntity('shop_item_minor_illusion', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Minor Illusion',
        description: 'Learn some better illusion spells.',
        level: 0,
        maxLevel: 1,
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


}