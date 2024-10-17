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

    useEffect(() => {
        sendData('query-actions-unlocks', {});
        sendData('query-attributes-unlocks', {});
    }, []);

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
                    <h5>Attributes unlocks</h5>
                    <div className={'body'}>
                        {effects.map(effect => (<div className={'row flex-container'}>
                            <p>{effect.name}</p>
                            <p>{formatValue(effect.value)} / {formatInt(effect.nextUnlock.level)}</p>
                        </div> ))}
                    </div>
                </div>
                <div className={'container'}>
                    <h5>Actions unlocks</h5>
                    <div className={'body'}>
                        {actions.map(action => (<div className={'row flex-container'}>
                            <p>{action.name}</p>
                            <p>{formatInt(action.level)} / {formatInt(action.nextUnlock.level)}</p>
                        </div> ))}
                    </div>
                </div>
            </div>
        </PerfectScrollbar>
    </div> )

}