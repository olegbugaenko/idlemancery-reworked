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

    return (
        <div className={'items-wrap'}>
            <div className={'items ingame-box'}>
                <div className={'menu-wrap'}>
                    <ul className={'menu'}>
                        <li className={`${selectedTab === 'upgrades' ? 'active' : ''}`} onClick={() => {setSelectedTab('upgrades'); setDetailOpened(null);}}><span>Upgrades</span></li>
                        <li className={`${selectedTab === 'items' ? 'active' : ''}`} onClick={() => {setSelectedTab('items');setDetailOpened(null);}}><span>Items</span></li>
                    </ul>
                </div>
                {selectedTab === 'upgrades' ? (<ShopUpgrades setItemDetails={setItemDetails} purchaseItem={purchaseItem}/>) : null}
                {selectedTab === 'items' ? (<ShopItems setItemDetails={setItemDetails} purchaseItem={purchaseResource}/>) : null}
            </div>

            <div className={'item-detail ingame-box detail-blade'}>
                {detailOpened ? (<ItemDetails itemId={detailOpened} category={selectedTab}/>) : null}
            </div>
        </div>

    )

}

export const ShopUpgrades = ({ setItemDetails, purchaseItem }) => {

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
                {itemsData.available.map(item => <ItemCard onFlash={handleFlash} key={item.id} {...item} onPurchase={purchaseItem} onShowDetails={setItemDetails}/>)}
                {overlayPositions.map((position, index) => (
                    <FlashOverlay key={index} position={position} />
                ))}
            </div>
        </PerfectScrollbar>
    </div>)
}

export const ShopItems = ({ setItemDetails, purchaseItem }) => {

    const worker = useContext(WorkerContext);

    const { onMessage, sendData } = useWorkerClient(worker);
    const [itemsData, setItemsData] = useState({
        available: [],
        current: undefined
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

    onMessage('items-resources-data', (items) => {
        setItemsData(items);
    })

    return (<div className={'items-cat'}>
        <PerfectScrollbar>
            <div className={'flex-container'}>
                {itemsData.available.map(item => <ItemResourceCard onFlash={handleFlash} key={item.id} {...item} onPurchase={purchaseItem} onShowDetails={setItemDetails}/>)}
                {overlayPositions.map((position, index) => (
                    <FlashOverlay key={index} position={position} />
                ))}
            </div>
        </PerfectScrollbar>
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

export const ItemResourceCard = ({ id, name, level, max, affordable, isLeveled, onFlash, onPurchase, onShowDetails}) => {

    const elementRef = useRef(null);

    useFlashOnLevelUp(isLeveled, onFlash, elementRef);

    return (<div ref={elementRef} className={`icon-card item flashable ${affordable.hardLocked ? 'hard-locked' : ''}  ${!affordable.isAffordable ? 'unavailable' : ''}`} onMouseEnter={() => onShowDetails(id)} onMouseLeave={() => onShowDetails(null)} onClick={(e) => onPurchase(id, e.shiftKey ? 1e9 : 1)}>
        <TippyWrapper
            content={<div className={'hint-popup'}>
                <p>{name}</p>
                <p>Press to buy. Hold Shift to by max</p>
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

    })


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
                    <p>Cost:</p>
                    <div className={'costs-wrap'}>
                        {Object.values(item.affordable.affordabilities || {}).map(aff => <ResourceCost affordabilities={aff}/>)}
                    </div>
                </div>
                <div className={'block'}>
                    <p>Effects:</p>
                    <div className={'effects'}>
                        <EffectsSection effects={item.potentialEffects} />
                    </div>
                </div>
            </div>
        </PerfectScrollbar>
    )
}