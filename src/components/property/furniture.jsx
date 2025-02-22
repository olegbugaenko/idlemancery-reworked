import React, {useCallback, useContext, useEffect, useRef, useState} from "react";
import WorkerContext from "../../context/worker-context";
import {useWorkerClient} from "../../general/client";
import PerfectScrollbar from "react-perfect-scrollbar";
import {formatInt} from "../../general/utils/strings";
import {FlashOverlay} from "../layout/flash-overlay.jsx";
import {useFlashOnLevelUp} from "../../general/hooks/flash";
import {NewNotificationWrap} from "../layout/new-notification-wrap.jsx";
import {SearchField} from "../shared/search-field.jsx";


const ACTIONS_SEARCH_SCOPES = [{
    id: 'name',
    label: 'Name',
},{
    id: 'tags',
    label: 'Tags'
},{
    id: 'description',
    label: 'description'
}]

export const FurnitureUpgrades = ({ setItemDetails, purchaseItem, deleteItem, newUnlocks }) => {

    const worker = useContext(WorkerContext);

    const { onMessage, sendData } = useWorkerClient(worker);
    const [furnituresData, setItemsData] = useState({
        available: [],
        space: {
            total: 0,
            max: 0
        },
        searchData: {
            search: '',
        },
        hideMaxed: false,
    });

    useEffect(() => {
        const interval = setInterval(() => {
            sendData('query-furnitures-data', { filterId: 'furniture' });
        }, 100);
        return () => {
            clearInterval(interval);
        }
    }, [])

    onMessage('furnitures-data', (furnitures) => {
        setItemsData(furnitures);
    })

    const setSearch = (searchData) => {
        sendData('set-furniture-search-text', { filterId: 'furniture', searchData: searchData });
    }

    const setHideMaxed = (hideMaxed) => {
        sendData('set-furniture-hide-maxed', { filterId: 'furniture', hideMaxed: hideMaxed });
    }

    const [overlayPositions, setOverlayPositions] = useState([]);

    const handleFlash = (position) => {
        console.log('Adding flash: ', position);
        setOverlayPositions((prev) => [...prev, position]);
        setTimeout(() => {
            setOverlayPositions((prev) => prev.filter((p) => p !== position));
        }, 1000);
    };

    const toggleAutopurchase = useCallback((id, flag) => {
        sendData('set-furniture-autopurchase', { id, flag, filterId: 'furniture' })
    })

    return (<div className={'furniture-wrap'}>
        <div className={'head'}>
            <div className={'space-item'}>
                <span>Space:</span>
                <span className={`${furnituresData.space.total > 0 ? 'slots-available' : 'slots-unavailable'}`}>{formatInt(furnituresData.space.total)}/{formatInt(furnituresData.space.max)}</span>
            </div>
            <div className={'filters'}>
                <label>
                    <SearchField
                        placeholder={'Search'}
                        value={furnituresData.searchData}
                        onSetValue={val => setSearch(val)}
                        scopes={ACTIONS_SEARCH_SCOPES}
                    />
                </label>
                <label>
                    Hide maxed
                    <input type={'checkbox'} checked={furnituresData.hideMaxed} onChange={e => setHideMaxed(!furnituresData.hideMaxed)}/>
                </label>
            </div>
        </div>
        <div className={'furnitures-cat'}>
            <PerfectScrollbar>
                <div className={'flex-container'}>
                    {furnituresData.available.map(furniture => <NewNotificationWrap key={furniture.id} id={furniture.id} className={'narrow-wrapper'} isNew={newUnlocks?.[furniture.id]?.hasNew}>
                        <ItemCard key={furniture.id} {...furniture} onFlash={handleFlash} onPurchase={purchaseItem} onShowDetails={setItemDetails} onDelete={deleteItem} toggleAutopurchase={toggleAutopurchase} isAutomationUnlocked={furnituresData.isAutomationUnlocked}/>
                    </NewNotificationWrap>)}
                    {overlayPositions.map((position, index) => (
                        <FlashOverlay key={index} position={position} />
                    ))}
                </div>
            </PerfectScrollbar>
        </div>
    </div>)
}

export const ItemCard = ({ id, name, level, max, affordable, isLeveled, isCapped, onFlash, onPurchase, onShowDetails, onDelete, isAutoPurchase, toggleAutopurchase, isAutomationUnlocked}) => {
    const elementRef = useRef(null);

    useFlashOnLevelUp(isLeveled, onFlash, elementRef);

    return (<div ref={elementRef} className={`card furniture flashable ${isCapped ? 'complete' : ''} ${affordable.hardLocked ? 'hard-locked' : ''}  ${!affordable.isAffordable ? 'unavailable' : ''}`} onMouseEnter={() => onShowDetails(id)} onMouseLeave={() => onShowDetails(null)}>
        <div className={'head'}>
            <p className={'title'}>{name}</p>
            <span className={'level'}>{formatInt(level)}{max ? `/${formatInt(max)}` : ''}</span>
        </div>
        <div className={'bottom'}>
            <div className={'buttons'}>
                <button disabled={!affordable.isAffordable || isCapped} onClick={() => onPurchase(id)}>Purchase</button>
                {isAutomationUnlocked ? (<label className={'autobuy-label'}>
                    <input type={'checkbox'} checked={isAutoPurchase}
                           onChange={() => toggleAutopurchase(id, !isAutoPurchase)}/>
                    Autobuy
                </label>) : null}
                <button disabled={level <= 0} onClick={() => onDelete(id)}>Remove</button>
            </div>
        </div>
    </div> )
}