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
import RulesList from "../shared/rules-list.jsx";
import {cloneDeep} from "lodash";

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
    const [isChanged, setChanged] = useState(false);

    useEffect(() => {
        const id = viewedOpenedId ?? detailOpenedId?.id;
        if(id !== null) {
            if(!viewedOpenedId && isChanged) {
                return;
            }
            sendData('query-spell-details', { id });
        }
    }, [viewedOpenedId, detailOpenedId]);

    useEffect(() => {
        console.log('SpellChanged: ', isChanged)
    }, [isChanged])

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
            console.log('Edit: ', id, detailOpenedId, isChanged);
            if(detailOpenedId && isChanged) {
                if(!confirm(`This will discard all your changes to ${detailOpenedId.name}. Are you sure`)) {
                    return;
                }
            }
            setViewedOpenedId(null);
            setDetailOpenedId({id, name});
            setChanged(false);
        }
    }, [isChanged, detailOpenedId])

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
            const newEdit = cloneDeep(editData);
            newEdit.autocast.rules.push({
                resource_id: resources[0].id,
                condition: 'less_or_eq',
                value_type: 'percentage',
                value: 50,
            })
            setEditData(newEdit);
            setChanged(true);
        }
    }, [editData])

    const onDeleteAutoconsumeRule = useCallback((index) => {
        if(editData) {
            const newEdit = cloneDeep(editData);
            newEdit.autocast.rules.splice(index)
            setEditData(newEdit);
            setChanged(true);
        }
    }, [editData])

    const onSetAutoconsumeRuleValue = useCallback((index, key, value) => {
        if(editData) {
            const newEdit = cloneDeep(editData);
            newEdit.autocast.rules[index] = {
                ...newEdit.autocast.rules[index],
                [key]: value
            }
            setEditData(newEdit);
            setChanged(true);
        }
    }, [editData])

    const onSave = useCallback(() => {
        console.log('saving: ', editData);
        sendData('save-spell-settings', editData);
        setChanged(false);
    })

    const onCancel = useCallback(() => {
        setViewedOpenedId(null);
        setDetailOpenedId(null);
        setEditData(null);
        setViewedData(null);
        setChanged(false);
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
                        {spellData.available.map(item => <SpellCard isChanged={isChanged} key={item.id} {...item} onPurchase={purchaseItem} onFlash={handleFlash} onShowDetails={setSpellDetailsView} onEditConfig={setSpellDetailsEdit}/>)}
                        {overlayPositions.map((position, index) => (
                            <FlashOverlay key={index} position={position} />
                        ))}
                    </div>
                </PerfectScrollbar>
            </div>
            <div className={'item-detail ingame-box detail-blade'}>
                {editData || viewedData ? (<SpellDetails isChanged={isChanged} editData={editData} viewedData={viewedData} resources={resources} onAddAutoconsumeRule={onAddAutoconsumeRule} onSetAutoconsumeRuleValue={onSetAutoconsumeRuleValue} onDeleteAutoconsumeRule={onDeleteAutoconsumeRule} onSave={onSave} onCancel={onCancel}/>) : null}
            </div>
        </div>

    )

}

export const SpellCard = React.memo(({ id, isChanged, name, isCasted, cooldownProg, isActive, cooldown, onFlash, onPurchase, onShowDetails, onEditConfig}) => {
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

    if(prevProps.isChanged !== currProps.isChanged) {
        return false;
    }
    // console.log('Rerender: ', prevProps, curr);
    return true;
}))

export const SpellDetails = React.memo(({isChanged, editData, viewedData, resources, onAddAutoconsumeRule, onSetAutoconsumeRuleValue, onDeleteAutoconsumeRule, onSave, onCancel}) => {

    const item = viewedData ? viewedData : editData;

    let isEditing = !!editData && !viewedData;


    if(!item) return null;

    const addAutoconsumeRule = () => {
        onAddAutoconsumeRule()
    }

    const setAutoconsumeRuleValue = (index, key, value) => {
        onSetAutoconsumeRuleValue(index, key, value)
    }

    const deleteAutoconsumeRule = index => {
        onDeleteAutoconsumeRule(index);
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
                        <p>Autospell rules: </p>
                        {isEditing ? (<button onClick={addAutoconsumeRule}>Add rule (AND)</button>) : null}
                    </div>

                    <RulesList
                        isEditing={isEditing}
                        rules={item.autocast?.rules || []}
                        resources={resources}
                        deleteRule={deleteAutoconsumeRule}
                        setRuleValue={setAutoconsumeRuleValue}
                    />

                </div>
                {isEditing ? (<div className={'buttons flex-container'}>
                    <button disabled={!isChanged} onClick={onSave}>Save</button>
                    <button disabled={!isChanged} onClick={onCancel}>Cancel</button>
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
});