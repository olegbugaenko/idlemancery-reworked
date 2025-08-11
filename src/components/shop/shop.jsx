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
import {NewNotificationWrap} from "../shared/new-notification-wrap.jsx";
import {useAppContext} from "../../context/ui-context";
import {CustomButton} from "../shared/buttons/custom-button.jsx";
import {AutomationIcon} from "../shared/buttons/automation-checkbox.jsx";
import {useTutorial} from "../../context/tutorial-context";
import {playSound} from "../../context/sounds/sound-manager";
import {FavoriteButton} from "../shared/favorite-button.jsx";
import RulesList from "../shared/rules-list.jsx";
import {cloneDeep} from "lodash";

export const Shop = ({}) => {
    const [detailOpened, setDetailOpened] = useState(null);
    const [editOpened, setEditOpened] = useState(null);

    const visibleDetailId = detailOpened || editOpened;

    const worker = useContext(WorkerContext);

    const { isMobile } = useAppContext();
    const [isDetailVisible, setDetailVisible] = useState(!isMobile);
    const { stepIndex, unlockNextById, jumpOver, currentTourId } = useTutorial();

    const { onMessage, sendData, removeMessage } = useWorkerClient(worker);

    const [ selectedTab, setSelectedTab ] = useState('upgrades');

    const [ unlocks, setUnlocksData ] = useState(null);

    const purchaseItem = (id) => {
        sendData('purchase-item', { id })
    }

    const purchaseResource = (id, amount) => {
        if(currentTourId === 'inventory' && id == 'inventory_brightleaf') {
            unlockNextById(8);
        }
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
        if(currentTourId === 'inventory' && [6,7].includes(stepIndex) && id !== 'inventory_brightleaf') {
            setDetailOpened('inventory_brightleaf');
            return;
        }
        if(selectedTab === 'upgrades') {
            sendData('set-monitored', { scope: 'effects', type: 'shop_upgrade', id });
        }
        if(!id) {
            setDetailOpened(null);
        } else {
            setDetailOpened(id);
            playSound('selection');
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

    useEffect(() => {
        onMessage('unlocks-shop', (unlocks) => {
            setUnlocksData(unlocks);
        });
        
        return () => {
            removeMessage('unlocks-shop');
        };
    }, []);

    useEffect(() => {
        onMessage('new-unlocks-notifications-shop', payload => {
            setNewUnlocks(payload);
        });
        
        return () => {
            removeMessage('new-unlocks-notifications-shop');
        };
    }, []);

    const onCloseDetails = useCallback((e) => {
        setDetailVisible(false);
        setItemDetails(null)
    }, []);

    if(currentTourId === 'inventory') {
        unlockNextById(2);
        if(selectedTab === 'items') {
            unlockNextById(3);
        }
    }

    return (
        <div className={'items-wrap'}>
            <div className={'items ingame-box'}>
                <div className={'menu-wrap'}>
                    <ul className={'menu'}>
                        <li className={`${selectedTab === 'upgrades' ? 'active' : ''}`} onClick={() => {setSelectedTab('upgrades'); setDetailOpened(null); setEditOpened(null);}}>
                            <NewNotificationWrap isNew={newUnlocks?.['shop']?.items?.['upgrades']?.hasNew}>
                                <span>Upgrades</span>
                            </NewNotificationWrap>
                        </li>
                        <li className={`${selectedTab === 'items' ? 'active' : ''}`} onClick={() => {setSelectedTab('items');setDetailOpened(null); setEditOpened(null);}}>
                            <NewNotificationWrap isNew={newUnlocks?.['shop']?.items?.['inventory']?.hasNew}>
                                <span id={'shop-items-tab'}>Items</span>
                            </NewNotificationWrap>
                        </li>
                        {unlocks?.courses ? (<li className={`${selectedTab === 'courses' ? 'active' : ''}`} onClick={() => {
                            setSelectedTab('courses');
                            setDetailOpened(null);
                            setEditOpened(null);
                        }}>
                            <NewNotificationWrap isNew={newUnlocks?.['shop']?.items?.['courses']?.hasNew}>
                                <span>Courses</span>
                            </NewNotificationWrap>
                        </li>) : null}
                    </ul>
                    {isMobile ? (<div>
                        <span className={'highlighted-span'} onClick={() => setDetailVisible(true)}>Info</span>
                    </div>) : null}
                </div>
                {selectedTab === 'upgrades' ? (<ShopUpgrades isMobile={isMobile} setItemDetails={setItemDetails} purchaseItem={purchaseItem} newUnlocks={newUnlocks?.['shop']?.items?.['upgrades']?.items}/>) : null}
                {selectedTab === 'items' ? (<ShopItems
                    isMobile={isMobile}
                    setItemDetails={setItemDetails}
                    toggleEditedItem={(id) =>
                        setEditOpened(prev => (prev === id ? null : id))
                    }
                    purchaseItem={purchaseResource}
                    newUnlocks={newUnlocks?.['shop']?.items?.['inventory']?.items}
                />) : null}
                {selectedTab === 'courses' ? (<CourseItems isMobile={isMobile} setItemDetails={setItemDetails} purchaseItem={purchaseCourse} newUnlocks={newUnlocks?.['shop']?.items?.['courses']?.items}/>) : null}
            </div>

            {(!isMobile || isDetailVisible || detailOpened) ? (<div className={'item-detail ingame-box detail-blade'}>
                {visibleDetailId ? (<ItemDetails
                    itemId={visibleDetailId}
                    category={selectedTab}
                    onClose={onCloseDetails}
                    onPurchase={selectedTab === 'items' ? purchaseResource : undefined}
                    isEditMode={editOpened && (selectedTab === 'items' && editOpened === visibleDetailId)}
                    editId={editOpened}
                    onCloseEdit={() => setEditOpened(null)}
                />) : (<GeneralStats setDetailVisible={setDetailVisible}/>)}
            </div>) : null}
        </div>

    )

}

export const ShopUpgrades = ({ setItemDetails, purchaseItem, newUnlocks, isMobile }) => {

    const worker = useContext(WorkerContext);

    const { onMessage, sendData, removeMessage } = useWorkerClient(worker);
    const [itemsData, setItemsData] = useState({
        available: [],
        current: undefined,
        isAutomationUnlocked: false,
        showMaxed: false,
        unlocked: {
            total: 0,
            totalComplete: 0,
        }
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

    useEffect(() => {
        onMessage('items-data', (items) => {
            setItemsData(items);
        });
        
        return () => {
            removeMessage('items-data');
        };
    }, []);

    const toggleAutopurchase = useCallback((id, flag) => {
        sendData('set-shop-autopurchase', { id, flag })
    })

    const toggleShowMaxed = useCallback((flag) => {
        sendData('set-shop-show-maxed', { flag })
    })

    return (<div className={'upgrades-wrap'}>
        <div className={'sub-heading'}>
            <div className={'complete'}>
                <p>Upgrades Completed: {itemsData.unlocked.totalComplete} / {itemsData.unlocked.total}</p>
            </div>
            <label>
                <input type={'checkbox'} checked={itemsData.showMaxed} onChange={() => toggleShowMaxed(!itemsData.showMaxed)}/>
                Show purchased
            </label>
        </div>
        <div className={'items-cat'}>
            <PerfectScrollbar>
                <div className={'flex-container'}>
                    {itemsData.available.map(item => <NewNotificationWrap key={`shop_${item.id}`} id={`shop_${item.id}`} className={'narrow-wrapper'} isNew={newUnlocks?.all?.items?.[`shop_${item.id}`]?.hasNew}>
                        <ItemCard isMobile={isMobile} onFlash={handleFlash} key={item.id} {...item} onPurchase={purchaseItem} onShowDetails={setItemDetails} toggleAutopurchase={toggleAutopurchase} isAutomationUnlocked={itemsData.isAutomationUnlocked}/>
                    </NewNotificationWrap>)}
                    {overlayPositions.map((position, index) => (
                        <FlashOverlay key={index} position={position} />
                    ))}
                </div>
            </PerfectScrollbar>
        </div>
    </div>)
}

export const ShopItems = ({ setItemDetails, toggleEditedItem, purchaseItem, newUnlocks, isMobile }) => {

    const worker = useContext(WorkerContext);

    const { onMessage, sendData, removeMessage } = useWorkerClient(worker);
    const [itemsData, setItemsData] = useState({
        available: [],
        current: undefined,
        purchaseMultiplier: 1,
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
            sendData('query-items-resources-data', {});
        }, 100);
        return () => {
            clearInterval(interval);
        }
    }, [])

    const setPurchaseMultiplier = (amount) => {
        sendData('set-purchase-multiplier', { amount })
    }

    useEffect(() => {
        onMessage('items-resources-data', (items) => {
            setItemsData(items);
        });
        
        return () => {
            removeMessage('items-resources-data');
        };
    }, []);

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
                        <ItemResourceCard
                            isMobile={isMobile}
                            onFlash={handleFlash}
                            key={item.id}
                            {...item}
                            onPurchase={purchaseItem}
                            onShowDetails={setItemDetails}
                            toggleEditedItem={toggleEditedItem}
                        />
                    </NewNotificationWrap>)}
                    {overlayPositions.map((position, index) => (
                        <FlashOverlay key={index} position={position} />
                    ))}
                </div>
            </PerfectScrollbar>
        </div>
    </div>)
}


export const CourseItems = ({ setItemDetails, purchaseItem, newUnlocks, isMobile }) => {

    const worker = useContext(WorkerContext);

    const { onMessage, sendData, removeMessage } = useWorkerClient(worker);
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

    useEffect(() => {
        onMessage('course-data', (items) => {
            setItemsData(items);
        });
        
        return () => {
            removeMessage('course-data');
        };
    }, []);

    const toggleAutopurchase = useCallback((id, flag) => {
        sendData('set-course-autopurchase', { id, flag })
    })

    return (<div className={'items-cat'}>
        <PerfectScrollbar>
            <div className={'flex-container'}>
                {itemsData.available.map(item => <NewNotificationWrap key={`course_${item.id}`} id={`course_${item.id}`} className={'narrow-wrapper'} isNew={newUnlocks?.all?.items?.[`course_${item.id}`]?.hasNew}>
                    <CourseCard isMobile={isMobile} onFlash={handleFlash} key={item.id} {...item} onPurchase={purchaseItem} onShowDetails={setItemDetails} toggleAutopurchase={toggleAutopurchase} isAutomationUnlocked={itemsData.isAutomationUnlocked}/>
                </NewNotificationWrap>)}
                {overlayPositions.map((position, index) => (
                    <FlashOverlay key={index} position={position} />
                ))}
            </div>
        </PerfectScrollbar>
    </div>)
}

export const ItemCard = ({ id, name, level, max, affordable, isLeveled, isCapped, onFlash, onPurchase, onShowDetails, isAutoPurchase, toggleAutopurchase, isAutomationUnlocked, isMobile}) => {

    const elementRef = useRef(null);

    useFlashOnLevelUp(isLeveled, onFlash, elementRef);


    return (<div ref={elementRef} className={`shop-card shop-upgrade card item flashable ${affordable.hardLocked ? 'hard-locked' : ''}  ${!affordable.isAffordable ? 'unavailable' : ''} ${isCapped ? 'capped' : ''}`} onMouseEnter={() => {if(!isMobile) onShowDetails(id)}} onMouseLeave={() => {if(!isMobile) onShowDetails(null)}} onClick={() => {if(isMobile) onShowDetails(id)}}>
        <div className={'head'}>
            <p className={'title'}>{name}</p>
            <span className={'level'}>{formatInt(level)}{max ? `/${formatInt(max)}` : ''}</span>
        </div>
        <div className={'bottom'}>
            <div className={'buttons'}>
                <div className={'leftwise'}>
                <CustomButton
                    iconId={'icon_upgrade_v2'}
                    disabled={!affordable.isAffordable || isCapped}
                    className={`purchase-button medium-sm ${isCapped ? 'capped' : ''}`}
                    style={{ '--progress': `${affordable.percentage*100}%` }}
                    onClick={(e) => {e.stopPropagation(); e.preventDefault(); onPurchase(id)}}
                >Purchase</CustomButton>
                {isAutomationUnlocked && !isCapped ? (<AutomationIcon
                    value={isAutoPurchase}
                    className={'medium-sm'}
                    onClick={(e) => {e.stopPropagation(); e.preventDefault(); toggleAutopurchase(id, !isAutoPurchase)}}
                >{isAutoPurchase ? 'Autopurchase is turned on. Click to turn it off' : 'Autopurchase is turned off. Click to turn it on'}</AutomationIcon>) : null}
                </div>
            </div>
        </div>
    </div> )
}

export const ItemResourceCard = ({ id, name, purchaseMultiplier, stock, level, max, amount, affordable, isLeveled, onFlash, onPurchase, onShowDetails, toggleEditedItem, isMobile}) => {

    const elementRef = useRef(null);

    useFlashOnLevelUp(isLeveled, onFlash, elementRef);

    return (<div
        id={`shop-item-resource-${id}`}
        ref={elementRef}
        className={`icon-card purchaseable-resource item flashable ${affordable.hardLocked ? 'hard-locked' : ''}  ${!affordable.isAffordable ? 'unavailable' : ''}`}
        onMouseEnter={() => isMobile ? null : onShowDetails(id)}
        onMouseLeave={() => isMobile ? null : onShowDetails(null)}
        onClick={(e) => {
            toggleEditedItem(id)
        }}
        onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onPurchase(id, e.shiftKey ? 1e9 : purchaseMultiplier)
        }}
    >
        <TippyWrapper
            content={<div className={'hint-popup'}>
                <p>{name} {amount > 0 ? `(${formatInt(amount)} in inventory)` : ''}</p>
                <p>Press to buy x{formatInt(purchaseMultiplier)}. Hold Shift to by max</p>
            </div>}>
            <div className={'icon-content'}>
                <img src={`icons/resources/${id}.png`} className={'resource'} />
                <span className={'level'}>{formatValue(stock)}</span>
            </div>
        </TippyWrapper>

    </div> )
}


export const CourseCard = ({ toNext, id, efficiency, isRunning, name, level, progress, maxProgress, max, affordable, isLeveled, onFlash, onPurchase, onShowDetails, isAutoPurchase, toggleAutopurchase, isAutomationUnlocked, isMobile, isFavorite}) => {

    const elementRef = useRef(null);

    useFlashOnLevelUp(isLeveled, onFlash, elementRef);


    return (<div
        ref={elementRef}
        className={`course-card card shop-course item flashable ${isRunning ? ' running' : ''} ${efficiency < 1 ? ' efficiency-dropped lower-eff' : ''}  ${affordable.hardLocked ? 'hard-locked' : ''}  ${!affordable.isAffordable ? 'unavailable' : ''}`}
        onMouseEnter={() => isMobile ? null : onShowDetails(id)}
        onMouseLeave={() => isMobile ? null : onShowDetails(null)}
        onClick={(e) => {
            if(isMobile) {
                onShowDetails(id)
            } else {
                onPurchase(id, 1)
            }
        }}>
        <div className={'progress-bg'} style={{ width: `${100*Math.min(1., progress/maxProgress)}%`}}></div>
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
                <div className={'bottom padded-left'}>
                    <div className={'buttons'}>
                        <CustomButton
                            disabled={!affordable.isAffordable}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onPurchase(id, !isRunning)
                            }}
                            iconId={isRunning ? 'pause' : 'run'}
                            className={'icon-content interface-icon small clickable-icon'}
                        >
                            {isRunning ? 'Stop Course' : 'Start Course'}
                        </CustomButton>
                        <FavoriteButton type="courses" id={id} isFavorite={isFavorite} className="course-favorite-btn icon-content interface-icon small clickable-icon" />
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

export const ItemDetails = ({itemId, category, editId, onPurchase, isEditMode, onCloseEdit}) => {

    const worker = useContext(WorkerContext);

    const { isMobile } = useAppContext();

    const { onMessage, sendData, removeMessage } = useWorkerClient(worker);

    const [item, setDetailOpened] = useState(null);

    const { stepIndex, unlockNextById, jumpOver, currentTourId } = useTutorial();

    const [autopurchase, setAutopurchase] = useState(null);

    const [isChanged, setChanged] = useState(false);

    const [resources, setResources] = useState([]);

    useEffect(() => {
        sendData('query-all-resources', {});
    }, [])

    useEffect(() => {
        onMessage('all-resources', (payload) => {
            setResources(payload);
        });
        
        return () => {
            removeMessage('all-resources');
        };
    }, []);

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

    useEffect(() => {
        onMessage('item-details', (items) => {
            setDetailOpened(items);
        });
        
        return () => {
            removeMessage('item-details');
        };
    }, []);

    useEffect(() => {
        if(category === 'items' && editId) {
            setAutopurchase(item?.autopurchase);
        } else {
            setAutopurchase(null);
        }

    },[category, editId]) // Pass directly editId

    if(!itemId || !item) return null;

    const setAutopurchasePattern = (pattern) => {
        setAutopurchase(prev => {
            const newAutopurchase = cloneDeep(prev);
            if(!newAutopurchase.rules) {
                newAutopurchase.rules = [];
            }
            newAutopurchase.pattern = pattern;
            setChanged(true);
            return newAutopurchase;
        })
    }

    const addAutopurchaseRule = () => {
        setAutopurchase(prev => {
            const newAutopurchase = cloneDeep(prev);
            if(!newAutopurchase.rules) {
                newAutopurchase.rules = [];
            }
            newAutopurchase.rules.push({
                resource_id: resources[0].id,
                condition: 'less_or_eq',
                value_type: 'percentage',
                value: 50,
            });
            setChanged(true);
            return newAutopurchase;
        })
    }

    const setAutopurchaseRuleValue = (index, key, value) => {
        setAutopurchase(prev => {
            const newAutopurchase = cloneDeep(prev);
            if (!newAutopurchase.rules?.[index]) {
                return newAutopurchase;
            }
            newAutopurchase.rules[index][key] = value;
            setChanged(true);
            return newAutopurchase;
        })
    }

    const deleteAutopurchaseRule = (index) => {
        setAutopurchase(prev => {
            const newEdit = cloneDeep(prev);
            newEdit.rules.splice(index, 1)
            setChanged(true);
            return newEdit
        })
    }

    const setPurchaseMultiplierValue = (purchaseMultiplier) => {
        setAutopurchase(prev => {
            const newAutopurchase = cloneDeep(prev);
            if(!newAutopurchase.rules) {
                newAutopurchase.rules = [];
            }
            newAutopurchase.purchaseMultiplier = purchaseMultiplier;
            setChanged(true);
            return newAutopurchase;
        })
    }

    const setReservedCoinsValue = (reserved) => {
        setAutopurchase(prev => {
            const newAutopurchase = cloneDeep(prev);
            if(!newAutopurchase.rules) {
                newAutopurchase.rules = [];
            }
            newAutopurchase.reserved = reserved;
            setChanged(true);
            return newAutopurchase;
        })
    }

    const toggleAutopurchase = () => {
        setAutopurchase(prev => {
            const newAutopurchase = cloneDeep(prev);
            if(!newAutopurchase.rules) {
                newAutopurchase.rules = [];
            }
            newAutopurchase.isEnabled = !prev.isEnabled;
            setChanged(true);
            return newAutopurchase;
        })
    }

    const saveAutopurchase = () => {
        sendData('save-shop-resource-settings', { id: item.id, autopurchase })
    }

    if(currentTourId === 'inventory' && itemId === 'inventory_brightleaf') {
        unlockNextById(5);
    }

    const autopurchaseDisplayed = item?.isAutomationUnlocked ? (isEditMode ? autopurchase : item?.autopurchase) : null;

    return (
        <>
            <div className={'blade-outer'}>
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
                        {Object.values(item.affordable.affordabilities || {}).length ? (<div className={'block price-section'}>
                            <p>Cost: (x{formatInt(item.purchaseMultiplier)})</p>
                            <div className={'costs-wrap'}>
                                {Object.values(item.affordable.affordabilities || {}).map(aff => <ResourceCost
                                    key={aff.id ?? aff.name} affordabilities={aff}/>)}
                            </div>
                        </div>) : null}
                        {(item.potentialEffects?.length || item.currentEffects) ? (<div className={'block effects-section'}>
                            <p>Effects:</p>
                            <div className={'effects'}>
                                {item.currentEffects ?
                                    (<ResourceComparison effects1={item.currentEffects} effects2={item.potentialEffects}/>)
                                    : (<EffectsSection effects={item.potentialEffects} maxDisplay={10}/>)
                                }
                            </div>
                        </div>) : null}
                        {(item.potentialLastingEffects?.length) ? (<div className={'block lasting-effects-section'}>
                            <p>Lasting Effects: {secondsToString(item.duration)}</p>
                            <div className={'effects'}>
                                <EffectsSection effects={item.potentialLastingEffects} maxDisplay={10}/>
                            </div>
                        </div>) : null}
                        {(item.learningEffects?.length) ? (<div className={'block'}>
                            <p>Learning Upkeep:</p>
                            <div className={'effects'}>
                                <EffectsSection effects={item.learningEffects} maxDisplay={10}/>
                            </div>
                            <p>Learning Duration: {secondsToString(item.maxProgress)}</p>
                        </div>) : null}
                        {autopurchaseDisplayed ? (
                            <div className={'autoconsume-setting block'}>
                                    <div className={'rules-header flex-container'}>
                                        <p>Autopurchase rules: {autopurchaseDisplayed?.rules?.length ? null : 'None'}</p>
                                        <label>
                                            <input type={'checkbox'} checked={autopurchaseDisplayed?.isEnabled ?? undefined} onChange={toggleAutopurchase}/>
                                            {autopurchaseDisplayed?.isEnabled ? ' ON' : ' OFF'}
                                        </label>
                                        {isEditMode ? (<button onClick={addAutopurchaseRule}>Add rule (AND)</button>) : null}
                                    </div>

                                    <RulesList
                                        prefix={'autopurchase'}
                                        isEditing={isEditMode}
                                        rules={autopurchaseDisplayed?.rules || []}
                                        resources={resources}
                                        pattern={autopurchaseDisplayed?.pattern}
                                        deleteRule={deleteAutopurchaseRule}
                                        setRuleValue={setAutopurchaseRuleValue}
                                        setPattern={setAutopurchasePattern}
                                        isAutoCheck={autopurchaseDisplayed?.isEnabled}
                                    />
                                    <div className={'autoconsume-amount flex-container'}>
                                        <p>Reserved Coins:</p>
                                        {isEditMode ? <input type={'number'} onChange={e => setReservedCoinsValue(+e.target.value)}
                                                            value={autopurchaseDisplayed?.reserved || 0}/> : <span>{formatValue(autopurchaseDisplayed?.reserved || 0)}</span>}
                                    </div>
                                    <div className={'autoconsume-amount flex-container'}>
                                        <p>Purchase Mult:</p>
                                        {isEditMode ? <input type={'number'} onChange={e => setPurchaseMultiplierValue(Math.max(+(e.target.value ?? 1), 1))}
                                                            value={autopurchaseDisplayed?.purchaseMultiplier || 1}/> : <span>{formatValue(autopurchaseDisplayed?.purchaseMultiplier || 1)}</span>}
                                    </div>
                                </div>
                        ) : null}
                    </div>
                </PerfectScrollbar>
            </div>
            {(isEditMode || isMobile) ? (<div className={'buttons flex-container main-buttons'}>
                <button className={'primary-action'} onClick={saveAutopurchase}>Save</button>
                    {onPurchase ? (<>
                    {item.purchaseMultiplier > 1 ? (<button onClick={() => onPurchase(item.id, item.purchaseMultiplier)}>Purchase
                        x{formatInt(item.purchaseMultiplier)}</button>) : <button onClick={() => onPurchase(item.id)}>Purchase</button>}
                    </>) : null}
                <button className={'warning-action'} onClick={onCloseEdit}>Cancel</button>
            </div>) : null}
        </>
    )
}

export const GeneralStats = ({ category, setDetailVisible }) => {

    const worker = useContext(WorkerContext);

    const { isMobile } = useAppContext();

    const { onMessage, sendData, removeMessage } = useWorkerClient(worker);

    const [item, setDetailOpened] = useState(null);

    useEffect(() => {
        sendData('query-general-shop-stats', { category });
        const interval = setInterval(() => {
            sendData('query-general-shop-stats', { category });
        }, 1000);

        return () => {
            clearInterval(interval);
        }

    }, [category])

    useEffect(() => {
        onMessage('general-shop-stats', (items) => {
            setDetailOpened(items);
        });
        
        return () => {
            removeMessage('general-shop-stats');
        };
    }, []);

    if(!item) return null;

    return (
        <PerfectScrollbar>
            <div className={'blade-inner'}>
                <div className={'block'}>
                    <h4>General Stats</h4>
                </div>
                <div className={'block'}>
                    {item.stats?.map(stat => (<div className={'row flex-row'} key={stat.name}>
                        <TippyWrapper content={<div className={'hint-popup'}><p>{stat.description}</p></div> }>
                            <p>{stat.name}</p>
                        </TippyWrapper>
                        <p>{formatValue(stat.value)}</p>
                    </div> ))}
                </div>
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