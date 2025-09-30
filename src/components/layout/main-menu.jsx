import React, { useState, useEffect, useContext } from "react";
import WorkerContext from "../../context/worker-context";
import { useWorkerClient } from "../../general/client";
import { useAppContext } from "../../context/ui-context";
import { NewNotificationWrap } from "../shared/new-notification-wrap.jsx";
import {useTutorial} from "../../context/tutorial-context";

export const MainMenu = () => {
    const worker = useContext(WorkerContext);
    const { onMessage, sendData } = useWorkerClient(worker);
    const { openedTab, setOpenedTab, togglePopup } = useAppContext();
    const [unlocks, setUnlocksData] = useState({});
    const [newUnlocks, setNewUnlocks] = useState({});
    const [hotkeys, setHotkeys] = useState({});
    const { stepIndex, unlockNextById, jumpOver, currentTourId } = useTutorial();

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
        } else if(hotkey.action === 'openQuickAccess') {
            togglePopup('quick-access');
        }
    }

    const openTab = (id) => {
        setOpenedTab(id);
    }

    useEffect(() => {
        const isEditableTarget = (el) => {
            if (!el || !(el instanceof Element)) return false;
            // Allow opting-out via attribute/class
            if (el.closest('[data-ignore-hotkeys], .ignore-hotkeys')) return true;
            // Editable elements
            if (el.closest('[contenteditable="true"]')) return true;
            const inputEl = el.closest('input, textarea');
            if (inputEl) {
                const tag = inputEl.tagName?.toLowerCase();
                if (tag === 'textarea') return true;
                if (tag === 'input') {
                    const type = (inputEl.getAttribute('type') || 'text').toLowerCase();
                    const nonTypingTypes = new Set(['checkbox','radio','button','submit','range','color','file','date','datetime-local','month','time','week','hidden']);
                    const isTypingInput = !nonTypingTypes.has(type);
                    const isInteractive = !inputEl.disabled && !inputEl.readOnly;
                    return isTypingInput && isInteractive;
                }
            }
            return false;
        };

        const handleKeyDown = (event) => {
            // Suspend hotkeys when composing IME or when focus is in editable field
            if (event.isComposing || event.keyCode === 229) return;
            if (document.body.classList?.contains('hotkeys-suspended')) return;
            if (isEditableTarget(event.target)) return;

            const keys = [];
            if (event.ctrlKey) keys.push("Ctrl");
            if (event.shiftKey) keys.push("Shift");
            if (event.altKey) keys.push("Alt");
            keys.push(event.key.toUpperCase());
            const combination = keys.join("+");

            triggerHotkey(combination); // Call triggerHotkey when a combination is pressed
        };

        window.addEventListener("keydown", handleKeyDown, { capture: true });
        return () => window.removeEventListener("keydown", handleKeyDown, { capture: true });
    }, [hotkeys]);

    onMessage('all-hotkeys-all', payload => {
        // console.log('Received AllHotkeys: ', payload);
        setHotkeys(payload);
    })

    onMessage('hotkey-triggered', (hotkey) => {
        if (hotkey.action === 'selectTab') {
            openTab(hotkey.param);
        } else if (hotkey.action === 'openQuickAccess') {
            togglePopup('quick-access');
        }
    })

    onMessage('unlocks-main-menu', setUnlocksData);
    onMessage('new-unlocks-notifications-main-menu', setNewUnlocks);

    return (
        <div className={'left-most'}>
            <ul className={'menu bigger'}>
                {unlocks.actions && (
                    <li id={'main-menu-actions'} className={openedTab === 'actions' ? 'active' : ''} onClick={() => {
                        setOpenedTab('actions')
                    }}>
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
                    <li id={'main-menu-inventory'} className={openedTab === 'inventory' ? 'active' : ''} onClick={() => setOpenedTab('inventory')}>
                        <NewNotificationWrap isNew={newUnlocks.inventory?.hasNew}>
                            <span>Inventory</span>
                        </NewNotificationWrap>
                    </li>
                )}
                {unlocks.property && (
                    <li id={'main-menu-property'} className={openedTab === 'property' ? 'active' : ''} onClick={() => setOpenedTab('property')}>
                        <NewNotificationWrap isNew={newUnlocks.property?.hasNew}>
                            <span>Property</span>
                        </NewNotificationWrap>
                    </li>
                )}
                {unlocks.world && (
                    <li id={'main-menu-world'} className={openedTab === 'world' ? 'active' : ''} onClick={() => setOpenedTab('world')}>
                        <NewNotificationWrap isNew={newUnlocks.world?.hasNew}>
                            <span>World</span>
                        </NewNotificationWrap>
                    </li>
                )}
                {unlocks.workshop && (
                    <li id={'main-menu-workshop'} className={openedTab === 'workshop' ? 'active' : ''} onClick={() => setOpenedTab('workshop')}>
                        <NewNotificationWrap isNew={newUnlocks.workshop?.hasNew}>
                            <span>Workshop</span>
                        </NewNotificationWrap>
                    </li>
                )}
                {unlocks.social && (
                    <li id={'main-menu-social'} className={openedTab === 'social' ? 'active' : ''} onClick={() => setOpenedTab('social')}>
                        <NewNotificationWrap isNew={newUnlocks.social?.hasNew}>
                            <span>Social</span>
                        </NewNotificationWrap>
                    </li>
                )}
                {unlocks.spellbook && (
                    <li id={'main-menu-spellbook'} className={openedTab === 'spellbook' ? 'active' : ''} onClick={() => setOpenedTab('spellbook')}>
                        <NewNotificationWrap isNew={newUnlocks.spellbook?.hasNew}>
                            <span>Magic</span>
                        </NewNotificationWrap>
                    </li>
                )}
            </ul>
        </div>
    );
};