import React, { useCallback, useContext, useEffect, useState } from "react";
import WorkerContext from "../../context/worker-context";
import { useWorkerClient } from "../../general/client";
import PerfectScrollbar from "react-perfect-scrollbar";
import {useSound} from "../../context/sounds/sound-context.jsx";

export const SoundSettings = () => {
    const worker = useContext(WorkerContext);
    const { onMessage, sendData } = useWorkerClient(worker);
    const { setVolume } = useSound();

    const [settings, setSettings] = useState({
        masterVolume: 0.4,
        soundsVolume: 0.4,
        musicVolume: 0.4,
    });

    useEffect(() => {
        sendData("query-settings", { prefix: "sound-settings" });
    }, []);

    onMessage("settings-sound-settings", (newSettings) => {
        setSettings((prev) => ({ ...prev, ...newSettings }));
    });

    /*const setSettingChanged = (key, value) => {
        setSettings((prev) => ({ ...prev, [key]: value }));
        sendData("set-setting", { key, value });

    };*/

    const setVolumeValue = (key, value) => {
        setVolume(key, value);
        setSettings(prev => ({...prev, [`${key}Volume`]: value}))
    }

    const renderSlider = (label, key) => (
        <div className={"row flex-container"}>
            <div className={"col"}>
                <p>{label}</p>
            </div>
            <div className={"col"}>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={settings[`${key}Volume`] ?? 0}
                    onChange={(e) => setVolumeValue(key, parseFloat(e.target.value))}
                />
            </div>
        </div>
    );

    return (
        <div className={"inner-settings-wrap sounds-wrap"}>
            <PerfectScrollbar>
                <div className={"block"}>
                    <h4>Sound Volume Settings</h4>
                    {renderSlider("Master Volume", "master")}
                    {renderSlider("Sounds Volume", "sounds")}
                    {renderSlider("Music Volume", "music")}
                </div>
            </PerfectScrollbar>
        </div>
    );
};
