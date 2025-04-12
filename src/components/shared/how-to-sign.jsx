import React from "react";
import {TippyWrapper} from "./tippy-wrapper.jsx";
import {useTutorial} from "../../context/tutorial-context";


export const HowToSign = ({ scope }) => {
    const { startTutorialById, run } = useTutorial();

    const showHowTo = () => {
        if (!run) { // не дозволяємо запуск нового туру, якщо вже якийсь йде
            startTutorialById(scope);
        }
    };

    return (
        <TippyWrapper content={<div className="hint-popup">How it works?</div>}>
            <div className="how-to">
                <span className="how-to-sign" onClick={showHowTo}>
                    ?
                </span>
            </div>
        </TippyWrapper>
    );
};
