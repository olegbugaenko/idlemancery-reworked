import {GameModule} from "../../shared/game-module";
import {gameEntity, gameResources, gameCore, resourceCalculators, gameEffects} from "game-framework";
import {checkMatchingRules} from "../../shared/utils/rule-utils";
import {mapObject} from "../../shared/utils/objects";
import {SMALL_NUMBER} from "game-framework/src/utils/consts";

export class ActionListsSubmodule extends GameModule {

    constructor() {
        super();

        this.actionsLists = {};

        this.runningList = null;

        this.listsAutotrigger = [];

        this.autotriggerCD = 0;

        this.automationEnabled = false;

        this.combineLists = true;

        this.autotriggerIntervalSetting = 10;

        this.autoApplyCD = 0;

        this.listsSearchCache = {};

        this.eventHandler.registerHandler('save-action-list', (payload) => {
            this.saveActionList(payload);
        })

        this.eventHandler.registerHandler('delete-action-list', ({id}) => {
            this.deleteActionList(id);
        })

        this.eventHandler.registerHandler('load-action-list', ({ id }) => {
            this.sendListData(id);
        })

        this.eventHandler.registerHandler('query-actions-list-for-copy', ({ id }) => {
            this.sendListData(id, false, { isCopy: true });
        })

        this.eventHandler.registerHandler('query-actions-lists', (pl) => {
            const lists = this.getLists(pl);
            let label = 'actions-lists';
            if(pl.prefix) {
                label = `${label}-${pl.prefix}`;
            }
            this.eventHandler.sendData(label, lists);
        })

        this.eventHandler.registerHandler('run-list', ({ id }) => {
            this.runList(id);
        })

        this.eventHandler.registerHandler('stop-list', ({ id }) => {
            this.stopList(id);
        })

        this.eventHandler.registerHandler('set-automation-enabled', ({ flag }) => {
            this.automationEnabled = !!flag;
        })

        this.eventHandler.registerHandler('set-autotrigger-interval', ({ interval }) => {
            this.autotriggerIntervalSetting = interval;
        })

        this.eventHandler.registerHandler('set-action-lists-order', (payload) => {
            this.reorderLists(payload);
        })


        this.eventHandler.registerHandler('query-action-list-effects', ({ id, listData }) => {
            
            listData = this.applyDynamicValuesToList(listData);

            const data = this.getListEffects(null, listData);

            const prevEffects = [];
            const resourcesEffects = this.packEffects(data.filter(one => one.type === 'resources' && !['capMult','rawCap'].includes(one.scope)).map(effect => {
                const prev = resourceCalculators.assertResource(effect.id, false, ['runningActions']);

                if(effect.scope !== 'income' && effect.scope !== 'consumption') return effect;

                const pScope = effect.scope === 'consumption' ? 'income' : effect.scope;

                const nPrv = {
                    ...effect,
                    scope: pScope,
                    value: prev.balance
                };

                if(nPrv.value < 0) {
                    nPrv.value = Math.abs(nPrv.value);
                    nPrv.scope = 'consumption';
                }

                prevEffects.push(nPrv);

                const newVal = (effect.scope === 'income' ? effect.value : -effect.value) + prev.balance;

                const nScope = newVal > 0 ? 'income' : 'consumption';

                return {
                    ...effect,
                    value: Math.abs(newVal),
                    scope: nScope
                }
            }));

            const proportionsBar = this.getProportionsBar(listData)

            this.eventHandler.sendData('action-list-effects', {
                potentialEffects: data,
                resourcesEffects,
                prevEffects: this.packEffects(prevEffects),
                effectEffects: data.filter(one => one.type === 'effects' || ['capMult','rawCap'].includes(one.scope)),
                proportionsBar,
                newTimes: listData.actions,
            });
        })
    }

    generateSearchCacheForList(id) {
        const list = this.actionsLists[id];
        if(!list) return;
        const actionsCache = list.actions.map(one => {
            const action = gameEntity.getEntity(one.id)?.name;
            return action.toLowerCase();
        });
        const effects = this.getListEffects(null, list);
        const effectsCache = [];
        const resourcesCache = [];
        console.log('Regen: ', list.name, JSON.parse(JSON.stringify(effects)), JSON.parse(JSON.stringify(list)));
        effects.forEach(eff => {
            if(eff.type === 'resources') {
                const ent = gameResources.getResource(eff.id)?.name;
                resourcesCache.push(ent.toLowerCase());
            }
            if(eff.type === 'effects') {
                const ent = gameEffects.getEffect(eff.id)?.name;
                effectsCache.push(ent.toLowerCase());
            }
        })
        this.listsSearchCache[id] = {
            name: [list.name.toLowerCase()],
            actions: actionsCache,
            effects: effectsCache,
            resources: resourcesCache,
        }
    }

    generateAllListsSearchCache() {
        for(const listId in this.actionsLists) {
            this.generateSearchCacheForList(listId);
        }
    }

    optimizeDynamicEfforts({
        dynamicActions,
        fixedTotal,
        initialResourceBalance, // {resId: {current, income, consumption}}
        actionContributions,    // {actionId: [{id, value}]}
        actionConsumptions,     // {actionId: [{id, value}]}
        maxIterations = 100,
        learningRate = 0.1,
        tolerance = 1e-4,
    }) {
        const resourceIds = Object.keys(initialResourceBalance);
        const dynamicIds = dynamicActions.map(a => a.id);
        const T = Object.fromEntries(dynamicIds.map(id => [id, 100*SMALL_NUMBER])); // initial time guess

        function computeDeficits(T_values) {
            const totalDynamic = Object.values(T_values).reduce((a, b) => a + b, 0);
            const totalTime = fixedTotal + totalDynamic;
            const fixedFraction = fixedTotal / totalTime;

            const balance = {};
            const totalReqs = {};
            const totalContribs = {};
            const totalConsumes = {};

            const maxContrib = {};
            const maxConsumes = {};

            for (const resId of resourceIds) {
                maxContrib[resId] = 0;
                maxConsumes[resId] = 0;
            }

            for (const r of resourceIds) {
                const base = initialResourceBalance[r] || { current: 0, income: 0, consumption: 0, currentConsumption: 0 };
                const fixedPart = base.current + base.income * fixedFraction - base.consumption * fixedFraction;
                balance[r] = fixedPart;
                totalReqs[r] = base.currentConsumption + base.consumption * fixedFraction;
                totalContribs[r] = 0;
                totalConsumes[r] = base.consumption * fixedFraction;
                maxContrib[r] = 0;
                maxConsumes[r] = base.consumption;
            }

            for (const id of dynamicIds) {
                const t = T_values[id];
                const contribs = actionContributions[id] || [];
                const consumes = actionConsumptions[id] || [];

                for (const { id: resId, value } of contribs) {
                    const amount = value * (t / totalTime);
                    balance[resId] += amount;
                    totalContribs[resId] += amount;
                    maxContrib[resId] = Math.max(maxContrib[resId], value)
                }
                for (const { id: resId, value } of consumes) {
                    const amount = value * (t / totalTime);
                    balance[resId] -= amount;
                    totalConsumes[resId] += amount;
                    totalReqs[resId] += amount;
                    maxConsumes[resId] = Math.max(maxConsumes[resId], value)
                    //if(id === 'action_read_books' && resId === 'energy') {
                    //    console.log('CRB: ', T_values[id], totalTime, consumes, totalConsumes, amount, value);
                    //}
                }
                
            }

            const deficits = {};
            for (const r of resourceIds) {
                if (balance[r] < 0) {
                    deficits[r] = -balance[r] / (totalReqs[r] || SMALL_NUMBER);
                }
            }

            const averageContribs = {};
            const averageConsumes = {};
            for (const r of resourceIds) {
                averageContribs[r] = totalContribs[r];
                averageConsumes[r] = totalConsumes[r];
            }

            //console.log('defs: ', deficits, averageContribs, averageConsumes);

            return { deficits, averageContribs, averageConsumes, maxContrib, maxConsumes, maxContrib };
        }

        function computeTotalDeficit(deficits) {
            return Object.values(deficits).reduce((sum, d) => sum + d * d, 0);
        }

        const maxContribs = {};
        const maxConsumptions = {};

        for (const resId of resourceIds) {
            maxContribs[resId] = 0;
            maxConsumptions[resId] = 0;
        }

        for (const id of dynamicIds) {
            const contribs = actionContributions[id] || [];
            const consumes = actionConsumptions[id] || [];

            for (const { id: resId, value } of contribs) {
                if (value > 0) {
                    maxContribs[resId] = Math.max(maxContribs[resId], value);
                }
            }
            for (const { id: resId, value } of consumes) {
                if (value > 0) {
                    maxConsumptions[resId] = Math.max(maxConsumptions[resId], value);
                }
            }
        }

        let prevDeficits = 10;

        for (let iter = 0; iter < maxIterations; iter++) {
            const { deficits, averageContribs, averageConsumes, maxConsumes, maxContrib } = computeDeficits(T);
            const totalError = computeTotalDeficit(deficits);

            if (Math.abs(totalError - prevDeficits) < tolerance) break;

            const gradient = {};

            for (const id of dynamicIds) {
                gradient[id] = 0;
                const contribs = actionContributions[id] || [];
                const consumes = actionConsumptions[id] || [];

                for (const resId of resourceIds) {
                    const d = deficits[resId] || 0;
                    const c = contribs.find(e => e.id === resId)?.value || 0;
                    const s = consumes.find(e => e.id === resId)?.value || 0;
                    const maxC = maxContrib[resId] || SMALL_NUMBER;
                    const maxS = maxConsumes[resId] || SMALL_NUMBER;
                    const avgC = averageContribs[resId] || 0;
                    const avgS = averageConsumes[resId] || 0;

                    const normNet = (c ? ((c - avgC) / maxC) : 0) - (s ? ((s - avgS) / maxS) : 0);
                    gradient[id] += normNet * d;
                    //if(id === 'action_read_books') {
                    //    console.log(`|-| ${gradient[id]}: ${resId} delta = ${normNet*d}: (${c} - ${avgC})/${maxC} - (${s} - ${avgS})/${maxS}`);
                    //}
                }
            }

            const totalDynamic = Object.values(T).reduce((a, b) => a + b, 0);
            const totalTime = fixedTotal + totalDynamic;

            //console.log(`SubIter${iter}: ${Math.abs(totalError - prevDeficits)} < ${tolerance}`, deficits, initialResourceBalance, gradient, T);

            for (const id of dynamicIds) {
                const t = T[id];
                const g = gradient[id];
                T[id] = Math.max(0, t + learningRate * g * totalTime);
            }

            prevDeficits = totalError;
        }

        return T;
    }

    getListDynamicValues(listData) {
        const MAX_ITER = 10;
        const TOLERANCE = 0.001;
        const SMALL_NUMBER = 1e-6;

        const baseActions = listData.actions || [];
        const dynamicActions = baseActions.filter(a => a.isDynamicTime);
        const fixedActions = baseActions.filter(a => !a.isDynamicTime);
        const fixedTotal = fixedActions.reduce((acc, one) => acc + one.time, 0);
        if (dynamicActions.length === 0) return {};

        const fallbackTimes = {};
        const skipDynamicActions = new Set();
        const resourceToActions = {};
        const actionContributions = {};
        const actionConsumptions = {};
        let keysToTrack = [];

        // 1. Ініціалізація дефіцитів для виявлення ключових ресурсів
        const actions0 = baseActions.map(one =>
            one.isDynamicTime ? { ...one, time: SMALL_NUMBER*Math.max(1, fixedTotal) } : one
        );
        const effects0 = this.getListEffects(null, { ...listData, actions: actions0 });

        const initialResourceBalance = {};
        /*if(gameEntity.entityExists(`activeCrafting_craft_refined_wood`)) {
            console.log('WOOHOOD: ', gameEntity.getEntity(`activeCrafting_craft_refined_wood`), JSON.parse(JSON.stringify(gameEntity.getEntity('crafting_intensities'))), JSON.parse(JSON.stringify(gameCore.getModule('crafting').craftingSlots)), JSON.parse(JSON.stringify(gameEffects.getEffect('effort_craft_refined_wood'))), gameEffects.getEffectValue('effort_craft_refined_wood'));
        }*/
        effects0.forEach(effect => {
            if (effect.type !== 'resources') return;
            const base = resourceCalculators.assertResource(effect.id, false, ['runningActions'], {
                targetEfficiency: 1,
            });
            const currentIncome = base.balance;

            if (!initialResourceBalance[effect.id]) {
                initialResourceBalance[effect.id] = { income: 0, consumption: 0, current: currentIncome, currentConsumption: base.consumption };
            }

            const group = initialResourceBalance[effect.id];
            if (effect.scope === 'income') group.income += effect.value;
            else if (effect.scope === 'consumption') group.consumption += effect.value;
        });


        const potentialConsumption = new Set();

        for (const act of dynamicActions) {
            const oneActionEffects = this.getListEffects(null, { actions: [act] });
            for (const effect of oneActionEffects) {
                if (effect.type === 'resources' && effect.scope === 'consumption') {
                    potentialConsumption.add(effect.id);
                }
            }
        }

        for (const [id, val] of Object.entries(initialResourceBalance)) {
            const net = val.current + val.income - val.consumption;
            if (net < 0 || potentialConsumption.has(id) || val.current < 0) {
                keysToTrack.push(id);
            }
        }

        const maxIncomes = {};
        const minConsumptions = {};

        // 2. Аналіз кожної динамічної дії — чи вона впливає на ключові ресурси
        for (const act of dynamicActions) {
            fallbackTimes[act.id] = act.time ?? 0.001;

            const oneActionEffects = this.getListEffects(null, { actions: [act] });
            const incomeEffects = oneActionEffects.filter(e => e.type === 'resources' && e.scope === 'income');
            actionContributions[act.id] = incomeEffects.map(e => ({ id: e.id, value: e.value }));
            const consumptions = oneActionEffects
                .filter(e => e.type === 'resources' && e.scope === 'consumption')
                .map(e => ({ id: e.id, value: e.value }));

            actionConsumptions[act.id] = consumptions/*.reduce((acc, item) => ({...acc, [item.id]: item.value}), {})*/;

            let contributesToDeficit = false;
            for (const { id, value } of incomeEffects) {
                if (!resourceToActions[id]) resourceToActions[id] = new Set();
                resourceToActions[id].add(act.id);
                if (keysToTrack.includes(id)) {
                    contributesToDeficit = true;
                    maxIncomes[id] = Math.max(maxIncomes[id] ?? 0, value)
                }
            }

            for (const { id, value } of consumptions) {
                if (keysToTrack.includes(id)) {
                    minConsumptions[id] = Math.min(minConsumptions[id] ?? 1.e+100, value)
                }
            }

            for(const key of keysToTrack) {
                if(!consumptions.find(o => o.id === key)) {
                    minConsumptions[key] = 0;
                }
            }

            if (!contributesToDeficit) {
                skipDynamicActions.add(act.id);
            }
        }

        // 2.1 Аналіз фіксованих дій


        const fixedActionEffects = this.getListEffects(null, { actions: fixedActions });
        const incomeEffects = fixedActionEffects.filter(e => e.type === 'resources' && e.scope === 'income' && keysToTrack.includes(e.id));

        const consumptions = fixedActionEffects
            .filter(e => e.type === 'resources' && e.scope === 'consumption' && keysToTrack.includes(e.id))
            .map(e => ({ id: e.id, value: e.value }));

        for (const { id, value } of incomeEffects) {
            maxIncomes[id] = Math.max(maxIncomes[id] ?? 0, value)
        }

        for (const { id, value } of consumptions) {
            minConsumptions[id] = Math.min(minConsumptions[id] ?? 1.e+100, value)
        }


        // Temporarily commented out

        keysToTrack = keysToTrack.filter(key => {
            if(initialResourceBalance[key].current < 0 && ((maxIncomes[key] ?? 0) < -initialResourceBalance[key].current)) {
                console.log('Unable to balance '+key, initialResourceBalance[key].current, maxIncomes[key])
                return false;
            }
            if(initialResourceBalance[key].current > 0 && ((minConsumptions[key] ?? 0) > initialResourceBalance[key].current)) {
                console.log('Unable to balance '+key+' due to minConsumption', initialResourceBalance[key].current, minConsumptions)
                return false;
            }
            return true;
        })

        const forecastedActionsEfficiencies = {};
        let finalDeficites = {};

        let dynamicValues = Object.fromEntries(dynamicActions.filter(one => !skipDynamicActions.has(one.id)).map(a => [a.id, 0.001]));
        let previousDeficits = {};

        const bst = performance.now();

        let stable = false;

        for (let iter = 0; iter < MAX_ITER; iter++) {
            const actions = baseActions.map(one =>
                one.isDynamicTime && !skipDynamicActions.has(one.id)
                    ? { ...one, time: dynamicValues[one.id] || 0.001 }
                    : one
            );

            const dynamicTotal = dynamicActions.reduce((acc, one) =>
                    skipDynamicActions.has(one.id)
                        ? acc + (fallbackTimes[one.id] || 0.001)
                        : acc + (dynamicValues[one.id] || 0.001)
                , 0);

            const totalListTime = fixedTotal + dynamicTotal;

            const allEffects = this.getListEffects(null, { ...listData, actions });

            const resourceBalanceMap = {};
            allEffects.forEach(effect => {
                if (effect.type !== 'resources') return;

                const base = resourceCalculators.assertResource(effect.id, false, ['runningActions'], {
                    targetEfficiency: 1,
                });

                const currentIncome = base.balance;

                if (!resourceBalanceMap[effect.id]) {
                    resourceBalanceMap[effect.id] = { income: 0, consumption: 0, current: currentIncome };
                }

                const group = resourceBalanceMap[effect.id];
                if (effect.scope === 'income') group.income += effect.value;
                else if (effect.scope === 'consumption') group.consumption += effect.value;

                if(group.consumption) {
                    group.forecastedEfficiency = (base.income*base.multiplier) / (group.consumption + base.consumption);
                } else {
                    group.forecastedEfficiency = 1;
                }
            });

            const potentialEfficiencies = {};
            for(const actId in actionConsumptions) {
                potentialEfficiencies[actId] = 1;
                for(const consumption of actionConsumptions[actId]) {
                    if(resourceBalanceMap[consumption.id].forecastedEfficiency < 1 - SMALL_NUMBER) {
                        potentialEfficiencies[actId] = Math.min(potentialEfficiencies[actId], resourceBalanceMap[consumption.id].forecastedEfficiency)
                    }
                }
            }

            //console.log(`Iter${iter} balance map: `, resourceBalanceMap, potentialEfficiencies, dynamicValues);

            const currentDeficits = {};
            const currentProficits = {};
            for (const [id, val] of Object.entries(resourceBalanceMap)) {
                if(!keysToTrack.includes(id)) {
                    continue;
                }
                const net = val.current + val.income - val.consumption;
                if (net < 0) {
                    currentDeficits[id] = Math.abs(net);
                } else if (net > 0 && keysToTrack.includes(id)) {
                    currentProficits[id] = net;
                }
            }

            if (iter === 0) {
                for (const [resourceId, deficit] of Object.entries(currentDeficits)) {
                    const actionsThatContribute = resourceToActions[resourceId];
                    if (!actionsThatContribute) continue;

                    const totalValuePerSec = Array.from(actionsThatContribute).reduce((sum, actionId) => {
                        const contrib = actionContributions[actionId].find(c => c.id === resourceId);
                        return sum + (contrib?.value || 0)*((actionId in potentialEfficiencies) ? potentialEfficiencies[actionId] : 1);
                    }, 0);

                    if (totalValuePerSec <= 0) continue;

                    const totalNeededTime = deficit * totalListTime / totalValuePerSec;

                    for (const actionId of actionsThatContribute) {
                        const contrib = actionContributions[actionId].find(c => c.id === resourceId);
                        const portion = (contrib?.value || 0) / totalValuePerSec;
                        const timeToAdd = totalNeededTime * portion;
                        dynamicValues[actionId] = (dynamicValues[actionId] || 0) + timeToAdd;
                    }
                    //console.log('Iter0: ', resourceId, deficit, dynamicValues);

                }
            } else {
                for (const [resourceId, prevDeficit] of Object.entries(previousDeficits)) {
                    const current = currentDeficits[resourceId] || -currentProficits[resourceId] || 0;
                    const delta = current;

                    const actionsThatContribute = resourceToActions[resourceId];
                    if (!actionsThatContribute) continue;

                    const totalValuePerSec = Array.from(actionsThatContribute).reduce((sum, actionId) => {
                        const contrib = actionContributions[actionId].find(c => c.id === resourceId);
                        return sum + (contrib?.value || 0)*((actionId in potentialEfficiencies) ? potentialEfficiencies[actionId] : 1);
                    }, 0);

                    if (totalValuePerSec <= 0) continue;

                    const timeCorrection = delta * totalListTime / totalValuePerSec;

                    for (const actionId of actionsThatContribute) {
                        const contrib = actionContributions[actionId].find(c => c.id === resourceId);
                        const portion = (contrib?.value || 0) / totalValuePerSec;
                        const deltaTime = timeCorrection * portion;
                        const newTime = Math.max(0, (dynamicValues[actionId] || 0) + deltaTime);
                        dynamicValues[actionId] = newTime;
                    }
                }
                //console.log(`Iter${iter} values: `, dynamicValues, previousDeficits, currentDeficits);
            }

            stable = true;
            for (const [resId, def] of Object.entries(currentDeficits)) {
                const prev = previousDeficits[resId] ?? 0;
                if (Math.abs(prev - def) > TOLERANCE || (def > TOLERANCE)) {

                    stable = false;
                    break;
                }
            }

            previousDeficits = { ...currentDeficits };
            finalDeficites = {...currentDeficits};

            if (stable) {
                break;
            }
        }

        console.log('currentDeficites: ', finalDeficites, actionContributions, actionConsumptions, performance.now() - bst, stable);

        if(!stable) {
            const st = performance.now();
            const guessedMinimized = this.optimizeDynamicEfforts({
                dynamicActions,
                fixedTotal,
                initialResourceBalance,
                actionContributions,
                actionConsumptions,
                maxIterations: 30,
                learningRate: 0.1,
                tolerance: 0.0001,
            });
            console.log('guessedMinimized: ', guessedMinimized, performance.now() - st);

            return guessedMinimized;
        }




        return dynamicValues;
    }

    canAutoSetTime(action) {
        const effects = this.getListEffects(null, { actions: [action] });
        return effects.some(e => e.type === 'resources' && e.scope === 'income' && e.value > 0);
    }


    applyDynamicValuesToList(listData) {
        if (!listData?.actions?.length) return listData;

        // Примусово вимикаємо dynamicTime для дій без дозволу
        const preparedActions = listData.actions.map(action => {
            const isAutoTimeEnabled = this.canAutoSetTime(action);
            return {
                ...action,
                isAutoTimeEnabled,
                isDynamicTime: isAutoTimeEnabled ? action.isDynamicTime : false
            };
        });

        const preparedList = { ...listData, actions: preparedActions };

        const dynamicActions = preparedActions.filter(a => a.isDynamicTime);
        if (!dynamicActions.length) return preparedList;

        const dynamic = this.getListDynamicValues(preparedList);

        return {
            ...listData,
            actions: preparedActions.map(action => {
                const updated = action.isDynamicTime && dynamic[action.id]
                    ? { ...action, time: dynamic[action.id] }
                    : action;
                return {
                    ...updated,
                    isAutoTimeEnabled: action.isAutoTimeEnabled // завжди повертати явно
                };
            })
        };
    }



    runList(id) {
        if(!id) {
            this.stopList();
            return;
        }
        this.runningList = {
            id,
            name: this.actionsLists[id].name,
            actionIndex: 0,
            actionTimer: 0,
        };

        if(this.combineLists) {
            // register entity as custom action
            this.runCombinedList(id);
        }
    }

    stopList() {
        this.runningList = null;
        gameCore.getModule('actions').stopRunningActions();
    }

    saveActionList(payload) {
        let isNew = !payload.id;

        const list = {...payload};

        delete list['isReopenEdit'];
        delete list['copyId'];

        const isReopenEdit = payload.isReopenEdit

        if(!list.id) {
            list.id = `${Math.random()*1000000}`
        }

        this.actionsLists[list.id] = list;

        this.actionsLists[list.id].actions = (this.actionsLists[list.id].actions || []).filter(one => one.time > 0);

        if(isReopenEdit) {
            this.sendListData(list.id, true);
        }

        this.sortLists();

        this.regenerateListsPriorityMap();

        this.generateSearchCacheForList(list.id);

        if(this.runningList?.id && (this.runningList?.id === payload.id)) {
            const listToRun = this.actionsLists[this.runningList.id];

            let newTotalTime = 0.;

            listToRun.actions.forEach(a => {
                const isAvailable = gameEntity.isEntityUnlocked(a.id) && !gameEntity.isCapped(a.id);
                if(isAvailable) {
                    newTotalTime += a.time;
                }
            })

            gameCore.getModule('actions').activeActions = gameCore.getModule('actions').activeActions.map(active => {
                return {
                    ...active,
                    effort: (listToRun.actions.find(o => o.id === active.originalId)?.time || 0) / Math.max(newTotalTime, 0.0001)
                }
            })
            gameCore.getModule('actions').reassertRunningEfforts(true);
        }
    }

    deleteActionList(id) {

        if(this.runningList?.id === id) {
            this.stopList();
        }

        delete this.actionsLists[id];

        this.sortLists();

        this.regenerateListsPriorityMap();
    }

    regenerateListsPriorityMap() {
        const listsBeingAutotrigger = Object.values(this.actionsLists).filter(one => !!one.autotrigger?.isEnabled);

        const listsBeingAutotriggerAvailable = listsBeingAutotrigger.filter(lst => {
           if(lst.actions && lst.actions.find(one => gameEntity.isEntityUnlocked(one.id)
               && !gameEntity.isCapped(one.id))) return true;

           return false;
        });
        this.listsAutotrigger = listsBeingAutotriggerAvailable.map(one => ({
            id: one.id,
            priority: one.autotrigger.priority ?? 0,
        })).sort((a, b) => a.priority - b.priority);
    }

    reorderLists(newOrder) {
        newOrder.forEach(({ id, sort }) => {
            if (this.actionsLists[id]) {
                this.actionsLists[id].sort = sort;
            }
        });
        this.sortLists(); // Re-sort the cached list
    }

    sortLists() {
        this._cachedSortedLists = Object.values(this.actionsLists).sort((a, b) => a.sort - b.sort);
    }

    getLists(pl) {
        if(!this._cachedSortedLists) {
            this.sortLists();
        }
        const favoritesModule = gameCore.getModule('favorites');
        let ls = this._cachedSortedLists.map(one => ({
            ...one,
            isUnlocked: true,
            searchCache: this.listsSearchCache[one.id],
            isFavorite: favoritesModule ? favoritesModule.isFavorite('actionLists', one.id) : false,
        }));

        if(pl?.filterAutomated) {
            ls = ls.filter(one => one.autotrigger?.rules?.length || one.autotrigger?.isEnabled);
        }
        return ls;
    }

    save() {
        return {
            list: mapObject(this.actionsLists, one => ({
                id: one.id,
                name: one.name,
                sort: one.sort,
                actions: one.actions,
                autotrigger: one.autotrigger
            })),
            runningList: this.runningList,
            automationEnabled: this.automationEnabled,
            autotriggerIntervalSetting: this.autotriggerIntervalSetting,
        }
    }

    load(obj) {
        this.actionsLists = obj?.list ?? []
        this.runningList = obj?.runningList ?? null;
        this.automationEnabled = obj?.automationEnabled;
        this.autotriggerIntervalSetting = obj?.autotriggerIntervalSetting || 10;
        if(this.actionsLists) {
            for(const key in this.actionsLists) {
                this.actionsLists[key].actions = (this.actionsLists[key].actions || []).filter(one => one.time > 0);
                this.actionsLists[key].id = key;
            }
        }
        this.sortLists();
        this.regenerateListsPriorityMap();
        // this.generateAllListsSearchCache();
    }

    getAutotriggerList() {
        for(const list of this.listsAutotrigger) {
            if(checkMatchingRules(this.actionsLists[list.id]?.autotrigger?.rules, this.actionsLists[list.id]?.autotrigger?.pattern)) {
                return list.id;
            }
        }
        return null;
    }

    tick(game, delta) {
        // Here we checking autotrigger
        if(this.automationEnabled && this.listsAutotrigger.length && this.autotriggerCD <= 0) {
            this.autotriggerCD = this.autotriggerIntervalSetting || 10;
            const autotrigger = this.getAutotriggerList();

            if(autotrigger && this.runningList?.id !== autotrigger) {
                this.runList(autotrigger);
            }
        }

        this.autotriggerCD -= delta;

        if (this.runningList && !this.combineLists) {
            const listToRun = this.actionsLists[this.runningList.id];
            if (!listToRun) {
                console.error('List: ', this.actionsLists, this.runningList);
                throw new Error('Invalid list to run!!');
            }

            let action = listToRun.actions[this.runningList.actionIndex];
            let isAvailable = action?.id && gameEntity.isEntityUnlocked(action.id) && !gameEntity.isCapped(action.id);

            // Check if action timer exceeded or action is not available
            if (!action || this.runningList.actionTimer > action.time || !isAvailable) {
                this.runningList.actionTimer = 0;

                // Initialize loop control variables
                let loops = 0;
                const maxLoops = listToRun.actions.length;

                // Loop to find the next available action
                do {
                    this.runningList.actionIndex++;
                    if (this.runningList.actionIndex >= listToRun.actions.length) {
                        this.runningList.actionIndex = 0; // Reset to start if end is reached
                    }

                    action = listToRun.actions[this.runningList.actionIndex];
                    isAvailable = action && gameEntity.isEntityUnlocked(action.id) && !gameEntity.isCapped(action.id);
                    loops++;
                } while (!isAvailable && loops < maxLoops);

                if (!isAvailable) {
                    // No available actions found in the list
                    // Handle this case as needed, e.g., stop the running list
                    this.stopList();
                    gameCore.getModule('actions').setRunningAction(null);
                    return; // Exit the function early
                } else {
                    // console.log('Toggled to:', this.runningList, action.id, delta);
                }
            }

            // Set the active action if it's not already active
            if (gameCore.getModule('actions').activeAction !== action.id) {
                gameCore.getModule('actions').setRunningAction(action.id);
            }

            // Increment the action timer
            this.runningList.actionTimer += delta;
        }

        if (this.runningList && this.combineLists) {
            // include available notpresent
            const listToRun = this.actionsLists[this.runningList.id];
            if (!listToRun) {
                console.error('List: ', this.actionsLists, this.runningList);
                throw new Error('Invalid list to run');
            }

            const totalTime = listToRun.actions.reduce((acc, item) => acc += item.time, 0)
            let needReassert = false;
            let newTotalTime = 0.;
            listToRun.actions.forEach(a => {
                const isAvailable = gameEntity.isEntityUnlocked(a.id) && !gameEntity.isCapped(a.id);
                if(isAvailable) {
                    newTotalTime += a.time;
                }
                if(!isAvailable && gameCore.getModule('actions').isRunningAction(a.id)) {
                    gameCore.getModule('actions').dropRunningAction(a.id);
                    needReassert = true;
                }
                if(!gameCore.getModule('actions').isRunningAction(a.id) && isAvailable) {
                    gameCore.getModule('actions').addRunningAction(a.id, a.time / totalTime);
                    needReassert = true;
                }
            })
            const activeActions = gameCore.getModule('actions').activeActions;
            activeActions.forEach(active => {
                if(!listToRun.actions.find(o => o.id === active.originalId)) {
                    gameCore.getModule('actions').dropRunningAction(active.originalId);
                    needReassert = true;
                }
            })
            if(needReassert) {
                gameCore.getModule('actions').activeActions = gameCore.getModule('actions').activeActions.map(active => {
                    return {
                        ...active,
                        effort: (listToRun.actions.find(o => o.id === active.originalId)?.time || 0) / newTotalTime
                    }
                })
                gameCore.getModule('actions').reassertRunningEfforts();
            }
        }

        if(this.runningList?.id) {
            this.autoApplyCD -= delta;
            if(this.autoApplyCD < 0) {
                this.autoApplyCD = 10;
                const runningList = this.actionsLists[this.runningList.id];
                this.actionsLists[this.runningList.id] = this.applyDynamicValuesToList(runningList);
                this.runList(this.runningList?.id);
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

    runCombinedList(id) {
        const data = this.actionsLists[id];

        const actionsAvailable = (data.actions || []).map(a => ({
            ...a,
            isAvailable: gameEntity.isEntityUnlocked(a.id) && !gameEntity.isCapped(a.id)
        }));

        const totalTime = actionsAvailable
            .filter(action => gameEntity.isEntityUnlocked(action.id) && !gameEntity.isCapped(action.id))
            .reduce((acc, item) => acc += item.time, 0);

        const actionsFractions = actionsAvailable.map(action => ({
            ...action,
            effortFraction: action.time / Math.max(totalTime, 0.0001)
        }));

        // now registering entities for every action
        gameCore.getModule('actions').stopRunningActions();
        actionsFractions.forEach(actionToRun => {
            gameCore.getModule('actions').addRunningAction(
                actionToRun.id,
                actionToRun.effortFraction
            )
        })
    }

    sendListData(id, bForceOpen = false, options = {}) {
        let data = this.applyDynamicValuesToList(this.actionsLists[id]);

        // listData = this.applyDynamicValuesToList(listData);

        if(options.isCopy) {
            if(!data) {
                console.error('Reffering to listId: ', id, this.actionsLists, options);
            }
            data.copyId = data.id;
            data = {...data};
            data.name = data.name + ' (Copy)';
            data.id = undefined;
        }

        data.actions = (data.actions || []).map(a => ({
            ...a,
            isAvailable: gameEntity.isEntityUnlocked(a.id) && !gameEntity.isCapped(a.id)
        }))


        data.potentialEffects = this.getListEffects(id);

        const resourcesEffects = data.potentialEffects.filter(one => one.type === 'resources' && !['capMult','rawCap'].includes(one.scope));
        data.effectEffects = data.potentialEffects.filter(one => (one.type === 'effects') || ['capMult','rawCap'].includes(one.scope));

        const prevEffects = [];
        data.resourcesEffects = this.packEffects(resourcesEffects.map(effect => {
            const prev = resourceCalculators.assertResource(effect.id, false, ['runningActions']);

            if(effect.scope !== 'income' && effect.scope !== 'consumption') return effect;

            const pScope = effect.scope === 'consumption' ? 'income' : effect.scope;

            const nPrv = {
                ...effect,
                scope: pScope,
                value: prev.balance
            };

            if(nPrv.value < 0) {
                nPrv.value = Math.abs(nPrv.value);
                nPrv.scope = 'consumption';
            }

            prevEffects.push(nPrv);

            const newVal = (effect.scope === 'income' ? effect.value : -effect.value) + prev.balance;

            const nScope = newVal > 0 ? 'income' : 'consumption';

            return {
                ...effect,
                value: Math.abs(newVal),
                scope: nScope
            }
        }));

        const proportionsBar = this.getProportionsBar(data)

        data.prevEffects = this.packEffects(prevEffects);

        data.proportionsBar = proportionsBar;

        data.bForceOpen = bForceOpen;

        this.eventHandler.sendData('action-list-data', data);
    }

    getProportionsBar(data) {
        const total = data.actions.reduce((acc, a) => acc += Math.max(0, a.time), 0);
        const actions = data.actions.map(one => ({...one, time: Math.max(0, one.time)}));

        if (total <= SMALL_NUMBER) return [];

        const generateColor = (index, totalActions) => {
            // Use HSL to generate deterministic colors based on the index
            const hue = (index * 360 / totalActions) % 360; // Spread hues evenly
            const saturation = 65; // Fixed saturation for consistency
            const lightness = 70; // Fixed lightness for consistency
            return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        };

        const rawPercentages = actions.map(a => a.time / total);
        const minimumPercentage = 0.001;
        const totalMinimum = minimumPercentage * actions.length;
        const normalizeFactor = (1 - totalMinimum) / rawPercentages.reduce((acc, p) => acc + Math.max(p - minimumPercentage, 0), 0);

        return actions.map((a, index) => {
            const percentage = a.time / total;
            const displayPercentage = percentage < minimumPercentage
                ? minimumPercentage
                : (percentage - minimumPercentage) * normalizeFactor + minimumPercentage;

            return {
                id: a.id,
                name: a.name,
                percentage: percentage,
                displayPercentage: `${displayPercentage*100}%`,
                color: generateColor(index, actions.length)
            };
        });
    }


    getListEffects(id, listData) {
        let list = this.actionsLists[id];
        if(!list) {
            // Use provided runtime listData as source when id is not provided or not found
            if(listData && Array.isArray(listData.actions)) {
                list = listData;
            } else {
                throw new Error(`List with id ${id} not found`);
            }
        }
        const totalTime = list.actions
            .filter(action => gameEntity.isEntityUnlocked(action.id) && !gameEntity.isCapped(action.id))
            .reduce((acc, item) => acc += item.time, 0);

        const totalEffects = [];

        list.actions.forEach(action => {
            let isAvailable = gameEntity.isEntityUnlocked(action.id) && !gameEntity.isCapped(action.id);
            if(!isAvailable) {
                console.warn(`${action.id} is unavailable`);
                return;
            }
            const isEffectChanneling = gameEntity.getAttribute(action.id, 'isEffectChanneling', false);
            const effects = gameEntity.getEffects(action.id, gameEntity.getAttribute(action.id, 'isTraining') ? 1 : 0, gameEntity.getAttribute(action.id, 'isTraining') ? 1 : gameEntity.getLevel(action.id), true, 1, action.time / totalTime);

            let learnRateFactor = gameCore.getModule('actions').getLearningRate(action.id) / gameCore.getModule('actions').getActionXPMax(action.id);

            effects.forEach(effToAdd => {
                const foundId = totalEffects.findIndex(a => a.id === effToAdd.id
                    && (a.scope === effToAdd.scope
                        || (['income', 'consumption'].includes(a.scope) && ['income', 'consumption'].includes(effToAdd.scope))
                    )
                );
                if(effToAdd.scope === 'income' && effToAdd.type === 'resources') {
                    effToAdd.value *= gameResources.getResource(effToAdd.id).multiplier;
                }

                if(effToAdd.scope === 'multiplier' && effToAdd.type === 'effects' && !isEffectChanneling) {
                    // we actually adding multiplier
                    effToAdd.value = 1 + learnRateFactor*(effToAdd.value - 1);
                }

                if(effToAdd.scope === 'income' && effToAdd.type === 'effects' && !isEffectChanneling) {
                    effToAdd.value *= learnRateFactor;
                }

                if((effToAdd.scope === 'rawCap' || effToAdd.scope === 'capMult') && effToAdd.type === 'resources') {
                    console.log('origEff: ', {...effToAdd}, learnRateFactor);
                    if(effToAdd.scope === 'capMult') {
                        effToAdd.value = 1 + learnRateFactor*(effToAdd.value - 1);
                    } else {
                        effToAdd.value *= learnRateFactor;
                    }
                }

                if(foundId < 0) {
                    totalEffects.push(effToAdd);
                } else {
                    if(totalEffects[foundId].scope === 'consumption') {
                        totalEffects[foundId].scope = 'income';
                        totalEffects[foundId].value = -totalEffects[foundId].value;
                    }
                    if(effToAdd.scope === 'consumption') {
                        totalEffects[foundId].value -= effToAdd.value;
                    } else {
                        totalEffects[foundId].value += effToAdd.value;
                    }
                }
            })
        });

        return totalEffects.map(eff => eff.scope === 'income' && eff.value < 0 ? {...eff, scope: 'consumption', value: -eff.value} : eff);
    }
}