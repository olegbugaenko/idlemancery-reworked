import React, {useEffect, useState, useContext, useCallback} from "react";
import WorkerContext from "../../context/worker-context";
import {useWorkerClient} from "../../general/client";
import {formatInt, formatValue, secondsToString} from "../../general/utils/strings";
import {TippyWrapper} from "../shared/tippy-wrapper.jsx";
import {ActiveEffects} from "../shared/active-effects.jsx";
import {RandomEventSnippet} from "../shared/random-events.jsx";
import {useTutorial} from "../../context/tutorial-context";
import {RawResource} from "../shared/raw-resource.jsx";
import {PersonageCircle} from "./personage-circle.jsx";
import {BankedTimeWrap} from "./banked-time-wrap.jsx";
import {useAppContext} from "../../context/ui-context";

export const Sidebar = () => {

    const [activePanel, setActivePanel] = useState('resources');
    const { unlockNextById } = useTutorial();
    const { isMobile } = useAppContext();
    const [isHidden, setHidden] = useState(false);

    return (<div className={'sidebar'}>
        {isMobile ? (<div className={'show-hide-toggle'}><p className={'highlighted-span'} onClick={() => setHidden(!isHidden)}>{isHidden ? 'Show Resources Panel' : 'Hide Resources Panel'}</p></div> ) : null}
        {!isMobile || !isHidden ? (<div className={'hideable-content'}>
            <div className={'upper'}>
                <div className={'personage-data'}>
                    <PersonageCircle/>
                    <BankedTimeWrap/>
                </div>
                <ul className={'menu toogleables bigger'}>
                    <li id={'tutorial-res-tab'} className={`${activePanel === 'resources' ? 'active' : ''}`}
                        onClick={() => {
                            unlockNextById(3);
                            setActivePanel('resources')
                        }}>
                        <span>Resources</span>
                    </li>
                    <li id={'tutorial-attr-tab'} className={`${activePanel === 'attributes' ? 'active' : ''}`}
                        onClick={() => {
                            unlockNextById(1);
                            setActivePanel('attributes')
                        }}>
                        <span>Attributes</span>
                    </li>
                </ul>
                <div className={'main-bar'}>
                    {activePanel === 'resources' ? <ResourcesBar/> : <AttributesBar/>}
                </div>
            </div>
            <div className={'lower'}>
                <RandomEventSnippet/>
                <div className={'effects-list'}>
                    <ActiveEffects/>
                </div>
            </div>
        </div>) : null}


    </div> )

}

export const ResourcesBar = () => {
    const worker = useContext(WorkerContext);

    const { onMessage, sendData } = useWorkerClient(worker);

    const [resourceData, setResourceData] = useState([]);

    useEffect(() => {
        const interval = setInterval(() => {
            sendData('query-resources-data', { includePinned: true });
        }, 100);
        return () => {
            clearInterval(interval);
        }
    }, [])

    onMessage('resources-data', (resources) => {
        setResourceData(resources);
    })

    const setMonitoredAttribute = useCallback((id) => {
        sendData('set-monitored', { scope: 'actions', type: 'resource', id });
    }, []);

    return (<div className={'resources'} id={'tutorial-resources'}>
        {resourceData.map(res => {

            const aff = res.affData;

            let affClassData = ''
            if(aff) {
                affClassData = ` monitored ${aff.isAffordable ? 'affordable' : (aff.hardLocked ? 'locked' : 'unavailable')}`
            }

            const isAffected = res.monitor?.direction;
            let addClass = '';
            if(isAffected) {
                addClass = isAffected < 0 ? ' negative' : ' positive';
            }

            return (<div key={res.id} className={`holder ${aff ? 'monitored' : ''} ${addClass}`} onMouseOver={() => setMonitoredAttribute(res.id)} onMouseOut={() => setMonitoredAttribute(null)}><p className={`resource-item ${affClassData}`}>
                <div className={'resource-label'}>
                    <RawResource name={res.name} id={res.id} />
                </div>
                <TippyWrapper content={<div className={'hint-popup'}><BreakDown category={'cap'} breakDown={res.storageBreakdown}/>{res.eta >= 0 ? `${secondsToString(res.eta)} to full` : `${secondsToString(-res.eta)} to empty`}</div> }>
                    <span className={`resource-amount ${res.hasCap && res.isCapped ? 'capped' : ''}`}>{formatValue(res.amount || 0)}{res.hasCap ? ` / ${formatValue(res.cap || 0)}` : ''}</span>
                </TippyWrapper>
                <TippyWrapper content={<div className={'hint-popup'}><BreakDown breakDown={res.breakDown}/></div> }>
                    <span className={`resource-balance ${res.isNegative ? 'red' : ''} ${res.isPositive ? 'green' : ''}`}>{formatValue(res.balance || 0)}</span>
                </TippyWrapper>
                {res.capProgress ? (<div className={'next-unlock-holder resource'}>
                    <div className={'next-unlock-bar'} style={{ width: `${res.capProgress*100}%`}}></div>
                </div>) : null}
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
        }, 200);
        return () => {
            clearInterval(interval);
        }
    }, [])

    onMessage('attributes-data', (attributes) => {
        setAttributesData(attributes);
    })

    const setMonitoredAttribute = useCallback((id) => {
        sendData('set-monitored', { scope: 'actions', type: 'attribute', id });
    }, []);

    return (<div className={'attributes-panel'} id={'tutorial-attributes'}>
        {attributesData.list.map(res => {

            const aff = res.affData;

            let affClassData = ''
            if(aff) {
                affClassData = ` monitored ${aff.isAffordable ? 'affordable' : (aff.hardLocked ? 'locked' : 'unavailable')}`
            }

            const isAffected = res.monitor?.direction;

            let addClass = '';
            if(isAffected) {
                addClass = isAffected < 0 ? ' negative' : ' positive';
            }


            return (<div key={res.id} className={`holder ${aff ? 'monitored' : ''} ${addClass}`} onMouseOver={() => setMonitoredAttribute(res.id)} onMouseOut={() => setMonitoredAttribute(null)}><p className={`resource-item ${affClassData}`}>
                <TippyWrapper content={<div className={'hint-popup'}>
                    <div className={'block'}>
                        <h4>{res.name}: {formatValue(res.value, 3)}</h4>
                    </div>
                    <div className={'block'}>
                        {res.description}
                    </div>

                    {res.nextUnlock ? (<div className={'unlock block'}>
                        <p className={'hint'}>Next unlock at level {formatInt(res.nextUnlock.level)}</p>
                    </div> ) : null}
                </div> }>
                    <span className={'resource-label'}>{res.name}</span>
                </TippyWrapper>
                <TippyWrapper content={<div className={'hint-popup'}><BreakDown breakDown={res.breakDown}/></div> }>
                    <span className={'resource-balance'}>{formatInt(Math.floor(res.value || 0), 2)}</span>
                </TippyWrapper>
                {res.nextProgress ? (<div className={'next-unlock-holder'}>
                    <div className={'next-unlock-bar'} style={{ width: `${res.nextProgress*100}%`}}></div>
                </div>) : null}
                {aff ? (<div className={'appendix'}>
                    {aff.isAffordable ? (<span>{formatValue(aff.requirement)}</span>) : (<span>{formatValue(aff.actual - aff.requirement)}({secondsToString(aff.eta)})</span>)}
                </div> ) : null}
            </p></div>)
        })}
    </div> )
}

export const BreakDown = ({ breakDown, category, collapseByLabel = true }) => {

    if(!breakDown) return null;

    return (<div className={'breakdown'}>
        {breakDown.income?.length ? (<div className={'box'}>
            <span className={'sub-title'}>{category === 'cap' ? 'Basic Storage' : 'Income'}</span>
            <div className={'box-inner'}>
                {breakDown.income.filter(one => Math.abs(one.value) > 1.e-8).map(one => {
                    return (<p key={one.id} className={'line'}>
                        <span className={'name'}>{one.label}: </span>
                        <span className={'value'}>+{formatValue(one.value, 3)}</span>
                    </p> )
                })}
            </div>
        </div>) : null}
        {breakDown.multiplier?.length ? (<div className={'box'}>
            <span className={'sub-title'}>Multiplier</span>
            <div className={'box-inner'}>
                {breakDown.multiplier.filter(one => Math.abs(one.value - 1) > 1.e-8).map(one => {
                    return (<p key={one.id} className={'line'}>
                        <span className={'name'}>{one.label}: </span>
                        <span className={'value'}>X{formatValue(one.value, 3)}</span>
                    </p> )
                })}
            </div>
        </div>) : null}
        {breakDown.consumption?.length ? (<div className={'box'}>
            <span className={'sub-title'}>Consumption</span>
            <div className={'box-inner'}>
                {breakDown.consumption.filter(one => Math.abs(one.value) > 1.e-8).map(one => {
                    return (<p key={one.id} className={'line'}>
                        <span className={'name'}>{one.label}: </span>
                        <span className={'value'}>-{formatValue(one.value, 3)}</span>
                    </p> )
                })}
            </div>
        </div>) : null}
    </div> )

}