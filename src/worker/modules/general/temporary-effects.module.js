import {GameModule} from "../../shared/game-module";
import {gameEffects, gameEntity, gameResources, resourceApi, resourceModifiers} from "game-framework";
import {registerTemporaryEffectsDB} from "./temporary-effects-db";

export class TemporaryEffectsModule extends GameModule {

    constructor() {
        super();
        this.runningEffects = {};
        this.currentVersion = null;
        this.relevantVersion = 1;
    }

    initialize() {
        registerTemporaryEffectsDB();
    }

    save() {
        return {
            effects: this.runningEffects,
            currentVersion: this.currentVersion,
        }
    }

    load(saveObject) {

        for(const key in this.runningEffects) {
            if(gameEntity.entityExists(key)) {
                gameEntity.setEntityLevel(key, 0, true);
                gameEntity.unsetEntity(key);
            }
        }
        this.runningEffects = {};
        if(saveObject?.effects && saveObject?.currentVersion && saveObject?.currentVersion >= this.relevantVersion) {
            for(const id in saveObject.effects) {
                this.runningEffects[id] = saveObject.effects[id];
                if(!this.runningEffects[id].level) {
                    this.runningEffects[id].level = 1;
                }
                if(this.runningEffects[id].duration && this.runningEffects[id].duration > 0) {
                    this.runningEffects[id].isRunning = true;
                    gameEntity.registerGameEntity(`active_${id}`, {
                        copyFromId: id,
                        isAbstract: false,
                        tags: ['active_temporary', 'active_effect'],
                        scope: 'events',
                        level: this.runningEffects[id].level,
                    });

                    gameEntity.setEntityLevel(`active_${id}`, this.runningEffects[id].level, true);
                    this.runningEffects[id].duration = saveObject.effects[id].duration;
                }
            }
        }

        this.currentVersion = this.relevantVersion;
        
    }

    tick(game, delta) {
        
        for(const itemId in this.runningEffects) {
            this.runningEffects[itemId].isCasted = false;

            if (this.runningEffects[itemId].duration > 0) {
                this.runningEffects[itemId].duration -= delta;
                if (gameEntity.entityExists(`active_${itemId}`)) {
                    gameEntity.setAttribute(`active_${itemId}`, 'current_duration', this.runningEffects[itemId].duration);
                }
            }
            if (this.runningEffects[itemId].duration <= 0 && this.runningEffects[itemId].isRunning) {
                this.runningEffects[itemId].duration = 0;
                this.runningEffects[itemId].isRunning = false;
                if (gameEntity.entityExists(`active_${itemId}`)) {
                    gameEntity.unsetEntity(`active_${itemId}`)
                }
            }
        }
    }

    triggerEffect(id, level = 1) {
        const effect = gameEntity.getEntity(id);

        if(!this.runningEffects[id]) {
            this.runningEffects[id] = {
                duration: 0,
                level,
            }
        } else {
            level = Math.max(level, this.runningEffects[id].level);
        }


        this.runningEffects[id].isRunning = true;
        // this.runningEffects[id].duration = 0;

        if(gameEntity.getAttribute(id, 'duration') && !gameEntity.entityExists(`active_${id}`)) {
            gameEntity.registerGameEntity(`active_${id}`, {
                copyFromId: id,
                isAbstract: false,
                level,
                tags: ['active_temporary', 'active_effect'],
                scope: 'events'
            });

            gameEntity.setEntityLevel(`active_${id}`, level ?? 1, true);
        }

        this.runningEffects[id].duration = gameEntity.getAttribute(id, 'duration');
        this.runningEffects[id].isRunning = true;
    }

}