import React, {useCallback, useContext, useEffect, useRef, useState} from "react";
import WorkerContext from "../../context/worker-context";
import {useWorkerClient} from "../../general/client";
import PerfectScrollbar from "react-perfect-scrollbar";
import {formatInt} from "../../general/utils/strings";
import {FlashOverlay} from "../layout/flash-overlay.jsx";
import {useFlashOnLevelUp} from "../../general/hooks/flash";
import {NewNotificationWrap} from "../shared/new-notification-wrap.jsx";
import {SearchField} from "../shared/search-field.jsx";
import {TippyWrapper} from "../shared/tippy-wrapper.jsx";
import {BreakDown} from "../layout/sidebar.jsx";
import {CustomButton} from "../shared/buttons/custom-button.jsx";
import {AutomationIcon} from "../shared/buttons/automation-checkbox.jsx";

const SEARCH_SCOPES = [
    { id: 'name', label: 'Name' },
    { id: 'tags', label: 'Tags' },
    { id: 'description', label: 'description' },
    { id: 'resources', label: 'resources' },
    { id: 'effects', label: 'effects' },
];

export const MachineryUpgrades = ({ setItemDetails, purchaseItem, deleteItem, newUnlocks, isMobile }) => {
    const worker = useContext(WorkerContext);
    const { onMessage, sendData, removeMessage } = useWorkerClient(worker);

    const [data, setData] = useState({
        available: [],
        space: { total: 0, max: 0 },
        searchData: { search: '' },
        hideMaxed: false,
        propertyCategories: [],
        customFilters: {},
        customFiltersOrder: [],
        selectedCategory: 'all'
    });

    useEffect(() => {
        const interval = setInterval(() => {
            sendData('query-furnitures-data', { filterId: 'machinery' });
        }, 100);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        onMessage('furnitures-data', (payload) => {
            setData(payload);
        });
        return () => removeMessage('furnitures-data');
    }, []);

    const setSearch = (searchData) => {
        sendData('set-furniture-search-text', { filterId: 'machinery', searchData });
    }

    const setHideMaxed = (hideMaxed) => {
        sendData('set-furniture-hide-maxed', { filterId: 'machinery', hideMaxed });
    }

    const setShowHidden = (showHidden) => {
        sendData('set-furniture-show-hidden', { filterId: 'machinery', showHidden });
    }

    const [overlayPositions, setOverlayPositions] = useState([]);
    const handleFlash = (position) => {
        setOverlayPositions((prev) => [...prev, position]);
        setTimeout(() => setOverlayPositions((prev) => prev.filter((p) => p !== position)), 1000);
    };

    const toggleHiddenItem = useCallback((id, flag) => {
        sendData('toggle-furniture-hidden', { filterId: 'machinery', id, flag });
    })

    const toggleAutopurchase = useCallback((id, flag) => {
        sendData('set-furniture-autopurchase', { id, flag, filterId: 'machinery' })
    })

    const setMachineLoad = (id, value) => {
        sendData('set-machine-load', { id, value });
    }

    return (
        <div className={'furniture-wrap'}>
            <div className={'head'}>
                <TippyWrapper content={<div className={'hint-popup'}><BreakDown breakDown={data.space.breakDown} /></div>}>
                    <div className={'space-item'}>
                        <span className={'label'}>Living Space</span>
                        <span className={`slots-amount ${data.space.total > 0 ? 'slots-available' : 'slots-unavailable'}`}>{formatInt(Math.floor(data.space.total))}/{formatInt(data.space.max)}</span>
                    </div>
                </TippyWrapper>
                <div className={'filters'}>
                    <label>
                        <SearchField
                            placeholder={'Search'}
                            value={data.searchData}
                            onSetValue={val => setSearch(val)}
                            scopes={SEARCH_SCOPES}
                        />
                    </label>
                    <label>
                        Hide maxed
                        <input type={'checkbox'} checked={data.hideMaxed} onChange={e => setHideMaxed(!data.hideMaxed)}/>
                    </label>
                    <label>
                        Show Hidden
                        <input type={'checkbox'} checked={data.showHidden} onChange={e => setShowHidden(!data.showHidden)}/>
                    </label>
                </div>
            </div>
            <div className={'furnitures-cat'}>
                <PerfectScrollbar>
                    <div className={'flex-container'}>
                        {data.available.map(machine => (
                            <NewNotificationWrap key={machine.id} id={machine.id} className={`narrow-wrapper ${newUnlocks?.items?.[machine.id]?.hasNew ? 'has-new' : 'has-viewed'}`} isNew={newUnlocks?.all?.items?.[machine.id]?.hasNew}>
                                <MachineCard
                                    {...machine}
                                    onFlash={handleFlash}
                                    onPurchase={purchaseItem}
                                    onDelete={deleteItem}
                                    onSetLoad={setMachineLoad}
                                    onShowDetails={setItemDetails}
                                    toggleAutopurchase={toggleAutopurchase}
                                    isAutomationUnlocked={data.isAutomationUnlocked}
                                    isMobile={isMobile}
                                    toggleHiddenItem={toggleHiddenItem}
                                />
                            </NewNotificationWrap>
                        ))}
                        {overlayPositions.map((position, index) => (
                            <FlashOverlay key={index} position={position} />
                        ))}
                    </div>
                </PerfectScrollbar>
            </div>
        </div>
    );
}

export const MachineCard = ({ id, name, level, max, affordable, isLeveled, isCapped, isHidden, manualLoad, efficiency, onFlash, onPurchase, onDelete, onSetLoad, onShowDetails, isAutoPurchase, toggleAutopurchase, isAutomationUnlocked, isMobile, toggleHiddenItem }) => {
    const elementRef = useRef(null);
    useFlashOnLevelUp(isLeveled, onFlash, elementRef);

    return (
        <div
            ref={elementRef}
            className={`card furniture flashable ${isCapped ? 'complete' : ''} ${affordable.hardLocked ? 'hard-locked' : ''}  ${!affordable.isAffordable ? 'unavailable' : ''} ${efficiency < 0.999 ? 'lower-eff' : ''}`}
            onMouseEnter={() => !isMobile ? onShowDetails?.(id) : null}
            onMouseLeave={() => !isMobile ? onShowDetails?.(null) : null}
            onClick={() => isMobile ? onShowDetails?.(id) : null}
        >
            <div className={'head'}>
                <p className={'title'}>{name}</p>
                <span className={'level'}>{formatInt(level)}{max ? `/${formatInt(max)}` : ''}</span>
            </div>
            <div className={'block'}>
                <label className={'row'}>
                    <span>Load: {Math.round((manualLoad ?? 1)*100)}%</span>
                    {efficiency < 0.999 ? (<span className={'warning'}>Efficiency: {Math.round(efficiency*100)}%</span>) : null}
                </label>
                <input type={'range'} min={0} max={1} step={0.01} value={manualLoad ?? 1} onChange={e => onSetLoad(id, parseFloat(e.target.value))} />
            </div>
            <div className={'bottom'}>
                <div className={'buttons'}>
                    <div className={'leftwise'}>
                        <CustomButton
                            disabled={!affordable.isAffordable || isCapped}
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onPurchase(id); }}
                            className={`purchase-button medium-sm ${isCapped ? 'capped' : ''}`}
                            style={{ '--progress': `${affordable.percentage*100}%` }}
                            iconId={'icon_upgrade_v2'}
                        >Purchase</CustomButton>
                        {isAutomationUnlocked ? (
                            <AutomationIcon
                                value={isAutoPurchase}
                                className={`medium-sm`}
                                onClick={(e) => { e.stopPropagation(); e.preventDefault(); toggleAutopurchase(id, !isAutoPurchase) }}
                            >{isAutoPurchase ? 'Autopurchase is turned on. Click to turn it off' : 'Autopurchase is turned off. Click to turn it on'}</AutomationIcon>
                        ) : null}
                        <TippyWrapper content={<div className={'hint-popup'}>{isHidden ? 'Show Machinery' : 'Hide Machinery'}</div> }>
                            <div className={'icon-content interface-icon medium-sm'} onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleHiddenItem(id, !isHidden)
                            }}>
                                {isHidden ? (<img src={"icons/interface/icon_show.png"}/>) : (<img src={"icons/interface/icon_hide.png"}/>)}
                            </div>
                        </TippyWrapper>
                    </div>
                    <div className={'right-wise'}>
                        <CustomButton disabled={level <= 0} iconId={'icon_downgrade_v2'} className={'medium-sm'} onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(id) }}>Remove 1 level</CustomButton>
                    </div>
                </div>
            </div>
        </div>
    );
}



