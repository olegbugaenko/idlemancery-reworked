import React, {useEffect, useState, useContext, useCallback} from "react";
import WorkerContext from "../../context/worker-context";
import {useWorkerClient} from "../../general/client";
import {ResourceCost} from "../shared/resource-cost.jsx";
import {formatInt} from "../../general/utils/strings";
import PerfectScrollbar from "react-perfect-scrollbar";
import {IconButton} from "../shared/icon-button.jsx";
import {TippyWrapper} from "../shared/tippy-wrapper.jsx";
import {EffectsSection} from "../shared/effects-section.jsx";

export const Upgrades = () => {
    const worker = useContext(WorkerContext);

    const { onMessage, sendData } = useWorkerClient(worker);

    const [upgradesData, setJobsData] = useState([]);

    useEffect(() => {
        const interval = setInterval(() => {
            sendData('query-upgrades-data', {});
        }, 100);
        return () => {
            clearInterval(interval);
            sendData('monitor-upgrade', { id: 'id', reset: true });
        }
    }, [])

    onMessage('upgrades-data', (data) => {
        setJobsData(data);
    })

    const purchaseUpgrade = useCallback((id) => {
        sendData('purchase-upgrade', { id })
    })

    const queueUpgrade = useCallback((id) => {
        sendData('queue-item', { action: 'upgrade-advancement', id })
    })

    const monitorUpgrade = useCallback((id, reset) => {
        sendData('monitor-upgrade', { id, reset });
    })

    return (
        <div className={'content-holder'}>
            <PerfectScrollbar>
                <div className={'upgrades-wrap'}>
                    {upgradesData.map(upgrade => (<Upgrade upgrade={upgrade} purchaseUpgrade={purchaseUpgrade} queueUpgrade={queueUpgrade} monitorUpgrade={monitorUpgrade}/>))}
                </div>
            </PerfectScrollbar>
        </div>
    )
}

export const Upgrade = ({ upgrade, purchaseUpgrade, queueUpgrade, monitorUpgrade }) => {

    return (<div className={`upgrade-card ${!upgrade.affordable.isAffordable ? 'disabled' : ''}`} onMouseOver={() => monitorUpgrade(upgrade.id)} onMouseLeave={() => monitorUpgrade(upgrade.id, true)}>
        <div className={'heading'}>{upgrade.name} ({formatInt(upgrade.level)}{upgrade.max ? '/'+formatInt(upgrade.max) : ''})</div>
        <div className={'description'}>{upgrade.description}</div>
        <EffectsSection effects={upgrade.potentialEffects} />
        <div className={'purchase-section'}>
            <div className={'costs-wrap'}>
                {Object.values(upgrade.affordable.affordabilities || {}).map(aff => <ResourceCost affordabilities={aff}/>)}
            </div>
            <div className={'button-wrap'}>
                <TippyWrapper content={<div className={'hint-popup'}><p>Purchase Upgrade</p></div> }>
                    <IconButton icon={'upgrade'} disabled={!upgrade.affordable.isAffordable} onClick={() => purchaseUpgrade(upgrade.id)} />
                </TippyWrapper>
                <TippyWrapper content={<div className={'hint-popup'}><p>Queue Upgrade</p></div> }>
                    <IconButton icon={'queue'} onClick={() => queueUpgrade(upgrade.id)} />
                </TippyWrapper>
            </div>
        </div>

    </div> )

}