import React, {useEffect, useState, useContext, useCallback} from "react";
import WorkerContext from "../../context/worker-context";
import {useWorkerClient} from "../../general/client";
import {formatInt, formatValue, secondsToString} from "../../general/utils/strings";
import {isBreakdownHasData} from "../../general/utils/resource-utils";
import {TippyWrapper} from "../shared/tippy-wrapper.jsx";
import {ActiveEffects} from "../shared/active-effects.jsx";
import {RandomEventSnippet} from "../shared/random-events.jsx";
import {useTutorial} from "../../context/tutorial-context";
import {RawResource} from "../shared/raw-resource.jsx";
import {PersonageCircle} from "./personage-circle.jsx";
import {BankedTimeWrap} from "./banked-time-wrap.jsx";
import {useAppContext} from "../../context/ui-context";
import {ActiveActions} from "../shared/active-actions.jsx";
import {ActiveAchievement} from "../shared/achievements.jsx";

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
                <ActiveActions />
                {/*<RandomEventSnippet/>*/}
                <ActiveAchievement />
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
        }, 200);
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

    const consumeResource = useCallback((id, amount = 1) => {
        sendData('consume-inventory', { id, amount, sendDetails: true });
    }, [sendData]);

    const handleResourceContextMenu = useCallback((e, resource) => {
        e.preventDefault();
        if (!resource.isConsumable) return;
        
        let amount = 1;
        if(resource.allowMultiConsume) {
            if (e.shiftKey) amount = resource.amount;
            if (e.ctrlKey && resource.amount >= 1) amount = Math.max(0.1 * resource.amount, 1);
        }
        consumeResource(resource.id, amount);
    }, [consumeResource]);

    return (<div className={'resources'} id={'tutorial-resources'}>
        {resourceData.map(res => {

            const aff = res.monitor;

            let affClassData = ''
            if(aff) {
                affClassData = ` monitored ${aff?.bShow ? 'show-potential' : ''} ${aff.isAffordable ? 'affordable' : (aff.hardLocked ? 'locked' : 'unavailable')}`
            }

            const isAffected = aff?.direction;
            const newBalance = aff?.newBalance;
            const newStorage = aff?.newStorage;

            let addClass = '';
            if(isAffected) {
                addClass = isAffected < 0 ? ' negative' : ' positive';
            }

            if(res.targetEfficiency < 1) {
                addClass += ' missing-blocker';
            }
            let directionClass = '';
            let displayValue = '';
            if(aff) {
                let displayType = 'balance';
                if(newStorage && (!newBalance || newBalance === res.balance)) {
                    displayType = 'store';
                }

                if(displayType === 'store') {
                    displayValue = `↑${formatValue(aff.newStorage)}`;
                    directionClass = aff.newStorage > res.cap ? 'plus' : (aff.newStorage < res.cap ? 'minus' : 'neutral');
                } else {
                    displayValue = `${formatValue(aff.newBalance)}`;
                    directionClass = aff.newBalance > res.balance ? 'plus' : (aff.newBalance < res.balance ? 'minus' : 'neutral');
                }
            }


            return (<div key={res.id} className={`holder ${aff ? 'monitored' : ''} ${aff?.bShow ? 'show-potential' : ''} ${addClass}`} onMouseEnter={() => setMonitoredAttribute(res.id)} onMouseLeave={() => setMonitoredAttribute(null)}>
                {res.isConsumable ? (
                    <TippyWrapper content={
                        <div className={'hint-popup'}>
                            <p>Right click to consume</p>
                            {res.amount > 10 && res.allowMultiConsume && (
                                <p>Right click + CTRL to consume {formatInt(0.1 * res.amount)}</p>
                            )}
                            {res.allowMultiConsume ? (<p>Right click + SHIFT to consume all</p>) : null}
                        </div>
                    }>
                        <div 
                            className={`resource-item ${affClassData}`}
                            onContextMenu={(e) => handleResourceContextMenu(e, res)}
                        >
                            <div className={'resource-label'}>
                                <RawResource name={res.name} id={res.id} />
                            </div>
                            {res.hasCap ? (
                                <TippyWrapper content={<div className={'hint-popup'}><BreakDown category={'cap'} breakDown={res.storageBreakdown}/>{res.eta >= 0 ? `${secondsToString(res.eta)} to full` : `${secondsToString(-res.eta)} to empty`}</div> }>
                                    <span className={`resource-amount ${res.hasCap && res.isCapped ? 'capped' : ''}`}>{formatValue(res.amount || 0)}{res.hasCap || res.isService ? ` / ${formatValue(res.isService ? (res.total || 0) : (res.cap || 0))}` : ''}</span>
                                </TippyWrapper>
                            ) : (
                                <span className={`resource-amount ${res.hasCap && res.isCapped ? 'capped' : ''}`}>{formatValue(res.amount || 0)}{res.hasCap || res.isService ? ` / ${formatValue(res.isService ? (res.total || 0) : (res.cap || 0))}` : ''}</span>
                            )}
                            {isBreakdownHasData(res.breakDown) ? (
                                <TippyWrapper content={<div className={'hint-popup'}><BreakDown breakDown={res.breakDown}/></div> }>
                                    <span className={`resource-balance ${res.isNegative ? 'red' : ''} ${res.isPositive ? 'green' : ''}`}>{formatValue(res.balance || 0)}</span>
                                </TippyWrapper>
                            ) : (
                                <span className={`resource-balance ${res.isNegative ? 'red' : ''} ${res.isPositive ? 'green' : ''}`}>{formatValue(res.balance || 0)}</span>
                            )}
                            {aff && aff?.bShow ? (<div className={`appendix ${directionClass}`}>
                                <span>{displayValue}</span>
                            </div> ) : null}
                        </div>
                    </TippyWrapper>
                ) : (
                    <div 
                        className={`resource-item ${affClassData}`}
                        onContextMenu={(e) => handleResourceContextMenu(e, res)}
                    >
                        <div className={'resource-label'}>
                            <RawResource name={res.name} id={res.id} />
                        </div>
                        {res.hasCap ? (
                            <TippyWrapper content={<div className={'hint-popup'}><BreakDown category={'cap'} breakDown={res.storageBreakdown}/>{res.eta >= 0 ? `${secondsToString(res.eta)} to full` : `${secondsToString(-res.eta)} to empty`}</div> }>
                                <span className={`resource-amount ${res.hasCap && res.isCapped ? 'capped' : ''}`}>{formatValue(res.amount || 0)}{res.hasCap || res.isService ? ` / ${formatValue(res.isService ? (res.total || 0) : (res.cap || 0))}` : ''}</span>
                            </TippyWrapper>
                        ) : (
                            <span className={`resource-amount ${res.hasCap && res.isCapped ? 'capped' : ''}`}>{formatValue(res.amount || 0)}{res.hasCap || res.isService ? ` / ${formatValue(res.isService ? (res.total || 0) : (res.cap || 0))}` : ''}</span>
                        )}
                        {isBreakdownHasData(res.breakDown) ? (
                            <TippyWrapper content={<div className={'hint-popup'}><BreakDown breakDown={res.breakDown}/></div> }>
                                <span className={`resource-balance ${res.isNegative ? 'red' : ''} ${res.isPositive ? 'green' : ''}`}>{formatValue(res.balance || 0)}</span>
                            </TippyWrapper>
                        ) : (
                            <span className={`resource-balance ${res.isNegative ? 'red' : ''} ${res.isPositive ? 'green' : ''}`}>{formatValue(res.balance || 0)}</span>
                        )}
                        {aff && aff?.bShow ? (<div className={`appendix ${directionClass}`}>
                            <span>{displayValue}</span>
                        </div> ) : null}
                    </div>
                )}
                {res.capProgress ? (<div className={'next-unlock-holder resource'}>
                    <div className={'next-unlock-bar'} style={{ width: `${res.capProgress*100}%`}}></div>
                </div>) : null}
            </div>)
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

    const setMonitoredAttribute = useCallback((id, target) => {
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


            return (<div key={res.id} className={`holder ${aff ? 'monitored' : ''} ${addClass}`}
                         onMouseEnter={(e) => {
                            setMonitoredAttribute(res.id, e.target)
                        }}
                         /*onMouseOut={() => setMonitoredAttribute(null)}*/
                         onMouseLeave={(e) => setMonitoredAttribute(null, e.target)}
            ><div className={`resource-item ${affClassData}`}>
                <TippyWrapper content={<div className={'hint-popup'}>
                    <div className={'block'}>
                        <h4>{res.name}: {formatValue(res.value, 3)}</h4>
                    </div>
                    <div className={'block'}>
                        {res.description}
                    </div>

                    {res.nextUnlocks?.length ? (<div className={'unlock block'}>
                        <p className={'hint'}>Next unlock at level {formatInt(res.nextUnlocks[0].level)}</p>
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
            </div></div>)
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