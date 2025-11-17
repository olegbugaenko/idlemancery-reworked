import {GameModule} from "../../shared/game-module";
import {gameEntity, gameResources} from "game-framework";
import {registerZooAnimals, ZOO_ANIMALS} from "./zoo-db";
import {packEffects} from "../../shared/utils/objects";
import {SMALL_NUMBER} from "game-framework/src/utils/consts";

const DEFAULT_DATA = () => ZOO_ANIMALS.reduce((acc, animal) => {
    acc[animal.id] = {
        count: 0,
        isLimited: false,
        limitPercent: null,
    };
    return acc;
}, {});

export class ZooModule extends GameModule {

    constructor() {
        super();
        this.animalsState = DEFAULT_DATA();
        this.currentVersion = 1;

        this.eventHandler.registerHandler('query-zoo-data', () => {
            this.sendZooData();
        });

        this.eventHandler.registerHandler('set-zoo-limit', (payload) => {
            this.setAnimalLimit(payload || {});
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
            };
        }
        return this.animalsState[id];
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
                    this.syncAnimalLevel(animal, 0);
                    hasChanges = true;
                }
            });
            if (hasChanges) {
                this.sendZooData();
            }
            return;
        }

        let changed = false;
        ZOO_ANIMALS.forEach((animal) => {
            const state = this.ensureAnimalState(animal.id);
            if (!state.isLimited) {
                const growth = delta * (0.01 + 0.001 * state.count);
                if (growth > 0) {
                    state.count += growth;
                    this.syncAnimalLevel(animal, state.count);
                    changed = true;
                }
            }
        });

        if (changed) {
            this.applyLimits(totalSpace);
        }
    }

    syncAnimalLevel(animal, value) {
        gameEntity.setEntityLevel(animal.entityId, value, true);
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

    applyLimits(spaceOverride = null) {
        const totalSpace = spaceOverride ?? this.getTotalSpace();
        let hasChanges = false;
        ZOO_ANIMALS.forEach((animal) => {
            const state = this.ensureAnimalState(animal.id);
            const limitValue = this.getAnimalLimitValue(animal.id, totalSpace);
            if (limitValue !== null && state.count > limitValue + SMALL_NUMBER) {
                state.count = limitValue;
                this.syncAnimalLevel(animal, state.count);
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
                        this.syncAnimalLevel(animal, state.count);
                        hasChanges = true;
                    }
                });
            } else if (totalCount > SMALL_NUMBER) {
                const ratio = totalSpace > SMALL_NUMBER ? (totalSpace / totalCount) : 0;
                ZOO_ANIMALS.forEach((animal) => {
                    const state = this.animalsState[animal.id];
                    state.count = state.count * ratio;
                    this.syncAnimalLevel(animal, state.count);
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
        if (typeof isLimited === 'boolean') {
            state.isLimited = isLimited;
            if (!isLimited) {
                state.limitPercent = null;
            }
        }

        if (hasExplicitPercent) {
            state.isLimited = true;
        }

        if (state.isLimited) {
            const otherPercent = this.getTotalLimitedPercent(id);
            const allowed = Math.max(0, 1 - otherPercent);
            const normalized = hasExplicitPercent ? Math.max(0, Math.min(1, percent)) : (state.limitPercent ?? allowed);
            state.limitPercent = Math.min(normalized, allowed);
        }

        this.applyLimits();
        this.sendZooData();
    }

    getZooData() {
        const totalSpace = this.getTotalSpace();
        const animals = ZOO_ANIMALS.map((animal) => {
            const state = this.ensureAnimalState(animal.id);
            const limitValue = this.getAnimalLimitValue(animal.id, totalSpace);
            const currentEffects = gameEntity.entityExists(animal.entityId) ? gameEntity.getEffects(animal.entityId) : [];
            return {
                id: animal.id,
                name: animal.name,
                description: animal.description,
                icon: animal.icon,
                count: state.count,
                isLimited: state.isLimited,
                limitPercent: state.isLimited ? (state.limitPercent ?? 0) : null,
                limitValue,
                effects: packEffects(currentEffects),
            };
        });

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
                    this.animalsState[animal.id] = {
                        count: saved.count ?? 0,
                        isLimited: !!saved.isLimited,
                        limitPercent: typeof saved.limitPercent === 'number' ? saved.limitPercent : null,
                    };
                }
            });
        }
        ZOO_ANIMALS.forEach((animal) => {
            this.syncAnimalLevel(animal, this.animalsState[animal.id].count);
        });
        this.applyLimits();
    }

    reset() {
        this.animalsState = DEFAULT_DATA();
        ZOO_ANIMALS.forEach((animal) => this.syncAnimalLevel(animal, 0));
        this.sendZooData();
    }
}
