import {formatValue} from "../../general/utils/strings";
import {TippyWrapper} from "../shared/tippy-wrapper.jsx";
import {BreakDown} from "../layout/sidebar.jsx";
import React from "react";

export const Balances = ({ resourceAmount, resourceBalance, breakDown }) => {
    const content = (<div className={'mid small-text'}>
        <p>You own: {formatValue(resourceAmount)} <span className={`balance ${resourceBalance > 1.e-8 ? 'green' : ''} ${resourceBalance < -1.e-8 ? 'yellow' : ''}`}>({formatValue(resourceBalance, 2, true)})</span></p>
    </div>)

    if(!breakDown || !Object.values(breakDown).length) return content;

    if(Math.abs(resourceBalance) < 1.e-8) return content;

    return (<TippyWrapper content={<div className={'hint-popup'}>
        <BreakDown breakDown={breakDown} />
    </div> }>{content}</TippyWrapper>)
}