import React, {useContext, useEffect, useState} from "react";
import WorkerContext from "../../../context/worker-context";
import {useWorkerClient} from "../../../general/client";
import {formatInt, formatValue, secondsToString} from "../../../general/utils/strings";
import {ProgressBar} from "../../layout/progress-bar.jsx";
import PerfectScrollbar from "react-perfect-scrollbar";
import {NewNotificationWrap} from "../../shared/new-notification-wrap.jsx";
import {useAppContext} from "../../../context/ui-context";
import {CustomButton} from "../../shared/buttons/custom-button.jsx";
import {playSound} from "../../../context/sounds/sound-manager";
import {EffectsSection} from "../../shared/effects-section.jsx";
import {TippyWrapper} from "../../shared/tippy-wrapper.jsx";
import {BreakDown} from "../../layout/sidebar.jsx";
import {PinResource} from "../../shared/pin-resource.jsx";

export const ExpeditionsWrap = ({ children }) => {
    const worker = useContext(WorkerContext);
    const { isMobile } = useAppContext();
    const [isDetailVisible, setDetailVisible] = useState(!isMobile);

    const { onMessage, sendData } = useWorkerClient(worker);
    const [expeditionData, setExpeditionData] = useState([]);
    const [detailOpenedId, setDetailOpenedId] = useState(null);
    const [viewedOpenedId, setViewedOpenedId] = useState(null);
    const [editData, setEditData] = useState(null);
    const [viewedData, setViewedData] = useState(null);
    const [resources, setResources] = useState([]);
    const [isChanged, setChanged] = useState(false);
    const [expeditionEffortData, setExpeditionEffortData] = useState(null);

    useEffect(() => {
        const id = viewedOpenedId ?? detailOpenedId?.id;
        if(id !== null) {
            if(!viewedOpenedId && isChanged) {
                return;
            }
            sendData('query-expedition-details', { id });
        }
    }, [viewedOpenedId, detailOpenedId]);

    useEffect(() => {
        const interval = setInterval(() => {
            sendData('query-expedition-data', {});
        }, 100);
        sendData('query-all-resources', { prefix: 'expeditions'});
        return () => {
            clearInterval(interval);
        }
    }, [])

    onMessage('all-resources-expeditions', (payload) => {
        setResources(payload);
    })

            onMessage('expedition-data', (payload) => {
            setExpeditionData(payload.expeditions || []);
            setExpeditionEffortData(payload.expeditionEffort || null);
        })

        onMessage('edit-expedition-details', (payload) => {
            setEditData(prev => {
                if (payload && prev && payload.id === prev.id) {
                    return payload;
                }
                return prev;
            });
        })

    onMessage('expedition-details', (payload) => {
        if(viewedOpenedId) {
            setViewedData(payload);
        } else if(detailOpenedId) {
            setEditData(payload);
            setViewedData(null);
        }
    })

    const startExpedition = (id, level) => {
        sendData('start-expedition', { id, level });
        playSound('click');
    }

    const stopExpedition = (id) => {
        sendData('stop-expedition', { id });
        playSound('click');
    }

    const handleClick = (e) => {
        const expeditionId = e.currentTarget.dataset.id;
        if(expeditionId) {
            setDetailOpenedId({ id: expeditionId });
            setViewedOpenedId(null);
            setViewedData(null);
            // Встановлюємо editData для режиму редагування
            // Знаходимо експедицію в даних
            const expedition = expeditionData.find(exp => exp.id === expeditionId);
            if (expedition) {
                setEditData(expedition);
            }
        }
    }

    const handleContextMenu = (e) => {
        e.preventDefault();
        const expeditionId = e.currentTarget.dataset.id;
        if(expeditionId) {
            setViewedOpenedId(expeditionId);
            setDetailOpenedId(null);
            // Встановлюємо viewedData для режиму перегляду
            // Знаходимо експедицію в даних
            const expedition = expeditionData.find(exp => exp.id === expeditionId);
            if (expedition) {
                setViewedData(expedition);
            }
            // Не очищаємо editData - зберігаємо стан редагування
        }
    }

    const handleMouseEnter = (expeditionId) => {
        if (!isMobile && expeditionId) {
            setViewedOpenedId(expeditionId);
            setDetailOpenedId(null);
            // Встановлюємо viewedData для режиму перегляду
            // Знаходимо експедицію в даних
            const expedition = expeditionData.find(exp => exp.id === expeditionId);
            if (expedition) {
                setViewedData(expedition);
            }
            // Не очищаємо editData - зберігаємо стан редагування
        }
    }

    const handleMouseLeave = () => {
        if (!isMobile) {
            setViewedOpenedId(null);
            setViewedData(null);
            // Якщо є editData, то повертаємося до нього
            // Якщо немає editData, то закриваємо деталі
            // editData залишається в стані і буде показаний автоматично
        }
    }

    const changeLevel = (newLevel) => {
        if (editData) {
            const updatedData = { ...editData, level: newLevel };
            setEditData(updatedData);
            setChanged(true);
            
            // Request updated details with new level
            sendData('query-expedition-details', { 
                id: editData.id, 
                prefix: 'edit',
                level: newLevel
            });
        }
    };

    const saveChanges = () => {
        if(editData && isChanged) {
            // Stop current expedition if running
            if(editData.isRunning) {
                stopExpedition(editData.id);
            }
            // Start new expedition with new level
            startExpedition(editData.id, editData.level);
            setChanged(false);
        }
    }

    return (
        <div className="expeditions-wrap" onMouseLeave={handleMouseLeave}>
            <div className="ingame-box expeditions items">
            <div className="menu-wrap map">
                {children}
            </div>
            <div className="expeditions-inner-wrap">

                <div className="head">
                    <div className="flex-container">
                        {expeditionEffortData && (
                            <TippyWrapper content={<div className={'hint-popup'}>
                                <p className={'hint'}>Shows the amount of available effort you can use for expeditions.</p>
                                <p className={'hint'}>If your expedition effort is insufficient, expedition efficiency will decrease.</p>
                                <BreakDown breakDown={expeditionEffortData.breakDown} />
                            </div> }>
                                <div className={'space-item expedition-efforts-indicator'}>
                                    <span className={'expedition-label'}>Expedition Efforts:</span>
                                    <span className={`expedition-value ${expeditionEffortData.balance > 1.e-7 ? 'green' : 'yellow'}`}>{formatValue(expeditionEffortData.balance)}/{formatValue(expeditionEffortData.balance + expeditionEffortData.consumption)}</span>
                                </div>
                            </TippyWrapper>
                        )}
                        {expeditionEffortData && (
                            <PinResource isPinned={expeditionEffortData.isPinned} id={'expedition_effort'} />
                        )}
                    </div>
                </div>
                <div className="list-wrap">
                    <PerfectScrollbar>
                        <div className="flex-container inner-actions-wrap">
                            {expeditionData.map((expedition) => (
                                <ExpeditionCard 
                                    key={expedition.id}
                                    expedition={expedition}
                                    onClick={handleClick}
                                    onContextMenu={handleContextMenu}
                                    onMouseEnter={() => handleMouseEnter(expedition.id)}
                                    onMouseLeave={handleMouseLeave}
                                    onStart={startExpedition}
                                    onStop={stopExpedition}
                                    resources={resources}
                                />
                            ))}
                        </div>
                    </PerfectScrollbar>
                </div>
            </div>
                
            </div>
            
            {(!isMobile || editData || viewedData) ? (
                <div className="item-detail ingame-box detail-blade">
                    {viewedData || editData ? (
                        <ExpeditionDetails 
                            expedition={viewedData || editData}
                            isEditing={!!editData && !viewedData}
                            isChanged={isChanged}
                            onChangeLevel={changeLevel}
                            onSave={saveChanges}
                            onStart={startExpedition}
                            onStop={stopExpedition}
                            onCancel={() => {
                                setDetailOpenedId(null);
                                setViewedOpenedId(null);
                                setEditData(null);
                                setViewedData(null);
                                setChanged(false);
                            }}
                        />
                    ) : (
                        <div className="general-stats">
                            <h4>Expeditions</h4>
                            <p>Select an expedition to view details</p>
                        </div>
                    )}
                </div>
            ) : null}
        </div>
    );
};

const ExpeditionCard = ({ expedition, onClick, onContextMenu, onMouseEnter, onMouseLeave, onStart, onStop, resources }) => {
    return (
        <div 
            id={`item_${expedition.id}`}
            className={`card expedition ${expedition.isRunning ? 'active' : ''} ${!expedition.isUnlocked ? 'unavailable' : ''}`}
            data-id={expedition.id}
            onClick={onClick}
            onContextMenu={onContextMenu}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <div className="head">
                <p className="title">{expedition.name}</p>
                <span className="level">{formatInt(expedition.level)}/{formatInt(expedition.maxLevel)}</span>
            </div>
            <div className="bottom">
                <div className="xp-box">
                    <span className="xp-text">
                        {expedition.isRunning ? 'Running' : 'Ready'}
                    </span>
                    <span className="xp-income highlighted-span">
                        {formatValue(expedition.currentXp || 0)} / {formatValue(expedition.requiredXp || 0)}
                    </span>
                </div>
                
                <div id={`level_up_indicator_${expedition.id}`}>
                    <ProgressBar 
                        className="action-progress" 
                        percentage={expedition.requiredXp > 0 ? (expedition.currentXp / expedition.requiredXp) : 0}
                    />
                </div>
                
                <div className="buttons">
                    <div className="buttons-inner-wrap">
                        {expedition.isRunning ? (
                            <CustomButton
                                className="icon-content interface-icon small clickable-icon"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onStop(expedition.id);
                                    playSound('click');
                                }}
                                iconId="pause"
                            >
                                Stop Expedition
                            </CustomButton>
                        ) : (
                            <CustomButton
                                id={`activate_${expedition.id}`}
                                className="icon-content interface-icon small clickable-icon"
                                iconId="run"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onStart(expedition.id, expedition.level);
                                    playSound('click');
                                }}
                            >
                                Start Expedition
                            </CustomButton>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ExpeditionDetails = ({ expedition, isEditing, isChanged, onChangeLevel, onSave, onCancel, onStart, onStop }) => {
    if (!expedition) return null;

    return (
        <div className="blade-outer">
            <PerfectScrollbar>
                <div className="blade-inner">
                    <div className="block">
                        <h4>{expedition.name}</h4>
                        <div className="description">
                            {expedition.description}
                        </div>
                    </div>
                    
                    <div className="block">
                        <div className="tags-container">
                            <div className="tag">expedition</div>
                            <div className="tag">exploration</div>
                        </div>
                    </div>
                    
                    <div className="block">
                        <p>Level: {expedition.level} / {expedition.maxLevel}</p>
                        <div className="progress-section">
                            <p>XP: {formatValue(expedition.currentXp || 0)} / {formatValue(expedition.requiredXp || 0)}</p>
                            <ProgressBar 
                                progress={expedition.requiredXp > 0 ? (expedition.currentXp / expedition.requiredXp) * 100 : 0} 
                                height={8}
                                showPercentage={false}
                            />
                        </div>
                    </div>
                    
                    {expedition.potentialEffects && expedition.potentialEffects.length > 0 && (
                        <div className="block expedition-effects-block">
                            <p>Potential Effects:</p>
                            <div className="effects">
                                <EffectsSection effects={expedition.potentialEffects} />
                            </div>
                        </div>
                    )}
                    
                    {expedition.discoveredLoot && ((expedition.discoveredLoot.length > 0) || expedition.hiddenLootCount) && (
                        <div className="block">
                            <p>Discovered Loot:</p>
                            {expedition.discoveredLoot.map(loot => (
                                <p key={loot.id} className="drop-row">
                                    <span className="name">{loot.resourceName || loot.id}</span>
                                    <span className="probability">{formatValue(loot.probability * 100)}%</span>
                                    <span className="amounts">{formatInt(loot.amount)}</span>
                                </p>
                            ))}
                            {expedition.hiddenLootCount > 0 && (
                                <p className="hidden-loot-hint" style={{color: '#888', fontStyle: 'italic'}}>
                                    {expedition.hiddenLootCount} more item{expedition.hiddenLootCount > 1 ? 's' : ''} can be found
                                </p>
                            )}
                        </div>
                    )}
                    
                    {(!expedition.discoveredLoot || expedition.discoveredLoot.length === 0) && expedition.hiddenLootCount > 0 && (
                        <div className="block">
                            <p>Possible Loot:</p>
                            <p className="hidden-loot-hint" style={{color: '#888', fontStyle: 'italic'}}>
                                {expedition.hiddenLootCount} item{expedition.hiddenLootCount > 1 ? 's' : ''} can be found here
                            </p>
                        </div>
                    )}
                    
                    {isEditing && (
                        <div className="block">
                            <div className="set-level flex-container flex-row">
                                <div className="setter">
                                    <span>Set level to </span>
                                    <input 
                                        type="number" 
                                        value={expedition.level} 
                                        min={0} 
                                        max={expedition.maxLevel} 
                                        onChange={e => onChangeLevel(Math.floor(+e.target.value))}
                                    />
                                    <span>of {expedition.maxLevel}</span>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <div className="block expedition-actions buttons flex-container">
                        {expedition.isRunning ? (
                            <CustomButton 
                                onClick={() => onStop(expedition.id)}
                                className="warning-action"
                            >
                                Stop Expedition
                            </CustomButton>
                        ) : (
                            <CustomButton 
                                onClick={() => onStart(expedition.id, expedition.level)}
                                disabled={!expedition.isUnlocked}
                                className="primary-action"
                            >
                                Start Expedition
                            </CustomButton>
                        )}
                        
                        {isEditing && isChanged && (
                            <CustomButton onClick={onSave} className="save-btn">
                                Save Changes
                            </CustomButton>
                        )}
                        
                        {isEditing && (
                            <CustomButton onClick={onCancel} className="cancel-btn">
                                Cancel
                            </CustomButton>
                        )}
                    </div>
                </div>
            </PerfectScrollbar>
        </div>
    );
};

export default ExpeditionsWrap; 