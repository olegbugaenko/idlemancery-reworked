import React, {useCallback, useContext, useEffect, useState} from "react";
import WorkerContext from "../../context/worker-context";
import {useWorkerClient} from "../../general/client";
import PerfectScrollbar from "react-perfect-scrollbar";
import {EffectsSection} from "../shared/effects-section.jsx";
import {formatInt, formatValue, secondsToString} from "../../general/utils/strings";
import {ResourceCost} from "../shared/resource-cost.jsx";
import {ResourceComparison} from "../shared/resource-comparison.jsx";
import {useAppContext} from "../../context/ui-context";
import {TippyWrapper} from "../shared/tippy-wrapper.jsx";
import {HowToSign} from "../shared/how-to-sign.jsx";
import {ProgressBar} from "../layout/progress-bar.jsx";
import {CustomButton} from "../shared/buttons/custom-button.jsx";

export const EventHallWrap = ({ children }) => {

    const worker = useContext(WorkerContext);

    const { isMobile } = useAppContext();
    const [isDetailVisible, setDetailVisible] = useState(!isMobile);

    const { onMessage, sendData } = useWorkerClient(worker);

    const [detailOpened, setDetailOpened] = useState(null);

    const [events, setEvents] = useState([]);

    useEffect(() => {
        const interval = setInterval(() => {
            sendData('query-social-events', {});
        }, 100);
        return () => {
            clearInterval(interval);
        }
    }, [])

    onMessage('social-events-data', (data) => {
        setEvents(data.events || []);
    })

    const setItemDetails = (id) => {
        if(!id) {
            setDetailOpened(null);
        } else {
            setDetailOpened(id);
        }
    }

    const startEvent = useCallback((eventId) => {
        sendData('start-event', { eventId });
    })

    const setAutoEvent = useCallback((eventId, enabled) => {
        sendData('set-auto-event', { eventId, enabled });
    })

    return (<div className={'items-wrap'}>
        <div className={'items ingame-box'}>
            <div className={'menu-wrap'}>
                {children}
                {isMobile ? (<div>
                    <span className={'highlighted-span'} onClick={() => setDetailVisible(true)}>Info</span>
                </div>) : null}
            </div>
            <EventHall filterId={'events'} setItemDetails={setItemDetails} events={events} isMobile={isMobile} startEvent={startEvent} setAutoEvent={setAutoEvent}/>
        </div>

        {(!isMobile || isDetailVisible || detailOpened) ? (<div className={'item-detail ingame-box detail-blade'}>
            {detailOpened ? (
                <EventDetails eventId={detailOpened} setItemDetails={setItemDetails}/>) : (
                <GeneralStats setDetailVisible={setDetailVisible}/>)}
        </div>) : null}
    </div>)

}

export const EventHall = ({filterId, setItemDetails, events, isMobile, startEvent, setAutoEvent}) => {

    return (
        <PerfectScrollbar>
            <div className={'items-list flex-container'}>
                {events.map(event => (
                    <EventCard 
                        key={event.id}
                        event={event}
                        setItemDetails={setItemDetails}
                        startEvent={startEvent}
                        setAutoEvent={setAutoEvent}
                        isMobile={isMobile}
                    />
                ))}
            </div>
        </PerfectScrollbar>
    )
}

export const EventCard = ({event, setItemDetails, startEvent, setAutoEvent, isMobile}) => {

    const handleStart = () => {
        if (event.canStart && event.hasEnoughResources) {
            startEvent(event.id);
        }
    }

    const handleAutomate = (e) => {
        e.stopPropagation();
        setAutoEvent(event.id, !event.isAutoEnabled);
    }

    return (
        <div 
            className={`item-card card social-event ${event.category || 'other'} ${event.isActive ? 'active' : ''} ${!event.hasEnoughResources ? 'unavailable' : ''} ${event.isOnCooldown ? 'locked' : ''}`}
            onMouseEnter={() => !isMobile ? setItemDetails(event.id) : null}
            onMouseLeave={() => !isMobile ? setItemDetails(null) : null}
        >
            <div className={'head'}>
                <p className="title">{event.name}</p>
                <span className={'level'}>{formatInt(event.timesCompleted)}</span>
            </div>

            {event.isActive && (
                <div className={'progress-section'}>
                    <ProgressBar className={'event-progress'} percentage={event.progress} />
                    <span className={'progress-text'}>
                        {secondsToString(event.timeRemaining / 1000)} remaining
                    </span>
                </div>
            )}

            {event.isOnCooldown && (
                <div className={'progress-section'}>
                    <ProgressBar className={'cooldown-progress'} percentage={1 - (event.cooldownRemaining / (event.cooldown || 30 * 60 * 1000))} />
                    <span className={'progress-text'}>
                        Cooldown: {secondsToString(event.cooldownRemaining / 1000)}
                    </span>
                </div>
            )}

            {!event.canStart && !event.isOnCooldown && !event.isActive && (<div className="progress-section">
                <span className={'text hint left-offset'}>
                        Event Hall is Busy
                    </span>
            </div>)}


            <div className={'item-actions padded-left buttons'}>
                <CustomButton
                    className={'icon-content interface-icon small clickable-icon'}
                    disabled={!event.canStart || !event.hasEnoughResources}
                    onClick={handleStart}
                    iconId={'run'}
                >
                    {event.isActive ? 'Running' : event.isOnCooldown ? 'Preparing...' : 'Start Event'}
                </CustomButton>
                
                <label className={'automate-checkbox'}>
                    <input 
                        type="checkbox" 
                        checked={event.isAutoEnabled}
                        onChange={handleAutomate}
                    />
                    <span>Automate</span>
                </label>
            </div>
        </div>
    )
}

export const GeneralStats = ({ setDetailVisible }) => {

    const worker = useContext(WorkerContext);

    const { isMobile } = useAppContext();

    const { onMessage, sendData } = useWorkerClient(worker);

    const [stats, setStats] = useState([]);

    useEffect(() => {
        const interval = setInterval(() => {
            sendData('query-social-events-stats', {});
        }, 100);
        return () => {
            clearInterval(interval);
        }
    }, [])

    onMessage('social-events-stats', (data) => {
        setStats(data.events || []);
    })

    return (
        <PerfectScrollbar>
            <div className={'blade-inner'}>
                <div className={'block'}>
                    <h5>Active Events</h5>
                    {stats.filter(event => event.isActive).map(event => (
                        <div key={event.id} className={'active-event-stat'}>
                            <span>{event.name}</span>
                            <span>{secondsToString(event.timeRemaining / 1000)} remaining</span>
                        </div>
                    ))}
                    {stats.filter(event => event.isActive).length === 0 && (
                        <p>No active events</p>
                    )}
                </div>

                <div className={'block'}>
                    <h5>Total Events Completed</h5>
                    <p>{stats.reduce((total, event) => total + event.timesCompleted, 0)}</p>
                </div>

                {isMobile ? (<div className={'block buttons flex-container'}>
                    <button onClick={() => setDetailVisible(false)}>Close</button>
                </div>) : null}
            </div>
        </PerfectScrollbar>
    )
}

export const EventDetails = ({eventId, setItemDetails}) => {

    const worker = useContext(WorkerContext);

    const { onMessage, sendData } = useWorkerClient(worker);

    const { isMobile } = useAppContext();

    const [event, setEvent] = useState(null);

    useEffect(() => {
        const interval = setInterval(() => {
            sendData('query-event-details', { eventId });
        }, 100);

        return () => {
            clearInterval(interval);
        }
    }, [eventId])

    onMessage('event-details', (data) => {
        setEvent(data);
    })

    if(!eventId || !event) return null;

    return (
        <PerfectScrollbar>
            <div className={'blade-inner'}>
                <div className={'block'}>
                    <h4>{event.name}</h4>
                    <div className={'description'}>
                        {event.description}
                    </div>
                </div>
                
                {event.affordable ? (<div className={'block'}>
                    <p>Cost:</p>
                    <div className={'costs-wrap'}>
                        {Object.values(event.affordable.affordabilities || {}).map(aff => <ResourceCost
                            key={aff.id} affordabilities={aff}/>)}
                    </div>
                </div>) : null}

                <div className={'block'}>
                    <p>Event Effects (Active):</p>
                    <div className={'effects'}>
                        {event.currentEffects && event.potentialEffects ? (
                            <ResourceComparison effects1={event.currentEffects} effects2={event.potentialEffects}/>
                        ) : (
                            <EffectsSection effects={event.potentialEffects} maxDisplay={10}/>
                        )}
                    </div>
                </div>

                <div className={'block'}>
                    <p>Permanent Bonus Effects:</p>
                    <div className={'effects'}>
                        {event.permanentBonusEffects && event.permanentBonusPotentialEffects ? (
                            <ResourceComparison effects1={event.permanentBonusEffects} effects2={event.permanentBonusPotentialEffects}/>
                        ) : (
                            <EffectsSection effects={event.permanentBonusEffects} maxDisplay={10}/>
                        )}
                    </div>
                </div>

                <div className={'block'}>
                    <p>Event Info:</p>
                    <div className={'event-info'}>
                        <p>Duration: {secondsToString(event.duration / 1000)}</p>
                        <p>Cooldown: {secondsToString(event.cooldown / 1000)}</p>
                        <p>Times Completed: {event.timesCompleted}</p>
                        <p>Permanent Bonus Level: {event.permanentBonusLevel}</p>
                    </div>
                </div>

                <div className={'block'}>
                    <p>Cost:</p>
                    <div className={'costs-wrap'}>
                        {Object.values(event.affordable.affordabilities || {}).map(aff => <ResourceCost
                            key={aff.id ?? aff.name} affordabilities={aff}/>)}
                    </div>
                </div>

                {isMobile ? (<div className={'block buttons flex-container'}>
                    <button onClick={() => setItemDetails(null)}>Close</button>
                </div>) : null}
            </div>
        </PerfectScrollbar>
    )
} 