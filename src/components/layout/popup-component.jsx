import React, {useCallback, useEffect, useRef} from "react";
import {useAppContext} from "../../context/ui-context";

export const PopupComponent = ({ children, onClose, title }) => {

    const { setActivePopup } = useAppContext();

    const popupRef = useRef(null);

    const onClosePopup = useCallback(() => {
        if (onClose) {
            onClose();
        }
        setActivePopup(null);
    }, [onClose, setActivePopup]);

    const handleClickOutside = useCallback((event) => {
        if (popupRef.current && !popupRef.current.contains(event.target)) {
            onClosePopup();
        }
    }, [onClosePopup]);

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        // Або використайте 'click' замість 'mousedown' за потреби

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [handleClickOutside]);

    return (<div className={'popup-wrap'}>
        <div className={'popup'} ref={popupRef}>
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