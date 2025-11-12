import React, {useContext, useEffect, useState} from "react";
import WorkerContext from "../../context/worker-context";
import {useWorkerClient} from "../../general/client";
import {useAppContext} from "../../context/ui-context";
import PerfectScrollbar from "react-perfect-scrollbar";
import {dateToString} from "../../general/utils/strings";
import {useTutorial} from "../../context/tutorial-context";

export const ActiveAchievement = () => {

    const worker = useContext(WorkerContext);
    const { onMessage, sendData, removeMessage } = useWorkerClient(worker);
    const [viewedAchievement, setViewedAchievement] = useState(null);;
    const { activePopup, togglePopup } = useAppContext();
    const { run } = useTutorial();


    useEffect(() => {
        const interval = setInterval(() => {
            sendData('query-achievement-to-view', {})
        }, 1000)

        return () => {
            clearInterval(interval);
        }
    }, [])

    useEffect(() => {
        const handleAchievement = (data) => {
            setViewedAchievement(data);
        };

        onMessage('achievement-to-view', handleAchievement);

        return () => {
            removeMessage('achievement-to-view');
        };
    }, [onMessage, removeMessage]);

    useEffect(() => {
        if (run) {
            if (activePopup === 'achievement') {
                togglePopup(null);
            }
            return; // suppress achievements while tutorial is running
        }

        if (activePopup && activePopup !== 'achievement') return; // dont show over other popups
        if (activePopup === 'achievement') {
            togglePopup(null);
        }
        if (viewedAchievement) {
            togglePopup(
                'achievement',
                () => {
                    sendData('mark-achievement-viewed', { id: viewedAchievement.id });
                },
                {
                    customTitle: viewedAchievement?.title,
                    customContent: viewedAchievement?.text?.map((one, index) => (
                        <p key={index} dangerouslySetInnerHTML={{ __html: one }} />
                    ))
                }
            )
        }
    }, [viewedAchievement?.id, activePopup, run])

}

export const AchievementsCompleted = () => {
    const worker = useContext(WorkerContext);
    const { onMessage, sendData, removeMessage } = useWorkerClient(worker);
    const [achievements, setAchievements] = useState({});
    const [selectedAchievement, setSelectedAchievement] = useState(null);

    useEffect(() => {
        sendData('query-completed-achievements', {});
    }, [sendData]);

    useEffect(() => {
        onMessage('completed-achievements', setAchievements);

        return () => {
            removeMessage('completed-achievements');
        };
    }, [onMessage, removeMessage]);

    return <div className={'flex-container achievements-wrap'}>
        <div className={'achievement-list-wrap'}>
            <PerfectScrollbar>
                <div className={'achievement-list'}>
                    {achievements?.list?.map(achievement => (<div key={achievement.id} className={`achievement-wrap ${achievement.id === selectedAchievement ? 'selected' : ''}`} onClick={() => setSelectedAchievement(achievement.id)}>
                        <p className={'achievement-title'}>{achievement.title}</p>
                        <p>{dateToString(achievement.completedAt)}</p>
                    </div> ))}
                </div>
            </PerfectScrollbar>
        </div>
        <div className={'blade-outer'}>
            <div className={'story achievement-text'}>
                {achievements?.list?.find(a => a.id === selectedAchievement)?.text?.map((one, index) => (
                    <p key={index} dangerouslySetInnerHTML={{ __html: one }} />
                ))}
            </div>
        </div>
    </div>
}

export const CurrentAchievement = ({ onClose, children }) => {

    const { togglePopup } = useAppContext();

    return (<div className={'current-wrap'}>
        <div className={'achievement-text'}>
            {children}
        </div>
        <div className={'buttons'}>
            <button className={'warning-action'} onClick={() => {
                if(onClose) {
                    onClose();
                }
                togglePopup(null);
            }}>Close</button>
        </div>
    </div> )
}