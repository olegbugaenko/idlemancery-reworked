import React, {useContext, useEffect, useMemo, useState} from "react";
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
    const [hovered, setHovered] = useState(null);
    const [details, setDetails] = useState({});
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

    const detailId = useMemo(() => hovered ?? selected, [hovered, selected]);

    useEffect(() => {
        if(detailId) {
            sendData('query-ritual-details', { id: detailId });
        }
    }, [detailId]);

    onMessage('rituals-data', payload => {
        setRituals(payload.available || []);
    });

    onMessage('ritual-details', payload => {
        setDetails(prev => ({ ...prev, [payload.id]: payload }));
    });

    onMessage('new-unlocks-notifications-rituals', payload => {
        setNewUnlocks(payload);
    });

    const onToggle = (id) => {
        sendData('toggle-ritual', { id });
    }

    const onSaveAutomation = (autocast) => {
        if(detailId) {
            sendData('save-ritual-settings', { id: detailId, autocast });
        }
    }

    const onToggleAutomation = () => {
        const current = details[detailId];
        if(!current) return;
        const updated = { ...(current.autocast || {}), isEnabled: !current.autocast?.isEnabled };
        onSaveAutomation(updated);
    }

    const onAddRule = () => {
        const current = details[detailId];
        if(!current) return;
        const rules = current.autocast?.rules || [];
        onSaveAutomation({ ...(current.autocast || {}), rules: [...rules, { condition: 'true' }] });
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
                                    <div
                                        className={`icon-card item bigger spell-card ${ritual.isActive ? 'active' : ''}`}
                                        onMouseEnter={() => setHovered(ritual.id)}
                                        onMouseLeave={() => setHovered(null)}
                                        onClick={() => setSelected(ritual.id)}
                                        onContextMenu={(e) => { e.preventDefault(); onToggle(ritual.id); }}
                                    >
                                        <div className={'icon-content'}>
                                            <div className={'icon-body ritual-icon'}>
                                                <img src={`icons/rituals/${ritual.id}.png`} className={'resource'} />
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
                    {detailId && details[detailId] ? (
                        <div className={'spell-details-inner'}>
                            <div className={'spell-info-block'}>
                                <div className={'title-wrap'}>
                                    <div className={'spell-title'}>{details[detailId].name}</div>
                                    <div className={'tags'}>
                                        {(details[detailId].tags || []).map(tag => <span key={`${details[detailId].id}_${tag}`}>{tag}</span>)}
                                    </div>
                                </div>
                                <div className={'spell-desc'}>{details[detailId].description}</div>
                            </div>
                            <div className={'spell-effects-lasting-block'}>
                                <h4>Effects</h4>
                                <EffectsSection effects={details[detailId].potentialEffects} prefix={'effects'}/>
                            </div>
                            <div className={'spell-automation-block'}>
                                <h4>Automation</h4>
                                <div className={'rules-header flex-container'}>
                                    <p>Autotrigger rules:</p>
                                    <label>
                                        <input type={'checkbox'} checked={details[detailId].autocast?.isEnabled ?? false} onChange={onToggleAutomation}/>
                                        {details[detailId].autocast?.isEnabled ? ' ON' : ' OFF'}
                                    </label>
                                    <button onClick={onAddRule}>Add rule (AND)</button>
                                </div>
                                <RulesList
                                    rules={details[detailId].autocast?.rules || []}
                                    setRules={(rules) => onSaveAutomation({ ...(details[detailId].autocast || {}), rules })}
                                    unlocks={{ spells: true, rituals: true }}
                                    conditionStr={details[detailId].autocast?.pattern}
                                    setConditionStr={(pattern) => onSaveAutomation({ ...(details[detailId].autocast || {}), pattern })}
                                />
                            </div>
                            <div className={'spell-automation-block'}>
                                <CustomButton onClick={() => onToggle(details[detailId].id)}>
                                    {details[detailId].isActive ? 'Disable' : 'Activate'}
                                </CustomButton>
                            </div>
                        </div>
                    ) : <div className={'spell-details-inner'}>Hover or select a ritual to see details</div>}
                </div>
            </div>
        </div>
    )
}

