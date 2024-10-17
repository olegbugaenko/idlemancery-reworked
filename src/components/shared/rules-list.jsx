import React from 'react';
import Select from 'react-select';
import { isEqual } from 'lodash';

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
    if(cond === 'grt_or_eq') {
        return '>=';
    }
    if(cond === 'grt') {
        return '>';
    }
    return cond;
}


const RulesList = React.memo(({ rules, isEditing, resources, setRuleValue, deleteRule }) => {

    const resourceOptions = resources.map(r => ({
        value: r.id,
        label: r.name,
    }));

    return (
    <div className="rules">
        {rules.map((rule, index) => (
            <div className="rule row add-row" key={index}>
                <div className="col subject">
                    {isEditing ? (
                        /*<select
                            name="resource_id"
                            onChange={e => setRuleValue(index, 'resource_id', e.target.value)}
                            value={rule.resource_id}
                        >
                            {resources.map(r => (
                                <option key={r.id} value={r.id}>
                                    {r.name}
                                </option>
                            ))}
                        </select>*/
                        <Select
                            name="resource_id"
                            options={resourceOptions}
                            value={resourceOptions.find(option => option.value === rule.resource_id)}
                            onChange={selectedOption => setRuleValue(index, 'resource_id', selectedOption.value)}
                            className="react-select-container"
                            classNamePrefix="react-select"
                            styles={customStyles}
                        />
                    ) : (
                        <span>{resources.find(r => r.id === rule.resource_id)?.name || 'Invalid'}</span>
                    )}
                </div>
                <div className="col condition">
                    {isEditing ? (
                        <select
                            name="condition"
                            onChange={e => setRuleValue(index, 'condition', e.target.value)}
                            value={rule.condition}
                        >
                            <option value="less">Less</option>
                            <option value="less_or_eq">Less or Equal</option>
                            <option value="eq">Equal</option>
                            <option value="grt_or_eq">Greater or Equal</option>
                            <option value="grt">Greater</option>
                        </select>
                    ) : (
                        <span>{mapRuleCond(rule.condition)}</span>
                    )}
                </div>
                <div className="col value_type">
                    {isEditing ? (
                        <select
                            name="value_type"
                            onChange={e => setRuleValue(index, 'value_type', e.target.value)}
                            value={rule.value_type}
                        >
                            <option value="exact">Exact</option>
                            <option value="percentage">Percentage</option>
                        </select>
                    ) : (
                        <span>{rule.value_type}</span>
                    )}
                </div>
                <div className="col value">
                    {isEditing ? (
                        <input
                            type="number"
                            onChange={e => setRuleValue(index, 'value', e.target.value)}
                            value={rule.value}
                            max={rule.value_type === 'percentage' ? 100 : undefined}
                            min="0"
                            step={rule.value_type === 'percentage' ? 5 : 1}
                        />
                    ) : (
                        <span>{rule.value}</span>
                    )}
                </div>
                {isEditing && (
                    <div className="col delete-rule">
            <span className="close" onClick={() => deleteRule(index)}>
              X
            </span>
                    </div>
                )}
            </div>
        ))}
    </div>
)}, (prev, curr) => {
    if(!isEqual(prev.rules, curr.rules)) {
        return false;
    }
    if(prev.isEditing !== curr.isEditing) return false;

    return true;
});

export default RulesList;
