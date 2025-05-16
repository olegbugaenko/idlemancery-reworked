import React, {useCallback, useContext, useEffect, useRef, useState} from "react";
import WorkerContext from "../../context/worker-context";
import {useWorkerClient} from "../../general/client";
import PerfectScrollbar from "react-perfect-scrollbar";
import {HowToSign} from "../shared/how-to-sign.jsx";
import {TippyWrapper} from "../shared/tippy-wrapper.jsx";
import {formatInt, formatValue, secondsToString} from "../../general/utils/strings";
import {ResourceComparison} from "../shared/resource-comparison.jsx";
import {EffectsSection} from "../shared/effects-section.jsx";
import RulesList from "../shared/rules-list.jsx";
import StatRow from "../shared/stat-row.jsx";
import {useTutorial} from "../../context/tutorial-context";
import {ProgressBar} from "../layout/progress-bar.jsx";
import {useAppContext} from "../../context/ui-context";
import {useUICache} from "../../general/hooks/local-cache";
import {useDrag, useDrop} from "../../custom-libs/dnd";


export const ActionDetails = ({actionId, onClose, isSelected}) => {

    const worker = useContext(WorkerContext);

    const { onMessage, sendData } = useWorkerClient(worker);

    const [action, setDetailOpened] = useState(null);

    const [interval, setIntervalRef] = useState(null);

    useEffect(() => {
        const intervalLoc = setInterval(() => {
            sendData('query-action-details', { id: actionId });
        }, 100);
        setIntervalRef(intervalLoc);

        return () => {
            clearInterval(intervalLoc);
        }
    }, [actionId])


    onMessage('action-details', (actions) => {
        setDetailOpened(actions);
    })

    if(!actionId || !action) return null;

    return (
        <ActionDetailsComponent {...action} onClose={onClose} isSelected={isSelected} />
    )
}

export const ActionDetailsComponent = React.memo(({onClose, isSelected, ...action}) => {

    const { stepIndex, unlockNextById, currentTourId } = useTutorial();

    useEffect(() => {
        if(action.id === 'action_walk' && isSelected && currentTourId === 'initial') {

            requestAnimationFrame(() => {
                unlockNextById(5);
            });
        }
    }, [action.id, isSelected, currentTourId, stepIndex]);

    return (<PerfectScrollbar>
        <div className={'blade-inner'}>
            <div className={'block'}>
                <h4 className={'title'}>
                    <div>
                        <span>{action.name}</span>
                        <span>({formatInt(action.level, 3)})</span>
                    </div>
                    <span className={'close'} onClick={onClose}>X</span>
                </h4>
                <div className={'description'}>
                    {action.description}
                </div>
            </div>
            {action.nextUnlock ? (<div className={'unlock block'}>
                <p className={'hint'}>Next unlock at level {formatInt(action.nextUnlock.level)}</p>
            </div> ) : null}
            <div className={'block'}>
                <div className={'tags-container'} id={'action-tags'}>
                    {action.tags.map(tag => (<div key={tag} className={'tag'}>{tag}</div> ))}
                </div>
            </div>
            {action.entityEfficiency < 1 ? (<div className={'block'}>
                <p className={'hint yellow'}>
                    This action is running {formatValue(100*action.entityEfficiency)}% efficiency due to missing {action?.missingResource?.name}
                </p>
            </div> ) : null}
            <div className={'block'}>
                <div className={'bottom'}>
                    <div className={'xp-box'}>
                        <span className={'xp-text'}>XP: {formatInt(action.xp)}/{formatInt(action.maxXP)}</span>
                        <span className={'xp-income'}>+{formatValue(action.xpRate)}</span>
                    </div>

                    <div>
                        <ProgressBar className={'action-progress'} percentage={action.xp/action.maxXP}></ProgressBar>
                    </div>
                </div>
            </div>
            {action.rankData ? (<div className={'block'} id={'action-rank-data'}>
                <TippyWrapper content={<div className={'hint-popup'}>
                    <p>Every 100 level this action will receive new rank, providing you more benefits per level</p>
                </div> }>
                    <div className={'bottom'}>
                        <div className={'xp-box rank'}>
                            <span className={'rank-text'}>
                                <div className={'icon-content rank-icon interface-icon'}>
                                    <img src={"icons/interface/rank_icon.png"}/>
                                </div>
                                Rank: {formatInt(action.rankData.rank)}(x{formatValue(action.rankData.bonus)})
                            </span>
                            <span className={'xp-income'}>{formatValue(action.level)}/{formatValue(action.rankData.nextRankLevel)}</span>
                        </div>

                        <div>
                            <ProgressBar className={'action-progress rank-progress'} percentage={action.rankData.progress}></ProgressBar>
                        </div>
                        <p className={'hint'}>Every 100 levels this action will receive new rank, improving benefits you get from it.</p>
                    </div>
                </TippyWrapper>

            </div>) : null}
            {action.primaryAttribute ? (<div className={'block'}>

                <p>Primary Attribute: {action.primaryAttribute.name} ({formatValue(action.primaryAttribute.value)}), providing {formatValue(100*action.primaryAttributeEffect)}% learning rate</p>

            </div> ) : null}
            {action.aspect && action.aspect?.aspect?.level > 0 ? (<div className={'block'}>

                <p>Intensity: X{formatValue(action.aspect.intensity)} (From {action.aspect.aspect.name}, level {formatInt(action.aspect.aspect.level)})</p>
                <p className={'hint'}>Action intensity determines amount of action done per unit of time, affecting production, consumption, and leveling speed</p>
            </div> ) : null}
            <div className={'block'} id={'item_action_bonuses'}>
                <p>Action Effects</p>
                <div className={'effects'}>
                    <EffectsSection effects={action?.actionEffect} maxDisplay={10}/>
                </div>
            </div>
            {action.isTraining ? (
                <div className={'block'} id={'item_action_levelup'}>
                    <p>Action LevelUp bonuses</p>
                    <div className={'effects'}>
                        <ResourceComparison effects1={action?.currentEffects} effects2={action?.potentialEffects} />
                    </div>
                </div>
            ) : null}
            <div className={'block'}>
                <p>Action Statistics</p>
                <div className={'stats-block'}>
                    <p><span>Time spent:</span> <span>{secondsToString(action.timeInvested)}</span></p>
                    <p><span>XP earned:</span> <span>{formatValue(action.xpEarned)}</span></p>
                </div>
            </div>
            <div className={'block'}>
                <p>Learn ETA's</p>
                <div className={'stats-block'}>
                    {Object.entries(action.etas).map(([level, eta]) => (
                        <p key={level}><span>Level {formatInt(level)}: </span> <span>{secondsToString(eta)}</span></p>
                    ))}
                </div>
            </div>
            {isSelected ? (<div className={'buttons'}>
                <button onClick={onClose}>Close</button>
            </div>) : null}
        </div>
    </PerfectScrollbar>)
}, (prevProps, currentProps) => {
    if(!prevProps && !currentProps) return true;
    if(!prevProps || !currentProps) {
        return false;
    }
    if(prevProps.level !== currentProps.level) {
        return false;
    }
    if(prevProps.isSelected !== currentProps.isSelected) {
        return false;
    }
    if(prevProps.xp !== currentProps.xp) {
        return false;
    }
    if(prevProps.id !== currentProps.id) {
        return false;
    }
    if(prevProps.timeInvested !== currentProps.timeInvested) {
        return false;
    }

    if(currentProps.potentialEffects.length) {
        for(let i = 0; i < currentProps.potentialEffects.length; i++) {
            if(!prevProps.potentialEffects[i]) {
                return false;
            }

            if(prevProps.potentialEffects[i].value !== currentProps.potentialEffects[i].value) {
                return false;
            }
        }
    }

    return true;
})

const DraggableActionItem = ({ id, index, children }) => {

    const {ref, props: dragProps} = useDrag({ type: 'action', id: `action_in_editor_${id}`, sourceId: 'action-list-editor', data: { id } });

    return (
        <div ref={ref} {...dragProps}>
            {children}
        </div>
    );
};

export const ListEditor = React.memo(({
      editListId,
      listData,
      onUpdateActionFromList,
      onDropActionFromList,
      onUpdateListValue,
      onCloseList,
      isEditing,
      onAddAutotriggerRule,
      onSetAutotriggerRuleValue,
      onDeleteAutotriggerRule,
      setAutotriggerPriority,
      onSetAutotriggerPattern,
      onToggleAutotrigger,
      resources,
      automationUnlocked,
      onDragEnd,
  }) => {

    const worker = useContext(WorkerContext);

    const { onMessage, sendData } = useWorkerClient(worker);

    const [editing, setEditing] = useState({ actions: [] })

    const { stepIndex, unlockNextById, jumpOver, currentTourId, setNextAllowedById } = useTutorial();

    const editingRef = useRef(editing);

    useEffect(() => {
        editingRef.current = editing;
    }, [editing]);

    useEffect(() => {
        const interval = setInterval(() => {
            sendData('query-action-list-effects', { listData: editingRef.current });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        setEditing(listData);
        console.log('RecListData: ', listData);
        if(currentTourId === 'action-lists') {
            if(listData.actions.find(one => one.id === 'action_walk') && listData.actions.find(one => one.id === 'action_beggar')) {
                unlockNextById(4)
            }
        }
    }, [listData])

    const saveAndClose = (isClose) => {
        if(!isClose) {
            editing.isReopenEdit = true;
        }
        sendData('save-action-list', editing);
        if(isClose) {
            onCloseList();
        }
    }

    const addAutotriggerRule = () => {
        if(currentTourId === 'lists-automation') {
            unlockNextById(4);
        }
        onAddAutotriggerRule()
    }

    const setAutotriggerRuleValue = (index, key, value) => {
        if(currentTourId === 'lists-automation') {
            let isRulesValid = false;
            if(editing.autotrigger.rules?.length >= 2) {
                if(editing.autotrigger.rules[0].compare_type !== editing.autotrigger.rules[1].compare_type
                    && editing.autotrigger.rules.every(one => one.condition) && editing.autotrigger.rules.every(one => one.compare_type)) {
                    isRulesValid = true;
                }
            }
            if(isRulesValid) {
                unlockNextById(6)
            }
        }
        onSetAutotriggerRuleValue(index, key, value)
    }

    const deleteAutotriggerRule = index => {
        onDeleteAutotriggerRule(index);
    }

    const setAutotriggerPattern = (pattern) => {
        if(currentTourId === 'lists-automation') {
            const trimmedPattern = pattern.toLowerCase().trim();
            if(trimmedPattern === '1 or 2' || trimmedPattern === '1 and 2') {
                unlockNextById(8);
            }
        }
        onSetAutotriggerPattern(pattern)
    }

    const toggleAutotrigger = () => {
        onToggleAutotrigger()
    }

    useDrop('action-editor-wrap', { accept: 'action', onDrop: onDragEnd });

    if(!editing) return ;

    return (<>
        <div className={'blade-outer'}>
            <PerfectScrollbar>
                <div className={'list-editor'}>
                    <div className={'main-wrap'}>
                        <div className={'main-row'}>
                            <span>Name</span>
                            {isEditing ? (<input className={'action-list-name-input'} type={'text'} value={editing.name ?? ''} onChange={(e) => {
                                if(currentTourId === 'action-lists') {
                                    setNextAllowedById(2)
                                }
                                onUpdateListValue('name', e.target.value)
                            }}/>) : (<span>{editing.name}</span>)}
                            <HowToSign scope={'action-lists'} />
                        </div>
                    </div>
                    <div className={'block'}>
                        <p className={'hint'}>
                            All actions in the list are performed simultaneously.
                        </p>
                        <div className={'show-bar'}>
                            {editing?.proportionsBar ? (<div className={'proportions-bar'}>
                                {editing?.proportionsBar.map(one => (
                                    <TippyWrapper content={
                                        <div className={'hint-popup'}>
                                            <p>{one.name}</p>
                                            <p>Effort: {formatValue(one.percentage*100)}%</p>
                                        </div> }>
                                        <div style={{width: one.displayPercentage, backgroundColor: one.color}} className={'proportion-bar'}>
                                        </div>
                                    </TippyWrapper>
                                ))}
                            </div> ) : null}
                        </div>
                    </div>
                    <div className="actions-list-wrap" id={'actions-in-list'}>
                        <div className={`action-row flex-container header`}
                        >
                            <div className={'col title'}>
                                <span>Action</span>
                            </div>
                            <div className={'col amount'}>
                                <span>Effort</span>
                            </div>
                            <div className={'col delete'}>
                                {isEditing ? (<span>Delete</span>) : null}
                            </div>
                        </div>
                        <div id={'action-editor-wrap'} className={'action-items-list'}>
                            {editing.actions.length ? editing.actions.map((action, index) => (
                                <DraggableActionItem key={`list-${action.id}-${index}`} id={action.id} index={index}>
                                    <div className={`action-row flex-container ${!action.isAvailable ? 'unavailable' : ''}`}>
                                        {editing.proportionsBar ? (<div style={{width: editing.proportionsBar?.[index]?.displayPercentage, backgroundColor: editing.proportionsBar[index]?.color}} className={'prop-bg'}></div> ) : null}
                                        <div className={'col title'}>
                                            <span>{action.name}</span>
                                        </div>
                                        <div className={`col amount ${isEditing ? 'large' : ''}`}>
                                            {isEditing
                                                ? (<div className={`editing-amounts amount-for-${action.id}`}>
                                                        <input type={'number'} value={action.time}
                                                               onChange={(e) => {
                                                                   if(currentTourId === 'action-lists' && +e.target.value > 1) {
                                                                       unlockNextById(9)
                                                                   }
                                                                   onUpdateActionFromList(action.id, 'time', +e.target.value)
                                                               }}/>
                                                        <TippyWrapper content={<div className={'hint-popup'}>Auto adjusts effort so this action produces enough to cover what others consume.</div> }>
                                                            <label className={`effort-auto-${action.id}`}>
                                                                <input type={'checkbox'} checked={action.isDynamicTime} disabled={!action.isAutoTimeEnabled} onChange={(e) => {
                                                                    onUpdateActionFromList(action.id, 'isDynamicTime', !action.isDynamicTime)
                                                                }}/>
                                                                Auto
                                                            </label>
                                                        </TippyWrapper>
                                                        <span className={'percentage'}>{formatValue(editing.proportionsBar?.[index]?.percentage*100 || 0)} %</span>
                                                    </div>
                                                )
                                                : (<span>{formatValue(editing.proportionsBar[index].percentage*100)} %</span>)
                                            }
                                        </div>
                                        <div className={'col delete'}>
                                            {isEditing ? (<span className={'close'} onClick={() => onDropActionFromList(action.id)}>X</span>) : null}
                                        </div>
                                    </div>
                                </DraggableActionItem>
                            )) : <p className={'hint'}>Click on actions or drag & drop them to add</p>}
                        </div>
                    </div>
                    <div className={'effects-wrap'}>
                        {Object.keys(editing?.resourcesEffects || {}).length ? (<div className={'block'} id={'list-resources-gain'}>
                            <p>Average Resources per second</p>
                            <ResourceComparison effects1={editing?.prevEffects} effects2={editing?.resourcesEffects} maxDisplay={10}/></div>) : null}
                        {editing?.effectEffects?.length ? (<div className={'block'} id={'list-effects-gain'}>
                            <p>Average Effects per second</p>
                            <EffectsSection effects={editing?.effectEffects || []} maxDisplay={10}/></div>) : null}
                    </div>
                    {automationUnlocked ? (<div className={'autotrigger-settings autoconsume-setting block'}>
                        <div className={'rules-header flex-container'}>
                            <p>Autotrigger rules: {editing?.autotrigger?.rules?.length ? null : 'None'}</p>
                            <label className={'autotrigger-on-off'}>
                                <input type={'checkbox'} checked={editing.autotrigger?.isEnabled} onChange={toggleAutotrigger}/>
                                {editing.autotrigger?.isEnabled ? ' ON' : ' OFF'}
                            </label>
                            {isEditing ? (<button id={'add-rule-button'} onClick={addAutotriggerRule}>Add rule (AND)</button>) : null}
                            <HowToSign scope={'lists-automation'}/>
                        </div>
                        <div className={'priority-line flex-container'}>
                            <p>Priority: </p>
                            <input type={'number'} value={editing.autotrigger?.priority || 0}
                                   onChange={e => setAutotriggerPriority(+(e.target.value || 0))}/>
                        </div>
                        <RulesList
                            isEditing={isEditing}
                            rules={editing.autotrigger?.rules || []}
                            resources={resources}
                            deleteRule={deleteAutotriggerRule}
                            setRuleValue={setAutotriggerRuleValue}
                            setPattern={setAutotriggerPattern}
                            pattern={editing.autotrigger?.pattern || ''}
                            isAutoCheck={editing.autotrigger?.isEnabled}
                        />
                    </div>) : null}
                </div>
            </PerfectScrollbar>
        </div>
        {isEditing ? (<div className={'buttons main-buttons flex-container'}>
            <button className={'primary-action'} onClick={() => saveAndClose(false)}>{listData?.id ? 'Save' : 'Create'}</button>
            <button className={'primary-action save-and-close'} onClick={() => {
                if(currentTourId === 'action-lists') {
                    unlockNextById(11)
                }
                if(currentTourId === 'lists-automation') {
                    unlockNextById(10)
                }
                saveAndClose(true)
            }}>{listData?.id ? 'Save & Close' : 'Create & Close'}</button>
            <button className={'warning-action'} onClick={onCloseList}>Cancel</button>
        </div>) : null}
    </> )
}, ((prevProps, currentProps) => {

    if(prevProps.isEditing !== currentProps.isEditing) return false;

    if(prevProps.listData !== currentProps.listData) return false;

    // if(prevProps.editListId !== currentProps.editListId) return false;

    return true;
}))

export const GeneralStats = ({ stats, aspects, setDetailVisible }) => {

    const worker = useContext(WorkerContext);

    const { onMessage, sendData } = useWorkerClient(worker);

    const {isMobile} = useAppContext();

    const { currentTourId, unlockNextById, stepIndex } = useTutorial();

    const [isIntensityHidden, setIntensityHidden] = useUICache('actions_intensity_hidden', false)
    const [isLearningRatesHidden, setLearningRatesHidden] = useUICache('learning_rates_hidden', false)
    const [isDiscountsHidden, setDiscountsHidden] = useUICache('discounts_hidden', false)

    useEffect(() => {
        if(!isIntensityHidden && currentTourId === 'aspects') {
            unlockNextById(1);
        }
    }, [isIntensityHidden, currentTourId, stepIndex])

    const setAspectLevel = (id, level) => {
        sendData('set-action-aspect-level', { id, level });
    }

    const toggleMaxed = (id, flag) => {
        sendData('toggle-action-aspect-maxed', { id, flag });
    }

    const hasEffect = (stat) => {
        if(!stat?.value) return false;
        return Math.abs(stat?.value - 1.0) > 1.e-7;
    }

    const highLightAffectedActions = (id) => {
        sendData('set-monitored', { scope: 'actions', type: 'learn_modifier', id });
    }

    const highLightDiscountedActions = (id) => {
        sendData('set-monitored', { scope: 'actions', type: 'discount', id });
    }

    const setMonitoredAttribute = useCallback((id) => {
        sendData('set-monitored', { scope: 'actions', type: 'attribute', id });
    }, []);

    return (<PerfectScrollbar>
        {aspects.isUnlocked ? (<div className={'block aspects-block'}>
            <div className={'block-heading flex-container flex-row'}>
                <p>Actions Intensity</p>
                <HowToSign scope={'aspects'} />
                <div className={`interface-icon icon-content small show-hide-aspects ${!isIntensityHidden ? ' reverted' : ''}`} onClick={() => setIntensityHidden(!isIntensityHidden)}>
                    <img src={"icons/interface/toggle_hidden.png"} />
                </div>
            </div>

            {!isIntensityHidden ? (<div className={'intensity-block'}>
                <p className={'hint'}>
                    Intensity boosts work speed but increases resource use. Max intensity depends on the attribute. "Keep Max" uses the highest available level. Lower intensity saves resources.
                </p>
                {aspects.list.map(one => (<div className={'aspect-wrap'} key={`aspect_${one.id}`} onMouseEnter={() => setMonitoredAttribute(one.attributeData?.id)} onMouseLeave={() => setMonitoredAttribute(null)}>
                    <div className={'flex-container aspect-row'}>
                        <span className={'col title'}>{one.name}</span>
                        <div className={'col amount'}>
                            <input className={'set-aspect-level-input'} type={'number'} value={one.level} onChange={e => setAspectLevel(one.id, +e.target.value)}/>
                            <span> of {one.maxLevel}</span>
                            <label>
                                <input className={'set-aspect-level-checkbox'} type={'checkbox'} checked={one.keepMaxed} onChange={e => toggleMaxed(one.id, !one.keepMaxed)}/>
                                Keep Max
                            </label>
                        </div>
                    </div>
                    <div className={'progress-wrap'}>
                        <div style={{width: `${one.progress*100}%`, backgroundColor: one.color}} className={'prop-bg'}></div>
                        <div className={'flex-container aspect-row'}>
                            <span>{one.attributeData.name}:</span>
                            <span>{formatValue(one.attributeData.value)}/{formatValue(one.nextPoint)}</span>
                            <span className={'hint'}>
                            {`${formatValue(one.nextPoint - one.attributeData.value)} more ${one.attributeData.name} to unlock next level`}
                        </span>
                        </div>
                    </div>
                </div> ))}
            </div>) : null}
        </div> ) : null}
        <div className={'block'}>
            <div className={'block-heading flex-container flex-row'}>
                <p>Learn Speed Multipliers:</p>
                <div className={`interface-icon icon-content small ${!isLearningRatesHidden ? ' reverted' : ''}`} onClick={() => setLearningRatesHidden(!isLearningRatesHidden)}>
                    <img src={"icons/interface/toggle_hidden.png"} />
                </div>
            </div>

            {!isLearningRatesHidden ? (<div className={'learning-block'}>
                <div className={'effects'}>
                    {Object.values(stats?.learnMults || {}).filter(one => hasEffect(one)).map(one => (
                        <StatRow key={`stat_${one.id}`} onHover={highLightAffectedActions} stat={{...one, isMultiplier: true}} />
                    ))}
                </div>
            </div>) : null}
        </div>
        {Object.values(stats?.xpDiscounts || {}).filter(one => hasEffect(one)).length ? (<div className={'block'}>
            <div className={'block-heading flex-container flex-row'}>
                <p>Learn XP Discounts:</p>
                <div className={`interface-icon icon-content small ${!isDiscountsHidden ? ' reverted' : ''}`} onClick={() => setDiscountsHidden(!isDiscountsHidden)}>
                    <img src={"icons/interface/toggle_hidden.png"} />
                </div>
            </div>

            {!isDiscountsHidden ? (<div className={'learning-block'}>
                <div className={'effects'}>
                    {Object.values(stats?.xpDiscounts || {}).filter(one => hasEffect(one)).map(one => (
                        <StatRow key={`disc_${one.id}`} onHover={highLightDiscountedActions} stat={{...one, isMultiplier: true}}/>
                    ))}
                </div>
            </div>) : null}
        </div>) : null}
        {isMobile ? (<div className={'block'}>
            <button onClick={() => setDetailVisible(false)}>Close</button>
        </div>) : null}
    </PerfectScrollbar>)
}