import {registerActionsStage1} from "./actions-db";
import {GameModule} from "../../shared/game-module";
import {gameEntity, gameResources, gameEffects, resourceCalculators} from "game-framework";
import {ActionListsSubmodule} from "./action-lists.submodule";
import {calculateTimeToLevelUp} from "../../shared/utils/math";
import {SMALL_NUMBER} from "game-framework/src/utils/consts";

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

        this.eventHandler.registerHandler('query-all-actions', (payload) => {
            this.sendAllActions(payload)
        })

        this.eventHandler.registerHandler('query-all-action-tags', (payload) => {
            this.sendAllActionTags(payload)
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

        this.eventHandler.registerHandler('query-action-xp-breakdown', (payload) => {
            let eff = undefined;
            if(this.isRunningAction(payload.id)) {
                eff = gameEntity.getEntityEfficiency(`runningAction_${payload.id}`);
            }
            const breakdowns = this.getLearningRate(payload.id, eff, true);
            this.eventHandler.sendData(`action-xp-breakdown-${payload.id}`, breakdowns);
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
            saveBalanceTree: true,
        })

        gameEffects.registerEffect('spiritual_learning_rate', {
            name: 'Spiritual Learning Rate',
            defaultValue: 1.,
            minValue: 1,
            saveBalanceTree: true,
        })

        gameEffects.registerEffect('mental_training_learning_rate', {
            name: 'Mental Training Rate',
            defaultValue: 1.,
            minValue: 1,
            saveBalanceTree: true,
        })

        gameEffects.registerEffect('social_training_learning_rate', {
            name: 'Social Training Rate',
            defaultValue: 1.,
            minValue: 1,
            saveBalanceTree: true,
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
            saveBalanceTree: true,
        })

        gameEffects.registerEffect('routine_learning_speed', {
            name: 'Routine Learning',
            defaultValue: 1.,
            minValue: 1.,
            saveBalanceTree: true,
        })

        gameEffects.registerEffect('yoga_learn_speed', {
            name: 'Yoga Learning Rate',
            defaultValue: 1.,
            minValue: 1.,
            saveBalanceTree: true,
        })

        gameEffects.registerEffect('manual_labor_efficiency', {
            name: 'Manual Labor Efficiency',
            defaultValue: 1.,
            minValue: 1.,
        })

        gameEffects.registerEffect('crafting_efficiency', {
            name: 'Crafting Efficiency',
            defaultValue: 1.,
            minValue: 1.,
        })

        registerActionsStage1();
        this.actions = {};

        gameEffects.registerEffect('learning_rate', {
            name: 'Learning Rate',
            defaultValue: 1.,
            minValue: 1,
            saveBalanceTree: true,
        })

        gameEffects.registerEffect('walking_learning_rate', {
            name: 'Walking Learning Rate',
            defaultValue: 1.,
            minValue: 1,
            saveBalanceTree: true,
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

                this.actions[act.originalId].timeInvested = (this.actions[act.originalId].timeInvested || 0) + delta*act.effort;

                this.actions[act.originalId].focus.bonus = this.getFocusBonus(this.actions[act.originalId].focus.time);
                const dxp = delta*this.getLearningRate(act.id);
                // console.log('------------: ', act.id, dxp, delta, this.getLearningRate(act.id, undefined, true));
                this.actions[act.originalId].xp += dxp;
                this.actions[act.originalId].xpEarned = (this.actions[act.originalId].xpEarned || 0) + dxp;
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
                this.actions[id].focus = saveObject.actions[id].focus;
                this.actions[id].timeInvested = saveObject.actions[id].timeInvested || 0;
                this.actions[id].xpEarned = saveObject.actions[id].xpEarned || 0;
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
        return 15 + (gameEffects.getEffectValue('max_focus_time') - 15)*(Math.pow(this.isRunningAction(id)?.effort, 0.25) ?? 0);
    }

    getFocusBonus(time) {
        return 1 + Math.min(gameEffects.getEffectValue('max_focus_time'), Math.max(0, time - 15))*0.1*5 / 285;
    }

    getLearningRate(id, eff, bGetBreakdowns = false) {
        const entEff = gameEntity.getEntityEfficiency(id);
        let focusBonus = 1.;
        let effortMult = 1.;
        let breakDowns = {};
        const isRunning = this.isRunningAction(id);
        if(isRunning) {
            // console.log('EffMult: ', id, eff, entEff, eff == null);
            focusBonus = this.actions[gameEntity.getEntity(id).copyFromId]?.focus?.bonus || this.actions[id]?.focus?.bonus || 1.;
            if(Math.abs(1 - focusBonus) > SMALL_NUMBER) {
                breakDowns['focus'] = {
                    title: 'Focus',
                    value: focusBonus,
                }
            }
            if(Math.abs(1 - isRunning.effort) > SMALL_NUMBER) {
                breakDowns['effort'] = {
                    title: 'Effort',
                    value: isRunning.effort,
                }
                effortMult = isRunning.effort;
            }

        }
        if(eff == null) {
            eff = entEff;
        }

        let baseXPRate = 1.;

        if(gameEntity.getEntity(id).getLearnRate) {
            baseXPRate = gameEntity.getEntity(id).getLearnRate();

            breakDowns['base'] = {
                title: 'Base',
                value: baseXPRate,
            }
            // we should list breakdowns here
            if(gameEntity.getEntity(id).learningEffects?.length) {
                for(const effect of gameEntity.getEntity(id).learningEffects) {
                    baseXPRate *= gameEffects.getEffectValue(effect);
                    if(Math.abs(1 - gameEffects.getEffectValue(effect)) > SMALL_NUMBER) {
                        breakDowns[effect] = {
                            title: gameEffects.getEffect(effect).name,
                            value: gameEffects.getEffectValue(effect),
                            breakDown: gameEffects.getEffect(effect).breakDown
                        }
                    }
                }
            }
        }

        let primaryEffect = 1.;

        if(gameEntity.getEntity(id).getPrimaryEffect) {
            primaryEffect = gameEntity.getEntity(id).getPrimaryEffect();
            // baseXPRate *= gameEntity.getEntity(id).getPrimaryEffect();
            const pAtt = gameEntity.getEntity(id).attributes?.primaryAttribute;
            breakDowns['primaryAttribute'] = {
                title: `Primary Attribute: ${pAtt ? gameEffects.getEffect(pAtt).name : ''}`,
                value: primaryEffect
            }
        }

        breakDowns['learning_rate'] = {
            title: gameEffects.getEffect('learning_rate').name,
            value: gameEffects.getEffectValue('learning_rate'),
            breakDown: gameEffects.getEffect('learning_rate').breakDown
        };

        if(Math.abs(1 - eff) > SMALL_NUMBER) {
            breakDowns['efficiency'] = {
                title: 'Action Efficiency',
                value: eff,
            };
        }

        const total = baseXPRate * primaryEffect * eff * gameEffects.getEffectValue('learning_rate')*focusBonus*effortMult;

        if(bGetBreakdowns) {
            console.log('EffMult: ', id, baseXPRate, primaryEffect, eff, gameEffects.getEffectValue('learning_rate'), focusBonus, effortMult, total);
        }

        if(bGetBreakdowns) {
            return {
                breakDowns,
                total
            }
        }

        return total;
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
            if(this.actions[act.originalId]) {
                this.actions[act.originalId].focus = null;
            }
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
            unlockedBy: undefined,
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
            .filter(one => one.isUnlocked && !one.isCapped && one.nextUnlock)
            .map(one => ({
                ...one,
                eta: calculateTimeToLevelUp(gameEntity.getAttribute(one.id, 'baseXPCost'), 0.2, one.level, one.nextUnlock.level)
            }));

        return items;
    }

    calculateAnalyticalETA(currentLevel, targetLevel, baseCost, xpRate = 0, cxp = 0) {
        if(!currentLevel) {
            currentLevel = 1;
        }
        const ln = Math.log;
        const a = baseCost;
        const logFactor = ln(1.01);

        function integralAtLevel(x) {
            const term1 = Math.pow(1.01, x) / logFactor;
            const term2 = (0.2 * x * Math.pow(1.01, x)) / logFactor;
            const term3 = 0.2 * Math.pow(1.01, x) / (logFactor * logFactor);
            return a * (term1 + term2 - term3);
        }

        // Calculate the integral difference for levels U and L
        const totalXP = integralAtLevel(targetLevel) - integralAtLevel(currentLevel);
        const eta = (totalXP - cxp) / xpRate;

        return eta;
    }

    findNextKeypoints(currentLevel) {
        let keypoints = [];
        [25, 50, 100].forEach(divisor => {
            let nextKeypoint = Math.ceil(currentLevel / divisor) * divisor;
            if (nextKeypoint === currentLevel) {
                nextKeypoint += divisor;
            }
            if(keypoints.includes(nextKeypoint)) {
                nextKeypoint += divisor;
            }
            keypoints.push(nextKeypoint);
        });
        return [...new Set(keypoints)].sort((a, b) => a - b);
    }

    getEtas(id) {
        const entity = gameEntity.getEntity(id);
        const xpRate = this.isRunningAction(entity.id) ? this.getLearningRate(`runningAction_${entity.id}`) : this.getLearningRate(entity.id, 1);
        const keypoints = this.findNextKeypoints(entity.level);
        const etaResults = {};
        keypoints.forEach(keypoint => {
            const eta = this.calculateAnalyticalETA(entity.level, keypoint, entity.attributes.baseXPCost, xpRate, this.actions[id]?.xp);
            etaResults[keypoint] = eta;
        });
        return etaResults;
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
            xpRate: this.isRunningAction(entity.id) ? this.getLearningRate(`runningAction_${entity.id}`) : this.getLearningRate(entity.id, 1),
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
            autotriggerIntervalSetting: this.lists.autotriggerIntervalSetting,
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
            timeInvested: this.actions[entity.id]?.timeInvested || 0,
            xpEarned: this.actions[entity.id]?.xpEarned || 0,
            etas: this.getEtas(entity.id)
        };

        return entityData;
    }

    getEffectFromRunningAction(id) {
        const runningActions = gameEntity.listEntitiesByTags(['runningActions']);
        const results = [];
        runningActions.forEach(entity => {
            const effts = gameEntity.getEffects(entity.id);
            console.log('Queried effects: ', effts);
            const suitable = effts.filter(u => u.type === 'effects' && u.id === id);
            // now that we have suitable action added - need to understand it inputs (effort, xpRate and so on...)

            results.push(suitable);
        })
        return results;
    }

    getAllActions() {
        return gameEntity.listEntitiesByTags(['action']).map(one => ({
            ...one,
            isUnlocked: one.isUnlocked && !one.isCapped
        }))
    }

    sendAllActions(payload) {
        const data = this.getAllActions();
        let label = 'all-actions';
        if(payload?.prefix) {
            label = `${label}-${payload?.prefix}`
        }
        this.eventHandler.sendData(label, data);
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

    sendAllActionTags(payload) {
        const data = this.getAllActionTags();
        let label = 'all-action-tags';
        if(payload?.prefix) {
            label = `${label}-${payload?.prefix}`
        }
        this.eventHandler.sendData(label, data);
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