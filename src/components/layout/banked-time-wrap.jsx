import React, {useContext, useEffect, useRef, useState} from "react";
import { TippyWrapper } from "../shared/tippy-wrapper.jsx";
import {formatInt, secondsToString} from "../../general/utils/strings";
import WorkerContext from "../../context/worker-context";
import {useWorkerClient} from "../../general/client";
import {useAppContext} from "../../context/ui-context";

export const BankedTimeWrap = () => {

    const worker = useContext(WorkerContext);
    const { onMessage, sendData } = useWorkerClient(worker);
    const { setActivePopup } = useAppContext();
    const [mageData, setMageData] = useState({});

    useEffect(() => {
        sendData('query-mage-data', { prefix: 'banked' });
        const interval = setInterval(() => {
            sendData('query-mage-data', { prefix: 'banked' });
        }, 200);
        return () => {
            clearInterval(interval);
        }
    }, []);

    const toggleSpeedUp = () => {
        sendData('toggle-speedup', {});
    }

    onMessage('mage-data-banked', (data) => {
        setMageData(data);
    });

    return (
        <div className={'banked-time-wrap'}>
            {/*<div className={'mage-rank'}>
                <p>{mageData.rankData?.name}</p>
            </div>*/}
            <div className={'time-spent'}>
                {/*<p>Time played: {secondsToString(mageData.timeSpent)}</p>*/}
                <p>Offline Time:</p>
            </div>
            <TippyWrapper content={<div className={'hint-popup'}>
                <p>You were offline {secondsToString((mageData.bankedTime?.current || 0)/1000)}</p>
                <p>Speed up bonus capped at {secondsToString((mageData.bankedTime?.max || 0)/1000)}</p>
                <p>You can use this time to speed up your game by factor of 4</p>
            </div> }>
                <div className={'banked-time footer-add-info'}>
                    <img className={'ui-icon'} src={"icons/interface/time.png"}/>
                    {secondsToString((mageData.bankedTime?.current || 0)/1000)}
                    <span className={`banked-toggle ${mageData.bankedTime?.speedUpFactor > 1 ? 'activated' : ''} ${mageData.bankedTime?.current <= 0 ? 'disabled' : ''}`} onClick={toggleSpeedUp}>
                X{formatInt(4)}
            </span>
                </div>
            </TippyWrapper>
            <ul className={'menu small'}>
                <li>
                    <TippyWrapper content={<div className={'hint-popup'}>View unlocks</div> }>
                        <div id={'goals'} className={'icon-content edit-icon interface-icon'} onClick={() => setActivePopup('unlocks')}>
                            <img src={"icons/interface/icon_unlocks.png"}/>
                        </div>
                    </TippyWrapper>
                </li>
                <li>
                    <TippyWrapper content={<div className={'hint-popup'}>View statistics</div> }>
                        <div id={'statistics'} className={'icon-content edit-icon interface-icon'} onClick={() => setActivePopup('statistics')}>
                            <img src={"icons/interface/icon_statistics.png"}/>
                        </div>
                    </TippyWrapper>
                </li>
            </ul>
        </div>
    );
};