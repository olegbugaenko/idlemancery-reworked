import {ResourceEffects} from "./resource-effects.jsx";
import React from "react";
import {TippyWrapper} from "./tippy-wrapper.jsx";

export const EffectsSection = ({ effects, maxDisplay = 3 }) => {

    const fullList = Object.values(effects || {});
    let hidden = [];
    if(fullList.length > maxDisplay) {
        hidden = fullList.splice(maxDisplay);
    }

    return (<div className={'effects-section'}>
        {fullList.map(aff => <ResourceEffects key={aff.id ?? aff.name} effect={aff}/>)}
        {hidden.length ? (<TippyWrapper content={<div className={'hint-popup'}>{hidden.map(aff => <ResourceEffects effect={aff}/>)}</div> }><span className={'show-more'}>Show {hidden.length} more effects</span></TippyWrapper>) : null}
    </div>)

}