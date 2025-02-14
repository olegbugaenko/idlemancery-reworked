import React from "react";
import {formatValue, secondsToString} from "../../general/utils/strings.js";
import {TippyWrapper} from "./tippy-wrapper.jsx";
import {RawResource} from "./raw-resource.jsx";

export const ResourceCost = ({ affordabilities }) => {

    const content = (<p className={`res-cost ${affordabilities.hardLocked ? 'red' : ''} ${!affordabilities.isAffordable ? 'yellow' : ''}`}>
        <RawResource id={affordabilities.resourceId ?? affordabilities.id} name={affordabilities.name} />
        <span className={'resource-eta'}>{!affordabilities.isAffordable ? secondsToString(affordabilities.eta) : ''}</span>
        <span className={'resource-req'}>{formatValue(affordabilities.actual)} / {formatValue(affordabilities.requirement)}</span>
    </p>)

    if(affordabilities.isAffordable === false) {
        return (<TippyWrapper content={<div className={'hint-popup'}>ETA: {secondsToString(affordabilities.eta)}</div>}>{content}</TippyWrapper>)
    }

    return (content)

}