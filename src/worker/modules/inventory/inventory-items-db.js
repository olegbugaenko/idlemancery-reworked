import { gameResources, gameEntity, gameCore, gameEffects } from "game-framework"

export const registerInventoryItems = () => {

    gameResources.registerResource('inventory_berry', {
        name: 'Berry',
        hasCap: false,
        tags: ['inventory', 'consumable'],
        defaultCap: 0,
        onUse: (amount) => {

        },
        usageGain: {
            get_income: () => ({
                resources: {
                    health: {
                        A: 2,
                        B: 0,
                        type: 0,
                    }
                }
            })
        }
    })

}