import React, {useCallback, useContext, useEffect, useMemo, useRef, useState} from "react";
import WorkerContext from "../../../context/worker-context";
import {useWorkerClient} from "../../../general/client";
import {formatInt, formatValue} from "../../../general/utils/strings";
import PerfectScrollbar from "react-perfect-scrollbar";
import {TippyWrapper} from "../../shared/tippy-wrapper.jsx";
import {BreakDown} from "../../layout/sidebar.jsx";
import {NewNotificationWrap} from "../../layout/new-notification-wrap.jsx";
import {RawResource} from "../../shared/raw-resource.jsx";

export const Crafting = ({ setItemDetails, setItemLevel, filterId, newUnlocks, openListDetails, addItemToList }) => {

    const worker = useContext(WorkerContext);

    const { onMessage, sendData } = useWorkerClient(worker);
    const [craftingData, setItemsData] = useState({
        available: [],
        slots: {
            total: 0,
            max: 0
        },
        efforts: {
            consumption: 0,
            balance: 0,
            breakDown: null
        },
        craftingLists: {
            lists: [],
            runningList: null,
            automationEnabled: false,
            autotriggerIntervalSetting: 10,
        }
    });

    useEffect(() => {
        const interval = setInterval(() => {
            sendData('query-crafting-data', { filterId });
        }, 100);
        return () => {
            clearInterval(interval);
        }
    }, [])

    onMessage(`crafting-data-${filterId}`, (craftables) => {
        // console.log('CraftingData: ', craftables);
        setItemsData(craftables);
    })

    const onEditList = useCallback(listData => {
        openListDetails({ listData, isEdit: true });
    }, []);

    const onViewList = useCallback(listData => {
        console.log('onViewList: ', listData);
        openListDetails({ listData });
    }, []);

    return (<div className={'crafting-wrap'}>
        <div className={'head'}>
            <div className={'space-item'}>
                <RawResource id={'crafting_slots'} name={'Crafting Slots'} />
                <span className={`slots-amount ${craftingData.slots.total > 0 ? 'slots-available' : 'slots-unavailable'}`}>{formatInt(craftingData.slots.total)}/{formatInt(craftingData.slots.max)}</span>
            </div>
            <TippyWrapper content={<div className={'hint-popup'}>
                <p className={'hint'}>Shows the amount of available effort you can use for crafting.</p>
                <p className={'hint'}>If your crafting effort is insufficient, your crafting efficiency will decrease.</p>
                <BreakDown breakDown={craftingData.efforts.breakDown} />
            </div> }>
                <div className={'space-item'}>
                    <span>Crafting Efforts:</span>
                    <span>{formatValue(craftingData.efforts.balance)}/{formatValue(craftingData.efforts.balance + craftingData.efforts.consumption)}</span>
                </div>
            </TippyWrapper>
        </div>
        <div className={'craftables-cat'}>
            <PerfectScrollbar>
                <div className={'flex-container'}>
                    {craftingData.available.map(craftable => <NewNotificationWrap id={`crafting_${craftable.id}`} className={'narrow-wrapper'} isNew={newUnlocks?.all?.items?.[`crafting_${craftable.id}`]?.hasNew}>
                        <ItemCard addItemToList={addItemToList} key={craftable.id} {...craftable} onSetLevel={setItemLevel} onShowDetails={setItemDetails}/>
                    </NewNotificationWrap>)}
                </div>
            </PerfectScrollbar>
        </div>
        <div className={'map-lists-wrap'}>
            <CraftingListsPanel
                runningList={craftingData.craftingLists.runningList}
                lists={craftingData.craftingLists.lists}
                automationEnabled={craftingData.craftingLists.automationEnabled}
                autotriggerIntervalSetting={craftingData.craftingLists.autotriggerIntervalSetting}
                editListToDetails={(id) => {
                    console.log('editListToDetails: ', id);
                    onEditList({ id });
                }}
                viewListToDetails={(id) => {
                    onViewList({ id });
                }}
            />
        </div>
    </div>)
}

export const ItemCard = ({ id, icon_id, isRunning, isLowerEfficiency, name, level, resourceAmount, resourceBalance, maxLevel, onSetLevel, onShowDetails, addItemToList}) => {

    return (<div className={`card craftable ${isRunning ? 'running' : ''} ${isLowerEfficiency ? 'lower-eff' : ''}`} onMouseEnter={() => onShowDetails(id)} onMouseOver={() => onShowDetails(id)} onMouseLeave={() => onShowDetails(null)} onClick={() => addItemToList({id, name})}>
        <div className={'flex-container two-side-card'}>
            <div className={'left'}>
                <img src={`icons/resources/${icon_id}.png`} className={'resource big'}/>
            </div>
            <div className={'right'}>
                <div className={'head'}>
                    <p className={'title'}>{name}</p>
                    <span className={'level'}>{formatInt(level)}{maxLevel ? `/${formatInt(maxLevel)}` : ''}</span>
                </div>
                <div className={'mid small-text'}>
                    <p>You own: {formatValue(resourceAmount)} <span className={`balance ${resourceBalance > 1.e-8 ? 'green' : ''} ${resourceBalance < -1.e-8 ? 'yellow' : ''}`}>({formatValue(resourceBalance, 2, true)})</span></p>
                </div>
                <div className={'bottom'}>
                    <div className={'buttons'}>
                        <span className={'label'}>Set Effort:</span>
                        <TippyWrapper content={<div className={'hint-popup'}>
                            <p>Increasing the effort level boosts both production and crafting costs exponentially, but costs grow faster than output. Each additional effort level multiplies costs by 1.5 while increasing output by only 1.2.</p>
                        </div> }>
                            <div className={'effort-control flex-container flex-row'}>
                                <div className={'icon-content minimize-icon interface-icon tiny'} onClick={() => onSetLevel(id, 0)}>
                                    <img src={"icons/interface/minimize.png"}/>
                                </div>
                                <input type={'number'} min={0} max={maxLevel} value={level} onChange={e => onSetLevel(id, Math.round(+e.target.value))}/>
                                <div className={'icon-content maximize-icon interface-icon tiny'} onClick={() => onSetLevel(id, 1.e+9)}>
                                    <img src={"icons/interface/maximize.png"}/>
                                </div>
                            </div>
                        </TippyWrapper>


                    </div>
                </div>
            </div>
        </div>
    </div> )
}

export const ActionListsPopup = ({ lists, isOpened, setOpenedFor, onSelect, onHover, onRun, onDelete }) => {

    if(!isOpened) return null;

    const [search, setSearch] = useState('')

    const listsDisplayed = useMemo(() => {
        if(!search) return lists;
        return lists.filter(l => l.name.includes(search));
    }, [lists, search])

    return (<div className={'list-selector'}>
        <div className={'list-selector-inner'}>
            <div clallName={'search-wrap'}>
                <input
                    type={'text'}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                />
            </div>
            <div className={'lists-wrap'}>
                <PerfectScrollbar>
                    <div className={'list-inner'}>
                        {listsDisplayed.map(list => (<div className={'item'} onMouseEnter={() => onHover(list.id)} onMouseLeave={() => onHover(null)}>
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
                                <TippyWrapper content={<div className={'hint-popup'}>Delete List</div> }>
                                    <div className={'icon-content edit-icon interface-icon small'} onClick={() => onDelete(list.id)}>
                                        <img src={"icons/interface/delete.png"}/>
                                    </div>
                                </TippyWrapper>
                            </div>

                        </div> ))}
                    </div>
                </PerfectScrollbar>
            </div>
        </div>
    </div> )
}

export const CraftingListsPanel = ({ runningList, editListToDetails, lists, viewListToDetails, automationEnabled, autotriggerIntervalSetting }) => {

    const worker = useContext(WorkerContext);

    const { onMessage, sendData } = useWorkerClient(worker);

    const [openedFor, setOpenedFor] = useState(null);

    const toggleAutomation = useCallback(() => {
        sendData('set-crafting-automation-enabled', { category: 'crafting', flag: !automationEnabled })
    })

    const changeAutomationInterval = useCallback((interval) => {
        sendData('set-crafting-autotrigger-interval', { category: 'crafting', interval })
    })


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
        if(!id) {
            sendData('stop-crafting-list', { category: 'crafting' });
            return;
        }
        sendData('run-crafting-list', { id });
    }

    const onDelete = (id) => {
        sendData('delete-crafting-list', { id });
        setOpenedFor('edit');
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
                <ActionListsPopup lists={lists} isOpened={openedFor === 'edit'} setOpenedFor={setOpenedFor} onSelect={editList} onRun={runList} onHover={viewListToDetails} onDelete={onDelete}/>
            </div>
            <div className={'automation-enabled panel-col'}>
                <label>
                    <input type={'checkbox'} checked={automationEnabled} onChange={toggleAutomation}/>
                    Lists automation enabled
                </label>
            </div>
            <div className={'panel-col automation-interval'}>
                <label>
                    Switch lists interval:
                    <select onChange={e => changeAutomationInterval(+e.target.value)}>
                        <option value={10} selected={autotriggerIntervalSetting === 10}>10 seconds</option>
                        <option value={30} selected={autotriggerIntervalSetting === 30}>30 seconds</option>
                        <option value={60} selected={autotriggerIntervalSetting === 60}>1 minute</option>
                        <option value={300} selected={autotriggerIntervalSetting === 300}>5 minutes</option>
                        <option value={900} selected={autotriggerIntervalSetting === 900}>15 minutes</option>
                        <option value={1800} selected={autotriggerIntervalSetting === 1800}>30 minutes</option>
                        <option value={3600} selected={autotriggerIntervalSetting === 3600}>1 hour</option>
                    </select>
                </label>
            </div>
        </div>
    </div>)
}