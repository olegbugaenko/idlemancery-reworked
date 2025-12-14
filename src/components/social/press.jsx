import React, {useCallback, useContext, useEffect, useState} from "react";
import WorkerContext from "../../context/worker-context";
import {useWorkerClient} from "../../general/client";
import {formatInt, formatValue, secondsToString} from "../../general/utils/strings";
import PerfectScrollbar from "react-perfect-scrollbar";
import {TippyWrapper} from "../shared/tippy-wrapper.jsx";
import {ProgressBar} from "../layout/progress-bar.jsx";
import {EffectsSection} from "../shared/effects-section.jsx";
import {ResourceComparison} from "../shared/resource-comparison.jsx";
import {NewNotificationWrap} from "../shared/new-notification-wrap.jsx";

export const PressWrap = ({ children }) => {
    const worker = useContext(WorkerContext);
    const { onMessage, sendData, removeMessage } = useWorkerClient(worker);

    const [pressData, setPressData] = useState({
        printing_effort: 0,
        journals: []
    });
    const [detailOpenedId, setDetailOpenedId] = useState(null);
    const [viewedOpenedId, setViewedOpenedId] = useState(null);
    const [detailsData, setDetailsData] = useState(null);
    const [showNumericInputs, setShowNumericInputs] = useState(false);
    const [dataVersion, setDataVersion] = useState(0);
    const [newUnlocks, setNewUnlocks] = useState({});

    useEffect(() => {
        const interval = setInterval(() => {
            sendData('query-press-state', {});
        }, 100);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        sendData('query-new-unlocks-notifications', { suffix: 'press', scope: 'social', category: 'press' });
        const interval = setInterval(() => {
            sendData('query-new-unlocks-notifications', { suffix: 'press', scope: 'social', category: 'press' });
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const detailId = viewedOpenedId ?? detailOpenedId;
        if (detailId) {
            sendData('query-press-journal-details', { id: detailId });
            const interval = setInterval(() => {
                sendData('query-press-journal-details', { id: detailId });
            }, 500);
            return () => clearInterval(interval);
        }
    }, [viewedOpenedId, detailOpenedId]);

    useEffect(() => {
        onMessage('press-state', (payload) => {
            setPressData(payload);
            setDataVersion(v => v + 1);
        });

        onMessage('press-journal-details', (payload) => {
            setDetailsData(payload);
        });

        onMessage('new-unlocks-notifications-press', (payload) => {
            setNewUnlocks(payload);
        });

        return () => {
            removeMessage('press-state');
            removeMessage('press-journal-details');
            removeMessage('new-unlocks-notifications-press');
        };
    }, []);

    const setJournalEffort = useCallback((id, effort) => {
        sendData('assign-effort', { id, effort });
    }, [sendData]);

    const handleJournalClick = useCallback((id) => {
        setDetailOpenedId(id);
        setViewedOpenedId(null);
    }, []);

    const handleJournalHover = useCallback((id) => {
        if (!detailOpenedId) {
            setViewedOpenedId(id);
        }
    }, [detailOpenedId]);

    const handleJournalLeave = useCallback(() => {
        if (!detailOpenedId) {
            setViewedOpenedId(null);
        }
    }, [detailOpenedId]);

    const handleCloseDetails = useCallback(() => {
        setDetailOpenedId(null);
        setViewedOpenedId(null);
        setDetailsData(null);
    }, []);

    return (
        <div className={'press-wrap items-wrap'}>
            <div className={'ingame-box press items'}>
                <div className={'menu-wrap social'}>
                    {children}
                </div>
                <div className={'head'}>
                    <div className={'flex-container'}>
                        <TippyWrapper content={<div className={'hint-popup'}>
                            <p className={'hint'}>Shows the amount of available effort you can use for press journals.</p>
                        </div>}>
                            <div className={'space-item printing-efforts'}>
                                <span>Printing Efforts:</span>
                                <span>{formatValue(pressData.printing_effort)}</span>
                            </div>
                        </TippyWrapper>
                    </div>

                    <div className={'press-controls'}>
                        <div className={'space-item'}>
                            <TippyWrapper content={<div className={'hint-popup'}>
                                <p className={'hint'}>When enabled, shows numeric input fields instead of sliders for setting effort values.</p>
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
                    </div>
                </div>

                <div className={'journals-list'}>
                    <PerfectScrollbar>
                        <div className={'flex-container'}>
                            {pressData.journals.map(journal => (
                                <NewNotificationWrap
                                    key={journal.id}
                                    id={journal.id}
                                    isNew={newUnlocks.social?.items?.press?.items?.all?.items?.[journal.id]?.hasNew}
                                    className={'narrow-wrapper'}
                                >
                                    <JournalCard
                                        journal={journal}
                                        dataVersion={dataVersion}
                                        showNumericInputs={showNumericInputs}
                                        onSetEffort={setJournalEffort}
                                        onClick={handleJournalClick}
                                        onHover={handleJournalHover}
                                        onLeave={handleJournalLeave}
                                    />
                                </NewNotificationWrap>
                            ))}
                        </div>
                    </PerfectScrollbar>
                </div>
            </div>

            <div className={'item-detail ingame-box detail-blade'}>
                {detailsData ? (
                    <JournalDetails 
                        journal={detailsData}
                        onClose={handleCloseDetails}
                        isFixed={!!detailOpenedId}
                    />
                ) : (
                    <div className={'blade-inner'}>
                        <p>Hover or click on a journal to see details</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const JournalCard = ({ journal, dataVersion, showNumericInputs, onSetEffort, onClick, onHover, onLeave }) => {
    const [inputValue, setInputValue] = useState(journal.effortAssigned || 0);

    useEffect(() => {
        setInputValue(journal.effortAssigned || 0);
    }, [journal.effortAssigned, dataVersion]);

    const handleInputChange = (e) => {
        const value = parseFloat(e.target.value);
        if (!isNaN(value) && value >= 0 && value <= 1) {
            const roundedValue = Math.round(value * 1000000) / 1000000;
            setInputValue(roundedValue);
            onSetEffort(journal.id, roundedValue);
        }
    };

    const handleInputBlur = () => {
        setInputValue(journal.effortAssigned || 0);
    };

    const xpProgress = journal.maxXP > 0 ? (journal.xp || 0) / journal.maxXP : 0;

    return (
        <div 
            className={'card journal'}
            onMouseEnter={() => onHover(journal.id)}
            onMouseLeave={onLeave}
            onClick={() => onClick(journal.id)}
        >
            <div className={'head'}>
                <p className={'title'}>{journal.name}</p>
                <span className={'level'}>{formatInt(journal.level)}</span>
            </div>

            <div className={'bottom'}>
                <div className={'xp-box'}>
                    <span className={'xp-text'}>
                        XP: {formatInt(journal.xp || 0)}/{formatInt(journal.maxXP || 100)}
                    </span>
                    {journal.xpRate > 0 && (
                        <span className={'xp-income'}>+{formatValue(journal.xpRate)}/s</span>
                    )}
                </div>
                <div className={'progress-wrap'}>
                    <ProgressBar className={'action-progress'} percentage={xpProgress} />
                </div>

                <div className={'effort-section buttons'}>
                    <span className={'label'}>Set Effort:</span>
                    <TippyWrapper content={<div className={'hint-popup'}>
                        <p className={'current bold'}>Current Effort: {formatValue((journal.effortAssigned || 0) * 100)}%</p>
                        <p>Regulate effort percentage for this journal. Increasing it will prioritize this journal's production.</p>
                    </div>}>
                        <div className={'effort-control flex-container flex-row'}>
                            <div 
                                className={'icon-content minimize-icon interface-icon tiny'} 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onSetEffort(journal.id, 0);
                                }}
                            >
                                <img src={"icons/interface/minimize.png"} alt="min"/>
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
                                    onClick={(e) => e.stopPropagation()}
                                />
                            )}
                            <div 
                                className={'icon-content maximize-icon interface-icon tiny'} 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onSetEffort(journal.id, 1);
                                }}
                            >
                                <img src={"icons/interface/maximize.png"} alt="max"/>
                            </div>
                        </div>
                    </TippyWrapper>
                </div>
            </div>
        </div>
    );
};

const JournalDetails = ({ journal, onClose, isFixed }) => {
    if (!journal) return null;

    return (
        <div className={'blade-outer'}>
            <PerfectScrollbar>
                <div className={'blade-inner'}>
                    <div className={'block'}>
                        <h4>{journal.name}&nbsp;({journal.level})</h4>
                        <div className={'description'}>
                            {journal.desc}
                        </div>
                    </div>

                    <div className={'block'}>
                        <div className={'progress-section'}>
                            <div className={'flex-container flex-row'}>
                                <p>XP: {formatInt(journal.xp || 0)} / {formatInt(journal.maxXP || 100)}</p>
                                {journal.xpRate > 0 && (
                                    <p className={'xp-rate'}>XP/sec: {formatValue(journal.xpRate)}</p>
                                )}
                            </div>
                            <ProgressBar 
                                percentage={journal.maxXP > 0 ? (journal.xp || 0) / journal.maxXP : 0} 
                                height={8}
                                showPercentage={false}
                            />
                        </div>
                    </div>

                    {journal.currentEffects && Object.keys(journal.currentEffects).length > 0 && (
                        <div className={'block'}>
                            <p>Current Effects (Level {journal.level}):</p>
                            <div className={'effects'}>
                                <EffectsSection effects={journal.currentEffects} maxDisplay={10} />
                            </div>
                        </div>
                    )}

                    {journal.potentialEffects && Object.keys(journal.potentialEffects).length > 0 && (
                        <div className={'block'}>
                            <p>Next Level Effects (Level {journal.level + 1}):</p>
                            <div className={'effects'}>
                                <ResourceComparison 
                                    effects1={journal.currentEffects} 
                                    effects2={journal.potentialEffects} 
                                />
                            </div>
                        </div>
                    )}

                    {journal.etas && Object.keys(journal.etas).length > 0 && (
                        <div className={'block'}>
                            <p>Learn ETA's</p>
                            <div className={'stats-block'}>
                                {Object.entries(journal.etas).map(([level, eta]) => (
                                    <p key={level}>
                                        <span>Level {formatInt(level)}: </span> 
                                        <span>{secondsToString(eta)}</span>
                                    </p>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </PerfectScrollbar>

            {isFixed && (
                <div className={'main-buttons buttons flex-container'}>
                    <button className={'warning-action'} onClick={onClose}>Close</button>
                </div>
            )}
        </div>
    );
};

export default PressWrap;

