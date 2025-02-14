import React from "react";

export const RawResource = ({ id, name, className }) => {

    return (<div className={`resource-wrap ${className}`}>
        {id ? (<div className={'icon-wrap'}>
            <img src={`icons/resources/${id}.png`}/>
        </div> ) : null}
        {name ? (<div className={'name-wrap'}>
            {name}
        </div> ) : null}
    </div> )
}