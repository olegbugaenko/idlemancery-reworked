import React, {useCallback, useContext, useEffect, useState} from "react";
import WorkerContext from "../../context/worker-context";
import {useWorkerClient} from "../../general/client";
import PerfectScrollbar from "react-perfect-scrollbar";
import {EffectsSection} from "../shared/effects-section.jsx";
import {formatInt, formatValue} from "../../general/utils/strings";
import {Crafting} from "./crafting.jsx";
import {ResourceCost} from "../shared/resource-cost.jsx";
import {Alchemy} from "./alchemy.jsx";
import {Plantations} from "./plantations.jsx";
import {ResourceComparison} from "../shared/resource-comparison.jsx";
import {NewNotificationWrap} from "../layout/new-notification-wrap.jsx";

export const Workshop = () => {

    const worker = useContext(WorkerContext);

    const { onMessage, sendData } = useWorkerClient(worker);

    const [unlocks, setUnlocksData] = useState({});

    const [ selectedTab, setSelectedTab ] = useState('crafting');

    const [detailOpened, setDetailOpened] = useState(null);

    const [newUnlocks, setNewUnlocks] = useState({});


    useEffect(() => {
        const interval = setInterval(() => {
            sendData('query-unlocks', { prefix: 'workshop' });
        }, 100);
        const interval2 = setInterval(() => {
            sendData('query-new-unlocks-notifications', { suffix: 'workshop', scope: 'workshop' })
        }, 1000)
        return () => {
            clearInterval(interval);
            clearInterval(interval2);
        }
    }, [])

    onMessage('new-unlocks-notifications-workshop', payload => {
        console.log('Received unlocks: ', payload);
        setNewUnlocks(payload);
    })

    onMessage('unlocks-workshop', (unlocks) => {
        setUnlocksData(unlocks);
    })

    const setItemDetails = (id) => {
        if(!id) {
            setDetailOpened(null);
        } else {
            setDetailOpened(id);
        }
    }

    const setItemLevel = useCallback((id, level) => {
        sendData('set-crafting-level', { id, level, filterId: selectedTab });
    })

    return (<div className={'items-wrap'}>
        <div className={'items ingame-box'}>
            <div className={'menu-wrap'}>
                <ul className={'menu'}>
                    {unlocks.crafting ? (<li className={`${selectedTab === 'crafting' ? 'active' : ''}`} onClick={() => {setSelectedTab('crafting'); setDetailOpened(null);}}>
                        <NewNotificationWrap isNew={newUnlocks.workshop?.items?.crafting?.hasNew}>
                            <span>Crafting</span>
                        </NewNotificationWrap>
                    </li>) : null}
                    {unlocks.alchemy ? (<li className={`${selectedTab === 'alchemy' ? 'active' : ''}`} onClick={() => {setSelectedTab('alchemy'); setDetailOpened(null);}}>
                        <NewNotificationWrap isNew={newUnlocks.workshop?.items?.alchemy?.hasNew}>
                            <span>Alchemy</span>
                        </NewNotificationWrap>
                    </li>) : null}
                    {unlocks.plantation ? (<li className={`${selectedTab === 'plantation' ? 'active' : ''}`} onClick={() => {setSelectedTab('plantation'); setDetailOpened(null);}}>
                        <NewNotificationWrap isNew={newUnlocks.workshop?.items?.plantations?.hasNew}>
                            <span>Plantations</span>
                        </NewNotificationWrap>
                    </li>) : null}
                </ul>
            </div>
            {selectedTab === 'crafting' ? (<Crafting filterId={selectedTab} setItemDetails={setItemDetails} setItemLevel={setItemLevel} newUnlocks={newUnlocks.workshop?.items?.crafting?.items}/>) : null}
            {selectedTab === 'alchemy' ? (<Alchemy filterId={selectedTab} setItemDetails={setItemDetails} setItemLevel={setItemLevel} newUnlocks={newUnlocks.workshop?.items?.alchemy?.items}/>) : null}
            {selectedTab === 'plantation' ? (<Plantations setItemDetails={setItemDetails} newUnlocks={newUnlocks.workshop?.items?.plantations?.items}/>) : null}
        </div>

        <div className={'item-detail ingame-box detail-blade'}>
            {detailOpened ? (<ItemDetails itemId={detailOpened} category={selectedTab}/>) : null}
        </div>
    </div>)

}


export const ItemDetails = ({itemId, category}) => {

    const worker = useContext(WorkerContext);

    const { onMessage, sendData } = useWorkerClient(worker);

    const [item, setDetailOpened] = useState(null);

    useEffect(() => {
        console.log('Details: ', itemId, category);
        if(category === 'crafting' || category === 'alchemy') {
            const interval = setInterval(() => {
                sendData('query-crafting-details', { id: itemId });
            }, 200);

            return () => {
                clearInterval(interval);
            }
        }
        if(category === 'plantation') {
            const interval = setInterval(() => {
                sendData('query-plantation-details', { id: itemId });
            }, 200);

            return () => {
                clearInterval(interval);
            }
        }

    }, [itemId])


    onMessage('crafting-details', (items) => {
        console.log('CraftDetails: ', items)
        setDetailOpened(items);
    })

    onMessage('plantation-details', (items) => {
        console.log('PlantDetails: ', items)
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
            </div>
        </PerfectScrollbar>
    )
}