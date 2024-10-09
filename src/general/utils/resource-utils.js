import {formatValue} from "./strings";

export const mapEffect = (effect) => {
    let value = formatValue(effect.value || 0, 3);
    let title = effect.name;

    let direction = 1;

    if(effect.scope === 'multiplier' || effect.scope === 'capMult') {
        value = `X${value}`;
    } else if (effect.scope === 'consumption') {
        value = `-${value}`;
        direction = -1;
    } else {
        if(effect.value > 0) {
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
        direction,
        originalValue: effect.value,
    }
}