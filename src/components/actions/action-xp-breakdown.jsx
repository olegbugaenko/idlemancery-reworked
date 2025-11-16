import React, {useContext, useEffect, useState} from "react";
import WorkerContext from "../../context/worker-context";
import {useWorkerClient} from "../../general/client";
import {BreakDown} from "../layout/sidebar.jsx";
import {formatInt, formatValue, secondsToString} from "../../general/utils/strings";

export const ActionXPBreakdown = ({ id }) => {

    const worker = useContext(WorkerContext);

    const { onMessage, sendData, removeMessage } = useWorkerClient(worker);
    const [breakdowns, setBreakdowns] = useState({
        breakDowns: {},
        total: 0,
        nextEtas: {}
    });
    const [isCtrlPressed, setIsCtrlPressed] = useState(false);

    // const [filterId, setFilterId] = useState('all');

    useEffect(() => {
        const interval = setInterval(() => {
            sendData('query-action-xp-breakdown', { id });
        }, 1000);
        sendData('query-action-xp-breakdown', { id });

        return () => {
            clearInterval(interval);
        }
    }, [id])

    useEffect(() => {
        onMessage(`action-xp-breakdown-${id}`, breakdowns => {
            setBreakdowns(breakdowns);
        });

        return () => {
            removeMessage(`action-xp-breakdown-${id}`);
        };
    }, [id]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if(event.key === 'Control') {
                setIsCtrlPressed(true);
            }
        };

        const handleKeyUp = (event) => {
            if(event.key === 'Control' || !event.ctrlKey) {
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

    return (<div className={'hint-popup breakdowns'}>
        {!isCtrlPressed ? (<p className={'hint ctrl-hint'}>Hit Ctrl to see more details</p>) : null}
        {breakdowns.breakDowns && Object.values(breakdowns.breakDowns).length ? (
            Object.values(breakdowns.breakDowns).map(breakDown => (<div key={breakDown.title} className={'breakdown-section'}>
                <p className={'semi-title'}>{breakDown.title}: {breakDown.isPlain ? '+' : 'X'}{formatValue(breakDown.value)}</p>
                {isCtrlPressed && breakDown.breakDown ? (
                    <div className={'breakdown-section-sub'}>
                        <BreakDown breakDown={breakDown.breakDown} />
                    </div>
                ) : null}
            </div> ))
        ) : null}
        <div className={'block etas-milestones'}>
            <p>Level Milestones:</p>
            {Object.entries(breakdowns.nextEtas || {}).map(([level, time]) => {
                return (<div className={'flex-row'}>
                    <span>Level {formatInt(level)}:</span>
                    <span>{secondsToString(time)}</span>
                </div> )
            })}
        </div>
    </div> )
}