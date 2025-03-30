import {ResourceEffects} from "./resource-effects.jsx";
import React from "react";
import {TippyWrapper} from "./tippy-wrapper.jsx";

export const EffectsSection = ({ effects, maxDisplay = 3, isShowBalance = false }) => {

    const fullList = Object.entries(effects || {}).map(([key, value]) => ({ key, ...value }));
    let hidden = [];
    if(fullList.length > maxDisplay) {
        hidden = fullList.splice(maxDisplay);
    }

    return (<div className={'effects-section'}>
        {fullList.map(aff => {
            return (<ResourceEffects key={aff.key ?? (aff.id ?? aff.name)} effect={aff} isShowBalance={isShowBalance}/>)
        })}
        {hidden.length ? (<TippyWrapper content={<div className={'hint-popup'}>{hidden.map(aff => <ResourceEffects effect={aff} isShowBalance={isShowBalance}/>)}</div> }><span className={'show-more'}>Show {hidden.length} more effects</span></TippyWrapper>) : null}
    </div>)

}