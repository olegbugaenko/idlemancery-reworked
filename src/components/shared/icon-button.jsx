import React, {forwardRef} from "react";

export const IconButton = forwardRef(({ icon, className, ...buttonProps}, ref) => {

    return (<button className={`${className} icon-button`} {...buttonProps} ref={ref}>
        <img src={`icons/${icon}.png`} className={'icon-holder'}/>
    </button> )

})