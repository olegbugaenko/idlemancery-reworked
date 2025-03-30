import React, { useState, useEffect, useRef, useContext } from "react";
import WorkerContext from "../../context/worker-context";
import { useWorkerClient } from "../../general/client";
import { useAppContext } from "../../context/ui-context";
import { TippyWrapper } from "../shared/tippy-wrapper.jsx";
import { ProgressBar } from "./progress-bar.jsx";
import {formatInt, formatValue, secondsToString} from "../../general/utils/strings";

export const PersonageCircle = () => {
    const worker = useContext(WorkerContext);
    const { onMessage, sendData } = useWorkerClient(worker);
    const { setActivePopup } = useAppContext();
    const [mageData, setMageData] = useState({});
    const [settings, setSettings] = useState({});
    const elementRef = useRef(null);

    useEffect(() => {
        sendData('query-mage-data', { prefix: 'xpbar' });

        const interval = setInterval(() => {
            sendData('query-mage-data', { prefix: 'xpbar' });
        }, 200);

        return () => {
            clearInterval(interval);
        }
    }, []);

    useEffect(() => {
        window.notation = settings.notation;
        console.log('Settings: ', settings);
    }, [settings?.notation]);

    onMessage('mage-data-xpbar', (data) => {
        const {settings, ...mage} = data;
        setMageData(mage);
        setSettings(settings);
    });

    return mageData ? (
        <div className={'mage-wrap flex-container'} ref={elementRef}>
            <TippyWrapper placement={"top"} content={<div className={'hint-popup'}>
                <p>Level: {formatInt(mageData.mageLevel)}</p>
                <p>XP: {formatInt(mageData.mageXP)} / {formatInt(mageData.mageMaxXP)}</p>
                {mageData?.xpBalance ? (<div className={'balances block'}>
                    {mageData.xpBalance.actions?.map(balance => (<p className={'small-hint'}>Running action - {balance.name}: {formatValue(balance.dxp)}</p>))}
                </div> ) : null}
            </div>}>
                <div className={'outer-xp-circle'}>
                    <div
                        className={'inner-xp-circle'}
                        style={{
                            '--angle': `${(mageData.mageXP/(mageData.mageMaxXP + 1.e-8)) * 360}`,
                        }}
                    >
                        <div className={'holder-circle'}>
                            <div className={'level'} id={'level'}>
                                <span className={`skills-button ${mageData.skillPoints > 0 ? 'highlight' : ''}`} onClick={() => setActivePopup('skills')}>
                                    <img src={'icons/ui/sp.png'} />
                                    <span>{mageData.skillPoints}</span>
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className={'level-circle'}>
                        {formatInt(mageData.mageLevel)}
                    </div>
                </div>
            </TippyWrapper>
        </div>
    ) : null;
};
