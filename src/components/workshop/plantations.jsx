import React, {useCallback, useContext, useEffect, useState} from "react";
import WorkerContext from "../../context/worker-context";
import {useWorkerClient} from "../../general/client";
import {formatInt, formatValue} from "../../general/utils/strings";
import PerfectScrollbar from "react-perfect-scrollbar";
import {NewNotificationWrap} from "../layout/new-notification-wrap.jsx";

export const Plantations = ({ setItemDetails, newUnlocks }) => {

    const worker = useContext(WorkerContext);

    const { onMessage, sendData } = useWorkerClient(worker);
    const [plantationsData, setItemsData] = useState({
        available: [],
        slots: {
            total: 0,
            max: 0
        }
    });

    useEffect(() => {
        const interval = setInterval(() => {
            sendData('query-plantation-data', {  });
        }, 100);
        return () => {
            clearInterval(interval);
        }
    }, [])

    onMessage(`plantations-data`, (plantations) => {
        setItemsData(plantations);
    })

    const purchaseItem = useCallback((id) => {
        sendData(`purchase-plantation`, { id })
    })

    const onDemolish = useCallback((id) => {
        if(confirm('Are you sure? This action cant be undone.')) {
            sendData(`remove-plantation`, { id })
        }
    })

    return (<div className={'crafting-wrap'}>
        <div className={'head'}>
            <div className={'space-item'}>
                <span>Plantation Slots:</span>
                <span>{formatInt(plantationsData.slots.total)}/{formatInt(plantationsData.slots.max)}</span>
            </div>
        </div>
        <div className={'plantations-cat'}>
            <PerfectScrollbar>
                <div className={'flex-container'}>
                    {plantationsData.available.map(plantable => <NewNotificationWrap id={`plantation_${plantable.id}`} className={'narrow-wrapper'} isNew={newUnlocks?.[`plantation_${plantable.id}`]?.hasNew}>
                        <ItemCard key={plantable.id} {...plantable} onPurchase={purchaseItem} onShowDetails={setItemDetails} onDemolish={onDemolish}/>
                    </NewNotificationWrap>)}
                </div>
            </PerfectScrollbar>
        </div>
    </div>)
}

export const ItemCard = ({ id, icon_id, name, level, maxLevel, affordable, onPurchase, onDemolish, onShowDetails}) => {

    return (<div className={`card craftable plantable`} onMouseEnter={() => onShowDetails(id)} onMouseLeave={() => onShowDetails(null)}>
        <div className={'flex-container two-side-card'}>
            <div className={'left'}>
                <img src={`icons/resources/${icon_id}.png`} className={'resource big'}/>
            </div>
            <div className={'right'}>
                <div className={'head'}>
                    <p className={'title'}>{name}</p>
                    <span className={'level'}>{formatInt(level)}{maxLevel ? `/${formatInt(maxLevel)}` : ''}</span>
                </div>
                <div className={'bottom'}>
                    <div className={'buttons'}>
                        <button disabled={!affordable.isAffordable} onClick={() => onPurchase(id)}>{level > 0 ? 'Upgrade' : 'Purchase'}</button>
                        <button disabled={level <= 0} onClick={() => onDemolish(id)}>Demolish</button>
                    </div>
                </div>
            </div>
        </div>

    </div> )
}
