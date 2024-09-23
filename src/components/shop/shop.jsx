import React, {useContext, useEffect, useState} from "react";
import WorkerContext from "../../context/worker-context";
import {useWorkerClient} from "../../general/client";
import {formatInt, formatValue} from "../../general/utils/strings";
import {ProgressBar} from "../layout/progress-bar.jsx";
import PerfectScrollbar from "react-perfect-scrollbar";
import {EffectsSection} from "../shared/effects-section.jsx";
import {ResourceCost} from "../shared/resource-cost.jsx";

export const Shop = ({}) => {

    const worker = useContext(WorkerContext);

    const { onMessage, sendData } = useWorkerClient(worker);
    const [itemsData, setItemsData] = useState({
        available: [],
        current: undefined
    });
    const [detailOpened, setDetailOpened] = useState(null)

    useEffect(() => {
        const interval = setInterval(() => {
            sendData('query-items-data', {});
        }, 100);
        return () => {
            clearInterval(interval);
        }
    }, [])

    onMessage('items-data', (items) => {
        setItemsData(items);
    })

    const purchaseItem = (id) => {
        sendData('purchase-item', { id })
    }

    const setItemDetails = (id) => {
        if(!id) {
            setDetailOpened(null);
        } else {
            setDetailOpened(id);
        }
    }

    return (
        <div className={'items-wrap'}>
            <div className={'ingame-box items'}>
                <PerfectScrollbar>
                    <div className={'flex-container'}>
                        {itemsData.available.map(item => <ItemCard key={item.id} {...item} onPurchase={purchaseItem} onShowDetails={setItemDetails}/>)}
                    </div>
                </PerfectScrollbar>
            </div>
            <div className={'item-detail ingame-box detail-blade'}>
                <ItemDetails itemId={detailOpened} />
            </div>
        </div>

    )

}

export const ItemCard = ({ id, name, level, max, affordable, isLeveled, onClick, onPurchase, onShowDetails}) => {
    const [isFlashActive, setFlashActive] = useState(false);

    useEffect(() => {

        console.log('Leveled!', isLeveled)
        if(isLeveled) {
            setFlashActive(true);
        }

        const timer = setTimeout(() => {
            console.log('Clearing')
            setFlashActive(false);
        }, 1000); // Adjust the time as needed

        // Cleanup the timer if the component unmounts or if someProp changes before the timer finishes
        return () => clearTimeout(timer);

    }, [isLeveled]);

    return (<div className={`card item flashable ${isFlashActive ? 'flash' : ''} ${affordable.hardLocked ? 'hard-locked' : ''}`} onMouseEnter={() => onShowDetails(id)} onMouseLeave={() => onShowDetails(null)}>
        <div className={'head'}>
            <p className={'title'}>{name}</p>
            <span className={'level'}>{formatInt(level)}{max ? `/${formatInt(max)}` : ''}</span>
        </div>
        <div className={'bottom'}>
            <div className={'buttons'}>
                <button disabled={!affordable.isAffordable} onClick={() => onPurchase(id)}>Purchase</button>
            </div>
        </div>
    </div> )
}

export const ItemDetails = ({itemId}) => {

    const worker = useContext(WorkerContext);

    const { onMessage, sendData } = useWorkerClient(worker);

    const [item, setDetailOpened] = useState(null);

    const [interval, setIntervalRef] = useState(null);

    useEffect(() => {
        if(interval) {
            clearInterval(interval);
        }
        const intervalLoc = setInterval(() => {
            sendData('query-item-details', { id: itemId });
        }, 100);
        setIntervalRef(intervalLoc);
    }, [itemId])


    onMessage('item-details', (items) => {
        setDetailOpened(items);
    })

    if(!itemId || !item) return null;


    return (
        <PerfectScrollbar>
            <div className={'blade-inner'}>
                <div className={'block'}>
                    <h4>{item.name}</h4>
                    <div className={'description'}>
                        {item.description}
                    </div>
                </div>
                <div className={'block'}>
                    <div className={'tags-container'}>
                        {item.tags.map(tag => (<div className={'tag'}>{tag}</div> ))}
                    </div>
                </div>
                <div className={'block'}>
                    <div className={'costs-wrap'}>
                        {Object.values(item.affordable.affordabilities || {}).map(aff => <ResourceCost affordabilities={aff}/>)}
                    </div>
                </div>
                <div className={'block'}>
                    <div className={'effects'}>
                        <EffectsSection effects={item.potentialEffects} />
                    </div>
                </div>
            </div>
        </PerfectScrollbar>
    )
}