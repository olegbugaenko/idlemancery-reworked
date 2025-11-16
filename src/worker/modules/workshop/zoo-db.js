import { gameEntity } from "game-framework";

export const ZOO_ANIMALS = [
    {
        id: 'magic_henk',
        entityId: 'zoo_animal_magic_henk',
        name: 'Magic Henk',
        icon: 'inventory_charged_amethyst',
        description: 'A dimensional wanderer whose mere presence harmonizes magical amplifiers.',
        resourceModifier: {
            multiplier: {
                effects: {
                    'earth_amplifier_efficiency': {
                        A: 0.005,
                        B: 1,
                        type: 0,
                    },
                    'air_amplifier_efficiency': {
                        A: 0.005,
                        B: 1,
                        type: 0,
                    }
                }
            },
            effectDeps: ['earth_amplifier_efficiency', 'air_amplifier_efficiency']
        }
    },
    {
        id: 'magic_cat',
        entityId: 'zoo_animal_magic_cat',
        name: 'Magic Cat',
        icon: 'inventory_ruby',
        description: 'A curious feline that curls up on spellbooks, inspiring faster study sessions.',
        resourceModifier: {
            multiplier: {
                effects: {
                    'books_learning_rate': {
                        A: 0.003,
                        B: 1,
                        type: 0,
                    }
                }
            },
            effectDeps: ['books_learning_rate']
        }
    },
    {
        id: 'green_bear',
        entityId: 'zoo_animal_green_bear',
        name: 'Green Bear',
        icon: 'inventory_spark',
        description: 'A gentle giant that practices tai chi, motivating physical training routines.',
        resourceModifier: {
            multiplier: {
                effects: {
                    'physical_training_learn_speed': {
                        A: 0.003,
                        B: 1,
                        type: 0,
                    }
                }
            },
            effectDeps: ['physical_training_learn_speed']
        }
    }
];

export const registerZooAnimals = () => {
    ZOO_ANIMALS.forEach((animal) => {
        gameEntity.registerGameEntity(animal.entityId, {
            tags: ["zoo_animal", "upgrade"],
            name: animal.name,
            description: animal.description,
            icon_id: animal.icon,
            level: 0,
            attributes: { isCollectable: false },
            resourceModifier: animal.resourceModifier,
        });
    });
};
