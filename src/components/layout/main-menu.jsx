import React, { useState, useEffect, useContext, useCallback, useRef, useMemo } from "react";
import WorkerContext from "../../context/worker-context";
import { useWorkerClient } from "../../general/client";
import { useAppContext } from "../../context/ui-context";
import { NewNotificationWrap } from "../shared/new-notification-wrap.jsx";

const MENU_ITEMS = [
    { id: 'actions', label: 'Actions', unlockKey: 'actions', domId: 'main-menu-actions' },
    { id: 'shop', label: 'Shop', unlockKey: 'shop', domId: 'shop', lockedText: 'Locked (Reach 2 coins)' },
    { id: 'inventory', label: 'Inventory', unlockKey: 'inventory', domId: 'main-menu-inventory' },
    { id: 'property', label: 'Property', unlockKey: 'property', domId: 'main-menu-property' },
    { id: 'world', label: 'World', unlockKey: 'world', domId: 'main-menu-world' },
    { id: 'workshop', label: 'Workshop', unlockKey: 'workshop', domId: 'main-menu-workshop' },
    { id: 'social', label: 'Social', unlockKey: 'social', domId: 'main-menu-social' },
    { id: 'spellbook', label: 'Magic', unlockKey: 'spellbook', domId: 'main-menu-spellbook' },
];

const isPlainObject = (value) => Object.prototype.toString.call(value) === '[object Object]';

const cloneMenuValue = (value) => {
    if (Array.isArray(value)) {
        return value.map(cloneMenuValue);
    }

    if (isPlainObject(value)) {
        const cloned = {};
        for (const [key, nestedValue] of Object.entries(value)) {
            cloned[key] = cloneMenuValue(nestedValue);
        }
        return cloned;
    }

    return value;
};

const areMenuValuesEqual = (prevValue, nextValue) => {
    if (Object.is(prevValue, nextValue)) {
        return true;
    }

    const prevIsArray = Array.isArray(prevValue);
    const nextIsArray = Array.isArray(nextValue);
    if (prevIsArray || nextIsArray) {
        if (!prevIsArray || !nextIsArray || prevValue.length !== nextValue.length) {
            return false;
        }
        for (let i = 0; i < prevValue.length; i += 1) {
            if (!areMenuValuesEqual(prevValue[i], nextValue[i])) {
                return false;
            }
        }
        return true;
    }

    const prevIsObject = isPlainObject(prevValue);
    const nextIsObject = isPlainObject(nextValue);
    if (prevIsObject || nextIsObject) {
        if (!prevIsObject || !nextIsObject) {
            return false;
        }

        const prevKeys = Object.keys(prevValue);
        const nextKeys = Object.keys(nextValue);
        if (prevKeys.length !== nextKeys.length) {
            return false;
        }

        for (const key of prevKeys) {
            if (!Object.prototype.hasOwnProperty.call(nextValue, key)) {
                return false;
            }
            if (!areMenuValuesEqual(prevValue[key], nextValue[key])) {
                return false;
            }
        }
        return true;
    }

    return false;
};

const areMenuMapsEqual = (prev = {}, next = {}) => {
    const prevKeys = Object.keys(prev);
    const nextKeys = Object.keys(next);
    if (prevKeys.length !== nextKeys.length) return false;

    for (const key of prevKeys) {
        if (!Object.prototype.hasOwnProperty.call(next, key)) return false;
        if (!areMenuValuesEqual(prev[key], next[key])) return false;
    }

    return true;
};

const normalizeMenuMap = (map = {}) => {
    const normalized = {};
    for (const [key, value] of Object.entries(map || {})) {
        normalized[key] = cloneMenuValue(value);
    }
    return normalized;
};

const buildHotkeyLookup = (hotkeys = {}) => {
    const lookup = Object.create(null);
    for (const hotkey of Object.values(hotkeys)) {
        const combination = hotkey?.combination?.toUpperCase();
        if (combination) {
            lookup[combination] = hotkey;
        }
    }
    return lookup;
};

export const MainMenu = () => {
    const worker = useContext(WorkerContext);
    const { onMessage, sendData, removeMessage } = useWorkerClient(worker);
    const { openedTab, setOpenedTab, togglePopup } = useAppContext();
    const [unlocks, setUnlocksData] = useState({});
    const [newUnlocks, setNewUnlocks] = useState({});
    const unlocksRef = useRef(unlocks);
    const newUnlocksRef = useRef(newUnlocks);
    const hotkeyMapRef = useRef(Object.create(null));

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
    }, [sendData]);

    const openTab = useCallback((id) => {
        setOpenedTab(id);
    }, [setOpenedTab]);

    const updateUnlocks = useCallback((nextUnlocks = {}) => {
        const normalizedUnlocks = normalizeMenuMap(nextUnlocks);
        if (!areMenuMapsEqual(unlocksRef.current, normalizedUnlocks)) {
            unlocksRef.current = normalizedUnlocks;
            setUnlocksData(normalizedUnlocks);
        }
    }, [setUnlocksData]);

    const updateNewUnlocks = useCallback((nextNewUnlocks = {}) => {
        const normalizedNewUnlocks = normalizeMenuMap(nextNewUnlocks);
        if (!areMenuMapsEqual(newUnlocksRef.current, normalizedNewUnlocks)) {
            newUnlocksRef.current = normalizedNewUnlocks;
            setNewUnlocks(normalizedNewUnlocks);
        }
    }, [setNewUnlocks]);

    const triggerHotkey = useCallback((combination) => {
        const hotkey = hotkeyMapRef.current[combination];

        if(!hotkey) return;

        if(hotkey.action === 'selectTab') {
            openTab(hotkey.param);
        } else if(hotkey.action === 'openQuickAccess') {
            togglePopup('quick-access');
        }
    }, [openTab, togglePopup]);

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
            const combination = keys.join("+").toUpperCase();

            triggerHotkey(combination); // Call triggerHotkey when a combination is pressed
        };

        window.addEventListener("keydown", handleKeyDown, { capture: true });
        return () => window.removeEventListener("keydown", handleKeyDown, { capture: true });
    }, [triggerHotkey]);

    useEffect(() => {
        const handleAllHotkeys = (payload) => {
            hotkeyMapRef.current = buildHotkeyLookup(payload);
        };

        const handleHotkeyTriggered = (hotkey) => {
            if (hotkey.action === 'selectTab') {
                openTab(hotkey.param);
            } else if (hotkey.action === 'openQuickAccess') {
                togglePopup('quick-access');
            }
        };

        onMessage('all-hotkeys-all', handleAllHotkeys);
        onMessage('hotkey-triggered', handleHotkeyTriggered);
        onMessage('unlocks-main-menu', updateUnlocks);
        onMessage('new-unlocks-notifications-main-menu', updateNewUnlocks);

        return () => {
            removeMessage('all-hotkeys-all');
            removeMessage('hotkey-triggered');
            removeMessage('unlocks-main-menu');
            removeMessage('new-unlocks-notifications-main-menu');
        };
    }, [onMessage, removeMessage, openTab, togglePopup, updateUnlocks, updateNewUnlocks]);

    const menuItems = useMemo(() => MENU_ITEMS.map((item) => {
        const isUnlocked = Boolean(unlocks[item.unlockKey]);
        const hasNotification = Boolean(newUnlocks[item.unlockKey]?.hasNew);
        if(item.id === 'property') {
            console.log('Updating menu', item.id, hasNotification, newUnlocks[item.unlockKey]);
        }
        return {
            ...item,
            isUnlocked,
            hasNotification,
        };
    }), [unlocks, newUnlocks]);

    return (
        <div className={'left-most'}>
            <ul className={'menu bigger'}>
                {menuItems.map(({ id, domId, label, isUnlocked, hasNotification, lockedText }) => {
                    if (!isUnlocked && !lockedText) {
                        return null;
                    }

                    if (!isUnlocked) {
                        return (
                            <li key={id} id={domId} className={'locked'}>
                                <span>{lockedText}</span>
                            </li>
                        );
                    }

                    return (
                        <li
                            key={id}
                            id={domId}
                            className={openedTab === id ? 'active' : ''}
                            onClick={() => openTab(id)}
                        >
                            <NewNotificationWrap isNew={hasNotification}>
                                <span>{label}</span>
                            </NewNotificationWrap>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};