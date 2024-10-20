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
                {unlocks.spellbook ? (<li className={openedTab === 'spellbook' ? 'active' : ''} onClick={() => openTab('spellbook')}>
                    <span>Spellbook</span>
                </li>) : null}
                <li className={openedTab === 'settings' ? 'active' : ''} onClick={() => openTab('settings')}>
                    <span>Settings</span>
                </li>
                <li className={openedTab === 'about' ? 'active' : ''} onClick={() => openTab('about')}>
                    <span>v0.0.2a</span>
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
            <div className={'time-spent'}>
                {secondsToString(mageData.timeSpent)}
            </div>
            <div className={'unlocks'}>
                <span className={'unlock'} onClick={() => setActivePopup('unlocks')}>View Unlocks</span>
            </div>
        </div>) : null}
        {overlayPositions.map((position, index) => (
            <FlashOverlay key={index} position={position} className={'powerful-splash'}/>
        ))}

    </div>)

}