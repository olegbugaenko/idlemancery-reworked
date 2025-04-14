import React from "react";
import {TippyWrapper} from "../tippy-wrapper.jsx";

export const AutomationIcon = ({ children, value, ...props }) => {
    const iconId = value ? 'automation_on_v2' : 'automation_v2';

    const iconProps = {
        ...props,
        className: `icon-content interface-icon ${props.className ?? ''} ${props.disabled ? ' disabled' : ''} ${value ? 'highlighted' : ''}`
    }

    const btnIcon = (<div
        {...iconProps}
    >
        <img src={`icons/interface/${iconId}.png`}/>
    </div> );

    if(!children) return btnIcon;



    return (<TippyWrapper content={<div className={'hint-popup'}>{children}</div>}>
        {btnIcon}
    </TippyWrapper> )
}