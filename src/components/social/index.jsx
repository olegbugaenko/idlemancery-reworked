import React, {useContext, useEffect, useState} from "react";
import {SocialMenu} from "./social-menu.jsx";
import {EventHallWrap} from "./event-hall.jsx";
import {PressWrap} from "./press.jsx";
import {useUICache} from "../../general/hooks/local-cache";
import WorkerContext from "../../context/worker-context";
import {useAppContext} from "../../context/ui-context";
import {useWorkerClient} from "../../general/client";

export const Social = ({  }) => {

    const worker = useContext(WorkerContext);

    const { onMessage, sendData, removeMessage } = useWorkerClient(worker);

    const [ selectedTab, setSelectedTab ] = useUICache('social_tab', 'events');

    // check for unlocks and switch once unavailable
    useEffect(() => {
        sendData('query-unlocks', { prefix: 'social-main' })
    }, [])

    useEffect(() => {
        onMessage('unlocks-social-main', (unlocks) => {
            const mapToPages = {
                events: 'events',
                press: 'press'
            }

            if(!unlocks[mapToPages[selectedTab]]) {
                const acceptable = Object.entries(mapToPages).filter(([tab, unlock]) => unlocks[unlock]);
                if(acceptable.length) {
                    setSelectedTab(acceptable[0][0]);
                }
            }
        });
        
        return () => {
            removeMessage('unlocks-social-main');
        };
    }, [selectedTab]);

    if(selectedTab === 'events') {
        return <EventHallWrap>
            <SocialMenu selectedTab={selectedTab} setSelectedTab={setSelectedTab}/>
        </EventHallWrap>
    }

    if(selectedTab === 'press') {
        return <PressWrap>
            <SocialMenu selectedTab={selectedTab} setSelectedTab={setSelectedTab}/>
        </PressWrap>
    }

}