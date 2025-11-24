import React, {useContext, useEffect, useState} from "react";
import WorkerContext from "../../../context/worker-context";
import {useWorkerClient} from "../../../general/client";
import PerfectScrollbar from "react-perfect-scrollbar";
import {EffectsSection} from "../../shared/effects-section.jsx";
import RulesList from "../../shared/rules-list.jsx";
import {CustomButton} from "../../shared/buttons/custom-button.jsx";
import {NewNotificationWrap} from "../../shared/new-notification-wrap.jsx";

export const RitualsWrap = ({ children }) => {

    const worker = useContext(WorkerContext);
    const { onMessage, sendData } = useWorkerClient(worker);
    const [rituals, setRituals] = useState([]);
    const [selected, setSelected] = useState(null);
    const [details, setDetails] = useState(null);
    const [newUnlocks, setNewUnlocks] = useState({});

    useEffect(() => {
        const interval = setInterval(() => {
            sendData('query-rituals', {});
        }, 500);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        sendData('query-new-unlocks-notifications', { suffix: 'rituals', scope: 'spellbook' });
        const interval = setInterval(() => {
            sendData('query-new-unlocks-notifications', { suffix: 'rituals', scope: 'spellbook' });
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if(selected) {
            sendData('query-ritual-details', { id: selected });
        }
    }, [selected]);

    onMessage('rituals-data', payload => {
        setRituals(payload.available || []);
    });

    onMessage('ritual-details', payload => {
        setDetails(payload);
    });

    onMessage('new-unlocks-notifications-rituals', payload => {
        setNewUnlocks(payload);
    });

    const onToggle = (id) => {
        sendData('toggle-ritual', { id });
    }

    const onSaveAutomation = (autocast) => {
        if(details) {
            sendData('save-ritual-settings', { id: details.id, autocast });
        }
    }

    return (
        <div className={'spell-wrap'}>
            <div className={'ingame-box spell'}>
                <div className={'menu-wrap magic'}>
                    <div className={'head'}>
                        {children}
                    </div>
                </div>
                <div className={'magic-cat spells-list'}>
                    <PerfectScrollbar>
                        <div className={'flex-container'}>
                            {rituals.map(ritual => (
                                <NewNotificationWrap
                                    key={ritual.id}
                                    id={`ritual_${ritual.id}`}
                                    className={'narrow-wrapper'}
                                    isNew={newUnlocks.spellbook?.items?.spellbook?.items?.rituals?.items?.[`ritual_${ritual.id}`]?.hasNew}
                                >
                                    <div className={`spell ${ritual.isActive ? 'active' : ''}`} onClick={() => setSelected(ritual.id)}>
                                        <div className={'icon-card spell-card'}>
                                            <div className={'icon-content'}>
                                                <div className={'icon-body'}>
                                                    <div className={'title-wrap'}>
                                                        <div className={'spell-title'}>{ritual.name}</div>
                                                        <div className={'tags'}>
                                                            {(ritual.tags || []).map(tag => <span key={`${ritual.id}_${tag}`}>{tag}</span>)}
                                                        </div>
                                                    </div>
                                                    <div className={'spell-desc'}>{ritual.description}</div>
                                                </div>
                                                <div className={'action-wrap'}>
                                                    <CustomButton onClick={() => onToggle(ritual.id)}>{ritual.isActive ? 'Disable' : 'Activate'}</CustomButton>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </NewNotificationWrap>
                            ))}
                        </div>
                    </PerfectScrollbar>
                </div>
            </div>
            <div className={'item-detail ingame-box detail-blade'}>
                <div className={'spell-details'}>
                    {details ? (
                        <div className={'spell-details-inner'}>
                            <div className={'spell-info-block'}>
                                <div className={'title-wrap'}>
                                    <div className={'spell-title'}>{details.name}</div>
                                    <div className={'tags'}>
                                        {(details.tags || []).map(tag => <span key={`${details.id}_${tag}`}>{tag}</span>)}
                                    </div>
                                </div>
                                <div className={'spell-desc'}>{details.description}</div>
                            </div>
                            <div className={'spell-effects-lasting-block'}>
                                <h4>Effects</h4>
                                <EffectsSection effects={details.potentialEffects} prefix={'effects'}/>
                            </div>
                            <div className={'spell-automation-block'}>
                                <h4>Automation</h4>
                                <RulesList
                                    rules={details.autocast?.rules || []}
                                    setRules={(rules) => onSaveAutomation({ ...(details.autocast || {}), rules })}
                                    unlocks={{ spells: true, rituals: true }}
                                    conditionStr={details.autocast?.pattern}
                                    setConditionStr={(pattern) => onSaveAutomation({ ...(details.autocast || {}), pattern })}
                                />
                            </div>
                        </div>
                    ) : <div className={'spell-details-inner'}>Select a ritual to see details</div>}
                </div>
            </div>
        </div>
    )
}

