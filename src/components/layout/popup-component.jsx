import React, {useEffect} from "react";

export const PopupComponent = ({ children }) => {
    return (<div className={'popup-wrap'}>
        <div className={'popup'}>
            {children}
        </div>
    </div>)
}