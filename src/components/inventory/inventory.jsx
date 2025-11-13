import React, {useCallback, useContext, useEffect, useMemo, useRef, useState} from "react";
import WorkerContext from "../../context/worker-context";
import {useWorkerClient} from "../../general/client";
import {formatInt, formatValue, secondsToString} from "../../general/utils/strings";
import PerfectScrollbar from "react-perfect-scrollbar";
import {EffectsSection} from "../shared/effects-section.jsx";
import CircularProgress from "../shared/circular-progress.jsx";
import {FlashOverlay} from "../layout/flash-overlay.jsx";
import {useFlashOnLevelUp} from "../../general/hooks/flash";
import {isOverTippyEvent, TippyWrapper} from "../shared/tippy-wrapper.jsx";
import RulesList from "../shared/rules-list.jsx";
import {cloneDeep} from "lodash";
import {BreakDown} from "../layout/sidebar.jsx";
import {ResourceComparison} from "../shared/resource-comparison.jsx";
import {NewNotificationWrap} from "../shared/new-notification-wrap.jsx";
import StatRow from "../shared/stat-row.jsx";
import {SearchField} from "../shared/search-field.jsx";
import {useAppContext} from "../../context/ui-context";
import {PinResource} from "../shared/pin-resource.jsx";
import {CustomButton} from "../shared/buttons/custom-button.jsx";
import {useModal} from "../../general/components/modal/index.jsx";
import {HowToSign} from "../shared/how-to-sign.jsx";
import {useTutorial} from "../../context/tutorial-context";
import {playSound} from "../../context/sounds/sound-manager";


const INVENTORY_SEARCH_SCOPES = [{
    id: 'name',
    label: 'Name',
},{
    id: 'tags',
    label: 'Tags'
},{
    id: 'resources',
    label: 'resources'
},{
    id: 'effects',
    label: 'effects'
}]

const areArraysEqualByKey = (prev = [], next = [], key) => {
    const prevList = prev ?? [];
    const nextList = next ?? [];
    if(prevList === nextList) {
        return true;
    }
    if(prevList.length !== nextList.length) {
        return false;
    }
    for(let i = 0; i < prevList.length; i += 1) {
        const prevValue = key ? prevList[i]?.[key] : prevList[i];
        const nextValue = key ? nextList[i]?.[key] : nextList[i];
        if(prevValue !== nextValue) {
            return false;
        }
    }
    return true;
};

const hasMeaningfulItemChanges = (prevItem, nextItem) => {
    if(!prevItem) {
        return true;
    }
    if(prevItem.id !== nextItem.id) {
        return true;
    }
    const comparableKeys = ['amount', 'balance', 'eta', 'cooldownProg', 'cooldown', 'isConsumed', 'isConsumable', 'allowMultiConsume', 'isRare', 'isRareIngredient'];
    if(comparableKeys.some(key => prevItem[key] !== nextItem[key])) {
        return true;
    }
    if(prevItem.name !== nextItem.name) {
        return true;
    }
    if(!areArraysEqualByKey(prevItem.usages, nextItem.usages, 'id')) {
        return true;
    }
    if(!areArraysEqualByKey(prevItem.usagesFor, nextItem.usagesFor, 'id')) {
        return true;
    }
    if(prevItem.breakDown !== nextItem.breakDown) {
        return true;
    }
    return false;
};

const mergeInventoryItems = (nextItems = [], prevItems = []) => {
    if(!prevItems.length) {
        return nextItems;
    }
    const prevMap = new Map(prevItems.map(item => [item.id, item]));
    let mutated = nextItems.length !== prevItems.length;
    const merged = nextItems.map(item => {
        const prevItem = prevMap.get(item.id);
        if(prevItem && !hasMeaningfulItemChanges(prevItem, item)) {
            return prevItem;
        }
        mutated = true;
        return item;
    });
    return mutated ? merged : prevItems;
};

const hasCategoryChanges = (prevCategory, nextCategory) => {
    if(!prevCategory) {
        return true;
    }
    if(prevCategory.id !== nextCategory.id) {
        return true;
    }
    if(prevCategory.name !== nextCategory.name) {
        return true;
    }
    if(prevCategory.isSelected !== nextCategory.isSelected) {
        return true;
    }
    const prevLength = prevCategory.items?.length ?? 0;
    const nextLength = nextCategory.items?.length ?? 0;
    return prevLength !== nextLength;
};

const mergeCategories = (nextCategories = [], prevCategories = []) => {
    if(!prevCategories.length) {
        return nextCategories;
    }
    const prevMap = new Map(prevCategories.map(category => [category.id, category]));
    let mutated = nextCategories.length !== prevCategories.length;
    const merged = nextCategories.map(category => {
        const prevCategory = prevMap.get(category.id);
        if(prevCategory && !hasCategoryChanges(prevCategory, category)) {
            return prevCategory;
        }
        mutated = true;
        return category;
    });
    return mutated ? merged : prevCategories;
};

const areSearchDataEqual = (prevSearch = {}, nextSearch = {}) => {
    if(prevSearch === nextSearch) {
        return true;
    }
    if((prevSearch?.search ?? '') !== (nextSearch?.search ?? '')) {
        return false;
    }
    return areArraysEqualByKey(prevSearch?.selectedScopes ?? [], nextSearch?.selectedScopes ?? []);
};

const EFFECT_KEYS = ['bargaining', 'bargaining_mod', 'shop_max_stock', 'shop_stock_renew_rate'];

const areEffectStatsEqual = (prevDetails = {}, nextDetails = {}) => {
    if(prevDetails === nextDetails) {
        return true;
    }
    return EFFECT_KEYS.every(key => {
        const prev = prevDetails?.[key];
        const next = nextDetails?.[key];
        if(prev === next) {
            return true;
        }
        if(!prev || !next) {
            return false;
        }
        return prev.value === next.value && prev.isMultiplier === next.isMultiplier;
    });
};

const mergeInventoryState = (prevState, nextState) => {
    if(!prevState || (!prevState.available?.length && !prevState.itemCategories?.length)) {
        return nextState;
    }
    const mergedAvailable = mergeInventoryItems(nextState.available, prevState.available);
    const mergedCategories = mergeCategories(nextState.itemCategories, prevState.itemCategories);
    const mergedSearchData = areSearchDataEqual(prevState.searchData, nextState.searchData) ? prevState.searchData : nextState.searchData;
    const mergedDetails = areEffectStatsEqual(prevState.details, nextState.details) ? prevState.details : nextState.details;
    const didChange =
        mergedAvailable !== prevState.available ||
        mergedCategories !== prevState.itemCategories ||
        mergedSearchData !== prevState.searchData ||
        mergedDetails !== prevState.details ||
        prevState.selectedFilterId !== nextState.selectedFilterId ||
        prevState.current !== nextState.current ||
        prevState.automationUnlocked !== nextState.automationUnlocked;
    if(!didChange) {
        return prevState;
    }
    return {
        ...nextState,
        available: mergedAvailable,
        itemCategories: mergedCategories,
        searchData: mergedSearchData,
        details: mergedDetails,
    };
};

export const Inventory = ({}) => {

    const worker = useContext(WorkerContext);
    const { isMobile } = useAppContext();
    const [isDetailVisible, setDetailVisible] = useState(!isMobile);
    const { stepIndex, unlockNextById, jumpOver, currentTourId } = useTutorial();

    const { onMessage, sendData, removeMessage } = useWorkerClient(worker);
    const { confirm } = useModal();
    const [inventoryData, setItemsData] = useState({
        available: [],
        current: undefined,
        itemCategories: [],
        selectedFilterId: 'all',
        automationUnlocked: false,
        details: {},
        searchData: {
            search: ''
        }
    });
    const [detailOpenedId, setDetailOpenedId] = useState(null); // here should be object containing id and rules
    const [viewedOpenedId, setViewedOpenedId] = useState(null);
    const [editData, setEditData] = useState(null);
    const [viewedData, setViewedData] = useState(null);
    const [resources, setResources] = useState([]);
    const [isChanged, setChanged] = useState(false);
    const [newUnlocks, setNewUnlocks] = useState({});

    useEffect(() => {
        const id = viewedOpenedId ?? detailOpenedId?.id;
        if(id !== null) {
            if(!viewedOpenedId && isChanged) {
                return;
            }
            sendData('query-inventory-details', { id });
        }
    }, [viewedOpenedId, detailOpenedId])

    // Clear viewedData when viewedOpenedId becomes null
    useEffect(() => {
        if (!viewedOpenedId) {
            setViewedData(null);
        }
    }, [viewedOpenedId])

    useEffect(() => {
        const interval = setInterval(() => {
            sendData('query-inventory-data', {});
        }, 100);
        sendData('query-all-resources', { prefix: 'inventory'});
        const interval2 = setInterval(() => {
            sendData('query-new-unlocks-notifications', { suffix: 'inventory', scope: 'inventory' })
        }, 1000)
        return () => {
            clearInterval(interval);
            clearInterval(interval2)
        }
    }, [])

    useEffect(() => {
        onMessage('new-unlocks-notifications-inventory', payload => {
            setNewUnlocks(payload);
        });
        
        return () => {
            removeMessage('new-unlocks-notifications-inventory');
        };
    }, []);

    useEffect(() => {
        onMessage('all-resources-inventory', (payload) => {
            setResources(payload);
        });
        
        return () => {
            removeMessage('all-resources');
        };
    }, []);

    useEffect(() => {
        onMessage('inventory-details', (payload) => {
            if(viewedOpenedId) {
                setViewedData(payload);
            } else if(detailOpenedId) {
                setEditData(payload);
                setViewedData(null);
            } else {
                setViewedData(null);
                setEditData(null);
            }
        });
        
        return () => {
            removeMessage('inventory-details');
        };
    }, [viewedOpenedId, detailOpenedId]);

    useEffect(() => {
        onMessage('inventory-data', (inventory) => {
            setItemsData(prev => mergeInventoryState(prev, inventory));
        });

        return () => {
            removeMessage('inventory-data');
        };
    }, []);

    // Handle sell-details messages
    useEffect(() => {
        onMessage("sell-details", (payload) => {
            if (editData && payload.id === editData.id) {
                setEditData((prevData) => ({
                    ...prevData,
                    isSellable: payload.isSellable,
                    maxSell: payload.maxSell,
                }));
            }
        });
        
        return () => {
            removeMessage('sell-details');
        };
    }, [editData]);

    // Set up interval to query sell details
    useEffect(() => {
        let interval = null;
        if (detailOpenedId && editData && editData.isSellable) {
            interval = setInterval(() => {
                sendData("query-sell-details", { id: detailOpenedId.id });
            }, 500);
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [detailOpenedId, editData]);

    const purchaseItem = useCallback((id, amount = 1) => {
        sendData('consume-inventory', { id, amount, sendDetails: true });
        // sendData('query-inventory-details', { id, amount: 1 })
    }, [sendData])

    const setInventoryDetailsEdit = useCallback(({id, name}) => {
        if(id) {
            if(detailOpenedId && isChanged) {
                confirm({
                    title: "Switch Item",
                    message: `You have unsaved changes to ${detailOpenedId.name}. Do you want to continue to the new item (losing current changes) or stay here?`,
                    onConfirm: () => {
                        // Continue with the action - discard changes and proceed
                        setEditData(null);
                        setViewedOpenedId(null);
                        setDetailOpenedId({id, name});
                        setChanged(false);
                        if(detailOpenedId !== id) {
                            playSound('click');
                        }
                    },
                    onCancel: () => {
                        // User cancelled - stay in edit mode for current item
                        // Do nothing, just return
                    },
                    confirmText: "Continue",
                    cancelText: "Stay Here"
                });
                return;
            }
            setEditData(null);
            setViewedOpenedId(null);
            setDetailOpenedId({id, name});
            setChanged(false);
            if(detailOpenedId !== id) {
                playSound('click');
            }
        }
    }, [confirm, detailOpenedId, isChanged])

    const setInventoryDetailsView = useCallback((id) => {
        if (!id) {
            setViewedOpenedId(null);
            setViewedData(null);
            return;
        }
        
        if (viewedOpenedId !== id) {
            playSound('selection');
            setViewedOpenedId(id);
        }
    }, [viewedOpenedId])

    const onSetAutoconsumePattern = useCallback(pattern => {
        if(editData) {
            const newEdit = cloneDeep(editData);
            if(!newEdit.autoconsume) {
                newEdit.autoconsume = {};
            }
            if(!newEdit.autoconsume.rules) {
                newEdit.autoconsume.rules = [];
            }
            newEdit.autoconsume.pattern = pattern;
            setEditData({...newEdit});
            setChanged(true);
        }
    }, [editData]);

    const onAddAutoconsumeRule = useCallback(() => {
        if(editData) {
            const newEdit = cloneDeep(editData);;
            newEdit.autoconsume.rules.push({
                resource_id: resources[0].id,
                condition: 'less_or_eq',
                value_type: 'percentage',
                value: 50,
            })
            setEditData(newEdit);
            setChanged(true);
        }
    }, [editData, resources])

    const onSetAutoconsumeRuleValue = useCallback((index, key, value) => {
        if(editData) {
            const newEdit = cloneDeep(editData);
            newEdit.autoconsume.rules[index] = {
                ...newEdit.autoconsume.rules[index],
                [key]: value
            }
            setEditData(newEdit);
            setChanged(true);
        }
    }, [editData])

    const onDeleteAutoconsumeRule = useCallback((index) => {
        if(editData) {
            const newEdit = cloneDeep(editData);
            newEdit.autoconsume.rules.splice(index, 1)
            setEditData(newEdit);
            setChanged(true);
        }
    }, [editData])

    const onSetAutosellPattern = useCallback(pattern => {
        if(editData) {
            const newEdit = cloneDeep(editData);
            if(!newEdit.autosell) {
                newEdit.autosell = {};
            }
            if(!newEdit.autosell.rules) {
                newEdit.autosell.rules = [];
            }
            newEdit.autosell.pattern = pattern;
            setEditData({...newEdit});
            setChanged(true);
        }
    }, [editData]);

    const onSetAutosellReserved = useCallback(reserved => {
        if(editData) {
            const newEdit = cloneDeep(editData);
            if(!newEdit.autosell) {
                newEdit.autosell = {};
            }
            if(!newEdit.autosell.rules) {
                newEdit.autosell.rules = [];
            }
            newEdit.autosell.reserved = reserved;
            setEditData({...newEdit});
            setChanged(true);
        }
    }, [editData]);

    const onSetAutoconsumeReserved = useCallback(reserved => {
        if(editData) {
            const newEdit = cloneDeep(editData);
            if(!newEdit.autoconsume) {
                newEdit.autoconsume = {};
            }
            if(!newEdit.autoconsume.rules) {
                newEdit.autoconsume.rules = [];
            }
            newEdit.autoconsume.reserved = reserved;
            setEditData({...newEdit});
            setChanged(true);
        }
    }, [editData]);

    const onToggleAutosell = useCallback(() => {
        if(editData) {
            const newEdit = cloneDeep(editData);
            if(!newEdit.autosell) {
                newEdit.autosell = {};
            }
            if(!newEdit.autosell.rules) {
                newEdit.autosell.rules = [];
            }
            newEdit.autosell.isEnabled = !newEdit.autosell.isEnabled;
            setEditData({...newEdit});
            setChanged(true);
        }
    }, [editData]);

    const onToggleAutoconsume = useCallback(() => {
        if(editData) {
            const newEdit = cloneDeep(editData);
            if(!newEdit.autoconsume) {
                newEdit.autoconsume = {};
            }
            if(!newEdit.autoconsume.rules) {
                newEdit.autoconsume.rules = [];
            }
            newEdit.autoconsume.isEnabled = !newEdit.autoconsume.isEnabled;
            setEditData({...newEdit});
            setChanged(true);
        }
    }, [editData]);

    const onAddAutosellRule = useCallback(() => {
        if(editData) {
            const newEdit = cloneDeep(editData);;
            newEdit.autosell.rules.push({
                resource_id: (viewedData ?? editData).id,
                condition: 'grt',
                value_type: 'exact',
                value: 5,
            })
            setEditData(newEdit);
            setChanged(true);
        }
    }, [editData, viewedData])

    const onSetAutosellRuleValue = useCallback((index, key, value) => {
        if(editData) {
            const newEdit = cloneDeep(editData);;
            newEdit.autosell.rules[index] = {
                ...newEdit.autosell.rules[index],
                [key]: value
            }
            setEditData(newEdit);
            setChanged(true);
        }
    }, [editData])

    const onDeleteAutosellRule = useCallback((index) => {
        if(editData) {
            const newEdit = cloneDeep(editData);
            newEdit.autosell.rules.splice(index, 1)
            setEditData(newEdit);
            setChanged(true);
        }
    }, [editData])

    const onSave = useCallback(() => {
        sendData('save-inventory-settings', editData);
        setChanged(false);
    }, [editData, sendData])

    const onCancel = useCallback(() => {
        setViewedOpenedId(null);
        setDetailOpenedId(null);
        setEditData(null);
        setViewedData(null);
        setChanged(false);
    })

    const onSell = useCallback((id, amount) => {
        sendData('sell-inventory', { id, amount });
    }, [sendData])

    const [overlayPositions, setOverlayPositions] = useState([]);

    const handleFlash = useCallback((position) => {
        setOverlayPositions((prev) => [...prev, position]);
        setTimeout(() => {
            setOverlayPositions((prev) => prev.filter((p) => p !== position));
        }, 1000);
    }, [])


    const setItemsFilter = useCallback((filterId) => {
        sendData('set-selected-inventory-filter', { filterId })
    }, [sendData])

    const setSearch = useCallback((searchData) => {
        sendData('set-inventory-search', { searchData });
    }, [sendData])

    const onTogglePinned = useCallback((id, flag) => {
        sendData('set-resource-pinned', { id, flag });
    }, [sendData])

    const onToggleViewLasting = useCallback((id, flag) => {
        sendData('set-lasting-pinned', { id, flag });
    }, [sendData])

    const selectedFilterId = inventoryData.selectedFilterId;
    const selectedItemId = detailOpenedId?.id ?? null;
    const categoryUnlocks = useMemo(() => newUnlocks.inventory?.items?.all?.items || {}, [newUnlocks]);
    const selectedFilterUnlocks = useMemo(() => categoryUnlocks[selectedFilterId]?.items || {}, [categoryUnlocks, selectedFilterId]);

    const categoriesMenu = useMemo(() => inventoryData.itemCategories.map(category => (
        <li key={category.id} className={`category ${category.isSelected ? 'active' : ''}`} onClick={() => setItemsFilter(category.id)}>
            <NewNotificationWrap isNew={categoryUnlocks?.[category.id]?.hasNew}>
                <span>{category.name}({category.items.length})</span>
            </NewNotificationWrap>
        </li>
    )), [categoryUnlocks, inventoryData.itemCategories, setItemsFilter])

    const inventoryItems = useMemo(() => inventoryData.available.map(item => (
        <NewNotificationWrap key={`inventory_${item.id}`} id={`inventory_${item.id}`} className={'narrow-wrapper'} isNew={selectedFilterUnlocks?.[`inventory_${item.id}`]?.hasNew}>
            <InventoryCard
                key={item.id}
                isSelected={item.id === selectedItemId}
                isChanged={isChanged}
                {...item}
                onPurchase={purchaseItem}
                onFlash={handleFlash}
                onShowDetails={setInventoryDetailsView}
                onEditConfig={setInventoryDetailsEdit}
                isMobile={isMobile}
            />
        </NewNotificationWrap>
    )), [handleFlash, inventoryData.available, isChanged, isMobile, purchaseItem, selectedFilterUnlocks, selectedItemId, setInventoryDetailsEdit, setInventoryDetailsView])

    if(currentTourId === 'inventory') {
        unlockNextById(9);
    }

    return (
        <div className={'inventory-wrap'}>
            <div className={'ingame-box inventory'}>
                <div className={'categories flex-container'}>
                    <ul className={'menu'}>
                        {categoriesMenu}
                    </ul>
                    <div className={'additional-filters'}>
                        <label>
                            <SearchField
                                placeholder={'Search'}
                                value={inventoryData.searchData || ''}
                                onSetValue={val => setSearch(val)}
                                scopes={INVENTORY_SEARCH_SCOPES}
                            />
                            {/*<input type={'text'} placeholder={'Search'} value={actionsData.searchText || ''} onChange={e => setSearch(e.target.value)}/>*/}
                        </label>
                        {isMobile ? (<div>
                            <span className={'highlighted-span'} onClick={() => setDetailVisible(true)}>Info</span>
                        </div>) : null}
                        <HowToSign scope={'inventory'} />
                    </div>
                </div>
                <div className={'inventory-items-wrap'}>
                    <PerfectScrollbar>
                        <div className={'flex-container'}>
                            {inventoryItems}
                            {overlayPositions.map((position, index) => (
                                <FlashOverlay key={index} position={position} />
                            ))}
                        </div>
                    </PerfectScrollbar>
                </div>
            </div>
            {(!isMobile || isDetailVisible || editData || viewedData) ? (<div className={`item-detail ingame-box detail-blade ${editData ? 'wide-blade2' : 'wide-blade2'}`}>
                {editData || viewedData ? (<InventoryDetails
                    isChanged={isChanged}
                    editData={editData}
                    viewedData={viewedData}
                    resources={resources}
                    onAddAutoconsumeRule={onAddAutoconsumeRule}
                    onSetAutoconsumeRuleValue={onSetAutoconsumeRuleValue}
                    onDeleteAutoconsumeRule={onDeleteAutoconsumeRule}
                    onAddAutosellRule={onAddAutosellRule}
                    onSetAutosellRuleValue={onSetAutosellRuleValue}
                    onDeleteAutosellRule={onDeleteAutosellRule}
                    onSetAutoconsumeReserved={onSetAutoconsumeReserved}
                    onSetAutoconsumePattern={onSetAutoconsumePattern}
                    onSetAutosellReserved={onSetAutosellReserved}
                    onSetAutosellPattern={onSetAutosellPattern}
                    onToggleAutoconsume={onToggleAutoconsume}
                    onToggleAutosell={onToggleAutosell}
                    onSave={onSave}
                    onCancel={onCancel}
                    onSell={onSell}
                    automationUnlocked={inventoryData.automationUnlocked}
                    onConsume={purchaseItem}
                    onTogglePinned={onTogglePinned}
                    onToggleViewLasting={onToggleViewLasting}
                />) : (<InventoryStats details={inventoryData.details} setDetailVisible={setDetailVisible}/>)}
            </div>) : null}
        </div>

    )

}

export const InventoryCard = React.memo(({ isChanged, eta, usages, usagesFor, allowMultiConsume, isConsumable, isRare, isRareIngredient, isSelected, id, name, amount, balance, breakDown, isConsumed, cooldownProg, cooldown, onFlash, onPurchase, onShowDetails, onEditConfig, isMobile}) => {
    const elementRef = useRef(null);

    useFlashOnLevelUp(isConsumed, onFlash, elementRef);

    const handleClick = (e) => {
        if (e.button === 0) {
            // Left-click
            onEditConfig({id, name});
        }
    };

    const handleContextMenu = (e) => {
        e.preventDefault(); // Prevents the default context menu
        if(!isConsumable) return;
        let amt = 1;
        if(allowMultiConsume) {
            if(e.shiftKey) amt = amount;
            if(e.ctrlKey && amount >= 1) amt = Math.max(0.1*amount, 1)
        }
        onPurchase(id, amt); // Your custom right-click action
    };

    return (<div
        id={`inventory-item-card-${id}`}
        ref={elementRef}
        className={`icon-card item bigger flashable ${isSelected ? 'selected' : ''} ${isRare ? 'bluish' : ''} ${isRareIngredient ? 'ingredient' : ''}`}
        onMouseEnter={() => {
            if (!isMobile) {
                onShowDetails(id);
            }
        }}
        onMouseLeave={() => {
            if (!isMobile) {
                onShowDetails(null);
            }
        }}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
    >
        <TippyWrapper content={<div className={'hint-popup'}>
            <p>{name}({formatInt(amount)})</p>
            {usages?.length ? (<div className={'block'}>
                <p>Used By:</p>
                <div className={'sub-items'}>
                    {usages.map(one => (<p className={'padded-left'}>{one.name}</p>))}
                </div>
            </div> ) : null}
            {usagesFor?.length ? (<div className={'block'}>
                <p>Used For:</p>
                <div className={'sub-items'}>
                    {usagesFor.map(one => (<p className={'padded-left'}>{one.name}</p>))}
                </div>
            </div> ) : null}
            {breakDown ? (<BreakDown breakDown={breakDown}/>) : null}
            <div className={'block'}>
                <p>Balance: {formatValue(balance)}</p>
                {balance < 0 ? (<p>{`${secondsToString(-eta)} to empty`}</p>) : null}
            </div>
            <p>Left click to select</p>
            {isConsumable ? (<p>Right click to consume</p>) : null}
            {isConsumable && allowMultiConsume && amount > 10 ? (<p>Right click + CTRL to consume {formatInt(0.1*amount)}</p>) : null}
            {isConsumable && allowMultiConsume? (<p>Right click + SHIFT to consume all</p>) : null}
        </div> }>
            <div className={'icon-content'}>
                <CircularProgress progress={cooldownProg}>
                    <img src={`icons/resources/${id}.png`} className={'resource'} />
                </CircularProgress>
                <span className={'level'}>{formatValue(amount)}</span>
            </div>
        </TippyWrapper>

    </div> )
}, ((prevProps, currProps) => {
    if(prevProps.id !== currProps.id) {
        return false;
    }

    if(prevProps.amount !== currProps.amount) {
        return false;
    }

    if(prevProps.eta !== currProps.eta && (currProps.eta < 0 || prevProps.eta < 0)) {
        return false;
    }

    if(prevProps.cooldownProg !== currProps.cooldownProg) {
        return false;
    }

    if(prevProps.isConsumed !== currProps.isConsumed) {
        return false;
    }

    if(prevProps.isChanged !== currProps.isChanged) {
        return false;
    }

    if(prevProps.isSelected !== currProps.isSelected) {
        return false;
    }
    return true;
}))

export const InventoryDetails = React.memo(({isChanged, editData, viewedData, resources, onAddAutoconsumeRule, onSetAutoconsumeRuleValue, onDeleteAutoconsumeRule, onAddAutosellRule, onSetAutosellRuleValue, onDeleteAutosellRule, onSave, onCancel, onSell, onSetAutosellPattern, onSetAutoconsumePattern, onSetAutosellReserved, onSetAutoconsumeReserved, onToggleAutoconsume, onToggleAutosell, automationUnlocked, onConsume, onTogglePinned, onToggleViewLasting}) => {

    const worker = useContext(WorkerContext);

    const { sendData, onMessage, removeMessage } = useWorkerClient(worker);

    const { stepIndex, unlockNextById, jumpOver, currentTourId } = useTutorial();

    const [details, setDetails] = useState(null);

    const item = viewedData ? viewedData : editData;

    let isEditing = !!editData && !viewedData;

    if(!item) return null;

    useEffect(() => {

        if(item) {
            sendData('query-inventory-details', { id: item.id, prefix: 'detail-blade' })
        }
    }, [item]);

    useEffect(() => {
        if(currentTourId === 'inventory' && details?.id === 'inventory_brightleaf') {
            unlockNextById(14);
        }
    }, [details?.numConsumed, details?.currentDuration]);

    useEffect(() => {
        onMessage('detail-blade-inventory-details', (data) => {
            setDetails(data);
        });
        
        return () => {
            removeMessage('detail-blade-inventory-details');
        };
    }, []);

    const setAutoconsumePattern = (pattern) => {
      onSetAutoconsumePattern(pattern)
    }

    const addAutoconsumeRule = () => {
        onAddAutoconsumeRule()
    }

    const setAutoconsumeRuleValue = (index, key, value) => {
        onSetAutoconsumeRuleValue(index, key, value)
    }

    const deleteAutoconsumeRule = (index) => {
        onDeleteAutoconsumeRule(index)
    }

    const setAutosellPattern = (pattern) => {
        onSetAutosellPattern(pattern)
    }

    const addAutosellRule = () => {
        onAddAutosellRule()
    }

    const setAutosellRuleValue = (index, key, value) => {
        onSetAutosellRuleValue(index, key, value)
    }

    const deleteAutosellRule = (index) => {
        onDeleteAutosellRule(index)
    }

    const setReservedValue = (reserved) => {
        onSetAutosellReserved(reserved)
    }

    const setReservedConsumeValue = (reserved) => {
        onSetAutoconsumeReserved(reserved)
    }

    const toggleAutosell = () => {
        onToggleAutosell()
    }

    const toggleAutoconsume = () => {
        onToggleAutoconsume()
    }

    const consumeItem = () => {
        if(currentTourId === 'inventory' && item.id === 'inventory_brightleaf') {
            unlockNextById(14);
        }
        onConsume(item.id);
    }

    const togglePinned = () => {
        onTogglePinned(item.id, !(details || item).isPinned);
    }

    const toggleViewLasting = () => {
        onToggleViewLasting(item.id, !(details || item).show_lasting);
    }

    if(currentTourId === 'inventory' && item.id === 'inventory_brightleaf' && isEditing) {
        unlockNextById(11);
    }

    return (
        <>
            <div className={'blade-outer'}>
                <PerfectScrollbar>
                    <div className={'blade-inner inventory-items-blade'}>
                        <div className={'block'}>
                            <div className={'inner-heading flex-container flex-row'}>
                                <h4>{item.name} (x{formatInt(item.amount)})</h4>
                                <PinResource id={item.id} isPinned={details?.isPinned} />
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
                        {item?.effects?.length ? (<div className={'block'}>
                            <p>Effects on usage:</p>
                            <div className={'effects'}>
                                <EffectsSection effects={item.effects}/>
                            </div>
                        </div>) : null}
                        {item.potentialPermanentEffects ? (<div className={'block'}>
                            <p>Permanent Effects:</p>
                            <div className={'effects'}>
                                <ResourceComparison effects1={item.permanentEffects} effects2={item.potentialPermanentEffects}/>
                            </div>
                        </div>) : null}
                        {item.duration ? (<div className={'block'}>
                            <p>Effects lasting: {secondsToString(item.duration)}</p>
                            <div className={'effects'}>
                                <EffectsSection effects={item.potentialEffects} />
                            </div>
                            {item.canShowLasting ? (<div className={'show-lasting'}>
                                <CustomButton
                                    iconId={'icon_view_lasting'}
                                    className={`toggle-effect-monitor medium-sm ${details?.show_lasting ? 'highlighted' : ''}`}
                                    onClick={(e) => {toggleViewLasting()}}
                                >{details?.show_lasting ? 'Stop showing active effects in left sidebar' : 'Show when active in left sidebar'}</CustomButton>
                            </div> ) : null}
                        </div>) : null}

                        <div className={'block'}>
                            {item.isConsumable ? (<div className={'flex-container consumption-block'}>
                                <div className={'stats'}>
                                    <p>Consumption Cooldown: {secondsToString(item.consumptionCooldown)}</p>
                                    <p>Consumed amount: {formatInt(item.numConsumed)}</p>
                                </div>
                                <div className={'consume-block'}>
                                    <button className={'consume-button'} onClick={consumeItem} disabled={details?.currentCooldown > 0 || details?.currentDuration > 0}>Consume</button>
                                    {details?.currentDuration ? (<p className={'small'}>Running: {secondsToString(details?.currentDuration)}</p>) : null}
                                    {details?.currentCooldown ? (<p className={'small'}>Cooldown: {secondsToString(details?.currentCooldown)}</p>) : null}
                                </div>
                            </div>) : null}
                            {item.isSellable ? (<div>
                                <p>Sold amount: {formatInt(item.soldAmount)}</p>
                                <p>Coins Earned: {formatInt(item.coinsEarned)}</p>
                            </div>) : null}
                        </div>

                        {item.isConsumable && automationUnlocked ? (<div className={'autoconsume-setting block'}>
                            <div className={'rules-header flex-container'}>
                                <p>Autoconsumption rules: {item.autoconsume?.rules?.length ? null : 'None'}</p>
                                <label>
                                    <input type={'checkbox'} checked={item.autoconsume?.isEnabled ?? undefined} onChange={toggleAutoconsume}/>
                                    {item.autoconsume?.isEnabled ? ' ON' : ' OFF'}
                                </label>
                                {isEditing ? (<button onClick={addAutoconsumeRule}>Add rule (AND)</button>) : null}
                            </div>

                            <RulesList
                                prefix={'autoconsume'}
                                isEditing={isEditing}
                                rules={item.autoconsume?.rules || []}
                                resources={resources}
                                pattern={item.autoconsume?.pattern}
                                deleteRule={deleteAutoconsumeRule}
                                setRuleValue={setAutoconsumeRuleValue}
                                setPattern={setAutoconsumePattern}
                                isAutoCheck={item.autoconsume?.isEnabled}
                            />
                            <div className={'autoconsume-amount flex-container'}>
                                <p>Reserved Amount:</p>
                                {isEditing ? <input type={'number'} onChange={e => setReservedConsumeValue(+e.target.value)}
                                        value={item.autoconsume?.reserved || 0}/> : <span>{formatValue(item.autoconsume?.reserved || 0)}</span>}
                            </div>
                        </div>) : null}

                        {item.isSellable && automationUnlocked ? (<div className={'autoconsume-setting block'}>
                            <div className={'rules-header flex-container'}>
                                <p>Autosell rules: {item.autosell?.rules?.length ? null : 'None'}</p>
                                <label>
                                    <input type={'checkbox'} checked={item.autosell?.isEnabled ?? undefined} onChange={toggleAutosell}/>
                                    {item.autosell?.isEnabled ? ' ON' : ' OFF'}
                                </label>
                                {isEditing ? (<button onClick={addAutosellRule}>Add rule (AND)</button>) : null}
                            </div>

                            <RulesList
                                prefix={'autosell'}
                                isEditing={isEditing}
                                rules={item.autosell?.rules || []}
                                pattern={item.autosell?.pattern}
                                resources={resources}
                                deleteRule={deleteAutosellRule}
                                setRuleValue={setAutosellRuleValue}
                                setPattern={setAutosellPattern}
                                isAutoCheck={item.autosell?.isEnabled}
                            />
                            <div className={'autosell-amount flex-container'}>
                                <p>Reserved Amount:</p>
                                {isEditing ? <input type={'number'} onChange={e => setReservedValue(+e.target.value)}
                                        value={item.autosell?.reserved || 0}/> : <span>{formatValue(item.autosell?.reserved || 0)}</span>}
                            </div>
                        </div>) : null}

                        {item.isSellable ? (<div className={'block sell-block'}>
                            <p className={'text-desc'}>Sell price: {formatValue(item.sellPrice)}</p>
                            <div className={'buttons flex-container'}>
                                <button disabled={item.maxSell < 1} onClick={() => onSell(item.id, 1)}>Sell</button>
                                <button disabled={item.maxSell < 1} onClick={() => onSell(item.id, item.maxSell)}>Sell max (x{formatInt(item.maxSell)})</button>
                            </div>
                        </div> ) : null}


                    </div>
                </PerfectScrollbar>
            </div>
            {isEditing ? (<div className={'buttons flex-container main-buttons'}>
                <button className={'primary-action'} disabled={!isChanged} onClick={onSave}>Save</button>
                {/*<TippyWrapper content={<div className={'hint-popup'}>Pinning item will make it visible at resources panel</div> }>
                    <button onClick={togglePinned}>{details?.isPinned ? 'Unpin' : 'Pin'}</button>
                </TippyWrapper>*/}
                <button className={'warning-action'} onClick={onCancel}>Cancel</button>
            </div>) : null}
        </>
    )
}, (prevProps, currentProps) => {

    if(prevProps.isChanged !== currentProps.isChanged) {
        return false;
    }

    if(prevProps.editData !== currentProps.editData) {
        return false;
    }

    if(prevProps.viewedData !== currentProps.viewedData) {
        return false;
    }

    return true;
})

export const InventoryStats = ({ details, setDetailVisible }) => {

    const { isMobile } = useAppContext();
    // Масив статистик, які потрібно відобразити
    const statsToDisplay = [
        /*details.metabolism_rate,
        details.cooldown_bonus,*/
        details.bargaining,
        details.bargaining_mod,
        details.shop_max_stock,
        details.shop_stock_renew_rate,
        // Додайте інші статистики за потребою
    ];

    const hasEffect = useCallback((stat) => {
        if(!stat?.value) return false;
        return !stat.isMultiplier || Math.abs(stat?.value - 1.0) > 1.e-7;
    }, [])

    return (
        <PerfectScrollbar>
            <div className={'blade-inner'}>
                <div className={'block'}>
                    <p>General Stats:</p>
                    <div className={'effects'}>
                        {statsToDisplay.map((stat) => (
                            hasEffect(stat) ? (
                                <StatRow key={stat.id} stat={stat} />
                            ) : null
                        ))}
                    </div>
                </div>
                {isMobile ? (<div className={'block buttons'}>
                    <button onClick={() => setDetailVisible(false)}>Close</button>
                </div>) : null}
            </div>
        </PerfectScrollbar>
    );
};