import {registerActionsStage1} from "./actions-db";
import {GameModule} from "../../shared/game-module";
import {gameEntity, gameResources} from "game-framework";

export class ActionsModule extends GameModule {

    constructor() {
        super();
        this.activeAction = null;
        this.actions = {};
        this.eventHandler.registerHandler('run-action', (payload) => {
            this.setRunningAction(payload.id);
        })

        this.eventHandler.registerHandler('query-actions-data', (payload) => {
            this.sendActionsData()
        })

        this.eventHandler.registerHandler('query-action-details', (payload) => {
            this.sendActionDetails(payload.id)
        })
    }

    initialize() {

        registerActionsStage1();
        this.actions = {};

        gameEntity.registerGameEntity('runningAction', {
            name: 'Idling',
            level: 0,
        })
    }

    getActionXPMax(id) {
        const lvl = this.actions[id]?.level ?? 1;
        return gameEntity.getAttribute(id, 'baseXPCost', 50)*Math.pow(1.01, lvl-1)*(0.8 + 0.2*lvl);
    }

    tick(game, delta) {
        for(let key in this.actions) {
            this.actions[key].isLeveled = false;
        }
        if(this.activeAction) {
            if(!this.actions[this.activeAction]) {
                this.actions[this.activeAction] = {
                    level: 1,
                    xp: 0
                }
            }
            this.actions[this.activeAction].xp += delta*this.getLearningRate('runningAction');
            if(this.actions[this.activeAction].xp >= this.getActionXPMax(this.activeAction)) {
                this.actions[this.activeAction].level++;
                this.actions[this.activeAction].xp = 0;
                gameEntity.setEntityLevel('runningAction', this.actions[this.activeAction].level, true);
                gameEntity.setEntityLevel(this.activeAction, this.actions[this.activeAction].level, true);
                console.log('Leveled up: ', gameEntity.getLevel('runningAction'), gameEntity.getLevel(this.activeAction));
                this.actions[this.activeAction].isLeveled = true;
                this.sendActionsData();
            }
        }
    }

    save() {
        return {
            actions: this.actions,
            activeAction: this.activeAction,
        }
    }

    load(saveObject) {
        for(const key in this.actions) {
            this.setAction(key, 0, true);
        }
        this.actions = {};
        if(saveObject?.actions) {
            for(const id in saveObject.actions) {
                this.setAction(id, saveObject.actions[id].level, true);
                this.actions[id].xp = saveObject.actions[id].xp;
            }
        }
        if(saveObject.activeAction) {
            this.setRunningAction(saveObject.activeAction);
        }
        this.sendActionsData();
    }

    setAction(actionId, amount, bForce = false) {
        gameEntity.setEntityLevel(actionId, amount, bForce);
        if(!this.actions[actionId]) {
            this.actions[actionId] = {
                level: amount,
                xp: 0,
            }
        }
        this.actions[actionId].level = amount;
    }

    getLearningRate(id, eff) {
        const entEff = gameEntity.getEntityEfficiency(id);
        if(eff == null) {
            eff = entEff;
        }

        return eff;
    }

    setRunningAction(id) {
        console.log('Running: ', id)
        if(id !== this.activeAction) {
            gameEntity.unsetEntity('runningAction');

            if(id) {
                const rn = gameEntity.registerGameEntity('runningAction', {
                    copyFromId: id,
                    level: this.actions[id]?.level ?? 1,
                    allowedImpacts: ['resources'],
                    tags: ['running'],
                })

                gameEntity.setEntityLevel('runningAction', this.actions[id]?.level ?? 1);

                console.log('Rnn: ', rn, gameResources.resources);
            }

            this.activeAction = id;

            this.sendActionsData()
        }
    }

    getActionsData() {
        const entities = gameEntity.listEntitiesByTags(['action']);
        const available = entities.filter(one => one.isUnlocked).map(entity => ({
            id: entity.id,
            name: entity.name,
            description: entity.description,
            max: entity.getMaxLevel ? entity.getMaxLevel() : entity.maxLevel || 0,
            level: this.actions[entity.id]?.level || 1,
            affordable: gameEntity.getAffordable(entity.id),
            potentialEffects: gameEntity.getEffects(entity.id, 0, this.actions[entity.id]?.level || 1, true),
            xp: this.actions[entity.id]?.xp || 0,
            maxXP: this.getActionXPMax(entity.id),
            isActive: this.activeAction === entity.id,
            xpRate: this.activeAction === entity.id ? this.getLearningRate('runningAction') : this.getLearningRate(entity.id, 1),
            isLeveled: this.actions[entity.id]?.isLeveled
        }))

        const current = this.activeAction ? available.find(id => id === this.activeAction) : null;

        return {
            available,
            current
        }
    }

    getActionData(id) {
        if(!id) {
            return null;
        }
        const entities = gameEntity.listEntitiesByTags(['action']);
        const entity = entities.find(one => one.id === id);

        const entityData = {
            id: entity.id,
            name: entity.name,
            description: entity.description,
            max: entity.getMaxLevel ? entity.getMaxLevel() : entity.maxLevel || 0,
            level: this.actions[entity.id]?.level || 1,
            affordable: gameEntity.getAffordable(entity.id),
            potentialEffects: gameEntity.getEffects(entity.id, 0, this.actions[entity.id]?.level || 1, true),
            xp: this.actions[entity.id]?.xp || 0,
            maxXP: this.getActionXPMax(entity.id),
            isActive: this.activeAction === entity.id,
            xpRate: this.activeAction === entity.id ? this.getLearningRate('runningAction') : this.getLearningRate(entity.id, 1),
            isLeveled: this.actions[entity.id]?.isLeveled
        };

        return entityData;
    }

    sendActionsData() {
        const data = this.getActionsData();
        this.eventHandler.sendData('actions-data', data);
    }

    sendActionDetails(id) {
        const data = this.getActionData(id);
        this.eventHandler.sendData('action-details', data);
    }

}