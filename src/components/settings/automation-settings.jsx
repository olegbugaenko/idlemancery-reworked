import React, {useCallback, useContext, useEffect, useState} from "react";
import WorkerContext from "../../context/worker-context";
import {useWorkerClient} from "../../general/client";
import RulesList from "../shared/rules-list.jsx";
import {cloneDeep} from "lodash";
import PerfectScrollbar from "react-perfect-scrollbar";

export const AutomationsSettings = () => {

    const worker = useContext(WorkerContext);

    const { onMessage, sendData } = useWorkerClient(worker);

    const [resources, setResources] = useState(null);

    const [unlocks, setUnlocksData] = useState({});

    useEffect(() => {
        sendData('query-all-resources', {});
        sendData('query-unlocks', {});

    }, [])

    onMessage('all-resources', (payload) => {
        setResources(payload);
    })

    onMessage('unlocks', (unlocks) => {
        setUnlocksData(unlocks);
    })

    if(!unlocks.actionLists && !unlocks.inventory && !unlocks.spellbook) {
        return (<div className={'inner-settings-wrap automations-wrap'}>
            <h4>You haven't unlocked any automations yet :=(</h4>
            <p>Don't worry, you'll unlock them pretty soon</p>
        </div>)
    }

    return (<div className={'inner-settings-wrap automations-wrap'}>
        <PerfectScrollbar>
            {unlocks.actionLists ? (<ActionsAutomations resources={resources}/>) : null}
            {unlocks.inventory ? (<SellAutomations resources={resources}/>) : null}
            {unlocks.inventory ? (<ConsumeAutomations resources={resources} />) : null}
            {unlocks.spellbook ? (<SpellAutomations resources={resources} />) : null}
        </PerfectScrollbar>
    </div> )
}

export const ActionsAutomations = ({ resources }) => {

    const worker = useContext(WorkerContext);
    const { onMessage, sendData } = useWorkerClient(worker);
    const [automations, setAutomations] = useState([]);
    const [isOpened, setOpened] = useState(true);

    useEffect(() => {
        sendData('query-actions-lists', { filterAutomated: true })
    }, []);

    onMessage('actions-lists', (data) => {
        setAutomations(data);
    })

    const onSaveAction = useCallback((id, saveData) => {
        const prev = automations.find(a => a.id === id);
        if(!prev) {
            console.error(`Not found action by id: ${id}`, id, saveData);
            return;
        }
        const toSave = {
            ...prev,
            autotrigger: {
                priority: saveData.priority,
                rules: saveData.rules,
            }
        }
        console.log('Saving data: ', toSave);
        sendData('save-action-list', toSave);
    })

    if(!automations || !automations.length || !resources) return;

    return (<div className={`automations-box ${isOpened ? 'opened' : 'closed'}`}>
        <div className={'automation-panel-title'} onClick={() => setOpened(!isOpened)}>
            <h4>Action Lists Automations</h4>
            <span className={'arrow-down'}>&#8681;</span>
        </div>
        <div className={'automated-list'}>
            {automations.map(auto => (<AutomatedAction auto={auto} resources={resources} onSaveAction={onSaveAction}/>))}
        </div>
    </div> )

}

export const AutomatedAction = ({ auto, resources, onSaveAction }) => {

    const onSave = useCallback((id, data) => {
        onSaveAction(id, data);
    })

    return <AutomatedItem
        id={auto.id}
        name={auto.name}
        rules={auto.autotrigger.rules}
        resources={resources}
        isPriorityShown={true}
        priority={auto.autotrigger.priority}
        onSave={onSave}
    />

}

export const ConsumeAutomations = ({ resources }) => {

    const worker = useContext(WorkerContext);
    const { onMessage, sendData } = useWorkerClient(worker);
    const [automations, setAutomations] = useState([]);
    const [isOpened, setOpened] = useState(false);

    useEffect(() => {
        sendData('query-inventory-data', { filterAutomatedConsume: true, includeAutomations: true, prefix: 'autoconsume' })
    }, []);

    onMessage('inventory-data-autoconsume', (data) => {
        console.log('Received Cons: ', data);
        if(data.payload.filterAutomatedConsume) {
            setAutomations(data.available);
        }
    })

    const onSaveConsume = useCallback((id, saveData) => {
        const prev = automations.find(a => a.id === id);
        const toSave = {
            ...prev,
            autoconsume: {
                rules: saveData.rules,
            }
        }
        console.log('Saving consume: ', toSave);
        sendData('save-inventory-settings', toSave);
    })

    if(!automations || !automations.length || !resources) return;

    return (<div className={`automations-box ${isOpened ? 'opened' : 'closed'}`}>
        <div className={'automation-panel-title'} onClick={() => setOpened(!isOpened)}>
            <h4>Consumption Automations</h4>
            <span className={'arrow-down'}>&#8681;</span>
        </div>
        <div className={'automated-list'}>
            {automations.map(auto => (<AutomatedConsumption auto={auto} resources={resources} onSaveConsume={onSaveConsume}/>))}
        </div>
    </div> )

}

export const AutomatedConsumption = ({ auto, resources, onSaveConsume }) => {

    const onSave = useCallback((id, data) => {
        onSaveConsume(id, data);
    })

    return <AutomatedItem
        id={auto.id}
        name={auto.name}
        rules={auto.autoconsume.rules}
        resources={resources}
        isPriorityShown={false}
        onSave={onSave}
    />

}



export const SellAutomations = ({ resources }) => {

    const worker = useContext(WorkerContext);
    const { onMessage, sendData } = useWorkerClient(worker);
    const [automations, setAutomations] = useState([]);
    const [isOpened, setOpened] = useState(false);

    useEffect(() => {
        sendData('query-inventory-data', { filterAutomatedSell: true, includeAutomations: true, prefix: 'autosell' })
    }, []);

    onMessage('inventory-data-autosell', (data) => {
        console.log('SELL))): ', data);
        if(data.payload.filterAutomatedSell) {
            setAutomations(data.available);
        }
    })

    const onSaveSell = useCallback((id, saveData) => {
        const prev = automations.find(a => a.id === id);
        const toSave = {
            ...prev,
            autosell: {
                rules: saveData.rules,
            }
        }
        console.log('Saving sell: ', toSave);
        sendData('save-inventory-settings', toSave);
    })

    if(!automations || !automations.length || !resources) return;

    return (<div className={`automations-box ${isOpened ? 'opened' : 'closed'}`}>
        <div className={'automation-panel-title'} onClick={() => setOpened(!isOpened)}>
            <h4>Sell Automations</h4>
            <span className={'arrow-down'}>&#8681;</span>
        </div>
        <div className={'automated-list'}>
            {automations.map(auto => (<AutomatedSell auto={auto} resources={resources} onSaveSell={onSaveSell}/>))}
        </div>
    </div> )

}

export const AutomatedSell = ({ auto, resources, onSaveSell }) => {

    const onSave = useCallback((id, data) => {
        onSaveSell(id, data);
    })

    return <AutomatedItem
        id={auto.id}
        name={auto.name}
        rules={auto.autosell.rules}
        resources={resources}
        isPriorityShown={false}
        onSave={onSave}
    />

}


export const SpellAutomations = ({ resources }) => {

    const worker = useContext(WorkerContext);
    const { onMessage, sendData } = useWorkerClient(worker);
    const [automations, setAutomations] = useState([]);
    const [isOpened, setOpened] = useState(false);

    useEffect(() => {
        sendData('query-spell-data', { filterAutomated: true, includeAutomations: true, prefix: 'autocast' })
    }, []);

    onMessage('spell-data-autocast', (data) => {
        console.log('SPELLS: ', data);

        setAutomations(data.available);

    })

    const onSaveSpell = useCallback((id, saveData) => {
        const prev = automations.find(a => a.id === id);
        const toSave = {
            ...prev,
            autocast: {
                rules: saveData.rules,
            }
        }
        console.log('Saving spell: ', toSave);
        sendData('save-spell-settings', toSave);
    })

    if(!automations || !automations.length || !resources) return;

    return (<div className={`automations-box ${isOpened ? 'opened' : 'closed'}`}>
        <div className={'automation-panel-title'} onClick={() => setOpened(!isOpened)}>
            <h4>Spell Automations</h4>
            <span className={'arrow-down'}>&#8681;</span>
        </div>
        <div className={'automated-list'}>
            {automations.map(auto => (<AutomatedSpell auto={auto} resources={resources} onSaveSpell={onSaveSpell}/>))}
        </div>
    </div> )

}

export const AutomatedSpell = ({ auto, resources, onSaveSpell }) => {

    const onSave = useCallback((id, data) => {
        onSaveSpell(id, data);
    })

    return <AutomatedItem
        id={auto.id}
        name={auto.name}
        rules={auto.autocast.rules}
        resources={resources}
        isPriorityShown={false}
        onSave={onSave}
    />

}


export const AutomatedItem = ({
    id,
    name,
    priority,
    isPriorityShown,
    rules,
    resources,
    onSave
}) => {

    const [isChanged, setChanged] = useState(false);
    const [isEditing, setEditing] = useState(false);
    const [editedValues, setEditedValues] = useState({ priority: 0, rules: []});

    useEffect(() => {
        setEditedValues({
            priority,
            rules: rules ?? []
        })
    }, [rules, priority])

    const setPriority = useCallback((priority) => {
        if(isEditing && editedValues) {
            const newValues = cloneDeep(editedValues);
            if(!newValues.rules) {
                newValues.rules = [];
            }
            newValues.priority = priority;
            setEditedValues({...newValues});
            setChanged(true);
        }
    }, [editedValues, isEditing]);


    const addRule = useCallback(() => {

        if(isEditing && editedValues) {
            const newList = cloneDeep(editedValues);
            if(!newList.rules) {
                newList.rules = [];
            }
            newList.rules.push({
                resource_id: resources[0].id,
                condition: 'less_or_eq',
                value_type: 'percentage',
                value: 50,
            });
            setEditedValues({...newList});
            setChanged(true);
        }
    }, [editedValues, isEditing])

    const setRuleValue = useCallback((index, key, value) => {
        if(isEditing && editedValues) {
            const newList = cloneDeep(editedValues);
            if(!newList.rules) {
                newList.rules = [];
            }
            newList.rules[index] ={
                ...newList.rules[index],
                [key]: value
            };
            setEditedValues({...newList});
            setChanged(true);
        }
    }, [editedValues, isEditing])

    const deleteRule = useCallback((index) => {
        if(isEditing && editedValues) {
            const newList = cloneDeep(editedValues);

            if(!newList.rules) {
                newList.rules = [];
            }
            newList.rules.splice(index);
            setEditedValues({...newList});
            setChanged(true);
        }
    }, [editedValues, isEditing])

    const cancelEditing = () => {
        setEditing(false);
        setChanged(false);
        setEditedValues({
            priority,
            rules: rules ?? []
        })
    }

    const saveData = () => {
        onSave(id, editedValues);
        setEditing(false);
        setChanged(false);
    }

    return (<div className={`automated-wrap ${isEditing ? 'editing' : ''}`}>
        <div className={'col title'}>
            {name}
        </div>
        {isPriorityShown ? (<div className={'col priority'}>
            {isEditing ? (<input type={'number'} onChange={e => setPriority(+e.target.value)} value={editedValues.priority}/>) : <span>{editedValues.priority}</span>}
        </div> ) : null}
        <div className={'col rules-wrap'}>
            <p>Rules {isEditing ? (<button onClick={addRule}>Add Rule</button>) : null}</p>
            <RulesList
                prefix={`automation-${id}`}
                rules={editedValues.rules}
                isEditing={isEditing}
                resources={resources}
                setRuleValue={setRuleValue}
                deleteRule={deleteRule}
            />
        </div>
        <div className={'col auto-actions-wrap'}>
            {isEditing ? (<div className={'buttons'}>
                <button disabled={!isChanged} onClick={saveData}>Save</button>
                <button onClick={cancelEditing}>Cancel</button>
            </div> ) : (<div className={'buttons'}>
                <button onClick={() => {setEditing(true)}}>Edit</button>
            </div> )}
        </div>
    </div> )

}