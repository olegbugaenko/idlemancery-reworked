import {ResourceEffects} from "./resource-effects.jsx";
import React from "react";
import {TippyWrapper} from "./tippy-wrapper.jsx";

export const EffectsSection = ({ effects, maxDisplay = 3, isShowBalance = false, useAvailabilityCheck = false, description }) => {

    const fullList = Object.entries(effects || {}).map(([key, value]) => ({ key, ...value }));
    let hidden = [];
    if(fullList.length > maxDisplay) {
        hidden = fullList.splice(maxDisplay);
    }

    const content = (<div className={'effects-section'}>
        {fullList.map(aff => {
            return (<ResourceEffects key={aff.key ?? (aff.id ?? aff.name)} effect={aff} isShowBalance={isShowBalance} isAvailable={aff.isAvailable || !useAvailabilityCheck} />)
        })}
        {hidden.length ? (<TippyWrapper content={<div className={'hint-popup'}>{hidden.map(aff => <ResourceEffects effect={aff} isShowBalance={isShowBalance} isAvailable={aff.isAvailable || !useAvailabilityCheck}/>)}</div> }><span className={'show-more'}>Show {hidden.length} more effects</span></TippyWrapper>) : null}
    </div>);

    return description ? (
        <TippyWrapper content={<div className={'hint-popup'}>{description}</div>}>
            {content}
        </TippyWrapper>
    ) : content;

}