import { gameEntity } from "game-framework";

export const ZOO_ANIMALS = [
    {
        id: 'magic_henk',
        entityId: 'zoo_animal_magic_henk',
        feedEntityId: 'zoo_animal_magic_henk_feeding',
        tags: ['zoo_animal', 'domestic', 'bird', 'herbivore'],
        name: 'Magic Henk',
        icon: 'magic_henk',
        description: 'A dimensional wanderer whose mere presence harmonizes magical amplifiers.',
        attributes: {
            isCollectable: false,
            requiredSpace: 0.5,
            breedFeedRequirement: {
                inventory_focusberry: 1_000_000,
            },
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'air_amplifier_efficiency': {
                        A: 0.02,
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
        tags: ['zoo_animal', 'domestic', 'mammal', 'carnivore'],
        feedEntityId: 'zoo_animal_magic_cat_feeding',
        name: 'Magic Cat',
        icon: 'magic_cat',
        description: 'A curious feline that curls up on spellbooks, inspiring faster study sessions.',
        attributes: {
            isCollectable: false,
            requiredSpace: 1,
            breedFeedRequirement: {
                inventory_nightshade: 1_200_000,
            },
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'books_learning_rate': {
                        A: 0.02,
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
        tags: ['zoo_animal', 'wild', 'mammal', 'omnivore'],
        feedEntityId: 'zoo_animal_green_bear_feeding',
        name: 'Green Bear',
        icon: 'magic_bear',
        description: 'A gentle giant that practices tai chi, motivating physical training routines.',
        attributes: {
            isCollectable: false,
            requiredSpace: 1,
            breedFeedRequirement: {
                inventory_ginseng: 1_500_000,
            },
        },
        resourceModifier: {
            multiplier: {
                effects: {
                    'physical_training_learn_speed': {
                        A: 0.02,
                        B: 1,
                        type: 0,
                    }
                }
            },
            effectDeps: ['physical_training_learn_speed']
        }
    }
];

const buildFeedConsumptionModifier = (animal) => {
    const requirements = animal.attributes?.breedFeedRequirement || {};
    if (!Object.keys(requirements).length) {
        return null;
    }

    return {
        get_consumption: () => ({
            resources: Object.entries(requirements).reduce((acc, [resourceId, amount]) => {
                acc[resourceId] = {
                    A: amount,
                    B: 0,
                    type: 0,
                    label: `${animal.name} Feeding`,
                };
                return acc;
            }, {}),
        }),
        // Use feedEntityId here because ZooModule writes feed_level_multiplier on the *feeding* entity
        getCustomAmplifier: () => gameEntity.getAttribute(animal.feedEntityId, 'feed_level_multiplier', 1),
    };
};

export const registerZooAnimals = () => {
    ZOO_ANIMALS.forEach((animal) => {
        gameEntity.registerGameEntity(animal.entityId, {
            tags: ["zoo_animal", "upgrade"],
            name: animal.name,
            description: animal.description,
            icon_id: animal.icon,
            level: 0,
            attributes: animal.attributes || { isCollectable: false },
            resourceModifier: animal.resourceModifier,
        });

        if (animal.feedEntityId) {
            const feedModifier = buildFeedConsumptionModifier(animal);
            console.log('Feed modifier: ', feedModifier, animal.id, animal.feedEntityId);
            if (!feedModifier) {
                console.error(`Feed modifier not found for animal: ${animal.id}`);
                return;
            }
            gameEntity.registerGameEntity(animal.feedEntityId, {
                tags: ["zoo_animal_feed", "automation"],
                name: `${animal.name} Feeding`,
                description: `Feeding schedule for ${animal.name}`,
                icon_id: animal.icon,
                level: 0,
                attributes: {
                    isCollectable: false,
                    zooAnimalId: animal.id,
                    feed_level_multiplier: 1,
                },
                resourceModifier: feedModifier,
            });
        }
    });
};
