import {gameResources, gameCore} from "game-framework";

export const checkMatchingResourceRule = (rule, key) => {
    const resource = gameResources.getResource(rule.resource_id);

    if(!resource) return false;

    let compare = resource[key];

    if(rule.value_type === 'percentage') {
        if(!resource.cap) return false;

        compare = 100 * resource.amount / resource.cap;
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
            return actionRunning;
        case 'false':
            return !actionRunning;
    }

    return false;
}

export const checkMatchingActionTagRule = (rule) => {
    const actionRunning = gameCore.getModule('actions').isRunningActionWithTag(rule.tag);

    switch (rule.condition) {
        case 'true':
            return actionRunning;
        case 'false':
            return !actionRunning;
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
}

export const checkMatchingRules = (rules) => {
    for(const rule of rules) {
        // console.log('RULE_CHECK: ', rule)
        if(!checkMatchingRule(rule)) {
            return false;
        }
        // console.log('RULE Matched!');
    }
    return true;
}