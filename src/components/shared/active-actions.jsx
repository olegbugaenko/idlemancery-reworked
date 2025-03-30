import React, {useContext, useEffect, useState} from "react";
import WorkerContext from "../../context/worker-context";
import {useWorkerClient} from "../../general/client";

export const ActiveActions = () => {
    const worker = useContext(WorkerContext);

    const { onMessage, sendData } = useWorkerClient(worker);
    const [actionsData, setActionsData] = useState({ title: 'Nothing' });

    useEffect(() => {
        sendData('query-actions-running', {})
        const interval = setInterval(() => {
            sendData('query-actions-running', {});
        }, 200);
        return () => {
            clearInterval(interval);
        }
    }, [])

    onMessage('actions-running', setActionsData);

    return (<div className={'active-actions-wrap'}>
        <p>Running Actions: {actionsData.title}</p>
    </div> )

}