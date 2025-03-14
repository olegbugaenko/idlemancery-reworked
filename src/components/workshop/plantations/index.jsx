import React, {useCallback, useContext, useEffect, useState} from "react";
import WorkerContext from "../../../context/worker-context";
import {useWorkerClient} from "../../../general/client";
import PerfectScrollbar from "react-perfect-scrollbar";
import {EffectsSection} from "../../shared/effects-section.jsx";
import {formatInt, formatValue} from "../../../general/utils/strings";
import {ResourceCost} from "../../shared/resource-cost.jsx";
import {Plantations} from "./plantations.jsx";
import {ResourceComparison} from "../../shared/resource-comparison.jsx";
import {ResourceEffects} from "../../shared/resource-effects.jsx";
import {useAppContext} from "../../../context/ui-context";

export const PlantationsWrap = ({ children }) => {

    const worker = useContext(WorkerContext);

    const { isMobile } = useAppContext();
    const [isDetailVisible, setDetailVisible] = useState(!isMobile);

    const { onMessage, sendData } = useWorkerClient(worker);

    const [detailOpened, setDetailOpened] = useState(null);

    const [newUnlocks, setNewUnlocks] = useState({});


    useEffect(() => {
        const interval2 = setInterval(() => {
            sendData('query-new-unlocks-notifications', { suffix: 'plantations', scope: 'workshop' })
        }, 1000)
        return () => {
            clearInterval(interval2);
        }
    }, [])

    onMessage('new-unlocks-notifications-plantations', payload => {
        setNewUnlocks(payload);
    })

    const setItemDetails = (id) => {
        if(!id) {
            setDetailOpened(null);
        } else {
            setDetailOpened(id);
        }
    }


    return (<div className={'items-wrap'}>

        <div className={'items ingame-box'}>
            <div className={'head workshop'}>
                {children}
            </div>
            <Plantations setItemDetails={setItemDetails} newUnlocks={newUnlocks.workshop?.items?.plantations?.items}/>
        </div>

        {(!isMobile || detailOpened || isDetailVisible) ? (<div className={'item-detail ingame-box detail-blade'}>
            {detailOpened ? (<ItemDetails itemId={detailOpened} category={'plantations'} setItemDetails={setItemDetails}/>) : null}
        </div>) : null}
    </div>)

}


export const ItemDetails = ({itemId, category, setItemDetails}) => {

    const worker = useContext(WorkerContext);

    const { isMobile } = useAppContext()

    const { onMessage, sendData } = useWorkerClient(worker);

    const [item, setDetailOpened] = useState(null);

    useEffect(() => {
        // console.log('Details: ', itemId, category);

        const interval = setInterval(() => {
            sendData('query-plantation-details', { id: itemId });
        }, 200);

        return () => {
            clearInterval(interval);
        }


    }, [itemId])

    onMessage('plantation-details', (items) => {
        // console.log('PlantDetails: ', items)
        setDetailOpened(items);
    })

    if(!itemId || !item) return null;


    return (
        <PerfectScrollbar>
            <div className={'blade-inner'}>
                <div className={'block'}>
                    <h4>{item.name} (x{formatInt(item.level)})</h4>
                    <div className={'description'}>
                        {item.description}
                    </div>
                </div>
                {item.bottleNeck ? (<div className={'block'}>
                    <p className={'hint'}>This activity running at {formatValue(item.efficiency*100)}% due to missing {item.bottleNeck.name}</p>
                </div> ) : null}
                <div className={'block'}>
                    <p>Cost:</p>
                    <div className={'costs-wrap'}>
                        {Object.values(item.affordable.affordabilities || {}).map(aff => <ResourceCost affordabilities={aff}/>)}
                    </div>
                </div>
                <div className={'block'}>
                    <p>Effects:</p>
                    <div className={'effects'}>
                        {item.currentEffects ?
                            (<ResourceComparison effects1={item.currentEffects} effects2={item.potentialEffects}/>)
                            : (<EffectsSection effects={item.effects} maxDisplay={10}/>)
                        }
                    </div>
                </div>
                {item.isWateringUnlocked ? (<div className={'watering block'}>
                    <p>Watering: {formatInt(item.wateringLevel)} / {formatInt(item.maxWatering.value)}</p>
                    <div className={'stats-wrap'}>
                        <ResourceComparison effects1={item.wateringEffects} effects2={item.nextWateringEffects} />
                    </div>
                    {item.wateringLevel >= item.maxWatering.value ? (<div className={'warn'}>
                        <p className={'hint yellow'}>Build more water pumps to increase watering level (See property tab)</p>
                    </div> ) : null}
                </div> ) : null}
                {isMobile ? (<div className={'block buttons'}>
                    <button onClick={() => setItemDetails(null)}>Close</button>
                </div>) : null}
            </div>
        </PerfectScrollbar>
    )
}