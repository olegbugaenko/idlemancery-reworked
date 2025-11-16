import {useEffect, useState} from "react";

const isControlKey = (eventKey) => {
    return eventKey === 'Control';
};

export const useCtrlPressed = () => {
    const [isCtrlPressed, setIsCtrlPressed] = useState(false);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if(isControlKey(event.key)) {
                setIsCtrlPressed(true);
            }
        };

        const handleKeyUp = (event) => {
            if(isControlKey(event.key) || !event.ctrlKey) {
                setIsCtrlPressed(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    return isCtrlPressed;
};
