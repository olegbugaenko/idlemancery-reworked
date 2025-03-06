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
import {NewNotificationWrap} from "../layout/new-notification-wrap.jsx";
import {useAppContext} from "../../context/ui-context";

export const Spellbook = ({}) => {

    const worker = useContext(WorkerContext);

    const { isMobile } = useAppContext();
    const [isDetailVisible, setDetailVisible] = useState(!isMobile);


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
    const [newUnlocks, setNewUnlocks] = useState({});

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
        // console.log('SpellChanged: ', isChanged)
    }, [isChanged]);

    useEffect(() => {
        // console.log('New editData: ', editData);
    }, [editData])

    useEffect(() => {
        const interval = setInterval(() => {
            sendData('query-spell-data', {});
        }, 100);
        sendData('query-all-resources', {});
        const interval2 = setInterval(() => {
            sendData('query-new-unlocks-notifications', { suffix: 'spellbook', scope: 'spellbook' })
        }, 1000)
        return () => {
            clearInterval(interval);
        }
    }, [])

    onMessage('new-unlocks-notifications-spellbook', payload => {
        setNewUnlocks(payload);
    })

    onMessage('all-resources', (payload) => {
        setResources(payload);
    })

    onMessage('spell-details', (payload) => {
        // console.log(`currViewing: ${viewedOpenedId}, edit: ${detailOpenedId}`, payload);
        if(viewedOpenedId) {
            setViewedData(payload);
        } else if(detailOpenedId) {
            setEditData(payload);
            setViewedData(null);
        }

    })

    onMessage('spell-level-effects', (payload) => {
        if(editData) {
            setEditData({
                ...editData,
                effects: payload.effects,
                potentialEffects: payload.potentialEffects,
                affordable: payload.affordable,
                xpRate: payload.xpRate,
            });
        }
    })

    onMessage('spell-data', (spell) => {
        setItemsData(spell);
    })

    const purchaseItem = useCallback((id) => {
        sendData('use-spell', { id, amount: 1 })
    })

    const setSpellDetailsEdit = useCallback(({id, name}) => {
        sendData('set-monitored', { scope: 'effects', type: 'spell', id });
        if(id) {
            // console.log('Edit: ', id, detailOpenedId, isChanged);
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
        sendData('set-monitored', { scope: 'effects', type: 'spell', id });
        if(!id) {
            setViewedOpenedId(null);
            setViewedData(null);
            return;
        }
        setViewedOpenedId(id)

    })

    const onChangeLevel = useCallback((level) => {
        if(editData) {
            const newEdit = cloneDeep(editData);
            newEdit.actualLevel = level;
            setEditData(newEdit);
            setChanged(true);
            sendData('get-spell-level-effects', { id: editData.id, level })
        }
    }, [editData])

    const onSetAutocastPattern = useCallback(pattern => {
        if(editData) {
            const newEdit = cloneDeep(editData);
            if(!newEdit.autocast) {
                newEdit.autocast = {};
            }
            if(!newEdit.autocast.rules) {
                newEdit.autocast.rules = [];
            }
            newEdit.autocast.pattern = pattern;
            setEditData({...newEdit});
            setChanged(true);
        }
    }, [editData]);

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
            newEdit.autocast.rules.splice(index, 1)
            setEditData(newEdit);
            setChanged(true);
        }
    }, [editData])

    const onSetAutoconsumeRuleValue = useCallback((index, key, value) => {
        setEditData(prevEditData => {
            if (!prevEditData) return prevEditData;
            const newEdit = cloneDeep(prevEditData);
            newEdit.autocast.rules[index] = {
                ...newEdit.autocast.rules[index],
                [key]: value
            };
            // console.log('Setting Value with updated editData: ', newEdit);
            return newEdit;
        });
        setChanged(true);
    }, [editData])

    useEffect(() => {
        // console.log('New version of onSetAutoconsumeRuleValue created with editData:', editData);
    }, [onSetAutoconsumeRuleValue]);

    const onToggleAutotrigger = useCallback(() => {
        if(editData) {
            const newEdit = cloneDeep(editData);
            if(!newEdit.autocast) {
                newEdit.autocast = {};
            }
            newEdit.autocast.isEnabled = !newEdit.autocast.isEnabled;
            setEditData(newEdit);
            setChanged(true);
        }
    }, [editData])

    const onSave = useCallback(() => {
        // console.log('saving: ', editData);
        sendData('save-spell-settings', editData);
        setChanged(false);
        if(isMobile) {
            onCancel()
        }
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
        // console.log('Adding flash: ', position);
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
                        {spellData.available.map(item => <NewNotificationWrap id={`spell_${item.id}`} className={'narrow-wrapper'} isNew={newUnlocks.spellbook?.items?.spellbook?.items?.all?.items?.[`spell_${item.id}`]?.hasNew}>
                                <SpellCard isChanged={isChanged} key={item.id} {...item} onPurchase={purchaseItem} onFlash={handleFlash} onShowDetails={setSpellDetailsView} onEditConfig={setSpellDetailsEdit} isMobile={isMobile}/>
                            </NewNotificationWrap>
                            )}
                        {overlayPositions.map((position, index) => (
                            <FlashOverlay key={index} position={position} />
                        ))}
                    </div>
                </PerfectScrollbar>
            </div>
            {(!isMobile || editData || viewedData) ? (<div className={'item-detail ingame-box detail-blade'}>
                {editData || viewedData ? (
                    <SpellDetails isChanged={isChanged} editData={editData} viewedData={viewedData}
                                  resources={resources} onAddAutoconsumeRule={onAddAutoconsumeRule}
                                  onSetAutoconsumeRuleValue={onSetAutoconsumeRuleValue}
                                  onDeleteAutoconsumeRule={onDeleteAutoconsumeRule}
                                  onSetAutocastPattern={onSetAutocastPattern} onChangeLevel={onChangeLevel}
                                  onSave={onSave} onCancel={onCancel} onToggleAutotrigger={onToggleAutotrigger}
                                  automationUnlocked={spellData.automationUnlocked}
                                  isMobile={isMobile}
                                  onPurchase={purchaseItem}
                    />) : null}
            </div>) : null}
        </div>

    )

}

export const SpellCard = React.memo(({ id, isChanged, name, isCasted, cooldownProg, isActive, cooldown, onFlash, onPurchase, onShowDetails, onEditConfig, isMobile}) => {
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
        // console.log('Triger onpurchase: ', id);
        onPurchase(id); // Your custom right-click action
    };

    // RERENDERING
    // console.log('Item: ', id, cooldownProg, cooldown);

    return (<div ref={elementRef} className={`icon-card item bigger flashable spell-card  ${isActive ? 'active' : ''}`} onMouseEnter={() => !isMobile ? onShowDetails(id) : null} onMouseLeave={() => !isMobile ? onShowDetails(null) : null} onClick={handleClick} onContextMenu={handleContextMenu}>
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

export const SpellDetails = React.memo(({isChanged, editData, viewedData, resources, onAddAutoconsumeRule, onSetAutoconsumeRuleValue, onDeleteAutoconsumeRule, onSetAutocastPattern, onChangeLevel, onSave, onCancel, onToggleAutotrigger, automationUnlocked, isMobile, onPurchase}) => {

    const item = cloneDeep(viewedData ? viewedData : editData);

    let isEditing = !!editData && !viewedData;

    const [spellDetails, setSpellDetails] = useState(null);

    const worker = useContext(WorkerContext);

    const { onMessage, sendData } = useWorkerClient(worker);

    useEffect(() => {
        if(!item) return ;
        sendData('query-spell-details', { id: item.id, prefix: 'detail' })
        const timeout = setInterval(() => {
            sendData('query-spell-details', { id: item.id, prefix: 'detail' })
        }, 500)

        return () => {
            clearInterval(timeout);
        }
    }, [item?.id]);

    onMessage('detail-spell-details', (data) => {
        setSpellDetails(data);
    })


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

    const setAutocastPattern = pattern => {
        onSetAutocastPattern(pattern);
    }

    const toggleAutotrigger = () => {
        onToggleAutotrigger();
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
                {item.isSpellLevelingAvailable ? (<div className={'block'}>
                    <div className={'bottom'}>
                        <div className={'xp-box'}>
                            <span className={'xp-text'}>XP: {formatInt(item.xp)}/{formatInt(item.maxXP)}</span>
                            <span className={'xp-income'}>+{formatValue(item.xpRate)} / Cast</span>
                        </div>
                        <div>
                            <ProgressBar className={'action-progress'} percentage={item.xp/item.maxXP}></ProgressBar>
                        </div>
                    </div>
                    <div className={'set-level'}>
                        <span>Set level to </span>
                        <input type={'number'} value={item.actualLevel} min={1} max={item.maxLevel} onChange={e => onChangeLevel(Math.floor(+e.target.value))}/>
                        <span>of {item.maxLevel}</span>
                    </div>
                    <p className={'hint'}>Increasing level will increase spells cost and consumption but also increase their output</p>
                </div> ) : null}
                <div className={'block'}>
                    <p>Cooldown: {formatValue(item.cooldown)} seconds</p>
                    <p>Price reduction <span className={'hint'}>(Based on max level)</span>: x{formatValue(item.maxLevelCostReduction)}</p>
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
                {isMobile ? (<div className={'cast-block block'}>
                    <button disabled={!spellDetails || !spellDetails.affordable?.isAffordable || spellDetails.currentDuration > 0 || spellDetails.currentCooldown > 0} onClick={() => onPurchase(item.id)}>Cast Spell</button>
                    {spellDetails?.currentDuration ? (<p className={'small'}>Running: {secondsToString(spellDetails?.currentDuration)}</p>) : null}
                    {spellDetails?.currentCooldown ? (<p className={'small'}>Cooldown: {secondsToString(spellDetails?.currentCooldown)}</p>) : null}
                </div>) : null}
                {automationUnlocked ? (<div className={'autoconsume-setting'}>
                    <div className={'rules-header flex-container'}>
                        <p>Autospell rules: </p>
                        <label>
                            <input type={'checkbox'} checked={item.autocast?.isEnabled} onChange={toggleAutotrigger}/>
                            {item.autocast?.isEnabled ? ' ON' : ' OFF'}
                        </label>
                        {isEditing ? (<button onClick={addAutoconsumeRule}>Add rule (AND)</button>) : null}
                    </div>

                    <RulesList
                        isEditing={isEditing}
                        rules={item.autocast?.rules || []}
                        resources={resources}
                        pattern={item.autocast?.pattern}
                        deleteRule={deleteAutoconsumeRule}
                        setRuleValue={setAutoconsumeRuleValue}
                        setPattern={setAutocastPattern}
                        isAutoCheck={item.autocast?.isEnabled}
                    />

                </div>) : null}
                {isEditing ? (<div className={'buttons flex-container'}>
                    <button disabled={!isChanged} onClick={onSave}>Save</button>
                    <button disabled={!isChanged && !isMobile} onClick={onCancel}>Cancel</button>
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
        console.log('editData not equals: ', currentProps.editData?.autocast?.rules, prevProps.editData?.autocast?.rules)
        return false;
    }

    if(prevProps.viewedData !== currentProps.viewedData) {
        //console.log('viewedChng: ', prevProps.viewedData, currentProps.viewedData)
        return false;
    }

    return true;
});