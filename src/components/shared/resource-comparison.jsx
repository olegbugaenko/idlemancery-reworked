import React from "react";
import {mapEffect} from "../../general/utils/resource-utils";

export const ResourceComparison = ({ effects1, effects2 }) => {

    const compareKeysUnique = [...new Set([...Object.keys(effects1),...Object.keys(effects2)])];

    const table = compareKeysUnique.map(key => {
        let prevValue = effects1[key];
        let nextValue = effects2[key];
        if(!prevValue) {
            prevValue = {
                ...nextValue,
                value: 0
            }
        }
        if(!nextValue) {
            nextValue = {
                ...prevValue,
                value: 0
            }
        }

        const prevMapped = mapEffect(prevValue);
        const nextMapped = mapEffect(nextValue);

        return {
            title: prevMapped.title || nextMapped.title,
            prevValue: prevMapped.value,
            nextValue: nextMapped.value,
            isImprovement: nextMapped.direction*prevValue.value < nextMapped.direction*nextValue.value,
            isWorse: nextMapped.direction*prevValue.value > nextMapped.direction*nextValue.value
        }
    })



    return (<div className={'effects-table'}>
        {table.map(({ title, prevValue, nextValue, isImprovement, isWorse}) => (<div className={'effect-line'}>
            <span className={'title'}>{title}</span>
            <span className={'prevVal'}>{prevValue}</span>
            <span className={`nextVal${isImprovement ? ' green' : ''}${isWorse ? ' red' : ''}`}>{nextValue}</span>
        </div>))}
    </div>  )

}