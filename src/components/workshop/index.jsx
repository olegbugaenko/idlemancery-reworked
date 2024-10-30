import React, {useCallback, useContext, useEffect, useState} from "react";
import WorkerContext from "../../context/worker-context";
import {useWorkerClient} from "../../general/client";
import PerfectScrollbar from "react-perfect-scrollbar";
import {EffectsSection} from "../shared/effects-section.jsx";
import {formatInt, formatValue} from "../../general/utils/strings";
import {Crafting} from "./crafting.jsx";
import {ResourceCost} from "../shared/resource-cost.jsx";
import {Alchemy} from "./alchemy.jsx";

export const Workshop = () => {

    const worker = useContext(WorkerContext);

    const { onMessage, sendData } = useWorkerClient(worker);

    const [unlocks, setUnlocksData] = useState({});

    const [ selectedTab, setSelectedTab ] = useState('crafting');

    const [detailOpened, setDetailOpened] = useState(null)


    useEffect(() => {
        const interval = setInterval(() => {
            sendData('query-unlocks', { prefix: 'workshop' });
        }, 100);
        return () => {
            clearInterval(interval);
        }
    }, [])

    onMessage('unlocks-workshop', (unlocks) => {
        setUnlocksData(unlocks);
    })

    const setItemDetails = (id) => {
        if(!id) {
            setDetailOpened(null);
        } else {
            setDetailOpened(id);
        }
    }

    const setItemLevel = useCallback((id, level) => {
        sendData('set-crafting-level', { id, level, filterId: selectedTab });
    })

    return (<div className={'items-wrap'}>
        <div className={'items ingame-box'}>
            <div className={'menu-wrap'}>
                <ul className={'menu'}>
                    {unlocks.crafting ? (<li className={`${selectedTab === 'crafting' ? 'active' : ''}`} onClick={() => {setSelectedTab('crafting'); setDetailOpened(null);}}><span>Crafting</span></li>) : null}
                    {unlocks.alchemy ? (<li className={`${selectedTab === 'alchemy' ? 'active' : ''}`} onClick={() => {setSelectedTab('alchemy'); setDetailOpened(null);}}><span>Alchemy</span></li>) : null}
                </ul>
            </div>
            {selectedTab === 'crafting' ? (<Crafting filterId={selectedTab} setItemDetails={setItemDetails} setItemLevel={setItemLevel} />) : null}
            {selectedTab === 'alchemy' ? (<Alchemy filterId={selectedTab} setItemDetails={setItemDetails} setItemLevel={setItemLevel} />) : null}
        </div>

        <div className={'item-detail ingame-box detail-blade'}>
            {detailOpened ? (<ItemDetails itemId={detailOpened} category={selectedTab}/>) : null}
        </div>
    </div>)

}


export const ItemDetails = ({itemId, category}) => {

    const worker = useContext(WorkerContext);

    const { onMessage, sendData } = useWorkerClient(worker);

    const [item, setDetailOpened] = useState(null);

    useEffect(() => {
        console.log('Details: ', itemId, category);
        if(category === 'crafting' || category === 'alchemy') {
            const interval = setInterval(() => {
                sendData('query-crafting-details', { id: itemId });
            }, 100);

            return () => {
                clearInterval(interval);
            }
        }

    })


    onMessage('crafting-details', (items) => {
        console.log('DETS: ', items);
        setDetailOpened(items);
    })

    if(!itemId || !item) return null;


    return (
        <PerfectScrollbar>
            <div className={'blade-inner'}>
                <div className={'block'}>
                    <h4>{item.name} (x{formatInt(item.level)})</h4>
                    <div className={'description'}>
                        {item.description}
                    </div>
                </div>
                {item.bottleNeck ? (<div className={'block'}>
                    <p className={'hint'}>This activity running at {formatValue(item.efficiency*100)}% due to missing {item.bottleNeck.name}</p>
                </div> ) : null}
                <div className={'block'}>
                    <p>Cost:</p>
                    <div className={'costs-wrap'}>
                        {Object.values(item.affordable.affordabilities || {}).map(aff => <ResourceCost affordabilities={aff}/>)}
                    </div>
                </div>
                <div className={'block'}>
                    <p>Effects:</p>
                    <div className={'effects'}>
                        <EffectsSection effects={item.effects} maxDisplay={10}/>
                    </div>
                </div>
            </div>
        </PerfectScrollbar>
    )
}