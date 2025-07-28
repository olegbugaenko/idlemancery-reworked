import {NewNotificationWrap} from "../shared/new-notification-wrap.jsx";
import React, {useContext, useEffect, useState} from "react";
import {useWorkerClient} from "../../general/client";
import WorkerContext from "../../context/worker-context";

export const SocialMenu = ({ selectedTab, setSelectedTab }) => {

    const worker = useContext(WorkerContext);

    const { onMessage, sendData } = useWorkerClient(worker);

    const [newUnlocks, setNewUnlocks] = useState({});

    const [unlocks, setUnlocksData] = useState({});

    useEffect(() => {
        sendData('query-unlocks', { prefix: 'social' });
        sendData('query-new-unlocks-notifications', { suffix: 'social', scope: 'social' });
        const interval = setInterval(() => {
            sendData('query-new-unlocks-notifications', { suffix: 'social', scope: 'social' })
        }, 1000);
        return () => {
            clearInterval(interval);
        }
    }, [])

    onMessage('unlocks-social', (unlocks) => {
        setUnlocksData(unlocks);
    })

    onMessage('new-unlocks-notifications-social', payload => {
        setNewUnlocks(payload);
    })

    return (
            <ul className={'menu'}>
                {unlocks.events ? (<li id={'social-menu-events'} className={`${selectedTab === 'events' ? 'active' : ''}`} onClick={() => {setSelectedTab('events');}}>
                    <NewNotificationWrap isNew={newUnlocks.social?.items?.events?.hasNew}>
                        <span>Event Hall</span>
                    </NewNotificationWrap>
                </li>) : null}
            </ul>
        )
} 