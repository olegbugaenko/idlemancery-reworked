import React, {useContext, useEffect, useState} from "react";
import WorkerContext from "../../context/worker-context";
import {useWorkerClient} from "../../general/client";
import PerfectScrollbar from "react-perfect-scrollbar";
import {HowToSign} from "../shared/how-to-sign.jsx";
import {TippyWrapper} from "../shared/tippy-wrapper.jsx";
import {formatInt, formatValue, secondsToString} from "../../general/utils/strings";
import {Draggable, Droppable} from "react-beautiful-dnd";
import {ResourceComparison} from "../shared/resource-comparison.jsx";
import {EffectsSection} from "../shared/effects-section.jsx";
import RulesList from "../shared/rules-list.jsx";
import StatRow from "../shared/stat-row.jsx";
import {useTutorial} from "../../context/tutorial-context";
import {ProgressBar} from "../layout/progress-bar.jsx";
import {useAppContext} from "../../context/ui-context";


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
        // console.log('received-details: ', actions, actionId);
        setDetailOpened(actions);
    })

    if(!actionId || !action) return null;

    return (
        <ActionDetailsComponent {...action} onClose={onClose} isSelected={isSelected} />
    )
}

export const ActionDetailsComponent = React.memo(({onClose, isSelected, ...action}) => {

    const { stepIndex, unlockNextById } = useTutorial();

    useEffect(() => {

        if(action.id === 'action_walk') {
            // console.log('COMRF: ', stepIndex);
            requestAnimationFrame(() => {
                unlockNextById(5);
            });
        }
    }, [action.id]);
    // console.log('re-render');
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
                <div className={'tags-container'}>
                    {action.tags.map(tag => (<div className={'tag'}>{tag}</div> ))}
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
            {action.rankData ? (<div className={'block'}>
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
        //console.log('One of prp null or undefined. Re-render: ', prevProps, currentProps);
        return false;
    }
    if(prevProps.level !== currentProps.level) {
        //console.log('Level mismatch. Re-render: ', prevProps, currentProps);
        return false;
    }
    if(prevProps.xp !== currentProps.xp) {
        //console.log('XP mismatch. Re-render: ', prevProps, currentProps);
        return false;
    }
    if(prevProps.id !== currentProps.id) {
        //console.log('id mismatch. Re-render: ', prevProps, currentProps);
        return false;
    }
    if(prevProps.timeInvested !== currentProps.timeInvested) {
        //console.log('id mismatch. Re-render: ', prevProps, currentProps);
        return false;
    }

    if(currentProps.potentialEffects.length) {
        for(let i = 0; i < currentProps.potentialEffects.length; i++) {
            if(!prevProps.potentialEffects[i]) {
                //console.log('potEff mismatch length. Re-render: ', prevProps, currentProps);
                return false;
            }

            if(prevProps.potentialEffects[i].value !== currentProps.potentialEffects[i].value) {
                // console.log('One of prp of potEff mismatched: '+i+'. Re-render: ', prevProps, currentProps);
                return false;
            }
        }
    }

    return true;
})


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
                                          automationUnlocked
                                      }) => {

    const worker = useContext(WorkerContext);

    const { onMessage, sendData } = useWorkerClient(worker);

    const [editing, setEditing] = useState({ actions: [] })

    useEffect(() => {
        setEditing(listData);
    }, [listData])

    const saveAndClose = (isClose) => {
        // console.log('Saving: ', editing);
        if(!isClose) {
            editing.isReopenEdit = true;
        }
        sendData('save-action-list', editing);
        if(isClose) {
            onCloseList();
        }
    }

    const addAutotriggerRule = () => {
        onAddAutotriggerRule()
    }

    const setAutotriggerRuleValue = (index, key, value) => {
        onSetAutotriggerRuleValue(index, key, value)
    }

    const deleteAutotriggerRule = index => {
        onDeleteAutotriggerRule(index);
    }

    const setAutotriggerPattern = (pattern) => {
        onSetAutotriggerPattern(pattern)
    }

    const toggleAutotrigger = () => {
        onToggleAutotrigger()
    }

    if(!editing) return ;

    return (<PerfectScrollbar><div className={'list-editor'}>
        <div className={'main-wrap'}>
            <div className={'main-row'}>
                <span>Name</span>
                {isEditing ? (<input type={'text'} value={editing.name ?? ''} onChange={(e) => onUpdateListValue('name', e.target.value)}/>) : (<span>{editing.name}</span>)}
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
        <Droppable droppableId="action-list-editor">
            {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="actions-list-wrap">
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
                    {editing.actions.length ? editing.actions.map((action, index) => (
                        <Draggable key={`list-${action.id}-${index}`} draggableId={`list-${action.id}-${index}`} index={index}>
                            {(provided) => (
                                <div className={`action-row flex-container ${!action.isAvailable ? 'unavailable' : ''}`}
                                     ref={provided.innerRef}
                                     {...provided.draggableProps}
                                     {...provided.dragHandleProps}
                                >
                                    {editing.proportionsBar ? (<div style={{width: editing.proportionsBar?.[index]?.displayPercentage, backgroundColor: editing.proportionsBar[index]?.color}} className={'prop-bg'}></div> ) : null}
                                    <div className={'col title'}>
                                        <span>{action.name}</span>
                                    </div>
                                    <div className={`col amount ${isEditing ? 'large' : ''}`}>
                                        {isEditing
                                            ? (<div className={'editing-amounts'}>
                                                    <input type={'number'} value={action.time}
                                                           onChange={(e) => onUpdateActionFromList(action.id, 'time', +e.target.value)}/>
                                                    <span>{formatValue(editing.proportionsBar?.[index]?.percentage*100 || 0)} %</span>
                                                </div>
                                            )
                                            : (<span>{formatValue(editing.proportionsBar[index].percentage*100)} %</span>)
                                        }
                                    </div>
                                    <div className={'col delete'}>
                                        {isEditing ? (<span className={'close'} onClick={() => onDropActionFromList(action.id)}>X</span>) : null}
                                    </div>
                                </div>
                            )}
                        </Draggable>
                    )) : <p className={'hint'}>Click on actions or drag & drop them to add</p>}
                    {provided.placeholder}
                </div>
            )}
        </Droppable>
        <div className={'effects-wrap'}>
            {Object.keys(editing?.resourcesEffects || {}).length ? (<div className={'block'}>
                <p>Average Resources per second</p>
                <ResourceComparison effects1={editing?.prevEffects} effects2={editing?.resourcesEffects} maxDisplay={10}/></div>) : null}
            {editing?.effectEffects?.length ? (<div className={'block'}>
                <p>Average Effects per second</p>
                <EffectsSection effects={editing?.effectEffects || []} maxDisplay={10}/></div>) : null}
        </div>
        {automationUnlocked ? (<div className={'autotrigger-settings autoconsume-setting block'}>
            <div className={'rules-header flex-container'}>
                <p>Autotrigger rules: {editing?.autotrigger?.rules?.length ? null : 'None'}</p>
                <label>
                    <input type={'checkbox'} checked={editing.autotrigger?.isEnabled} onChange={toggleAutotrigger}/>
                    {editing.autotrigger?.isEnabled ? ' ON' : ' OFF'}
                </label>
                {isEditing ? (<button onClick={addAutotriggerRule}>Add rule (AND)</button>) : null}
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
        {isEditing ? (<div className={'buttons'}>
            <button onClick={() => saveAndClose(false)}>{listData?.id ? 'Save' : 'Create'}</button>
            <button onClick={() => saveAndClose(true)}>{listData?.id ? 'Save & Close' : 'Create & Close'}</button>
            <button onClick={onCloseList}>Cancel</button>
        </div>) : null}
    </div></PerfectScrollbar> )
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


    return (<PerfectScrollbar>
        {aspects.isUnlocked ? (<div className={'block'}>
            <p>Actions Intensity</p>
            <p className={'hint'}>
                Intensity boosts work speed but increases resource use. Max intensity depends on the attribute. "Keep Max" uses the highest available level. Lower intensity saves resources.
            </p>
            {aspects.list.map(one => (<div className={'aspect-wrap'}>
                <div className={'flex-container aspect-row'}>
                    <span className={'col title'}>{one.name}</span>
                    <div className={'col amount'}>
                        <input type={'number'} value={one.level} onChange={e => setAspectLevel(one.id, +e.target.value)}/>
                        <span> of {one.maxLevel}</span>
                        <label>
                            <input type={'checkbox'} checked={one.keepMaxed} onChange={e => toggleMaxed(one.id, !one.keepMaxed)}/>
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
        </div> ) : null}
        <div className={'block'}>
            <p>Learn Speed Multipliers:</p>
            <div className={'effects'}>
                {Object.values(stats?.learnMults || {}).filter(one => hasEffect(one)).map(one => (
                    <StatRow onHover={highLightAffectedActions} stat={{...one, isMultiplier: true}} />
                ))}
            </div>
        </div>
        {Object.values(stats?.xpDiscounts || {}).filter(one => hasEffect(one)).length ? (<div className={'block'}>
            <p>Learn XP Discounts:</p>
            <div className={'effects'}>
                {Object.values(stats?.xpDiscounts || {}).filter(one => hasEffect(one)).map(one => (
                    <StatRow onHover={highLightAffectedActions} stat={{...one, isMultiplier: true}}/>
                ))}
            </div>
        </div>) : null}
        {isMobile ? (<div className={'block'}>
            <button onClick={() => setDetailVisible(false)}>Close</button>
        </div>) : null}
    </PerfectScrollbar>)
}