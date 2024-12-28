import React, { useCallback, useContext, useEffect, useState } from "react";
import WorkerContext from "../../context/worker-context";
import { useWorkerClient } from "../../general/client";
import PerfectScrollbar from "react-perfect-scrollbar";

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
}]

export const InterfaceSettings = () => {
    const worker = useContext(WorkerContext);

    const { onMessage, sendData } = useWorkerClient(worker);

    const [unlocks, setUnlocksData] = useState({});
    const [hotkeys, setHotkeys] = useState({});
    const [editingTab, setEditingTab] = useState(null); // Tracks the tab being edited
    const [currentCombination, setCurrentCombination] = useState(""); // Tracks the active combination being edited

    useEffect(() => {
        sendData("query-unlocks", {});
        sendData("query-all-hotkeys", {});
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

    onMessage("unlocks", (unlocks) => {
        setUnlocksData(unlocks);
    });

    onMessage("all-hotkeys", (payload) => {
        console.log('AllHotkeys: ', payload);
        setHotkeys(payload);
    });

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

    return (
        <div className={"inner-settings-wrap interface-wrap"}>
            <PerfectScrollbar>
                <div className={"row flex-container"}>
                    <div className={"col"}>
                        <button onClick={clearAllNotifications}>
                            Clear all notifications
                        </button>
                    </div>
                </div>
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
            </PerfectScrollbar>
        </div>
    );
};
