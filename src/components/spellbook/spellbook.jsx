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

export const Spellbook = ({}) => {

    const worker = useContext(WorkerContext);

    const { onMessage, sendData } = useWorkerClient(worker);
    const [spellData, setItemsData] = useState({
        available: [],
        current: undefined
    });
    const [detailOpenedId, setDetailOpenedId] = useState(null); // here should be object containing id and rules
    const [viewedOpenedId, setViewedOpenedId] = useState(null);
    const [editData, setEditData] = useState(null);
    const [viewedData, setViewedData] = useState(null);
    const [resources, setResources] = useState([]);

    useEffect(() => {
        const id = viewedOpenedId ?? detailOpenedId?.id;
        if(id !== null) {
            sendData('query-spell-details', { id });
        }
    }, [viewedOpenedId, detailOpenedId])

    useEffect(() => {
        const interval = setInterval(() => {
            sendData('query-spell-data', {});
        }, 100);
        sendData('query-all-resources', {});
        return () => {
            clearInterval(interval);
        }
    }, [])

    onMessage('all-resources', (payload) => {
        setResources(payload);
    })

    onMessage('spell-details', (payload) => {
        console.log(`currViewing: ${viewedOpenedId}, edit: ${detailOpenedId}`, payload);
        if(viewedOpenedId) {
            setViewedData(payload);
        } else if(detailOpenedId) {
            setEditData(payload);
            setViewedData(null);
        }

    })

    onMessage('spell-data', (spell) => {
        setItemsData(spell);
    })

    const purchaseItem = useCallback((id) => {
        sendData('use-spell', { id, amount: 1 })
    })

    const setSpellDetailsEdit = useCallback(({id, name}) => {
        if(id) {
            if(detailOpenedId) {
                if(!confirm(`This will discard all your changes to ${detailOpenedId.name}. Are you sure`)) {
                    return;
                }
            }
            setViewedOpenedId(null);
            setDetailOpenedId({id, name});
        }
    })

    const setSpellDetailsView = useCallback((id) => {
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
            newEdit.autocast.rules.push({
                resource_id: resources[0].id,
                condition: 'less_or_eq',
                value_type: 'percentage',
                value: 50,
            })
            setEditData(newEdit);
        }
    }, [editData])

    const onSetAutoconsumeRuleValue = useCallback((index, key, value) => {
        if(editData) {
            const newEdit = editData;
            newEdit.autocast.rules[index] = {
                ...newEdit.autocast.rules[index],
                [key]: value
            }
            setEditData(newEdit);
        }
    }, [editData])

    const onSave = useCallback(() => {
        console.log('saving: ', editData);
        sendData('save-spell-settings', editData);
    })

    const onCancel = useCallback(() => {
        setViewedOpenedId(null);
        setDetailOpenedId(null);
        setEditData(null);
        setViewedData(null);
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
        <div className={'spell-wrap'}>
            <div className={'ingame-box spell'}>
                <PerfectScrollbar>
                    <div className={'flex-container'}>
                        {spellData.available.map(item => <SpellCard key={item.id} {...item} onPurchase={purchaseItem} onFlash={handleFlash} onShowDetails={setSpellDetailsView} onEditConfig={setSpellDetailsEdit}/>)}
                        {overlayPositions.map((position, index) => (
                            <FlashOverlay key={index} position={position} />
                        ))}
                    </div>
                </PerfectScrollbar>
            </div>
            <div className={'item-detail ingame-box detail-blade'}>
                {editData || viewedData ? (<SpellDetails editData={editData} viewedData={viewedData} resources={resources} onAddAutoconsumeRule={onAddAutoconsumeRule} onSetAutoconsumeRuleValue={onSetAutoconsumeRuleValue} onSave={onSave} onCancel={onCancel}/>) : null}
            </div>
        </div>

    )

}

export const SpellCard = React.memo(({ id, name, isCasted, cooldownProg, isActive, cooldown, onFlash, onPurchase, onShowDetails, onEditConfig}) => {
    const elementRef = useRef(null);

    useFlashOnLevelUp(isCasted, onFlash, elementRef);

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

    return (<div ref={elementRef} className={`icon-card item flashable spell-card  ${isActive ? 'active' : ''}`} onMouseEnter={() => onShowDetails(id)} onMouseLeave={() => onShowDetails(null)} onClick={handleClick} onContextMenu={handleContextMenu}>
        <div className={'icon-content'}>
            <CircularProgress progress={cooldownProg}>
                <img src={`icons/spells/${id}.png`} className={'resource'} />
            </CircularProgress>
        </div>
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

    if(prevProps.isCasted !== currProps.isCasted) {
        return false;
    }
    // console.log('Rerender: ', prevProps, curr);
    return true;
}))

export const SpellDetails = ({editData, viewedData, resources, onAddAutoconsumeRule, onSetAutoconsumeRuleValue, onSave, onCancel}) => {

    const item = viewedData ? viewedData : editData;

    let isEditing = !!editData && !viewedData;


    if(!item) return null;

    const addAutoconsumeRule = () => {
        onAddAutoconsumeRule()
    }

    const setAutoconsumeRuleValue = (index, key, value) => {
        onSetAutoconsumeRuleValue(index, key, value)
    }


    return (
        <PerfectScrollbar>
            <div className={'blade-inner'}>
                <div className={'block'}>
                    <h4>{item.name}{item.currentDuration && item.currentDuration > 0 ? `  ${secondsToString(item.currentDuration)}` : ''}</h4>
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
                {item.duration ? (
                    <div className={'block'}>
                        <p>Spell duration: {formatInt(item.duration)}</p>
                        <p>Effects during cast:</p>
                        <EffectsSection effects={item.potentialEffects} maxDisplay={10} />
                    </div>
                ): null}
                <div className={'autoconsume-setting'}>
                    <div className={'rules-header flex-container'}>
                        <p>Autoconsumption rules: </p>
                        {isEditing ? (<button onClick={addAutoconsumeRule}>Add rule (AND)</button>) : null}
                    </div>

                    <div className={'rules'}>
                        {item.autocast?.rules?.map((rule, index) => (
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
                                        <input type={'number'}  onChange={e => setAutoconsumeRuleValue(index, 'value', e.target.value)} value={rule.value_type === 'percentage' ? Math.min(1, rule.value) : rule.value} max={rule.value_type === 'percentage' ? 1 : undefined}/>
                                        ) : (<span>{rule.value}</span>)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                {isEditing ? (<div className={'buttons flex-container'}>
                    <button onClick={onSave}>Save</button>
                    <button onClick={onCancel}>Cancel</button>
                </div>) : null}
            </div>
        </PerfectScrollbar>
    )
}