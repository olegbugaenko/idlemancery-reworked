import React, {useContext, useEffect, useState} from "react";
import WorkerContext from "../../context/worker-context";
import {useWorkerClient} from "../../general/client";
import {formatInt, formatValue} from "../../general/utils/strings";
import PerfectScrollbar from "react-perfect-scrollbar";
import {EffectsSection} from "../shared/effects-section.jsx";
import {ResourceCost} from "../shared/resource-cost.jsx";
import {FurnitureUpgrades} from "./furniture.jsx";
import {ResourceComparison} from "../shared/resource-comparison.jsx";
import {AccessoryUpgrades} from "./accessories.jsx";
import {NewNotificationWrap} from "../shared/new-notification-wrap.jsx";
import {useUICache} from "../../general/hooks/local-cache";
import {AmplifiersUpgrades} from "./amplifiers.jsx";
import {useAppContext} from "../../context/ui-context";
import {TippyWrapper} from "../shared/tippy-wrapper.jsx";
import StatRow from "../shared/stat-row.jsx";

export const Property = ({}) => {
    const [detailOpened, setDetailOpened] = useState(null)

    const worker = useContext(WorkerContext);

    const { onMessage, sendData } = useWorkerClient(worker);

    const [unlocks, setUnlocksData] = useState({});

    const [ selectedTab, setSelectedTab ] = useUICache('property_tab', 'furniture');

    const [newUnlocks, setNewUnlocks] = useState({});

    const { isMobile } = useAppContext();



    useEffect(() => {
        sendData('query-unlocks', { prefix: 'property' });
        const interval = setInterval(() => {
            sendData('query-unlocks', { prefix: 'property' });
            sendData('query-new-unlocks-notifications', { suffix: 'property', scope: 'property' })
        }, 1000);
        return () => {
            clearInterval(interval);
        }
    }, [])

    onMessage('unlocks-property', (unlocks) => {
        setUnlocksData(unlocks);

        const mapToPages = {
            furniture: 'property',
            accessory: 'crafting',
            amplifier: 'amplifiers'
        }

        if(!unlocks[mapToPages[selectedTab]]) {
            const acceptable = Object.entries(mapToPages).filter(([tab, unlock]) => unlocks[unlock]);
            if(acceptable.length) {
                setSelectedTab(acceptable[0][0]);
            }
        }
    })

    onMessage('new-unlocks-notifications-property', payload => {
        // console.log('Received unlocks: ', payload);
        setNewUnlocks(payload);
    })


    const purchaseItem = (id) => {
        sendData('purchase-furniture', { id, filterId: selectedTab })
    }

    const deleteItem = (id) => {
        sendData('delete-furniture', { id, filterId: selectedTab })
    }

    const setItemDetails = (id) => {
        sendData('set-monitored', { scope: 'effects', type: selectedTab, id });
        if(!id) {
            setDetailOpened(null);
        } else {
            setDetailOpened(id);
        }
    }

    return (
        <div className={'items-wrap'}>
            <div className={'items ingame-box'}>
                <div className={'menu-wrap'}>
                    <ul className={'menu'}>
                        <li className={`${selectedTab === 'furniture' ? 'active' : ''}`} onClick={() => {setSelectedTab('furniture'); setDetailOpened(null);}}>
                            <NewNotificationWrap isNew={newUnlocks?.['property']?.items?.['furniture']?.hasNew}>
                                <span>Furniture</span>
                            </NewNotificationWrap>
                        </li>
                        {unlocks.crafting ? (<li className={`${selectedTab === 'accessory' ? 'active' : ''}`} onClick={() => {setSelectedTab('accessory'); setDetailOpened(null);}}>
                            <NewNotificationWrap isNew={newUnlocks?.['property']?.items?.['accessory']?.hasNew}>
                                <span>Accessories</span>
                            </NewNotificationWrap>
                        </li>) : null}
                        {unlocks.amplifiers ? (<li className={`${selectedTab === 'amplifier' ? 'active' : ''}`} onClick={() => {setSelectedTab('amplifier'); setDetailOpened(null);}}>
                            <NewNotificationWrap isNew={newUnlocks?.['property']?.items?.['amplifier']?.hasNew}>
                                <span>Amplifiers</span>
                            </NewNotificationWrap>
                        </li>) : null}
                    </ul>
                </div>
                {selectedTab === 'furniture' ? (<FurnitureUpgrades setItemDetails={setItemDetails} purchaseItem={purchaseItem} deleteItem={deleteItem} newUnlocks={newUnlocks?.['property']?.items?.['furniture']?.items} isMobile={isMobile}/>) : null}
                {selectedTab === 'accessory' ? (<AccessoryUpgrades setItemDetails={setItemDetails} purchaseItem={purchaseItem} deleteItem={deleteItem} newUnlocks={newUnlocks?.['property']?.items?.['accessory']?.items} isMobile={isMobile}/>) : null}
                {selectedTab === 'amplifier' ? (<AmplifiersUpgrades setItemDetails={setItemDetails} purchaseItem={purchaseItem} deleteItem={deleteItem} newUnlocks={newUnlocks?.['property']?.items?.['amplifier']?.items} isMobile={isMobile}/>) : null}
            </div>

            {(!isMobile || detailOpened) ? (<div className={'item-detail ingame-box detail-blade'}>
                {detailOpened ? (<ItemDetails itemId={detailOpened} category={selectedTab} setItemDetails={setItemDetails} purchaseItem={purchaseItem}/>) : (<GeneralStats setDetailVisible={setDetailOpened} />)}
            </div>) : null}
        </div>

    )

}


export const ItemDetails = ({itemId, category, setItemDetails, purchaseItem}) => {

    const worker = useContext(WorkerContext);

    const {onMessage, sendData} = useWorkerClient(worker);

    const [item, setDetailOpened] = useState(null);

    const {isMobile} = useAppContext();

    useEffect(() => {
        if (category === 'furniture' || category === 'accessory' || category === 'amplifier') {
            const interval = setInterval(() => {
                sendData('query-furniture-details', {id: itemId});
            }, 100);

            return () => {
                clearInterval(interval);
            }
        }

    })


    onMessage('furniture-details', (items) => {
        setDetailOpened(items);
    })

    if (!itemId || !item) return null;


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
                        {item.tags.map(tag => (<div key={tag} className={'tag'}>{tag}</div>))}
                    </div>
                </div>
                <div className={'block'}>
                    <p>Cost:</p>
                    <div className={'costs-wrap'}>
                        {Object.values(item.affordable.affordabilities || {}).map(aff => <ResourceCost
                            key={aff.id ?? aff.name} affordabilities={aff}/>)}
                    </div>
                </div>
                <div className={'block'}>
                    <p>Effects:</p>
                    <div className={'effects'}>
                        {item.currentEffects ?
                            (<ResourceComparison effects1={item.currentEffects} effects2={item.potentialEffects}/>)
                            : (<EffectsSection effects={item.potentialEffects}/>)
                        }
                    </div>
                </div>
                {isMobile ? (<div className={'buttons flex-container'}>
                    <button
                        disabled={!item.affordable.isAffordable}
                        onClick={e => purchaseItem(item.id)}
                    >
                        Purchase
                    </button>
                    <button
                        onClick={e => setItemDetails(null)}
                    >
                        Close
                    </button>
                </div>) : null}
            </div>
        </PerfectScrollbar>
    )
}


export const GeneralStats = ({ setDetailVisible }) => {

        const worker = useContext(WorkerContext);

        const {isMobile} = useAppContext();

        const {onMessage, sendData} = useWorkerClient(worker);

        const [item, setDetailOpened] = useState(null);

        useEffect(() => {
            sendData('query-general-property-stats', {});
            const interval = setInterval(() => {
                sendData('query-general-property-stats', {});
            }, 1000);

            return () => {
                clearInterval(interval);
            }

        }, [])


        onMessage('general-property-stats', (items) => {
            setDetailOpened(items);
        })

        const highLightMagicSchools = (id) => {
            //sendData('set-monitored', { scope: 'spells', type: 'school_efficiency', id });
        }

        if (!item) return null;


        return (
            <PerfectScrollbar>
                <div className={'blade-inner'}>
                    {item.property.length ? (<>
                        <div className={'block'}>
                            <h4>Property Stats</h4>
                        </div>
                        <div className={'block'}>
                            {item.property.map(stat => (<div className={'row flex-row'}>
                                <TippyWrapper content={<div className={'hint-popup'}><p>{stat.description}</p></div>}>
                                    <p>{stat.name}</p>
                                </TippyWrapper>
                                <p>{formatValue(stat.value)}</p>
                            </div>))}
                        </div>
                    </>) : null}
                    {item.accessories?.length ? (<>
                        <div className={'block'}>
                            <h4>Accessories</h4>
                        </div>
                        <div className={'block'}>
                            {item.accessories.map(stat => (
                                <StatRow onHover={highLightMagicSchools} stat={stat}/>
                            ))}
                        </div>
                    </>) : null}
                    {item.amplifiers?.length ? (<>
                        <div className={'block'}>
                            <h4>Amplifiers</h4>
                        </div>
                        <div className={'block'}>
                            {item.amplifiers.map(stat => (
                                <StatRow onHover={highLightMagicSchools} stat={stat}/>
                            ))}
                        </div>
                    </>) : null}
                    <div className={'block'}>
                        <p className={'hint'}>
                            Hover over specific item to see it details
                        </p>
                    </div>
                    {isMobile ? (<div className={'block buttons'}>
                        <button onClick={() => setDetailVisible(false)}>Close</button>
                    </div>) : null}
                </div>
            </PerfectScrollbar>
        )
}
