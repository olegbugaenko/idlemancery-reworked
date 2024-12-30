import React, {useEffect} from "react";
import { useAppContext } from '../../context/ui-context';
import {PopupComponent} from "./popup-component.jsx";
import {Skills} from "../mage/skills.jsx";
import {UnlocksList} from "../mage/unlocks.jsx";
import {Statistics} from "../mage/statistics.jsx";
import {RandomEventPopup} from "../shared/random-events.jsx";
import {HowTo} from "../how-to/index.jsx";

export const Popup = () => {

    const { activePopup, setActivePopup, popupMeta } = useAppContext();

    const HOWTO_TITLES = {
        actions: {
            title: 'How actions works?'
        },
        'action-lists': {
            title: 'How action list works?'
        },
        'lists-automation': {
            title: 'Lists automation'
        },
        'map': {
            title: 'Map Exploration'
        }
    }

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

    if(activePopup === 'howto') {

        const title = HOWTO_TITLES[popupMeta.howToScope].title;

        return (<PopupComponent title={title}>
            <HowTo scope={popupMeta.howToScope} />
        </PopupComponent> )
    }

    return null


}