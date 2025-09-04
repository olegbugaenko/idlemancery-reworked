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
import {cloneDeep} from "lodash";
import {ActionXPBreakdown} from "./action-xp-breakdown.jsx";
import {NewNotificationWrap} from "../shared/new-notification-wrap.jsx";
import {SearchField} from "../shared/search-field.jsx";
import {HowToSign} from "../shared/how-to-sign.jsx";
import {useTutorial} from "../../context/tutorial-context";
import CustomFilter from "../shared/custom-filter.jsx";
import {ActionDetails, ListEditor, GeneralStats} from "./actions-blades.jsx";
import {ActionListsPanel} from "./actions-lists.jsx";
import CustomFiltersList from "../shared/custom-filter-list.jsx";
import {useAppContext} from "../../context/ui-context";

import {useDrag} from "../../custom-libs/dnd";
import {CustomButton} from "../shared/buttons/custom-button.jsx";
import {playSound} from "../../context/sounds/sound-manager";
import {FavoriteButton} from "../shared/favorite-button.jsx";

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
    const { stepIndex, unlockNextById, jumpOver, currentTourId } = useTutorial();

    const { onMessage, sendData, removeMessage } = useWorkerClient(worker);
    const { isMobile } = useAppContext();
    const [isDetailVisible, setDetailVisible] = useState(!isMobile);
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
            list: [],
        },
        customFilters: {},
        customFiltersOrder: [],
    });
    const [detailOpened, setDetailOpened] = useState(null);
    const [editingList, setEditingList] = useState(null);
    const [viewingList, setViewingList] = useState(null);
    const editingListRef = useRef(editingList);
    const viewingListRef = useRef(viewingList);
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
        sendData('query-all-resources', { prefix: 'inventory'});
        const interval2 = setInterval(() => {
            sendData('query-new-unlocks-notifications', { suffix: 'actions', scope: 'actions' })
        }, 1000)

        return () => {
            clearInterval(interval);
            clearInterval(interval2);
        }
    }, [])

    useEffect(() => { editingListRef.current = editingList; }, [editingList]);
    useEffect(() => { viewingListRef.current = viewingList; }, [viewingList]);

    useEffect(() => {
        const id = viewingListRef.current ?? editingListRef.current;
        if(id !== null && id !== undefined) {
            sendData('load-action-list', { id });
        }
    }, [editingList, viewingList])

    useEffect(() => {
        onMessage('new-unlocks-notifications-actions', payload => {
            setNewUnlocks(payload);
        });

        onMessage('all-resources-inventory', (payload) => {
            setResources(payload);
        });

        onMessage('actions-data', (actions) => {
            setActionsData(actions);
        });

        onMessage('action-list-data', (payload) => {
            console.log('LIST DATA', payload, listData);
            if(viewingListRef.current) {
                setViewedData(payload);
            } else if(editingListRef.current || payload.bForceOpen) {
                if(payload.bForceOpen && !editingListRef.current) {
                    setEditingList(payload.id);
                }
                setListData(payload);
                setViewedData(null);
            } else if(listData?.copyId || payload.copyId) {
                setEditingList(null);
                setViewingList(null);
                setListData(payload);
            }
        });

        onMessage('action-list-effects', (payload) => {

                setListData(prev =>{
                    if(!prev) return;

                    const actions = payload.newTimes ?? prev.actions;
                    
                    return {
                        ...prev,
                        potentialEffects: payload.potentialEffects,
                        resourcesEffects: payload.resourcesEffects,
                        effectEffects: payload.effectEffects,
                        prevEffects: payload.prevEffects,
                        proportionsBar: payload.proportionsBar,
                        actions,
                    }
                })
        });

        return () => {
            removeMessage('new-unlocks-notifications-actions');
            removeMessage('all-resources');
            removeMessage('actions-data');
            removeMessage('action-list-data');
            removeMessage('action-list-effects');
        };
    }, []);

    useEffect(() => {
        if(listData?.copyId) {
            sendData('query-actions-list-for-copy', { id: listData?.copyId });
        }
    }, [listData?.copyId])

    const activateAction = (id) => {
        if(currentTourId === 'map' && ['action_gather_carefully', 'action_gather_normal', 'action_hunt_carefully', 'action_hunt_normal'].includes(id)) {
            unlockNextById(9);
        }
        sendData('run-action', { id, isForce: true })
    }

    const setActionsFilter = (filterId) => {
        sendData('apply-actions-custom-filter', { id: filterId })
    }

    const setActionDetails = (id) => {
        // Additionally send signal to highlight action
        sendData('set-monitored', { scope: 'effects', type: 'action', id });
        if(!id) {
            setDetailOpened(null);
        } else {
            if(id !== detailOpened) {
                playSound('selection');
            }
            setDetailOpened(id);
        }
    }

    const editListToDetails = (id, options = {}) => {
        if(id) {
            setViewingList(null);
            if(!options?.clone) {
                setEditingList(id);
            } else {
                setViewingList(null);
                setEditingList(null);
                setListData({ copyId: id, name: '', actions: []})
            }
        } else {
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
        playSound('click');
        if(listData) {
            setListData(prev => {
                const newList = cloneDeep(prev);
                newList.actions.push({
                    id,
                    name,
                    time: 1,
                    isAvailable: true,
                });
                sendData('query-action-list-effects', { listData: newList });
                return newList;
            });
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
            const newList = cloneDeep(listData);
            newList.actions = newList.actions.filter(a => a.id !== id);
            setListData({...newList});
            sendData('query-action-list-effects', { listData: newList });
        }
    }

    const onUpdateActionFromList = (id, key, value) => {
        if(listData) {
            const newList = cloneDeep(listData);
            newList.actions = newList.actions.map(a => a.id !== id ? a : {...a, [key]: value});
            setListData({...newList});
            sendData('query-action-list-effects', { listData: newList });
        }
    }

    const onUpdateListValue = (key, value) => {
        setListData(prev => {
            if(!prev) return prev;
            
            const newList = cloneDeep(prev);
            newList[key] = value;
            return newList;
        });
        // sendData('query-action-list-effects', { id });
    }

    const onCloseList = () => {
        setEditingList(null);
        setListData(null);
        playSound('click');
    }

    const [overlayPositions, setOverlayPositions] = useState([]);

    const handleFlash = (position) => {
        setOverlayPositions((prev) => [...prev, position]);
        setTimeout(() => {
            setOverlayPositions((prev) => prev.filter((p) => p !== position));
        }, 1000);
    };

    const onDragEndDnD = (result) => {
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

    };

    const onDragEnd = (dragData, dropData) => {
        const { type, data, sourceId, index: sourceIndex } = dragData;

        if (!type || !data) return; // не дропнули ні на що

        const { id } = data;
        const { id: targetId, index: targetIndex } = dropData;

        if (sourceId === 'actions-list' && targetId === 'action-editor-wrap') {
            // Гравець перетягнув нову дію з "available" в список
            const action = actionsData.available.find(a => a.id === id);
            if (!action) return;

            setListData(prev => {
                if (!prev) return prev;
                
                const newList = { ...prev };
                newList.actions.push({
                    id: action.id,
                    name: action.name,
                    time: 1,
                    isAvailable: true,
                    isDynamicTime: false,
                });
                return newList;
            });
            
            // Отримуємо оновлений стан для запиту
            setListData(prev => {
                if (!prev) return prev;
                sendData('query-action-list-effects', { listData: prev });
                return prev;
            });
        }

        if (sourceId === 'action-list-editor' && targetId === 'action-editor-wrap') {
            // Сортування в середині списку
            const oldIndex = sourceIndex;
            const newIndex = targetIndex;

            if (oldIndex !== newIndex) {
                setListData(prev => {
                    if (!prev) return prev;
                    
                    const updated = [...prev.actions];
                    const [moved] = updated.splice(oldIndex, 1);
                    updated.splice(newIndex, 0, moved);
                    const newList = { ...prev, actions: updated };
                    return newList;
                });
                
                // Отримуємо оновлений стан для запиту
                setListData(prev => {
                    if (!prev) return prev;
                    sendData('query-action-list-effects', { listData: prev });
                    return prev;
                });
            }
        }
    };

    const setAutotriggerPriority = useCallback((priority) => {
        setListData(prev => {
            if(!prev) return prev;
            
            const newList = cloneDeep(prev);
            if(!newList.autotrigger) {
                newList.autotrigger = {};
            }
            if(!newList.autotrigger.rules) {
                newList.autotrigger.rules = [];
            }
            newList.autotrigger.priority = priority;
            return newList;
        });
    }, []);

    const onSetAutotriggerPattern = useCallback(pattern => {
        setListData(prev => {
            if(!prev) return prev;
            
            const newList = cloneDeep(prev);
            if(!newList.autotrigger) {
                newList.autotrigger = {};
            }
            if(!newList.autotrigger.rules) {
                newList.autotrigger.rules = [];
            }
            newList.autotrigger.pattern = pattern;
            return newList;
        });
    }, []);

    const onToggleAutotrigger = useCallback(() => {
        setListData(prev => {
            if(!prev) return prev;
            
            const newList = cloneDeep(prev);
            if(!newList.autotrigger) {
                newList.autotrigger = {};
            }
            if(!newList.autotrigger.rules) {
                newList.autotrigger.rules = [];
            }
            newList.autotrigger.isEnabled = !newList.autotrigger.isEnabled;
            return newList;
        });
    }, []);


    const onAddAutotriggerRule = useCallback(() => {
        if (!resources || !resources.length) {
            console.warn('No resources available for autotrigger rule');
            return;
        }
        
        setListData(prev => {
            if(!prev) return prev;
            
            const newList = cloneDeep(prev);
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
            return newList;
        });
    }, [resources])

    const onSetAutotriggerRuleValue = useCallback((index, key, value) => {
        setListData(prev => {
            if(!prev) return prev;
            
            const newList = cloneDeep(prev);
            if(!newList.autotrigger) {
                newList.autotrigger = {};
            }
            if(!newList.autotrigger.rules) {
                newList.autotrigger.rules = [];
            }
            if(!newList.autotrigger.rules[index]) {
                newList.autotrigger.rules[index] = {};
            }
            newList.autotrigger.rules[index] = {
                ...newList.autotrigger.rules[index],
                [key]: value
            };
            return newList;
        });
    }, [])

    const onDeleteAutotriggerRule = useCallback((index) => {
        setListData(prev => {
            if(!prev) return prev;
            
            const newList = cloneDeep(prev);
            if(!newList.autotrigger) {
                newList.autotrigger = {};
            }
            if(!newList.autotrigger.rules) {
                newList.autotrigger.rules = [];
            }
            if(index >= 0 && index < newList.autotrigger.rules.length) {
                newList.autotrigger.rules.splice(index, 1);
            }
            return newList;
        });
    }, [])

    const toggleAutomation = useCallback(() => {
        sendData('set-automation-enabled', { flag: !actionsData.automationEnabled })
    })

    const changeAutomationInterval = useCallback((interval) => {
        sendData('set-autotrigger-interval', { interval })
    })

    const toggleShowHidden = useCallback(() => {
        sendData('toggle-show-hidden', { flag: !actionsData.showHidden })
    }, [actionsData.showHidden]);

    const toggleShowMaxed = useCallback(() => {
        sendData('toggle-show-maxed', { flag: !actionsData.showMaxed })
    }, [actionsData.showMaxed]);

    const toggleHiddenAction = useCallback((id, flag) => {
        sendData('toggle-hidden-action', { id, flag });
    })

    const setSearch = (searchData) => {
        sendData('set-actions-search', { searchData });
    }

    const handlePinToggle = (id, newFlag) => {
        sendData('toggle-actions-custom-filter-pinned', { id, flag: newFlag });
    };

    const handleApplyFilter = (id) => {
        sendData('apply-actions-custom-filter', { id });
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
        if(currentTourId === 'actions') {
            unlockNextById(14);
        }
        setEditingCustomFilter({ rules: [], condition: '', category: 'action', name: '' });
    };

    const handleClose = () => {
        if(currentTourId === 'actions') {
            unlockNextById(23);
        }
        setCustomFilterOpened(false);
    };

    if(currentTourId === 'actions') {
        if(actionsData.actionCategories.find(one => one.isSelected)?.id === 'all' && stepIndex === 1) {
            jumpOver(2);
        }

        if(stepIndex === 1 && listData) {
            onCloseList(); // close list once tour is running
        }
    }

    if(currentTourId === 'map') {
        unlockNextById(8)
    }

    if(currentTourId === 'crafting') {
        unlockNextById(6);
    }

    if(currentTourId === 'alchemy') {
        unlockNextById(6);
    }

    useEffect(() => {
        const interval = setInterval(() => {
            if(currentTourId === 'crafting' && (stepIndex === 6 || stepIndex === 7)) {
                sendData('query-actions-running', { prefix: 'for-craft-tour', withEffects: true })
            }
            if(currentTourId === 'alchemy' && (stepIndex === 6 || stepIndex === 7)) {
                sendData('query-actions-running', { prefix: 'for-alchemy-tour', withEffects: true })
            }
        }, 1000)

        return () => {
            clearInterval(interval);
        }

    }, [currentTourId, stepIndex, actionsData?.runningList?.id])

    onMessage('actions-running-for-craft-tour', (data) => {
        if(data.effects.some(one => one.id === 'inventory_wood')) {
            if(stepIndex === 6) {
                jumpOver(6, 2);
                return;
            }
            unlockNextById(7);
        }
        // unlockNextById(8);
    })

    onMessage('actions-running-for-alchemy-tour', (data) => {
        if(data.effects.some(one => one.id === 'alchemy_ability')) {
            if(stepIndex === 6) {
                jumpOver(6, 2);
                return;
            }
            unlockNextById(7);
        }
        // unlockNextById(8);
    })

    return (
                <div className={'actions-wrap'}>
                    <div className={'ingame-box actions'}>

                        <div className={'categories flex-container'}>
                            <ul className={'menu actions-menu'}>
                                {actionsData.actionCategories.filter(one => one.isPinned || one.isSelected).map(category => (<li key={category.id} id={`actions-menu-${category.id}`} className={`category ${category.isSelected ? 'active' : ''}`} onClick={
                                    () => {
                                        setActionsFilter(category.id);
                                        if(currentTourId === 'actions') {
                                            unlockNextById(1);
                                        }
                                    }
                                }>
                                    <NewNotificationWrap isNew={newUnlocks.actions?.items?.all?.items?.[category.id]?.hasNew}>
                                        <span>{category.name}({category.items.length})</span>
                                    </NewNotificationWrap>
                                </li> ))}
                                <li className={'add-custom-filter additional'}>
                                    <div className={'add-wrap button-like'} onClick={(e) => {
                                        setCustomFilterOpened(true);
                                        if(currentTourId === 'actions') {
                                            unlockNextById(12);
                                        }
                                        // setEditingCustomFilter({ rules: [], condition: '', category: 'action', name: ''})
                                    }}>
                                        <div className={'icon-content edit-icon interface-icon tiny'}>
                                            <img src={"icons/interface/edit-icon.png"}/>
                                        </div>
                                        <span className={'create-custom'} >Edit Filters</span>
                                    </div>

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
                                            onDragEnd={onDragEndDnD}
                                        />)}
                                    </div> ) : null}

                                </li>
                            </ul>
                            <div className={'additional-filters'}>
                                <label>
                                    <SearchField
                                        placeholder={'Search'}
                                        value={{
                                            ...(actionsData.searchData || {
                                                search: '',
                                                selectedScopes: ['name', 'tags']
                                            })
                                        }}
                                        onSetValue={val => setSearch(val)}
                                        scopes={ACTIONS_SEARCH_SCOPES}
                                    />
                                </label>
                                <label>
                                    <input type={"checkbox"} checked={!!actionsData.showHidden} onChange={toggleShowHidden}/>
                                    Show hidden
                                </label>
                                <label>
                                    <input type={"checkbox"} checked={!!actionsData.showMaxed} onChange={toggleShowMaxed}/>
                                    Show completed
                                </label>
                                {isMobile ? (<div>
                                    <span className={'highlighted-span'} onClick={() => setDetailVisible(true)}>Info</span>
                                </div>) : null}
                                <HowToSign scope={'actions'} />
                            </div>
                        </div>
                        <div className={'list-wrap'} id={'actions-list-wrap'}>
                            <PerfectScrollbar>
                                <div>
                                    <div className="flex-container inner-actions-wrap">
                                        {actionsData.available.map((action, index) =>
                                            <NewNotificationWrap key={action.id} id={action.id} className={'narrow-wrapper'} isNew={newUnlocks.actions?.items?.all?.items?.[actionsData.selectedCategory]?.items?.[action.id]?.hasNew}>
                                                <DraggableActionCard
                                                    isEditingList={!!listData}
                                                    index={index}
                                                    key={action.id}
                                                    {...action}
                                                    onFlash={handleFlash}
                                                    onActivate={activateAction}
                                                    onShowDetails={setActionDetails}
                                                    onSelect={onSelectAction}
                                                    toggleHiddenAction={toggleHiddenAction}
                                                    isSelected={selectedAction && (selectedAction === action.id)}
                                                />
                                            </NewNotificationWrap>)}

                                    </div>

                                    {overlayPositions.map((position, index) => (
                                            <FlashOverlay key={index} position={position} />
                                    ))}
                                </div>
                            </PerfectScrollbar>
                        </div>

                        {actionsData.actionListsUnlocked ? (<ActionListsPanel automationUnlocked={actionsData.automationUnlocked} editListToDetails={editListToDetails} lists={actionsData.actionLists} viewListToDetails={viewListToDetails} runningList={actionsData.runningList} automationEnabled={actionsData.automationEnabled} toggleAutomation={toggleAutomation} autotriggerIntervalSetting={actionsData.autotriggerIntervalSetting} changeAutomationInterval={changeAutomationInterval}/>) : null}
                    </div>
                    {(!isMobile || isDetailVisible || listData || viewedData || selectedAction) ? (<div className={`action-detail ingame-box detail-blade ${listData ? 'wide-blade' : ''} ${viewedData || listData ? 'forced-bottom' : ''}`}>
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
                            setDetailVisible = {setDetailVisible}
                            onDragEnd={onDragEnd}
                        />
                    </div>) : null}
                </div>
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
    onCloseDetails,
    setDetailVisible,
    onDragEnd
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
            onDragEnd={onDragEnd}
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
            onDragEnd={onDragEnd}
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
            onDragEnd={onDragEnd}
        />)
    }

    return (<GeneralStats stats={stats} aspects={aspects} setDetailVisible={setDetailVisible}/>);
}

const DraggableActionCard = ({ id, index, ...props }) => {

    const {ref, props: dragProps} = useDrag({ type: 'action', id: `action_card_${id}`, sourceId: 'actions-list', data: { id } });

    return (
        <div ref={ref} {...dragProps}>
            <ActionCard {...props} id={id} index={index} />
        </div>
    );
};

export const ActionCard = React.memo(({ id, category, isFavorite, monitored, entityEfficiency, isEditingList, index, isCapped, name, level, max, xp, maxXP, xpRate, isActive, effort, isLeveled, focused, isTraining, actionEffect, currentEffects, potentialEffects, isHidden, onFlash, onSelect, onActivate, onShowDetails, toggleHiddenAction, missingResourceId, isSelected, tags, ...props}) => {
    const elementRef = useRef(null);

    useEffect(() => {
        return () => {
            elementRef.current = null;
        };
    }, []);

    const { stepIndex, unlockNextById, jumpOver, currentTourId } = useTutorial();

    useFlashOnLevelUp(isLeveled, onFlash, elementRef);

/*    useEffect(() => {
        if(isLeveled) {
            playSound('action_levelup');
        }
    }, [isLeveled]);*/

    const [isXpVisible, setIsXpVisible] = useState(false);

    if(currentTourId === 'initial') {
        if(id === 'action_visit_city') {
            if(level < 2) {
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
            jumpOver(11)
        }
    }

    if(currentTourId === 'actions') {
        if(stepIndex === 1 && isSelected) {
            onSelect({ id, name, level })
        }
    }


    const comp = (
                <div
                    id={`item_${id}`}
                    ref={elementRef}
                    className={`card ${category} ${tags.includes('training') ? 'training' : ''} action ${isSelected ? 'selected' : ''} ${isActive ? 'active' : ''} ${entityEfficiency < 1 ? ' efficiency-dropped' : ''} flashable ${monitored ?? ''}`}
                    onMouseEnter={() => {
                        onShowDetails(id)
                    }}
                    onMouseOver={() => {
                        onShowDetails(id)
                    }}
                    onMouseLeave={() => {
                        if((stepIndex !== 6) || currentTourId !== 'initial') {
                            onShowDetails(null)
                        }
                    }}
                    onClick={() => {
                        onSelect({
                            id,
                            name,
                            level
                        })
                        if(currentTourId === 'actions' && stepIndex === 2) {
                            unlockNextById(2);
                        }
                    }}>
                    <div className={'head'}>
                        <p className={'title'}>{name}</p>
                        <span className={'level'}>{formatInt(level)}{max ? `/${formatInt(max)}` : ''}</span>
                    </div>
                    <div className={'bottom'}>
                        {!isCapped ? (<div className={'xp-box'}>
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
                        </div>) : <p className={'completed'}>Completed</p>}

                        <div id={`level_up_indicator_${id}`}>
                            <ProgressBar className={'action-progress'} percentage={xp/maxXP}></ProgressBar>
                        </div>
                        <div className={'buttons'}>
                            <div className={'buttons-inner-wrap'}>
                                {!isCapped ? (<>{isActive ?
                                        <CustomButton
                                            className={'icon-content interface-icon small clickable-icon'}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                onActivate();
                                                playSound('click');
                                            }}
                                            iconId={'pause'}
                                        >
                                            Stop Action
                                        </CustomButton> :
                                        <CustomButton
                                            id={`activate_${id}`}
                                            className={'icon-content interface-icon small clickable-icon'}
                                            iconId={'run'}
                                            onClick={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              if(currentTourId === 'initial') {
                                                  unlockNextById(8);
                                              }
                                              if(currentTourId === 'actions') {
                                                  unlockNextById(7);
                                              }
                                              onActivate(id);
                                              playSound('click');
                                            }} >
                                            Run Action
                                        </CustomButton>}</>) : null}
                                <FavoriteButton type="actions" id={id} isFavorite={isFavorite} className="action-favorite-btn icon-content interface-icon small clickable-icon" />
                                <CustomButton
                                    className={'icon-content interface-icon small clickable-icon'}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        toggleHiddenAction(id, !isHidden);
                                        playSound('click');
                                    }}
                                    iconId={isHidden ? 'icon_show' : 'icon_hide'}
                                >
                                    {isHidden ? 'Show Action' : 'Hide Action'}
                                </CustomButton>
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
                    {isActive ? (<div className={'bottom-bar'}>
                        <div className={'progress-bg'}>
                            <div className={'progress-bar'} style={{width: `${100 * isActive.effort}%`}}></div>
                        </div>
                    </div>) : null}
                </div>
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
},  (prevProps, nextProps) => {
    return (
        prevProps.id === nextProps.id &&
        prevProps.index === nextProps.index &&
        prevProps.isFavorite === nextProps.isFavorite &&
        prevProps.isEditingList === nextProps.isEditingList &&
        prevProps.isSelected === nextProps.isSelected &&
        prevProps.isActive === nextProps.isActive &&
        prevProps.level === nextProps.level &&
        prevProps.xp === nextProps.xp &&
        prevProps.maxXP === nextProps.maxXP &&
        prevProps.entityEfficiency === nextProps.entityEfficiency &&
        prevProps.monitored === nextProps.monitored &&
        prevProps.focused === nextProps.focused &&
        prevProps.isLeveled === nextProps.isLeveled &&
        prevProps.isHidden === nextProps.isHidden &&
        prevProps.xpRate === nextProps.xpRate
    )
});
