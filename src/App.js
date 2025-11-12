import React, { useEffect, useState } from 'react';
import { AppProvider } from './context/ui-context.js';
import { SoundProvider } from './context/sounds/sound-context.jsx';
import { TutorialProvider } from './context/tutorial-context.js';
import { TippyProvider } from './context/tippy-context.jsx';
import { Main } from './components/main.jsx';
import Worker from './worker/main.worker.js';
import {useWorkerClient} from "./general/client.js";
import {useAppContext} from "./context/ui-context.js";
import './assets/styles.css';
import 'react-perfect-scrollbar/dist/css/styles.css';
import {DndProvider} from "./custom-libs/dnd/index.js";
import WorkerContext from "./context/worker-context.js";
import {ModalProvider} from "./general/components/modal/index.jsx";

function App() {
    const worker = window.worker || new Worker();

    window.worker = worker;

    const { onMessage, sendData, removeMessage } = useWorkerClient(window.worker);

    const [readyToGo, setReadyToGo] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const { setOpenedTab } = useAppContext();

    useEffect(() => {
        console.warn('ENV: ', window.IS_DEMO);
        sendData('initialize-game', { a: 1 });

        // Cleanup
        return () => {
            worker.terminate();
        };
    }, []);

    useEffect(() => {
        const handleInitialized = async () => {
            let saveString = window.localStorage.getItem('idlemanceryV2Reworked');
            if (window.electron?.loadFromCloud()) {
                saveString = await window.electron.loadFromCloud();
            }
            if(!saveString) {
                saveString = window.localStorage.getItem('idlemanceryV2Reworked');
            }
            if(!saveString) {
                sendData('reset-game', {});
                return;
            }
            sendData('load-game', JSON.parse(saveString));
        };

        const handleLoading = () => {
            setReadyToGo(false);
        };

        const handleLoaded = (pl) => {
            setReadyToGo(true);
            if(pl.isReset) {
                setOpenedTab('actions');
            }
        };

        const handleSaveGame = async (data) => {
            window.localStorage.setItem('idlemanceryV2Reworked', JSON.stringify(data));
            if (window.electron?.saveToCloud) {
                await window.electron.saveToCloud(data); // При збереженні
            }
        };

        onMessage('initialized', handleInitialized);
        onMessage('loading', handleLoading);
        onMessage('loaded', handleLoaded);
        onMessage('save-game', handleSaveGame);

        return () => {
            removeMessage('initialized');
            removeMessage('loading');
            removeMessage('loaded');
            removeMessage('save-game');
        };
    }, [onMessage, removeMessage, sendData, setOpenedTab]);

    useEffect(() => {
        if(readyToGo) {
            sendData('start-ticking');
            setTimeout(() => {
                setIsLoading(false)
            })
        } else {
            setIsLoading(true)
        }
    }, [readyToGo])

    return (
        <AppProvider>
            <WorkerContext.Provider value={worker}>
                <SoundProvider>
                    <TutorialProvider>
                        <TippyProvider>
                            <ModalProvider>
                                <DndProvider>
                                    <div className="App">
                                        <Main readyToGo={readyToGo} isLoading={isLoading}/>
                                    </div>
                                </DndProvider>
                            </ModalProvider>
                        </TippyProvider>
                    </TutorialProvider>
                </SoundProvider>
            </WorkerContext.Provider>
        </AppProvider>
    );
}

export function AppProvided() {


    return (
        <DndProvider>
            <AppProvider>
                <App />
            </AppProvider>
        </DndProvider>
    )
}

export default AppProvided;
