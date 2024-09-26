import { gameEffects } from 'game-framework';

export const registerAttributes = () => {
    gameEffects.registerEffect('attribute_strength', {
        name: 'Strength',
        description: 'Strength impacts on physical activities efficiency and increase energy cap',
        minValue: 1,
        hasCap: false,
        saveBalanceTree: true,
        tags: ['attribute', 'physical']
    })

    gameEffects.registerEffect('attribute_stamina', {
        name: 'Stamina',
        description: 'Stamina impacts on how fast you can restore your energy',
        minValue: 1,
        hasCap: false,
        saveBalanceTree: true,
        tags: ['attribute', 'physical']
    })

    gameEffects.registerEffect('attribute_vitality', {
        name: 'Vitality',
        description: 'Vitality improves your health maximum',
        minValue: 1,
        hasCap: false,
        saveBalanceTree: true,
        tags: ['attribute', 'physical']
    })

    gameEffects.registerEffect('attribute_charisma', {
        name: 'Charisma',
        description: 'Charisma improves your communication skills and interaction with other people and decrease shop prices',
        minValue: 1,
        hasCap: false,
        saveBalanceTree: true,
        tags: ['attribute', 'mental']
    })

    gameEffects.registerEffect('attribute_patience', {
        name: 'Patience',
        description: 'Patience impacts on your ability on focusing on routine tasks and increasing learning speed',
        minValue: 1,
        hasCap: false,
        saveBalanceTree: true,
        tags: ['attribute', 'mental']
    })
}