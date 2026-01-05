import React, {useContext, useEffect, useMemo, useState, useCallback} from "react";
import WorkerContext from "../../../context/worker-context";
import {useWorkerClient} from "../../../general/client";
import PerfectScrollbar from "react-perfect-scrollbar";
import {EffectsSection} from "../../shared/effects-section.jsx";
import RulesList from "../../shared/rules-list.jsx";
import {CustomButton} from "../../shared/buttons/custom-button.jsx";
import {NewNotificationWrap} from "../../shared/new-notification-wrap.jsx";
import CircularProgress from "../../shared/circular-progress.jsx";
import {cloneDeep} from "lodash";


export const RitualsWrap = ({ children }) => {

    const worker = useContext(WorkerContext);
    const { onMessage, sendData } = useWorkerClient(worker);
    const [rituals, setRituals] = useState([]);
    const [detailOpenedId, setDetailOpenedId] = useState(null);
    const [viewedOpenedId, setViewedOpenedId] = useState(null);
    const [editData, setEditData] = useState(null);
    const [viewedData, setViewedData] = useState(null);
    const [details, setDetails] = useState({});
    const [isChanged, setChanged] = useState(false);
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

    const detailId = useMemo(() => viewedOpenedId ?? detailOpenedId, [viewedOpenedId, detailOpenedId]);

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
        if(viewedOpenedId === payload.id) {
            setViewedData(payload);
        }
        if(detailOpenedId === payload.id) {
            setEditData(prev => {
                if(prev && prev.id === payload.id && isChanged) {
                    return prev;
                }
                return payload;
            });
        }
    });

    onMessage('new-unlocks-notifications-rituals', payload => {
        setNewUnlocks(payload);
    });

    const onToggle = useCallback((id) => {
        if(!id) return;

        setDetails(prev => {
            if(!prev[id]) return prev;
            return {
                ...prev,
                [id]: { ...prev[id], isActive: !prev[id].isActive }
            };
        });

        if(editData?.id === id) {
            setEditData(prev => prev ? { ...prev, isActive: !prev.isActive } : prev);
        }

        if(viewedData?.id === id) {
            setViewedData(prev => prev ? { ...prev, isActive: !prev.isActive } : prev);
        }

        sendData('toggle-ritual', { id });
        sendData('query-ritual-details', { id });
    }, [editData?.id, viewedData?.id, sendData]);

    const onSave = useCallback(() => {
        if(!editData) return;
        sendData('save-ritual-settings', { id: editData.id, autocast: editData.autocast });
        setChanged(false);
    }, [editData]);

    const onCancel = useCallback(() => {
        const prevId = detailOpenedId;
        setDetailOpenedId(null);
        setEditData(null);
        setViewedOpenedId(null);
        setViewedData(null);
        setChanged(false);
        if(prevId) {
            sendData('query-ritual-details', { id: prevId });
        }
    }, [detailOpenedId, sendData]);

    const setRitualDetailsEdit = useCallback((id) => {
        setViewedOpenedId(null);
        setViewedData(null);
        setDetailOpenedId(id);
        setChanged(false);
        if(details[id]) {
            setEditData(details[id]);
        }
        if(id) {
            sendData('query-ritual-details', { id });
        }
    }, [details]);

    const setRitualDetailsView = useCallback((id) => {
        if(editData?.id === id) return;
        setViewedOpenedId(id);
        if(!id) {
            setViewedData(null);
            return;
        }
        sendData('query-ritual-details', { id });
    }, [editData?.id]);

    const ensureAutocast = useCallback((source) => {
        const clone = cloneDeep(source ?? {});
        if(!clone.autocast) {
            clone.autocast = { rules: [], pattern: '', isEnabled: false };
        }
        if(!clone.autocast.rules) {
            clone.autocast.rules = [];
        }
        if(clone.autocast.pattern === undefined) {
            clone.autocast.pattern = '';
        }
        if(clone.autocast.isEnabled === undefined) {
            clone.autocast.isEnabled = false;
        }
        return clone;
    }, []);

    const onToggleAutomation = useCallback(() => {
        if(!editData) return;
        const updated = ensureAutocast(editData);
        updated.autocast.isEnabled = !updated.autocast.isEnabled;
        setEditData(updated);
        setChanged(true);
    }, [editData, ensureAutocast]);

    const onAddRule = useCallback(() => {
        if(!editData) return;
        const updated = ensureAutocast(editData);
        updated.autocast.rules.push({ compare_type: 'resource_amount', condition: 'less_or_eq', value_type: 'percentage', value: 50 });
        setEditData(updated);
        setChanged(true);
    }, [editData, ensureAutocast]);

    const setRuleValue = useCallback((index, key, value) => {
        setEditData(prev => {
            if(!prev) return prev;
            const updated = ensureAutocast(prev);
            if(!updated.autocast.rules[index]) {
                updated.autocast.rules[index] = {};
            }
            updated.autocast.rules[index][key] = value;
            return updated;
        });
        setChanged(true);
    }, [ensureAutocast]);

    const deleteRule = useCallback((index) => {
        setEditData(prev => {
            if(!prev) return prev;
            const updated = ensureAutocast(prev);
            updated.autocast.rules.splice(index, 1);
            return updated;
        });
        setChanged(true);
    }, [ensureAutocast]);

    const setPattern = useCallback((pattern) => {
        setEditData(prev => {
            if(!prev) return prev;
            const updated = ensureAutocast(prev);
            updated.autocast.pattern = pattern;
            return updated;
        });
        setChanged(true);
    }, [ensureAutocast]);

    const detailItem = useMemo(() => viewedData || editData || (detailId ? details[detailId] : null), [viewedData, editData, detailId, details]);

    const detailAutocast = useMemo(() => ensureAutocast(detailItem), [detailItem, ensureAutocast]);

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
                                        onMouseEnter={() => setRitualDetailsView(ritual.id)}
                                        onMouseLeave={() => setRitualDetailsView(null)}
                                        onClick={() => setRitualDetailsEdit(ritual.id)}
                                        onContextMenu={(e) => { e.preventDefault(); onToggle(ritual.id); }}
                                    >
                                        <div className={'icon-content'}>
                                            <CircularProgress progress={ritual.cooldownProg ?? 1}>
                                                
                                                    <img src={`icons/rituals/${ritual.icon ?? ritual.id}.png`} className={'resource'} />
                                                
                                            </CircularProgress>
                                        </div>
                                    </div>
                                </NewNotificationWrap>
                            ))}
                        </div>
                    </PerfectScrollbar>
                </div>
            </div>
            <div className={'item-detail ingame-box detail-blade'}>
                {detailItem ? (
                    <div className={'spell-details-inner blade-outer'}>
                        <PerfectScrollbar>
                            <div className={'blade-inner'}>
                                <div className={'spell-info-block'}>
                                    <h4>{detailItem.name}</h4>
                                    <div className={'description'}>
                                        {detailItem.description}
                                    </div>
                                </div>
                                <div className={'block'}>
                                    <div className={'tags-container'}>
                                        {detailItem.tags.map(tag => (<div className={'tag'}>{tag}</div> ))}
                                    </div>
                                </div>
                                <div className={'spell-effects-lasting-block'}>
                                    <h4>Effects</h4>
                                    <EffectsSection effects={detailItem?.potentialEffects || {}} prefix={'effects'} maxDisplay={10}/>
                                </div>
                                <div className={'spell-automation-block autoconsume-setting'}>
                                    <h4>Automation</h4>
                                    <div className={'rules-header flex-container'}>
                                        <p>Autotrigger rules:</p>
                                        <label>
                                            <input type={'checkbox'} checked={detailAutocast.autocast?.isEnabled ?? false} onChange={onToggleAutomation}/>
                                            {detailAutocast.autocast?.isEnabled ? ' ON' : ' OFF'}
                                        </label>
                                        {editData ? <button onClick={onAddRule}>Add rule (AND)</button> : null}
                                    </div>
                                    <RulesList
                                        prefix={'rituals'}
                                        isEditing={!!editData}
                                        key={`${detailItem.id}-${!!editData}-${detailAutocast.autocast?.rules?.length || 0}`}
                                        rules={(detailAutocast.autocast?.rules) || []}
                                        pattern={detailAutocast.autocast?.pattern}
                                        deleteRule={deleteRule}
                                        setRuleValue={setRuleValue}
                                        setPattern={setPattern}
                                        isAutoCheck={detailAutocast.autocast?.isEnabled}
                                    />
                                </div>
                                <div className={'spell-automation-block'}>
                                    <CustomButton onClick={() => onToggle(detailItem.id)}>
                                        {detailItem.isActive ? 'Disable' : 'Activate'}
                                    </CustomButton>
                                </div>
                            </div>
                        </PerfectScrollbar>
                        {editData ? (
                            <div className={'main-buttons buttons flex-container'}>
                                <button className={'primary-action'} disabled={!isChanged} onClick={onSave}>Save</button>
                                <button className={'warning-action'} onClick={onCancel}>Cancel</button>
                            </div>
                        ) : null}
                    </div>
                ) : <div className={'spell-details-inner'}>
                    <p className={'hint'}>Rituals provide you specific bonuses and penalties while isActive</p>
                    <p className={'hint'}>You can have only one ritual active at a time</p>
                    <p className={'hint'}>You can't toggle rituals sooner than 60 seconds after the last toggle</p>
                    <p className={'hint'}>Hover or select a ritual to see details</p>
                    </div>}
            </div>
        </div>
    )
}

