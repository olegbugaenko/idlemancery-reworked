import React, { useContext, useState } from "react";
import WorkerContext from "../../context/worker-context";
import { useWorkerClient } from "../../general/client";

export const Settings = () => {
    const worker = useContext(WorkerContext);
    const { onMessage, sendData } = useWorkerClient(worker);

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
        sendData("load-game", importString);
    };

    const importSaveFile = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const importedData = e.target.result;
                console.log("IMPORTING: ", importedData);
                sendData("load-game", JSON.parse(importedData));
            };
            reader.readAsText(file);
        }
    };

    onMessage("saved-string", ({ type, string }) => {
        setSaveString(string);
        if (type === "file") {
            const blob = new Blob([string], { type: "text/plain;charset=utf-8" });
            const url = URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = "exported_data.txt";

            // Append to the document to initiate the download in all browsers
            document.body.appendChild(link);
            link.click();

            // Clean up
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    });

    return (
        <div className={"ingame-box settings-wrap"}>
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
        </div>
    );
};
