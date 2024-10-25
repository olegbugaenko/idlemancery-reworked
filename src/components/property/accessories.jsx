import React, {useContext, useEffect, useRef, useState} from "react";
import WorkerContext from "../../context/worker-context";
import {useWorkerClient} from "../../general/client";
import PerfectScrollbar from "react-perfect-scrollbar";
import {formatInt} from "../../general/utils/strings";
import {FlashOverlay} from "../layout/flash-overlay.jsx";
import {useFlashOnLevelUp} from "../../general/hooks/flash";

export const AccessoryUpgrades = ({ setItemDetails, purchaseItem }) => {

    const worker = useContext(WorkerContext);

    const { onMessage, sendData } = useWorkerClient(worker);
    const [furnituresData, setItemsData] = useState({
        available: [],
        space: {
            total: 0,
            max: 0
        }
    });

    useEffect(() => {
        const interval = setInterval(() => {
            sendData('query-furnitures-data', { filterId: 'accessory' });
        }, 100);
        return () => {
            clearInterval(interval);
        }
    }, [])

    onMessage('furnitures-data', (furnitures) => {
        setItemsData(furnitures);
    })

    const [overlayPositions, setOverlayPositions] = useState([]);

    const handleFlash = (position) => {
        console.log('Adding flash: ', position);
        setOverlayPositions((prev) => [...prev, position]);
        setTimeout(() => {
            setOverlayPositions((prev) => prev.filter((p) => p !== position));
        }, 1000);
    };

    return (<div className={'furniture-wrap'}>
        <div className={'furnitures-cat'}>
            <PerfectScrollbar>
                <div className={'flex-container'}>
                    {furnituresData.available.map(furniture => <ItemCard key={furniture.id} {...furniture} onFlash={handleFlash} onPurchase={purchaseItem} onShowDetails={setItemDetails} />)}
                    {overlayPositions.map((position, index) => (
                        <FlashOverlay key={index} position={position} />
                    ))}
                </div>
            </PerfectScrollbar>
        </div>
    </div>)
}

export const ItemCard = ({ id, name, level, max, affordable, isLeveled, isCapped, onFlash, onPurchase, onShowDetails, onDelete}) => {
    const elementRef = useRef(null);

    useFlashOnLevelUp(isLeveled, onFlash, elementRef);

    return (<div ref={elementRef} className={`card furniture flashable ${affordable.hardLocked ? 'hard-locked' : ''}  ${!affordable.isAffordable ? 'unavailable' : ''}`} onMouseEnter={() => onShowDetails(id)} onMouseLeave={() => onShowDetails(null)}>
        <div className={'head'}>
            <p className={'title'}>{name}</p>
            <span className={'level'}>{formatInt(level)}{max ? `/${formatInt(max)}` : ''}</span>
        </div>
        <div className={'bottom'}>
            <div className={'buttons'}>
                <button disabled={!affordable.isAffordable || isCapped} onClick={() => onPurchase(id)}>Purchase</button>
                {/*<button disabled={level <= 0} onClick={() => onDelete(id)}>Remove</button>*/}
            </div>
        </div>
    </div> )
}