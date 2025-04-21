import React, {useContext, useEffect, useState} from "react";
import {useUICache} from "../../general/hooks/local-cache";
import WorkerContext from "../../context/worker-context";
import {useWorkerClient} from "../../general/client";
import {MagicMenu} from "./magic-menu.jsx";
import {SpellbookWrap} from "./spellbook/spellbook.jsx";

export const Magic = ({  }) => {

    const worker = useContext(WorkerContext);

    const { onMessage, sendData } = useWorkerClient(worker);

    const [ selectedTab, setSelectedTab ] = useUICache('magic_tab', 'spellbook');

    // check for unlocks and switch once unavailable
    useEffect(() => {
        sendData('query-unlocks', { prefix: 'magic-main' })
    }, [])

    onMessage('unlocks-magic-main', (unlocks) => {
        const mapToPages = {
            spellbook: 'spellbook',
        }

        if(!unlocks[mapToPages[selectedTab]]) {
            const acceptable = Object.entries(mapToPages).filter(([tab, unlock]) => unlocks[unlock]);
            if(acceptable.length) {
                setSelectedTab(acceptable[0][0]);
            }
        }
    })

    if(selectedTab === 'spellbook') {
        return <SpellbookWrap>
            <MagicMenu selectedTab={selectedTab} setSelectedTab={setSelectedTab}/>
        </SpellbookWrap>
    }


}

