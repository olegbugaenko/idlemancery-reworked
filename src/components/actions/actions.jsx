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
import {cloneDeep, debounce, throttle} from "lodash";
import isEqual from "lodash/isEqual";
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
import {CustomButtonMemoized} from "../shared/buttons/custom-button.jsx";
import {playSound} from "../../context/sounds/sound-manager";
import {FavoriteButton} from "../shared/favorite-button.jsx";
import {useActionsData, updateActionsState} from "../../state/actions-store";

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

const selectAvailableActions = state => state?.available ?? [];
const selectActionCategories = state => state?.actionCategories ?? [];
const selectSearchData = state => state?.searchData ?? { search: '', selectedScopes: ['name', 'tags'] };
const selectShowHidden = state => !!state?.showHidden;
const selectShowMaxed = state => !!state?.showMaxed;
const selectCustomFilters = state => state?.customFilters ?? {};
const selectCustomFiltersOrder = state => state?.customFiltersOrder ?? [];
const selectAutomationUnlocked = state => !!state?.automationUnlocked;
const selectAutomationEnabled = state => !!state?.automationEnabled;
const selectAutotriggerInterval = state => state?.autotriggerIntervalSetting ?? 0;
const selectRunningList = state => state?.runningList ?? null;
const selectActionLists = state => state?.actionLists ?? [];
const selectActionListsUnlocked = state => !!state?.actionListsUnlocked;
const selectSelectedCategory = state => state?.selectedCategory ?? 'all';
const selectStats = state => state?.stats ?? {};
const selectAspects = state => state?.aspects ?? { isUnlocked: false, list: [] };

const MemoizedActionListsPanel = React.memo(ActionListsPanel);

export const Actions = ({}) => {

    const worker = useContext(WorkerContext);
    const { stepIndex, unlockNextById, jumpOver, currentTourId } = useTutorial();

    const { onMessage, sendData, removeMessage } = useWorkerClient(worker);
    const { isMobile } = useAppContext();
    const [isDetailVisible, setDetailVisible] = useState(!isMobile);
    const availableActions = useActionsData(selectAvailableActions);
    const actionCategories = useActionsData(selectActionCategories);
    const showHidden = useActionsData(selectShowHidden);
    const showMaxed = useActionsData(selectShowMaxed);
    const customFilters = useActionsData(selectCustomFilters);
    const automationUnlocked = useActionsData(selectAutomationUnlocked);
    const automationEnabled = useActionsData(selectAutomationEnabled);
    const autotriggerIntervalSetting = useActionsData(selectAutotriggerInterval);
    const runningList = useActionsData(selectRunningList);
    const actionLists = useActionsData(selectActionLists);
    const actionListsUnlocked = useActionsData(selectActionListsUnlocked);
    const stats = useActionsData(selectStats);
    const aspects = useActionsData(selectAspects);
    const [detailOpened, setDetailOpened] = useState(null);
    const [editingList, setEditingList] = useState(null);
    const [viewingList, setViewingList] = useState(null);
    const editingListRef = useRef(editingList);
    const viewingListRef = useRef(viewingList);
    const [listData, setListData] = useState(null);
    const listDataRef = useRef(listData);
    const [viewedData, setViewedData] = useState(null);
    const viewedDataRef = useRef(viewedData);
    const [selectedAction, setSelectedAction] = useState(null);
    const [resources, setResources] = useState(null);
    const [newUnlocks, setNewUnlocks] = useState({});
    const [isCustomFilterOpened, setCustomFilterOpened] = useState(false);
    const [editingCustomFilter, setEditingCustomFilter] = useState(null);

    const availableActionsRef = useRef(availableActions);
    const customFiltersRef = useRef(customFilters);

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
    useEffect(() => { listDataRef.current = listData; }, [listData]);
    useEffect(() => { viewedDataRef.current = viewedData; }, [viewedData]);
    useEffect(() => { availableActionsRef.current = availableActions; }, [availableActions]);
    useEffect(() => { customFiltersRef.current = customFilters; }, [customFilters]);

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
            updateActionsState(actions);
        });

        onMessage('action-list-data', (payload) => {
            const currentListData = listDataRef.current;
            if(viewingListRef.current) {
                setViewedData(payload);
            } else if(editingListRef.current || payload.bForceOpen) {
                if(payload.bForceOpen && !editingListRef.current) {
                    setEditingList(payload.id);
                }
                setListData(payload);
                setViewedData(null);
            } else if(currentListData?.copyId || payload.copyId) {
                setEditingList(null);
                setViewingList(null);
                setListData(payload);
            }
        });

        onMessage('action-list-effects', (payload) => {
                setListData(prev =>{
                    if(!prev) return prev;

                    // Ignore updates not related to the currently edited list
                    if(payload?.id != null && prev?.id != null && payload.id !== prev.id) {
                        return prev;
                    }

                    const actions = (payload.newTimes ?? prev.actions).map(action => ({
                        ...action,
                        isBlocked: payload.blockedDynamicActions?.[action.id] ?? null,
                    }));

                    return {
                        ...prev,
                        potentialEffects: payload.potentialEffects,
                        resourcesEffects: payload.resourcesEffects,
                        effectEffects: payload.effectEffects,
                        prevEffects: payload.prevEffects,
                        proportionsBar: payload.proportionsBar,
                        blockedDynamicActions: payload.blockedDynamicActions,
                        actions,
                    }
                })
        });

        return () => {
            removeMessage('new-unlocks-notifications-actions');
            removeMessage('all-resources-inventory');
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

    const activateAction = useCallback((id) => {
        if(currentTourId === 'map' && ['action_gather_carefully', 'action_gather_normal', 'action_hunt_carefully', 'action_hunt_normal'].includes(id)) {
            unlockNextById(9);
        }
        sendData('run-action', { id, isForce: true })
    }, [currentTourId, unlockNextById, sendData]);

    const throttledSetActionsFilter = useMemo(() => throttle((filterId) => {
        sendData('apply-actions-custom-filter', { id: filterId });
    }, 200, { leading: true, trailing: true }), [sendData]);

    useEffect(() => {
        return () => {
            throttledSetActionsFilter.cancel();
        };
    }, [throttledSetActionsFilter]);

    const setActionsFilter = useCallback((filterId) => {
        throttledSetActionsFilter(filterId);
    }, [throttledSetActionsFilter]);

    const setActionDetails = useCallback((id) => {
        // Additionally send signal to highlight action
        sendData('set-monitored', { scope: 'effects', type: 'action', id });
        if(!id) {
            setDetailOpened(null);
            return;
        }

        setDetailOpened(prev => {
            if(id !== prev) {
                playSound('selection');
            }
            return id;
        });
    }, [sendData]);

    const editListToDetails = useCallback((id, options = {}) => {
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
    }, []);

    const viewListToDetails = useCallback((id) => {
        if(!id) {
            setViewedData(null);
        }
        setViewingList(id)

    }, []);

    const onSelectAction = useCallback(({id, name}) => {
        playSound('click');
        if(listDataRef.current) {
            setListData(prev => {
                if(!prev) return prev;

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
            setSelectedAction(prev => (prev === id ? null : id));
        }
    }, [sendData]);

    const onDropActionFromList = useCallback((index) => {
        setListData(prev => {
            if(!prev) return prev;

            const newList = cloneDeep(prev);
            newList.actions.splice(index, 1); // Видаляємо по індексу замість фільтрації по id
            sendData('query-action-list-effects', { listData: newList });
            return newList;
        });
    }, [sendData]);

    const onUpdateActionFromList = useCallback((id, key, value) => {
        setListData(prev => {
            if(!prev) return prev;

            const newList = cloneDeep(prev);
            newList.actions = newList.actions.map(a => a.id !== id ? a : {...a, [key]: value});
            sendData('query-action-list-effects', { listData: newList });
            return newList;
        });
    }, [sendData]);

    const onUpdateListValue = useCallback((key, value) => {
        setListData(prev => {
            if(!prev) return prev;

            const newList = cloneDeep(prev);
            newList[key] = value;
            return newList;
        });
        // sendData('query-action-list-effects', { id });
    }, []);

    const onCloseList = useCallback(() => {
        setEditingList(null);
        setListData(null);
        playSound('click');
    }, []);

    const onDragEndDnD = useCallback((result) => {
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
    }, [sendData]);

    const onDragEnd = useCallback((dragData, dropData) => {
        const { type, data, sourceId, index: sourceIndex } = dragData;

        if (!type || !data) return; // не дропнули ні на що

        const { id } = data;
        const { id: targetId, index: targetIndex } = dropData;

        if (sourceId === 'actions-list' && targetId === 'action-editor-wrap') {
            // Гравець перетягнув нову дію з "available" в список
            const action = availableActionsRef.current?.find(a => a.id === id);
            if (!action) return;

            setListData(prev => {
                if (!prev) return prev;

                const newList = cloneDeep(prev);
                newList.actions.push({
                    id: action.id,
                    name: action.name,
                    time: 1,
                    isAvailable: true,
                    isDynamicTime: false,
                });
                sendData('query-action-list-effects', { listData: newList });
                return newList;
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
                    sendData('query-action-list-effects', { listData: newList });
                    return newList;
                });
            }
        }
    }, [sendData]);

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
        sendData('set-automation-enabled', { flag: !automationEnabled });
    }, [sendData, automationEnabled]);

    const changeAutomationInterval = useCallback((interval) => {
        sendData('set-autotrigger-interval', { interval });
    }, [sendData]);

    const toggleShowHidden = useCallback(() => {
        sendData('toggle-show-hidden', { flag: !showHidden });
    }, [sendData, showHidden]);

    const toggleShowMaxed = useCallback(() => {
        sendData('toggle-show-maxed', { flag: !showMaxed });
    }, [sendData, showMaxed]);

    const toggleHiddenAction = useCallback((id, flag) => {
        sendData('toggle-hidden-action', { id, flag });
    }, [sendData]);

    const debouncedSearchUpdate = useMemo(() => debounce((value) => {
        sendData('set-actions-search', { searchData: value });
    }, 200), [sendData]);

    useEffect(() => {
        return () => {
            debouncedSearchUpdate.cancel();
        };
    }, [debouncedSearchUpdate]);

    const setSearch = useCallback((nextSearchData) => {
        debouncedSearchUpdate(nextSearchData);
    }, [debouncedSearchUpdate]);

    const onCategorySelect = useCallback((categoryId) => {
        setActionsFilter(categoryId);
        if(currentTourId === 'actions') {
            unlockNextById(1);
        }
    }, [setActionsFilter, currentTourId, unlockNextById]);

    const openCustomFilters = useCallback(() => {
        setEditingCustomFilter(null);
        setCustomFilterOpened(true);
        if(currentTourId === 'actions') {
            unlockNextById(12);
        }
    }, [currentTourId, unlockNextById, setEditingCustomFilter]);

    const handlePinToggle = useCallback((id, newFlag) => {
        sendData('toggle-actions-custom-filter-pinned', { id, flag: newFlag });
    }, [sendData]);

    const handleApplyFilter = useCallback((id) => {
        sendData('apply-actions-custom-filter', { id });
    }, [sendData]);

    const handleEditFilter = useCallback((id) => {
        const filterData = customFiltersRef.current?.[id];
        setEditingCustomFilter(filterData ? { ...filterData } : null);
    }, []);

    const handleSaveCustomFilter = useCallback((data) => {
        sendData('save-actions-custom-filter', data);
    }, [sendData]);

    const handleDeleteFilter = useCallback((id) => {
        sendData('delete-actions-custom-filter', { id });
    }, [sendData]);

    const handleAddFilter = useCallback(() => {
        if(currentTourId === 'actions') {
            unlockNextById(14);
        }
        setEditingCustomFilter({ rules: [], condition: '', category: 'action', name: '' });
    }, [currentTourId, unlockNextById]);

    const handleClose = useCallback(() => {
        if(currentTourId === 'actions') {
            unlockNextById(23);
        }
        setEditingCustomFilter(null);
        setCustomFilterOpened(false);
    }, [currentTourId, unlockNextById]);

    if(currentTourId === 'actions') {
        if(actionCategories.find(one => one.isSelected)?.id === 'all' && stepIndex === 1) {
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

    }, [currentTourId, stepIndex, runningList?.id])

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
                        <ActionsFilters
                            selectors={{
                                categories: selectActionCategories,
                                customFilters: selectCustomFilters,
                                customFiltersOrder: selectCustomFiltersOrder,
                                search: selectSearchData,
                                showHidden: selectShowHidden,
                                showMaxed: selectShowMaxed,
                            }}
                            newUnlocks={newUnlocks}
                            isCustomFilterOpened={isCustomFilterOpened}
                            onOpenCustomFilters={openCustomFilters}
                            onCloseCustomFilters={handleClose}
                            editingCustomFilter={editingCustomFilter}
                            setEditingCustomFilter={setEditingCustomFilter}
                            onSaveCustomFilter={handleSaveCustomFilter}
                            onApplyFilter={handleApplyFilter}
                            onEditFilter={handleEditFilter}
                            onDeleteFilter={handleDeleteFilter}
                            onAddFilter={handleAddFilter}
                            onPinToggle={handlePinToggle}
                            onSelectCategory={onCategorySelect}
                            onSearchChange={setSearch}
                            onToggleShowHidden={toggleShowHidden}
                            onToggleShowMaxed={toggleShowMaxed}
                            onDragEndFilters={onDragEndDnD}
                            isMobile={isMobile}
                            onShowDetails={() => setDetailVisible(true)}
                        />
                        <AvailableActionsList
                            selectors={{
                                available: selectAvailableActions,
                                selectedCategory: selectSelectedCategory,
                            }}
                            listData={listData}
                            newUnlocks={newUnlocks}
                            onActivate={activateAction}
                            onShowDetails={setActionDetails}
                            onSelect={onSelectAction}
                            toggleHiddenAction={toggleHiddenAction}
                            selectedAction={selectedAction}
                        />
                        {actionListsUnlocked ? (
                            <MemoizedActionListsPanel
                                automationUnlocked={automationUnlocked}
                                editListToDetails={editListToDetails}
                                lists={actionLists}
                                viewListToDetails={viewListToDetails}
                                runningList={runningList}
                                automationEnabled={automationEnabled}
                                toggleAutomation={toggleAutomation}
                                autotriggerIntervalSetting={autotriggerIntervalSetting}
                                changeAutomationInterval={changeAutomationInterval}
                            />
                        ) : null}
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
                            automationUnlocked={automationUnlocked}
                            stats={stats}
                            aspects={aspects}
                            onCloseDetails={() => setSelectedAction(null)}
                            setDetailVisible={setDetailVisible}
                            onDragEnd={onDragEnd}
                        />
                    </div>) : null}
                </div>
    )

}

const DetailBladeComponent = ({
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

export const DetailBlade = React.memo(DetailBladeComponent);

const ActionsFilters = React.memo(({
    selectors,
    newUnlocks,
    isCustomFilterOpened,
    onOpenCustomFilters,
    onCloseCustomFilters,
    editingCustomFilter,
    setEditingCustomFilter,
    onSaveCustomFilter,
    onApplyFilter,
    onEditFilter,
    onDeleteFilter,
    onAddFilter,
    onPinToggle,
    onSelectCategory,
    onSearchChange,
    onToggleShowHidden,
    onToggleShowMaxed,
    onDragEndFilters,
    isMobile,
    onShowDetails,
}) => {
    const categories = useActionsData(selectors.categories);
    const customFilters = useActionsData(selectors.customFilters);
    const customFiltersOrder = useActionsData(selectors.customFiltersOrder);
    const searchValue = useActionsData(selectors.search);
    const showHidden = useActionsData(selectors.showHidden);
    const showMaxed = useActionsData(selectors.showMaxed);

    return (
        <div className={'categories flex-container'}>
            <ul className={'menu actions-menu'}>
                {categories.filter(one => one.isPinned || one.isSelected).map(category => (
                    <li
                        key={category.id}
                        id={`actions-menu-${category.id}`}
                        className={`category ${category.isSelected ? 'active' : ''}`}
                        onClick={() => onSelectCategory(category.id)}
                    >
                        <NewNotificationWrap isNew={newUnlocks.actions?.items?.all?.items?.[category.id]?.hasNew}>
                            <span>{category.name}({category.items.length})</span>
                        </NewNotificationWrap>
                    </li>
                ))}
                <li className={'add-custom-filter additional'}>
                    <div className={'add-wrap button-like'} onClick={onOpenCustomFilters}>
                        <div className={'icon-content edit-icon interface-icon tiny'}>
                            <img src={"icons/interface/edit-icon.png"}/>
                        </div>
                        <span className={'create-custom'}>Edit Filters</span>
                    </div>

                    {isCustomFilterOpened ? (
                        <div className={'custom-filter-edit-wrap'}>
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
                                        onSaveCustomFilter(data);
                                        setEditingCustomFilter(null);
                                    }}
                                />
                            ) : (
                                <CustomFiltersList
                                    filterOrder={customFiltersOrder}
                                    filters={customFilters}
                                    onPinToggle={onPinToggle}
                                    onApply={onApplyFilter}
                                    onEdit={onEditFilter}
                                    onDelete={onDeleteFilter}
                                    showAddButton
                                    onAdd={onAddFilter}
                                    showCloseButton
                                    onClose={onCloseCustomFilters}
                                    onDragEnd={onDragEndFilters}
                                />
                            )}
                        </div>
                    ) : null}

                </li>
            </ul>
            <div className={'additional-filters'}>
                <label>
                    <SearchField
                        placeholder={'Search'}
                        value={{
                            ...(searchValue || {
                                search: '',
                                selectedScopes: ['name', 'tags'],
                            }),
                        }}
                        onSetValue={onSearchChange}
                        scopes={ACTIONS_SEARCH_SCOPES}
                    />
                </label>
                <label>
                    <input type={'checkbox'} checked={!!showHidden} onChange={onToggleShowHidden}/>
                    Show hidden
                </label>
                <label>
                    <input type={'checkbox'} checked={!!showMaxed} onChange={onToggleShowMaxed}/>
                    Show completed
                </label>
                {isMobile ? (
                    <div>
                        <span className={'highlighted-span'} onClick={onShowDetails}>Info</span>
                    </div>
                ) : null}
                <HowToSign scope={'actions'} />
            </div>
        </div>
    );
});

const AvailableActionsList = React.memo(({
    selectors,
    listData,
    newUnlocks,
    onActivate,
    onShowDetails,
    onSelect,
    toggleHiddenAction,
    selectedAction,
}) => {
    const available = useActionsData(selectors.available);
    const selectedCategory = useActionsData(selectors.selectedCategory);
    const [overlayPositions, setOverlayPositions] = useState([]);

    const handleFlash = useCallback((position) => {
        setOverlayPositions((prev) => [...prev, position]);
        setTimeout(() => {
            setOverlayPositions((prev) => prev.filter((p) => p !== position));
        }, 1000);
    }, []);

    return (
        <div className={'list-wrap'} id={'actions-list-wrap'}>
            <PerfectScrollbar>
                <div>
                    <div className="flex-container inner-actions-wrap">
                        {available.map((action, index) => (
                            <ActionListItem
                                key={action.id}
                                action={action}
                                index={index}
                                isEditingList={!!listData}
                                isNew={newUnlocks.actions?.items?.all?.items?.[selectedCategory]?.items?.[action.id]?.hasNew}
                                onFlash={handleFlash}
                                onActivate={onActivate}
                                onShowDetails={onShowDetails}
                                onSelect={onSelect}
                                toggleHiddenAction={toggleHiddenAction}
                                isSelected={selectedAction === action.id}
                            />
                        ))}

                    </div>

                    {overlayPositions.map((position, index) => (
                        <FlashOverlay key={index} position={position} />
                    ))}
                </div>
            </PerfectScrollbar>
        </div>
    );
});

const ActionListItemComponent = ({
    action,
    index,
    isEditingList,
    isNew,
    onActivate,
    onFlash,
    onSelect,
    onShowDetails,
    toggleHiddenAction,
    isSelected,
}) => {
    return (
        <NewNotificationWrap
            id={action.id}
            className={'narrow-wrapper'}
            isNew={isNew}
        >
            <DraggableActionCard
                action={action}
                index={index}
                isEditingList={isEditingList}
                onActivate={onActivate}
                onFlash={onFlash}
                onSelect={onSelect}
                onShowDetails={onShowDetails}
                toggleHiddenAction={toggleHiddenAction}
                isSelected={isSelected}
            />
        </NewNotificationWrap>
    );
};

const areActionListItemPropsEqual = (prev, next) => {
    return (
        prev.index === next.index &&
        prev.isEditingList === next.isEditingList &&
        prev.isNew === next.isNew &&
        prev.isSelected === next.isSelected &&
        prev.onActivate === next.onActivate &&
        prev.onFlash === next.onFlash &&
        prev.onSelect === next.onSelect &&
        prev.onShowDetails === next.onShowDetails &&
        prev.toggleHiddenAction === next.toggleHiddenAction &&
        isEqual(prev.action, next.action)
    );
};

const ActionListItem = React.memo(ActionListItemComponent, areActionListItemPropsEqual);

const DraggableActionCardComponent = ({
    action,
    index,
    isEditingList,
    onActivate,
    onFlash,
    onSelect,
    onShowDetails,
    toggleHiddenAction,
    isSelected,
}) => {
    const { id } = action;
    const {ref, props: dragProps} = useDrag({ type: 'action', id: `action_card_${id}`, sourceId: 'actions-list', data: { id } });

    return (
        <div ref={ref} {...dragProps}>
            <ActionCard
                {...action}
                id={id}
                index={index}
                isEditingList={isEditingList}
                onActivate={onActivate}
                onFlash={onFlash}
                onSelect={onSelect}
                onShowDetails={onShowDetails}
                toggleHiddenAction={toggleHiddenAction}
                isSelected={isSelected}
            />
        </div>
    );
};

const areDraggablePropsEqual = (prev, next) => {
    return (
        prev.index === next.index &&
        prev.isEditingList === next.isEditingList &&
        prev.isSelected === next.isSelected &&
        prev.onActivate === next.onActivate &&
        prev.onFlash === next.onFlash &&
        prev.onSelect === next.onSelect &&
        prev.onShowDetails === next.onShowDetails &&
        prev.toggleHiddenAction === next.toggleHiddenAction &&
        isEqual(prev.action, next.action)
    );
};

const DraggableActionCard = React.memo(DraggableActionCardComponent, areDraggablePropsEqual);

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

    const handleStopAction = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        onActivate();
        playSound('click');
    }, [onActivate]);

    const handleRunAction = useCallback((e) => {
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
    }, [id, currentTourId, unlockNextById, onActivate]);

    const handleToggleHidden = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleHiddenAction(id, !isHidden);
        playSound('click');
    }, [id, isHidden, toggleHiddenAction]);

    const handleMouseEnter = useCallback(() => {
        onShowDetails(id);
    }, [id, onShowDetails]);

    const handleMouseLeave = useCallback(() => {
        if((stepIndex !== 6) || currentTourId !== 'initial') {
            onShowDetails(null);
        }
    }, [stepIndex, currentTourId, onShowDetails]);

    const handleCardClick = useCallback(() => {
        onSelect({
            id,
            name,
            level
        });
        if(currentTourId === 'actions' && stepIndex === 2) {
            unlockNextById(2);
        }
    }, [id, name, level, currentTourId, stepIndex, unlockNextById, onSelect]);

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
                    onMouseEnter={handleMouseEnter}
                    onMouseOver={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    onClick={handleCardClick}>
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
                                        <CustomButtonMemoized
                                            className={'icon-content interface-icon small clickable-icon'}
                                            onClick={handleStopAction}
                                            iconId={'pause'}
                                        >
                                            Stop Action
                                        </CustomButtonMemoized> :
                                        <CustomButtonMemoized
                                            id={`activate_${id}`}
                                            className={'icon-content interface-icon small clickable-icon'}
                                            iconId={'run'}
                                            onClick={handleRunAction}
                                        >
                                            Run Action
                                        </CustomButtonMemoized>}</>) : null}
                                <FavoriteButton type="actions" id={id} isFavorite={isFavorite} className="action-favorite-btn icon-content interface-icon small clickable-icon" />
                                <CustomButtonMemoized
                                    className={'icon-content interface-icon small clickable-icon'}
                                    onClick={handleToggleHidden}
                                    iconId={isHidden ? 'icon_show' : 'icon_hide'}
                                >
                                    {isHidden ? 'Show Action' : 'Hide Action'}
                                </CustomButtonMemoized>
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
