import React, {useContext, useEffect, useState} from "react";
import {WorkshopMenu} from "./workshop-menu.jsx";
import {CraftingWrap} from "./crafting/index.jsx";
import {AlchemyWrap} from "./alchemy/index.jsx";
import {PlantationsWrap} from "./plantations/index.jsx";
import {useUICache} from "../../general/hooks/local-cache";
import WorkerContext from "../../context/worker-context";
import {useAppContext} from "../../context/ui-context";
import {useWorkerClient} from "../../general/client";

export const Workshop = ({  }) => {

    const worker = useContext(WorkerContext);

    const { onMessage, sendData } = useWorkerClient(worker);

    const [ selectedTab, setSelectedTab ] = useUICache('workshop_tab', 'crafting');

    // check for unlocks and switch once unavailable
    useEffect(() => {
        sendData('query-unlocks', { prefix: 'workshop-main' })
    }, [])

    onMessage('unlocks-workshop-main', (unlocks) => {
        const mapToPages = {
            crafting: 'crafting',
            alchemy: 'alchemy',
            plantation: 'plantation'
        }

        if(!unlocks[mapToPages[selectedTab]]) {
            const acceptable = Object.entries(mapToPages).filter(([tab, unlock]) => unlocks[unlock]);
            if(acceptable.length) {
                setSelectedTab(acceptable[0][0]);
            }
        }
    })

    if(selectedTab === 'crafting') {
        return <CraftingWrap>
            <WorkshopMenu selectedTab={selectedTab} setSelectedTab={setSelectedTab}/>
        </CraftingWrap>
    }

    if(selectedTab === 'alchemy') {
        return <AlchemyWrap>
            <WorkshopMenu selectedTab={selectedTab} setSelectedTab={setSelectedTab}/>
        </AlchemyWrap>
    }


    if(selectedTab === 'plantation') {
        return <PlantationsWrap>
            <WorkshopMenu selectedTab={selectedTab} setSelectedTab={setSelectedTab}/>
        </PlantationsWrap>
    }

}

