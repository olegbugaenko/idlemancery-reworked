import React, { useState, useEffect, useContext } from "react";
import WorkerContext from "../../context/worker-context";
import { useWorkerClient } from "../../general/client";
import { useAppContext } from "../../context/ui-context";
import { NewNotificationWrap } from "../shared/new-notification-wrap.jsx";

export const MainMenu = () => {
    const worker = useContext(WorkerContext);
    const { onMessage, sendData } = useWorkerClient(worker);
    const { openedTab, setOpenedTab } = useAppContext();
    const [unlocks, setUnlocksData] = useState({});
    const [newUnlocks, setNewUnlocks] = useState({});
    const [hotkeys, setHotkeys] = useState({});

    useEffect(() => {
        sendData('query-unlocks', { prefix: 'main-menu' });
        sendData('query-new-unlocks-notifications', { suffix: 'main-menu', depth: 0 });
        sendData('query-all-hotkeys', { suffix: 'all', depth: 0 });

        const interval = setInterval(() => {
            sendData('query-unlocks', { prefix: 'main-menu' });
            sendData('query-new-unlocks-notifications', { suffix: 'main-menu', depth: 0 });
        }, 200);

        return () => {
            clearInterval(interval);
        }
    }, []);

    const triggerHotkey = (combination) => {
        const hotkey = Object.values(hotkeys || {}).find(h => h.combination === combination);

        if(!hotkey) return;

        if(hotkey.action === 'selectTab') {
            openTab(hotkey.param);
        }
    }

    const openTab = (id) => {
        setOpenedTab(id);
    }

    useEffect(() => {
        const handleKeyDown = (event) => {
            const keys = [];
            if (event.ctrlKey) keys.push("Ctrl");
            if (event.shiftKey) keys.push("Shift");
            if (event.altKey) keys.push("Alt");
            keys.push(event.key.toUpperCase());
            const combination = keys.join("+");

            triggerHotkey(combination); // Call triggerHotkey when a combination is pressed
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [hotkeys]);

    onMessage('all-hotkeys-all', payload => {
        console.log('Received AllHotkeys: ', payload);
        setHotkeys(payload);
    })

    onMessage('unlocks-main-menu', setUnlocksData);
    onMessage('new-unlocks-notifications-main-menu', setNewUnlocks);

    return (
        <div className={'left-most'}>
            <ul className={'menu bigger'}>
                {unlocks.actions && (
                    <li className={openedTab === 'actions' ? 'active' : ''} onClick={() => setOpenedTab('actions')}>
                        <NewNotificationWrap isNew={newUnlocks.actions?.hasNew}>
                            <span>Actions</span>
                        </NewNotificationWrap>
                    </li>
                )}
                {unlocks.shop ? (
                    <li id={'shop'} className={openedTab === 'shop' ? 'active' : ''} onClick={() => setOpenedTab('shop')}>
                        <NewNotificationWrap isNew={newUnlocks.shop?.hasNew}>
                            <span>Shop</span>
                        </NewNotificationWrap>
                    </li>
                ) : (
                    <li id={'shop'} className={'locked'}>
                        <span>Locked (Reach 2 coins)</span>
                    </li>
                )}
                {unlocks.inventory && (
                    <li className={openedTab === 'inventory' ? 'active' : ''} onClick={() => setOpenedTab('inventory')}>
                        <NewNotificationWrap isNew={newUnlocks.inventory?.hasNew}>
                            <span>Inventory</span>
                        </NewNotificationWrap>
                    </li>
                )}
                {unlocks.property && (
                    <li className={openedTab === 'property' ? 'active' : ''} onClick={() => setOpenedTab('property')}>
                        <NewNotificationWrap isNew={newUnlocks.property?.hasNew}>
                            <span>Property</span>
                        </NewNotificationWrap>
                    </li>
                )}
                {unlocks.world && (
                    <li className={openedTab === 'world' ? 'active' : ''} onClick={() => setOpenedTab('world')}>
                        <NewNotificationWrap isNew={newUnlocks.world?.hasNew}>
                            <span>World</span>
                        </NewNotificationWrap>
                    </li>
                )}
                {unlocks.workshop && (
                    <li className={openedTab === 'workshop' ? 'active' : ''} onClick={() => setOpenedTab('workshop')}>
                        <NewNotificationWrap isNew={newUnlocks.workshop?.hasNew}>
                            <span>Workshop</span>
                        </NewNotificationWrap>
                    </li>
                )}
                {unlocks.social && (
                    <li className={openedTab === 'social' ? 'active' : ''} onClick={() => setOpenedTab('social')}>
                        <NewNotificationWrap isNew={newUnlocks.social?.hasNew}>
                            <span>Social</span>
                        </NewNotificationWrap>
                    </li>
                )}
                {unlocks.spellbook && (
                    <li className={openedTab === 'spellbook' ? 'active' : ''} onClick={() => setOpenedTab('spellbook')}>
                        <NewNotificationWrap isNew={newUnlocks.spellbook?.hasNew}>
                            <span>Spellbook</span>
                        </NewNotificationWrap>
                    </li>
                )}
            </ul>
        </div>
    );
};