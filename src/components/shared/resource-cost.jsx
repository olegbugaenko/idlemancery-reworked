import React from "react";
import {formatValue, secondsToString} from "../../general/utils/strings.js";
import {TippyWrapper} from "./tippy-wrapper.jsx";

export const ResourceCost = ({ affordabilities }) => {

    const content = (<p className={`res-cost ${affordabilities.hardLocked ? 'red' : ''} ${!affordabilities.isAffordable ? 'yellow' : ''}`}>
        <span className={'resource-name'}>{affordabilities.name || affordabilities.id}</span>
        <span className={'resource-req'}>{formatValue(affordabilities.actual)} / {formatValue(affordabilities.requirement)}</span>
    </p>)

    if(affordabilities.isAffordable === false) {
        return (<TippyWrapper content={<div className={'hint-popup'}>ETA: {secondsToString(affordabilities.eta)}</div>}>{content}</TippyWrapper>)
    }

    return (content)

}