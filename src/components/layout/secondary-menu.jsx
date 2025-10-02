import React, { useContext } from "react";
import { useAppContext } from "../../context/ui-context";
import {TippyWrapper} from "../shared/tippy-wrapper.jsx";

const openLink = (url) => {
    const isElectron = navigator.userAgent.toLowerCase().indexOf('electron') > -1;
    console.log('isElectron: ', isElectron, window.require);
    if (window.electron?.openExternal) {
        window.electron.openExternal(url);
    } else {
        window.open(url, '_blank'); // fallback у браузері
    }
};

export const SecondaryMenu = () => {
    const { openedTab, setOpenedTab } = useAppContext();
    return (
        <div className={'right-most'}>
            <ul className={'menu bigger'}>
                <li className={openedTab === 'settings' ? 'active' : ''}>
                    <TippyWrapper content={<div className={'hint-popup'}>Settings</div> }>
                        <div id={'settings'} className={'icon-content edit-icon interface-icon'} onClick={() => setOpenedTab('settings')}>
                            <img src={"icons/interface/settings.png"}/>
                        </div>
                    </TippyWrapper>
                </li>
                <li>
                    <TippyWrapper content={<div className={'hint-popup'}>Join Discord</div> }>
                        <div id={'discord'} className={'icon-content edit-icon interface-icon'}>
                            <a target={'_blank'} href={'https://discord.gg/TRRvKf4ZTG'}>
                                <img src={"icons/interface/discord.png"}/>
                            </a>
                        </div>
                    </TippyWrapper>
                </li>
                <li>
                    <TippyWrapper content={<div className={'hint-popup'}>Your feedback is invaluable! Found bug? Please, let us know!</div> }>
                        <a onClick={() => openLink('https://steamcommunity.com/app/3678950/discussions/1')}>
                            Feedback
                        </a>
                    </TippyWrapper>
                </li>
                <li className={openedTab === 'about' ? 'active' : ''} onClick={() => setOpenedTab('about')}>
                    <span>DEMO: v0.2.1g</span>
                </li>
            </ul>
        </div>
    );
};
