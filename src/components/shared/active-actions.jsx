import React, {useContext, useEffect, useState} from "react";
import WorkerContext from "../../context/worker-context";
import {useWorkerClient} from "../../general/client";

export const ActiveActions = () => {
    const worker = useContext(WorkerContext);

    const { onMessage, sendData, removeMessage } = useWorkerClient(worker);
    const [actionsData, setActionsData] = useState({ title: 'Nothing' });

    useEffect(() => {
        sendData('query-actions-running', {})
        const interval = setInterval(() => {
            sendData('query-actions-running', {});
        }, 200);
        return () => {
            clearInterval(interval);
        }
    }, [sendData])

    useEffect(() => {
        onMessage('actions-running', setActionsData);

        return () => {
            removeMessage('actions-running');
        };
    }, [onMessage, removeMessage]);

    return (<div className={'active-actions-wrap'}>
        <p>Running Actions: {actionsData.title}</p>
    </div> )

}