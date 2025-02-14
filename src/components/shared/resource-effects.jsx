import React from "react";
import {formatValue} from "../../general/utils/strings";
import {mapEffect} from "../../general/utils/resource-utils";
import {RawResource} from "./raw-resource.jsx";

export const ResourceEffects = ({ effect }) => {

    const { title, value, id, type } = mapEffect(effect);

    return (<div className={'effect-line'}>
        {type === 'resources' ? (<RawResource name={title} id={id} />) : (<span className={'title'}>{title}</span>)}
        <span className={'value'}>{value}</span>
    </div> )

}