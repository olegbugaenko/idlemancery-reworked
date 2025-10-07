import {ResourceEffects} from "./resource-effects.jsx";
import React from "react";
import {TippyWrapper} from "./tippy-wrapper.jsx";

export const EffectsSection = ({ effects, maxDisplay = 3, isShowBalance = false, useAvailabilityCheck = false }) => {

    const fullList = Object.entries(effects || {}).map(([key, value]) => ({ key, ...value }));
    let hidden = [];
    if(fullList.length > maxDisplay) {
        hidden = fullList.splice(maxDisplay);
    }

    return (<div className={'effects-section'}>
        {fullList.map(aff => {
            const titleElement = (<ResourceEffects key={aff.key ?? (aff.id ?? aff.name)} effect={aff} isShowBalance={isShowBalance} isAvailable={aff.isAvailable || !useAvailabilityCheck} />);
            return aff.description ? (
                <TippyWrapper key={aff.key ?? (aff.id ?? aff.name)} content={<div className={'hint-popup'}>{aff.description}</div>}>
                    <div>
                        {titleElement}
                    </div>
                </TippyWrapper>
            ) : titleElement;
        })}
        {hidden.length ? (<TippyWrapper content={<div className={'hint-popup'}>{hidden.map(aff => <ResourceEffects effect={aff} isShowBalance={isShowBalance} isAvailable={aff.isAvailable || !useAvailabilityCheck}/>)}</div> }><span className={'show-more'}>Show {hidden.length} more effects</span></TippyWrapper>) : null}
    </div>)

}