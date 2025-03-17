import {getRankId, registerActionsStage1} from "./actions-db";
import {GameModule} from "../../shared/game-module";
import {gameEntity, gameResources, gameEffects, resourceCalculators, gameCore} from "game-framework";
import {ActionListsSubmodule} from "./action-lists.submodule";
import {calculateTimeToLevelUp, weightedRandomChoice} from "../../shared/utils/math";
import {SMALL_NUMBER} from "game-framework/src/utils/consts";
import {registerAspects} from "./aspect-db";
import {cloneDeep} from "lodash";
import {getScope} from "../../shared/utils/scopes";

const DEFAULT_FILTERS = {
    'all': {
        id: 'all',
        condition: '',
        rules: [],
        name: 'All',
        isRequired: true,
        isPinned: true,
        sortIndex: 0,
    },
    'jobs': {
        id: 'jobs',
        condition: '',
        rules: [{ type: 'tag', object: 'job'}],
        name: 'Jobs',
        isPinned: true,
        sortIndex: 1,
    },
    'training': {
        id: 'training',
        condition: '',
        rules: [{ type: 'tag', object: 'training'}],
        name: 'Training',
        isPinned: true,
        sortIndex: 2,
    },
    'activity': {
        id: 'activity',
        condition: '',
        rules: [{ type: 'tag', object: 'activity'}],
        name: 'Activity',
        isPinned: true,
        sortIndex: 3,
    }
}

export class ActionsModule extends GameModule {

    constructor() {
        super();
        this.activeActions = [];
        this.actions = {};
        this.selectedFilterId = 'all';
        this.lists = new ActionListsSubmodule();
        this.focus = null;
        this.showHidden = false;
        this.aspectUpdateCd = 0;
        this.searchData = {
            search: '',
            selectedScopes: ['name','tags']
        };
        this.aspectsSettings = {};

        this.customFilters = cloneDeep(DEFAULT_FILTERS);
        this.customFiltersOrder = Object.keys(this.customFilters);

        this.eventHandler.registerHandler('actions-change-custom-filters-order', payload => {
            //payload.sortIndex, payload.destinationIndex. Reorder this.customFiltersOrder
            const { sourceIndex, destinationIndex } = payload;

            // Захист від некоректних індексів:
            if (sourceIndex === undefined || destinationIndex === undefined) return;
            if (sourceIndex < 0 || destinationIndex < 0) return;
            if (sourceIndex >= this.customFiltersOrder.length || destinationIndex >= this.customFiltersOrder.length) return;

            // Копіюємо масив (якщо хочемо не мутувати оригінал),
            // але можна й "у місці" (mutable), залежно від вашої логіки
            const newOrder = [...this.customFiltersOrder];

            // Вирізаємо елемент зі старої позиції
            const [removed] = newOrder.splice(sourceIndex, 1);
            // Ставимо на нову позицію
            newOrder.splice(destinationIndex, 0, removed);

            // Зберігаємо оновлений масив
            this.customFiltersOrder = newOrder;

            // console.log('Re-sorted', payload, newOrder);

            this.sendActionsData(this.selectedFilterId, {
                searchData: this.searchData,
            })
        })

        this.eventHandler.registerHandler('save-actions-custom-filter', (payload) => {
            this.saveCustomFilter(payload);
        })

        this.eventHandler.registerHandler('delete-actions-custom-filter', (payload) => {
            this.deleteCustomFilter(payload);
        })

        this.eventHandler.registerHandler('toggle-actions-custom-filter-pinned', (payload) => {
            this.setCustomFilterPinned(payload);
        })

        this.eventHandler.registerHandler('apply-actions-custom-filter', (payload) => {
            this.applyCustomFilter(payload);
        })

        this.eventHandler.registerHandler('run-action', (payload) => {
            if(payload.isForce) {
                this.lists.stopList();
            }
            this.setRunningAction(payload.id);
        })

        this.eventHandler.registerHandler('query-actions-data', (payload) => {
            this.sendActionsData(this.selectedFilterId, {
                searchData: this.searchData,
            })
        })

        this.eventHandler.registerHandler('query-all-actions', (payload) => {
            this.sendAllActions(payload)
        })

        this.eventHandler.registerHandler('query-all-action-tags', (payload) => {
            this.sendAllActionTags(payload)
        })

        this.eventHandler.registerHandler('query-actions-unlocks', ({ showUnlocked }) => {
            this.sendActionsUnlocks(showUnlocked)
        })

        this.eventHandler.registerHandler('query-action-details', (payload) => {
            this.sendActionDetails(payload.id)
        })

        this.eventHandler.registerHandler('toggle-hidden-action', (payload) => {
            this.setActionHidden(payload.id, payload.flag);
            this.sendActionsData(this.selectedFilterId, {
                searchData: this.searchData,
            })
        })

        this.eventHandler.registerHandler('set-action-aspect-level', (payload) => {
            const keyAttr = gameEntity.getAttribute(payload.id, 'keyAttribute')
            this.setAspectLevel(keyAttr, payload.level);
            this.sendActionsData(this.selectedFilterId, {
                searchData: this.searchData,
            })
        })

        this.eventHandler.registerHandler('toggle-action-aspect-maxed', (payload) => {
            if(!this.aspectsSettings[payload.id]) {
                this.aspectsSettings[payload.id] = {}
            }
            this.aspectsSettings[payload.id].maxed = payload.flag;
            this.sendActionsData(this.selectedFilterId, {
                searchData: this.searchData,
            })
        })

        this.eventHandler.registerHandler('toggle-show-hidden', (payload) => {
            this.showHidden = payload;
            this.sendActionsData(this.selectedFilterId, {
                searchData: this.searchData,
            })
        })

        this.eventHandler.registerHandler('set-selected-actions-filter', ({filterId}) => {
            this.selectedFilterId = filterId;
        })

        this.eventHandler.registerHandler('set-actions-search', ({searchData}) => {
            this.searchData = searchData;
        })

        this.eventHandler.registerHandler('query-action-xp-breakdown', (payload) => {
            let eff = undefined;
            if(this.isRunningAction(payload.id)) {
                eff = gameEntity.getEntityEfficiency(`runningAction_${payload.id}`);
            }
            const breakdowns = this.getLearningRate(payload.id, eff, true);
            breakdowns.nextEtas = this.getEtasNext(payload.id);
            this.eventHandler.sendData(`action-xp-breakdown-${payload.id}`, breakdowns);
        })

        this.filtersCache = {};

        this.rankableCached = [];

    }

    initialize() {

        gameEntity.registerGameEntity('runningAction', {
            name: 'Idling',
            level: 0,
        })

        registerActionsStage1();
        registerAspects();


        this.actions = {};

        this.rankableCached = Object.values(gameEntity.entities).filter(one => one.attributes?.isRankAvailable).map(re => re.id);

    }

    getActionRank(id) {
        return Math.floor(gameEntity.getLevel(id) / 100);
    }

    getRankBonus(rank) {
        return 1.05 ** rank;
    }

    regenerateRanks() {
        if(gameEntity.entityExists('system_action_ranks_multiplier')) {
            gameEntity.unsetEntity('system_action_ranks_multiplier');
        }

        const effectsRanks = this.rankableCached.reduce((acc, id) => {
            const rank = this.getActionRank(id);
            const effect_id = getRankId(id);
            const formulaA = this.getRankBonus(rank);

            return {
                ...acc,
                [effect_id]: {
                    A: 0,
                    B: formulaA,
                    type: 2,
                }
            }
        }, {})

        // console.log('effectsRanks', effectsRanks);

        gameEntity.registerGameEntity('system_action_ranks_multiplier', {
            name: 'Action Rank',
            resourceModifier: {
                multiplier: {
                    effects: effectsRanks
                }
            }
        })

        gameEntity.setEntityLevel('system_action_ranks_multiplier', 1, true);
    }

    getAttributeAspectReq(attribute_id) {
        return Math.max(1, 25 / gameEffects.getEffectValue(`aspect_${attribute_id}_reduction`))
    }

    getAspectMaxLevel(attribute_id) {
        return Math.floor(gameEffects.getEffectValue(attribute_id) / this.getAttributeAspectReq(attribute_id));
    }

    setAspectLevel(attribute_id, level) {
        const actLevel = Math.min(
            this.getAspectMaxLevel(attribute_id),
            Math.max(0, Math.floor(level ?? 0))
        );

        if(gameEntity.entityExists(`${attribute_id}_aspect`)) {
            gameEntity.setEntityLevel(`${attribute_id}_aspect`, actLevel, true);
        }
    }

    setMonitored({ type, id }) {
        // console.log('CHMON: ', id, type);
        if(!id) {
            this.monitorData = null;
            return;
        }
        this.monitorData = {
            type,
            id
        }
    }

    getMonitoredData(entity) {
        if(!this.monitorData || !entity) return null;

        if(this.monitorData.type === 'attribute') {
            if(entity.attributes.primaryAttribute === this.monitorData.id) {
                return 'use'
            }
            const increment = this.packEffects(
                gameEntity.getEffects(entity.id, 1, this.actions[entity.id]?.level || 1, true),
                item => item.type === 'effects'
            );
            if(increment[this.monitorData.id]?.value) {
                return 'produce'
            }
        }

        if(this.monitorData.type === 'learn_modifier') {
            if((this.monitorData.id === 'learning_rate') || entity.learningEffects?.includes(this.monitorData.id)) {
                return 'produce'
            }
        }

        if(this.monitorData.type === 'discount') {
            if((this.monitorData.id === 'actions_discount') || entity.discountEffects?.includes(this.monitorData.id)) {
                return 'produce'
            }
        }

        if(this.monitorData.type === 'resource') {
            const rsEff = this.packEffects(gameEntity.getEffects(entity.id, 0, this.actions[entity.id]?.level || 1, true)
                    .filter(eff => eff.type === 'resources'));

            if(rsEff[this.monitorData.id]?.value) {
                return rsEff[this.monitorData.id].scope === 'consumption' ? 'use' : 'produce'
            }

        }
    }

    getDiscount(id) {
        let discFactor = 1.;
        if(gameEntity.getEntity(id).discountEffects?.length) {
            gameEntity.getEntity(id).discountEffects.forEach(effectId => {
                discFactor /= gameEffects.getEffectValue(effectId);
            })
        }
        return discFactor;
    }

    getActionXPMax(id) {
        const lvl = this.actions[id]?.level ?? 1;

        let discFactor = this.getDiscount(id);

        return Math.max(1, discFactor*gameEntity.getAttribute(id, 'baseXPCost', 50)*Math.pow(1.01, lvl-1)*(0.8 + 0.2*lvl));
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
            this.actions[id] = {
                level: 1,
                xp: 0,
                focus: {
                    time: 0,
                }
            };
        }
        this.actions[id].isHidden = flag;
    }

    generateFilterCache(id) {
        if(!this.customFilters[id]) {
            delete this.filtersCache[id];
        }
        // now apply filters and find ids
        if(!this.customFilters[id].rules) {
            this.filtersCache[id] = {'all': true};
            return;
        }
        const entities = gameEntity.listEntitiesByTags(['action']);

        this.filtersCache[id] = {};

        entities.forEach(entity => {
            const ruleResults = this.customFilters[id].rules.map(rule => {
                if(rule.type === 'tag') return entity.tags.includes(rule.object);
                if(rule.type === 'resource') return Object.keys(entity.modifier?.income?.resources || {}).includes(rule.object)
                    || Object.keys(entity.modifier?.multiplier?.resources || {}).includes(rule.object);
                if(rule.type === 'attribute') return Object.keys(entity.modifier?.income?.effects || {}).includes(rule.object)
                    || Object.keys(entity.modifier?.multiplier?.effects || {}).includes(rule.object);
                throw new Error('Invalid filter condition: '+rule.type);
            })

            let conditionExpression = this.customFilters[id].condition;

            if(!conditionExpression) {
                const result = ruleResults.every(one => !!one);
                if(result) {
                    this.filtersCache[id][entity.id] = true;
                }
                return true;
            }

            ruleResults.forEach((result, index) => {
                conditionExpression = conditionExpression.replace(new RegExp(`\\b${index + 1}\\b`, 'g'), result);
            });

            conditionExpression = conditionExpression.replace(/\bAND\b/g, '&&').replace(/\bOR\b/g, '||').replace(/\bNOT\b/g, '!');

            try {
                const result = eval(conditionExpression);
                if(result) {
                    this.filtersCache[id][entity.id] = true;
                }
            } catch (error) {
                console.error("Invalid condition string", error);
                return false;
            }

        })


    }

    generateAllFiltersCache() {
        for(const filterId in this.customFilters) {
            this.generateFilterCache(filterId);
        }
        // console.log('Caches: ', this.filtersCache);
    }

    setCustomFilterPinned({ id, flag }) {
        if(this.customFilters[id]) {
            this.customFilters[id].isPinned = flag;
        }
    }

    saveCustomFilter(payload) {
        let id = payload.id ?? `${Math.round(Math.random()*1000000)}`;

        this.customFilters[id] = {...(this.customFilters[id] || {}), ...payload, id};

        if(!payload.id) {
            this.customFiltersOrder.push(id);
        }

        // console.log('this.customFiltersOrder', this.customFiltersOrder, payload, this.customFilters[id]);

        this.generateFilterCache(id);

        //TODO: Re-index filters
        this.sendActionsData(this.selectedFilterId, {
            searchData: this.searchData,
        })
    }

    deleteCustomFilter({ id }) {
        if(this.customFilters[id] && !DEFAULT_FILTERS[id]?.isRequired) {
            delete this.customFilters[id];
            this.customFiltersOrder = this.customFiltersOrder.filter(fid => fid !== id);
            this.sendActionsData(this.selectedFilterId, {
                searchData: this.searchData,
            })
        }
    }

    applyCustomFilter({ id }) {
        this.selectedFilterId = id;
        this.generateFilterCache(id);
        this.sendActionsData(this.selectedFilterId, {
            searchData: this.searchData,
        })
    }

    tick(game, delta) {
        for(let key in this.actions) {
            this.actions[key].isLeveled = false;
        }
        let rareEvents = {
            herbDrops: {},
            oreDrops: {}
        };

        this.aspectUpdateCd -= delta;
        if(this.aspectUpdateCd <= 0 && gameEntity.getLevel('shop_item_aspects_focus') > 0) {
            this.aspectUpdateCd = 2;
            for(const key in this.aspectsSettings) {
                if(this.aspectsSettings[key].maxed) {
                    const attribute_id = gameEntity.getAttribute(key, 'keyAttribute');
                    if(Math.floor(this.getAspectMaxLevel(attribute_id)) > gameEntity.getLevel(`${attribute_id}_aspect`)) {
                        this.setAspectLevel(attribute_id, this.getAspectMaxLevel(attribute_id));
                    }
                }
            }
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
                if(!this.actions[act.originalId].level || Number.isNaN(this.actions[act.originalId].level)) {
                    this.actions[act.originalId].level = 1;
                }

                if(this.actions[act.originalId].focus.time < this.getFocusCapTime(act.originalId)) {
                    this.actions[act.originalId].focus.time += delta*act.effort;
                } else {
                    this.actions[act.originalId].focus.time = this.getFocusCapTime(act.originalId);
                }

                this.actions[act.originalId].timeInvested = (this.actions[act.originalId].timeInvested || 0) + delta*act.effort;

                this.actions[act.originalId].focus.bonus = this.getFocusBonus(this.actions[act.originalId].focus.time);
                const dxp = delta*this.getLearningRate(act.id);
                // console.log('------------: ', act.id, dxp, delta, this.getLearningRate(act.id, undefined, true));
                this.actions[act.originalId].xp += dxp;
                this.actions[act.originalId].xpEarned = (this.actions[act.originalId].xpEarned || 0) + dxp;

                const herbDrops = gameEntity.getAttribute(act.originalId, 'possibleRareHerbs', null);

                if(herbDrops) {
                    if(!rareEvents['herbDrops']) {
                        rareEvents['herbDrops'] = {}
                    }
                    for(const key in herbDrops) {
                        rareEvents['herbDrops'][key] = (rareEvents['herbDrops'][key] || 0) + herbDrops[key];
                    }
                }
                // console.log('Attempt to level up: ', act.originalId, this.actions, this.getActionXPMax(act.originalId))
                gameResources.addResource('mage-xp', dxp);
                if(this.actions[act.originalId].xp >= this.getActionXPMax(act.originalId)) {
                    this.actions[act.originalId].level++;
                    this.actions[act.originalId].xp = 0;
                    gameEntity.setEntityLevel(act.originalId, this.actions[act.originalId].level, true);
                    gameEntity.setEntityLevel(act.id, this.actions[act.originalId].level, true);
                    // console.log('Leveled up: ', gameEntity.getLevel(act.id), gameEntity.getLevel(act.originalId));
                    this.regenerateRanks();
                    this.actions[act.originalId].isLeveled = true;
                    if(gameEntity.isCapped(act.originalId)) {
                        this.dropRunningAction(act.originalId);
                        this.reassertRunningEfforts();
                    }
                    gameCore.getModule('unlock-notifications').generateNotifications();
                    // console.log('[SAD]Ticked!')
                    this.sendActionsData(this.selectedFilterId, {
                        searchData: this.searchData,
                    });
                }
            })

        }
        // check for rare loot
        if(gameResources.getResource('rare_herbs_loot').balance > 0) {
            const chanceMult = delta * gameResources.getResource('rare_herbs_loot').balance;
            // console.log('Handling chances for rare loots: ', gameResources.getResource('rare_herbs_loot'), chanceMult);
            if(Math.random() < chanceMult) {
                const id = weightedRandomChoice(rareEvents['herbDrops']);
                // console.log('Add: ', id, rareEvents['herbDrops']);

                gameResources.addResource(id, 1);
            }

        }
        this.lists.tick(game, delta)
    }

    save() {
        return {
            actions: this.actions,
            activeActions: this.activeActions,
            actionLists: this.lists.save(),
            selectedFilterId: this.selectedFilterId,
            searchData: this.searchData,
            focus: this.focus,
            aspects: gameEntity.listEntitiesByTags(['aspect']).filter(one => one.level > 0).reduce((acc, ent) => ({
                ...acc,
                [ent.id]: gameEntity.getLevel(ent.id)
            }), {}),
            aspectsSettings: this.aspectsSettings,
            customFilters: this.customFilters,
            customFiltersOrder: this.customFiltersOrder,
        }
    }

    load(saveObject) {
        for(const key in this.actions) {
            this.setAction(key, 0, true);
        }
        gameEntity.listEntitiesByTags(['aspect']).filter(one => one.level > 0).map(one => gameEntity.setEntityLevel(one.id, 0, true));
        this.actions = {};
        this.aspectsSettings = {};
        if(saveObject?.actions) {
            for(const id in saveObject.actions) {
                this.setAction(id, saveObject.actions[id].level, true);
                this.actions[id].xp = saveObject.actions[id].xp;
                this.actions[id].focus = saveObject.actions[id].focus;
                this.actions[id].timeInvested = saveObject.actions[id].timeInvested || 0;
                this.actions[id].xpEarned = saveObject.actions[id].xpEarned || 0;
                this.actions[id].isHidden = saveObject.actions[id].isHidden || false;
            }
        }
        this.stopRunningActions();
        if(saveObject?.activeActions) {
            this.stopRunningActions();
            saveObject?.activeActions.forEach(a => {
                this.addRunningAction(a.originalId, a.effort);
            })
        }
        this.regenerateRanks();
        if(saveObject?.actionLists) {
            this.lists.load(saveObject.actionLists)
        } else {
            this.lists.load({});
        }
        this.selectedFilterId = saveObject?.selectedFilterId || 'all';
        this.focus = saveObject?.focus;
        this.searchData = saveObject?.searchData || {
            search: '',
            selectedScopes: ['name','tags']
        };
        if(saveObject?.aspects) {
            for(const key in saveObject.aspects) {
                gameEntity.setEntityLevel(key, saveObject.aspects[key], true);
            }
        }
        if(saveObject?.aspectsSettings) {
            this.aspectsSettings = saveObject.aspectsSettings;
        }
        this.customFilters = cloneDeep(DEFAULT_FILTERS);
        if(saveObject?.customFilters) {
            this.customFilters = saveObject?.customFilters;
            // check if all required are prestnt
            let isValid = true;
            for(const fltId in DEFAULT_FILTERS) {
                if(DEFAULT_FILTERS[fltId].isRequired && !this.customFilters[fltId]) {
                    isValid = false;
                    break;
                }
            }
            if(!isValid) {
                this.customFilters = cloneDeep(DEFAULT_FILTERS);
                this.selectedFilterId = 'all';
            }
        }
        this.generateAllFiltersCache();
        if(saveObject?.customFiltersOrder) {
            this.customFiltersOrder = saveObject.customFiltersOrder;
        } else {
            this.customFiltersOrder = Object.keys(this.customFilters);
        }
        // console.log('[SAD]Loaded!', this.filtersCache, this.selectedFilterId, this.customFilters);
        this.sendActionsData(this.selectedFilterId,{
            searchData: this.searchData,
        });
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
        const currActs = this.activeActions.length;
        let penalty = currActs < 4 ? 1 : Math.pow(this.isRunningAction(id)?.effort, 0.25);
        return 15 + (gameEffects.getEffectValue('max_focus_time') - 15)*(penalty ?? 0);
    }

    getFocusBonus(time) {
        return 1 + Math.min(gameEffects.getEffectValue('max_focus_time'), Math.max(0, time - 15))*0.1*5 / 285;
    }

    getLearningRate(id, eff, bGetBreakdowns = false) {
        const entEff = gameEntity.getEntityEfficiency(id);
        let focusBonus = 1.;
        let effortMult = 1.;
        let breakDowns = {};
        if(gameEffects.getEffectValue('plain_learn_rate')) {
            breakDowns['raw'] = {
                title: 'Plain Learn Bonus',
                value: gameEffects.getEffectValue('plain_learn_rate'),
                isPlain: true,
            }
        }
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
        let intensityEffect = 1.;

        if(gameEntity.getEntity(id).getPrimaryEffect) {
            primaryEffect = gameEntity.getEntity(id).getPrimaryEffect();
            // baseXPRate *= gameEntity.getEntity(id).getPrimaryEffect();
            const pAtt = gameEntity.getEntity(id).attributes?.primaryAttribute;
            breakDowns['primaryAttribute'] = {
                title: `Primary Attribute: ${pAtt ? gameEffects.getEffect(pAtt).name : ''}`,
                value: primaryEffect
            }

            intensityEffect = gameEntity.getEntity(id).getIntensityAspect();
            if(Math.abs(intensityEffect - 1) > SMALL_NUMBER) {
                const pAtt2 = gameEntity.getEntity(id).attributes?.primaryAttribute;
                const iAsp = gameEffects.getEffect(`aspect_${pAtt2}`);
                breakDowns['intensity'] = {
                    title: `Intensity: ${iAsp ? iAsp.name : ''}`,
                    value: intensityEffect
                }
            }
        }

        if(Math.abs(gameEffects.getEffectValue('learning_rate') - 1.0) > SMALL_NUMBER) {
            breakDowns['learning_rate'] = {
                title: gameEffects.getEffect('learning_rate').name,
                value: gameEffects.getEffectValue('learning_rate'),
                breakDown: gameEffects.getEffect('learning_rate').breakDown
            };
        }

        if(Math.abs(1 - eff) > SMALL_NUMBER) {
            breakDowns['efficiency'] = {
                title: 'Action Efficiency',
                value: eff,
            };
        }

        const total = (gameEffects.getEffectValue('plain_learn_rate') + baseXPRate * primaryEffect * gameEffects.getEffectValue('learning_rate')*focusBonus) * eff*effortMult;

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
            if(Array.isArray(id)) {
                if(id.every(one => ent.tags.includes(one))) return true;
            } else {
                if(ent.tags.includes(id)) return true;
            }
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

        const isEffectChannel = gameEntity.getAttribute(id, 'isEffectChanneling', false);

        const rn = gameEntity.registerGameEntity(`runningAction_${id}`, {
            copyFromId: id,
            level: this.actions[id]?.level ?? 1,
            allowedImpacts: isEffectChannel ? ['effects','resources'] : ['resources'], // need to play around here - if some attribute is present to action: we should allow effects here
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

    getActionsUnlocks(showUnlocked) {
        const items = gameEntity
            .listEntitiesByTags(['action'], false, [], { listPrevious: showUnlocked })
            .filter(one => one.isUnlocked && !one.isCapped && (one.nextUnlocks?.length || (showUnlocked && one.prevUnlocks?.length)))
            .map(one => {

                /*console.log('ActionUnlocks: ', one.nextUnlocks);*/

                if(one.nextUnlocks?.length) {
                    one.unlocks = {
                        level: one.nextUnlocks[0].level,
                        progress: 100*one.level / one.nextUnlocks[0].level,
                        eta: one.nextUnlocks[0] ? calculateTimeToLevelUp(gameEntity.getAttribute(one.id, 'baseXPCost'), 0.2, one.level, one.nextUnlocks[0].level) : 0,
                        items: one.nextUnlocks.map(unlock => {
                            const ent = gameEntity.getEntity(unlock.unlockId);
                            return {
                                ...unlock,
                                meta: {
                                    name: ent.name,
                                    description: ent.description,
                                    scope: getScope(ent)
                                },
                            }
                        })
                    }
                }

                return {
                    ...one,
                    prevUnlocks: (one.prevUnlocks ?? []).map(unlock => {

                        let data = {};

                        if (gameEntity.entityExists(unlock.unlockId)) {
                            data = gameEntity.getEntity(unlock.unlockId);
                        }

                        return {
                            ...unlock,
                            data
                        }
                    }),
                }
            });

        /*console.log('FUNC: ', showUnlocked, items, gameEntity
            .listEntitiesByTags(['action'], false, [], { showUnlocked }).filter(one => one.id === 'action_endurance_training'));
*/
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

    findNextKeypoints(currentLevel, max) {
        let keypoints = [];
        [25, 50, 100].forEach(divisor => {
            let nextKeypoint = Math.ceil(currentLevel / divisor) * divisor;
            if (nextKeypoint === currentLevel) {
                nextKeypoint += divisor;
            }
            if(keypoints.includes(nextKeypoint)) {
                nextKeypoint += divisor;
            }
            if(max && nextKeypoint > max) {
                nextKeypoint = max;
            }
            keypoints.push(nextKeypoint);
        });
        return [...new Set(keypoints)].sort((a, b) => a - b);
    }

    findNextRankAndLvl(currentLvl, max) {
        let keypoints = [currentLvl+1, 100*Math.floor((currentLvl + 100) / 100)].filter(one => !max || one <= max);
        return keypoints;
    }

    getEtas(id) {
        const entity = gameEntity.getEntity(id);
        const xpRate = this.isRunningAction(entity.id) ? this.getLearningRate(`runningAction_${entity.id}`) : this.getLearningRate(entity.id, 1);
        const keypoints = this.findNextKeypoints(entity.level, gameEntity.getEntityMaxLevel(id));
        const etaResults = {};
        keypoints.forEach(keypoint => {
            const eta = this.calculateAnalyticalETA(entity.level, keypoint, entity.attributes.baseXPCost*this.getDiscount(id), xpRate, this.actions[id]?.xp);
            etaResults[keypoint] = eta;
        });
        return etaResults;
    }

    getEtasNext(id) {
        const entity = gameEntity.getEntity(id);
        const xpRate = this.isRunningAction(entity.id) ? this.getLearningRate(`runningAction_${entity.id}`) : this.getLearningRate(entity.id, 1);
        const keypoints = this.findNextRankAndLvl(entity.level, gameEntity.getEntityMaxLevel(id));
        const etaResults = {};
        keypoints.forEach(keypoint => {
            const eta = this.calculateAnalyticalETA(entity.level, keypoint, entity.attributes.baseXPCost*this.getDiscount(id), xpRate, this.actions[id]?.xp);
            etaResults[keypoint] = eta;
        });
        return etaResults;
    }

    matchActionSearch(one, searchData) {
        if(!searchData) return true;
        const { search, selectedScopes } = searchData;
        if(!search) return true;
        if(selectedScopes.includes('name') && one.name.toLowerCase().includes(search)) return true;
        if(selectedScopes.includes('tags') && one.tags && one.tags.some(tag => tag.includes(search))) return true;
        if(selectedScopes.includes('description') && one.description && one.description.toLowerCase().includes(search)) return true;
        if(selectedScopes.includes('resources') && one.searchableMeta?.['resources']
            && one.searchableMeta?.['resources'].some(tag => tag.includes(search.toLowerCase()))) return true;
        if(selectedScopes.includes('effects') && one.searchableMeta?.['effects']
            && one.searchableMeta?.['effects'].some(tag => tag.includes(search.toLowerCase()))) return true;


        return false;
    }

    regenerateNotifications() {
        // NOW - check for actions if they have any new notifications
        Object.values(this.customFilters).forEach(filter => {
            const actions = gameEntity.listEntitiesByTags(['action']).filter(one => this.filtersCache[filter.id][one.id]);
            actions.forEach(action => {
                gameCore.getModule('unlock-notifications').registerNewNotification(
                    'actions',
                    'all',
                    filter.id,
                    action.id,
                    action.isUnlocked && !action.isCapped
                )
            })
        })
    }

    getActionsData(filterId, options) {
        if(!filterId || !this.customFilters[filterId]) {
            filterId = 'all';
        }
        // const entities = gameEntity.listEntitiesByTags(['action']).filter(one => one.isUnlocked && !one.isCapped);
        const perCats = Object.values(this.customFilters).reduce((acc, filter) => {

            acc[filter.id] = {
                id: filter.id,
                name: filter.name,
                rules: filter.rules,
                isPinned: filter.isPinned,
                sortIndex: this.customFiltersOrder.findIndex(s => s === filter.id),
                items: gameEntity.listEntitiesByTags(['action'])
                    .filter(one => this.filtersCache[filter.id][one.id] && one.isUnlocked && !one.isCapped
                        && (options?.showHidden || this.showHidden || !this.actions?.[one.id]?.isHidden)
                        && this.matchActionSearch(one, options.searchData)
                    ),
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
            category: entity.category,
            description: entity.description,
            max: entity.getMaxLevel ? entity.getMaxLevel() : entity.maxLevel || 0,
            level: this.actions[entity.id]?.level || 1,
            affordable: gameEntity.getAffordable(entity.id),
            entityEfficiency: this.isRunningAction(entity.id) ? gameEntity.getEntityEfficiency(`runningAction_${entity.id}`) : 1,
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
                cap: this.getFocusCapTime(entity.id),
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
            isHidden: this.actions?.[entity.id]?.isHidden,
            monitored: this.getMonitoredData(entity),
            missingResourceId: this.isRunningAction(entity.id) && gameEntity.getEntityEfficiency(`runningAction_${entity.id}`) < 1 ? gameEntity.getEntity(`runningAction_${entity.id}`)?.modifier?.bottleNeck : null,
            // nextEtas: this.getEtasNext(entity.id)
        }))

        const current = this.activeActions ? available.filter(one => this.activeActions.some(act => act.originalId === one.id)) : null;

        return {
            available,
            current,
            showHidden: this.showHidden,
            actionLists: this.lists.getLists(),
            runningList: this.lists.runningList,
            actionListsUnlocked: gameEntity.getLevel('shop_item_notebook') > 0,
            actionCategories: Object.values(perCats).filter(cat => cat.items.length > 0).sort((a, b) => a.sortIndex - b.sortIndex),
            automationEnabled: this.lists.automationEnabled,
            automationUnlocked: gameEntity.getLevel('shop_item_planner') > 0,
            autotriggerIntervalSetting: this.lists.autotriggerIntervalSetting,
            searchData: this.searchData,
            selectedCategory: filterId,
            customFilters: this.customFilters,
            customFiltersOrder: this.customFiltersOrder,
            stats: {
                learnMults: {
                    learningRate: gameEffects.getEffect('learning_rate'),
                    physicalLearningRate: gameEffects.getEffect('physical_training_learn_speed'),
                    mentalLearningRate: gameEffects.getEffect('mental_training_learning_rate'),
                    socialLearningRate: gameEffects.getEffect('social_training_learning_rate'),
                    routineLearningRate: gameEffects.getEffect('routine_learning_speed'),
                    spiritualLearningRate: gameEffects.getEffect('spiritual_learning_rate'),
                    booksLearningRate: gameEffects.getEffect('books_learning_rate'),
                    mentalActivitiesLearningRate: gameEffects.getEffect('mental_activities_learn_rate')
                },
                xpDiscounts: {
                    physical_actions_discount: gameEffects.getEffect('physical_actions_discount'),
                    social_actions_discount: gameEffects.getEffect('social_actions_discount'),
                    mental_actions_discount: gameEffects.getEffect('mental_actions_discount'),
                    magical_actions_discount: gameEffects.getEffect('magical_actions_discount'),
                    routine_actions_discount: gameEffects.getEffect('routine_actions_discount'),
                }
            },
            aspects: {
                isUnlocked: gameEntity.getLevel('shop_item_aspects_focus') > 0, // temporary
                list: gameEntity.listEntitiesByTags(['aspect']).map(one => ({
                    id: one.id,
                    name: one.name,
                    level: one.level,
                    effects: gameEntity.getEffects(one.id),
                    maxLevel: this.getAspectMaxLevel(one.attributes.keyAttribute),
                    attributeData: gameEffects.getEffect(one.attributes.keyAttribute),
                    nextPoint: Math.ceil((gameEffects.getEffectValue(one.attributes.keyAttribute) + SMALL_NUMBER) / this.getAttributeAspectReq(one.attributes.keyAttribute))*this.getAttributeAspectReq(one.attributes.keyAttribute),
                    progress: (gameEffects.getEffectValue(one.attributes.keyAttribute) - this.getAttributeAspectReq(one.attributes.keyAttribute)*Math.floor(gameEffects.getEffectValue(one.attributes.keyAttribute) / this.getAttributeAspectReq(one.attributes.keyAttribute)))/this.getAttributeAspectReq(one.attributes.keyAttribute),
                    color: one.attributes.color,
                    keepMaxed: this.aspectsSettings[one.id]?.maxed ?? false
                }))
            }
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
            actionEffect: gameEntity.getEffects(entity.id, 0, this.actions[entity.id]?.level || 1, true).filter(eff => eff.type === 'resources' || entity.attributes.isEffectChanneling),
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
            etas: this.getEtas(entity.id),
            aspect: entity.attributes?.primaryAttribute && gameEntity.getLevel('shop_item_aspects_focus') > 0 ? {
                intensity: entity.getIntensityAspect(),
                aspect: gameEntity.getEntity(`${entity.attributes?.primaryAttribute}_aspect`),
            } : null,
            entityEfficiency: this.isRunningAction(entity.id) ? gameEntity.getEntityEfficiency(`runningAction_${entity.id}`) : 1,
        };

        if(gameEntity.getAttribute(entity.id, 'isRankAvailable')) {
            const rankData = {
                rank: this.getActionRank(entity.id),
                nextRankLevel: 100*Math.ceil((this.actions[entity.id]?.level + 1)/100),
                prevRankLevel: 100*Math.floor((this.actions[entity.id]?.level + 1)/100),
            }

            rankData.progress = (this.actions[entity.id]?.level - rankData.prevRankLevel) / 100;
            rankData.bonus = this.getRankBonus(rankData.rank);
            entityData.rankData = rankData;
        }

        if(entityData.entityEfficiency < 1) {
            entityData.missingResource = gameResources.getResource(gameEntity.getEntity(`runningAction_${entity.id}`)?.modifier?.bottleNeck);
        }
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

    sendActionsUnlocks(showPrevious) {
        const data = this.getActionsUnlocks(showPrevious);
        this.eventHandler.sendData('actions-unlocks', data);
    }

}