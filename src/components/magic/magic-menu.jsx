import {NewNotificationWrap} from "../shared/new-notification-wrap.jsx";
import React, {useContext, useEffect, useState} from "react";
import {useWorkerClient} from "../../general/client";
import WorkerContext from "../../context/worker-context";

export const MagicMenu = ({ selectedTab, setSelectedTab }) => {

    const worker = useContext(WorkerContext);

    const { onMessage, sendData } = useWorkerClient(worker);

    const [newUnlocks, setNewUnlocks] = useState({});

    const [unlocks, setUnlocksData] = useState({});

    useEffect(() => {
        sendData('query-unlocks', { prefix: 'magic' });
        sendData('query-new-unlocks-notifications', { suffix: 'spellbook', scope: 'spellbook' });
        const interval = setInterval(() => {
            sendData('query-new-unlocks-notifications', { suffix: 'spellbook', scope: 'spellbook' })
        }, 1000);
        return () => {
            clearInterval(interval);
        }
    }, [])

    onMessage('unlocks-magic', (unlocks) => {
        setUnlocksData(unlocks);
    })

    onMessage('new-unlocks-notifications-spellbook', payload => {
        setNewUnlocks(payload);
    })

    return (
            <ul className={'menu'}>
                {unlocks.crafting ? (<li id={'magic-menu-spellbook'} className={`${selectedTab === 'spellbook' ? 'active' : ''}`} onClick={() => {setSelectedTab('spellbook');}}>
                    <NewNotificationWrap isNew={newUnlocks.spellbook?.items?.spellbook?.items?.all?.hasNew}>
                        <span>Spellbook</span>
                    </NewNotificationWrap>
                </li>) : null}
                {unlocks.rituals ? (<li id={'magic-menu-rituals'} className={`${selectedTab === 'rituals' ? 'active' : ''}`} onClick={() => {setSelectedTab('rituals');}}>
                    <NewNotificationWrap isNew={newUnlocks.spellbook?.items?.spellbook?.items?.rituals?.hasNew}>
                        <span>Rituals</span>
                    </NewNotificationWrap>
                </li>) : null}
            </ul>
        )
}