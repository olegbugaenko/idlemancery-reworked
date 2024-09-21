import React from "react";

export const ProgressBar = ({ percentage, className }) => {

    return (<div className={`bar-container ${className}`}>
        <div className={`bar-outer`}>
            <div className={'bar-inner'} style={{width: `${100*percentage}%`}}></div>
        </div>
    </div> )

}