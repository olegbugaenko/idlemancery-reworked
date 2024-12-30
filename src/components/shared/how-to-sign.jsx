import React from "react";
import {useAppContext} from "../../context/ui-context";
import {TippyWrapper} from "./tippy-wrapper.jsx";

export const HowToSign = ({ scope }) => {

    const { setPopupMeta, setActivePopup } = useAppContext();

    const showHowTo = () => {
        setActivePopup('howto');
        setPopupMeta({
            howToScope: scope,
        })
    }

    return (<TippyWrapper content={<div className={'hint-popup'}>How it works?</div> }>
        <div className={'how-to'}>
            <span className={'how-to-sign'} onClick={showHowTo}>
                ?
            </span>
        </div>
    </TippyWrapper> )

}