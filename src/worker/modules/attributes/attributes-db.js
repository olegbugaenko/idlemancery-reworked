import { gameEffects, gameEntity } from 'game-framework';

export const registerAttributes = () => {
    gameEffects.registerEffect('attribute_strength', {
        name: 'Strength',
        description: 'Strength impacts on physical activities efficiency and increase energy cap. Higher level unlocks more physical activities',
        minValue: 1,
        hasCap: false,
        saveBalanceTree: true,
        tags: ['attribute', 'physical'],
        unlockCondition: () => {
            return gameEffects.getEffectValue('attribute_stamina') >= 100
        }
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
        description: 'Charisma improves your communication skills and interaction with other people and decrease shop prices. Higher level unlocks more social activities',
        minValue: 1,
        hasCap: false,
        saveBalanceTree: true,
        tags: ['attribute', 'mental']
    })


    gameEffects.registerEffect('attribute_bargaining', {
        name: 'Bargaining',
        description: 'Bargaining attribute slightly increase your coins income from all sources.',
        minValue: 1,
        hasCap: false,
        saveBalanceTree: true,
        tags: ['attribute', 'mental']
    })

    gameEffects.registerEffect('attribute_patience', {
        name: 'Patience',
        description: 'Patience impacts on your ability on focusing on routine tasks, increasing their learning speed. Higher level unlocks more gathering and routine activities',
        minValue: 1,
        defaultValue: 1,
        hasCap: false,
        saveBalanceTree: true,
        tags: ['attribute', 'mental'],
        unlockCondition: () => {
            return gameEntity.isEntityUnlocked('action_yoga_practices')
        }
    })

    gameEffects.registerEffect('attribute_recovery', {
        name: 'Recovery',
        description: 'Improves your health regeneration',
        minValue: 1,
        defaultValue: 1,
        unlockCondition: () => {
            // console.log('ACTLVL: ', )
            return gameEntity.getLevel('action_pushup') > 1
        },
        hasCap: false,
        saveBalanceTree: true,
        tags: ['attribute', 'physical']
    })

    gameEffects.registerEffect('attribute_memory', {
        name: 'Memory',
        description: 'Improves your knowledge capacity',
        minValue: 1,
        defaultValue: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_library_entrance') > 0
        },
        hasCap: false,
        saveBalanceTree: true,
        tags: ['attribute', 'mental']
    })

    gameEffects.registerEffect('attribute_magic_ability', {
        name: 'Magic Ability',
        description: 'Improves your mana regeneration',
        minValue: 1,
        defaultValue: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_spellbook') > 0
        },
        hasCap: false,
        saveBalanceTree: true,
        tags: ['attribute', 'magical']
    })

    gameEffects.registerEffect('attribute_magic_capability', {
        name: 'Magic Capabilty',
        description: 'Improves your mana capacity',
        minValue: 1,
        defaultValue: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_magic_training') > 0
        },
        hasCap: false,
        saveBalanceTree: true,
        tags: ['attribute', 'magical']
    })


    gameEffects.registerEffect('attribute_spell_reading', {
        name: 'Spell Reading ',
        description: 'Improves your spell learning rate',
        minValue: 1,
        defaultValue: 1,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_mages_handbook') > 0
        },
        hasCap: false,
        saveBalanceTree: true,
        tags: ['attribute', 'magical']
    })

    gameEffects.registerEffect('attribute_clarity', {
        name: 'Clarity',
        description: 'Improves your mental energy regeneration',
        minValue: 1,
        unlockCondition: () => {
            return gameEntity.isEntityUnlocked('action_mental_endurance')
        },
        hasCap: false,
        saveBalanceTree: true,
        tags: ['attribute', 'mental']
    })

    gameEffects.registerEffect('attribute_willpower', {
        name: 'Willpower',
        description: 'Improves your mental energy capability',
        minValue: 1,
        unlockCondition: () => {
            return gameEntity.isEntityUnlocked('action_mind_cleansing')
        },
        hasCap: false,
        saveBalanceTree: true,
        tags: ['attribute', 'mental']
    })
}