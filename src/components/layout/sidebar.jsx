import React, {useEffect, useState, useContext, useCallback, useRef} from "react";
import isEqual from "lodash/isEqual";
import WorkerContext from "../../context/worker-context";
import {useWorkerClient} from "../../general/client";
import {formatInt, formatValue, secondsToString} from "../../general/utils/strings";
import {isBreakdownHasConsumption, isBreakdownHasData} from "../../general/utils/resource-utils";
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
import {updateSidebarState, useSidebarData} from "../../state/sidebar-store";

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

    const { onMessage, sendData, removeMessage } = useWorkerClient(worker);

    const resourceData = useSidebarData(state => state.resources);

    const sendDataRef = useRef(sendData);

    useEffect(() => {
        sendDataRef.current = sendData;
    }, [sendData]);

    useEffect(() => {
        if (!worker) {
            return undefined;
        }

        const handleResources = (resources) => {
            updateSidebarState({ resources });
        };

        onMessage('resources-data', handleResources);
        sendData('query-resources-data', { includePinned: true });
        const interval = setInterval(() => {
            sendData('query-resources-data', { includePinned: true });
        }, 200);

        return () => {
            clearInterval(interval);
            removeMessage('resources-data');
        };
    }, [worker, onMessage, sendData, removeMessage]);

    const setMonitoredAttribute = useCallback((id) => {
        const fn = sendDataRef.current;
        if(!fn) { return; }

        fn('set-monitored', { scope: 'actions', type: 'resource', id });
    }, []);

    const handleMouseEnter = useCallback((resource) => {
        setMonitoredAttribute(resource?.id ?? null);
    }, [setMonitoredAttribute]);

    const handleMouseLeave = useCallback(() => {
        setMonitoredAttribute(null);
    }, [setMonitoredAttribute]);

    const consumeResource = useCallback((id, amount = 1) => {
        const fn = sendDataRef.current;
        if(!fn) { return; }

        fn('consume-inventory', { id, amount, sendDetails: true });
    }, []);

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
        {resourceData.map(res => (
            <ResourceRow
                key={res.id}
                resource={res}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onContextMenu={handleResourceContextMenu}
            />
        ))}
    </div> )
}

const ResourceRowComponent = ({ resource, onMouseEnter, onMouseLeave, onContextMenu, showCapProgress = true, onToggleHidden }) => {

    const aff = resource.monitor;

    let affClassData = '';
    if(aff) {
        affClassData = ` monitored ${aff?.bShow ? 'show-potential' : ''} ${aff.isAffordable ? 'affordable' : (aff.hardLocked ? 'locked' : 'unavailable')}`;
    }

    const isAffected = aff?.direction;
    const newBalance = aff?.newBalance;
    const newStorage = aff?.newStorage;

    let addClass = '';
    if(isAffected) {
        addClass = isAffected < 0 ? ' negative' : ' positive';
    }

    if(resource.targetEfficiency < 1) {
        addClass += ' missing-blocker';
    }
    let directionClass = '';
    let displayValue = '';
    if(aff) {
        let displayType = 'balance';
        if(newStorage && (!newBalance || newBalance === resource.balance)) {
            displayType = 'store';
        }

        if(displayType === 'store') {
            displayValue = `↑${formatValue(aff.newStorage)}`;
            directionClass = aff.newStorage > resource.cap ? 'plus' : (aff.newStorage < resource.cap ? 'minus' : 'neutral');
        } else {
            displayValue = `${formatValue(aff.newBalance)}`;
            directionClass = aff.newBalance > resource.balance ? 'plus' : (aff.newBalance < resource.balance ? 'minus' : 'neutral');
        }
    }

    const handleMouseEnter = () => {
        if(onMouseEnter) {
            onMouseEnter(resource);
        }
    };

    const handleMouseLeave = () => {
        if(onMouseLeave) {
            onMouseLeave(resource);
        }
    };

    const handleContextMenu = (event) => {
        if(onContextMenu) {
            onContextMenu(event, resource);
        }
    };

    const resourceAmount = (<span className={`resource-amount ${resource.hasCap && resource.isCapped ? 'capped' : ''}`}>
        {formatValue(resource.amount || 0)}
        {resource.hasCap || resource.isService ? ` / ${formatValue(resource.isService ? (resource.total || 0) : (resource.cap || 0))}` : ''}
    </span>);

    const resourceBalance = (<span className={`resource-balance ${resource.isNegative ? 'red' : ''} ${resource.isPositive ? 'green' : ''}`}>
        {formatValue(resource.balance || 0)}
    </span>);

    const handleToggleHiddenClick = (event) => {
        if(!onToggleHidden) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();
        onToggleHidden(resource);
    };

    return (<div className={`holder ${aff ? 'monitored' : ''} ${aff?.bShow ? 'show-potential' : ''} ${addClass}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
    >
        <div
            className={`resource-item ${affClassData} ${resource.isHidden ? 'is-hidden' : ''}`}
            onContextMenu={onContextMenu ? handleContextMenu : undefined}
        >
            {resource.isConsumable && onContextMenu ? (
                <TippyWrapper content={
                    <div className={'hint-popup'}>
                        <p>Right click to consume</p>
                        {resource.amount > 10 && resource.allowMultiConsume && (
                            <p>Right click + CTRL to consume {formatInt(0.1 * resource.amount)}</p>
                        )}
                        {resource.allowMultiConsume ? (<p>Right click + SHIFT to consume all</p>) : null}
                    </div>
                }>
                    <div className={'resource-label'}>
                        <RawResource name={resource.name} id={resource.id} />
                    </div>
                </TippyWrapper>
            ) : (
                <div className={'resource-label'}>
                    <RawResource name={resource.name} id={resource.id} />
                </div>
            )}
            {resource.hasCap || resource.balance < 0 ? (
                <TippyWrapper content={<div className={'hint-popup'}><BreakDown category={'cap'} breakDown={resource.storageBreakdown}/>{resource.eta >= 0 ? `${secondsToString(resource.eta)} to full` : `${secondsToString(-resource.eta)} to empty`}</div> }>
                    {resourceAmount}
                </TippyWrapper>
            ) : resourceAmount}
            {isBreakdownHasData(resource.breakDown) ? (
                <TippyWrapper content={<div className={'hint-popup'}><BreakDown breakDown={resource.breakDown}/><div className="block">
                        {resource.income > 0 ? (<p>Total Income: {formatValue(resource.income*resource.multiplier)}</p>) : null}
                        {resource.consumption > 0 ? (<p>Total Consumption: {formatValue(resource.consumption)}</p>) : null}
                        <p>Net Income: {formatValue(resource.balance)}</p>
                    </div></div> }>
                    {resourceBalance}
                </TippyWrapper>
            ) : resourceBalance}
            {aff && aff?.bShow ? (<div className={`appendix ${directionClass}`}>
                <span>{displayValue}</span>
            </div> ) : null}
            {onToggleHidden ? (
                <TippyWrapper content={<div className={'hint-popup'}>{resource.isHidden ? 'Show Resource' : 'Hide Resource'}</div> }>
                    <div className={'icon-content interface-icon medium-sm resource-toggle-hidden'} onClick={handleToggleHiddenClick}>
                        {resource.isHidden ? (<img src={"icons/interface/icon_show.png"} alt={'Show resource'}/>) : (<img src={"icons/interface/icon_hide.png"} alt={'Hide resource'}/>)}
                    </div>
                </TippyWrapper>
            ) : null}
        </div>
        {showCapProgress && resource.capProgress ? (<div className={'next-unlock-holder resource'}>
            <div className={'next-unlock-bar'} style={{ width: `${resource.capProgress*100}%`}}></div>
        </div>) : null}
    </div> )
};

export const ResourceRow = React.memo(ResourceRowComponent, (prevProps, nextProps) => {
    if(prevProps.showCapProgress !== nextProps.showCapProgress) {
        return false;
    }

    if(prevProps.onToggleHidden !== nextProps.onToggleHidden) {
        return false;
    }

    if(prevProps.onMouseEnter !== nextProps.onMouseEnter) {
        return false;
    }

    if(prevProps.onMouseLeave !== nextProps.onMouseLeave) {
        return false;
    }

    if(prevProps.onContextMenu !== nextProps.onContextMenu) {
        return false;
    }

    return isEqual(prevProps.resource, nextProps.resource);
});

ResourceRow.displayName = 'ResourceRow';


export const AttributesBar = () => {
    const worker = useContext(WorkerContext);

    const { onMessage, sendData, removeMessage } = useWorkerClient(worker);

    const attributesData = useSidebarData(state => state.attributes);

    useEffect(() => {
        if (!worker) {
            return undefined;
        }

        const handleAttributes = (attributes) => {
            updateSidebarState({ attributes });
        };

        onMessage('attributes-data', handleAttributes);
        sendData('query-attributes-data', {});
        const interval = setInterval(() => {
            sendData('query-attributes-data', {});
        }, 200);

        return () => {
            clearInterval(interval);
            removeMessage('attributes-data');
        };
    }, [worker, onMessage, sendData, removeMessage]);

    const setMonitoredAttribute = useCallback((id, target) => {
        sendData('set-monitored', { scope: 'actions', type: 'attribute', id });
    }, [sendData]);

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
