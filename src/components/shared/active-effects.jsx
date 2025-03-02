import React, {useContext, useEffect, useState} from "react";
import WorkerContext from "../../context/worker-context";
import {useWorkerClient} from "../../general/client";
import CircularProgress from "./circular-progress.jsx";
import {formatInt, secondsToString} from "../../general/utils/strings";
import {EffectsSection} from "./effects-section.jsx";
import {TippyWrapper} from "./tippy-wrapper.jsx";

export const ActiveEffects = () => {
    const worker = useContext(WorkerContext);

    const { onMessage, sendData } = useWorkerClient(worker);
    const [effectsData, setEffectsData] = useState({ list: [] });

    useEffect(() => {
        const interval = setInterval(() => {
            sendData('query-active-effects', {  });
        }, 100);
        return () => {
            clearInterval(interval);
        }
    }, []);

    onMessage('active-effects', (pl) => {
        setEffectsData(pl);
    })

    return (<div className={'active-effects-wrap'}>
        {effectsData.list.map(one => (<ActiveEffectItem key={one.id} {...one} />))}
    </div> )
}

export const ActiveEffectItem = ({ id, originalId, scope, name, description, effects, duration, durationProg, level, className }) => {

    return (<div className={`icon-card effect flashable ${className}`}>
        <TippyWrapper
            content={<div className={`hint-popup effects-popup ${className}`}>
                <div className={'blade-inner'}>
                    <div className={'block'}>
                        <h4>{name} ({formatInt(level)})</h4>
                        <div className={'description'}>
                            {description}
                        </div>
                    </div>
                    <div className={'block'}>
                        <p>Effects:</p>
                        <div className={'effects'}>
                            <EffectsSection effects={effects} maxDisplay={10} />
                        </div>
                    </div>
                    <div className={'other block'}>
                        <p>Expires in: {secondsToString(duration)}</p>
                    </div>
                </div>

            </div>}>
            <div className={`icon-content`}>
                <CircularProgress progress={durationProg}>
                    <img src={`icons/${scope}/${originalId}.png`} className={'resource'} />
                </CircularProgress>
                <span className={'level'}>{formatInt(duration)}</span>
            </div>
        </TippyWrapper>
    </div> )

}