import {registerActionsStage1} from "./actions-db";
import {GameModule} from "../../shared/game-module";
import {gameEntity, gameResources, gameEffects} from "game-framework";
import {ActionListsSubmodule} from "./action-lists.submodule";

export class ActionsModule extends GameModule {

    constructor() {
        super();
        this.activeAction = null;
        this.actions = {};
        this.selectedFilterId = 'all';
        this.lists = new ActionListsSubmodule();
        this.focus = null;

        this.eventHandler.registerHandler('run-action', (payload) => {
            if(payload.isForce) {
                this.lists.stopList();
            }
            this.setRunningAction(payload.id);
        })

        this.eventHandler.registerHandler('query-actions-data', (payload) => {
            this.sendActionsData(this.selectedFilterId)
        })

        this.eventHandler.registerHandler('query-actions-unlocks', () => {
            this.sendActionsUnlocks()
        })

        this.eventHandler.registerHandler('query-action-details', (payload) => {
            this.sendActionDetails(payload.id)
        })

        this.eventHandler.registerHandler('set-selected-actions-filter', ({filterId}) => {
            this.selectedFilterId = filterId;
        })

        this.filters = [{
            id: 'all',
            name: 'All',
            tags: [],
            isDefault: true,
        },{
            id: 'jobs',
            name: 'Jobs',
            tags: ['job'],
            isDefault: true,
        },{
            id: 'training',
            name: 'Training',
            tags: ['training'],
            isDefault: true,
        },{
            id: 'gathering',
            name: 'Gathering',
            tags: ['gathering'],
            isDefault: true,
        },{
            id: 'other_activity',
            name: 'Activities',
            tags: ['activity'],
            isDefault: true,
        }]
    }

    initialize() {

        gameEffects.registerEffect('rest_efficiency', {
            name: 'Rest Efficiency',
            defaultValue: 1.,
            minValue: 1,
        })

        gameEffects.registerEffect('begging_efficiency', {
            name: 'Begging Efficiency',
            defaultValue: 1.,
            minValue: 1,
        })

        gameEffects.registerEffect('clean_stable_efficiency', {
            name: 'Clean Stable Efficiency',
            defaultValue: 1.,
            minValue: 1,
        })

        gameEffects.registerEffect('gathering_efficiency', {
            name: 'Gathering Efficiency',
            defaultValue: 1.,
            minValue: 1,
        })

        gameEffects.registerEffect('read_books_efficiency', {
            name: 'Read Books Efficiency',
            defaultValue: 1.,
            minValue: 1,
        })

        gameEffects.registerEffect('books_learning_rate', {
            name: 'Read Books Learning Rate',
            defaultValue: 1.,
            minValue: 1,
        })

        gameEffects.registerEffect('max_focus_time', {
            name: 'Max focus time',
            defaultValue: 300.,
            minValue: 300,
        })

        gameEffects.registerEffect('coins_earned_bonus', {
            name: 'Coins Earning Bonus',
            defaultValue: 1.,
            minValue: 1,
        })

        gameEffects.registerEffect('physical_training_learn_speed', {
            name: 'Physical Training Learning',
            defaultValue: 1.,
            minValue: 1,
        })

        registerActionsStage1();
        this.actions = {};

        gameEffects.registerEffect('learning_rate', {
            name: 'Learning Rate',
            defaultValue: 1.,
            minValue: 1,
        })

        gameEffects.registerEffect('walking_learning_rate', {
            name: 'Walking Learning Rate',
            defaultValue: 1.,
            minValue: 1,
        })

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
            if(!this.focus) {
                this.focus = {
                    time: 0,
                }
            }
            this.focus.time += delta;
            this.focus.bonus = this.getFocusBonus();
            const dxp = delta*this.getLearningRate('runningAction');
            this.actions[this.activeAction].xp += dxp;
            gameResources.addResource('mage-xp', dxp);
            if(this.actions[this.activeAction].xp >= this.getActionXPMax(this.activeAction)) {
                this.actions[this.activeAction].level++;
                this.actions[this.activeAction].xp = 0;
                gameEntity.setEntityLevel('runningAction', this.actions[this.activeAction].level, true);
                gameEntity.setEntityLevel(this.activeAction, this.actions[this.activeAction].level, true);
                console.log('Leveled up: ', gameEntity.getLevel('runningAction'), gameEntity.getLevel(this.activeAction));
                this.actions[this.activeAction].isLeveled = true;
                if(gameEntity.isCapped(this.activeAction)) {
                    this.setRunningAction(null);
                }
                this.sendActionsData(this.selectedFilterId);
            }
        }
        this.lists.tick(game, delta)
    }

    save() {
        return {
            actions: this.actions,
            activeAction: this.activeAction,
            actionLists: this.lists.save(),
            selectedFilterId: this.selectedFilterId,
            focus: this.focus,
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
        if(saveObject?.activeAction) {
            this.setRunningAction(saveObject.activeAction);
        }
        if(saveObject?.actionLists) {
            this.lists.load(saveObject.actionLists)
        }
        this.selectedFilterId = saveObject?.selectedFilterId || 'all';
        this.focus = saveObject?.focus;
        this.sendActionsData(this.selectedFilterId);
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

    getFocusBonus() {
        return 1 + Math.min(gameEffects.getEffectValue('max_focus_time'), Math.max(0, this.focus.time - 15))*0.1 / 60;
    }

    getLearningRate(id, eff) {
        const entEff = gameEntity.getEntityEfficiency(id);
        let focusBonus = 1.;
        if(id === 'runningAction') {
            // console.log('EffMult: ', id, eff, entEff);
            focusBonus = this.focus?.bonus ?? 1.;
        }
        if(eff == null) {
            eff = entEff;
        }

        let baseXPRate = 1.;

        if(gameEntity.getEntity(id).getLearnRate) {
            baseXPRate = gameEntity.getEntity(id).getLearnRate();
        }

        if(gameEntity.getEntity(id).getPrimaryEffect) {
            baseXPRate *= gameEntity.getEntity(id).getPrimaryEffect();
        }

        return baseXPRate * eff * gameEffects.getEffectValue('learning_rate')*focusBonus;
    }

    setRunningAction(id) {
        console.log('Running: ', id)
        if(id !== this.activeAction) {
            gameEntity.unsetEntity('runningAction');
            this.focus = null;

            if(id) {
                const isCapped = gameEntity.isCapped(id);

                if(isCapped) {
                    this.activeAction = null;
                    return;
                }

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

            this.sendActionsData(this.selectedFilterId)
        }
    }

    getActionsUnlocks() {
        const items = gameEntity
            .listEntitiesByTags(['action'])
            .filter(one => one.isUnlocked && !one.isCapped && one.nextUnlock);

        console.log('Items: ', items);
        return items;
    }

    getActionsData(filterId) {
        // const entities = gameEntity.listEntitiesByTags(['action']).filter(one => one.isUnlocked && !one.isCapped);
        const perCats = this.filters.reduce((acc, filter) => {

            acc[filter.id] = {
                id: filter.id,
                name: filter.name,
                tags: filter.tags,
                items: gameEntity.listEntitiesByTags(['action', ...filter.tags]).filter(one => one.isUnlocked && !one.isCapped),
                isSelected: filterId === filter.id
            }

            return acc;
        }, {})

        if(!filterId) {
            filterId = 'all';
        }

        const entities = perCats[filterId].items;

        const available = entities.map(entity => ({
            id: entity.id,
            name: entity.name,
            description: entity.description,
            max: entity.getMaxLevel ? entity.getMaxLevel() : entity.maxLevel || 0,
            level: this.actions[entity.id]?.level || 1,
            affordable: gameEntity.getAffordable(entity.id),
            // potentialEffects: gameEntity.getEffects(entity.id, gameEntity.getAttribute(entity.id, 'isTraining') ? 1 : 0, this.actions[entity.id]?.level || 1, true),
            xp: this.actions[entity.id]?.xp || 0,
            maxXP: this.getActionXPMax(entity.id),
            isActive: this.activeAction === entity.id,
            xpRate: this.activeAction === entity.id ? this.getLearningRate('runningAction') : this.getLearningRate(entity.id, 1),
            isLeveled: this.actions[entity.id]?.isLeveled,
            tags: entity.tags,
            focused: this.activeAction === entity.id && this.focus?.bonus > 1 ? {
                isFocused: true,
                focusTime: this.focus.time,
                focusBonus: this.focus.bonus,
                isCapped: this.focus.time >= gameEffects.getEffectValue('max_focus_time'),
                cap: gameEffects.getEffectValue('max_focus_time'),
            } : null,
            actionEffect: gameEntity.getEffects(entity.id, 0, this.actions[entity.id]?.level || 1, true).filter(eff => eff.type === 'resources'),
            potentialEffects: this.packEffects(
                gameEntity.getEffects(entity.id, 1, this.actions[entity.id]?.level || 1, true),
                item => item.type === 'effects'
            ),
            currentEffects: this.packEffects(
                gameEntity.getEffects(entity.id, 0, this.actions[entity.id]?.level || 1, true),
                item => item.type === 'effects'
            ),
            isTraining: gameEntity.getAttribute(entity.id, 'isTraining')
        }))

        const current = this.activeAction ? available.find(id => id === this.activeAction) : null;

        return {
            available,
            current,
            actionLists: this.lists.getLists(),
            runningList: this.lists.runningList,
            actionListsUnlocked: gameEntity.getLevel('shop_item_notebook') > 0,
            actionCategories: Object.values(perCats).filter(cat => cat.items.length > 0),
            automationEnabled: this.lists.automationEnabled,
        }
    }

    packEffects(effects, filter = (item) => true) {
        const result = effects.filter(filter).reduce((acc, item) => {
            acc[item.id] = item;

            return acc;
        }, {})

        return result;
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
            actionEffect: gameEntity.getEffects(entity.id, 0, this.actions[entity.id]?.level || 1, true).filter(eff => eff.type === 'resources'),
            potentialEffects: this.packEffects(
                gameEntity.getEffects(entity.id, 1, this.actions[entity.id]?.level || 1, true),
                item => item.type === 'effects'
            ),
            currentEffects: this.packEffects(
                gameEntity.getEffects(entity.id, 0, this.actions[entity.id]?.level || 1, true),
                item => item.type === 'effects'
            ),
            xp: this.actions[entity.id]?.xp || 0,
            maxXP: this.getActionXPMax(entity.id),
            isActive: this.activeAction === entity.id,
            xpRate: this.activeAction === entity.id ? this.getLearningRate('runningAction') : this.getLearningRate(entity.id, 1),
            isLeveled: this.actions[entity.id]?.isLeveled,
            tags: entity.tags,
            primaryAttribute: entity.attributes?.primaryAttribute ? gameEffects.getEffect(entity.attributes.primaryAttribute) : null,
            primaryAttributeEffect: entity.attributes?.primaryAttribute ? entity.getPrimaryEffect() : 1,
            isTraining: gameEntity.getAttribute(entity.id, 'isTraining'),
            nextUnlock: entity.nextUnlock,
        };

        return entityData;
    }

    sendActionsData(filterId) {
        const data = this.getActionsData(filterId);
        this.eventHandler.sendData('actions-data', data);
    }

    sendActionDetails(id) {
        const data = this.getActionData(id);
        this.eventHandler.sendData('action-details', data);
    }

    sendActionsUnlocks() {
        const data = this.getActionsUnlocks();
        this.eventHandler.sendData('actions-unlocks', data);
    }

}