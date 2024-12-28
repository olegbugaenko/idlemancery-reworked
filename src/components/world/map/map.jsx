import React, {useCallback, useContext, useEffect, useMemo, useRef, useState} from "react";
import WorkerContext from "../../../context/worker-context";
import {useWorkerClient} from "../../../general/client";
import PerfectScrollbar from "react-perfect-scrollbar";
import {formatInt, formatValue} from "../../../general/utils/strings";
import {BreakDown} from "../../layout/sidebar.jsx";
import {TippyWrapper} from "../../shared/tippy-wrapper.jsx";
import Select from "react-select";

const customStyles = {
    control: (provided, state) => ({
        ...provided,
        minHeight: '30px', // Зменшуємо мінімальну висоту
        height: '30px',
        padding: '0', // Видаляємо паддінги
        borderRadius: '2px', // Можливо, зменшимо border-radius
        fontSize: '13px',
        width: '300px',
        background: 'rgba(0,0,0,0.3)'
    }),
    valueContainer: (provided, state) => ({
        ...provided,
        height: '30px',
        padding: '0 6px', // Зменшуємо горизонтальні відступи
        fontsize: '13px'
    }),
    multiValue: (base) => ({
        ...base,
        backgroundColor: "#222", // Customize background color
        borderRadius: "2px", // Rounded corners
        padding: "1px 4px", // Add some padding
        fontSize: "13px", // Customize font size
    }),
    multiValueLabel: (base) => ({
        ...base,
        color: "#fff", // Customize text color
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

export const Map = ({ setItemDetails, openListDetails }) => {

    const worker = useContext(WorkerContext);

    const { onMessage, sendData } = useWorkerClient(worker);
    const [mapData, setMapTiles] = useState({
        mapTiles: [],
        explorationPoints: {
            balance: 0,
            consumption: 0,
            breakDown: {}
        },
        mapLists: {
            runningList: null,
            lists: [],
            automationEnabled: false,
            autotriggerIntervalSetting: 0
        },
        filterableLoot: []
    });

    useEffect(() => {
        const interval = setInterval(() => {
            sendData('query-map-data');
        }, 2000);
        return () => {
            clearInterval(interval);
        }
    }, [])

    onMessage('map-data', (mapData) => {
        setMapTiles(mapData);
        // console.log('mapData: ', mapData);
    })

    const setItemDetailsCb = meta => {
        setItemDetails({ meta, type: 'map-tile' });
    };

    const onEditList = useCallback(listData => {
        console.log('onEditList: ', { listData, isEdit: true })
        openListDetails({ listData, isEdit: true });
    }, []);

    const onViewList = useCallback(listData => {
        openListDetails({ listData });
    }, []);

    const setHighlighted = useCallback(data => {
        sendData('map-highlight-resources', {ids: data.map(one => one.value)})
    })

    return (<div className={'map-wrap'}>
        <div className={'head'}>
            <TippyWrapper content={<div className={'hint-popup'}><BreakDown breakDown={mapData.explorationPoints.breakDown} /></div> }>
                <div className={'space-item'}>
                    <span>Exploration Efforts:</span>
                    <span>{formatValue(mapData.explorationPoints.balance)}/{formatValue(mapData.explorationPoints.balance + mapData.explorationPoints.consumption)}</span>
                </div>
            </TippyWrapper>
            {mapData.filterableLoot?.length ? (<div className={'resources-filter'}>
                <span>Search resources</span>
                <Select
                    isMulti={true}
                    options={mapData.filterableLoot.map(one => ({
                        value: one.id,
                        label: one.name
                    }))}
                    defaultValue={mapData.filterableLoot.filter(one => one.isSelected).map(one => ({
                        value: one.id,
                        label: one.name
                    }))}
                    onChange={setHighlighted}
                    styles={customStyles}
                >

                </Select>
            </div> ) : null}
        </div>
        <div className={'map-cat'}>
            <PerfectScrollbar>
                <div className={'map-container'}>
                    {mapData.mapTiles.map((row, i) => {
                        return (<div className={'map-row'}>
                            {row.map((tile, j) => {
                                return <MapTile i={i} j={j} icon={tile.metaData.icon} setItemDetails={setItemDetailsCb} isExploring={tile.isRunning} isHighlight={tile.isHighlight}/>
                            })}
                        </div> )
                    })}
                </div>
            </PerfectScrollbar>
        </div>
        <div className={'map-lists-wrap'}>
            <MapListsPanel
                runningList={mapData.mapLists.runningList}
                lists={mapData.mapLists.lists}
                automationEnabled={mapData.mapLists.automationEnabled}
                autotriggerIntervalSetting={mapData.mapLists.autotriggerIntervalSetting}
                editListToDetails={(id) => {
                    console.log('editListToDetails: ', id);
                    onEditList({ id });
                }}
                viewListToDetails={(id) => {
                    onViewList({ id });
                }}
            />
        </div>
    </div> )
}

export const MapTile = React.memo(({ icon, i, j, setItemDetails, isExploring, isHighlight }) => {
    return (<div className={`map-tile ${isExploring ? 'running' : ''} ${isHighlight ? 'highlight' : ''}`} style={{ backgroundImage: `url(icons/terrain/${icon}.png)`}} onClick={() => setItemDetails({i, j})}></div> )
})

export const ActionListsPopup = ({ lists, isOpened, setOpenedFor, onSelect, onHover, onRun, onDelete }) => {

    if(!isOpened) return null;

    const [search, setSearch] = useState('')

    const listsDisplayed = useMemo(() => {
        if(!search) return lists;
        return lists.filter(l => l.name.includes(search));
    }, [lists, search])

    return (<div className={'list-selector'}>
        <div className={'list-selector-inner'}>
            <div clallName={'search-wrap'}>
                <input
                    type={'text'}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                />
            </div>
            <div className={'lists-wrap'}>
                <PerfectScrollbar>
                    <div className={'list-inner'}>
                        {listsDisplayed.map(list => (<div className={'item'} onMouseEnter={() => onHover(list.id)} onMouseLeave={() => onHover(null)}>
                            <div className={'list-item-row flex-container'}>
                                <span className={'list-name'}>{list.name}</span>
                                <TippyWrapper content={<div className={'hint-popup'}>Run List</div> }>
                                    <div className={'icon-content run-icon interface-icon small'} onClick={() => onRun(list.id)}>
                                        <img src={"icons/interface/run.png"}/>
                                    </div>
                                </TippyWrapper>
                                <TippyWrapper content={<div className={'hint-popup'}>Edit List</div> }>
                                    <div className={'icon-content edit-icon interface-icon small'} onClick={() => onSelect(list.id)}>
                                        <img src={"icons/interface/edit-icon.png"}/>
                                    </div>
                                </TippyWrapper>
                                <TippyWrapper content={<div className={'hint-popup'}>Delete List</div> }>
                                    <div className={'icon-content edit-icon interface-icon small'} onClick={() => onDelete(list.id)}>
                                        <img src={"icons/interface/delete.png"}/>
                                    </div>
                                </TippyWrapper>
                            </div>

                        </div> ))}
                    </div>
                </PerfectScrollbar>
            </div>
        </div>
    </div> )
}

export const MapListsPanel = ({ runningList, editListToDetails, lists, viewListToDetails, automationEnabled, autotriggerIntervalSetting }) => {

    const worker = useContext(WorkerContext);

    const { onMessage, sendData } = useWorkerClient(worker);

    const [openedFor, setOpenedFor] = useState(null);

    const toggleAutomation = useCallback(() => {
        sendData('set-map-automation-enabled', { flag: !automationEnabled })
    })

    const changeAutomationInterval = useCallback((interval) => {
        sendData('set-map-autotrigger-interval', { interval })
    })


    useEffect(() => {
        const setOp = () => {
            console.log('setOpToNull ')
            setOpenedFor(null);
        }
        if(openedFor) {
            document.addEventListener('click', setOp);
        } else {
            document.removeEventListener('click', setOp)
        }

        return () => {
            document.removeEventListener('click', setOp)
        }
    }, [openedFor])

    const editList = (id) => {
        console.log('Set to edit: ', id);
        editListToDetails(id);
    }

    const runList = (id) => {
        if(!id) {
            sendData('stop-map-tile-list', { id });
            return;
        }
        sendData('run-map-tile-list', { id });
    }

    const onDelete = (id) => {
        sendData('delete-map-tile-list', { id });
        setOpenedFor('edit');
    }

    return (<div className={'action-lists-panel'}>
        <div className={'flex-container'}>
            <div className={'current-list panel-col'}>
                Current list: {runningList ? (<div className={'flex-container'}>
                <span>{runningList.name}</span>
                <div className={'icon-content stop-icon interface-icon'} onClick={() => runList(null)}>
                    <img src={"icons/interface/pause.png"}/>
                </div>
                <div className={'icon-content edit-icon interface-icon'} onClick={() => editList(runningList.id)}>
                    <img src={"icons/interface/edit-icon.png"}/>
                </div>
            </div>) : 'None'}
            </div>
            <div className={'lists-editor panel-col'}>
                <button onClick={() => editListToDetails()}>Create New</button>
            </div>
            <div className={'lists-editor panel-col'}>
                <button onClick={(e) => { e.stopPropagation(); setOpenedFor('edit')}}>Pick list</button>
                <ActionListsPopup lists={lists} isOpened={openedFor === 'edit'} setOpenedFor={setOpenedFor} onSelect={editList} onRun={runList} onHover={viewListToDetails} onDelete={onDelete}/>
            </div>
            <div className={'automation-enabled panel-col'}>
                <label>
                    <input type={'checkbox'} checked={automationEnabled} onChange={toggleAutomation}/>
                    Lists automation enabled
                </label>
            </div>
            <div className={'panel-col automation-interval'}>
                <label>
                    Switch lists interval:
                    <select onChange={e => changeAutomationInterval(+e.target.value)}>
                        <option value={10} selected={autotriggerIntervalSetting === 10}>10 seconds</option>
                        <option value={30} selected={autotriggerIntervalSetting === 30}>30 seconds</option>
                        <option value={60} selected={autotriggerIntervalSetting === 60}>1 minute</option>
                        <option value={300} selected={autotriggerIntervalSetting === 300}>5 minutes</option>
                        <option value={900} selected={autotriggerIntervalSetting === 900}>15 minutes</option>
                        <option value={1800} selected={autotriggerIntervalSetting === 1800}>30 minutes</option>
                        <option value={3600} selected={autotriggerIntervalSetting === 3600}>1 hour</option>
                    </select>
                </label>
            </div>
        </div>
    </div>)
}