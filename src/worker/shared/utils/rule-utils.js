import {gameResources, gameCore, gameEntity, gameEffects} from "game-framework";

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
            return compare < +rule.value;
        case 'less_or_eq':
            return  compare <= +rule.value;
        case 'eq':
            return compare == +rule.value;
        case 'grt_or_eq':
            return compare >= +rule.value;
        case 'grt':
            return compare > +rule.value;
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

export const checkMatchingActionListRule = (rule) => {
    const actionListRunning = gameCore.getModule('actions').lists.runningList?.id === rule.action_list_id;

    switch (rule.condition) {
        case 'true':
            return !!actionListRunning;
        case 'false':
            return !actionListRunning;
    }

    return false;
}

export const checkMatchingSpellRunningRule = (rule) => {
    const spellIsRunning = gameCore.getModule('magic').spells[rule.spell_id]?.isRunning;

    switch (rule.condition) {
        case 'true':
            return !!spellIsRunning;
        case 'false':
            return !spellIsRunning;
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

export const checkMatchingCraftingListRule = (rule) => {
    const listRunning = gameCore.getModule('crafting').lists.runningList?.crafting?.id == rule.crafting_list_id;

    // console.log('CraftingList: ', gameCore.getModule('crafting').lists.runningList?.crafting, rule);

    switch (rule.condition) {
        case 'true':
            return !!listRunning;
        case 'false':
            return !listRunning;
    }

    return false;
}

export const checkMatchingActionLevelRule = (rule, key) => {
    const action = gameEntity.getEntity(rule.action_id);

    if(!action) return false;

    let compare = action.level;

    switch (rule.condition) {
        case 'less':
            return compare < +rule.value;
        case 'less_or_eq':
            return  compare <= +rule.value;
        case 'eq':
            return compare == +rule.value;
        case 'grt_or_eq':
            return compare >= +rule.value;
        case 'grt':
            return compare > +rule.value;
    }

    return false;
}

export const checkMatchingAttributeValueRule = (rule) => {
    const attr = gameEffects.getEffect(rule.attribute_id);

    if(!attr) return false;

    let compare = attr.value;

    switch (rule.condition) {
        case 'less':
            return compare < +rule.value;
        case 'less_or_eq':
            return  compare <= +rule.value;
        case 'eq':
            return compare == +rule.value;
        case 'grt_or_eq':
            return compare >= +rule.value;
        case 'grt':
            return compare > +rule.value;
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
    if(rule.compare_type === 'running_action_list') {
        return checkMatchingActionListRule(rule);
    }
    if(rule.compare_type === 'spell_running') {
        return checkMatchingSpellRunningRule(rule);
    }
    if(rule.compare_type === 'crafting_list_running') {
        return checkMatchingCraftingListRule(rule);
    }
    if(rule.compare_type === 'attribute_value') {
        return checkMatchingAttributeValueRule(rule);
    }
}

export const checkMatchingRules = (rules, conditionStr = null, bExplain = false) => {
    if(!rules.length) {
        if(!bExplain) return true;
        return {
            ruleResults: [],
            result: true,
        }
    }

    const ruleResults = rules.map(rule => checkMatchingRule(rule));

    if (!conditionStr) {
        if(!bExplain) {
            return ruleResults.every(result => result === true);
        }
        return {
            ruleResults,
            result: ruleResults.length && ruleResults.every(result => result === true)
        }
    }

    let conditionExpression = conditionStr;

    ruleResults.forEach((result, index) => {
        conditionExpression = conditionExpression.replace(new RegExp(`\\b${index + 1}\\b`, 'g'), result);
    });

    conditionExpression = conditionExpression.replace(/\bAND\b/g, '&&').replace(/\bOR\b/g, '||').replace(/\bNOT\b/g, '!');

    try {
        if(!bExplain)
            return eval(conditionExpression);  // Виконуємо вираз

        return {
            ruleResults,
            result: eval(conditionExpression)
        }
    } catch (error) {
        console.error("Invalid condition string", error);
        return false;
    }
};