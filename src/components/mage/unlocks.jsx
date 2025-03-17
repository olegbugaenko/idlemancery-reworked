import React, {useContext, useEffect, useState} from "react";
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
                            {effects.map(effect => (<div className={'effect-block block'}>
                                    <div className={'row flex-container'}>
                                        <p className={'unlock-title'}>{effect.name}</p>
                                        {effect.unlocks ? (
                                                <>
                                                    <div className={'unlocks-progress'}>
                                                        <div className={'progress-bg'} style={{ width: `${effect.unlocks.progress}%`}}></div>
                                                        <span className={'centered-percentage'}>
                                                    {formatValue(effect.value)} / {formatInt(effect.unlocks.level)}
                                                            &nbsp;({formatValue(effect.unlocks.progress)}%)
                                                </span>
                                                    </div>
                                                    <div className={'unlocked-items-container'}>
                                                        {effect.unlocks.items.map(item => (
                                                            <TippyWrapper placement={'bottom'} content={<div className={'hint-popup'}>{item.meta?.description}</div> }>
                                                                <p className={'unlock-goal'}>{item.meta?.scope}: {item.meta?.name}</p>
                                                            </TippyWrapper>
                                                        ))}
                                                    </div>
                                                    {/*<p className={'unlock-value'}>{formatValue(effect.value)} / {formatInt(effect.nextUnlock.level)}</p>*/}

                                                </>)
                                            : (<div className={'completed'}> <p>Complete</p></div>)}
                                    </div>
                                    {effect.prevUnlocks.map(prev => (<div className={'prev-unlock flex-container flex-row'}>
                                        <p className={'unlock-subtitle'}>{prev.data?.name}</p>
                                        <p className={'unlock-subtitle'}>{formatValue(effect.value)}/{formatValue(prev.level)}</p>
                                    </div> ))}

                                </div>
                            ))}
                        </div>
                    </div>
                    <div className={'container'}>
                        <h5>Actions unlocks</h5>
                        <div className={'body'}>
                            {actions.map(action => (<div className={'row flex-container'}>
                                <p className={'unlock-title'}>{action.name}</p>
                                {action.unlocks ? (<>
                                        <div className={'unlocks-progress'}>
                                            <div className={'progress-bg'} style={{ width: `${action.progress}%`}}></div>
                                            <span className={'centered-percentage'}>
                                                        {formatValue(action.level)} / {formatInt(action.unlocks.level)}
                                                &nbsp;({formatValue(action.unlocks.progress)}%)
                                        </span>
                                        </div>
                                        <div className={'unlocked-items-container'}>
                                            {action.unlocks.items.map(item => (
                                                <TippyWrapper placement={'bottom'} content={<div className={'hint-popup'}>{item.meta?.description}</div> }>
                                                    <p className={'unlock-goal'}>{item.meta?.scope}: {item.meta?.name}</p>
                                                </TippyWrapper>
                                            ))}
                                        </div>
                                    </>)
                                    : (<div className={'completed'}> <p>Complete</p>
                                        {action.prevUnlocks.map(prev => (<div className={'prev-unlock flex-container flex-row'}>
                                            <p className={'unlock-subtitle'}>{prev.data?.name}</p>
                                            <p className={'unlock-subtitle'}>{formatValue(action.level)}/{formatValue(prev.level)}</p>
                                        </div> ))}
                                    </div>)
                                }
                            </div> ))}
                        </div>
                    </div>
                </div>
            </PerfectScrollbar>
        </div>

    </div> )

}