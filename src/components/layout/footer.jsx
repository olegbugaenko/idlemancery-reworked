import React, {useState, useContext, useEffect, useRef} from "react";
import WorkerContext from "../../context/worker-context";
import {useWorkerClient} from "../../general/client";
import { useAppContext } from '../../context/ui-context';
import {formatInt, secondsToString} from "../../general/utils/strings";
import {ProgressBar} from "./progress-bar.jsx";
import {TippyWrapper} from "../shared/tippy-wrapper.jsx";
import {useFlashOnLevelUp} from "../../general/hooks/flash";
import {FlashOverlay} from "./flash-overlay.jsx";
import {NewNotificationWrap} from "./new-notification-wrap.jsx";


export const Footer = () => {

    const worker = useContext(WorkerContext);

    const { onMessage, sendData } = useWorkerClient(worker);

    const { openedTab, setOpenedTab, activePopup, setActivePopup } = useAppContext();

    const [unlocks, setUnlocksData] = useState({});

    const [mageData, setMageData] = useState({});

    const [newUnlocks, setNewUnlocks] = useState({});

    const [hotkeys, setHotkeys] = useState({});

    useEffect(() => {
        const interval = setInterval(() => {
            sendData('query-unlocks', {});
            sendData('query-mage-data', {});
        }, 100);
        const interval2 = setInterval(() => {
            sendData('query-new-unlocks-notifications', { suffix: 'all', depth: 0 })
            sendData('query-all-hotkeys', { suffix: 'all', depth: 0 })
        }, 1000)
        return () => {
            clearInterval(interval);
            clearInterval(interval2);
        }
    }, [])

    useEffect(() => {
        const handleKeyDown = (event) => {
            const keys = [];
            if (event.ctrlKey) keys.push("Ctrl");
            if (event.shiftKey) keys.push("Shift");
            if (event.altKey) keys.push("Alt");
            keys.push(event.key.toUpperCase());
            const combination = keys.join("+");

            triggerHotkey(combination); // Call triggerHotkey when a combination is pressed
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [hotkeys]);

    onMessage('unlocks', (unlocks) => {
        setUnlocksData(unlocks);
    })

    onMessage('mage-data', (mage) => {
        setMageData(mage);
    })

    onMessage('new-unlocks-notifications-all', payload => {
        // console.log('Received unlocks: ', payload);
        setNewUnlocks(payload);
    })

    onMessage('all-hotkeys', payload => {
        // console.log('Received unlocks: ', payload);
        setHotkeys(payload);
    })

    const toggleSpeedUp = () => {
        sendData('toggle-speedup', {});
    }

    const openTab = (id) => {
        setOpenedTab(id);
    }

    const triggerHotkey = (combination) => {
        const hotkey = Object.values(hotkeys || {}).find(h => h.combination === combination);

        if(!hotkey) return;

        if(hotkey.action === 'selectTab') {
            openTab(hotkey.param);
        }
    }

    const elementRef = useRef(null);

    const [overlayPositions, setOverlayPositions] = useState([]);

    const onFlash = (position) => {
        setOverlayPositions((prev) => [...prev, position]);
        setTimeout(() => {
            setOverlayPositions((prev) => prev.filter((p) => p !== position));
        }, 1000);
    };

    useFlashOnLevelUp(mageData.isLeveledUp, onFlash, elementRef);

    return (<div className={'footer'}>

        <div className={'bottom'}>
            <div className={'left-most'}>
                <ul className={'menu'}>
                    {unlocks.actions ? (
                        <li className={openedTab === 'actions' ? 'active' : ''} onClick={() => openTab('actions')}>
                            <NewNotificationWrap isNew={newUnlocks.actions?.hasNew}>
                                <span>Actions</span>
                            </NewNotificationWrap>
                        </li>
                    ) : null}
                    {unlocks.shop ? (<li className={openedTab === 'shop' ? 'active' : ''} onClick={() => openTab('shop')}>
                        <NewNotificationWrap isNew={newUnlocks.shop?.hasNew}>
                            <span>Shop</span>
                        </NewNotificationWrap>
                    </li>) : <li className={'locked'}>
                        <span>Locked (Reach 2 coins)</span>
                    </li>}
                    {unlocks.inventory ? (<li className={openedTab === 'inventory' ? 'active' : ''} onClick={() => openTab('inventory')}>
                        <NewNotificationWrap isNew={newUnlocks.inventory?.hasNew}>
                            <span>Inventory</span>
                        </NewNotificationWrap>
                    </li>) : null}
                    {unlocks.property ? (<li className={openedTab === 'property' ? 'active' : ''} onClick={() => openTab('property')}>
                        <NewNotificationWrap isNew={newUnlocks.property?.hasNew}>
                            <span>Property</span>
                        </NewNotificationWrap>
                    </li>) : null}
                    {unlocks.world ? (<li className={openedTab === 'world' ? 'active' : ''} onClick={() => openTab('world')}>
                        <NewNotificationWrap isNew={newUnlocks.world?.hasNew}>
                            <span>World</span>
                        </NewNotificationWrap>
                    </li>) : null}
                    {unlocks.workshop ? (<li className={openedTab === 'workshop' ? 'active' : ''} onClick={() => openTab('workshop')}>
                        <NewNotificationWrap isNew={newUnlocks.workshop?.hasNew}>
                            <span>Workshop</span>
                        </NewNotificationWrap>
                    </li>) : null}
                    {unlocks.social ? (<li className={openedTab === 'social' ? 'active' : ''} onClick={() => openTab('social')}>
                        <NewNotificationWrap isNew={newUnlocks.social?.hasNew}>
                            <span>Social</span>
                        </NewNotificationWrap>
                    </li>) : null}
                    {unlocks.spellbook ? (<li className={openedTab === 'spellbook' ? 'active' : ''} onClick={() => openTab('spellbook')}>
                        <NewNotificationWrap isNew={newUnlocks.spellbook?.hasNew}>
                            <span>Spellbook</span>
                        </NewNotificationWrap>
                    </li>) : null}
                </ul>
            </div>
            <div className={'right-most'}>
                <ul className={'menu'}>
                    <li className={openedTab === 'settings' ? 'active' : ''} onClick={() => openTab('settings')}>
                        <span>Settings</span>
                    </li>
                    <li className={openedTab === 'about' ? 'active' : ''} onClick={() => openTab('about')}>
                        <span>v0.0.7</span>
                    </li>
                    <li>
                    <span>
                        <a target={'_blank'} href={'https://discord.gg/448M3TNG'}>Join Discord</a>
                    </span>
                    </li>
                    <li>
                    <span>
                        <a target={'_blank'} href={'https://patreon.com/user?u=83421544'}>Support Me</a>
                    </span>
                    </li>
                </ul>
            </div>
        </div>
        {mageData ? (<div className={'mage-wrap flex-container'} ref={elementRef}>
            <div className={'level'}>
                <span className={`skills-button ${mageData.skillPoints > 0 ? 'highlight' : ''}`} onClick={() => setActivePopup('skills')}>
                    <img src={'icons/ui/sp.png'}/>
                    <span>{mageData.skillPoints}</span>
                </span>
            </div>
            <TippyWrapper placement={"top"} content={<div className={'hint-popup'}>
                <p>Level: {formatInt(mageData.mageLevel)}</p>
                <p>XP: {formatInt(mageData.mageXP)} / {formatInt(mageData.mageMaxXP)}</p>
            </div> }>
                <div className={'xp'}>
                    <ProgressBar className={'mage-xp-bar'} percentage={mageData.mageXP / mageData.mageMaxXP} />
                </div>
            </TippyWrapper>
            {/*<div className={'time-spent footer-add-info'}>
                {secondsToString(mageData.timeSpent)}
            </div>*/}
            <TippyWrapper content={<div className={'hint-popup'}>
                <p>You were offline {secondsToString((mageData.bankedTime?.current || 0)/1000)}</p>
                <p>You can use this time to speed up your game by factor of 4</p>
            </div> }>
                <div className={'banked-time footer-add-info'}>
                    <img className={'ui-icon'} src={"icons/interface/time.png"}/>
                    {secondsToString((mageData.bankedTime?.current || 0)/1000)}
                    <span className={`banked-toggle ${mageData.bankedTime?.speedUpFactor > 1 ? 'activated' : ''} ${mageData.bankedTime?.current <= 0 ? 'disabled' : ''}`} onClick={toggleSpeedUp}>
                    X{formatInt(4)}
                </span>
                </div>
            </TippyWrapper>

            <div className={'unlocks'}>
                <TippyWrapper content={<div className={'hint-popup'}>View unlocks</div> }>
                    <div className={'icon-content edit-icon interface-icon'} onClick={() => setActivePopup('unlocks')}>
                        <img src={"icons/interface/icon_unlocks.png"}/>
                    </div>
                </TippyWrapper>
                <TippyWrapper content={<div className={'hint-popup'}>View statistics</div> }>
                    <div className={'icon-content edit-icon interface-icon'} onClick={() => setActivePopup('statistics')}>
                        <img src={"icons/interface/icon_statistics.png"}/>
                    </div>
                </TippyWrapper>

            </div>
        </div>) : null}
        {overlayPositions.map((position, index) => (
            <FlashOverlay key={index} position={position} className={'powerful-splash'}/>
        ))}

    </div>)

}