import {NewNotificationWrap} from "../shared/new-notification-wrap.jsx";
import React, {useContext, useEffect, useState} from "react";
import {useWorkerClient} from "../../general/client";
import WorkerContext from "../../context/worker-context";

export const WorkshopMenu = ({ selectedTab, setSelectedTab }) => {

    const worker = useContext(WorkerContext);

    const { onMessage, sendData } = useWorkerClient(worker);

    const [newUnlocks, setNewUnlocks] = useState({});

    const [unlocks, setUnlocksData] = useState({});

    useEffect(() => {
        sendData('query-unlocks', { prefix: 'world' });
        sendData('query-new-unlocks-notifications', { suffix: 'workshop', scope: 'workshop' });
        const interval = setInterval(() => {
            sendData('query-new-unlocks-notifications', { suffix: 'workshop', scope: 'workshop' })
        }, 1000);
        return () => {
            clearInterval(interval);
        }
    }, [])

    onMessage('unlocks-world', (unlocks) => {
        setUnlocksData(unlocks);
    })

    onMessage('new-unlocks-notifications-workshop', payload => {
        setNewUnlocks(payload);
    })

    return (<div className={'menu-wrap'}>
        <ul className={'menu'}>
            {unlocks.crafting ? (<li className={`${selectedTab === 'crafting' ? 'active' : ''}`} onClick={() => {setSelectedTab('crafting');}}>
                <NewNotificationWrap isNew={newUnlocks.workshop?.items?.crafting?.hasNew}>
                    <span>Crafting</span>
                </NewNotificationWrap>
            </li>) : null}
            {unlocks.alchemy ? (<li className={`${selectedTab === 'alchemy' ? 'active' : ''}`} onClick={() => {setSelectedTab('alchemy');}}>
                <NewNotificationWrap isNew={newUnlocks.workshop?.items?.alchemy?.hasNew}>
                    <span>Alchemy</span>
                </NewNotificationWrap>
            </li>) : null}
            {unlocks.plantation ? (<li className={`${selectedTab === 'plantation' ? 'active' : ''}`} onClick={() => {setSelectedTab('plantation');}}>
                <NewNotificationWrap isNew={newUnlocks.workshop?.items?.plantations?.hasNew}>
                    <span>Plantations</span>
                </NewNotificationWrap>
            </li>) : null}
        </ul>
    </div>)
}