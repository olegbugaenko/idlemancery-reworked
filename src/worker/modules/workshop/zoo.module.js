import {GameModule} from "../../shared/game-module";
import {gameCore, gameEntity, gameResources, gameEffects} from "game-framework";
import {registerZooAnimals, ZOO_ANIMALS} from "./zoo-db";
import {packEffects} from "../../shared/utils/objects";
import {SMALL_NUMBER} from "game-framework/src/utils/consts";
import {resourceResponse} from "../../shared/utils/transform/resources";
import {checkMatchingRules} from "../../shared/utils/rule-utils";

const DEFAULT_DATA = () => ZOO_ANIMALS.reduce((acc, animal) => {
    acc[animal.id] = {
        count: 0,
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
        this.currentVersion = 3;
        this.activeAutofeedLevels = {};

        this.eventHandler.registerHandler('query-zoo-data', () => {
            this.sendZooData();
        });

        this.eventHandler.registerHandler('query-zoo-animal-details', (payload = {}) => {
            this.sendAnimalDetail(payload.id, payload.feedLevelOverride);
        });

        this.eventHandler.registerHandler('save-zoo-feed-settings', (payload = {}) => {
            this.saveAnimalFeedSettings(payload);
        });
    }

    /**
     * Returns the effective feed level considering user setting, automation rules and capacity cap.
     * - If automation rules disable feeding → 0
     * - If animal is at capacity → 0
     * - Otherwise → user's feed level
     */
    getEffectiveFeedLevel(animal, state, totalSpace = null) {
        const baseLevel = this.getActiveFeedLevel(state);
        if (baseLevel <= SMALL_NUMBER) {
            return 0;
        }
        const space = totalSpace ?? this.getTotalSpace();
        const maxCount = this.getAnimalMaxCount(animal, space);
        if (state.count >= maxCount - SMALL_NUMBER) {
            return 0;
        }
        return baseLevel;
    }

    initialize() {
        registerZooAnimals();
    }

    regenerateNotifications() {
        ZOO_ANIMALS.forEach(animal => {
            const isUnlocked = this.isUnlocked() && gameEntity.isEntityUnlocked(animal.entityId);
            gameCore.getModule('unlock-notifications').registerNewNotification(
                'zoo',
                'zoo',
                'all',
                `zoo_${animal.id}`,
                isUnlocked
            );
        });
    }

    isUnlocked() {
        return gameEntity.getLevel('shop_item_magical_zoo') > 0;
    }

    ensureAnimalState(id) {
        if (!this.animalsState[id]) {
            this.animalsState[id] = {
                count: 0,
                feedLevel: 1,
                autofeed: DEFAULT_AUTOMATION_STATE(),
            };
        }
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
        const totalSpace = this.getTotalSpace();
        ZOO_ANIMALS.forEach((animal) => {
            // Only process unlocked animals
            if (!gameEntity.isEntityUnlocked(animal.entityId)) {
                // Clear autofeed level for unlocked animals
                if (this.activeAutofeedLevels[animal.id] !== undefined) {
                    delete this.activeAutofeedLevels[animal.id];
                }
                return;
            }

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
            const preliminaryLevel = isMatching ? baseLevel : 0;
            const activeLevel = this.getEffectiveFeedLevel(animal, state, totalSpace) * (preliminaryLevel > 0 ? 1 : 0);

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

    getBaseGrowthRate(feedLevel, feedEfficiency, breedingEffectId = null) {
        let breedingMultiplier = 1;
        if (breedingEffectId) {
            breedingMultiplier = gameEffects.getEffectValue(breedingEffectId) || 1;
        }
        return 0.01 * feedLevel * feedEfficiency * breedingMultiplier;
    }

    getRequiredSpace(animal) {
        const space = animal?.attributes?.requiredSpace;
        if (typeof space !== 'number' || isNaN(space) || space <= SMALL_NUMBER) {
            return 1;
        }
        return space;
    }

    getAnimalMaxCount(animal, totalSpace = null) {
        const space = totalSpace ?? this.getTotalSpace();
        const requiredSpace = this.getRequiredSpace(animal);
        if (requiredSpace <= SMALL_NUMBER) {
            return Infinity;
        }
        return space / requiredSpace;
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

        ZOO_ANIMALS.forEach((animal) => {
            // Only process unlocked animals
            if (!gameEntity.isEntityUnlocked(animal.entityId)) {
                return;
            }

            const state = this.ensureAnimalState(animal.id);
            const feedLevel = this.activeAutofeedLevels[animal.id] ?? this.getEffectiveFeedLevel(animal, state, totalSpace);
            const feedEfficiency = this.getFeedEfficiency(animal);
            const growthMultiplier = feedLevel * feedEfficiency;
            
            if (growthMultiplier <= SMALL_NUMBER) {
                return;
            }

            const breedingEffectId = animal.attributes?.breedingEffectId;
            const growth = delta * this.getBaseGrowthRate(feedLevel, feedEfficiency, breedingEffectId);
            if (growth <= SMALL_NUMBER) {
                return;
            }

            const maxCount = this.getAnimalMaxCount(animal, totalSpace);
            const remainingSpace = maxCount - state.count;
            if (remainingSpace <= SMALL_NUMBER) {
                return;
            }

            const allowedGrowth = Math.min(growth, remainingSpace);

            if (allowedGrowth > SMALL_NUMBER) {
                state.count += allowedGrowth;
                this.syncAnimalLevels(animal, state);
            }
        });

        this.applyLimits(totalSpace);
    }

    syncAnimalLevels(animal, state) {
        // Only sync levels for unlocked animals
        if (!gameEntity.isEntityUnlocked(animal.entityId)) {
            // Reset to 0 if not unlocked
            if (gameEntity.entityExists(animal.entityId)) {
                gameEntity.setEntityLevel(animal.entityId, 0, true);
            }
            if (animal.feedEntityId && gameEntity.entityExists(animal.feedEntityId)) {
                gameEntity.setEntityLevel(animal.feedEntityId, 0, true);
            }
            return;
        }

        const value = state?.count || 0;
        gameEntity.setEntityLevel(animal.entityId, value, true);
        if (animal.feedEntityId) {
            const totalSpace = this.getTotalSpace();
            gameEntity.setEntityLevel(animal.feedEntityId, value, true);
            gameEntity.setAttribute(animal.feedEntityId, 'feed_level_multiplier', this.getEffectiveFeedLevel(animal, state, totalSpace));
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
        return (resource?.income || 0)*(resource?.multiplier || 1);
    }

    getTotalCount() {
        return ZOO_ANIMALS.reduce((acc, animal) => acc + (this.animalsState[animal.id]?.count || 0), 0);
    }

    buildAnimalSummary(animal, totalSpace) {
        const state = this.ensureAnimalState(animal.id);
        const currentEffects = gameEntity.entityExists(animal.entityId) ? gameEntity.getEffects(animal.entityId) : [];
        const feedLevel = this.getEffectiveFeedLevel(animal, state, totalSpace);
        const feedEfficiency = this.getFeedEfficiency(animal);
        const requiredSpace = this.getRequiredSpace(animal);
        return {
            id: animal.id,
            name: animal.name,
            tags: animal.tags,
            description: animal.description,
            icon: animal.icon,
            count: state.count,
            effects: packEffects(currentEffects),
            feedLevel,
            feedEfficiency,
            effectiveGrowthMultiplier: feedLevel * feedEfficiency,
            capacity: {
                requiredSpace,
                maxCount: this.getAnimalMaxCount(animal, totalSpace),
            },
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

        // Recalculate efficiency for preview using the preview feed level
        let previewFeedEfficiency = summary.feedEfficiency;
        if (animal.feedEntityId && typeof feedLevelOverride === 'number' && !isNaN(feedLevelOverride)) {
            const originalMultiplier = gameEntity.getAttribute(animal.feedEntityId, 'feed_level_multiplier', summary.feedLevel);
            gameEntity.setAttribute(animal.feedEntityId, 'feed_level_multiplier', previewLevel);
            previewFeedEfficiency = this.getFeedEfficiency(animal);
            gameEntity.setAttribute(animal.feedEntityId, 'feed_level_multiplier', originalMultiplier);
        }
        const previewEffectiveMultiplier = previewLevel * previewFeedEfficiency;

        const feedEffects = gameEntity.entityExists(animal.feedEntityId) ? gameEntity.getEffects(animal.feedEntityId, 0, null, false, 1, 1, feedLevelOverride) : [];
        console.log('Feed effects: ', feedLevelOverride, previewLevel);
        console.log('Breeding multiplier: ', animal.attributes?.breedingEffectId, gameEffects.getEffectValue(animal.attributes?.breedingEffectId), this.getBaseGrowthRate(1, 1, animal.attributes?.breedingEffectId));
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
                baseRate: this.getBaseGrowthRate(1, 1, animal.attributes?.breedingEffectId),
                currentRate: this.getBaseGrowthRate(summary.feedLevel, summary.feedEfficiency, animal.attributes?.breedingEffectId),
                previewRate: this.getBaseGrowthRate(previewLevel, previewFeedEfficiency, animal.attributes?.breedingEffectId),
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
            // Only apply limits to unlocked animals
            if (!gameEntity.isEntityUnlocked(animal.entityId)) {
                // Reset count to 0 for unlocked animals
                const state = this.animalsState[animal.id];
                if (state && state.count > SMALL_NUMBER) {
                    state.count = 0;
                    this.syncAnimalLevels(animal, state);
                    hasChanges = true;
                }
                return;
            }

            const state = this.animalsState[animal.id];
            const maxCount = this.getAnimalMaxCount(animal, totalSpace);
            const clamped = Math.max(0, Math.min(state.count, maxCount));
            if (Math.abs(clamped - state.count) > SMALL_NUMBER) {
                state.count = clamped;
                this.syncAnimalLevels(animal, state);
                hasChanges = true;
            }
        });

        if (hasChanges) {
            this.sendZooData();
        }
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
        const animals = ZOO_ANIMALS
            .filter((animal) => gameEntity.isEntityUnlocked(animal.entityId))
            .map((animal) => this.buildAnimalSummary(animal, totalSpace));

        return {
            unlocked: this.isUnlocked(),
            space: {
                total: totalSpace,
                used: 0,
                free: totalSpace,
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
                    state.feedLevel = this.normalizeFeedLevel(typeof saved.feedLevel === 'number' ? saved.feedLevel : 1);
                    state.autofeed = this.normalizeAutofeedState(saved.autofeed);
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
