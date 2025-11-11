import React, {useCallback, useContext, useEffect, useMemo, useState} from "react";
import WorkerContext from "../../context/worker-context";
import {useWorkerClient} from "../../general/client";
import { debounce } from 'lodash';

const NewNotificationWrapComponent = ({ isNew, id, className = '', children }) => {
    const worker = useContext(WorkerContext);
    const { sendData } = useWorkerClient(worker);

    const [isNewLocal, setIsNewLocal] = useState(!!isNew);

    useEffect(() => {
        setIsNewLocal(!!isNew);
    }, [isNew]);

    const setViewed = useMemo(() => debounce(() => {
        if (id) {
            sendData('set-new-notification-viewed-by-id', { id });
            setIsNewLocal(false);
        }
    }, 1000, { leading: false, trailing: true }), [id, sendData]);

    useEffect(() => () => {
        setViewed.cancel();
    }, [setViewed]);

    const handleMouseOver = useCallback(() => {
        setViewed();
    }, [setViewed]);

    return (
        <div
            className={`${className} new-notification-wrapper ${isNewLocal ? 'is-new' : ''}`.trim()}
            onMouseOver={handleMouseOver}
        >
            {children}
        </div>
    );
};

export const NewNotificationWrap = React.memo(NewNotificationWrapComponent);
