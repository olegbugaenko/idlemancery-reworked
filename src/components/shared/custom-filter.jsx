import React, {useState, useEffect, useContext} from 'react';
import Select from 'react-select';
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

const CustomFilter = React.memo(({
  category,
  prefix,
  id,
  name,
  rules: initialRules = [],
  condition: initialCondition = '',
  onSave,
  onCancel
}) => {
    const worker = useContext(WorkerContext);

    const { onMessage, sendData } = useWorkerClient(worker);
    const [rules, setRules] = useState(initialRules);
    const [condition, setCondition] = useState(initialCondition);

    // Lists loaded from server
    const [tags, setTags] = useState([]);
    const [attributesLists, setAttributesLists] = useState([]);
    const [resources, setResources] = useState([]);
    const [filterName, setFilterName] = useState(name);

    // Load data on mount (and when prefix changes)
    useEffect(() => {
        sendData('query-all-resources', { prefix });

        if(category === 'action') {
            sendData('query-all-action-tags', { prefix });
            sendData('query-all-attributes', { prefix });
        }
        if(category === 'furniture') {
            sendData('query-all-furniture-tags', { prefix });
            //query-all-property-effects
            sendData('query-all-property-effects', { prefix, filterId: category });
        }
        if(category === 'accessory') {
            sendData('query-all-accessory-tags', { prefix });
            sendData('query-all-property-effects', { prefix, filterId: category });
        }
    }, [prefix]);

    // Subscribe to incoming data
    useEffect(() => {
        onMessage(`all-resources-${prefix}`, (payload) => {
            setResources(payload);
        });

        onMessage(`all-attributes-${prefix}`, (payload) => {
            setAttributesLists(payload);
        });

        onMessage(`all-property-effects-${prefix}`, (payload) => {
            setAttributesLists(payload);
        });

        onMessage(`all-action-tags-${prefix}`, (payload) => {
            setTags(payload);
        });

        onMessage(`all-furniture-tags-${prefix}`, (payload) => {
            setTags(payload);
        });

        onMessage(`all-accessory-tags-${prefix}`, (payload) => {
            setTags(payload);
        });
    }, [prefix]);

    // Add a new, empty rule
    const addRule = () => {
        setRules((prev) => [...prev, { type: '', object: '' }]);
    };

    // Update an existing rule
    const updateRule = (index, newRule) => {
        setRules((prev) =>
            prev.map((rule, i) => (i === index ? newRule : rule))
        );
    };

    // Remove a rule
    const removeRule = (index) => {
        setRules((prev) => prev.filter((_, i) => i !== index));
    };

    const updateName = (name) => {
        setFilterName(name);
    }

    // Handle save
    const handleSave = () => {
        onSave({ id, name: filterName, rules, condition });
    };

    // Handle cancel
    const handleCancel = () => {
        onCancel();
    };

    // Prepare options for the rule type
    const ruleTypeOptions = [
        { value: 'tag', label: 'Has tag' },
        { value: 'attribute', label: category === 'action' ? 'Gives attribute' : 'Gives Effect' },
        { value: 'resource', label: 'Gives resource' },
    ];

    // Prepare react-select options for tags, attributes, resources
    const tagOptions = Array.isArray(tags)
        ? tags.filter(tag => tag.isUnlocked).map((tag) => ({ value: tag.name, label: tag.id }))
        : [];

    const attributeOptions = Array.isArray(attributesLists)
        ? attributesLists.filter(attr => attr.isUnlocked).map((attr) => ({ value: attr.id, label: attr.name }))
        : [];

    const resourceOptions = Array.isArray(resources)
        ? resources.filter(res => res.isUnlocked).map((res) => ({ value: res.id, label: res.name }))
        : [];

    return (
        <div className={'custom-filter-box'}>
            <h4>Custom Filter (category: {category})</h4>
            <div className={'block name-wrap'}>
                <label>
                    Filter Name
                    <input type={'text'} value={filterName} onChange={(e) => setFilterName(e.target.value)}/>
                </label>
            </div>
            {/* List of rules */}
            <div>
                <h4>Rules:</h4>
                {rules.map((rule, index) => {
                    // Current type option
                    const selectedType = ruleTypeOptions.find((opt) => opt.value === rule.type) || null;

                    // Depending on rule.type, choose which set of options to use
                    let objectOptions = [];
                    if (rule.type === 'tag') {
                        objectOptions = tagOptions;
                    } else if (rule.type === 'attribute') {
                        objectOptions = attributeOptions;
                    } else if (rule.type === 'resource') {
                        objectOptions = resourceOptions;
                    }

                    // Current object option
                    const selectedObject = objectOptions.find((opt) => opt.value === rule.object) || null;

                    return (
                        <div
                            key={index}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                marginBottom: '8px'
                            }}
                            className={'flex-container filter-row'}
                        >
                            {/* Rule type select (react-select) */}
                            <div style={{ width: '120px', marginRight: '8px' }}>
                                <Select
                                    value={selectedType}
                                    styles={customStyles}
                                    onChange={(selected) =>
                                        updateRule(index, {
                                            ...rule,
                                            type: selected.value,
                                            object: '' // reset object if type changes
                                        })
                                    }
                                    options={ruleTypeOptions}
                                    placeholder="Select rule type"
                                />
                            </div>

                            {/* Object select (react-select), depends on the type */}
                            {rule.type !== '' && (
                                <div style={{ width: '150px', marginRight: '8px' }}>
                                    <Select
                                        value={selectedObject}
                                        styles={customStyles}
                                        onChange={(selected) =>
                                            updateRule(index, { ...rule, object: selected.value })
                                        }
                                        options={objectOptions}
                                        placeholder="Select object"
                                    />
                                </div>
                            )}

                            <button onClick={() => removeRule(index)}>Remove</button>
                        </div>
                    );
                })}

                <button onClick={addRule}>Add Rule</button>
            </div>

            {/* Condition string area */}
            <div style={{ marginTop: '16px' }}>
                <label>Condition:</label>
                <textarea
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    rows={2}
                    style={{ width: '100%', marginTop: '8px' }}
                />
            </div>

            {/* Save / Cancel buttons */}
            <div style={{ marginTop: '16px' }}>
                <button onClick={handleSave} style={{ marginRight: '8px' }}>
                    Save
                </button>
                <button onClick={handleCancel}>Cancel</button>
            </div>
        </div>
    );
}, ((prevProps, props) => {

    if(prevProps.category !== props.category) return false;
    if(prevProps.id !== props.id) return false;

    return true;
}));

export default CustomFilter;
