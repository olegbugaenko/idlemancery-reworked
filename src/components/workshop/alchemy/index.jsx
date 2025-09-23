import React, {useCallback, useContext, useEffect, useState, createContext} from "react";
import WorkerContext from "../../../context/worker-context";
import {useWorkerClient} from "../../../general/client";
import PerfectScrollbar from "react-perfect-scrollbar";
import {EffectsSection} from "../../shared/effects-section.jsx";
import {formatInt, formatValue} from "../../../general/utils/strings";
import {ResourceCost} from "../../shared/resource-cost.jsx";
import {Alchemy} from "./alchemy.jsx";
import {ResourceComparison} from "../../shared/resource-comparison.jsx";
import {cloneDeep} from "lodash";
import RulesList from "../../shared/rules-list.jsx";
import StatRow from "../../shared/stat-row.jsx";
import {useAppContext} from "../../../context/ui-context";
import {TippyWrapper} from "../../shared/tippy-wrapper.jsx";
import {HowToSign} from "../../shared/how-to-sign.jsx";
import {useTutorial} from "../../../context/tutorial-context";

const InterfaceSettingsContext = createContext();

export { InterfaceSettingsContext };

export const AlchemyWrap = ({ children }) => {

    const worker = useContext(WorkerContext);

    const { isMobile } = useAppContext();
    const [isDetailVisible, setDetailVisible] = useState(!isMobile);
    const [showNumericInputs, setShowNumericInputs] = useState(() => {
        const saved = localStorage.getItem('alchemy-show-numeric-inputs');
        return saved ? JSON.parse(saved) : false;
    });

    const { stepIndex, unlockNextById, jumpOver, currentTourId } = useTutorial();

    const { onMessage, sendData, removeMessage } = useWorkerClient(worker);

    const handleShowNumericInputsChange = useCallback((value) => {
        setShowNumericInputs(value);
        localStorage.setItem('alchemy-show-numeric-inputs', JSON.stringify(value));
    }, []);

    const [detailOpened, setDetailOpened] = useState(null);

    const [newUnlocks, setNewUnlocks] = useState({});

    const [listDetails, setListDetails] = useState(null)


    useEffect(() => {
        const interval2 = setInterval(() => {
            sendData('query-new-unlocks-notifications', { suffix: 'alchemy', scope: 'workshop' })
        }, 1000)
        return () => {
            clearInterval(interval2);
        }
    }, [])

    useEffect(() => {
        onMessage('new-unlocks-notifications-alchemy', payload => {
            setNewUnlocks(payload);
        });
        
        return () => {
            removeMessage('new-unlocks-notifications-alchemy');
        };
    }, []);

    const setItemDetails = (id) => {
        if(currentTourId === 'alchemy' && [3,9].includes(stepIndex)) {
            return;
        }
        if(!id) {
            setDetailOpened(null);
        } else {
            setDetailOpened(id);
        }
    }

    const setItemLevel = useCallback((id, effort) => {
        if(currentTourId === 'alchemy' && effort > 0) {
            unlockNextById(6);
        }
        sendData('set-crafting-level', { id, effort, filterId: 'alchemy' });
    })

    useEffect(() => {
        onMessage('crafting-list-data', (payload) => {
            if(!listDetails) return;

            setListDetails({
                ...listDetails,
                listData: payload,
                isEdit: listDetails.isEdit,
                isLoading: false,
            })
        });
        
        return () => {
            removeMessage('crafting-list-data');
        };
    }, [listDetails]);

    useEffect(() => {
        onMessage('crafting-list-effects', (payload) => {
            setListDetails({
                ...listDetails,
                listData: {
                    ...listDetails.listData,
                    potentialEffects: payload.potentialEffects,
                    resourcesEffects: payload.resourcesEffects,
                    effectEffects: payload.effectEffects,
                    prevEffects: payload.prevEffects,
                    assumedDistribution: payload.assumedDistribution,
                }
            })
        });
        
        return () => {
            removeMessage('crafting-list-effects');
        };
    }, [listDetails]);

    const setAutotriggerPriority = useCallback((priority) => {
        const { listData } = listDetails ?? {};
        if(listData) {
            const newList = cloneDeep(listData);
            if(!newList.autotrigger) {
                newList.autotrigger = {};
            }
            if(!newList.autotrigger.rules) {
                newList.autotrigger.rules = [];
            }
            newList.autotrigger.priority = priority;
            setListDetails({...listDetails, listData: {...newList}});
        }
    }, [listDetails]);

    const onSetAutotriggerPattern = useCallback(pattern => {
        const { listData } = listDetails ?? {};
        if(listData) {
            const newList = cloneDeep(listData);
            if(!newList.autotrigger) {
                newList.autotrigger = {};
            }
            if(!newList.autotrigger.rules) {
                newList.autotrigger.rules = [];
            }
            newList.autotrigger.pattern = pattern;
            setListDetails({...listDetails, listData: {...newList}});
        }
    }, [listDetails]);


    const onAddAutotriggerRule = useCallback(() => {
        const { listData } = listDetails ?? {};
        if(listData) {
            const newList = cloneDeep(listData);
            if(!newList.autotrigger) {
                newList.autotrigger = {};
            }
            if(!newList.autotrigger.rules) {
                newList.autotrigger.rules = [];
            }
            newList.autotrigger.rules.push({
                resource_id: 'mage_xp',
                condition: 'less_or_eq',
                value_type: 'percentage',
                value: 50,
            });
            setListDetails({...listDetails, listData: {...newList}});
        }
    }, [listDetails])

    const onSetAutotriggerRuleValue = useCallback((index, key, value) => {
        const { listData } = listDetails ?? {};
        if(listData) {
            const newList = cloneDeep(listData);
            if(!newList.autotrigger) {
                newList.autotrigger = {};
            }
            if(!newList.autotrigger.rules) {
                newList.autotrigger.rules = [];
            }
            newList.autotrigger.rules[index] ={
                ...newList.autotrigger.rules[index],
                [key]: value
            };
            setListDetails({...listDetails, listData: {...newList}});
        }
    }, [listDetails])

    const onDeleteAutotriggerRule = useCallback((index) => {
        const { listData } = listDetails ?? {};

        if(listData) {
            const newList = cloneDeep(listData);
            if(!newList.autotrigger) {
                newList.autotrigger = {};
            }
            if(!newList.autotrigger.rules) {
                newList.autotrigger.rules = [];
            }
            newList.autotrigger.rules.splice(index);
            setListDetails({...listDetails, listData: {...newList}});
        }
    }, [listDetails])

    const onToggleAutotrigger = useCallback(() => {
        const { listData } = listDetails ?? {};
        if(listData) {
            const newList = cloneDeep(listData);
            if(!newList.autotrigger) {
                newList.autotrigger = {};
            }
            if(!newList.autotrigger.rules) {
                newList.autotrigger.rules = [];
            }
            newList.autotrigger.isEnabled = !newList.autotrigger.isEnabled;
            setListDetails({...listDetails, listData: {...newList}});
        }
    }, [listDetails])

    /*useEffect(() => {
        console.log('Called select list', listDetails);
    }, [listDetails])*/

    const addItemToList = useCallback(({id, name}) => {
        if(listDetails?.listData && listDetails?.isEdit) {
            if(id) {
                if(!listDetails.listData.recipes.find(one => one.id === id)) {
                    const newList = cloneDeep(listDetails.listData);
                    newList.recipes.push({
                        id,
                        name,
                        min: 0,
                        max: 0,
                        percentage: 25,
                    })
                    setListDetails({...listDetails, listData: {...newList}});
                    // sendData('query-crafting-list-effects', { listData: newList });
                }
            }
        }
    }, [listDetails]);

    const openListDetails = (list) => {
        if(list.listData?.id) {
            setListDetails({
                isEdit: list.isEdit,
                isLoading: true,
            })
            sendData('load-crafting-list', {
                id: list.listData?.id,
            })
        } else {
            if(!list.isEdit) {
                setListDetails(null);
                return;
            }
            setListDetails({
                ...(list || {}),
                listData: {
                    ...(list.listData || {}),
                    recipes: [],
                    category: 'alchemy',
                    autotrigger: {
                        priority: 10,
                        rules: [],
                        pattern: ''
                    }
                }
            });
        }

    }

    const onDropActionFromList = (id) => {
        const { listData } = listDetails ?? {};
        if(listData) {
            const newList = listData;
            newList.recipes = newList.recipes.filter(a => a.id !== id);
            setListDetails({...listDetails, listData: {...newList}});
            sendData('query-crafting-list-effects', { listData: newList });
        }
    }

    const onUpdateActionFromList = (id, key, value) => {
        const { listData } = listDetails ?? {};
        if(listData) {
            const newList = listData;
            newList.recipes = newList.recipes.map(a => a.id !== id ? a : {...a, [key]: value});
            setListDetails({...listDetails, listData: {...newList}});
            sendData('query-crafting-list-effects', { listData: newList });
        }
    }

    const onUpdateListValue = (key, value) => {
        const { listData } = listDetails ?? {};
        if(listData) {
            const newList = listData;
            newList[key] = value;
            setListDetails({...listDetails, listData: {...newList}});
            // sendData('query-action-list-effects', { id });
        }
    }

    const onApplyCurrent = () => {
        sendData('query-running-craft-for-list', { category: 'alchemy' });
    }

    useEffect(() => {
        onMessage('running-craft-for-list', recipes => {
            const { listData } = listDetails ?? {};
            const newList = listData;
            listData.recipes = recipes;
            setListDetails({...listDetails, listData: {...newList}});
            sendData('query-crafting-list-effects', { listData: newList });
        });
        
        return () => {
            removeMessage('running-craft-for-list');
        };
    }, [listDetails]);

    const onCloseList = () => {
        setListDetails(null);
    }

    return (<div className={'items-wrap alchemy-workshop-wrap'}>
        <InterfaceSettingsContext.Provider value={{ showNumericInputs, setShowNumericInputs: handleShowNumericInputsChange }}>
            <div className={'items ingame-box'}>
                <div className={'menu-wrap workshop'}>
                    <div className={'head'}>
                        {children}
                    </div>
                    <div className={'flex-container additional-filters'}>
                        {isMobile ? (<div>
                            <span className={'highlighted-span'} onClick={() => setDetailVisible(true)}>Info</span>
                        </div>) : null}
                        <HowToSign scope={'alchemy'} />
                    </div>
                </div>
                <Alchemy filterId={'alchemy'} setItemDetails={setItemDetails} setItemLevel={setItemLevel} newUnlocks={newUnlocks.workshop?.items?.alchemy?.items} openListDetails={openListDetails} addItemToList={addItemToList} isEditList={listDetails?.isEdit} setShowNumericInputs={handleShowNumericInputsChange}/>
            </div>

            {(!isMobile || isDetailVisible || listDetails?.listData || detailOpened) ? (<div className={`item-detail ingame-box detail-blade ${listDetails?.listData && (listDetails?.isEdit || !detailOpened) ? 'wide-blade' : ''} ${listDetails?.listData ? 'forced-bottom' : ''}`}>
                {listDetails?.listData && (listDetails?.isEdit || !detailOpened) ? (<AlchemyListDetails
                    listDetails={listDetails.listData}
                    isEditing={listDetails.isEdit}
                    onUpdateActionFromList={onUpdateActionFromList}
                    onDropActionFromList={onDropActionFromList}
                    onUpdateListValue={onUpdateListValue}
                    onAddAutotriggerRule={onAddAutotriggerRule}
                    onSetAutotriggerRuleValue={onSetAutotriggerRuleValue}
                    onDeleteAutotriggerRule={onDeleteAutotriggerRule}
                    setAutotriggerPriority={setAutotriggerPriority}
                    onSetAutotriggerPattern={onSetAutotriggerPattern}
                    onToggleAutotrigger={onToggleAutotrigger}
                    onCloseList={onCloseList}
                    onApplyCurrent={onApplyCurrent}
                />) : null}
                {(detailOpened && !listDetails?.isEdit) ? (<ItemDetails itemId={detailOpened} category={'alchemy'} setItemDetails={setItemDetails}/>) : null}
                {!detailOpened && !listDetails?.listData ? (<GeneralStats setDetailVisible={setDetailVisible}/>) : null}
            </div>) : null}
        </InterfaceSettingsContext.Provider>
    </div>)

}


export const ItemDetails = ({itemId, category, setItemDetails}) => {

    const worker = useContext(WorkerContext);

    const { isMobile } = useAppContext()
    const { onMessage, sendData } = useWorkerClient(worker);

    const { stepIndex, unlockNextById, jumpOver, currentTourId } = useTutorial();

    const [item, setDetailOpened] = useState(null);

    useEffect(() => {
        console.log('Details: ', itemId, category);
        if(category === 'alchemy') {
            const interval = setInterval(() => {
                sendData('query-crafting-details', { id: itemId });
            }, 200);

            return () => {
                clearInterval(interval);
            }
        }
        /*if(category === 'plantation') {
            const interval = setInterval(() => {
                sendData('query-plantation-details', { id: itemId });
            }, 200);

            return () => {
                clearInterval(interval);
            }
        }*/

    }, [itemId])


    onMessage('crafting-details', (items) => {
        setDetailOpened(items);
    })

    /*onMessage('plantation-details', (items) => {
        console.log('PlantDetails: ', items)
        setDetailOpened(items);
    })*/

    if(!itemId || !item) return null;

    if(currentTourId === 'alchemy') {
        unlockNextById(2);
        unlockNextById(8);
    }


    return (
        <PerfectScrollbar>
            <div className={'blade-inner recipe-details'}>
                <div className={'block'}>
                    <h4>{item.name}</h4>
                    <div className={'description'}>
                        {item.description}
                    </div>
                </div>
                <div className={'block efficiency-block'}>
                    {item.rebalanceInfo ? (
                        <p className={`hint ${item.rebalanceInfo.isBeneficial ? 'green' : 'yellow'}`}>
                            Alchemy Intensity {item.rebalanceInfo.isBeneficial ? 'increased' : 'reduced'} to {formatValue(item.rebalanceInfo.currentEffort * 100)}% due to missing {item.rebalanceInfo.missingResource}
                        </p>
                    ) : item.bottleNeck && item.efficiency < 1 ? (
                        <p className={'hint yellow'}>This activity running at {formatValue(item.efficiency*100)}% due to missing {item.bottleNeck.name}</p>
                    ) : (
                        <p className={'hint'}>Running 100% Efficient</p>
                    )}
                </div>
                <div className={'block'}>
                    <p>Cost:</p>
                    <div className={'costs-wrap'}>
                        {Object.values(item.affordable.affordabilities || {}).map(aff => <ResourceCost affordabilities={aff}/>)}
                    </div>
                </div>
                <div className={'block'}>
                    <p>Effects:</p>
                    <div className={'effects'}>
                        {item.currentEffects ?
                            (<ResourceComparison effects1={item.currentEffects} effects2={item.potentialEffects}/>)
                            : (<EffectsSection effects={item.effects} maxDisplay={10} isShowBalance={true}/>)
                        }
                    </div>
                </div>
                {isMobile ? (<div className={'block buttons'}>
                    <button onClick={() => setItemDetails(null)}>Close</button>
                </div>) : null}
            </div>
        </PerfectScrollbar>
    )
}

export const AlchemyListDetails = ({
    listDetails,
    isEditing,
    onUpdateActionFromList,
    onDropActionFromList,
    onUpdateListValue,
    onAddAutotriggerRule,
    onSetAutotriggerRuleValue,
    onDeleteAutotriggerRule,
    setAutotriggerPriority,
    onSetAutotriggerPattern,
    onCloseList,
    onToggleAutotrigger,
    onApplyCurrent
}) => {

    const worker = useContext(WorkerContext);

    const { onMessage, sendData } = useWorkerClient(worker);

    const [editing, setEditing] = useState({ recipes: []
    })

    useEffect(() => {
        console.log('SET EDITING LIST: ', listDetails);
        setEditing(listDetails);
    }, [listDetails])

    const saveAndClose = (isClose) => {
        console.log('Saving: ', editing);
        if(!isClose) {
            editing.isReopenEdit = true;
        }
        sendData('save-crafting-list', editing);
        if(isClose) {
            onCloseList();
        }
    }

    const addAutotriggerRule = () => {
        onAddAutotriggerRule()
    }

    const setAutotriggerRuleValue = (index, key, value) => {
        onSetAutotriggerRuleValue(index, key, value)
    }

    const deleteAutotriggerRule = index => {
        onDeleteAutotriggerRule(index);
    }

    const setAutotriggerPattern = (pattern) => {
        onSetAutotriggerPattern(pattern)
    }

    const toggleAutotrigger = () => {
        onToggleAutotrigger()
    }

    const applyCurrent = () => {
        onApplyCurrent()
    }

    if(!listDetails) return ;

    return (
        <>
            <div className={'blade-outer'}>
                <PerfectScrollbar>
                    <div className={'blade-inner list-editor'}>
                        <div className={'block main-wrap'}>
                            <div className={'main-row'}>
                                <span>Name</span>
                                {isEditing ? (<input type={'text'} value={editing.name} onChange={(e) => onUpdateListValue('name', e.target.value)}/>) : (<span>{editing.name}</span>)}
                            </div>
                        </div>
                        <div className={'block'}>
                            <p>Click on craft recipes to add/remove them from the list</p>
                            <div className={'recipes-list'}>
                                <div className="actions-list-wrap">
                                    {editing.recipes.length ? editing.recipes.map((recipe, index) => (
                                        <div className={`action-row flex-container ${!recipe.isAvailable ? 'unavailable-recipe' : ''}`}
                                        >
                                            <div className={'col title'}>
                                                <span>{recipe.name}</span>
                                            </div>
                                            <div className={'col amount'}>
                                                {isEditing
                                                    ? (<span>Effort, %<input className={'set-level-for-list'} type={'range'} min={0} max={1} value={recipe.effort} step={0.001}
                                                                             onChange={(e) => onUpdateActionFromList(recipe.id, 'effort', Math.round(+e.target.value * 1000) / 1000)}/></span>)
                                                    : (<span> {recipe.percentage}%</span>)
                                                }
                                            </div>
                                            <div className={'col delete'}>
                                                {isEditing ? (<span className={'close'} onClick={() => onDropActionFromList(recipe.id)}>X</span>) : null}
                                            </div>
                                        </div>
                                    )) : <p className={'hint'}>No map recipes added yet</p>}
                                </div>
                            </div>
                            {isEditing ? (<div className={'apply-current block'}>
                                <button onClick={applyCurrent}>Apply Running Recipes</button>
                            </div> ) : null}
                        </div>
                        <div className={'effects-wrap'}>
                            {Object.keys(editing?.resourcesEffects || {}).length ? (<div className={'block'}>
                                <p>Average Resources per second</p>
                                <ResourceComparison effects1={editing?.prevEffects} effects2={editing?.resourcesEffects} maxDisplay={10}/></div>) : null}
                            {editing?.effectEffects?.length ? (<div className={'block'}>
                                <p>Average Effects per second</p>
                                <EffectsSection effects={editing?.effectEffects || []} maxDisplay={10}/></div>) : null}
                        </div>
                        {/*{editing.drops ? (<div className={'block'}>
                            <p>Drops:</p>
                            {editing.drops.map(drop => (<p className={'drop-row'}>
                                <span className={'name'}>{drop.resource.name}</span>
                                <span className={'probability'}>{formatValue(drop.probability*100)}%</span>
                                <span className={'amounts'}>{formatInt(drop.amountMin)} - {formatInt(drop.amountMax)}</span>
                            </p> ))}
                        </div> ) : null}
                        {editing.costs ? (<div className={'block'}>
                            <p>Costs:</p>
                            {editing.costs.map(cost => (
                                <p><span>{cost.name}:</span> <span>{formatValue(cost.cost)}</span></p>
                            ))}
                        </div> ) : null}*/}
                        <div className={'autotrigger-settings autoconsume-setting block'}>
                            <div className={'rules-header flex-container'}>
                                <p>Autotrigger rules: {editing?.autotrigger?.rules?.length ? null : 'None'}</p>
                                <label>
                                    <input type={'checkbox'} checked={editing.autotrigger?.isEnabled ?? undefined} onChange={toggleAutotrigger}/>
                                    {editing.autotrigger?.isEnabled ? ' ON' : ' OFF'}
                                </label>
                                {isEditing ? (<button onClick={addAutotriggerRule}>Add rule (AND)</button>) : null}
                            </div>
                            <div className={'priority-line flex-container'}>
                                <p>Priority: </p>
                                <input type={'number'} value={editing.autotrigger?.priority || 0} onChange={e => setAutotriggerPriority(+(e.target.value || 0))}/>
                            </div>
                            <RulesList
                                isEditing={isEditing}
                                rules={editing.autotrigger?.rules || []}
                                deleteRule={deleteAutotriggerRule}
                                setRuleValue={setAutotriggerRuleValue}
                                setPattern={setAutotriggerPattern}
                                pattern={editing.autotrigger?.pattern || ''}
                                isAutoCheck={editing.autotrigger?.isEnabled}
                            />
                        </div>
                    </div>
                </PerfectScrollbar>
            </div>
            {isEditing ? (<div className={'buttons'}>
                <button className={'primary-action'} onClick={() => saveAndClose(false)}>{editing?.id ? 'Save' : 'Create'}</button>
                <button className={'primary-action'} onClick={() => saveAndClose(true)}>{editing?.id ? 'Save & Close' : 'Create & Close'}</button>
                <button className={'warning-action'} onClick={onCloseList}>Cancel</button>
            </div>) : null}
        </>
    )
}


export const GeneralStats = ({ setDetailVisible }) => {

    const { showNumericInputs, setShowNumericInputs } = useContext(InterfaceSettingsContext);

    const [data, setData] = useState({
        isProducingEffort: false,
        stats: {}
    });

    const worker = useContext(WorkerContext);

    const { isMobile } = useAppContext();

    const { onMessage, sendData } = useWorkerClient(worker);

    useEffect(() => {
        sendData('query-crafting-general-data', { filterId: 'alchemy' })
        const interval = setInterval(() => {
            sendData('query-crafting-general-data', { filterId: 'alchemy' })
        }, 500);

        return () => {
            clearInterval(interval);
        }
    }, [])

    onMessage('crafting-general-data', data => {
        setData(data)
    })

    const hasEffect = useCallback((stat) => {
        if(!stat?.value) return false;
        return !stat.isMultiplier || Math.abs(stat?.value - 1.0) > 1.e-7;
    }, [])

    return (
        <PerfectScrollbar>
            <div className={'blade-inner'}>
                <div className={'block'}>
                    <h4>Alchemy</h4>
                    <p className={'hint separated'}>You can brew multiple items at once by assigning alchemy effort to different recipes. Assigning more effort to crafting of specific resource will make crafting faster increasing both input and output</p>
                </div>
                <div className={'block'}>
                    <p>General Stats</p>
                    {Object.values(data.stats).map(stat => (<div>
                        {hasEffect(stat) ? (<StatRow stat={stat} />) : null}
                    </div> ))}
                </div>
                {isMobile ? (<div className={'block buttons'}>
                    <button onClick={() => setDetailVisible(false)}>Close</button>
                </div>) : null}
            </div>
        </PerfectScrollbar>
    )
}

