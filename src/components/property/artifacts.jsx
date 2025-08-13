import React, {useCallback, useContext, useEffect, useRef, useState} from "react";
import WorkerContext from "../../context/worker-context";
import {useWorkerClient} from "../../general/client";
import PerfectScrollbar from "react-perfect-scrollbar";
import {formatInt} from "../../general/utils/strings";
import {FlashOverlay} from "../layout/flash-overlay.jsx";
import {useFlashOnLevelUp} from "../../general/hooks/flash";
import {NewNotificationWrap} from "../shared/new-notification-wrap.jsx";
import {SearchField} from "../shared/search-field.jsx";
import {RawResource} from "../shared/raw-resource.jsx";
import CustomFilter from "../shared/custom-filter.jsx";
import CustomFiltersList from "../shared/custom-filter-list.jsx";
import {DragDropContext} from "react-beautiful-dnd";
import {TippyWrapper} from "../shared/tippy-wrapper.jsx";
import {BreakDown} from "../layout/sidebar.jsx";
import {CustomButton} from "../shared/buttons/custom-button.jsx";
import {AutomationIcon} from "../shared/buttons/automation-checkbox.jsx";

const ACTIONS_SEARCH_SCOPES = [{
    id: 'name',
    label: 'Name',
},{
    id: 'tags',
    label: 'Tags'
},{
    id: 'description',
    label: 'description'
},{
    id: 'resources',
    label: 'resources'
},{
    id: 'effects',
    label: 'effects'
}]

export const ArtifactUpgrades = ({ setItemDetails, purchaseItem, deleteItem, newUnlocks, isMobile }) => {
    const worker = useContext(WorkerContext);
    const { onMessage, sendData, removeMessage } = useWorkerClient(worker);
    
    const [artifactsData, setItemsData] = useState({
        available: [],
        searchData: {
            search: '',
        },
        categories: [],
        showMaxed: false,
        sortOption: 'name',
        sortOrder: 'asc',
        hiddenItems: {},
        customFilters: {},
        customFiltersOrder: []
    });

    const [overlayPositions, setOverlayPositions] = useState([]);

    const handleFlash = (position) => {
        setOverlayPositions((prev) => [...prev, position]);
        setTimeout(() => {
            setOverlayPositions((prev) => prev.filter((p) => p !== position));
        }, 1000);
    };

    useEffect(() => {
        sendData('query-furnitures-data', { filterId: 'artifact' });
        const interval = setInterval(() => {
            sendData('query-furnitures-data', { filterId: 'artifact' });
        }, 1000);

        onMessage('furnitures-data', (data) => {
            console.log('dataReceived', data);
            setItemsData(data);
        });
    
        return () => {
            removeMessage('furnitures-data');
            clearInterval(interval);
        };
    }, []);

    
    const toggleAutopurchase = useCallback((id, flag) => {
        sendData('set-furniture-autopurchase', { id, flag, filterId: 'artifact' });
    }, [sendData]);

    const toggleHiddenItem = useCallback((id, flag) => {
        sendData('set-furniture-hidden', { id, flag, filterId: 'artifact' });
    }, [sendData]);

    return (
        <div className={'upgrades-wrap'}>
            <div className={'sub-heading'}>
                <div className={'complete'}>
                    <p>Artifacts: {artifactsData.available ? artifactsData.available.filter(item => item.level > 0).length : 0} / {artifactsData.available ? artifactsData.available.length : 0}</p>
                </div>
            </div>
            <div className={'items-cat'}>
                <PerfectScrollbar>
                    <div className={'flex-container'}>
                        {artifactsData.available.map(item => 
                            <NewNotificationWrap 
                                key={`artifact_${item.id}`} 
                                id={item.id} 
                                className={'narrow-wrapper'} 
                                isNew={newUnlocks?.all?.items?.[item.id]?.hasNew}
                            >
                                <ArtifactCard 
                                    isMobile={isMobile}
                                    key={item.id} 
                                    onFlash={handleFlash}
                                    {...item} 
                                    onPurchase={purchaseItem} 
                                    onDelete={deleteItem}
                                    onShowDetails={setItemDetails} 
                                    toggleAutopurchase={toggleAutopurchase} 
                                    isAutomationUnlocked={artifactsData.isAutomationUnlocked}
                                    toggleHiddenItem={toggleHiddenItem}
                                />
                            </NewNotificationWrap>
                        )}
                        {overlayPositions.map((position, index) => (
                            <FlashOverlay key={index} position={position} />
                        ))}
                    </div>
                </PerfectScrollbar>
            </div>
        </div>
    );
};

const ArtifactCard = ({ 
    id, name, level, max, affordable, isLeveled, isCapped, isHidden, onFlash, onPurchase, onShowDetails, 
    isAutoPurchase, onDelete, toggleAutopurchase, isAutomationUnlocked, isMobile, toggleHiddenItem
}) => {
    const elementRef = useRef(null);

    useFlashOnLevelUp(isLeveled, onFlash, elementRef);

    return (<div
        ref={elementRef}
        className={`card furniture flashable ${affordable?.hardLocked ? 'hard-locked' : ''}  ${!affordable?.isAffordable ? 'unavailable' : ''}`}
        onMouseEnter={() => !isMobile ? onShowDetails(id) : null}
        onMouseLeave={() => !isMobile ? onShowDetails(null) : null}
        onClick={() => isMobile ? onShowDetails(id) : null}
    >
        <div className={'head'}>
            <p className={'title'}>{name}</p>
            <span className={'level'}>{formatInt(level)}{max ? `/${formatInt(max)}` : ''}</span>
        </div>
        <div className={'bottom'}>
            <div className={'buttons'}>
                <div className={'leftwise'}>
                    <CustomButton
                        iconId={'icon_upgrade_v2'}
                        disabled={!affordable?.isAffordable || isCapped}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onPurchase(id)
                        }}
                        className={`purchase-button medium-sm ${isCapped ? 'capped' : ''}`}
                        style={{ '--progress': `${affordable?.percentage*100}%` }}
                    >Purchase</CustomButton>
                    {isAutomationUnlocked ? (<AutomationIcon
                        value={isAutoPurchase}
                        className={`medium-sm`}
                        onClick={(e) => {e.stopPropagation(); e.preventDefault(); toggleAutopurchase(id, !isAutoPurchase)}}
                    >{isAutoPurchase ? 'Autopurchase is turned on. Click to turn it off' : 'Autopurchase is turned off. Click to turn it on'}</AutomationIcon>) : null}
                    <TippyWrapper content={<div className={'hint-popup'}>{isHidden ? 'Show Artifact' : 'Hide Artifact'}</div> }>
                        <div className={'icon-content interface-icon medium-sm'} onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleHiddenItem(id, !isHidden)
                        }}>
                            {isHidden ? (<img src={"icons/interface/icon_show.png"}/>) : (<img src={"icons/interface/icon_hide.png"}/>)}
                        </div>
                    </TippyWrapper>
                </div>
            </div>
        </div>
    </div> )
}; 