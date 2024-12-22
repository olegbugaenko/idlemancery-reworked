import React, {useContext, useEffect, useRef, useState} from "react";
import WorkerContext from "../../context/worker-context";
import {useWorkerClient} from "../../general/client";
import {useAppContext} from "../../context/ui-context";
import {NewNotificationWrap} from "../layout/new-notification-wrap.jsx";
import {ResourceCost} from "./resource-cost.jsx";
import {formatInt, secondsToString} from "../../general/utils/strings";
import {TippyWrapper} from "./tippy-wrapper.jsx";

export const RandomEventSnippet = () => {
    const worker = useContext(WorkerContext);
    const { onMessage, sendData } = useWorkerClient(worker);
    const { setActivePopup } = useAppContext();

    const [eventData, setEventData] = useState({});
    const [showMore, setShowMore] = useState(false);
    const popupRef = useRef(null); // Reference for the popup

    // Listen for random events data
    onMessage('random-events-data', (event) => {
        setEventData(event);
    });

    const openEvent = (eventId) => {
        setActivePopup('event');
        sendData('set-event-data-opened', { eventId, isOpened: true });
    };

    const buttonData = eventData?.openedEventData ?? eventData.list?.[0];

    useEffect(() => {
        const interval = setInterval(() => {
            sendData('query-event-data', {})
        }, 1000);

        return () => {
            clearInterval(interval);
        }

    }, [])

    // Close popup if clicking outside of it
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popupRef.current && !popupRef.current.contains(event.target)) {
                setShowMore(false); // Hide the popup
            }
        };

        if (showMore) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showMore]);

    return (
        <div className="event-holder">
            {buttonData ? (
                <NewNotificationWrap className="event-wrap narrow-wrapper" isNew={!buttonData.selectedOption}>
                    <button
                        className={buttonData.selectedOption ? 'used' : 'new'}
                        onClick={() => openEvent(buttonData.id)}
                    >
                        {buttonData.name}
                    </button>
                </NewNotificationWrap>
            ) : null}
            {eventData?.list?.length > 1 ? (
                <div className="others">
                    <p className="showMore" onClick={() => setShowMore(true)}>
                        Show all {eventData?.list?.length} events
                    </p>
                    <div
                        ref={popupRef} // Attach the reference to the popup
                        className={`events-popup ${!showMore ? 'hidden' : 'visible'}`}
                    >
                        {eventData.list.map((one) => (
                            <div className="event" key={one.id}>
                                <p
                                    className={`event-name ${one.selectedOption != null ? 'used' : 'new'}`}
                                    onClick={() => openEvent(one.id)}
                                >
                                    {one.name}
                                </p>
                                <p className={'event-time'}>
                                    {secondsToString(one.expiresIn)}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export const RandomEventPopup = () => {

    const worker = useContext(WorkerContext);

    const { onMessage, sendData } = useWorkerClient(worker);

    const [eventData, setEventData] = useState({});

    useEffect(() => {
        const interval = setInterval(() => {
            sendData('query-event-data', { prefix: 'popup'})
        }, 100);
        return () => {
            clearInterval(interval);
        }
    }, [])

    onMessage('random-events-data-popup', (data) => {
        // console.log('Received data', data);
        setEventData(data);
    })

    const selectOption = (eventId, optionId) => {
        console.log('setting option', optionId);
        sendData('select-event-option', {eventId, optionId});
    }

    if(!eventData.openedEventData) {
        return (<div className={'expired'}>
            <p>The event have expired. But don't worry, they repeat sometimes</p>
        </div> )
    }

    return (<div className={'evt'}>
        <div className={'event-content'}>
            <h4>{eventData.openedEventData.name}</h4>
            <p>{eventData.openedEventData.description}</p>
            {eventData.openedEventData.selectedOption ? (
                <div className={'event-option-selected'}>
                    <h5>{eventData.openedEventData.selectedOption.name}</h5>
                    <div className={'event-effect'}>
                        <p>{eventData.openedEventData.selectedOption.triggeredEffect?.description}</p>
                    </div>
                </div>
            ) : null}
        </div>
        {!eventData.openedEventData.selectedOption ? (<div className={'choices'}>
            {eventData.openedEventData.options.map(option => (<div className={'option-wrap'}>
                <TippyWrapper content={option.revealedEffects && option.revealedEffects.length ? (<div className={'hint-popup'}>
                    {option.revealedEffects.map(eff => (<p>{formatInt(100*eff.probability)}% - {eff.description}</p>))}
                </div> ) : (<div className={'hint-popup'}>
                    <p>Some choices can provide different outcomes. Try it to reveal potential bonuses and risks</p>
                </div>)}>
                    <button className={`option-button ${option.affordable.isAffordable ? 'affordable' : 'unavailable'}`} onClick={() => selectOption(eventData.openedEventData.id, option.id)}>{option.name}</button>
                </TippyWrapper>
                {option.affordable?.affordabilities ? (<div className={'consumptions'}>
                    {Object.values(option.affordable.affordabilities).map(affordabilities => (<ResourceCost affordabilities={affordabilities} />))}
                </div> ) : null}
            </div> ))}
        </div> ) : null}
    </div>)

}