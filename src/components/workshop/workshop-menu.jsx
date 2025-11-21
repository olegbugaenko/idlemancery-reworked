import {NewNotificationWrap} from "../shared/new-notification-wrap.jsx";
import React, {useContext, useEffect, useMemo, useState} from "react";
import {useWorkerClient} from "../../general/client";
import WorkerContext from "../../context/worker-context";

export const WorkshopMenu = ({ selectedTab, setSelectedTab }) => {

    const worker = useContext(WorkerContext);

    const { onMessage, sendData, removeMessage } = useWorkerClient(worker);

    const [newUnlocks, setNewUnlocks] = useState({});

    const [unlocks, setUnlocksData] = useState({});

    const zooPreviewEnabled = useMemo(() => {
        if (typeof window === 'undefined') {
            return false;
        }
        if (process.env.NODE_ENV === 'production') {
            return false;
        }
        return new URLSearchParams(window.location.search).get('zooPreview') === '1';
    }, []);

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

    useEffect(() => {
        onMessage('unlocks-world', (unlocks) => {
            setUnlocksData(unlocks);
        });
        
        return () => {
            removeMessage('unlocks-world');
        };
    }, []);

    useEffect(() => {
        onMessage('new-unlocks-notifications-workshop', payload => {
            setNewUnlocks(payload);
        });
        
        return () => {
            removeMessage('new-unlocks-notifications-workshop');
        };
    }, []);

    const effectiveUnlocks = useMemo(() => {
        if (!zooPreviewEnabled) {
            return unlocks;
        }
        return {
            ...unlocks,
            crafting: true,
            alchemy: true,
            zoo: true,
        };
    }, [unlocks, zooPreviewEnabled]);

    return (
            <ul className={'menu'}>
                {effectiveUnlocks.crafting ? (<li id={'workshop-menu-crafting'} className={`${selectedTab === 'crafting' ? 'active' : ''}`} onClick={() => {setSelectedTab('crafting');}}>
                    <NewNotificationWrap isNew={newUnlocks.workshop?.items?.crafting?.hasNew}>
                        <span>Crafting</span>
                    </NewNotificationWrap>
                </li>) : null}
                {effectiveUnlocks.alchemy ? (<li id={'workshop-menu-alchemy'} className={`${selectedTab === 'alchemy' ? 'active' : ''}`} onClick={() => {setSelectedTab('alchemy');}}>
                    <NewNotificationWrap isNew={newUnlocks.workshop?.items?.alchemy?.hasNew}>
                        <span>Alchemy</span>
                    </NewNotificationWrap>
                </li>) : null}
                {effectiveUnlocks.plantation ? (<li id={'workshop-menu-plantation'} className={`${selectedTab === 'plantation' ? 'active' : ''}`} onClick={() => {setSelectedTab('plantation');}}>
                    <NewNotificationWrap isNew={newUnlocks.workshop?.items?.plantations?.hasNew}>
                        <span>Plantations</span>
                    </NewNotificationWrap>
                </li>) : null}
                {effectiveUnlocks.artifacts ? (<li id={'workshop-menu-artifacts'} className={`${selectedTab === 'artifacts' ? 'active' : ''}`} onClick={() => {setSelectedTab('artifacts');}}>
                    <NewNotificationWrap isNew={newUnlocks.workshop?.items?.artifacts?.hasNew}>
                        <span>Artifact Recipes</span>
                    </NewNotificationWrap>
                </li>) : null}
                {effectiveUnlocks.zoo ? (
                    <li
                        id={'workshop-menu-zoo'}
                        className={`${selectedTab === 'zoo' ? 'active' : ''}`}
                        onClick={() => {setSelectedTab('zoo');}}
                    >
                        <span>Zoo</span>
                    </li>
                ) : null}
            </ul>
        )
}