import React, {useContext, useEffect, useRef, useState} from "react";
import WorkerContext from "../../context/worker-context";
import {useWorkerClient} from "../../general/client";
import {formatInt, formatValue} from "../../general/utils/strings";
import PerfectScrollbar from "react-perfect-scrollbar";
import {EffectsSection} from "../shared/effects-section.jsx";
import {ResourceCost} from "../shared/resource-cost.jsx";
import {TippyWrapper} from "../shared/tippy-wrapper.jsx";
import {FlashOverlay} from "../layout/flash-overlay.jsx";
import {useFlashOnLevelUp} from "../../general/hooks/flash";
import {ResourceComparison} from "../shared/resource-comparison.jsx";
import {NewNotificationWrap} from "../layout/new-notification-wrap.jsx";

export const Shop = ({}) => {
    const [detailOpened, setDetailOpened] = useState(null)

    const worker = useContext(WorkerContext);

    const { onMessage, sendData } = useWorkerClient(worker);

    const [ selectedTab, setSelectedTab ] = useState('upgrades');

    const purchaseItem = (id) => {
        sendData('purchase-item', { id })
    }

    const purchaseResource = (id, amount) => {
        sendData('purchase-resource', { id, amount })
    }

    const setItemDetails = (id) => {
        if(!id) {
            setDetailOpened(null);
        } else {
            setDetailOpened(id);
        }
    }

    const [newUnlocks, setNewUnlocks] = useState({});

    useEffect(() => {
        const interval = setInterval(() => {
            sendData('query-new-unlocks-notifications', { suffix: 'shop', scope: 'shop' })
        }, 1000)
        return () => {
            clearInterval(interval)
        }
    }, [])

    onMessage('new-unlocks-notifications-shop', payload => {
        console.log('Received unlocks: ', payload);
        setNewUnlocks(payload);
    })

    return (
        <div className={'items-wrap'}>
            <div className={'items ingame-box'}>
                <div className={'menu-wrap'}>
                    <ul className={'menu'}>
                        <li className={`${selectedTab === 'upgrades' ? 'active' : ''}`} onClick={() => {setSelectedTab('upgrades'); setDetailOpened(null);}}>
                            <NewNotificationWrap isNew={newUnlocks?.['shop']?.items?.['upgrades']?.hasNew}>
                                <span>Upgrades</span>
                            </NewNotificationWrap>
                        </li>
                        <li className={`${selectedTab === 'items' ? 'active' : ''}`} onClick={() => {setSelectedTab('items');setDetailOpened(null);}}>
                            <NewNotificationWrap isNew={newUnlocks?.['shop']?.items?.['inventory']?.hasNew}>
                                <span>Items</span>
                            </NewNotificationWrap>
                        </li>
                    </ul>
                </div>
                {selectedTab === 'upgrades' ? (<ShopUpgrades setItemDetails={setItemDetails} purchaseItem={purchaseItem} newUnlocks={newUnlocks?.['shop']?.items?.['upgrades']?.items}/>) : null}
                {selectedTab === 'items' ? (<ShopItems setItemDetails={setItemDetails} purchaseItem={purchaseResource} newUnlocks={newUnlocks?.['shop']?.items?.['inventory']?.items}/>) : null}
            </div>

            <div className={'item-detail ingame-box detail-blade'}>
                {detailOpened ? (<ItemDetails itemId={detailOpened} category={selectedTab}/>) : null}
            </div>
        </div>

    )

}

export const ShopUpgrades = ({ setItemDetails, purchaseItem, newUnlocks }) => {

    const worker = useContext(WorkerContext);

    const { onMessage, sendData } = useWorkerClient(worker);
    const [itemsData, setItemsData] = useState({
        available: [],
        current: undefined
    });

    const [overlayPositions, setOverlayPositions] = useState([]);

    const handleFlash = (position) => {
        setOverlayPositions((prev) => [...prev, position]);
        setTimeout(() => {
            setOverlayPositions((prev) => prev.filter((p) => p !== position));
        }, 1000);
    };

    useEffect(() => {
        const interval = setInterval(() => {
            sendData('query-items-data', {});
        }, 100);
        return () => {
            clearInterval(interval);
        }
    }, [])

    onMessage('items-data', (items) => {
        setItemsData(items);
    })

    return (<div className={'items-cat'}>
        <PerfectScrollbar>
            <div className={'flex-container'}>
                {itemsData.available.map(item => <NewNotificationWrap id={`shop_${item.id}`} className={'narrow-wrapper'} isNew={newUnlocks?.[`shop_${item.id}`]?.hasNew}>
                    <ItemCard onFlash={handleFlash} key={item.id} {...item} onPurchase={purchaseItem} onShowDetails={setItemDetails}/>
                </NewNotificationWrap>)}
                {overlayPositions.map((position, index) => (
                    <FlashOverlay key={index} position={position} />
                ))}
            </div>
        </PerfectScrollbar>
    </div>)
}

export const ShopItems = ({ setItemDetails, purchaseItem, newUnlocks }) => {

    const worker = useContext(WorkerContext);

    const { onMessage, sendData } = useWorkerClient(worker);
    const [itemsData, setItemsData] = useState({
        available: [],
        current: undefined,
        purchaseMultiplier: 1,
    });

    const [overlayPositions, setOverlayPositions] = useState([]);

    const handleFlash = (position) => {
        console.log('Adding flash: ', position);
        setOverlayPositions((prev) => [...prev, position]);
        setTimeout(() => {
            setOverlayPositions((prev) => prev.filter((p) => p !== position));
        }, 1000);
    };

    useEffect(() => {
        const interval = setInterval(() => {
            sendData('query-items-resources-data', {});
        }, 100);
        return () => {
            clearInterval(interval);
        }
    }, [])

    const setPurchaseMultiplier = (amount) => {
        sendData('set-purchase-multiplier', { amount })
    }

    onMessage('items-resources-data', (items) => {
        setItemsData(items);
    })

    return (<div className={'items-cat'}>
        <div className={'heading flex-container'}>
            <p>Purchase X: </p>
            <ul className={'menu'}>
                <li className={`${itemsData.purchaseMultiplier === 1 ? 'active' : ''}`} onClick={() => setPurchaseMultiplier(1)}>
                    <span>1</span>
                </li>
                <li className={`${itemsData.purchaseMultiplier === 5 ? 'active' : ''}`} onClick={() => setPurchaseMultiplier(5)}>
                    <span>5</span>
                </li>
                <li className={`${itemsData.purchaseMultiplier === 10 ? 'active' : ''}`} onClick={() => setPurchaseMultiplier(10)}>
                    <span>10</span>
                </li>
                <li className={`${itemsData.purchaseMultiplier === 25 ? 'active' : ''}`} onClick={() => setPurchaseMultiplier(25)}>
                    <span>25</span>
                </li>
                <li className={`${itemsData.purchaseMultiplier === 100 ? 'active' : ''}`} onClick={() => setPurchaseMultiplier(100)}>
                    <span>100</span>
                </li>
                <li className={`${itemsData.purchaseMultiplier > 1000 ? 'active' : ''}`} onClick={() => setPurchaseMultiplier(1e+8)}>
                    <span>Max</span>
                </li>
            </ul>
        </div>
        <div className={'items-holder'}>
            <PerfectScrollbar>
                <div className={'flex-container'}>
                    {itemsData.available.map(item => <NewNotificationWrap id={`shop_${item.id}`} className={'narrow-wrapper'} isNew={newUnlocks?.[`shop_${item.id}`]?.hasNew}>
                        <ItemResourceCard onFlash={handleFlash} key={item.id} {...item} onPurchase={purchaseItem} onShowDetails={setItemDetails}/>
                    </NewNotificationWrap>)}
                    {overlayPositions.map((position, index) => (
                        <FlashOverlay key={index} position={position} />
                    ))}
                </div>
            </PerfectScrollbar>
        </div>
    </div>)
}

export const ItemCard = ({ id, name, level, max, affordable, isLeveled, onFlash, onPurchase, onShowDetails}) => {

    const elementRef = useRef(null);

    useFlashOnLevelUp(isLeveled, onFlash, elementRef);


    return (<div ref={elementRef} className={`card item flashable ${affordable.hardLocked ? 'hard-locked' : ''}  ${!affordable.isAffordable ? 'unavailable' : ''}`} onMouseEnter={() => onShowDetails(id)} onMouseLeave={() => onShowDetails(null)}>
        <div className={'head'}>
            <p className={'title'}>{name}</p>
            <span className={'level'}>{formatInt(level)}{max ? `/${formatInt(max)}` : ''}</span>
        </div>
        <div className={'bottom'}>
            <div className={'buttons'}>
                <button disabled={!affordable.isAffordable} onClick={() => onPurchase(id)}>Purchase</button>
            </div>
        </div>
    </div> )
}

export const ItemResourceCard = ({ id, name, purchaseMultiplier, level, max, affordable, isLeveled, onFlash, onPurchase, onShowDetails}) => {

    const elementRef = useRef(null);

    useFlashOnLevelUp(isLeveled, onFlash, elementRef);

    return (<div ref={elementRef} className={`icon-card item flashable ${affordable.hardLocked ? 'hard-locked' : ''}  ${!affordable.isAffordable ? 'unavailable' : ''}`} onMouseEnter={() => onShowDetails(id)} onMouseLeave={() => onShowDetails(null)} onClick={(e) => onPurchase(id, e.shiftKey ? 1e9 : purchaseMultiplier)}>
        <TippyWrapper
            content={<div className={'hint-popup'}>
                <p>{name}</p>
                <p>Press to buy x{formatInt(purchaseMultiplier)}. Hold Shift to by max</p>
            </div>}>
            <div className={'icon-content'}>
                <img src={`icons/resources/${id}.png`} className={'resource'} />
            </div>
        </TippyWrapper>

    </div> )
}

export const ItemDetails = ({itemId, category}) => {

    const worker = useContext(WorkerContext);

    const { onMessage, sendData } = useWorkerClient(worker);

    const [item, setDetailOpened] = useState(null);

    useEffect(() => {
        if(category === 'upgrades') {
            const interval = setInterval(() => {
                sendData('query-item-details', { id: itemId });
            }, 100);

            return () => {
                clearInterval(interval);
            }
        } else if(category === 'items'){
            const interval = setInterval(() => {
                sendData('query-item-resource-details', { id: itemId });
            }, 100);

            return () => {
                clearInterval(interval);
            }
        }

    }, [itemId])


    onMessage('item-details', (items) => {
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
                    <p>Cost: (x{formatInt(item.purchaseMultiplier)})</p>
                    <div className={'costs-wrap'}>
                        {Object.values(item.affordable.affordabilities || {}).map(aff => <ResourceCost affordabilities={aff}/>)}
                    </div>
                </div>
                {(item.potentialEffects?.length || item.currentEffects) ? (<div className={'block'}>
                    <p>Effects:</p>
                    <div className={'effects'}>
                        {item.currentEffects ?
                            (<ResourceComparison effects1={item.currentEffects} effects2={item.potentialEffects}/>)
                            : (<EffectsSection effects={item.potentialEffects} maxDisplay={10}/>)
                        }
                    </div>
                </div>) : null}
            </div>
        </PerfectScrollbar>
    )
}