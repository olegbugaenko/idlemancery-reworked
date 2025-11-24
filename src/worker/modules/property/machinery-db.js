import { gameEntity, gameResources, gameEffects } from "game-framework";
import { charismaMod } from "../items/shop-db";

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

const getCoalDiscount = () => {
    return gameEffects.getEffectValue('coal_consumption_discount');
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
                    'inventory_stone': { A: 500 * gameEffects.getEffectValue('machinery_efficiency'), B: 0.0, C: 1.03, type: 3 },
                }
            }),
            get_consumption: () => ({
                resources: {
                    'inventory_coal': { A: 1.0/getCoalDiscount(), B: 0.0, C: 1.03, type: 3 },
                    'living_space': { A: 1, B: 0, type: 0 },
                }
            }),
            getCustomAmplifier: () => gameEntity.getAttribute('machine_auto_quarry', 'manualLoad') ?? 0,
            customAmplifierApplyTypes: ['resources'],
            customAmplifierApplyScopes: ['income','consumption'],
            effectDeps: ['machinery_efficiency', 'coal_consumption_discount'],
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
                    'inventory_refined_wood': { A: 500.0 * gameEffects.getEffectValue('machinery_efficiency'), B: 0.0, C: 1.03, type: 3 },
                }
            }),
            get_consumption: () => ({
                resources: {
                    'inventory_coal': { A: 1.0/getCoalDiscount(), B: 0.0, C: 1.03, type: 3 },
                    'inventory_wood': { A: 5000.0/gameEffects.getEffectValue('crafting_materials_discount'), B: 0.0, C: 1.03, type: 3 },
                    'living_space': { A: 1, B: 0, type: 0 },
                }
            }),
            getCustomAmplifier: () => gameEntity.getAttribute('machine_auto_lumbermill', 'manualLoad') ?? 0,
            customAmplifierApplyTypes: ['resources'],
            customAmplifierApplyScopes: ['income','consumption'],
            effectDeps: ['machinery_efficiency', 'crafting_materials_discount', 'coal_consumption_discount'],
        },
        get_cost: () => ({
            'inventory_stone_brick': { A: 1.2, B: 20000, type: 1 },
            'inventory_forged_steel': { A: 1.2, B: 10000, type: 1 },
            'living_space': { A: 0, B: 1, type: 0 },
        }),
    });

    // Automatic Ore Mine — consumes coal, produces ore
    registerMachine('machine_automatic_ore_mine', {
        tags: ['machinery', 'upgrade', 'purchaseable', 'industrial', 'mining'],
        name: 'Automatic Ore Mine',
        description: 'An automated mining machine that continuously extracts ore from deep underground. Consumes coal to operate.',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_industrial_revolution') > 0;
        },
        attributes: {
            manualLoad: 1,
        },
        resourceModifier: {
            get_income: () => ({
                resources: {
                    'inventory_iron_ore': { A: 200 * gameEffects.getEffectValue('machinery_efficiency'), B: 0.0, C: 1.02, type: 3 },
                }
            }),
            get_consumption: () => ({
                resources: {
                    'inventory_coal': { A: 1.0/getCoalDiscount(), B: 0.0, C: 1.02, type: 3 },
                    'living_space': { A: 4, B: 0, type: 0 },
                }
            }),
            getCustomAmplifier: () => gameEntity.getAttribute('machine_automatic_ore_mine', 'manualLoad') ?? 0,
            customAmplifierApplyTypes: ['resources'],
            customAmplifierApplyScopes: ['income','consumption'],
            effectDeps: ['machinery_efficiency', 'coal_consumption_discount'],
        },
        get_cost: () => ({
            'coins': { A: 1.5, B: 1000000000*charismaMod(gameEffects.getEffectValue('attribute_charisma')), type: 1 },
            'inventory_stone_brick': { A: 1.5, B: 1500, type: 1 },
            'inventory_forged_steel': { A: 1.5, B: 3000, type: 1 },
            'inventory_wooden_beam': { A: 1.5, B: 2000, type: 1 },
            'living_space': { A: 0, B: 4, type: 0 },
        }),
    });

    // Automatic Clay Mine — consumes coal, produces clay
    registerMachine('machine_automatic_clay_mine', {
        tags: ['machinery', 'upgrade', 'purchaseable', 'industrial', 'mining'],
        name: 'Automatic Clay Mine',
        description: 'An automated mining machine that continuously extracts clay from underground deposits. Consumes coal to operate.',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_industrial_revolution') > 0;
        },
        attributes: {
            manualLoad: 1,
        },
        resourceModifier: {
            get_income: () => ({
                resources: {
                    'inventory_clay': { A: 50 * gameEffects.getEffectValue('machinery_efficiency'), B: 0.0, C: 1.02, type: 3 },
                }
            }),
            get_consumption: () => ({
                resources: {
                    'inventory_coal': { A: 1.0/getCoalDiscount(), B: 0.0, C: 1.02, type: 3 },
                    'living_space': { A: 4, B: 0, type: 0 },
                }
            }),
            getCustomAmplifier: () => gameEntity.getAttribute('machine_automatic_clay_mine', 'manualLoad') ?? 0,
            customAmplifierApplyTypes: ['resources'],
            customAmplifierApplyScopes: ['income','consumption'],
            effectDeps: ['machinery_efficiency', 'coal_consumption_discount'],
        },
        get_cost: () => ({
            'coins': { A: 1.5, B: 1000000000*charismaMod(gameEffects.getEffectValue('attribute_charisma')), type: 1 },
            'inventory_stone_brick': { A: 1.5, B: 1500, type: 1 },
            'inventory_forged_steel': { A: 1.5, B: 3000, type: 1 },
            'inventory_wooden_beam': { A: 1.5, B: 2000, type: 1 },
            'living_space': { A: 0, B: 4, type: 0 },
        }),
    });

    // Automated Papermill — consumes wood and coal, produces paper
    registerMachine('machine_automated_papermill', {
        tags: ['machinery', 'upgrade', 'purchaseable', 'industrial', 'manufacturing'],
        name: 'Automated Papermill',
        description: 'An automated manufacturing machine that converts wood into paper. Consumes wood and coal to operate.',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_manufacturing_revolution') > 0;
        },
        attributes: {
            manualLoad: 1,
        },
        resourceModifier: {
            get_income: () => ({
                resources: {
                    'inventory_paper': { A: 10 * gameEffects.getEffectValue('machinery_efficiency'), B: 0.0, C: 1.02, type: 3 },
                }
            }),
            get_consumption: () => ({
                resources: {
                    'inventory_wood': { A: 2000.0/gameEffects.getEffectValue('crafting_materials_discount'), B: 0.0, C: 1.02, type: 3 },
                    'inventory_coal': { A: 1.0/getCoalDiscount(), B: 0.0, C: 1.02, type: 3 },
                    'living_space': { A: 4, B: 0, type: 0 },
                }
            }),
            getCustomAmplifier: () => gameEntity.getAttribute('machine_automated_papermill', 'manualLoad') ?? 0,
            customAmplifierApplyTypes: ['resources'],
            customAmplifierApplyScopes: ['income','consumption'],
            effectDeps: ['machinery_efficiency', 'crafting_materials_discount', 'coal_consumption_discount'],
        },
        get_cost: () => ({
            'coins': { A: 1.5, B: 1500000000*charismaMod(gameEffects.getEffectValue('attribute_charisma')), type: 1 },
            'inventory_stone_brick': { A: 1.5, B: 40000, type: 1 },
            'inventory_forged_steel': { A: 1.5, B: 20000, type: 1 },
            'inventory_wooden_beam': { A: 1.5, B: 40000, type: 1 },
            'living_space': { A: 0, B: 4, type: 0 },
        }),
    });

    // Automated Brickworks — consumes stone and coal, produces stone bricks
    registerMachine('machine_automated_brickworks', {
        tags: ['machinery', 'upgrade', 'purchaseable', 'industrial', 'manufacturing'],
        name: 'Automated Brickworks',
        description: 'An automated manufacturing machine that converts stone into stone bricks. Consumes stone and coal to operate.',
        level: 0,
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_manufacturing_revolution') > 0;
        },
        attributes: {
            manualLoad: 1,
        },
        resourceModifier: {
            get_income: () => ({
                resources: {
                    'inventory_stone_brick': { A: 20 * gameEffects.getEffectValue('machinery_efficiency'), B: 0.0, C: 1.02, type: 3 },
                }
            }),
            get_consumption: () => ({
                resources: {
                    'inventory_stone': { A: 500.0/gameEffects.getEffectValue('crafting_materials_discount'), B: 0.0, C: 1.02, type: 3 },
                    'inventory_coal': { A: 1.0/getCoalDiscount(), B: 0.0, C: 1.02, type: 3 },
                    'living_space': { A: 4, B: 0, type: 0 },
                }
            }),
            getCustomAmplifier: () => gameEntity.getAttribute('machine_automated_brickworks', 'manualLoad') ?? 0,
            customAmplifierApplyTypes: ['resources'],
            customAmplifierApplyScopes: ['income','consumption'],
            effectDeps: ['machinery_efficiency', 'crafting_materials_discount', 'coal_consumption_discount'],
        },
        get_cost: () => ({
            'coins': { A: 1.5, B: 1500000000*charismaMod(gameEffects.getEffectValue('attribute_charisma')), type: 1 },
            'inventory_stone_brick': { A: 1.5, B: 10000, type: 1 },
            'inventory_forged_steel': { A: 1.5, B: 40000, type: 1 },
            'inventory_wooden_beam': { A: 1.5, B: 30000, type: 1 },
            'living_space': { A: 0, B: 4, type: 0 },
        }),
    });

    // Automated Greenhouse — increases plantation efficiency
    registerMachine('machine_automated_greenhouse', {
        tags: ['machinery', 'upgrade', 'purchaseable', 'industrial', 'agricultural'],
        name: 'Automated Greenhouse',
        description: 'An electrically-powered greenhouse that enhances plantation efficiency through controlled climate and automated systems.',
        level: 0,
        attributeRegenDeps: ['manualLoad'],
        unlockCondition: () => {
            return gameResources.isResourceUnlocked('inventory_copper_wire');
        },
        attributes: {
            manualLoad: 1,
        },
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    'plantations_efficiency': {
                        A: 0.2,
                        B: 1,
                        C: 1.02,
                        type: 3,
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    'living_space': { A: 4, B: 0, type: 0 },
                    'inventory_coal': { A: 5.0/getCoalDiscount(), B: 0.0, C: 1.02, type: 3 },
                }
            }),
            getCustomAmplifier: () => gameEntity.getAttribute('machine_automated_greenhouse', 'manualLoad') ?? 0,
            customAmplifierApplyTypes: ['effects'],
            customAmplifierApplyScopes: ['multiplier'],
            effectDeps: ['plantations_efficiency'],
        },
        get_cost: () => ({
            'inventory_copper_wire': { A: 1.5, B: 500, type: 1 },
            'inventory_forged_steel': { A: 1.5, B: 8000, type: 1 },
            'living_space': { A: 0, B: 4, type: 0 },
        }),
    });

    // Incubator — increases birds breeding efficiency
    registerMachine('machine_incubator', {
        tags: ['machinery', 'upgrade', 'purchaseable', 'industrial', 'agricultural', 'zoo'],
        name: 'Incubator',
        description: 'An advanced incubation system that optimizes breeding conditions for birds, significantly increasing their breeding efficiency in the magical zoo.',
        level: 0,
        attributeRegenDeps: ['manualLoad'],
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_patience',
            level: 200000,
        }],
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_automated_mechanisms') > 0;
        },
        attributes: {
            manualLoad: 1,
        },
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    'birds_breeding_efficiency': {
                        A: 0.2,
                        B: 1,
                        C: 1.02,
                        type: 3,
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    'living_space': { A: 4, B: 0, type: 0 },
                    'inventory_coal': { A: 3.0/getCoalDiscount(), B: 0.0, C: 1.02, type: 3 },
                    'inventory_water': { A: 500.0, B: 0.0, C: 1.02, type: 3 },
                }
            }),
            getCustomAmplifier: () => gameEntity.getAttribute('machine_incubator', 'manualLoad') ?? 0,
            // Scale both the provided effects and the machine consumption by manual load
            customAmplifierApplyTypes: ['effects', 'resources'],
            customAmplifierApplyScopes: ['multiplier', 'consumption'],
            effectDeps: ['birds_breeding_efficiency', 'coal_consumption_discount'],
        },
        get_cost: () => ({
            'inventory_copper_wire': { A: 1.5, B: 2000, type: 1 },
            'inventory_forged_steel': { A: 1.5, B: 150000000, type: 1 },
            'inventory_stone_brick': { A: 1.5, B: 50000000, type: 1 },
            'living_space': { A: 0, B: 4, type: 0 },
        }),
    });

    // Breeding Facility — increases mammals breeding efficiency
    registerMachine('machine_breeding_facility', {
        tags: ['machinery', 'upgrade', 'purchaseable', 'industrial', 'agricultural', 'zoo'],
        name: 'Breeding Facility',
        description: 'A sophisticated facility designed to optimize breeding conditions for mammals, significantly increasing their breeding efficiency in the magical zoo.',
        level: 0,
        attributeRegenDeps: ['manualLoad'],
        unlockedBy: [{
            type: 'effect',
            id: 'attribute_patience',
            level: 200000,
        }],
        unlockCondition: () => {
            return gameEntity.getLevel('shop_item_automated_mechanisms') > 0;
        },
        attributes: {
            manualLoad: 1,
        },
        resourceModifier: {
            get_multiplier: () => ({
                effects: {
                    'mammal_breeding_efficiency': {
                        A: 0.2,
                        B: 1,
                        C: 1.02,
                        type: 3,
                    }
                }
            }),
            get_consumption: () => ({
                resources: {
                    'living_space': { A: 4, B: 0, type: 0 },
                    'inventory_coal': { A: 3.0/getCoalDiscount(), B: 0.0, C: 1.02, type: 3 },
                    'inventory_water': { A: 500.0, B: 0.0, C: 1.02, type: 3 },
                }
            }),
            getCustomAmplifier: () => gameEntity.getAttribute('machine_breeding_facility', 'manualLoad') ?? 0,
            // Scale both the provided effects and the machine consumption by manual load
            customAmplifierApplyTypes: ['effects', 'resources'],
            customAmplifierApplyScopes: ['multiplier', 'consumption'],
            effectDeps: ['mammal_breeding_efficiency', 'coal_consumption_discount'],
        },
        get_cost: () => ({
            'inventory_copper_wire': { A: 1.5, B: 2000, type: 1 },
            'inventory_forged_steel': { A: 1.5, B: 150000000, type: 1 },
            'inventory_stone_brick': { A: 1.5, B: 50000000, type: 1 },
            'living_space': { A: 0, B: 4, type: 0 },
        }),
    });
}



