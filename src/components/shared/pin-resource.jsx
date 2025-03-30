import {TippyWrapper} from "./tippy-wrapper.jsx";
import React, {useContext} from "react";
import WorkerContext from "../../context/worker-context";
import {useWorkerClient} from "../../general/client";

export const PinResource = ({ id, isPinned }) => {

    const worker = useContext(WorkerContext);

    const { sendData, onMessage } = useWorkerClient(worker);

    const togglePinned = () => {
        sendData('set-resource-pinned', { id, flag: !isPinned});
    }

    return (<TippyWrapper content={<div className={'hint-popup'}>{isPinned ? 'Unpin item to hide it from resources sidebar' : 'Pin item to make it visible at resources sidebar'}</div> }>
        <div className={'icon-content small interface-icon'} onClick={togglePinned}>
            <img src={isPinned ? 'icons/interface/unpin.png' : 'icons/interface/pin.png'}/>
        </div>
    </TippyWrapper>)

}