import {gameResources} from "game-framework";

export const checkMatchingRule = (rule) => {
    const resource = gameResources.getResource(rule.resource_id);

    if(!resource) return false;

    let compare = resource.amount;

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