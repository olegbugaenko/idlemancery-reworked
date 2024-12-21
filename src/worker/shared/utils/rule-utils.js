import {gameResources, gameCore, gameEntity} from "game-framework";

export const checkMatchingResourceRule = (rule, key) => {
    const resource = gameResources.getResource(rule.resource_id);

    if(!resource) return false;

    let compare = resource[key];

    if(rule.value_type === 'percentage') {
        if(!resource.cap) return false;

        compare = 100 * resource[key] / resource.cap;
    }

    switch (rule.condition) {
        case 'less':
            return compare < rule.value;
        case 'less_or_eq':
            return  compare <= rule.value;
        case 'eq':
            return compare == rule.value;
        case 'grt_or_eq':
            return compare >= rule.value;
        case 'grt':
            return compare > rule.value;
    }

    return false;
}


export const checkMatchingActionRule = (rule) => {
    const actionRunning = gameCore.getModule('actions').isRunningAction(rule.action_id);

    switch (rule.condition) {
        case 'true':
            return !!actionRunning;
        case 'false':
            return !actionRunning;
    }

    return false;
}

export const checkMatchingActionTagRule = (rule) => {
    const actionRunning = gameCore.getModule('actions').isRunningActionWithTag(rule.tag);

    switch (rule.condition) {
        case 'true':
            return !!actionRunning;
        case 'false':
            return !actionRunning;
    }

    return false;
}

export const checkMatchingActionLevelRule = (rule, key) => {
    const action = gameEntity.getEntity(rule.action_id);

    if(!action) return false;

    let compare = action.level;

    switch (rule.condition) {
        case 'less':
            return compare < rule.value;
        case 'less_or_eq':
            return  compare <= rule.value;
        case 'eq':
            return compare == rule.value;
        case 'grt_or_eq':
            return compare >= rule.value;
        case 'grt':
            return compare > rule.value;
    }

    return false;
}


export const checkMatchingRule = (rule) => {
    if(rule.compare_type === 'resource_amount') {
        return checkMatchingResourceRule(rule, 'amount')
    }
    if(rule.compare_type === 'resource_balance') {
        return checkMatchingResourceRule(rule, 'balance')
    }
    if(rule.compare_type === 'running_action') {
        return checkMatchingActionRule(rule);
    }
    if(rule.compare_type === 'running_action_tag') {
        return checkMatchingActionTagRule(rule);
    }
    if(rule.compare_type === 'action_level') {
        return checkMatchingActionLevelRule(rule);
    }
}

export const checkMatchingRules = (rules, conditionStr = null) => {
    const ruleResults = rules.map(rule => checkMatchingRule(rule));

    if (!conditionStr) {
        return ruleResults.every(result => result === true);
    }

    let conditionExpression = conditionStr;

    ruleResults.forEach((result, index) => {
        conditionExpression = conditionExpression.replace(new RegExp(`\\b${index + 1}\\b`, 'g'), result);
    });

    conditionExpression = conditionExpression.replace(/\bAND\b/g, '&&').replace(/\bOR\b/g, '||').replace(/\bNOT\b/g, '!');

    try {
        return eval(conditionExpression);  // Виконуємо вираз
    } catch (error) {
        console.error("Invalid condition string", error);
        return false;
    }
};