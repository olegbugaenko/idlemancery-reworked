import React, {useState, useContext, useEffect, useRef} from "react";
import WorkerContext from "../../context/worker-context";
import {useWorkerClient} from "../../general/client";
import { useAppContext } from '../../context/ui-context';
import {formatInt, secondsToString} from "../../general/utils/strings";
import {ProgressBar} from "./progress-bar.jsx";
import {TippyWrapper} from "../shared/tippy-wrapper.jsx";
import {useFlashOnLevelUp} from "../../general/hooks/flash";
import {FlashOverlay} from "./flash-overlay.jsx";


export const Footer = () => {

    const worker = useContext(WorkerContext);

    const { onMessage, sendData } = useWorkerClient(worker);

    const { openedTab, setOpenedTab, activePopup, setActivePopup } = useAppContext();

    const [unlocks, setUnlocksData] = useState({});

    const [mageData, setMageData] = useState({});

    useEffect(() => {
        const interval = setInterval(() => {
            sendData('query-unlocks', {});
            sendData('query-mage-data', {});
        }, 100);
        return () => {
            clearInterval(interval);
        }
    }, [])

    onMessage('unlocks', (unlocks) => {
        setUnlocksData(unlocks);
    })

    onMessage('mage-data', (mage) => {
        setMageData(mage);
    })

    const toggleSpeedUp = () => {
        sendData('toggle-speedup', {});
    }

    const openTab = (id) => {
        setOpenedTab(id);
    }

    const elementRef = useRef(null);

    const [overlayPositions, setOverlayPositions] = useState([]);

    const onFlash = (position) => {
        console.log('Adding flash: ', position);
        setOverlayPositions((prev) => [...prev, position]);
        setTimeout(() => {
            setOverlayPositions((prev) => prev.filter((p) => p !== position));
        }, 1000);
    };

    useFlashOnLevelUp(mageData.isLeveledUp, onFlash, elementRef);

    return (<div className={'footer'}>

        <div className={'bottom'}>
            <ul className={'menu'}>
                {unlocks.actions ? (<li className={openedTab === 'actions' ? 'active' : ''} onClick={() => openTab('actions')}>
                    <span>Actions</span>
                </li>) : null}
                {unlocks.shop ? (<li className={openedTab === 'shop' ? 'active' : ''} onClick={() => openTab('shop')}>
                    <span>Shop</span>
                </li>) : <li className={'locked'}>
                    <span>Locked (Reach 2 coins)</span>
                </li>}
                {unlocks.inventory ? (<li className={openedTab === 'inventory' ? 'active' : ''} onClick={() => openTab('inventory')}>
                    <span>Inventory</span>
                </li>) : null}
                {unlocks.property ? (<li className={openedTab === 'property' ? 'active' : ''} onClick={() => openTab('property')}>
                    <span>Property</span>
                </li>) : null}
                {unlocks.workshop ? (<li className={openedTab === 'workshop' ? 'active' : ''} onClick={() => openTab('workshop')}>
                    <span>Workshop</span>
                </li>) : null}
                {unlocks.social ? (<li className={openedTab === 'social' ? 'active' : ''} onClick={() => openTab('social')}>
                    <span>Social</span>
                </li>) : null}
                {unlocks.spellbook ? (<li className={openedTab === 'spellbook' ? 'active' : ''} onClick={() => openTab('spellbook')}>
                    <span>Spellbook</span>
                </li>) : null}
                <li className={openedTab === 'settings' ? 'active' : ''} onClick={() => openTab('settings')}>
                    <span>Settings</span>
                </li>
                <li className={openedTab === 'about' ? 'active' : ''} onClick={() => openTab('about')}>
                    <span>v0.0.3a</span>
                </li>
            </ul>
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
                <p>You was offline {secondsToString((mageData.bankedTime?.current || 0)/1000)}</p>
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