import React, { useCallback, useContext, useEffect, useState } from "react";
import WorkerContext from "../../context/worker-context";
import { useWorkerClient } from "../../general/client";
import PerfectScrollbar from "react-perfect-scrollbar";
import { isElectron } from "../../general/utils/electron-checks";

const automatedList = [{
    id: 'select_action_tab',
    checkId: '',
    action: 'selectTab',
    label: 'Switch to Actions tab',
    param: 'actions'
},{
    id: 'select_shop_tab',
    checkId: 'shop',
    action: 'selectTab',
    label: 'Switch to Shop tab',
    param: 'shop'
},{
    id: 'select_inventory_tab',
    checkId: 'inventory',
    action: 'selectTab',
    label: 'Switch to Inventory tab',
    param: 'inventory'
},{
    id: 'select_property_tab',
    checkId: 'property',
    action: 'selectTab',
    label: 'Switch to Property tab',
    param: 'property'
},{
    id: 'select_world_tab',
    checkId: 'world',
    action: 'selectTab',
    label: 'Switch to World tab',
    param: 'world'
},{
    id: 'select_workshop_tab',
    checkId: 'workshop',
    action: 'selectTab',
    label: 'Switch to Workshop tab',
    param: 'workshop'
},{
    id: 'select_spellbook_tab',
    checkId: 'spellbook',
    action: 'selectTab',
    label: 'Switch to Spellbook tab',
    param: 'spellbook'
},{
    id: 'select_social_tab',
    checkId: 'social',
    action: 'selectTab',
    label: 'Switch to Social tab',
    param: 'social'
},{
    id: 'select_settings_tab',
    checkId: '',
    action: 'selectTab',
    label: 'Switch to Settings tab',
    param: 'settings'
},{
    id: 'quick_access_panel',
    checkId: '',
    action: 'openQuickAccess',
    label: 'Open Quick Access Panel',
    param: 'quick-access'
}]

export const InterfaceSettings = () => {
    const worker = useContext(WorkerContext);

    const { onMessage, sendData, removeMessage } = useWorkerClient(worker);

    const [unlocks, setUnlocksData] = useState({});
    const [hotkeys, setHotkeys] = useState({});
    const [editingTab, setEditingTab] = useState(null); // Tracks the tab being edited
    const [currentCombination, setCurrentCombination] = useState(""); // Tracks the active combination being edited
    const [settings, setSettings] = useState({});
    const [isFullScreen, setFullScreen] = useState();

    useEffect(() => {
        if (isElectron && window.electron?.isFullscreen) {
            window.electron.isFullscreen().then(isFull => {
                setFullScreen(isFull);
            });
        }
        sendData("query-unlocks", {});
        sendData("query-all-hotkeys", {});
        sendData("query-settings", {})
    }, []);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (editingTab) {
                const keys = [];
                if (event.ctrlKey) keys.push("Ctrl");
                if (event.shiftKey) keys.push("Shift");
                if (event.altKey) keys.push("Alt");
                keys.push(event.key.toUpperCase());
                setCurrentCombination(keys.join("+"));
                event.preventDefault();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [editingTab]);

    useEffect(() => {
        const handleUnlocks = (nextUnlocks) => {
            setUnlocksData(nextUnlocks);
        };

        const handleSettings = (nextSettings) => {
            setSettings(nextSettings);
            if (isElectron() && window?.zoomAPI?.set && typeof nextSettings?.uiScalePercent !== 'undefined') {
                const factor = Math.max(0.5, Math.min(3, Number(nextSettings.uiScalePercent) / 100));
                window.zoomAPI.set(factor);
            }
        };

        const handleHotkeys = (payload) => {
            setHotkeys(payload);
        };

        onMessage("unlocks", handleUnlocks);
        onMessage("settings", handleSettings);
        onMessage("all-hotkeys", handleHotkeys);

        return () => {
            removeMessage('unlocks');
            removeMessage('settings');
            removeMessage('all-hotkeys');
        };
    }, [onMessage, removeMessage]);

    const setSettingChanged = (key, value) => {
        sendData('set-setting', { key, value });
    }

    const clearAllNotifications = () => {
        sendData("set-all-new-notification-viewed", {});
    };

    const saveHotKey = useCallback(
        (tabId, newCombination) => {
            // Check if the combination is already used
            const isDuplicate = Object.values(hotkeys).some(
                (hotkey) => hotkey.id !== tabId && hotkey.id === newCombination
            );
            if (isDuplicate) {
                alert("This combination is already used for another tab!");
                return;
            }
            // Save the hotkey
            const params = automatedList.find(o => o.id === tabId);
            sendData("update-hotkey", { id: tabId, action: params.action, param: params.param, combination: newCombination });
            /*setHotkeys((prevHotkeys) => ({
                ...prevHotkeys,
                [tabId]: { ...prevHotkeys[tabId], id: newCombination },
            }));*/
            setEditingTab(null);
        },
        [hotkeys, sendData]
    );

    const discardChanges = () => {
        setEditingTab(null);
        setCurrentCombination("");
    };

    const toggleFullscreen = () => {
        if (window.electron?.toggleFullscreen) {
            window.electron.toggleFullscreen();
            // Після затримки оновлюємо стан (бо setFullScreen миттєво не спрацює)
            setTimeout(async () => {
                const isFull = await window.electron.isFullscreen();
                setFullScreen(isFull);
            }, 300); // або більша затримка, якщо треба
        }
    };

    const isElectronMode = isElectron();

    return (
        <div className={"inner-settings-wrap interface-wrap"}>
            <PerfectScrollbar>
                <div className={'block'}>
                    <h4>General UI</h4>
                    {isElectronMode ? (<div className={"row flex-container"}>
                        <div className={"col"}>
                            <label>
                                <input
                                    type={'checkbox'}
                                    checked={isFullScreen}
                                    onChange={toggleFullscreen}
                                />
                                Fullscreen mode
                            </label>
                        </div>
                    </div>) : null}
                    <div className={"row flex-container"}>
                        <div className={"col"}>
                            <label>
                                UI Scale
                                <select
                                    value={settings?.uiScalePercent ?? 100}
                                    onChange={(e) => {
                                        const val = Number(e.target.value);
                                        if (isElectron() && window?.zoomAPI?.set) {
                                            window.zoomAPI.set(Math.max(0.5, Math.min(3, val / 100)));
                                        }
                                        setSettingChanged('uiScalePercent', val);
                                    }}
                                >
                                    <option value={50}>50%</option>
                                    <option value={60}>60%</option>
                                    <option value={70}>70%</option>
                                    <option value={80}>80%</option>
                                    <option value={90}>90%</option>
                                    <option value={100}>100%</option>
                                    <option value={110}>110%</option>
                                    <option value={125}>125%</option>
                                    <option value={150}>150%</option>
                                    <option value={175}>175%</option>
                                    <option value={200}>200%</option>
                                    <option value={250}>250%</option>
                                    <option value={300}>300%</option>
                                </select>
                            </label>
                        </div>
                        <div className={'col'}>
                            <p className={'hint'}>Adjust interface scale. Default: 100%.</p>
                        </div>
                    </div>
                    <div className={"row flex-container"}>
                        <div className={"col"}>
                            <button onClick={clearAllNotifications}>
                                Clear all notifications
                            </button>
                        </div>
                    </div>
                    <div className={"row flex-container"}>
                        <div className={'col'}>
                            <label>
                                <input type={'checkbox'} checked={!settings?.hideStoryPopup} onChange={(e) => setSettingChanged('hideStoryPopup', !settings?.hideStoryPopup)}/>
                                Show mini-stories popup
                            </label>
                        </div>
                        <div className={'col'}>
                            <p className={'hint'}>You will still be able to access it through "Story" window</p>
                        </div>
                    </div>
                    <div className={"row flex-container"}>
                        <div className={'col'}>
                            <p>Notation</p>
                        </div>
                        <div className={'col'}>
                            <select value={settings?.notation} onChange={(e) => setSettingChanged('notation', e.target.value)}>
                                <option value={''}>Regular</option>
                                <option value={'scientific'}>Scientific</option>
                            </select>
                        </div>
                    </div>
                    {/*<div className={"row flex-container"}>
                        <div className={"col"}>
                            <label>
                                Show extended explanations
                            </label>
                        </div>
                    </div>*/}
                </div>
                <div className={'block'}>
                    <h4>Shortcuts</h4>
                    {automatedList.filter(a => !a.checkId || unlocks[a.checkId]).map(
                        (item) =>
                            (
                                <div key={item.id} className={"hotkey-row"}>
                                    <span className={"tab-label"}>{item.label}</span>
                                    {editingTab === item.id ? (
                                        <div className={'hotkey-actions'}>
                                            <span className={"hotkey-combination"}>
                                                {currentCombination || "Press key combination"}
                                            </span>
                                            <button onClick={() => saveHotKey(item.id, currentCombination)}>
                                                Save
                                            </button>
                                            <button onClick={discardChanges}>Discard</button>
                                        </div>
                                    ) : (
                                        <div className={'hotkey-actions'}>
                                            <span className={"hotkey-combination"}>
                                                {hotkeys[item.id]?.combination || "None"}
                                            </span>
                                            <button onClick={() => {
                                                setEditingTab(item.id);
                                                setCurrentCombination(hotkeys[item.id]?.id || "");
                                            }}>
                                                Edit
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )
                    )}
                </div>
            </PerfectScrollbar>
        </div>
    );
};
