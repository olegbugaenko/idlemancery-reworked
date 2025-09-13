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

    const { onMessage, sendData } = useWorkerClient(window.worker);

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

    onMessage('initialized', async (event) => {
        let saveString = window.localStorage.getItem('idlemanceryV2Reworked');
        if (window.electron?.loadFromCloud()) {
            saveString = await window.electron.loadFromCloud();
        }
        if(!saveString) {
            saveString = window.localStorage.getItem('idlemanceryV2Reworked');
        }
        if(!saveString) {
            sendData('reset-game', {});
            return
        }
        sendData('load-game', JSON.parse(saveString));
    });

    onMessage('loading', (event) => {
        setReadyToGo(false);
    });

    onMessage('loaded', (pl) => {
        // Request and apply sound valumes here
        setReadyToGo(true);
        if(pl.isReset) {
            setOpenedTab('actions');
        }
    })

    onMessage('save-game', async (data) => {
        window.localStorage.setItem('idlemanceryV2Reworked', JSON.stringify(data));
        if (window.electron?.saveToCloud) {
            await window.electron.saveToCloud(data); // При збереженні
        }
    })

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
