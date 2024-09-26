import React, { useState, useContext, useEffect } from "react";
import WorkerContext from "../../context/worker-context";
import {useWorkerClient} from "../../general/client";
import { useAppContext } from '../../context/ui-context';


export const Footer = () => {

    const worker = useContext(WorkerContext);

    const { onMessage, sendData } = useWorkerClient(worker);

    const { openedTab, setOpenedTab } = useAppContext();

    const [unlocks, setUnlocksData] = useState({});

    useEffect(() => {
        const interval = setInterval(() => {
            sendData('query-unlocks', {});
        }, 100);
        return () => {
            clearInterval(interval);
        }
    }, [])

    onMessage('unlocks', (dragon) => {
        setUnlocksData(dragon);
    })

    const openTab = (id) => {
        setOpenedTab(id);
    }

    return (<div className={'footer'}>

        <div className={'bottom'}>
            <ul className={'menu'}>
                {unlocks.actions ? (<li className={openedTab === 'actions' ? 'active' : ''}>
                    <span onClick={() => openTab('actions')}>Actions</span>
                </li>) : null}
                {unlocks.shop ? (<li className={openedTab === 'shop' ? 'active' : ''}>
                    <span onClick={() => openTab('shop')}>Shop</span>
                </li>) : <li className={'locked'}>
                    <span>Locked (Reach 2 coins)</span>
                </li>}
                {unlocks.inventory ? (<li className={openedTab === 'inventory' ? 'active' : ''}>
                    <span onClick={() => openTab('inventory')}>Inventory</span>
                </li>) : null}
                {unlocks.property ? (<li className={openedTab === 'property' ? 'active' : ''}>
                    <span onClick={() => openTab('property')}>Property</span>
                </li>) : null}
            </ul>
        </div>
    </div>)

}