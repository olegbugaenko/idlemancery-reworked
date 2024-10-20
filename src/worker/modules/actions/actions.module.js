import {registerActionsStage1} from "./actions-db";
import {GameModule} from "../../shared/game-module";
import {gameEntity, gameResources, gameEffects, resourceCalculators} from "game-framework";
import {ActionListsSubmodule} from "./action-lists.submodule";

export class ActionsModule extends GameModule {

    constructor() {
        super();
        this.activeActions = [];
        this.actions = {};
        this.selectedFilterId = 'all';
        this.lists = new ActionListsSubmodule();
        this.focus = null;
        this.showHidden = false;

        this.eventHandler.registerHandler('run-action', (payload) => {
            if(payload.isForce) {
                this.lists.stopList();
            }
            this.setRunningAction(payload.id);
        })

        this.eventHandler.registerHandler('query-actions-data', (payload) => {
            this.sendActionsData(this.selectedFilterId)
        })

        this.eventHandler.registerHandler('query-all-actions', () => {
            this.sendAllActions()
        })

        this.eventHandler.registerHandler('query-all-action-tags', () => {
            this.sendAllActionTags()
        })

        this.eventHandler.registerHandler('query-actions-unlocks', () => {
            this.sendActionsUnlocks()
        })

        this.eventHandler.registerHandler('query-action-details', (payload) => {
            this.sendActionDetails(payload.id)
        })

        this.eventHandler.registerHandler('toggle-hidden-action', (payload) => {
            this.setActionHidden(payload.id, payload.flag);
            this.sendActionsData(this.selectedFilterId)
        })

        this.eventHandler.registerHandler('toggle-show-hidden', (payload) => {
            this.showHidden = payload;
            this.sendActionsData(this.selectedFilterId)
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

        gameEffects.registerEffect('routine_learning_speed', {
            name: 'Routine Learning',
            defaultValue: 1.,
            minValue: 1.
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

    reassertRunningEfforts(bForce) {
        const totalEffort = this.activeActions.reduce((acc, act) => acc += act.effort, 0);
        if((Math.abs(1.0 - totalEffort) > 1.e-8) || bForce) {
            const mult = 1./totalEffort;
            this.activeActions.forEach((act, index) => {
                this.activeActions[index].effort *= mult;
                gameEntity.getEntity(act.id).modifier.effectFactor = this.activeActions[index].effort;
                resourceCalculators.regenerateModifier(gameEntity.getEntity(act.id).modifier.id);
            })
        }
    }

    setActionHidden(id, flag) {
        if(!this.actions[id]) {
            this.actions[id] = {};
        }
        this.actions[id].isHidden = flag;
    }

    tick(game, delta) {
        for(let key in this.actions) {
            this.actions[key].isLeveled = false;
        }
        if(this.activeActions) {
            this.activeActions.forEach(act => {
                if(!this.actions[act.originalId]) {
                    this.actions[act.originalId] = {
                        level: 1,
                        xp: 0,
                        focus: {
                            time: 0,
                        }
                    }
                }
                if(!this.actions[act.originalId].focus) {
                    this.actions[act.originalId].focus = {
                        time: 0,
                    }
                }

                if(this.actions[act.originalId].focus.time < this.getFocusCapTime(act.originalId)) {
                    this.actions[act.originalId].focus.time += delta*act.effort;
                }

                this.actions[act.originalId].focus.bonus = this.getFocusBonus(this.actions[act.originalId].focus.time);
                const dxp = delta*this.getLearningRate(act.id)*act.effort;
                this.actions[act.originalId].xp += dxp;
                gameResources.addResource('mage-xp', dxp);
                if(this.actions[act.originalId].xp >= this.getActionXPMax(act.originalId)) {
                    this.actions[act.originalId].level++;
                    this.actions[act.originalId].xp = 0;
                    gameEntity.setEntityLevel(act.originalId, this.actions[act.originalId].level, true);
                    gameEntity.setEntityLevel(act.id, this.actions[act.originalId].level, true);
                    console.log('Leveled up: ', gameEntity.getLevel(act.id), gameEntity.getLevel(act.originalId));
                    this.actions[act.originalId].isLeveled = true;
                    if(gameEntity.isCapped(act.originalId)) {
                        this.dropRunningAction(act.originalId);
                        this.reassertRunningEfforts();
                    }
                    this.sendActionsData(this.selectedFilterId);
                }
            })

        }
        this.lists.tick(game, delta)
    }

    save() {
        return {
            actions: this.actions,
            activeActions: this.activeActions,
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
        if(saveObject?.activeActions) {
            this.stopRunningActions();
            saveObject?.activeActions.forEach(a => {
                this.addRunningAction(a.originalId, a.effort);
            })
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

    getFocusCapTime(id) {
        return 15 + (gameEffects.getEffectValue('max_focus_time') - 15)*(this.isRunningAction(id)?.effort || 0);
    }

    getFocusBonus(time) {
        return 1 + Math.min(gameEffects.getEffectValue('max_focus_time'), Math.max(0, time - 15))*0.1 / 60;
    }

    getLearningRate(id, eff) {
        const entEff = gameEntity.getEntityEfficiency(id);
        let focusBonus = 1.;
        if(this.isRunningAction(id)) {
            // console.log('EffMult: ', id, eff, entEff);
            focusBonus = this.actions[gameEntity.getEntity(id).copyFromId]?.focus?.bonus || 1.;
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

    isRunningAction(id) {
        return this.activeActions && this.activeActions.find(one => one.id === id || one.originalId === id);
    }


    isRunningActionWithTag(id) {
        if(!this.activeActions) return false;

        for(const running of this.activeActions) {
            const ent = gameEntity.getEntity(running.originalId);
            if(ent.tags.includes(id)) return true;
        }

        return false;
    }

    stopRunningActions() {
        for(const act of this.activeActions) {
            this.actions[act.originalId].focus = null;
        }
        this.activeActions = [];
        const runningEntities = gameEntity.listEntitiesByTags(['runningActions']);
        runningEntities.forEach(e => {
            gameEntity.unsetEntity(e.id);
        })
    }

    addRunningAction(id, effort) {
        if(!id) {
            return;
        }

        const isCapped = gameEntity.isCapped(id);

        if(isCapped) {
            return;
        }

        const rn = gameEntity.registerGameEntity(`runningAction_${id}`, {
            copyFromId: id,
            level: this.actions[id]?.level ?? 1,
            allowedImpacts: ['resources'],
            tags: ['running','runningActions'],
            effectFactor: effort,
        })

        gameEntity.setEntityLevel(`runningAction_${id}`, this.actions[id]?.level ?? 1);

        this.activeActions.push({
            id: `runningAction_${id}`,
            originalId: id,
            effort
        })

        console.log('CLL: ', this.activeActions, rn);
    }

    dropRunningAction(id) {
        if(!this.isRunningAction(id)) return;
        const index = this.activeActions.findIndex(one => one.originalId === id);
        if(index < 0) {
            throw new Error(`Woops! Can't find action by originalId ${id}`)
        }
        if(this.actions[id]?.focus) {
            this.actions[id].focus = null;
        }
        this.activeActions.splice(index, 1);
        gameEntity.unsetEntity(`runningAction_${id}`);
    }

    setRunningAction(id) {
        console.log('Running: ', id)
        this.stopRunningActions();
        this.addRunningAction(id, 1);
    }

    getActionsUnlocks() {
        const items = gameEntity
            .listEntitiesByTags(['action'])
            .filter(one => one.isUnlocked && !one.isCapped && one.nextUnlock);

        return items;
    }

    getActionsData(filterId, options) {
        // const entities = gameEntity.listEntitiesByTags(['action']).filter(one => one.isUnlocked && !one.isCapped);
        const perCats = this.filters.reduce((acc, filter) => {

            acc[filter.id] = {
                id: filter.id,
                name: filter.name,
                tags: filter.tags,
                items: gameEntity.listEntitiesByTags(['action', ...filter.tags])
                    .filter(one => one.isUnlocked && !one.isCapped && (options?.showHidden || this.showHidden || !this.actions?.[one.id]?.isHidden)),
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
            isActive: this.isRunningAction(entity.id),
            xpRate: this.isRunningAction(entity.id) ? this.getLearningRate(`runningAction_${entity.id}`)*this.isRunningAction(entity.id).effort : this.getLearningRate(entity.id, 1),
            isLeveled: this.actions[entity.id]?.isLeveled,
            tags: entity.tags,
            focused: this.isRunningAction(entity.id) && this.actions[entity.id]?.focus?.bonus > 1 ? {
                isFocused: true,
                focusTime: this.actions[entity.id].focus.time,
                focusBonus: this.actions[entity.id].focus.bonus,
                isCapped: this.actions[entity.id].focus.time >= this.getFocusCapTime(entity.id),
                cap: gameEffects.getEffectValue('max_focus_time')*this.isRunningAction(entity.id).effort,
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
            isTraining: gameEntity.getAttribute(entity.id, 'isTraining'),
            isHidden: this.actions?.[entity.id]?.isHidden
        }))

        const current = this.activeActions ? available.filter(one => this.activeActions.some(act => act.originalId === one.id)) : null;

        return {
            available,
            current,
            showHidden: this.showHidden,
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
            isActive: this.isRunningAction(entity.id),
            xpRate: this.isRunningAction(entity.id) ? this.getLearningRate(`runningAction_${entity.id}`)*this.isRunningAction(entity.id).effort : this.getLearningRate(entity.id, 1),
            isLeveled: this.actions[entity.id]?.isLeveled,
            tags: entity.tags,
            primaryAttribute: entity.attributes?.primaryAttribute ? gameEffects.getEffect(entity.attributes.primaryAttribute) : null,
            primaryAttributeEffect: entity.attributes?.primaryAttribute ? entity.getPrimaryEffect() : 1,
            isTraining: gameEntity.getAttribute(entity.id, 'isTraining'),
            nextUnlock: entity.nextUnlock,
        };

        return entityData;
    }

    getAllActions() {
        return gameEntity.listEntitiesByTags(['action']).map(one => ({
            ...one,
            isUnlocked: one.isUnlocked && !one.isCapped
        }))
    }

    sendAllActions() {
        const data = this.getAllActions();
        this.eventHandler.sendData('all-actions', data);
    }

    getAllActionTags() {
        const allActions = gameEntity.listEntitiesByTags(['action']);

        const tagsByUnlocks = {};

        allActions.forEach(a => {
            a.tags.forEach(tag => {
                tagsByUnlocks[tag] = {
                    id: tag,
                    name: tag,
                    isUnlocked: tagsByUnlocks[tag]?.isUnlocked || (a.isUnlocked && !a.isCapped)
                }
            })
        })

        return Object.values(tagsByUnlocks);

    }

    sendAllActionTags() {
        const data = this.getAllActionTags();
        this.eventHandler.sendData('all-action-tags', data);
    }

    sendActionsData(filterId, options = {}) {
        const data = this.getActionsData(filterId, options);
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