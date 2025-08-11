import React, {useState, useContext, useEffect} from "react";
import {MapWrap} from "./map/index.jsx";
import {WorldMenu} from "./world-menu.jsx";
import {ExpeditionsWrap} from "./expeditions/expeditions.jsx";
import {useWorkerClient} from "../../general/client";
import WorkerContext from "../../context/worker-context";

export const World = ({  }) => {

    const [ selectedTab, setSelectedTab ] = useState('map');
    const worker = useContext(WorkerContext);
    const { onMessage, sendData, removeMessage } = useWorkerClient(worker);
    const [unlocks, setUnlocksData] = useState({});

    useEffect(() => {
        sendData('query-unlocks', { prefix: 'world' });
    }, []);

    useEffect(() => {
        onMessage('unlocks-world', (unlocks) => {
            console.log('EXP_UNL: ', unlocks);
            setUnlocksData(unlocks);
        });
        
        return () => {
            removeMessage('unlocks-world');
        };
    }, []);

    // If expeditions are not unlocked and user tries to access them, redirect to map
    useEffect(() => {
        if (selectedTab === 'expeditions' && !unlocks?.expeditions) {
            setSelectedTab('map');
        }
    }, [selectedTab, unlocks]);

    if(selectedTab === 'map') {
        return <MapWrap>
            <WorldMenu selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
        </MapWrap>
    }

    if(selectedTab === 'expeditions' && unlocks?.expeditions) {
        return <ExpeditionsWrap>
            <WorldMenu selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
        </ExpeditionsWrap>
    }

    // Fallback to map if expeditions are not unlocked
    return <MapWrap>
        <WorldMenu selectedTab="map" setSelectedTab={setSelectedTab} />
    </MapWrap>
}

