import React, {useContext, useEffect, useRef, useState} from "react";
import WorkerContext from "../../context/worker-context";
import {useWorkerClient} from "../../general/client";
import {formatInt, formatValue, secondsToString} from "../../general/utils/strings";
import {ProgressBar} from "../layout/progress-bar.jsx";
import PerfectScrollbar from "react-perfect-scrollbar";
import {EffectsSection} from "../shared/effects-section.jsx";
import {FlashOverlay} from "../layout/flash-overlay.jsx";
import {useFlashOnLevelUp} from "../../general/hooks/flash";
import {TippyWrapper} from "../shared/tippy-wrapper.jsx";
import {ResourceComparison} from "../shared/resource-comparison.jsx";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

export const Actions = ({}) => {

    const worker = useContext(WorkerContext);

    const { onMessage, sendData } = useWorkerClient(worker);
    const [actionsData, setActionsData] = useState({
        available: [],
        current: undefined,
        actionCategories: [],
        actionLists: []
    });
    const [detailOpened, setDetailOpened] = useState(null);
    const [editingList, setEditingList] = useState(null);
    const [viewingList, setViewingList] = useState(null);
    const [listData, setListData] = useState(null);
    const [viewedData, setViewedData] = useState(null);

    // const [filterId, setFilterId] = useState('all');

    useEffect(() => {
        const interval = setInterval(() => {
            sendData('query-actions-data', {  });
        }, 100);
        return () => {
            clearInterval(interval);
        }
    }, [])

    useEffect(() => {
        const id = viewingList ?? editingList;
        if(id !== null) {
            sendData('load-action-list', { id });
        }
    }, [editingList, viewingList])


    onMessage('actions-data', (actions) => {
        setActionsData(actions);
    })

    onMessage('action-list-data', (payload) => {
        console.log(`currViewing: ${viewingList}, edit: ${editingList}`, payload);
        if(viewingList) {
            setViewedData(payload);
        } else if(editingList || payload.bForceOpen) {
            if(payload.bForceOpen && !editingList) {
                setEditingList(payload.id);
                console.log('Set Editing to: ', payload);
            }
            setListData(payload);
            setViewedData(null);
        }

    })

    onMessage('action-list-effects', (payload) => {
        if(listData) {
            setListData({
                ...listData,
                potentialEffects: payload.potentialEffects,
                resourcesEffects: payload.resourcesEffects,
                effectEffects: payload.effectEffects,
                prevEffects: payload.prevEffects
            })
        }
    })

    const activateAction = (id) => {
        sendData('run-action', { id, isForce: true })
    }

    const setActionsFilter = (filterId) => {
        sendData('set-selected-actions-filter', { filterId })
    }

    const setActionDetails = (id) => {
        console.log('SettingOpened: ', id);
        if(!id) {
            setDetailOpened(null);
        } else {
            setDetailOpened(id);
        }
    }

    const editListToDetails = (id) => {
        if(id) {
            setViewingList(null);
            setEditingList(id);
        } else {
            console.log('Create new list. Setting listData')
            setViewingList(null);
            setEditingList(null);
            setListData({ name: '', actions: []})
        }
    }

    const viewListToDetails = (id) => {
        if(!id) {
            setViewedData(null);
        }
        setViewingList(id)

    }

    const onSelectAction = ({id, name, level}) => {
        if(listData) {
            const newList = listData;
            newList.actions.push({
                id,
                name,
                time: 2,
                isAvailable: true,
            })
            setListData(newList);
            sendData('query-action-list-effects', { listData: newList });
        }
    }

    const onDropActionFromList = (id) => {
        if(listData) {
            const newList = listData;
            newList.actions = newList.actions.filter(a => a.id !== id);
            setListData(newList);
            sendData('query-action-list-effects', { listData: newList });
        }
    }

    const onUpdateActionFromList = (id, key, value) => {
        if(listData) {
            const newList = listData;
            newList.actions = newList.actions.map(a => a.id !== id ? a : {...a, [key]: value});
            setListData(newList);
            sendData('query-action-list-effects', { listData: newList });
        }
    }

    const onUpdateListValue = (key, value) => {
        console.log('Updating: ', key, value, listData, viewedData);
        if(listData) {
            const newList = listData;
            newList[key] = value;
            setListData(newList);
            // sendData('query-action-list-effects', { id });
        }
    }

    const onCloseList = () => {
        setEditingList(null);
        setListData(null);
    }

    const [overlayPositions, setOverlayPositions] = useState([]);

    const handleFlash = (position) => {
        console.log('Adding flash: ', position);
        setOverlayPositions((prev) => [...prev, position]);
        setTimeout(() => {
            setOverlayPositions((prev) => prev.filter((p) => p !== position));
        }, 1000);
    };

    const onDragEnd = (result) => {
        const { source, destination, draggableId } = result;

        if (!destination) return;

        const sourceDroppableId = source.droppableId;
        const destinationDroppableId = destination.droppableId;

        // Розбираємо draggableId
        const [type, actionId, actionIndex] = draggableId.split('-');

        if (sourceDroppableId === 'available-actions' && destinationDroppableId === 'action-list-editor') {
            const action = actionsData.available.find(a => a.id.toString() === actionId);
            if (action) {
                const newListData = { ...listData };
                newListData.actions = Array.from(newListData.actions);
                newListData.actions.splice(destination.index, 0, {
                    id: action.id,
                    name: action.name,
                    time: 2,
                    isAvailable: true,
                });
                setListData(newListData);
                sendData('query-action-list-effects', { listData: newListData });
            }
        } else if (
            sourceDroppableId === 'action-list-editor' &&
            destinationDroppableId === 'action-list-editor'
        ) {
            const newActions = Array.from(listData.actions);
            const [movedAction] = newActions.splice(source.index, 1);
            newActions.splice(destination.index, 0, movedAction);

            const newListData = { ...listData, actions: newActions };
            setListData(newListData);
            sendData('query-action-list-effects', { listData: newListData });
        }
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className={'actions-wrap'}>
                <div className={'ingame-box actions'}>

                    <div className={'categories flex-container'}>
                        <ul className={'menu'}>
                            {actionsData.actionCategories.map(category => (<li className={`category ${category.isSelected ? 'active' : ''}`} onClick={() => setActionsFilter(category.id)}><span>{category.name}({category.items.length})</span></li> ))}
                        </ul>

                    </div>
                    <div className={'list-wrap'}>
                        <PerfectScrollbar>
                            <div>
                                <Droppable droppableId="available-actions" isDropDisabled={true}>
                                    {(provided) => (
                                        <div ref={provided.innerRef} {...provided.droppableProps} className="flex-container">
                                            {actionsData.available.map((action, index) => <ActionCard isEditingList={!!listData} index={index} key={action.id} {...action} onFlash={handleFlash} onActivate={activateAction} onShowDetails={setActionDetails} onSelect={onSelectAction}/>)}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                                {overlayPositions.map((position, index) => (
                                        <FlashOverlay key={index} position={position} />
                                ))}
                            </div>
                        </PerfectScrollbar>
                    </div>

                    {actionsData.actionListsUnlocked ? (<ActionListsPanel editListToDetails={editListToDetails} lists={actionsData.actionLists} viewListToDetails={viewListToDetails} runningList={actionsData.runningList}/>) : null}
                </div>
                <div className={'action-detail ingame-box detail-blade'}>
                    <DetailBlade
                        actionId={detailOpened}
                        editListId={editingList}
                        listData={listData}
                        viewListId={viewingList}
                        onUpdateActionFromList={onUpdateActionFromList}
                        onDropActionFromList={onDropActionFromList}
                        onUpdateListValue={onUpdateListValue}
                        onCloseList={onCloseList}
                        viewedData={viewedData}
                    />
                </div>
            </div>
        </DragDropContext>

    )

}

export const DetailBlade = ({ actionId, viewListId, viewedData, editListId, listData, onUpdateActionFromList, onDropActionFromList, onUpdateListValue, onCloseList }) => {

    if(listData) {
        return (<ListEditor
            listData={listData}
            editListId={editListId}
            onUpdateActionFromList={onUpdateActionFromList}
            onDropActionFromList={onDropActionFromList}
            onUpdateListValue={onUpdateListValue}
            onCloseList={onCloseList}
            isEditing={true}
        />)
    }

    if(actionId) {
        return (<ActionDetails actionId={actionId} />)
    }

    if(viewedData) {
        return (<ListEditor
            listData={viewedData}
            editListId={viewListId}
            onUpdateActionFromList={onUpdateActionFromList}
            onDropActionFromList={onDropActionFromList}
            onUpdateListValue={onUpdateListValue}
            onCloseList={onCloseList}
            isEditing={false}
        />)
    }

    if(listData || editListId) {
        return (<ListEditor
            listData={listData}
            editListId={editListId}
            onUpdateActionFromList={onUpdateActionFromList}
            onDropActionFromList={onDropActionFromList}
            onUpdateListValue={onUpdateListValue}
            onCloseList={onCloseList}
            isEditing={true}
        />)
    }

    return null;
}

export const ActionCard = ({ id, isEditingList, index, name, level, max, xp, maxXP, xpRate, isActive, isLeveled, focused, isTraining, actionEffect, currentEffects, potentialEffects, onFlash, onSelect, onActivate, onShowDetails, ...props}) => {
    const elementRef = useRef(null);

    useFlashOnLevelUp(isLeveled, onFlash, elementRef);

    const comp = (
        <Draggable key={`available-${id}`} draggableId={`available-${id}`} index={index} isDragDisabled={!isEditingList}>
            {(provided) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`card action ${isActive ? 'active' : ''} flashable`} onMouseEnter={() => onShowDetails(id)} onMouseLeave={() => onShowDetails(null)} onClick={() => onSelect({
                    id,
                    name,
                    level
                })}>
                    <div className={'head'}>
                        <p className={'title'}>{name}</p>
                        <span className={'level'}>{formatInt(level)}{max ? `/${formatInt(max)}` : ''}</span>
                    </div>
                    <div className={'bottom'}>
                        <div className={'xp-box'}>
                            <span className={'xp-text'}>XP: {formatInt(xp)}/{formatInt(maxXP)}</span>
                            <span className={'xp-income'}>+{formatValue(xpRate)}</span>
                        </div>

                        <div>
                            <ProgressBar className={'action-progress'} percentage={xp/maxXP}></ProgressBar>
                        </div>
                        <div className={'buttons'}>
                            {isActive ? <button onClick={() => onActivate()}>Stop</button> : <button onClick={() => onActivate(id)}>Start</button> }
                            {focused && focused.isFocused ? (
                                <TippyWrapper content={<div className={'hint-popup'}>
                                    {!focused.isCapped
                                        ? (<p>You are running this action for {secondsToString(focused.focusTime)}</p>)
                                        : (<p>Your focus is capped at {secondsToString(focused.cap)}</p>)
                                    }
                                    <p>Focus providing x{formatValue(focused.focusBonus)} to your learning speed</p>
                                </div> }>
                                    <div className={'icon-content focused-icon'}>
                                        <img src={"icons/interface/focused.png"}/>
                                    </div>
                                </TippyWrapper>
                            ) : null}
                        </div>
                    </div>
                </div>
                )}
        </Draggable>
    );

    if(!isEditingList) return comp;

    return (<TippyWrapper content={<div className={'hint-popup effects-popup'}>
        <div className={'block'}>
            <p>Action Effects</p>
            <div className={'effects'}>
                <EffectsSection effects={actionEffect} maxDisplay={10}/>
            </div>
        </div>
        {isTraining ? (
            <div className={'block'}>
                <p>Action LevelUp bonuses</p>
                <div className={'effects'}>
                    <ResourceComparison effects1={currentEffects} effects2={potentialEffects} />
                </div>
            </div>
        ) : null}
    </div> }>
        <div>
            {comp}
        </div>
    </TippyWrapper>)
}

export const ActionDetails = ({actionId}) => {

    const worker = useContext(WorkerContext);

    const { onMessage, sendData } = useWorkerClient(worker);

    const [action, setDetailOpened] = useState(null);

    const [interval, setIntervalRef] = useState(null);

    useEffect(() => {
        const intervalLoc = setInterval(() => {
            sendData('query-action-details', { id: actionId });
        }, 100);
        setIntervalRef(intervalLoc);

        return () => {
            clearInterval(intervalLoc);
        }
    }, [])


    onMessage('action-details', (actions) => {
        setDetailOpened(actions);
    })

    if(!actionId || !action) return null;

    return (
        <ActionDetailsComponent {...action} />
    )
}

export const ActionDetailsComponent = React.memo(({...action}) => {
    // console.log('re-render');
    return (<PerfectScrollbar>
        <div className={'blade-inner'}>
            <div className={'block'}>
                <h4>{action.name}</h4>
                <div className={'description'}>
                    {action.description}
                </div>
            </div>
            <div className={'block'}>
                <div className={'tags-container'}>
                    {action.tags.map(tag => (<div className={'tag'}>{tag}</div> ))}
                </div>
            </div>
            <div className={'block'}>
                <div className={'bottom'}>
                    <div className={'xp-box'}>
                        <span className={'xp-text'}>XP: {formatInt(action.xp)}/{formatInt(action.maxXP)}</span>
                        <span className={'xp-income'}>+{formatValue(action.xpRate)}</span>
                    </div>

                    <div>
                        <ProgressBar className={'action-progress'} percentage={action.xp/action.maxXP}></ProgressBar>
                    </div>
                </div>
            </div>
            {action.primaryAttribute ? (<div className={'block'}>

                <p>Primary Attribute: {action.primaryAttribute.name} ({formatValue(action.primaryAttribute.value)}), providing {formatValue(100*action.primaryAttributeEffect)}% intensity</p>
                <p className={'hint'}>Primary attribute speeds up action, increasing both production and consumption</p>

            </div> ) : null}
            <div className={'block'}>
                <p>Action Effects</p>
                <div className={'effects'}>
                    <EffectsSection effects={action?.actionEffect} maxDisplay={10}/>
                </div>
            </div>
            {action.isTraining ? (
                <div className={'block'}>
                    <p>Action LevelUp bonuses</p>
                    <div className={'effects'}>
                        <ResourceComparison effects1={action?.currentEffects} effects2={action?.potentialEffects} />
                    </div>
                </div>
            ) : null}
        </div>
    </PerfectScrollbar>)
}, (prevProps, currentProps) => {
    if(!prevProps && !currentProps) return true;
    if(!prevProps || !currentProps) {
        console.log('One of prp null or undefined. Re-render: ', prevProps, currentProps);
        return false;
    }
    if(prevProps.level !== currentProps.level) {
        console.log('Level mismatch. Re-render: ', prevProps, currentProps);
        return false;
    }
    if(prevProps.xp !== currentProps.xp) {
        console.log('XP mismatch. Re-render: ', prevProps, currentProps);
        return false;
    }
    if(prevProps.id !== currentProps.id) {
        console.log('id mismatch. Re-render: ', prevProps, currentProps);
        return false;
    }

    if(currentProps.potentialEffects.length) {
        for(let i = 0; i < currentProps.potentialEffects.length; i++) {
            if(!prevProps.potentialEffects[i]) {
                console.log('potEff mismatch length. Re-render: ', prevProps, currentProps);
                return false;
            }

            if(prevProps.potentialEffects[i].value !== currentProps.potentialEffects[i].value) {
                console.log('One of prp of potEff mismatched: '+i+'. Re-render: ', prevProps, currentProps);
                return false;
            }
        }
    }

    return true;
})

export const ActionListsPanel = ({ runningList, editListToDetails, lists, viewListToDetails }) => {

    const worker = useContext(WorkerContext);

    const { onMessage, sendData } = useWorkerClient(worker);

    const [openedFor, setOpenedFor] = useState(null);

    useEffect(() => {
        const setOp = () => {
            console.log('setOpToNull ')
            setOpenedFor(null);
        }
        if(openedFor) {
            document.addEventListener('click', setOp);
        } else {
            document.removeEventListener('click', setOp)
        }

        return () => {
            document.removeEventListener('click', setOp)
        }
    }, [openedFor])

    const editList = (id) => {
        console.log('Set to edit: ', id);
        editListToDetails(id);
    }

    const runList = (id) => {
        sendData('run-list', { id })
        console.log('Selected list: ', id, '. Running TBD');
    }

    return (<div className={'action-lists-panel'}>
        <div className={'flex-container'}>
            <div className={'current-list panel-col'}>
                Current list: {runningList ? (<div className={'flex-container'}>
                    <span>{runningList.name}</span>
                    <div className={'icon-content stop-icon interface-icon'} onClick={() => runList(null)}>
                        <img src={"icons/interface/pause.png"}/>
                    </div>
                    <div className={'icon-content edit-icon interface-icon'} onClick={() => editList(runningList.id)}>
                        <img src={"icons/interface/edit-icon.png"}/>
                    </div>
                </div>) : 'None'}
            </div>
            <div className={'lists-editor panel-col'}>
                <button onClick={() => editListToDetails()}>Create New</button>
            </div>
            <div className={'lists-editor panel-col'}>
                <button onClick={(e) => { e.stopPropagation(); setOpenedFor('edit')}}>Pick list</button>
                <ActionListsPopup lists={lists} isOpened={openedFor === 'edit'} setOpenedFor={setOpenedFor} onSelect={editList} onRun={runList} onHover={viewListToDetails}/>
            </div>
        </div>
    </div>)
}

export const ActionListsPopup = ({ lists, isOpened, setOpenedFor, onSelect, onHover, onRun }) => {

    if(!isOpened) return null;

    return (<div className={'list-selector'}>
        {lists.map(list => (<div className={'item'} onMouseEnter={() => onHover(list.id)} onMouseLeave={() => onHover(null)}>
            <div className={'list-item-row flex-container'}>
                <span className={'list-name'}>{list.name}</span>
                <TippyWrapper content={<div className={'hint-popup'}>Run List</div> }>
                    <div className={'icon-content run-icon interface-icon small'} onClick={() => onRun(list.id)}>
                        <img src={"icons/interface/run.png"}/>
                    </div>
                </TippyWrapper>
                <TippyWrapper content={<div className={'hint-popup'}>Edit List</div> }>
                    <div className={'icon-content edit-icon interface-icon small'} onClick={() => onSelect(list.id)}>
                        <img src={"icons/interface/edit-icon.png"}/>
                    </div>
                </TippyWrapper>
            </div>

        </div> ))}
    </div> )
}

export const ListEditor = ({ editListId, listData, onUpdateActionFromList, onDropActionFromList, onUpdateListValue, onCloseList, isEditing }) => {

    const worker = useContext(WorkerContext);

    const { onMessage, sendData } = useWorkerClient(worker);

    const [editing, setEditing] = useState({ actions: [] })

    useEffect(() => {
        setEditing(listData);
    }, [listData])

    const saveAndClose = (isClose) => {
        console.log('Saving: ', editing);
        if(!isClose) {
            editing.isReopenEdit = true;
        }
        sendData('save-action-list', editing);
        if(isClose) {
            onCloseList();
        }
    }

    return (<div className={'list-editor'}>
        <div className={'main-wrap'}>
            <div className={'main-row'}>
                <span>Name</span>
                {isEditing ? (<input type={'text'} value={editing.name} onChange={(e) => onUpdateListValue('name', e.target.value)}/>) : (<span>{editing.name}</span>)}
            </div>
        </div>
        <Droppable droppableId="action-list-editor">
            {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="actions-list-wrap">
                    {editing.actions.length ? editing.actions.map((action, index) => (
                        <Draggable key={`list-${action.id}-${index}`} draggableId={`list-${action.id}-${index}`} index={index}>
                            {(provided) => (
                                <div className={`action-row flex-container ${!action.isAvailable ? 'unavailable' : ''}`}
                                     ref={provided.innerRef}
                                     {...provided.draggableProps}
                                     {...provided.dragHandleProps}
                                >
                                    <div className={'col title'}>
                                        <span>{action.name}</span>
                                    </div>
                                    <div className={'col amount'}>
                                        {isEditing
                                            ? (<input type={'number'} value={action.time}
                                                      onChange={(e) => onUpdateActionFromList(action.id, 'time', +e.target.value)}/>)
                                            : (<span>{action.time} seconds</span>)
                                        }
                                    </div>
                                    <div className={'col delete'}>
                                        {isEditing ? (<span className={'close'} onClick={() => onDropActionFromList(action.id)}>X</span>) : null}
                                    </div>
                                </div>
                            )}
                        </Draggable>
                    )) : <p className={'hint'}>Click on actions or drag & drop them to add</p>}
                    {provided.placeholder}
                </div>
            )}
        </Droppable>
        <div className={'effects-wrap'}>
            {Object.keys(editing?.resourcesEffects || {}).length ? (<div className={'block'}>
            <p>Average Resources per second</p>
            <ResourceComparison effects1={editing?.prevEffects} effects2={editing?.resourcesEffects} maxDisplay={10}/></div>) : null}
            {editing?.effectEffects?.length ? (<div className={'block'}>
            <p>Average Effects per second</p>
            <EffectsSection effects={editing?.effectEffects || []} maxDisplay={10}/></div>) : null}
        </div>
        {isEditing ? (<div className={'buttons'}>
            <button onClick={() => saveAndClose(false)}>{listData.id ? 'Save' : 'Create'}</button>
            <button onClick={() => saveAndClose(true)}>{listData.id ? 'Save & Close' : 'Create & Close'}</button>
            <button onClick={onCloseList}>Cancel</button>
        </div>) : null}
    </div> )
}