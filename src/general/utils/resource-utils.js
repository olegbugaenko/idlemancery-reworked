import {formatValue} from "./strings";

export const mapEffect = (effect) => {
    let rVal = effect.isPercentage ? (effect.value || 0) * 100 : (effect.value || 0);
    let value = formatValue(rVal, 3);
    if(effect.isPercentage) {
        value += '%';
    }
    let title = effect.name;

    let direction = 1;

    if(effect.scope === 'multiplier' || effect.scope === 'capMult') {
        value = `X${value}`;
    } else if (effect.scope === 'consumption') {
        value = `-${value}`;
        direction = -1;
    } else {
        if(effect.value > 0 && !effect.isPercentage) {
            value = `+${value}`;
        } else {
            value = `${value}`;
        }

    }

    if(effect.scope === 'rawCap' || effect.scope === 'capMult') {
        title = `${title} cap.`
    }

    return {
        title,
        value,
        type: effect.type,
        id: effect.id,
        description: effect.description,
        direction,
        originalValue: effect.value,
        balance: effect.balance
    }
}

/**
 * Checks if breakdown has any meaningful data to display
 * @param {Object} breakdown - The breakdown object
 * @returns {boolean} - True if breakdown has income, consumption, or multipliers
 */
export const isBreakdownHasData = (breakdown) => {
    return isBreakdownHasIncome(breakdown) || 
           isBreakdownHasConsumption(breakdown) || 
           isBreakdownHasMultiplier(breakdown);
};

/**
 * Checks if breakdown has income data
 * @param {Object} breakdown - The breakdown object
 * @returns {boolean} - True if breakdown has income
 */
export const isBreakdownHasIncome = (breakdown) => {
    return breakdown?.income && Object.keys(breakdown.income).length > 0;
};

/**
 * Checks if breakdown has consumption data
 * @param {Object} breakdown - The breakdown object
 * @returns {boolean} - True if breakdown has consumption
 */
export const isBreakdownHasConsumption = (breakdown) => {
    return breakdown?.consumption && Object.keys(breakdown.consumption).length > 0;
};

/**
 * Checks if breakdown has multiplier data
 * @param {Object} breakdown - The breakdown object
 * @returns {boolean} - True if breakdown has multipliers
 */
export const isBreakdownHasMultiplier = (breakdown) => {
    return breakdown?.multiplier && Object.keys(breakdown.multiplier).length > 0;
};