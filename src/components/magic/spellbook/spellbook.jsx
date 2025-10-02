import React, {useCallback, useContext, useEffect, useRef, useState} from "react";
import WorkerContext from "../../../context/worker-context";
import {useWorkerClient} from "../../../general/client";
import {formatInt, formatValue, secondsToString} from "../../../general/utils/strings";
import {ProgressBar} from "../../layout/progress-bar.jsx";
import PerfectScrollbar from "react-perfect-scrollbar";
import {EffectsSection} from "../../shared/effects-section.jsx";
import CircularProgress from "../../shared/circular-progress.jsx";
import {FlashOverlay} from "../../layout/flash-overlay.jsx";
import {useFlashOnLevelUp} from "../../../general/hooks/flash";
import RulesList from "../../shared/rules-list.jsx";
import {cloneDeep} from "lodash";
import {NewNotificationWrap} from "../../shared/new-notification-wrap.jsx";
import {useAppContext} from "../../../context/ui-context";
import {TippyWrapper} from "../../shared/tippy-wrapper.jsx";
import StatRow from "../../shared/stat-row.jsx";
import {CustomButton} from "../../shared/buttons/custom-button.jsx";
import {HowToSign} from "../../shared/how-to-sign.jsx";
import {useTutorial} from "../../../context/tutorial-context";
import {playSound} from "../../../context/sounds/sound-manager";
import {useModal} from "../../../general/components/modal/index.jsx";

export const SpellbookWrap = ({ children }) => {

    const worker = useContext(WorkerContext);

    const { isMobile } = useAppContext();
    const [isDetailVisible, setDetailVisible] = useState(!isMobile);


    const { onMessage, sendData } = useWorkerClient(worker);
    const { confirm } = useModal();
    const [spellData, setItemsData] = useState({
        available: [],
        current: undefined
    });
    const [detailOpenedId, setDetailOpenedId] = useState(null); // here should be object containing id and rules
    const [viewedOpenedId, setViewedOpenedId] = useState(null);
    const [editData, setEditData] = useState(null);
    const [viewedData, setViewedData] = useState(null);
    const [resources, setResources] = useState([]);
    const resourcesRef = useRef();
    const [isChanged, setChanged] = useState(false);
    const [newUnlocks, setNewUnlocks] = useState({});


    const onToggleViewLasting = (id, flag) => {
        sendData('set-lasting-pinned', { id, flag });
    }

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
    }, [isChanged]);

    useEffect(() => {
    }, [editData])

    useEffect(() => {
        const interval = setInterval(() => {
            sendData('query-spell-data', {});
        }, 100);
        sendData('query-all-resources', { prefix: 'spellbook'});
        const interval2 = setInterval(() => {
            sendData('query-new-unlocks-notifications', { suffix: 'spellbook', scope: 'spellbook' })
        }, 1000)
        return () => {
            clearInterval(interval);
            clearInterval(interval2);
        }
    }, [])

    useEffect(() => {
        resourcesRef.current = resources;
    }, [resources]);

    onMessage('new-unlocks-notifications-spellbook', payload => {
        setNewUnlocks(payload);
    })

    onMessage('all-resources-spellbook', (payload) => {
        console.log('all-resources: ', payload);
        setResources(payload);
    })

    onMessage('spell-details', (payload) => {
        if(viewedOpenedId) {
            setViewedData(payload);
        } else if(detailOpenedId && payload.id === detailOpenedId.id) {
            setEditData(payload);
            setViewedData(null);
        }
    })

    onMessage('spell-level-effects', (payload) => {
        setEditData(prev => {
            if(prev && prev.id === payload.id) {
                return {
                    ...prev,
                    effects: payload.effects,
                    potentialEffects: payload.potentialEffects,
                    affordable: payload.affordable,
                    xpRate: payload.xpRate,
                };
            }
            return prev;
        });
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
            if(detailOpenedId && isChanged) {
                confirm({
                    title: "Switch Item",
                    message: `You have unsaved changes to ${detailOpenedId.name}. Do you want to continue to the new item (losing current changes) or stay here?`,
                    onConfirm: () => {
                        // Continue with the action - discard changes and proceed
                        setViewedOpenedId(null);
                        setDetailOpenedId({id, name});
                        setChanged(false);
                        if(id !== detailOpenedId) {
                            playSound('click');
                        }
                    },
                    onCancel: () => {
                        // User cancelled - stay in edit mode for current spell
                        // Do nothing, just return
                    },
                    confirmText: "Continue",
                    cancelText: "Stay Here"
                });
                return;
            }
            setViewedOpenedId(null);
            setDetailOpenedId({id, name});
            setChanged(false);
            if(id !== detailOpenedId) {
                playSound('click');
            }
        }
    }, [isChanged, detailOpenedId])

    const setSpellDetailsView = useCallback((id) => {
        sendData('set-monitored', { scope: 'effects', type: 'spell', id });
        if(!id || id === editData?.id) {
            setViewedOpenedId(null);
            setViewedData(null);
            return;
        }
        setViewedOpenedId(id);
        if(id !== viewedOpenedId) {
            playSound('selection');
        }

    }, [editData?.id])

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
                newEdit.autocast = { rules: [], pattern: '', isEnabled: false };
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
            
            // Safety check for resources
            if (!resourcesRef.current || !resourcesRef.current.length) {
                console.warn('No resources available for autoconsume rule');
                return;
            }
            
            // Ensure autocast structure exists
            if (!newEdit.autocast) {
                newEdit.autocast = { rules: [], pattern: '', isEnabled: false };
            }
            if (!Array.isArray(newEdit.autocast.rules)) {
                newEdit.autocast.rules = [];
            }
            
            newEdit.autocast.rules.push({
                resource_id: resourcesRef.current[0].id,
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
            
            // Ensure autocast structure exists
            if (!newEdit.autocast) {
                newEdit.autocast = { rules: [], pattern: '', isEnabled: false };
            }
            if (!Array.isArray(newEdit.autocast.rules)) {
                newEdit.autocast.rules = [];
            }
            
            newEdit.autocast.rules.splice(index, 1)
            setEditData(newEdit);
            setChanged(true);
        }
    }, [editData])

    const onSetAutoconsumeRuleValue = useCallback((index, key, value) => {
        setEditData(prevEditData => {
            if (!prevEditData) return prevEditData;
            const newEdit = cloneDeep(prevEditData);
            
            // Ensure autocast structure exists
            if (!newEdit.autocast) {
                newEdit.autocast = { rules: [], pattern: '', isEnabled: false };
            }
            if (!Array.isArray(newEdit.autocast.rules)) {
                newEdit.autocast.rules = [];
            }
            
            // Ensure rule exists at index
            if (!newEdit.autocast.rules[index]) {
                newEdit.autocast.rules[index] = {};
            }
            
            newEdit.autocast.rules[index] = {
                ...newEdit.autocast.rules[index],
                [key]: value
            };
            return newEdit;
        });
        setChanged(true);
    }, [])


    const onToggleAutotrigger = useCallback(() => {
        if(editData) {
            const newEdit = cloneDeep(editData);
            if(!newEdit.autocast) {
                newEdit.autocast = { rules: [], pattern: '', isEnabled: false };
            }
            newEdit.autocast.isEnabled = !newEdit.autocast.isEnabled;
            setEditData(newEdit);
            setChanged(true);
        }
    }, [editData])

    const onSave = useCallback(() => {
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
        setOverlayPositions((prev) => [...prev, position]);
        setTimeout(() => {
            setOverlayPositions((prev) => prev.filter((p) => p !== position));
        }, 1000);
    };

    return (
        <div className={'spell-wrap'}>
            <div className={'ingame-box spell'}>
                <div className={'menu-wrap magic'}>
                    <div className={'head'}>
                        {children}
                    </div>
                    <div className={'flex-container additional-filters'}>
                        {isMobile ? (<div>
                            <span className={'highlighted-span'} onClick={() => setDetailVisible(true)}>Info</span>
                        </div>) : null}
                        <HowToSign scope={'spellbook'} />
                    </div>
                </div>
                <div className={'magic-cat spells-list'}>
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
                                  onToggleViewLasting={onToggleViewLasting}
                    />) : (<GeneralStats setDetailVisible={setDetailVisible}/>)}
            </div>) : null}
        </div>

    )

}

export const SpellCard = React.memo(({ id, level, maxLevel, monitored, name, isCasted, cooldownProg, isActive, cooldown, onFlash, onPurchase, onShowDetails, onEditConfig, isMobile}) => {
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
        onPurchase(id); // Your custom right-click action
    };

    return (<div ref={elementRef} id={`spell_card_${id}`} className={`icon-card item bigger flashable spell-card  ${isActive ? 'active' : ''} ${monitored ?? ''}`} onMouseEnter={() => !isMobile ? onShowDetails(id) : null} onMouseLeave={() => !isMobile ? onShowDetails(null) : null} onClick={handleClick} onContextMenu={handleContextMenu}>
        <div className={'icon-content'}>
            <CircularProgress progress={cooldownProg}>
                <img src={`icons/spells/${id}.png`} className={'resource'} />
            </CircularProgress>
            {maxLevel ? (<span className={'level'}>{formatInt(level)}/{formatInt(maxLevel)}</span>) : null}
        </div>
    </div> )
}, ((prevProps, currProps) => {
    if(prevProps.id !== currProps.id) {
        return false;
    }

    if(prevProps.monitored !== currProps.monitored) {
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

    if(prevProps.level !== currProps.level) {
        return false;
    }
    return true;
}))

export const SpellDetails = React.memo(({isChanged, editData, viewedData, resources, onAddAutoconsumeRule, onSetAutoconsumeRuleValue, onDeleteAutoconsumeRule, onSetAutocastPattern, onChangeLevel, onSave, onCancel, onToggleAutotrigger, automationUnlocked, isMobile, onPurchase, onToggleViewLasting}) => {

    const item = cloneDeep(viewedData ? viewedData : editData);
    const [inputLevel, setInputLevel] = useState(item?.actualLevel || 1);

    // Sync inputLevel with actualLevel when item changes
    useEffect(() => {
        if (item?.actualLevel !== undefined) {
            setInputLevel(item.actualLevel);
        }
    }, [item?.id, item?.actualLevel]);

    let isEditing = !!editData && !viewedData;

    // Ensure item has valid structure for RulesList
    if (item && !item.autocast) {
        item.autocast = { rules: [], pattern: '', isEnabled: false };
    }
    if (item && item.autocast && !Array.isArray(item.autocast.rules)) {
        item.autocast.rules = [];
    }

    const [spellDetails, setSpellDetails] = useState(null);
    const [resourceBalances, setResourceBalances] = useState({});

    const { stepIndex, unlockNextById, jumpOver, currentTourId } = useTutorial();

    const worker = useContext(WorkerContext);

    const { onMessage, sendData, removeMessage } = useWorkerClient(worker);


    const toggleViewLasting = () => {
        onToggleViewLasting(item.id, !(spellDetails || item).show_lasting);
    }

    useEffect(() => {
        if(!item) return ;
        sendData('query-spell-details', { id: item.id, prefix: 'detail', targetLevel: inputLevel })
        const timeout = setInterval(() => {
            sendData('query-spell-details', { id: item.id, prefix: 'detail', targetLevel: inputLevel })
        }, 500)

        return () => {
            clearInterval(timeout);
        }
    }, [item?.id, inputLevel]);

    // Separate interval for resource balances to update availability
    useEffect(() => {
        if (!item?.id) return;
        
        const updateResourceBalances = () => {
            sendData('query-resource-balances-for-spell', { id: item.id });
        };
        
        updateResourceBalances();
        const interval = setInterval(updateResourceBalances, 500);

        return () => {
            clearInterval(interval);
        }
    }, [item?.id]);

    useEffect(() => {
        if(currentTourId === 'spellbook' && item.id === 'spell_magic_insight') {
            unlockNextById(5)
        }
        if(currentTourId === 'spellbook' && item.id === 'spell_focus') {
            unlockNextById(9)
        }
    }, [spellDetails?.numCasted])

    useEffect(() => {
        const handleDetailSpellDetails = (data) => {
            setSpellDetails(data);
        };
        
        const handleResourceBalances = (data) => {
            setResourceBalances(data);
        };
        
        onMessage('detail-spell-details', handleDetailSpellDetails);
        onMessage('resource-balances-for-spell', handleResourceBalances);
        
        return () => {
            removeMessage('detail-spell-details', handleDetailSpellDetails);
            removeMessage('resource-balances-for-spell', handleResourceBalances);
        };
    }, []);


    if(!item) return null;

    // Update effects with current resource availability
    const updateEffectsAvailability = (effects, balances) => {
        if (!effects || !balances) return effects;
        
        const updatedEffects = {};
        for (const [key, effect] of Object.entries(effects)) {
            updatedEffects[key] = {
                ...effect,
                isAvailable: effect.type === 'resources' && 
                           effect.scope === 'consumption'
                    ? (balances[effect.id] >= Math.abs(effect.value))
                    : true
            };

            // console.log('Effects: ', effect, balances[effect.id], balances);
        }
       
        return updatedEffects;
    };

    const effectsWithAvailability = updateEffectsAvailability(item.effects, resourceBalances);

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

    const changeLevel = (level) => {
        if(currentTourId === 'spellLevels') {
            unlockNextById(5);
        }
        setInputLevel(level);
        onChangeLevel(level);
    }

    const saveChanges = () => {
        if(currentTourId === 'spellLevels') {
            unlockNextById(7);
        }
        onSave();
    }

    if(currentTourId === 'spellbook' && isEditing) {
        if(item.id === 'spell_magic_insight') {
            unlockNextById(1);
        }
        if(item.id === 'spell_focus') {
            unlockNextById(6);
        }

    }

    if(currentTourId === 'spellLevels' && isEditing) {
        if(item.maxLevel >= 2) {
            unlockNextById(4);
        }
    }

    // console.log(`spellDet: ${spellDetails?.xpRate}, itemDet: ${item?.xpRate}`);

    return (
        <>
            <div className={'blade-outer'}>
                <PerfectScrollbar>
                    <div className={'blade-inner'}>
                        <div className={'block'}>
                            <h4>{item.name}{(spellDetails || item)?.currentDuration && (spellDetails || item)?.currentDuration > 0 ? `  ${secondsToString((spellDetails || item).currentDuration)}` : ''}</h4>
                            <div className={'description'}>
                                {item.description}
                            </div>
                        </div>
                        <div className={'block'}>
                            <div className={'tags-container'}>
                                {item.tags.map(tag => (<div className={'tag'}>{tag}</div> ))}
                            </div>
                        </div>
                        {item.isSpellLevelingAvailable ? (<div className={'block spell-xp-container'}>
                            <div className={'bottom'}>
                                <div className={'xp-box'}>
                                    <span className={'xp-text'}>XP: {formatInt((spellDetails || item)?.xp)}/{formatInt((spellDetails || item)?.maxXP)}</span>
                                    <span className={'xp-income'}>+{formatValue((spellDetails || item)?.xpRate)} / Cast</span>
                                </div>
                                <div className={'progress-bar'}>
                                    <ProgressBar className={'action-progress'} percentage={(spellDetails || item)?.xp/(spellDetails || item)?.maxXP}></ProgressBar>
                                </div>
                            </div>
                            <div className={'set-level flex-container flex-row'}>
                                <div className={'setter'}>
                                    <span>Set level to </span>
                                    <input type={'number'} value={inputLevel} min={1} max={(spellDetails || item)?.maxLevel} onChange={e => changeLevel(Math.floor(+e.target.value))}/>
                                    <span>of {(spellDetails || item)?.maxLevel}</span>
                                </div>
                                <div>
                                    <HowToSign scope={'spellLevels'}/>
                                </div>
                            </div>
                            <p className={'hint'}>Increasing level will increase spells cost and consumption but also increase their output</p>
                        </div> ) : null}
                        <div className={'block'}>
                            <p className={'spell-cooldown-block'}>Cooldown: {formatValue(item.cooldown)} seconds</p>
                            <p>Price reduction <span className={'hint'}>(Based on max level)</span>: x{formatValue(item.maxLevelCostReduction)}</p>
                        </div>
                        <div className={'block spell-effects-on-usage-block'}>
                            <p>Effects on usage:</p>
                            <div className={'effects'}>
                                <EffectsSection effects={effectsWithAvailability} useAvailabilityCheck={true}/>
                            </div>
                        </div>
                        {item.duration ? (
                            <div className={'block spell-effects-lasting-block'}>
                                <p>Effects Lasting: {formatInt(item.duration)}</p>
                                <EffectsSection effects={item.potentialEffects} maxDisplay={10}/>
                                {item.canShowLasting ? (<div className={'show-lasting'}>
                                    <CustomButton
                                        iconId={'icon_view_lasting'}
                                        className={`toggle-effect-monitor medium-sm ${spellDetails?.show_lasting ? 'highlighted' : ''}`}
                                        onClick={(e) => {toggleViewLasting()}}
                                    >{spellDetails?.show_lasting ? 'Stop showing active effects in left sidebar' : 'Show when active in left sidebar'}</CustomButton>
                                </div> ) : null}
                            </div>
                        ): null}
                        <div className={'cast-block block'}>
                            <button id={'cast-spell-btn'} disabled={!spellDetails || !spellDetails.affordable?.isAffordable || spellDetails.currentDuration > 0 || spellDetails.currentCooldown > 0} onClick={() => onPurchase(item.id)}>Cast Spell</button>
                            {spellDetails?.currentDuration ? (<p className={'small'}>Running: {secondsToString(spellDetails?.currentDuration)}</p>) : null}
                            {spellDetails?.currentCooldown ? (<p className={'small'}>Cooldown: {secondsToString(spellDetails?.currentCooldown)}</p>) : null}
                        </div>
                        {automationUnlocked ? (<div className={'autoconsume-setting'}>
                            <div className={'rules-header flex-container'}>
                                <p>Autospell rules: </p>
                                <label>
                                    <input type={'checkbox'} checked={item.autocast?.isEnabled ?? undefined} onChange={toggleAutotrigger}/>
                                    {item.autocast?.isEnabled ? ' ON' : ' OFF'}
                                </label>
                                {isEditing ? (<button onClick={addAutoconsumeRule}>Add rule (AND)</button>) : null}
                            </div>

                            <RulesList
                                key={`${item.id}-${isEditing}-${item.autocast?.rules?.length || 0}`}
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
                    </div>
                </PerfectScrollbar>
            </div>
            {isEditing ? (<div className={'main-buttons buttons flex-container'}>
                <button className={'primary-action'} id={'save-spell-button'} disabled={!isChanged} onClick={saveChanges}>Save</button>
                <button className={'warning-action'} disabled={!isChanged && !isMobile} onClick={onCancel}>Cancel</button>
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
});


export const GeneralStats = ({ setDetailVisible }) => {

    const worker = useContext(WorkerContext);

    const { isMobile } = useAppContext();

    const { onMessage, sendData } = useWorkerClient(worker);

    const [item, setDetailOpened] = useState(null);

    useEffect(() => {
        sendData('query-general-magic-stats', { });
        const interval = setInterval(() => {
            sendData('query-general-magic-stats', { });
        }, 1000);

        return () => {
            clearInterval(interval);
        }

    }, [])


    onMessage('general-magic-stats', (items) => {
        setDetailOpened(items);
    })

    const highLightMagicSchools = (id) => {
        sendData('set-monitored', { scope: 'spells', type: 'school_efficiency', id });
    }

    if(!item) return null;


    return (
        <PerfectScrollbar>
            <div className={'blade-inner'}>
                {item.general.length ? (<><div className={'block'}>
                    <h4>General Stats</h4>
                </div>
                    <div className={'block'}>
                {item.general.map(stat => (<div className={'row flex-row'}>
                    <TippyWrapper content={<div className={'hint-popup'}><p>{stat.description}</p></div>}>
                    <p>{stat.name}</p>
                    </TippyWrapper>
                    <p>{formatValue(stat.value)}</p>
                    </div> ))}
                    </div></>) : null}
                {item.magic_schools?.length ? (<><div className={'block'}>
                    <h4>Magic Schools</h4>
                </div>
                    <div className={'block'}>
                {item.magic_schools.map(stat => (
                    <StatRow onHover={highLightMagicSchools} stat={stat}/>
                ))}
                    </div></>) : null}
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