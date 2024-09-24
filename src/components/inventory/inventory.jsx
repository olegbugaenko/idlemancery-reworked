import React, {useContext, useEffect, useState} from "react";
import WorkerContext from "../../context/worker-context";
import {useWorkerClient} from "../../general/client";
import {formatInt, formatValue} from "../../general/utils/strings";
import {ProgressBar} from "../layout/progress-bar.jsx";
import PerfectScrollbar from "react-perfect-scrollbar";
import {EffectsSection} from "../shared/effects-section.jsx";
import {ResourceCost} from "../shared/resource-cost.jsx";

export const Inventory = ({}) => {

    const worker = useContext(WorkerContext);

    const { onMessage, sendData } = useWorkerClient(worker);
    const [inventoryData, setItemsData] = useState({
        available: [],
        current: undefined
    });
    const [detailOpened, setDetailOpened] = useState(null)

    useEffect(() => {
        const interval = setInterval(() => {
            sendData('query-inventory-data', {});
        }, 100);
        return () => {
            clearInterval(interval);
        }
    }, [])

    onMessage('inventory-data', (inventory) => {
        setItemsData(inventory);
    })

    const purchaseItem = (id) => {
        sendData('consume-inventory', { id, amount: 1 })
    }

    const setInventoryDetails = (id) => {
        if(!id) {
            setDetailOpened(null);
        } else {
            setDetailOpened(id);
        }
    }

    return (
        <div className={'inventory-wrap'}>
            <div className={'ingame-box inventory'}>
                <PerfectScrollbar>
                    <div className={'flex-container'}>
                        {inventoryData.available.map(item => <InventoryCard key={item.id} {...item} onPurchase={purchaseItem} onShowDetails={setInventoryDetails}/>)}
                    </div>
                </PerfectScrollbar>
            </div>
            <div className={'item-detail ingame-box detail-blade'}>
                {detailOpened ? (<InventoryDetails itemId={detailOpened} />) : null}
            </div>
        </div>

    )

}

export const InventoryCard = ({ id, name, amount, onPurchase, onShowDetails}) => {
    const [isFlashActive, setFlashActive] = useState(false);

 /*   useEffect(() => {

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

    }, [isLeveled]);*/

    return (<div className={`icon-card item flashable ${isFlashActive ? 'flash' : ''}`} onMouseEnter={() => onShowDetails(id)} onMouseLeave={() => onShowDetails(null)} onClick={() => onPurchase(id)}>
        <div className={'icon-content'}>
            <img src={`icons/resources/${id}.png`} className={'resource'} />
            <span className={'level'}>{formatInt(amount)}</span>
        </div>
    </div> )
}

export const InventoryDetails = ({itemId}) => {

    const worker = useContext(WorkerContext);

    const { onMessage, sendData } = useWorkerClient(worker);

    const [item, setDetailOpened] = useState(null);

    useEffect(() => {
        const interval = setInterval(() => {
            sendData('query-inventory-details', { id: itemId });
        }, 100);

        return () => {
            clearInterval(interval);
        }
    })


    onMessage('inventory-details', (inventory) => {
        setDetailOpened(inventory);
    })

    if(!itemId || !item) return null;


    return (
        <PerfectScrollbar>
            <div className={'blade-inner'}>
                <div className={'block'}>
                    <h4>{item.name} (x{formatInt(item.amount)})</h4>
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
                    <p>Effects on usage:</p>
                    <div className={'effects'}>
                        <EffectsSection effects={item.effects} />
                    </div>
                </div>
            </div>
        </PerfectScrollbar>
    )
}