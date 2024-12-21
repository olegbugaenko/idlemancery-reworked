import React, {useContext, useEffect, useRef, useState} from "react";
import WorkerContext from "../../context/worker-context";
import {useWorkerClient} from "../../general/client";
import {formatInt, formatValue} from "../../general/utils/strings";
import PerfectScrollbar from "react-perfect-scrollbar";
import {TippyWrapper} from "../shared/tippy-wrapper.jsx";
import {BreakDown} from "../layout/sidebar.jsx";
import {NewNotificationWrap} from "../layout/new-notification-wrap.jsx";

export const Alchemy = ({ setItemDetails, setItemLevel, filterId, newUnlocks }) => {

    const worker = useContext(WorkerContext);

    const { onMessage, sendData } = useWorkerClient(worker);
    const [craftingData, setItemsData] = useState({
        available: [],
        slots: {
            total: 0,
            max: 0
        },
        efforts: {
            consumption: 0,
            balance: 0,
            breakDown: null
        }
    });

    useEffect(() => {
        const interval = setInterval(() => {
            sendData('query-crafting-data', { filterId });
        }, 100);
        return () => {
            clearInterval(interval);
        }
    }, [])

    onMessage(`crafting-data-${filterId}`, (craftables) => {
        setItemsData(craftables);
    })

    return (<div className={'crafting-wrap'}>
        <div className={'head'}>
            <div className={'space-item'}>
                <span>Alchemy Slots:</span>
                <span>{formatInt(craftingData.slots.total)}/{formatInt(craftingData.slots.max)}</span>
            </div>
            <TippyWrapper content={<div className={'hint-popup'}><BreakDown breakDown={craftingData.efforts.breakDown} /></div> }>
                <div className={'space-item'}>
                    <span>Alchemy Efforts:</span>
                    <span>{formatValue(craftingData.efforts.balance)}/{formatValue(craftingData.efforts.balance + craftingData.efforts.consumption)}</span>
                </div>
            </TippyWrapper>
        </div>
        <div className={'craftables-cat'}>
            <PerfectScrollbar>
                <div className={'flex-container'}>
                    {craftingData.available.map(craftable => <NewNotificationWrap id={`crafting_${craftable.id}`} className={'narrow-wrapper'} isNew={newUnlocks?.[`crafting_${craftable.id}`]?.hasNew}>
                        <ItemCard key={craftable.id} {...craftable} onSetLevel={setItemLevel} onShowDetails={setItemDetails}/>
                    </NewNotificationWrap>)}
                </div>
            </PerfectScrollbar>
        </div>
    </div>)
}

export const ItemCard = ({ id, icon_id, name, level, maxLevel, onSetLevel, onShowDetails}) => {

    return (<div className={`card craftable`} onMouseEnter={() => onShowDetails(id)} onMouseLeave={() => onShowDetails(null)}>
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
                        <span className={'label'}>Set Effort:</span>
                        <input type={'number'} min={0} max={maxLevel} value={level} onChange={e => onSetLevel(id, Math.round(+e.target.value))}/>
                    </div>
                </div>
            </div>
        </div>
    </div> )
}