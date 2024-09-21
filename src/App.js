import React, {useEffect, useState} from 'react';
import Worker from './worker/main.worker.js';
import {useWorkerClient} from "./general/client";
import {Main} from "./components/main.jsx";
import 'react-tippy/dist/tippy.css'
import WorkerContext from "./context/worker-context";
import './assets/styles.css';
import 'react-perfect-scrollbar/dist/css/styles.css';

function App() {
    const worker = window.worker || new Worker();

    window.worker = worker;

    const { onMessage, sendData } = useWorkerClient(window.worker);

    const [readyToGo, setReadyToGo] = useState(false);

    useEffect(() => {
        sendData('initialize-game', { a: 1 });

        // Cleanup
        return () => {
            console.log('Worker terminated...');
            worker.terminate();
        };
    }, []);

    onMessage('initialized', (event) => {
        console.log('Received from worker:', event);
        const saveString = window.localStorage.getItem('idlemanceryV2Reworked');
        if(!saveString) {
            setReadyToGo(true);
            return
        }
        console.log('found save');
        sendData('load-game', JSON.parse(saveString));
    });

    onMessage('loaded', () => {
        setReadyToGo(true);
    })

    onMessage('save-game', (data) => {
        window.localStorage.setItem('idlemanceryV2Reworked', JSON.stringify(data));
    })

    useEffect(() => {
        if(readyToGo) {
            sendData('start-ticking');
        }
    }, [readyToGo])

    return (
        <WorkerContext.Provider value={worker}>
            <div className="App">
                <Main readyToGo={readyToGo} />
            </div>
        </WorkerContext.Provider>
    );
}

export default App;
