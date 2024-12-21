import React, {useContext, useEffect, useState} from "react";
import WorkerContext from "../../context/worker-context";
import {useWorkerClient} from "../../general/client";
import {useAppContext} from "../../context/ui-context";
import {NewNotificationWrap} from "../layout/new-notification-wrap.jsx";
import {ResourceCost} from "./resource-cost.jsx";

export const RandomEventSnippet = () => {

    const worker = useContext(WorkerContext);

    const { onMessage, sendData } = useWorkerClient(worker);

    const [eventData, setEventData] = useState({});

    const { setActivePopup } = useAppContext();

    onMessage('random-events-data', (event) => {
        setEventData(event);
    })

    const openEvent = () => {
        setActivePopup('event')
    }

    return (<div className={'event-holder'}>
        {eventData?.currentEvent?.name ? <NewNotificationWrap className={'event-wrap narrow-wrapper'} isNew={!eventData?.currentEvent?.selectedOption}>
            <button className={eventData?.currentEvent?.selectedOption ? 'used' : 'new'} onClick={openEvent}>{eventData?.currentEvent.name}</button>
        </NewNotificationWrap> : null }
    </div> )

}

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

    const selectOption = (optionId) => {
        console.log('setting option', optionId);
        sendData('select-event-option', optionId);
    }

    if(!eventData.currentEvent) {
        return (<div className={'expired'}>
            <p>The event have expired. But don't worry, they repeat sometimes</p>
        </div> )
    }

    return (<div className={'evt'}>
        <div className={'event-content'}>
            <h4>{eventData.currentEvent.name}</h4>
            <p>{eventData.currentEvent.description}</p>
            {eventData.currentEvent.selectedOption ? (
                <div className={'event-option-selected'}>
                    <h5>{eventData.currentEvent.selectedOption.name}</h5>
                    <div className={'event-effect'}>
                        <p>{eventData.currentEvent.triggeredEffect.description}</p>
                    </div>
                </div>
            ) : null}
        </div>
        {!eventData.currentEvent.selectedOption ? (<div className={'choices'}>
            {eventData.currentEvent.options.map(option => (<div className={'option-wrap'}>
                <button className={`option-button ${option.affordable.isAffordable ? 'affordable' : 'unavailable'}`} onClick={() => selectOption(option.id)}>{option.name}</button>
                {option.affordable?.affordabilities ? (<div className={'consumptions'}>
                    {Object.values(option.affordable.affordabilities).map(affordabilities => (<ResourceCost affordabilities={affordabilities} />))}
                </div> ) : null}
            </div> ))}
        </div> ) : null}
    </div>)

}