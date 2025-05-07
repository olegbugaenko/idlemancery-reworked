import React, {createContext, useContext, useState, useCallback, useEffect} from 'react';
import Joyride from 'react-joyride';
import WorkerContext from "./worker-context";
import {useWorkerClient} from "../general/client";
import {tutorials} from "./tutorials";

const TutorialContext = createContext(null);

function MyTooltip({ step, closeProps, primaryProps, isNextAllowed, isLastStep, cantBeRetried }) {

    const handleSkip = (e) => {

        if (closeProps.onClick) {
            if(!cantBeRetried) {
                closeProps.onClick(e);
                return;
            }
            if(confirm('Are you sure you want to skip tutorial? If you do so, you won\'t be able to restart it.')) {
                closeProps.onClick(e);
            }
        }
    };

    return (
        <div className={'hint-popup tutorial-popup'}>
            <div className={'step-content'}>{step.content}</div>
            <div className={'buttons'}>
                <div className={'left'}>
                    {isNextAllowed ? (<button className={'primary-action'} {...primaryProps}>{isLastStep ? 'Complete' : 'Next'}</button>) : null}
                </div>
                {!isLastStep ? (<div>
                    <button className={'warning-action'} onClick={handleSkip}>Skip</button>
                </div>) : null}

            </div>
            {/* Кнопки Next/Back/Close */}

        </div>
    );
}

export function TutorialProvider({ children }) {
    // Стан управління Joyride
    const [currentTourId, setCurrentTourId] = useState(null);
    const [stepIndex, setStepIndex] = useState(0);
    const [run, setRun] = useState(false);
    const [isNextAllowed, setIsNextAllowed] = useState(true);

    const worker = useContext(WorkerContext);

    const { onMessage, sendData } = useWorkerClient(worker);

    useEffect(() => {
        const step = tutorials[currentTourId]?.[stepIndex];
        if (step) {
            setIsNextAllowed(!step.actionRequired); // дозвіл, якщо не потрібна дія
        }
    }, [stepIndex, currentTourId]);



    // Допоміжні функції
    const startTutorialById = useCallback((id) => {
        if (!tutorials[id]) {
            console.warn(`Tutorial with ID "${id}" not found.`);
            return;
        }

        if (run) {
            console.warn('A tutorial is already running.');
            return;
        }

        setCurrentTourId(id);
        setStepIndex(0);
        setRun(true);
    }, [run]);

    const stopTutorial = useCallback(() => {
        setRun(false);
        setCurrentTourId(null);
    }, []);

    const nextStep = useCallback(() => {
        setStepIndex((prev) => prev + 1);
    }, []);

    const jumpOver = useCallback((idx, param = 2) => {
        setStepIndex((prev) => idx ?? prev + param);
    }, []);

    const unlockNextById = useCallback((check_index) => {
        setStepIndex((prev) => prev === check_index ? prev + 1 : prev);
    })

    const setNextAllowedById = useCallback((check_index) => {
        console.log('Allowing: ', check_index, stepIndex);
        if (check_index === stepIndex) {
            setIsNextAllowed(true);
        }
    }, [stepIndex]);

    // Можемо передбачити й інші методи (goToStep, prevStep, тощо)

    // Будуємо контекстне значення
    const value = {
        stepIndex,
        setStepIndex,
        run,
        setRun,
        startTutorialById,
        stopTutorial,
        nextStep,
        unlockNextById,
        jumpOver,
        currentTourId,
        setNextAllowedById,
        isNextAllowed
    };

    return (
        <TutorialContext.Provider value={value}>
            {/* Joyride - один раз у “верхньому” рівні */}
            <Joyride
                steps={tutorials[currentTourId] || []}
                tooltipComponent={(props) => {
                    const isLastStep = (tutorials[currentTourId]?.length ?? 0) - 1 === stepIndex;
                    return <MyTooltip {...props} isNextAllowed={isNextAllowed} isLastStep={isLastStep} cantBeRetried={currentTourId === 'initial'}/>;
                }}
                stepIndex={stepIndex}
                run={run}
                continuous
                showSkipButton
                disableBeacon={true}
                callback={(data) => {
                    const { index, type, action, status } = data;

                    // console.log('UNN: ', data);

                    if (type === 'tour:end') {
                        if (status === 'skipped') {
                            // Користувач пропустив тур
                            sendData('set_tour_finished', { skipStep: stepIndex, tutorial: currentTourId });
                        } else if (status === 'finished') {
                            // Тур завершено нормально
                            sendData('set_tour_finished', { tutorial: currentTourId });
                        }
                        stopTutorial();
                    }

                    if (type === 'step:after' && action === 'next') {
                        if(index >= tutorials[currentTourId].length - 1) {
                            // console.log('Finishhh!');
                            sendData('set_tour_finished', { tutorial: currentTourId });
                        }
                        setStepIndex(index + 1);
                    }
                    if (type === 'step:after' && action === 'close') {
                        sendData('set_tour_finished', { skipStep: stepIndex, tutorial: currentTourId });
                        stopTutorial();
                    }


                }}
                styles={{
                    options: {
                        arrowColor: '#fff',
                        // Фоновий колір тултипу
                        backgroundColor: '#111',
                        // Колір затемнення фону (оверлею)
                        overlayColor: 'rgba(0, 0, 0, 0.5)',
                        // Основний колір (колір кнопок Next, Back, Skip)
                        primaryColor: '#112',
                        // Колір тексту (у тултипі)
                        textColor: '#fff',
                        zIndex: 10000
                    },
                    tooltip: {
                        // Стиль основного контейнера тултипу
                        borderRadius: '2px',
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        borderColor: '#777'
                    },
                    spotlight: {
                        pointerEvents: 'none'
                    }
                }}
            />
            {children}
        </TutorialContext.Provider>
    );
}


export function useTutorial() {
    return useContext(TutorialContext);
}
