import React, {useContext, useEffect, useState} from "react";
import WorkerContext from "../../context/worker-context";
import {useWorkerClient} from "../../general/client";
import {useAppContext} from "../../context/ui-context";
import PerfectScrollbar from "react-perfect-scrollbar";
import {dateToString} from "../../general/utils/strings";

export const ActiveAchievement = () => {

    const worker = useContext(WorkerContext);
    const { onMessage, sendData } = useWorkerClient(worker);
    const [viewedAchievement, setViewedAchievement] = useState(null);;
    const { activePopup, togglePopup } = useAppContext();


    useEffect(() => {
        const interval = setInterval(() => {
            sendData('query-achievement-to-view', {})
        }, 1000)

        return () => {
            clearInterval(interval);
        }
    }, [])

    onMessage('achievement-to-view', (data) => {
        setViewedAchievement(data);
    })

    useEffect(() => {
        if(activePopup) return; // dont show
        if(viewedAchievement) {
            // console.log('Setting onClosePopup for achievements', activePopup);
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
    }, [viewedAchievement, activePopup])

}

export const AchievementsCompleted = () => {
    const worker = useContext(WorkerContext);
    const { onMessage, sendData } = useWorkerClient(worker);
    const [achievements, setAchievements] = useState({});
    const [selectedAchievement, setSelectedAchievement] = useState(null);

    useEffect(() => {
        sendData('query-completed-achievements', {})
    })

    onMessage('completed-achievements', setAchievements);

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
                togglePopup(null);
                if(onClose) {
                    onClose();
                }
            }}>Close</button>
        </div>
    </div> )
}