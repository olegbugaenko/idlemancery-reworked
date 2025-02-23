import React, {useCallback, useContext, useEffect, useState} from "react";
import WorkerContext from "../../../context/worker-context";
import {useWorkerClient} from "../../../general/client";
import {formatInt, formatValue} from "../../../general/utils/strings";
import PerfectScrollbar from "react-perfect-scrollbar";
import {NewNotificationWrap} from "../../layout/new-notification-wrap.jsx";
import {RawResource} from "../../shared/raw-resource.jsx";
import {BreakDown} from "../../layout/sidebar.jsx";
import {TippyWrapper} from "../../shared/tippy-wrapper.jsx";

export const Plantations = ({ setItemDetails, newUnlocks }) => {

    const worker = useContext(WorkerContext);

    const { onMessage, sendData } = useWorkerClient(worker);
    const [plantationsData, setItemsData] = useState({
        available: [],
        slots: {
            total: 0,
            max: 0
        },
        isWateringUnlocked: false,
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

    const setWateringLevel = useCallback((id, level) => {
        sendData(`set-plantation-watering`, { id, level })
    })

    return (<div className={'crafting-wrap'}>
        <div className={'head'}>
            <div className={'space-item'}>
                <RawResource id={'plantation_slots'} name={'Plantation Slots'} />
                <span className={`${plantationsData.slots.total > 0 ? 'slots-available' : 'slots-unavailable'}`}>{formatInt(plantationsData.slots.total)}/{formatInt(plantationsData.slots.max)}</span>
            </div>
            {plantationsData.isWateringUnlocked ? (<TippyWrapper content={<div className={'hint-popup'}>
                <p className={'hint'}>Congrats! You can now use water to increase your plantations efficiency by setting watering level</p>
                <p className={'hint'}>If you try to use more water than you have - watering bonus will decrease</p>
                <BreakDown breakDown={plantationsData.waterResource.breakDown} />
            </div> }>
                <div className={'space-item'}>
                    <RawResource id={'inventory_water'} name={plantationsData.waterResource.name} />
                    <span>{formatValue(plantationsData.waterResource.amount)}({formatValue(plantationsData.waterResource.balance)})</span>
                </div>
            </TippyWrapper> ) : null}
        </div>
        <div className={'plantations-cat'}>
            <PerfectScrollbar>
                <div className={'flex-container'}>
                    {plantationsData.available.map(plantable => <NewNotificationWrap id={`plantation_${plantable.id}`} className={'narrow-wrapper'} isNew={newUnlocks?.all?.items?.[`plantation_${plantable.id}`]?.hasNew}>
                        <ItemCard key={plantable.id} {...plantable} onPurchase={purchaseItem} onShowDetails={setItemDetails} onDemolish={onDemolish} isWateringUnlocked={plantationsData.isWateringUnlocked} setWateringLevel={setWateringLevel}/>
                    </NewNotificationWrap>)}
                </div>
            </PerfectScrollbar>
        </div>
    </div>)
}

export const ItemCard = ({ id, icon_id, resourceAmount, resourceBalance , name, level, maxLevel, affordable, onPurchase, onDemolish, onShowDetails, wateringLevel, isWateringUnlocked, setWateringLevel}) => {

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
                <div className={'mid small-text'}>
                    <p>You own: {formatValue(resourceAmount)} <span className={`balance ${resourceBalance > 1.e-8 ? 'green' : ''} ${resourceBalance < -1.e-8 ? 'yellow' : ''}`}>({formatValue(resourceBalance, 2, true)})</span></p>
                </div>
                {isWateringUnlocked ? (<div className={'watering-settings'}>
                    <label>
                        <span>Watering Level:</span>
                        <input type={'number'} value={wateringLevel} onChange={(e) => setWateringLevel(id, +e.target.value)}/>
                    </label>
                </div> ) : null}
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
