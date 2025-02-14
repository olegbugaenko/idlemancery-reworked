import React, { createContext, useContext, useState, useCallback } from 'react';
import Joyride from 'react-joyride';
import WorkerContext from "./worker-context";
import {useWorkerClient} from "../general/client";

const TutorialContext = createContext(null);

function MyTooltip({ step, closeProps, primaryProps }) {

    const handleSkip = (e) => {
        console.log('Skip button clicked');
        if (closeProps.onClick) {
            closeProps.onClick(e);
        }
    };

    return (
        <div className={'hint-popup tutorial-popup'}>
            <div className={'step-content'}>{step.content}</div>
            <div className={'buttons'}>
                {!step.actionRequired ? (<button {...primaryProps}>Next</button>) : null}
                <button onClick={handleSkip}>Skip</button>
            </div>
            {/* Кнопки Next/Back/Close */}

        </div>
    );
}

export function TutorialProvider({ children }) {
    // Стан управління Joyride
    const [stepIndex, setStepIndex] = useState(0);
    const [run, setRun] = useState(false);
    const worker = useContext(WorkerContext);

    const { onMessage, sendData } = useWorkerClient(worker);

    // Описуємо всі кроки “туру”
    const steps = [
        {
            target: '#tutorial-resources',
            content: 'Here you can see your resources. Resources are used in many activities',
            disableBeacon: true,
            disableOverlayClose: true,
            placement: 'bottom',
        },
        {
            target: '#tutorial-attr-tab',
            content: 'Click here to see your attributes',
            disableBeacon: true,
            disableOverlayClose: true,
            spotlightClicks: true,
            actionRequired: true
        },
        {
            target: '#tutorial-attributes',
            content: 'Attributes are your primary character stats. Hower over specific attribute to see what it does',
            disableBeacon: true,
            spotlightClicks: true,
            disableOverlayClose: true,
            placement: 'bottom',
            offset: 120,
            floaterProps: {
                // Найнадійніший спосіб задати зсув у Popper v2 – через modifiers:
                modifiers: [
                    {
                        name: 'offset',
                        options: {
                            offset: [0, 30],
                            // offset: [горизонтальнийЗсув, вертикальнийЗсув]
                        },
                    },
                ],
            },
        },
        {
            target: '#tutorial-res-tab',
            content: 'Lets switch back to resources tab',
            disableBeacon: true,
            disableOverlayClose: true,
            spotlightClicks: true,
            actionRequired: true
        },
        {
            target: '#actions-list-wrap',
            content: 'Here you can see list of actions available for you. To progress (earn resources, improve attributes) you need to perform various actions',
            disableBeacon: true,
            disableOverlayClose: true,
        },
        {
            target: '#item_action_walk',
            content: 'Hovering over specific action will show you its details in the right panel',
            disableBeacon: true,
            disableOverlayClose: true,
            spotlightClicks: true,
            actionRequired: true
        },
        {
            target: '#item_action_bonuses',
            content: 'Here is the list of action effects that you will receive for running the action. As you can see, Walking will consume energy',
            disableBeacon: true,
            disableOverlayClose: true,
        },
        {
            target: '#item_action_levelup',
            content: 'Here are passive permanent bonuses that action will provide for level-up. So, Walking will consume energy, but leveling it will increase Stamina (that increases passive energy generation). To upgrade action level you have to run it',
            disableBeacon: true,
            disableOverlayClose: true,
        },
        {
            target: '#activate_action_walk',
            content: 'Click "Start" button to start walking, and increase your Stamina',
            disableBeacon: true,
            disableOverlayClose: true,
            spotlightClicks: true,
            actionRequired: true
        },
        {
            target: '#level_up_indicator_action_walk',
            content: 'Now, once action is running - it increasing XP. When your progress indicator fills up - your action will level up. Each next level will require more XP.',
            disableBeacon: true,
            disableOverlayClose: true,
            spotlightClicks: true,
        },
        {
            target: '#tutorial-resources',
            content: 'So, you can see that your energy rate is reduced, but do not worry. Your energy is consumed by running action, but as you get higher Stamina attribute your net energy income will increase',
            disableBeacon: true,
            disableOverlayClose: true,
        },
        {
            target: '#tutorial-resources',
            content: 'If some of your resources fall below zero - actions and other stuff using them starts running at reduced efficiency.',
            disableBeacon: true,
            disableOverlayClose: true,
        },
        {
            target: '#item_action_walk',
            content: 'Lets wait for your walk action to level up',
            disableBeacon: true,
            disableOverlayClose: true,
            spotlightClicks: true,
            actionRequired: true
        },
        {
            target: '#activate_action_visit_city',
            content: 'Some actions are required to unlock new content. Run visit city till level 2 to unlock new actions and stuff',
            disableBeacon: true,
            disableOverlayClose: true,
            spotlightClicks: true,
            actionRequired: true
        },
        {
            target: '#shop',
            content: 'Now, you can run some actions that will help you to earn coins. Dont forget to visit shop once you earn 2 coins',
            disableBeacon: true,
            disableOverlayClose: true,
            spotlightClicks: true,
        },
        {
            target: '#goals',
            content: 'If you are not sure what to do - visit your next unlocks. It will give you better understanding of what to do to unlock new content',
            disableBeacon: true,
            disableOverlayClose: true,
            spotlightClicks: true,
        },
        {
            target: '#statistics',
            content: 'And you can click here to see various neat stats about your game. Thats all for now, good luck!',
            disableOverlayClose: true, // не даємо закрити кліком поза
            spotlightClicks: true
        }
    ];

    // Допоміжні функції
    const startTutorial = useCallback(() => {
        setStepIndex(0);
        setRun(true);
    }, []);

    const stopTutorial = useCallback(() => {
        setRun(false);
    }, []);

    const nextStep = useCallback(() => {
        setStepIndex((prev) => prev + 1);
    }, []);

    const jumpOver = useCallback((idx) => {
        setStepIndex((prev) => idx ?? prev + 2);
    }, []);

    const unlockNextById = useCallback((check_index) => {
        setStepIndex((prev) => prev === check_index ? prev + 1 : prev);
    })

    // Можемо передбачити й інші методи (goToStep, prevStep, тощо)

    // Будуємо контекстне значення
    const value = {
        stepIndex,
        setStepIndex,
        run,
        setRun,
        startTutorial,
        stopTutorial,
        nextStep,
        unlockNextById,
        jumpOver
    };

    return (
        <TutorialContext.Provider value={value}>
            {/* Joyride - один раз у “верхньому” рівні */}
            <Joyride
                steps={steps}
                tooltipComponent={MyTooltip}
                stepIndex={stepIndex}
                run={run}
                continuous
                showSkipButton
                disableBeacon={true}
                callback={(data) => {
                    const { index, type, action, status } = data;

                    console.log('UNN: ', data);

                    if (type === 'tour:end') {
                        if (status === 'skipped') {
                            // Користувач пропустив тур
                            sendData('set_tour_finished', { skipStep: stepIndex });
                        } else if (status === 'finished') {
                            // Тур завершено нормально
                            sendData('set_tour_finished', {});
                        }
                        setRun(false);
                    }

                    if (type === 'step:after' && action === 'next') {
                        if(index >= steps.length - 1) {
                            console.log('Finishhh!');
                            sendData('set_tour_finished', {});
                        }
                        setStepIndex(index + 1);
                    }
                    if (type === 'step:after' && action === 'close') {
                        sendData('set_tour_finished', { skipStep: stepIndex });
                        setRun(false);
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
