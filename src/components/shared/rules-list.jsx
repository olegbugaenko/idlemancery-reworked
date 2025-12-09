import React, {useState, useEffect, useContext} from 'react';
import Select from 'react-select';
import { isEqual } from 'lodash';
import WorkerContext from "../../context/worker-context";
import {useWorkerClient} from "../../general/client";
import {TippyWrapper} from "./tippy-wrapper.jsx";

const customStyles = {
    control: (provided, state) => ({
        ...provided,
        minHeight: '24px', // Зменшуємо мінімальну висоту
        height: '24px',
        padding: '0', // Видаляємо паддінги
        borderRadius: '1px', // Можливо, зменшимо border-radius
        fontSize: '13px',
        minWidth: state.selectProps?.isMulti ? '280px' : '200px',
        width: '100%'
    }),
    valueContainer: (provided, state) => ({
        ...provided,
        height: '24px',
        padding: '0 6px', // Зменшуємо горизонтальні відступи
        fontsize: '13px'
    }),
    input: (provided, state) => ({
        ...provided,
        margin: '0',
        padding: '0',
        fontSize: '13px'
    }),
    indicatorsContainer: (provided, state) => ({
        ...provided,
        height: '22px',
    }),
    dropdownIndicator: (provided, state) => ({
        ...provided,
        padding: '0', // Зменшуємо паддінг іконки
    }),
    clearIndicator: (provided, state) => ({
        ...provided,
        padding: '0', // Зменшуємо паддінг іконки очищення
    }),
    menu: (provided, state) => ({
        ...provided,
        marginTop: '0', // Видаляємо відступ між селектом і меню
        width: '240px',
        zIndex: 10103,
    }),
    option: (provided, state) => ({
        ...provided,
        padding: '2px 10px', // Зменшуємо відступи опцій
        color: '#000'
    }),
    multiValue: (provided, state) => ({
        ...provided,
        background: '#112',
        padding: '0px',
        borderRadius: '2px',
        marginTop: '-1px'
    }),
    multiValueLabel: (provided, state) => ({
        ...provided,
        color: '#fff',
    })
};

const mapRuleCond = cond => {
    if(cond === 'less') {
        return '<';
    }
    if(cond === 'less_or_eq') {
        return '<=';
    }
    if(cond === 'eq') {
        return '=';
    }
    if(cond === 'n_eq') {
        return '!=';
    }
    if(cond === 'grt_or_eq') {
        return '>=';
    }
    if(cond === 'grt') {
        return '>';
    }
    if(cond === 'true') {
        return 'True';
    }
    if(cond === 'false') {
        return 'False';
    }
    return cond;
}

const mapCompareType = {
    'resource_amount': {
        label: 'Resource Amount',
        subject: 'resource_id',
        availableConditions: [
            'less',
            'less_or_eq',
            'eq',
            'grt_or_eq',
            'grt',
        ],
        availableValueTypes: [
            'exact',
            'percentage',
        ],
    },
    'resource_balance': {
        label: 'Resource Rate',
        subject: 'resource_id',
        availableConditions: [
            'less',
            'less_or_eq',
            'eq',
            'grt_or_eq',
            'grt',
        ],
        availableValueTypes: [
            'exact',
            'percentage',
        ],
    },
    'attribute_value': {
        label: 'Attribute Value',
        subject: 'attribute_id',
        availableConditions: [
            'less',
            'less_or_eq',
            'eq',
            'grt_or_eq',
            'grt',
        ],
        availableValueTypes: [
            'exact'
        ],
    },
    'running_action': {
        label: 'Running Action',
        subject: 'action_id',
        availableConditions: [
            'true',
            'false',
        ],
        isHideValue: true,
    },
    'running_action_list': {
        label: 'Running List',
        subject: 'action_list_id',
        availableConditions: [
            'true',
            'false',
        ],
        isHideValue: true,
    },
    'running_action_tag': {
        label: 'Running Action With Tag',
        subject: 'tag',
        availableConditions: [
            'true',
            'false',
        ],
        isHideValue: true,
        allowMultiSubject: true,
    },
    'action_level': {
        label: 'Action Level',
        subject: 'action_id',
        availableConditions: [
            'less',
            'less_or_eq',
            'eq',
            'grt_or_eq',
            'grt',
        ],
        availableValueTypes: [
            'exact'
        ],
    },
    'course_level': {
        label: 'Course Level',
        subject: 'course_id',
        availableConditions: [
            'less',
            'less_or_eq',
            'eq',
            'grt_or_eq',
            'grt',
        ],
        availableValueTypes: [
            'exact'
        ],
    },
    'running_course': {
        label: 'Running Course',
        subject: 'course_id',
        availableConditions: [
            'true',
            'false',
        ],
        isHideValue: true,
        unlockCondition: (unlocks) => {
            return unlocks.courses;
        }
    },
    'spell_running': {
        label: 'Spell Running',
        subject: 'spell_id',
        availableConditions: [
            'true',
            'false',
        ],
        isHideValue: true,
        unlockCondition: (unlocks) => {
            return unlocks.spells;
        }
    },
    'ritual_running': {
        label: 'Ritual Running',
        subject: 'ritual_id',
        availableConditions: [
            'true',
            'false',
        ],
        isHideValue: true,
        unlockCondition: (unlocks) => {
            return unlocks.rituals;
        }
    },
    'crafting_list_running': {
        label: 'Crafting List',
        subject: 'crafting_list_id',
        availableConditions: [
            'true',
            'false',
        ],
        isHideValue: true,
        unlockCondition: (unlocks) => {
            return unlocks.crafting;
        }
    },
    'current_social_event': {
        label: 'Current Social Event',
        subject: 'event_id',
        availableConditions: [
            'true',
            'false',
        ],
        isHideValue: true,
        unlockCondition: (unlocks) => {
            return unlocks.social;
        }
    }
};

const RulesList = React.memo(
    ({ prefix = 'default', rules, isEditing, setRuleValue, deleteRule, pattern, setPattern, isAutoCheck }) => {
        const worker = useContext(WorkerContext);

        const { onMessage, sendData } = useWorkerClient(worker);
        const [resources, setResources] = useState([]);
        const [actions, setActions] = useState([]);
        const [attributes, setAttributes] = useState([]);
        const [actionsLists, setActionsLists] = useState([]);
        const [tags, setTags] = useState([]);
        const [spells, setSpells] = useState([]);
        const [rituals, setRituals] = useState([]);
        const [craftingLists, setCraftingLists] = useState([]);
        const [courses, setCourses] = useState([]);
        const [socialEvents, setSocialEvents] = useState([]);
        const [rulesMatched, setRulesMatched] = useState(null);
        const [unlocks, setUnlocks] = useState();

        const [localPattern, setLocalPattern] = useState(pattern || '');
        const [localValues, setLocalValues] = useState({});

        // Sync local pattern with prop when it changes externally
        useEffect(() => {
            setLocalPattern(pattern || '');
        }, [pattern]);

        // Sync local values with rules when they change externally
        useEffect(() => {
            const newLocalValues = {};
            rules.forEach((rule, index) => {
                newLocalValues[index] = rule.value || '';
            });
            setLocalValues(newLocalValues);
        }, [rules]);

        useEffect(() => {
            sendData('query-all-resources', { prefix });
            sendData('query-all-actions', { prefix });
            sendData('query-all-attributes', { prefix });
            sendData('query-all-action-tags', { prefix });
            sendData('query-actions-lists', { prefix });
            sendData('query-all-spells', { prefix });
            sendData('query-all-rituals', { prefix });
            sendData('query-all-crafting-lists', { prefix });
            sendData('query-all-courses', { prefix });
            sendData('query-social-events-automation', { prefix });

            sendData('query-unlocks', { prefix: `automation-${prefix}`})
        }, []);

        useEffect(() => {
            if (isAutoCheck) {
                const interval = setInterval(() => {
                    sendData('check-rule-conditions-matched', { prefix, rules, pattern });
                }, 1000);

                return () => {
                    clearInterval(interval);
                };
            }
        }, [isAutoCheck, rules, pattern, prefix]);

        onMessage(`unlocks-automation-${prefix}`, (payload) => {
            setUnlocks(payload);
        })

        onMessage(`rule-conditions-matched-${prefix}`, (payload) => {
            setRulesMatched(payload);
        })

        onMessage(`all-resources-${prefix}`, (payload) => {
            setResources(payload);
        })

        onMessage(`all-attributes-${prefix}`, (payload) => {
            setAttributes(payload);
        })

        onMessage(`all-actions-${prefix}`, (payload) => {
            setActions(payload);
        })

        onMessage(`actions-lists-${prefix}`, (payload) => {
            setActionsLists(payload);
        })

        onMessage(`all-action-tags-${prefix}`, (payload) => {
            setTags(payload);
        })

        onMessage(`all-spells-${prefix}`, (payload) => {
            setSpells(payload);
        })

        onMessage(`all-rituals-${prefix}`, (payload) => {
            setRituals(payload);
        })

        onMessage(`all-crafting-lists-${prefix}`, (payload) => {
            setCraftingLists(payload);
        })

        onMessage(`all-courses-${prefix}`, (payload) => {
            setCourses(payload);
        })

        onMessage(`social-events-data-automation`, (payload) => {
            setSocialEvents(payload.events || []);
        })

        const checkViolation = (index, compare_type) => {
            const rule = rules[index];
            const sett = mapCompareType[compare_type];
            /*if(!rule[sett.subject]) {
                setRuleValue(index, 'action_id', undefined);
                setRuleValue(index, 'resource_id', undefined);
                setRuleValue(index, 'tag', undefined);
            }*/
            if(sett.availableConditions && !sett.availableConditions.includes(rule.condition)) {
                setRuleValue(index, 'condition', sett.availableConditions[0]);
            }
            if(sett.availableValueTypes && !sett.availableValueTypes.includes(rule.value_type)) {
                setRuleValue(index, 'value_type', sett.availableValueTypes[0]);
            }
        }                    

        return (
            <div className={`rules ${isAutoCheck ? 'autocheck' : ''} ${rulesMatched?.result ? 'matched' : 'unmatched'}`}>
                {rules.map((rule, index) => {
                    if(!rule) return null;
                    const compareTypeOptions = Object.keys(mapCompareType).filter(one => !one.unlockCondition || one.unlockCondition(unlocks)).map((key) => ({
                        value: key,
                        label: mapCompareType[key].label,
                    }));

                    const selectedCompareType = mapCompareType[rule.compare_type];

                    
                    let subjectOptions = [];
                    let subjectValue = null;
                    let subjectName = '';

                    if (selectedCompareType) {
                        const subject = selectedCompareType.subject;
                        subjectName = subject;
                        let subjectArray = [];

                        if (subject === 'resource_id') {
                            subjectArray = resources;
                        } else if (subject === 'action_id') {
                            subjectArray = actions;
                        } else if (subject === 'attribute_id') {
                            subjectArray = attributes;
                        } else if (subject === 'tag') {
                            subjectArray = tags;
                        } else if (subject === 'action_list_id') {
                            subjectArray = actionsLists;
                        } else if (subject === 'spell_id') {
                            subjectArray = spells;
                        } else if (subject === 'ritual_id') {
                            subjectArray = rituals;
                        } else if (subject === 'crafting_list_id') {
                            subjectArray = craftingLists;
                        } else if (subject === 'course_id') {
                            subjectArray = courses;
                        } else if (subject === 'event_id') {
                            subjectArray = socialEvents;
                        }

                        subjectOptions = subjectArray
                            .filter(
                                (item) =>
                                    item.isUnlocked ||
                                    item.id === rule[subjectName] ||
                                    item.id === rule[subjectName]?.toString()
                            )
                            .map((item) => ({
                                value: item.id,
                                label: item.name,
                            }));

                        if(mapCompareType[rule.compare_type].allowMultiSubject) {
                            subjectValue = subjectOptions.filter(
                                (option) =>
                                    (rule[subjectName] || []).includes(option.value)
                            );
                        } else {
                            subjectValue = subjectOptions.find(
                                (option) =>
                                    option.value === rule[subjectName] ||
                                    option.value === rule[subjectName]?.toString()
                            );

                        if(!subjectValue && subjectOptions?.length) {
                            subjectValue = {...subjectOptions[0]};
                            if(subjectValue && isEditing) {
                                setRuleValue(index, mapCompareType[rule.compare_type].subject, subjectValue.value)
                            }
                        }
                        }

                    }

                    const conditionOptions = selectedCompareType
                        ? selectedCompareType.availableConditions.map((cond) => ({
                            value: cond,
                            label: mapRuleCond(cond),
                        }))
                        : [];

                    let selectedCondition = rule.condition;

                    if(!conditionOptions.find(c => c.value === selectedCondition)) {
                        selectedCondition = conditionOptions[0]?.value;
                        if(isEditing) setRuleValue(index, 'condition', selectedCondition)
                    }

                    const valueTypeOptions =
                        selectedCompareType && selectedCompareType.availableValueTypes
                            ? selectedCompareType.availableValueTypes.map((valType) => ({
                                value: valType,
                                label:
                                    valType.charAt(0).toUpperCase() + valType.slice(1),
                            }))
                            : [];

                    if(selectedCompareType && selectedCompareType.availableValueTypes) {
                        if(!selectedCompareType.availableValueTypes.includes(rule.value_type)) {
                            if(isEditing) setRuleValue(index, 'value_type', selectedCompareType.availableValueTypes[0])
                        }
                    }

                    const isHideValue = selectedCompareType
                        ? selectedCompareType.isHideValue
                        : false;

                    return (
                        <div className={`rule-row-wrap ${isEditing ? 'editing' : ''}`}>
                            <div className="col index-rule">
                                  <span className="index-rule-value">
                                    {index + 1}
                                  </span>
                                </div>
                            {isEditing && (
                                <div className="col delete-rule">
                                  <span className="close" onClick={() => deleteRule(index)}>
                                    X
                                  </span>
                                </div>
                            )}
                            <div className={`rule row add-row ${rulesMatched?.ruleResults?.[index] ? 'matched' : 'unmatched'}`} key={index}>
                                {/* Селект для compare_type */}
                                <div className="col compare-type">
                                    {isEditing ? (
                                        <Select
                                            name="compare_type"
                                            options={compareTypeOptions}
                                            value={compareTypeOptions.find(
                                                (option) => option.value === rule.compare_type
                                            )}
                                            onChange={(selectedOption) => {
                                                setRuleValue(index, 'compare_type', selectedOption.value);
                                            }
                                            }
                                            className="react-select-container"
                                            classNamePrefix="react-select"
                                            styles={customStyles}
                                            menuPortalTarget={document.body}
                                            menuPlacement={'auto'}
                                        />
                                    ) : (
                                        <span className={'display-rule-value'}>
                                            {mapCompareType[rule.compare_type]?.label || 'Invalid'}
                                          </span>
                                    )}
                                </div>

                                {/* Селект для subject */}
                                {selectedCompareType && (
                                    <div className="col subject">
                                        {isEditing ? (
                                            <Select
                                                name={subjectName}
                                                options={subjectOptions}
                                                value={subjectValue}
                                                isMulti={mapCompareType[rule.compare_type]?.allowMultiSubject}
                                                                                                 onChange={(selectedOption) => {
                                                     const value = mapCompareType[rule.compare_type]?.allowMultiSubject
                                                         ? selectedOption.map(option => option.value)
                                                         : selectedOption.value;
                                                     console.log('Setting event_id:', value, 'for rule:', rule);
                                                     setRuleValue(
                                                         index,
                                                         subjectName,
                                                         value
                                                     )
                                                 }}
                                                className={`react-select-container ${mapCompareType[rule.compare_type]?.allowMultiSubject ? 'multi' : ''}`}
                                                classNamePrefix="react-select"
                                                styles={customStyles}
                                                menuPortalTarget={document.body}
                                                menuPlacement="auto"
                                            />
                                        ) : (
                                            <span className={'display-rule-value'}>{Array.isArray(subjectValue) ? subjectValue.map(one => `${one?.label}`).join(',') : (subjectValue?.label || 'Invalid')}</span>
                                        )}
                                    </div>
                                )}

                                {/* Селект для condition */}
                                {selectedCompareType && (
                                    <div className="col condition">
                                        {isEditing ? (
                                            <select
                                                name="condition"
                                                onChange={(e) =>
                                                    setRuleValue(index, 'condition', e.target.value)
                                                }
                                                value={selectedCondition}
                                            >
                                                {conditionOptions.map((option) => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <span className={'display-rule-value'}>{mapRuleCond(rule.condition)}</span>
                                        )}
                                    </div>
                                )}

                                {/* Селект для value_type */}
                                {selectedCompareType && !isHideValue && (
                                    <div className="col value_type">
                                        {isEditing ? (
                                            <select
                                                name="value_type"
                                                onChange={(e) =>
                                                    setRuleValue(index, 'value_type', e.target.value)
                                                }
                                                value={rule.value_type}
                                            >
                                                {valueTypeOptions.map((option) => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <span className={'display-rule-value'}>{rule.value_type}</span>
                                        )}
                                    </div>
                                )}

                                {/* Інпут для value */}
                                {selectedCompareType && !isHideValue && (
                                    <div className="col value">
                                        {isEditing ? (
                                            <input
                                                type="number"
                                                onChange={(e) => {
                                                    const newValue = e.target.value;
                                                    setLocalValues(prev => ({
                                                        ...prev,
                                                        [index]: newValue
                                                    }));
                                                    setRuleValue(index, 'value', newValue);
                                                }}
                                                value={localValues[index] || ''}
                                                max={
                                                    rule.value_type === 'percentage' ? 100 : undefined
                                                }
                                                min="0"
                                                step={rule.value_type === 'percentage' ? 5 : 1}
                                            />
                                        ) : (
                                            <span>{rule.value}</span>
                                        )}
                                    </div>
                                )}

                            </div>
                        </div>
                    );
                })}
                <TippyWrapper content={<div className={'hint-popup'}>
                    <p>You can set more complex matching conditions, like (1 AND 2) OR 3, where numbers are numbers of your rules</p>
                </div> }>
                    <div className={'pattern-wrap flex-container'}>
                        <span className={'pattern-label'}>Rules Condition: </span>
                        {isEditing ? (<input
                            value={localPattern}
                            placeholder={Array.from({ length: rules.length }).map((a, i) => i+1).join(' AND ')}
                            onChange={(e) => {
                                const newValue = e.target.value?.toUpperCase();
                                setLocalPattern(newValue);
                                setPattern(newValue);
                            }}
                        />) : (<span>
                        {pattern || Array.from({ length: rules.length }).map((a, i) => i+1).join(' AND ')}
                    </span>)}
                    </div>
                </TippyWrapper>

            </div>
        );
    },
    (prev, curr) => {
        if (!isEqual(prev.rules, curr.rules)) {
            return false;
        }
        if(prev.pattern !== curr.pattern) {
            return false;
        }
        if (prev.isEditing !== curr.isEditing) return false;

        if(prev.isAutoCheck !== curr.isAutoCheck) return false;

        return true;
    }
);

export default RulesList;
