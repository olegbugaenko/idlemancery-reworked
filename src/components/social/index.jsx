import React, {useCallback, useContext, useEffect, useState} from "react";
import WorkerContext from "../../context/worker-context";
import {useWorkerClient} from "../../general/client";
import PerfectScrollbar from "react-perfect-scrollbar";
import {EffectsSection} from "../shared/effects-section.jsx";
import {formatInt, formatValue} from "../../general/utils/strings";
import {ResourceCost} from "../shared/resource-cost.jsx";
import {ResourceComparison} from "../shared/resource-comparison.jsx";
import {Guilds} from "./guilds.jsx";
import {NewNotificationWrap} from "../layout/new-notification-wrap.jsx";

export const Social = () => {

    const worker = useContext(WorkerContext);

    const { onMessage, sendData } = useWorkerClient(worker);

    const [unlocks, setUnlocksData] = useState({});

    const [ selectedTab, setSelectedTab ] = useState('guilds');

    const [detailOpened, setDetailOpened] = useState(null);

    const [newUnlocks, setNewUnlocks] = useState({});



    useEffect(() => {
        const interval = setInterval(() => {
            sendData('query-unlocks', { prefix: 'social' });
        }, 100);
        const interval2 = setInterval(() => {
            sendData('query-new-unlocks-notifications', { suffix: 'social', scope: 'social' })
        }, 1000)
        return () => {
            clearInterval(interval);
            clearInterval(interval2)
        }
    }, [])

    onMessage('new-unlocks-notifications-social', payload => {
        console.log('Received unlocks: ', payload);
        setNewUnlocks(payload);
    })

    onMessage('unlocks-social', (unlocks) => {
        setUnlocksData(unlocks);
    })

    const setItemDetails = (id, meta) => {
        if(!id) {
            setDetailOpened({id: null, meta});
        } else {
            setDetailOpened({id, meta});
        }
    }

    return (<div className={'items-wrap'}>
        <div className={'items ingame-box'}>
            <div className={'menu-wrap'}>
                <ul className={'menu'}>
                    {unlocks.guilds ? (<li className={`${selectedTab === 'guilds' ? 'active' : ''}`} onClick={() => {setSelectedTab('guilds'); setDetailOpened(null);}}>
                        <NewNotificationWrap isNew={newUnlocks.social?.items?.guilds?.hasNew}>
                            <span>Guilds</span>
                        </NewNotificationWrap>
                    </li>) : null}
                </ul>
            </div>
            {selectedTab === 'guilds' ? (<Guilds filterId={selectedTab} setItemDetails={setItemDetails} newUnlocks={newUnlocks.social?.items?.guilds?.items}/>) : null}
        </div>

        <div className={'item-detail ingame-box detail-blade'}>
            {detailOpened ? (<ItemDetails itemId={detailOpened?.id} meta={detailOpened?.meta} category={selectedTab}/>) : null}
        </div>
    </div>)

}


export const ItemDetails = ({itemId, meta, category}) => {

    const worker = useContext(WorkerContext);

    const { onMessage, sendData } = useWorkerClient(worker);

    const [item, setDetailOpened] = useState(null);

    useEffect(() => {
        console.log('SocialDetails: ', itemId, category, meta);
        if(category === 'guilds') {
            const interval = setInterval(() => {
                sendData('query-guild-item-details', { id: itemId, meta });
            }, 200);

            return () => {
                clearInterval(interval);
            }
        }

    }, [itemId])


    onMessage('guild-item-details', (items) => {
        console.log('GuildDetails: ', items)
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
                {item.affordable ? (<div className={'block'}>
                    <p>Cost:</p>
                    <div className={'costs-wrap'}>
                        {Object.values(item.affordable.affordabilities || {}).map(aff => <ResourceCost
                            affordabilities={aff}/>)}
                    </div>
                </div>) : null}
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