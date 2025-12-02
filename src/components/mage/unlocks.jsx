import React, {useContext, useEffect, useState, useCallback} from "react";
import {formatInt, formatValue} from "../../general/utils/strings";
import PerfectScrollbar from "react-perfect-scrollbar";
import WorkerContext from "../../context/worker-context";
import {useWorkerClient} from "../../general/client";
import {TippyWrapper} from "../shared/tippy-wrapper.jsx";

export const UnlocksList = () => {

    const worker = useContext(WorkerContext);

    const { onMessage, sendData } = useWorkerClient(worker);

    const [actions, setActions] = useState([]);
    const [effects, setEffects] = useState([]);
    const [totalUnlocks, setTotalUnlocks] = useState([]);
    const [showUnlocked, setShowUnlocked] = useState(false);
    const [openedSections, setOpenedSections] = useState({});
    const [sectionsLoaded, setSectionsLoaded] = useState(false);

    useEffect(() => {
        sendData('query-unlocks-opened-sections', {});
    }, []);

    useEffect(() => {
        sendData('query-actions-unlocks', { showUnlocked });
        sendData('query-attributes-unlocks', { showUnlocked });
        sendData('query-total-unlocks', { showUnlocked });
    }, [showUnlocked]);

    onMessage('actions-unlocks', (actionsData) => {
        setActions(actionsData);
    })

    onMessage('attributes-unlocks', (attributesData) => {
        setEffects(attributesData);
    })

    onMessage('total-unlocks', (unlocksData) => {
        // console.log('unlocksData: ', unlocksData);
        setTotalUnlocks(unlocksData);
    })

    onMessage('unlocks-opened-sections', (sections) => {
        if (!sectionsLoaded) {
            setOpenedSections(sections || {});
            setSectionsLoaded(true);
        }
    })

    const toggleSection = useCallback((id) => {
        setOpenedSections(prev => {
            const currentValue = prev[id];
            // If undefined, default to true (opened), so toggle to false
            const newValue = currentValue === undefined ? false : !currentValue;
            const newState = {
                ...prev,
                [id]: newValue
            };
            sendData('set-unlocks-opened-sections', { [id]: newValue });
            return newState;
        });
    }, [sendData]);

    const isSectionOpened = useCallback((id) => {
        const value = openedSections[id];
        // If undefined (not set), default to true (opened)
        return value !== false;
    }, [openedSections]);

    return (<div className={'unlocks-map'}>
        <div className={'heading'}>
            <p>Total Unlocked: {totalUnlocks?.totalCompleted} / {totalUnlocks?.total}</p>
        </div>
        <div className={'unlocks-scrollable'}>
            <PerfectScrollbar>
                <div className={'unlocks-inner'}>
                    <div className={'container'}>
                        <div className={'flex-container flex-row'}>
                            <h5>Attributes unlocks</h5>
                            <label>
                                Show Unlocked
                                <input type={'checkbox'} checked={showUnlocked} onChange={() => setShowUnlocked(!showUnlocked)}/>
                            </label>
                        </div>

                        <div className={'body'}>
                            {effects.map(effect => {
                                const sectionId = `effect-${effect.id}`;
                                const isOpened = isSectionOpened(sectionId);
                                return (
                                    <div key={effect.id} className={`effect-block block ${isOpened ? 'opened' : 'closed'}`}>
                                        <div className={'row flex-container unlock-header'} onClick={() => toggleSection(sectionId)} style={{ cursor: 'pointer' }}>
                                            <p className={'unlock-title'}>{effect.name}
                                            <span className={`arrow-down ${isOpened ? 'opened' : 'closed'}`}>&#8681;</span>
                                            </p>
                                            
                                            {effect.unlocks ? (
                                                    <>
                                                        <div className={'unlocks-progress'}>
                                                            <div className={'progress-bg'} style={{ width: `${effect.unlocks.progress}%`}}></div>
                                                            <span className={'centered-percentage'}>
                                                        {formatValue(effect.value)} / {formatInt(effect.unlocks.level)}
                                                                &nbsp;({formatValue(effect.unlocks.progress)}%)
                                                    </span>
                                                        </div>
                                                        {isOpened && (
                                                            <div className={'unlocked-items-container'}>
                                                                {effect.unlocks.items.map(item => (
                                                                    <TippyWrapper key={item.unlockId} placement={'bottom'} content={<div className={'hint-popup'}>{item.meta?.description || 'No description available'}</div>}>
                                                                        <p className={'unlock-goal'}>{item.meta?.scope && item.meta?.name ? `${item.meta.scope}: ${item.meta.name}` : 'Unknown'}</p>
                                                                    </TippyWrapper>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </>)
                                                : (<div className={'completed'}> <p>Complete</p></div>)}
                                        </div>
                                        {isOpened && effect.prevUnlocks.map(prev => (
                                            <TippyWrapper key={prev.unlockId} placement={'left'} content={<div className={'hint-popup'}>{prev.meta?.description || 'No description available'}</div>}>
                                                <div className={'prev-unlock flex-container flex-row'}>
                                                    <p className={'unlock-subtitle'}>{prev.meta?.scope && prev.meta?.name ? `${prev.meta.scope}: ${prev.meta.name}` : prev.data?.name || 'Unknown'}</p>
                                                    <p className={'unlock-subtitle'}>{formatValue(effect.value)}/{formatValue(prev.level)}</p>
                                                </div>
                                            </TippyWrapper>
                                        ))}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className={'container'}>
                        <h5>Actions unlocks</h5>
                        <div className={'body'}>
                            {actions.map(action => {
                                const sectionId = `action-${action.id}`;
                                const isOpened = isSectionOpened(sectionId);
                                return (
                                    <div key={action.id} className={`row flex-container unlock-item ${isOpened ? 'opened' : 'closed'}`}>
                                        <div className={'unlock-header'} onClick={() => toggleSection(sectionId)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', width: '100%' }}>
                                            <p className={'unlock-title'}>{action.name}
                                                <span className={`arrow-down ${isOpened ? 'opened' : 'closed'}`}>&#8681;</span>
                                            </p>
                                            
                                            {action.unlocks ? (<>
                                                    <div className={'unlocks-progress'}>
                                                        <div className={'progress-bg'} style={{ width: `${action.unlocks.progress}%`}}></div>
                                                        <span className={'centered-percentage'}>
                                                            {formatValue(action.level)} / {formatInt(action.unlocks.level)}
                                                            &nbsp;({formatValue(action.unlocks.progress)}%)
                                                    </span>
                                                    </div>
                                                    {isOpened && (
                                                        <div className={'unlocked-items-container'}>
                                                            {action.unlocks.items.map(item => (
                                                                <TippyWrapper key={item.unlockId} placement={'bottom'} content={<div className={'hint-popup'}>{item.meta?.description || 'No description available'}</div>}>
                                                                    <p className={'unlock-goal'}>{item.meta?.scope && item.meta?.name ? `${item.meta.scope}: ${item.meta.name}` : 'Unknown'}</p>
                                                                </TippyWrapper>
                                                            ))}
                                                        </div>
                                                    )}
                                                </>)
                                                : (<div className={'completed'}> <p>Complete</p></div>)
                                            }
                                        </div>
                                        {!action.unlocks && isOpened && action.prevUnlocks.map(prev => (
                                            <TippyWrapper key={prev.unlockId} placement={'left'} content={<div className={'hint-popup'}>{prev.meta?.description || 'No description available'}</div>}>
                                                <div className={'prev-unlock flex-container flex-row'}>
                                                    <p className={'unlock-subtitle'}>{prev.meta?.scope && prev.meta?.name ? `${prev.meta.scope}: ${prev.meta.name}` : prev.data?.name || 'Unknown'}</p>
                                                    <p className={'unlock-subtitle'}>{formatValue(action.level)}/{formatValue(prev.level)}</p>
                                                </div>
                                            </TippyWrapper>
                                        ))}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </PerfectScrollbar>
        </div>

    </div> )

}