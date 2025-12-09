import { gameEntity, gameEffects } from "game-framework";

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
                inventory_focusberry: 600_000,
            },
            breedingEffectId: 'birds_breeding_efficiency',
        },
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    'air_amplifier_efficiency': {
                        A: 100,
                        B: 1,
                        C: 0.01*gameEffects.getEffectValue('zoo_animals_efficiency'),
                        type: 5,
                        diminish: 0.6,
                        diminishStep: 50,
                    }
                }
            }),
            effectDeps: ['zoo_animals_efficiency']
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
                inventory_nightshade: 400_000,
            },
            breedingEffectId: 'mammal_breeding_efficiency',
        },
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    'books_learning_rate': {
                        A: 100,
                        B: 1,
                        C: 0.05*gameEffects.getEffectValue('zoo_animals_efficiency'),
                        type: 5,
                        diminish: 0.6,
                        diminishStep: 100,
                    }
                }
            }),
            effectDeps: ['zoo_animals_efficiency']
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
                inventory_ginseng: 500_000,
            },
            breedingEffectId: 'mammal_breeding_efficiency',
        },
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    'physical_training_learn_speed': {
                        A: 100,
                        B: 1,
                        C: 0.05*gameEffects.getEffectValue('zoo_animals_efficiency'),
                        type: 5,
                        diminish: 0.6,
                        diminishStep: 100,
                    }
                }
            }),
            effectDeps: ['zoo_animals_efficiency']
        }
    },
    {
        id: 'cow',
        entityId: 'zoo_animal_cow',
        feedEntityId: 'zoo_animal_cow_feeding',
        tags: ['zoo_animal', 'domestic', 'mammal', 'herbivore'],
        name: 'Cow',
        icon: 'magic_cow',
        description: 'A calm domestic bovine whose steady rhythm enriches the land, improving plantation efficiency.',
        attributes: {
            isCollectable: false,
            requiredSpace: 1,
            breedFeedRequirement: {
                inventory_knowledge_moss: 1_000_000,
            },
            breedingEffectId: 'mammal_breeding_efficiency',
        },
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_patience',
            level: 125000,
        }],
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    'plantations_efficiency': {
                        A: 100,
                        B: 1,
                        C: 0.02*gameEffects.getEffectValue('zoo_animals_efficiency'),
                        type: 5,
                        diminish: 0.6,
                        diminishStep: 20,
                    }
                }
            }),
            effectDeps: ['zoo_animals_efficiency']
        }
    },
    {
        id: 'duck',
        entityId: 'zoo_animal_duck',
        feedEntityId: 'zoo_animal_duck_feeding',
        tags: ['zoo_animal', 'domestic', 'bird', 'omnivore'],
        name: 'Duck',
        icon: 'magic_duck',
        description: 'An inquisitive waterfowl whose keen observation hones mental routines, increasing mental activities learning rate.',
        attributes: {
            isCollectable: false,
            requiredSpace: 0.5,
            breedFeedRequirement: {
                inventory_golden_algae: 600_000,
            },
            breedingEffectId: 'birds_breeding_efficiency',
        },
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_patience',
            level: 125000,
        }],
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    'mental_activities_learn_rate': {
                        A: 100,
                        B: 1,
                        C: 0.02*gameEffects.getEffectValue('zoo_animals_efficiency'),
                        type: 5,
                        diminish: 0.6,
                        diminishStep: 100,
                    }
                }
            }),
            effectDeps: ['zoo_animals_efficiency']
        }
    },
    {
        id: 'raven',
        entityId: 'zoo_animal_raven',
        feedEntityId: 'zoo_animal_raven_feeding',
        tags: ['zoo_animal', 'wild', 'bird', 'omnivore'],
        name: 'Raven',
        icon: 'raven',
        description: 'A proud and free-spirited bird of exceptional intelligence. Its presence sharpens mental focus, significantly boosting mental training speed.',
        attributes: {
            isCollectable: false,
            requiredSpace: 4,
            breedFeedRequirement: {
                inventory_thinkroot: 4_000_000,
            },
            breedingEffectId: 'birds_breeding_efficiency',
        },
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_patience',
            level: 300000,
        }],
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    'mental_training_learning_rate': {
                        A: 100,
                        B: 1,
                        C: 0.02*gameEffects.getEffectValue('zoo_animals_efficiency'),
                        type: 5,
                        diminish: 0.6,
                        diminishStep: 100,
                    }
                }
            }),
            effectDeps: ['zoo_animals_efficiency']
        }
    },
    {
        id: 'wolf',
        entityId: 'zoo_animal_wolf',
        feedEntityId: 'zoo_animal_wolf_feeding',
        tags: ['zoo_animal', 'wild', 'mammal', 'carnivore'],
        name: 'Wolf',
        icon: 'wolf',
        description: 'A brave and loyal ally, reliable in scouting the most dangerous locations. Its keen tracking instincts dramatically enhance expedition efforts.',
        attributes: {
            isCollectable: false,
            requiredSpace: 2,
            breedFeedRequirement: {
                inventory_ember_leaf: 1_000_000,
            },
            breedingEffectId: 'mammal_breeding_efficiency',
        },
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_patience',
            level: 300000,
        }],
        resourceModifier: {
            get_multiplier: () => ({
                resources: {
                    'expedition_effort': {
                        A: 100,
                        B: 1,
                        C: 0.004*gameEffects.getEffectValue('zoo_animals_efficiency'),
                        type: 5,
                        diminish: 0.6,
                        diminishStep: 50,
                    }
                }
            }),
            effectDeps: ['zoo_animals_efficiency']
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
        // Use feedEntityId here because ZooModule writes feed_level_multiplier on the *feeding* entity.
        // (Global buffs to animal effectiveness are applied in get_multiplier of each animal, not here.)
        getCustomAmplifier: () => gameEntity.getAttribute(animal.feedEntityId, 'feed_level_multiplier', 1),
    };
};

export const registerZooAnimals = () => {
    ZOO_ANIMALS.forEach((animal) => {
        gameEntity.registerGameEntity(animal.entityId, {
            tags: ["zoo_animal", "upgrade", ...(animal.tags || [])],
            name: animal.name,
            description: animal.description,
            icon_id: animal.icon,
            level: 0,
            unlockedBy: animal.unlockedBy,
            unlockCondition: animal.unlockCondition,
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
                attributeRegenDeps: ['feed_level_multiplier'],
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
