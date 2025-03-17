import { useEffect, useCallback } from 'react';
import { globalEventHandlers } from "./handlers";

const workerListeners = new WeakMap();

/**
 * A React hook that creates a client to interact with a web worker.
 *
 * @param {Worker} worker - The web worker instance to interact with.
 */
export function useWorkerClient(worker) {

    // Function to register event handlers
    const onMessage = useCallback((event, callback) => {
        globalEventHandlers[event] = callback;
    }, []);

    // Function to send data to the worker
    const sendData = useCallback((event, payload) => {
        if (worker) {
            worker.postMessage(JSON.stringify({ event, payload }));
        }
    }, [worker]);

    // Function to process messages received from the worker
    const handleMessage = useCallback((event) => {
        if (!event.data) return;

        const parsed = JSON.parse(event.data);

        if (!parsed.event || !globalEventHandlers[parsed.event]) {
            // console.warn('Invalid event or handler not registered', parsed);
            // console.warn(globalEventHandlers);
            // console.warn(parsed)
            return;
        }

        const handler = globalEventHandlers[parsed.event];
        // console.log('handling '+parsed.event);
        if (handler) {
            handler(parsed.payload);
        }
    }, []);

    // Effect to attach and detach the message listener
    useEffect(() => {
        if (worker) {
            // Check if the worker already has a listener
            if (!workerListeners.has(worker)) {
                worker.addEventListener('message', handleMessage);
                workerListeners.set(worker, handleMessage);
            }

            // Cleanup function to remove the event listener
            return () => {
                // Only remove the event listener if it's the same handleMessage function
                const registeredHandler = workerListeners.get(worker);
                if (registeredHandler === handleMessage) {
                    worker.removeEventListener('message', handleMessage);
                    workerListeners.delete(worker);
                }
            };
        }
    }, [worker, handleMessage]);

    return { onMessage, sendData };
}
