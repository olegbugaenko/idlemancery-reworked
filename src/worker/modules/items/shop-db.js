import { gameEntity, gameCore, gameEffects } from "game-framework"

export const registerShopItemsStage1 = () => {

    const charismaMod = (attr) => attr > 0 ? 1. / (1. + 0.1*Math.log10(attr)) : 1.;

    gameEntity.registerGameEntity('shop_item_notebook', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Notebook',
        description: 'Allows you for planning your actions. Unlocks actions list',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return true
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
        })
    })

    gameEntity.registerGameEntity('shop_item_dairy', {
        tags: ["shop", "upgrade", "purchaseable"],
        name: 'Dairy',
        description: 'Use your dairy to write up what you have learned everyday. Improves learning rate',
        level: 0,
        maxLevel: 1,
        unlockCondition: () => {
            return true
        },
        attributes: {
            isCollectable: false,
        },
        get_cost: () => ({
            'coins': {
                A: 2,
                B: 400*charismaMod(gameEffects.getEffectValue('attribute_charisma')),
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
}