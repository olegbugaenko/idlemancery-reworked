import React, {useContext, useEffect, useRef, useState} from "react";
import { TippyWrapper } from "../shared/tippy-wrapper.jsx";
import {formatInt, secondsToString} from "../../general/utils/strings";
import WorkerContext from "../../context/worker-context";
import {useWorkerClient} from "../../general/client";
import {useAppContext} from "../../context/ui-context";

export const BankedTimeWrap = () => {

    const worker = useContext(WorkerContext);
    const { onMessage, sendData, removeMessage } = useWorkerClient(worker);
    const { togglePopup } = useAppContext();
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

    const setSpeedUpFactor = (factor) => {
        sendData('set-speedup-factor', { factor });
    }

    useEffect(() => {
        const handleMageData = (data) => {
            setMageData(data);
        };

        onMessage('mage-data-banked', handleMageData);

        return () => {
            removeMessage('mage-data-banked');
        };
    }, [onMessage, removeMessage]);

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
                <p>You can use this time to speed up your game by factors of 4 or 8</p>
            </div> }>
                <div className={'banked-time footer-add-info'}>
                    <img className={'ui-icon'} src={"icons/interface/time.png"}/>
                    {secondsToString((mageData.bankedTime?.current || 0)/1000)}
                    {[1, 4, 8].map((factor) => {
                        const isActive = mageData.bankedTime?.speedUpFactor === factor;
                        const isDisabled = factor > 1 && (mageData.bankedTime?.current || 0) <= 0;

                        const handleClick = () => {
                            if(isDisabled || isActive) {
                                return;
                            }

                            setSpeedUpFactor(factor);
                        };

                        return (
                            <span
                                key={factor}
                                className={`banked-toggle ${isActive ? 'activated' : ''} ${isDisabled ? 'disabled' : ''}`}
                                onClick={handleClick}
                            >
                                X{formatInt(factor)}
                            </span>
                        );
                    })}
                </div>
            </TippyWrapper>
            <ul className={'menu small'}>
                <li>
                    <TippyWrapper content={<div className={'hint-popup'}>View unlocks</div> }>
                        <div id={'goals'} className={'icon-content edit-icon interface-icon'} onClick={() => togglePopup('unlocks')}>
                            <img src={"icons/interface/icon_unlocks.png"}/>
                        </div>
                    </TippyWrapper>
                </li>
                <li>
                    <TippyWrapper content={<div className={'hint-popup'}>View statistics</div> }>
                        <div id={'statistics'} className={'icon-content edit-icon interface-icon'} onClick={() => togglePopup('statistics')}>
                            <img src={"icons/interface/icon_statistics.png"}/>
                        </div>
                    </TippyWrapper>
                </li>
                <li>
                    <TippyWrapper content={<div className={'hint-popup'}>View story</div> }>
                        <div id={'story'} className={'icon-content edit-icon interface-icon'} onClick={() => togglePopup('achievements')}>
                            <img src={"icons/interface/icon_story.png"}/>
                        </div>
                    </TippyWrapper>
                </li>
                <li>
                    <TippyWrapper content={<div className={'hint-popup'}>View Favorites</div> }>
                        <div id={'favorites'} className={'icon-content edit-icon interface-icon'} onClick={() => togglePopup('quick-access')}>
                            <img src={"icons/interface/favorite.png"}/>
                        </div>
                    </TippyWrapper>
                </li>
            </ul>
        </div>
    );
};