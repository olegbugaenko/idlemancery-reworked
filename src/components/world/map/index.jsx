import React, {useCallback, useContext, useEffect, useState} from "react";
import WorkerContext from "../../../context/worker-context";
import {useWorkerClient} from "../../../general/client";
import PerfectScrollbar from "react-perfect-scrollbar";
import {Map} from "./map.jsx";
import {formatInt, formatValue, secondsToString} from "../../../general/utils/strings";
import {cloneDeep} from "lodash";
import RulesList from "../../shared/rules-list.jsx";
import {HowToSign} from "../../shared/how-to-sign.jsx";

export const MapWrap = ({ children }) => {
    const [mapTileDetails, setMapTileDetails] = useState(null)

    const [listDetails, setListDetails] = useState(null)

    const worker = useContext(WorkerContext);

    const { onMessage, sendData } = useWorkerClient(worker);

    const [unlocks, setUnlocksData] = useState({});

    const [newUnlocks, setNewUnlocks] = useState({});



    useEffect(() => {
        sendData('query-unlocks', { prefix: 'world' });
        const interval = setInterval(() => {
            sendData('query-unlocks', { prefix: 'world' });
            sendData('query-new-unlocks-notifications', { suffix: 'world', scope: 'map' })
        }, 1000);
        return () => {
            clearInterval(interval);
        }
    }, [])

    onMessage('unlocks-world', (unlocks) => {
        setUnlocksData(unlocks);
    })

    onMessage('new-unlocks-notifications-world', payload => {
        // console.log('Received unlocks: ', payload);
        setNewUnlocks(payload);
    })

    onMessage('map-tile-list-data', (payload) => {
        console.log(`currViewing LIST: `, payload, listDetails);
        if(!listDetails) return;

        setListDetails({
            ...listDetails,
            listData: payload,
            isEdit: listDetails.isEdit,
            isLoading: false,
        })

    })

    onMessage('map-tile-list-effects', (payload) => {
        console.log('GOT DATA: ', payload);
        setListDetails({
            ...listDetails,
            listData: {
                ...listDetails.listData,
                drops: payload.potentialDrops,
                costs: payload.costs,
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

    const setItemDetails = useCallback(({ meta }) => {
        console.log('Called select tile', meta, listDetails);
        if(listDetails?.listData && listDetails?.isEdit) {
            if(meta) {
                console.log('Insert tile to list: ', meta, listDetails);
                if(!listDetails.listData.tiles.find(one => one.id === `${meta.i}:${meta.j}`)) {
                    const newList = cloneDeep(listDetails.listData);
                    newList.tiles.push({
                        id: `${meta.i}:${meta.j}`,
                        name: `Tile ${meta.i}:${meta.j}`,
                        i: meta.i,
                        j: meta.j,
                        time: 2,
                    })
                    setListDetails({...listDetails, listData: {...newList}});
                    sendData('query-map-tile-list-effects', { listData: newList });
                } else {
                    onDropActionFromList(`${meta.i}:${meta.j}`);
                }
            }
        } else {
            if(!meta) {
                setMapTileDetails(null);
            } else {
                setListDetails(null);
                setMapTileDetails(meta);
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
            sendData('load-map-tile-list', {
                id: list.listData?.id,
            })
        } else {
            setListDetails({
                ...(list || {}),
                listData: {
                    ...(list.listData || {}),
                    tiles: [],
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
            newList.tiles = newList.tiles.filter(a => a.id !== id);
            setListDetails({...listDetails, listData: {...newList}});
            sendData('query-map-tile-list-effects', { listData: newList });
        }
    }

    const onUpdateActionFromList = (id, key, value) => {
        const { listData } = listDetails ?? {};
        if(listData) {
            const newList = listData;
            newList.tiles = newList.tiles.map(a => a.id !== id ? a : {...a, [key]: value});
            setListDetails({...listDetails, listData: {...newList}});
            sendData('query-map-tile-list-effects', { listData: newList });
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

    return (
        <div className={'items-wrap'}>
            <div className={'items ingame-box'}>
                <div className={'menu-wrap map'}>
                    <div className={'head'}>
                        {children}
                    </div>
                    <HowToSign scope={'map'} />
                </div>
                <Map setItemDetails={setItemDetails} newUnlocks={newUnlocks?.['world']?.items?.['map']?.items} openListDetails={openListDetails} isEditList={listDetails?.isEdit}/>
            </div>

            <div className={'item-detail ingame-box detail-blade'}>
                {listDetails?.listData ? (<MapTileListDetails
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
                {(mapTileDetails && !listDetails?.listData) ? (<ItemDetails
                    itemId={mapTileDetails}
                />) : null}
            </div>
        </div>

    )

}



export const ItemDetails = ({itemId}) => {

    const worker = useContext(WorkerContext);

    const { onMessage, sendData } = useWorkerClient(worker);

    const [item, setDetailOpened] = useState(null);


    useEffect(() => {
        sendData('query-map-tile-details', itemId);
        const interval = setInterval(() => {
            // console.log('queryingMap query-map-tile-details: ', itemId)
            sendData('query-map-tile-details', itemId);
        }, 1000);

        return () => {
            clearInterval(interval);
        }

    }, [itemId])


    onMessage('map-tile-details', (items) => {
        setDetailOpened(items);
    })

    const toggleRunning = (i, j, flag) => {
        sendData('toggle-map-tile-running', { i, j, flag })
    }

    if(!itemId || !item) return null;


    return (
        <PerfectScrollbar>
            <div className={'blade-inner'}>
                <div className={'block'}>
                    <h4>{item.name}[{item.i}:{item.j}]</h4>
                    <div className={'description'}>
                        {item.description}
                    </div>
                </div>
                {item.isRunning ? (<div className={'block'}>
                    <p>Efficiency: {formatValue(100*item.efficiency)}%</p>
                    <p>Chance and amount effect: {formatValue(100*item.effEff)}%</p>
                </div> ) : null}

                {item.drops ? (<div className={'block'}>
                    <p>Drops:</p>
                    {item.drops.map(drop => (<p className={'drop-row'}>
                        <span className={'name'}>{drop.resource.name}</span>
                        <span className={'probability'}>{formatValue(drop.probability*100)}%</span>
                        <span className={'amounts'}>{formatInt(drop.amountMin)} - {formatInt(drop.amountMax)}</span>
                    </p> ))}
                    {item.unlockedUnrevealedAmount > 0 ? (<p className={'hint'}>{formatInt(item.unlockedUnrevealedAmount)} more items can be found</p> ) : null}
                </div> ) : null}
                <div className={'block'}>
                    <p>Costs:</p>
                    <div className={'stats-block costs'}>
                        {Object.values(item.cost || {}).map(cost => (
                            <p><span>{cost.name}:</span> <span>{formatValue(cost.value)}</span></p>
                        ))}
                    </div>
                </div>
                <div className={'block'}>
                    <button onClick={() => toggleRunning(item.i, item.j, !item.isRunning)}>{item.isRunning ? 'Stop' : 'Explore'}</button>
                </div>
            </div>
        </PerfectScrollbar>
    )
}

export const MapTileListDetails = ({
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

    const [editing, setEditing] = useState({ tiles: [] })

    useEffect(() => {
        console.log('SET EDITING LIST: ', listDetails);
        setEditing(listDetails);
    }, [listDetails])

    const saveAndClose = (isClose) => {
        console.log('Saving: ', editing);
        if(!isClose) {
            editing.isReopenEdit = true;
        }
        sendData('save-map-tile-list', editing);
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
                    <div className={'main-row main-wrap map'}>
                        <span>Name</span>
                        {isEditing ? (<input type={'text'} value={editing.name} onChange={(e) => onUpdateListValue('name', e.target.value)}/>) : (<span>{editing.name}</span>)}
                    </div>
                </div>
                <div className={'block'}>
                    <p>Click on tiles to add/remove them from the list</p>
                    <div className={'tiles-list'}>
                        <div className="actions-list-wrap">
                            {editing.tiles.length ? editing.tiles.map((tile, index) => (
                                        <div className={`action-row flex-container ${!tile.isAvailable ? 'unavailable-tile' : ''}`}
                                        >
                                            <div className={'col title'}>
                                                <span>{tile.name}</span>
                                            </div>
                                            <div className={'col amount'}>
                                                {isEditing
                                                    ? (<input type={'number'} value={tile.time}
                                                              onChange={(e) => onUpdateActionFromList(tile.id, 'time', +e.target.value)}/>)
                                                    : (<span>{tile.time} seconds</span>)
                                                }
                                            </div>
                                            <div className={'col delete'}>
                                                {isEditing ? (<span className={'close'} onClick={() => onDropActionFromList(tile.id)}>X</span>) : null}
                                            </div>
                                        </div>
                            )) : <p className={'hint'}>No map tiles added yet</p>}
                        </div>
                    </div>
                </div>
                {editing.drops ? (<div className={'block'}>
                    <p>Drops:</p>
                    {editing.drops.map(drop => (<p className={'drop-row'}>
                        <span className={'name'}>{drop.resource.name}</span>
                        <span className={'probability'}>{formatValue(drop.probability*100)}%</span>
                        <span className={'amounts'}>{formatInt(drop.amountMin)} - {formatInt(drop.amountMax)}</span>
                    </p> ))}
                    {editing.unlockedUnrevealedAmount > 0 ? (<p className={'hint'}>{formatInt(editing.unlockedUnrevealedAmount)} more items can be found</p> ) : null}
                </div> ) : null}
                {editing.costs ? (<div className={'block'}>
                    <p>Costs:</p>
                    {editing.costs.map(cost => (
                        <p><span>{cost.name}:</span> <span>{formatValue(cost.cost)}</span></p>
                     ))}
                </div> ) : null}
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