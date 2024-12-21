import React, {useEffect} from "react";
import { useAppContext } from '../../context/ui-context';
import {PopupComponent} from "./popup-component.jsx";
import {Skills} from "../mage/skills.jsx";
import {UnlocksList} from "../mage/unlocks.jsx";
import {Statistics} from "../mage/statistics.jsx";
import {RandomEventPopup} from "../shared/random-events.jsx";

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

    if(activePopup === 'skills') {
        return (
            <PopupComponent title={'Skills'}>
                <Skills />
            </PopupComponent>
        )
    }

    if(activePopup === 'unlocks') {
        return (
            <PopupComponent title={'Upcoming Unlocks Requirements'}>
                <UnlocksList />
            </PopupComponent>
        )
    }

    if(activePopup === 'statistics') {
        return (
            <PopupComponent title={'Statistics'}>
                <Statistics />
            </PopupComponent>
        )
    }

    if(activePopup === 'event') {
        return (<PopupComponent title={'Event'}>
            <RandomEventPopup />
        </PopupComponent> )
    }

    return null


}