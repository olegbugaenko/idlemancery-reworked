import React, {useContext, useEffect, useState} from "react";
import {formatInt, formatValue} from "../../general/utils/strings";
import PerfectScrollbar from "react-perfect-scrollbar";
import WorkerContext from "../../context/worker-context";
import {useWorkerClient} from "../../general/client";

export const UnlocksList = () => {

    const worker = useContext(WorkerContext);

    const { onMessage, sendData } = useWorkerClient(worker);

    const [actions, setActions] = useState([]);
    const [effects, setEffects] = useState([]);
    const [showUnlocked, setShowUnlocked] = useState(false);

    useEffect(() => {
        sendData('query-actions-unlocks', { showUnlocked });
        sendData('query-attributes-unlocks', { showUnlocked });
    }, [showUnlocked]);

    onMessage('actions-unlocks', (actionsData) => {
        setActions(actionsData);
    })

    onMessage('attributes-unlocks', (attributesData) => {
        setEffects(attributesData);
    })

    return (<div className={'unlocks-map'}>
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
                                    {effect.nextUnlock ? (<><div className={'unlocks-progress'}>
                                        <div className={'progress-bg'} style={{ width: `${effect.progress}%`}}></div>
                                        <span className={'centered-percentage'}>{formatValue(effect.progress)}%</span>
                                        </div>
                                        <p className={'unlock-value'}>{formatValue(effect.value)} / {formatInt(effect.nextUnlock.level)}</p></>)
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
                            {action.nextUnlock ? (<><div className={'unlocks-progress'}>
                                    <div className={'progress-bg'} style={{ width: `${action.progress}%`}}></div>
                                    <span className={'centered-percentage'}>{formatValue(action.progress)}%</span>
                                </div>
                                    <p className={'unlock-value'}>{formatValue(action.value)} / {formatInt(action.nextUnlock.level)}</p></>)
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
    </div> )

}