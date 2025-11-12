import React, { useContext, useEffect, useState } from "react";
import WorkerContext from "../../context/worker-context";
import { useWorkerClient } from "../../general/client";
import {isElectron, quitApp} from "../../general/utils/electron-checks";
import {useModal} from "../../general/components/modal/index.jsx";

function fromBase64Unicode(str) {
    return decodeURIComponent(escape(atob(str)));
}

export const SaveSettings = () => {
    const worker = useContext(WorkerContext);
    const { onMessage, sendData, removeMessage } = useWorkerClient(worker);
    const { confirm } = useModal();

    const [saveString, setSaveString] = useState("");
    const [importString, setImportString] = useState("");

    const generateSaveText = () => {
        sendData("get-save-string", { type: "text" });
    };

    const generateSaveFile = () => {
        sendData("get-save-string", { type: "file" });
    };

    const setImportText = (value) => {
        setImportString(JSON.parse(value));
    };

    const importSaveText = () => {
        let parsed;
        try {
            // Спроба розкодувати з base64
            const decoded = fromBase64Unicode(importString);
            parsed = JSON.parse(decoded);
            console.log("Decoded from base64");
        } catch (err) {
            try {
                // Якщо не вдалось, пробуємо старий формат
                parsed = JSON.parse(importString);
                console.log("Used plain JSON");
            } catch (err2) {
                console.error("Invalid save text format");
                return;
            }
        }
        sendData("load-game", parsed);
    };

    const importSaveFile = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const importedData = e.target.result;
                console.log("IMPORTING: ", importedData);
                let parsed;
                try {
                    // Спроба розкодувати з base64
                    const decoded = fromBase64Unicode(importedData);
                    parsed = JSON.parse(decoded);
                    console.log("Decoded from base64");
                } catch (err) {
                    try {
                        // Якщо не вдалось, пробуємо старий формат
                        parsed = JSON.parse(importedData);
                        console.log("Used plain JSON");
                    } catch (err2) {
                        console.error("Invalid save file format");
                        return;
                    }
                }
                sendData("load-game", parsed);
            };
            reader.readAsText(file);
        }
    };

    useEffect(() => {
        const handleSavedString = ({ type, string }) => {
            setSaveString(string);
            if (type === "file") {
                const blob = new Blob([string], { type: "text/plain;charset=utf-8" });
                const url = URL.createObjectURL(blob);

                const link = document.createElement("a");
                link.href = url;

                const date = new Date();
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0'); // Місяці нумеруються з 0
                const day = String(date.getDate()).padStart(2, '0');
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                const seconds = String(date.getSeconds()).padStart(2, '0');

                const dateString = `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
                link.download = `idle_awakening_${dateString}.txt`;

                document.body.appendChild(link);
                link.click();

                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }
        };

        onMessage("saved-string", handleSavedString);

        return () => {
            removeMessage('saved-string');
        };
    }, [onMessage, removeMessage]);

    const resetGame = () => {
        confirm({
            title: "Reset Game",
            message: "Are you sure you want to reset game? It will remove all your progress!",
            onConfirm: () => {
                sendData('reset-game', {});
            },
            confirmText: "Reset",
            cancelText: "Cancel"
        });
    }

    const closeGame = () => {
        quitApp()
    }

    const isElectronMode = isElectron();

    return (
        <div className={"save-settings-wrap inner-settings-wrap"}>
            <div className={"row flex-container"}>
                <div className={"col"}>
                    <p>Export:</p>
                    <button onClick={generateSaveText}>Export as text</button>
                    <button onClick={generateSaveFile}>Export as file</button>
                </div>
                <div className={"col"}>
                    <textarea className={"text-input"} value={saveString} readOnly />
                </div>
            </div>
            <div className={"row flex-container"}>
                <div className={"col"}>
                    <p>Import:</p>
                    <button onClick={importSaveText}>Import text</button>
                    <label htmlFor="file-upload" className="custom-file-upload">
                        Import file
                    </label>
                    <input
                        id="file-upload"
                        type="file"
                        accept=".txt"
                        onChange={importSaveFile}
                        style={{ display: "none" }}
                    />
                </div>
                <div className={"col"}>
                    <textarea
                        className={"text-input"}
                        onChange={(e) => setImportText(e.target.value)}
                        value={importString}
                    />
                </div>
            </div>
            <div className={"row flex-container"}>
                <div className={"col"}>
                    <button className={'warning-action'} onClick={resetGame}>Hard Reset Game</button>
                </div>
                <div className={'col'}>

                </div>
            </div>
            {isElectronMode ? (<div className={"row flex-container"}>
                <div className={"col"}>
                    <button onClick={closeGame}>Exit Game</button>
                </div>
                <div className={'col'}>

                </div>
            </div>) : null}
        </div>
    );
};
