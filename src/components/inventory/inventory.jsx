import React, {useCallback, useContext, useEffect, useMemo, useState} from "react";
import WorkerContext from "../../context/worker-context";
import {useWorkerClient} from "../../general/client";
import PerfectScrollbar from "react-perfect-scrollbar";
import {FlashOverlay} from "../layout/flash-overlay.jsx";
import {cloneDeep} from "lodash";
import {NewNotificationWrap} from "../shared/new-notification-wrap.jsx";
import {SearchField} from "../shared/search-field.jsx";
import {useAppContext} from "../../context/ui-context";
import {useModal} from "../../general/components/modal/index.jsx";
import {HowToSign} from "../shared/how-to-sign.jsx";
import {useTutorial} from "../../context/tutorial-context";
import {playSound} from "../../context/sounds/sound-manager";
import {InventoryDetails} from "./inventory-details.jsx";
import {InventoryStats} from "./inventory-stats.jsx";
import {InventoryItem} from "./inventory-card.jsx";
import {getInventorySnapshot, updateInventoryState, useInventoryData} from "../../state/inventory-store";


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

const selectAvailableItems = state => state?.available ?? [];
const selectItemCategories = state => state?.itemCategories ?? [];
const selectSelectedFilterId = state => state?.selectedFilterId ?? 'all';
const selectAutomationUnlocked = state => !!state?.automationUnlocked;
const selectInventoryDetails = state => state?.details ?? {};
const selectInventorySearchData = state => state?.searchData ?? { search: '', selectedScopes: ['name', 'tags'] };

export const Inventory = ({}) => {

    const worker = useContext(WorkerContext);
    const { isMobile } = useAppContext();
    const [isDetailVisible, setDetailVisible] = useState(!isMobile);
    const { unlockNextById, currentTourId } = useTutorial();

    const { onMessage, sendData, removeMessage } = useWorkerClient(worker);
    const { confirm } = useModal();
    const availableItems = useInventoryData(selectAvailableItems);
    const itemCategories = useInventoryData(selectItemCategories);
    const selectedFilterId = useInventoryData(selectSelectedFilterId);
    const automationUnlocked = useInventoryData(selectAutomationUnlocked);
    const inventoryDetails = useInventoryData(selectInventoryDetails);
    const searchValue = useInventoryData(selectInventorySearchData);
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
        }, 200);
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
            const prev = getInventorySnapshot();
            const merged = mergeInventoryState(prev, inventory);
            updateInventoryState(merged);
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

    const onToggleViewLasting = useCallback((id, flag) => {
        sendData('set-lasting-pinned', { id, flag });
    }, [sendData])

    const selectedItemId = detailOpenedId?.id ?? null;
    const categoryUnlocks = useMemo(() => newUnlocks.inventory?.items?.all?.items || {}, [newUnlocks]);
    const selectedFilterUnlocks = useMemo(() => categoryUnlocks[selectedFilterId]?.items || {}, [categoryUnlocks, selectedFilterId]);

    const categoriesMenu = useMemo(() => itemCategories.map(category => (
        <li key={category.id} className={`category ${category.isSelected ? 'active' : ''}`} onClick={() => setItemsFilter(category.id)}>
            <NewNotificationWrap isNew={categoryUnlocks?.[category.id]?.hasNew}>
                <span>{category.name}({category.items.length})</span>
            </NewNotificationWrap>
        </li>
    )), [categoryUnlocks, itemCategories, setItemsFilter])

    const inventoryItems = useMemo(() => availableItems.map(item => (
        <InventoryItem
            key={item.id}
            item={item}
            isSelected={item.id === selectedItemId}
            isChanged={isChanged}
            isNew={selectedFilterUnlocks?.[`inventory_${item.id}`]?.hasNew}
            onPurchase={purchaseItem}
            onFlash={handleFlash}
            onShowDetails={setInventoryDetailsView}
            onEditConfig={setInventoryDetailsEdit}
            isMobile={isMobile}
        />
    )), [availableItems, handleFlash, isChanged, isMobile, purchaseItem, selectedFilterUnlocks, selectedItemId, setInventoryDetailsEdit, setInventoryDetailsView])

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
                                value={searchValue || ''}
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
                    automationUnlocked={automationUnlocked}
                    onConsume={purchaseItem}
                    onToggleViewLasting={onToggleViewLasting}
                />) : (<InventoryStats details={inventoryDetails} setDetailVisible={setDetailVisible}/>)}
            </div>) : null}
        </div>

    )

}
