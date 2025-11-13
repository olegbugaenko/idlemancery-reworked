import React, {useContext, useEffect, useState} from "react";
import PerfectScrollbar from "react-perfect-scrollbar";
import {formatInt, formatValue, secondsToString} from "../../general/utils/strings";
import {EffectsSection} from "../shared/effects-section.jsx";
import {ResourceComparison} from "../shared/resource-comparison.jsx";
import {CustomButton} from "../shared/buttons/custom-button.jsx";
import {useTutorial} from "../../context/tutorial-context";
import WorkerContext from "../../context/worker-context";
import {useWorkerClient} from "../../general/client";
import {PinResource} from "../shared/pin-resource.jsx";
import RulesList from "../shared/rules-list.jsx";

export const InventoryDetails = React.memo(({isChanged, editData, viewedData, resources, onAddAutoconsumeRule, onSetAutoconsumeRuleValue, onDeleteAutoconsumeRule, onAddAutosellRule, onSetAutosellRuleValue, onDeleteAutosellRule, onSave, onCancel, onSell, onSetAutosellPattern, onSetAutoconsumePattern, onSetAutosellReserved, onSetAutoconsumeReserved, onToggleAutoconsume, onToggleAutosell, automationUnlocked, onConsume, onToggleViewLasting}) => {

    const worker = useContext(WorkerContext);

    const { sendData, onMessage, removeMessage } = useWorkerClient(worker);

    const { unlockNextById, currentTourId } = useTutorial();

    const [details, setDetails] = useState(null);

    const item = viewedData ? viewedData : editData;

    let isEditing = !!editData && !viewedData;

    if(!item) return null;

    useEffect(() => {

        if(item) {
            sendData('query-inventory-details', { id: item.id, prefix: 'detail-blade' })
        }
    }, [item, sendData]);

    useEffect(() => {
        if(currentTourId === 'inventory' && details?.id === 'inventory_brightleaf') {
            unlockNextById(14);
        }
    }, [currentTourId, details?.id, details?.numConsumed, details?.currentDuration, unlockNextById]);

    useEffect(() => {
        onMessage('detail-blade-inventory-details', (data) => {
            setDetails(data);
        });

        return () => {
            removeMessage('detail-blade-inventory-details');
        };
    }, [onMessage, removeMessage]);

    const setAutoconsumePattern = (pattern) => {
      onSetAutoconsumePattern(pattern)
    }

    const addAutoconsumeRule = () => {
        onAddAutoconsumeRule()
    }

    const setAutoconsumeRuleValue = (index, key, value) => {
        onSetAutoconsumeRuleValue(index, key, value)
    }

    const deleteAutoconsumeRule = (index) => {
        onDeleteAutoconsumeRule(index)
    }

    const setAutosellPattern = (pattern) => {
        onSetAutosellPattern(pattern)
    }

    const addAutosellRule = () => {
        onAddAutosellRule()
    }

    const setAutosellRuleValue = (index, key, value) => {
        onSetAutosellRuleValue(index, key, value)
    }

    const deleteAutosellRule = (index) => {
        onDeleteAutosellRule(index)
    }

    const setReservedValue = (reserved) => {
        onSetAutosellReserved(reserved)
    }

    const setReservedConsumeValue = (reserved) => {
        onSetAutoconsumeReserved(reserved)
    }

    const toggleAutosell = () => {
        onToggleAutosell()
    }

    const toggleAutoconsume = () => {
        onToggleAutoconsume()
    }

    const consumeItem = () => {
        if(currentTourId === 'inventory' && item.id === 'inventory_brightleaf') {
            unlockNextById(14);
        }
        onConsume(item.id);
    }

    const toggleViewLasting = () => {
        onToggleViewLasting(item.id, !(details || item).show_lasting);
    }

    if(currentTourId === 'inventory' && item.id === 'inventory_brightleaf' && isEditing) {
        unlockNextById(11);
    }

    return (
        <>
            <div className={'blade-outer'}>
                <PerfectScrollbar>
                    <div className={'blade-inner inventory-items-blade'}>
                        <div className={'block'}>
                            <div className={'inner-heading flex-container flex-row'}>
                                <h4>{item.name} (x{formatInt(item.amount)})</h4>
                                <PinResource id={item.id} isPinned={details?.isPinned} />
                            </div>

                            <div className={'description'}>
                                {item.description}
                            </div>
                        </div>
                        <div className={'block'}>
                            <div className={'tags-container'}>
                                {item.tags.map(tag => (<div key={tag} className={'tag'}>{tag}</div> ))}
                            </div>
                        </div>
                        {item?.effects?.length ? (<div className={'block'}>
                            <p>Effects on usage:</p>
                            <div className={'effects'}>
                                <EffectsSection effects={item.effects}/>
                            </div>
                        </div>) : null}
                        {item.potentialPermanentEffects ? (<div className={'block'}>
                            <p>Permanent Effects:</p>
                            <div className={'effects'}>
                                <ResourceComparison effects1={item.permanentEffects} effects2={item.potentialPermanentEffects}/>
                            </div>
                        </div>) : null}
                        {item.duration ? (<div className={'block'}>
                            <p>Effects lasting: {secondsToString(item.duration)}</p>
                            <div className={'effects'}>
                                <EffectsSection effects={item.potentialEffects} />
                            </div>
                            {item.canShowLasting ? (<div className={'show-lasting'}>
                                <CustomButton
                                    iconId={'icon_view_lasting'}
                                    className={`toggle-effect-monitor medium-sm ${details?.show_lasting ? 'highlighted' : ''}`}
                                    onClick={(e) => {toggleViewLasting()}}
                                >{details?.show_lasting ? 'Stop showing active effects in left sidebar' : 'Show when active in left sidebar'}</CustomButton>
                            </div> ) : null}
                        </div>) : null}

                        <div className={'block'}>
                            {item.isConsumable ? (<div className={'flex-container consumption-block'}>
                                <div className={'stats'}>
                                    <p>Consumption Cooldown: {secondsToString(item.consumptionCooldown)}</p>
                                    <p>Consumed amount: {formatInt(item.numConsumed)}</p>
                                </div>
                                <div className={'consume-block'}>
                                    <button className={'consume-button'} onClick={consumeItem} disabled={details?.currentCooldown > 0 || details?.currentDuration > 0}>Consume</button>
                                    {details?.currentDuration ? (<p className={'small'}>Running: {secondsToString(details?.currentDuration)}</p>) : null}
                                    {details?.currentCooldown ? (<p className={'small'}>Cooldown: {secondsToString(details?.currentCooldown)}</p>) : null}
                                </div>
                            </div>) : null}
                            {item.isSellable ? (<div>
                                <p>Sold amount: {formatInt(item.soldAmount)}</p>
                                <p>Coins Earned: {formatInt(item.coinsEarned)}</p>
                            </div>) : null}
                        </div>

                        {item.isConsumable && automationUnlocked ? (<div className={'autoconsume-setting block'}>
                            <div className={'rules-header flex-container'}>
                                <p>Autoconsumption rules: {item.autoconsume?.rules?.length ? null : 'None'}</p>
                                <label>
                                    <input type={'checkbox'} checked={item.autoconsume?.isEnabled ?? undefined} onChange={toggleAutoconsume}/>
                                    {item.autoconsume?.isEnabled ? ' ON' : ' OFF'}
                                </label>
                                {isEditing ? (<button onClick={addAutoconsumeRule}>Add rule (AND)</button>) : null}
                            </div>

                            <RulesList
                                prefix={'autoconsume'}
                                isEditing={isEditing}
                                rules={item.autoconsume?.rules || []}
                                resources={resources}
                                pattern={item.autoconsume?.pattern}
                                deleteRule={deleteAutoconsumeRule}
                                setRuleValue={setAutoconsumeRuleValue}
                                setPattern={setAutoconsumePattern}
                                isAutoCheck={item.autoconsume?.isEnabled}
                            />
                            <div className={'autoconsume-amount flex-container'}>
                                <p>Reserved Amount:</p>
                                {isEditing ? <input type={'number'} onChange={e => setReservedConsumeValue(+e.target.value)}
                                        value={item.autoconsume?.reserved || 0}/> : <span>{formatValue(item.autoconsume?.reserved || 0)}</span>}
                            </div>
                        </div>) : null}

                        {item.isSellable && automationUnlocked ? (<div className={'autoconsume-setting block'}>
                            <div className={'rules-header flex-container'}>
                                <p>Autosell rules: {item.autosell?.rules?.length ? null : 'None'}</p>
                                <label>
                                    <input type={'checkbox'} checked={item.autosell?.isEnabled ?? undefined} onChange={toggleAutosell}/>
                                    {item.autosell?.isEnabled ? ' ON' : ' OFF'}
                                </label>
                                {isEditing ? (<button onClick={addAutosellRule}>Add rule (AND)</button>) : null}
                            </div>

                            <RulesList
                                prefix={'autosell'}
                                isEditing={isEditing}
                                rules={item.autosell?.rules || []}
                                pattern={item.autosell?.pattern}
                                resources={resources}
                                deleteRule={deleteAutosellRule}
                                setRuleValue={setAutosellRuleValue}
                                setPattern={setAutosellPattern}
                                isAutoCheck={item.autosell?.isEnabled}
                            />
                            <div className={'autosell-amount flex-container'}>
                                <p>Reserved Amount:</p>
                                {isEditing ? <input type={'number'} onChange={e => setReservedValue(+e.target.value)}
                                        value={item.autosell?.reserved || 0}/> : <span>{formatValue(item.autosell?.reserved || 0)}</span>}
                            </div>
                        </div>) : null}

                        {item.isSellable ? (<div className={'block sell-block'}>
                            <p className={'text-desc'}>Sell price: {formatValue(item.sellPrice)}</p>
                            <div className={'buttons flex-container'}>
                                <button disabled={item.maxSell < 1} onClick={() => onSell(item.id, 1)}>Sell</button>
                                <button disabled={item.maxSell < 1} onClick={() => onSell(item.id, item.maxSell)}>Sell max (x{formatInt(item.maxSell)})</button>
                            </div>
                        </div> ) : null}


                    </div>
                </PerfectScrollbar>
            </div>
            {isEditing ? (<div className={'buttons flex-container main-buttons'}>
                <button className={'primary-action'} disabled={!isChanged} onClick={onSave}>Save</button>
                <button className={'warning-action'} onClick={onCancel}>Cancel</button>
            </div>) : null}
        </>
    )
}, (prevProps, currentProps) => {

    if(prevProps.isChanged !== currentProps.isChanged) {
        return false;
    }

    if(prevProps.editData !== currentProps.editData) {
        return false;
    }

    if(prevProps.viewedData !== currentProps.viewedData) {
        return false;
    }

    return true;
});
