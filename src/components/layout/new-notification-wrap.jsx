import React, {useContext} from "react";
import WorkerContext from "../../context/worker-context";
import {useWorkerClient} from "../../general/client";
import { debounce } from 'lodash';

export const NewNotificationWrap = ({ isNew, id, className, children }) => {
    const worker = useContext(WorkerContext);
    const { sendData } = useWorkerClient(worker);

    const setViewed = debounce(() => {
        if (id) {
            console.log('Set viewed: ', id);
            sendData('set-new-notification-viewed-by-id', { id });
        }
    }, 1000);

    return (
        <div
            className={`${className} new-notification-wrapper ${isNew ? 'is-new' : ''}`}
            onMouseOver={setViewed}
        >
            {children}
        </div>
    );
};
