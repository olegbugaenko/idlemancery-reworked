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
import {NewNotificationWrap} from "../layout/new-notification-wrap.jsx";

export const Property = ({}) => {
    const [detailOpened, setDetailOpened] = useState(null)

    const worker = useContext(WorkerContext);

    const { onMessage, sendData } = useWorkerClient(worker);

    const [unlocks, setUnlocksData] = useState({});

    const [ selectedTab, setSelectedTab ] = useState('furniture');

    const [newUnlocks, setNewUnlocks] = useState({});



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
                    </ul>
                </div>
                {selectedTab === 'furniture' ? (<FurnitureUpgrades setItemDetails={setItemDetails} purchaseItem={purchaseItem} deleteItem={deleteItem} newUnlocks={newUnlocks?.['property']?.items?.['furniture']?.items}/>) : null}
                {selectedTab === 'accessory' ? (<AccessoryUpgrades setItemDetails={setItemDetails} purchaseItem={purchaseItem} deleteItem={deleteItem} newUnlocks={newUnlocks?.['property']?.items?.['accessory']?.items}/>) : null}
            </div>

            <div className={'item-detail ingame-box detail-blade'}>
                {detailOpened ? (<ItemDetails itemId={detailOpened} category={selectedTab}/>) : null}
            </div>
        </div>

    )

}


export const ItemDetails = ({itemId, category}) => {

    const worker = useContext(WorkerContext);

    const { onMessage, sendData } = useWorkerClient(worker);

    const [item, setDetailOpened] = useState(null);

    useEffect(() => {
        if(category === 'furniture' || category === 'accessory') {
            const interval = setInterval(() => {
                sendData('query-furniture-details', { id: itemId });
            }, 100);

            return () => {
                clearInterval(interval);
            }
        }

    })


    onMessage('furniture-details', (items) => {
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
                <div className={'block'}>
                    <div className={'tags-container'}>
                        {item.tags.map(tag => (<div className={'tag'}>{tag}</div> ))}
                    </div>
                </div>
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
                            (<ResourceComparison effects1={item.currentEffects} effects2={item.potentialEffects} /> )
                            : (<EffectsSection effects={item.potentialEffects} />)
                        }
                    </div>
                </div>
            </div>
        </PerfectScrollbar>
    )
}