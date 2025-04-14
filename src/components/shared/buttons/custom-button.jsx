import React from "react";
import {TippyWrapper} from "../tippy-wrapper.jsx";

export const CustomButton = ({ children, iconId, ...props }) => {

    if(!iconId) {
        return (<button
            {...props}
        >{children}</button>)
    }

    const iconProps = {
        ...props,
        className: `icon-content interface-icon ${props.className ?? ''} ${props.disabled ? ' disabled' : ''}`
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