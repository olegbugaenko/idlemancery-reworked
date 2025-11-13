import React, {useCallback, useContext, useEffect, useRef, useState} from "react";
import WorkerContext from "../../context/worker-context";
import {useWorkerClient} from "../../general/client";

const NewNotificationWrapComponent = ({ isNew, id, className = '', children }) => {
    const worker = useContext(WorkerContext);
    const { sendData } = useWorkerClient(worker);

    const [isNewLocal, setIsNewLocal] = useState(!!isNew);

    useEffect(() => {
        setIsNewLocal(!!isNew);
    }, [isNew]);

    const viewedTimeoutRef = useRef(null);

    const clearViewedTimeout = useCallback(() => {
        if (viewedTimeoutRef.current) {
            clearTimeout(viewedTimeoutRef.current);
            viewedTimeoutRef.current = null;
        }
    }, []);

    useEffect(() => clearViewedTimeout, [clearViewedTimeout]);

    useEffect(() => {
        clearViewedTimeout();
    }, [clearViewedTimeout, id]);

    useEffect(() => {
        if (!isNewLocal) {
            clearViewedTimeout();
        }
    }, [clearViewedTimeout, isNewLocal]);

    const scheduleViewed = useCallback(() => {
        if (!id || !isNewLocal) {
            return;
        }

        clearViewedTimeout();
        viewedTimeoutRef.current = window.setTimeout(() => {
            sendData('set-new-notification-viewed-by-id', { id });
            setIsNewLocal(false);
            viewedTimeoutRef.current = null;
        }, 1000);
    }, [clearViewedTimeout, id, isNewLocal, sendData]);

    const handleMouseOver = useCallback(() => {
        scheduleViewed();
    }, [scheduleViewed]);

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
