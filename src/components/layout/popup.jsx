import React, {useEffect} from "react";
import { useAppContext } from '../../context/ui-context';
import {PopupComponent} from "./popup-component.jsx";

export const Popup = () => {

    const { activePopup, setActivePopup } = useAppContext();

    useEffect(() => {

        const listener = (e) => {
            if(e.key === "Escape") {
                setActivePopup(null);
            }
        }
        window.addEventListener('keydown', listener)

        return () => {
            window.removeEventListener('keydown', listener);
        }
    }, [])

    if(activePopup === 'perks') {
        return (
            <PopupComponent>
                Test
            </PopupComponent>
        )
    }

    return null


}