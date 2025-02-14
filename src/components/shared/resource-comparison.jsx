import React from "react";
import {mapEffect} from "../../general/utils/resource-utils";
import {RawResource} from "./raw-resource.jsx";

export const ResourceComparison = ({ effects1, effects2 }) => {

    const compareKeysUnique = [...new Set([...Object.keys(effects1),...Object.keys(effects2)])];

    const table = compareKeysUnique.map(key => {
        let prevValue = effects1[key];
        let nextValue = effects2[key];
        if(!prevValue) {
            prevValue = {
                ...nextValue,
                value: (nextValue.scope === 'multiplier' || nextValue.scope === 'capMult') ? 1 : 0
            }
        }
        if(!nextValue) {
            nextValue = {
                ...prevValue,
                value: (prevValue.scope === 'multiplier' || prevValue.scope === 'capMult') ? 1 : 0
            }
        }

        const prevMapped = mapEffect(prevValue);
        const nextMapped = mapEffect(nextValue);

        return {
            key,
            id: prevMapped.id || nextMapped.id,
            type: prevMapped.type || nextMapped.type,
            title: prevMapped.title || nextMapped.title,
            prevValue: prevMapped.value,
            nextValue: nextMapped.value,
            isImprovement: prevMapped.direction*prevValue.value < nextMapped.direction*nextValue.value,
            isWorse: prevMapped.direction*prevValue.value > nextMapped.direction*nextValue.value
        }
    })





    return (<div className={'effects-table comparison'}>
        {table.map(({ id, title, type, prevValue, nextValue, isImprovement, isWorse, key}) => (<div key={key} className={'effect-line'}>
            {type === 'resources' ? (<RawResource className={'title'} id={id} name={title} />) : (<span className={'title'}>{title}</span>)}
            <span className={'prevVal'}>{prevValue}</span>
            <span className={'arrow'}>&rarr;</span>
            <span className={`nextVal${isImprovement ? ' green' : ''}${isWorse ? ' red' : ''}`}>{nextValue}</span>
        </div>))}
    </div>  )

}