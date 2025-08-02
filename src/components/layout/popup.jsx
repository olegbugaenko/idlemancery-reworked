import React, {useEffect, useRef} from "react";
import { useAppContext } from '../../context/ui-context';
import {PopupComponent} from "./popup-component.jsx";
import {Skills} from "../mage/skills.jsx";
import {UnlocksList} from "../mage/unlocks.jsx";
import {Statistics} from "../mage/statistics.jsx";
import {RandomEventPopup} from "../shared/random-events.jsx";
import {HowTo} from "../how-to/index.jsx";
import SkillTree from "../mage/skill-tree.jsx";
import {AchievementsCompleted, CurrentAchievement} from "../shared/achievements.jsx";
import {QuickAccessPanel} from "../shared/quick-access-panel.jsx";

export const Popup = () => {

    const { activePopup, togglePopup, popupMeta, onClosePopupCb } = useAppContext();

    const onClosePopupRef = useRef(onClosePopupCb);

    useEffect(() => {
        onClosePopupRef.current = onClosePopupCb;
    }, [onClosePopupCb]);

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
                onClosePopupRef.current?.(true);
                togglePopup(null);
            }
        }
        window.addEventListener('keydown', listener)

        return () => {
            window.removeEventListener('keydown', listener);
        }
    }, [])

    if(activePopup === 'skills') {
        return (
            <PopupComponent title={'Skills'} onClose={onClosePopupCb}>
                {/*<Skills />*/}
                <SkillTree />
            </PopupComponent>
        )
    }

    if(activePopup === 'unlocks') {
        return (
            <PopupComponent title={'Upcoming Unlocks Requirements'} onClose={onClosePopupCb}>
                <UnlocksList />
            </PopupComponent>
        )
    }

    if(activePopup === 'statistics') {
        return (
            <PopupComponent title={'Statistics'} onClose={onClosePopupCb}>
                <Statistics />
            </PopupComponent>
        )
    }

    if(activePopup === 'event') {
        return (<PopupComponent title={'Event'} onClose={onClosePopupCb}>
            <RandomEventPopup />
        </PopupComponent> )
    }

    if(activePopup === 'howto') {

        const title = HOWTO_TITLES[popupMeta.howToScope].title;

        return (<PopupComponent title={title} onClose={onClosePopupCb}>
            <HowTo scope={popupMeta.howToScope} />
        </PopupComponent> )
    }

    if(activePopup === 'achievement') {

        return (<PopupComponent title={popupMeta?.customTitle} onClose={onClosePopupCb}>
            <CurrentAchievement onClose={onClosePopupCb}>
                {popupMeta?.customContent}
            </CurrentAchievement>
        </PopupComponent> )
    }

    if(activePopup === 'achievements') {
        return (<PopupComponent title={'Story'} onClose={onClosePopupRef.current}>
            <AchievementsCompleted />
        </PopupComponent> )
    }

    if(activePopup === 'quick-access') {
        return (<PopupComponent title={'Quick Access Panel'} onClose={onClosePopupRef.current}>
            <QuickAccessPanel />
        </PopupComponent> )
    }

    return null


}