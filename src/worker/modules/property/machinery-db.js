import { gameEntity, gameResources, gameEffects } from "game-framework";

// Helper: build searchable metadata same way as structures
const getResourceModifierDataSearchable = (rs) => {
    const searchables = {
        'effects': [],
        'resources': []
    };
    if (!rs) return searchables;

    ['income', 'consumption', 'multiplier', 'rawCap', 'capMult'].forEach(scope => {
        let rObj = null;
        if (rs[`get_${scope}`]) {
            rObj = rs[`get_${scope}`]();
        } else {
            rObj = rs[scope];
        }
        if (!rObj) return;
        for (const type in rObj) {
            searchables[type].push(
                ...Object.keys(rObj[type]).map(one =>
                    type === 'resources' ? gameResources.getResource(one).name.toLowerCase() : one.toLowerCase()
                )
            );
        }
    });
    return searchables;
}

const registerMachine = (id, options) => {
    options.searchableMeta = getResourceModifierDataSearchable(options.resourceModifier);
    gameEntity.registerGameEntity(id, options);
}

export const registerMachineryStage1 = () => {
    // Automated Quarry — consumes coal, produces stone
    registerMachine('machine_auto_quarry', {
        tags: ['machinery', 'upgrade', 'purchaseable', 'industrial'],
        name: 'Automated Quarry',
        description: 'Consumes coal to mine stone automatically.',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_automated_mechanisms') > 0;
        },
        attributes: {
            manualLoad: 1,
        },
        resourceModifier: {
            get_income: () => ({
                resources: {
                    'inventory_stone': { A: 5 * gameEffects.getEffectValue('machinery_efficiency'), B: 0.0, C: 1.02, type: 3 },
                }
            }),
            consumption: {
                resources: {
                    'inventory_coal': { A: 1.0, B: 0.0, C: 1.02, type: 3 },
                    'living_space': { A: 1, B: 0, type: 0 },
                }
            },
            getCustomAmplifier: () => gameEntity.getAttribute('machine_auto_quarry', 'manualLoad') ?? 1,
            customAmplifierApplyTypes: ['resources'],
            customAmplifierApplyScopes: ['income','consumption'],
            effectDeps: ['machinery_efficiency'],
        },
        get_cost: () => ({
            'inventory_wooden_beam': { A: 1.2, B: 40000, type: 1 },
            'inventory_forged_steel': { A: 1.2, B: 10000, type: 1 },
            'living_space': { A: 0, B: 1, type: 0 },
        }),
    });

    // Automated Lumbermill — consumes coal and wood, produces refined wood
    registerMachine('machine_auto_lumbermill', {
        tags: ['machinery', 'upgrade', 'purchaseable', 'industrial'],
        name: 'Automated Lumbermill',
        description: 'Consumes coal and wood to produce refined wood.',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_automated_mechanisms') > 0;
        },
        attributes: {
            manualLoad: 1,
        },
        resourceModifier: {
            get_income: () => ({
                resources: {
                    'inventory_refined_wood': { A: 10.0 * gameEffects.getEffectValue('machinery_efficiency'), B: 0.0, C: 1.02, type: 3 },
                }
            }),
            consumption: {
                resources: {
                    'inventory_coal': { A: 1.0, B: 0.0, C: 1.02, type: 3 },
                    'inventory_wood': { A: 1000.0, B: 0.0, C: 1.02, type: 3 },
                    'living_space': { A: 1, B: 0, type: 0 },
                }
            },
            getCustomAmplifier: () => gameEntity.getAttribute('machine_auto_lumbermill', 'manualLoad') ?? 1,
            customAmplifierApplyTypes: ['resources'],
            customAmplifierApplyScopes: ['income','consumption'],
            effectDeps: ['machinery_efficiency'],
        },
        get_cost: () => ({
            'inventory_stone_brick': { A: 1.2, B: 20000, type: 1 },
            'inventory_forged_steel': { A: 1.2, B: 10000, type: 1 },
            'living_space': { A: 0, B: 1, type: 0 },
        }),
    });
}



