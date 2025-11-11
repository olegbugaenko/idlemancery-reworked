import React, {useCallback, useContext, useEffect, useMemo, useRef, useState} from "react";
import WorkerContext from "../../../context/worker-context";
import {useWorkerClient} from "../../../general/client";
import {formatInt, formatValue} from "../../../general/utils/strings";
import PerfectScrollbar from "react-perfect-scrollbar";
import {TippyWrapper} from "../../shared/tippy-wrapper.jsx";
import {BreakDown} from "../../layout/sidebar.jsx";
import {NewNotificationWrap} from "../../shared/new-notification-wrap.jsx";
import {RawResource} from "../../shared/raw-resource.jsx";
import {Balances} from "../shared.jsx";
import {useAppContext} from "../../../context/ui-context";
import {PinResource} from "../../shared/pin-resource.jsx";
import {useTutorial} from "../../../context/tutorial-context";
import {FavoriteButton} from "../../shared/favorite-button.jsx";
import { InterfaceSettingsContext } from "./index.jsx";
import {RecipeTitleWithTooltip} from "./recipe-title-with-tooltip.jsx";

export const Alchemy = ({ setItemDetails, setItemLevel, filterId, newUnlocks, openListDetails, addItemToList, isEditList, setShowNumericInputs }) => {

    const worker = useContext(WorkerContext);
    const { showNumericInputs } = useContext(InterfaceSettingsContext);
    const { isMobile } = useAppContext();

    const { stepIndex, unlockNextById, jumpOver, currentTourId } = useTutorial();

    const { onMessage, sendData, removeMessage } = useWorkerClient(worker);
    const [craftingData, setItemsData] = useState({
        available: [],
        efforts: {
            consumption: 0,
            balance: 0,
            usingRecipes: null,
            isPinned: false,
        },
        craftingLists: {
            lists: [],
            runningList: null,
            automationEnabled: false,
            autotriggerIntervalSetting: 10,
        },
        autoRebalance: {
            enabled: true,
            hasOriginalAllocations: false,
            canRestore: false
        }
    });
    const [dataVersion, setDataVersion] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            sendData('query-crafting-data', { filterId });
        }, 100);
        return () => {
            clearInterval(interval);
        }
    }, [filterId])

    useEffect(() => {
        onMessage(`crafting-data-${filterId}`, (craftables) => {
            setItemsData(craftables);
            setDataVersion(v => v + 1);
        });
        
        return () => {
            removeMessage(`crafting-data-${filterId}`);
        };
    }, [filterId]);

    const handleAutoRebalanceToggle = useCallback((enabled) => {
        sendData('set-alchemy-auto-rebalance', { enabled });
    }, [sendData]);

    const onEditList = useCallback(listData => {
        console.log('onEditList: ', { listData, isEdit: true })
        openListDetails({ listData, isEdit: true });
    }, []);

    const onViewList = useCallback(listData => {
        console.log('onViewList: ', listData);
        openListDetails({ listData });
    }, []);

    const onToggleLock = useCallback((id, isLocked) => {
        console.log('Frontend alchemy onToggleLock:', { id, isLocked, filterId });
        sendData('toggle-effort-lock', { id, isLocked, filterId });
    }, [sendData, filterId]);

    /*if(currentTourId === 'alchemy') {
        if(craftingData.available?.length) {
            unlockNextById(8);
        }
    }*/

    return (<div className={'crafting-wrap'}>
        <div className={'head'}>
            <div className={'flex-container'}>
                <TippyWrapper content={<div className={'hint-popup'}>
                    <p className={'hint'}>Shows the amount of available effort you can use for alchemy.</p>
                    {craftingData.efforts.usingRecipes?.length ? (<div className={'block breakdown'}>
                        <div className={'box unbordered'}>
                            {craftingData.efforts.usingRecipes.map(one => (<div key={one.name} className={'flex-row flex-container'}>
                                <span>{one.name}</span>
                                <span>{formatValue(one.effort*100)}%</span>
                            </div> ))}
                            <div className="sub-box">
                                <div className={'flex-row flex-container'}>
                                    <span>Unused Effort</span>
                                    <span>{formatValue((1 - craftingData.efforts.usingRecipes.reduce((acc, recipe) => acc + recipe.effort, 0)) * 100)}%</span>
                                </div>
                            </div>
                        </div>
                    </div> ) : null}
                    {/*<BreakDown breakDown={craftingData.efforts.breakDown} />*/}
                </div> }>
                    <div className={'space-item alchemy-efforts'}>
                        <span>Alchemy Efforts:</span>
                        <span>{formatValue(craftingData.efforts.value)}</span>
                    </div>
                </TippyWrapper>
                
                {/* Auto-rebalance controls for alchemy */}
                <div className={'auto-rebalance-controls'}>
                    <div className={'space-item'}>
                        <TippyWrapper content={<div className={'hint-popup'}>
                            <p className={'hint'}>Auto-rebalance automatically redistributes efforts when one or more recipes lack resources. This ensures optimal resource usage by redirecting effort to recipes that can run efficiently.</p>
                            <p className={'hint'}>When enabled, the system will temporarily adjust your effort allocations to maximize production from available resources. You can restore your original allocations at any time.</p>
                        </div>}>
                            <label className={'checkbox-label'}>
                                <input 
                                    type="checkbox" 
                                    checked={craftingData.autoRebalance.enabled}
                                    onChange={(e) => handleAutoRebalanceToggle(e.target.checked)}
                                />
                                <span>Auto-rebalance</span>
                            </label>
                        </TippyWrapper>
                    </div>
                    <div className={'space-item'}>
                        <TippyWrapper content={<div className={'hint-popup'}>
                            <p className={'hint'}>When enabled, shows numeric input fields instead of sliders for setting effort values. This allows for more precise control over effort allocation.</p>
                        </div>}>
                            <label className={'checkbox-label'}>
                                <input 
                                    type="checkbox" 
                                    checked={showNumericInputs}
                                    onChange={(e) => setShowNumericInputs(e.target.checked)}
                                />
                                <span>Show numeric inputs</span>
                            </label>
                        </TippyWrapper>
                    </div>
                    {craftingData.autoRebalance.enabled && craftingData.autoRebalance.hasOriginalAllocations && !craftingData.autoRebalance.canRestore && !craftingData.autoRebalance.canRestore && (
                                        <TippyWrapper content={<div className={'hint-popup'}>
                                            <p className={'hint'}>Some of your recipes don't have enough ingredients. Since you enabled automatic rebalancing, your efforts have been redirected to other available recipes.</p>
                                        </div>}>
                            <div className={'space-item rebalance-status'}>
                                {craftingData.autoRebalance.canRestore ? (
                                    <span className={'status-restore'}>Using original allocation</span>
                                ) : (
                                    <span className={'status-rebalanced'}>Temporarily rebalanced</span>
                                )}
                            </div>
                        </TippyWrapper>
                    )}
                </div>
            </div>
        </div>
        <div className={'craftables-cat'}>
            <PerfectScrollbar>
                <div className={'flex-container'}>
                    {craftingData.available.map(craftable => <NewNotificationWrap id={`crafting_${craftable.id}`} key={`crafting_${craftable.id}`} className={'narrow-wrapper'} isNew={newUnlocks?.all?.items?.[`crafting_${craftable.id}`]?.hasNew}>
                        <ItemCard addItemToList={addItemToList} key={craftable.id} {...craftable} dataVersion={dataVersion} onSetLevel={setItemLevel} onShowDetails={setItemDetails} isMobile={isMobile} isEditList={isEditList} showNumericInputs={showNumericInputs} onToggleLock={onToggleLock}/>
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
                    console.log('setViewList: ', id);
                    onViewList({ id });
                }}
            />
        </div>
    </div>)
}

export const ItemCard = ({ id, icon_id, isRunning, resourceAmount, resourceBalance, breakDown, isLowerEfficiency, name, effort, isLocked, maxLevel, onSetLevel, onShowDetails, addItemToList, isMobile, isEditList, isRebalanced, isRebalancedBeneficial, showNumericInputs, onToggleLock, dataVersion, bonusesDetails }) => {

    const [inputValue, setInputValue] = useState(effort);

    useEffect(() => {
        setInputValue(effort);
    }, [effort, dataVersion]);

    const handleInputChange = (e) => {
        const value = parseFloat(e.target.value);
        if (!isNaN(value) && value >= 0 && value <= 1) {
            const roundedValue = Math.round(value * 1000000) / 1000000;
            setInputValue(roundedValue);
            onSetLevel(id, roundedValue);
        }
    };

    const handleInputBlur = () => {
        setInputValue(effort);
    };

    return (<div
        className={`card craftable ${isRunning ? 'running' : ''} ${isLowerEfficiency ? 'lower-eff' : ''} ${isRebalanced ? (isRebalancedBeneficial ? 'rebalanced-beneficial' : 'rebalanced') : ''}`}
        onMouseEnter={() => !isMobile ? onShowDetails(id) : null}
        onMouseOver={() => !isMobile ? onShowDetails(id) : null}
        onMouseLeave={() => !isMobile ? onShowDetails(null) : null}
        onClick={() => (isMobile && !isEditList) ? onShowDetails(id) : addItemToList({id, name})}
    >
        <div className={'flex-container two-side-card'}>
            <div className={'left'}>
                <RecipeTitleWithTooltip bonusesDetails={bonusesDetails}>
                    <img src={`icons/resources/${icon_id}.png`} className={'resource big'}/>
                </RecipeTitleWithTooltip>
            </div>
            <div className={'right'}>
                <div className={'head'}>
                    <RecipeTitleWithTooltip bonusesDetails={bonusesDetails}>
                        <p className={'title'}>{name}</p>
                    </RecipeTitleWithTooltip>
                </div>
                <Balances resourceAmount={resourceAmount} resourceBalance={resourceBalance} breakDown={breakDown} />
            </div>
        </div>
        <div className={'bottom self-placed'}>
            <div className={'buttons'}>
                <span className={'label'}>Set Effort:</span>
                <TippyWrapper content={<div className={'hint-popup'}>
                    <p className={'current bold'}>Current Effort: {formatValue(effort*100)}%</p>
                    <p>Regulate effort percentage for this recipe. Increasing it will prioritize this recipe, increasing its productivity while decreasing others</p>
                </div> }>
                    <div className={'effort-control flex-container flex-row'}>
                        <div className={'icon-content minimize-icon interface-icon tiny'} onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            onSetLevel(id, 0)
                        }}>
                            <img src={"icons/interface/minimize.png"}/>
                        </div>
                        {showNumericInputs ? (
                            <input
                                type="number"
                                className="level-set numeric-input"
                                min={0}
                                max={1}
                                step={0.000001}
                                value={inputValue}
                                onChange={handleInputChange}
                                onBlur={handleInputBlur}
                                onClick={(e) => e.stopPropagation()}
                                onKeyDown={(e) => e.stopPropagation()}
                            />
                        ) : (
                            <input
                                type="range"
                                className="level-set"
                                min={0}
                                max={1}
                                step={0.000001}
                                value={inputValue}
                                onChange={handleInputChange}
                            />
                        )}
                        <div className={'icon-content maximize-icon interface-icon tiny'} onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            onSetLevel(id, 1)
                        }}>
                            <img src={"icons/interface/maximize.png"}/>
                        </div>
                        <TippyWrapper content={<div className={'hint-popup'}>
                            <p className={'hint'}>Lock effort - prevents this recipe's effort from being changed when normalizing other efforts</p>
                        </div>}>
                            <div className={`icon-content interface-icon tiny ${isLocked ? 'locked' : 'unlocked'}`} onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                onToggleLock && onToggleLock(id, !isLocked)
                            }}>
                                <img src={isLocked ? "icons/interface/lock.png" : "icons/interface/unlock.png"}/>
                            </div>
                        </TippyWrapper>
                    </div>
                </TippyWrapper>
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

    useEffect(() => {
        if (!isOpened) {
            onHover && onHover(null);
        }
    }, [isOpened])

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
                    <div className={'list-inner'} onMouseLeave={() => onHover && onHover(null)}>
                        {listsDisplayed.map(list => (<div key={list.id} className={'item'} onMouseEnter={() => onHover(list.id)} onMouseLeave={() => onHover(null)}>
                            <div className={'list-item-row flex-container'}>
                                <span className={'list-name'}>{list.name}</span>
                                <FavoriteButton type="alchemyLists" id={list.id} isFavorite={list.isFavorite} className="list-favorite-btn icon-content interface-icon small" />
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
        sendData('set-crafting-automation-enabled', { category: 'alchemy', flag: !automationEnabled })
    })

    const changeAutomationInterval = useCallback((interval) => {
        sendData('set-crafting-autotrigger-interval', { category: 'alchemy', interval })
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
            sendData('stop-crafting-list', { category: 'alchemy' });
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
                <span className={'current-list-label'}>Current list:</span> {runningList ? (<div className={'flex-container'}>
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
                <button onClick={(e) => { e.stopPropagation(); setOpenedFor('edit')}}>Pick List</button>
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