export const FEED_EPSILON = 0.000001;

const DEV_FEED_REQUIREMENTS = {
    magic_henk: { id: 'inventory_focusberry', name: 'Focusberry', perAnimal: 1_000_000 },
    magic_cat: { id: 'inventory_nightshade', name: 'Nightshade', perAnimal: 1_200_000 },
    green_bear: { id: 'inventory_ginseng', name: 'Ginseng', perAnimal: 1_500_000 },
};

export const clampShare = (value) => {
    if (typeof value !== 'number' || isNaN(value)) {
        return 0;
    }
    if (value < 0) {
        return 0;
    }
    if (value > 1) {
        return 1;
    }
    return value;
};

export const buildFallbackDetailFromSummary = (animal) => {
    if (!animal) {
        return null;
    }
    const feedLevel = typeof animal.feedLevel === 'number' ? animal.feedLevel : 1;
    const feedEfficiency = typeof animal.feedEfficiency === 'number' ? animal.feedEfficiency : 1;
    const effectiveMultiplier = typeof animal.effectiveGrowthMultiplier === 'number'
        ? animal.effectiveGrowthMultiplier
        : feedLevel * feedEfficiency;
    const baseRate = 0.01 + 0.001 * (animal.count ?? 0);
    return {
        ...animal,
        feed: {
            level: feedLevel,
            efficiency: feedEfficiency,
            effectiveMultiplier,
            previewLevel: feedLevel,
            previewEffectiveMultiplier: effectiveMultiplier,
            missingResource: null,
            requirements: [],
        },
        breeding: {
            baseRate,
            currentRate: baseRate * effectiveMultiplier,
            previewRate: baseRate * effectiveMultiplier,
        },
    };
};

export const buildDevPreviewDetail = (animal, overrideLevel = null) => {
    const fallback = buildFallbackDetailFromSummary(animal);
    if (!fallback) {
        return null;
    }
    const feedLevel = fallback.feed?.level ?? 1;
    const previewLevel = clampShare(typeof overrideLevel === 'number' ? overrideLevel : feedLevel);
    const efficiency = fallback.feed?.efficiency ?? 1;
    const count = fallback.count ?? 0;
    const requirement = DEV_FEED_REQUIREMENTS[fallback.id];
    const requirements = requirement ? [{
        resource: { id: requirement.id, name: requirement.name },
        perAnimal: requirement.perAnimal,
        consumption: requirement.perAnimal * count * feedLevel,
        previewConsumption: requirement.perAnimal * count * previewLevel,
    }] : [];

    return {
        ...fallback,
        feed: {
            ...fallback.feed,
            requirements,
            previewLevel,
            previewEffectiveMultiplier: previewLevel * efficiency,
        },
        breeding: {
            ...fallback.breeding,
            previewRate: fallback.breeding.baseRate * previewLevel * efficiency,
        },
    };
};
