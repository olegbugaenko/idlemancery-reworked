import React, {useState} from "react";
import {MapWrap} from "./map/index.jsx";
import {WorldMenu} from "./world-menu.jsx";

export const World = ({  }) => {

    const [ selectedTab, setSelectedTab ] = useState('map');

    if(selectedTab === 'map') {
        return <MapWrap>
            <WorldMenu />
        </MapWrap>
    }

}

