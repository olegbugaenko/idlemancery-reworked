import React, {useContext, useEffect, useState} from "react";
import WorkerContext from "../../context/worker-context";
import {useWorkerClient} from "../../general/client";
import {formatInt, formatValue} from "../../general/utils/strings";
import {ProgressBar} from "../layout/progress-bar.jsx";
import PerfectScrollbar from "react-perfect-scrollbar";
import {EffectsSection} from "../shared/effects-section.jsx";

export const Actions = ({}) => {

    const worker = useContext(WorkerContext);

    const { onMessage, sendData } = useWorkerClient(worker);
    const [actionsData, setActionsData] = useState({
        available: [],
        current: undefined
    });
    const [detailOpened, setDetailOpened] = useState(null);
    const [editingList, setEditingList] = useState(null);
    const [viewingList, setViewingList] = useState(null);
    const [listData, setListData] = useState(null);
    const [viewedData, setViewedData] = useState(null);

    useEffect(() => {
        const interval = setInterval(() => {
            sendData('query-actions-data', {});
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
        console.log(`currViewing: ${viewingList}, edit: ${editingList}`);
        if(viewingList) {
            setViewedData(payload);
        } else if(editingList) {
            setListData(payload);
            setViewedData(null);
        }

    })

    const activateAction = (id) => {
        sendData('run-action', { id })
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
                time: 2
            })
            setListData(newList);
        }
    }

    const onDropActionFromList = (id) => {
        if(listData) {
            const newList = listData;
            newList.actions = newList.actions.filter(a => a.id !== id);
            setListData(newList);
        }
    }

    const onUpdateActionFromList = (id, key, value) => {
        if(listData) {
            const newList = listData;
            newList.actions = newList.actions.map(a => a.id !== id ? a : {...a, [key]: value});
            setListData(newList);
        }
    }

    const onUpdateListValue = (key, value) => {
        console.log('Updating: ', key, value, listData, viewedData);
        if(listData) {
            const newList = listData;
            newList[key] = value;
            setListData(newList);
        }
    }

    const onCloseList = () => {
        setEditingList(null);
        setListData(null);
    }

    return (
        <div className={'actions-wrap'}>
            <div className={'ingame-box actions'}>
                <div className={'list-wrap'}>
                    <PerfectScrollbar>
                        <div className={'flex-container'}>
                            {actionsData.available.map(action => <ActionCard key={action.id} {...action} onActivate={activateAction} onShowDetails={setActionDetails} onSelect={onSelectAction}/>)}
                        </div>
                    </PerfectScrollbar>
                </div>
                <ActionListsPanel editListToDetails={editListToDetails} lists={actionsData.actionLists} viewListToDetails={viewListToDetails} runningList={actionsData.runningList}/>
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

    )

}

export const DetailBlade = ({ actionId, viewListId, viewedData, editListId, listData, onUpdateActionFromList, onDropActionFromList, onUpdateListValue, onCloseList }) => {

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
        />)
    }

    return null;
}

export const ActionCard = ({ id, name, level, max, xp, maxXP, xpRate, isActive, isLeveled, onSelect, onActivate, onShowDetails}) => {
    const [isFlashActive, setFlashActive] = useState(false);

    useEffect(() => {

        console.log('Leveled!', isLeveled)
        if(isLeveled) {
            setFlashActive(true);
        }

        const timer = setTimeout(() => {
            console.log('Clearing')
            setFlashActive(false);
        }, 1000); // Adjust the time as needed

        // Cleanup the timer if the component unmounts or if someProp changes before the timer finishes
        return () => clearTimeout(timer);

    }, [isLeveled]);

    return (<div className={`card action ${isActive ? 'active' : ''} flashable ${isFlashActive ? 'flash' : ''}`} onMouseEnter={() => onShowDetails(id)} onMouseLeave={() => onShowDetails(null)} onClick={() => onSelect({
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
            </div>
        </div>
    </div> )
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
            <div className={'block'}>
                <div className={'effects'}>
                    <EffectsSection effects={action.potentialEffects} />
                </div>
            </div>
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

    const [openedFor, setOpenedFor] = useState(null);

    useEffect(() => {
        const setOp = () => {
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
        console.log('Selected list: ', id, '. Running TBD');
    }

    return (<div className={'action-lists-panel'}>
        <div className={'flex-container'}>
            <div className={'current-list panel-col'}>
                Current list: {runningList ? runningList.name : 'None'}
                <button onClick={() => setOpenedFor('change')}>Change</button>
                <ActionListsPopup lists={lists} isOpened={openedFor === 'change'} setOpenedFor={setOpenedFor} onSelect={runList} onHover={viewListToDetails}/>
            </div>
            <div className={'lists-editor panel-col'}>
                <button onClick={() => editListToDetails()}>Create list</button>
            </div>
            <div className={'lists-editor panel-col'}>
                <button onClick={() => setOpenedFor('edit')}>Select & Edit</button>
                <ActionListsPopup lists={lists} isOpened={openedFor === 'edit'} setOpenedFor={setOpenedFor} onSelect={editList} onHover={viewListToDetails}/>
            </div>
        </div>
    </div>)
}

export const ActionListsPopup = ({ lists, isOpened, setOpenedFor, onSelect, onHover }) => {
    if(!isOpened) return null;

    return (<div className={'list-selector'}>
        {lists.map(list => (<div className={'item'} onClick={() => onSelect(list.id)} onMouseEnter={() => onHover(list.id)} onMouseLeave={() => onHover(null)}>{list.name}</div> ))}
    </div> )
}

export const ListEditor = ({ editListId, listData, onUpdateActionFromList, onDropActionFromList, onUpdateListValue, onCloseList }) => {

    const worker = useContext(WorkerContext);

    const { onMessage, sendData } = useWorkerClient(worker);

    const [editing, setEditing] = useState({ actions: [] })

    useEffect(() => {
        console.log('Sending request to retain list details: ', editListId);
    }, [editListId]);

    useEffect(() => {
        setEditing(listData);
    }, [listData])

    const saveAndClose = () => {
        console.log('Saving: ', editing);
        sendData('save-action-list', editing);
        onCloseList();
    }

    return (<div className={'list-editor'}>
        <div className={'main-wrap'}>
            <div className={'main-row'}>
                <span>Name</span>
                <input type={'text'} value={editing.name} onChange={(e) => onUpdateListValue('name', e.target.value)}/>
            </div>
        </div>
        <div className={'actions-list-wrap'}>
            {editing.actions.map(action => (<div className={'action-row flex-container'}>
                <div className={'col title'}>
                    <span>{action.name}</span>
                </div>
                <div className={'col amount'}>
                    <input type={'number'} value={action.time} onChange={(e) => onUpdateActionFromList(action.id, 'time', +e.target.value)}/>
                </div>
                <div className={'col delete'}>
                    <span className={'close'} onClick={() => onDropActionFromList(action.id)}>X</span>
                </div>
            </div> ))}
        </div>
        <div className={'buttons'}>
            <button onClick={saveAndClose}>{listData.id ? 'Save' : 'Create'}</button>
            <button onClick={onCloseList}>Cancel</button>
        </div>
    </div> )
}