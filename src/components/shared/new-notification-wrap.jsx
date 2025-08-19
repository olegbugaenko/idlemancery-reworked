import React, {useContext, useEffect, useState} from "react";
import WorkerContext from "../../context/worker-context";
import {useWorkerClient} from "../../general/client";
import { debounce } from 'lodash';

export const NewNotificationWrap = ({ isNew, id, className, children }) => {
    const worker = useContext(WorkerContext);
    const { sendData } = useWorkerClient(worker);

    const [isNewLocal, setIsNewLocal] = useState(!!isNew);

    useEffect(() => {
        setIsNewLocal(!!isNew);
    }, [isNew]);

    const setViewed = debounce(() => {
        if (id) {
            sendData('set-new-notification-viewed-by-id', { id });
            // Optimistically hide badge until next poll
            setIsNewLocal(false);
        }
    }, 1000);

    return (
        <div
            className={`${className} new-notification-wrapper ${isNewLocal ? 'is-new' : ''}`}
            onMouseOver={setViewed}
        >
            {children}
        </div>
    );
};
