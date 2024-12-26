import {NewNotificationWrap} from "../layout/new-notification-wrap.jsx";
import React, {useContext, useEffect, useState} from "react";
import {useWorkerClient} from "../../general/client";
import WorkerContext from "../../context/worker-context";

export const WorldMenu = () => {

    const worker = useContext(WorkerContext);

    const { onMessage, sendData } = useWorkerClient(worker);

    const [ selectedTab, setSelectedTab ] = useState('map');

    const [newUnlocks, setNewUnlocks] = useState({});

    const [unlocks, setUnlocksData] = useState({});

    useEffect(() => {
        sendData('query-unlocks', { prefix: 'world' });
        const interval = setInterval(() => {
            sendData('query-new-unlocks-notifications', { suffix: 'world', scope: 'map' })
        }, 1000);
        return () => {
            clearInterval(interval);
        }
    }, [])

    onMessage('unlocks-world', (unlocks) => {
        setUnlocksData(unlocks);
    })

    onMessage('new-unlocks-notifications-world', payload => {
        // console.log('Received unlocks: ', payload);
        setNewUnlocks(payload);
    })

    return (<ul className={'menu'}>
        <li className={`${selectedTab === 'map' ? 'active' : ''}`} onClick={() => {setSelectedTab('map'); }}>
            <NewNotificationWrap isNew={newUnlocks?.['world']?.items?.['map']?.hasNew}>
                <span>Map</span>
            </NewNotificationWrap>
        </li>
    </ul>)
}