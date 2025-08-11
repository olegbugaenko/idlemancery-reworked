import {NewNotificationWrap} from "../shared/new-notification-wrap.jsx";
import React, {useContext, useEffect, useState} from "react";
import {useWorkerClient} from "../../general/client";
import WorkerContext from "../../context/worker-context";

export const WorldMenu = ({ selectedTab, setSelectedTab }) => {

    const worker = useContext(WorkerContext);

    const { onMessage, sendData, removeMessage } = useWorkerClient(worker);

    const [newUnlocks, setNewUnlocks] = useState({});

    const [unlocks, setUnlocksData] = useState({});

    useEffect(() => {
        sendData('query-unlocks', { prefix: 'world-menu' });
        const interval = setInterval(() => {
            sendData('query-new-unlocks-notifications', { suffix: 'world', scope: 'map' })
        }, 1000);
        return () => {
            clearInterval(interval);
        }
    }, [])

    useEffect(() => {
        onMessage('unlocks-world-menu', (unlocks) => {
            console.log('WDU: ', unlocks);
            setUnlocksData(unlocks);
        });
        
        return () => {
            removeMessage('unlocks-world');
        };
    }, []);

    useEffect(() => {
        onMessage('new-unlocks-notifications-world', payload => {
            setNewUnlocks(payload);
        });
        
        return () => {
            removeMessage('new-unlocks-notifications-world');
        };
    }, []);

    return (<ul className={'menu'}>
        <li className={`${selectedTab === 'map' ? 'active' : ''}`} onClick={() => {setSelectedTab('map'); }}>
            <NewNotificationWrap isNew={newUnlocks?.['world']?.items?.['map']?.hasNew}>
                <span>Map</span>
            </NewNotificationWrap>
        </li>
        {unlocks?.expeditions && (
            <li className={`${selectedTab === 'expeditions' ? 'active' : ''}`} onClick={() => {setSelectedTab('expeditions'); }}>
                <NewNotificationWrap isNew={newUnlocks?.['world']?.items?.['expeditions']?.hasNew}>
                    <span>Expeditions</span>
                </NewNotificationWrap>
            </li>
        )}
    </ul>)
}