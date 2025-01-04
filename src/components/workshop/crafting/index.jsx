import React, {useCallback, useContext, useEffect, useState} from "react";
import WorkerContext from "../../../context/worker-context";
import {useWorkerClient} from "../../../general/client";
import PerfectScrollbar from "react-perfect-scrollbar";
import {EffectsSection} from "../../shared/effects-section.jsx";
import {formatInt, formatValue} from "../../../general/utils/strings";
import {Crafting} from "./crafting.jsx";
import {ResourceCost} from "../../shared/resource-cost.jsx";
import {ResourceComparison} from "../../shared/resource-comparison.jsx";
import RulesList from "../../shared/rules-list.jsx";
import {cloneDeep} from "lodash";

export const CraftingWrap = ({ children }) => {

    const worker = useContext(WorkerContext);

    const { onMessage, sendData } = useWorkerClient(worker);

    const [detailOpened, setDetailOpened] = useState(null);

    const [newUnlocks, setNewUnlocks] = useState({});

    const [listDetails, setListDetails] = useState(null)


    useEffect(() => {
        const interval2 = setInterval(() => {
            sendData('query-new-unlocks-notifications', { suffix: 'crafting', scope: 'workshop' })
        }, 1000)
        return () => {
            clearInterval(interval2);
        }
    }, [])

    onMessage('new-unlocks-notifications-crafting', payload => {
        setNewUnlocks(payload);
    })

    const setItemDetails = (id) => {
        if(!id) {
            setDetailOpened(null);
        } else {
            setDetailOpened(id);
        }
    }

    const setItemLevel = useCallback((id, level) => {
        sendData('set-crafting-level', { id, level, filterId: 'crafting' });
    })

    onMessage('crafting-list-data', (payload) => {
        console.log(`currViewing LIST: `, payload, listDetails);
        if(!listDetails) return;

        setListDetails({
            ...listDetails,
            listData: payload,
            isEdit: listDetails.isEdit,
            isLoading: false,
        })

    })

    onMessage('crafting-list-effects', (payload) => {
        setListDetails({
            ...listDetails,
            listData: {
                ...listDetails.listData,
                potentialEffects: payload.potentialEffects,
                resourcesEffects: payload.resourcesEffects,
                effectEffects: payload.effectEffects,
                prevEffects: payload.prevEffects
            }
        })
    })

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

    useEffect(() => {
        console.log('Called select list', listDetails);
    }, [listDetails])

    const addItemToList = useCallback(({id, name}) => {
        console.log('Add recipe to list', id, listDetails);
        if(listDetails?.listData && listDetails?.isEdit) {
            if(id) {
                console.log('Insert recipe to list: ', id, listDetails);
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
                    sendData('query-crafting-list-effects', { listData: newList });
                }
            }
        }
    }, [listDetails]);

    const openListDetails = (list) => {
        if(list.listData?.id) {
            console.log('loading list: ', list);
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
                    category: 'crafting',
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

    const onCloseList = () => {
        setListDetails(null);
    }

    return (<div className={'items-wrap'}>

        <div className={'items ingame-box'}>
            <div className={'head'}>
                {children}
            </div>
            <Crafting filterId={'crafting'} setItemDetails={setItemDetails} setItemLevel={setItemLevel} newUnlocks={newUnlocks.workshop?.items?.crafting?.items} openListDetails={openListDetails} addItemToList={addItemToList}/>
        </div>

        <div className={`item-detail ingame-box detail-blade ${listDetails?.listData && (listDetails?.isEdit || !detailOpened) ? 'wide-blade' : ''}`}>
            {listDetails?.listData && (listDetails?.isEdit || !detailOpened) ? (<CraftingListDetails
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
                onCloseList={onCloseList}
            />) : null}
            {detailOpened && !listDetails?.isEdit ? (<ItemDetails itemId={detailOpened} category={'crafting'}/>) : null}
        </div>
    </div>)

}


export const ItemDetails = ({itemId, category}) => {

    const worker = useContext(WorkerContext);

    const { onMessage, sendData } = useWorkerClient(worker);

    const [item, setDetailOpened] = useState(null);

    useEffect(() => {
        console.log('Details: ', itemId, category);
        if(category === 'crafting') {
            const interval = setInterval(() => {
                sendData('query-crafting-details', { id: itemId });
            }, 200);

            return () => {
                clearInterval(interval);
            }
        }

    }, [itemId])


    onMessage('crafting-details', (items) => {
        console.log('CraftDetails: ', items)
        setDetailOpened(items);
    })

    /*onMessage('plantation-details', (items) => {
        console.log('PlantDetails: ', items)
        setDetailOpened(items);
    })*/

    if(!itemId || !item) return null;


    return (
        <PerfectScrollbar>
            <div className={'blade-inner'}>
                <div className={'block'}>
                    <h4>{item.name} (x{formatInt(item.level)})</h4>
                    <div className={'description'}>
                        {item.description}
                    </div>
                </div>
                {item.bottleNeck ? (<div className={'block'}>
                    <p className={'hint'}>This activity running at {formatValue(item.efficiency*100)}% due to missing {item.bottleNeck.name}</p>
                </div> ) : null}
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
                            : (<EffectsSection effects={item.effects} maxDisplay={10}/>)
                        }
                    </div>
                </div>
            </div>
        </PerfectScrollbar>
    )
}


export const CraftingListDetails = ({
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
   onCloseList
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

    if(!listDetails) return ;

    return (
        <PerfectScrollbar>
            <div className={'blade-inner list-editor'}>
                <div className={'block'}>
                    <div className={'main-row main-wrap'}>
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
                                            ? (<span>Min: <input type={'number'} value={recipe.min}
                                                                 onChange={(e) => onUpdateActionFromList(recipe.id, 'min', +e.target.value)}/></span>)
                                            : (<span>Min: {recipe.min}</span>)
                                        }
                                    </div>
                                    <div className={'col amount'}>
                                        {isEditing
                                            ? (<span>Max: <input type={'number'} value={recipe.max}
                                                            onChange={(e) => onUpdateActionFromList(recipe.id, 'max', +e.target.value)}/></span>)
                                            : (<span>Max: {recipe.max}</span>)
                                        }
                                    </div>
                                    <div className={'col amount'}>
                                        {isEditing
                                            ? (<span><input type={'number'} value={recipe.percentage}
                                                            onChange={(e) => onUpdateActionFromList(recipe.id, 'percentage', +e.target.value)}/></span>)
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
                        isAutoCheck={true}
                    />
                </div>
                {isEditing ? (<div className={'buttons'}>
                    <button onClick={() => saveAndClose(false)}>{editing?.id ? 'Save' : 'Create'}</button>
                    <button onClick={() => saveAndClose(true)}>{editing?.id ? 'Save & Close' : 'Create & Close'}</button>
                    <button onClick={onCloseList}>Cancel</button>
                </div>) : null}
            </div>
        </PerfectScrollbar>
    )
}