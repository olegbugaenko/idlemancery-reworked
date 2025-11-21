export const defaultZooData = {
    unlocked: false,
    space: { total: 0, used: 0, free: 0 },
    limits: { totalPercent: 0, remainingPercent: 1 },
    animals: [],
};

export const devPreviewZooData = {
    unlocked: true,
    space: { total: 75, used: 52, free: 23 },
    limits: { totalPercent: 0.65, remainingPercent: 0.35 },
    animals: [
        {
            id: 'magic_henk',
            name: 'Magic Henk',
            description: 'A dimensional wanderer whose mere presence harmonizes magical amplifiers.',
            icon: 'inventory_charged_amethyst',
            count: 18.2,
            isLimited: true,
            isLimitLocked: false,
            limitPercent: 0.35,
            limitValue: 26.25,
            feedLevel: 0.8,
            feedEfficiency: 1,
            effectiveGrowthMultiplier: 0.8,
            effects: {
                earth_amplifier_efficiency: {
                    name: 'Earth Amplifier Efficiency',
                    type: 'effects',
                    scope: 'income',
                    isPercentage: true,
                    value: 0.125
                },
                air_amplifier_efficiency: {
                    name: 'Air Amplifier Efficiency',
                    type: 'effects',
                    scope: 'income',
                    isPercentage: true,
                    value: 0.125
                }
            }
        },
        {
            id: 'magic_cat',
            name: 'Magic Cat',
            description: 'A curious feline that curls up on spellbooks, inspiring faster study sessions.',
            icon: 'inventory_ruby',
            count: 14.6,
            isLimited: false,
            isLimitLocked: false,
            limitPercent: null,
            limitValue: null,
            feedLevel: 0.6,
            feedEfficiency: 0.95,
            effectiveGrowthMultiplier: 0.57,
            effects: {
                books_learning_rate: {
                    name: 'Books Learning Rate',
                    type: 'effects',
                    scope: 'income',
                    isPercentage: true,
                    value: 0.083
                }
            }
        },
        {
            id: 'green_bear',
            name: 'Green Bear',
            description: 'A gentle giant that practices tai chi, motivating physical training routines.',
            icon: 'inventory_spark',
            count: 19.1,
            isLimited: true,
            isLimitLocked: false,
            limitPercent: 0.30,
            limitValue: 22.5,
            feedLevel: 0.9,
            feedEfficiency: 0.85,
            effectiveGrowthMultiplier: 0.765,
            effects: {
                physical_training_learn_speed: {
                    name: 'Physical Training Learn Speed',
                    type: 'effects',
                    scope: 'income',
                    isPercentage: true,
                    value: 0.091
                }
            }
        }
    ]
};
