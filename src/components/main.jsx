import React, {useContext, useEffect} from "react";
import {Content} from "./layout/content.jsx";
import {TutorialProvider, useTutorial} from "../context/tutorial-context";
import WorkerContext from "../context/worker-context";
import {useWorkerClient} from "../general/client";
import {resumeAudioContext} from "../context/sounds/sound-manager";
import {useSound} from "../context/sounds/sound-context.jsx";

export const Main = ({ readyToGo, isLoading }) => {

    if(!readyToGo || isLoading) {
        return (<div className={'ingame-box full-size'}>
            <div className={'image'}>
                <img src={'icons/general/preloader.png'}/>
            </div>
            <div className={'loading-text'}>
                <p>Loading</p>
            </div>
        </div>)
    }

    return (
        <TutorialProvider>
            <LoadedMain />
        </TutorialProvider>
    )
}

export const LoadedMain = () => {
    const worker = useContext(WorkerContext);

    const { onMessage, sendData } = useWorkerClient(worker);
    const { startTutorialById, stopTutorial, setStepIndex } = useTutorial();
    const { initializeVolumes } = useSound();

    useEffect(() => {
        const handleFirstInput = () => {
            resumeAudioContext();
            initializeVolumes();
            window.removeEventListener('pointerdown', handleFirstInput);
        };

        window.addEventListener('pointerdown', handleFirstInput);
        return () => window.removeEventListener('pointerdown', handleFirstInput);
    }, []);

    useEffect(() => {
        sendData('query_tour_status', {})
        // startTutorial();
    }, [])

    onMessage('tour_status', payload => {
        console.log('Check tour: ', payload);
        if(!payload?.isComplete && payload.isAllowed) {
            startTutorialById('initial');
            if(payload?.skipStep) {
                setStepIndex(payload.skipStep);
            }
        }
    })

    return (<div className={'page-wrap'}>
        <Content />
    </div>)
}