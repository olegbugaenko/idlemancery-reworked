import React, { useEffect, useState, useContext } from "react";
import WorkerContext from "../../context/worker-context";
import {useWorkerClient} from "../../general/client";
import {formatValue, secondsToString} from "../../general/utils/strings";
import {TippyWrapper} from "../shared/tippy-wrapper.jsx";

export const Sidebar = () => {

    const [activePanel, setActivePanel] = useState('resources');

    return (<div className={'sidebar'}>
        <ul className={'menu toogleables'}>
            <li className={`${activePanel === 'resources' ? 'active' : ''}`} onClick={() => setActivePanel('resources')}>
                <span>Resources</span>
            </li>
            <li className={`${activePanel === 'attributes' ? 'active' : ''}`} onClick={() => setActivePanel('attributes')}>
                <span>Attributes</span>
            </li>
        </ul>
        <div className={'main-bar'}>
            {activePanel === 'resources' ? <ResourcesBar /> : <AttributesBar />}
        </div>
    </div> )

}

export const ResourcesBar = () => {
    const worker = useContext(WorkerContext);

    const { onMessage, sendData } = useWorkerClient(worker);

    const [resourceData, setResourceData] = useState([]);

    useEffect(() => {
        const interval = setInterval(() => {
            sendData('query-resources-data', {});
        }, 100);
        return () => {
            clearInterval(interval);
        }
    }, [])

    onMessage('resources-data', (resources) => {
        setResourceData(resources);
    })

    return (<div className={'resources'}>
        {resourceData.map(res => {

            const aff = res.affData;

            let affClassData = ''
            if(aff) {
                affClassData = ` monitored ${aff.isAffordable ? 'affordable' : (aff.hardLocked ? 'locked' : 'unavailable')}`
            }

            return (<div className={`holder ${aff ? 'monitored' : ''}`}><p className={`resource-item ${affClassData}`}>
                <span className={'resource-label'}>{res.name}</span>
                <TippyWrapper content={<div className={'hint-popup'}>{res.eta >= 0 ? `${secondsToString(res.eta)} to full` : `${secondsToString(-res.eta)} to empty`}</div> }>
                    <span className={'resource-amount'}>{formatValue(res.amount || 0)}{res.hasCap ? `/${formatValue(res.cap || 0)}` : ''}</span>
                </TippyWrapper>
                <TippyWrapper content={<div className={'hint-popup'}><BreakDown breakDown={res.breakDown}/></div> }>
                    <span className={'resource-balance'}>{formatValue(res.balance || 0)}</span>
                </TippyWrapper>
                {aff ? (<div className={'appendix'}>
                    {aff.isAffordable ? (<span>{formatValue(aff.requirement)}</span>) : (<span>{formatValue(aff.actual - aff.requirement)}({secondsToString(aff.eta)})</span>)}
                </div> ) : null}
            </p></div>)
        })}
    </div> )
}

export const AttributesBar = () => {
    const worker = useContext(WorkerContext);

    const { onMessage, sendData } = useWorkerClient(worker);

    const [attributesData, setAttributesData] = useState({
        list: []
    });

    useEffect(() => {
        const interval = setInterval(() => {
            sendData('query-attributes-data', {});
        }, 100);
        return () => {
            clearInterval(interval);
        }
    }, [])

    onMessage('attributes-data', (attributes) => {
        setAttributesData(attributes);
    })

    return (<div className={'attributes-panel'}>
        {attributesData.list.map(res => {

            const aff = res.affData;

            let affClassData = ''
            if(aff) {
                affClassData = ` monitored ${aff.isAffordable ? 'affordable' : (aff.hardLocked ? 'locked' : 'unavailable')}`
            }

            console.log('res: ', res.breakDown);

            return (<div className={`holder ${aff ? 'monitored' : ''}`}><p className={`resource-item ${affClassData}`}>
                <TippyWrapper content={<div className={'hint-popup'}>{res.description}</div> }>
                    <span className={'resource-label'}>{res.name}</span>
                </TippyWrapper>
                <TippyWrapper content={<div className={'hint-popup'}><BreakDown breakDown={res.breakDown}/></div> }>
                    <span className={'resource-balance'}>{formatValue(res.value || 0)}</span>
                </TippyWrapper>
                {aff ? (<div className={'appendix'}>
                    {aff.isAffordable ? (<span>{formatValue(aff.requirement)}</span>) : (<span>{formatValue(aff.actual - aff.requirement)}({secondsToString(aff.eta)})</span>)}
                </div> ) : null}
            </p></div>)
        })}
    </div> )
}

export const BreakDown = ({ breakDown }) => {

    if(!breakDown) return null;

    return (<div className={'breakdown'}>
        {breakDown.income.length ? (<div className={'box'}>
            <span className={'sub-title'}>Income</span>
            <div className={'box-inner'}>
                {breakDown.income.map(one => {
                    return (<p className={'line'}>
                        <span className={'name'}>{one.name}: </span>
                        <span className={'value'}>+{formatValue(one.value, 3)}</span>
                    </p> )
                })}
            </div>
        </div>) : null}
        {breakDown.multiplier.length ? (<div className={'box'}>
            <span className={'sub-title'}>Multiplier</span>
            <div className={'box-inner'}>
                {breakDown.multiplier.map(one => {
                    return (<p className={'line'}>
                        <span className={'name'}>{one.name}: </span>
                        <span className={'value'}>X{formatValue(one.value, 3)}</span>
                    </p> )
                })}
            </div>
        </div>) : null}
        {breakDown.consumption.length ? (<div className={'box'}>
            <span className={'sub-title'}>Consumption</span>
            <div className={'box-inner'}>
                {breakDown.consumption.map(one => {
                    return (<p className={'line'}>
                        <span className={'name'}>{one.name}: </span>
                        <span className={'value'}>-{formatValue(one.value, 3)}</span>
                    </p> )
                })}
            </div>
        </div>) : null}
    </div> )

}