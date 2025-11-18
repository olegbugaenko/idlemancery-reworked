import {GameModule} from "../../shared/game-module";
import {gameEntity, gameResources} from "game-framework";
import {registerZooAnimals, ZOO_ANIMALS} from "./zoo-db";
import {packEffects} from "../../shared/utils/objects";
import {SMALL_NUMBER} from "game-framework/src/utils/consts";
import {resourceResponse} from "../../shared/utils/transform/resources";

const DEFAULT_DATA = () => ZOO_ANIMALS.reduce((acc, animal) => {
    acc[animal.id] = {
        count: 0,
        isLimited: false,
        limitPercent: null,
        feedLevel: 1,
    };
    return acc;
}, {});

export class ZooModule extends GameModule {

    constructor() {
        super();
        this.animalsState = DEFAULT_DATA();
        this.currentVersion = 2;

        this.eventHandler.registerHandler('query-zoo-data', () => {
            this.sendZooData();
        });

        this.eventHandler.registerHandler('set-zoo-limit', (payload) => {
            this.setAnimalLimit(payload || {});
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
                limitPercent: null,
                feedLevel: 1,
            };
        }
        this.normalizeLimitState(this.animalsState[id]);
        this.animalsState[id].feedLevel = this.normalizeFeedLevel(this.animalsState[id].feedLevel);
        return this.animalsState[id];
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
        return this.normalizeFeedLevel(state?.feedLevel ?? 1);
    }

    tick(game, delta) {
        if (!this.isUnlocked()) {
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

        let usedSpace = this.getTotalCount();
        let freeSpace = Math.max(0, totalSpace - usedSpace);

        ZOO_ANIMALS.forEach((animal) => {
            const state = this.ensureAnimalState(animal.id);
            this.syncAnimalLevels(animal, state);
            const limitValue = this.getAnimalLimitValue(animal.id, totalSpace);
            const limitRemaining = limitValue === null ? null : Math.max(0, limitValue - state.count);

            const hasLimitRoom = limitRemaining === null ? true : limitRemaining > SMALL_NUMBER;
            if (!hasLimitRoom || freeSpace <= SMALL_NUMBER) {
                return;
            }

            const feedLevel = this.getActiveFeedLevel(state);
            const feedEfficiency = this.getFeedEfficiency(animal);
            const growthMultiplier = feedLevel * feedEfficiency;
            if (growthMultiplier <= SMALL_NUMBER) {
                return;
            }

            const growth = delta * (0.01 + 0.001 * state.count) * growthMultiplier;
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
            return 1;
        }
        return gameEntity.getEntityEfficiency(animal.feedEntityId) ?? 1;
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
            },
            breeding: {
                baseRate: baseGrowthRate,
                currentRate: baseGrowthRate * summary.effectiveGrowthMultiplier,
                previewRate: baseGrowthRate * previewEffectiveMultiplier,
            },
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
                const otherPercent = this.getTotalLimitedPercent(id);
                const allowed = Math.max(0, 1 - otherPercent);
                state.isLimited = true;
                state.limitPercent = Math.min(normalized, allowed);
            }
        } else if (typeof isLimited === 'boolean') {
            state.isLimited = isLimited;
            if (!isLimited) {
                state.limitPercent = null;
            }
        }

        this.normalizeLimitState(state);

        this.applyLimits();
        this.sendZooData();
    }

    saveAnimalFeedSettings({ id, feedLevel }) {
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
        if (obj?.animals) {
            ZOO_ANIMALS.forEach((animal) => {
                if (obj.animals[animal.id]) {
                    const saved = obj.animals[animal.id];
                    const state = this.animalsState[animal.id];
                    state.count = saved.count ?? 0;
                    state.isLimited = !!saved.isLimited;
                    state.limitPercent = typeof saved.limitPercent === 'number' ? saved.limitPercent : null;
                    state.feedLevel = this.normalizeFeedLevel(typeof saved.feedLevel === 'number' ? saved.feedLevel : 1);
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
        ZOO_ANIMALS.forEach((animal) => this.syncAnimalLevels(animal, this.animalsState[animal.id]));
        this.sendZooData();
    }
}
