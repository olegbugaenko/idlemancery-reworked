import React, {useCallback, useContext, useEffect, useRef, useState} from "react";
import WorkerContext from "../../context/worker-context";
import {useWorkerClient} from "../../general/client";
import {formatInt, formatValue, secondsToString} from "../../general/utils/strings";
import PerfectScrollbar from "react-perfect-scrollbar";
import {EffectsSection} from "../shared/effects-section.jsx";
import CircularProgress from "../shared/circular-progress.jsx";
import {FlashOverlay} from "../layout/flash-overlay.jsx";
import {useFlashOnLevelUp} from "../../general/hooks/flash";
import {TippyWrapper} from "../shared/tippy-wrapper.jsx";
import RulesList from "../shared/rules-list.jsx";
import {cloneDeep} from "lodash";
import {BreakDown} from "../layout/sidebar.jsx";
import {ResourceComparison} from "../shared/resource-comparison.jsx";
import {NewNotificationWrap} from "../layout/new-notification-wrap.jsx";
import StatRow from "../shared/stat-row.jsx";
import {SearchField} from "../shared/search-field.jsx";
import {useAppContext} from "../../context/ui-context";


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

export const Inventory = ({}) => {

    const worker = useContext(WorkerContext);
    const { isMobile } = useAppContext();
    const [isDetailVisible, setDetailVisible] = useState(!isMobile);

    const { onMessage, sendData } = useWorkerClient(worker);
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

    useEffect(() => {
        const interval = setInterval(() => {
            sendData('query-inventory-data', {});
        }, 100);
        sendData('query-all-resources', {});
        const interval2 = setInterval(() => {
            sendData('query-new-unlocks-notifications', { suffix: 'inventory', scope: 'inventory' })
        }, 1000)
        return () => {
            clearInterval(interval);
            clearInterval(interval2)
        }
    }, [])

    onMessage('new-unlocks-notifications-inventory', payload => {
        setNewUnlocks(payload);
    })

    onMessage('all-resources', (payload) => {
        setResources(payload);
    })

    onMessage('inventory-details', (payload) => {
        if(viewedOpenedId) {
            setViewedData(payload);
        } else if(detailOpenedId) {
            setEditData(payload);
            setViewedData(null);
        }

    })

    onMessage('inventory-data', (inventory) => {
        setItemsData(inventory);
    })

    // Handle sell-details messages
    onMessage("sell-details", (payload) => {
        if (editData && payload.id === editData.id) {
            setEditData((prevData) => ({
                ...prevData,
                isSellable: payload.isSellable,
                maxSell: payload.maxSell,
            }));
        }
    });

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
    })

    const setInventoryDetailsEdit = useCallback(({id, name}) => {
        if(id) {
            if(detailOpenedId && isChanged) {
                if(!confirm(`This will discard all your changes to ${detailOpenedId.name}. Are you sure`)) {
                    return;
                }
            }
            setEditData(null);
            setViewedOpenedId(null);
            setDetailOpenedId({id, name});
            setChanged(false);
        }
    }, [isChanged, detailOpenedId])

    const setInventoryDetailsView = useCallback((id) => {
        if(!id) {
            setViewedOpenedId(null);
            setViewedData(null);
            return;
        }
        setViewedOpenedId(id)

    })

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
    }, [editData])

    const onSetAutoconsumeRuleValue = useCallback((index, key, value) => {
        if(editData) {
            console.log('Changing: ', index, key, value);
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
    }, [editData])

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
        // console.log('saving: ', editData);
        sendData('save-inventory-settings', editData);
        console.log('setDet changed to false onSave!')
        setChanged(false);
    })

    const onCancel = useCallback(() => {
        setViewedOpenedId(null);
        setDetailOpenedId(null);
        setEditData(null);
        setViewedData(null);
        setChanged(false);
        console.log('setDet changed to false onCancel!')
    })

    const onSell = useCallback((id, amount) => {
        sendData('sell-inventory', { id, amount });
    })

    const [overlayPositions, setOverlayPositions] = useState([]);

    const handleFlash = (position) => {
        console.log('Adding flash: ', position);
        setOverlayPositions((prev) => [...prev, position]);
        setTimeout(() => {
            setOverlayPositions((prev) => prev.filter((p) => p !== position));
        }, 1000);
    };


    const setItemsFilter = (filterId) => {
        sendData('set-selected-inventory-filter', { filterId })
    }

    const setSearch = (searchData) => {
        console.log('SetSearch: ', searchData);
        sendData('set-inventory-search', { searchData });
    }

    const onTogglePinned = (id, flag) => {
        console.log('toggle-pinned: ', id, flag);
        sendData('set-inventory-pinned', { id, flag });
    }

    return (
        <div className={'inventory-wrap'}>
            <div className={'ingame-box inventory'}>
                <div className={'categories flex-container'}>
                    <ul className={'menu'}>
                        {inventoryData.itemCategories.map(category => (<li key={category.id} className={`category ${category.isSelected ? 'active' : ''}`} onClick={() => setItemsFilter(category.id)}>
                            <NewNotificationWrap isNew={newUnlocks.inventory?.items?.all?.items?.[category.id]?.hasNew}>
                                <span>{category.name}({category.items.length})</span>
                            </NewNotificationWrap>
                        </li> ))}
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
                    </div>
                </div>
                <div className={'inventory-items-wrap'}>
                    <PerfectScrollbar>
                        <div className={'flex-container'}>
                            {inventoryData.available.map(item => <NewNotificationWrap key={`inventory_${item.id}`} id={`inventory_${item.id}`} className={'narrow-wrapper'} isNew={newUnlocks.inventory?.items?.all?.items?.[inventoryData.selectedFilterId]?.items?.[`inventory_${item.id}`]?.hasNew}>
                                <InventoryCard
                                key={item.id}
                                isSelected={item.id === detailOpenedId?.id}
                                isChanged={isChanged}
                                {...item}
                                onPurchase={purchaseItem}
                                onFlash={handleFlash}
                                onShowDetails={setInventoryDetailsView}
                                onEditConfig={setInventoryDetailsEdit}
                                isMobile={isMobile}
                                /></NewNotificationWrap>)}
                            {overlayPositions.map((position, index) => (
                                <FlashOverlay key={index} position={position} />
                            ))}
                        </div>
                    </PerfectScrollbar>
                </div>
            </div>
            {(!isMobile || isDetailVisible || editData || viewedData) ? (<div className={'item-detail ingame-box detail-blade'}>
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
                />) : (<InventoryStats details={inventoryData.details} setDetailVisible={setDetailVisible}/>)}
            </div>) : null}
        </div>

    )

}

export const InventoryCard = React.memo(({ isChanged, allowMultiConsume, isConsumable, isRare, isSelected, id, name, amount, balance, breakDown, isConsumed, cooldownProg, cooldown, onFlash, onPurchase, onShowDetails, onEditConfig, isMobile}) => {
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
        console.log('Triger onpurchase: ', id);
        if(!isConsumable) return;
        let amt = 1;
        if(allowMultiConsume) {
            if(e.shiftKey) amt = amount;
            if(e.ctrlKey && amount >= 1) amt = Math.max(0.1*amount, 1)
        }
        onPurchase(id, amt); // Your custom right-click action
    };

    // RERENDERING
    // console.log('Item: ', id, cooldownProg, cooldown);

    return (<div
        ref={elementRef}
        className={`icon-card item bigger flashable ${isSelected ? 'selected' : ''} ${isRare ? 'bluish' : ''}`}
        onMouseEnter={() => !isMobile ? onShowDetails(id) : null}
        onMouseLeave={() => !isMobile ? onShowDetails(null) : null}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
    >
        <TippyWrapper content={<div className={'hint-popup'}>
            <p>{name}({formatInt(amount)})</p>
            {breakDown ? (<BreakDown breakDown={breakDown}/>) : null}
            <p>Balance: {formatValue(balance)}</p>
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
    // console.log('Rerender: ', prevProps, curr);
    return true;
}))

export const InventoryDetails = React.memo(({isChanged, editData, viewedData, resources, onAddAutoconsumeRule, onSetAutoconsumeRuleValue, onDeleteAutoconsumeRule, onAddAutosellRule, onSetAutosellRuleValue, onDeleteAutosellRule, onSave, onCancel, onSell, onSetAutosellPattern, onSetAutoconsumePattern, onSetAutosellReserved, onToggleAutoconsume, onToggleAutosell, automationUnlocked, onConsume, onTogglePinned}) => {

    const worker = useContext(WorkerContext);

    const { sendData, onMessage } = useWorkerClient(worker);

    const [details, setDetails] = useState(null);

    const item = viewedData ? viewedData : editData;

    let isEditing = !!editData && !viewedData;


    if(!item) return null;

    useEffect(() => {

        if(item) {
            sendData('query-inventory-details', { id: item.id, prefix: 'detail-blade' })
        }
    }, [item]);

    // console.log('ItemReceived: ', item);

    onMessage('detail-blade-inventory-details', (data) => {
        setDetails(data);
    })

    const setAutoconsumePattern = (pattern) => {
      onSetAutoconsumePattern(pattern)
    }

    const addAutoconsumeRule = () => {
        onAddAutoconsumeRule()
    }

    const setAutoconsumeRuleValue = (index, key, value) => {
        console.log('Setting: ', key, value)
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

    const toggleAutosell = () => {
        onToggleAutosell()
    }

    const toggleAutoconsume = () => {
        onToggleAutoconsume()
    }

    const consumeItem = () => {
        onConsume(item.id);
    }

    const togglePinned = () => {
        onTogglePinned(item.id, !(details || item).isPinned);
    }

    //console.log('item?.autoconsume: ', item?.autoconsume);

    return (
        <PerfectScrollbar>
            <div className={'blade-inner'}>
                <div className={'block'}>
                    <h4>{item.name} (x{formatInt(item.amount)})</h4>
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
                </div>) : null}

                <div className={'block'}>
                    {item.consumptionCooldown ? (<div className={'flex-container consumption-block'}>
                        <div className={'stats'}>
                            <p>Consumption Cooldown: {secondsToString(item.consumptionCooldown)}</p>
                            <p>Consumed amount: {formatInt(item.numConsumed)}</p>
                        </div>
                        <div className={'consume-block'}>
                            <button onClick={consumeItem} disabled={details?.currentCooldown > 0 || details?.currentDuration > 0}>Consume</button>
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
                            <input type={'checkbox'} checked={item.autoconsume?.isEnabled} onChange={toggleAutoconsume}/>
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
                </div>) : null}

                {item.isSellable && automationUnlocked ? (<div className={'autoconsume-setting block'}>
                    <div className={'rules-header flex-container'}>
                        <p>Autosell rules: {item.autosell?.rules?.length ? null : 'None'}</p>
                        <label>
                            <input type={'checkbox'} checked={item.autosell?.isEnabled} onChange={toggleAutosell}/>
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
                        <input type={'number'} onChange={e => setReservedValue(+e.target.value)} value={item.autosell?.reserved || 0}/>
                    </div>
                </div>) : null}

                {item.isSellable ? (<div className={'block sell-block'}>
                    <p className={'text-desc'}>Sell price: {formatValue(item.sellPrice)}</p>
                    <div className={'buttons flex-container'}>
                        <button disabled={item.maxSell < 1} onClick={() => onSell(item.id, 1)}>Sell</button>
                        <button disabled={item.maxSell < 1} onClick={() => onSell(item.id, item.maxSell)}>Sell max (x{formatInt(item.maxSell)})</button>
                    </div>
                </div> ) : null}

                {isEditing ? (<div className={'buttons flex-container'}>
                    <button disabled={!isChanged} onClick={onSave}>Save</button>
                    <TippyWrapper content={<div className={'hint-popup'}>Pinning item will make it visible at resources panel</div> }>
                        <button onClick={togglePinned}>{details?.isPinned ? 'Unpin' : 'Pin'}</button>
                    </TippyWrapper>
                    <button onClick={onCancel}>Cancel</button>
                </div>) : null}
            </div>
        </PerfectScrollbar>
    )
}, (prevProps, currentProps) => {

    if(prevProps.isChanged !== currentProps.isChanged) {
        //console.log('isChanged: ', prevProps.isChanged, currentProps.isChanged)
        return false;
    }

    if(prevProps.editData !== currentProps.editData) {
        return false;
    }

    if(prevProps.viewedData !== currentProps.viewedData) {
        //console.log('viewedChng: ', prevProps.viewedData, currentProps.viewedData)
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