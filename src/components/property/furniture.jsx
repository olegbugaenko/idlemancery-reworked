import React, {useContext, useEffect, useState} from "react";
import WorkerContext from "../../context/worker-context";
import {useWorkerClient} from "../../general/client";
import PerfectScrollbar from "react-perfect-scrollbar";
import {formatInt} from "../../general/utils/strings";

export const FurnitureUpgrades = ({ setItemDetails, purchaseItem, deleteItem }) => {

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
            sendData('query-furnitures-data', {});
        }, 100);
        return () => {
            clearInterval(interval);
        }
    }, [])

    onMessage('furnitures-data', (furnitures) => {
        setItemsData(furnitures);
    })

    return (<div className={'furniture-wrap'}>
        <div className={'head'}>
            <div className={'space-item'}>
                <span>Space:</span>
                <span>{formatInt(furnituresData.space.total)}/{formatInt(furnituresData.space.max)}</span>
            </div>
        </div>
        <div className={'furnitures-cat'}>
            <PerfectScrollbar>
                <div className={'flex-container'}>
                    {furnituresData.available.map(furniture => <ItemCard key={furniture.id} {...furniture} onPurchase={purchaseItem} onShowDetails={setItemDetails} onDelete={deleteItem}/>)}
                </div>
            </PerfectScrollbar>
        </div>
    </div>)
}

export const ItemCard = ({ id, name, level, max, affordable, isLeveled, onClick, onPurchase, onShowDetails, onDelete}) => {
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

    return (<div className={`card furniture flashable ${isFlashActive ? 'flash' : ''} ${affordable.hardLocked ? 'hard-locked' : ''}  ${!affordable.isAffordable ? 'unavailable' : ''}`} onMouseEnter={() => onShowDetails(id)} onMouseLeave={() => onShowDetails(null)}>
        <div className={'head'}>
            <p className={'title'}>{name}</p>
            <span className={'level'}>{formatInt(level)}{max ? `/${formatInt(max)}` : ''}</span>
        </div>
        <div className={'bottom'}>
            <div className={'buttons'}>
                <button disabled={!affordable.isAffordable} onClick={() => onPurchase(id)}>Purchase</button>
                <button disabled={level <= 0} onClick={() => onDelete(id)}>Remove</button>
            </div>
        </div>
    </div> )
}