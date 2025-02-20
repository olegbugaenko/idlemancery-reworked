import React, {useCallback, useContext, useEffect, useMemo, useRef, useState} from "react";
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
import {cloneDeep} from "lodash";
import {ActionXPBreakdown} from "./action-xp-breakdown.jsx";
import {NewNotificationWrap} from "../layout/new-notification-wrap.jsx";
import {SearchField} from "../shared/search-field.jsx";
import {HowToSign} from "../shared/how-to-sign.jsx";
import {useTutorial} from "../../context/tutorial-context";
import CustomFilter from "../shared/custom-filter.jsx";
import {ActionDetails, ListEditor, GeneralStats} from "./actions-blades.jsx";
import {ActionListsPanel} from "./actions-lists.jsx";
import CustomFiltersList from "../shared/custom-filter-list.jsx";

const ACTIONS_SEARCH_SCOPES = [{
    id: 'name',
    label: 'Name',
},{
    id: 'tags',
    label: 'Tags'
},{
    id: 'description',
    label: 'description'
},{
    id: 'resources',
    label: 'resources'
},{
    id: 'effects',
    label: 'effects'
}]

export const Actions = ({}) => {

    const worker = useContext(WorkerContext);

    const { onMessage, sendData } = useWorkerClient(worker);
    const [actionsData, setActionsData] = useState({
        available: [],
        current: undefined,
        actionCategories: [],
        actionLists: [],
        automationEnabled: false,
        automationUnlocked: false,
        searchData: {
            search: '',
        },
        selectedCategory: 'all',
        stats: {},
        aspects: {
            isUnlocked: false,
            list: []
        },
        customFilters: {},
        customFiltersOrder: [],
    });
    const [detailOpened, setDetailOpened] = useState(null);
    const [editingList, setEditingList] = useState(null);
    const [viewingList, setViewingList] = useState(null);
    const [listData, setListData] = useState(null);
    const [viewedData, setViewedData] = useState(null);
    const [selectedAction, setSelectedAction] = useState(null);
    const [resources, setResources] = useState(null);
    const [newUnlocks, setNewUnlocks] = useState({});
    const [isCustomFilterOpened, setCustomFilterOpened] = useState(false);
    const [editingCustomFilter, setEditingCustomFilter] = useState(null);

    // const [filterId, setFilterId] = useState('all');

    useEffect(() => {
        const interval = setInterval(() => {
            sendData('query-actions-data', {  });
        }, 100);
        sendData('query-all-resources', {});
        const interval2 = setInterval(() => {
            sendData('query-new-unlocks-notifications', { suffix: 'actions', scope: 'actions' })
        }, 1000)

        return () => {
            clearInterval(interval);
            clearInterval(interval2);
        }
    }, [])

    useEffect(() => {
        const id = viewingList ?? editingList;
        if(id !== null) {
            sendData('load-action-list', { id });
        }
    }, [editingList, viewingList])

    onMessage('new-unlocks-notifications-actions', payload => {
        setNewUnlocks(payload);
    })

    onMessage('all-resources', (payload) => {
        setResources(payload);
    })

    onMessage('actions-data', (actions) => {
        setActionsData(actions);
    })

    onMessage('action-list-data', (payload) => {
        // console.log(`currViewing: ${viewingList}, edit: ${editingList}`, payload);
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
                prevEffects: payload.prevEffects,
                proportionsBar: payload.proportionsBar,
            })
        }
    })

    const activateAction = (id) => {
        sendData('run-action', { id, isForce: true })
    }

    const setActionsFilter = (filterId) => {
        sendData('apply-actions-custom-filter', { id: filterId })
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
                time: 1,
                isAvailable: true,
            })
            setListData({...newList});
            sendData('query-action-list-effects', { listData: newList });
        } else {
            if(selectedAction === id) {
                setSelectedAction(null)
            } else {
                setSelectedAction(id)
            }
        }
    }

    const onDropActionFromList = (id) => {
        if(listData) {
            const newList = listData;
            newList.actions = newList.actions.filter(a => a.id !== id);
            setListData({...newList});
            sendData('query-action-list-effects', { listData: newList });
        }
    }

    const onUpdateActionFromList = (id, key, value) => {
        if(listData) {
            const newList = listData;
            newList.actions = newList.actions.map(a => a.id !== id ? a : {...a, [key]: value});
            setListData({...newList});
            sendData('query-action-list-effects', { listData: newList });
        }
    }

    const onUpdateListValue = (key, value) => {
        console.log('Updating: ', key, value, listData, viewedData);
        if(listData) {
            const newList = listData;
            newList[key] = value;
            setListData({...newList});
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

        if(sourceDroppableId === 'custom-filters' && destinationDroppableId === 'custom-filters') {
            if(source.index !== destination.index) {
                sendData('actions-change-custom-filters-order', { sourceIndex: source.index, destinationIndex: destination.index })
            }
        }

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

    const setAutotriggerPriority = useCallback((priority) => {
        if(listData) {
            const newList = cloneDeep(listData);
            if(!newList.autotrigger) {
                newList.autotrigger = {};
            }
            if(!newList.autotrigger.rules) {
                newList.autotrigger.rules = [];
            }
            newList.autotrigger.priority = priority;
            setListData({...newList});
        }
    }, [listData]);

    const onSetAutotriggerPattern = useCallback(pattern => {
        if(listData) {
            const newList = cloneDeep(listData);
            if(!newList.autotrigger) {
                newList.autotrigger = {};
            }
            if(!newList.autotrigger.rules) {
                newList.autotrigger.rules = [];
            }
            newList.autotrigger.pattern = pattern;
            setListData({...newList});
        }
    }, [listData]);

    const onToggleAutotrigger = useCallback(() => {
        if(listData) {
            const newList = cloneDeep(listData);
            if(!newList.autotrigger) {
                newList.autotrigger = {};
            }
            if(!newList.autotrigger.rules) {
                newList.autotrigger.rules = [];
            }
            newList.autotrigger.isEnabled = !newList.autotrigger.isEnabled;
            setListData({...newList});
        }
    }, [listData]);


    const onAddAutotriggerRule = useCallback(() => {

        if(listData) {
            const newList = cloneDeep(listData);
            if(!newList.autotrigger) {
                newList.autotrigger = {};
            }
            if(!newList.autotrigger.rules) {
                newList.autotrigger.rules = [];
            }
            newList.autotrigger.rules.push({
                resource_id: resources[0].id,
                condition: 'less_or_eq',
                value_type: 'percentage',
                value: 50,
            });
            setListData({...newList});
        }
    }, [listData])

    const onSetAutotriggerRuleValue = useCallback((index, key, value) => {
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
            setListData({...newList});
        }
    }, [listData])

    const onDeleteAutotriggerRule = useCallback((index) => {
        if(listData) {
            const newList = cloneDeep(listData);
            if(!newList.autotrigger) {
                newList.autotrigger = {};
            }
            if(!newList.autotrigger.rules) {
                newList.autotrigger.rules = [];
            }
            newList.autotrigger.rules.splice(index);
            setListData({...newList});
        }
    }, [listData])

    const toggleAutomation = useCallback(() => {
        sendData('set-automation-enabled', { flag: !actionsData.automationEnabled })
    })

    const changeAutomationInterval = useCallback((interval) => {
        sendData('set-autotrigger-interval', { interval })
    })

    const toggleShowHidden = useCallback(() => {
        sendData('toggle-show-hidden', !actionsData.showHidden)
    })

    const toggleHiddenAction = useCallback((id, flag) => {
        sendData('toggle-hidden-action', { id, flag });
    })

    const setSearch = (searchData) => {
        console.log('SetSearch: ', searchData);
        sendData('set-actions-search', { searchData });
    }

    const handlePinToggle = (id, newFlag) => {
        sendData('toggle-actions-custom-filter-pinned', { id, flag: newFlag });
    };

    const handleApplyFilter = (id) => {
        sendData('run-actions-custom-filter', { id });
    };

    const handleEditFilter = (id) => {
        // знаходите фільтр, відкриваєте форму редагування
        // наприклад:
        const filterData = actionsData.customFilters[id];
        setEditingCustomFilter({ ...filterData });
    };

    const handleDeleteFilter = (id) => {
        sendData('delete-actions-custom-filter', { id });
    };

    const handleAddFilter = () => {
        setEditingCustomFilter({ rules: [], condition: '', category: 'action', name: '' });
    };

    const handleClose = () => {
        setCustomFilterOpened(false);
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className={'actions-wrap'}>
                <div className={'ingame-box actions'}>

                    <div className={'categories flex-container'}>
                        <ul className={'menu'}>
                            {actionsData.actionCategories.filter(one => one.isPinned || one.isSelected).map(category => (<li key={category.id} className={`category ${category.isSelected ? 'active' : ''}`} onClick={() => setActionsFilter(category.id)}>
                                <NewNotificationWrap isNew={newUnlocks.actions?.items?.all?.items?.[category.id]?.hasNew}>
                                    <span>{category.name}({category.items.length})</span>
                                </NewNotificationWrap>
                            </li> ))}
                            <li className={'add-custom-filter additional'}>
                                <span className={'create-custom'} onClick={() => {
                                    setCustomFilterOpened(true);
                                    // setEditingCustomFilter({ rules: [], condition: '', category: 'action', name: ''})
                                }}>Edit Filters</span>
                                {isCustomFilterOpened ? (<div className={'custom-filter-edit-wrap'}>
                                    {editingCustomFilter ? (
                                        <CustomFilter
                                            prefix={'actions-filter'}
                                            category={'action'}
                                            id={editingCustomFilter?.id}
                                            name={editingCustomFilter?.name}
                                            rules={editingCustomFilter?.rules}
                                            condition={editingCustomFilter?.condition}
                                            onCancel={() => {
                                                setEditingCustomFilter(null);
                                            }}
                                            onSave={(data) => {
                                                console.log('saving: ', data)
                                                sendData('save-actions-custom-filter', data);
                                                setEditingCustomFilter(null);
                                            }}
                                        />)
                                    : (<CustomFiltersList
                                        filterOrder={actionsData.customFiltersOrder}
                                        filters={actionsData.customFilters}
                                        onPinToggle={handlePinToggle}
                                        onApply={handleApplyFilter}
                                        onEdit={handleEditFilter}
                                        onDelete={handleDeleteFilter}
                                        showAddButton
                                        onAdd={handleAddFilter}
                                        showCloseButton
                                        onClose={handleClose}
                                    />)}
                                </div> ) : null}

                            </li>
                        </ul>
                        <div className={'additional-filters'}>
                            <label>
                                <SearchField
                                    placeholder={'Search'}
                                    value={actionsData.searchData || ''}
                                    onSetValue={val => setSearch(val)}
                                    scopes={ACTIONS_SEARCH_SCOPES}
                                    />
                                {/*<input type={'text'} placeholder={'Search'} value={actionsData.searchText || ''} onChange={e => setSearch(e.target.value)}/>*/}
                            </label>
                            <label>
                                <input type={"checkbox"} checked={!!actionsData.showHidden} onChange={toggleShowHidden}/>
                                Show hidden
                            </label>
                            <HowToSign scope={'actions'} />
                        </div>
                    </div>
                    <div className={'list-wrap'} id={'actions-list-wrap'}>
                        <PerfectScrollbar>
                            <div>
                                <Droppable droppableId="available-actions" isDropDisabled={true}>
                                    {(provided) => (
                                        <div ref={provided.innerRef} {...provided.droppableProps} className="flex-container">
                                            {actionsData.available.map((action, index) =>
                                                <NewNotificationWrap key={action.id} id={action.id} className={'narrow-wrapper'} isNew={newUnlocks.actions?.items?.all?.items?.[actionsData.selectedCategory]?.items?.[action.id]?.hasNew}>
                                                    <ActionCard isEditingList={!!listData} index={index} key={action.id} {...action} onFlash={handleFlash} onActivate={activateAction} onShowDetails={setActionDetails} onSelect={onSelectAction} toggleHiddenAction={toggleHiddenAction} isSelected={selectedAction && (selectedAction === action.id)}/>
                                                </NewNotificationWrap>)}
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

                    {actionsData.actionListsUnlocked ? (<ActionListsPanel automationUnlocked={actionsData.automationUnlocked} editListToDetails={editListToDetails} lists={actionsData.actionLists} viewListToDetails={viewListToDetails} runningList={actionsData.runningList} automationEnabled={actionsData.automationEnabled} toggleAutomation={toggleAutomation} autotriggerIntervalSetting={actionsData.autotriggerIntervalSetting} changeAutomationInterval={changeAutomationInterval}/>) : null}
                </div>
                <div className={`action-detail ingame-box detail-blade ${listData ? 'wide-blade' : ''}`}>
                    <DetailBlade
                        actionId={detailOpened ?? selectedAction}
                        isSelected={selectedAction && (!detailOpened || detailOpened === selectedAction)}
                        editListId={editingList}
                        listData={listData}
                        viewListId={viewingList}
                        onUpdateActionFromList={onUpdateActionFromList}
                        onDropActionFromList={onDropActionFromList}
                        onUpdateListValue={onUpdateListValue}
                        onCloseList={onCloseList}
                        viewedData={viewedData}
                        onAddAutotriggerRule={onAddAutotriggerRule}
                        onSetAutotriggerRuleValue={onSetAutotriggerRuleValue}
                        onDeleteAutotriggerRule={onDeleteAutotriggerRule}
                        setAutotriggerPriority={setAutotriggerPriority}
                        onSetAutotriggerPattern={onSetAutotriggerPattern}
                        onToggleAutotrigger={onToggleAutotrigger}
                        resources={resources}
                        automationUnlocked={actionsData.automationUnlocked}
                        stats={actionsData.stats}
                        aspects={actionsData.aspects}
                        onCloseDetails={() => setSelectedAction(null)}
                    />
                </div>
            </div>
        </DragDropContext>

    )

}

export const DetailBlade = ({
    actionId,
    isSelected,
    viewListId,
    viewedData,
    editListId,
    listData,
    onUpdateActionFromList,
    onDropActionFromList,
    onUpdateListValue,
    onCloseList,
    onAddAutotriggerRule,
    onSetAutotriggerRuleValue,
    onDeleteAutotriggerRule,
    setAutotriggerPriority,
    onSetAutotriggerPattern,
    onToggleAutotrigger,
    resources,
    automationUnlocked,
    stats,
    aspects,
    onCloseDetails
}) => {

    if(listData) {
        return (<ListEditor
            listData={listData}
            editListId={editListId}
            onUpdateActionFromList={onUpdateActionFromList}
            onDropActionFromList={onDropActionFromList}
            onUpdateListValue={onUpdateListValue}
            onCloseList={onCloseList}
            isEditing={true}
            onAddAutotriggerRule={onAddAutotriggerRule}
            onSetAutotriggerRuleValue={onSetAutotriggerRuleValue}
            onDeleteAutotriggerRule={onDeleteAutotriggerRule}
            setAutotriggerPriority={setAutotriggerPriority}
            onSetAutotriggerPattern={onSetAutotriggerPattern}
            onToggleAutotrigger={onToggleAutotrigger}
            resources={resources}
            automationUnlocked={automationUnlocked}
        />)
    }

    if(actionId) {
        return (<ActionDetails actionId={actionId} onClose={onCloseDetails} isSelected={isSelected}/>)
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
            onAddAutotriggerRule={onAddAutotriggerRule}
            onSetAutotriggerRuleValue={onSetAutotriggerRuleValue}
            onDeleteAutotriggerRule={onDeleteAutotriggerRule}
            setAutotriggerPriority={setAutotriggerPriority}
            onToggleAutotrigger={onToggleAutotrigger}
            resources={resources}
            automationUnlocked={automationUnlocked}
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
            onAddAutotriggerRule={onAddAutotriggerRule}
            onSetAutotriggerRuleValue={onSetAutotriggerRuleValue}
            onDeleteAutotriggerRule={onDeleteAutotriggerRule}
            setAutotriggerPriority={setAutotriggerPriority}
            onToggleAutotrigger={onToggleAutotrigger}
            resources={resources}
            automationUnlocked={automationUnlocked}
        />)
    }

    return (<GeneralStats stats={stats} aspects={aspects} />);
}

export const ActionCard = ({ id, category, monitored, entityEfficiency, isEditingList, index, name, level, max, xp, maxXP, xpRate, isActive, isLeveled, focused, isTraining, actionEffect, currentEffects, potentialEffects, isHidden, onFlash, onSelect, onActivate, onShowDetails, toggleHiddenAction, missingResourceId, isSelected, ...props}) => {
    const elementRef = useRef(null);

    const { stepIndex, unlockNextById, jumpOver } = useTutorial();

    useFlashOnLevelUp(isLeveled, onFlash, elementRef);

    const [isXpVisible, setIsXpVisible] = useState(false);

    if(id === 'action_visit_city') {
        if(level < 2) {
            console.log('AVC: ', stepIndex)
            unlockNextById(12);
        }
    }

    if(id === 'action_beggar') {
        if(stepIndex < 13) {
            unlockNextById(12);
        }
        unlockNextById(13);
    }

    if(id === 'action_walk' && level > 1 && stepIndex === 8) {
        console.log('JUMP! ');
        jumpOver(11)
    }

    const comp = (
        <Draggable key={`available-${id}`} draggableId={`available-${id}`} index={index} isDragDisabled={!isEditingList}>
            {(provided) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    id={`item_${id}`}
                    className={`card ${category} action ${isSelected ? 'selected' : ''} ${isActive ? 'active' : ''} ${entityEfficiency < 1 ? ' efficiency-dropped' : ''} flashable ${monitored ?? ''}`}
                    onMouseEnter={() => {
                        onShowDetails(id)
                    }}
                    onMouseOver={() => {
                        onShowDetails(id)
                    }}
                    onMouseLeave={() => {
                        if(stepIndex !== 6) {
                            onShowDetails(null)
                        }
                    }}
                    onClick={() => onSelect({
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
                            <span className={'xp-text'}>
                                XP: {formatInt(xp)}/{formatInt(maxXP)}
                            </span>
                            <TippyWrapper
                                lazy={true}
                                content={isXpVisible ? <ActionXPBreakdown id={id} /> : null}
                                onShow={() => setIsXpVisible(true)}
                                onHide={() => setIsXpVisible(false)}
                            >
                                <span className={`xp-income highlighted-span ${entityEfficiency < 1 ? ' yellow' : ''}`}>
                                    +{formatValue(xpRate)}
                                    {entityEfficiency < 1 ? (<span className={'small-hint yellow'}>
                                        &nbsp;({formatValue(100*entityEfficiency)}%)
                                    </span> ) : ''}
                                </span>
                            </TippyWrapper>
                        </div>

                        <div id={`level_up_indicator_${id}`}>
                            <ProgressBar className={'action-progress'} percentage={xp/maxXP}></ProgressBar>
                        </div>
                        <div className={'buttons'}>
                            <div className={'buttons-inner-wrap'}>
                                {isActive ? <button onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onActivate()
                                }}>Stop</button> : <button id={`activate_${id}`} onClick={(e) => {
                                    console.log('RunAction: ', stepIndex)
                                    e.preventDefault();
                                    e.stopPropagation();
                                    unlockNextById(8);
                                    onActivate(id)
                                }}>Start</button> }
                                <button onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    toggleHiddenAction(id, !isHidden)
                                }}>
                                    {isHidden ? "Show" : "Hide"}
                                </button>
                            </div>
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
