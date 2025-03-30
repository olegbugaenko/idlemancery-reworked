import React from "react";
import {formatValue} from "../../general/utils/strings";
import {mapEffect} from "../../general/utils/resource-utils";
import {RawResource} from "./raw-resource.jsx";

export const ResourceEffects = ({ effect, isShowBalance }) => {

    const { title, value, id, type, balance } = mapEffect(effect);

    return (<div className={'effect-line'}>
        {type === 'resources' ? (<RawResource name={title} id={id} className={'fixed-width-sidebar'} />) : (<span className={'title'}>{title}</span>)}
        <span className={'value'}>{value}</span>
        {isShowBalance ? (<span className={'secondary-value'}>({formatValue(balance)})</span> ) : null}
    </div> )

}