import React, { useContext } from "react";
import { useAppContext } from "../../context/ui-context";
import {TippyWrapper} from "../shared/tippy-wrapper.jsx";

export const SecondaryMenu = () => {
    const { openedTab, setOpenedTab } = useAppContext();
    return (
        <div className={'right-most'}>
            <ul className={'menu bigger'}>
                <li className={openedTab === 'settings' ? 'active' : ''}>
                    <TippyWrapper content={<div className={'hint-popup'}>Settings</div> }>
                        <div id={'statistics'} className={'icon-content edit-icon interface-icon'} onClick={() => setOpenedTab('settings')}>
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
                    <span>
                        <a target={'_blank'} href={'https://patreon.com/user?u=83421544'}>Support Me</a>
                    </span>
                </li>
                <li className={openedTab === 'about' ? 'active' : ''} onClick={() => setOpenedTab('about')}>
                    <span>v0.1.3b</span>
                </li>
            </ul>
        </div>
    );
};
