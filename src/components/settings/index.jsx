import React, {useState} from "react";
import {SaveSettings} from "./save-settings.jsx";
import {AutomationsSettings} from "./automation-settings.jsx";

export const Settings = () => {

    const [ selectedTab, setSelectedTab ] = useState('save');

    return (<div className={'items-wrap'}>
        <div className={'items ingame-box'}>
            <div className={'menu-wrap'}>
                <ul className={'menu'}>
                    <li className={`${selectedTab === 'save' ? 'active' : ''}`} onClick={() => {setSelectedTab('save');}}><span>Save</span></li>
                    <li className={`${selectedTab === 'automations' ? 'active' : ''}`} onClick={() => {setSelectedTab('automations');}}><span>Automation</span></li>
                </ul>
            </div>
            {selectedTab === 'save' ? (<SaveSettings />) : null}
            {selectedTab === 'automations' ? (<AutomationsSettings />) : null}
        </div>
    </div>)

}