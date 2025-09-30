import React, {useCallback, useContext, useEffect, useRef, useState, createContext} from "react";
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

    const setItemDetails = useCallback((id) => {
        if(currentTourId === 'alchemy' && [3,9].includes(stepIndex)) {
            return;
        }
        if(!id) {
            setDetailOpened(null);
        } else {
            setDetailOpened(id);
        }
    }, [currentTourId, stepIndex]);

    const setItemLevel = useCallback((id, effort) => {
        if(currentTourId === 'alchemy' && effort > 0) {
            unlockNextById(6);
        }
        sendData('set-crafting-level', { id, effort, filterId: 'alchemy' });
    }, [currentTourId, unlockNextById, sendData]);

    const [newUnlocks, setNewUnlocks] = useState({});

    const [listDetails, setListDetails] = useState(null)
    const currentListIdRef = useRef(null);

    const ensureListDataShape = useCallback((rawListData = {}) => {
        const listData = { ...rawListData };
        listData.recipes = Array.isArray(listData.recipes) ? listData.recipes.map(recipe => ({ ...recipe })) : [];
        const auto = listData.autotrigger || {};
        listData.autotrigger = {
            priority: auto.priority ?? 10,
            rules: Array.isArray(auto.rules) ? auto.rules.map(rule => ({ ...rule })) : [],
            pattern: auto.pattern ?? '',
            isEnabled: auto.isEnabled ?? false,
        };
        return listData;
    }, []);

    useEffect(() => {
        const handler = (payload) => {
            if (!payload) return;
            if (currentListIdRef.current && payload.id !== currentListIdRef.current) return;
            setListDetails((prev) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    listData: ensureListDataShape(payload),
                    isLoading: false,
                };
            });
        };

        onMessage('crafting-list-data', handler);
        
        return () => {
            removeMessage('crafting-list-data');
        };
    }, [onMessage, removeMessage, ensureListDataShape]);

    useEffect(() => {
        const handler = (payload) => {
            if (!payload) return;
            if (currentListIdRef.current && payload.id !== currentListIdRef.current) return;
            setListDetails((prev) => {
                if (!prev) return prev;
                const prevListData = ensureListDataShape(prev.listData);
                return {
                    ...prev,
                    listData: ensureListDataShape({
                        ...prevListData,
                        potentialEffects: payload.potentialEffects,
                        resourcesEffects: payload.resourcesEffects,
                        effectEffects: payload.effectEffects,
                        prevEffects: payload.prevEffects,
                        assumedDistribution: payload.assumedDistribution,
                        recipes: payload.assumedDistribution || prevListData.recipes,
                    })
                };
            });
        };

        onMessage('crafting-list-effects', handler);
        
        return () => {
            removeMessage('crafting-list-effects');
        };
    }, [onMessage, removeMessage, ensureListDataShape]);

    const setAutotriggerPriority = useCallback((priority) => {
        setListDetails(prev => {
            if (!prev) return prev;
            const listData = ensureListDataShape(prev.listData);
            return {
                ...prev,
                listData: {
                    ...listData,
                    autotrigger: {
                        ...listData.autotrigger,
                        priority,
                    }
                }
            };
        });
    }, [ensureListDataShape]);

    const onSetAutotriggerPattern = useCallback(pattern => {
        setListDetails(prev => {
            if (!prev) return prev;
            const listData = ensureListDataShape(prev.listData);
            return {
                ...prev,
                listData: {
                    ...listData,
                    autotrigger: {
                        ...listData.autotrigger,
                        pattern,
                    }
                }
            };
        });
    }, [ensureListDataShape]);


    const onAddAutotriggerRule = useCallback(() => {
        setListDetails(prev => {
            if (!prev) return prev;
            const listData = ensureListDataShape(prev.listData);
            return {
                ...prev,
                listData: {
                    ...listData,
                    autotrigger: {
                        ...listData.autotrigger,
                        rules: [...listData.autotrigger.rules, {
                            resource_id: 'mage_xp',
                            condition: 'less_or_eq',
                            value_type: 'percentage',
                            value: 50,
                        }]
                    }
                }
            };
        });
    }, [ensureListDataShape])

    const onSetAutotriggerRuleValue = useCallback((index, key, value) => {
        setListDetails(prev => {
            if (!prev) return prev;
            const listData = ensureListDataShape(prev.listData);
            if (index < 0 || index >= listData.autotrigger.rules.length) return prev;
            const rules = listData.autotrigger.rules.map((rule, idx) => idx === index ? {
                ...rule,
                [key]: value,
            } : rule);
            return {
                ...prev,
                listData: {
                    ...listData,
                    autotrigger: {
                        ...listData.autotrigger,
                        rules,
                    }
                }
            };
        });
    }, [ensureListDataShape])

    const onDeleteAutotriggerRule = useCallback((index) => {
        setListDetails(prev => {
            if (!prev) return prev;
            const listData = ensureListDataShape(prev.listData);
            if (index < 0 || index >= listData.autotrigger.rules.length) return prev;
            const rules = listData.autotrigger.rules.filter((_, idx) => idx !== index);
            return {
                ...prev,
                listData: {
                    ...listData,
                    autotrigger: {
                        ...listData.autotrigger,
                        rules,
                    }
                }
            };
        });
    }, [ensureListDataShape])

    const onToggleAutotrigger = useCallback(() => {
        setListDetails(prev => {
            if (!prev) return prev;
            const listData = ensureListDataShape(prev.listData);
            return {
                ...prev,
                listData: {
                    ...listData,
                    autotrigger: {
                        ...listData.autotrigger,
                        isEnabled: !listData.autotrigger.isEnabled,
                    }
                }
            };
        });
    }, [ensureListDataShape])

    /*useEffect(() => {
        console.log('Called select list', listDetails);
    }, [listDetails])*/

    const addItemToList = useCallback(({id, name}) => {
        setListDetails(prev => {
            if(!prev?.isEdit || !prev.listData || !id) return prev;
            const listData = ensureListDataShape(prev.listData);
            if(listData.recipes.find(one => one.id === id)) return prev;

            const currentTotalEffort = listData.recipes.reduce((sum, recipe) => sum + (recipe.effort || 0), 0);
            const defaultEffort = 0.25;

            let recipes = [...listData.recipes];
            if (currentTotalEffort + defaultEffort > 1.0 && currentTotalEffort > 0) {
                const scaleFactor = (1.0 - defaultEffort) / currentTotalEffort;
                recipes = recipes.map(recipe => ({
                    ...recipe,
                    effort: (recipe.effort || 0) * scaleFactor,
                }));
            }

            const newList = {
                ...listData,
                recipes: [...recipes, {
                    id,
                    name,
                    min: 0,
                    max: 0,
                    percentage: 25,
                    effort: defaultEffort,
                }]
            };

            sendData('query-crafting-list-effects', { listData: newList });

            return {
                ...prev,
                listData: newList,
            };
        });
    }, [ensureListDataShape, sendData]);

    const openListDetails = useCallback((list) => {
        if(list.listData?.id) {
            const id = list.listData.id;
            currentListIdRef.current = id;
            setListDetails(prev => ({
                isEdit: list.isEdit,
                isLoading: true,
                listData: ensureListDataShape({
                    id,
                    ...(list.listData || {}),
                    category: list.listData?.category ?? 'alchemy',
                }),
            }))
            sendData('load-crafting-list', {
                id,
            })
        } else {
            currentListIdRef.current = null;
            if(!list.isEdit) {
                setListDetails(null);
                return;
            }
            setListDetails({
                ...(list || {}),
                isEdit: true,
                isLoading: false,
                listData: ensureListDataShape({
                    ...(list.listData || {}),
                    category: 'alchemy',
                })
            });
        }

    }, [ensureListDataShape, sendData])

    const onDropActionFromList = useCallback((id) => {
        setListDetails(prev => {
            if (!prev?.listData) return prev;
            const listData = ensureListDataShape(prev.listData);
            const recipes = listData.recipes.filter(recipe => recipe.id !== id);
            const newList = {
                ...listData,
                recipes,
            };
            sendData('query-crafting-list-effects', { listData: newList });
            return {
                ...prev,
                listData: newList,
            };
        });
    }, [ensureListDataShape, sendData])

    const onUpdateActionFromList = useCallback((id, key, value) => {
        setListDetails(prev => {
            if (!prev?.listData) return prev;
            const listData = ensureListDataShape(prev.listData);
            const recipes = listData.recipes.map(recipe => recipe.id !== id ? recipe : {
                ...recipe,
                [key]: value,
            });
            const newList = {
                ...listData,
                recipes,
            };
            sendData('query-crafting-list-effects', { listData: newList });
            return {
                ...prev,
                listData: newList,
            };
        });
    }, [ensureListDataShape, sendData])

    const onUpdateListValue = useCallback((key, value) => {
        setListDetails(prev => {
            if (!prev?.listData) return prev;
            const listData = ensureListDataShape(prev.listData);
            const newList = {
                ...listData,
                [key]: value,
            };
            return {
                ...prev,
                listData: newList,
            };
        });
    }, [ensureListDataShape])

    const onApplyCurrent = () => {
        if (listDetails?.listData?.category) {
            sendData('query-running-craft-for-list', { category: listDetails.listData.category });
        } else {
            sendData('query-running-craft-for-list', { category: 'alchemy' });
        }
    }

    useEffect(() => {
        const handler = (recipes) => {
            // if (!currentListIdRef.current) return;
            setListDetails(prev => {
                if (!prev?.listData) return prev;
                const listData = ensureListDataShape(prev.listData);
                const newList = {
                    ...listData,
                    recipes,
                };
                sendData('query-crafting-list-effects', { listData: newList });
                return {
                    ...prev,
                    listData: newList,
                };
            });
        };
        onMessage('running-craft-for-list', handler);
        
        return () => {
            removeMessage('running-craft-for-list');
        };
    }, [ensureListDataShape, onMessage, removeMessage, sendData]);

    const onCloseList = useCallback(() => {
        currentListIdRef.current = null;
        setListDetails(null);
    }, [])

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

    const [nameLocal, setNameLocal] = useState(listDetails?.name || '');

    useEffect(() => {
        console.log('lD: ', listDetails);
        // Оновлюємо локальне ім'я лише коли відкрили інший список
        setNameLocal(listDetails?.name || '');
    }, [listDetails?.id, listDetails.name == null]);

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
                                {isEditing ? (<input type={'text'} value={nameLocal} onChange={(e) => {setNameLocal(e.target.value); onUpdateListValue('name', e.target.value)}}/>) : (<span>{editing.name}</span>)}
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

