import {NewNotificationWrap} from "../shared/new-notification-wrap.jsx";
import React, {useContext, useEffect, useState} from "react";
import {useWorkerClient} from "../../general/client";
import WorkerContext from "../../context/worker-context";

export const SocialMenu = ({ selectedTab, setSelectedTab }) => {

    const worker = useContext(WorkerContext);

    const { onMessage, sendData, removeMessage } = useWorkerClient(worker);

    const [newUnlocks, setNewUnlocks] = useState({});

    const [unlocks, setUnlocksData] = useState({});

    useEffect(() => {
        sendData('query-unlocks', { prefix: 'social' });
        sendData('query-new-unlocks-notifications', { suffix: 'social-menu', scope: 'social' });
        const interval = setInterval(() => {
            sendData('query-new-unlocks-notifications', { suffix: 'social-menu', scope: 'social' })
        }, 1000);
        return () => {
            clearInterval(interval);
        }
    }, [])

    useEffect(() => {
        onMessage('unlocks-social', (unlocks) => {
            setUnlocksData(unlocks);
        });
        
        return () => {
            removeMessage('unlocks-social');
        };
    }, []);

    useEffect(() => {
        onMessage('new-unlocks-notifications-social-menu', payload => {
            setNewUnlocks(payload);
        });
        
        return () => {
            removeMessage('new-unlocks-notifications-social-menu');
        };
    }, []);

    return (
            <ul className={'menu'}>
                {unlocks.events ? (<li id={'social-menu-events'} className={`${selectedTab === 'events' ? 'active' : ''}`} onClick={() => {setSelectedTab('events');}}>
                    <NewNotificationWrap isNew={newUnlocks.social?.items?.events?.hasNew}>
                        <span>Event Hall</span>
                    </NewNotificationWrap>
                </li>) : null}
                {unlocks.press ? (<li id={'social-menu-press'} className={`${selectedTab === 'press' ? 'active' : ''}`} onClick={() => {setSelectedTab('press');}}>
                    <NewNotificationWrap isNew={newUnlocks.social?.items?.press?.hasNew}>
                        <span>Press</span>
                    </NewNotificationWrap>
                </li>) : null}
            </ul>
        )
} 