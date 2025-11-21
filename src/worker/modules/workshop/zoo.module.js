import {GameModule} from "../../shared/game-module";
import {gameEntity, gameResources} from "game-framework";
import {registerZooAnimals, ZOO_ANIMALS} from "./zoo-db";
import {packEffects} from "../../shared/utils/objects";
import {SMALL_NUMBER} from "game-framework/src/utils/consts";
import {resourceResponse} from "../../shared/utils/transform/resources";
import {checkMatchingRules} from "../../shared/utils/rule-utils";

const DEFAULT_DATA = () => ZOO_ANIMALS.reduce((acc, animal) => {
    acc[animal.id] = {
        count: 0,
        isLimited: false,
        isLimitLocked: false,
        limitPercent: null,
        feedLevel: 1,
        autofeed: { isEnabled: false, rules: [], pattern: '' },
    };
    return acc;
}, {});

const DEFAULT_AUTOMATION_STATE = () => ({ isEnabled: false, rules: [], pattern: '' });

export class ZooModule extends GameModule {

    constructor() {
        super();
        this.animalsState = DEFAULT_DATA();
        this.currentVersion = 2;
        this.activeAutofeedLevels = {};

        this.eventHandler.registerHandler('query-zoo-data', () => {
            this.sendZooData();
        });

        this.eventHandler.registerHandler('set-zoo-limit', (payload) => {
            this.setAnimalLimit(payload || {});
        });

        this.eventHandler.registerHandler('toggle-zoo-limit-lock', (payload = {}) => {
            this.toggleAnimalLimitLock(payload);
        });

        this.eventHandler.registerHandler('query-zoo-animal-details', (payload = {}) => {
            this.sendAnimalDetail(payload.id, payload.feedLevelOverride);
        });

        this.eventHandler.registerHandler('save-zoo-feed-settings', (payload = {}) => {
            this.saveAnimalFeedSettings(payload);
        });
    }

    initialize() {
        registerZooAnimals();
    }

    isUnlocked() {
        return gameEntity.getLevel('shop_item_magical_zoo') > 0;
    }

    ensureAnimalState(id) {
        if (!this.animalsState[id]) {
            this.animalsState[id] = {
                count: 0,
                isLimited: false,
                isLimitLocked: false,
                limitPercent: null,
                feedLevel: 1,
                autofeed: DEFAULT_AUTOMATION_STATE(),
            };
        }
        this.normalizeLimitState(this.animalsState[id]);
        this.animalsState[id].feedLevel = this.normalizeFeedLevel(this.animalsState[id].feedLevel);
        this.animalsState[id].autofeed = this.normalizeAutofeedState(this.animalsState[id].autofeed);
        return this.animalsState[id];
    }

    normalizeAutofeedState(state) {
        const base = DEFAULT_AUTOMATION_STATE();
        if (!state) {
            return base;
        }
        return {
            isEnabled: !!state.isEnabled,
            rules: Array.isArray(state.rules) ? state.rules : [],
            pattern: typeof state.pattern === 'string' ? state.pattern : '',
        };
    }

    normalizeFeedLevel(value) {
        if (typeof value !== 'number' || isNaN(value)) {
            return 1;
        }
        if (value < 0) {
            return 0;
        }
        if (value > 1) {
            return 1;
        }
        return value;
    }

    normalizeLimitState(state) {
        if (!state) {
            return;
        }
        if (!state.isLimited) {
            state.limitPercent = null;
            return;
        }
        state.isLimitLocked = !!state.isLimitLocked;
        if (typeof state.limitPercent !== 'number' || isNaN(state.limitPercent)) {
            state.limitPercent = 0;
        }
        if (state.limitPercent >= 1) {
            state.isLimited = false;
            state.limitPercent = null;
        } else if (state.limitPercent < 0) {
            state.limitPercent = 0;
        }
    }

    getAnimalById(id) {
        if (!id) {
            return null;
        }
        return ZOO_ANIMALS.find((animal) => animal.id === id) || null;
    }

    getFeedRequirements(animal) {
        return animal?.attributes?.breedFeedRequirement || {};
    }

    getActiveFeedLevel(state) {
        const normalized = this.normalizeFeedLevel(state?.feedLevel ?? 1);
        const automation = this.normalizeAutofeedState(state?.autofeed);
        if (!automation.isEnabled) {
            return normalized;
        }
        const isMatching = checkMatchingRules(automation.rules, automation.pattern);
        return isMatching ? normalized : 0;
    }

    updateAutofeedActivation() {
        ZOO_ANIMALS.forEach((animal) => {
            const state = this.ensureAnimalState(animal.id);
            const automation = this.normalizeAutofeedState(state?.autofeed);
            if (!automation.isEnabled) {
                if (this.activeAutofeedLevels[animal.id] !== undefined) {
                    delete this.activeAutofeedLevels[animal.id];
                }
                return;
            }

            const baseLevel = this.normalizeFeedLevel(state.feedLevel);
            const isMatching = checkMatchingRules(automation.rules, automation.pattern);
            const activeLevel = isMatching ? baseLevel : 0;

            // console.log('AUTOEFF: ', animal.id, activeLevel, baseLevel, isMatching, this.activeAutofeedLevels[animal.id]);

            if (this.activeAutofeedLevels[animal.id] !== activeLevel) {
                this.activeAutofeedLevels[animal.id] = activeLevel;
                if (animal.feedEntityId) {
                    gameEntity.setAttribute(animal.feedEntityId, 'feed_level_multiplier', activeLevel);
                    this.syncAnimalLevels(animal, state);
                }
            }
        });
    }

    getBaseGrowthRate(feedLevel, feedEfficiency) {
        return 0.01 * feedLevel * feedEfficiency;
    }

    tick(game, delta) {
        if (!this.isUnlocked()) {
            return;
        }

        this.updateAutofeedActivation();

        const spaceResource = gameResources.getResource('magic_zoo_space');
        if (!spaceResource) {
            return;
        }
        const spaceIncome = spaceResource.income;
        if (spaceIncome <= SMALL_NUMBER || spaceResource.balance <= SMALL_NUMBER) {
            return;
        }

        const totalSpace = this.getTotalSpace();
        if (totalSpace <= SMALL_NUMBER) {
            let hasChanges = false;
            ZOO_ANIMALS.forEach((animal) => {
                const state = this.ensureAnimalState(animal.id);
                if (state.count > 0) {
                    state.count = 0;
                    hasChanges = true;
                }
                this.syncAnimalLevels(animal, state);
            });
            if (hasChanges) {
                this.sendZooData();
            }
            return;
        }

        let usedSpace = gameResources.getResource('magic_zoo_space')?.consumption || 0;
        let freeSpace = gameResources.getResource('magic_zoo_space')?.balance || 0;

        ZOO_ANIMALS.forEach((animal) => {
            const state = this.ensureAnimalState(animal.id);
            const limitValue = this.getAnimalLimitValue(animal.id, totalSpace);
            const limitRemaining = limitValue === null ? null : Math.max(0, limitValue - state.count);

            const feedLevel = this.activeAutofeedLevels[animal.id] ?? this.getActiveFeedLevel(state);
            const feedEfficiency = this.getFeedEfficiency(animal);
            const growthMultiplier = feedLevel * feedEfficiency;
            // console.log('Animal id: ', animal.id, ' growthMultiplier: ', this.getBaseGrowthRate(feedLevel, feedEfficiency), feedLevel, feedEfficiency, limitRemaining, animal.count, limitValue);
            
            if (growthMultiplier <= SMALL_NUMBER) {
                return;
            }

            const growth = delta * this.getBaseGrowthRate(feedLevel, feedEfficiency);
            if (growth <= SMALL_NUMBER) {
                return;
            }

            const allowedGrowth = Math.min(
                growth,
                limitRemaining ?? growth,
                freeSpace
            );

            if (allowedGrowth > SMALL_NUMBER) {
                state.count += allowedGrowth;
                usedSpace += allowedGrowth;
                freeSpace = Math.max(0, totalSpace - usedSpace);
                this.syncAnimalLevels(animal, state);
            }
        });

        this.applyLimits(totalSpace);
    }

    syncAnimalLevels(animal, state) {
        const value = state?.count || 0;
        gameEntity.setEntityLevel(animal.entityId, value, true);
        if (animal.feedEntityId) {
            gameEntity.setEntityLevel(animal.feedEntityId, value, true);
            gameEntity.setAttribute(animal.feedEntityId, 'feed_level_multiplier', this.getActiveFeedLevel(state));
        }
    }

    getFeedEfficiency(animal) {
        if (!animal.feedEntityId || !gameEntity.entityExists(animal.feedEntityId)) {
            return 0;
        }
        if(animal.feedEntityId === 'zoo_animal_magic_henk_feeding') {
           // console.log('Feed efficiency: ', animal.feedEntityId, gameEntity.getEntityEfficiency(animal.feedEntityId) ?? 0, gameResources.getResource('inventory_focusberry').targetEfficiency); 
        }
        return gameEntity.getEntityEfficiency(animal.feedEntityId) ?? 0;
    }

    getFeedBottleneck(animal) {
        if (!animal.feedEntityId || !gameEntity.entityExists(animal.feedEntityId)) {
            return null;
        }
        const entity = gameEntity.getEntity(animal.feedEntityId);
        if (!entity?.modifier?.bottleNeck) {
            return null;
        }
        return resourceResponse(gameResources.getResource(entity.modifier.bottleNeck));
    }

    buildFeedRequirementsData(animal, state, level, previewLevel) {
        const requirements = Object.entries(this.getFeedRequirements(animal));
        if (!requirements.length) {
            return [];
        }
        return requirements.map(([resourceId, amount]) => {
            const resource = resourceResponse(gameResources.getResource(resourceId));
            return {
                resource,
                perAnimal: amount,
                consumption: amount * state.count * level,
                previewConsumption: amount * state.count * previewLevel,
            };
        });
    }

    getTotalSpace() {
        const resource = gameResources.getResource('magic_zoo_space');
        return resource?.income || 0;
    }

    getTotalCount() {
        return ZOO_ANIMALS.reduce((acc, animal) => acc + (this.animalsState[animal.id]?.count || 0), 0);
    }

    getTotalLimitedPercent(excludeId = null) {
        return ZOO_ANIMALS.reduce((acc, animal) => {
            if (excludeId && animal.id === excludeId) {
                return acc;
            }
            const state = this.animalsState[animal.id];
            if (state?.isLimited && typeof state.limitPercent === 'number') {
                return acc + state.limitPercent;
            }
            return acc;
        }, 0);
    }

    normalizeTotalLimits(anchorId = null) {
        let totalLimitedPercent = 0;
        let lockedLimitedPercent = 0;
        const unlockedLimited = [];
        let anchorEntry = null;

        ZOO_ANIMALS.forEach((animal) => {
            const state = this.ensureAnimalState(animal.id);
            if (!state.isLimited || typeof state.limitPercent !== 'number' || state.limitPercent <= 0) {
                return;
            }
            totalLimitedPercent += state.limitPercent;
            if (state.isLimitLocked) {
                lockedLimitedPercent += state.limitPercent;
            } else if (anchorId && animal.id === anchorId) {
                anchorEntry = { id: animal.id, percent: state.limitPercent };
            } else {
                unlockedLimited.push({ id: animal.id, percent: state.limitPercent });
            }
        });

        if (totalLimitedPercent > 1 + SMALL_NUMBER) {
            const availablePercent = Math.max(0, 1 - lockedLimitedPercent);
            const anchorPercent = Math.min(anchorEntry?.percent ?? 0, availablePercent);
            const remainingPercent = Math.max(0, availablePercent - anchorPercent);
            const unlockedTotal = (totalLimitedPercent - lockedLimitedPercent) - (anchorEntry?.percent ?? 0);

            if (anchorEntry && anchorPercent !== anchorEntry.percent) {
                const anchorState = this.ensureAnimalState(anchorEntry.id);
                anchorState.limitPercent = anchorPercent;
            }

            if (unlockedTotal > SMALL_NUMBER) {
                unlockedLimited.forEach(({ id, percent }) => {
                    const proportion = percent / unlockedTotal;
                    const normalized = remainingPercent * proportion;
                    const state = this.ensureAnimalState(id);
                    state.limitPercent = normalized;
                });
            }
        }
    }

    getAnimalLimitValue(id, totalSpace) {
        const state = this.animalsState[id];
        if (!state?.isLimited || typeof state.limitPercent !== 'number') {
            return null;
        }
        return state.limitPercent * totalSpace;
    }

    buildAnimalSummary(animal, totalSpace) {
        const state = this.ensureAnimalState(animal.id);
        const limitValue = this.getAnimalLimitValue(animal.id, totalSpace);
        const currentEffects = gameEntity.entityExists(animal.entityId) ? gameEntity.getEffects(animal.entityId) : [];
        const feedLevel = this.getActiveFeedLevel(state);
        const feedEfficiency = this.getFeedEfficiency(animal);
        return {
            id: animal.id,
            name: animal.name,
            description: animal.description,
            icon: animal.icon,
            count: state.count,
            isLimited: state.isLimited,
            isLimitLocked: state.isLimitLocked,
            limitPercent: state.isLimited ? (state.limitPercent ?? 0) : 1,
            limitValue,
            effects: packEffects(currentEffects),
            feedLevel,
            feedEfficiency,
            effectiveGrowthMultiplier: feedLevel * feedEfficiency,
        };
    }

    getAnimalDetail(id, feedLevelOverride = null) {
        if (!this.isUnlocked()) {
            return null;
        }
        const animal = this.getAnimalById(id);
        if (!animal) {
            return null;
        }
        const totalSpace = this.getTotalSpace();
        const state = this.ensureAnimalState(animal.id);
        const summary = this.buildAnimalSummary(animal, totalSpace);
        const baseGrowthRate = 0.01 + 0.001 * state.count;
        const previewLevel = typeof feedLevelOverride === 'number' && !isNaN(feedLevelOverride)
            ? this.normalizeFeedLevel(feedLevelOverride)
            : summary.feedLevel;
        const previewEffectiveMultiplier = previewLevel * summary.feedEfficiency;

        const feedEffects = gameEntity.entityExists(animal.feedEntityId) ? gameEntity.getEffects(animal.feedEntityId, 0, null, false, 1, 1, feedLevelOverride) : [];
        // console.log('Feed effects: ', feedEffects);
        return {
            ...summary,
            feed: {
                level: summary.feedLevel,
                efficiency: summary.feedEfficiency,
                effectiveMultiplier: summary.effectiveGrowthMultiplier,
                previewLevel,
                previewEffectiveMultiplier,
                missingResource: this.getFeedBottleneck(animal),
                requirements: this.buildFeedRequirementsData(animal, state, summary.feedLevel, previewLevel),
                feedEffects,
            },
            breeding: {
                baseRate: this.getBaseGrowthRate(1,1),
                currentRate: this.getBaseGrowthRate(summary.feedLevel, summary.feedEfficiency),//baseGrowthRate * summary.effectiveGrowthMultiplier,
                previewRate: this.getBaseGrowthRate(previewLevel, summary.feedEfficiency),
            },
            autofeed: {
                ...this.normalizeAutofeedState(state.autofeed),
            }
        };
    }

    sendAnimalDetail(id, feedLevelOverride = null) {
        if (!id) {
            this.eventHandler.sendData('zoo-animal-details', null);
            return;
        }
        this.eventHandler.sendData('zoo-animal-details', this.getAnimalDetail(id, feedLevelOverride));
    }

    applyLimits(spaceOverride = null) {
        const totalSpace = spaceOverride ?? this.getTotalSpace();
        let hasChanges = false;
        ZOO_ANIMALS.forEach((animal) => {
            const state = this.ensureAnimalState(animal.id);
            const limitValue = this.getAnimalLimitValue(animal.id, totalSpace);
            if (limitValue !== null && state.count > limitValue + SMALL_NUMBER) {
                state.count = limitValue;
                this.syncAnimalLevels(animal, state);
                hasChanges = true;
            }
        });

        let totalCount = this.getTotalCount();
        if (totalCount > totalSpace + SMALL_NUMBER) {
            const overflow = totalCount - totalSpace;
            const unlimited = ZOO_ANIMALS.filter((animal) => !this.animalsState[animal.id]?.isLimited);
            const unlimitedTotal = unlimited.reduce((acc, animal) => acc + (this.animalsState[animal.id]?.count || 0), 0);
            if (unlimitedTotal > SMALL_NUMBER) {
                unlimited.forEach((animal) => {
                    const state = this.animalsState[animal.id];
                    const share = state.count / unlimitedTotal;
                    const reduction = overflow * share;
                    if (reduction > 0) {
                        state.count = Math.max(0, state.count - reduction);
                        this.syncAnimalLevels(animal, state);
                        hasChanges = true;
                    }
                });
            } else if (totalCount > SMALL_NUMBER) {
                const ratio = totalSpace > SMALL_NUMBER ? (totalSpace / totalCount) : 0;
                ZOO_ANIMALS.forEach((animal) => {
                    const state = this.animalsState[animal.id];
                    state.count = state.count * ratio;
                    this.syncAnimalLevels(animal, state);
                });
                hasChanges = true;
            }
        }

        if (hasChanges) {
            this.sendZooData();
        }
    }

    setAnimalLimit({ id, percent, isLimited }) {
        if (!id) {
            return;
        }
        const state = this.ensureAnimalState(id);
        const hasExplicitPercent = typeof percent === 'number' && !isNaN(percent);
        if (hasExplicitPercent) {
            const normalized = Math.max(0, Math.min(1, percent));
            if (normalized >= 1) {
                state.isLimited = false;
                state.limitPercent = null;
            } else {
                state.isLimited = true;
                state.limitPercent = normalized;
            }
        } else if (typeof isLimited === 'boolean') {
            state.isLimited = isLimited;
            if (!isLimited) {
                state.limitPercent = null;
            }
        }

        this.normalizeLimitState(state);

        this.normalizeTotalLimits(id);

        this.applyLimits();
        this.sendZooData();
    }

    toggleAnimalLimitLock({ id, isLocked }) {
        if (!id) {
            return;
        }

        const state = this.ensureAnimalState(id);
        state.isLimitLocked = !!isLocked;

        this.normalizeTotalLimits();
        this.applyLimits();
        this.sendZooData();
    }

    saveAnimalFeedSettings({ id, feedLevel, autofeed }) {
        if (!id) {
            return;
        }
        const animal = this.getAnimalById(id);
        if (!animal) {
            return;
        }
        const state = this.ensureAnimalState(id);
        const normalized = this.normalizeFeedLevel(typeof feedLevel === 'number' ? feedLevel : state.feedLevel);
        state.feedLevel = normalized;
        state.autofeed = this.normalizeAutofeedState(typeof autofeed === 'undefined' ? state.autofeed : autofeed);
        this.syncAnimalLevels(animal, state);
        this.sendZooData();
        this.sendAnimalDetail(id);
    }

    getZooData() {
        const totalSpace = this.getTotalSpace();
        const animals = ZOO_ANIMALS.map((animal) => this.buildAnimalSummary(animal, totalSpace));

        const totalPercent = this.getTotalLimitedPercent();
        const usedSpace = this.getTotalCount();
        return {
            unlocked: this.isUnlocked(),
            space: {
                total: totalSpace,
                used: usedSpace,
                free: Math.max(0, totalSpace - usedSpace),
            },
            limits: {
                totalPercent,
                remainingPercent: Math.max(0, 1 - totalPercent),
            },
            animals,
            automationUnlocked: gameEntity.getLevel('shop_item_planner') > 0,
        };
    }

    sendZooData() {
        this.eventHandler.sendData('zoo-data', this.getZooData());
    }

    save() {
        return {
            animals: this.animalsState,
            version: this.currentVersion,
        };
    }

    load(obj) {
        this.animalsState = DEFAULT_DATA();
        this.activeAutofeedLevels = {};
        if (obj?.animals) {
            ZOO_ANIMALS.forEach((animal) => {
                if (obj.animals[animal.id]) {
                    const saved = obj.animals[animal.id];
                    const state = this.animalsState[animal.id];
                    state.count = saved.count ?? 0;
                    state.isLimited = !!saved.isLimited;
                    state.isLimitLocked = !!saved.isLimitLocked;
                    state.limitPercent = typeof saved.limitPercent === 'number' ? saved.limitPercent : null;
                    state.feedLevel = this.normalizeFeedLevel(typeof saved.feedLevel === 'number' ? saved.feedLevel : 1);
                    state.autofeed = this.normalizeAutofeedState(saved.autofeed);
                    this.normalizeLimitState(state);
                }
            });
        }
        ZOO_ANIMALS.forEach((animal) => {
            this.syncAnimalLevels(animal, this.animalsState[animal.id]);
        });
        this.applyLimits();
    }

    reset() {
        this.animalsState = DEFAULT_DATA();
        this.activeAutofeedLevels = {};
        ZOO_ANIMALS.forEach((animal) => this.syncAnimalLevels(animal, this.animalsState[animal.id]));
        this.sendZooData();
    }
}
