import React, {useContext, useEffect, useState} from "react";
import WorkerContext from "../../context/worker-context";
import {useWorkerClient} from "../../general/client";
import {formatInt, formatValue} from "../../general/utils/strings";
import {ProgressBar} from "../layout/progress-bar.jsx";
import PerfectScrollbar from "react-perfect-scrollbar";
import {EffectsSection} from "../shared/effects-section.jsx";

export const Actions = ({}) => {

    const worker = useContext(WorkerContext);

    const { onMessage, sendData } = useWorkerClient(worker);
    const [actionsData, setActionsData] = useState({
        available: [],
        current: undefined
    });
    const [detailOpened, setDetailOpened] = useState(null)

    useEffect(() => {
        const interval = setInterval(() => {
            sendData('query-actions-data', {});
        }, 100);
        return () => {
            clearInterval(interval);
        }
    }, [])

    onMessage('actions-data', (actions) => {
        setActionsData(actions);
    })

    const activateAction = (id) => {
        sendData('run-action', { id })
    }

    const setActionDetails = (id) => {
        if(!id) {
            setDetailOpened(null);
        } else {
            setDetailOpened(id);
        }
    }

    return (
        <div className={'actions-wrap'}>
            <div className={'ingame-box actions flex-container'}>
                {actionsData.available.map(action => <ActionCard key={action.id} {...action} onActivate={activateAction} onShowDetails={setActionDetails}/>)}
            </div>
            <div className={'action-detail ingame-box detail-blade'}>
                <ActionDetails actionId={detailOpened} />
            </div>
        </div>

    )

}

export const ActionCard = ({ id, name, level, xp, maxXP, xpRate, isActive, isLeveled, onClick, onActivate, onShowDetails}) => {
    const [isFlashActive, setFlashActive] = useState(false);

    useEffect(() => {

        console.log('Leveled!', isLeveled)
        if(isLeveled) {
            setFlashActive(true);
        }

        const timer = setTimeout(() => {
            console.log('Clearing')
            setFlashActive(false);
        }, 1000); // Adjust the time as needed

        // Cleanup the timer if the component unmounts or if someProp changes before the timer finishes
        return () => clearTimeout(timer);

    }, [isLeveled]);

    return (<div className={`card action ${isActive ? 'active' : ''} flashable ${isFlashActive ? 'flash' : ''}`} onMouseEnter={() => onShowDetails(id)} onMouseLeave={() => onShowDetails(null)}>
        <div className={'head'}>
            <p className={'title'}>{name}</p>
            <span className={'level'}>{formatInt(level)}</span>
        </div>
        <div className={'bottom'}>
            <div className={'xp-box'}>
                <span className={'xp-text'}>XP: {formatInt(xp)}/{formatInt(maxXP)}</span>
                <span className={'xp-income'}>+{formatValue(xpRate)}</span>
            </div>

            <div>
                <ProgressBar className={'action-progress'} percentage={xp/maxXP}></ProgressBar>
            </div>
            <div className={'buttons'}>
                {isActive ? <button onClick={() => onActivate()}>Stop</button> : <button onClick={() => onActivate(id)}>Start</button> }
            </div>
        </div>
    </div> )
}

export const ActionDetails = ({actionId}) => {

    const worker = useContext(WorkerContext);

    const { onMessage, sendData } = useWorkerClient(worker);

    const [action, setDetailOpened] = useState(null);

    const [interval, setIntervalRef] = useState(null);

    useEffect(() => {
        if(interval) {
            clearInterval(interval);
        }
        const intervalLoc = setInterval(() => {
            sendData('query-action-details', { id: actionId });
        }, 100);
        setIntervalRef(intervalLoc);
    }, [actionId])


    onMessage('action-details', (actions) => {
        setDetailOpened(actions);
    })

    if(!actionId || !action) return null;


    return (
        <PerfectScrollbar>
            <div className={'blade-inner'}>
                <div className={'block'}>
                    <h4>{action.name}</h4>
                    <div className={'description'}>
                        {action.description}
                    </div>
                </div>
                <div className={'block'}>
                    <div className={'bottom'}>
                        <div className={'xp-box'}>
                            <span className={'xp-text'}>XP: {formatInt(action.xp)}/{formatInt(action.maxXP)}</span>
                            <span className={'xp-income'}>+{formatValue(action.xpRate)}</span>
                        </div>

                        <div>
                            <ProgressBar className={'action-progress'} percentage={action.xp/action.maxXP}></ProgressBar>
                        </div>
                    </div>
                </div>
                <div className={'block'}>
                    <div className={'effects'}>
                        <EffectsSection effects={action.potentialEffects} />
                    </div>
                </div>
            </div>
        </PerfectScrollbar>
    )
}