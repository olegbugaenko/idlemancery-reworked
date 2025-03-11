import React, {useCallback, useContext, useEffect, useState} from "react";
import WorkerContext from "../../context/worker-context";
import {useWorkerClient} from "../../general/client";
import PerfectScrollbar from "react-perfect-scrollbar";
import {EffectsSection} from "../shared/effects-section.jsx";
import {ResourceCost} from "../shared/resource-cost.jsx";
import {ResourceComparison} from "../shared/resource-comparison.jsx";
import {Guilds} from "./guilds.jsx";
import {NewNotificationWrap} from "../shared/new-notification-wrap.jsx";
import {useAppContext} from "../../context/ui-context";

export const Social = () => {

    const worker = useContext(WorkerContext);

    const { isMobile } = useAppContext();
    const [isDetailVisible, setDetailVisible] = useState(!isMobile);

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

    const purchaseGuildUpgrade = useCallback((id) => {
        sendData(`purchase-guild-item`, { id })
    })

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
                {isMobile ? (<div>
                    <span className={'highlighted-span'} onClick={() => setDetailVisible(true)}>Info</span>
                </div>) : null}
            </div>
            {selectedTab === 'guilds' ? (<Guilds filterId={selectedTab} setItemDetails={setItemDetails} newUnlocks={newUnlocks.social?.items?.guilds?.items} isMobile={isMobile}/>) : null}
        </div>

        {(!isMobile || isDetailVisible || detailOpened?.id) ? (<div className={'item-detail ingame-box detail-blade'}>
            {detailOpened?.id ? (
                <ItemDetails itemId={detailOpened?.id} meta={detailOpened?.meta} category={selectedTab} setItemDetails={setItemDetails} purchaseGuildUpgrade={purchaseGuildUpgrade}/>) : (
                <GeneralStats setDetailVisible={setDetailVisible}/>)}
        </div>) : null}
    </div>)

}

export const GeneralStats = ({ setDetailVisible }) => {

    const worker = useContext(WorkerContext);

    const { isMobile } = useAppContext();

    const { onMessage, sendData } = useWorkerClient(worker);

    const [stats, setStats] = useState([]);

    useEffect(() => {
        sendData('query-all-guilds-effects', {})
    }, [])

    onMessage('all-guilds-effects', (items) => {
        // console.log('all-guilds-effects: ', items)
        setStats(items);
    })

    return (
        <PerfectScrollbar>
            <div className={'blade-inner'}>
                {stats.map(guildStat => (<div className={'block'}>
                    <p>{guildStat.name}</p>
                    <div className={'effects-wrap-outer'}>
                        <EffectsSection effects={guildStat.effects} />
                    </div>
                </div> ))}
                {isMobile ? (<div className={'block buttons'}>
                    <button onClick={() => setDetailVisible(false)}>Close</button>
                </div>) : null}
            </div>
        </PerfectScrollbar>)
}

export const ItemDetails = ({itemId, meta, category, setItemDetails, purchaseGuildUpgrade}) => {

    const worker = useContext(WorkerContext);

    const { onMessage, sendData } = useWorkerClient(worker);

    const { isMobile } = useAppContext();

    const [item, setDetailOpened] = useState(null);

    useEffect(() => {
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
        // console.log('GuildDetails: ', items)
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
                {isMobile ? (<div className={'block buttons flex-container'}>
                    <button disabled={!item.affordable.isAffordable} onClick={() => purchaseGuildUpgrade(item.id)}>Purchase</button>
                    <button onClick={() => setItemDetails(null)}>Close</button>
                </div>) : null}
            </div>
        </PerfectScrollbar>
    )
}