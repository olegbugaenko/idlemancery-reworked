import React, {useState, useEffect, useContext} from 'react';
import Select from 'react-select';
import { isEqual } from 'lodash';
import WorkerContext from "../../context/worker-context";
import {useWorkerClient} from "../../general/client";

const customStyles = {
    control: (provided, state) => ({
        ...provided,
        minHeight: '22px', // Зменшуємо мінімальну висоту
        height: '22px',
        padding: '0', // Видаляємо паддінги
        borderRadius: '1px', // Можливо, зменшимо border-radius
        fontSize: '13px'
    }),
    valueContainer: (provided, state) => ({
        ...provided,
        height: '22px',
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
    }),
    option: (provided, state) => ({
        ...provided,
        padding: '2px 10px', // Зменшуємо відступи опцій
        color: '#000'
    }),
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
        label: 'Resource Balance',
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
    'running_action': {
        label: 'Running Action',
        subject: 'action_id',
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
    },
};

const RulesList = React.memo(
    ({ rules, isEditing, setRuleValue, deleteRule }) => {
        const worker = useContext(WorkerContext);

        const { onMessage, sendData } = useWorkerClient(worker);
        const [resources, setResources] = useState([]);
        const [actions, setActions] = useState([]);
        const [tags, setTags] = useState([]);

        useEffect(() => {
            sendData('query-all-resources', {});
            sendData('query-all-actions', {});
            sendData('query-all-action-tags', {});

        }, [])

        onMessage('all-resources', (payload) => {
            setResources(payload);
        })

        onMessage('all-actions', (payload) => {
            setActions(payload);
        })

        onMessage('all-action-tags', (payload) => {
            setTags(payload);
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
            <div className="rules">
                {rules.map((rule, index) => {
                    const compareTypeOptions = Object.keys(mapCompareType).map((key) => ({
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
                        } else if (subject === 'tag') {
                            subjectArray = tags;
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

                        subjectValue = subjectOptions.find(
                            (option) =>
                                option.value === rule[subjectName] ||
                                option.value === rule[subjectName]?.toString()
                        );

                        if(!subjectValue) {
                            subjectValue = {...subjectOptions[0]};
                            setRuleValue(index, mapCompareType[rule.compare_type].subject, subjectValue.value)
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
                        setRuleValue(index, 'condition', selectedCondition)
                    }

                    const valueTypeOptions =
                        selectedCompareType && selectedCompareType.availableValueTypes
                            ? selectedCompareType.availableValueTypes.map((valType) => ({
                                value: valType,
                                label:
                                    valType.charAt(0).toUpperCase() + valType.slice(1),
                            }))
                            : [];

                    const isHideValue = selectedCompareType
                        ? selectedCompareType.isHideValue
                        : false;

                    return (
                        <div className="rule row add-row" key={index}>
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
                                    />
                                ) : (
                                    <span>
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
                                            onChange={(selectedOption) =>
                                                setRuleValue(
                                                    index,
                                                    subjectName,
                                                    selectedOption.value
                                                )
                                            }
                                            className="react-select-container"
                                            classNamePrefix="react-select"
                                            styles={customStyles}
                                        />
                                    ) : (
                                        <span>{subjectValue?.label || 'Invalid'}</span>
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
                                        <span>{mapRuleCond(rule.condition)}</span>
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
                                        <span>{rule.value_type}</span>
                                    )}
                                </div>
                            )}

                            {/* Інпут для value */}
                            {selectedCompareType && !isHideValue && (
                                <div className="col value">
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            onChange={(e) =>
                                                setRuleValue(index, 'value', e.target.value)
                                            }
                                            value={rule.value}
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

                            {/* Кнопка для видалення правила */}
                            {isEditing && (
                                <div className="col delete-rule">
                  <span className="close" onClick={() => deleteRule(index)}>
                    X
                  </span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    },
    (prev, curr) => {
        if (!isEqual(prev.rules, curr.rules)) {
            return false;
        }
        if (prev.isEditing !== curr.isEditing) return false;

        return true;
    }
);

export default RulesList;
