import {useCallback, useContext, useEffect, useRef} from "react";
import WorkerContext from "../../context/worker-context";
import {useWorkerClient} from "../client";

export const useMonitoredEntity = ({ type, scope = 'effects' }) => {
    const worker = useContext(WorkerContext);
    const { sendData } = useWorkerClient(worker);
    const currentIdRef = useRef(null);

    const setMonitoredEntity = useCallback((id) => {
        if(!sendData) {
            return;
        }
        if(currentIdRef.current === id) {
            return;
        }
        currentIdRef.current = id;
        sendData('set-monitored', { scope, type, id });
    }, [scope, type, sendData]);

    useEffect(() => {
        return () => {
            if(sendData) {
                sendData('set-monitored', { scope, type, id: null });
            }
        };
    }, [scope, type, sendData]);

    return setMonitoredEntity;
};
