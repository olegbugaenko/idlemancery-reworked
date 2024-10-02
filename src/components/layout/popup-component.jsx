import React, {useCallback, useEffect} from "react";
import {useAppContext} from "../../context/ui-context";

export const PopupComponent = ({ children, onClose, title }) => {

    const { setActivePopup } = useAppContext();

    const onClosePopup = useCallback(() => {
        if(onClose) {
            onClose();
        }
        setActivePopup(null);
    })

    return (<div className={'popup-wrap'}>
        <div className={'popup'}>
            <div className={'popup-heading'}>
                <h4>{title}</h4>
                <span onClick={onClosePopup} className={'close'}>X</span>
            </div>
            <div className={'popup-content'}>
                {children}
            </div>
        </div>
    </div>)
}