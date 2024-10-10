import React, {useCallback, useContext, useEffect, useRef, useState} from "react";
import WorkerContext from "../../context/worker-context";
import {useWorkerClient} from "../../general/client";
import {formatInt, formatValue, secondsToString} from "../../general/utils/strings";
import {ProgressBar} from "../layout/progress-bar.jsx";
import PerfectScrollbar from "react-perfect-scrollbar";
import {EffectsSection} from "../shared/effects-section.jsx";
import {ResourceCost} from "../shared/resource-cost.jsx";
import CircularProgress from "../shared/circular-progress.jsx";
import {FlashOverlay} from "../layout/flash-overlay.jsx";
import {useFlashOnLevelUp} from "../../general/hooks/flash";
import {TippyWrapper} from "../shared/tippy-wrapper.jsx";

export const Inventory = ({}) => {

    const worker = useContext(WorkerContext);

    const { onMessage, sendData } = useWorkerClient(worker);
    const [inventoryData, setItemsData] = useState({
        available: [],
        current: undefined
    });
    const [detailOpenedId, setDetailOpenedId] = useState(null); // here should be object containing id and rules
    const [viewedOpenedId, setViewedOpenedId] = useState(null);
    const [editData, setEditData] = useState(null);
    const [viewedData, setViewedData] = useState(null);
    const [resources, setResources] = useState([]);
    const [isChanged, setChanged] = useState(false);

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
        return () => {
            clearInterval(interval);
        }
    }, [])

    onMessage('all-resources', (payload) => {
        setResources(payload);
    })

    onMessage('inventory-details', (payload) => {
        console.log(`currViewing: ${viewedOpenedId}, edit: ${detailOpenedId}`, payload);
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

    const purchaseItem = useCallback((id) => {
        sendData('consume-inventory', { id, amount: 1 })
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

    const onAddAutoconsumeRule = useCallback(() => {
        if(editData) {
            const newEdit = editData;
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
            const newEdit = editData;
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
            const newEdit = editData;
            newEdit.autoconsume.rules.splice(index)
            setEditData(newEdit);
            setChanged(true);
        }
    }, [editData])

    const onAddAutosellRule = useCallback(() => {
        if(editData) {
            const newEdit = editData;
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
            const newEdit = editData;
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
            const newEdit = editData;
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

    return (
        <div className={'inventory-wrap'}>
            <div className={'ingame-box inventory'}>
                <PerfectScrollbar>
                    <div className={'flex-container'}>
                        {inventoryData.available.map(item => <InventoryCard
                            key={item.id}
                            isSelected={item.id === detailOpenedId?.id}
                            isChanged={isChanged}
                            {...item}
                            onPurchase={purchaseItem}
                            onFlash={handleFlash}
                            onShowDetails={setInventoryDetailsView}
                            onEditConfig={setInventoryDetailsEdit}
                        />)}
                        {overlayPositions.map((position, index) => (
                            <FlashOverlay key={index} position={position} />
                        ))}
                    </div>
                </PerfectScrollbar>
            </div>
            <div className={'item-detail ingame-box detail-blade'}>
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
                    onSave={onSave}
                    onCancel={onCancel}
                    onSell={onSell}
                />) : null}
            </div>
        </div>

    )

}

export const InventoryCard = React.memo(({ isChanged, isSelected, id, name, amount, isConsumed, cooldownProg, cooldown, onFlash, onPurchase, onShowDetails, onEditConfig}) => {
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
        onPurchase(id); // Your custom right-click action
    };

    // RERENDERING
    // console.log('Item: ', id, cooldownProg, cooldown);

    return (<div ref={elementRef} className={`icon-card item flashable ${isSelected ? 'selected' : ''}`} onMouseEnter={() => onShowDetails(id)} onMouseLeave={() => onShowDetails(null)} onClick={handleClick} onContextMenu={handleContextMenu}>
        <TippyWrapper content={<div className={'hint-popup'}>
            <p>Left click to select</p>
            <p>Right click to consume</p>
        </div> }>
            <div className={'icon-content'}>
                <CircularProgress progress={cooldownProg}>
                    <img src={`icons/resources/${id}.png`} className={'resource'} />
                </CircularProgress>
                <span className={'level'}>{formatInt(amount)}</span>
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

export const InventoryDetails = ({isChanged, editData, viewedData, resources, onAddAutoconsumeRule, onSetAutoconsumeRuleValue, onDeleteAutoconsumeRule, onAddAutosellRule, onSetAutosellRuleValue, onDeleteAutosellRule, onSave, onCancel, onSell}) => {

    const item = viewedData ? viewedData : editData;

    let isEditing = !!editData && !viewedData;


    if(!item) return null;

    const addAutoconsumeRule = () => {
        onAddAutoconsumeRule()
    }

    const setAutoconsumeRuleValue = (index, key, value) => {
        onSetAutoconsumeRuleValue(index, key, value)
    }

    const deleteAutoconsumeRule = () => {
        onDeleteAutoconsumeRule()
    }

    const addAutosellRule = () => {
        onAddAutosellRule()
    }

    const setAutosellRuleValue = (index, key, value) => {
        onSetAutosellRuleValue(index, key, value)
    }

    const deleteAutosellRule = () => {
        onDeleteAutosellRule()
    }


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
                        {item.tags.map(tag => (<div className={'tag'}>{tag}</div> ))}
                    </div>
                </div>
                <div className={'block'}>
                    <p>Effects on usage:</p>
                    <div className={'effects'}>
                        <EffectsSection effects={item.effects} />
                    </div>
                </div>
                {item.duration ? (<div className={'block'}>
                    <p>Effects lasting: {secondsToString(item.duration)}</p>
                    <div className={'effects'}>
                        <EffectsSection effects={item.potentialEffects} />
                    </div>
                </div>) : null}
                {item.consumptionCooldown ? (
                <div className={'block'}>
                    <p>Consumption Cooldown: {secondsToString(item.consumptionCooldown)}</p>
                </div>
                ) : null}
                <div className={'autoconsume-setting block'}>
                    <div className={'rules-header flex-container'}>
                        <p>Autoconsumption rules: {item.autoconsume?.rules?.length ? null : 'None'}</p>
                        {isEditing ? (<button onClick={addAutoconsumeRule}>Add rule (AND)</button>) : null}
                    </div>

                    <div className={'rules'}>
                        {item.autoconsume?.rules?.map((rule, index) => (
                            <div className={'rule row add-row'}>
                                <div className={'col subject'}>
                                    {isEditing ? (<select name={'resource_id'} onChange={e => setAutoconsumeRuleValue(index, 'resource_id', e.target.value)}>
                                        {resources.map(r => (<option id={r.id} value={r.id} selected={rule.resource_id === r.id}>{r.name}</option>))}
                                    </select>) : <span>{resources.find(r => r.id === rule.resource_id)?.name || 'Invalid'}</span>}
                                </div>
                                <div className={'col condition'}>
                                    {isEditing ? (<select name={'condition'} onChange={e => setAutoconsumeRuleValue(index, 'condition', e.target.value)}>
                                        <option id={'less'} value={'less'} selected={rule.condition === 'less'}>Less</option>
                                        <option id={'less_or_eq'} value={'less_or_eq'} selected={rule.condition === 'less_or_eq'}>Less or Equal</option>
                                        <option id={'eq'} value={'eq'} selected={rule.condition === 'eq'}>Equal</option>
                                        <option id={'grt_or_eq'} value={'grt_or_eq'} selected={rule.condition === 'grt_or_eq'}>Greater or Equal</option>
                                        <option id={'grt'} value={'grt'} selected={rule.condition === 'grt'}>Greater</option>
                                    </select>) : (<span>{rule.condition}</span>)}
                                </div>
                                <div className={'col value_type'}>
                                    {isEditing ? (<select name={'value_type'} onChange={e => setAutoconsumeRuleValue(index, 'value_type', e.target.value)}>
                                        <option id={'exact'} value={'exact'} selected={rule.value_type === 'exact'}>Exact</option>
                                        <option id={'percentage'} value={'percentage'} selected={rule.value_type === 'percentage'}>Percentage</option>
                                    </select>) : (<span>{rule.value_type}</span>)}
                                </div>
                                <div className={'col value'}>
                                    {isEditing ? (
                                        <input
                                            type={'number'}
                                            onChange={e => setAutoconsumeRuleValue(index, 'value', e.target.value)}
                                            value={rule.value_type === 'percentage' ? Math.min(1, Math.max(0, rule.value)) : Math.max(0, rule.value)}
                                            max={rule.value_type === 'percentage' ? 100 : undefined}
                                            step={rule.value_type === 'percentage' ? 5 : 1}
                                        />
                                        ) : (<span>{rule.value}</span>)}
                                </div>
                                {isEditing ? (<div className={'col delete-rule'}>
                                    <span className={'close'} onClick={e => deleteAutoconsumeRule(index)}>
                                        X
                                    </span>
                                </div> ) : null}
                            </div>
                        ))}
                    </div>
                </div>

                {item.isSellable ? (<div className={'autoconsume-setting block'}>
                    <div className={'rules-header flex-container'}>
                        <p>Autosell rules: {item.autosell?.rules?.length ? null : 'None'}</p>
                        {isEditing ? (<button onClick={addAutosellRule}>Add rule (AND)</button>) : null}
                    </div>

                    <div className={'rules'}>
                        {item.autosell?.rules?.map((rule, index) => (
                            <div className={'rule row add-row'}>
                                <div className={'col subject'}>
                                    <span>{resources.find(r => r.id === rule.resource_id)?.name || 'Invalid'}</span>
                                </div>
                                <div className={'col condition'}>
                                    <span>{rule.condition}</span>
                                </div>
                                <div className={'col value'}>
                                    {isEditing ? (
                                        <input type={'number'}
                                               onChange={e => setAutosellRuleValue(index, 'value', e.target.value)}
                                               value={Math.max(1, rule.value)}
                                        />
                                    ) : (<span>{rule.value}</span>)}
                                </div>
                                {isEditing ? (<div className={'col delete-rule'}>
                                    <span className={'close'} onClick={e => deleteAutosellRule(index)}>
                                        X
                                    </span>
                                </div> ) : null}
                            </div>
                        ))}
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
                    <button disabled={!isChanged} onClick={onCancel}>Cancel</button>
                </div>) : null}
            </div>
        </PerfectScrollbar>
    )
}