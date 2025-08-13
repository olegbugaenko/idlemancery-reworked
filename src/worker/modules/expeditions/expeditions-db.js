import {gameEntity, gameResources, gameEffects} from "game-framework";

export const initExpeditionsDB = () => {
    
    // Register expedition locations
    registerExpeditionLocation('expedition_ancient_ruins', {
        name: 'Ancient Ruins',
        description: 'Explore the mysterious ruins of an ancient civilization. These crumbling structures hold secrets of forgotten magic and valuable artifacts. Deeper levels offer greater rewards but require more effort.',
        tags: ['expedition', 'expedition-location'],
        isAbstract: true,
        level: 0,
        baseXp: 100,
        attributes: {
            baseXp: 100,
            possibleLoot: {
                'inventory_vibrating_pot': 0.05,
                'inventory_charged_amethyst': 0.05,
                'inventory_magic_lens': 0.05,
            }
        },
        resourceModifier: {
            get_consumption: () => ({
                resources: {
                    'expedition_effort': {
                        A: 1.5,
                        B: 2,
                        type: 1,
                    }
                }
            }),
            effectDeps: ['expedition_efficiency']
        },
        unlockCondition: () => {
            return gameEntity.getLevel('action_expedition') > 0;
        }
    });

    registerExpeditionLocation('expedition_ancient_cemetery', {
        name: 'Ancient Cemetery',
        description: 'A forgotten burial ground where ancient warriors and mages were laid to rest. The spirits here guard powerful relics and mystical knowledge. Higher levels reveal more dangerous but rewarding encounters.',
        tags: ['expedition', 'expedition-location'],
        isAbstract: true,
        level: 0,
        baseXp: 1000,
        attributes: {
            baseXp: 1000,
            possibleLoot: {
                'inventory_dynosaur_bone': 0.05,
                'inventory_ochre': 0.05,
                'inventory_hunter_flask': 0.05,
            }
        },
        resourceModifier: {
            get_consumption: () => ({
                resources: {
                    'expedition_effort': {
                        A: 1.5,
                        B: 2.0,
                        type: 1,
                    }
                }
            }),
            effectDeps: ['expedition_efficiency']
        },
        unlockCondition: () => {
            return gameEntity.getLevel('action_expedition') > 0;
        }
    });

    registerExpeditionLocation('expedition_ancient_library', {
        name: 'Ancient Library',
        description: 'A vast, timeworn repository of knowledge. Endless corridors of shelves and silent reading halls hide curious trinkets, rare stationery, and forgotten tools of scholars.',
        tags: ['expedition', 'expedition-location'],
        isAbstract: true,
        level: 0,
        baseXp: 500,
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_magic_ability',
            level: 30000
        }],
        attributes: {
            baseXp: 2500,
            possibleLoot: {
                'inventory_pince_nez': 0.04,
                'inventory_scribe_quill': 0.04,
                'inventory_magical_bookmark': 0.04,
            }
        },
        resourceModifier: {
            get_consumption: () => ({
                resources: {
                    'expedition_effort': {
                        A: 1.5,
                        B: 5,
                        type: 1,
                    }
                }
            }),
            effectDeps: ['expedition_efficiency']
        },
        unlockCondition: () => {
            return gameEntity.getLevel('action_expedition') > 0 && 
                   gameEffects.getEffectValue('attribute_magic_ability') >= 30000;
        }
    });
};

const registerExpeditionLocation = (id, options) => {
    return gameEntity.registerGameEntity(id, {
        ...options,
        isAbstract: true,
        tags: [...(options.tags || []), 'expedition', 'location']
    });
}; 