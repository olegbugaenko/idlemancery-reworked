import React, {useCallback, useContext, useEffect, useRef, useState} from "react";
import WorkerContext from "../../context/worker-context";
import {useWorkerClient} from "../../general/client";
import {formatInt, formatValue, secondsToString} from "../../general/utils/strings";
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

    const [ unlocks, setUnlocksData ] = useState(null);

    const purchaseItem = (id) => {
        sendData('purchase-item', { id })
    }

    const purchaseResource = (id, amount) => {
        sendData('purchase-resource', { id, amount })
    }

    const purchaseCourse = (id, flag) => {
        if(flag) {
            sendData('run-course', { id })
        } else {
            sendData('stop-course', { id })
        }
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
        sendData('query-new-unlocks-notifications', { suffix: 'shop', scope: 'shop' })
        sendData('query-unlocks', { prefix: 'shop' });
        const interval = setInterval(() => {
            sendData('query-new-unlocks-notifications', { suffix: 'shop', scope: 'shop' })
            sendData('query-unlocks', {});
        }, 1000)
        return () => {
            clearInterval(interval)
        }
    }, [])

    onMessage('unlocks-shop', (unlocks) => {
        setUnlocksData(unlocks);
    })

    onMessage('new-unlocks-notifications-shop', payload => {
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
                        {unlocks?.courses ? (<li className={`${selectedTab === 'courses' ? 'active' : ''}`} onClick={() => {
                            setSelectedTab('courses');
                            setDetailOpened(null);
                        }}>
                            <NewNotificationWrap isNew={newUnlocks?.['shop']?.items?.['courses']?.hasNew}>
                                <span>Courses</span>
                            </NewNotificationWrap>
                        </li>) : null}
                    </ul>
                </div>
                {selectedTab === 'upgrades' ? (<ShopUpgrades setItemDetails={setItemDetails} purchaseItem={purchaseItem} newUnlocks={newUnlocks?.['shop']?.items?.['upgrades']?.items}/>) : null}
                {selectedTab === 'items' ? (<ShopItems setItemDetails={setItemDetails} purchaseItem={purchaseResource} newUnlocks={newUnlocks?.['shop']?.items?.['inventory']?.items}/>) : null}
                {selectedTab === 'courses' ? (<CourseItems setItemDetails={setItemDetails} purchaseItem={purchaseCourse} newUnlocks={newUnlocks?.['shop']?.items?.['courses']?.items}/>) : null}
            </div>

            <div className={'item-detail ingame-box detail-blade'}>
                {detailOpened ? (<ItemDetails itemId={detailOpened} category={selectedTab}/>) : (<GeneralStats />)}
            </div>
        </div>

    )

}

export const ShopUpgrades = ({ setItemDetails, purchaseItem, newUnlocks }) => {

    const worker = useContext(WorkerContext);

    const { onMessage, sendData } = useWorkerClient(worker);
    const [itemsData, setItemsData] = useState({
        available: [],
        current: undefined,
        isAutomationUnlocked: false,
        showMaxed: false,
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

    const toggleAutopurchase = useCallback((id, flag) => {
        sendData('set-shop-autopurchase', { id, flag })
    })

    const toggleShowMaxed = useCallback((flag) => {
        sendData('set-shop-show-maxed', { flag })
    })

    return (<div className={'upgrades-wrap'}>
        <div className={'sub-heading'}>
            <label>
                <input type={'checkbox'} checked={itemsData.showMaxed} onChange={() => toggleShowMaxed(!itemsData.showMaxed)}/>
                Show purchased
            </label>
        </div>
        <div className={'items-cat'}>
            <PerfectScrollbar>
                <div className={'flex-container'}>
                    {itemsData.available.map(item => <NewNotificationWrap key={`shop_${item.id}`} id={`shop_${item.id}`} className={'narrow-wrapper'} isNew={newUnlocks?.all?.items?.[`shop_${item.id}`]?.hasNew}>
                        <ItemCard onFlash={handleFlash} key={item.id} {...item} onPurchase={purchaseItem} onShowDetails={setItemDetails} toggleAutopurchase={toggleAutopurchase} isAutomationUnlocked={itemsData.isAutomationUnlocked}/>
                    </NewNotificationWrap>)}
                    {overlayPositions.map((position, index) => (
                        <FlashOverlay key={index} position={position} />
                    ))}
                </div>
            </PerfectScrollbar>
        </div>
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
                    {itemsData.available.map(item => <NewNotificationWrap key={`shop_${item.id}`} id={`shop_${item.id}`} className={'narrow-wrapper'} isNew={newUnlocks?.all?.items?.[`shop_${item.id}`]?.hasNew}>
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


export const CourseItems = ({ setItemDetails, purchaseItem, newUnlocks }) => {

    const worker = useContext(WorkerContext);

    const { onMessage, sendData } = useWorkerClient(worker);
    const [itemsData, setItemsData] = useState({
        available: [],
        current: undefined,
        isAutomationUnlocked: false
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
            sendData('query-course-data', {});
        }, 100);
        return () => {
            clearInterval(interval);
        }
    }, [])

    onMessage('course-data', (items) => {
        setItemsData(items);
    })

    const toggleAutopurchase = useCallback((id, flag) => {
        sendData('set-course-autopurchase', { id, flag })
    })

    return (<div className={'items-cat'}>
        <PerfectScrollbar>
            <div className={'flex-container'}>
                {itemsData.available.map(item => <NewNotificationWrap key={`course_${item.id}`} id={`course_${item.id}`} className={'narrow-wrapper'} isNew={newUnlocks?.all?.items?.[`course_${item.id}`]?.hasNew}>
                    <CourseCard onFlash={handleFlash} key={item.id} {...item} onPurchase={purchaseItem} onShowDetails={setItemDetails} toggleAutopurchase={toggleAutopurchase} isAutomationUnlocked={itemsData.isAutomationUnlocked}/>
                </NewNotificationWrap>)}
                {overlayPositions.map((position, index) => (
                    <FlashOverlay key={index} position={position} />
                ))}
            </div>
        </PerfectScrollbar>
    </div>)
}

export const ItemCard = ({ id, name, level, max, affordable, isLeveled, isCapped, onFlash, onPurchase, onShowDetails, isAutoPurchase, toggleAutopurchase, isAutomationUnlocked}) => {

    const elementRef = useRef(null);

    useFlashOnLevelUp(isLeveled, onFlash, elementRef);


    return (<div ref={elementRef} className={`shop-card card item flashable ${affordable.hardLocked ? 'hard-locked' : ''}  ${!affordable.isAffordable ? 'unavailable' : ''} ${isCapped ? 'capped' : ''}`} onMouseEnter={() => onShowDetails(id)} onMouseLeave={() => onShowDetails(null)}>
        <div className={'head'}>
            <p className={'title'}>{name}</p>
            <span className={'level'}>{formatInt(level)}{max ? `/${formatInt(max)}` : ''}</span>
        </div>
        <div className={'bottom'}>
            <div className={'buttons'}>
                <button disabled={!affordable.isAffordable || isCapped} onClick={() => onPurchase(id)}>Purchase</button>
                {isAutomationUnlocked && !isCapped ? (<label className={'autobuy-label'}>
                    <input type={'checkbox'} checked={isAutoPurchase}
                           onChange={() => toggleAutopurchase(id, !isAutoPurchase)}/>
                    Autobuy
                </label>) : null}
            </div>
        </div>
    </div> )
}

export const ItemResourceCard = ({ id, name, purchaseMultiplier, level, max, amount, affordable, isLeveled, onFlash, onPurchase, onShowDetails}) => {

    const elementRef = useRef(null);

    useFlashOnLevelUp(isLeveled, onFlash, elementRef);

    return (<div ref={elementRef} className={`icon-card item flashable ${affordable.hardLocked ? 'hard-locked' : ''}  ${!affordable.isAffordable ? 'unavailable' : ''}`} onMouseEnter={() => onShowDetails(id)} onMouseLeave={() => onShowDetails(null)} onClick={(e) => onPurchase(id, e.shiftKey ? 1e9 : purchaseMultiplier)}>
        <TippyWrapper
            content={<div className={'hint-popup'}>
                <p>{name} {amount > 0 ? `(${formatInt(amount)} in inventory)` : ''}</p>
                <p>Press to buy x{formatInt(purchaseMultiplier)}. Hold Shift to by max</p>
            </div>}>
            <div className={'icon-content'}>
                <img src={`icons/resources/${id}.png`} className={'resource'} />
            </div>
        </TippyWrapper>

    </div> )
}


export const CourseCard = ({ toNext, id, efficiency, isRunning, name, level, progress, maxProgress, max, affordable, isLeveled, onFlash, onPurchase, onShowDetails, isAutoPurchase, toggleAutopurchase, isAutomationUnlocked}) => {

    const elementRef = useRef(null);

    useFlashOnLevelUp(isLeveled, onFlash, elementRef);


    return (<div ref={elementRef} className={`course-card card item flashable ${isRunning ? ' running' : ''} ${efficiency < 1 ? ' efficiency-dropped lower-eff' : ''}  ${affordable.hardLocked ? 'hard-locked' : ''}  ${!affordable.isAffordable ? 'unavailable' : ''}`} onMouseEnter={() => onShowDetails(id)} onMouseLeave={() => onShowDetails(null)}>
        <div className={'progress-bg'} style={{ width: `${100*progress/maxProgress}%`}}></div>
        <div className={'flex-container two-side-card'}>
            <div className={'left'}>
                <img src={`icons/courses/${id}.png`} className={'resource big'}/>
            </div>
            <div className={'right'}>
                <div className={'head'}>
                    <p className={'title'}>{name}</p>
                    <span className={'level'}>{formatInt(level)}{max ? `/${formatInt(max)}` : ''}</span>
                </div>
                <div>
                    {isRunning ? <span className={'to-next'}>ETA: {secondsToString(toNext)}</span> : null}
                {efficiency < 1 ? (<span className={'small-hint yellow'}>
                                        ({formatValue(100*efficiency)}%)
                                    </span> ) : ''}
                </div>
                <div className={'bottom'}>
                    <div className={'buttons'}>
                        <button disabled={!affordable.isAffordable} onClick={() => onPurchase(id, !isRunning)}>{isRunning ? 'Stop' : 'Start'}</button>
                        {isAutomationUnlocked ? (<label className={'autobuy-label'}>
                            <input type={'checkbox'} checked={isAutoPurchase}
                                   onChange={() => toggleAutopurchase(id, !isAutoPurchase)}/>
                            Autoresume
                        </label>) : null}
                    </div>
                </div>
            </div>
        </div>
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
        } else if(category === 'courses'){
            const interval = setInterval(() => {
                sendData('query-course-details', { id: itemId });
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
                    <div className={'heading flex-container'}>
                        <h4>{item.name}</h4>
                        <span className={'level-indicator'}>Level {item.level} {item.max ? `of ${item.max}` : null}</span>
                    </div>

                    <div className={'description'}>
                        {item.description}
                    </div>
                </div>
                <div className={'block'}>
                    <div className={'tags-container'}>
                        {item.tags.map(tag => (<div key={tag} className={'tag'}>{tag}</div> ))}
                    </div>
                </div>
                {item?.missingResource && item.entityEfficiency < 1 ? (<div className={'block'}>
                    <p className={'hint yellow'}>
                        This course is running {formatValue(100*item.entityEfficiency)}% efficiency due to missing {item?.missingResource?.name}
                    </p>
                </div> ) : null}
                {Object.values(item.affordable.affordabilities || {}).length ? (<div className={'block'}>
                    <p>Cost: (x{formatInt(item.purchaseMultiplier)})</p>
                    <div className={'costs-wrap'}>
                        {Object.values(item.affordable.affordabilities || {}).map(aff => <ResourceCost
                            key={aff.id ?? aff.name} affordabilities={aff}/>)}
                    </div>
                </div>) : null}
                {(item.potentialEffects?.length || item.currentEffects) ? (<div className={'block'}>
                    <p>Effects:</p>
                    <div className={'effects'}>
                        {item.currentEffects ?
                            (<ResourceComparison effects1={item.currentEffects} effects2={item.potentialEffects}/>)
                            : (<EffectsSection effects={item.potentialEffects} maxDisplay={10}/>)
                        }
                    </div>
                </div>) : null}
                {(item.learningEffects?.length) ? (<div className={'block'}>
                    <p>Learning Upkeep:</p>
                    <div className={'effects'}>
                        <EffectsSection effects={item.learningEffects} maxDisplay={10}/>
                    </div>
                    <p>Learning Duration: {secondsToString(item.maxProgress)}</p>
                </div>) : null}
            </div>
        </PerfectScrollbar>
    )
}

export const GeneralStats = ({ category }) => {

    const worker = useContext(WorkerContext);

    const { onMessage, sendData } = useWorkerClient(worker);

    const [item, setDetailOpened] = useState(null);

    useEffect(() => {
        sendData('query-general-shop-stats', { category });
        const interval = setInterval(() => {
            sendData('query-general-shop-stats', { category });
        }, 1000);

        return () => {
            clearInterval(interval);
        }

    }, [])


    onMessage('general-shop-stats', (items) => {
        setDetailOpened(items);
    })

    if(!item) return null;


    return (
        <PerfectScrollbar>
            <div className={'blade-inner'}>
                <div className={'block'}>
                    <h4>General Stats</h4>
                </div>
                <div className={'block'}>
                    {item.stats.map(stat => (<div className={'row flex-row'}>
                        <p>{stat.name}</p>
                        <p>{formatValue(stat.value)}</p>
                    </div> ))}
                </div>
                <div className={'block'}>
                    <p className={'hint'}>
                        Hover over specific item to see it details
                    </p>
                </div>
            </div>
        </PerfectScrollbar>
    )
}