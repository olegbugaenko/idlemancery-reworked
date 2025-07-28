import React, {useContext, useEffect, useState} from "react";
import {SocialMenu} from "./social-menu.jsx";
import {EventHallWrap} from "./event-hall.jsx";
import {useUICache} from "../../general/hooks/local-cache";
import WorkerContext from "../../context/worker-context";
import {useAppContext} from "../../context/ui-context";
import {useWorkerClient} from "../../general/client";

export const Social = ({  }) => {

    const worker = useContext(WorkerContext);

    const { onMessage, sendData } = useWorkerClient(worker);

    const [ selectedTab, setSelectedTab ] = useUICache('social_tab', 'events');

    // check for unlocks and switch once unavailable
    useEffect(() => {
        sendData('query-unlocks', { prefix: 'social-main' })
    }, [])

    onMessage('unlocks-social-main', (unlocks) => {
        const mapToPages = {
            events: 'events'
        }

        if(!unlocks[mapToPages[selectedTab]]) {
            const acceptable = Object.entries(mapToPages).filter(([tab, unlock]) => unlocks[unlock]);
            if(acceptable.length) {
                setSelectedTab(acceptable[0][0]);
            }
        }
    })

    if(selectedTab === 'events') {
        return <EventHallWrap>
            <SocialMenu selectedTab={selectedTab} setSelectedTab={setSelectedTab}/>
        </EventHallWrap>
    }

}