import {gameEntity, gameCore} from "game-framework";
import {GameModule} from "../../shared/game-module";
import {initRitualsDB} from "./rituals-db";
import {checkMatchingRules} from "../../shared/utils/rule-utils";
import { entityResponse } from "../../shared/utils/transform/entities";

export class RitualModule extends GameModule {

    constructor() {
        super();
        this.rituals = {};
        this.switchCooldown = 0;
        this.autoCheckCooldown = 0;

        this.eventHandler.registerHandler('toggle-ritual', payload => {
            this.toggleRitual(payload.id);
        });

        this.eventHandler.registerHandler('query-rituals', () => {
            this.sendRitualData();
        });

        this.eventHandler.registerHandler('query-ritual-details', payload => {
            this.sendRitualDetails(payload.id);
        });

        this.eventHandler.registerHandler('save-ritual-settings', payload => {
            this.saveSettings(payload);
        });

        this.eventHandler.registerHandler('set-ritual-monitored', payload => {
            this.setMonitored(payload);
        })
    }

    initialize() {
        initRitualsDB();
    }

    tick(game, delta) {
        if(this.switchCooldown > 0) {
            this.switchCooldown -= delta;
        }

        this.autoCheckCooldown -= delta;

        if(this.autoCheckCooldown <= 0) {
            const availableRituals = gameEntity.listEntitiesByTags(['magic-ritual']).filter(entity => entity.isUnlocked);

            availableRituals.forEach(entity => {
                if(!this.rituals[entity.id]) {
                    this.rituals[entity.id] = { isRunning: false, autocast: { rules: [] } };
                }
                const ritualState = this.rituals[entity.id];
                if(!ritualState?.autocast?.isEnabled) return;

                const isMatching = checkMatchingRules(ritualState.autocast?.rules || [], ritualState.autocast?.pattern);

                if(isMatching && !ritualState.isRunning && this.switchCooldown <= 0) {
                    this.toggleRitual(entity.id);
                }

                if(!isMatching && ritualState.isRunning && this.switchCooldown <= 0) {
                    this.toggleRitual(entity.id);
                }
            });

            this.autoCheckCooldown = 1;
        }
    }

    save() {
        return {
            rituals: this.rituals,
        }
    }

    load(saveObj) {
        this.rituals = saveObj?.rituals || {};
        for(const id in this.rituals) {
            if(this.rituals[id]?.isRunning) {
                this.activateRitual(id, true);
            }
        }
    }

    reset() {
        this.load({});
    }

    setMonitored({ id }) {
        if(!id) {
            this.monitorData = null;
            return;
        }
        this.monitorData = { id };
    }

    toggleRitual(id) {
        const entity = gameEntity.getEntity(id);
        if(!entity || !entity.isUnlocked) return;

        if(this.switchCooldown > 0) return;

        if(!this.rituals[id]) {
            this.rituals[id] = { isRunning: false, autocast: { rules: [] } };
        }

        if(this.rituals[id].isRunning) {
            this.deactivateRitual(id);
            this.switchCooldown = 60;
            this.sendRitualData();
            return;
        }

        for(const key in this.rituals) {
            if(this.rituals[key]?.isRunning) {
                this.deactivateRitual(key);
            }
        }

        this.activateRitual(id);
        this.switchCooldown = 60;
        this.sendRitualData();
    }

    activateRitual(id, skipCooldown = false) {
        const entity = gameEntity.getEntity(id);
        if(!entity) return;
        this.rituals[id] = {
            ...(this.rituals[id] || {}),
            isRunning: true,
        };
        gameEntity.registerGameEntity(`active_${id}`, {
            copyFromId: id,
            isAbstract: false,
            tags: ['active_ritual', 'active_effect'],
            scope: 'rituals',
            unlockedBy: undefined,
        });
        gameEntity.setEntityLevel(`active_${id}`, entity?.level ?? 1);
        if(!skipCooldown) {
            this.switchCooldown = 60;
        }
    }

    deactivateRitual(id) {
        this.rituals[id] = {
            ...(this.rituals[id] || {}),
            isRunning: false,
        }
        if(gameEntity.entityExists(`active_${id}`)) {
            gameEntity.unsetEntity(`active_${id}`);
        }
    }

    saveSettings(payload) {
        if(!payload.id) return;
        if(!this.rituals[payload.id]) {
            this.rituals[payload.id] = { isRunning: false };
        }
        this.rituals[payload.id].autocast = payload.autocast;
    }

    regenerateNotifications() {
        const entities = gameEntity.listEntitiesByTags(['magic-ritual']);

        entities.forEach(item => {
            gameCore.getModule('unlock-notifications').registerNewNotification(
                'spellbook',
                'spellbook',
                'rituals',
                `ritual_${item.id}`,
                item.isUnlocked
            );
        });
    }

    sendRitualData() {
        const items = gameEntity.listEntitiesByTags(['magic-ritual']);
        const response = items.map(ritual => ({
            ...entityResponse(ritual),
            isActive: this.rituals[ritual.id]?.isRunning || false,
            autocast: this.rituals[ritual.id]?.autocast || { rules: [] },
            monitored: this.monitorData?.id === ritual.id,
            switchCooldown: Math.max(this.switchCooldown, 0),
        }));
        this.eventHandler.sendData('rituals-data', { available: response });
    }

    sendRitualDetails(id) {
        const ritual = gameEntity.getEntity(id);
        if(!ritual) return;
        const potentialEffects = gameEntity.getEffects(id, 0, ritual.level, true);

        this.eventHandler.sendData('ritual-details', {
            ...entityResponse(ritual),
            potentialEffects,
            isActive: this.rituals[id]?.isRunning || false,
            autocast: this.rituals[id]?.autocast || { rules: [] },
        });
    }
}

