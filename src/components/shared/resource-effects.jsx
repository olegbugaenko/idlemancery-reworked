import React from "react";
import {formatValue} from "../../general/utils/strings";
import {mapEffect} from "../../general/utils/resource-utils";

export const ResourceEffects = ({ effect }) => {

    const { title, value } = mapEffect(effect);

    return (<div className={'effect-line'}>
        <span className={'title'}>{title}</span>
        <span className={'value'}>{value}</span>
    </div> )

}