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

            const blockedDynamicActions = this.getBlockedDynamicActions(listData);

            this.eventHandler.sendData('action-list-effects', {
                id: (listData && listData.id) != null ? listData.id : (id != null ? id : null),
                potentialEffects: data,
                resourcesEffects,
                prevEffects: this.packEffects(prevEffects),
                effectEffects: data.filter(one => one.type === 'effects' || ['capMult','rawCap'].includes(one.scope)),
                proportionsBar,
                newTimes: listData.actions,
                blockedDynamicActions,
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
        skipDynamicActions = new Set(),
        initialGuess = {},
        maxIterations = 100,
        learningRate = 0.1,
        tolerance = 1e-4,
    }) {
        const dynamicIds = dynamicActions.map(a => a.id);
        const resourceSet = new Set(Object.keys(initialResourceBalance));

        for (const id of dynamicIds) {
            for (const { id: resId } of actionContributions[id] || []) {
                resourceSet.add(resId);
            }
            for (const { id: resId } of actionConsumptions[id] || []) {
                resourceSet.add(resId);
            }
        }

        const resourceIds = Array.from(resourceSet);
        const dynamicMap = new Map(dynamicActions.map(action => [action.id, action]));

        const T = Object.fromEntries(dynamicIds.map(id => {
            const base = initialGuess[id];
            const fromAction = dynamicMap.get(id)?.time;
            const initial = base != null ? base : (fromAction != null ? fromAction : 0);
            return [id, skipDynamicActions.has(id) ? 0 : Math.max(0, initial)];
        }));

        const evaluateState = (T_values) => {
            const totalDynamic = Object.values(T_values).reduce((a, b) => a + b, 0);
            const totalTime = fixedTotal + totalDynamic;
            const fixedFraction = totalTime > SMALL_NUMBER ? fixedTotal / totalTime : 0;

            const balance = {};
            const totalReqs = {};
            const totalContribs = {};
            const totalConsumes = {};

            for (const resId of resourceIds) {
                const base = initialResourceBalance[resId] || { current: 0, income: 0, consumption: 0, currentConsumption: 0 };
                const fixedIncome = base.income * fixedFraction;
                const fixedConsumption = base.consumption * fixedFraction;
                balance[resId] = base.current + fixedIncome - fixedConsumption;
                totalReqs[resId] = base.currentConsumption + fixedConsumption;
                totalContribs[resId] = fixedIncome;
                totalConsumes[resId] = fixedConsumption;
            }

            if (totalTime > SMALL_NUMBER) {
                for (const id of dynamicIds) {
                    const t = T_values[id] || 0;
                    if (t <= 0) continue;
                    const share = t / totalTime;
                    const contribs = actionContributions[id] || [];
                    const consumes = actionConsumptions[id] || [];

                    for (const { id: resId, value } of contribs) {
                        const amount = value * share;
                        balance[resId] = (balance[resId] || 0) + amount;
                        totalContribs[resId] = (totalContribs[resId] || 0) + amount;
                    }

                    for (const { id: resId, value } of consumes) {
                        const amount = value * share;
                        balance[resId] = (balance[resId] || 0) - amount;
                        totalConsumes[resId] = (totalConsumes[resId] || 0) + amount;
                        totalReqs[resId] = (totalReqs[resId] || 0) + amount;
                    }
                }
            }

            const imbalance = {};
            let totalError = 0;

            for (const resId of resourceIds) {
                const net = balance[resId] || 0;
                const req = totalReqs[resId] || 0;
                const prod = totalContribs[resId] || 0;
                const scale = Math.max(req + prod, Math.abs(net), SMALL_NUMBER);
                const norm = net / scale;
                const weight = net < 0 ? 1.5 : 1;
                imbalance[resId] = norm;
                totalError += (norm * weight) ** 2;
            }

            return { totalError, imbalance, balance, totalTime };
        };

        const computeGradients = (state, error) => {
            const gradients = {};
            const baseError = error;

            for (const id of dynamicIds) {
                if (skipDynamicActions.has(id)) {
                    gradients[id] = 0;
                    continue;
                }

                const current = state[id] || 0;
                const step = Math.max(1e-3, (current || 1) * 0.1);

                const plusState = { ...state, [id]: current + step };
                const { totalError: plusError } = evaluateState(plusState);
                const forward = (plusError - baseError) / step;

                let gradient = forward;

                const downStep = Math.min(step, current);
                if (downStep > 1e-6) {
                    const minusState = { ...state, [id]: current - downStep };
                    const { totalError: minusError } = evaluateState(minusState);
                    const backward = (baseError - minusError) / downStep;
                    gradient = (forward + backward) / 2;
                }

                gradients[id] = gradient;
            }

            return gradients;
        };

        let prevError = Infinity;
        for (let iter = 0; iter < maxIterations; iter++) {
            const { totalError } = evaluateState(T);
            if (Math.abs(prevError - totalError) < tolerance) break;

            const gradients = computeGradients(T, totalError);
            let step = learningRate;
            let improved = false;

            while (step > 1e-5 && !improved) {
                const candidate = { ...T };
                for (const id of dynamicIds) {
                    if (skipDynamicActions.has(id)) continue;
                    const t = candidate[id] || 0;
                    const g = gradients[id] || 0;
                    candidate[id] = Math.max(0, t - step * g);
                }

                const { totalError: candidateError } = evaluateState(candidate);
                if (candidateError + tolerance < totalError) {
                    Object.assign(T, candidate);
                    prevError = totalError;
                    improved = true;
                } else {
                    step /= 2;
                }
            }

            if (!improved) {
                break;
            }
        }

        return T;
    }

    getListDynamicValues(listData) {
        const MAX_ITER = 15;
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

        console.log('eff0', effects0);

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


        const computeActionNetPerFullTime = (action) => {
            const breakdown = this.getActionResourceBreakdown({ ...action, time: 1 }, 1) || { incomes: [], consumptions: [] };
            const net = {};
            breakdown.incomes.forEach(({ id, value }) => {
                if (value > SMALL_NUMBER) {
                    net[id] = (net[id] || 0) + value;
                }
            });
            breakdown.consumptions.forEach(({ id, value }) => {
                if (value > SMALL_NUMBER) {
                    net[id] = (net[id] || 0) - value;
                }
            });
            return net;
        };

        const attemptExactDynamicSolve = () => {
            if (!dynamicActions.length) return {};
            if (dynamicActions.length > 8) return null;

            const dynamicNetEffects = dynamicActions.map(action => computeActionNetPerFullTime(action));
            const fixedNetEffects = fixedActions.map(action => computeActionNetPerFullTime(action));

            
            const fixedEffectsTotals = {};
            fixedActions.forEach((action, idx) => {
                const net = fixedNetEffects[idx];
                const time = action.time || 0;
                for (const resId in net) {
                    fixedEffectsTotals[resId] = (fixedEffectsTotals[resId] || 0) + net[resId] * time;
                }
            });

            const resourceSet = new Set(Object.keys(initialResourceBalance));
            dynamicNetEffects.forEach(net => Object.keys(net).forEach(id => resourceSet.add(id)));
            Object.keys(fixedEffectsTotals).forEach(id => resourceSet.add(id));

            const ensureBalance = (resId) => {
                if (!initialResourceBalance[resId]) {
                    const base = resourceCalculators.assertResource(resId, false, ['runningActions'], {
                        targetEfficiency: 1,
                    }) || {};
                    initialResourceBalance[resId] = {
                        income: 0,
                        consumption: 0,
                        current: base.balance || 0,
                        currentConsumption: base.consumption || 0,
                    };
                }
            };

            const constraints = [];
            const resourcePassive = {};
            let impossible = false;

            resourceSet.forEach(resId => {
                ensureBalance(resId);
                const passive = initialResourceBalance[resId]?.current ?? 0;
                resourcePassive[resId] = passive;
                const coeffs = dynamicActions.map((_, idx) => (dynamicNetEffects[idx][resId] || 0) + passive);
                const rhs = - (passive * fixedTotal + (fixedEffectsTotals[resId] || 0));
                const hasInfluence = coeffs.some(val => Math.abs(val) > SMALL_NUMBER);
                if (!hasInfluence) {
                    if (rhs > SMALL_NUMBER) {
                        console.log('Impossible due to ' + resId);
                        impossible = true;
                    }
                    return;
                }
                constraints.push({ resId, coeffs, rhs });
            });

            if (impossible) return null;

            if (!constraints.length) {
                return {};
            }

            const constraintCount = constraints.length;
            const actionCount = dynamicActions.length;
            const MAX_COMBINATIONS = 50000;

            const generateCombinations = (n, k) => {
                const result = [];
                const combo = [];
                let aborted = false;
                const backtrack = (start, depth) => {
                    if (aborted) return;
                    if (depth === k) {
                        result.push([...combo]);
                        if (result.length > MAX_COMBINATIONS) {
                            aborted = true;
                        }
                        return;
                    }
                    for (let i = start; i < n; i++) {
                        combo.push(i);
                        backtrack(i + 1, depth + 1);
                        combo.pop();
                        if (aborted) return;
                    }
                };
                backtrack(0, 0);
                return aborted ? null : result;
            };

            const solveLinearSystem = (matrix, vector) => {
                const size = matrix.length;
                if (!size) return [];
                const augmented = matrix.map((row, idx) => [...row, vector[idx]]);

                for (let i = 0; i < size; i++) {
                    let pivot = i;
                    for (let r = i + 1; r < size; r++) {
                        if (Math.abs(augmented[r][i]) > Math.abs(augmented[pivot][i])) {
                            pivot = r;
                        }
                    }
                    if (Math.abs(augmented[pivot][i]) < SMALL_NUMBER) {
                        return null;
                    }
                    if (pivot !== i) {
                        [augmented[pivot], augmented[i]] = [augmented[i], augmented[pivot]];
                    }

                    const pivotVal = augmented[i][i];
                    for (let c = i; c <= size; c++) {
                        augmented[i][c] /= pivotVal;
                    }

                    for (let r = 0; r < size; r++) {
                        if (r === i) continue;
                        const factor = augmented[r][i];
                        if (Math.abs(factor) < SMALL_NUMBER) continue;
                        for (let c = i; c <= size; c++) {
                            augmented[r][c] -= factor * augmented[i][c];
                        }
                    }
                }

                return augmented.map(row => row[size]);
            };

            const resourceList = Array.from(resourceSet);
            const fixedEffectByResource = id => fixedEffectsTotals[id] || 0;

            const checkFeasible = (times) => {
                const totalDynamic = times.reduce((acc, val) => acc + val, 0);
                return resourceList.every(resId => {
                    const passive = resourcePassive[resId] || 0;
                    let total = passive * (fixedTotal + totalDynamic) + fixedEffectByResource(resId);
                    for (let i = 0; i < actionCount; i++) {
                        total += (dynamicNetEffects[i][resId] || 0) * times[i];
                    }
                    return total >= -1e-6;
                });
            };

            const combosCache = {};
            const getCombos = (k) => {
                if (!combosCache[k]) {
                    const generated = generateCombinations(constraintCount, k);
                    if (!generated) {
                        combosCache[k] = null;
                    } else {
                        combosCache[k] = generated;
                    }
                }
                return combosCache[k];
            };

            let bestSolution = null;
            let bestSum = Infinity;

            const evaluateTimes = (times) => {
                const sanitized = times.map(val => (val < SMALL_NUMBER ? (val < -SMALL_NUMBER ? val : 0) : val));
                if (sanitized.some(val => val < -SMALL_NUMBER)) return;
                if (!constraints.every(({ coeffs, rhs }) => {
                    const lhs = coeffs.reduce((acc, coeff, idx) => acc + coeff * sanitized[idx], 0);
                    return lhs >= rhs - 1e-6;
                })) return;
                if (!checkFeasible(sanitized)) return;
                const sum = sanitized.reduce((acc, val) => acc + val, 0);
                if (sum < bestSum - 1e-6) {
                    bestSum = sum;
                    bestSolution = sanitized;
                }
            };

            const totalMasks = 1 << actionCount;
            for (let mask = 0; mask < totalMasks; mask++) {
                const activeIndices = [];
                for (let i = 0; i < actionCount; i++) {
                    if ((mask & (1 << i)) === 0) {
                        activeIndices.push(i);
                    }
                }

                const activeCount = activeIndices.length;
                if (!activeCount) {
                    evaluateTimes(Array(actionCount).fill(0));
                    continue;
                }
                if (constraintCount < activeCount) continue;

                const combos = getCombos(activeCount);
                if (!combos) {
                    return null;
                }
                for (const combo of combos) {
                    const matrix = combo.map(index => {
                        const row = constraints[index].coeffs;
                        return activeIndices.map(idx => row[idx]);
                    });
                    const rhs = combo.map(index => constraints[index].rhs);
                    const solution = solveLinearSystem(matrix, rhs);
                    if (!solution) continue;
                    const times = Array(actionCount).fill(0);
                    solution.forEach((val, idx) => {
                        times[activeIndices[idx]] = val;
                    });
                    evaluateTimes(times);
                }
            }

            if (!bestSolution) return null;

            return bestSolution;
        };

        const exactDynamicTimes = attemptExactDynamicSolve();

        console.log('exactDynamicTimes: ', exactDynamicTimes, initialResourceBalance);
        if (exactDynamicTimes !== null) {
            if (!Array.isArray(exactDynamicTimes)) {
                return exactDynamicTimes;
            }
            const dynamicResult = {};
            dynamicActions.forEach((action, idx) => {
                const val = exactDynamicTimes[idx];
                if (val > SMALL_NUMBER) {
                    dynamicResult[action.id] = val;
                } else {
                    dynamicResult[action.id] = 0;
                }
            });
            return dynamicResult;
        }

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


        const st = performance.now();
        const guessedMinimized = this.optimizeDynamicEfforts({
            dynamicActions,
            fixedTotal,
            initialResourceBalance,
            actionContributions,
            actionConsumptions,
            skipDynamicActions,
            initialGuess: fallbackTimes,
            maxIterations: 30,
            learningRate: 0.1,
            tolerance: 0.0001,
        });
        // console.log('guessedMinimized: ', guessedMinimized, performance.now() - st, actionContributions, actionConsumptions);

        return guessedMinimized;
        
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

        console.log('dynFinal: ', dynamic, preparedActions.map(action => {
            const updated = action.isDynamicTime && (dynamic[action.id] || dynamic[action.id] === 0)
                ? { ...action, time: dynamic[action.id] }
                : action;
            return {
                ...updated,
                isAutoTimeEnabled: action.isAutoTimeEnabled // завжди повертати явно
            };
        }))

        return {
            ...listData,
            actions: preparedActions.map(action => {
                const updated = action.isDynamicTime && (dynamic[action.id] || dynamic[action.id] === 0)
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
        console.log('rg: ', listsBeingAutotrigger, listsBeingAutotriggerAvailable.length);
        this.listsAutotrigger = listsBeingAutotriggerAvailable.map(one => ({
            id: one.id,
            priority: one.autotrigger.priority ?? 0,
        })).sort((a, b) => a.priority - b.priority);
    }

    reorderLists(newOrder) {
        // console.log('newOrder reordering: ', newOrder);
        if(Array.isArray(newOrder)) {
            newOrder.forEach(({ id, sort }) => {
            if (this.actionsLists[id]) {
                this.actionsLists[id].sort = sort;
            }
        });
        } else {
            for(const key in newOrder) {
                const { id, sort } = newOrder[key];
                if (this.actionsLists[id]) {
                    this.actionsLists[id].sort = sort;
                }
            }
        }
        
        this.sortLists(); // Re-sort the cached list
    }

    sortLists() {
        this._cachedSortedLists = Object.values(this.actionsLists).sort((a, b) => a.sort - b.sort);
        // console.log('NewOrder sorted: ', this._cachedSortedLists);
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
        if(game.ticksAfterLoad < 2) {
            this.regenerateListsPriorityMap();
        }
        // Here we checking autotrigger
        if(this.automationEnabled && this.listsAutotrigger.length && this.autotriggerCD <= 0) {
            this.autotriggerCD = this.autotriggerIntervalSetting || 10;
            const autotrigger = this.getAutotriggerList();

            // console.log('AT: ', autotrigger);

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
        const resourceAgg = {}; // id -> { grossIncome, grossConsumption }

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
                    // console.log('origEff: ', {...effToAdd}, learnRateFactor);
                    if(effToAdd.scope === 'capMult') {
                        effToAdd.value = 1 + learnRateFactor*(effToAdd.value - 1);
                    } else {
                        effToAdd.value *= learnRateFactor;
                    }
                }

                // Track gross parts WITHOUT changing existing merge logic
                if(effToAdd.type === 'resources') {
                    const id = effToAdd.id;
                    if(!resourceAgg[id]) resourceAgg[id] = { grossIncome: 0, grossConsumption: 0 };
                    if(effToAdd.scope === 'income') {
                        resourceAgg[id].grossIncome += Math.max(0, effToAdd.value);
                    } else if(effToAdd.scope === 'consumption') {
                        resourceAgg[id].grossConsumption += Math.max(0, effToAdd.value);
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
        // Keep original output, but annotate resource entries with gross parts
        return totalEffects.map(eff => {
            const normalized = (eff.scope === 'income' && eff.value < 0) ? { ...eff, scope: 'consumption', value: -eff.value } : eff;
            if(normalized.type === 'resources') {
                const agg = resourceAgg[normalized.id] || { grossIncome: 0, grossConsumption: 0 };
                normalized.grossIncome = agg.grossIncome;
                normalized.grossConsumption = agg.grossConsumption;
            }
            return normalized;
        });
    }

    getActionResourceBreakdown(action, totalTime) {
        const result = { incomes: [], consumptions: [] };

        const isAvailable = gameEntity.isEntityUnlocked(action.id) && !gameEntity.isCapped(action.id);
        if(!isAvailable) {
            return result;
        }

        const isEffectChanneling = gameEntity.getAttribute(action.id, 'isEffectChanneling', false);
        const isTraining = gameEntity.getAttribute(action.id, 'isTraining');
        const level = isTraining ? 1 : gameEntity.getLevel(action.id);
        const trainingStage = isTraining ? 1 : 0;
        const timeFraction = totalTime > 0 ? (action.time || 0) / totalTime : 0;

        const effects = gameEntity.getEffects(action.id, trainingStage, level, true, 1, timeFraction);

        const learnRateFactor = gameCore.getModule('actions').getLearningRate(action.id) / gameCore.getModule('actions').getActionXPMax(action.id);
        // console.log(`Effects for ${action.id}[${level}] (${action.time}/${totalTime}): `, JSON.parse(JSON.stringify(effects)));
        effects.forEach(effect => {
            const effToAdd = { ...effect };

            if(effToAdd.scope === 'income' && effToAdd.type === 'resources') {
                effToAdd.value *= gameResources.getResource(effToAdd.id).multiplier;
            }

            if(effToAdd.scope === 'multiplier' && effToAdd.type === 'effects' && !isEffectChanneling) {
                effToAdd.value = 1 + learnRateFactor*(effToAdd.value - 1);
            }

            if(effToAdd.scope === 'income' && effToAdd.type === 'effects' && !isEffectChanneling) {
                effToAdd.value *= learnRateFactor;
            }

            if((effToAdd.scope === 'rawCap' || effToAdd.scope === 'capMult') && effToAdd.type === 'resources') {
                if(effToAdd.scope === 'capMult') {
                    effToAdd.value = 1 + learnRateFactor*(effToAdd.value - 1);
                } else {
                    effToAdd.value *= learnRateFactor;
                }
            }

            const normalized = { ...effToAdd };
            if(normalized.scope === 'income' && normalized.value < 0) {
                normalized.scope = 'consumption';
                normalized.value = -normalized.value;
            }
            if(normalized.scope === 'consumption' && normalized.value < 0) {
                normalized.value = Math.abs(normalized.value);
            }
            

            if(normalized.type === 'resources') {
                if(normalized.scope === 'income' && normalized.value > SMALL_NUMBER) {
                    result.incomes.push({ id: normalized.id, value: normalized.value });
                } else if(normalized.scope === 'consumption' && normalized.value > SMALL_NUMBER) {
                    result.consumptions.push({ id: normalized.id, value: normalized.value });
                }
            }
        });

        return result;
    }

    getBlockedDynamicActions(listData) {
        const blocked = {};

        if(!listData?.actions?.length) return blocked;

        const availableActions = listData.actions.filter(action => gameEntity.isEntityUnlocked(action.id) && !gameEntity.isCapped(action.id));
        const totalTime = availableActions.reduce((acc, item) => acc + (item.time || 0), 0) || 1;

        const resourceIncomeTotals = {};
        const actionIncomeMap = {};
        const actionConsumptionMap = {};

        listData.actions.forEach(action => {
            const breakdown = this.getActionResourceBreakdown(action, totalTime);
            actionIncomeMap[action.id] = breakdown.incomes;
            actionConsumptionMap[action.id] = breakdown.consumptions;

            breakdown.incomes.forEach(({ id, value }) => {
                resourceIncomeTotals[id] = (resourceIncomeTotals[id] || 0) + value;
            });
        });

        listData.actions.forEach(action => {
            if(!action.isDynamicTime) return;
            const consumptions = actionConsumptionMap[action.id] || [];

            consumptions.forEach(({ id: resourceId }) => {
                const baseState = resourceCalculators.assertResource(resourceId, false, ['runningActions'], {
                    targetEfficiency: 1,
                }) || {};

                const passiveBalance = baseState.balance || ((baseState.income || 0) * (baseState.multiplier || 1) - (baseState.consumption || 0));

                const incomeFromList = (resourceIncomeTotals[resourceId] || 0) - ((actionIncomeMap[action.id] || []).find(entry => entry.id === resourceId)?.value || 0);

                if(passiveBalance <= SMALL_NUMBER && incomeFromList <= SMALL_NUMBER) {
                    const resource = gameResources.getResource(resourceId);
                    blocked[action.id] = {
                        reason: 'resource',
                        id: resourceId,
                        name: resource?.name || resourceId,
                    };
                }
            });
        });

        return blocked;
    }
}