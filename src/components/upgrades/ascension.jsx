import React, {useEffect, useState, useContext, useCallback} from "react";
import WorkerContext from "../../context/worker-context";
import {useWorkerClient} from "../../general/client";
import {ResourceCost} from "../shared/resource-cost.jsx";
import {formatInt} from "../../general/utils/strings";
import PerfectScrollbar from "react-perfect-scrollbar";
import {IconButton} from "../shared/icon-button.jsx";
import {TippyWrapper} from "../shared/tippy-wrapper.jsx";
import {EffectsSection} from "../shared/effects-section.jsx";

export const Ascension = () => {
    const worker = useContext(WorkerContext);

    const { onMessage, sendData } = useWorkerClient(worker);

    const [upgradesData, setJobsData] = useState({
        upgrades: [],
        ascension: {}
    });

    const [tab, setTab] = useState('ascend');

    useEffect(() => {
        const interval = setInterval(() => {
            sendData('query-ascension-upgrades-data', {});
        }, 1000);
        return () => {
            clearInterval(interval);
        }
    }, [])

    onMessage('ascension-upgrades-data', (data) => {
        setJobsData(data);
    })

    const purchaseUpgrade = useCallback((id) => {
        sendData('purchase-ascension-upgrade', { id })
    })

    const ascendNow = () => {
        if(confirm('You will loose all your progress, but receive dragon eggs. Are you sure?')) {
            sendData('do-ascend', {})
        }
    }

    return (
        <div className={'content-holder'}>
            <ul className={'tabs'}>
                <li className={`tab ${tab === 'ascend' ? 'active' : ''}`} onClick={() => setTab('ascend')}>Ascend</li>
                <li className={`tab ${tab === 'upgrades' ? 'active' : ''}`} onClick={() => setTab('upgrades')}>Upgrades</li>
            </ul>
            {tab === 'ascend' ? (<div className={'ascend-wrap'}>
                {upgradesData.ascension.isUnlocked ? (<div>
                    <h4>Ascend to receive {formatInt(upgradesData.ascension.potentialGains?.total)} dragon eggs</h4>
                    {upgradesData.ascension.potentialGains?.breakDown?.map(bd => (<h5>{bd.name}: {formatInt(bd.value)}</h5>))}
                    <div>
                        <button onClick={ascendNow}>Ascend Now</button>
                    </div>
                </div>) : (<h5>Keep progression to unlock ascend</h5>)}
            </div> ) : null}
            {tab === 'upgrades' ? (<PerfectScrollbar>
                <div className={'upgrades-wrap'}>
                    {upgradesData.upgrades.map(upgrade => (<AscensionUpgrade upgrade={upgrade} purchaseUpgrade={purchaseUpgrade}/>))}
                </div>
            </PerfectScrollbar>) : null}
        </div>
    )
}

export const AscensionUpgrade = ({ upgrade, purchaseUpgrade }) => {

    return (<div className={`upgrade-card ${!upgrade.affordable.isAffordable ? 'disabled' : ''}`}>
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
            </div>
        </div>

    </div> )

}