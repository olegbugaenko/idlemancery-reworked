import React, {useState} from "react";
import {WorkshopMenu} from "./workshop-menu.jsx";
import {CraftingWrap} from "./crafting/index.jsx";
import {AlchemyWrap} from "./alchemy/index.jsx";
import {PlantationsWrap} from "./plantations/index.jsx";

export const Workshop = ({  }) => {

    const [ selectedTab, setSelectedTab ] = useState('crafting');

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

